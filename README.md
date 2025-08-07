# Video Search

This is an Upstash product that allows users to search for specific moments in a video by indexing and searching its captions.

## How It Works

The application takes a youtube video URL as input. It then fetches the video's captions using the Supadata API, formats them, and indexes them into Upstash Search. Once indexed, users can perform a search query to find specific moments in the video. Clicking on a search result will take the user to that specific moment in the video.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then create an .env file and fill the required credentials:

```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
UPSTASH_SEARCH_API_KEY=
UPSTASH_SEARCH_API_ENDPOINT=
SUPADATA_API_KEY=
```

Then, run the development server:

```bash
npm run dev
```
