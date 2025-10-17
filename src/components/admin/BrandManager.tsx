import { useState } from "react";
import { useBrands } from "@/context/BrandContext";
import { useProducts } from "@/context/ProductContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const BrandManager = () => {
  const { brands, addBrand, deleteBrand } = useBrands();
  const { products } = useProducts();
  const [newBrandName, setNewBrandName] = useState("");

  const handleAddBrand = () => {
    if (newBrandName.trim() === "") {
      toast.error("Le nom de la marque ne peut pas être vide.");
      return;
    }
    addBrand({ name: newBrandName });
    toast.success(`Marque "${newBrandName}" ajoutée.`);
    setNewBrandName("");
  };

  const handleDeleteBrand = (brandId: string) => {
    const brand = brands.find(b => b.id === brandId);
    if (!brand) return;

    const productsInBrand = products.filter(p => p.brandId === brandId).length;
    if (productsInBrand > 0) {
      toast.error(`Impossible de supprimer "${brand.name}", car ${productsInBrand} produit(s) y sont associés.`);
      return;
    }

    deleteBrand(brandId);
    toast.success(`Marque "${brand.name}" supprimée.`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Marques</CardTitle>
        <CardDescription>Ajoutez ou supprimez des marques de produits.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Nom de la nouvelle marque"
            value={newBrandName}
            onChange={(e) => setNewBrandName(e.target.value)}
          />
          <Button onClick={handleAddBrand}>
            <PlusCircle className="h-4 w-4 mr-2" /> Ajouter
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Produits</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell className="font-medium">{brand.name}</TableCell>
                <TableCell>{products.filter(p => p.brandId === brand.id).length}</TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. La marque "{brand.name}" sera supprimée.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteBrand(brand.id)}>
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default BrandManager;