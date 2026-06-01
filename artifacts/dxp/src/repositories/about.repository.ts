import aboutData from "../content/about.json";

export type About = typeof aboutData;

export function getAbout(): About {
  return aboutData;
}
