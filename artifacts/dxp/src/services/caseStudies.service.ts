import { getCaseStudies, type CaseStudy } from "../repositories/caseStudies.repository";

export function listActiveCaseStudies(): CaseStudy[] {
  return getCaseStudies()
    .filter((c) => c.status === "active")
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
