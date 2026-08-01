import { createFileRoute } from "@tanstack/react-router";
import { Photographers } from "@/pages/Photographers";

export const Route = createFileRoute("/photographers")({
  head: () => ({
    meta: [
      { title: "Photographers · Afriframe Studio CMS" },
      { name: "description", content: "Manage photographers inside the Afriframe Studio creative operating system." },
      { property: "og:title", content: "Photographers · Afriframe Studio CMS" },
      { property: "og:description", content: "Manage photographers inside the Afriframe Studio creative operating system." },
    ],
  }),
  component: Photographers,
});
