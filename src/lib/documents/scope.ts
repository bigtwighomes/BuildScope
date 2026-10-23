import type { ProjectType, ScopeCategory } from "./types";

const FULL_BUILD_SCOPE: readonly ScopeCategory[] = [
  "survey_engineering",
  "permits",
  "demolition",
  "sitework",
  "retaining_drainage",
  "foundation",
  "structure",
  "roofing",
  "exterior",
  "windows",
  "plumbing",
  "electrical",
  "hvac",
  "insulation",
  "drywall",
  "finishes",
  "appliances",
  "utilities",
  "inspections",
  "freight",
  "waste",
  "landscaping",
];

const BATHROOM_SCOPE: readonly ScopeCategory[] = [
  "permits",
  "demolition",
  "plumbing",
  "electrical",
  "ventilation",
  "insulation",
  "drywall",
  "waterproofing",
  "tile",
  "vanity",
  "finishes",
  "appliances",
  "inspections",
  "waste",
];

export const PROJECT_SCOPE_CATEGORIES: Record<ProjectType, readonly ScopeCategory[]> = {
  new_home: FULL_BUILD_SCOPE,
  materials_package: FULL_BUILD_SCOPE,
  bathroom_renovation: BATHROOM_SCOPE,
};

export const PROJECT_SCOPE_NOTES: Record<ProjectType, readonly string[]> = {
  new_home: [
    "Whole-home comparisons include sitework, structure, utilities and exterior scope.",
    "A material package, a labor-only quote and a complete installed proposal are not equivalent totals.",
  ],
  materials_package: [
    "Confirm whether freight, unloading, crane, installation and warranty are inside the package price.",
    "Materials-only totals are not directly comparable with installed construction totals.",
  ],
  bathroom_renovation: [
    "Confirm demolition, waterproofing, plumbing moves, ventilation, tile and finish allowances.",
    "Existing concealed conditions can change cost even when the visible scope looks complete.",
  ],
};

export function scopeCategoriesForProject(projectType: ProjectType): readonly ScopeCategory[] {
  return PROJECT_SCOPE_CATEGORIES[projectType];
}
