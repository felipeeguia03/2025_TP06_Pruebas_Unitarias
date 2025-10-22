package dao

import "time"

type Subscription struct {
	Id           int64     `gorm:"primaryKey"`
	User_Id      int64     `gorm:"notnull"`
	Course_Id    int64     `gorm:"notnull"`
	CreationDate time.Time `gorm:"autoCreateTime"`
	LastUpdate   time.Time `gorm:"autoUpdateTime"`
}
