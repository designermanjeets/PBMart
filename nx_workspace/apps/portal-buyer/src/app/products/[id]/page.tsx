import { Metadata } from 'next';
import { BuyerLayout } from '@b2b/nxt-layouts';
import { AuthGuard } from '@b2b/auth';
import ProductDetails from './components/ProductDetails';

type Props = {
  params: { id: string }
};

export const metadata: Metadata = {
  title: 'Product Details - B2B Marketplace',
  description: 'View product details and specifications',
};

export default function ProductDetailsPage({ params }: Props) {
  return (
    <AuthGuard>
      <BuyerLayout>
        <div className="py-6">
          <ProductDetails id={params.id} />
        </div>
      </BuyerLayout>
    </AuthGuard>
  );
} 