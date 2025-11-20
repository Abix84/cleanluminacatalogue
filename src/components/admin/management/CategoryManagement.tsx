import { useState, useMemo } from "react";
import { useUtilityCategories } from "@/context/UtilityCategoryContextUnified";
import { UtilityCategory } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

// Couleurs prédéfinies populaires
const PRESET_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#10b981", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#f59e0b", // amber
  "#f97316", // orange
  "#ef4444", // red
  "#ec4899", // pink
  "#6366f1", // indigo
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#2563eb", // blue-600
  "#16a34a", // green-600
  "#dc2626", // red-600
  "#ca8a04", // yellow-600
  "#0891b2", // cyan-600
  "#7c3aed", // violet-600
  "#db2777", // pink-600
  "#4338ca", // indigo-700
];

export const CategoryManagement = () => {
  const {
    utilityCategories,
    addUtilityCategory,
    updateUtilityCategory,
    deleteUtilityCategory,
    loading,
  } = useUtilityCategories();

  // États pour le formulaire
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<UtilityCategory | null>(null);
  const [formData, setFormData] = useState({ name: "", color: "#3b82f6" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // États pour la suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] =
    useState<UtilityCategory | null>(null);

  // État pour la recherche
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrer les catégories par recherche
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return utilityCategories;
    return utilityCategories.filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [utilityCategories, searchTerm]);

  // Ouvrir le formulaire pour ajouter
  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({ name: "", color: "#3b82f6" });
    setIsFormOpen(true);
  };

  // Ouvrir le formulaire pour modifier
  const handleEdit = (category: UtilityCategory) => {
    setEditingCategory(category);
    setFormData({ name: category.name, color: category.color });
    setIsFormOpen(true);
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Le nom de la catégorie est requis");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingCategory) {
        // Modification
        await updateUtilityCategory({
          ...editingCategory,
          name: formData.name.trim(),
          color: formData.color,
        });
        toast.success("Catégorie modifiée avec succès");
      } else {
        // Ajout
        await addUtilityCategory({
          name: formData.name.trim(),
          color: formData.color,
        });
        toast.success("Catégorie ajoutée avec succès");
      }

      setIsFormOpen(false);
      setFormData({ name: "", color: "#3b82f6" });
      setEditingCategory(null);
    } catch (error) {
      toast.error(
        editingCategory
          ? "Erreur lors de la modification"
          : "Erreur lors de l'ajout"
      );
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ouvrir le dialogue de confirmation de suppression
  const handleDeleteClick = (category: UtilityCategory) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  // Confirmer la suppression
  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteUtilityCategory(categoryToDelete.id);
      toast.success("Catégorie supprimée avec succès");
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            Gestion des Catégories
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {utilityCategories.length} catégorie
            {utilityCategories.length > 1 ? "s" : ""} au total
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter une catégorie
        </Button>
      </div>

      {/* Barre de recherche */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
        <Input
          type="text"
          placeholder="Rechercher une catégorie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tableau des catégories */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Couleur</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  {searchTerm
                    ? "Aucune catégorie trouvée"
                    : "Aucune catégorie disponible"}
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">
                    {category.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-md border shadow-sm"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        {category.color}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {category.createdAt
                      ? new Date(category.createdAt).toLocaleDateString(
                        "fr-FR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                        className="gap-2"
                      >
                        <Pencil className="h-4 w-4" />
                        Modifier
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(category)}
                        className="gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="h-4 w-4" />
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Formulaire */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCategory
                ? "Modifier la catégorie"
                : "Ajouter une catégorie"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Modifiez les informations de la catégorie."
                : "Ajoutez une nouvelle catégorie à votre catalogue."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nom de la catégorie <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ex: Lessives liquides et en poudre"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">
                  Couleur <span className="text-red-500">*</span>
                </Label>

                {/* Aperçu de la couleur sélectionnée */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                  <div
                    className="w-12 h-12 rounded-md border-2 border-white dark:border-slate-700 shadow-md"
                    style={{ backgroundColor: formData.color }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium dark:text-slate-200">Couleur actuelle</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{formData.color}</p>
                  </div>
                </div>

                {/* Couleurs prédéfinies */}
                <div>
                  <p className="text-sm font-medium mb-2 dark:text-slate-200">
                    Couleurs prédéfinies
                  </p>
                  <div className="grid grid-cols-10 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-10 h-10 rounded-md border-2 transition-all hover:scale-110 ${formData.color === color
                            ? "border-gray-900 dark:border-slate-200 ring-2 ring-gray-900 dark:ring-slate-200 ring-offset-2 dark:ring-offset-slate-800"
                            : "border-gray-200 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-400"
                          }`}
                        style={{ backgroundColor: color }}
                        disabled={isSubmitting}
                      />
                    ))}
                  </div>
                </div>

                {/* Sélecteur de couleur personnalisé */}
                <div>
                  <p className="text-sm font-medium mb-2 dark:text-slate-200">
                    Couleur personnalisée
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className="w-20 h-10 cursor-pointer"
                      disabled={isSubmitting}
                    />
                    <Input
                      type="text"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      placeholder="#3b82f6"
                      className="flex-1"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Enregistrement..."
                  : editingCategory
                    ? "Enregistrer"
                    : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la catégorie "
              {categoryToDelete?.name}" ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
