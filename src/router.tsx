import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./ui/AppLayout";
import { AdminPage } from "./pages/AdminPage";
import { BlogPage } from "./pages/BlogPage";
import { BlogPostPage } from "./pages/BlogPostPage";
import { CatalogCardPage } from "./pages/CatalogCardPage";
import { CatalogEntryPage } from "./pages/CatalogEntryPage";
import { CatalogPage } from "./pages/CatalogPage";
import { ContactsPage } from "./pages/ContactsPage";
import { ContentPage } from "./pages/ContentPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { GalleryPage } from "./pages/GalleryPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { RouteErrorPage } from "./pages/RouteErrorPage";

export const router = createBrowserRouter([
  { path: "/admin", element: <AdminPage />, errorElement: <RouteErrorPage /> },
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "catalog", element: <CatalogPage /> },
      { path: "catalog/:level1Value/:level2Value/cards/:cardId", element: <CatalogCardPage /> },
      { path: "catalog/:level1Value/:level2Value", element: <CatalogPage /> },
      { path: "catalog/:level1Value", element: <CatalogEntryPage /> },
      { path: "gallery", element: <GalleryPage /> },
      { path: "documents", element: <DocumentsPage /> },
      { path: "blog", element: <BlogPage /> },
      { path: "blog/:slug", element: <BlogPostPage /> },
      { path: "contacts", element: <ContactsPage /> },
      { path: "about", element: <ContentPage slug="about" /> },
      { path: "installation", element: <ContentPage slug="installation" /> },
      { path: "techcontrol", element: <ContentPage slug="techcontrol" /> },
      { path: "service", element: <ContentPage slug="service" /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
