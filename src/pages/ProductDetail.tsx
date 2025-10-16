import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { MadeWithDyad } from "@/components/made-with-dyad";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
        setError("Produit non trouvé ou une erreur est survenue.");
      } else {
        setProduct(data as Product);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="w-full h-[400px] rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-2xl font-bold">Erreur</h2>
        <p className="mt-2 text-muted-foreground">{error || "Le produit que vous cherchez n'existe pas."}</p>
        <Button asChild className="mt-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour au catalogue
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
        <Button asChild variant="outline" className="mb-8">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour au catalogue
          </Link>
        </Button>
        <div className="grid md:grid-cols-2 gap-12">
            <div>
                <AspectRatio ratio={1}>
                    <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="rounded-lg object-cover w-full h-full border"
                    />
                </AspectRatio>
            </div>
            <div className="flex flex-col">
                {product.category && (
                    <Badge variant="secondary" className="w-fit mb-2">{product.category}</Badge>
                )}
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{product.name}</h1>
                <p className="text-3xl font-bold text-primary my-4">{formatPrice(product.price)}</p>
                <p className="text-muted-foreground leading-relaxed">
                    {product.description || "Aucune description disponible."}
                </p>
                <div className="mt-auto pt-6">
                    <Badge variant={product.quantity > 0 ? "default" : "destructive"} className="text-sm">
                        {product.quantity > 0 ? `En stock: ${product.quantity} unités` : "En rupture de stock"}
                    </Badge>
                </div>
            </div>
        </div>
        <footer className="mt-12">
            <MadeWithDyad />
        </footer>
    </div>
  );
};

export default ProductDetail;