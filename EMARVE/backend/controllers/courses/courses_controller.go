package courses

import (
	courseDomain "backend/domain"
	"backend/interfaces"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type CourseController struct {
	courseService interfaces.CourseServiceInterface
}

func NewCourseController(courseService interfaces.CourseServiceInterface) *CourseController {
	return &CourseController{courseService: courseService}
}

func (cc *CourseController) SearchCourse(c *gin.Context) {

	query := strings.TrimSpace(c.Query("query"))
	results, err := cc.courseService.SearchCourse(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, courseDomain.Result{
			Message: fmt.Sprintf("Error in search: %s", err.Error()),
		})
		return
	}

	c.JSON(http.StatusOK, courseDomain.SearchResponse{
		Result: results,
	})

}

func (cc *CourseController) GetCourse(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, courseDomain.Result{
			Message: fmt.Sprintf("invalid id: %s", err.Error()),
		})

		return
	}

	course, err := cc.courseService.GetCourse(id)

	if err != nil {
		c.JSON(http.StatusNotFound, courseDomain.Result{
			Message: fmt.Sprintf("error in get: %s", err.Error()),
		})

		return
	}

	c.JSON(http.StatusOK, course)

}

func (cc *CourseController) GetAllCourses(c *gin.Context) {

	results, err := cc.courseService.GetAllCourses()
	if err != nil {
		c.JSON(http.StatusInternalServerError, courseDomain.Result{
			Message: fmt.Sprintf("error in search: %s", err.Error()),
		})
		return
	}

	c.JSON(http.StatusOK, courseDomain.SearchResponse{
		Result: results,
	})
}

func (cc *CourseController) GetCourseImages(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, courseDomain.Result{
			Message: fmt.Sprintf("invalid id: %s", err.Error()),
		})
		return
	}

	images, err := cc.courseService.GetCourseImages(id)
	if err != nil {
		c.JSON(http.StatusNotFound, courseDomain.Result{
			Message: fmt.Sprintf("error getting images for course %d: %s", id, err.Error()),
		})
		return
	}

	c.JSON(http.StatusOK, courseDomain.FileListResponse{
		Result: images,
	})
}

func (cc *CourseController) GetCoursesByInstructor(c *gin.Context) {
	instructor := c.Param("instructor")
	if instructor == "" {
		c.JSON(http.StatusBadRequest, courseDomain.Result{
			Message: "instructor parameter is required",
		})
		return
	}

	results, err := cc.courseService.GetCoursesByInstructor(instructor)
	if err != nil {
		c.JSON(http.StatusNotFound, courseDomain.Result{
			Message: fmt.Sprintf("error getting courses for instructor %s: %s", instructor, err.Error()),
		})
		return
	}

	c.JSON(http.StatusOK, courseDomain.ListResponse{
		Result: results,
	})
}

func (cc *CourseController) Subscription(c *gin.Context) {
	var subscribeRequest courseDomain.SubscribeRequest

	if err := c.ShouldBindJSON(&subscribeRequest); err != nil {
		c.JSON(http.StatusBadRequest, courseDomain.Result{
			Message: fmt.Sprintf("invalid request: %s", err.Error()),
		})
		return
	}

	if err := cc.courseService.Subscription(subscribeRequest.UserId, subscribeRequest.CourseId); err != nil {
		c.JSON(http.StatusConflict, courseDomain.Result{
			Message: fmt.Sprintf("error in subscription: %s", err.Error()),
		})
		return
	}

	c.JSON(http.StatusCreated, courseDomain.Result{
		Message: fmt.Sprintf("successful subscription of user %d to course %d", subscribeRequest.UserId, subscribeRequest.CourseId),
	})

}

func (cc *CourseController) CreateCourse(c *gin.Context) {
	var courseRequest courseDomain.CourseRequest

	if err := c.ShouldBindJSON(&courseRequest); err != nil {
		c.JSON(http.StatusBadRequest, courseDomain.Result{
			Message: fmt.Sprintf("invalid request: %s", err.Error()),
		})
		return
	}

	if err := cc.courseService.CreateCourse(courseRequest.Title, courseRequest.Description, courseRequest.Category, courseRequest.Instructor, courseRequest.Duration, courseRequest.Requirement); err != nil {
		c.JSON(http.StatusConflict, courseDomain.Result{
			Message: fmt.Sprintf("error in creating course: %s", err.Error()),
		})
		return
	}

	c.JSON(http.StatusCreated, courseDomain.Result{
		Message: fmt.Sprintf("successful creation of course: %s", courseRequest.Title),
	})
}

func (cc *CourseController) UpdateCourse(c *gin.Context) {
	var updateRequest courseDomain.CourseRequest

	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, courseDomain.Result{
			Message: fmt.Sprintf("invalid id: %s", err.Error()),
		})
		return
	}

	if err := c.ShouldBindJSON(&updateRequest); err != nil {
		c.JSON(http.StatusBadRequest, courseDomain.Result{
			Message: fmt.Sprintf("invalid request: %s", err.Error()),
		})
		return
	}

	if err := cc.courseService.UpdateCourse(id, updateRequest.Title, updateRequest.Description, updateRequest.Category, updateRequest.Instructor, updateRequest.Duration, updateRequest.Requirement); err != nil {
		c.JSON(http.StatusConflict, courseDomain.Result{
			Message: fmt.Sprintf("error updating: %s", err.Error()),
		})
		return
	}

	c.JSON(http.StatusOK, courseDomain.Result{
		Message: fmt.Sprintf("successful update of course %s", updateRequest.Title),
	})

}

func (cc *CourseController) DeleteCourse(c *gin.Context) {

	id, err := strconv.ParseInt(c.Param("id"), 10, 64)

	if err != nil {
		c.JSON(http.StatusBadRequest, courseDomain.Result{
			Message: fmt.Sprintf("invalid id: %s", err.Error()),
		})
		return
	}

	err = cc.courseService.DeleteCourse(id)

	if err != nil {
		c.JSON(http.StatusNotFound, courseDomain.Result{
			Message: fmt.Sprintf("error in delete: %s", err.Error()),
		})
		return
	}

	c.Status(http.StatusNoContent)
}

func (cc *CourseController) CommentList(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, courseDomain.Result{
			Message: fmt.Sprintf("invalid id: %s", err.Error()),
		})

		return
	}

	results, err := cc.courseService.CommentList(id)
	if err != nil {
		c.JSON(http.StatusNotFound, courseDomain.Result{
			Message: fmt.Sprintf("error in getting comments: %s", err.Error()),
		})
		return
	}

	c.JSON(http.StatusOK, courseDomain.CommentList{
		Result: results,
	})

}
