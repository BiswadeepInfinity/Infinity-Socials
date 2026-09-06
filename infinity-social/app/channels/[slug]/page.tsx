'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function ChannelDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/clubs/${resolvedParams?.slug || ''}`);
  }, [router, resolvedParams?.slug]);

  return (
    <div className="min-h-screen bg-[#07070d] flex items-center justify-center text-zinc-400 font-mono text-xs">
      Navigating to Clan HQ...
    </div>
  );
}
