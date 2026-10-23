import { redirect } from "next/navigation";

export default function DemoPage() {
  redirect("/analyze?sample=1");
}
