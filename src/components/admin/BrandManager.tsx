import { useState } from "react";
import { useBrands } from "@/context/BrandContext";
import { useProducts } from "@/context/ProductContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, PlusCircle, Pencil } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Brand } from "@/types";

const BrandManager = () => {
  const { brands, addBrand, deleteBrand, updateBrand } = useBrands();
  const { products } = useProducts();
  const [newBrandName, setNewBrandName] = useState("");

  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [editedName, setEditedName] = useState("");

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

  const handleEditClick = (brand: Brand) => {
    setEditingBrand(brand);
    setEditedName(brand.name);
  };

  const handleSaveChanges = () => {
    if (editingBrand && editedName.trim() !== "") {
      updateBrand({ ...editingBrand, name: editedName });
      toast.success("Marque mise à jour.");
      setEditingBrand(null);
    } else {
      toast.error("Le nom ne peut pas être vide.");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Marques</CardTitle>
          <CardDescription>Ajoutez, modifiez ou supprimez des marques.</CardDescription>
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
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(brand)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editingBrand !== null} onOpenChange={(isOpen) => !isOpen && setEditingBrand(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la marque</DialogTitle>
            <DialogDescription>
              Modifiez le nom de la marque "{editingBrand?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nom</Label>
              <Input id="name" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingBrand(null)}>Annuler</Button>
            <Button onClick={handleSaveChanges}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BrandManager;