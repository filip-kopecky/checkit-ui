import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getEnvVariable } from "../utils/environment";
import { getToken } from "../components/auth/utils";
import Constants from "../utils/Constants";
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: getEnvVariable("VITE_SERVER"),
    prepareHeaders: (headers) => {
      headers.set(Constants.HEADERS.AUTHORIZATION, getToken());
      return headers;
    },
  }),
  tagTypes: ["ALL_USERS", "ALL_VOCABULARIES", "ALL_GESTOR_REQUESTS"],
  endpoints: () => ({}),
});
