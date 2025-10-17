import { Product } from "@/types";

export const productsData: Product[] = [
  {
    id: "1",
    name: "Super Dégraissant Pro",
    description: "Un dégraissant surpuissant pour les cuisines professionnelles. Élimine les graisses cuites et carbonisées.",
    price: 2500,
    image_url: "/placeholder.svg",
    utilityCategoryId: "9", // Dégraissants
    brandId: "11", // Force Xpress
  },
  {
    id: "2",
    name: "Nettoyant Vitres Éclat",
    description: "Formule sans traces pour des vitres et miroirs impeccables. Action rapide et séchage instantané.",
    price: 1350,
    image_url: "/placeholder.svg",
    utilityCategoryId: "5", // Détergents pour vitres
    brandId: "7", // Extra Clean
  },
  {
    id: "3",
    name: "Désinfectant Multi-Surfaces",
    description: "Tue 99.9% des bactéries et virus. Idéal pour les plans de travail, poignées de porte et sanitaires.",
    price: 1900,
    image_url: "/placeholder.svg",
    utilityCategoryId: "6", // Détergents désinfectants
    brandId: "12", // Forza Clean
  },
  {
    id: "4",
    name: "Shampoing Moquette Actif",
    description: "Nettoie en profondeur les fibres des tapis et moquettes, ravive les couleurs et laisse un parfum frais.",
    price: 3600,
    image_url: "/placeholder.svg",
    utilityCategoryId: "12", // Produits pour tapis et moquettes
    brandId: "21", // Netsol
  },
  {
    id: "5",
    name: "Cire Protectrice Sols",
    description: "Apporte une brillance durable et protège les sols durs (carrelage, lino) contre l'usure et les rayures.",
    price: 5600,
    image_url: "/placeholder.svg",
    utilityCategoryId: "4", // Détergents pour sols
    brandId: "33", // Dorilflor
  },
  {
    id: "6",
    name: "Gel WC Détartrant Pin",
    description: "Élimine le tartre et les dépôts calcaires, même sous le rebord. Laisse une odeur fraîche de pin.",
    price: 1150,
    image_url: "/placeholder.svg",
    utilityCategoryId: "11", // Nettoyants pour sanitaires
    brandId: "32", // Doril
  },
  {
    id: "7",
    name: "Liquide Vaisselle Citron",
    description: "Formule concentrée pour une vaisselle étincelante. Dégraisse efficacement et respecte les mains.",
    price: 950,
    image_url: "/placeholder.svg",
    utilityCategoryId: "2", // Détergents pour vaisselle
    brandId: "19", // MAMA menage
  },
  {
    id: "8",
    name: "Dépoussiérant Antistatique",
    description: "Capture la poussière sans la disperser et retarde sa réapparition grâce à son effet antistatique.",
    price: 1600,
    image_url: "/placeholder.svg",
    utilityCategoryId: "15", // Nettoyants pour meubles
    brandId: "27", // Swif
  },
];