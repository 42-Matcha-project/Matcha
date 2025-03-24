package mail_contents

import (
	"fmt"
	"srcs/models"
)

func CreateAppFeedbackSubject(toAdmin bool) string {
	if toAdmin {
		return "[フィードバック]ユーザーからアプリのフィードバックがありました"
	}
	return "[Matcha]フィードバックを受け付けました"
}

func CreateAppFeedbackText(toAdmin bool, user models.TUser, receivedMessage string) string {
	if toAdmin {
		return fmt.Sprintf(`
			--- %sさんよりフィールドバックが提出されました ---
	
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
		この度はフィードバックを提出していただきありがとうございます。
		以下、その本文です。
			
		---
		%s
		---
	
		頂いた意見は開発チームで共有し、
		よりいっそう満足していただけるように誠心誠意努めてまいります。
		今後とも我々のアプリをよろしくお願いいたします。
	`, user.Username, receivedMessage)
}

func CreateAppFeedbackHTML(toAdmin bool, user models.TUser, receivedMessage string) string {
	if toAdmin {
		return fmt.Sprintf(`
			<h3>--- %sさんよりフィールドバックが提出されました ---</h3>
			<p>以下、その本文です。</p>
			<hr>
			<p>%s</p>
			<hr>
			<p>以下、%sさんの Email: <strong>%s</strong></p>
		`, user.Username, receivedMessage, user.Username, user.Email)
	}
	return fmt.Sprintf(`
		<p><strong>%sさん</strong></p>
		<p>この度はフィードバックを提出していただきありがとうございます。</p>
		<p>以下、その本文です。</p>
		<hr>
		<p>%s</p>
		<hr>
		<p>頂いた意見は開発チームで共有し、</p>
		<p>よりいっそう満足していただけるように誠心誠意努めてまいります。</p>
		<p>今後とも我々のアプリをよろしくお願いいたします。</p>
	`, user.Username, receivedMessage)
}
