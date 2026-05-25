import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PageTitle } from './PageTitle';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <PageTitle />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
