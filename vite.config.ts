import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    server: {
        open: true,
        host: true,
    },
    base: "/yvml-interactive-map/",
    build: {
        outDir: "docs",
        emptyOutDir: true,
    },
    plugins: [tailwindcss()],
});
