import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { POST as analyzeRoute } from "@/app/api/analyze/route";
import { POST as sampleRoute } from "@/app/api/analyze/sample/route";
import type { Analysis } from "@/lib/documents/types";

const fixtureDirectory = path.join(process.cwd(), "tests", "fixtures", "synthetic");

async function fixtureBytes(name: string): Promise<Uint8Array> {
  return new Uint8Array(await readFile(path.join(fixtureDirectory, name)));
}

async function uploadRequest(
  files: readonly { name: string; bytes: Uint8Array }[],
  options: { projectType?: string; contentLength?: string } = {},
): Promise<Response> {
  const form = new FormData();
  form.set("projectType", options.projectType ?? "new_home");
  for (const file of files) {
    form.append(
      "files",
      new File([file.bytes.buffer as ArrayBuffer], file.name, { type: "application/pdf" }),
    );
  }
  const headers: Record<string, string> = {};
  if (options.contentLength) headers["content-length"] = options.contentLength;
  return analyzeRoute(
    new Request("http://localhost/api/analyze", { method: "POST", body: form, headers }),
  );
}

describe("POST /api/analyze/sample", () => {
  it("returns the three synthetic documents with no-store headers", async () => {
    const response = await sampleRoute();
    const analysis = (await response.json()) as Analysis;

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(analysis.documents).toHaveLength(3);
    expect(analysis.metrics.findings).toBe(21);
    expect(analysis.synthetic).toBe(true);
  });
});

describe("POST /api/analyze", () => {
  it("accepts a synthetic PDF and returns a no-store analysis", async () => {
    const response = await uploadRequest([
      {
        name: "C:\\Users\\owner\\..\\northline.pdf",
        bytes: await fixtureBytes("northline-builders-proposal.pdf"),
      },
    ]);
    const analysis = (await response.json()) as Analysis;

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(analysis.documents).toHaveLength(1);
    expect(analysis.documents[0]?.fileName).toBe("northline.pdf");
    expect(analysis.documents[0]?.statedTotalCents.value).toBe(48_654_000);
  });

  it("defaults an unknown project type to new_home", async () => {
    const response = await uploadRequest(
      [{ name: "northline.pdf", bytes: await fixtureBytes("northline-builders-proposal.pdf") }],
      { projectType: "unsupported" },
    );
    const analysis = (await response.json()) as Analysis;
    expect(analysis.projectType).toBe("new_home");
  });

  it("returns 415 for non-multipart requests", async () => {
    const response = await analyzeRoute(
      new Request("http://localhost/api/analyze", {
        method: "POST",
        body: JSON.stringify({ files: [] }),
        headers: { "content-type": "application/json" },
      }),
    );
    expect(response.status).toBe(415);
    expect(await response.json()).toEqual({ error: "Send the documents as multipart form data." });
  });

  it("returns 400 when no files are attached", async () => {
    const response = await uploadRequest([]);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Attach at least one PDF." });
  });

  it("returns 400 when more than three PDFs are attached", async () => {
    const bytes = await fixtureBytes("northline-builders-proposal.pdf");
    const response = await uploadRequest([
      { name: "one.pdf", bytes },
      { name: "two.pdf", bytes: await fixtureBytes("cascade-timber-materials-package.pdf") },
      { name: "three.pdf", bytes: await fixtureBytes("sagebrush-construction-cost-plus.pdf") },
      { name: "four.pdf", bytes: await fixtureBytes("partial-proposal.pdf") },
    ]);
    expect(response.status).toBe(400);
    expect((await response.json()) as { error: string }).toMatchObject({
      error: "Attach no more than 3 PDFs.",
    });
  });

  it("returns 413 when the declared request size exceeds the limit", async () => {
    const response = await uploadRequest(
      [{ name: "northline.pdf", bytes: await fixtureBytes("northline-builders-proposal.pdf") }],
      { contentLength: String(9 * 1024 * 1024) },
    );
    expect(response.status).toBe(413);
    expect((await response.json()) as { error: string }).toMatchObject({
      error: expect.stringContaining("upload is too large"),
    });
  });

  it("returns a named rejection for an image-only PDF", async () => {
    const response = await uploadRequest([
      { name: "scan.pdf", bytes: await fixtureBytes("no-text-proposal.pdf") },
    ]);
    const analysis = (await response.json()) as Analysis;
    expect(response.status).toBe(200);
    expect(analysis.documents).toHaveLength(0);
    expect(analysis.rejections[0]?.code).toBe("NO_TEXT");
  });
});
