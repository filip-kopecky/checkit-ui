import React from "react";
import { Change, ChangeState } from "../../../model/Change";
import { Box, Grid } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ObjectLabel from "../ObjectLabel";
import { getModificationColor } from "../../../utils/ChangeUtils";
import { styled } from "@mui/material/styles";
import { useResolveChangeStateMutation } from "../../../api/publicationApi";
import AcceptedChip from "../../chips/AcceptedChip";
import DeclinedChip from "../../chips/DeclinedChip";
import { useAppDispatch } from "../../../hooks/ReduxHooks";
import { toggleChange } from "../../../slices/changeSlice";
import ChangeDeclineMessage from "../ChangeDeclineMessage";
import ChangeResolveAction from "../ChangeResolveAction";

interface ChangeBasicDetailProps {
  change: Change;
}

const ChangeBasicDetail: React.FC<ChangeBasicDetailProps> = ({ change }) => {
  const dispatch = useAppDispatch();
  const [resolveChangeState] = useResolveChangeStateMutation();
  const handleResolution = (state: ChangeState) => {
    resolveChangeState({
      id: change.id,
      state: state,
      vocabularyUri: change.vocabularyUri,
      publicationId: change.publicationId,
    });
    if (state === "APPROVED") {
      dispatch(toggleChange(change.uri));
    }
  };
  return (
    <Box pt={1} pb={1}>
      <Box>
        <Grid container spacing={2}>
          <Grid item md={6} xs={12}>
            <ModifiedObject objectUri={change.object} state={change.type} />
          </Grid>
          {change.type === "MODIFIED" && (
            <>
              <Grid item md={1} xs={12}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    height: "100%",
                    justifyContent: "center",
                  }}
                >
                  <Arrow fontSize={"large"} />
                </Box>
              </Grid>
              <Grid item md={5} xs={12}>
                <ModifiedObject
                  objectUri={change.newObject!}
                  state={"CREATED"}
                />
              </Grid>
            </>
          )}
        </Grid>
      </Box>
      <Box mt={4}>
        {change.state === "NOT_REVIEWED" && change.gestored && (
          <ChangeResolveAction handleResolution={handleResolution} />
        )}
        {change.state === "APPROVED" && <AcceptedChip />}
        {change.state === "REJECTED" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <DeclinedChip />
            <ChangeDeclineMessage
              state={change.state}
              declineComment={change.declineMessage}
              submitDeclineMessage={(content) => {
                console.log(`Submitted reject message ${content}`);
                dispatch(toggleChange(change.uri));
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

interface ModifiedObjectProps {
  objectUri: string;
  state: string;
}

const ModifiedObject: React.FC<ModifiedObjectProps> = ({
  objectUri,
  state,
}) => {
  return (
    <Box
      sx={{
        borderLeft: 6,
        borderColor: getModificationColor(state),
        paddingLeft: 2,
        height: "100%",
      }}
    >
      <ObjectLabel objectUri={objectUri} variant={"body1"} />
    </Box>
  );
};

const Arrow = styled(ArrowForwardIcon)(({ theme }) => ({
  [theme.breakpoints.down("md")]: {
    transform: "rotate(90deg)",
  },
}));

export default ChangeBasicDetail;