import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const GUILD_ID = "1337108365591187640";

const ROLE_IDS = {
  booster: "1341154772006211666",
  mod: "1409270467226894387",
  developer: "1406629094623412244",
};

const ROLE_IDS_EXTD = {
  owner: "1337134692331290695",
  booster: "1341154772006211666",
  mod: "1409270467226894387",
  developer: "1406629094623412244",
  genius: "1343407711823597610",
  pizzaParty: "1343315458081689622",
  admin: "1337109489513533442",
  og: "1339769949131902976",
  trueOg: "1340119317060255795",
  wRizz: "1340142743250272286",
  chillGuy: "1345248092299071549",
};

export async function POST() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set({ name, value, ...options });
            }
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data, error } = await createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set({ name, value, ...options });
            }
          },
        },
      }
    )
      .from("profiles_private")
      .select("discord_id")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const memberRes = await fetch(
      `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${data.discord_id}`,
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
      }
    );

    if (!memberRes.ok) {
      return NextResponse.json(
        { error: "Discord user not found" },
        { status: 404 }
      );
    }

    const dcData = await memberRes.json();
    const userRoles: string[] = dcData.roles ?? [];

    const isBooster = userRoles.includes(ROLE_IDS.booster);
    const isMod = userRoles.includes(ROLE_IDS.mod);
    const isDeveloper = userRoles.includes(ROLE_IDS.developer);
    const isGenius = userRoles.includes(ROLE_IDS_EXTD.genius);
    const isPizzaParty = userRoles.includes(ROLE_IDS_EXTD.pizzaParty);
    const isAdmin = userRoles.includes(ROLE_IDS_EXTD.admin);
    const isOwner = userRoles.includes(ROLE_IDS_EXTD.owner);
    const isOg = userRoles.includes(ROLE_IDS_EXTD.og);
    const isTrueOg = userRoles.includes(ROLE_IDS_EXTD.trueOg);
    const isWRizz = userRoles.includes(ROLE_IDS_EXTD.wRizz);
    const isChillGuy = userRoles.includes(ROLE_IDS_EXTD.chillGuy);

    const elevated = isBooster || isMod || isDeveloper;

    const rolesRes = await fetch(
      `https://discord.com/api/v10/guilds/${GUILD_ID}/roles`,
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
      }
    );
    const allRoles = await rolesRes.json();

    const colors: Record<string, string | null> = {};
    for (const [key, id] of Object.entries(ROLE_IDS_EXTD)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const role = allRoles.find((r: any) => r.id === id);
      colors[key] = role ? role.colors : null;
    }

    return NextResponse.json({
      isBooster,
      isMod,
      isDeveloper,
      isGenius,
      isPizzaParty,
      isAdmin,
      isOwner,
      isOg,
      isTrueOg,
      isWRizz,
      isChillGuy,
      elevated,
      colors,
    });
  } catch (err) {
    console.error("Error in /api/is-booster:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
