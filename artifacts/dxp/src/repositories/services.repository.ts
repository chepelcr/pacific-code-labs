import servicesData from "../content/services.json";

export type Service = (typeof servicesData)[number];

export function getServices(): Service[] {
  return servicesData;
}
