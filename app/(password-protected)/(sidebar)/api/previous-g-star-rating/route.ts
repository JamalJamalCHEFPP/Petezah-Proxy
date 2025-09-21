import { connectToDatabases } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Collection } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId } = body;

    if (!gameId) {
      return NextResponse.json({ error: "gameId is required" }, { status: 400 });
    }

    const { mainDb } = await connectToDatabases();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gamesColl = mainDb.collection("games") as Collection<any>;

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

    const { data, error: authError } = await supabase.auth.getUser();
    const user = data?.user;
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // just fetch the stars array for the game
    const game = await gamesColl.findOne(
      { _id: gameId },
      { projection: { stars: 1 } }
    );

    if (!game) {
      return NextResponse.json({ alreadyRated: false, stars: [] });
    }

    return NextResponse.json({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      alreadyRated: Array.isArray(game.stars) && game.stars.some((s: any) => s.userId === user.id),
      stars: game.stars ?? [],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "internal_error", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
