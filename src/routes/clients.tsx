import { createFileRoute } from "@tanstack/react-router";
import { Clients } from "@/pages/Clients";

export const Route = createFileRoute("/clients")({
  head: () => ({
    meta: [
      { title: "Clients · Afriframe Studio CMS" },
      { name: "description", content: "Manage clients inside the Afriframe Studio creative operating system." },
      { property: "og:title", content: "Clients · Afriframe Studio CMS" },
      { property: "og:description", content: "Manage clients inside the Afriframe Studio creative operating system." },
    ],
  }),
  component: Clients,
});
