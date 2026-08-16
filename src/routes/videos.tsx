import { createFileRoute } from "@tanstack/react-router";
import { Videos } from "@/pages/Videos";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "Videos · Afriframe Studio CMS" },
      { name: "description", content: "Manage videos inside the Afriframe Studio creative operating system." },
      { property: "og:title", content: "Videos · Afriframe Studio CMS" },
      { property: "og:description", content: "Manage videos inside the Afriframe Studio creative operating system." },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <Videos />
    </ProtectedRoute>
  ),
});
