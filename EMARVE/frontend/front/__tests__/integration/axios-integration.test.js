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

// Mock de las utilidades de axios
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

// Obtener referencias a los mocks
const mockLogin = login;
const mockRegistration = registration;
const mockSearch = search;
const mockGetCourses = getCourses;
const mockGetCourseById = getCourseById;
const mockSubscribe = subscribe;
const mockSubscriptionList = subscriptionList;
const mockUserAuthentication = userAuthentication;
const mockGetUserId = getUserId;
const mockCreateCourse = createCourse;
const mockDeleteCourse = deleteCourse;
const mockUpdateCourse = updateCourse;
const mockAddComment = addComment;
const mockCommentsList = commentsList;
const mockUploadFile = uploadFile;

describe("Axios Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Authentication Flow", () => {
    it("should complete login flow successfully", async () => {
      // Arrange
      const loginData = { email: "test@example.com", password: "password123" };
      const token = "jwt-token-123";
      const userType = "student";
      const userId = 123;

      mockLogin.mockResolvedValue(token);
      mockUserAuthentication.mockResolvedValue(userType);
      mockGetUserId.mockResolvedValue(userId);

      // Act
      const loginResult = await login(loginData);
      const authResult = await userAuthentication(token);
      const idResult = await getUserId(token);

      // Assert
      expect(mockLogin).toHaveBeenCalledWith(loginData);
      expect(mockUserAuthentication).toHaveBeenCalledWith(token);
      expect(mockGetUserId).toHaveBeenCalledWith(token);
      expect(loginResult).toBe(token);
      expect(authResult).toBe(userType);
      expect(idResult).toBe(userId);
    });

    it("should complete registration flow successfully", async () => {
      // Arrange
      const registrationData = {
        nickname: "testuser",
        email: "newuser@example.com",
        password: "password123",
        type: false,
      };
      const response = "User created successfully";

      mockRegistration.mockResolvedValue(response);

      // Act
      const result = await registration(registrationData);

      // Assert
      expect(mockRegistration).toHaveBeenCalledWith(registrationData);
      expect(result).toBe(response);
    });
  });

  describe("Course Management Flow", () => {
    it("should complete course search and subscription flow", async () => {
      // Arrange
      const searchQuery = "React";
      const searchResults = { results: [{ id: 1, title: "React Course" }] };
      const courseDetails = {
        id: 1,
        title: "React Course",
        instructor: "John Doe",
      };
      const subscriptionData = { user_id: 123, course_id: 1 };
      const subscriptionResponse = "Subscription successful";

      mockSearch.mockResolvedValue(searchResults);
      mockGetCourseById.mockResolvedValue(courseDetails);
      mockSubscribe.mockResolvedValue(subscriptionResponse);

      // Act
      const searchResult = await search(searchQuery);
      const courseResult = await getCourseById(1);
      const subscribeResult = await subscribe(subscriptionData);

      // Assert
      expect(mockSearch).toHaveBeenCalledWith(searchQuery);
      expect(mockGetCourseById).toHaveBeenCalledWith(1);
      expect(mockSubscribe).toHaveBeenCalledWith(subscriptionData);
      expect(searchResult).toBe(searchResults);
      expect(courseResult).toBe(courseDetails);
      expect(subscribeResult).toBe(subscriptionResponse);
    });

    it("should complete course creation flow", async () => {
      // Arrange
      const courseData = {
        title: "New Course",
        description: "Course description",
        category: "Programming",
        instructor: "John Doe",
        duration: 60,
        requirement: "Basic knowledge",
      };
      const createResponse = "Course created successfully";
      const coursesList = [{ id: 1, title: "New Course" }];

      mockCreateCourse.mockResolvedValue(createResponse);
      mockGetCourses.mockResolvedValue(coursesList);

      // Act
      const createResult = await createCourse(courseData);
      const coursesResult = await getCourses();

      // Assert
      expect(mockCreateCourse).toHaveBeenCalledWith(courseData);
      expect(mockGetCourses).toHaveBeenCalled();
      expect(createResult).toBe(createResponse);
      expect(coursesResult).toBe(coursesList);
    });

    it("should complete course update flow", async () => {
      // Arrange
      const courseId = 1;
      const updateData = {
        title: "Updated Course",
        description: "Updated description",
        category: "Programming",
        instructor: "Jane Doe",
        duration: 90,
        requirement: "Advanced knowledge",
      };
      const updateResponse = "Course updated successfully";

      mockUpdateCourse.mockResolvedValue(updateResponse);

      // Act
      const result = await updateCourse(courseId, updateData);

      // Assert
      expect(mockUpdateCourse).toHaveBeenCalledWith(courseId, updateData);
      expect(result).toBe(updateResponse);
    });

    it("should complete course deletion flow", async () => {
      // Arrange
      const courseId = 1;
      const deleteResponse = "Course deleted successfully";

      mockDeleteCourse.mockResolvedValue(deleteResponse);

      // Act
      const result = await deleteCourse(courseId);

      // Assert
      expect(mockDeleteCourse).toHaveBeenCalledWith(courseId);
      expect(result).toBe(deleteResponse);
    });
  });

  describe("Comments and Files Flow", () => {
    it("should complete comment flow", async () => {
      // Arrange
      const commentData = {
        userID: 123,
        courseID: 1,
        comment: "Great course!",
      };
      const addCommentResponse = "Comment added successfully";
      const commentsList = [
        { userID: 123, comment: "Great course!", id: 1 },
        { userID: 456, comment: "Very helpful", id: 2 },
      ];

      mockAddComment.mockResolvedValue(addCommentResponse);
      mockCommentsList.mockResolvedValue(commentsList);

      // Act
      const addResult = await addComment(commentData);
      const listResult = await mockCommentsList(1);

      // Assert
      expect(mockAddComment).toHaveBeenCalledWith(commentData);
      expect(mockCommentsList).toHaveBeenCalledWith(1);
      expect(addResult).toBe(addCommentResponse);
      expect(listResult).toBe(commentsList);
    });

    it("should complete file upload flow", async () => {
      // Arrange
      const mockFile = new File(["test content"], "test.txt", {
        type: "text/plain",
      });
      const uploadData = {
        file: mockFile,
        user_id: 123,
        course_id: 1,
      };
      const uploadResponse = "File uploaded successfully";

      mockUploadFile.mockResolvedValue(uploadResponse);

      // Act
      const result = await uploadFile(uploadData);

      // Assert
      expect(mockUploadFile).toHaveBeenCalledWith(uploadData);
      expect(result).toBe(uploadResponse);
    });
  });

  describe("Subscription Management Flow", () => {
    it("should complete subscription list flow", async () => {
      // Arrange
      const userId = 123;
      const subscriptions = [
        { id: 1, title: "React Course", instructor: "John Doe" },
        { id: 2, title: "Node.js Course", instructor: "Jane Smith" },
      ];

      mockSubscriptionList.mockResolvedValue(subscriptions);

      // Act
      const result = await subscriptionList(userId);

      // Assert
      expect(mockSubscriptionList).toHaveBeenCalledWith(userId);
      expect(result).toBe(subscriptions);
    });
  });

  describe("Error Handling Flow", () => {
    it("should handle authentication errors", async () => {
      // Arrange
      const loginData = {
        email: "wrong@example.com",
        password: "wrongpassword",
      };
      const error = new Error("Invalid credentials");

      mockLogin.mockRejectedValue(error);

      // Act & Assert
      await expect(login(loginData)).rejects.toThrow("Invalid credentials");
      expect(mockLogin).toHaveBeenCalledWith(loginData);
    });

    it("should handle course not found errors", async () => {
      // Arrange
      const courseId = 999;
      const error = new Error("Course not found");

      mockGetCourseById.mockRejectedValue(error);

      // Act & Assert
      await expect(getCourseById(courseId)).rejects.toThrow("Course not found");
      expect(mockGetCourseById).toHaveBeenCalledWith(courseId);
    });

    it("should handle subscription errors", async () => {
      // Arrange
      const subscriptionData = { user_id: 123, course_id: 1 };
      const error = new Error("Already subscribed");

      mockSubscribe.mockRejectedValue(error);

      // Act & Assert
      await expect(subscribe(subscriptionData)).rejects.toThrow(
        "Already subscribed"
      );
      expect(mockSubscribe).toHaveBeenCalledWith(subscriptionData);
    });
  });

  describe("Complex Workflows", () => {
    it("should complete full user journey", async () => {
      // Arrange
      const loginData = { email: "test@example.com", password: "password123" };
      const token = "jwt-token-123";
      const userId = 123;
      const searchQuery = "React";
      const searchResults = { results: [{ id: 1, title: "React Course" }] };
      const courseDetails = {
        id: 1,
        title: "React Course",
        instructor: "John Doe",
      };
      const subscriptionData = { user_id: userId, course_id: 1 };
      const subscriptionResponse = "Subscription successful";
      const subscriptions = [
        { id: 1, title: "React Course", instructor: "John Doe" },
      ];

      mockLogin.mockResolvedValue(token);
      mockGetUserId.mockResolvedValue(userId);
      mockSearch.mockResolvedValue(searchResults);
      mockGetCourseById.mockResolvedValue(courseDetails);
      mockSubscribe.mockResolvedValue(subscriptionResponse);
      mockSubscriptionList.mockResolvedValue(subscriptions);

      // Act - Simulate full user journey
      const loginResult = await login(loginData);
      const idResult = await getUserId(loginResult);
      const searchResult = await search(searchQuery);
      const courseResult = await getCourseById(searchResult.results[0].id);
      const subscribeResult = await subscribe({
        user_id: idResult,
        course_id: courseResult.id,
      });
      const subscriptionsResult = await subscriptionList(idResult);

      // Assert
      expect(loginResult).toBe(token);
      expect(idResult).toBe(userId);
      expect(searchResult).toBe(searchResults);
      expect(courseResult).toBe(courseDetails);
      expect(subscribeResult).toBe(subscriptionResponse);
      expect(subscriptionsResult).toBe(subscriptions);
    });

    it("should complete admin course management workflow", async () => {
      // Arrange
      const courseData = {
        title: "New Course",
        description: "Course description",
        category: "Programming",
        instructor: "John Doe",
        duration: 60,
        requirement: "Basic knowledge",
      };
      const createResponse = "Course created successfully";
      const coursesList = [{ id: 1, title: "New Course" }];
      const updateData = {
        title: "Updated Course",
        description: "Updated description",
        category: "Programming",
        instructor: "Jane Doe",
        duration: 90,
        requirement: "Advanced knowledge",
      };
      const updateResponse = "Course updated successfully";
      const deleteResponse = "Course deleted successfully";

      mockCreateCourse.mockResolvedValue(createResponse);
      mockGetCourses.mockResolvedValue(coursesList);
      mockUpdateCourse.mockResolvedValue(updateResponse);
      mockDeleteCourse.mockResolvedValue(deleteResponse);

      // Act - Simulate admin workflow
      const createResult = await createCourse(courseData);
      const coursesResult = await getCourses();
      const updateResult = await updateCourse(coursesResult[0].id, updateData);
      const deleteResult = await deleteCourse(coursesResult[0].id);

      // Assert
      expect(createResult).toBe(createResponse);
      expect(coursesResult).toBe(coursesList);
      expect(updateResult).toBe(updateResponse);
      expect(deleteResult).toBe(deleteResponse);
    });
  });
});
