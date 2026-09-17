import SidebarNav from './SidebarNav';
import HeaderBar from './HeaderBar';
import BottomMobileNav from './BottomMobileNav';

interface Props {
  children: React.ReactNode;
}

export default function AppLayout({ children }: Props) {
  return (
    <div className="flex w-full min-h-screen">
      <SidebarNav />
      <div className="flex-1 flex flex-col min-w-0">
        <HeaderBar />
        <main className="flex-1 w-full px-4 md:px-6 py-5 md:py-6 pb-28 md:pb-6 max-w-[1600px] mx-auto w-full">
          {children}
        </main>
      </div>
      <BottomMobileNav />
    </div>
  );
}
