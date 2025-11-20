import { useState } from "react";
import { useUtilityCategories } from "@/context/UtilityCategoryContextUnified";
import { useProducts } from "@/context/ProductContextUnified";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, PlusCircle, Pencil, Loader2 } from "lucide-react";
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
import { UtilityCategory } from "@/types";

const UtilityCategoryManager = () => {
  const { utilityCategories, addUtilityCategory, deleteUtilityCategory, updateUtilityCategory } = useUtilityCategories();
  const { products } = useProducts();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#0A66DD");
  const [isAdding, setIsAdding] = useState(false);

  const [editingCategory, setEditingCategory] = useState<UtilityCategory | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedColor, setEditedColor] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddCategory = async () => {
    if (newCategoryName.trim() === "") {
      toast.error("Le nom de la catégorie ne peut pas être vide.");
      return;
    }
    setIsAdding(true);
    await addUtilityCategory({ name: newCategoryName, color: newCategoryColor });
    toast.success(`Catégorie "${newCategoryName}" ajoutée.`);
    setNewCategoryName("");
    setIsAdding(false);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = utilityCategories.find(c => c.id === categoryId);
    if (!category) return;

    const productsInCategory = products.filter(p => p.utilityCategoryId === categoryId).length;
    if (productsInCategory > 0) {
      toast.error(`Impossible de supprimer "${category.name}", car ${productsInCategory} produit(s) y sont associés.`);
      return;
    }

    deleteUtilityCategory(categoryId);
    toast.success(`Catégorie "${category.name}" supprimée.`);
  };

  const handleEditClick = (category: UtilityCategory) => {
    setEditingCategory(category);
    setEditedName(category.name);
    setEditedColor(category.color);
  };

  const handleSaveChanges = async () => {
    if (editingCategory && editedName.trim() !== "") {
      setIsSaving(true);
      await updateUtilityCategory({ ...editingCategory, name: editedName, color: editedColor });
      toast.success("Catégorie mise à jour.");
      setEditingCategory(null);
      setIsSaving(false);
    } else {
      toast.error("Le nom ne peut pas être vide.");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Catégories d'Utilité</CardTitle>
          <CardDescription>Ajoutez, modifiez ou supprimez des catégories.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Nom de la nouvelle catégorie"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              disabled={isAdding}
            />
            <Input
              type="color"
              value={newCategoryColor}
              onChange={(e) => setNewCategoryColor(e.target.value)}
              className="w-12 p-1"
              disabled={isAdding}
            />
            <Button onClick={handleAddCategory} disabled={isAdding}>
              {isAdding ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4 mr-2" />
              )}
              {isAdding ? "Ajout..." : "Ajouter"}
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
              {utilityCategories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: cat.color }} />
                  </TableCell>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell>{products.filter(p => p.utilityCategoryId === cat.id).length}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(cat)}>
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editingCategory !== null} onOpenChange={(isOpen) => !isOpen && setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la catégorie</DialogTitle>
            <DialogDescription>
              Modifiez les détails de la catégorie "{editingCategory?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nom</Label>
              <Input id="name" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">Couleur</Label>
              <Input id="color" type="color" value={editedColor} onChange={(e) => setEditedColor(e.target.value)} className="col-span-3 p-1 h-10" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>Annuler</Button>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UtilityCategoryManager;