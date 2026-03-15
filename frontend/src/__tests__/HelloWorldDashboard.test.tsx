import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HelloWorldDashboard from "~/components/HelloWorldDashboard";

const mockMessage = {
  id: "abc123",
  content: "Hello World",
  createdAt: new Date().toISOString(),
};

vi.mock("~/lib/api-client", () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue([mockMessage]),
    post: vi.fn().mockResolvedValue(mockMessage),
  },
}));

import { apiClient } from "~/lib/api-client";

const mockGet = apiClient.get as ReturnType<typeof vi.fn>;
const mockPost = apiClient.post as ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockGet.mockResolvedValue([mockMessage]);
  mockPost.mockResolvedValue(mockMessage);
});

describe("HelloWorldDashboard", () => {
  it("renders the dashboard header", async () => {
    render(<HelloWorldDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Webapp Scaffold")).toBeInTheDocument();
    });
  });

  it("displays messages after loading", async () => {
    render(<HelloWorldDashboard />);
    await waitFor(() => {
      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });
  });

  it("renders the create message button", async () => {
    render(<HelloWorldDashboard />);
    await waitFor(() => {
      expect(
        screen.getByText("Create Hello World Message"),
      ).toBeInTheDocument();
    });
  });

  it("shows success notification after creating a message", async () => {
    const user = userEvent.setup();
    render(<HelloWorldDashboard />);

    await waitFor(() =>
      expect(screen.getByText("Create Hello World Message")).toBeInTheDocument(),
    );

    await user.click(screen.getByText("Create Hello World Message"));

    await waitFor(() => {
      expect(
        screen.getByText("Message created successfully!"),
      ).toBeInTheDocument();
    });
  });

  it("shows error notification when create fails", async () => {
    const user = userEvent.setup();
    mockPost.mockRejectedValueOnce(new Error("Server error"));

    render(<HelloWorldDashboard />);

    await waitFor(() =>
      expect(screen.getByText("Create Hello World Message")).toBeInTheDocument(),
    );

    await user.click(screen.getByText("Create Hello World Message"));

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });
});
