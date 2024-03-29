import { apiSlice } from "./apiSlice";
import Endpoints, {
  getChangeResolve,
  getClearReview,
  getPublication,
  getPublicationStateResolve,
  getPublicationVocabularyChanges,
  getRestrictionChangeResolve,
} from "./Endpoints";
import { Publication, PublicationContext } from "../model/Publication";
import {
  Change,
  ChangedVocabularyIdentity,
  VocabularyChanges,
} from "../model/Change";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export const publicationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRelevantPublications: builder.query<PublicationContext[], void>({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        const reviewablesPromise = await fetchWithBQ(
          Endpoints.GET_ALL_REVIEWABLE_PUBLICATIONS
        );
        if (reviewablesPromise.error)
          return { error: reviewablesPromise.error as FetchBaseQueryError };
        const reviewables = reviewablesPromise.data as PublicationContext[];

        const readOnlyPromise = await fetchWithBQ(
          Endpoints.GET_ALL_READONLY_PUBLICATIONS
        );
        if (readOnlyPromise.error)
          return { error: readOnlyPromise.error as FetchBaseQueryError };
        const readOnly = readOnlyPromise.data as PublicationContext[];
        const allPublications: PublicationContext[] = reviewables
          .map((publication) => {
            return { ...publication, reviewable: true };
          })
          .concat(
            readOnly.map((publication) => {
              return { ...publication, reviewable: false };
            })
          );
        return { data: allPublications as PublicationContext[] };
      },
      providesTags: ["ALL_RELEVANT_PUBLICATIONS"],
    }),
    getClosedPublications: builder.query<
      PublicationContext[],
      { pageNumber?: number }
    >({
      query: (params) => ({
        url: Endpoints.GET_CLOSED_PUBLICATIONS,
        params: {
          pageNumber: params.pageNumber,
        },
      }),
      providesTags: ["CLOSED_PUBLICATIONS"],
    }),
    getPublicationById: builder.query<Publication, string>({
      query: (id) => getPublication(id),
      providesTags: (result, error, id) => [{ type: "PUBLICATIONS", id }],
    }),
    getVocabularyChanges: builder.query<
      VocabularyChanges,
      ChangedVocabularyIdentity
    >({
      query: (params) => ({
        url: getPublicationVocabularyChanges(params.publicationId),
        params: { vocabularyUri: params.vocabularyUri },
      }),
      providesTags: (result, error, arg) => [
        {
          type: "VOCABULARY_CHANGES",
          id: `${arg.publicationId}_${arg.vocabularyUri}`,
        },
      ],
      //Adds vocabulary uri + publication id, publication last update to each change
      transformResponse: (rawResult: VocabularyChanges, meta, arg) => {
        for (let i = 0; i < rawResult.changes.length; i++) {
          if (!rawResult.changes[i].uri) {
            //We are sure that the restriction is present in the object property since no URI was provided
            const firstChange =
              rawResult.changes[i].object!.restriction!.affectedChanges[0];
            rawResult.changes[i].uri = `grouped/${firstChange.uri}`;
            rawResult.changes[i].id = `grouped/${firstChange.id}`;
            rawResult.changes[i].predicate = "CUSTOM_RELATIONSHIP";
          }
          rawResult.changes[i].vocabularyUri = rawResult.uri;
          rawResult.changes[i].publicationId = arg.publicationId;
          rawResult.changes[i].gestored = rawResult.gestored;
          rawResult.changes[i].readOnly =
            rawResult.publicationState === "APPROVED" ||
            rawResult.publicationState === "REJECTED";
          rawResult.changes[i].publicationDate =
            rawResult.publicationLastUpdate;
        }
        return rawResult;
      },
    }),
    resolveChangeState: builder.mutation<Change, Partial<Change>>({
      query(data) {
        return {
          url: getChangeResolve(data.id!, data.state!),
          params: { versionDate: data.publicationDate },
          method: "POST",
        };
      },
      async onQueryStarted({ ...patch }, { dispatch, queryFulfilled }) {
        //Local update of vocabulary changes
        const vocabularyChangesPatch = dispatch(
          publicationApi.util.updateQueryData(
            "getVocabularyChanges",
            {
              vocabularyUri: patch.vocabularyUri!,
              publicationId: patch.publicationId!,
            },
            (draft) => {
              Object.assign(
                draft.changes.find((change) => change.id === patch.id)!,
                patch
              );
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          vocabularyChangesPatch.undo();
        }
      },
    }),
    resolveChangeClearState: builder.mutation<Change, Partial<Change>>({
      query(data) {
        return {
          url: getClearReview(data.id!),
          params: { versionDate: data.publicationDate },
          method: "DELETE",
        };
      },
      async onQueryStarted({ ...patch }, { dispatch, queryFulfilled }) {
        //Local update of vocabulary changes
        const vocabularyChangesPatch = dispatch(
          publicationApi.util.updateQueryData(
            "getVocabularyChanges",
            {
              vocabularyUri: patch.vocabularyUri!,
              publicationId: patch.publicationId!,
            },
            (draft) => {
              Object.assign(
                draft.changes.find((change) => change.id === patch.id)!,
                patch
              );
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          vocabularyChangesPatch.undo();
        }
      },
    }),
    resolveRestrictionChangeState: builder.mutation<Change, Partial<Change>>({
      query(data) {
        return {
          url: getRestrictionChangeResolve(data.state!),
          method: "POST",
          params: { versionDate: data.publicationDate },
          body: data.object!.restriction!.affectedChanges.map(
            (change) => change.uri
          ),
        };
      },
      async onQueryStarted({ ...patch }, { dispatch, queryFulfilled }) {
        //Local update of vocabulary changes
        const vocabularyChangesPatch = dispatch(
          publicationApi.util.updateQueryData(
            "getVocabularyChanges",
            {
              vocabularyUri: patch.vocabularyUri!,
              publicationId: patch.publicationId!,
            },
            (draft) => {
              Object.assign(
                draft.changes.find((change) => change.id === patch.id)!,
                patch
              );
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          vocabularyChangesPatch.undo();
        }
      },
    }),
    resolveRestrictionClearState: builder.mutation<Change, Partial<Change>>({
      query(data) {
        return {
          url: Endpoints.CHANGES_REVIEW,
          method: "DELETE",
          params: { versionDate: data.publicationDate },
          body: data.object!.restriction!.affectedChanges.map(
            (change) => change.uri
          ),
        };
      },
      async onQueryStarted({ ...patch }, { dispatch, queryFulfilled }) {
        //Local update of vocabulary changes
        const vocabularyChangesPatch = dispatch(
          publicationApi.util.updateQueryData(
            "getVocabularyChanges",
            {
              vocabularyUri: patch.vocabularyUri!,
              publicationId: patch.publicationId!,
            },
            (draft) => {
              Object.assign(
                draft.changes.find((change) => change.id === patch.id)!,
                patch
              );
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          vocabularyChangesPatch.undo();
        }
      },
    }),
    approveOrRejectPublication: builder.mutation<
      Publication,
      Partial<Publication> & { closingComment: string }
    >({
      query(data) {
        return {
          url: getPublicationStateResolve(
            data.id!,
            data.state === "APPROVED" ? "approved" : "rejected"
          ),
          method: "POST",
          body: data.closingComment,
        };
      },
      async onQueryStarted({ ...patch }, { dispatch, queryFulfilled }) {
        const publicationPatch = dispatch(
          publicationApi.util.updateQueryData(
            "getPublicationById",
            patch.id!,
            (draft) => {
              Object.assign(draft, patch);
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          publicationPatch.undo();
        }
      },
      invalidatesTags: (result, error, arg) => [
        { type: "PUBLICATIONS", id: arg.id },
      ],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetRelevantPublicationsQuery,
  useGetPublicationByIdQuery,
  useGetVocabularyChangesQuery,
  useResolveChangeStateMutation,
  useResolveRestrictionChangeStateMutation,
  useResolveChangeClearStateMutation,
  useResolveRestrictionClearStateMutation,
  useApproveOrRejectPublicationMutation,
  useGetClosedPublicationsQuery,
} = publicationApi;
