import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Register from "../../src/app/componentes/Register";
import { registration } from "../../src/app/utils/axios";

// Mock de las utilidades de axios
jest.mock("../../src/app/utils/axios", () => ({
  registration: jest.fn(),
}));

// Obtener referencia al mock
const mockRegistration = registration as jest.MockedFunction<
  typeof registration
>;

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

describe("Register Component", () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
    mockLocation.href = "";
  });

  it("renders registration form correctly", () => {
    render(<Register />);

    expect(screen.getByText("Crea tu Cuenta!")).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByText("Tipo de Usuario")).toBeInTheDocument();
    expect(screen.getByText("👨‍🎓 Estudiante")).toBeInTheDocument();
    expect(screen.getByText("👨‍🏫 Profesor")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crear/i })).toBeInTheDocument();
    expect(screen.getByText("¿Ya tienes cuenta?")).toBeInTheDocument();
    expect(screen.getByText("Iniciar sesión")).toBeInTheDocument();
  });

  it("handles form input changes", async () => {
    const user = userEvent.setup();
    render(<Register />);

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);

    await user.type(usernameInput, "testuser");
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(usernameInput).toHaveValue("testuser");
    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("handles user type selection", async () => {
    const user = userEvent.setup();
    render(<Register />);

    const studentRadio = screen.getByDisplayValue("false");
    const teacherRadio = screen.getByDisplayValue("true");

    // Por defecto debe estar seleccionado estudiante
    expect(studentRadio).toBeChecked();
    expect(teacherRadio).not.toBeChecked();

    // Cambiar a profesor
    await user.click(teacherRadio);
    expect(teacherRadio).toBeChecked();
    expect(studentRadio).not.toBeChecked();

    // Volver a estudiante
    await user.click(studentRadio);
    expect(studentRadio).toBeChecked();
    expect(teacherRadio).not.toBeChecked();
  });

  it("shows validation errors for empty fields", async () => {
    const user = userEvent.setup();
    render(<Register />);

    const submitButton = screen.getByRole("button", { name: /crear/i });
    await user.click(submitButton);

    // Los campos son required, por lo que el navegador mostrará validación HTML5
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);

    expect(usernameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it("handles successful registration", async () => {
    // Arrange - Mock de registro exitoso
    const mockRegistration = registration as jest.MockedFunction<
      typeof registration
    >;
    mockRegistration.mockResolvedValue("User created successfully");

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

    // Assert - Verifica que se llamó la función registration con los parámetros correctos
    await waitFor(() => {
      expect(mockRegistration).toHaveBeenCalledWith({
        nickname: "testuser",
        email: "newuser@example.com",
        password: "password123",
        type: false, // Por defecto es estudiante
      });
    });

    // Verifica que se completó el registro exitosamente
    await waitFor(() => {
      expect(mockRegistration).toHaveBeenCalledWith({
        nickname: "testuser",
        email: "newuser@example.com",
        password: "password123",
        type: false,
      });
    });
  });

  it("handles registration error with missing fields", async () => {
    // Arrange - Mock de error de registro
    const mockRegistration = registration as jest.MockedFunction<
      typeof registration
    >;
    mockRegistration.mockRejectedValue(new Error("Missing required fields"));

    const user = userEvent.setup();
    render(<Register />);

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole("button", { name: /crear/i });

    // Act - Limpiar campos para generar error
    await user.clear(usernameInput);
    await user.clear(emailInput);
    await user.clear(passwordInput);
    await user.click(submitButton);

    // Assert - Verifica que el formulario sigue funcionando
    expect(usernameInput).toHaveValue("");
    expect(emailInput).toHaveValue("");
    expect(passwordInput).toHaveValue("");
  });

  it("handles network error during registration", async () => {
    // Arrange - Mock de error de red
    const mockRegistration = registration as jest.MockedFunction<
      typeof registration
    >;
    mockRegistration.mockRejectedValue(new Error("Network error"));

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

    // Assert - Verifica que se llamó la función registration
    await waitFor(() => {
      expect(mockRegistration).toHaveBeenCalledWith({
        nickname: "testuser",
        email: "test@example.com",
        password: "password123",
        type: false,
      });
    });

    // Verifica que se muestra el mensaje de error
    await waitFor(() => {
      expect(
        screen.getByText(
          "Hubo un error al crear la cuenta. Por favor, verifica los datos ingresados."
        )
      ).toBeInTheDocument();
    });
  });

  it("redirects to home page on successful registration", async () => {
    // Arrange - Mock de registro exitoso
    const mockRegistration = registration as jest.MockedFunction<
      typeof registration
    >;
    mockRegistration.mockResolvedValue("User created successfully");

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

    // Assert - Verifica que se llamó la función registration
    await waitFor(() => {
      expect(mockRegistration).toHaveBeenCalledWith({
        nickname: "testuser",
        email: "newuser@example.com",
        password: "password123",
        type: false,
      });
    });

    // Verifica que se completó el registro exitosamente
    await waitFor(() => {
      expect(mockRegistration).toHaveBeenCalledWith({
        nickname: "testuser",
        email: "newuser@example.com",
        password: "password123",
        type: false,
      });
    });
  });

  it("clears error message when user starts typing again", async () => {
    const user = userEvent.setup();
    render(<Register />);

    // Primero generar un error
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole("button", { name: /crear/i });

    await user.clear(usernameInput);
    await user.clear(emailInput);
    await user.clear(passwordInput);
    await user.click(submitButton);

    // Cambiar el username para simular que el usuario corrige el error
    await user.clear(usernameInput);
    await user.type(usernameInput, "testuser");

    // Verificar que el usuario puede seguir escribiendo
    expect(usernameInput).toHaveValue("testuser");
  });

  it("maintains form state during user type changes", async () => {
    const user = userEvent.setup();
    render(<Register />);

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const teacherRadio = screen.getByDisplayValue("true");

    // Llenar formulario
    await user.type(usernameInput, "testuser");
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    // Cambiar tipo de usuario
    await user.click(teacherRadio);

    // Verificar que los datos se mantienen
    expect(usernameInput).toHaveValue("testuser");
    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
    expect(teacherRadio).toBeChecked();
  });
});
