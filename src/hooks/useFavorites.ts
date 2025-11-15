import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import {
  getFavorites,
  addFavorite as addFavoriteFn,
  removeFavorite as removeFavoriteFn,
  toggleFavorite as toggleFavoriteFn,
  isFavorite as isFavoriteFn,
} from "@/lib/favorites";
import { toast } from "sonner";

const FAVORITES_QUERY_KEY = ["favorites"];

/**
 * Hook pour gérer les favoris d'un utilisateur
 */
export const useFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Récupérer les favoris
  const { data: favorites = [], isLoading, refetch } = useQuery({
    queryKey: [...FAVORITES_QUERY_KEY, user?.id],
    queryFn: () => getFavorites(user?.id),
    enabled: !!user || import.meta.env.VITE_OFFLINE_MODE === "true",
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Mutation pour ajouter un favori
  const addMutation = useMutation({
    mutationFn: (productId: string) => addFavoriteFn(productId, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
      toast.success("Produit ajouté aux favoris");
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Mutation pour supprimer un favori
  const removeMutation = useMutation({
    mutationFn: (productId: string) => removeFavoriteFn(productId, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
      toast.success("Produit retiré des favoris");
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Mutation pour toggle un favori
  const toggleMutation = useMutation({
    mutationFn: (productId: string) => toggleFavoriteFn(productId, user?.id),
    onSuccess: (isNowFavorite) => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
      if (isNowFavorite) {
        toast.success("Produit ajouté aux favoris");
      } else {
        toast.success("Produit retiré des favoris");
      }
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Vérifier si un produit est en favoris
  const checkIsFavorite = useCallback(
    (productId: string): boolean => {
      return favorites.includes(productId);
    },
    [favorites]
  );

  return {
    favorites,
    isLoading,
    addFavorite: addMutation.mutate,
    removeFavorite: removeMutation.mutate,
    toggleFavorite: toggleMutation.mutate,
    isFavorite: checkIsFavorite,
    refetch,
  };
};

