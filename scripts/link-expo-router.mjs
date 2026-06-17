import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "app-rn", "node_modules", "expo-router");
const linkPath = path.join(root, "node_modules", "expo-router");

if (!fs.existsSync(source)) {
  console.log(
    "link-expo-router: skip (app-rn/node_modules/expo-router not found yet)",
  );
  process.exit(0);
}

if (fs.existsSync(linkPath)) {
  process.exit(0);
}

fs.mkdirSync(path.join(root, "node_modules"), { recursive: true });
fs.symlinkSync(source, linkPath, "junction");
console.log(
  "link-expo-router: linked app-rn/node_modules/expo-router → node_modules/expo-router",
);
