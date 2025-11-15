import { motion } from "framer-motion";
import { useContact } from "@/context/ContactContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Globe, Loader2, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Contact = () => {
  const { contactInfo, loading } = useContact();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!contactInfo) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Nous Contacter</h1>
          <p className="text-muted-foreground mb-6">
            Les informations de contact ne sont pas encore disponibles.
          </p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Nous Contacter</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            N'hésitez pas à nous contacter pour toute question ou demande d'information.
            Nous sommes là pour vous aider.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Email
              </CardTitle>
              <CardDescription>
                Envoyez-nous un email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href={`mailto:${contactInfo.email}`}
                className="text-lg font-medium hover:text-primary transition-colors block mb-4"
              >
                {contactInfo.email}
              </a>
              <Button asChild>
                <a href={`mailto:${contactInfo.email}`}>
                  <Send className="mr-2 h-4 w-4" />
                  Envoyer un email
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Phone */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Téléphone
              </CardTitle>
              <CardDescription>
                Appelez-nous directement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href={`tel:${contactInfo.phone}`}
                className="text-lg font-medium hover:text-primary transition-colors block mb-4"
              >
                {contactInfo.phone}
              </a>
              <Button asChild variant="outline">
                <a href={`tel:${contactInfo.phone}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  Appeler
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Address */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Adresse
            </CardTitle>
            <CardDescription>
              Notre localisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg">{contactInfo.address}</p>
              <p className="text-lg">
                {contactInfo.postalCode} {contactInfo.city}
              </p>
              <p className="text-lg">{contactInfo.country}</p>
            </div>
          </CardContent>
        </Card>

        {/* Website */}
        {contactInfo.website && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Site Web
              </CardTitle>
              <CardDescription>
                Visitez notre site web
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href={contactInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-medium hover:text-primary transition-colors block mb-4"
              >
                {contactInfo.website.replace(/^https?:\/\//, "")}
              </a>
              <Button asChild variant="outline">
                <a href={contactInfo.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-2 h-4 w-4" />
                  Visiter le site
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Back Button */}
        <div className="text-center">
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Contact;

