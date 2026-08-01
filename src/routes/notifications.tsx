import { createFileRoute } from "@tanstack/react-router";
import { Notifications } from "@/pages/Notifications";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications · Afriframe Studio CMS" },
      { name: "description", content: "Manage notifications inside the Afriframe Studio creative operating system." },
      { property: "og:title", content: "Notifications · Afriframe Studio CMS" },
      { property: "og:description", content: "Manage notifications inside the Afriframe Studio creative operating system." },
    ],
  }),
  component: Notifications,
});
