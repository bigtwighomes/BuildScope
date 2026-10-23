import { analyzeUploads, readSyntheticSampleFiles } from "@/lib/documents/intake";
import { SAMPLE_CHANGES, SAMPLE_LOCATION } from "@/lib/documents/sample";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST() {
  try {
    const files = await readSyntheticSampleFiles();
    const { analysis } = await analyzeUploads(files, {
      projectType: "new_home",
      origin: "sample",
      changes: SAMPLE_CHANGES,
      location: SAMPLE_LOCATION,
    });
    return Response.json(analysis, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Synthetic sample analysis failed", error);
    return Response.json(
      { error: "The synthetic example could not be loaded." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
