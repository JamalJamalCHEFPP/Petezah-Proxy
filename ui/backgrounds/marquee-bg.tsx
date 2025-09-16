"use client";

import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import Image from "next/image";
import clsx from "clsx";
import { createClient } from "@/utils/supabase/client";

const messages = [
  "PeteZah Games 🎮 |",
  "PeteZah-Next ⚡ |",
  "Thanks for visiting our site! 🙌 |",
  "Happy to have you! 😄 |",
  "The #1 Proxy 🥇 |",
  "Fast, Secure, Reliable 🚀 |",
  "Made with ❤️ by PeteZah and more 🌟 |",
  "Serving fun since 2025 🎉 |",
  "Browse freely 😊 |",
  "Innovation starts here 💡 |",
  "Where speed meets style 😎 |",
  "Freedom to explore 🌍 |",
  "Unlock the web 🔓 |",
  "Always improving ✨ |",
  "Your gateway to the internet 🌐 |",
  "Blazing fast ⚡ |",
  "Stay connected 🤝 |",
  "Safe and secure 🔒 |",
  "Fun without limits 🪐 |",
  "Discover something new 🔍 |",
  "Power to the players 🧠 |",
];

function getRandomMessagePair() {
  const i1 = Math.floor(Math.random() * messages.length);
  const i2 = Math.floor(Math.random() * messages.length);
  return [messages[i1], messages[i2]];
}

const colors = [
  "text-red-400",
  "text-blue-400",
  "text-yellow-300",
  "text-green-400",
  "text-orange-300",
  "text-teal-300",
];

const MarqueeRow = ({
  hoverPause,
  type,
}: {
  hoverPause?: boolean;
  type: "new" | "old";
}) => {
  const [pair, setPair] = useState(
    type === "old"
      ? ["PeteZah Games 🎮 |", "PeteZah Games 🎮 |"]
      : getRandomMessagePair()
  );
  const [fade, setFade] = useState(true);
  const [color, setColor] = useState(colors[0]);

  useEffect(() => {
    if (type === "new") {
      setColor(colors[Math.floor(Math.random() * colors.length)]);
      const interval = setInterval(() => {
        setFade(false);
        setTimeout(() => {
          setPair(getRandomMessagePair());
          setColor(colors[Math.floor(Math.random() * colors.length)]);
          setFade(true);
        }, 500);
      }, 20000);
      return () => clearInterval(interval);
    }
  }, [type]);

  return (
    <Marquee
      speed={150}
      autoFill={true}
      pauseOnHover={hoverPause}
      className={clsx(
        "flex-1 h-1/5 flex items-center text-[10vh] font-bold overflow-y-hidden transition-opacity duration-500",
        fade ? "opacity-100" : "opacity-0",
        type === "new" ? color : "text-white"
      )}
    >
      {pair.map((msg, i) => (
        <div key={i} className="flex items-center mr-5!">
          {msg}
          <Image
            src={"/logo-png-removebg-preview.png"}
            width={200}
            height={10}
            alt="PeteZah Logo"
            unoptimized={process.env.NODE_ENV === "development"}
          />{" "}
          |
        </div>
      ))}
    </Marquee>
  );
};

export default function MarqueeBg({
  hoverPause,
  className,
}: {
  hoverPause?: boolean;
  className?: string;
}) {
  const [bgType, setBgType] = useState<"new" | "old" | "hide">("new");

  const supabase = createClient();

  useEffect(() => {
    const stored = localStorage.getItem("backgroundType");

    if (stored === "old" || stored === "hide" || stored === "new") {
      setBgType(stored);
    } else {
      setBgType("new");
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user;

      if (!user) return;

      const res = await fetch(
        `/api/private-profile?user_id=${session.user.id}`,
        {
          method: "POST",
          body: JSON.stringify({
            user_id: user.id,
          }),
        }
      );

      const json = await res.json();

      if ("backgroundType" in json) {
        setBgType(json.backgroundType);
      }
    });
  }, [supabase.auth]);

  if (bgType === "hide") return null;

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden ${className}`}>
      <div className="absolute -inset-[20%] -rotate-12 opacity-75">
        <div className="w-full h-full">
          <div className="flex flex-col h-full">
            <MarqueeRow
              type={bgType === "old" ? "old" : "new"}
              hoverPause={hoverPause}
            />
            <MarqueeRow
              type={bgType === "old" ? "old" : "new"}
              hoverPause={hoverPause}
            />
            <MarqueeRow
              type={bgType === "old" ? "old" : "new"}
              hoverPause={hoverPause}
            />
            <MarqueeRow
              type={bgType === "old" ? "old" : "new"}
              hoverPause={hoverPause}
            />
            <MarqueeRow
              type={bgType === "old" ? "old" : "new"}
              hoverPause={hoverPause}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
