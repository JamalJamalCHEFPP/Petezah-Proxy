/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import MarqueeBg from "@/ui/backgrounds/marquee-bg";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");

  const [games, setGames] = useState<any[] | string>();
  const [filterCategory, setFilterCategory] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function loadGames() {
      try {
        const response = await fetch("/api/g-data");
        const data = await response.json();

        const sorted = data.games.sort((a: any, b: any) => {
          if (a.label === "Request Games") return -1;
          if (b.label === "Request Games") return 1;
        });

        console.log("😭");
        console.log("Sorted games:", sorted);
        setGames(sorted);
      } catch (error) {
        console.error("Fetch error:", error);
        setGames(`Error loading games: ${error}`);
      }
    }

    loadGames();
  }, []);

  function GameCard({
    game,
  }: {
    game: { label: string; imageUrl: string; url: string };
  }) {
    return (
      <>
        <div className="flex items-center justify-center">
          <div className="relative w-[200px] h-[170px] overflow-hidden transition-transform duration-500 rounded-2xl border-white border-2 bg-black flex justify-center items-center hover:scale-110 group">
            <Link
              className="w-full h-[170px]! flex justify-center items-center"
              href={game.url.replace("/iframe.html", "/play") + "/index.html"}
            >
              <Image
                className="object-cover! p-2 h-full hover:scale-110 transition-all duration-500"
                width={200}
                height={170}
                alt={game.label}
                src={game.imageUrl}
                unoptimized={process.env.NODE_ENV === "development"}
              />
              <p className="absolute bottom-0 right-0 text-center bg-black/60 p-[10px] w-full">
                {game.label}
              </p>
            </Link>
          </div>
        </div>
      </>
    );
  }

  const filteredGames =
    Array.isArray(games) &&
    games.filter((game) => {
      const matchesSearch = game.label
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        filterCategory === "" || game.categories?.includes(filterCategory);
      return matchesSearch && matchesCategory;
    });

  function randomGameOpen() {
    if (games && games.length > 0) {
      const randomIndex = Math.floor(Math.random() * games.length);
      const randomGame = games[randomIndex];
      router.push(randomGame.url);
    }
  }

  return (
    <>
      <div className="flex flex-col items-center h-full relative w-full bg-[#0A1D37] text-white overflow-hidden">
        <MarqueeBg />
        <div className="relative w-full h-full overflow-y-auto z-1 backdrop-blur-[2px]">
          <div className="h-[12%] w-full bg-black/20 p-2! px-8! md:flex justify-center gap-8! items-center">
            <input
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="px-2! py-1! bg-black border-2 border-white rounded-2xl transition-colors duration-500 w-full max-w-200 mb-2! md:md-0! md:mr-2!"
              name="searchQuery"
              id="searchQuery"
              placeholder="Search for your favorite game..."
            />
            <div className="flex items-center justify-center">
              <button
                type="button"
                className="px-2! py-1! bg-black border-2 border-white rounded-2xl hover:bg-gray-800 transition-colors duration-500 mr-2! whitespace-nowrap"
                onClick={randomGameOpen}
              >
                Random Game
              </button>
              <select
                title="Filter by Category"
                id="filter"
                name="filter"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-2! py-1! bg-black border-2 border-white rounded-2xl hover:bg-gray-800 transition-colors duration-500"
              >
                <option className="bg-black" value="">
                  Filter by Category
                </option>
                <option className="bg-black" value="action">
                  Action
                </option>
                <option className="bg-black" value="racing">
                  Racing
                </option>
                <option className="bg-black" value="strategy">
                  Strategy
                </option>
                <option className="bg-black" value="sports">
                  Sports
                </option>
                <option className="bg-black" value="skill">
                  Skill
                </option>
                <option className="bg-black" value="shooting">
                  Shooting
                </option>
                <option className="bg-black" value="2 player">
                  2 Player
                </option>
                <option className="bg-black" value="io">
                  .io
                </option>
              </select>
            </div>
          </div>
          <div>
            <div className="flex-1 overflow-y-auto !px-4 !py-6">
              {filteredGames ? (
                Array.isArray(filteredGames) ? (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6">
                    {filteredGames.map((game: any, index: number) => (
                      <GameCard key={index} game={game} />
                    ))}
                  </div>
                ) : (
                  typeof games === "string" && (
                    <p className="!p-2 bg-black rounded-2xl border-white border-2">
                      {games}
                    </p>
                  )
                )
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <p className="px-2! py-1! bg-black border-2 border-white rounded-2xl">
                    Loading games...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
