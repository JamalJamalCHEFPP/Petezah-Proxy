/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"; // Ensure Next.js treats this as server-only

import * as cheerio from "cheerio";
import axios from "axios";
import { GoToOptions } from "puppeteer"; // Only for type reference

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
  scrape?: boolean; // keep for possible future options
  stealth?: boolean; // now ignored
  stealthOptions?: {
    gotoOptions?: GoToOptions; // now ignored
  };
}

// Main scrape function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const scrapeSite = async (url: string, options?: ScrapeOptions) => {
  let html: string | undefined;
  const errors: any[] = [];
  let siteData: SiteData | undefined;

  // Try Axios fetch only
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
