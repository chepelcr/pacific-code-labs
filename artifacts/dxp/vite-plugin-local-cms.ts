import type { Plugin } from "vite";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Dev-only middleware that lets the local admin dashboard write its edits
 * straight back into the repo's source files, so changes are ready to commit:
 *
 *   POST /__local/content  { filename: "products.json", data: {...} }
 *     → writes src/content/<file>  (or src/translations/<file> for es/en.json)
 *   POST /__local/asset    { filename: "logo.png", dataUrl: "data:image/...;base64,..." }
 *     → writes public/<file>
 *
 * `apply: "serve"` keeps it out of production builds entirely.
 */
const JSON_NAME = /^[a-zA-Z0-9_-]+\.json$/;
const ASSET_NAME = /^[a-zA-Z0-9_-]+\.(png|jpe?g|webp|svg|ico)$/i;

function readBody(req: import("node:http").IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

export function localCms(): Plugin {
  return {
    name: "pcl-local-cms",
    apply: "serve",
    configureServer(server) {
      const root = server.config.root;
      const contentDir = path.resolve(root, "src/content");
      const translationsDir = path.resolve(root, "src/translations");
      const publicDir = path.resolve(root, "public");

      const safe = (dir: string, name: string) => {
        const target = path.join(dir, name);
        if (target !== path.join(dir, path.basename(name))) throw new Error("invalid path");
        return target;
      };

      server.middlewares.use(async (req, res, next) => {
        if (req.method !== "POST" || !req.url || !req.url.startsWith("/__local/")) return next();

        const reply = (code: number, payload: unknown) => {
          res.statusCode = code;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(payload));
        };

        // Write-back is local-authoring only: refuse non-local hosts.
        const host = (req.headers.host ?? "").toLowerCase();
        const isLocal =
          host.startsWith("localhost") || host.startsWith("127.0.0.1") || host.endsWith(".local");
        if (!isLocal) return reply(403, { ok: false, error: "forbidden" });

        try {
          const body = JSON.parse(await readBody(req));

          if (req.url.startsWith("/__local/content")) {
            const { filename, data } = body;
            if (typeof filename !== "string" || !JSON_NAME.test(filename)) throw new Error("bad filename");
            const dir = filename === "es.json" || filename === "en.json" ? translationsDir : contentDir;
            const target = safe(dir, filename);
            await fs.writeFile(target, JSON.stringify(data, null, 2) + "\n", "utf8");
            const rel = path.relative(root, target);
            server.config.logger.info(`[local-cms] wrote ${rel}`);
            return reply(200, { ok: true, path: rel });
          }

          if (req.url.startsWith("/__local/asset")) {
            const { filename, dataUrl } = body;
            if (typeof filename !== "string" || !ASSET_NAME.test(filename)) throw new Error("bad filename");
            const match = /^data:[^;]+;base64,(.+)$/s.exec(dataUrl ?? "");
            if (!match) throw new Error("bad dataUrl");
            const target = safe(publicDir, filename);
            await fs.writeFile(target, Buffer.from(match[1], "base64"));
            const rel = path.relative(root, target);
            server.config.logger.info(`[local-cms] wrote asset ${rel}`);
            return reply(200, { ok: true, path: rel });
          }

          return reply(404, { ok: false, error: "unknown endpoint" });
        } catch (err) {
          return reply(400, { ok: false, error: String(err) });
        }
      });
    },
  };
}
