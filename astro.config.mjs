import { defineConfig } from "astro/config";
import contentIntegrity from "./src/integrations/content-integrity.mjs";

export default defineConfig({
  output: "static",
  integrations: [contentIntegrity()],
});
