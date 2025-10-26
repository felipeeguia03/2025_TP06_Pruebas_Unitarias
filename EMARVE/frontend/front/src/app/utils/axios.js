import axios from "axios";

// Configuración base de axios con variable de entorno
const getApiBaseURL = () => {
  // Usar variable de entorno para la URL del API
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (apiUrl) {
    return apiUrl;
  }

  // Fallback para desarrollo local
  return "http://localhost:8080";
};

// Función para obtener la URL base (exportada para uso en otros componentes)
export const getBaseURL = getApiBaseURL;

const api = axios.create({
  baseURL: getApiBaseURL(),
});

export function search(query) {
  return api
    .get("/courses/search", {
      params: { query: query },
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.error("Hubo un Error en la busqueda:", error);
      throw error;
    });
}

export function getCourses() {
  return api
    .get("/courses")
    .then(function (response) {
      return response.data.results;
    })
    .catch(function (error) {
      console.error("Hubo un Error en la carga de cursos:", error);
      throw error;
    });
}

export function getCourseById(courseId) {
  return api
    .get(`/courses/${courseId}`)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.error("Hubo un Error en la obtencion del curso:", error);
      throw error;
    });
}

export function login(loginRequest) {
  return api
    .post("/users/login", loginRequest)
    .then(function (loginResponse) {
      console.log("Token: ", loginResponse.data.token);
      const tokenType = loginResponse.data.token;
      const tokenId = loginResponse.data.token;
      localStorage.setItem("tokenType", tokenType);
      localStorage.setItem("tokenId", tokenId);
      return loginResponse.data.token;
    })
    .catch(function (error) {
      console.log("Hubo un Error en el logueo:", error);
      throw error;
    });
}

export function registration(registrationRequest) {
  return api
    .post("/users/register", registrationRequest)
    .then(function (registrationResponse) {
      console.log("Token: ", registrationResponse.data);
      return registrationResponse.data;
    })
    .catch(function (error) {
      console.log("Hubo un Error en el registro:", error);
      throw error;
    });
}

export function subscribe(subscribeRequest) {
  return api
    .post("/subscriptions", subscribeRequest)
    .then(function (result) {
      console.log("Resultado de la subscripcion: ", result.data);
      return result.data;
    })
    .catch(function (error) {
      console.log("Hubo un Error en la subscripcion:", error);
      throw error;
    });
}

export function subscriptionList(userId) {
  return api
    .get(`/users/subscriptions/${userId}`)
    .then(function (listResponse) {
      return listResponse.data.results;
    })
    .catch(function (error) {
      console.error("Hubo un Error en la busqueda de inscripciones:", error);
      throw error;
    });
}

export function userAuthentication(token) {
  return api
    .get("/users/authentication", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(function (response) {
      return response.data.message;
    })
    .catch(function (error) {
      console.error("Hubo un Error en la autenticación:", error);
      throw error;
    });
}

export function getUserId(token) {
  return api
    .get("/users/userId", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(function (response) {
      return response.data.message;
    })
    .catch(function (error) {
      console.error("Hubo un Error en la obtencion del id:", error);
      throw error;
    });
}

export function createCourse(courseRequest) {
  return api
    .post("/courses/create", courseRequest)
    .then(function (result) {
      console.log("Resultado de la creacion del curso: ", result.data);
      return result.data;
    })
    .catch(function (error) {
      console.log("Hubo un Error en la creacion:", error);
      throw error;
    });
}

export function deleteCourse(courseId) {
  return api
    .delete(`/courses/delete/${courseId}`)
    .then(function (result) {
      console.log("Resultado de la eliminacion del curso: ", result.data);
      return result.data;
    })
    .catch(function (error) {
      console.log("Hubo un Error en la eliminacion:", error);
      throw error;
    });
}

export function updateCourse(courseId, updateRequest) {
  return api
    .put(`/courses/update/${courseId}`, updateRequest)
    .then(function (result) {
      console.log("Resultado de la actualizacion del curso: ", result.data);
      return result.data;
    })
    .catch(function (error) {
      console.log("Hubo un Error en la actualizacion:", error);
      throw error;
    });
}

export function addComment(commentRequest) {
  return api
    .post("/users/comments", commentRequest)
    .then(function (result) {
      console.log("Resultado del comentario: ", result.data);
      return result.data;
    })
    .catch(function (error) {
      console.log("Hubo un Error en en el comentado:", error);
      throw error;
    });
}

export function commentsList(courseId) {
  return api
    .get(`/courses/comments/${courseId}`)
    .then(function (commentList) {
      return commentList.data.results;
    })
    .catch(function (error) {
      console.error("Hubo un Error en la obtencion de los comentarios:", error);
      throw error;
    });
}

export function uploadFile(file, userId, courseId) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", userId);
  formData.append("course_id", courseId);

  return api
    .post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then(function (result) {
      console.log("Resultado de la subida del archivo: ", result.data);
      return result.data;
    })
    .catch(function (error) {
      console.log("Hubo un Error en la subida del archivo:", error);
      throw error;
    });
}

export function getCourseImages(courseId) {
  return api
    .get(`/courses/images/${courseId}`)
    .then(function (response) {
      return response.data.results;
    })
    .catch(function (error) {
      console.error(
        "Hubo un Error en la obtencion de imagenes del curso:",
        error
      );
      throw error;
    });
}

export function getUserById(userId) {
  return api
    .get(`/users/${userId}`)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.error("Hubo un Error en la obtencion del usuario:", error);
      throw error;
    });
}

export function getCoursesByInstructor(instructor) {
  return api
    .get(`/courses/instructor/${instructor}`)
    .then(function (response) {
      return response.data.results;
    })
    .catch(function (error) {
      console.error(
        "Hubo un Error en la obtencion de cursos del instructor:",
        error
      );
      throw error;
    });
}

export function logout() {
  // Limpiar localStorage
  localStorage.removeItem("tokenType");
  localStorage.removeItem("tokenId");
  localStorage.removeItem("userId");

  // Redirigir al login
  window.location.href = "/";
}
