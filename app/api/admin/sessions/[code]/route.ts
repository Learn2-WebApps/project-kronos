import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '') ?? null;
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 인증만 확인
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') ?? null;
    
    if (!verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 인증만 확인, 실제 삭제는 클라이언트에서 수행
    return NextResponse.json({ ok: true, code: params.code });
  } catch (err: any) {
    console.error('[admin/sessions DELETE] error:', err);
    return NextResponse.json(
      { error: err.message ?? 'Internal error' }, 
      { status: 500 }
    );
  }
}
