import { QuoteDetailClient } from './quote-detail-client';

type QuotePageProps = {
  params: Promise<{ id: string }>;
};

export default async function QuoteDetailPage({ params }: QuotePageProps) {
  const { id } = await params;
  return <QuoteDetailClient quoteId={id} />;
}
