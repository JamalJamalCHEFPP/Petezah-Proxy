/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"; // Ensure Next.js treats this as server-only

import { GoToOptions } from "puppeteer";
import * as cheerio from "cheerio";
import axios from "axios";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import UserAgent from "user-agents";

const AUTH = `${process.env.BRIGHT_DATA_USERNAME}:${process.env.BRIGHT_DATA_PASSWORD}`;

export interface SiteData {
  url: string;
  title?: string;
  favicon?: string;
  description?: string;
  image?: string;
  author?: string;
  siteName?: string;
  largestImage?: string;
}

export interface ScrapeOptions {
  scrape?: boolean;
  stealth?: boolean;
  stealthOptions?: {
    gotoOptions?: GoToOptions;
  };
}

// Main scrape function
export const scrapeSite = async (url: string, options?: ScrapeOptions) => {
  let html: string | undefined;
  const errors: any[] = [];
  let siteData: SiteData | undefined;

  // First try standard axios fetch
  try {
    const res = await axios.get(url);
    html = res.data;
  } catch (err) {
    console.warn("Axios fetch failed:", err);
    errors.push(err);
  }

  if (html) {
    siteData = scrapeMetaTags(url, html);
  }

  // Fallback to stealth puppeteer if needed
  if (options?.stealth !== false && (!siteData || !siteData.image)) {
    try {
      const scrapedData = await stealthScrapeUrl(url, options);
      html = scrapedData.html;
      siteData = scrapeMetaTags(url, html ?? "");
      siteData.largestImage = scrapedData.largestImage;
    } catch (err) {
      errors.push(err);
    }
  }

  return { data: siteData, errors };
};

// Helper: scrape meta tags from HTML
const scrapeMetaTags = (url: string, html: string) => {
  const $ = cheerio.load(html);

  const getMetatag = (name: string) =>
    $(`meta[name=${name}]`).attr("content") ||
    $(`meta[name="og:${name}"]`).attr("content") ||
    $(`meta[property="og:${name}"]`).attr("content") ||
    $(`meta[name="twitter:${name}"]`).attr("content");

  const title = getMetatag("title") || $("title").first().text();

  return {
    url,
    title,
    favicon: $('link[rel="shortcut icon"]').attr("href"),
    description: getMetatag("description"),
    image: getMetatag("image"),
    author: getMetatag("author"),
    siteName: getMetatag("site_name"),
  };
};

// Stealth scraping using puppeteer-extra (server only)
const stealthScrapeUrl = async (url: string, options?: ScrapeOptions) => {
  if (typeof window !== "undefined") {
    throw new Error("Stealth scraping must run on the server.");
  }

  // Dynamic imports to prevent Webpack from bundling
  const puppeteerExtra: any = (await import("puppeteer-extra")).default;
  const StealthPlugin: any = (await import("puppeteer-extra-plugin-stealth"))
    .default;
  const AdblockerPlugin: any = (
    await import("puppeteer-extra-plugin-adblocker")
  ).default;

  let html: string | undefined;
  let largestImage: string | undefined;

  const browser = await puppeteerExtra
    .use(StealthPlugin())
    .use(AdblockerPlugin({ blockTrackers: true }))
    .connect({ browserWSEndpoint: `wss://${AUTH}@brd.superproxy.io:9222` });

  try {
    const page = await browser.newPage();

    // Random user agent
    const userAgent = new UserAgent();
    await page.setUserAgent(userAgent.toString());

    // Navigate to page
    await page.goto(url, options?.stealthOptions?.gotoOptions);

    // Get full HTML
    html = await page.evaluate(() => document.querySelector("*")?.outerHTML);

    // Find largest image
    largestImage = await page.evaluate(() => {
      const imageLargest = () => {
        let best: HTMLImageElement | null = null;
        const images = Array.from(document.getElementsByTagName("img"));
        for (const img of images) {
          if (
            !best ||
            img.naturalWidth * img.naturalHeight >
              best.naturalWidth * best.naturalHeight
          ) {
            best = img;
          }
        }
        return best;
      };

      const img = imageLargest();
      return img?.src || null;
    });
  } finally {
    await browser.close();
  }

  return { html, largestImage };
};
