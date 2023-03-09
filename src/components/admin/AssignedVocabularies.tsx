import React, { useMemo, useState } from "react";
import VocabularyList from "../vocabulary/VocabularyList";
import {
  Box,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import SearchIcon from "@mui/icons-material/Search";
import { useGetAllVocabulariesQuery } from "../../api/apiSlice";

const AssignedVocabularies: React.FC = () => {
  const { data } = useGetAllVocabulariesQuery();
  const intl = useIntl();
  const [filterText, setFilterText] = useState("");
  const filteredVocabularies = useMemo(() => {
    return data?.filter((vocabulary) => {
      if (filterText === "") return true;
      else {
        return vocabulary.label
          .toLowerCase()
          .includes(filterText.toLowerCase());
      }
    });
  }, [data, filterText]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(event.target.value);
  };

  return (
    <Box px={3} mt={6}>
      <Paper>
        <Box px={3} py={2}>
          <Box
            sx={{
              alignItems: "center",
              justifyContent: "space-between",
              display: "flex",
              flex: 1,
            }}
          >
            <Typography variant={"h5"}>
              {intl.formatMessage({ id: "assignedVocabulariesHeader" })}
            </Typography>
            <TextField
              size={"small"}
              value={filterText}
              onChange={handleChange}
              InputProps={{
                endAdornment: endAdornment,
              }}
            />
          </Box>
          <hr />
        </Box>
        <Box sx={{ paddingBottom: 3 }} px={2}>
          <VocabularyList vocabularies={filteredVocabularies ?? []} />
        </Box>
      </Paper>
    </Box>
  );
};

const endAdornment = (
  <InputAdornment position={"end"}>
    <SearchIcon />
  </InputAdornment>
);

export default AssignedVocabularies;
