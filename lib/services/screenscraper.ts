// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define a service using a base URL and expected endpoints
export const screenscraperApi = createApi({
  reducerPath: 'screenscraperApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/screenscraper' }),
  endpoints: (builder) => ({
    getInfo: builder.query({
      query: () => `info`,
      transformResponse: (data) => data.result.response.ssuser
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetInfoQuery } = screenscraperApi