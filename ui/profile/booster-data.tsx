"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Card from "@/ui/global/card";
import React from "react";

type RoleColor = {
  primary_color: number;
  secondary_color: number;
  tertiary_color: number | null;
};

export default function BoosterData() {
  const [isBooster, setIsBooster] = useState<boolean | null>(null);
  const [boosterRoles, setBoosterRoles] = useState<
    { name: string; value: boolean }[]
  >([]);
  const [colors, setColors] = useState<Record<string, RoleColor> | null>(null);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user;
      if (!user) return;

      const res = await fetch(`/api/is-booster?user_id=${user.id}`, {
        method: "POST",
        body: JSON.stringify({ user_id: user.id }),
      });

      const json = await res.json();

      setBoosterRoles([
        { name: "Booster", value: json.isBooster },
        { name: "Mod", value: json.isMod },
        { name: "Developer", value: json.isDeveloper },
        { name: "Elevated", value: json.isElevated },
        { name: "Genius", value: json.isGenius },
        { name: "Pizza Party", value: json.isPizzaParty },
        { name: "Owner", value: json.isOwner },
        { name: "Admin", value: json.isAdmin },
        { name: "OG", value: json.isOg },
        { name: "True OG", value: json.isTrueOg },
        { name: "W Rizz", value: json.isWRizz },
        { name: "Chill Guy", value: json.isChillGuy },
      ]);

      if (res.ok) {
        setIsBooster(json.elevated);
        setColors(json.colors);
      }
    });
  }, [supabase.auth]);

  function RoleName({ name, colors }: { name: string; colors: RoleColor }) {
    if (!colors) return <>{name}</>;

    const { primary_color, secondary_color } = colors;
    const primary = `#${primary_color.toString(16).padStart(6, "0")}`;
    const secondary = `#${secondary_color.toString(16).padStart(6, "0")}`;

    return (
      <span
        className="text-transparent bg-clip-text bg-gradient-to-r"
        style={{
          backgroundImage: `linear-gradient(to right, ${primary}, ${secondary})`,
        }}
      >
        {name}
      </span>
    );
  }

  function getColorKey(roleName: string) {
    const map: Record<string, string> = {
      Booster: "booster",
      Mod: "mod",
      Developer: "developer",
      Elevated: "elevated",
      Genius: "genius",
      "Pizza Party": "pizzaParty",
      Owner: "owner",
      Admin: "admin",
      OG: "og",
      "True OG": "trueOg",
      "W Rizz": "wRizz",
      "Chill Guy": "chillGuy"
    };
    return map[roleName] ?? "";
  }

  return (
    <Card className="flex flex-col items-center justify-center h-full">
      <h1 className="mb-4! text-2xl font-bold">Booster Data</h1>
      {isBooster !== null ? (
        <>
          <p>
            {isBooster ? (
              "You are a booster/mod/dev! We have tons of perks coming your way."
            ) : (
              <span>
                You are not a booster. Boost our Discord server at{" "}
                <a
                  className="text-blue-500"
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://discord.gg/GqshrYNn62"
                >
                  https://discord.gg/GqshrYNn62
                </a>
                .
              </span>
            )}
          </p>

          {boosterRoles.filter((role) => role.value).length > 0 && (
            <p>
              Special roles:{" "}
              {colors &&
                boosterRoles
                  .filter((role) => role.value)
                  .map((role, i, arr) => {
                    const colorKey = getColorKey(role.name);
                    const roleColors = colors[colorKey] ?? undefined;

                    return (
                      <React.Fragment key={i}>
                        <RoleName name={role.name} colors={roleColors} />
                        {i !== arr.length - 1 && ", "}
                      </React.Fragment>
                    );
                  })}
            </p>
          )}
        </>
      ) : (
        <p className="text-lg">No booster data available at the moment.</p>
      )}
    </Card>
  );
}
