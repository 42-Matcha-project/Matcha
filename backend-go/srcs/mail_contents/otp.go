package mail_contents

import "fmt"

func CreateOTPMailHTML(OTP string) string {
	return fmt.Sprintf(`
		<h3>--- もう少しで登録は終了します！ ---</h3>
		<p>下記のワンタイムパスワードをアプリに入力してください。（有効期限5分）</p>
		<p><strong style="font-size: 24px;">%s</strong></p>
		<br>
		<p>このメールに心当たりがなければ無視してください。</p>
	`, OTP)
}

func CreateOTPMailText(OTP string) string {
	return fmt.Sprintf(`
		--- もう少しで登録は終了します！ ---

		下記のワンタイムパスワードをアプリに入力してください。（有効期限5分）

		%s

		このメールに心当たりがなければ無視してください。
	`, OTP)
}
