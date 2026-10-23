import type { Metadata } from "next";
import { AnalyzeWorkspace } from "@/components/analyze/AnalyzeWorkspace";
import { analyzeUploads, readSyntheticSampleFiles } from "@/lib/documents/intake";
import { SAMPLE_CHANGES, SAMPLE_LOCATION } from "@/lib/documents/sample";
import type { Analysis } from "@/lib/documents/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Compare proposals - BuildScope Check",
  description:
    "A five-step, evidence-linked review of construction proposals with deterministic PDF extraction.",
};

export default async function AnalyzePage({
  searchParams,
}: {
  searchParams: Promise<{ sample?: string }>;
}) {
  const params = await searchParams;
  const wantsSample = params.sample === "1" || params.sample === "true";
  let initialAnalysis: Analysis | null = null;

  if (wantsSample) {
    try {
      const files = await readSyntheticSampleFiles();
      const { analysis } = await analyzeUploads(files, {
        projectType: "new_home",
        origin: "sample",
        changes: SAMPLE_CHANGES,
        location: SAMPLE_LOCATION,
      });
      initialAnalysis = analysis;
    } catch (error) {
      console.error("Initial synthetic sample analysis failed", error);
    }
  }

  return <AnalyzeWorkspace initialAnalysis={initialAnalysis} />;
}
