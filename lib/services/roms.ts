import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const romsApi = createApi({
  reducerPath: 'romsApi',
  tagTypes: ['RomsList'],
  baseQuery: fetchBaseQuery({ baseUrl: '/api/local/roms' }),
  endpoints: (builder) => ({
    getRoms: builder.query({
      query: () => ``,
      providesTags: ['RomsList']
    }),
  }),
})

export const { useGetRomsQuery } = romsApi