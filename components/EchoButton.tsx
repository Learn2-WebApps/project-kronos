'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEchoStore } from '@/store/echo-store';

export default function EchoButton() {
  const pathname = usePathname();
  const openModal = useEchoStore((state) => state.openModal);

  // 제외 경로 처리
  const HIDDEN_PATHS = ['/entry', '/admin'];
  const isHidden = HIDDEN_PATHS.some(path => pathname?.startsWith(path));
  if (isHidden) return null;

  return (
    <button
      onClick={openModal}
      className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--accent-amber)]/50 rounded-full shadow-[0_0_15px_rgba(212,165,116,0.2)] hover:border-[var(--accent-amber)] hover:shadow-[0_0_20px_rgba(212,165,116,0.4)] transition-all group"
    >
      <div className="relative w-6 h-6 rounded-full overflow-hidden border border-[var(--accent-amber)]/30 group-hover:border-[var(--accent-amber)]/60">
        <Image 
          src="/characters/echo.png" 
          alt="ECHO" 
          fill 
          className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-amber)]">
        ECHO
      </span>
      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
    </button>
  );
}
