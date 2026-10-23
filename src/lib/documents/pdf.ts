import { extractText, getDocumentProxy } from "unpdf";
import type { PageText } from "./parse";
import type { RejectionCode } from "./types";

export class PdfExtractionError extends Error {
  readonly code: RejectionCode;

  constructor(code: RejectionCode, message: string) {
    super(message);
    this.name = "PdfExtractionError";
    this.code = code;
  }
}

export interface PdfExtractionOptions {
  readonly maxPages: number;
  readonly maxTextCharacters: number;
  readonly timeoutMs: number;
}

export interface PdfExtractionResult {
  readonly pageCount: number;
  readonly pages: PageText[];
  readonly textLength: number;
}

export function looksLikePdf(bytes: Uint8Array): boolean {
  const header = new TextDecoder("latin1").decode(bytes.slice(0, 1024));
  return header.includes("%PDF-");
}

function classifyPdfError(error: unknown): PdfExtractionError {
  if (error instanceof PdfExtractionError) return error;
  const name = error instanceof Error ? error.name : "";
  const message = error instanceof Error ? error.message : "The PDF could not be read.";
  if (/password/i.test(name) || /password/i.test(message)) {
    return new PdfExtractionError(
      "ENCRYPTED",
      "This PDF is password protected. Upload an unlocked copy.",
    );
  }
  if (/InvalidPDF|FormatError/i.test(name)) {
    return new PdfExtractionError("INVALID_PDF", "This file is not a readable PDF.");
  }
  return new PdfExtractionError("EXTRACTION_FAILED", "The PDF could not be read.");
}

async function destroyDocument(
  document: Awaited<ReturnType<typeof getDocumentProxy>>,
): Promise<void> {
  const candidate = document as unknown as {
    loadingTask?: { destroy?: () => Promise<void> };
    destroy?: () => Promise<void>;
  };
  try {
    if (candidate.loadingTask?.destroy) {
      await candidate.loadingTask.destroy();
    } else if (candidate.destroy) {
      await candidate.destroy();
    }
  } catch {
    // The document may already be closed.
  }
}

export async function extractPdfPages(
  bytes: Uint8Array,
  options: PdfExtractionOptions,
): Promise<PdfExtractionResult> {
  if (!looksLikePdf(bytes)) {
    throw new PdfExtractionError("NOT_PDF", "This file does not begin with a PDF header.");
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  let document: Awaited<ReturnType<typeof getDocumentProxy>> | undefined;
  let timedOut = false;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      timedOut = true;
      if (document) void destroyDocument(document);
      reject(new PdfExtractionError("EXTRACTION_TIMEOUT", "PDF extraction timed out."));
    }, options.timeoutMs);
  });

  const work = (async () => {
    try {
      try {
        // PDF.js may transfer the underlying buffer to its worker. Copy it so the
        // caller can safely reuse the validated upload bytes.
        document = await getDocumentProxy(new Uint8Array(bytes));
        if (timedOut) {
          throw new PdfExtractionError("EXTRACTION_TIMEOUT", "PDF extraction timed out.");
        }
      } catch (error) {
        throw classifyPdfError(error);
      }

      if (document.numPages === 0) {
        throw new PdfExtractionError("INVALID_PDF", "The PDF has no pages.");
      }
      if (document.numPages > options.maxPages) {
        throw new PdfExtractionError(
          "TOO_MANY_PAGES",
          `This PDF has ${document.numPages} pages. The limit is ${options.maxPages}.`,
        );
      }

      try {
        const result = await extractText(document, { mergePages: false });
        const textLength = result.text.reduce((sum, text) => sum + text.length, 0);
        if (textLength > options.maxTextCharacters) {
          throw new PdfExtractionError(
            "TEXT_TOO_LARGE",
            "This PDF contains more text than the analysis limit allows.",
          );
        }
        return {
          pageCount: result.totalPages,
          pages: result.text.map((text, index) => ({ page: index + 1, text })),
          textLength,
        };
      } catch (error) {
        throw classifyPdfError(error);
      }
    } finally {
      if (document) await destroyDocument(document);
    }
  })();

  try {
    return await Promise.race([work, timeout]);
  } catch (error) {
    throw classifyPdfError(error);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
