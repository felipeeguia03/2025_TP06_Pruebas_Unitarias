package dao

import "time"

//`gorm:...`  permiten configurar el comportamiento de los campos en la base de datos
type User struct {
	Id           int       `gorm:"primaryKey"`                //Clave primaria de la bd
	Nickname     string    `gorm:"type:varchar(50);not null"` //Nombre será de tipo VARCHAR con una longitud máxima de 350 caracteres en la base de datos y no puede ser nulo
	Email        string    `gorm:"type:varchar(150);not null"`
	PasswordHash string    `gorm:"type:varchar(100);not null"`
	Type         bool      `gorm:"not null"`
	CreationDate time.Time `gorm:"autoCreateTime"`
	LastUpdate   time.Time `gorm:"autoUpdateTime"`
}
