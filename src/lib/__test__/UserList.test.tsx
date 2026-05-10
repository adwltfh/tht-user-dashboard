import { render, screen, waitFor } from "@testing-library/react";
import fetchMock from "jest-fetch-mock";
import { useRouter, useSearchParams } from "next/navigation";
import UsersPage from "@/app/users/page";
import { createWrapper } from "@/test-utils/wrapper";
import { mockUsers, mockPosts, mockTodos } from "@/test-utils/mocks";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

beforeEach(() => {
  fetchMock.resetMocks();
  (useRouter as jest.Mock).mockReturnValue({
    push: jest.fn(),
    replace: jest.fn(),
  });
  (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
});

function setupFetchMocks() {
  fetchMock.mockResponse((req) => {
    if (req.url.includes("/users")) {
      return Promise.resolve(JSON.stringify(mockUsers));
    }
    if (req.url.includes("/posts")) {
      return Promise.resolve(JSON.stringify(mockPosts));
    }
    if (req.url.includes("/todos")) {
      return Promise.resolve(JSON.stringify(mockTodos));
    }
    return Promise.resolve(JSON.stringify([]));
  });
}

describe("UsersPage", () => {
  it("shows skeleton while loading", () => {
    fetchMock.mockResponseOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ body: JSON.stringify(mockUsers) }), 500),
        ),
    );
    render(<UsersPage />, { wrapper: createWrapper() });

    const skeletons = document.querySelectorAll(
      '.animate-pulse, [data-slot="skeleton"]',
    );
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders users with name and email", async () => {
    setupFetchMocks();
    render(<UsersPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getAllByText("Leanne Graham").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Ervin Howell").length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText("Sincere@april.biz").length).toBeGreaterThan(0);
  });

  it("shows error state when fetch fails", async () => {
    fetchMock.mockRejectOnce(new Error("Network error"));
    render(<UsersPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByText(/failed to load users/i)).toBeInTheDocument();
  });

  it("filters users by name search", async () => {
    setupFetchMocks();
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("q=Leanne"),
    );
    render(<UsersPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getAllByText("Leanne Graham").length).toBeGreaterThan(0);
    });
    expect(screen.queryByText("Ervin Howell")).not.toBeInTheDocument();
  });

  it("filters users by email search", async () => {
    setupFetchMocks();
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("q=shanna"),
    );
    render(<UsersPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getAllByText("Ervin Howell").length).toBeGreaterThan(0);
    });
    expect(screen.queryByText("Leanne Graham")).not.toBeInTheDocument();
  });

  it("shows empty state when no users match search", async () => {
    setupFetchMocks();
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("q=xyznonexistent"),
    );
    render(<UsersPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getAllByText(/no users match/i).length).toBeGreaterThan(0);
    });
  });

  it("shows all users when search is cleared", async () => {
    setupFetchMocks();

    render(<UsersPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getAllByText("Leanne Graham").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Ervin Howell").length).toBeGreaterThan(0);
    });
  });

  it("sorts users by name ascending then descending", async () => {
    setupFetchMocks();
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("sort=name-asc"),
    );
    const { rerender } = render(<UsersPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getAllByText("Leanne Graham").length).toBeGreaterThan(0);
    });

    const rowsAsc = screen.getAllByRole("row");
    expect(rowsAsc[1]).toHaveTextContent("Ervin Howell");

    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams("sort=name-desc"),
    );
    rerender(<UsersPage />);

    await waitFor(() => {
      const rowsDesc = screen.getAllByRole("row");
      expect(rowsDesc[1]).toHaveTextContent("Leanne Graham");
    });
  });

  it("shows activity signals per user (posts, todos)", async () => {
    setupFetchMocks();
    render(<UsersPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getAllByText("Leanne Graham").length).toBeGreaterThan(0);
    });

    await waitFor(() => {
      expect(screen.getAllByText(/2 posts/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/1 pending/i).length).toBeGreaterThan(0);
    });
  });
});
