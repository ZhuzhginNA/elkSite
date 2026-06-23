import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./ui/AppLayout";
import { AdminPage } from "./pages/AdminPage";
import { BlogPage } from "./pages/BlogPage";
import { BlogPostPage } from "./pages/BlogPostPage";
import { CatalogPage } from "./pages/CatalogPage";
import { CatalogCardPage } from "./pages/CatalogCardPage";
import { ContactsPage } from "./pages/ContactsPage";
import { ContentPage } from "./pages/ContentPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { GalleryPage } from "./pages/GalleryPage";
import { HomePage } from "./pages/HomePage";

export const router = createBrowserRouter([
  { path: "/admin", element: <AdminPage /> },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "catalog", element: <CatalogPage /> },
      { path: "catalog/:cardId", element: <CatalogCardPage /> },
      { path: "gallery", element: <GalleryPage /> },
      { path: "documents", element: <DocumentsPage /> },
      { path: "blog", element: <BlogPage /> },
      { path: "blog/:slug", element: <BlogPostPage /> },
      { path: "contacts", element: <ContactsPage /> },
      { path: "about", element: <ContentPage slug="about" /> },
      { path: "installation", element: <ContentPage slug="installation" /> },
      { path: "techcontrol", element: <ContentPage slug="techcontrol" /> },
      { path: "service", element: <ContentPage slug="service" /> },
    ],
  },
]);
