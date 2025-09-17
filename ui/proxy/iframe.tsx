"use client";

import { Tab } from "@/lib/types";
import clsx from "clsx";
import getFaviconFromUrl from "@/lib/funcs/get-favicon-by-url";
import { Dispatch, SetStateAction, useEffect } from "react";

export default function ProxyIframe({
  index,
  tab,
  currentTabIndex,
  setTabs,
}: {
  index: number;
  tab: Tab;
  currentTabIndex: number;
  setTabs: Dispatch<SetStateAction<Tab[]>>;
}) {
  useEffect(() => {
    if (!tab.url) return;

    const newFavicon = getFaviconFromUrl(tab.url);
    if (tab.faviconUrl !== newFavicon) {
      setTabs((prev) =>
        prev.map((t, i) => (i === index ? { ...t, faviconUrl: newFavicon } : t))
      );
    }
  }, [tab.url, index, setTabs, tab.faviconUrl]);

  return (
    <iframe
      key={index}
      className={clsx(
        "absolute top-0 left-0 w-full h-full transition-opacity duration-300",
        currentTabIndex === index
          ? "opacity-100"
          : "opacity-0 pointer-events-none"
      )}
      title={tab.url}
      src={`/static/embed.html#${tab.url}`}
    />
  );
}
