import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductForm from "@/components/admin/ProductForm";
import { useProducts } from "@/context/ProductContextUnified";
import { useAuth } from "@/context/AuthContext";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Building2 } from "lucide-react";
import { toast } from "sonner";
import { ProductFormData } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AddProduct = () => {
  const navigate = useNavigate();
  const { addProduct } = useProducts();
  const { isAdmin } = useAuth();
  const isOfflineMode = import.meta.env.VITE_OFFLINE_MODE === "true";
  const [selectedCompany, setSelectedCompany] = useState<"CleanExpress" | "Lumina Distribution" | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formKey, setFormKey] = useState(0); // Clé pour forcer la réinitialisation du formulaire
  const [lastBrandId, setLastBrandId] = useState<string | null>(null);
  const [lastUtilityCategoryId, setLastUtilityCategoryId] = useState<string | null>(null);

  // Vérifier les permissions
  if (!isOfflineMode && !isAdmin) {
    return (
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Accès refusé</AlertTitle>
        <AlertDescription>
          Seuls les administrateurs peuvent ajouter des produits.
        </AlertDescription>
      </Alert>
    );
  }

  const handleSubmit = async (data: ProductFormData) => {
    try {
      setIsSaving(true);
      await addProduct(data);

      // Sauvegarder la marque et la catégorie pour le prochain ajout
      if (data.brandId) setLastBrandId(data.brandId);
      if (data.utilityCategoryId) setLastUtilityCategoryId(data.utilityCategoryId);

      setIsSaving(false);
      // Le toast.success est déjà affiché dans addProduct
      // Réinitialiser le formulaire en changeant la clé pour permettre l'ajout d'un autre produit
      setFormKey(prev => prev + 1);
    } catch (error) {
      setIsSaving(false);
      // L'erreur est déjà gérée dans addProduct avec toast.error
    }
  };

  // Si aucune entreprise n'est sélectionnée, afficher la sélection
  if (!selectedCompany) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Ajouter un nouveau produit</h1>
          <p className="text-muted-foreground">
            Sélectionnez d'abord l'entreprise pour laquelle vous souhaitez ajouter un produit
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 max-w-2xl">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow flex flex-col h-full"
            onClick={() => setSelectedCompany("CleanExpress")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                CleanExpress
              </CardTitle>
              <CardDescription>
                Ajouter un produit pour CleanExpress
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button className="w-full" variant="outline">
                Sélectionner
              </Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow flex flex-col h-full"
            onClick={() => setSelectedCompany("Lumina Distribution")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Lumina Distribution
              </CardTitle>
              <CardDescription>
                Ajouter un produit pour Lumina Distribution
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button className="w-full" variant="outline">
                Sélectionner
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Afficher le formulaire avec l'entreprise sélectionnée
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Ajouter un nouveau produit</h1>
          <p className="text-muted-foreground">
            Entreprise : <span className="font-semibold">{selectedCompany}</span>
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setSelectedCompany(null)}
        >
          Changer d'entreprise
        </Button>
      </div>
      <ProductForm
        key={formKey} // Réinitialise le formulaire quand la clé change
        onSubmit={handleSubmit}
        isSaving={isSaving}
        defaultCompany={selectedCompany}
        defaultBrandId={lastBrandId}
        defaultUtilityCategoryId={lastUtilityCategoryId}
        onBack={() => navigate("/admin")}
      />
    </div>
  );
};

export default AddProduct;
