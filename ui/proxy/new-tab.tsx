import { IoSearch } from "react-icons/io5";
import MarqueeBg from "../backgrounds/marquee-bg";
import Card from "../global/card";
import { TextInputChildren } from "../global/input";
import { Dispatch, SetStateAction } from "react";
import { Tab } from "@/lib/types";

export default function NewTab({
  index,
  setTabs,
  className,
}: {
  tabs: Tab[];
  setTabs: Dispatch<SetStateAction<Tab[]>>;
  setCurrentIndex: Dispatch<SetStateAction<number>>;
  className?: string;
  index: number;
}) {
  return (
    <>
      <div
        className={`flex items-center justify-center w-full h-full overflow-hidden ${className}`}
      >
        <MarqueeBg />
        <Card className="flex flex-col gap-4 p-[30]! max-w-[80%]">
          <h1 className="w-full text-6xl text-center">PeteZah-Next</h1>
          <h3 className="text-xl text-center text-wrap">
            Warning: This proxy uses UV, which is somewhat slow.
          </h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              const form = e.currentTarget;

              const formData = new FormData(form);
              const query = (formData.get("search") as string)?.trim();
              if (!query) return;

              let url: string;
              try {
                url = new URL(query).toString();
              } catch {
                url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
              }

              let title = "No title";

              try {
                const res = await fetch("/static/embed.html#" + url);
                const html = await res.text();
                title = html.match(/<title>(.*?)<\/title>/i)?.[1] ?? title;

                const parser = new DOMParser();
                const doc = parser.parseFromString(html, "text/html");
                const titleElement = doc.querySelector("title");
                if (titleElement) title = titleElement.innerText;
              } catch (err) {
                if (typeof window !== "undefined") {
                  console.warn("Fetch failed (handled):", err);
                }
              }

              const params = new URLSearchParams({
                url: encodeURIComponent(url),
              });
              const res = await fetch(`/api/linkpreview?${params}`);
              const data = await res.json();

              if (data.result.siteData.title) {
                title = data.result.siteData.title;
              }

              const newTab: Tab = { title, url };

              setTabs((prev) => {
                const updated = [...prev];
                updated[index] = newTab;
                return updated;
              });

              form.reset();
            }}
          >
            <TextInputChildren name="search">
              <div className="flex items-center">
                <IoSearch />
              </div>
            </TextInputChildren>
          </form>
        </Card>
      </div>
    </>
  );
}
