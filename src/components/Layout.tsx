import Navbar from "./Navbar";
import Footer from "./Footer";
import { useCompanyThemeCSS } from "@/hooks/useCompanyThemeCSS";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  // Appliquer les variables CSS du thème de la compagnie
  useCompanyThemeCSS();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;