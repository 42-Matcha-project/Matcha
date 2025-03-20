package mail_contents

import (
	"fmt"
	"srcs/models"
)

func CreateBugReportSubject(toAdmin bool) string {
	if toAdmin {
		return "[バグ報告]ユーザーからバグの報告がありました"
	}
	return "[Matcha]バグ報告を受け付けました"
}

func CreateBugReportText(toAdmin bool, user models.TUser, receivedMessage string) string {
	if toAdmin {
		return fmt.Sprintf(`
			--- %sさんよりバグ報告が提出されました ---
	
			以下、その本文です。
			
			---
			%s
			---
	
			チームで共有して早急に検証、改善を行いましょう。
			以下、%sさんの
			Email: %s
		`, user.Username, receivedMessage, user.Username, user.Email)
	}
	return fmt.Sprintf(`
		%sさん
		この度はバグ報告を提出していただきありがとうございます。
		以下、その本文です。
			
		---
		%s
		---
	
		チーム内で早急に検証、改善をします。
		大変ご迷惑をおかけしていることをお詫び申し上げます。
		今後とも我々のアプリをよろしくお願いいたします。
	`, user.Username, receivedMessage)
}

func CreateBugReportHTML(toAdmin bool, user models.TUser, receivedMessage string) string {
	if toAdmin {
		return fmt.Sprintf(`
			<h3>--- %sさんよりバグ報告が提出されました ---</h3>
			<p>以下、その本文です。</p>
			<hr>
			<p>%s</p>
			<hr>
			<p>チームで共有して早急に検証、改善を行いましょう。</p>
			<p>以下、%sさんの Email: <strong>%s</strong></p>
		`, user.Username, receivedMessage, user.Username, user.Email)
	}
	return fmt.Sprintf(`
		<p><strong>%sさん</strong></p>
		<p>この度はバグ報告を提出していただきありがとうございます。</p>
		<p>以下、その本文です。</p>
		<hr>
		<p>%s</p>
		<hr>
		<p>チーム内で早急に検証、改善をします。</p>
		<p>大変ご迷惑をおかけしていることをお詫び申し上げます。</p>
		<p>今後とも我々のアプリをよろしくお願いいたします。</p>
	`, user.Username, receivedMessage)
}
