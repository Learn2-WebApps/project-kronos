import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') ?? null;
    
    if (!verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 관리자 인증만 확인하고 OK 반환
    // 실제 Firestore 쓰기는 클라이언트에서 수행
    return NextResponse.json({ ok: true, message: 'Authenticated' });
  } catch (err: any) {
    console.error('[admin/sessions POST] error:', err);
    return NextResponse.json(
      { error: err.message ?? 'Internal error' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') ?? null;
    
    if (!verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[admin/sessions GET] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
