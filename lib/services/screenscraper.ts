// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ScreenScraperJS } from 'screenscraper-js';

const screenScraperJS = new ScreenScraperJS({
  // required
  // you can request a developer account here: https://www.screenscraper.fr/forumsujets.php?frub=12&numpage=0
  devId: "yourDevID",
  devPassword: "yourDevPassword",
  // optional
  userName: "yourUserName",
  userPassword: "yourUserPassword",
});
// Define a service using a base URL and expected endpoints
export const romsApi = createApi({
  reducerPath: 'screenscraperApi',
  baseQuery: fetchBaseQuery({ baseUrl: '' }),
  endpoints: (builder) => ({
    getPokemonByName: builder.query<unknown, string>({
      query: () => `files`,
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetPokemonByNameQuery } = romsApi