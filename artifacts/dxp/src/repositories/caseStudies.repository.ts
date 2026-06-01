import caseStudiesData from "../content/caseStudies.json";

export type CaseStudy = (typeof caseStudiesData)[number];

export function getCaseStudies(): CaseStudy[] {
  return caseStudiesData;
}
