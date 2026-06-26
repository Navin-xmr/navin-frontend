import React, { Suspense, lazy } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthContext } from '@context/AuthContext';
import { can } from '@utils/rbac';
import PageSkeleton from '../../components/ui/PageSkeleton';

const ProfileSection = lazy(() => import('./sections/ProfileSection'));
const SecuritySection = lazy(() => import('./sections/SecuritySection/SecuritySection'));
const NotificationsSection = lazy(() => import('./sections/NotificationsSection'));
const WalletsSection = lazy(() => import('./sections/WalletsSection'));
const ApiKeysSection = lazy(() => import('./sections/ApiKeysSection'));
const DangerZone = lazy(() => import('./sections/DangerZone'));
const AppearanceSection = lazy(() => import('./sections/AppearanceSection'));

type Tab = 'profile' | 'security' | 'notifications' | 'appearance' | 'wallets' | 'api-keys' | 'danger';

interface TabDef {
  key: Tab;
  label: string;
  companyOnly?: boolean;
}

const TABS: TabDef[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'security', label: 'Security' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'appearance', label: 'Appearance' },
  { key: 'wallets', label: 'Wallets', companyOnly: true },
  { key: 'api-keys', label: 'API Keys', companyOnly: true },
  { key: 'danger', label: 'Danger Zone' },
];

const Settings: React.FC = () => {
  const { role, userId } = useAuthContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as Tab | null) ?? 'profile';

  const isCompany = role === 'company';
  const visibleTabs = TABS.filter((t) => !t.companyOnly || isCompany);

  const setTab = (key: Tab) => setSearchParams({ tab: key }, { replace: true });

  const tabCls = (key: Tab) =>
    `px-4 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
      activeTab === key
        ? 'bg-[rgba(19,186,186,0.15)] text-[#62ffff] border border-[rgba(98,255,255,0.3)]'
        : 'text-slate-400 hover:text-white hover:bg-[rgba(19,186,186,0.08)]'
    }`;

  return (
    <div className="p-6 md:p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-slate-400 text-sm">Manage your account, security, and preferences.</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 mb-8 overflow-x-auto pb-1" role="tablist">
        {visibleTabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={activeTab === t.key}
            className={tabCls(t.key)}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <Suspense fallback={<PageSkeleton />}>
        {activeTab === 'profile' && <ProfileSection isCompany={isCompany} />}
        {activeTab === 'security' && <SecuritySection />}
        {activeTab === 'notifications' && <NotificationsSection />}
        {activeTab === 'appearance' && <AppearanceSection />}
        {activeTab === 'wallets' && isCompany && <WalletsSection />}
        {activeTab === 'api-keys' && can(role, 'api-keys:manage') && <ApiKeysSection />}
        {activeTab === 'danger' && <DangerZone userEmail={userId ?? ''} />}
      </Suspense>
    </div>
  );
};

export default Settings;
