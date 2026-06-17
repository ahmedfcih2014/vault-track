import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/presentation/layout/AppShell";
import { ArchivesPage } from "@/presentation/pages/ArchivesPage";
import { SavingPage } from "@/presentation/pages/SavingPage";
import { SettingsPage } from "@/presentation/pages/SettingsPage";
import { SpendingPage } from "@/presentation/pages/SpendingPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/spending" replace /> },
      { path: "saving", element: <SavingPage /> },
      { path: "spending", element: <SpendingPage /> },
      { path: "archives", element: <ArchivesPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
