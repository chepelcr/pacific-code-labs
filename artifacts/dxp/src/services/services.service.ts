import { getServices, type Service } from "../repositories/services.repository";

export function listActiveServices(): Service[] {
  return getServices()
    .filter((s) => s.status === "active")
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function listAllServices(): Service[] {
  return getServices().sort((a, b) => a.sortOrder - b.sortOrder);
}
