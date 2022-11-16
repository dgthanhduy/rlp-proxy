import { createClient } from "@supabase/supabase-js";
import { APIOutput } from "../types";

const SUPABASE_URL = "https://jnrqapvabbmdgeoaslrq.supabase.co";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

const cacheKeyPrefix = 'services:linkpreview:'

const redis = require("redis").createClient({
  url: process.env.REDISTOGO_URL,
});

interface CacheRecord extends APIOutput {
  url: string;
}

const checkForCache = async (url: string): Promise<APIOutput | null> => {
  try {

    const cacheKey = `${cacheKeyPrefix}:${url}`

    let data = JSON.parse(await redis.get(cacheKey))

    if (data) {
      return data as unknown as APIOutput;
    }

    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const createCache = async (data: CacheRecord): Promise<boolean> => {
  try {
    // await supabase.from("meta-cache").insert(data);
    const cacheKey = `${cacheKeyPrefix}:${data.url}`
    await redis.set(cacheKey, JSON.stringify(data))
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export { checkForCache, createCache };
