import { defineConfig, type Plugin } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";
import { writeFileSync } from "node:fs";
import { transform } from "esbuild";

/**
 * Plugin que gera versões minificadas (.min.js / .umd.min.cjs)
 * a partir do bundle não-minificado produzido pelo Vite.
 */
function minifyOutputPlugin(): Plugin {
  return {
    name: "minify-output",
    enforce: "post",
    async writeBundle(options, bundle) {
      const outDir = options.dir ?? resolve(__dirname, "dist");
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type !== "chunk") continue;

        const minified = await transform(chunk.code, {
          minify: true,
          target: "es2022",
        });

        const ext = fileName.endsWith(".cjs") ? ".cjs" : ".js";
        const base = fileName.slice(0, -ext.length);
        const minName = `${base}.min${ext}`;

        writeFileSync(resolve(outDir, minName), minified.code);
      }
    },
  };
}

export default defineConfig({
  plugins: [
    dts({ rollupTypes: true, tsconfigPath: "./tsconfig.json" }),
    minifyOutputPlugin(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "seTools",
      formats: ["es", "umd"],
      fileName: "se-tools",
    },
    target: "es2022",
    minify: false,
    sourcemap: true,
    rollupOptions: {
      output: {
        globals: {},
      },
    },
  },
});
