import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrandManagement } from "@/components/admin/management/BrandManagement";
import { CategoryManagement } from "@/components/admin/management/CategoryManagement";
import { useAuth } from "@/context/AuthContext";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Tag, Layers } from "lucide-react";

export default function Management() {
  const { isAdmin } = useAuth();
  const isOfflineMode = import.meta.env.VITE_OFFLINE_MODE === "true";

  // Vérifier les permissions
  if (!isOfflineMode && !isAdmin) {
    return (
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Accès refusé</AlertTitle>
        <AlertDescription>
          Seuls les administrateurs peuvent accéder à la gestion des données.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <RequireAdmin>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* En-tête de la page */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100 mb-2">
            Gestion des Données
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            Gérez vos marques et catégories de produits
          </p>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="brands" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="brands" className="gap-2">
              <Tag className="h-4 w-4" />
              Marques
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <Layers className="h-4 w-4" />
              Catégories
            </TabsTrigger>
          </TabsList>

          {/* Contenu - Marques */}
          <TabsContent value="brands">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <BrandManagement />
            </div>
          </TabsContent>

          {/* Contenu - Catégories */}
          <TabsContent value="categories">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <CategoryManagement />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </RequireAdmin>
  );
}
