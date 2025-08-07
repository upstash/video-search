import { supadataClient } from "../utils/server";

import {
  FormattedDocument,
  formatTranscriptData,
} from "../utils/data-formatter";
import { TranscriptInput } from "../utils/data-formatter";

interface Caption {
  url: string;
  lang?: string;
  text?: boolean;
  mode?: "native" | "auto" | "generate";
}

async function getCaptions(props: Caption): Promise<FormattedDocument[]> {
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

async function upsertCaptions(formattedData: FormattedDocument[], index: any) {
  // Process in batches of 100
  const batchSize = 100;
  for (let i = 0; i < formattedData.length; i += batchSize) {
    const batch = formattedData.slice(i, i + batchSize);
    await index.upsert(batch);
  }
}

export default async function indexCaptions(props: Caption, index: any) {
  const formattedData = await getCaptions(props);
  await upsertCaptions(formattedData, index);
}
