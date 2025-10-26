import { http, HttpResponse } from "msw";
import { server } from "../../src/mocks/server";
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

describe("Axios Utils with MSW", () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
  });

  describe("Authentication Functions", () => {
    it("should login successfully with MSW", async () => {
      // Act
      const result = await login({
        email: "test@example.com",
        password: "password123",
      });

      // Assert
      expect(result).toBe("mock-jwt-token-12345");
    });

    it("should handle login error with MSW", async () => {
      // Arrange
      server.use(
        http.post("/users/login", () => {
          return HttpResponse.json(
            { error: "Invalid credentials" },
            { status: 401 }
          );
        })
      );

      // Act & Assert
      await expect(
        login({
          email: "invalid@example.com",
          password: "wrongpassword",
        })
      ).rejects.toThrow();
    });

    it("should register successfully with MSW", async () => {
      // Act
      const result = await registration({
        nickname: "testuser",
        email: "newuser@example.com",
        password: "password123",
        type: true,
      });

      // Assert
      expect(result).toBe("User created successfully");
    });

    it("should handle registration error with MSW", async () => {
      // Arrange
      server.use(
        http.post("/users/register", () => {
          return HttpResponse.json(
            { error: "Missing required fields" },
            { status: 400 }
          );
        })
      );

      // Act & Assert
      await expect(
        registration({
          nickname: "",
          email: "",
          password: "",
          type: false,
        })
      ).rejects.toThrow();
    });

    it("should authenticate user with MSW", async () => {
      // Act
      const result = await userAuthentication("mock-jwt-token-12345");

      // Assert
      expect(result).toBe("student");
    });

    it("should get user ID with MSW", async () => {
      // Act
      const result = await getUserId("mock-jwt-token-12345");

      // Assert
      expect(result).toBe("1");
    });
  });

  describe("Course Functions", () => {
    it("should get all courses with MSW", async () => {
      // Act
      const result = await getCourses();

      // Assert
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            title: "React Fundamentals",
          }),
          expect.objectContaining({
            id: 2,
            title: "Node.js Backend",
          }),
        ])
      );
    });

    it("should search courses with MSW", async () => {
      // Act
      const result = await search("React");

      // Assert
      expect(result).toEqual({
        results: expect.arrayContaining([
          expect.objectContaining({
            title: "React Fundamentals",
          }),
        ]),
      });
    });

    it("should get course by ID with MSW", async () => {
      // Act
      const result = await getCourseById(1);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          title: "React Fundamentals",
        })
      );
    });

    it("should subscribe to course with MSW", async () => {
      // Act
      const result = await subscribe({
        user_id: 1,
        course_id: 1,
      });

      // Assert
      expect(result).toBe("Successfully subscribed to course");
    });

    it("should get subscription list with MSW", async () => {
      // Act
      const result = await subscriptionList(1);

      // Assert
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            title: "React Fundamentals",
          }),
        ])
      );
    });
  });

  describe("Admin Functions", () => {
    it("should create course with MSW", async () => {
      // Arrange
      server.use(
        http.post("/courses", async ({ request }) => {
          const body = await request.json();
          return HttpResponse.json({
            message: "Course created successfully",
            course: {
              id: 3,
              ...body,
            },
          });
        })
      );

      // Act
      const result = await createCourse({
        title: "New Course",
        description: "New Description",
        category: "Programming",
        instructor: "New Instructor",
        duration: 8,
        requirement: "No requirements",
      });

      // Assert
      expect(result).toBe("Course created successfully");
    });

    it("should update course with MSW", async () => {
      // Arrange
      server.use(
        http.put("/courses/:id", async ({ request }) => {
          const body = await request.json();
          return HttpResponse.json({
            message: "Course updated successfully",
            course: body,
          });
        })
      );

      // Act
      const result = await updateCourse(1, {
        title: "Updated Course",
        description: "Updated Description",
        category: "Programming",
        instructor: "Updated Instructor",
        duration: 10,
        requirement: "Updated requirements",
      });

      // Assert
      expect(result).toBe("Course updated successfully");
    });

    it("should delete course with MSW", async () => {
      // Arrange
      server.use(
        http.delete("/courses/:id", () => {
          return HttpResponse.json({
            message: "Course deleted successfully",
          });
        })
      );

      // Act
      const result = await deleteCourse(1);

      // Assert
      expect(result).toBe("Course deleted successfully");
    });
  });

  describe("Comment Functions", () => {
    it("should add comment with MSW", async () => {
      // Act
      const result = await addComment({
        user_id: 1,
        course_id: 1,
        comment: "Great course!",
      });

      // Assert
      expect(result).toBe("Comment added successfully");
    });

    it("should get comments list with MSW", async () => {
      // Act
      const result = await commentsList(1);

      // Assert
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            comment: "Great course!",
          }),
        ])
      );
    });
  });

  describe("File Upload Functions", () => {
    it("should upload file with MSW", async () => {
      // Arrange
      const mockFile = new File(["test content"], "test.txt", {
        type: "text/plain",
      });

      // Act
      const result = await uploadFile(mockFile, "test.txt", 1, 1);

      // Assert
      expect(result).toBe("File uploaded successfully");
    });
  });

  describe("MSW Error Handling", () => {
    it("should handle network errors", async () => {
      // Arrange
      server.use(
        http.get("/courses", () => {
          return HttpResponse.error();
        })
      );

      // Act & Assert
      await expect(getCourses()).rejects.toThrow();
    });

    it("should handle 500 server errors", async () => {
      // Arrange
      server.use(
        http.get("/courses", () => {
          return HttpResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
          );
        })
      );

      // Act & Assert
      await expect(getCourses()).rejects.toThrow();
    });

    it("should handle timeout errors", async () => {
      // Arrange
      server.use(
        http.get("/courses", () => {
          return HttpResponse.json(
            { error: "Request timeout" },
            { status: 408 }
          );
        })
      );

      // Act & Assert
      await expect(getCourses()).rejects.toThrow();
    });
  });

  describe("MSW Handler Overrides", () => {
    it("should allow per-test handler overrides", async () => {
      // Arrange - Override handler for this specific test
      server.use(
        http.get("/courses", () => {
          return HttpResponse.json({
            results: [
              {
                id: 999,
                title: "Test Override Course",
                description: "This course is from a test override",
                category: "Testing",
                instructor: "Test Instructor",
                duration: 30,
                requirement: "Testing knowledge",
              },
            ],
          });
        })
      );

      // Act
      const result = await getCourses();

      // Assert
      expect(result).toEqual([
        expect.objectContaining({
          id: 999,
          title: "Test Override Course",
        }),
      ]);
    });

    it("should reset to default handlers after test", async () => {
      // This test should use default handlers, not the override from previous test
      // Act
      const result = await getCourses();

      // Assert - Should get default results
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: "React Fundamentals", // Default handler result
          }),
        ])
      );
    });
  });

  describe("MSW Request/Response Inspection", () => {
    it("should allow inspection of request data", async () => {
      // Arrange
      let capturedRequest: any = null;
      server.use(
        http.post("/users/login", async ({ request }) => {
          capturedRequest = await request.json();
          return HttpResponse.json({ token: "test-token" });
        })
      );

      // Act
      await login({
        email: "test@example.com",
        password: "password123",
      });

      // Assert
      expect(capturedRequest).toEqual({
        email: "test@example.com",
        password: "password123",
      });
    });

    it("should allow custom response headers", async () => {
      // Arrange
      server.use(
        http.get("/courses", () => {
          return HttpResponse.json(
            { results: [] },
            {
              headers: {
                "X-Custom-Header": "test-value",
                "Cache-Control": "no-cache",
              },
            }
          );
        })
      );

      // Act
      const result = await getCourses();

      // Assert
      expect(result).toEqual([]);
    });
  });
});
