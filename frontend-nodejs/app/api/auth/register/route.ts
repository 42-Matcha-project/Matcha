// // CORS設定のため、一時的にAPIルートを作成
// // 本来はバックエンド側でCORS設定を行う

// import { NextResponse } from "next/server";

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();

//     // バックエンドAPIを呼び出し
//     const response = await fetch("http://localhost:8080/auth/register", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(body),
//     });

//     const data = await response.json();

//     return NextResponse.json(data, { status: response.status });
//   } catch (error) {
//     console.log("APIエラー", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 },
//     );
//   }
// }
