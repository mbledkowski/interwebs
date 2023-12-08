import playwright, { type Browser } from "playwright";
import type { WebEngines } from "./interface";
import { randomInt } from "crypto";
import os from "os";
import UserAgent from "user-agents";
import { Database } from "./db";

function validateUrl(url: string): boolean {
  const urlValidationRegex =
    /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
  const isUrl = urlValidationRegex.test(url);
  return isUrl;
}

async function processUrl(
  url: string,
  browser: Browser,
  queue: Set<string>,
  loaded: Set<string>,
  db: Database,
  i: number,
  j: number
): Promise<void> {
  const userAgent = new UserAgent({ deviceCategory: "desktop" }).toString();

  const context = await browser.newContext({ userAgent });
  const page = await context.newPage();

  let finalUrl: string;
  let title: string;
  let links: string[];

  try {
    await page.goto(url);

    await page.waitForLoadState("load");

    finalUrl = page.url();
    title = await page.title();

    const rawLinks = await page.$$eval("a", (as) => as.map((a) => a.href));

    links = rawLinks.filter((url) => validateUrl(url));

    loaded.add(url);

    links.forEach((url) => {
      queue.add(url);
    });

    if (url !== finalUrl) {
      console.log(
        `[${j}, ${i}]: Start: ${url}; Final: ${finalUrl}; Title: ${title}`
      );
    } else {
      console.log(`[${j}, ${i}]: Url: ${url}; Title: ${title}`);
    }

    if (finalUrl !== url) {
      db.addWebPage(url, "", [finalUrl], true);
    }
    db.addWebPage(finalUrl, title, links, false);
  } finally {
    queue.delete(url);
    await context.close();
  }
}

async function main() {
  const iterations = 420;
  const cpus = os.cpus().length;
  const startUrls = [
    "https://abc.xyz/",
    "https://www.amazon.com/",
    "https://apple.com/",
    "https://meta.com/",
    "https://www.microsoft.com/",
    "https://www.baidu.com/",
    "https://www.alibabagroup.com/",
    "https://www.tencent.com/en-us/",
    "https://www.mi.com/global/",
    "https://en.wikipedia.org/wiki/Main_Page",
  ]; // US and Chinese big tech + Wikipedia
  const webEngines: WebEngines[] = ["chromium", "firefox"]; // webkit does not work on Fedora, so we are ignoring it
  const browsers: Browser[] = [];
  for (const webEngine of webEngines) {
    browsers.push(await playwright[webEngine].launch());
  }

  const db = new Database();

  await db.dropDatabase();

  const queue = new Set<string>(startUrls);
  const loaded = new Set<string>();

  db.commit();
  for (let j = 0; j < iterations; j++) {
    const queueOfProcesses = [];
    const queueIterator = queue.values();
    for (let i = 0; i < cpus; i++) {
      const url = queueIterator.next().value;
      if (url !== undefined) {
        queueOfProcesses.push(
          processUrl(
            url,
            browsers[randomInt(browsers.length)] as Browser,
            queue,
            loaded,
            db,
            i,
            j
          ).catch(console.error)
        );
      }
    }
    await Promise.all(queueOfProcesses);
  }
  for (const browser of browsers) {
    await browser.close();
  }
  db.close();
}

main().then(console.log).catch(console.error);
