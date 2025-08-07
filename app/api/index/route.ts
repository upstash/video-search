import { NextRequest, NextResponse } from "next/server";
import { searchClient, supadataClient, redis } from "../../../utils/server";
import { formatTranscriptData } from "../../../utils/data-formatter";
import { TranscriptInput } from "../../../utils/data-formatter";
import { Ratelimit } from "@upstash/ratelimit";
import { waitUntil } from "@vercel/functions";

interface Caption {
  url: string;
  lang?: string;
  text?: boolean;
  mode?: "native" | "auto" | "generate";
}

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  prefix: "@upstash/ratelimit",
  analytics: true,
});

async function getCaptions(props: Caption) {
  const { url, lang, text, mode } = props;
  const transcriptResult = (await supadataClient.transcript({
    url,
    lang: lang || "en",
    text: text || false,
    mode: mode || "auto",
  })) as unknown as TranscriptInput;

  const formattedData = formatTranscriptData(transcriptResult, url);
  return formattedData;
}

async function upsertCaptions(formattedData: any[], index: any) {
  // Process in batches of 100
  const batchSize = 100;
  for (let i = 0; i < formattedData.length; i += batchSize) {
    const batch = formattedData.slice(i, i + batchSize);
    await index.upsert(batch);
  }
}

export async function POST(request: NextRequest) {
  try {
    const identifier = "api";
    const { success, limit, remaining, pending } = await ratelimit.limit(
      identifier
    );

    waitUntil(pending);

    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const { url, videoId } = await request.json();

    if (!url || !videoId) {
      return NextResponse.json(
        { error: "URL and video ID are required" },
        { status: 400 }
      );
    }

    const searchIndex = searchClient.index<{ text: string }>(videoId);
    const allIndexes = await searchClient.listIndexes();

    if (allIndexes.includes(videoId)) {
      return NextResponse.json({ message: "Video already indexed" });
    }

    const formattedData = await getCaptions({ url });
    await upsertCaptions(formattedData, searchIndex);

    return NextResponse.json({ message: "Video indexed successfully" });
  } catch (error) {
    console.error("Indexing error:", error);
    return NextResponse.json(
      { error: "Failed to index video" },
      { status: 500 }
    );
  }
}
