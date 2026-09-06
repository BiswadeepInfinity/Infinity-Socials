'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChannelsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/clubs');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#07070d] flex items-center justify-center text-zinc-400 font-mono text-xs">
      Navigating to Clubs & Societies...
    </div>
  );
}
