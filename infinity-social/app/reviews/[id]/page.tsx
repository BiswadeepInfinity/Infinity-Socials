import ArticlePageClient from '@/components/ArticlePageClient';

export default async function UserReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ArticlePageClient reviewId={id} />;
}
