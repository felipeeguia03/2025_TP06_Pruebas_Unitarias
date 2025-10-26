import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminHome from "../../src/app/componentes/AdminHome";
import {
  getCourses,
  deleteCourse,
  updateCourse,
  createCourse,
} from "../../src/app/utils/axios";
import { course } from "../../src/app/componentes/AdminHome";

// Mock de las utilidades de axios
jest.mock("../../src/app/utils/axios", () => ({
  getCourses: jest.fn(),
  deleteCourse: jest.fn(),
  updateCourse: jest.fn(),
  createCourse: jest.fn(),
}));

// Mock del componente NavbarAdmin
jest.mock("../../src/app/componentes/NavbarAdmin", () => {
  return function MockNavbarAdmin({
    onSearchResults,
    onAddCourse,
  }: {
    onSearchResults: (courses: course[]) => void;
    onAddCourse: () => void;
  }) {
    return (
      <div data-testid="navbar-admin">
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
        <button onClick={onAddCourse}>Add Course</button>
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
    handleUpdate,
    handleDelete,
  }: any) {
    return (
      <div data-testid={`curso-${id}`}>
        <span>{title}</span>
        <span>{description}</span>
        <span>{category}</span>
        <span>{instructor}</span>
        <span>{duration} Semanas</span>
        <span>{requirement}</span>
        {handleUpdate && (
          <button onClick={() => handleUpdate(id)}>Modificar</button>
        )}
        {handleDelete && (
          <button onClick={() => handleDelete(id)}>Eliminar</button>
        )}
      </div>
    );
  };
});

// Mock del componente CourseData
jest.mock("../../src/app/componentes/CourseData", () => {
  return function MockCourseData({
    id,
    initialData,
    handleSubmit,
    handleClose,
  }: any) {
    return (
      <div data-testid="course-data-modal">
        <span>Course Data Modal</span>
        <span>ID: {id || "new"}</span>
        <span>Initial Data: {initialData ? initialData.title : "none"}</span>
        <button
          onClick={() =>
            handleSubmit({
              title: "Test Course",
              description: "Test Description",
            })
          }
        >
          Submit
        </button>
        <button onClick={handleClose}>Close</button>
      </div>
    );
  };
});

// Obtener referencias a los mocks
const mockGetCourses = getCourses as jest.MockedFunction<typeof getCourses>;
const mockDeleteCourse = deleteCourse as jest.MockedFunction<
  typeof deleteCourse
>;
const mockUpdateCourse = updateCourse as jest.MockedFunction<
  typeof updateCourse
>;
const mockCreateCourse = createCourse as jest.MockedFunction<
  typeof createCourse
>;

// Mock de console para evitar logs en tests
const consoleSpy = {
  log: jest.spyOn(console, "log").mockImplementation(() => {}),
  error: jest.spyOn(console, "error").mockImplementation(() => {}),
};

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
}));

describe("AdminHome Component", () => {
  const mockCourses: course[] = [
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
  });

  afterEach(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
  });

  it("renders AdminHome component correctly", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);

    // Act
    render(<AdminHome />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("React Fundamentals")).toBeInTheDocument();
      expect(screen.getByText("Node.js Backend")).toBeInTheDocument();
    });
  });

  it("fetches courses on component mount", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);

    // Act
    render(<AdminHome />);

    // Assert
    await waitFor(() => {
      expect(mockGetCourses).toHaveBeenCalled();
    });
  });

  it("displays courses when available", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);

    // Act
    render(<AdminHome />);

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

    // Act
    render(<AdminHome />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("No se encontraron cursos")).toBeInTheDocument();
      expect(screen.getAllByTestId("fontawesome-icon")).toHaveLength(1);
    });
  });

  it("handles successful course deletion", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);
    mockDeleteCourse.mockResolvedValue("Success");

    const user = userEvent.setup();
    render(<AdminHome />);

    // Act
    await waitFor(() => {
      expect(screen.getAllByText("Eliminar")).toHaveLength(2);
    });

    const deleteButton = screen.getAllByText("Eliminar")[0];
    await user.click(deleteButton);

    // Assert
    await waitFor(() => {
      expect(mockDeleteCourse).toHaveBeenCalledWith(1);
    });
  });

  it("handles course deletion error", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);
    mockDeleteCourse.mockRejectedValue(new Error("Delete failed"));

    const user = userEvent.setup();
    render(<AdminHome />);

    // Act
    await waitFor(() => {
      expect(screen.getAllByText("Eliminar")).toHaveLength(2);
    });

    const deleteButton = screen.getAllByText("Eliminar")[0];
    await user.click(deleteButton);

    // Assert
    await waitFor(() => {
      expect(mockDeleteCourse).toHaveBeenCalledWith(1);
    });
  });

  it("opens update modal when update button is clicked", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);

    const user = userEvent.setup();
    render(<AdminHome />);

    // Act
    await waitFor(() => {
      expect(screen.getAllByText("Modificar")).toHaveLength(2);
    });

    const updateButton = screen.getAllByText("Modificar")[0];
    await user.click(updateButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId("course-data-modal")).toBeInTheDocument();
      expect(screen.getByText("ID: 1")).toBeInTheDocument();
      expect(
        screen.getByText("Initial Data: React Fundamentals")
      ).toBeInTheDocument();
    });
  });

  it("opens add course modal when add course button is clicked", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);

    const user = userEvent.setup();
    render(<AdminHome />);

    // Act
    const addButton = screen.getByText("Add Course");
    await user.click(addButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId("course-data-modal")).toBeInTheDocument();
      expect(screen.getByText("ID: new")).toBeInTheDocument();
      expect(screen.getByText("Initial Data: none")).toBeInTheDocument();
    });
  });

  it("handles successful course update", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);
    mockUpdateCourse.mockResolvedValue("Success");
    mockGetCourses
      .mockResolvedValueOnce(mockCourses)
      .mockResolvedValueOnce([
        ...mockCourses,
        {
          id: 1,
          title: "Updated React Course",
          description: "Updated description",
          category: "Programming",
          instructor: "John Doe",
          duration: 8,
          requirement: "Basic JavaScript knowledge",
        },
      ]);

    const user = userEvent.setup();
    render(<AdminHome />);

    // Act - Abrir modal de actualización
    await waitFor(() => {
      expect(screen.getAllByText("Modificar")).toHaveLength(2);
    });

    const updateButton = screen.getAllByText("Modificar")[0];
    await user.click(updateButton);

    // Act - Enviar formulario
    await waitFor(() => {
      expect(screen.getByText("Submit")).toBeInTheDocument();
    });

    const submitButton = screen.getByText("Submit");
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(mockUpdateCourse).toHaveBeenCalledWith(1, {
        title: "Test Course",
        description: "Test Description",
      });
      expect(mockGetCourses).toHaveBeenCalledTimes(2); // Una vez al montar, otra vez después del update
    });
  });

  it("handles successful course creation", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);
    mockCreateCourse.mockResolvedValue("Success");
    mockGetCourses
      .mockResolvedValueOnce(mockCourses)
      .mockResolvedValueOnce([
        ...mockCourses,
        {
          id: 3,
          title: "New Course",
          description: "New description",
          category: "Programming",
          instructor: "New Instructor",
          duration: 6,
          requirement: "No requirements",
        },
      ]);

    const user = userEvent.setup();
    render(<AdminHome />);

    // Act - Abrir modal de creación
    const addButton = screen.getByText("Add Course");
    await user.click(addButton);

    // Act - Enviar formulario
    await waitFor(() => {
      expect(screen.getByText("Submit")).toBeInTheDocument();
    });

    const submitButton = screen.getByText("Submit");
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(mockCreateCourse).toHaveBeenCalledWith({
        title: "Test Course",
        description: "Test Description",
      });
      expect(mockGetCourses).toHaveBeenCalledTimes(2); // Una vez al montar, otra vez después del create
    });
  });

  it("handles form submission error", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);
    mockUpdateCourse.mockRejectedValue(new Error("Update failed"));

    const user = userEvent.setup();
    render(<AdminHome />);

    // Act - Abrir modal de actualización
    await waitFor(() => {
      expect(screen.getAllByText("Modificar")).toHaveLength(2);
    });

    const updateButton = screen.getAllByText("Modificar")[0];
    await user.click(updateButton);

    // Act - Enviar formulario
    await waitFor(() => {
      expect(screen.getByText("Submit")).toBeInTheDocument();
    });

    const submitButton = screen.getByText("Submit");
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(mockUpdateCourse).toHaveBeenCalledWith(1, {
        title: "Test Course",
        description: "Test Description",
      });
    });
  });

  it("closes modal when close button is clicked", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);

    const user = userEvent.setup();
    render(<AdminHome />);

    // Act - Abrir modal
    await waitFor(() => {
      expect(screen.getAllByText("Modificar")).toHaveLength(2);
    });

    const updateButton = screen.getAllByText("Modificar")[0];
    await user.click(updateButton);

    // Act - Cerrar modal
    await waitFor(() => {
      expect(screen.getByText("Close")).toBeInTheDocument();
    });

    const closeButton = screen.getByText("Close");
    await user.click(closeButton);

    // Assert
    await waitFor(() => {
      expect(screen.queryByTestId("course-data-modal")).not.toBeInTheDocument();
    });
  });

  it("handles error when fetching courses", async () => {
    // Arrange
    mockGetCourses.mockRejectedValue(new Error("Network error"));

    // Act
    render(<AdminHome />);

    // Assert
    await waitFor(() => {
      expect(mockGetCourses).toHaveBeenCalled();
    });
  });

  it("updates courses when search results are received", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);

    const user = userEvent.setup();
    render(<AdminHome />);

    // Act
    const searchButton = screen.getByText("Mock Search");
    await user.click(searchButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Mocked Search Course")).toBeInTheDocument();
    });
  });

  it("renders course cards with correct information", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);

    // Act
    render(<AdminHome />);

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

  it("handles multiple course operations", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);
    mockDeleteCourse.mockResolvedValue("Success");
    mockUpdateCourse.mockResolvedValue("Success");

    const user = userEvent.setup();
    render(<AdminHome />);

    // Act - Eliminar primer curso
    await waitFor(() => {
      expect(screen.getAllByText("Eliminar")).toHaveLength(2);
    });

    const deleteButton = screen.getAllByText("Eliminar")[0];
    await user.click(deleteButton);

    // Act - Actualizar segundo curso (ahora solo queda uno)
    await waitFor(() => {
      expect(screen.getAllByText("Modificar")).toHaveLength(1);
    });

    const updateButton = screen.getAllByText("Modificar")[0];
    await user.click(updateButton);

    // Assert
    await waitFor(() => {
      expect(mockDeleteCourse).toHaveBeenCalledWith(1);
      expect(screen.getByTestId("course-data-modal")).toBeInTheDocument();
    });
  });

  it("displays correct course duration format", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);

    // Act
    render(<AdminHome />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("8 Semanas")).toBeInTheDocument();
      expect(screen.getByText("12 Semanas")).toBeInTheDocument();
    });
  });

  it("renders navbar with admin functionality", async () => {
    // Arrange
    mockGetCourses.mockResolvedValue(mockCourses);

    // Act
    render(<AdminHome />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId("navbar-admin")).toBeInTheDocument();
      expect(screen.getByText("Add Course")).toBeInTheDocument();
    });
  });
});
