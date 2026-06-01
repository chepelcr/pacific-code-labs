import settingsData from "../content/settings.json";

export type Settings = typeof settingsData;

export function getSettings(): Settings {
  return settingsData;
}
