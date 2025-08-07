interface TranscriptSegment {
  text: string;
  offset: number;
  duration: number;
  lang: string;
}

export interface TranscriptInput {
  content: TranscriptSegment[];
  lang: string;
  availableLangs: string[];
}

export interface FormattedDocument {
  id: string;
  content: {
    text: string;
  };
  metadata: {
    start_time: number;
  };
}

export function createYoutubeUrlWithTimestamp(
  url: string,
  startTimeSeconds: number
): string {
  return `${url}&t=${Math.floor(startTimeSeconds)}`;
}

export function formatSecondsToTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function formatTranscriptData(
  transcript: TranscriptInput,
  url: string
): FormattedDocument[] {
  return transcript.content.map((segment, index) => {
    const startTimeSeconds = Math.floor(segment.offset / 1000);
    return {
      id: `${url.split("v=")[1]}_${index.toString().padStart(4, "0")}`,
      content: {
        text: segment.text,
      },
      metadata: {
        start_time: startTimeSeconds,
      },
    };
  });
}
