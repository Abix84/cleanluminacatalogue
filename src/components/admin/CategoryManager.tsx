import { useState } from "react";
import { useCategories } from "@/context/CategoryContext";
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

const CategoryManager = () => {
  const { categories, addCategory, deleteCategory } = useCategories();
  const { products } = useProducts();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#0A66DD");

  const handleAddCategory = () => {
    if (newCategoryName.trim() === "") {
      toast.error("Le nom de la catégorie ne peut pas être vide.");
      return;
    }
    addCategory({ name: newCategoryName, color: newCategoryColor });
    toast.success(`Catégorie "${newCategoryName}" ajoutée.`);
    setNewCategoryName("");
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const productsInCategory = products.filter(p => p.categoryId === categoryId).length;
    if (productsInCategory > 0) {
      toast.error(`Impossible de supprimer "${category.name}", car ${productsInCategory} produit(s) y sont associés.`);
      return;
    }

    deleteCategory(categoryId);
    toast.success(`Catégorie "${category.name}" supprimée.`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Catégories</CardTitle>
        <CardDescription>Ajoutez ou supprimez des catégories de produits.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Nom de la nouvelle catégorie"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <Input
            type="color"
            value={newCategoryColor}
            onChange={(e) => setNewCategoryColor(e.target.value)}
            className="w-12 p-1"
          />
          <Button onClick={handleAddCategory}>
            <PlusCircle className="h-4 w-4 mr-2" /> Ajouter
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Couleur</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Produits</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: cat.color }} />
                </TableCell>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell>{products.filter(p => p.categoryId === cat.id).length}</TableCell>
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
                          Cette action est irréversible. La catégorie "{cat.name}" sera supprimée.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteCategory(cat.id)}>
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

export default CategoryManager;