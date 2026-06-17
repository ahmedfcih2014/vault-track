import { useRegisterSW } from "virtual:pwa-register/react";

export function RegisterSW() {
  useRegisterSW({
    onRegistered(registration) {
      if (registration) {
        console.info("Service worker registered");
      }
    },
    onRegisterError(error) {
      console.error("Service worker registration failed", error);
    },
  });

  return null;
}
