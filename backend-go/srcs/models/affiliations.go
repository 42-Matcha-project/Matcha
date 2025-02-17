package models

import "gorm.io/gorm"

type TAffiliation struct {
	/*
		t_affiliationsテーブルの構造体
	*/
	ID          int    `gorm:"primaryKey;autoIncrement;column:id"`
	Affiliation string `gorm:"type:varchar(100);not null;unique;gorm:column:affiliation"`
}

func (TAffiliation) TableName() string { return "t_affiliations" }

type TUserAffiliation struct {
	/*
		t_user_affiliationsテーブルの構造体
		t_userとt_affiliationsの中間テーブル
	*/
	ID            int `gorm:"primaryKey;autoIncrement;column:id"`
	UserID        int `gorm:"type:int(10);not null;column:user_id"`
	AffiliationID int `gorm:"type:int(10);not null;column:affiliation_id"`
}

func (TUserAffiliation) TableName() string { return "t_user_affiliations" }

func (affiliation *TAffiliation) CreateAffiliation() (*TAffiliation, error) {
	/*
		DBに新規所属を保存する関数。
		affiliationはuniqueなのでCreateの前にチェック
	*/
	err := DB.Where("affiliation = ?", affiliation.Affiliation).First(affiliation).Error
	if err == nil {
		return affiliation, nil
	}
	if err == gorm.ErrRecordNotFound {
		err = DB.Create(affiliation).Error
		if err != nil {
			return nil, err
		}
		return affiliation, nil
	}

	return nil, err
}

func (user_affiliation *TUserAffiliation) CreateUserAffiliation() (*TUserAffiliation, error) {
	/*
		DBにユーザーと所属の中間テーブルの列を保存する関数。
		user_idとaffiliation_idの組が一致するものがすでにある場合はCreateしない。
	*/
	err := DB.Where("user_id = ? AND affiliation_id = ?", user_affiliation.UserID, user_affiliation.AffiliationID).First(&user_affiliation).Error
	if err == nil {
		return user_affiliation, nil
	}
	if err == gorm.ErrRecordNotFound {
		err = DB.Create(user_affiliation).Error
		if err != nil {
			return nil, err
		}
		return user_affiliation, nil
	}

	return nil, err
}
