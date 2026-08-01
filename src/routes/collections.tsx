import { createFileRoute } from "@tanstack/react-router";
import { Collections } from "@/pages/Collections";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Collections · Afriframe Studio CMS" },
      { name: "description", content: "Manage collections inside the Afriframe Studio creative operating system." },
      { property: "og:title", content: "Collections · Afriframe Studio CMS" },
      { property: "og:description", content: "Manage collections inside the Afriframe Studio creative operating system." },
    ],
  }),
  component: Collections,
});
