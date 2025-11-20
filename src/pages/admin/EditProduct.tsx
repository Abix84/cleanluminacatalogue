import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ProductForm from "@/components/admin/ProductForm";
import { useProducts } from "@/context/ProductContextUnified";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProductById, updateProduct } = useProducts();
  const { isAdmin } = useAuth();
  const isOfflineMode = import.meta.env.VITE_OFFLINE_MODE === "true";
  const [isSaving, setIsSaving] = useState(false);

  const product = id ? getProductById(id) : undefined;

  // Vérifier les permissions
  if (!isOfflineMode && !isAdmin) {
    return (
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Accès refusé</AlertTitle>
        <AlertDescription>
          Seuls les administrateurs peuvent modifier des produits.
        </AlertDescription>
      </Alert>
    );
  }

  const handleSubmit = async (data: any) => {
    if (!product) return;
    setIsSaving(true);

    const { image_url, ...productData } = data;
    const imageFile = image_url instanceof File ? image_url : undefined;

    await updateProduct({ ...product, ...productData }, imageFile);

    setIsSaving(false);
    toast.success("Produit mis à jour avec succès !");
    navigate("/admin");
  };

  if (!product) {
    return (
      <div className="text-center">
        <p>Produit non trouvé.</p>
        <Button asChild variant="link">
          <Link to="/admin">Retour au tableau de bord</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button asChild variant="outline" size="sm" className="mb-4">
        <Link to="/admin">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Link>
      </Button>
      <h1 className="text-2xl font-bold mb-4">Modifier le produit</h1>
      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        isSaving={isSaving}
        defaultCompany={product.company || undefined}
      />
    </div>
  );
};

export default EditProduct;