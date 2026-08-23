import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetDir = path.resolve(__dirname, "../docs/reference");

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const repos = [
  { name: "crawlee", url: "https://github.com/apify/crawlee.git" },
  { name: "chatbot", url: "https://github.com/vercel/chatbot.git" },
  { name: "retailGPT", url: "https://github.com/unicamp-dl/retailGPT.git" },
  { name: "PriceGhost", url: "https://github.com/clucraft/PriceGhost.git" },
  {
    name: "retail-shopping-assistant",
    url: "https://github.com/NVIDIA-AI-Blueprints/retail-shopping-assistant.git",
  },
  { name: "caramel", url: "https://github.com/DevinoSolutions/caramel.git" },
  { name: "PriceDoge", url: "https://github.com/DimensionDev/PriceDoge.git" },
  { name: "wxt", url: "https://github.com/wxt-dev/wxt.git" },
];

for (const repo of repos) {
  const dest = path.join(targetDir, repo.name);
  if (fs.existsSync(dest)) {
    console.log(`[OK] ${repo.name} already exists in docs/reference/`);
    continue;
  }
  console.log(`[Cloning] ${repo.name} from ${repo.url} ...`);
  try {
    execSync(`git clone --depth 1 "${repo.url}" "${dest}"`, {
      stdio: "inherit",
    });
    console.log(`[Done] ${repo.name} cloned successfully.`);
  } catch (error) {
    console.error(`[Error] Failed to clone ${repo.name}:`, error.message);
  }
}

console.log("\nAll reference repositories processed in docs/reference/!");
