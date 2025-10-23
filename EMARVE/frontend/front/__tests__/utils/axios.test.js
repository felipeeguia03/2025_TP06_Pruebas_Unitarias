import axios from "axios";
import {
  login,
  registration,
  search,
  getCourses,
  getCourseById,
  subscribe,
  subscriptionList,
  userAuthentication,
  getUserId,
  createCourse,
  deleteCourse,
  updateCourse,
  addComment,
  commentsList,
  uploadFile,
} from "../../src/app/utils/axios";

// Mock completo de axios
jest.mock("axios");
const mockedAxios = axios;

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe("API Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should login successfully with valid credentials", async () => {
      // Arrange - Mock de respuesta exitosa
      const mockResponse = {
        data: { token: "mock-jwt-token-12345" },
        status: 200,
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const loginRequest = {
        email: "test@example.com",
        password: "password123",
      };

      // Act
      const result = await login(loginRequest);

      // Assert - Verifica que se llamó axios con los parámetros correctos
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:8081/login",
        loginRequest
      );
      expect(result).toBe("mock-jwt-token-12345");
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "tokenType",
        "mock-jwt-token-12345"
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "tokenId",
        "mock-jwt-token-12345"
      );
    });

    it("should throw error with invalid credentials", async () => {
      // Arrange - Mock de error
      mockedAxios.post.mockRejectedValue(new Error("Invalid credentials"));

      const loginRequest = {
        email: "wrong@example.com",
        password: "wrongpassword",
      };

      // Act & Assert
      await expect(login(loginRequest)).rejects.toThrow("Invalid credentials");
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:8081/login",
        loginRequest
      );
    });

    it("should handle network error", async () => {
      // Arrange - Mock de error de red
      mockedAxios.post.mockRejectedValue(new Error("Network Error"));

      const loginRequest = {
        email: "test@example.com",
        password: "password123",
      };

      // Act & Assert
      await expect(login(loginRequest)).rejects.toThrow("Network Error");
    });
  });

  describe("registration", () => {
    it("should register user successfully", async () => {
      const registrationRequest = {
        nickname: "testuser",
        email: "newuser@example.com",
        password: "password123",
        type: false,
      };

      const result = await registration(registrationRequest);

      expect(result).toEqual({
        message: "User created successfully",
        user: {
          id: 2,
          nickname: "testuser",
          email: "newuser@example.com",
          type: false,
        },
      });
    });

    it("should throw error with missing fields", async () => {
      const registrationRequest = {
        nickname: "",
        email: "",
        password: "",
        type: false,
      };

      await expect(registration(registrationRequest)).rejects.toThrow();
    });
  });

  describe("search", () => {
    it("should search courses with query", async () => {
      const result = await search("React");

      expect(result).toEqual({
        results: [
          {
            id: 1,
            title: "React Fundamentals",
            description: "Learn React from scratch",
            category: "Frontend",
            instructor: "John Doe",
            duration: 120,
            requirement: "Basic JavaScript knowledge",
          },
        ],
      });
    });

    it("should return all courses when no query provided", async () => {
      const result = await search("");

      expect(result.results).toHaveLength(2);
      expect(result.results[0].title).toBe("React Fundamentals");
    });
  });

  describe("getCourses", () => {
    it("should fetch all courses", async () => {
      const result = await getCourses();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        title: "React Fundamentals",
        description: "Learn React from scratch",
        category: "Frontend",
        instructor: "John Doe",
        duration: 120,
        requirement: "Basic JavaScript knowledge",
      });
    });
  });

  describe("getCourseById", () => {
    it("should fetch course by ID", async () => {
      const result = await getCourseById(1);

      expect(result).toEqual({
        id: 1,
        title: "React Fundamentals",
        description: "Learn React from scratch",
        category: "Frontend",
        instructor: "John Doe",
        duration: 120,
        requirement: "Basic JavaScript knowledge",
        creation_date: "2024-01-01T00:00:00Z",
        last_update: "2024-01-01T00:00:00Z",
      });
    });
  });

  describe("userAuthentication", () => {
    it("should authenticate user with valid token", async () => {
      const result = await userAuthentication("mock-jwt-token-12345");

      expect(result).toBe("student");
    });

    it("should throw error with invalid token", async () => {
      await expect(userAuthentication("invalid-token")).rejects.toThrow();
    });
  });

  describe("getUserId", () => {
    it("should get user ID with valid token", async () => {
      const result = await getUserId("mock-jwt-token-12345");

      expect(result).toBe("1");
    });

    it("should throw error with invalid token", async () => {
      await expect(getUserId("invalid-token")).rejects.toThrow();
    });
  });

  describe("subscriptionList", () => {
    it("should fetch user subscriptions", async () => {
      const result = await subscriptionList(1);

      expect(result).toEqual([
        {
          id: 1,
          title: "React Fundamentals",
          description: "Learn React from scratch",
          category: "Frontend",
          instructor: "John Doe",
          duration: 120,
          requirement: "Basic JavaScript knowledge",
        },
      ]);
    });
  });

  describe("subscribe", () => {
    it("should subscribe to course successfully", async () => {
      const subscribeRequest = {
        user_id: 1,
        course_id: 1,
      };

      const result = await subscribe(subscribeRequest);

      expect(result).toEqual({
        message: "Successfully subscribed to course",
        subscription: {
          id: 1,
          user_id: 1,
          course_id: 1,
          subscribed_at: expect.any(String),
        },
      });
    });

    it("should throw error with missing fields", async () => {
      const subscribeRequest = {
        user_id: null,
        course_id: null,
      };

      await expect(subscribe(subscribeRequest)).rejects.toThrow();
    });
  });

  describe("addComment", () => {
    it("should add comment successfully", async () => {
      const commentRequest = {
        user_id: 1,
        course_id: 1,
        comment: "Great course!",
      };

      const result = await addComment(commentRequest);

      expect(result).toEqual({
        message: "Comment added successfully",
        comment: {
          id: 1,
          user_id: 1,
          course_id: 1,
          comment: "Great course!",
          created_at: expect.any(String),
        },
      });
    });

    it("should throw error with missing fields", async () => {
      const commentRequest = {
        user_id: 1,
        course_id: 1,
        comment: "",
      };

      await expect(addComment(commentRequest)).rejects.toThrow();
    });
  });

  describe("commentsList", () => {
    it("should fetch comments for course", async () => {
      const result = await commentsList(1);

      expect(result).toEqual([
        {
          id: 1,
          user_id: 1,
          course_id: 1,
          comment: "Great course!",
          created_at: "2024-01-01T00:00:00Z",
        },
      ]);
    });
  });

  describe("uploadFile", () => {
    it("should upload file successfully", async () => {
      const file = new File(["test content"], "test.txt", {
        type: "text/plain",
      });
      const userId = 1;
      const courseId = 1;

      const result = await uploadFile(file, userId, courseId);

      expect(result).toEqual({
        message: "File uploaded successfully",
        file: {
          id: 1,
          name: "test.txt",
          size: 12,
          user_id: 1,
          course_id: 1,
          uploaded_at: expect.any(String),
        },
      });
    });

    it("should throw error with missing fields", async () => {
      const file = new File(["test content"], "test.txt", {
        type: "text/plain",
      });

      await expect(uploadFile(file, null, null)).rejects.toThrow();
    });
  });

  describe("createCourse", () => {
    it("should create course successfully", async () => {
      const courseRequest = {
        title: "New Course",
        description: "Course description",
        category: "Frontend",
        instructor: "John Doe",
        duration: 120,
        requirement: "Basic knowledge",
      };

      const result = await createCourse(courseRequest);

      expect(result).toEqual({
        message: "Course created successfully",
        course: expect.any(Object),
      });
    });
  });

  describe("deleteCourse", () => {
    it("should delete course successfully", async () => {
      const result = await deleteCourse(1);

      expect(result).toEqual({
        message: "Course deleted successfully",
      });
    });
  });

  describe("updateCourse", () => {
    it("should update course successfully", async () => {
      const updateRequest = {
        title: "Updated Course",
        description: "Updated description",
      };

      const result = await updateCourse(1, updateRequest);

      expect(result).toEqual({
        message: "Course updated successfully",
        course: expect.any(Object),
      });
    });
  });
});
