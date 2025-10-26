import { http, HttpResponse } from 'msw';

// Mock handlers para simular las respuestas de la API
export const handlers = [
  // Login endpoint
  http.post('/users/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    
    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        token: 'mock-jwt-token-12345',
        user: {
          id: 1,
          email: 'test@example.com',
          type: 'student'
        }
      });
    }
    
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  // Register endpoint
  http.post('/users/register', async ({ request }) => {
    const body = await request.json() as { nickname: string; email: string; password: string; type: boolean };
    
    if (body.email && body.password && body.nickname) {
      return HttpResponse.json({
        message: 'User created successfully',
        user: {
          id: 2,
          nickname: body.nickname,
          email: body.email,
          type: body.type
        }
      });
    }
    
    return HttpResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }),

  // Get courses endpoint
  http.get('/courses', () => {
    return HttpResponse.json({
      results: [
        {
          id: 1,
          title: 'React Fundamentals',
          description: 'Learn React from scratch',
          category: 'Frontend',
          instructor: 'John Doe',
          duration: 120,
          requirement: 'Basic JavaScript knowledge'
        },
        {
          id: 2,
          title: 'Node.js Backend',
          description: 'Build backend with Node.js',
          category: 'Backend',
          instructor: 'Jane Smith',
          duration: 180,
          requirement: 'JavaScript knowledge'
        }
      ]
    });
  }),

  // Search courses endpoint
  http.get('/courses/search', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query');
    
    const mockResults = [
      {
        id: 1,
        title: 'React Fundamentals',
        description: 'Learn React from scratch',
        category: 'Frontend',
        instructor: 'John Doe',
        duration: 120,
        requirement: 'Basic JavaScript knowledge'
      }
    ];
    
    return HttpResponse.json({
      results: query ? mockResults.filter(course => 
        course.title.toLowerCase().includes(query.toLowerCase())
      ) : mockResults
    });
  }),

  // Get course by ID
  http.get('/courses/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id: parseInt(id as string),
      title: 'React Fundamentals',
      description: 'Learn React from scratch',
      category: 'Frontend',
      instructor: 'John Doe',
      duration: 120,
      requirement: 'Basic JavaScript knowledge',
      creation_date: '2024-01-01T00:00:00Z',
      last_update: '2024-01-01T00:00:00Z'
    });
  }),

  // User authentication
  http.get('/users/authentication', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (authHeader === 'Bearer mock-jwt-token-12345') {
      return HttpResponse.json({
        message: 'student'
      });
    }
    
    return HttpResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }),

  // Get user ID
  http.get('/users/userId', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (authHeader === 'Bearer mock-jwt-token-12345') {
      return HttpResponse.json({
        message: '1'
      });
    }
    
    return HttpResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }),

  // Subscription list
  http.get('/users/subscriptions/:userId', ({ params }) => {
    const { userId } = params;
    return HttpResponse.json({
      results: [
        {
          id: 1,
          title: 'React Fundamentals',
          description: 'Learn React from scratch',
          category: 'Frontend',
          instructor: 'John Doe',
          duration: 120,
          requirement: 'Basic JavaScript knowledge'
        }
      ]
    });
  }),

  // Add comment
  http.post('/users/comments', async ({ request }) => {
    const body = await request.json() as { user_id: number; course_id: number; comment: string };
    
    if (body.comment && body.user_id && body.course_id) {
      return HttpResponse.json({
        message: 'Comment added successfully',
        comment: {
          id: 1,
          user_id: body.user_id,
          course_id: body.course_id,
          comment: body.comment,
          created_at: new Date().toISOString()
        }
      });
    }
    
    return HttpResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }),

  // Get comments
  http.get('/courses/comments/:courseId', ({ params }) => {
    const { courseId } = params;
    return HttpResponse.json({
      results: [
        {
          id: 1,
          user_id: 1,
          course_id: parseInt(courseId as string),
          comment: 'Great course!',
          created_at: '2024-01-01T00:00:00Z'
        }
      ]
    });
  }),

  // Subscribe to course
  http.post('/subscriptions', async ({ request }) => {
    const body = await request.json() as { user_id: number; course_id: number };
    
    if (body.user_id && body.course_id) {
      return HttpResponse.json({
        message: 'Successfully subscribed to course',
        subscription: {
          id: 1,
          user_id: body.user_id,
          course_id: body.course_id,
          subscribed_at: new Date().toISOString()
        }
      });
    }
    
    return HttpResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }),

  // Upload file
  http.post('/upload', async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('user_id');
    const courseId = formData.get('course_id');
    
    if (file && userId && courseId) {
      return HttpResponse.json({
        message: 'File uploaded successfully',
        file: {
          id: 1,
          name: file.name,
          size: file.size,
          user_id: parseInt(userId as string),
          course_id: parseInt(courseId as string),
          uploaded_at: new Date().toISOString()
        }
      });
    }
    
    return HttpResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }),

  // Create course (Admin)
  http.post('/courses', async ({ request }) => {
    const body = await request.json() as {
      title: string;
      description: string;
      category: string;
      instructor: string;
      duration: number;
      requirement: string;
    };
    
    if (body.title && body.description && body.category && body.instructor) {
      return HttpResponse.json({
        message: 'Course created successfully',
        course: {
          id: 3,
          ...body,
          creation_date: new Date().toISOString(),
          last_update: new Date().toISOString()
        }
      });
    }
    
    return HttpResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }),

  // Update course (Admin)
  http.put('/courses/:id', async ({ request, params }) => {
    const { id } = params;
    const body = await request.json() as {
      title: string;
      description: string;
      category: string;
      instructor: string;
      duration: number;
      requirement: string;
    };
    
    if (body.title && body.description && body.category && body.instructor) {
      return HttpResponse.json({
        message: 'Course updated successfully',
        course: {
          id: parseInt(id as string),
          ...body,
          last_update: new Date().toISOString()
        }
      });
    }
    
    return HttpResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }),

  // Delete course (Admin)
  http.delete('/courses/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      message: 'Course deleted successfully',
      deleted_course_id: parseInt(id as string)
    });
  })
];

