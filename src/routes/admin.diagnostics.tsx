import { createFileRoute } from "@tanstack/react-router";
import { Diagnostics } from "@/pages/Diagnostics";

export const Route = createFileRoute("/admin/diagnostics")({
  head: () => ({
    meta: [
      { title: "Diagnostics · Afriframe Studio CMS" },
      { name: "description", content: "Admin-only email and Web Push diagnostics." },
    ],
  }),
  component: Diagnostics,
});
