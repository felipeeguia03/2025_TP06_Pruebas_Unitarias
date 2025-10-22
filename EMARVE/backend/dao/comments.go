package dao

import "time"

type Comment struct {
	Id           int64     `gorm:"primaryKey"`
	User_Id      int64     `gorm:"notnull"`
	Course_Id    int64     `gorm:"notnull"`
	Text         string    `gorm:"type:varchar(500);not null"`
	CreationDate time.Time `gorm:"autoCreateTime"`
	LastUpdate   time.Time `gorm:"autoUpdateTime"`
}
