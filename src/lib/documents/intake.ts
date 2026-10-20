import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { buildAnalysis } from "./analysis";
import { PdfExtractionError, extractPdfPages, looksLikePdf } from "./pdf";
import { parseDocument } from "./parse";
import {
  type AnalysisLimits,
  type DocumentRejection,
  type ExtractedDocument,
  type ProjectType,
} from "./types";

export const ANALYSIS_LIMITS: AnalysisLimits = {
  maxDocuments: 3,
  maxFileBytes: 4 * 1024 * 1024,
  maxRequestBytes: 8 * 1024 * 1024,
  maxPages: 40,
  maxTextCharacters: 500_000,
  extractionTimeoutMs: 20_000,
};

export interface UploadedFile {
  readonly fileName: string;
  readonly bytes: Uint8Array;
}

export interface AnalyzeUploadsOptions {
  readonly projectType: ProjectType;
  readonly limits?: AnalysisLimits;
}

export class IntakeError extends Error {
  readonly code: "TOO_MANY_DOCUMENTS" | "REQUEST_TOO_LARGE";

  constructor(code: IntakeError["code"], message: string) {
    super(message);
    this.name = "IntakeError";
    this.code = code;
  }
}

export function sanitizeFileName(input: string): string {
  const base = input.split(/[\\/]/).pop() ?? "document.pdf";
  const cleaned = base
    .replace(/[^\w.\- ()]/g, "_")
    .trim()
    .slice(0, 120);
  return cleaned.length > 0 ? cleaned : "document.pdf";
}

function hashBytes(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export async function analyzeUploads(
  files: readonly UploadedFile[],
  options: AnalyzeUploadsOptions,
): Promise<{ analysis: ReturnType<typeof buildAnalysis>; rejections: DocumentRejection[] }> {
  const limits = options.limits ?? ANALYSIS_LIMITS;
  if (files.length > limits.maxDocuments) {
    throw new IntakeError(
      "TOO_MANY_DOCUMENTS",
      `Upload no more than ${limits.maxDocuments} documents at a time.`,
    );
  }

  const rejections: DocumentRejection[] = [];
  const accepted: ExtractedDocument[] = [];
  const hashes: string[] = [];
  const seenHashes = new Set<string>();

  for (const file of files) {
    const sizeBytes = file.bytes.byteLength;
    if (sizeBytes === 0) {
      rejections.push({
        fileName: file.fileName,
        code: "EMPTY_FILE",
        message: "The file is empty.",
        sizeBytes,
      });
      continue;
    }
    if (sizeBytes > limits.maxFileBytes) {
      rejections.push({
        fileName: file.fileName,
        code: "FILE_TOO_LARGE",
        message: `Each PDF must be ${Math.floor(limits.maxFileBytes / (1024 * 1024))} MB or smaller.`,
        sizeBytes,
      });
      continue;
    }
    if (!looksLikePdf(file.bytes)) {
      rejections.push({
        fileName: file.fileName,
        code: "NOT_PDF",
        message: "This file does not begin with a PDF header.",
        sizeBytes,
      });
      continue;
    }
    const hash = hashBytes(file.bytes);
    if (seenHashes.has(hash)) {
      rejections.push({
        fileName: file.fileName,
        code: "DUPLICATE",
        message: "This file is identical to another document in the same upload.",
        sizeBytes,
      });
      continue;
    }
    seenHashes.add(hash);

    let pages;
    try {
      const extracted = await extractPdfPages(file.bytes, {
        maxPages: limits.maxPages,
        maxTextCharacters: limits.maxTextCharacters,
        timeoutMs: limits.extractionTimeoutMs,
      });
      pages = extracted.pages;
      if (extracted.textLength === 0 || pages.every((page) => page.text.trim().length === 0)) {
        rejections.push({
          fileName: file.fileName,
          code: "NO_TEXT",
          message: "No extractable text was found. Scanned or image-only PDFs are not supported.",
          sizeBytes,
        });
        continue;
      }
    } catch (error) {
      if (error instanceof PdfExtractionError) {
        rejections.push({
          fileName: file.fileName,
          code: error.code,
          message: error.message,
          sizeBytes,
        });
      } else {
        rejections.push({
          fileName: file.fileName,
          code: "EXTRACTION_FAILED",
          message: "The PDF could not be read.",
          sizeBytes,
        });
      }
      continue;
    }

    accepted.push(
      parseDocument(pages, {
        documentId: `doc-${accepted.length + 1}`,
        fileName: file.fileName,
        fallbackProjectType: options.projectType,
      }),
    );
    hashes.push(hash);
  }

  const analysis = buildAnalysis(accepted, {
    projectType: options.projectType,
    rejections,
    analysisId:
      hashes.length === 0
        ? "SYN-EMPTY"
        : `SYN-${createHash("sha256")
            .update(`${options.projectType}:${hashes.join(":")}`)
            .digest("hex")
            .slice(0, 10)
            .toUpperCase()}`,
  });

  return { analysis, rejections };
}

export const SYNTHETIC_SAMPLE_FILES = [
  "northline-builders-proposal.pdf",
  "cascade-timber-materials-package.pdf",
  "sagebrush-construction-cost-plus.pdf",
] as const;

export async function readSyntheticSampleFiles(): Promise<UploadedFile[]> {
  const directory = path.join(process.cwd(), "tests", "fixtures", "synthetic");
  return Promise.all(
    SYNTHETIC_SAMPLE_FILES.map(async (fileName) => ({
      fileName,
      bytes: new Uint8Array(await readFile(path.join(directory, fileName))),
    })),
  );
}
