package dao

import "time"

type Course struct {
	Id           int       `gorm:"primaryKey"`
	Title        string    `gorm:"type:varchar(50);not null"`
	Description  string    `gorm:"type:varchar(300);not null"`
	Category     string    `gorm:"type:varchar(50);not null"`
	Instructor   string    `gorm:"type:varchar(100);not null"`
	Duration     int64     `gorm:"not null"`
	Requirement  string    `gorm:"type:varchar(150);not null"`
	CreationDate time.Time `gorm:"autoCreateTime"`
	LastUpdate   time.Time `gorm:"autoUpdateTime"`
}
