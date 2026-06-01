/**
 * Serverless contact-form delivery. The site ships to GitHub Pages with no
 * backend, so the contact form can't POST to our own API. Instead it submits to
 * a configurable third-party form endpoint (chosen in admin → Settings, stored
 * in content/settings.json). Submissions are still mirrored to localStorage as a
 * local log, but delivery to the owner happens through the provider.
 *
 * Providers (no backend, free tiers):
 *  - formsubmit : POST https://formsubmit.co/ajax/<your-email>  (endpoint = email)
 *  - web3forms  : POST https://api.web3forms.com/submit         (accessKey = key)
 *  - formspree  : POST https://formspree.io/f/<id>              (endpoint = form id or full URL)
 *  - custom     : POST to endpoint verbatim with the JSON payload
 *  - none       : no network send (localStorage only) — the default
 */

export type ContactProvider = "none" | "formsubmit" | "web3forms" | "formspree" | "custom";

export interface ContactConfig {
  provider: string;
  endpoint: string;
  accessKey: string;
}

export interface ContactPayload {
  name: string;
  email: string;
  company?: string;
  subject?: string;
  message: string;
}

/** Whether the current config can actually deliver a message off-device. */
export function contactDeliveryEnabled(config?: ContactConfig): boolean {
  if (!config) return false;
  switch (config.provider as ContactProvider) {
    case "web3forms":
      return !!config.accessKey.trim();
    case "formsubmit":
    case "formspree":
    case "custom":
      return !!config.endpoint.trim();
    default:
      return false;
  }
}

function resolve(config: ContactConfig, payload: ContactPayload): { url: string; body: unknown } | null {
  const provider = config.provider as ContactProvider;
  const ep = config.endpoint.trim();
  switch (provider) {
    case "formsubmit":
      // endpoint is the destination email; the /ajax path returns JSON.
      return { url: `https://formsubmit.co/ajax/${encodeURIComponent(ep)}`, body: payload };
    case "web3forms":
      return { url: "https://api.web3forms.com/submit", body: { access_key: config.accessKey.trim(), ...payload } };
    case "formspree":
      return { url: ep.startsWith("http") ? ep : `https://formspree.io/f/${ep}`, body: payload };
    case "custom":
      return { url: ep, body: payload };
    default:
      return null;
  }
}

/**
 * Deliver a contact submission through the configured provider. Returns true on
 * success, false if not configured or the request failed (caller decides UX).
 */
export async function submitContact(payload: ContactPayload, config?: ContactConfig): Promise<boolean> {
  if (!config || !contactDeliveryEnabled(config)) return false;
  const resolved = resolve(config, payload);
  if (!resolved) return false;
  try {
    const res = await fetch(resolved.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(resolved.body),
    });
    return res.ok;
  } catch {
    return false;
  }
}
