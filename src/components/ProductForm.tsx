import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Product } from "@/types";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";

const formSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  description: z.string().optional(),
  price: z.coerce.number().positive({ message: "Le prix doit être un nombre positif." }),
  quantity: z.coerce.number().int().min(0, { message: "La quantité ne peut être négative." }),
  image_url: z.string().url({ message: "Veuillez entrer une URL d'image valide." }).optional().or(z.literal('')),
  category: z.string().optional(),
});

interface ProductFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  product: Product | null;
  onSuccess: () => void;
}

const ProductForm = ({ isOpen, setIsOpen, product, onSuccess }: ProductFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      quantity: 0,
      image_url: "",
      category: "",
    },
  });

  useEffect(() => {
    if (product) {
      form.reset(product);
    } else {
      form.reset({
        name: "",
        description: "",
        price: 0,
        quantity: 0,
        image_url: "",
        category: "",
      });
    }
  }, [product, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let error;
    if (product) {
      // Update
      const { error: updateError } = await supabase
        .from("products")
        .update(values)
        .eq("id", product.id);
      error = updateError;
    } else {
      // Create
      const { error: insertError } = await supabase.from("products").insert([values]);
      error = insertError;
    }

    if (error) {
      showError(`Erreur: ${error.message}`);
    } else {
      showSuccess(`Produit ${product ? 'mis à jour' : 'ajouté'} avec succès !`);
      onSuccess();
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product ? "Modifier le produit" : "Ajouter un produit"}</DialogTitle>
          <DialogDescription>
            Remplissez les détails du produit ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du produit</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Super Dégraissant" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description du produit..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Prix (€)</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Quantité</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Cuisine" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de l'image</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">
                {product ? "Enregistrer les modifications" : "Créer le produit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;