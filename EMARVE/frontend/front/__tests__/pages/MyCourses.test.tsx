import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import MyCourses from "../../src/app/myCourses/page";
import {
  getUserId,
  subscriptionList,
  userAuthentication,
  getCoursesByInstructor,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../../src/app/utils/axios";

// Mock de las utilidades de axios
jest.mock("../../src/app/utils/axios", () => ({
  getUserId: jest.fn(),
  subscriptionList: jest.fn(),
  userAuthentication: jest.fn(),
  getCoursesByInstructor: jest.fn(),
  createCourse: jest.fn(),
  updateCourse: jest.fn(),
  deleteCourse: jest.fn(),
}));

// Mock del componente Navbar
jest.mock("../../src/app/componentes/Navbar", () => {
  return function MockNavbar({
    onSearchResults,
  }: {
    onSearchResults: () => void;
  }) {
    return <div data-testid="navbar">Mock Navbar</div>;
  };
});

// Mock del componente CourseData
jest.mock("../../src/app/componentes/CourseData", () => {
  return function MockCourseData({
    id,
    initialData,
    handleSubmit,
    handleClose,
  }: {
    id?: number;
    initialData?: any;
    handleSubmit: (data: any) => void;
    handleClose: () => void;
  }) {
    return (
      <div data-testid="course-data-modal">
        <button
          onClick={() =>
            handleSubmit({
              title: "Test Course",
              description: "Test Description",
            })
          }
        >
          Submit Course
        </button>
        <button onClick={handleClose}>Close Modal</button>
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
    handleSubscribe,
    handleUpdate,
    handleDelete,
    message,
  }: {
    id: number;
    title: string;
    description: string;
    handleSubscribe?: () => void;
    handleUpdate?: () => void;
    handleDelete?: () => void;
    message: string;
  }) {
    return (
      <div data-testid={`course-${id}`}>
        <h3>{title}</h3>
        <p>{description}</p>
        <button onClick={handleSubscribe}>{message}</button>
        {handleUpdate && <button onClick={handleUpdate}>Edit</button>}
        {handleDelete && <button onClick={handleDelete}>Delete</button>}
      </div>
    );
  };
});

describe("MyCourses Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render basic page structure", () => {
    render(<MyCourses />);

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  it("should show student courses when user is student", async () => {
    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn((key) => {
        if (key === "tokenId") return "test-token-id";
        if (key === "tokenType") return "test-token-type";
        return null;
      }),
    };
    Object.defineProperty(window, "localStorage", { value: mockLocalStorage });

    (userAuthentication as jest.Mock).mockResolvedValue("student");
    (getUserId as jest.Mock).mockResolvedValue(1);
    (subscriptionList as jest.Mock).mockResolvedValue([
      {
        id: 1,
        title: "Test Course 1",
        description: "Test Description 1",
        category: "Test Category",
        instructor: "Test Instructor",
        duration: 10,
        requirement: "Test Requirement",
      },
    ]);

    render(<MyCourses />);

    await waitFor(() => {
      expect(screen.getByText("Test Course 1")).toBeInTheDocument();
    });

    expect(screen.getByText("+ Info")).toBeInTheDocument();
    expect(screen.queryByText("Crear Nuevo Curso")).not.toBeInTheDocument();
  });

  it("should show admin courses and create button when user is admin", async () => {
    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn((key) => {
        if (key === "tokenId") return "test-token-id";
        if (key === "tokenType") return "test-token-type";
        return null;
      }),
    };
    Object.defineProperty(window, "localStorage", { value: mockLocalStorage });

    (userAuthentication as jest.Mock).mockResolvedValue("admin");
    (getUserId as jest.Mock).mockResolvedValue(1);
    (getCoursesByInstructor as jest.Mock).mockResolvedValue([
      {
        id: 1,
        title: "Professor Course 1",
        description: "Professor Description 1",
        category: "Professor Category",
        instructor: "Professor Name",
        duration: 15,
        requirement: "Professor Requirement",
      },
    ]);

    render(<MyCourses />);

    await waitFor(() => {
      expect(screen.getByText("Professor Course 1")).toBeInTheDocument();
    });

    expect(screen.getByText("Mis Cursos Creados")).toBeInTheDocument();
    expect(screen.getByText("Crear Nuevo Curso")).toBeInTheDocument();
    expect(screen.getByText("Editar")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("should open create course modal when create button is clicked", async () => {
    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn((key) => {
        if (key === "tokenId") return "test-token-id";
        if (key === "tokenType") return "test-token-type";
        return null;
      }),
    };
    Object.defineProperty(window, "localStorage", { value: mockLocalStorage });

    (userAuthentication as jest.Mock).mockResolvedValue("admin");
    (getUserId as jest.Mock).mockResolvedValue(1);
    (getCoursesByInstructor as jest.Mock).mockResolvedValue([]);

    render(<MyCourses />);

    await waitFor(() => {
      expect(screen.getByText("Crear Nuevo Curso")).toBeInTheDocument();
    });

    const createButton = screen.getByText("Crear Nuevo Curso");
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByTestId("course-data-modal")).toBeInTheDocument();
    });
  });

  it("should show no courses message when no courses exist", async () => {
    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn((key) => {
        if (key === "tokenId") return "test-token-id";
        if (key === "tokenType") return "test-token-type";
        return null;
      }),
    };
    Object.defineProperty(window, "localStorage", { value: mockLocalStorage });

    (userAuthentication as jest.Mock).mockResolvedValue("student");
    (getUserId as jest.Mock).mockResolvedValue(1);
    (subscriptionList as jest.Mock).mockResolvedValue([]);

    render(<MyCourses />);

    await waitFor(() => {
      expect(screen.getByText("No se encontraron cursos")).toBeInTheDocument();
    });
  });
});
