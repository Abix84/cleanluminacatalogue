import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductForm from "@/components/admin/ProductForm";
import { useProducts } from "@/context/ProductContext";
import { toast } from "sonner";

const AddProduct = () => {
  const navigate = useNavigate();
  const { addProduct } = useProducts();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (data: any) => {
    setIsSaving(true);
    addProduct(data);
    toast.success("Produit ajouté avec succès !");
    setTimeout(() => {
      navigate("/admin");
    }, 500);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Ajouter un nouveau produit</h1>
      <ProductForm onSubmit={handleSubmit} isSaving={isSaving} />
    </div>
  );
};

export default AddProduct;