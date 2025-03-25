package mail_contents

import (
	"fmt"
	"srcs/models"
)

func CreateFeatureRequestSubject(toAdmin bool) string {
	if toAdmin {
		return "[機能について]ユーザーからの希望です"
	}
	return "[Matcha]機能に関するの要望を受け付けました"
}

func CreateFeatureRequestText(toAdmin bool, user models.TUser, receivedMessage string) string {
	if toAdmin {
		return fmt.Sprintf(`
			--- %sさんより機能に関する要望が提出されました ---
	
			以下、その本文です。
			
			---
			%s
			---
	
			チームで共有して実装を検討しましょう。
			以下、%sさんの
			Email: %s
		`, user.Username, receivedMessage, user.Username, user.Email)
	}
	return fmt.Sprintf(`
		%sさん
		この度は機能に関する要望を提出していただきありがとうございます。
		以下、その本文です。
			
		---
		%s
		---
	
		チーム内で共有し実装を検討します。
		今後とも我々のアプリをよろしくお願いいたします。
	`, user.Username, receivedMessage)
}

func CreateFeatureRequestHTML(toAdmin bool, user models.TUser, receivedMessage string) string {
	if toAdmin {
		return fmt.Sprintf(`
			<h3>--- %sさんより機能に関する要望が提出されました ---</h3>
			<p>以下、その本文です。</p>
			<hr>
			<p>%s</p>
			<hr>
			<p>チームで共有して実装を検討しましょう。</p>
			<p>以下、%sさんの Email: <strong>%s</strong></p>
		`, user.Username, receivedMessage, user.Username, user.Email)
	}
	return fmt.Sprintf(`
		<p><strong>%sさん</strong></p>
		<p>この度は機能に関する要望を提出していただきありがとうございます。</p>
		<p>以下、その本文です。</p>
		<hr>
		<p>%s</p>
		<hr>
		<p>チーム内で共有し実装を検討します。</p>
		<p>今後とも我々のアプリをよろしくお願いいたします。</p>
	`, user.Username, receivedMessage)
}
