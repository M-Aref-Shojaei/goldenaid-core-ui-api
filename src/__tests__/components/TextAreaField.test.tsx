import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TextAreaField } from "../../components/forms/TextAreaField";

describe("TextAreaField", () => {
  it("associates its visible label with the textarea", () => {
    render(
      <TextAreaField
        label="توضیحات"
        name="description"
        value=""
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("توضیحات")).toHaveAttribute("id", "description");
  });
});
