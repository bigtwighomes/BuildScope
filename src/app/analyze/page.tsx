import type { Metadata } from "next";
import { AnalyzeWorkspace } from "@/components/analyze/AnalyzeWorkspace";
import { analyzeUploads, readSyntheticSampleFiles } from "@/lib/documents/intake";
import type { Analysis } from "@/lib/documents/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Document analysis - BuildScope Check",
  description:
    "Deterministic extraction and evidence-linked comparison of synthetic text-based construction PDFs.",
};

export default async function AnalyzePage() {
  let initialAnalysis: Analysis | null = null;
  try {
    const files = await readSyntheticSampleFiles();
    const { analysis } = await analyzeUploads(files, { projectType: "new_home" });
    initialAnalysis = analysis;
  } catch (error) {
    console.error("Initial synthetic analysis failed", error);
  }

  return <AnalyzeWorkspace initialAnalysis={initialAnalysis} />;
}
