import { createFileRoute } from "@tanstack/react-router";
import { Portfolio } from "@/pages/Portfolio";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio · Afriframe Studio CMS" },
      { name: "description", content: "Manage portfolio inside the Afriframe Studio creative operating system." },
      { property: "og:title", content: "Portfolio · Afriframe Studio CMS" },
      { property: "og:description", content: "Manage portfolio inside the Afriframe Studio creative operating system." },
    ],
  }),
  component: Portfolio,
});
