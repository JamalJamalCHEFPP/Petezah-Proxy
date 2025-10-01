import { connectToDatabases } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Collection, ObjectId } from "mongodb";
import { GameData } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // im no longer using the actual mongo id bc its inconsistent
    const { gameId, rating } = body;

    if (!gameId || typeof rating !== "number") {
      return NextResponse.json(
        { error: "gameId and rating are required" },
        { status: 400 }
      );
    }

    const { mainDb } = await connectToDatabases();
    const gamesColl = mainDb.collection("games") as Collection<GameData>;

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

    const alreadyRated = await gamesColl.findOne(
      { _id: new ObjectId(gameId as string), "stars.userId": user.id },
      { projection: { stars: 1 } }
    );

    if (alreadyRated) {
      await gamesColl.updateOne(
        { _id: new ObjectId(gameId as string), "stars.userId": user.id },
        { $set: { "stars.$.rating": rating } }
      );
    } else {
      await gamesColl.updateOne(
        {
          _id: new ObjectId(gameId as string),
          "stars.userId": { $ne: user.id },
        },
        { $push: { stars: { userId: user.id, rating } } }
      );
    }

    const updatedGame = await gamesColl.findOne(
      { _id: new ObjectId(gameId as string) },
      { projection: { stars: 1 } }
    );

    return NextResponse.json({ stars: updatedGame?.stars ?? [] });
  } catch (err) {
    return NextResponse.json(
      {
        error: "internal_error",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
