import { renderWithProviders } from "../../utils/test-util";
import { screen } from "@testing-library/react";
import React from "react";
import Home from "../Home";

describe("Home page", () => {
  test("Welcome message is present", async () => {
    renderWithProviders(<Home />);
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
  });
});
