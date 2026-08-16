import { createFileRoute } from "@tanstack/react-router";
import { AvailabilityCalendar } from "@/pages/AvailabilityCalendar";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/availability")({
  head: () => ({
    meta: [
      { title: "Availability Calendar · Afriframe Studio CMS" },
      { name: "description", content: "Manage your shooting schedule and availability in the Afriframe Studio creative operating system." },
      { property: "og:title", content: "Availability Calendar · Afriframe Studio CMS" },
      { property: "og:description", content: "Manage your shooting schedule and availability." },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <AvailabilityCalendar />
    </ProtectedRoute>
  ),
});
