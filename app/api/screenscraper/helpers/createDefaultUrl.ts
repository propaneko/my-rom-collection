export const createDefaultUrl = (endpoint: string): string => {

  const urlParamsDev = process.env.SCREENSCRAPER_DEV_ID
    ? `devid=${process.env.SCREENSCRAPER_DEV_ID}&devpassword=${process.env.SCREENSCRAPER_DEV_PASSWORD}`
    : "";
  const urlParamsUser = process.env.SCREENSCRAPER_USER_NAME
    ? `ssid=${process.env.SCREENSCRAPER_USER_NAME}&sspassword=${process.env.SCREENSCRAPER_USER_PASSWORD}`
    : "";

  const API_URL = `https://api.screenscraper.fr/api2/${endpoint}`;

  return `${API_URL}?${urlParamsDev}&${urlParamsUser}`
};