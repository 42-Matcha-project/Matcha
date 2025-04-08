package applogs

const (
	// 000~ 成功
	OTPGenerateSuccess = 000
	OTPVerifySuccess   = 001
	CreateUserSuccess  = 002
	RegisterSuccess    = 003
	JWTGenerateSuccess = 004
	LoginSuccess       = 005
	// 100~ ユーザーレベル
	EmailOTPPairsNotFound = 100
	OTPNotMatch           = 101
	OTPAlreadyExpired     = 102
	EmailAlreadyVerified  = 103
	EmailNotFound         = 104
	EmailNotVerified      = 105
	LackOfLoginData       = 106
	UserNotFound          = 107
	// 200~ フロントエンドレベル
	InvalidJSONInput = 200
	// 300~ バックエンドレベル
	FailedToLoadTimeZone       = 301
	FailedToSendEmail          = 302
	FailedToGenerateRand       = 303
	FailedToSaveOTP            = 304
	FailedToCleanUpExpiredOTPs = 305
	FailedToConvertType        = 306
	FailedToHashPassword       = 307
	FailedToGenerateJWTToken   = 308
	// 400~ データベースレベル
	FailedToCreateUser           = 401
	FailedToBuildDefaultBuilding = 402
)

var Message = map[int]string{}

func init() {
	// 000~ 成功
	Message[OTPGenerateSuccess] = "入力されたメールアドレスにワンタイムパスワードが送信されました。"
	Message[OTPVerifySuccess] = "ワンタイムパスワードの認証に成功しました。ユーザー登録へ進んでください。"
	Message[CreateUserSuccess] = "ユーザーの作成に成功しました。"
	Message[RegisterSuccess] = "ユーザーの登録に成功しました。"
	Message[JWTGenerateSuccess] = "JWTトークンの生成に成功しました。"
	Message[LoginSuccess] = "ログインに成功しました。"
	// 100~ ユーザーレベル
	Message[EmailOTPPairsNotFound] = "入力されたメールアドレスにワンタイムパスワードは存在しません。改めてワンタイムパスワードを送信してください。"
	Message[OTPNotMatch] = "入力されたワンタイムパスワードは正しくありません。"
	Message[OTPAlreadyExpired] = "入力されたワンタイムパスワードはすでに期限が切れています。改めてワンタイムパスワードを送信してください。"
	Message[EmailAlreadyVerified] = "入力されたメールアドレスはすでに認証されています。ユーザー登録へ進んでください。"
	Message[EmailNotFound] = "入力されたメールアドレスは見つかりません。ユーザー登録の前にこのメールアドレスを使用してワンタイムパスワード認証を行なってください。"
	Message[EmailNotVerified] = "入力されたメールアドレスは認証されていません。送信されているメールを確認してワンタイムパスワードの認証を行なってください。"
	Message[LackOfLoginData] = "ログインのために必要なデータが入力されていません。"
	Message[UserNotFound] = "ユーザーが見つかりませんでした。"
	// 200~ フロントエンドレベル
	Message[InvalidJSONInput] = "JSONデータの形式にエラーがあります。"
	// 300~ バックエンドレベル
	Message[FailedToLoadTimeZone] = "タイムゾーンの取得に失敗しました。"
	Message[FailedToSendEmail] = "メールの送信に失敗しました。"
	Message[FailedToGenerateRand] = "乱数の生成に失敗しました。"
	Message[FailedToSaveOTP] = "ワンタイムパスワードの保存に失敗しました。"
	Message[FailedToCleanUpExpiredOTPs] = "期限切れのワンタイムパスワードの削除に失敗しました。"
	Message[FailedToConvertType] = "型変換に失敗しました。"
	Message[FailedToHashPassword] = "パスワードのハッシュ化に失敗しました。"
	Message[FailedToGenerateJWTToken] = "JWTトークンの生成に失敗しました。"
	// 400~ データベースレベル
	Message[FailedToCreateUser] = "ユーザーをデータベースに保存できませんでした。"
	Message[FailedToBuildDefaultBuilding] = "初期建物を設定できませんでした。"
}
