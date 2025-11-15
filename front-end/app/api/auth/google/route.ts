import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { credential } = await req.json()

    if (!credential) {
      return NextResponse.json(
        { message: 'Missing credential' },
        { status: 400 }
      )
    }

    // 🔧 TẠM THỜI: trả dữ liệu test để fix lỗi frontend trước
    const user = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
    }

    const token = 'dummy-token-123'

    return NextResponse.json(
      {
        user,
        token,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('Error in /api/auth/google:', err)
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    )
  }
}
