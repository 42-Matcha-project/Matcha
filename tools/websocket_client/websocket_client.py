import requests
import json
import websocket
import time

def main():
    base_url = "http://localhost:8080"

    # 1. ユーザー登録
    register_url = f"{base_url}/auth/register"
    register_payload = {
        "Username": "ci_test",
        "Email": "ci_test@test.com",
        "Password": "ci_test",
        "DisplayName": "CiTestName",
        "IconImageURL": "ci_icon_url"
    }
    reg_resp = requests.post(register_url, json=register_payload)
    if reg_resp.status_code != 200:
        print(f"Registration failed with status code: {reg_resp.status_code}")
        return
    print("User registered successfully.")

    # 2. ログインして token を取得
    login_url = f"{base_url}/auth/login"
    login_payload = {
        "Username": "ci_test",
        "Password": "ci_test"
    }
    login_resp = requests.post(login_url, json=login_payload)
    if login_resp.status_code != 200:
        print(f"Login failed with status code: {login_resp.status_code}")
        return
    login_data = login_resp.json()
    token_value = login_data.get("token")
    if not token_value:
        print("Token not found in login response")
        return
    print("User logged in successfully. Token:", token_value)

    # 3. 作業内容（StudyRoom）の作成
    create_room_url = f"{base_url}/study-room/create"
    create_room_payload = {
        "StudyRoomName": "ci test room",
        "StudyRoomImageURL": "ci_url/url1"
    }
    headers = {"Authorization": f"Bearer {token_value}"}
    room_resp = requests.post(create_room_url, json=create_room_payload, headers=headers)
    if room_resp.status_code != 200:
        print(f"Room creation failed with status code: {room_resp.status_code}")
        return
    room_data = room_resp.json()
    room_code = room_data.get("roomCode")
    if not room_code:
        print("roomCode not found in room creation response")
        return
    print("Study room created successfully. Room Code:", room_code)

    # 4. WebSocket 接続テスト
    ws_url = f"ws://localhost:8080/study-room/join/{room_code}"  # WebSocket エンドポイント（例）
    ws_headers = [f"Authorization: Bearer {token_value}"]
    try:
        ws = websocket.create_connection(ws_url, header=ws_headers)
        print("WebSocket connection established successfully.")
        ws.close()
    except Exception as e:
        print("WebSocket connection failed:", e)

if __name__ == "__main__":
    main()
