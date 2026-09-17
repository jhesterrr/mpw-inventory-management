import SidebarNav from './SidebarNav';
import HeaderBar from './HeaderBar';
import BottomMobileNav from './BottomMobileNav';

interface Props {
  children: React.ReactNode;
}

export default function AppLayout({ children }: Props) {
  return (
    <div className="flex w-full min-h-screen relative">
      <SidebarNav />
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <HeaderBar />
        <main className="flex-1 w-full px-3.5 sm:px-4 md:px-6 py-4 md:py-6 pb-28 md:pb-6 max-w-[1600px] mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>
      <BottomMobileNav />
    </div>
  );
}
