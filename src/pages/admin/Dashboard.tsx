import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProducts } from "@/context/ProductContextUnified";
import { useUtilityCategories } from "@/context/UtilityCategoryContextUnified";
import { useBrands } from "@/context/BrandContextUnified";
import { useAuth } from "@/context/AuthContext";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import VendeurProfile from "@/components/admin/VendeurProfile";
import VendeurStats from "@/components/admin/VendeurStats";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  PlusCircle,
  Download,
  Stethoscope,
  Package,
  Tags,
  Layers,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  ImageIcon,
  Grid3x3,
  List,
  Filter,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/types";

const AdminDashboard = () => {
  const { products, deleteProduct } = useProducts();
  const { utilityCategories, getUtilityCategoryById } = useUtilityCategories();
  const { brands, getBrandById } = useBrands();
  const { isAdmin, isVendeur } = useAuth();
  const navigate = useNavigate();
  const isOfflineMode = import.meta.env.VITE_OFFLINE_MODE === "true";
  
  // En mode offline ou si admin, toutes les actions sont autorisées
  const canEdit = isOfflineMode || isAdmin;

  // États locaux
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Produits filtrés
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      product.utilityCategoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Stats
  const stats = {
    totalProducts: products.length,
    totalBrands: brands.length,
    totalCategories: utilityCategories.length,
    productsWithImages: products.filter((p) => p.image_url).length,
  };

  // Gestion de la suppression
  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id);
      toast.success("Produit supprimé avec succès");
      setProductToDelete(null);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  // Export des données
  const handleExport = () => {
    const data = {
      products,
      utilityCategories,
      brands,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2),
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `cleanexpress_backup_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    toast.success("Données exportées avec succès !");
  };

  // Ouvrir l'image en grand
  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  // Si vendeur, afficher le dashboard vendeur
  if (isVendeur) {
    return (
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Vendeur
          </h1>
          <p className="text-muted-foreground">
            Consultez votre catalogue de produits (lecture seule)
          </p>
        </div>

        {/* Profil vendeur */}
        <VendeurProfile />

        {/* Statistiques vendeur */}
        <VendeurStats />

        {/* Liste des produits (lecture seule) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Catalogue des Produits</h2>
          </div>

          {/* Filtres et recherche */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {utilityCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="gap-2"
              >
                <Grid3x3 className="h-4 w-4" />
                Grille
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="gap-2"
              >
                <List className="h-4 w-4" />
                Liste
              </Button>
            </div>
          </div>

          {/* Résultats */}
          {filteredProducts.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
                <p className="text-sm text-muted-foreground">
                  {products.length === 0
                    ? "Aucun produit disponible pour le moment"
                    : "Essayez de modifier vos filtres"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => {
                    const category = product.utilityCategoryId
                      ? getUtilityCategoryById(product.utilityCategoryId)
                      : null;
                    const brand = product.brandId
                      ? getBrandById(product.brandId)
                      : null;

                    return (
                      <Card
                        key={product.id}
                        className="group cursor-pointer hover:shadow-lg transition-shadow"
                      >
                        <div
                          className="relative aspect-square overflow-hidden rounded-t-lg bg-muted"
                          onClick={() => handleImageClick(product.image_url || "")}
                        >
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Package className="h-12 w-12 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <h3 className="font-semibold line-clamp-1">
                              {product.name}
                            </h3>
                            <p className="text-2xl font-bold text-primary">
                              {formatPrice(product.price)}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {category && (
                                <Badge
                                  variant="secondary"
                                  style={{
                                    backgroundColor: category.color + "20",
                                    color: category.color,
                                  }}
                                >
                                  {category.name}
                                </Badge>
                              )}
                              {brand && (
                                <Badge variant="outline">{brand.name}</Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map((product) => {
                    const category = product.utilityCategoryId
                      ? getUtilityCategoryById(product.utilityCategoryId)
                      : null;
                    const brand = product.brandId
                      ? getBrandById(product.brandId)
                      : null;

                    return (
                      <Card key={product.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div
                              className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted cursor-pointer"
                              onClick={() => handleImageClick(product.image_url || "")}
                            >
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <Package className="h-8 w-8 text-muted-foreground/50" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">
                                {product.name}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {product.description}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {category && (
                                  <Badge
                                    variant="secondary"
                                    style={{
                                      backgroundColor: category.color + "20",
                                      color: category.color,
                                    }}
                                  >
                                    {category.name}
                                  </Badge>
                                )}
                                {brand && (
                                  <Badge variant="outline">{brand.name}</Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-primary">
                                {formatPrice(product.price)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal d'image */}
        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogContent className="max-w-4xl">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Produit"
                className="w-full h-auto rounded-lg"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Dashboard Admin (code existant)
  return (
    <div className="space-y-6 pb-8">
      {/* Header avec stats */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Dashboard Admin
            </h1>
            <p className="text-muted-foreground">
              Gérez votre catalogue de produits
            </p>
          </div>
          <div className="flex items-center gap-2">
            <RequireAdmin fallback={null}>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Exporter
              </Button>
              <Button variant="outline" size="sm" asChild className="gap-2">
                <Link to="/admin/diagnostic">
                  <Stethoscope className="h-4 w-4" />
                  Diagnostic
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="gap-2">
                <Link to="/admin/management">
                  <Settings className="h-4 w-4" />
                  Gestion
                </Link>
              </Button>
            </RequireAdmin>
            <RequireAdmin fallback={null}>
              <Button size="sm" asChild className="gap-2">
                <Link to="/admin/products/new">
                  <PlusCircle className="h-4 w-4" />
                  Nouveau Produit
                </Link>
              </Button>
            </RequireAdmin>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Produits
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.productsWithImages} avec images
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Photos</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.productsWithImages}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalProducts - stats.productsWithImages} sans image
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Catégories</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCategories}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Marques</CardTitle>
              <Tags className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBrands}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Filtres et recherche */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {utilityCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="gap-2"
          >
            <Grid3x3 className="h-4 w-4" />
            Grille
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="gap-2"
          >
            <List className="h-4 w-4" />
            Liste
          </Button>
        </div>
      </div>

      {/* Résultats */}
      {filteredProducts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {products.length === 0
                ? "Commencez par ajouter votre premier produit"
                : "Essayez de modifier vos filtres"}
            </p>
            {canEdit && (
              <RequireAdmin fallback={null}>
                <Button asChild>
                  <Link to="/admin/products/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter un produit
                  </Link>
                </Button>
              </RequireAdmin>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Vue Grille */}
          {viewMode === "grid" && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const category = product.utilityCategoryId
                  ? getUtilityCategoryById(product.utilityCategoryId)
                  : null;
                const brand = product.brandId
                  ? getBrandById(product.brandId)
                  : null;

                return (
                  <Card
                    key={product.id}
                    className="overflow-hidden group hover:shadow-lg transition-all"
                  >
                    {/* Image */}
                    <div className="relative aspect-square bg-muted">
                      {product.image_url ? (
                        <>
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                            onClick={() => handleImageClick(product.image_url!)}
                          />
                          <Button
                            size="icon"
                            variant="secondary"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleImageClick(product.image_url!)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
                        </div>
                      )}
                      {/* Badge catégorie */}
                      {category && (
                        <Badge
                          className="absolute bottom-2 left-2"
                          style={{
                            backgroundColor: category.color,
                            color: "#fff",
                          }}
                        >
                          {category.name}
                        </Badge>
                      )}
                    </div>

                    {/* Contenu */}
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">
                            {product.name}
                          </h3>
                          {brand && (
                            <p className="text-xs text-muted-foreground">
                              {brand.name}
                            </p>
                          )}
                        </div>
                        {canEdit && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <RequireAdmin fallback={null}>
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(`/admin/products/edit/${product.id}`)
                                  }
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                              </RequireAdmin>
                              {product.image_url && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleImageClick(product.image_url!)
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Voir l'image
                                </DropdownMenuItem>
                              )}
                              <RequireAdmin fallback={null}>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setProductToDelete(product)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Supprimer
                                </DropdownMenuItem>
                              </RequireAdmin>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-primary">
                          {formatPrice(product.price)}
                        </div>
                        {!product.image_url && (
                          <Badge variant="outline" className="text-xs">
                            Sans image
                          </Badge>
                        )}
                      </div>

                      {product.description && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </CardContent>

                    {/* Actions rapides - Admin uniquement */}
                    {canEdit && (
                      <RequireAdmin fallback={null}>
                        <div className="border-t p-2 bg-muted/50">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() =>
                              navigate(`/admin/products/edit/${product.id}`)
                            }
                          >
                            <Edit className="mr-2 h-3 w-3" />
                            Modifier la photo
                          </Button>
                        </div>
                      </RequireAdmin>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Vue Liste */}
          {viewMode === "list" && (
            <Card>
              <ScrollArea className="h-[600px]">
                <div className="divide-y">
                  {filteredProducts.map((product) => {
                    const category = product.utilityCategoryId
                      ? getUtilityCategoryById(product.utilityCategoryId)
                      : null;
                    const brand = product.brandId
                      ? getBrandById(product.brandId)
                      : null;

                    return (
                      <div
                        key={product.id}
                        className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                      >
                        {/* Image miniature */}
                        <div
                          className="w-20 h-20 rounded-md bg-muted flex-shrink-0 overflow-hidden cursor-pointer"
                          onClick={() =>
                            product.image_url &&
                            handleImageClick(product.image_url)
                          }
                        >
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>

                        {/* Infos */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{product.name}</h3>
                            {category && (
                              <Badge
                                variant="outline"
                                style={{
                                  borderColor: category.color,
                                  color: category.color,
                                }}
                              >
                                {category.name}
                              </Badge>
                            )}
                          </div>
                          {brand && (
                            <p className="text-sm text-muted-foreground">
                              {brand.name}
                            </p>
                          )}
                          {product.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                              {product.description}
                            </p>
                          )}
                        </div>

                        {/* Prix */}
                        <div className="text-lg font-bold text-primary whitespace-nowrap">
                          {formatPrice(product.price)}
                        </div>

                        {/* Actions - Admin uniquement */}
                        {canEdit && (
                          <RequireAdmin fallback={null}>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  navigate(`/admin/products/edit/${product.id}`)
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setProductToDelete(product)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </RequireAdmin>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </Card>
          )}
        </>
      )}

      {/* Dialog de confirmation de suppression */}
      <AlertDialog
        open={!!productToDelete}
        onOpenChange={() => setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le produit "
              {productToDelete?.name}" ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal d'aperçu d'image */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Aperçu"
              className="w-full h-auto max-h-[90vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
