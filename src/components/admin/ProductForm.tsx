import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUtilityCategories } from "@/context/UtilityCategoryContextUnified";
import { useBrands } from "@/context/BrandContextUnified";
import { useEffect, useState, useRef } from "react";
import {
  Upload,
  Image as ImageIcon,
  X,
  Check,
  AlertCircle,
  Edit3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ImageEditor } from "./ImageEditor";
import { SearchableSelect } from "./SearchableSelect";

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: "Le prix doit être positif." }),
  utilityCategoryId: z.string().nullable(),
  brandId: z.string().nullable(),
  company: z.enum(["CleanExpress", "Lumina Distribution"], {
    required_error: "Veuillez sélectionner une entreprise",
  }),
  image_url: z.any().optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductFormValues) => void;
  isSaving: boolean;
  defaultCompany?: "CleanExpress" | "Lumina Distribution";
  defaultBrandId?: string | null;
  defaultUtilityCategoryId?: string | null;
  onBack?: () => void;
}

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const ProductForm = ({ initialData, onSubmit, isSaving, defaultCompany, defaultBrandId, defaultUtilityCategoryId, onBack }: ProductFormProps) => {
  const { utilityCategories } = useUtilityCategories();
  const { brands } = useBrands();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description || "",
      price: initialData.price,
      utilityCategoryId: initialData.utilityCategoryId,
      brandId: initialData.brandId,
      company: initialData.company || undefined,
      image_url: initialData.image_url,
    } : {
      name: "",
      description: "",
      price: 0,
      utilityCategoryId: defaultUtilityCategoryId || null,
      brandId: defaultBrandId || null,
      company: defaultCompany || undefined,
      image_url: null,
    },
  });

  // Filtrer les marques selon l'entreprise sélectionnée
  const selectedCompany = form.watch("company");
  const availableBrands = selectedCompany
    ? brands.filter((brand) => {
      if (selectedCompany === "Lumina Distribution") {
        // Lumina Distribution : seulement "Force Xpress"
        return brand.name === "Force Xpress";
      } else if (selectedCompany === "CleanExpress") {
        // CleanExpress : toutes les marques sauf "Force Xpress"
        return brand.name !== "Force Xpress";
      }
      return true;
    })
    : brands;

  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image_url || null,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageValue = form.watch("image_url");

  // Fonction pour redimensionner l'image si elle dépasse 1000x1000px
  const resizeImageIfNeeded = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          // Si l'image est déjà petite, on la garde telle quelle
          if (img.width <= 1000 && img.height <= 1000) {
            resolve(file);
            return;
          }

          // Calculer les nouvelles dimensions en gardant le ratio
          let newWidth = img.width;
          let newHeight = img.height;

          if (img.width > 1000 || img.height > 1000) {
            const ratio = Math.min(1000 / img.width, 1000 / img.height);
            newWidth = Math.round(img.width * ratio);
            newHeight = Math.round(img.height * ratio);
          }

          // Créer un canvas pour redimensionner
          const canvas = document.createElement("canvas");
          canvas.width = newWidth;
          canvas.height = newHeight;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            // Convertir en blob puis en file
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const resizedFile = new File([blob], file.name, {
                    type: "image/jpeg",
                    lastModified: Date.now(),
                  });
                  resolve(resizedFile);
                } else {
                  resolve(file);
                }
              },
              "image/jpeg",
              0.92,
            );
          } else {
            resolve(file);
          }
        };
        img.src = e.target?.result as string;
      };

      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    if (imageValue instanceof File) {
      // Validate file
      if (imageValue.size > MAX_FILE_SIZE) {
        setImageError("L'image est trop grande (max 5MB)");
        return;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(imageValue.type)) {
        setImageError("Format non supporté (JPEG, PNG, WebP uniquement)");
        return;
      }

      setImageError(null);

      // Redimensionner l'image si nécessaire avant l'aperçu
      resizeImageIfNeeded(imageValue).then((resizedFile) => {
        // Si l'image a été redimensionnée, mettre à jour le formulaire
        if (resizedFile !== imageValue) {
          form.setValue("image_url", resizedFile);
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(resizedFile);
      });
    } else if (typeof imageValue === "string") {
      setImagePreview(imageValue);
      setImageError(null);
    }
  }, [imageValue, form]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      form.setValue("image_url", files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      form.setValue("image_url", files[0]);
    }
  };

  const handleRemoveImage = () => {
    form.setValue("image_url", null);
    setImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleEditImage = () => {
    if (imagePreview) {
      setImageToEdit(imagePreview);
      setIsEditorOpen(true);
    }
  };

  const handleSaveEditedImage = (croppedImage: Blob) => {
    // Convertir le Blob en File
    const file = new File([croppedImage], "edited-image.png", {
      type: "image/png",
    });
    form.setValue("image_url", file);
    setImageToEdit(null);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne Gauche : Champs du formulaire */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <CardTitle>Détails du produit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Nom */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du produit</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Nettoyant Multi-surfaces" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Description détaillée du produit..."
                          className="min-h-[100px]"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Ligne : Entreprise & Marque */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entreprise <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <SearchableSelect
                            value={field.value ?? undefined}
                            onValueChange={(value) => {
                              field.onChange(value);
                              form.setValue("brandId", null);
                            }}
                            options={[
                              { value: "CleanExpress", label: "CleanExpress" },
                              { value: "Lumina Distribution", label: "Lumina Distribution" },
                            ]}
                            placeholder="Sélectionnez une entreprise"
                            searchPlaceholder="Rechercher..."
                            emptyText="Aucune entreprise trouvée."
                            disabled={!!defaultCompany}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marque</FormLabel>
                        <FormControl>
                          <SearchableSelect
                            value={field.value ?? undefined}
                            onValueChange={field.onChange}
                            options={availableBrands.map((brand) => ({
                              value: brand.id,
                              label: brand.name,
                            }))}
                            placeholder={
                              selectedCompany
                                ? "Sélectionnez une marque"
                                : "Sélectionnez d'abord une entreprise"
                            }
                            searchPlaceholder="Rechercher..."
                            emptyText="Aucune marque trouvée."
                            disabled={!selectedCompany}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Ligne : Catégorie & Prix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="utilityCategoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catégorie</FormLabel>
                        <FormControl>
                          <SearchableSelect
                            value={field.value ?? undefined}
                            onValueChange={field.onChange}
                            options={utilityCategories.map((cat) => ({
                              value: cat.id,
                              label: cat.name,
                              color: cat.color,
                            }))}
                            placeholder="Sélectionnez une catégorie"
                            searchPlaceholder="Rechercher..."
                            emptyText="Aucune catégorie trouvée."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="pl-12"
                              {...field}
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                              DZD
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end mt-auto">
              <Button type="submit" disabled={isSaving} size="lg" className="w-full md:w-auto">
                {isSaving ? "Enregistrement..." : "Enregistrer le produit"}
              </Button>
            </div>
          </div>

          {/* Colonne Droite : Image */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <Card className="border-2 border-dashed flex-1 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Photo du Produit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="image_url"
                  render={() => (
                    <FormItem>
                      {/* Zone de drag & drop / Preview */}
                      <div
                        className={cn(
                          "relative rounded-lg border-2 border-dashed transition-all aspect-square flex flex-col items-center justify-center max-w-[300px] mx-auto",
                          isDragging && "border-primary bg-primary/5 scale-105",
                          !isDragging && "border-muted-foreground/25",
                          imagePreview && "border-solid p-0",
                        )}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        {imagePreview ? (
                          // Preview de l'image
                          <div className="relative group w-full h-full">
                            <img
                              src={imagePreview}
                              alt="Aperçu"
                              className="w-full h-full rounded-lg object-cover"
                            />
                            {/* Overlay au hover */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                              <Button
                                type="button"
                                variant="default"
                                size="sm"
                                onClick={handleEditImage}
                                className="gap-2"
                              >
                                <Edit3 className="h-4 w-4" />
                                Éditer
                              </Button>
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={openFilePicker}
                              >
                                <Upload className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={handleRemoveImage}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            {/* Badge de confirmation */}
                            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                              <Check className="h-4 w-4" />
                            </div>
                          </div>
                        ) : (
                          // Zone de drop
                          <div
                            className="flex flex-col items-center justify-center p-4 cursor-pointer text-center w-full h-full"
                            onClick={openFilePicker}
                          >
                            <div
                              className={cn(
                                "rounded-full p-4 mb-4 transition-colors",
                                isDragging ? "bg-primary/20" : "bg-muted",
                              )}
                            >
                              <Upload
                                className={cn(
                                  "h-8 w-8 transition-colors",
                                  isDragging
                                    ? "text-primary"
                                    : "text-muted-foreground",
                                )}
                              />
                            </div>
                            <p className="text-sm font-medium mb-1">
                              {isDragging
                                ? "Déposez l'image ici"
                                : "Glissez-déposez une image"}
                            </p>
                            <p className="text-xs text-muted-foreground mb-4">
                              ou cliquez pour parcourir
                            </p>
                            <p className="text-xs text-muted-foreground">
                              JPEG, PNG, WebP (max 5MB)
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Input file caché */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {/* Message d'erreur */}
                      {imageError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{imageError}</AlertDescription>
                        </Alert>
                      )}

                      <FormDescription className="text-center">
                        Recommandé : 800x800px, format JPEG
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Conseils rapides */}
                <div className="rounded-lg bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/10 p-4 space-y-2">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <span className="text-lg">✨</span>
                    Conseils
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Redimensionnement auto 1000px</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Fond blanc recommandé</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Bouton Retour (Aligné à gauche) */}
            {onBack && (
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="w-full mt-auto"
              >
                Retour à l'administration
              </Button>
            )}
          </div>
        </div>

        {/* Éditeur d'images */}
        {imageToEdit && (
          <ImageEditor
            open={isEditorOpen}
            onOpenChange={setIsEditorOpen}
            imageSrc={imageToEdit}
            onSave={handleSaveEditedImage}
          />
        )}
      </form>
    </Form>
  );
};

export default ProductForm;
