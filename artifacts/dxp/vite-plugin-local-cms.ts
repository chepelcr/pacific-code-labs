import type { Plugin } from "vite";
import { promises as fs } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * Dev-only middleware that lets the local admin dashboard write its edits
 * straight back into the repo's source files, so changes are ready to commit:
 *
 *   POST /__local/content  { filename: "products.json", data: {...} }
 *     → writes src/content/<file>  (or src/translations/<file> for es/en.json)
 *   POST /__local/asset    { filename: "logo.png", dataUrl: "data:image/...;base64,..." }
 *     → writes public/<file>
 *   POST /__local/publish  {}
 *     → git add (content/translations/public) + commit + push (current branch)
 *   GET  /__local/git-log?skip=0&limit=10
 *     → recent commits on the current branch (for the admin Diagnostics card)
 *
 * `apply: "serve"` keeps it out of production builds entirely.
 */
const JSON_NAME = /^[a-zA-Z0-9_-]+\.json$/;
const ASSET_NAME = /^[a-zA-Z0-9_-]+\.(png|jpe?g|webp|svg|ico)$/i;

/** Run a git command from `cwd`; returns trimmed stdout. */
async function git(args: string[], cwd: string): Promise<string> {
  const { stdout } = await execFileAsync("git", args, { cwd, maxBuffer: 10 * 1024 * 1024 });
  return stdout.trim();
}

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

      // The three dirs the admin "Publish" button stages, relative to the repo
      // (cwd for git is `root`, i.e. artifacts/dxp — git discovers the repo).
      const PUBLISH_PATHS = ["src/content", "src/translations", "public"];

      server.middlewares.use(async (req, res, next) => {
        const method = req.method ?? "";
        if (!req.url || !req.url.startsWith("/__local/") || (method !== "POST" && method !== "GET"))
          return next();

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
          // --- Read-only: recent commits on the current branch (Diagnostics card). ---
          if (method === "GET" && req.url.startsWith("/__local/git-log")) {
            const q = new URL(req.url, "http://localhost").searchParams;
            const skip = Math.max(0, Number(q.get("skip")) || 0);
            const limit = Math.min(100, Math.max(1, Number(q.get("limit")) || 10));
            const branch = await git(["rev-parse", "--abbrev-ref", "HEAD"], root);
            const total = Number(await git(["rev-list", "--count", "HEAD"], root)) || 0;
            // Unit/record separators keep subjects with spaces/newlines intact.
            const raw = await git(
              ["log", `--skip=${skip}`, `-n`, String(limit), "--pretty=format:%H%x1f%s%x1f%an%x1f%cI%x1e"],
              root,
            );
            const commits = raw
              .split("\x1e")
              .map((s) => s.replace(/^\n/, ""))
              .filter(Boolean)
              .map((line) => {
                const [hash, subject, author, date] = line.split("\x1f");
                return { hash, shortHash: hash.slice(0, 7), subject, author, date };
              });
            return reply(200, { ok: true, branch, total, skip, limit, commits });
          }

          // --- Read-only: are there uncommitted changes in the publish dirs? ---
          if (method === "GET" && req.url.startsWith("/__local/git-status")) {
            const out = await git(["status", "--porcelain", "--", ...PUBLISH_PATHS], root);
            const files = out ? out.split("\n").filter(Boolean).length : 0;
            return reply(200, { ok: true, pending: files > 0, files });
          }

          if (method !== "POST") return reply(404, { ok: false, error: "unknown endpoint" });

          // --- One-click publish: stage content, commit, push current branch. ---
          if (req.url.startsWith("/__local/publish")) {
            await git(["add", "-A", "--", ...PUBLISH_PATHS], root);
            // `git diff --cached --quiet` exits 0 when nothing is staged.
            let hasStaged = false;
            try {
              await git(["diff", "--cached", "--quiet"], root);
            } catch {
              hasStaged = true;
            }
            if (!hasStaged) return reply(200, { ok: true, nothingToPublish: true });

            const message = `content: update via admin (${new Date().toISOString()})`;
            await git(["commit", "-m", message], root);
            const hash = await git(["rev-parse", "--short", "HEAD"], root);
            const branch = await git(["rev-parse", "--abbrev-ref", "HEAD"], root);
            await git(["push"], root);
            server.config.logger.info(`[local-cms] published ${hash} → ${branch}`);
            return reply(200, { ok: true, hash, branch, message });
          }

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
          // git failures (e.g. push rejected, no upstream) carry the useful text on stderr.
          const e = err as { stderr?: string; message?: string };
          const error = (e?.stderr?.trim() || e?.message || String(err)).trim();
          return reply(400, { ok: false, error });
        }
      });
    },
  };
}
