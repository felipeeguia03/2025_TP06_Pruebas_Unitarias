import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock para login
  http.post('http://localhost:8081/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string }
    
    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        token: 'mock-jwt-token-123'
      }, { status: 200 })
    }
    
    return HttpResponse.json({
      message: 'Invalid credentials'
    }, { status: 401 })
  }),

  // Mock para registro
  http.post('http://localhost:8081/register', async ({ request }) => {
    const body = await request.json() as { nickname: string; email: string; password: string; type: boolean }
    
    if (body.email === 'existing@example.com') {
      return HttpResponse.json({
        message: 'User already exists'
      }, { status: 409 })
    }
    
    return HttpResponse.json({
      message: `Successful creation of user ${body.nickname}`
    }, { status: 200 })
  }),

  // Mock para obtener cursos
  http.get('http://localhost:8081/courses', () => {
    return HttpResponse.json({
      result: [
        {
          id: 1,
          title: 'Curso de React',
          description: 'Aprende React desde cero',
          category: 'Frontend',
          instructor: 'Juan Pérez',
          duration: 40,
          requirement: 'Conocimientos básicos de JavaScript',
          creationDate: '2024-01-15',
          lastUpdate: '2024-01-20'
        },
        {
          id: 2,
          title: 'Curso de Go',
          description: 'Programación en Go',
          category: 'Backend',
          instructor: 'María García',
          duration: 60,
          requirement: 'Conocimientos básicos de programación',
          creationDate: '2024-01-10',
          lastUpdate: '2024-01-25'
        }
      ]
    }, { status: 200 })
  }),

  // Mock para autenticación
  http.get('http://localhost:8081/auth', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({
        message: 'Authorization header is required'
      }, { status: 401 })
    }
    
    return HttpResponse.json({
      message: 'student'
    }, { status: 200 })
  }),

  // Mock para obtener ID de usuario
  http.get('http://localhost:8081/user-id', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({
        message: 'Authorization header is required'
      }, { status: 401 })
    }
    
    return HttpResponse.json({
      message: 123
    }, { status: 200 })
  }),

  // Mock para subir archivos
  http.post('http://localhost:8081/upload', () => {
    return HttpResponse.json({
      message: 'Archivo subido exitosamente: test-file.pdf'
    }, { status: 200 })
  }),

  // Mock para agregar comentarios
  http.post('http://localhost:8081/comment', async ({ request }) => {
    const body = await request.json() as { user_id: number; course_id: number; comment: string }
    
    return HttpResponse.json({
      message: `successful comment of user ${body.user_id} to course ${body.course_id}`
    }, { status: 201 })
  })
]
