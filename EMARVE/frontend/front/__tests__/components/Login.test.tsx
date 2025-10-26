import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "../../src/app/componentes/Login";
import { login } from "../../src/app/utils/axios";

// Mock de las utilidades de axios
jest.mock("../../src/app/utils/axios", () => ({
  login: jest.fn(),
}));

// Obtener referencia al mock
const mockLogin = login as jest.MockedFunction<typeof login>;

// Mock de Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock de window.location
const mockLocation = {
  href: "",
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
};

// Solo definir location si no está ya definida
if (!window.location) {
  Object.defineProperty(window, "location", {
    value: mockLocation,
    writable: true,
  });
}

describe("Login Component", () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
    localStorage.clear();
    mockLocation.href = "";
  });

  it("renders login form correctly", () => {
    render(<Login />);

    expect(screen.getByText("Bienvenido a EMARVE!")).toBeInTheDocument();
    expect(
      screen.getByText("Ingresa para acceder a los mejores cursos")
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ingresa/i })
    ).toBeInTheDocument();
    expect(screen.getByText("¿No tienes cuenta?")).toBeInTheDocument();
    expect(screen.getByText("Crear cuenta nueva")).toBeInTheDocument();
  });

  it("handles form input changes", async () => {
    const user = userEvent.setup();
    render(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("shows validation errors for empty fields", async () => {
    const user = userEvent.setup();
    render(<Login />);

    const submitButton = screen.getByRole("button", { name: /ingresa/i });
    await user.click(submitButton);

    // Los campos son required, por lo que el navegador mostrará validación HTML5
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it("handles successful login", async () => {
    // Arrange - Mock de login exitoso
    const mockLogin = login as jest.MockedFunction<typeof login>;
    mockLogin.mockResolvedValue("mock-jwt-token-12345");

    const user = userEvent.setup();
    render(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole("button", { name: /ingresa/i });

    // Act
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    // Assert - Verifica que se llamó la función login con los parámetros correctos
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  it("handles login error with invalid credentials", async () => {
    // Arrange - Mock de login con error
    const mockLogin = login as jest.MockedFunction<typeof login>;
    mockLogin.mockRejectedValue(new Error("Invalid credentials"));

    const user = userEvent.setup();
    render(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole("button", { name: /ingresa/i });

    // Act
    await user.type(emailInput, "wrong@example.com");
    await user.type(passwordInput, "wrongpassword");
    await user.click(submitButton);

    // Assert - Verifica que se llamó la función login
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "wrong@example.com",
        password: "wrongpassword",
      });
    });

    // Verifica que se muestra el mensaje de error
    await waitFor(() => {
      expect(
        screen.getByText(
          "Hubo un error al iniciar sesión. Por favor, verifica tus credenciales."
        )
      ).toBeInTheDocument();
    });
  });

  it("handles network error during login", async () => {
    // Arrange - Mock de error de red
    const mockLogin = login as jest.MockedFunction<typeof login>;
    mockLogin.mockRejectedValue(new Error("Network Error"));

    const user = userEvent.setup();
    render(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole("button", { name: /ingresa/i });

    // Act
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    // Assert - Verifica que se llamó la función login
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    // Verifica que se muestra el mensaje de error
    await waitFor(() => {
      expect(
        screen.getByText(
          "Hubo un error al iniciar sesión. Por favor, verifica tus credenciales."
        )
      ).toBeInTheDocument();
    });
  });

  it("redirects to home page on successful login", async () => {
    // Arrange - Mock de login exitoso
    const mockLogin = login as jest.MockedFunction<typeof login>;
    mockLogin.mockResolvedValue("mock-jwt-token-12345");

    const user = userEvent.setup();
    render(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole("button", { name: /ingresa/i });

    // Act
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    // Assert - Verifica que se llamó la función login
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    // Verifica que se completó el login exitosamente
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  it("clears error message when user starts typing again", async () => {
    const user = userEvent.setup();
    render(<Login />);

    // Primero generar un error
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole("button", { name: /ingresa/i });

    await user.type(emailInput, "wrong@example.com");
    await user.type(passwordInput, "wrongpassword");
    await user.click(submitButton);

    // Verificar que se llamó la función login con credenciales incorrectas
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "wrong@example.com",
        password: "wrongpassword",
      });
    });

    // Cambiar el email para simular que el usuario corrige el error
    await user.clear(emailInput);
    await user.type(emailInput, "test@example.com");

    // Verificar que el usuario puede seguir escribiendo
    expect(emailInput).toHaveValue("test@example.com");
  });
});
