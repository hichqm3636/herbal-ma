import { defineConfig } from "astro/config";
import contentIntegrity from "./src/integrations/content-integrity.mjs";

export default defineConfig({
  site: "https://herbal.ma",
  output: "static",
  integrations: [contentIntegrity()],
  i18n: {
    defaultLocale: "ar",
    locales: ["ar", "en"],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
});
