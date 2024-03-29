import { renderWithProviders } from "../../../../utils/test-util";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { expect } from "vitest";
import React from "react";
import { User } from "../../../../model/User";
import { Vocabulary } from "../../../../model/Vocabulary";
import GestorRequestAccordion from "../GestorRequestAccordion";
import { GestorRequest } from "../../../../model/GestorRequest";

const mockedUser: User = {
  admin: false,
  firstName: "John",
  gestoredVocabularies: [],
  id: "",
  lastName: "Doe",
};

const mockedVocabulary: Vocabulary = {
  gestors: [],
  label: "Testing vocabulary",
  uri: "",
};

const mockedRequest: GestorRequest = {
  applicant: mockedUser,
  created: new Date(Date.now()),
  id: "",
  state: "",
  uri: "",
  vocabulary: mockedVocabulary,
};

describe("Gestor request accordion ", () => {
  test("The label of requested vocabulary should be present", async () => {
    renderWithProviders(
      <GestorRequestAccordion
        vocabulary={mockedVocabulary}
        gestorRequests={[mockedRequest]}
      />
    );
    expect(screen.getByText(mockedVocabulary.label)).toBeInTheDocument();
  });
  test("Clicking on accordion should reveal user", async () => {
    renderWithProviders(
      <GestorRequestAccordion
        vocabulary={mockedVocabulary}
        gestorRequests={[mockedRequest]}
      />
    );
    const title = screen.getByText(mockedVocabulary.label);
    const askingUser = screen.queryByText(
      mockedUser.firstName + " " + mockedUser.lastName
    );
    expect(askingUser).not.toBeInTheDocument();
    fireEvent.click(title);
    await waitFor(() => {
      expect(
        screen.getByText(mockedUser.firstName + " " + mockedUser.lastName)
      ).toBeVisible();
    });
  });
});
