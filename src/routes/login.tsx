import { createFileRoute } from "@tanstack/react-router";
import { Login } from "@/pages/Login";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in · Afriframe Studio CMS" },
      { name: "description", content: "Sign in to the Afriframe Studio creative operating system to manage bookings, galleries and clients." },
      { property: "og:title", content: "Sign in · Afriframe Studio CMS" },
      { property: "og:description", content: "Sign in to the Afriframe Studio creative operating system to manage bookings, galleries and clients." },
    ],
  }),
  component: Login,
});
