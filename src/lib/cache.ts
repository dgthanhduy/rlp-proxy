import { APIOutput } from "../types";
const { promisify } = require("util");

const redis = require("redis").createClient({
  url: process.env.REDISTOGO_URL,
});
const getAsync = promisify(redis.get).bind(redis);
const setAsync = promisify(redis.set).bind(redis);

const cacheKeyPrefix = 'services:linkpreview:'

interface CacheRecord extends APIOutput {
  url: string;
}

const checkForCache = async (url: string): Promise<APIOutput | null> => {
  try {

    const cacheKey = `${cacheKeyPrefix}:${url}`
    let data = JSON.parse(await getAsync(cacheKey))
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
    const cacheKey = `${cacheKeyPrefix}:${data.url}`
    await setAsync(cacheKey, JSON.stringify(data))
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export { checkForCache, createCache };
