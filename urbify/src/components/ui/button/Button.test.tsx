import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Search</Button>);
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
  });
});
