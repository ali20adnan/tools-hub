import { defineConfig } from "vite"
import { resolve } from "path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import dts from "vite-plugin-dts"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      include: ["src"],
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "MyUI",
      formats: ["es"],
      fileName: "index",
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react-router-dom",
        "react-router",
        "motion/react",
        "next-themes",
        "sonner",
        "lucide-react",
        "@radix-ui/react-slot",
        "class-variance-authority",
        "clsx",
        "tailwind-merge",
      ],
      output: {
        assetFileNames: "myui.css",
      },
    },
  },
})
