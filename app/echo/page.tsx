'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useEchoStore } from '@/store/echo-store';
import { useInterviewStore } from '@/store/interview-store';
import { usePlayerStore } from '@/store/player-store';

export default function EchoPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/');
  }, [router]);
  
  return null;
}
