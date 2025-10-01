"use server";

// ts is a rlly lazy copy/paste job so dont blame for the chopped code

export default async function IsBoosterByDCId(
  dcId: string
): Promise<{ elevated: boolean; pznAdmin: boolean }> {
  const GUILD_ID = "1337108365591187640";

  const ROLE_IDS = {
    booster: "1341154772006211666",
    mod: "1409270467226894387",
    developer: "1406629094623412244",
    elevated: "1419831377871896656",
    admin: "1337109489513533442",
    pznAdmin: "1420377727784976385",
  };

  const ROLE_IDS_EXTD = {
    owner: "1337134692331290695",
    booster: "1341154772006211666",
    mod: "1409270467226894387",
    developer: "1406629094623412244",
    elevated: "1419831377871896656",
    pznAdmin: "1420377727784976385",
    genius: "1343407711823597610",
    pizzaParty: "1343315458081689622",
    admin: "1337109489513533442",
    og: "1339769949131902976",
    trueOg: "1340119317060255795",
    wRizz: "1340142743250272286",
    chillGuy: "1345248092299071549",
  };

  const memberRes = await fetch(
    `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${dcId}`,
    {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    }
  );

  if (!memberRes.ok) {
    return { elevated: false, pznAdmin: false };
  }

  const dcData = await memberRes.json();
  const userRoles: string[] = dcData.roles ?? [];

  const isBooster = userRoles.includes(ROLE_IDS.booster);
  const isMod = userRoles.includes(ROLE_IDS.mod);
  const isDeveloper = userRoles.includes(ROLE_IDS.developer);
  const isElevated = userRoles.includes(ROLE_IDS.elevated);
  const isPznAdmin = userRoles.includes(ROLE_IDS.pznAdmin);
  const isAdmin = userRoles.includes(ROLE_IDS_EXTD.admin);
  const isOwner = userRoles.includes(ROLE_IDS_EXTD.owner);

  // isElevated is the role (just for non-boosters/mods/developers) that gives access to elevated features, but elevated encompasses all

  const elevated =
    isBooster || isMod || isDeveloper || isElevated || isAdmin || isOwner;

  // pzm admin is a separate role that gives access to extra rating features

  const pznAdmin = isMod || isDeveloper || isPznAdmin || isAdmin || isOwner;

  return {
    elevated,
    pznAdmin,
  };
}
