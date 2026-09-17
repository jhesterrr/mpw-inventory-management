import { useEffect } from 'react';
import { useAppStore } from '@/store';
import { cn } from '@/utils';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import InventoryPage from '@/pages/InventoryPage';
import OrdersPage from '@/pages/OrdersPage';
import PurchasePage from '@/pages/PurchasePage';
import ReportingPage from '@/pages/ReportingPage';
import SupportPage from '@/pages/SupportPage';
import SettingsPage from '@/pages/SettingsPage';
import ScannerPage from '@/pages/ScannerPage';
import RequisitionsPage from '@/pages/RequisitionsPage';
import CartPage from '@/pages/CartPage';
import ApprovalFormPage from '@/pages/ApprovalFormPage';
import MyRequisitionsPage from '@/pages/MyRequisitionsPage';
import IssuanceHistoryPage from '@/pages/IssuanceHistoryPage';
import { AnimatePresence } from 'motion/react';
import AppLayout from '@/components/layout/AppLayout';
import PageWrapper from '@/components/layout/PageWrapper';

export default function App() {
  const { theme, isAuthenticated, activePage, initFromSupabase } = useAppStore(s => ({
    theme: s.theme,
    isAuthenticated: s.isAuthenticated,
    activePage: s.activePage,
    initFromSupabase: s.initFromSupabase,
  }));

  useEffect(() => {
    initFromSupabase();
  }, [initFromSupabase]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  if (!isAuthenticated) return <LoginPage />;

  let page: JSX.Element;
  switch (activePage) {
    case 'dashboard':
      page = <DashboardPage />;
      break;
    case 'inventory':
      page = <InventoryPage />;
      break;
    case 'orders':
      page = <OrdersPage />;
      break;
    case 'purchase':
      page = <PurchasePage />;
      break;
    case 'reporting':
      page = <ReportingPage />;
      break;
    case 'scanner':
      page = <ScannerPage />;
      break;
    case 'requisitions':
      page = <RequisitionsPage />;
      break;
    case 'support':
      page = <SupportPage />;
      break;
    case 'settings':
      page = <SettingsPage />;
      break;
    case 'cart':
      page = <CartPage />;
      break;
    case 'approval-form':
      page = <ApprovalFormPage />;
      break;
    case 'my-requisitions':
      page = <MyRequisitionsPage />;
      break;
    case 'issuance-history':
      page = <IssuanceHistoryPage />;
      break;
    default:
      page = <DashboardPage />;
  }

  return (
    <div className={cn('min-h-screen w-full transition-colors')}>
      <AppLayout>
        <AnimatePresence mode="wait">
          <PageWrapper key={activePage}>
            {page}
          </PageWrapper>
        </AnimatePresence>
      </AppLayout>
    </div>
  );
}
