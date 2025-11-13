import React from "react";
import { Link } from "react-router-dom";
import { useCompanyThemeCSS } from "@/hooks/useCompanyThemeCSS";
import { useTheme } from "@/components/ThemeProvider";

const HomePage: React.FC = () => {
  // Appliquer les variables CSS du thème (même si aucune compagnie n'est sélectionnée)
  useCompanyThemeCSS();
  const { theme: colorTheme } = useTheme();

  // Couleurs spécifiques pour les cartes (basées sur les logos fournis)
  const cleanExpressColor = "#e73c1d";
  const luminaColor = "#273e92";

  return (
    <>
      {/* SEO Meta Tags - Sera géré par React Helmet dans App.tsx */}
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header Section */}
        <header className="py-8 md:py-12 lg:py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 dark:from-slate-200 dark:via-slate-300 dark:to-slate-400 bg-clip-text text-transparent">
              Choisissez votre catalogue
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 mt-4 max-w-2xl mx-auto">
              Sélectionnez une entreprise pour accéder à son catalogue de produits
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow container mx-auto px-4 pb-8 md:pb-12">
          <div className="w-full flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-6 md:gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* CleanExpress Card */}
            <Link
              to="/catalogue/cleanexpress"
              className="group w-full sm:w-[calc(50%-1rem)] lg:max-w-md h-[450px] sm:h-[500px] lg:h-[550px] rounded-2xl md:rounded-3xl shadow-lg hover:shadow-2xl p-6 md:p-8 flex flex-col items-center justify-between transition-all duration-300 ease-in-out transform hover:scale-[1.02] relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-red-500/50 dark:focus:ring-red-400/50"
              style={{
                background: cleanExpressColor,
              }}
              aria-label="Accéder au catalogue CleanExpress"
            >
              {/* Overlay effect */}
              <div className="absolute top-0 left-0 w-full h-full bg-black/5 group-hover:bg-black/0 transition-opacity duration-300" aria-hidden="true" />
              
              {/* Content */}
              <div className="z-10 flex flex-col items-center text-center flex-1 justify-center w-full">
                {/* Logo */}
                <div className="mb-6 md:mb-8">
                  <img 
                    src="/logos/cleanexpress-logo-dark.png" 
                    alt="Logo CleanExpress - Produits de nettoyage professionnels" 
                    className="w-[160px] h-[160px] sm:w-[180px] sm:h-[180px] md:w-[200px] md:h-[200px] object-contain drop-shadow-lg group-hover:drop-shadow-2xl transition-all duration-300"
                    loading="eager"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<span class="text-3xl font-bold text-white">CleanExpress</span>';
                      }
                    }}
                  />
                </div>

                {/* Title and Description */}
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-2 md:mb-3">
                  CleanExpress
                </h2>
                <p className="text-base sm:text-lg md:text-xl mt-2 text-white/95 font-medium">
                  Accéder au catalogue
                </p>
              </div>

              {/* CTA Button */}
              <button 
                className="z-10 mt-4 md:mt-6 bg-white text-[#e73c1d] font-bold py-3 px-6 md:px-8 rounded-xl shadow-xl transition-all duration-300 ease-in-out transform group-hover:scale-110 group-hover:shadow-2xl hover:bg-white/95 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Voir les produits CleanExpress"
              >
                Voir les produits
              </button>
            </Link>

            {/* Lumina Distribution Card */}
            <Link
              to="/catalogue/lumina-distribution"
              className="group w-full sm:w-[calc(50%-1rem)] lg:max-w-md h-[450px] sm:h-[500px] lg:h-[550px] rounded-2xl md:rounded-3xl shadow-lg hover:shadow-2xl p-6 md:p-8 flex flex-col items-center justify-between transition-all duration-300 ease-in-out transform hover:scale-[1.02] relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50"
              style={{
                background: luminaColor,
              }}
              aria-label="Accéder au catalogue Lumina Distribution"
            >
              {/* Overlay effect */}
              <div className="absolute top-0 left-0 w-full h-full bg-black/5 group-hover:bg-black/0 transition-opacity duration-300" aria-hidden="true" />
              
              {/* Content */}
              <div className="z-10 flex flex-col items-center text-center flex-1 justify-center w-full">
                {/* Logo */}
                <div className="mb-6 md:mb-8">
                  <img 
                    src="/logos/lumina-logo-dark.png" 
                    alt="Logo Lumina Distribution - Distribution de produits professionnels" 
                    className="w-[160px] h-[160px] sm:w-[180px] sm:h-[180px] md:w-[200px] md:h-[200px] object-contain drop-shadow-lg group-hover:drop-shadow-2xl transition-all duration-300"
                    loading="eager"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<span class="text-3xl font-bold text-white">Lumina</span>';
                      }
                    }}
                  />
                </div>

                {/* Title and Description */}
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-2xl mb-2 md:mb-3">
                  Lumina Distribution
                </h2>
                <p className="text-base sm:text-lg md:text-xl mt-2 text-white/95 font-medium drop-shadow-lg">
                  Accéder au catalogue
                </p>
              </div>

              {/* CTA Button */}
              <button 
                className="z-10 mt-4 md:mt-6 bg-white text-[#273e92] font-bold py-3 px-6 md:px-8 rounded-xl shadow-xl transition-all duration-300 ease-in-out transform group-hover:scale-110 group-hover:shadow-2xl hover:bg-white/95 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Voir les produits Lumina Distribution"
              >
                Voir les produits
              </button>
            </Link>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full text-center py-6 md:py-8 border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm mt-auto">
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
            © 2025 - Lumina Distribution & CleanExpress
          </p>
        </footer>
      </div>
    </>
  );
};

export default HomePage;
