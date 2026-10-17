import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import OnboardingChecklist, {
  DEFAULT_CHECKLIST_TASKS,
  markChecklistTaskComplete,
  readChecklistState,
  resetChecklist,
} from "./OnboardingChecklist";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("OnboardingChecklist (#744)", () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockReset();
  });

  it("renders default checklist tasks with 0% progress initially", () => {
    render(
      <MemoryRouter>
        <OnboardingChecklist />
      </MemoryRouter>,
    );

    expect(screen.getByText("Get started with Navin")).toBeInTheDocument();
    expect(
      screen.getByText(`0 of ${DEFAULT_CHECKLIST_TASKS.length} steps complete`),
    ).toBeInTheDocument();

    const progressbar = screen.getByRole("progressbar", { name: /onboarding progress/i });
    expect(progressbar).toHaveAttribute("aria-valuenow", "0");

    for (const task of DEFAULT_CHECKLIST_TASKS) {
      expect(screen.getByText(task.title)).toBeInTheDocument();
    }
  });

  it("toggles task completion, updates progress bar, and persists state to localStorage", () => {
    render(
      <MemoryRouter>
        <OnboardingChecklist />
      </MemoryRouter>,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).toHaveAttribute("aria-checked", "false");

    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByText(`1 of ${DEFAULT_CHECKLIST_TASKS.length} steps complete`),
    ).toBeInTheDocument();
    expect(readChecklistState().completed).toContain(DEFAULT_CHECKLIST_TASKS[0].id);

    // Unchecking restores incomplete state
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).toHaveAttribute("aria-checked", "false");
  });

  it("shows completion message when all tasks are marked complete and supports external helpers", () => {
    for (const task of DEFAULT_CHECKLIST_TASKS) {
      markChecklistTaskComplete(task.id);
    }

    render(
      <MemoryRouter>
        <OnboardingChecklist />
      </MemoryRouter>,
    );

    expect(screen.getByText(/you're all set/i)).toBeInTheDocument();
    expect(
      screen.getByText("Every setup step is complete. You can dismiss this card."),
    ).toBeInTheDocument();

    resetChecklist();
    expect(readChecklistState()).toEqual({ completed: [], dismissed: false });
  });

  it("navigates to task actionPath when action button is clicked and hides when dismissed", () => {
    const onDismiss = vi.fn();
    render(
      <MemoryRouter>
        <OnboardingChecklist onDismiss={onDismiss} />
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: new RegExp(DEFAULT_CHECKLIST_TASKS[0].actionLabel, "i") }),
    );
    expect(mockNavigate).toHaveBeenCalledWith(DEFAULT_CHECKLIST_TASKS[0].actionPath);

    fireEvent.click(screen.getByRole("button", { name: /dismiss onboarding checklist/i }));
    expect(onDismiss).toHaveBeenCalledOnce();
    expect(screen.queryByText("Get started with Navin")).not.toBeInTheDocument();
    expect(readChecklistState().dismissed).toBe(true);
  });
});
