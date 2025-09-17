"use client";

import { createClient } from "@/utils/supabase/client";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";
import { useState } from "react";
import { IoClose } from "react-icons/io5";

export default function AdBanner() {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const atOptions = {
      key: "63a9cb25e974a9b6f959b15af26b5eee",
      format: "iframe",
      height: 90,
      width: 728,
      params: {},
    };

    const script = document.createElement("script");
    script.src =
      "https://www.highperformanceformat.com/63a9cb25e974a9b6f959b15af26b5eee/invoke.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div id="container-63a9cb25e974a9b6f959b15af26b5eee"></div>;
}

export function PageAdBanner() {
  const [toggled, setToggled] = useState(false);
  const supabase = createClient();
  const pathname = usePathname();

  useEffect(() => {
    async function checkUserBooster(userId: string) {
      if (!userId) {
        setToggled(true);
        localStorage.setItem("isBooster", "false");
        return;
      }

      const res = await fetch(`/api/is-booster?user_id=${userId}`, {
        method: "POST",
        body: JSON.stringify({ user_id: userId }),
      });

      if (!res.ok) return;

      const json = await res.json();
      if (json.elevated) {
        setToggled(false);
        localStorage.setItem("isBooster", "true");
      } else {
        setToggled(true);
        localStorage.setItem("isBooster", "false");
      }
    }

    // 🚀 Use cached value first (instant UI decision)
    const boosterStatus = localStorage.getItem("isBooster");
    if (boosterStatus === "true") {
      setToggled(false); // don’t show ads
    } else if (boosterStatus === "false") {
      setToggled(true); // show ads
    } else {
      setToggled(true); // default if unknown
    }

    // Then confirm with Supabase + API
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user;
      if (user) {
        checkUserBooster(user.id);
      } else {
        setToggled(true);
        localStorage.setItem("isBooster", "false");
      }
    });
  }, [pathname, supabase.auth]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://pl27611320.revenuecpmgate.com/3438d5cb0f1e239f554fefbd6dfef939/invoke.js";
    script.async = true;
    script.setAttribute("data-cfasync", "false");

    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, [pathname]);

  return (
    <>
      <Script
        async
        data-cfasync="false"
        src="https://pl27611320.revenuecpmgate.com/3438d5cb0f1e239f554fefbd6dfef939/invoke.js"
        strategy="afterInteractive"
      />

      {toggled && (
        <div
          className={clsx(
            "absolute bottom-0 z-10 flex justify-center text-white! w-full transition-all duration-300 scale-50",
            toggled ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="relative max-w-1/2">
            <div className="bg-black w-full rounded-2xl p-4! text-white!">
              <div
                key={pathname}
                id="container-3438d5cb0f1e239f554fefbd6dfef939"
              ></div>
              {pathname != "/" && <p className="text-xl text-center">Boost our <Link href="/discord" className="text-blue-500 underline">Discord Server</Link> to remove Ads!</p>}
            </div>

            <button
              type="button"
              title="Close ads"
              onClick={() => setToggled(false)}
              className="absolute flex items-center justify-center bg-black border-2 border-white rounded-full w-15 h-15 -top-8 -right-8 text-white!"
            >
              <IoClose size={40} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
