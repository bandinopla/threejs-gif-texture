// vite.config.js
import { defineConfig } from 'vite';
import path from "path";
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default defineConfig({
  publicDir: false,
  plugins: [nodeResolve(), commonjs() ],
  
  build: {
    manifest: true,
    minify: true, 
    reportCompressedSize: true,
    lib: {
        entry: path.resolve(__dirname, "src/THREE_GifTexture.ts"),
        fileName: "three-giftexture",
        formats: ["es", "cjs"],
      },
    rollupOptions: {
        external: [
            "three",
        ], 
    }
  }
});