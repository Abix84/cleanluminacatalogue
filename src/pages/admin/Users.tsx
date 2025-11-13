import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { UserWithRole, UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users as UsersIcon, Plus, Pencil, Trash2, Shield, Eye } from "lucide-react";
import { toast } from "sonner";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Users = () => {
  const { isAdmin, refreshRole } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserWithRole | null>(null);
  const [formData, setFormData] = useState<{
    email: string;
    password: string;
    full_name: string;
    role: UserRole;
  }>({
    email: "",
    password: "",
    full_name: "",
    role: "vendeur",
  });

  // Charger les utilisateurs
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Essayer d'abord la fonction RPC
      let usersWithRoles: UserWithRole[] = [];
      
      try {
        const { data, error } = await supabase.rpc('get_users_with_profiles');
        
        if (!error && data) {
          // Transformer les données de la fonction RPC
          usersWithRoles = data.map((item: any) => ({
            id: item.user_id,
            email: item.email,
            role: item.role as UserRole,
            full_name: item.full_name,
            avatar_url: item.avatar_url,
            profile_created_at: item.profile_created_at,
            profile_updated_at: item.profile_updated_at,
          }));
        } else {
          throw new Error('RPC function failed');
        }
      } catch (rpcError) {
        console.warn('RPC function not available, using fallback method:', rpcError);
        
        // Fallback : récupérer directement depuis profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, role, avatar_url, created_at, updated_at')
          .order('created_at', { ascending: false });

        if (profilesError) throw profilesError;

        // Pour chaque profil, essayer de récupérer l'email depuis auth.users
        // Note: On ne peut pas accéder directement à auth.users depuis le client
        // On utilisera l'ID comme identifiant temporaire
        usersWithRoles = (profilesData || []).map((profile) => ({
          id: profile.id,
          email: profile.id, // Utiliser l'ID comme identifiant (l'email sera affiché si disponible via une autre méthode)
          role: profile.role as UserRole,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          profile_created_at: profile.created_at,
          profile_updated_at: profile.updated_at,
        }));

        // Essayer de récupérer les emails via une requête directe si possible
        // Note: Cette méthode nécessite que l'utilisateur soit admin
        try {
          // Pour chaque utilisateur, on peut essayer de récupérer l'email
          // mais cela nécessite des permissions spéciales
          // Pour l'instant, on affiche l'ID et on peut améliorer plus tard
        } catch (emailError) {
          console.warn('Could not fetch emails:', emailError);
        }
      }

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error(error.message || "Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  // Ouvrir le formulaire pour ajouter/modifier
  const handleOpenDialog = (user?: UserWithRole) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        password: "", // Ne pas préremplir le mot de passe
        full_name: user.full_name || "",
        role: user.role || "vendeur",
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: "",
        password: "",
        full_name: "",
        role: "vendeur",
      });
    }
    setIsDialogOpen(true);
  };

  // Sauvegarder le rôle ou créer un utilisateur
  const handleSave = async () => {
    try {
      if (editingUser) {
        // Modifier un utilisateur existant
        const { error } = await supabase
          .from("profiles")
          .update({
            role: formData.role,
            full_name: formData.full_name || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingUser.id);

        if (error) throw error;

        toast.success("Profil modifié avec succès");
        setIsDialogOpen(false);
        await fetchUsers();
        await refreshRole();
      } else {
        // Créer un nouvel utilisateur via Edge Function
        if (!formData.email || !formData.password) {
          toast.error("L'email et le mot de passe sont requis");
          return;
        }

        if (formData.password.length < 6) {
          toast.error("Le mot de passe doit contenir au moins 6 caractères");
          return;
        }

        // Appeler la Edge Function pour créer l'utilisateur
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Vous devez être connecté pour créer un utilisateur");
          return;
        }

        console.log('[Users] Creating user:', { email: formData.email, role: formData.role });

        const { data, error } = await supabase.functions.invoke('create-user', {
          body: {
            email: formData.email,
            password: formData.password,
            full_name: formData.full_name || null,
            role: formData.role,
          },
        });

        console.log('[Users] Function response:', { data, error });

        if (error) {
          console.error('[Users] Function error:', error);
          throw new Error(error.message || 'Erreur lors de l\'appel de la fonction');
        }

        if (data?.error) {
          console.error('[Users] Function returned error:', data.error);
          
          // Si l'utilisateur existe déjà, suggérer de le modifier
          if (data.error.includes('existe déjà') && data.existingUserId) {
            toast.error(data.error, {
              duration: 5000,
              action: {
                label: 'Modifier',
                onClick: async () => {
                  // Charger l'utilisateur existant et ouvrir le formulaire de modification
                  await fetchUsers();
                  const existingUser = users.find(u => u.id === data.existingUserId);
                  if (existingUser) {
                    handleOpenDialog(existingUser);
                  }
                },
              },
            });
            return;
          }
          
          throw new Error(data.error);
        }

        toast.success(`Utilisateur ${formData.role} créé avec succès !`);
        setIsDialogOpen(false);
        setFormData({
          email: "",
          password: "",
          full_name: "",
          role: "vendeur",
        });
        await fetchUsers();
      }
    } catch (error: any) {
      console.error("Error saving:", error);
      toast.error(error.message || "Erreur lors de la sauvegarde");
    }
  };

  // Supprimer un rôle
  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userToDelete.id);

      if (error) throw error;

      toast.success("Rôle supprimé avec succès");
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error("Erreur lors de la suppression du rôle");
    }
  };

  // Si pas admin, afficher un message
  if (!isAdmin) {
    return (
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Accès refusé</AlertTitle>
        <AlertDescription>
          Seuls les administrateurs peuvent gérer les utilisateurs.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <RequireAdmin>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Gestion des Utilisateurs
            </h1>
            <p className="text-muted-foreground">
              Gérez les rôles et les permissions des utilisateurs
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un utilisateur
          </Button>
        </div>

        {/* Tableau des utilisateurs */}
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
            <CardDescription>
              Liste de tous les utilisateurs et leurs rôles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Chargement...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun utilisateur trouvé
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.email && user.email !== user.id ? user.email : `ID: ${user.id.substring(0, 8)}...`}
                      </TableCell>
                      <TableCell>
                        {user.full_name ? (
                          <span>{user.full_name}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.role === "admin" ? (
                          <Badge variant="default" className="bg-blue-600">
                            <Shield className="h-3 w-3 mr-1" />
                            ADMIN
                          </Badge>
                        ) : user.role === "vendeur" ? (
                          <Badge variant="secondary" className="bg-green-600">
                            <Eye className="h-3 w-3 mr-1" />
                            VENDEUR
                          </Badge>
                        ) : user.role === "visiteur" ? (
                          <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            VISITEUR
                          </Badge>
                        ) : (
                          <Badge variant="outline">Aucun rôle</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.profile_created_at
                          ? new Date(user.profile_created_at).toLocaleDateString("fr-FR")
                          : user.user_created_at
                          ? new Date(user.user_created_at).toLocaleDateString("fr-FR")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setUserToDelete(user);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog Formulaire */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser
                  ? "Modifier le rôle de l'utilisateur"
                  : "Ajouter un utilisateur"}
              </DialogTitle>
              <DialogDescription>
                {editingUser
                  ? "Modifiez le rôle et les informations de l'utilisateur."
                  : "Créez un nouveau compte utilisateur avec un rôle."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={!!editingUser}
                  placeholder="exemple@email.com"
                  required
                />
              </div>

              {!editingUser && (
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Minimum 6 caractères"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Le mot de passe sera envoyé à l'utilisateur
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="full_name">Nom complet (optionnel)</Label>
                <Input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  placeholder="Prénom Nom"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value as UserRole })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        ADMIN - Accès complet
                      </div>
                    </SelectItem>
                    <SelectItem value="vendeur">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        VENDEUR - Lecture seule
                      </div>
                    </SelectItem>
                    <SelectItem value="visiteur">
                      <div className="flex items-center gap-2">
                        <UsersIcon className="h-4 w-4" />
                        VISITEUR - Accès catalogue
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button onClick={handleSave}>
                {editingUser ? "Enregistrer" : "Ajouter"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Confirmation de suppression */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer le rôle de l'utilisateur "
                {userToDelete?.email}" ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </RequireAdmin>
  );
};

export default Users;

