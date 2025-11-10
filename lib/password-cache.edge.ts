import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

let cachedPasswords: Record<string, string> | null = null;
let lastFetch = 0;
const TTL = 1000 * 60 * 5; // 5m

export async function getCachedPasswords(): Promise<Record<string, string>> {
  const now = Date.now();

  if (cachedPasswords && now - lastFetch < TTL) {
    return cachedPasswords;
  }

  const currentMonth = getMonthKey(0);
  const nextMonth = getMonthKey(1);

  const [cur, next] = (await redis.mget(
    `password:${currentMonth}`,
    `password:${nextMonth}`
  )) as (string | null)[];

  cachedPasswords = {
    [currentMonth]: cur ?? "",
    [nextMonth]: next ?? "",
  };

  lastFetch = now;
  return cachedPasswords;
}

function getMonthKey(offset: number = 0): string {
  const now = new Date();
  const target = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + offset)
  );
  return `${target.getUTCFullYear()}-${String(
    target.getUTCMonth() + 1
  ).padStart(2, "0")}`;
}
