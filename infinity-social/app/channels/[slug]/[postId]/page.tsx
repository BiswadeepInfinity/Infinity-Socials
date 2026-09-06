'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function ChannelPostRedirect({ params }: { params: Promise<{ slug: string; postId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`/clubs/${resolvedParams?.slug || ''}/${resolvedParams?.postId || ''}`);
  }, [router, resolvedParams?.slug, resolvedParams?.postId]);

  return (
    <div className="min-h-screen bg-[#07070d] flex items-center justify-center text-zinc-400 font-mono text-xs">
      Navigating to Clan Discussion...
    </div>
  );
}
