
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isVercel = !!process.env.VERCEL;

export default defineConfig({
  ...(isVercel ? { nitro: { preset: "vercel" } } : {}),
  tanstackStart: {
    server: { entry: "server" },
  },
});
