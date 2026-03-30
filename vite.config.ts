import { resolve } from "node:path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    server: {
        open: true,
        host: true,
        headers: {
            "Service-Worker-Allowed": "/",
        },
    },
    base: "/map/",
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                "service-worker": resolve(__dirname, "src/service-worker.ts"),
            },
            output: {
                entryFileNames(chunkInfo) {
                    if (chunkInfo.name === "service-worker") {
                        return "service-worker.js";
                    }

                    return "assets/[name]-[hash].js";
                },
            },
        },
    },
    plugins: [tailwindcss()],
});
