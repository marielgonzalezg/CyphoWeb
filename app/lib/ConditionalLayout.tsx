'use client'

import { usePathname } from 'next/navigation';
import Header from '../components/header';
import Footer from '../components/footer';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col max-w-[1300px] mx-auto bg-white text-sm">
      <Header />
      {children}
      <Footer />
    </div>
  );
}