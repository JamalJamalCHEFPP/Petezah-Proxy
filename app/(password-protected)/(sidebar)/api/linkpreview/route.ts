import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import psl from "psl";

import { extractHostname, isString, isValidWebUrl, stringToBoolParam } from "@/lib/utils";
import { getBingImageSearch, getImageSearchString } from "@/lib/funcs/search";
import { scrapeSite, SiteData, ScrapeOptions } from "@/lib/funcs/scrape";
import { getExceptionSiteData, ExtraData } from "@/utils/exceptions";

export const runtime = "node";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { data, errors } = getLinkPreviewParams(req);
  if (errors.length > 0) {
    return NextResponse.json({ success: false, errors }, { status: 400 });
  }

  const { url, stealth, search, validate } = data;

  try {
    const linkPreviewData = await getLinkPreviewData(url, stealth, search, validate);
    return NextResponse.json(linkPreviewData);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}

function getLinkPreviewParams(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const url = searchParams.get("url");
  const stealth = searchParams.get("stealth");
  const search = searchParams.get("search");
  const validate = searchParams.get("validate");

  let urlString = "";
  let stealthBool: boolean | undefined;
  let searchBool: boolean | undefined;
  let validateBool: boolean | undefined;
  const errors: string[] = [];

  if (url && isString(url)) {
    const decodedUrl = decodeURIComponent(url).toString();
    if (isValidWebUrl(decodedUrl)) {
      urlString = decodedUrl;
    } else {
      errors.push("Url is invalid.");
    }
  } else {
    errors.push("Url string required. Only non array string parameter allowed.");
  }

  if (stealth) try { stealthBool = stringToBoolParam(stealth); } catch (err) { errors.push(`Stealth ${err}`); }
  if (search) try { searchBool = stringToBoolParam(search); } catch (err) { errors.push(`Search ${err}`); }
  if (validate) try { validateBool = stringToBoolParam(validate); } catch (err) { errors.push(`Validate ${err}`); }

  return {
    data: { url: urlString, stealth: stealthBool, search: searchBool, validate: validateBool },
    errors
  };
}

// main logic
async function getLinkPreviewData(
  url: string,
  stealth?: boolean,
  search?: boolean,
  validate?: boolean
) {
  let siteData: SiteData | undefined;
  let imageResults: string[] = [];
  let imageSearchString: string | undefined;
  let topImage: string | undefined;
  let extraData: ExtraData | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let errors: any[] = [];

  let scrapeOptions: ScrapeOptions | undefined = { scrape: true, stealth };

  const exceptionData = await getExceptionSiteData(url, stealth);
  if (exceptionData.scrapeOptions) scrapeOptions = exceptionData.scrapeOptions;
  if (exceptionData.extraData) extraData = exceptionData.extraData;

  let domainNameImageUrls: string[] = [];
  if (search !== false) {
    const rootDomain = psl.get(extractHostname(url));
    if (rootDomain) {
      const parsed = psl.parse(rootDomain);
      if (!parsed.error) {
        if (parsed.sld) {
          imageSearchString = parsed.sld;
          const imageSearch = await getBingImageSearch(imageSearchString || "petezah");
          if (imageSearch.results) {
            domainNameImageUrls = imageSearch.results.map((r: { contentUrl: string }) => r.contentUrl);
            imageResults = domainNameImageUrls;
          } else {
            errors.push(imageSearch.error);
          }
        } else throw Error("Second level domain not found");
      } else throw Error(JSON.stringify(parsed.error));
    } else throw Error("Root domain not found");
  }

  if (scrapeOptions.scrape) {
    const scrapedSite = await scrapeSite(url, scrapeOptions);
    errors = errors.concat(scrapedSite.errors);

    if (scrapedSite.data && scrapedSite.data.title) {
      siteData = scrapedSite.data;
      if (validate !== false) topImage = await getTopImage(imageResults, scrapedSite.data);

      if (search !== false && siteData.title && /\S/.test(siteData.title)) {
        imageSearchString = getImageSearchString(siteData.title, siteData.url, siteData.siteName);
        const imageSearch = await getBingImageSearch(imageSearchString);
        if (imageSearch.results) {
          const imageUrls = imageSearch.results.map((r: { contentUrl: string }) => r.contentUrl);
          imageResults = mergeImageUrls(imageUrls, domainNameImageUrls);
        } else errors.push(imageSearch.error);
      }
    } else {
      if (validate !== false) topImage = await getTopImage(imageResults);
    }
  }

  return {
    success: true,
    errors,
    result: { siteData, imageSearch: imageSearchString, imageResults, topImage, extraData }
  };
}

async function getTopImage(imageResults: string[], siteData?: SiteData) {
  if (siteData) {
    if (siteData.image && await checkIfValidImageUrl(siteData.image)) return siteData.image;
    if (siteData.largestImage && await checkIfValidImageUrl(siteData.largestImage)) return siteData.largestImage;
  }
  for (const imageUrl of imageResults) {
    if (await checkIfValidImageUrl(imageUrl)) return imageUrl;
  }
}

async function checkIfValidImageUrl(imageUrl: string) {
  try {
    const response = await axios.get(imageUrl);
    return (
      response.status === 200 &&
      ((response.headers["content-type"])?.match(/(image)+\//g))?.length !== 0
    );
  } catch (err) {
    console.log(err);
    return false;
  }
}

function mergeImageUrls(a1: string[], a2: string[]) {
  a1.splice(2, 0, a2[0]);
  a1.splice(5, 0, a2[1]);
  a1.splice(10, 0, a2[2]);
  a1.splice(15, 0, a2[3]);
  a1.splice(20, 0, a2[4]);
  return a1;
}
