import { NextResponse } from 'next/server';
import { getAllClues } from '@/lib/clue-catalog';

export async function GET() {
  try {
    const clues = getAllClues();
    return NextResponse.json(clues);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
