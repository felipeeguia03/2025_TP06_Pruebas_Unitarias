package dao

import "time"

type File struct {
	Id         int64     `gorm:"primaryKey"`
	User_Id    int64     `gorm:"notnull"`
	Course_Id  int64     `gorm:"notnull"`
	Name       string    `gorm:"type:varchar(100);not null"`
	Url        string    `gorm:"type:varchar(500);not null"`
	UploadDate time.Time `gorm:"autoCreateTime"`
}
