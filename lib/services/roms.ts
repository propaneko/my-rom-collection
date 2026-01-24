import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const romsApi = createApi({
  reducerPath: 'romsApi',
  tagTypes: ['RomsList'],
  baseQuery: fetchBaseQuery({ baseUrl: '/api/roms' }),
  endpoints: (builder) => ({
    getRoms: builder.query({
      query: () => `get-local-roms`,
      providesTags: ['RomsList']
    }),
  }),
})

export const { useGetRomsQuery } = romsApi