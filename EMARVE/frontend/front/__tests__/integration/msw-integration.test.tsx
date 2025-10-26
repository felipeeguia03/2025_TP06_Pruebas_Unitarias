import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../../src/mocks/server";
import Login from "../../src/app/componentes/Login";
import Register from "../../src/app/componentes/Register";
import Search from "../../src/app/componentes/Search";

// Mock de Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

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

describe("MSW Integration Tests", () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
  });

  describe("Login Component with MSW", () => {
    it("should login successfully with valid credentials using MSW", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole("button", { name: /ingresa/i });

      // Act
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText("Login successful, token:")
        ).toBeInTheDocument();
      });
    });

    it("should handle login error with invalid credentials using MSW", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole("button", { name: /ingresa/i });

      // Act
      await user.type(emailInput, "invalid@example.com");
      await user.type(passwordInput, "wrongpassword");
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/error al iniciar sesión/i)
        ).toBeInTheDocument();
      });
    });

    it("should handle network error using MSW", async () => {
      // Arrange - Override MSW handler to simulate network error
      server.use(
        http.post("/users/login", () => {
          return HttpResponse.error();
        })
      );

      const user = userEvent.setup();
      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole("button", { name: /ingresa/i });

      // Act
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/error al iniciar sesión/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Register Component with MSW", () => {
    it("should register successfully with valid data using MSW", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<Register />);

      const usernameInput = screen.getByLabelText(/username/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole("button", { name: /crear/i });

      // Act
      await user.type(usernameInput, "testuser");
      await user.type(emailInput, "newuser@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText("Registration successful, token:")
        ).toBeInTheDocument();
      });
    });

    it("should handle registration error with missing fields using MSW", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<Register />);

      const submitButton = screen.getByRole("button", { name: /crear/i });

      // Act - Submit without filling fields
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/error al registrarse/i)).toBeInTheDocument();
      });
    });
  });

  describe("Search Component with MSW", () => {
    it("should search courses successfully using MSW", async () => {
      // Arrange
      const mockOnSearchResults = jest.fn();
      const user = userEvent.setup();
      render(<Search onSearchResults={mockOnSearchResults} />);

      const searchInput = screen.getByPlaceholderText("Busca algún curso...");

      // Act
      await user.type(searchInput, "React");
      await user.keyboard("{Enter}");

      // Assert
      await waitFor(() => {
        expect(mockOnSearchResults).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              title: "React Fundamentals",
            }),
          ])
        );
      });
    });

    it("should handle search with empty query using MSW", async () => {
      // Arrange
      const mockOnSearchResults = jest.fn();
      const user = userEvent.setup();
      render(<Search onSearchResults={mockOnSearchResults} />);

      const searchInput = screen.getByPlaceholderText("Busca algún curso...");

      // Act
      await user.keyboard("{Enter}");

      // Assert
      await waitFor(() => {
        expect(mockOnSearchResults).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              title: "React Fundamentals",
            }),
          ])
        );
      });
    });

    it("should handle search error using MSW", async () => {
      // Arrange - Override MSW handler to simulate error
      server.use(
        http.get("/courses/search", () => {
          return HttpResponse.error();
        })
      );

      const mockOnSearchResults = jest.fn();
      const user = userEvent.setup();
      render(<Search onSearchResults={mockOnSearchResults} />);

      const searchInput = screen.getByPlaceholderText("Busca algún curso...");

      // Act
      await user.type(searchInput, "React");
      await user.keyboard("{Enter}");

      // Assert
      await waitFor(() => {
        expect(mockOnSearchResults).not.toHaveBeenCalled();
      });
    });
  });

  describe("Dynamic MSW Handler Overrides", () => {
    it("should allow dynamic handler overrides for specific tests", async () => {
      // Arrange - Override handler for this specific test
      server.use(
        http.get("/courses", () => {
          return HttpResponse.json({
            results: [
              {
                id: 999,
                title: "Custom Course",
                description: "This is a custom course for testing",
                category: "Testing",
                instructor: "Test Instructor",
                duration: 60,
                requirement: "No requirements",
              },
            ],
          });
        })
      );

      const mockOnSearchResults = jest.fn();
      const user = userEvent.setup();
      render(<Search onSearchResults={mockOnSearchResults} />);

      const searchInput = screen.getByPlaceholderText("Busca algún curso...");

      // Act
      await user.keyboard("{Enter}");

      // Assert
      await waitFor(() => {
        expect(mockOnSearchResults).toHaveBeenCalledWith([
          expect.objectContaining({
            id: 999,
            title: "Custom Course",
          }),
        ]);
      });
    });

    it("should reset handlers after each test", async () => {
      // This test should use the default handlers, not the custom ones from the previous test
      const mockOnSearchResults = jest.fn();
      const user = userEvent.setup();
      render(<Search onSearchResults={mockOnSearchResults} />);

      const searchInput = screen.getByPlaceholderText("Busca algún curso...");

      // Act
      await user.keyboard("{Enter}");

      // Assert - Should get default results, not custom ones
      await waitFor(() => {
        expect(mockOnSearchResults).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              title: "React Fundamentals", // Default handler result
            }),
          ])
        );
      });
    });
  });

  describe("MSW Error Handling", () => {
    it("should handle 401 unauthorized responses", async () => {
      // Arrange
      server.use(
        http.get("/users/authentication", () => {
          return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
        })
      );

      const user = userEvent.setup();
      render(<Login />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole("button", { name: /ingresa/i });

      // Act
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/error al iniciar sesión/i)
        ).toBeInTheDocument();
      });
    });

    it("should handle 400 bad request responses", async () => {
      // Arrange
      server.use(
        http.post("/users/register", () => {
          return HttpResponse.json({ error: "Bad Request" }, { status: 400 });
        })
      );

      const user = userEvent.setup();
      render(<Register />);

      const usernameInput = screen.getByLabelText(/username/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/contraseña/i);
      const submitButton = screen.getByRole("button", { name: /crear/i });

      // Act
      await user.type(usernameInput, "testuser");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/error al registrarse/i)).toBeInTheDocument();
      });
    });
  });
});
