import { Metadata } from 'next';
import { BuyerLayout } from '@b2b/nxt-layouts';
import { AuthGuard } from '@b2b/auth';
import ProductList from './components/ProductList';

export const metadata: Metadata = {
  title: 'Products - B2B Marketplace',
  description: 'Browse and purchase products',
};

export default function ProductsPage() {
  return (
    <AuthGuard>
      <BuyerLayout>
        <div className="py-6">
          <ProductList />
        </div>
      </BuyerLayout>
    </AuthGuard>
  );
}
