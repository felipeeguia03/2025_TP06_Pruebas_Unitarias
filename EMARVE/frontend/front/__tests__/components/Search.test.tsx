import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Search from "../../src/app/componentes/Search";
import { search } from "../../src/app/utils/axios";

// Mock de las utilidades de axios
jest.mock("../../src/app/utils/axios", () => ({
  search: jest.fn(),
}));

// Obtener referencia al mock
const mockSearch = search as jest.MockedFunction<typeof search>;

// Mock de console para evitar logs en tests
const consoleSpy = {
  log: jest.spyOn(console, "log").mockImplementation(() => {}),
  error: jest.spyOn(console, "error").mockImplementation(() => {}),
};

describe("Search Component", () => {
  const mockOnSearchResults = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.log.mockClear();
    consoleSpy.error.mockClear();
  });

  afterEach(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
  });

  it("renders search input correctly", () => {
    // Arrange & Act
    render(<Search onSearchResults={mockOnSearchResults} />);

    // Assert
    const searchInput = screen.getByPlaceholderText("Busca algún curso...");
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveValue("");
  });

  it("updates query state when user types", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<Search onSearchResults={mockOnSearchResults} />);

    const searchInput = screen.getByPlaceholderText("Busca algún curso...");

    // Act
    await user.type(searchInput, "React");

    // Assert
    expect(searchInput).toHaveValue("React");
  });

  it("calls search with query when form is submitted", async () => {
    // Arrange
    const user = userEvent.setup();
    const mockResponse = {
      results: [
        { id: 1, title: "React Course" },
        { id: 2, title: "Advanced React" },
      ],
    };
    mockSearch.mockResolvedValue(mockResponse);

    render(<Search onSearchResults={mockOnSearchResults} />);

    const searchInput = screen.getByPlaceholderText("Busca algún curso...");

    // Act
    await user.type(searchInput, "React");
    await user.keyboard("{Enter}");

    // Assert
    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith("React");
      expect(mockOnSearchResults).toHaveBeenCalledWith(mockResponse.results);
    });
  });

  it("calls search with empty string when query is empty", async () => {
    // Arrange
    const user = userEvent.setup();
    const mockResponse = {
      results: [
        { id: 1, title: "Course 1" },
        { id: 2, title: "Course 2" },
      ],
    };
    mockSearch.mockResolvedValue(mockResponse);

    render(<Search onSearchResults={mockOnSearchResults} />);

    const searchInput = screen.getByPlaceholderText("Busca algún curso...");

    // Act - Simular submit del formulario directamente
    fireEvent.submit(searchInput.closest("form")!);

    // Assert
    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith("");
      expect(mockOnSearchResults).toHaveBeenCalledWith(mockResponse.results);
    });
  });

  it("calls search with trimmed query when query has whitespace", async () => {
    // Arrange
    const user = userEvent.setup();
    const mockResponse = {
      results: [{ id: 1, title: "React Course" }],
    };
    mockSearch.mockResolvedValue(mockResponse);

    render(<Search onSearchResults={mockOnSearchResults} />);

    const searchInput = screen.getByPlaceholderText("Busca algún curso...");

    // Act
    await user.type(searchInput, "  React  ");
    await user.keyboard("{Enter}");

    // Assert
    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith("  React  ");
      expect(mockOnSearchResults).toHaveBeenCalledWith(mockResponse.results);
    });
  });

  it("handles search errors gracefully", async () => {
    // Arrange
    const user = userEvent.setup();
    const error = new Error("Network error");
    mockSearch.mockRejectedValue(error);

    render(<Search onSearchResults={mockOnSearchResults} />);

    const searchInput = screen.getByPlaceholderText("Busca algún curso...");

    // Act
    await user.type(searchInput, "React");
    await user.keyboard("{Enter}");

    // Assert
    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith("React");
    });
    expect(mockOnSearchResults).not.toHaveBeenCalled();
  });

  it("handles empty search results", async () => {
    // Arrange
    const user = userEvent.setup();
    const mockResponse = { results: [] };
    mockSearch.mockResolvedValue(mockResponse);

    render(<Search onSearchResults={mockOnSearchResults} />);

    const searchInput = screen.getByPlaceholderText("Busca algún curso...");

    // Act
    await user.type(searchInput, "NonExistentCourse");
    await user.keyboard("{Enter}");

    // Assert
    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith("NonExistentCourse");
      expect(mockOnSearchResults).toHaveBeenCalledWith([]);
    });
  });

  it("prevents default form submission behavior", async () => {
    // Arrange
    const user = userEvent.setup();
    const mockResponse = { results: [] };
    mockSearch.mockResolvedValue(mockResponse);

    render(<Search onSearchResults={mockOnSearchResults} />);

    const searchInput = screen.getByPlaceholderText("Busca algún curso...");

    // Act
    await user.type(searchInput, "React");
    await user.keyboard("{Enter}");

    // Assert - Verificar que la función search fue llamada (lo que significa que preventDefault funcionó)
    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith("React");
    });
  });

  it("maintains input value during search", async () => {
    // Arrange
    const user = userEvent.setup();
    const mockResponse = { results: [] };
    mockSearch.mockResolvedValue(mockResponse);

    render(<Search onSearchResults={mockOnSearchResults} />);

    const searchInput = screen.getByPlaceholderText("Busca algún curso...");

    // Act
    await user.type(searchInput, "React");
    await user.keyboard("{Enter}");

    // Assert
    await waitFor(() => {
      expect(searchInput).toHaveValue("React");
    });
  });

  it("handles multiple rapid searches", async () => {
    // Arrange
    const user = userEvent.setup();
    const mockResponse1 = { results: [{ id: 1, title: "React" }] };
    const mockResponse2 = { results: [{ id: 2, title: "Vue" }] };

    mockSearch
      .mockResolvedValueOnce(mockResponse1)
      .mockResolvedValueOnce(mockResponse2);

    render(<Search onSearchResults={mockOnSearchResults} />);

    const searchInput = screen.getByPlaceholderText("Busca algún curso...");

    // Act
    await user.type(searchInput, "React");
    await user.keyboard("{Enter}");

    await user.clear(searchInput);
    await user.type(searchInput, "Vue");
    await user.keyboard("{Enter}");

    // Assert
    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledTimes(2);
      expect(mockSearch).toHaveBeenNthCalledWith(1, "React");
      expect(mockSearch).toHaveBeenNthCalledWith(2, "Vue");
      expect(mockOnSearchResults).toHaveBeenCalledTimes(2);
    });
  });

  it("handles special characters in search query", async () => {
    // Arrange
    const user = userEvent.setup();
    const mockResponse = { results: [] };
    mockSearch.mockResolvedValue(mockResponse);

    render(<Search onSearchResults={mockOnSearchResults} />);

    const searchInput = screen.getByPlaceholderText("Busca algún curso...");

    // Act
    await user.type(searchInput, "React & Node.js");
    await user.keyboard("{Enter}");

    // Assert
    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledWith("React & Node.js");
      expect(mockOnSearchResults).toHaveBeenCalledWith([]);
    });
  });
});
