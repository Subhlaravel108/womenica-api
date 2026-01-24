import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";
import path from "path";
import { Parser } from "json2csv";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

puppeteer.use(StealthPlugin());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const scrapAmazonProducts = async (request, reply) => {
  const { url, max_products = 50 } = request.body;

  // 🔒 Validation
  if (!url || !url.startsWith("https://www.amazon.")) {
    return reply.code(422).send({
      success: false,
      error_code: "INVALID_URL",
      message: "Only valid Amazon listing URLs are allowed",
    });
  }

  const MAX_PRODUCTS = Math.min(Number(max_products) || 50, 100);
  const startTime = Date.now();
  let browser;

  try {
browser = await puppeteer.launch({
  headless: true,
  executablePath: "/usr/bin/google-chrome-stable",
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--no-zygote",
    "--single-process",
  ],
});


    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36"
    );

    await page.setViewport({ width: 1366, height: 768 });

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 0,
    });

    const productsMap = new Map();

    // 🔁 Scroll + collect (industry safe approach)
    for (let i = 0; i < 12; i++) {
      await page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });

      await new Promise((resolve) => setTimeout(resolve, 1200));

      const items = await page.evaluate(() => {
        return Array.from(
          document.querySelectorAll(".s-result-item[data-asin]")
        ).map((el) => {
          const asin = el.getAttribute("data-asin")?.trim();
          const title = el.querySelector("h2 span")?.innerText?.trim();
          const image = el.querySelector("img")?.src || "";

          // 🔥 BEST PRICE SELECTOR
          const price =
            el.querySelector(".a-price > .a-offscreen")?.innerText || "";

          if (!asin || !title || !image) return null;

          return {
            sku: asin,
            title: title.replace(/\s+/g, " "),
            image_url: image,
            price: price.replace(/[^\d.]/g, ""), // remove ₹, commas etc.
          };
        });
      });

      for (const item of items) {
        if (!item) continue;
        if (!productsMap.has(item.sku)) {
          productsMap.set(item.sku, item);
        }
        if (productsMap.size >= MAX_PRODUCTS) break;
      }

      if (productsMap.size >= MAX_PRODUCTS) break;
    }

    const products = Array.from(productsMap.values());

    if (!products.length) {
      await browser.close();
      return reply.code(404).send({
        success: false,
        error_code: "NO_DATA",
        message: "No products found from the given Amazon URL",
      });
    }

    const fields = [
      { label: "title", value: "title" },
      { label: "image_url", value: "image_url" },
      { label: "price", value: "price" },
      { label: "sku", value: "sku" },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(products);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `amazon_products_${timestamp}_${uuidv4()}.csv`;
    const uploadDir = path.join(__dirname, "../uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

   fs.writeFileSync(path.join(uploadDir, fileName), csv, "utf8");

// 🔥 Add cleanup here
const retentionDays = 7; // keep files for 7 days
const retentionTime = retentionDays * 24 * 60 * 60 * 1000;

fs.readdirSync(uploadDir).forEach((file) => {
  const filePath = path.join(uploadDir, file);
  const stats = fs.statSync(filePath);
  const now = Date.now();

  if (now - stats.mtimeMs > retentionTime) {
    fs.unlinkSync(filePath);
  }
});

await browser.close();

    console.info({
      module: "AMAZON_SCRAPER",
      total_products: products.length,
      time_taken_ms: Date.now() - startTime,
    });

    return reply.send({
      success: true,
      message: "Amazon products scraped successfully",
      meta: {
        total_products: products.length,
        time_taken_ms: Date.now() - startTime,
      },
      data: {
        download_url: `/uploads/${fileName}`,
      },
    });
  } catch (error) {
    if (browser) await browser.close();
    console.error("Amazon Scraper Error:", error);

    return reply.code(500).send({
      success: false,
      error_code: "SCRAPE_FAILED",
      message: "Failed to scrape Amazon products",
    });
  }
};
