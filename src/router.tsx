import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./ui/AppLayout";
import { BlogPage } from "./pages/BlogPage";
import { CatalogPage } from "./pages/CatalogPage";
import { ContactsPage } from "./pages/ContactsPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { GalleryPage } from "./pages/GalleryPage";
import { HomePage } from "./pages/HomePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "catalog", element: <CatalogPage /> },
      { path: "gallery", element: <GalleryPage /> },
      { path: "documents", element: <DocumentsPage /> },
      { path: "blog", element: <BlogPage /> },
      { path: "contacts", element: <ContactsPage /> },
    ],
  },
]);
