import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    server: {
        open: true,
        host: true,
    },
    plugins: [tailwindcss()],
});
