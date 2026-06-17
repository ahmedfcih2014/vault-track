import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AppShell } from "@/presentation/layout/AppShell";

describe("AppShell", () => {
  it("renders bottom navigation tabs", () => {
    render(
      <MemoryRouter initialEntries={["/spending"]}>
        <AppShell />
      </MemoryRouter>,
    );

    expect(screen.getByText("Saving")).toBeInTheDocument();
    expect(screen.getByText("Spending")).toBeInTheDocument();
    expect(screen.getByText("Archives")).toBeInTheDocument();
  });
});
