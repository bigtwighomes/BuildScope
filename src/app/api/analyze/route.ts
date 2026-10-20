import {
  ANALYSIS_LIMITS,
  IntakeError,
  analyzeUploads,
  sanitizeFileName,
} from "@/lib/documents/intake";
import { PROJECT_TYPES, type ProjectType } from "@/lib/documents/types";

export const runtime = "nodejs";
export const maxDuration = 30;

function errorResponse(message: string, status: number): Response {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    return errorResponse("Send the documents as multipart form data.", 415);
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > ANALYSIS_LIMITS.maxRequestBytes) {
    return errorResponse(
      `The upload is too large. The request limit is ${Math.floor(
        ANALYSIS_LIMITS.maxRequestBytes / (1024 * 1024),
      )} MB.`,
      413,
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return errorResponse("The upload could not be read as form data.", 400);
  }

  const projectValue = form.get("projectType");
  const projectType: ProjectType =
    typeof projectValue === "string" && (PROJECT_TYPES as readonly string[]).includes(projectValue)
      ? (projectValue as ProjectType)
      : "new_home";

  const entries = [...form.getAll("files"), ...form.getAll("file")];
  const files = entries.filter((entry): entry is File => entry instanceof File);
  if (files.length === 0) {
    return errorResponse("Attach at least one PDF.", 400);
  }
  if (files.length > ANALYSIS_LIMITS.maxDocuments) {
    return errorResponse(`Attach no more than ${ANALYSIS_LIMITS.maxDocuments} PDFs.`, 400);
  }

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes > ANALYSIS_LIMITS.maxRequestBytes) {
    return errorResponse(
      `The upload is too large. The request limit is ${Math.floor(
        ANALYSIS_LIMITS.maxRequestBytes / (1024 * 1024),
      )} MB.`,
      413,
    );
  }

  try {
    const uploads = await Promise.all(
      files.map(async (file) => ({
        fileName: sanitizeFileName(file.name),
        bytes: new Uint8Array(await file.arrayBuffer()),
      })),
    );
    const { analysis } = await analyzeUploads(uploads, { projectType });
    return Response.json(analysis, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof IntakeError) {
      return errorResponse(error.message, error.code === "REQUEST_TOO_LARGE" ? 413 : 400);
    }
    console.error("Analyze upload failed", error);
    return errorResponse("The documents could not be analyzed.", 500);
  }
}
