import { build, context } from "esbuild";
import { cpSync } from "fs";

const watch = process.argv.includes("--watch");

// Copy static files to dist
cpSync("src/manifest.json", "dist/manifest.json");
cpSync("src/popup.html", "dist/popup.html");
cpSync("src/icon-16.png", "dist/icon-16.png");
cpSync("src/icon-48.png", "dist/icon-48.png");
cpSync("src/icon-128.png", "dist/icon-128.png");

const opts = {
  entryPoints: ["src/popup.js"],
  bundle: true,
  outdir: "dist",
  format: "iife",
  target: "chrome120",
  minify: !watch,
};

if (watch) {
  const ctx = await context(opts);
  await ctx.watch();
  console.log("Watching...");
} else {
  await build(opts);
  console.log("Built to dist/");
}
