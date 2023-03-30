import React from "react";
import { CommentData } from "../../../model/CommentData";
import { UserData } from "../../../model/User";
import Comment from "../../comments/Comment";
import List from "@mui/material/List";
import { Box } from "@mui/material";
import CommentInput from "../../comments/CommentInput";
import { useIntl } from "react-intl";

const ChangeCommentsDetails: React.FC = () => {
  const handleCommentSubmit = (commentText: string) => {
    console.log(commentText);
  };
  const intl = useIntl();
  return (
    <Box>
      <CommentInput
        handleCommentSubmit={handleCommentSubmit}
        placeholder={intl.formatMessage({ id: "add-comment-placeholder" })}
      />
      <List>
        <Comment comment={mockedComment} />
        <Comment comment={mockedComment1} showDivider={false} />
      </List>
    </Box>
  );
};

const mockedUser: UserData = {
  firstName: "Martin",
  id: "",
  lastName: "Nečaský",
};

const mockedUser1: UserData = {
  firstName: "Michal",
  id: "",
  lastName: "Med",
};

const mockedComment: CommentData = {
  uri: "",
  author: mockedUser,
  content:
    "Tenhle triple je absolutní nesmysl. Nechápu jak mohl tohle někdo vyplodit",
  creationDate: new Date("2023-03-25"),
  lastModificationDate: new Date("2022-04-1"),
  topic: "commentId",
};
const mockedComment1: CommentData = {
  uri: "",
  author: mockedUser1,
  content: "Souhlasím, nedává to smysl",
  creationDate: new Date("2023-03-26"),
  lastModificationDate: new Date("2022-04-1"),
  topic: "commentId",
};

export default ChangeCommentsDetails;