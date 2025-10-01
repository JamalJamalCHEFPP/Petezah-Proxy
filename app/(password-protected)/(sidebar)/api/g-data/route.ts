import { NextResponse } from "next/server";
import { connectToDatabases } from "@/lib/mongodb";

export async function GET() {
  const { mainDb } = await connectToDatabases();
  const games = await mainDb.collection("games").find({}).toArray();
  return NextResponse.json({ games });
}
