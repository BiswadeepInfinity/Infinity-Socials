import ArticlePageClient from '@/components/ArticlePageClient';

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ArticlePageClient slug={slug} />;
}
