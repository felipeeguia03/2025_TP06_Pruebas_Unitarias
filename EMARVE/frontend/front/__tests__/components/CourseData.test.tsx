import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CourseData from "../../src/app/componentes/CourseData";

describe("CourseData Component", () => {
  const mockHandleSubmit = jest.fn();
  const mockHandleClose = jest.fn();

  const mockInitialData = {
    title: "React Fundamentals",
    description: "Learn React from scratch",
    category: "Programming",
    instructor: "John Doe",
    duration: 8,
    requirement: "Basic JavaScript knowledge",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders CourseData component correctly", () => {
    // Arrange & Act
    render(
      <CourseData
        handleSubmit={mockHandleSubmit}
        handleClose={mockHandleClose}
      />
    );

    // Assert
    expect(screen.getByText("Formulario del Curso")).toBeInTheDocument();
    expect(screen.getByText("Título")).toBeInTheDocument();
    expect(screen.getByText("Descripción")).toBeInTheDocument();
    expect(screen.getByText("Categoría")).toBeInTheDocument();
    expect(screen.getByText("Instructor")).toBeInTheDocument();
    expect(screen.getByText("Duración (Semanas)")).toBeInTheDocument();
    expect(screen.getByText("Requisitos")).toBeInTheDocument();
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
    expect(screen.getByText("Listo")).toBeInTheDocument();
  });

  it("renders with initial data when provided", () => {
    // Arrange & Act
    render(
      <CourseData
        id={1}
        initialData={mockInitialData}
        handleSubmit={mockHandleSubmit}
        handleClose={mockHandleClose}
      />
    );

    // Assert
    expect(screen.getByDisplayValue("React Fundamentals")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Learn React from scratch")
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("Programming")).toBeInTheDocument();
    expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("8")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Basic JavaScript knowledge")
    ).toBeInTheDocument();
  });

  it("renders empty form when no initial data provided", () => {
    // Arrange & Act
    render(
      <CourseData
        handleSubmit={mockHandleSubmit}
        handleClose={mockHandleClose}
      />
    );

    // Assert
    const inputs = screen.getAllByRole("textbox");
    const numberInput = screen.getByRole("spinbutton");

    expect(inputs[0]).toHaveValue("");
    expect(inputs[1]).toHaveValue("");
    expect(inputs[2]).toHaveValue("");
    expect(inputs[3]).toHaveValue("");
    expect(inputs[4]).toHaveValue("");
    expect(numberInput).toHaveValue(0);
  });

  it("updates form fields when user types", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <CourseData
        handleSubmit={mockHandleSubmit}
        handleClose={mockHandleClose}
      />
    );

    const inputs = screen.getAllByRole("textbox");
    const numberInput = screen.getByRole("spinbutton");

    // Act
    await user.type(inputs[0], "New Course");
    await user.type(inputs[1], "New Description");
    await user.type(inputs[2], "New Category");
    await user.type(inputs[3], "New Instructor");
    await user.clear(numberInput);
    await user.type(numberInput, "12");
    await user.type(inputs[4], "New Requirements");

    // Assert
    expect(inputs[0]).toHaveValue("New Course");
    expect(inputs[1]).toHaveValue("New Description");
    expect(inputs[2]).toHaveValue("New Category");
    expect(inputs[3]).toHaveValue("New Instructor");
    expect(numberInput).toHaveValue(12);
    expect(inputs[4]).toHaveValue("New Requirements");
  });

  it("calls handleSubmit with form data when form is submitted", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <CourseData
        handleSubmit={mockHandleSubmit}
        handleClose={mockHandleClose}
      />
    );

    const inputs = screen.getAllByRole("textbox");
    const numberInput = screen.getByRole("spinbutton");
    const submitButton = screen.getByText("Listo");

    // Act
    await user.type(inputs[0], "Test Course");
    await user.type(inputs[1], "Test Description");
    await user.type(inputs[2], "Test Category");
    await user.type(inputs[3], "Test Instructor");
    await user.clear(numberInput);
    await user.type(numberInput, "10");
    await user.type(inputs[4], "Test Requirements");
    await user.click(submitButton);

    // Assert
    expect(mockHandleSubmit).toHaveBeenCalledWith({
      title: "Test Course",
      description: "Test Description",
      category: "Test Category",
      instructor: "Test Instructor",
      duration: 10,
      requirement: "Test Requirements",
    });
  });

  it("calls handleClose when cancel button is clicked", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <CourseData
        handleSubmit={mockHandleSubmit}
        handleClose={mockHandleClose}
      />
    );

    const cancelButton = screen.getByText("Cancelar");

    // Act
    await user.click(cancelButton);

    // Assert
    expect(mockHandleClose).toHaveBeenCalledTimes(1);
  });

  it("prevents default form submission behavior", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <CourseData
        handleSubmit={mockHandleSubmit}
        handleClose={mockHandleClose}
      />
    );

    const inputs = screen.getAllByRole("textbox");
    const submitButton = screen.getByText("Listo");

    // Act
    await user.type(inputs[0], "Test Course");
    await user.type(inputs[1], "Test Description");
    await user.type(inputs[2], "Test Category");
    await user.type(inputs[3], "Test Instructor");
    await user.type(inputs[4], "Test Requirements");
    await user.click(submitButton);

    // Assert
    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });

  it("handles form submission with initial data", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <CourseData
        id={1}
        initialData={mockInitialData}
        handleSubmit={mockHandleSubmit}
        handleClose={mockHandleClose}
      />
    );

    const submitButton = screen.getByText("Listo");

    // Act
    await user.click(submitButton);

    // Assert
    expect(mockHandleSubmit).toHaveBeenCalledWith({
      title: "React Fundamentals",
      description: "Learn React from scratch",
      category: "Programming",
      instructor: "John Doe",
      duration: 8,
      requirement: "Basic JavaScript knowledge",
    });
  });

  it("handles form submission with modified initial data", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <CourseData
        id={1}
        initialData={mockInitialData}
        handleSubmit={mockHandleSubmit}
        handleClose={mockHandleClose}
      />
    );

    const inputs = screen.getAllByRole("textbox");
    const submitButton = screen.getByText("Listo");

    // Act
    await user.clear(inputs[0]);
    await user.type(inputs[0], "Modified Title");
    await user.click(submitButton);

    // Assert
    expect(mockHandleSubmit).toHaveBeenCalledWith({
      title: "Modified Title",
      description: "Learn React from scratch",
      category: "Programming",
      instructor: "John Doe",
      duration: 8,
      requirement: "Basic JavaScript knowledge",
    });
  });

  it("handles duration input as number", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <CourseData
        handleSubmit={mockHandleSubmit}
        handleClose={mockHandleClose}
      />
    );

    const inputs = screen.getAllByRole("textbox");
    const numberInput = screen.getByRole("spinbutton");
    const submitButton = screen.getByText("Listo");

    // Act
    await user.type(inputs[0], "Test Course");
    await user.type(inputs[1], "Test Description");
    await user.type(inputs[2], "Test Category");
    await user.type(inputs[3], "Test Instructor");
    await user.clear(numberInput);
    await user.type(numberInput, "15");
    await user.type(inputs[4], "Test Requirements");
    await user.click(submitButton);

    // Assert
    expect(mockHandleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        duration: 15,
      })
    );
  });

  it("handles empty duration input", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <CourseData
        handleSubmit={mockHandleSubmit}
        handleClose={mockHandleClose}
      />
    );

    const inputs = screen.getAllByRole("textbox");
    const numberInput = screen.getByRole("spinbutton");
    const submitButton = screen.getByText("Listo");

    // Act
    await user.type(inputs[0], "Test Course");
    await user.type(inputs[1], "Test Description");
    await user.type(inputs[2], "Test Category");
    await user.type(inputs[3], "Test Instructor");
    await user.clear(numberInput);
    await user.type(numberInput, "0");
    await user.type(inputs[4], "Test Requirements");
    await user.click(submitButton);

    // Assert
    expect(mockHandleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        duration: 0,
      })
    );
  });

  it("handles textarea input for description", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <CourseData
        handleSubmit={mockHandleSubmit}
        handleClose={mockHandleClose}
      />
    );

    const inputs = screen.getAllByRole("textbox");
    const numberInput = screen.getByRole("spinbutton");
    const submitButton = screen.getByText("Listo");

    // Act
    await user.type(inputs[0], "Test Course");
    await user.type(
      inputs[1],
      "This is a long description\nwith multiple lines"
    );
    await user.type(inputs[2], "Test Category");
    await user.type(inputs[3], "Test Instructor");
    await user.type(numberInput, "10");
    await user.type(inputs[4], "Test Requirements");
    await user.click(submitButton);

    // Assert
    expect(mockHandleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "This is a long description\nwith multiple lines",
      })
    );
  });

  it("handles special characters in form fields", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <CourseData
        handleSubmit={mockHandleSubmit}
        handleClose={mockHandleClose}
      />
    );

    const inputs = screen.getAllByRole("textbox");
    const numberInput = screen.getByRole("spinbutton");
    const submitButton = screen.getByText("Listo");

    // Act
    await user.type(inputs[0], "Course & More: Special Characters!");
    await user.type(inputs[1], "Test Description");
    await user.type(inputs[2], "Programming & Development");
    await user.type(inputs[3], "Test Instructor");
    await user.type(numberInput, "10");
    await user.type(inputs[4], "Test Requirements");
    await user.click(submitButton);

    // Assert
    expect(mockHandleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Course & More: Special Characters!",
        category: "Programming & Development",
      })
    );
  });

  it("handles form validation requirements", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <CourseData
        handleSubmit={mockHandleSubmit}
        handleClose={mockHandleClose}
      />
    );

    const inputs = screen.getAllByRole("textbox");
    const numberInput = screen.getByRole("spinbutton");
    const submitButton = screen.getByText("Listo");

    // Act
    await user.type(inputs[0], "Valid Title");
    await user.type(inputs[1], "Valid Description");
    await user.type(inputs[2], "Valid Category");
    await user.type(inputs[3], "Valid Instructor");
    await user.type(numberInput, "10");
    await user.type(inputs[4], "Valid Requirements");
    await user.click(submitButton);

    // Assert - Form should submit with valid data
    expect(mockHandleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Valid Title",
      })
    );
  });

  it("handles multiple form submissions", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <CourseData
        handleSubmit={mockHandleSubmit}
        handleClose={mockHandleClose}
      />
    );

    const inputs = screen.getAllByRole("textbox");
    const numberInput = screen.getByRole("spinbutton");
    const submitButton = screen.getByText("Listo");

    // Act
    await user.type(inputs[0], "First Submission");
    await user.type(inputs[1], "First Description");
    await user.type(inputs[2], "First Category");
    await user.type(inputs[3], "First Instructor");
    await user.type(numberInput, "10");
    await user.type(inputs[4], "First Requirements");
    await user.click(submitButton);

    await user.clear(inputs[0]);
    await user.type(inputs[0], "Second Submission");
    await user.click(submitButton);

    // Assert
    expect(mockHandleSubmit).toHaveBeenCalledTimes(2);
    expect(mockHandleSubmit).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        title: "First Submission",
      })
    );
    expect(mockHandleSubmit).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        title: "Second Submission",
      })
    );
  });

  it("handles form reset after submission", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <CourseData
        handleSubmit={mockHandleSubmit}
        handleClose={mockHandleClose}
      />
    );

    const inputs = screen.getAllByRole("textbox");
    const submitButton = screen.getByText("Listo");

    // Act
    await user.type(inputs[0], "Test Course");
    await user.click(submitButton);

    // Assert - Form should still have the values after submission
    expect(inputs[0]).toHaveValue("Test Course");
  });

  it("handles keyboard navigation", async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <CourseData
        handleSubmit={mockHandleSubmit}
        handleClose={mockHandleClose}
      />
    );

    const inputs = screen.getAllByRole("textbox");

    // Act
    await user.type(inputs[0], "Test");
    await user.keyboard("{Tab}");
    await user.type(inputs[1], "Description");

    // Assert
    expect(inputs[0]).toHaveValue("Test");
    expect(inputs[1]).toHaveValue("Description");
  });
});
