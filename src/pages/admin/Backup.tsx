import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, Upload, RefreshCw, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { downloadBackup, loadBackupFile, restoreBackup, synchronizeData } from "@/lib/backup";
import { toast } from "sonner";


const Backup = () => {
  const isOfflineMode = false;

  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [restoreOptions, setRestoreOptions] = useState<{
    clearExisting: boolean;
    skipDuplicates: boolean;
  }>({
    clearExisting: false,
    skipDuplicates: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [backupInfo, setBackupInfo] = useState<{
    version: string;
    timestamp: string;
    metadata: {
      totalProducts: number;
      totalBrands: number;
      totalCategories: number;
      mode: string;
    };
  } | null>(null);

  const handleCreateBackup = async () => {
    try {
      setIsCreatingBackup(true);
      await downloadBackup();
    } catch (error) {
      console.error("Error creating backup:", error);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const backupData = await loadBackupFile(file);
      setSelectedFile(file);
      setBackupInfo({
        version: backupData.version,
        timestamp: backupData.timestamp,
        metadata: backupData.metadata,
      });
      setIsRestoreDialogOpen(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la lecture du fichier"
      );
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) return;

    try {
      const backupData = await loadBackupFile(selectedFile);
      await restoreBackup(backupData, restoreOptions);

      setIsRestoreDialogOpen(false);
      setSelectedFile(null);
      setBackupInfo(null);

      // Rafraîchir la page pour recharger les données
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error restoring backup:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la restauration"
      );
    }
  };

  const handleSynchronize = async () => {
    if (isOfflineMode) {
      toast.error("La synchronisation n'est disponible qu'en mode online");
      return;
    }

    try {
      setIsSyncing(true);
      const result = await synchronizeData();

      // Rafraîchir la page pour recharger les données
      if (result.errors === 0) {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error("Error synchronizing:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sauvegarde et Restauration</h1>
        <p className="text-muted-foreground mt-2">
          Gérez les sauvegardes de vos données, restaurez des backups et synchronisez vos données
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Créer un backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Créer un backup
            </CardTitle>
            <CardDescription>
              Téléchargez une sauvegarde complète de toutes vos données
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleCreateBackup}
              disabled={isCreatingBackup}
              className="w-full"
            >
              {isCreatingBackup ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger le backup
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Restaurer un backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Restaurer un backup
            </CardTitle>
            <CardDescription>
              Restaurez vos données depuis un fichier de backup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
                id="backup-file-input"
              />
              <Button
                onClick={() => document.getElementById("backup-file-input")?.click()}
                variant="outline"
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Sélectionner un fichier
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Synchroniser */}
        {!isOfflineMode && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Synchroniser
              </CardTitle>
              <CardDescription>
                Synchronisez les données entre localStorage et Supabase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleSynchronize}
                disabled={isSyncing}
                variant="outline"
                className="w-full"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Synchronisation...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Synchroniser
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Informations */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Les backups incluent tous les produits, marques et catégories</li>
            <li>Les images ne sont pas incluses dans le backup (seules les URLs sont sauvegardées)</li>
            <li>La restauration peut écraser les données existantes selon les options choisies</li>
            {isOfflineMode && (
              <li>Vous êtes en mode offline - la synchronisation n'est pas disponible</li>
            )}
          </ul>
        </AlertDescription>
      </Alert>

      {/* Dialog de restauration */}
      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Options de restauration</DialogTitle>
            <DialogDescription>
              Configurez les options de restauration pour le backup sélectionné
            </DialogDescription>
          </DialogHeader>

          {backupInfo && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-2">
                <h4 className="font-semibold">Informations du backup</h4>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>Version: {backupInfo.version}</p>
                  <p>Date: {new Date(backupInfo.timestamp).toLocaleString("fr-FR")}</p>
                  <p>Produits: {backupInfo.metadata.totalProducts}</p>
                  <p>Marques: {backupInfo.metadata.totalBrands}</p>
                  <p>Catégories: {backupInfo.metadata.totalCategories}</p>
                  <p>Mode: {backupInfo.metadata.mode}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Comportement en cas de doublons</Label>
                  <RadioGroup
                    value={restoreOptions.clearExisting ? "clear" : restoreOptions.skipDuplicates ? "skip" : "overwrite"}
                    onValueChange={(value) => {
                      if (value === "clear") {
                        setRestoreOptions({ clearExisting: true, skipDuplicates: false });
                      } else if (value === "skip") {
                        setRestoreOptions({ clearExisting: false, skipDuplicates: true });
                      } else {
                        setRestoreOptions({ clearExisting: false, skipDuplicates: false });
                      }
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="overwrite" id="overwrite" />
                      <Label htmlFor="overwrite" className="font-normal cursor-pointer">
                        Écraser les données existantes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="skip" id="skip" />
                      <Label htmlFor="skip" className="font-normal cursor-pointer">
                        Ignorer les doublons
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="clear" id="clear" />
                      <Label htmlFor="clear" className="font-normal cursor-pointer">
                        Supprimer toutes les données existantes avant la restauration
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {restoreOptions.clearExisting && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Attention !</AlertTitle>
                  <AlertDescription>
                    Toutes les données existantes seront supprimées avant la restauration.
                    Cette action est irréversible.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestoreDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleRestore} variant={restoreOptions.clearExisting ? "destructive" : "default"}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Restaurer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Backup;

