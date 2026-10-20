import type { Metadata } from "next";
import { DemoWorkspace } from "@/components/demo/Dashboard";
import { demoProject } from "@/lib/demo/project";

export const metadata: Metadata = {
  title: "Synthetic demo · BuildScope Check",
  description:
    "Interactive synthetic walkthrough of evidence-linked construction proposal comparison.",
};

export default function DemoPage() {
  return <DemoWorkspace project={demoProject} />;
}
