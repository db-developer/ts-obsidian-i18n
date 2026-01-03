import path from "path";
import { defineConfig } from "vitest/config";

const projectRoot = path.resolve(__dirname, "..");

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,

    // Projektroot eine Ebene über .config
    root: projectRoot,

    sequence: {
      shuffle: false,     // keine Zufallsreihenfolge
      concurrent: false,  // Tests NICHT parallel, sondern nacheinander
    },

    // nur Tests innerhalb von src/test/
    include: ["src/test/00.00.sequence.of.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],   // optional, wie du willst
      exclude: [
        "**/test/**",               // alles im test-Ordner
        "**/*.test.ts",             // einzelne Testdateien
        "**/*.spec.ts"
      ]
    }
  },
  resolve: {
    alias: {
      obsidian: path.resolve(projectRoot, "src/test/__mocks__/obsidian.ts")
    },
  },  
});