import { createFileRoute } from "@tanstack/react-router";
import { Videography } from "@/pages/Videography";

export const Route = createFileRoute("/videography")({
  head: () => ({
    meta: [
      { title: "Videography · Afriframe Studio CMS" },
      { name: "description", content: "Manage your video projects and productions in the Afriframe Studio creative operating system." },
      { property: "og:title", content: "Videography · Afriframe Studio CMS" },
      { property: "og:description", content: "Manage video projects and productions." },
    ],
  }),
  component: Videography,
});
