import { Search } from "@upstash/search";
import { Supadata } from "@supadata/js";
import { Redis } from "@upstash/redis";

const searchClient = new Search({
  url: process.env.UPSTASH_SEARCH_REST_URL!,
  token: process.env.UPSTASH_SEARCH_REST_TOKEN!,
});

const supadataClient = new Supadata({
  apiKey: process.env.SUPADATA_API_KEY!,
});

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export { searchClient, supadataClient, redis };
