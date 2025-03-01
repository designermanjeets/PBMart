import { Metadata } from 'next';
import { BuyerLayout } from '@b2b/nxt-layouts';
import { AuthGuard } from '@b2b/auth';
import ProfileContent from './components/ProfileContent';

export const metadata: Metadata = {
  title: 'Profile - B2B Marketplace',
  description: 'Manage your profile and account settings',
};

export default async function ProfilePage() {
  return (
    <AuthGuard>
      <BuyerLayout>
        <div className="py-6">
          <ProfileContent />
        </div>
      </BuyerLayout>
    </AuthGuard>
  );
}
