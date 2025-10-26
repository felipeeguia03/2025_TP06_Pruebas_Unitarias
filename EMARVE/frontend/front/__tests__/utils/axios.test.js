// Mock de las funciones de axios antes de importarlas
jest.mock("../../src/app/utils/axios", () => ({
  login: jest.fn(),
  registration: jest.fn(),
  search: jest.fn(),
  getCourses: jest.fn(),
  getCourseById: jest.fn(),
  subscribe: jest.fn(),
  subscriptionList: jest.fn(),
  userAuthentication: jest.fn(),
  getUserId: jest.fn(),
  createCourse: jest.fn(),
  deleteCourse: jest.fn(),
  updateCourse: jest.fn(),
  addComment: jest.fn(),
  commentsList: jest.fn(),
  uploadFile: jest.fn(),
}));

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
      // Arrange
      const mockToken = "mock-jwt-token-12345";
      login.mockResolvedValue(mockToken);

      const loginRequest = {
        email: "test@example.com",
        password: "password123",
      };

      // Act
      const result = await login(loginRequest);

      // Assert
      expect(login).toHaveBeenCalledWith(loginRequest);
      expect(result).toBe(mockToken);
    });

    it("should throw error with invalid credentials", async () => {
      // Arrange
      const mockError = new Error("Invalid credentials");
      login.mockRejectedValue(mockError);

      const loginRequest = {
        email: "wrong@example.com",
        password: "wrongpassword",
      };

      // Act & Assert
      await expect(login(loginRequest)).rejects.toThrow("Invalid credentials");
      expect(login).toHaveBeenCalledWith(loginRequest);
    });

    it("should handle network error", async () => {
      // Arrange
      const mockError = new Error("Network error");
      login.mockRejectedValue(mockError);

      const loginRequest = {
        email: "test@example.com",
        password: "password123",
      };

      // Act & Assert
      await expect(login(loginRequest)).rejects.toThrow("Network error");
    });

    it("should handle empty email", async () => {
      // Arrange
      const mockError = new Error("Email is required");
      login.mockRejectedValue(mockError);

      const loginRequest = {
        email: "",
        password: "password123",
      };

      // Act & Assert
      await expect(login(loginRequest)).rejects.toThrow("Email is required");
    });

    it("should handle empty password", async () => {
      // Arrange
      const mockError = new Error("Password is required");
      login.mockRejectedValue(mockError);

      const loginRequest = {
        email: "test@example.com",
        password: "",
      };

      // Act & Assert
      await expect(login(loginRequest)).rejects.toThrow("Password is required");
    });
  });

  describe("registration", () => {
    it("should register user successfully", async () => {
      // Arrange
      const mockResponse = "User created successfully";
      registration.mockResolvedValue(mockResponse);

      const registrationRequest = {
        nickname: "testuser",
        email: "newuser@example.com",
        password: "password123",
        type: false,
      };

      // Act
      const result = await registration(registrationRequest);

      // Assert
      expect(registration).toHaveBeenCalledWith(registrationRequest);
      expect(result).toBe(mockResponse);
    });

    it("should handle duplicate email error", async () => {
      // Arrange
      const mockError = new Error("Email already exists");
      registration.mockRejectedValue(mockError);

      const registrationRequest = {
        nickname: "testuser",
        email: "existing@example.com",
        password: "password123",
        type: false,
      };

      // Act & Assert
      await expect(registration(registrationRequest)).rejects.toThrow(
        "Email already exists"
      );
    });

    it("should handle invalid email format", async () => {
      // Arrange
      const mockError = new Error("Invalid email format");
      registration.mockRejectedValue(mockError);

      const registrationRequest = {
        nickname: "testuser",
        email: "invalid-email",
        password: "password123",
        type: false,
      };

      // Act & Assert
      await expect(registration(registrationRequest)).rejects.toThrow(
        "Invalid email format"
      );
    });

    it("should handle weak password", async () => {
      // Arrange
      const mockError = new Error("Password too weak");
      registration.mockRejectedValue(mockError);

      const registrationRequest = {
        nickname: "testuser",
        email: "test@example.com",
        password: "123",
        type: false,
      };

      // Act & Assert
      await expect(registration(registrationRequest)).rejects.toThrow(
        "Password too weak"
      );
    });

    it("should handle missing nickname", async () => {
      // Arrange
      const mockError = new Error("Nickname is required");
      registration.mockRejectedValue(mockError);

      const registrationRequest = {
        nickname: "",
        email: "test@example.com",
        password: "password123",
        type: false,
      };

      // Act & Assert
      await expect(registration(registrationRequest)).rejects.toThrow(
        "Nickname is required"
      );
    });

    it("should register admin user successfully", async () => {
      // Arrange
      const mockResponse = "Admin user created successfully";
      registration.mockResolvedValue(mockResponse);

      const registrationRequest = {
        nickname: "adminuser",
        email: "admin@example.com",
        password: "adminpassword123",
        type: true,
      };

      // Act
      const result = await registration(registrationRequest);

      // Assert
      expect(registration).toHaveBeenCalledWith(registrationRequest);
      expect(result).toBe(mockResponse);
    });
  });

  describe("search", () => {
    it("should search courses with query", async () => {
      // Arrange
      const mockResponse = { results: [{ id: 1, title: "Course 1" }] };
      search.mockResolvedValue(mockResponse);

      // Act
      const result = await search("test query");

      // Assert
      expect(search).toHaveBeenCalledWith("test query");
      expect(result).toBe(mockResponse);
    });

    it("should handle empty search query", async () => {
      // Arrange
      const mockResponse = { results: [] };
      search.mockResolvedValue(mockResponse);

      // Act
      const result = await search("");

      // Assert
      expect(search).toHaveBeenCalledWith("");
      expect(result).toBe(mockResponse);
    });

    it("should handle search with no results", async () => {
      // Arrange
      const mockResponse = { results: [] };
      search.mockResolvedValue(mockResponse);

      // Act
      const result = await search("nonexistent course");

      // Assert
      expect(search).toHaveBeenCalledWith("nonexistent course");
      expect(result.results).toHaveLength(0);
    });

    it("should handle search error", async () => {
      // Arrange
      const mockError = new Error("Search service unavailable");
      search.mockRejectedValue(mockError);

      // Act & Assert
      await expect(search("test query")).rejects.toThrow(
        "Search service unavailable"
      );
    });

    it("should search with special characters", async () => {
      // Arrange
      const mockResponse = { results: [{ id: 1, title: "C++ Course" }] };
      search.mockResolvedValue(mockResponse);

      // Act
      const result = await search("C++ programming");

      // Assert
      expect(search).toHaveBeenCalledWith("C++ programming");
      expect(result).toBe(mockResponse);
    });

    it("should handle long search query", async () => {
      // Arrange
      const longQuery = "a".repeat(1000);
      const mockResponse = { results: [] };
      search.mockResolvedValue(mockResponse);

      // Act
      const result = await search(longQuery);

      // Assert
      expect(search).toHaveBeenCalledWith(longQuery);
      expect(result).toBe(mockResponse);
    });
  });

  describe("getCourses", () => {
    it("should fetch all courses", async () => {
      // Arrange
      const mockCourses = [{ id: 1, title: "Course 1" }];
      getCourses.mockResolvedValue(mockCourses);

      // Act
      const result = await getCourses();

      // Assert
      expect(getCourses).toHaveBeenCalled();
      expect(result).toBe(mockCourses);
    });

    it("should handle empty courses list", async () => {
      // Arrange
      const mockCourses = [];
      getCourses.mockResolvedValue(mockCourses);

      // Act
      const result = await getCourses();

      // Assert
      expect(getCourses).toHaveBeenCalled();
      expect(result).toHaveLength(0);
    });

    it("should handle server error", async () => {
      // Arrange
      const mockError = new Error("Server error");
      getCourses.mockRejectedValue(mockError);

      // Act & Assert
      await expect(getCourses()).rejects.toThrow("Server error");
    });

    it("should fetch multiple courses", async () => {
      // Arrange
      const mockCourses = [
        { id: 1, title: "Course 1" },
        { id: 2, title: "Course 2" },
        { id: 3, title: "Course 3" },
      ];
      getCourses.mockResolvedValue(mockCourses);

      // Act
      const result = await getCourses();

      // Assert
      expect(getCourses).toHaveBeenCalled();
      expect(result).toHaveLength(3);
      expect(result[0].title).toBe("Course 1");
    });
  });

  describe("getCourseById", () => {
    it("should fetch course by ID", async () => {
      // Arrange
      const mockCourse = { id: 1, title: "Course 1" };
      getCourseById.mockResolvedValue(mockCourse);

      // Act
      const result = await getCourseById(1);

      // Assert
      expect(getCourseById).toHaveBeenCalledWith(1);
      expect(result).toBe(mockCourse);
    });

    it("should handle course not found", async () => {
      // Arrange
      const mockError = new Error("Course not found");
      getCourseById.mockRejectedValue(mockError);

      // Act & Assert
      await expect(getCourseById(999)).rejects.toThrow("Course not found");
    });

    it("should handle invalid course ID", async () => {
      // Arrange
      const mockError = new Error("Invalid course ID");
      getCourseById.mockRejectedValue(mockError);

      // Act & Assert
      await expect(getCourseById(-1)).rejects.toThrow("Invalid course ID");
    });

    it("should handle string course ID", async () => {
      // Arrange
      const mockCourse = { id: "1", title: "Course 1" };
      getCourseById.mockResolvedValue(mockCourse);

      // Act
      const result = await getCourseById("1");

      // Assert
      expect(getCourseById).toHaveBeenCalledWith("1");
      expect(result).toBe(mockCourse);
    });

    it("should fetch course with detailed information", async () => {
      // Arrange
      const mockCourse = {
        id: 1,
        title: "Advanced React",
        description: "Learn advanced React concepts",
        instructor: "John Doe",
        duration: 120,
        category: "Programming",
      };
      getCourseById.mockResolvedValue(mockCourse);

      // Act
      const result = await getCourseById(1);

      // Assert
      expect(getCourseById).toHaveBeenCalledWith(1);
      expect(result.title).toBe("Advanced React");
      expect(result.instructor).toBe("John Doe");
      expect(result.duration).toBe(120);
    });
  });

  describe("userAuthentication", () => {
    it("should authenticate user with valid token", async () => {
      // Arrange
      const mockUserType = "student";
      userAuthentication.mockResolvedValue(mockUserType);

      // Act
      const result = await userAuthentication("valid-token");

      // Assert
      expect(userAuthentication).toHaveBeenCalledWith("valid-token");
      expect(result).toBe(mockUserType);
    });

    it("should authenticate admin user", async () => {
      // Arrange
      const mockUserType = "admin";
      userAuthentication.mockResolvedValue(mockUserType);

      // Act
      const result = await userAuthentication("admin-token");

      // Assert
      expect(userAuthentication).toHaveBeenCalledWith("admin-token");
      expect(result).toBe(mockUserType);
    });

    it("should handle invalid token", async () => {
      // Arrange
      const mockError = new Error("Invalid token");
      userAuthentication.mockRejectedValue(mockError);

      // Act & Assert
      await expect(userAuthentication("invalid-token")).rejects.toThrow(
        "Invalid token"
      );
    });

    it("should handle expired token", async () => {
      // Arrange
      const mockError = new Error("Token expired");
      userAuthentication.mockRejectedValue(mockError);

      // Act & Assert
      await expect(userAuthentication("expired-token")).rejects.toThrow(
        "Token expired"
      );
    });

    it("should handle empty token", async () => {
      // Arrange
      const mockError = new Error("Token required");
      userAuthentication.mockRejectedValue(mockError);

      // Act & Assert
      await expect(userAuthentication("")).rejects.toThrow("Token required");
    });

    it("should handle null token", async () => {
      // Arrange
      const mockError = new Error("Token required");
      userAuthentication.mockRejectedValue(mockError);

      // Act & Assert
      await expect(userAuthentication(null)).rejects.toThrow("Token required");
    });
  });

  describe("getUserId", () => {
    it("should get user ID with valid token", async () => {
      // Arrange
      const mockUserId = 123;
      getUserId.mockResolvedValue(mockUserId);

      // Act
      const result = await getUserId("valid-token");

      // Assert
      expect(getUserId).toHaveBeenCalledWith("valid-token");
      expect(result).toBe(mockUserId);
    });

    it("should handle invalid token", async () => {
      // Arrange
      const mockError = new Error("Invalid token");
      getUserId.mockRejectedValue(mockError);

      // Act & Assert
      await expect(getUserId("invalid-token")).rejects.toThrow("Invalid token");
    });

    it("should handle expired token", async () => {
      // Arrange
      const mockError = new Error("Token expired");
      getUserId.mockRejectedValue(mockError);

      // Act & Assert
      await expect(getUserId("expired-token")).rejects.toThrow("Token expired");
    });

    it("should handle empty token", async () => {
      // Arrange
      const mockError = new Error("Token required");
      getUserId.mockRejectedValue(mockError);

      // Act & Assert
      await expect(getUserId("")).rejects.toThrow("Token required");
    });

    it("should return different user IDs", async () => {
      // Arrange
      const mockUserId1 = 123;
      const mockUserId2 = 456;
      getUserId
        .mockResolvedValueOnce(mockUserId1)
        .mockResolvedValueOnce(mockUserId2);

      // Act
      const result1 = await getUserId("token1");
      const result2 = await getUserId("token2");

      // Assert
      expect(result1).toBe(mockUserId1);
      expect(result2).toBe(mockUserId2);
    });
  });

  describe("subscriptionList", () => {
    it("should fetch user subscriptions", async () => {
      // Arrange
      const mockSubscriptions = [{ id: 1, title: "Course 1" }];
      subscriptionList.mockResolvedValue(mockSubscriptions);

      // Act
      const result = await subscriptionList(123);

      // Assert
      expect(subscriptionList).toHaveBeenCalledWith(123);
      expect(result).toBe(mockSubscriptions);
    });

    it("should handle empty subscriptions", async () => {
      // Arrange
      const mockSubscriptions = [];
      subscriptionList.mockResolvedValue(mockSubscriptions);

      // Act
      const result = await subscriptionList(123);

      // Assert
      expect(subscriptionList).toHaveBeenCalledWith(123);
      expect(result).toHaveLength(0);
    });

    it("should handle invalid user ID", async () => {
      // Arrange
      const mockError = new Error("User not found");
      subscriptionList.mockRejectedValue(mockError);

      // Act & Assert
      await expect(subscriptionList(999)).rejects.toThrow("User not found");
    });

    it("should fetch multiple subscriptions", async () => {
      // Arrange
      const mockSubscriptions = [
        { id: 1, title: "Course 1" },
        { id: 2, title: "Course 2" },
        { id: 3, title: "Course 3" },
      ];
      subscriptionList.mockResolvedValue(mockSubscriptions);

      // Act
      const result = await subscriptionList(123);

      // Assert
      expect(subscriptionList).toHaveBeenCalledWith(123);
      expect(result).toHaveLength(3);
      expect(result[0].title).toBe("Course 1");
    });

    it("should handle server error", async () => {
      // Arrange
      const mockError = new Error("Server error");
      subscriptionList.mockRejectedValue(mockError);

      // Act & Assert
      await expect(subscriptionList(123)).rejects.toThrow("Server error");
    });
  });

  describe("subscribe", () => {
    it("should subscribe to course successfully", async () => {
      // Arrange
      const mockResponse = "Subscription successful";
      subscribe.mockResolvedValue(mockResponse);

      const subscribeRequest = {
        user_id: 123,
        course_id: 456,
      };

      // Act
      const result = await subscribe(subscribeRequest);

      // Assert
      expect(subscribe).toHaveBeenCalledWith(subscribeRequest);
      expect(result).toBe(mockResponse);
    });

    it("should handle already subscribed error", async () => {
      // Arrange
      const mockError = new Error("Already subscribed to this course");
      subscribe.mockRejectedValue(mockError);

      const subscribeRequest = {
        user_id: 123,
        course_id: 456,
      };

      // Act & Assert
      await expect(subscribe(subscribeRequest)).rejects.toThrow(
        "Already subscribed to this course"
      );
    });

    it("should handle course not found", async () => {
      // Arrange
      const mockError = new Error("Course not found");
      subscribe.mockRejectedValue(mockError);

      const subscribeRequest = {
        user_id: 123,
        course_id: 999,
      };

      // Act & Assert
      await expect(subscribe(subscribeRequest)).rejects.toThrow(
        "Course not found"
      );
    });

    it("should handle user not found", async () => {
      // Arrange
      const mockError = new Error("User not found");
      subscribe.mockRejectedValue(mockError);

      const subscribeRequest = {
        user_id: 999,
        course_id: 456,
      };

      // Act & Assert
      await expect(subscribe(subscribeRequest)).rejects.toThrow(
        "User not found"
      );
    });

    it("should handle invalid subscription data", async () => {
      // Arrange
      const mockError = new Error("Invalid subscription data");
      subscribe.mockRejectedValue(mockError);

      const subscribeRequest = {
        user_id: -1,
        course_id: -1,
      };

      // Act & Assert
      await expect(subscribe(subscribeRequest)).rejects.toThrow(
        "Invalid subscription data"
      );
    });
  });

  describe("addComment", () => {
    it("should add comment successfully", async () => {
      // Arrange
      const mockResponse = "Comment added successfully";
      addComment.mockResolvedValue(mockResponse);

      const commentRequest = {
        userID: 123,
        courseID: 456,
        comment: "Great course!",
      };

      // Act
      const result = await addComment(commentRequest);

      // Assert
      expect(addComment).toHaveBeenCalledWith(commentRequest);
      expect(result).toBe(mockResponse);
    });

    it("should handle empty comment", async () => {
      // Arrange
      const mockError = new Error("Comment cannot be empty");
      addComment.mockRejectedValue(mockError);

      const commentRequest = {
        userID: 123,
        courseID: 456,
        comment: "",
      };

      // Act & Assert
      await expect(addComment(commentRequest)).rejects.toThrow(
        "Comment cannot be empty"
      );
    });

    it("should handle long comment", async () => {
      // Arrange
      const longComment = "a".repeat(1000);
      const mockResponse = "Comment added successfully";
      addComment.mockResolvedValue(mockResponse);

      const commentRequest = {
        userID: 123,
        courseID: 456,
        comment: longComment,
      };

      // Act
      const result = await addComment(commentRequest);

      // Assert
      expect(addComment).toHaveBeenCalledWith(commentRequest);
      expect(result).toBe(mockResponse);
    });

    it("should handle invalid user ID", async () => {
      // Arrange
      const mockError = new Error("User not found");
      addComment.mockRejectedValue(mockError);

      const commentRequest = {
        userID: 999,
        courseID: 456,
        comment: "Great course!",
      };

      // Act & Assert
      await expect(addComment(commentRequest)).rejects.toThrow(
        "User not found"
      );
    });

    it("should handle invalid course ID", async () => {
      // Arrange
      const mockError = new Error("Course not found");
      addComment.mockRejectedValue(mockError);

      const commentRequest = {
        userID: 123,
        courseID: 999,
        comment: "Great course!",
      };

      // Act & Assert
      await expect(addComment(commentRequest)).rejects.toThrow(
        "Course not found"
      );
    });

    it("should handle special characters in comment", async () => {
      // Arrange
      const mockResponse = "Comment added successfully";
      addComment.mockResolvedValue(mockResponse);

      const commentRequest = {
        userID: 123,
        courseID: 456,
        comment: "Great course! 👍 @#$%^&*()",
      };

      // Act
      const result = await addComment(commentRequest);

      // Assert
      expect(addComment).toHaveBeenCalledWith(commentRequest);
      expect(result).toBe(mockResponse);
    });
  });

  describe("commentsList", () => {
    it("should fetch comments for course", async () => {
      // Arrange
      const mockComments = [{ userID: 123, comment: "Great course!" }];
      commentsList.mockResolvedValue(mockComments);

      // Act
      const result = await commentsList(456);

      // Assert
      expect(commentsList).toHaveBeenCalledWith(456);
      expect(result).toBe(mockComments);
    });

    it("should handle empty comments list", async () => {
      // Arrange
      const mockComments = [];
      commentsList.mockResolvedValue(mockComments);

      // Act
      const result = await commentsList(456);

      // Assert
      expect(commentsList).toHaveBeenCalledWith(456);
      expect(result).toHaveLength(0);
    });

    it("should handle course not found", async () => {
      // Arrange
      const mockError = new Error("Course not found");
      commentsList.mockRejectedValue(mockError);

      // Act & Assert
      await expect(commentsList(999)).rejects.toThrow("Course not found");
    });

    it("should fetch multiple comments", async () => {
      // Arrange
      const mockComments = [
        { userID: 123, comment: "Great course!" },
        { userID: 456, comment: "Very helpful!" },
        { userID: 789, comment: "Excellent content!" },
      ];
      commentsList.mockResolvedValue(mockComments);

      // Act
      const result = await commentsList(456);

      // Assert
      expect(commentsList).toHaveBeenCalledWith(456);
      expect(result).toHaveLength(3);
      expect(result[0].comment).toBe("Great course!");
    });

    it("should handle server error", async () => {
      // Arrange
      const mockError = new Error("Server error");
      commentsList.mockRejectedValue(mockError);

      // Act & Assert
      await expect(commentsList(456)).rejects.toThrow("Server error");
    });
  });

  describe("uploadFile", () => {
    it("should upload file successfully", async () => {
      // Arrange
      const mockResponse = "File uploaded successfully";
      uploadFile.mockResolvedValue(mockResponse);

      const mockFile = new File(["test"], "test.txt", { type: "text/plain" });
      const uploadRequest = {
        file: mockFile,
        user_id: 123,
        course_id: 456,
      };

      // Act
      const result = await uploadFile(uploadRequest);

      // Assert
      expect(uploadFile).toHaveBeenCalledWith(uploadRequest);
      expect(result).toBe(mockResponse);
    });

    it("should handle file too large", async () => {
      // Arrange
      const mockError = new Error("File too large");
      uploadFile.mockRejectedValue(mockError);

      const mockFile = new File(["test"], "large.txt", { type: "text/plain" });
      const uploadRequest = {
        file: mockFile,
        user_id: 123,
        course_id: 456,
      };

      // Act & Assert
      await expect(uploadFile(uploadRequest)).rejects.toThrow("File too large");
    });

    it("should handle invalid file type", async () => {
      // Arrange
      const mockError = new Error("Invalid file type");
      uploadFile.mockRejectedValue(mockError);

      const mockFile = new File(["test"], "test.exe", {
        type: "application/x-executable",
      });
      const uploadRequest = {
        file: mockFile,
        user_id: 123,
        course_id: 456,
      };

      // Act & Assert
      await expect(uploadFile(uploadRequest)).rejects.toThrow(
        "Invalid file type"
      );
    });

    it("should handle empty file", async () => {
      // Arrange
      const mockError = new Error("File cannot be empty");
      uploadFile.mockRejectedValue(mockError);

      const mockFile = new File([""], "empty.txt", { type: "text/plain" });
      const uploadRequest = {
        file: mockFile,
        user_id: 123,
        course_id: 456,
      };

      // Act & Assert
      await expect(uploadFile(uploadRequest)).rejects.toThrow(
        "File cannot be empty"
      );
    });

    it("should handle invalid user ID", async () => {
      // Arrange
      const mockError = new Error("User not found");
      uploadFile.mockRejectedValue(mockError);

      const mockFile = new File(["test"], "test.txt", { type: "text/plain" });
      const uploadRequest = {
        file: mockFile,
        user_id: 999,
        course_id: 456,
      };

      // Act & Assert
      await expect(uploadFile(uploadRequest)).rejects.toThrow("User not found");
    });

    it("should handle invalid course ID", async () => {
      // Arrange
      const mockError = new Error("Course not found");
      uploadFile.mockRejectedValue(mockError);

      const mockFile = new File(["test"], "test.txt", { type: "text/plain" });
      const uploadRequest = {
        file: mockFile,
        user_id: 123,
        course_id: 999,
      };

      // Act & Assert
      await expect(uploadFile(uploadRequest)).rejects.toThrow(
        "Course not found"
      );
    });

    it("should upload different file types", async () => {
      // Arrange
      const mockResponse = "File uploaded successfully";
      uploadFile.mockResolvedValue(mockResponse);

      const mockPdfFile = new File(["test"], "document.pdf", {
        type: "application/pdf",
      });
      const uploadRequest = {
        file: mockPdfFile,
        user_id: 123,
        course_id: 456,
      };

      // Act
      const result = await uploadFile(uploadRequest);

      // Assert
      expect(uploadFile).toHaveBeenCalledWith(uploadRequest);
      expect(result).toBe(mockResponse);
    });
  });

  describe("createCourse", () => {
    it("should create course successfully", async () => {
      // Arrange
      const mockResponse = "Course created successfully";
      createCourse.mockResolvedValue(mockResponse);

      const courseRequest = {
        title: "New Course",
        description: "Course description",
        category: "Programming",
        instructor: "John Doe",
        duration: 60,
        requirement: "Basic knowledge",
      };

      // Act
      const result = await createCourse(courseRequest);

      // Assert
      expect(createCourse).toHaveBeenCalledWith(courseRequest);
      expect(result).toBe(mockResponse);
    });

    it("should handle duplicate course title", async () => {
      // Arrange
      const mockError = new Error("Course title already exists");
      createCourse.mockRejectedValue(mockError);

      const courseRequest = {
        title: "Existing Course",
        description: "Course description",
        category: "Programming",
        instructor: "John Doe",
        duration: 60,
        requirement: "Basic knowledge",
      };

      // Act & Assert
      await expect(createCourse(courseRequest)).rejects.toThrow(
        "Course title already exists"
      );
    });

    it("should handle missing title", async () => {
      // Arrange
      const mockError = new Error("Title is required");
      createCourse.mockRejectedValue(mockError);

      const courseRequest = {
        title: "",
        description: "Course description",
        category: "Programming",
        instructor: "John Doe",
        duration: 60,
        requirement: "Basic knowledge",
      };

      // Act & Assert
      await expect(createCourse(courseRequest)).rejects.toThrow(
        "Title is required"
      );
    });

    it("should handle invalid duration", async () => {
      // Arrange
      const mockError = new Error("Invalid duration");
      createCourse.mockRejectedValue(mockError);

      const courseRequest = {
        title: "New Course",
        description: "Course description",
        category: "Programming",
        instructor: "John Doe",
        duration: -10,
        requirement: "Basic knowledge",
      };

      // Act & Assert
      await expect(createCourse(courseRequest)).rejects.toThrow(
        "Invalid duration"
      );
    });

    it("should handle missing instructor", async () => {
      // Arrange
      const mockError = new Error("Instructor is required");
      createCourse.mockRejectedValue(mockError);

      const courseRequest = {
        title: "New Course",
        description: "Course description",
        category: "Programming",
        instructor: "",
        duration: 60,
        requirement: "Basic knowledge",
      };

      // Act & Assert
      await expect(createCourse(courseRequest)).rejects.toThrow(
        "Instructor is required"
      );
    });
  });

  describe("deleteCourse", () => {
    it("should delete course successfully", async () => {
      // Arrange
      const mockResponse = "Course deleted successfully";
      deleteCourse.mockResolvedValue(mockResponse);

      // Act
      const result = await deleteCourse(123);

      // Assert
      expect(deleteCourse).toHaveBeenCalledWith(123);
      expect(result).toBe(mockResponse);
    });

    it("should handle course not found", async () => {
      // Arrange
      const mockError = new Error("Course not found");
      deleteCourse.mockRejectedValue(mockError);

      // Act & Assert
      await expect(deleteCourse(999)).rejects.toThrow("Course not found");
    });

    it("should handle unauthorized deletion", async () => {
      // Arrange
      const mockError = new Error("Unauthorized to delete course");
      deleteCourse.mockRejectedValue(mockError);

      // Act & Assert
      await expect(deleteCourse(123)).rejects.toThrow(
        "Unauthorized to delete course"
      );
    });

    it("should handle course with active subscriptions", async () => {
      // Arrange
      const mockError = new Error(
        "Cannot delete course with active subscriptions"
      );
      deleteCourse.mockRejectedValue(mockError);

      // Act & Assert
      await expect(deleteCourse(123)).rejects.toThrow(
        "Cannot delete course with active subscriptions"
      );
    });

    it("should handle invalid course ID", async () => {
      // Arrange
      const mockError = new Error("Invalid course ID");
      deleteCourse.mockRejectedValue(mockError);

      // Act & Assert
      await expect(deleteCourse(-1)).rejects.toThrow("Invalid course ID");
    });
  });

  describe("updateCourse", () => {
    it("should update course successfully", async () => {
      // Arrange
      const mockResponse = "Course updated successfully";
      updateCourse.mockResolvedValue(mockResponse);

      const updateRequest = {
        title: "Updated Course",
        description: "Updated description",
        category: "Programming",
        instructor: "Jane Doe",
        duration: 90,
        requirement: "Advanced knowledge",
      };

      // Act
      const result = await updateCourse(123, updateRequest);

      // Assert
      expect(updateCourse).toHaveBeenCalledWith(123, updateRequest);
      expect(result).toBe(mockResponse);
    });

    it("should handle course not found", async () => {
      // Arrange
      const mockError = new Error("Course not found");
      updateCourse.mockRejectedValue(mockError);

      const updateRequest = {
        title: "Updated Course",
        description: "Updated description",
        category: "Programming",
        instructor: "Jane Doe",
        duration: 90,
        requirement: "Advanced knowledge",
      };

      // Act & Assert
      await expect(updateCourse(999, updateRequest)).rejects.toThrow(
        "Course not found"
      );
    });

    it("should handle unauthorized update", async () => {
      // Arrange
      const mockError = new Error("Unauthorized to update course");
      updateCourse.mockRejectedValue(mockError);

      const updateRequest = {
        title: "Updated Course",
        description: "Updated description",
        category: "Programming",
        instructor: "Jane Doe",
        duration: 90,
        requirement: "Advanced knowledge",
      };

      // Act & Assert
      await expect(updateCourse(123, updateRequest)).rejects.toThrow(
        "Unauthorized to update course"
      );
    });

    it("should handle duplicate title", async () => {
      // Arrange
      const mockError = new Error("Course title already exists");
      updateCourse.mockRejectedValue(mockError);

      const updateRequest = {
        title: "Existing Course",
        description: "Updated description",
        category: "Programming",
        instructor: "Jane Doe",
        duration: 90,
        requirement: "Advanced knowledge",
      };

      // Act & Assert
      await expect(updateCourse(123, updateRequest)).rejects.toThrow(
        "Course title already exists"
      );
    });

    it("should handle partial update", async () => {
      // Arrange
      const mockResponse = "Course updated successfully";
      updateCourse.mockResolvedValue(mockResponse);

      const updateRequest = {
        title: "Updated Course",
        description: "Updated description",
        category: "Programming",
        instructor: "Jane Doe",
        duration: 90,
        requirement: "Advanced knowledge",
      };

      // Act
      const result = await updateCourse(123, updateRequest);

      // Assert
      expect(updateCourse).toHaveBeenCalledWith(123, updateRequest);
      expect(result).toBe(mockResponse);
    });
  });
});
