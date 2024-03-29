import React, { useCallback, useMemo, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import {
  useGetAllVocabulariesQuery,
  useGetMyGestoredVocabulariesQuery,
} from "../api/vocabularyApi";
import VocabulariesList from "./vocabulary/VocabulariesList";
import { Vocabulary } from "../model/Vocabulary";
import VocabularyFilter from "./vocabulary/VocabularyFilter";
import EmojiPeopleOutlinedIcon from "@mui/icons-material/EmojiPeopleOutlined";
import {
  useAddGestorRequestMutation,
  useGetMyGestorRequestsQuery,
} from "../api/gestorRequestApi";
import { useIntl } from "react-intl";
import { filterVocabulariesByLabel } from "../utils/FilterUtils";
import VocabularyGestorsModal from "./vocabulary/VocabularyGestorsModal";
import { useSnackbar } from "notistack";
import RequestedBadge from "./chips/RequestedBadge";
import GestoredBadge from "./chips/GestoredBadge";
import SearchBar from "./misc/SearchBar";
import ErrorAlert from "./misc/ErrorAlert";
import LoadingOverlay from "./misc/LoadingOverlay";

const CurrentUserSummary: React.FC = () => {
  const {
    data: allVocabularies,
    isLoading: allVocabulariesLoading,
    error: allVocabulariesError,
  } = useGetAllVocabulariesQuery();
  const {
    data: myGestored,
    isLoading: gestoredVocabulariesLoading,
    error: gestoredVocabulariesError,
  } = useGetMyGestoredVocabulariesQuery();
  const {
    data: myRequests,
    isLoading: requestedVocabulariesLoading,
    error: requestedVocabulariesError,
  } = useGetMyGestorRequestsQuery();
  const [addGestorRequest] = useAddGestorRequestMutation();
  const [activeTab, setActiveTab] = useState("all");
  const [filterText, setFilterText] = useState("");
  const [selectedVocabulary, setSelectedVocabulary] = useState<Vocabulary>();
  const [modalOpen, setModalOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const intl = useIntl();

  const disabledElements = useMemo(() => {
    return myGestored?.concat(myRequests ?? []);
  }, [myGestored, myRequests]);

  const disableElement = (vocabulary: Vocabulary): boolean => {
    //TODO: Think about the disable element function. This is gonna get kinda pricey to calculate
    return disabledElements?.some((v) => v.uri === vocabulary.uri) ?? false;
  };

  const showAditional = (vocabulary: Vocabulary): React.ReactNode => {
    if (myRequests?.some((r) => r.uri === vocabulary.uri)) {
      return <RequestedBadge label={intl.formatMessage({ id: "requested" })} />;
    }
    if (myGestored?.some((v) => v.uri === vocabulary.uri)) {
      return <GestoredBadge label={intl.formatMessage({ id: "gestored" })} />;
    }
    return <></>;
  };

  const handleAddGestorRequest = useCallback(
    (vocabulary: Vocabulary) => {
      if (myRequests?.some((v) => v.uri === vocabulary.uri)) return;
      addGestorRequest(vocabulary)
        .unwrap()
        .catch(() => {
          enqueueSnackbar(intl.formatMessage({ id: "something-went-wrong" }), {
            variant: "error",
          });
        });
    },
    [addGestorRequest, myRequests, enqueueSnackbar, intl]
  );

  const handleGestorsClick = (vocabulary: Vocabulary) => {
    //To make sure that the vocabulary is passed
    setSelectedVocabulary(() => {
      return vocabulary;
    });
    setModalOpen(true);
  };

  const displayedData: Vocabulary[] = useMemo(() => {
    if (!allVocabularies || !myGestored || !myRequests) return [];
    if (activeTab === "all") {
      return filterVocabulariesByLabel(allVocabularies, filterText);
    }
    if (activeTab === "gestoring") {
      return filterVocabulariesByLabel(myGestored, filterText);
    }
    if (activeTab === "requested") {
      return filterVocabulariesByLabel(myRequests, filterText);
    }
    return [];
  }, [activeTab, allVocabularies, myGestored, myRequests, filterText]);

  if (
    requestedVocabulariesLoading ||
    gestoredVocabulariesLoading ||
    allVocabulariesLoading
  )
    return <LoadingOverlay />;
  //TODO: Do it in one query
  if (requestedVocabulariesError || !myRequests) return <ErrorAlert />;
  if (gestoredVocabulariesError || !myGestored) return <ErrorAlert />;
  if (allVocabulariesError || !allVocabularies) return <ErrorAlert />;

  return (
    <Box px={3} mt={2}>
      <Paper>
        <Box px={3} pt={2} pb={1}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", flex: 1 }}
          >
            <Typography variant={"h5"} gutterBottom={true}>
              {intl.formatMessage({ id: "assignedVocabulariesHeader" })}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 3,
              }}
            >
              <VocabularyFilter
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
              <SearchBar
                value={filterText}
                setValue={setFilterText}
                label={intl.formatMessage({ id: "search-vocabulary-by-label" })}
              />
            </Box>
          </Box>
          <Box mb={2}>
            <hr />
          </Box>
        </Box>

        <Box px={2} pb={3}>
          <VocabulariesList
            vocabularies={displayedData}
            action={handleAddGestorRequest}
            actionDescription={intl.formatMessage({
              id: "create-gestor-request",
            })}
            actionIcon={<EmojiPeopleOutlinedIcon />}
            disabled={disableElement}
            gestorsClick={handleGestorsClick}
            additionalInfo={showAditional}
          />
          <VocabularyGestorsModal
            vocabulary={selectedVocabulary}
            open={modalOpen}
            setOpen={setModalOpen}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default CurrentUserSummary;
