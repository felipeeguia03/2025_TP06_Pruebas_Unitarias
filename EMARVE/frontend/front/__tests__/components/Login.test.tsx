import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "../../src/app/componentes/Login";
import { login } from "../../src/app/utils/axios";

// Mock del módulo axios
jest.mock("../../src/app/utils/axios", () => ({
  login: jest.fn(),
}));

// Mock de window.location
const mockLocation = {
  href: "",
};
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

describe("Login Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.href = "";
  });

  it("renders login form correctly", () => {
    render(<Login />);

    expect(screen.getByText("Bienvenido a EMARVE!")).toBeInTheDocument();
    expect(
      screen.getByText("Ingresa para acceder a los mejores cursos")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ingresa" })).toBeInTheDocument();
    expect(screen.getByText("¿No tienes cuenta?")).toBeInTheDocument();
    expect(screen.getByText("Crear cuenta nueva")).toBeInTheDocument();
  });

  it("allows user to type in email and password fields", async () => {
    const user = userEvent.setup();
    render(<Login />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Contraseña");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("shows error message when login fails", async () => {
    const user = userEvent.setup();
    const mockLogin = login as jest.MockedFunction<typeof login>;
    mockLogin.mockRejectedValueOnce(new Error("Invalid credentials"));

    render(<Login />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Contraseña");
    const submitButton = screen.getByRole("button", { name: "Ingresa" });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "wrongpassword");
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Hubo un error al iniciar sesión. Por favor, verifica tus credenciales."
        )
      ).toBeInTheDocument();
    });
  });

  it("redirects to home page on successful login", async () => {
    const user = userEvent.setup();
    const mockLogin = login as jest.MockedFunction<typeof login>;
    mockLogin.mockResolvedValueOnce("mock-token-123");

    render(<Login />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Contraseña");
    const submitButton = screen.getByRole("button", { name: "Ingresa" });

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(mockLocation.href).toBe("/home");
    });
  });

  it("calls login function with correct parameters", async () => {
    const user = userEvent.setup();
    const mockLogin = login as jest.MockedFunction<typeof login>;
    mockLogin.mockResolvedValueOnce("mock-token-123");

    render(<Login />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Contraseña");
    const submitButton = screen.getByRole("button", { name: "Ingresa" });

    await user.type(emailInput, "user@test.com");
    await user.type(passwordInput, "mypassword");
    await user.click(submitButton);

    expect(mockLogin).toHaveBeenCalledWith({
      email: "user@test.com",
      password: "mypassword",
    });
  });

  it("prevents form submission with empty fields", async () => {
    const user = userEvent.setup();
    const mockLogin = login as jest.MockedFunction<typeof login>;

    render(<Login />);

    const submitButton = screen.getByRole("button", { name: "Ingresa" });
    await user.click(submitButton);

    // El formulario debería validar los campos requeridos
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("has proper accessibility attributes", () => {
    render(<Login />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Contraseña");

    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("required");
    expect(emailInput).toHaveAttribute("autoComplete", "email");

    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveAttribute("required");
    expect(passwordInput).toHaveAttribute("autoComplete", "current-password");
  });
});
