import brandingData from "../content/branding.json";

/** Site identity: logo / dark logo / favicon, company name and bilingual tagline. */
export type Branding = typeof brandingData;

export function getBranding(): Branding {
  return brandingData;
}
