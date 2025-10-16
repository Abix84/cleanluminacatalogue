import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ProductForm from "@/components/admin/ProductForm";
import { useProducts } from "@/context/ProductContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProductById, updateProduct } = useProducts();
  const [isSaving, setIsSaving] = useState(false);

  const product = id ? getProductById(id) : undefined;

  const handleSubmit = (data: any) => {
    if (!id) return;
    setIsSaving(true);
    updateProduct({ ...data, id });
    toast.success("Produit mis à jour avec succès !");
    setTimeout(() => {
      navigate("/admin");
    }, 500);
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
      <ProductForm initialData={product} onSubmit={handleSubmit} isSaving={isSaving} />
    </div>
  );
};

export default EditProduct;