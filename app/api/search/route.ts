import { NextRequest, NextResponse } from "next/server";
import { searchClient } from "../../../utils/server";

export async function POST(request: NextRequest) {
  try {
    const { videoId, query } = await request.json();

    if (!videoId || !query) {
      return NextResponse.json(
        { error: "Video ID and query are required" },
        { status: 400 }
      );
    }

    const searchIndex = searchClient.index<{ text: string }>(videoId);
    const results = await searchIndex.search({
      query,
      limit: 10,
      reranking: true,
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    const allIndexes = await searchClient.listIndexes();
    const exists = allIndexes.includes(videoId);

    return NextResponse.json({ exists });
  } catch (error) {
    console.error("Index check error:", error);
    return NextResponse.json(
      { error: "Failed to check index" },
      { status: 500 }
    );
  }
}
