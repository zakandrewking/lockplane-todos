import puppeteer from "puppeteer";

const targetUrl = process.env.APP_URL ?? "http://host.docker.internal:4000";
const timeoutMs = Number(process.env.TIMEOUT_MS ?? 10000);

console.log(`Opening ${targetUrl} with timeout ${timeoutMs}ms`);

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
});

const page = await browser.newPage();

page.on("console", (msg) => {
  console.log(`[console:${msg.type()}] ${msg.text()}`);
});

page.on("pageerror", (error) => {
  console.error(`[pageerror] ${error.message}`);
});

page.on("requestfailed", (request) => {
  console.error(
    `[requestfailed] ${request.url()} ${request.failure()?.errorText ?? ""}`
  );
});

page.on("response", (response) => {
  const status = response.status();
  if (status >= 400) {
    console.error(`[response:${status}] ${response.url()}`);
  }
});

await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: timeoutMs });

console.log("Page load complete, waiting briefly to gather logs...");
await new Promise((resolve) => setTimeout(resolve, 3000));

await browser.close();
console.log("Browser closed.");
