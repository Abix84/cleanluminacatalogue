import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useContact } from "@/context/ContactContext";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail, Phone, MapPin, Globe, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { IS_OFFLINE_MODE } from "@/integrations/supabase/client";

const formSchema = z.object({
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
  phone: z.string().min(1, { message: "Le numéro de téléphone est requis." }),
  address: z.string().min(1, { message: "L'adresse est requise." }),
  city: z.string().min(1, { message: "La ville est requise." }),
  postalCode: z.string().min(1, { message: "Le code postal est requis." }),
  country: z.string().min(1, { message: "Le pays est requis." }),
  website: z.string().url({ message: "Veuillez entrer une URL valide." }).optional().or(z.literal("")),
});

type ContactFormValues = z.infer<typeof formSchema>;

const ContactSettings = () => {
  const { contactInfo, updateContactInfo, loading, error } = useContact();
  const [isSaving, setIsSaving] = useState(false);
  const isOfflineMode = IS_OFFLINE_MODE;

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
      website: "",
    },
  });

  useEffect(() => {
    if (contactInfo) {
      form.reset({
        email: contactInfo.email,
        phone: contactInfo.phone,
        address: contactInfo.address,
        city: contactInfo.city,
        postalCode: contactInfo.postalCode,
        country: contactInfo.country,
        website: contactInfo.website || "",
      });
    }
  }, [contactInfo, form]);

  const onSubmit = async (data: ContactFormValues) => {
    try {
      setIsSaving(true);
      await updateContactInfo({
        ...data,
        website: data.website || undefined,
      });
    } catch (error: any) {
      console.error("Error updating contact info:", error);
      // L'erreur est déjà gérée dans le contexte avec toast
      // Mais on peut afficher plus de détails ici si nécessaire
      if (error?.code === "42P01" || error?.code === "PGRST205") {
        toast.error(
          "La table 'contact_info' n'existe pas. Veuillez exécuter le script SQL dans supabase/create_contact_info_table.sql dans Supabase SQL Editor.",
          { duration: 10000 }
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Informations de Contact</h1>
        <p className="text-muted-foreground mt-2">
          Gérez les informations de contact affichées sur le site
        </p>
      </div>

      {!isOfflineMode && (error?.code === "42P01" || error?.code === "PGRST205") && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Table manquante</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              La table <code className="px-1 py-0.5 bg-destructive/20 rounded">contact_info</code> n'existe pas dans votre base de données Supabase.
            </p>
            <p className="font-semibold">Pour résoudre ce problème :</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Allez dans votre projet Supabase</li>
              <li>Ouvrez le <strong>SQL Editor</strong></li>
              <li>Copiez et exécutez le contenu du fichier <code className="px-1 py-0.5 bg-muted rounded text-xs">supabase/create_contact_info_table.sql</code></li>
              <li>Attendez quelques secondes que PostgREST rafraîchisse son cache</li>
              <li>Réessayez de sauvegarder les informations</li>
            </ol>
            <p className="text-xs text-muted-foreground mt-2">
              Si l'erreur persiste après avoir créé la table, attendez 1-2 minutes pour que le cache PostgREST se rafraîchisse automatiquement.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Détails de Contact</CardTitle>
          <CardDescription>
            Ces informations seront affichées dans le footer et sur la page de contact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="contact@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Adresse email de contact principale
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Téléphone
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+33 1 23 45 67 89"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Numéro de téléphone de contact
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Adresse
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 Rue Example"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Adresse postale complète
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Paris"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code Postal</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="75001"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pays</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="France"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Site Web (optionnel)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://www.example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      URL du site web (optionnel)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    "Enregistrer les modifications"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactSettings;

