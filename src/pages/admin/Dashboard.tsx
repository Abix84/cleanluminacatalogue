import { Link } from "react-router-dom";
import { useProducts } from "@/context/ProductContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, Download } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/alert-dialog"
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import DashboardStats from "@/components/admin/DashboardStats";
import CategoryManager from "@/components/admin/CategoryManager";
import { useCategories } from "@/context/CategoryContext";

const AdminDashboard = () => {
  const { products, deleteProduct } = useProducts();
  const { categories, getCategoryById } = useCategories();

  const handleDelete = (productId: string) => {
    deleteProduct(productId);
    toast.success("Produit supprimé avec succès.");
  };

  const handleExport = () => {
    const data = {
      products,
      categories,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `cleanexpress_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success("Données exportées avec succès !");
  };

  return (
    <div className="space-y-6">
      <DashboardStats />
      
      <div className="grid gap-6 md:grid-cols-2">
        <CategoryManager />
        
        <div>
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-semibold md:text-2xl">Produits</h2>
            <div className="ml-auto flex items-center gap-2">
              <Button onClick={handleExport} variant="outline" size="sm" className="h-8 gap-1">
                <Download className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Exporter</span>
              </Button>
              <Button asChild size="sm" className="h-8 gap-1">
                <Link to="/admin/products/new">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only">Ajouter</span>
                </Link>
              </Button>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Catalogue des produits</CardTitle>
              <CardDescription>Gérez vos produits ici.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden w-[64px] sm:table-cell">Image</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead className="hidden md:table-cell">Prix</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const category = product.categoryId ? getCategoryById(product.categoryId) : null;
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="hidden sm:table-cell">
                          <img
                            alt={product.name}
                            className="aspect-square rounded-md object-cover"
                            height="64"
                            src={product.image_url || "/placeholder.svg"}
                            width="64"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          {category ? (
                            <Badge style={{ backgroundColor: category.color, color: '#fff' }}>
                              {category.name}
                            </Badge>
                          ) : (
                            <Badge variant="outline">N/A</Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{formatPrice(product.price)}</TableCell>
                        <TableCell>
                          <AlertDialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                  <Link to={`/admin/products/edit/${product.id}`}>Modifier</Link>
                                </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
                                </AlertDialogTrigger>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible. Le produit "{product.name}" sera supprimé.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(product.id)}>Supprimer</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;