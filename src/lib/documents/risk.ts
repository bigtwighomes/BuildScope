import type { ProjectType, RiskObservation } from "./types";

const RETRIEVED_AT = null;

function topic(
  id: string,
  topicName: string,
  observation: string,
  sourceName: string,
  sourceUrl: string,
  customerAction: string,
  projectTypes: readonly ProjectType[],
  projectType: ProjectType,
): RiskObservation | null {
  if (!projectTypes.includes(projectType)) return null;
  return {
    id,
    topic: topicName,
    observation,
    status: "not_evaluated",
    sourceName,
    sourceUrl,
    versionOrDate: "Current public source; check the page for its effective date",
    retrievedAt: RETRIEVED_AT,
    resolution:
      "No screening query has been run. Treat this as a question to verify, not a finding.",
    limitations:
      "BuildScope has not checked a parcel, address, jurisdiction, licence or registration. Availability, map boundaries and local requirements must be confirmed directly with the source.",
    customerAction,
  };
}

export function buildRiskObservations(
  projectType: ProjectType,
  location: string,
): readonly RiskObservation[] {
  const locationNote = location.trim()
    ? `The customer supplied the location "${location.trim()}", but it has not been geocoded or verified.`
    : "No project location has been verified.";

  return [
    topic(
      "flood",
      "Flood and drainage exposure",
      `${locationNote} Flood zone, base flood elevation, drainage and insurability are unknown.`,
      "FEMA Flood Map Service Center",
      "https://msc.fema.gov/portal/home",
      "Ask the local building department and a qualified insurance professional to confirm flood and drainage requirements for the parcel.",
      ["new_home", "materials_package", "bathroom_renovation"],
      projectType,
    ),
    topic(
      "permits",
      "Permits, inspections and code requirements",
      `${locationNote} The responsible authority, required permits and inspection sequence are unknown.`,
      "USA.gov state and local government directory",
      "https://www.usa.gov/local-governments",
      "Confirm permit obligations and inspection requirements with the authority having jurisdiction.",
      ["new_home", "materials_package", "bathroom_renovation"],
      projectType,
    ),
    topic(
      "radon",
      "Radon",
      `${locationNote} Radon zone, prior test results and mitigation requirements are unknown.`,
      "U.S. Environmental Protection Agency - Radon",
      "https://www.epa.gov/radon",
      "Check state and local guidance and obtain a radon test where appropriate.",
      ["new_home"],
      projectType,
    ),
    topic(
      "contractor",
      "Contractor licence, insurance and complaints",
      `${locationNote} Licence status, insurance, complaints and registration history have not been checked.`,
      "USA.gov state consumer protection directory",
      "https://www.usa.gov/state-consumer",
      "Verify the contractor through the state licensing board and request current insurance certificates.",
      ["new_home", "materials_package", "bathroom_renovation"],
      projectType,
    ),
    topic(
      "moisture",
      "Concealed moisture and existing conditions",
      `${locationNote} Existing moisture, framing, plumbing and waterproofing conditions have not been inspected.`,
      "BuildScope project record",
      "",
      "Have a qualified contractor document existing conditions before demolition and price concealed-condition procedures.",
      ["bathroom_renovation"],
      projectType,
    ),
    topic(
      "ventilation",
      "Bathroom ventilation and indoor air quality",
      `${locationNote} Exhaust capacity, duct route, make-up air and code requirements are unknown.`,
      "U.S. Environmental Protection Agency - Indoor Air Quality",
      "https://www.epa.gov/indoor-air-quality-iaq",
      "Confirm the ventilation design and local exhaust requirements with a qualified designer.",
      ["bathroom_renovation"],
      projectType,
    ),
  ].filter((observation): observation is RiskObservation => observation !== null);
}
