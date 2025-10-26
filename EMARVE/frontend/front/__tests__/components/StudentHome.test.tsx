import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StudentHome from "../../src/app/componentes/StudentHome";
import {
  getCourses,
  getUserId,
  subscribe,
  userAuthentication,
} from "../../src/app/utils/axios";
import { course } from "../../src/app/componentes/StudentHome";

// Mock de las utilidades de axios
jest.mock("../../src/app/utils/axios", () => ({
  getCourses: jest.fn(),
  getUserId: jest.fn(),
  subscribe: jest.fn(),
  userAuthentication: jest.fn(),
}));

// Mock del componente Navbar
jest.mock("../../src/app/componentes/Navbar", () => {
  return function MockNavbar({
    onSearchResults,
  }: {
    onSearchResults: (courses: course[]) => void;
  }) {
    return (
      <div data-testid="navbar">
        <button
          onClick={() =>
            onSearchResults([
              {
                id: 100,
                title: "Mocked Search Course",
                description: "",
                category: "",
                instructor: "",
                duration: 0,
                requirement: "",
              },
            ])
          }
        >
          Mock Search
        </button>
      </div>
    );
  };
});

// Mock del componente Curso
jest.mock("../../src/app/componentes/Curso", () => {
  return function MockCurso({
    id,
    title,
    description,
    category,
    instructor,
    duration,
    requirement,
    handleSubscribe,
    message,
  }: any) {
    return (
      <div data-testid={`curso-${id}`}>
        <span>{title}</span>
        <span>{description}</span>
        <span>{category}</span>
        <span>{instructor}</span>
        <span>{duration} Semanas</span>
        <span>{requirement}</span>
        {handleSubscribe && message === "Inscribirse" && (
          <button onClick={() => handleSubscribe(id)}>{message}</button>
        )}
      </div>
    );
  };
});

// Obtener referencias a los mocks
const mockGetCourses = getCourses as jest.MockedFunction<typeof getCourses>;
const mockGetUserId = getUserId as jest.MockedFunction<typeof getUserId>;
const mockSubscribe = subscribe as jest.MockedFunction<typeof subscribe>;
const mockUserAuthentication = userAuthentication as jest.MockedFunction<
  typeof userAuthentication
>;

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock de console para evitar logs en tests
const consoleSpy = {
  log: jest.spyOn(console, "log").mockImplementation(() => {}),
  error: jest.spyOn(console, "error").mockImplementation(() => {}),
};

// Mock de alert
const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

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

// Mock de FontAwesome
jest.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: ({ icon, className }: { icon: any; className: string }) => (
    <span className={className} data-testid="fontawesome-icon" />
  ),
}));

jest.mock("@fortawesome/free-solid-svg-icons", () => ({
  faExclamationTriangle: "exclamation-triangle",
  faHome: "home",
  faBook: "book",
}));

describe("StudentHome Component", () => {
  const mockCourses = [
    {
      id: 1,
      title: "React Fundamentals",
      description: "Learn React from scratch",
      category: "Programming",
      instructor: "John Doe",
      duration: 8,
      requirement: "Basic JavaScript knowledge",
    },
    {
      id: 2,
      title: "Node.js Backend",
      description: "Build backend applications with Node.js",
      category: "Backend",
      instructor: "Jane Smith",
      duration: 12,
      requirement: "JavaScript and SQL knowledge",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.log.mockClear();
    consoleSpy.error.mockClear();
    alertSpy.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  afterEach(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
    alertSpy.mockRestore();
  });

  it("renders StudentHome component correctly", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);
    mockGetUserId.mockResolvedValue(123);
    localStorageMock.getItem.mockReturnValue("mock-token");

    // Act
    render(<StudentHome />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("React Fundamentals")).toBeInTheDocument();
      expect(screen.getByText("Node.js Backend")).toBeInTheDocument();
    });
  });

  it("fetches user ID on component mount", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);
    mockGetUserId.mockResolvedValue(123);
    localStorageMock.getItem.mockReturnValue("mock-token");

    // Act
    render(<StudentHome />);

    // Assert
    await waitFor(() => {
      expect(mockGetUserId).toHaveBeenCalledWith("mock-token");
      expect(localStorageMock.setItem).toHaveBeenCalledWith("userId", 123);
    });
  });

  it("fetches courses on component mount", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);
    mockGetUserId.mockResolvedValue(123);
    localStorageMock.getItem.mockReturnValue("mock-token");

    // Act
    render(<StudentHome />);

    // Assert
    await waitFor(() => {
      expect(mockGetCourses).toHaveBeenCalled();
    });
  });

  it("displays courses when available", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);
    mockGetUserId.mockResolvedValue(123);
    localStorageMock.getItem.mockReturnValue("mock-token");

    // Act
    render(<StudentHome />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("React Fundamentals")).toBeInTheDocument();
      expect(screen.getByText("Learn React from scratch")).toBeInTheDocument();
      expect(screen.getByText("Programming")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("8 Semanas")).toBeInTheDocument();
      expect(
        screen.getByText("Basic JavaScript knowledge")
      ).toBeInTheDocument();
    });
  });

  it("displays no courses message when no courses available", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue([]);
    mockGetUserId.mockResolvedValue(123);
    localStorageMock.getItem.mockReturnValue("mock-token");

    // Act
    render(<StudentHome />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("No se encontraron cursos")).toBeInTheDocument();
      expect(screen.getAllByTestId("fontawesome-icon")).toHaveLength(1); // Solo el icono de warning
    });
  });

  it("handles successful course subscription", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);
    mockGetUserId.mockResolvedValue(123);
    mockSubscribe.mockResolvedValue("Success");
    localStorageMock.getItem.mockReturnValue("mock-token");

    const user = userEvent.setup();
    render(<StudentHome />);

    // Act
    await waitFor(() => {
      expect(screen.getAllByText("Inscribirse")).toHaveLength(2);
    });

    const subscribeButton = screen.getAllByText("Inscribirse")[0];
    await user.click(subscribeButton);

    // Assert
    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalledWith({
        user_id: 123,
        course_id: 1,
      });
      // Verificar que la función subscribe fue llamada correctamente
      expect(mockSubscribe).toHaveBeenCalledTimes(1);
    });
  });

  it("handles subscription error when already enrolled", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);
    mockGetUserId.mockResolvedValue(123);
    const error = {
      response: { status: 409 },
    };
    mockSubscribe.mockRejectedValue(error);
    localStorageMock.getItem.mockReturnValue("mock-token");

    const user = userEvent.setup();
    render(<StudentHome />);

    // Act
    await waitFor(() => {
      expect(screen.getAllByText("Inscribirse")).toHaveLength(2);
    });

    const subscribeButton = screen.getAllByText("Inscribirse")[0];
    await user.click(subscribeButton);

    // Assert
    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalledWith({
        user_id: 123,
        course_id: 1,
      });
      // Verificar que la función subscribe fue llamada correctamente
      expect(mockSubscribe).toHaveBeenCalledTimes(1);
    });
  });

  it("handles subscription error for other cases", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);
    mockGetUserId.mockResolvedValue(123);
    const error = new Error("Network error");
    mockSubscribe.mockRejectedValue(error);
    localStorageMock.getItem.mockReturnValue("mock-token");

    const user = userEvent.setup();
    render(<StudentHome />);

    // Act
    await waitFor(() => {
      expect(screen.getAllByText("Inscribirse")).toHaveLength(2);
    });

    const subscribeButton = screen.getAllByText("Inscribirse")[0];
    await user.click(subscribeButton);

    // Assert
    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalledWith({
        user_id: 123,
        course_id: 1,
      });
      // No alert should be shown for other errors
      expect(alertSpy).not.toHaveBeenCalled();
    });
  });

  it("handles error when fetching user ID", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);
    mockGetUserId.mockRejectedValue(new Error("Token invalid"));
    localStorageMock.getItem.mockReturnValue("invalid-token");

    // Act
    render(<StudentHome />);

    // Assert
    await waitFor(() => {
      expect(mockGetUserId).toHaveBeenCalledWith("invalid-token");
    });
  });

  it("handles error when fetching courses", async () => {
    // Arrange
    mockGetCourses.mockRejectedValue(new Error("Network error"));
    mockGetUserId.mockResolvedValue(123);
    localStorageMock.getItem.mockReturnValue("mock-token");

    // Act
    render(<StudentHome />);

    // Assert
    await waitFor(() => {
      expect(mockGetCourses).toHaveBeenCalled();
    });
  });

  it("does not fetch user ID when no token is available", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);
    localStorageMock.getItem.mockReturnValue(null);

    // Act
    render(<StudentHome />);

    // Assert
    await waitFor(() => {
      expect(mockGetCourses).toHaveBeenCalled();
    });
    // No se debe llamar getUserId si no hay token
    expect(mockGetUserId).not.toHaveBeenCalled();
  });

  it("updates courses when search results are received", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);
    mockGetUserId.mockResolvedValue(123);
    localStorageMock.getItem.mockReturnValue("mock-token");

    render(<StudentHome />);

    // Act - Simular que se reciben resultados de búsqueda
    await waitFor(() => {
      expect(screen.getByText("React Fundamentals")).toBeInTheDocument();
    });

    // Simular la función handleSearchResults usando el botón mock del navbar
    const mockSearchButton = screen.getByText("Mock Search");
    await userEvent.click(mockSearchButton);

    // Assert - Verificar que se actualizaron los cursos
    await waitFor(() => {
      expect(screen.getByText("Mocked Search Course")).toBeInTheDocument();
    });
  });

  it("renders course cards with correct information", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);
    mockGetUserId.mockResolvedValue(123);
    localStorageMock.getItem.mockReturnValue("mock-token");

    // Act
    render(<StudentHome />);

    // Assert
    await waitFor(() => {
      // Verificar que se renderizan ambos cursos
      expect(screen.getByText("React Fundamentals")).toBeInTheDocument();
      expect(screen.getByText("Node.js Backend")).toBeInTheDocument();

      // Verificar que se muestran los botones de inscripción
      const subscribeButtons = screen.getAllByText("Inscribirse");
      expect(subscribeButtons).toHaveLength(2);
    });
  });

  it("handles multiple course subscriptions", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);
    mockGetUserId.mockResolvedValue(123);
    mockSubscribe.mockResolvedValue("Success");
    localStorageMock.getItem.mockReturnValue("mock-token");

    const user = userEvent.setup();
    render(<StudentHome />);

    // Act
    await waitFor(() => {
      expect(screen.getAllByText("Inscribirse")).toHaveLength(2);
    });

    const subscribeButtons = screen.getAllByText("Inscribirse");

    // Suscribirse al primer curso
    await user.click(subscribeButtons[0]);

    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalledWith({
        user_id: 123,
        course_id: 1,
      });
    });

    // Suscribirse al segundo curso
    await user.click(subscribeButtons[1]);

    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalledWith({
        user_id: 123,
        course_id: 2,
      });
    });

    // Assert
    expect(mockSubscribe).toHaveBeenCalledTimes(2);
    // Verificar que ambas suscripciones fueron llamadas con los parámetros correctos
    expect(mockSubscribe).toHaveBeenNthCalledWith(1, {
      user_id: 123,
      course_id: 1,
    });
    expect(mockSubscribe).toHaveBeenNthCalledWith(2, {
      user_id: 123,
      course_id: 2,
    });
  });

  it("displays correct course duration format", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);
    mockGetUserId.mockResolvedValue(123);
    localStorageMock.getItem.mockReturnValue("mock-token");

    // Act
    render(<StudentHome />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("8 Semanas")).toBeInTheDocument();
      expect(screen.getByText("12 Semanas")).toBeInTheDocument();
    });
  });

  it("renders navbar with search functionality", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);
    mockGetUserId.mockResolvedValue(123);
    localStorageMock.getItem.mockReturnValue("mock-token");

    // Act
    render(<StudentHome />);

    // Assert
    await waitFor(() => {
      // Verificar que el navbar está presente
      expect(screen.getByTestId("navbar")).toBeInTheDocument();
      expect(screen.getByText("Mock Search")).toBeInTheDocument();
    });
  });
});
