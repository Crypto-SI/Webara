import { ProfileQuoteDetailClient } from './quote-detail-client';

type QuotePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProfileQuoteDetailPage({ params }: QuotePageProps) {
  const { id } = await params;
  return <ProfileQuoteDetailClient quoteId={id} />;
}
