package mail_contents

import "fmt"

func CreatePasswordForgotSubject() string {
	return "[Matcha]パスワード変更の案内"
}

func CreatePasswordForgotMailHTML(OTP string) string {
	return fmt.Sprintf(`
		<h3>--- 以下のワンタイムパスワードを使用することでパスワードを再設定できます！ ---</h3>
		<p>下記のワンタイムパスワードをアプリに入力してください。（有効期限5分）</p>
		<p><strong style="font-size: 24px;">%s</strong></p>
		<br>
		<p>このメールに心当たりがなければ無視してください。</p>
	`, OTP)
}

func CreatePasswordForgotMailText(OTP string) string {
	return fmt.Sprintf(`
		--- 以下のワンタイムパスワードを使用することでパスワードを再設定できます！ ---

		下記のワンタイムパスワードをアプリに入力してください。（有効期限5分）

		%s

		このメールに心当たりがなければ無視してください。
	`, OTP)
}
