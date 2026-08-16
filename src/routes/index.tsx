import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/pages/Dashboard";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Afriframe Studio CMS · Creative Command Surface" },
      {
        name: "description",
        content:
          "Bookings, collections, uploads, and creative crew activity in one calm command surface for Afriframe Studio.",
      },
      { property: "og:title", content: "Afriframe Studio CMS · Creative Command Surface" },
      {
        property: "og:description",
        content: "Bookings, collections, uploads, and crew activity in one calm command surface.",
      },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  ),
});
