import { Metadata } from 'next';
import { BuyerLayout } from '@b2b/nxt-layouts';
import { AuthGuard } from '@b2b/auth';
import ProductDetails from './components/ProductDetails';

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: 'Product Details - B2B Marketplace',
  description: 'View product details and specifications',
};

export default async function ProductDetailsPage({ params }: Props) {
  const { id } = await params;
  
  return (
    <AuthGuard>
      <BuyerLayout>
        <div className="py-6">
          <ProductDetails id={id} />
        </div>
      </BuyerLayout>
    </AuthGuard>
  );
} 