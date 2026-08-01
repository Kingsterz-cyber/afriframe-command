import { createFileRoute } from "@tanstack/react-router";
import { Bookings } from "@/pages/Bookings";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "Bookings · Afriframe Studio CMS" },
      { name: "description", content: "Manage bookings inside the Afriframe Studio creative operating system." },
      { property: "og:title", content: "Bookings · Afriframe Studio CMS" },
      { property: "og:description", content: "Manage bookings inside the Afriframe Studio creative operating system." },
    ],
  }),
  component: Bookings,
});
