package admin

import (
	"log"
	"os"
	"srcs/buildings"
	"srcs/models"
)

func CreateAdminUser() {
	/*
		管理者を作成してDBに保存する関数
	*/
	var err error
	if err = models.DB.Where("id = ?", 1).First(&models.TUser{}).Error; err == nil {
		return
	}

	adminUser := &models.TUser{
		ID:       1,
		Username: os.Getenv("ADMIN_USERNAME"),
		Email:    os.Getenv("ADMIN_EMAIL"),
		Password: os.Getenv("ADMIN_PASSWORD"),
	}
	_, err = adminUser.CreateUser()
	if err != nil {
		log.Fatal("Error creating admin user: ", err)
	}
	buildings.SetDefaultBuildingInStore()
}
