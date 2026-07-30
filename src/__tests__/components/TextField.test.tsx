import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TextField } from "../../components/forms/TextField";

describe("TextField", () => {
  it("associates its visible label with the input", () => {
    render(
      <TextField
        label="عنوان محصول"
        name="title"
        value=""
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("عنوان محصول")).toHaveAttribute("id", "title");
  });
});
