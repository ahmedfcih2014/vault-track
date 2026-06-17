import { RouterProvider } from "react-router-dom";
import { AppProviders } from "@/app/providers";
import { router } from "@/app/router";
import { InstallPrompt } from "@/app/pwa/InstallPrompt";
import { RegisterSW } from "@/app/pwa/RegisterSW";
import { OfflineBanner } from "@/presentation/components/OfflineBanner";

export function App() {
  return (
    <AppProviders>
      <OfflineBanner />
      <RouterProvider router={router} />
      <RegisterSW />
      <InstallPrompt />
    </AppProviders>
  );
}
