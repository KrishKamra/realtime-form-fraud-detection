/**
 * Capture UI screenshots for README showcase.
 * Usage: node scripts/capture-screenshots.mjs
 * Requires: web on :3000; API on :8000 improves dashboard shots.
 */
import { chromium } from "playwright";
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../..");
const OUT = path.join(ROOT, "docs", "screenshots");
const BASE = process.env.WEB_URL || "http://localhost:3000";
const API = process.env.API_URL || "http://127.0.0.1:8000";

function openSeedSession() {
  const sid = `readme_seed_${Date.now()}`;
  const wsUrl = API.replace(/^http/, "ws") + `/ws/telemetry/${sid}`;

  return new Promise((resolve) => {
    let ws;
    try {
      ws = new WebSocket(wsUrl);
    } catch (e) {
      console.warn("WS unavailable:", e.message);
      resolve({ sid: null, close: () => {} });
      return;
    }

    const close = () => {
      try {
        ws.close();
      } catch {}
    };

    const timer = setTimeout(() => {
      console.warn("WS seed timeout");
      resolve({ sid: null, close });
    }, 5000);

    ws.addEventListener("open", () => {
      const pump = () => {
        if (ws.readyState !== WebSocket.OPEN) return;
        const now = Date.now();
        const events = [];
        for (let i = 0; i < 8; i++) {
          events.push({
            event_type: "keydown",
            field_id: "full_name",
            timestamp_ms: now + i * 90,
            key_code: "KeyA",
          });
          events.push({
            event_type: "keyup",
            field_id: "full_name",
            timestamp_ms: now + i * 90 + 42,
            key_code: "KeyA",
          });
        }
        events.push({
          event_type: "mousemove",
          field_id: "full_name",
          timestamp_ms: now + 700,
          cursor_x: 140 + Math.random() * 40,
          cursor_y: 220 + Math.random() * 30,
        });
        ws.send(
          JSON.stringify({
            session_id: sid,
            applicant_name: "Alex Morgan",
            events,
          }),
        );
      };
      pump();
      const interval = setInterval(pump, 1200);
      ws._interval = interval;
    });

    ws.addEventListener("message", () => {
      clearTimeout(timer);
      resolve({
        sid,
        close: () => {
          if (ws._interval) clearInterval(ws._interval);
          close();
        },
      });
    });

    ws.addEventListener("error", () => {
      clearTimeout(timer);
      resolve({ sid: null, close });
    });
  });
}

async function shot(page, name, options = {}) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({
    path: file,
    type: "png",
    animations: "disabled",
    ...options,
  });
  console.log("saved", path.relative(ROOT, file));
  return file;
}

async function scrollToHeading(page, name) {
  const loc = page.getByRole("heading", { name });
  if ((await loc.count()) === 0) return false;
  await loc.first().scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -90));
  await page.waitForTimeout(280);
  return true;
}

async function main() {
  await mkdir(OUT, { recursive: true });

  console.log("Seeding live API session…");
  const seed = await openSeedSession();
  if (seed.sid) console.log("seed session", seed.sid);
  else console.warn("continuing without live session seed");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });
  const page = await context.newPage();
  await page.emulateMedia({ reducedMotion: "reduce" });
  // Hide Next.js dev indicator / issue toast so README shots stay clean
  await page.addStyleTag({
    content: `
      nextjs-portal,
      [data-next-badge-root],
      [data-nextjs-toast],
      #__next-build-watcher,
      [data-nextjs-dialog-overlay] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `,
  });
  // Re-inject after navigations
  page.on("load", async () => {
    try {
      await page.addStyleTag({
        content: `
          nextjs-portal,
          [data-next-badge-root],
          [data-nextjs-toast],
          #__next-build-watcher {
            display: none !important;
            visibility: hidden !important;
          }
        `,
      });
    } catch {}
  });

  // ——— Landing ———
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(700);
  await shot(page, "landing-full", { fullPage: true });
  await shot(page, "landing-hero");

  if (await page.getByText("Test ROC-AUC").count()) {
    await page.getByText("Test ROC-AUC").first().scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -140));
    await page.waitForTimeout(300);
    await shot(page, "landing-stats");
  }

  if (await scrollToHeading(page, "From keystroke to risk score")) {
    await shot(page, "landing-how-it-works");
  }
  if (await scrollToHeading(page, "Built for production fraud ops")) {
    await shot(page, "landing-features");
  }
  if (await scrollToHeading(page, "Run a live biometric assessment in seconds")) {
    await shot(page, "landing-cta");
  }

  // ——— Apply ———
  await page.goto(`${BASE}/apply`, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(900);
  await shot(page, "apply");

  const nameInput = page.locator("#full_name");
  if (await nameInput.count()) {
    await nameInput.fill("Jane Doe");
    await page.locator("#ssn").fill("123-45-6789");
    await page.locator("#annual_income").fill("125,000");
    await page.locator("#loan_amount").fill("25,000");
    await nameInput.click();
    await nameInput.pressSequentially(" x", { delay: 70 });
    await page.waitForTimeout(1500);
  }
  await shot(page, "apply-active");

  // ——— Dashboard (keep seed WS open) ———
  await page.goto(`${BASE}/dashboard`, {
    waitUntil: "networkidle",
    timeout: 45000,
  });
  await page.waitForTimeout(3000);
  await shot(page, "dashboard");
  await shot(page, "dashboard-full", { fullPage: true });

  // Root aliases used by existing README paths
  const aliases = [
    ["landing-full", "landing_page.png"],
    ["apply-active", "apply.png"],
    ["dashboard", "dashboard.png"],
  ];
  for (const [src, dest] of aliases) {
    await copyFile(path.join(OUT, `${src}.png`), path.join(ROOT, dest));
    console.log("copied", dest);
  }

  await writeFile(
    path.join(OUT, "manifest.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        base: BASE,
        seedSession: seed.sid,
        files: [
          "landing-full.png",
          "landing-hero.png",
          "landing-stats.png",
          "landing-how-it-works.png",
          "landing-features.png",
          "landing-cta.png",
          "apply.png",
          "apply-active.png",
          "dashboard.png",
          "dashboard-full.png",
        ],
      },
      null,
      2,
    ),
  );

  seed.close();
  await browser.close();
  console.log("Done →", OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
