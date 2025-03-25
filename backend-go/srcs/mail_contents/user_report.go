package mail_contents

import (
	"fmt"
	"srcs/models"
)

func CreateUserReportSubject(toAdmin bool) string {
	if toAdmin {
		return "[ユーザー通報]ユーザーからユーザーの通報がありました"
	}
	return "[Matcha]ユーザーの通報を受け付けました"
}

func CreateUserReportText(toAdmin bool, user models.TUser, receivedMessage string) string {
	if toAdmin {
		return fmt.Sprintf(`
			--- %sさんよりユーザーの通報が提出されました ---
	
			以下、その本文です。
			
			---
			%s
			---

			以下、%sさんの
			Email: %s
		`, user.Username, receivedMessage, user.Username, user.Email)
	}
	return fmt.Sprintf(`
		%sさん
		この度はユーザーの通報を提出していただきありがとうございます。
		以下、その本文です。
			
		---
		%s
		---
	
		頂いた情報をもとに対象ユーザーについて検証の上、不適切と思われる言動や行為があれば
		アカウントの停止・削除等の対応を取らせていただきます。
		今後とも我々のアプリをよろしくお願いいたします。
	`, user.Username, receivedMessage)
}

func CreateUserReportHTML(toAdmin bool, user models.TUser, receivedMessage string) string {
	if toAdmin {
		return fmt.Sprintf(`
			<h3>--- %sさんよりユーザーの通報が提出されました ---</h3>
			<p>以下、その本文です。</p>
			<hr>
			<p>%s</p>
			<hr>
			<p>情報を元に対象ユーザーについて検証し、アカウントの停止・削除を検討してください。</p>
			<p>以下、%sさんの Email: <strong>%s</strong></p>
		`, user.Username, receivedMessage, user.Username, user.Email)
	}
	return fmt.Sprintf(`
		<p><strong>%sさん</strong></p>
		<p>この度はユーザーの通報を提出していただきありがとうございます。</p>
		<p>以下、その本文です。</p>
		<hr>
		<p>%s</p>
		<hr>
		<p>頂いた情報をもとに対象ユーザーについて検証の上、不適切と思われる言動や行為があれば</p>
		<p>アカウントの停止・削除等の対応を取らせていただきます。</p>
		<p>今後とも我々のアプリをよろしくお願いいたします。</p>
	`, user.Username, receivedMessage)
}
