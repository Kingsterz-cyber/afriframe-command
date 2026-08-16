import { createFileRoute } from "@tanstack/react-router";
import { Gallery } from "@/pages/Gallery";
import ProtectedRoute from "@/components/ProtectedRoute";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery · Afriframe Studio CMS" },
      {
        name: "description",
        content:
          "Browse and manage every Afriframe Studio photo with category filters, search, and quick actions.",
      },
      { property: "og:title", content: "Gallery · Afriframe Studio CMS" },
      {
        property: "og:description",
        content: "Browse and manage every Afriframe Studio photo with category filters.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ProtectedRoute>
      <Gallery />
    </ProtectedRoute>
  ),
});
