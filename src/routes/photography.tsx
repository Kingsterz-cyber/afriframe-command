import { createFileRoute } from "@tanstack/react-router";
import { Photography } from "@/pages/Photography";

export const Route = createFileRoute("/photography")({
  head: () => ({
    meta: [
      { title: "Photography · Afriframe Studio CMS" },
      { name: "description", content: "Manage your photo shoots and galleries in the Afriframe Studio creative operating system." },
      { property: "og:title", content: "Photography · Afriframe Studio CMS" },
      { property: "og:description", content: "Manage photo shoots and galleries." },
    ],
  }),
  component: Photography,
});
