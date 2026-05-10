import { render, screen } from "@testing-library/react";
import fetchMock from "jest-fetch-mock";
import { notFound } from "next/navigation";
import UserDetailPage from "@/app/users/[id]/page";
import { createWrapper } from "@/test-utils/wrapper";
import { mockUsers, mockPosts, mockTodos } from "@/test-utils/mocks";

jest.mock("next/navigation", () => ({
  notFound: jest.fn().mockImplementation(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

beforeEach(() => {
  fetchMock.resetMocks();
  (notFound as unknown as jest.Mock).mockClear();
});

function setupFetchMocks(userId = 1) {
  const user = mockUsers.find((u) => u.id === userId);
  fetchMock.mockResponse((req) => {
    if (req.url.includes(`/users/${userId}`)) {
      return Promise.resolve(JSON.stringify(user));
    }
    if (req.url.includes("/posts")) {
      return Promise.resolve(JSON.stringify(mockPosts));
    }
    if (req.url.includes("/todos")) {
      return Promise.resolve(JSON.stringify(mockTodos));
    }
    return Promise.resolve(JSON.stringify({}));
  });
}

async function renderPage(id: string) {
  const ui = await UserDetailPage({ params: Promise.resolve({ id }) });
  return render(ui, { wrapper: createWrapper() });
}

describe("UserDetailPage", () => {
  it("renders the user page card", async () => {
    setupFetchMocks(1);
    await renderPage("1");
    expect(screen.getByText("Leanne Graham")).toBeInTheDocument();
  });

  it("renders user details correctly", async () => {
    setupFetchMocks(1);
    await renderPage("1");

    expect(screen.getByText("Leanne Graham")).toBeInTheDocument();
    expect(screen.getByText("@Bret")).toBeInTheDocument();
    expect(screen.getByText("Sincere@april.biz")).toBeInTheDocument();
    expect(screen.getByText("1-770-736-8031")).toBeInTheDocument();
    expect(screen.getByText("Romaguera-Crona")).toBeInTheDocument();
    expect(screen.getByText("Gwenborough")).toBeInTheDocument();
  });

  it("renders back to list link", async () => {
    setupFetchMocks(1);
    await renderPage("1");

    const backLink = screen.getByRole("link", { name: /back to list/i });
    expect(backLink).toHaveAttribute("href", "/users");
  });

  it("shows error alert when posts fetch fails", async () => {
    const user = mockUsers[0];
    fetchMock.mockResponse((req) => {
      if (req.url.includes("/posts")) {
        return Promise.reject(new Error("Network error"));
      }
      if (req.url.includes("/todos")) {
        return Promise.resolve(JSON.stringify(mockTodos));
      }
      return Promise.resolve(JSON.stringify(user));
    });

    await renderPage("1");
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("calls notFound for invalid user id", async () => {
    await expect(
      UserDetailPage({ params: Promise.resolve({ id: "abc" }) }),
    ).rejects.toThrow();
    expect(notFound).toHaveBeenCalled();
  });

  it("calls notFound for non-existent user", async () => {
    fetchMock.mockResponseOnce("", { status: 404 });
    await expect(
      UserDetailPage({ params: Promise.resolve({ id: "999" }) }),
    ).rejects.toThrow();
    expect(notFound).toHaveBeenCalled();
  });

  it("renders user's posts section", async () => {
    setupFetchMocks(1);
    await renderPage("1");

    expect(screen.getAllByText(/posts/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Post one")).toBeInTheDocument();
    expect(screen.getByText("Post two")).toBeInTheDocument();
  });

  it("renders user's todos section", async () => {
    setupFetchMocks(1);
    await renderPage("1");

    expect(screen.getAllByText(/todos/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Todo two")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /completed/i }),
    ).toBeInTheDocument();
  });
});
