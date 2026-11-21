import { defineConfig } from "vite";
import solid from "@solidjs/vite-plugin";

export default defineConfig({
  root: "docs",
  base: "./",
  plugins: [solid()],
});
