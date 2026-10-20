import { analyzeUploads, readSyntheticSampleFiles } from "@/lib/documents/intake";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST() {
  try {
    const files = await readSyntheticSampleFiles();
    const { analysis } = await analyzeUploads(files, { projectType: "new_home" });
    return Response.json(analysis, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Synthetic sample analysis failed", error);
    return Response.json(
      { error: "The synthetic sample could not be loaded." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
