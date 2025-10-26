import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Navbar from "../../src/app/componentes/Navbar";
import { userAuthentication, logout } from "../../src/app/utils/axios";

// Mock de las utilidades de axios
jest.mock("../../src/app/utils/axios", () => ({
  userAuthentication: jest.fn(),
  logout: jest.fn(),
}));

// Mock del componente Search
jest.mock("../../src/app/componentes/Search", () => {
  return function MockSearch({
    onSearchResults,
  }: {
    onSearchResults: (courses: any[]) => void;
  }) {
    return (
      <div data-testid="search-component">
        <button onClick={() => onSearchResults([])}>Mock Search</button>
      </div>
    );
  };
});

// Mock de Next.js Link
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

describe("Navbar Component", () => {
  const mockOnSearchResults = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render basic navbar elements", () => {
    render(<Navbar onSearchResults={mockOnSearchResults} />);

    expect(screen.getByText("Cerrar Sesión")).toBeInTheDocument();
    expect(screen.getByText("Todos los Cursos")).toBeInTheDocument();
    expect(screen.getByText("Mis Cursos")).toBeInTheDocument();
    expect(screen.getByTestId("search-component")).toBeInTheDocument();
  });

  it("should call logout when logout button is clicked", () => {
    render(<Navbar onSearchResults={mockOnSearchResults} />);

    const logoutButton = screen.getByText("Cerrar Sesión");
    fireEvent.click(logoutButton);

    expect(logout).toHaveBeenCalled();
  });

  it("should have correct navigation links", () => {
    render(<Navbar onSearchResults={mockOnSearchResults} />);

    const todosCursosLink = screen.getByText("Todos los Cursos").closest("a");
    const misCursosLink = screen.getByText("Mis Cursos").closest("a");

    expect(todosCursosLink).toHaveAttribute("href", "/home");
    expect(misCursosLink).toHaveAttribute("href", "/myCourses");
  });

  it("should show create course button for admin users", async () => {
    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn((key) => (key === "tokenType" ? "test-token" : null)),
    };
    Object.defineProperty(window, "localStorage", { value: mockLocalStorage });

    (userAuthentication as jest.Mock).mockResolvedValue("admin");

    render(<Navbar onSearchResults={mockOnSearchResults} />);

    await waitFor(() => {
      expect(screen.getByText("Crear Curso")).toBeInTheDocument();
    });
  });

  it("should not show create course button for student users", async () => {
    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn((key) => (key === "tokenType" ? "test-token" : null)),
    };
    Object.defineProperty(window, "localStorage", { value: mockLocalStorage });

    (userAuthentication as jest.Mock).mockResolvedValue("student");

    render(<Navbar onSearchResults={mockOnSearchResults} />);

    await waitFor(() => {
      expect(screen.queryByText("Crear Curso")).not.toBeInTheDocument();
    });
  });
});
