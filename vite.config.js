import { fileURLToPath, URL } from "node:url";
import { createRequire } from "node:module";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

const require = createRequire(import.meta.url);
const puppeteer = require("puppeteer");

const MOST_ACTIVE_KR_URL = "https://kr.investing.com/equities/most-active-stocks";

const round = (value, digits = 2) => {
  const pow = 10 ** digits;
  return Math.round(value * pow) / pow;
};

const toNumberFromPercent = (rawPercent) => {
  if (!rawPercent) return 0;
  const cleaned = rawPercent.replace("%", "").trim();
  if (cleaned.includes(",") && !cleaned.includes(".")) {
    return Number(cleaned.replace(",", "."));
  }
  return Number(cleaned.replace(/,/g, ""));
};

const scrapeMostActiveKrTopStocks = async (limit = 5) => {
  const browser = await puppeteer.launch({ headless: "new" });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    );

    await page.goto(MOST_ACTIVE_KR_URL, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    const rows = await page.evaluate(() => {
      const percentRegex = /[+-]?\d+(?:[.,]\d+)?\s*%/g;
      const rowList = [...document.querySelectorAll("table tbody tr")];

      return rowList
        .map((row) => {
          const link = row.querySelector('a[href*="/equities/"]');
          if (!link) return null;

          const name = (link.textContent || "").trim();
          if (!name) return null;

          const href = link.getAttribute("href") || "";
          const rowText = (row.textContent || "").replace(/\s+/g, " ").trim();
          const percentMatches = rowText.match(percentRegex) || [];
          const rawPercent = percentMatches.at(-1) || "";

          return {
            name,
            symbol: href,
            rawPercent,
          };
        })
        .filter(Boolean);
    });

    const unique = [];
    const used = new Set();

    for (const row of rows) {
      const key = `${row.name}:${row.symbol}`;
      if (used.has(key)) continue;
      used.add(key);

      unique.push({
        name: row.name,
        symbol: row.symbol,
        change: round(toNumberFromPercent(row.rawPercent)),
        reason: "kr.investing.com Most Active 기준",
      });

      if (unique.length >= limit) break;
    }

    return unique;
  } finally {
    await browser.close();
  }
};

const investingApiPlugin = () => ({
  name: "investing-api-plugin",
  configureServer(server) {
    server.middlewares.use("/api/investing", async (req, res) => {
      if (req.method !== "POST") {
        res.statusCode = 405;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ message: "Method Not Allowed" }));
        return;
      }

      let rawBody = "";
      req.on("data", (chunk) => {
        rawBody += chunk;
      });

      req.on("end", async () => {
        try {
          const body = rawBody ? JSON.parse(rawBody) : {};
          const limit = Math.max(1, Math.min(Number(body.limit) || 5, 10));

          const topStocks = await scrapeMostActiveKrTopStocks(limit);

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              fetchedAt: new Date().toISOString(),
              count: topStocks.length,
              stocks: topStocks,
            }),
          );
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              message: "Investing scraping failed",
              error: error?.message || String(error),
            }),
          );
        }
      });
    });
  },
});

export default defineConfig({
  plugins: [vue(), vueDevTools(), investingApiPlugin()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
