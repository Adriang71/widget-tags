import { render, screen, fireEvent } from "@testing-library/react";
import { WidgetTags } from "./WidgetTags";

describe("WidgetTags", () => {
  it("renders search on default render", async () => {
    render(<WidgetTags />);

    const search = await screen.findByTestId("search-input");

    expect(search).toBeDefined();
  });

  it("renders search text and tags inside dropdown", () => {
    render(<WidgetTags />);

    const input = screen.getByTestId("search-input") as HTMLInputElement;
    fireEvent.click(input);
    fireEvent.change(input, { target: { value: "Marek" } });

    const dropdownTags = screen.getByTestId(
      "search-item-checkbox"
    ) as HTMLInputElement;

    expect(input.value).toBe("Marek");
    expect(dropdownTags).toBeDefined();
  });

  it("renders search text and create tags inside widget content", () => {
    render(<WidgetTags />);

    const input = screen.getByTestId("search-input") as HTMLInputElement;

    fireEvent.click(input);
    fireEvent.change(input, { target: { value: "Marek" } });

    const dropdownTags = screen.getByTestId(
      "search-item-checkbox"
    ) as HTMLInputElement;
    fireEvent.click(dropdownTags);

    const submitTagButton = screen.getByText(/Zapisz/i) as HTMLInputElement;
    fireEvent.click(submitTagButton);

    const tagsListWidgetContent = screen.getByTestId(
      "tags-list"
    ) as HTMLInputElement;

    expect(input.value).toBe("Marek");
    expect(dropdownTags).toBeDefined();
    expect(tagsListWidgetContent).toBeDefined();
  });

  it("renders search text and create tags inside widget content and remove it", async () => {
    render(<WidgetTags />);

    const input = screen.getByTestId("search-input") as HTMLInputElement;

    fireEvent.click(input);
    fireEvent.change(input, { target: { value: "Marek" } });

    const dropdownTags = screen.getByTestId(
      "search-item-checkbox"
    ) as HTMLInputElement;
    fireEvent.click(dropdownTags);

    const submitTagButton = screen.getByText(/Zapisz/i) as HTMLInputElement;
    fireEvent.click(submitTagButton);

    const tagsListItemToClose = screen.getByTestId(
      "tags-list-close-item"
    ) as HTMLInputElement;

    fireEvent.click(tagsListItemToClose);

    fireEvent.change(input, { target: { value: "" } });
    expect(input.value).toBe("");
  });
});
