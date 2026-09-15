/**
 * @file server/env.ts
 * @description Guarantees .env is loaded synchronously before any other module imports.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

if (fs.existsSync(envPath)) {
  try {
    process.loadEnvFile(envPath);
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = "production";
    }
  } catch (err) {
    console.warn("[Env] Synchronous loadEnvFile notice:", err);
  }
}
