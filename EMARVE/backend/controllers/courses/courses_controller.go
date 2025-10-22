package courses

import (
	courseDomain "backend/domain"
	courseService "backend/services/courses"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func SearchCourse(c *gin.Context) {

	query := strings.TrimSpace(c.Query("query"))
	results, err := courseService.SearchCourse(query)
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

func GetCourse(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, courseDomain.Result{
			Message: fmt.Sprintf("invalid id: %s", err.Error()),
		})

		return
	}

	course, err := courseService.GetCourse(id)

	if err != nil {
		c.JSON(http.StatusNotFound, courseDomain.Result{
			Message: fmt.Sprintf("error in get: %s", err.Error()),
		})

		return
	}

	c.JSON(http.StatusOK, course)

}

func GetAllCourses(c *gin.Context) {

	results, err := courseService.GetAllCourses()
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

func Subscription(c *gin.Context) {
	var subscribeRequest courseDomain.SubscribeRequest

	if err := c.ShouldBindJSON(&subscribeRequest); err != nil {
		c.JSON(http.StatusBadRequest, courseDomain.Result{
			Message: fmt.Sprintf("invalid request: %s", err.Error()),
		})
		return
	}

	if err := courseService.Subscription(subscribeRequest.UserId, subscribeRequest.CourseId); err != nil {
		c.JSON(http.StatusConflict, courseDomain.Result{
			Message: fmt.Sprintf("error in subscription: %s", err.Error()),
		})
		return
	}

	c.JSON(http.StatusCreated, courseDomain.Result{
		Message: fmt.Sprintf("successful subscription of user %d to course %d", subscribeRequest.UserId, subscribeRequest.CourseId),
	})

}

func CreateCourse(c *gin.Context) {
	var courseRequest courseDomain.CourseRequest

	if err := c.ShouldBindJSON(&courseRequest); err != nil {
		c.JSON(http.StatusBadRequest, courseDomain.Result{
			Message: fmt.Sprintf("invalid request: %s", err.Error()),
		})
		return
	}

	if err := courseService.CreateCourse(courseRequest.Title, courseRequest.Description, courseRequest.Category, courseRequest.Instructor, courseRequest.Duration, courseRequest.Requirement); err != nil {
		c.JSON(http.StatusConflict, courseDomain.Result{
			Message: fmt.Sprintf("error in creating course: %s", err.Error()),
		})
		return
	}

	c.JSON(http.StatusCreated, courseDomain.Result{
		Message: fmt.Sprintf("successful creation of course: %s", courseRequest.Title),
	})
}

func UpdateCorse(c *gin.Context) {
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

	if err := courseService.UpdateCourse(id, updateRequest.Title, updateRequest.Description, updateRequest.Category, updateRequest.Instructor, updateRequest.Duration, updateRequest.Requirement); err != nil {
		c.JSON(http.StatusConflict, courseDomain.Result{
			Message: fmt.Sprintf("error updating: %s", err.Error()),
		})
		return
	}

	c.JSON(http.StatusOK, courseDomain.Result{
		Message: fmt.Sprintf("successful update of course %s", updateRequest.Title),
	})

}

func DeleteCourse(c *gin.Context) {

	id, err := strconv.ParseInt(c.Param("id"), 10, 64)

	if err != nil {
		c.JSON(http.StatusBadRequest, courseDomain.Result{
			Message: fmt.Sprintf("invalid id: %s", err.Error()),
		})
		return
	}

	err = courseService.DeleteCourse(id)

	if err != nil {
		c.JSON(http.StatusNotFound, courseDomain.Result{
			Message: fmt.Sprintf("error in delete: %s", err.Error()),
		})
		return
	}

	c.Status(http.StatusNoContent)
}

func CommentList(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, courseDomain.Result{
			Message: fmt.Sprintf("invalid id: %s", err.Error()),
		})

		return
	}

	results, err := courseService.CommentList(id)
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
