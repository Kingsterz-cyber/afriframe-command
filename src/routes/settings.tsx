import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "@/pages/Settings";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Afriframe Studio CMS" },
      { name: "description", content: "Manage settings inside the Afriframe Studio creative operating system." },
      { property: "og:title", content: "Settings · Afriframe Studio CMS" },
      { property: "og:description", content: "Manage settings inside the Afriframe Studio creative operating system." },
    ],
  }),
  component: Settings,
});
