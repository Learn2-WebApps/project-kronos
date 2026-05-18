export function createAdminToken(): string {
  const payload = `admin:${process.env.ADMIN_PASSWORD}:${Date.now()}`;
  return Buffer.from(payload).toString('base64');
}

export function verifyAdminToken(token: string | null): boolean {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [prefix, password, timestamp] = decoded.split(':');
    if (prefix !== 'admin') return false;
    if (password !== process.env.ADMIN_PASSWORD) return false;
    
    const age = Date.now() - parseInt(timestamp, 10);
    if (age > 24 * 60 * 60 * 1000) return false; // 24시간 유효
    
    return true;
  } catch {
    return false;
  }
}
