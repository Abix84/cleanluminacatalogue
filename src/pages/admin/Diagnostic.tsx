import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { AlertCircle } from "lucide-react";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  PlayCircle,
  AlertTriangle,
  Database,
  FolderOpen,
  Upload,
  Eye,
  FileImage
} from "lucide-react";
import {
  runFullDiagnostic,
  checkSupabaseConnection,
  checkBucketExists,
  checkBucketIsPublic,
  listBucketFiles,
  testImageUpload,
  DiagnosticResult,
} from "@/utils/supabase-diagnostic";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DiagnosticResults {
  connection?: DiagnosticResult;
  bucketExists?: DiagnosticResult;
  bucketPublic?: DiagnosticResult;
  fileList?: DiagnosticResult;
  uploadTest?: DiagnosticResult;
}

const Diagnostic = () => {
  const { isAdmin } = useAuth();
  const isOfflineMode = import.meta.env.VITE_OFFLINE_MODE === "true";
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DiagnosticResults>({});
  const [summary, setSummary] = useState<{ total: number; passed: number; failed: number } | null>(null);

  // Vérifier les permissions
  if (!isOfflineMode && !isAdmin) {
    return (
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Accès refusé</AlertTitle>
        <AlertDescription>
          Seuls les administrateurs peuvent accéder au diagnostic.
        </AlertDescription>
      </Alert>
    );
  }

  const runDiagnostic = async () => {
    setLoading(true);
    setResults({});
    setSummary(null);

    try {
      const { results: diagnosticResults, summary: diagnosticSummary } = await runFullDiagnostic();
      setResults(diagnosticResults);
      setSummary(diagnosticSummary);
    } catch (error) {
      console.error("Erreur lors du diagnostic:", error);
    } finally {
      setLoading(false);
    }
  };

  const runIndividualTest = async (testName: string, testFn: () => Promise<DiagnosticResult>) => {
    setResults((prev) => ({
      ...prev,
      [testName]: { success: false, message: "Test en cours..." },
    }));

    const result = await testFn();
    setResults((prev) => ({
      ...prev,
      [testName]: result,
    }));
  };

  const renderResult = (result?: DiagnosticResult) => {
    if (!result) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {result.success ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-destructive" />
          )}
          <span className={result.success ? "text-green-700 dark:text-green-400" : "text-destructive"}>
            {result.message}
          </span>
        </div>
        {result.details && (
          <div className="ml-7 p-3 bg-muted rounded-md">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(result.details, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  const getStatusIcon = (result?: DiagnosticResult) => {
    if (!result) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    return result.success ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-destructive" />
    );
  };

  const hasRun = Object.keys(results).length > 0;
  const allPassed = summary && summary.failed === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Diagnostic Supabase Storage</h1>
        <p className="text-muted-foreground mt-2">
          Vérifiez la configuration de Supabase Storage pour le stockage des images produits
        </p>
      </div>

      <Separator />

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Tests de Diagnostic</CardTitle>
          <CardDescription>
            Lancez les tests pour vérifier que tout est correctement configuré
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runDiagnostic} disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Diagnostic en cours...
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 h-4 w-4" />
                Lancer le diagnostic complet
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Résumé */}
      {summary && (
        <Alert variant={allPassed ? "default" : "destructive"}>
          {allPassed ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertTitle>Résumé du Diagnostic</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              <p>
                Total de tests: <strong>{summary.total}</strong>
              </p>
              <p className="text-green-600 dark:text-green-400">
                Réussis: <strong>{summary.passed}</strong>
              </p>
              <p className="text-destructive">
                Échoués: <strong>{summary.failed}</strong>
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Résultats détaillés */}
      {hasRun && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Test 1: Connexion */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  <CardTitle className="text-lg">Connexion</CardTitle>
                </div>
                {getStatusIcon(results.connection)}
              </div>
              <CardDescription>Connexion à Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[120px]">
                {renderResult(results.connection)}
              </ScrollArea>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => runIndividualTest("connection", checkSupabaseConnection)}
                disabled={loading}
              >
                Retester
              </Button>
            </CardContent>
          </Card>

          {/* Test 2: Bucket existe */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  <CardTitle className="text-lg">Bucket</CardTitle>
                </div>
                {getStatusIcon(results.bucketExists)}
              </div>
              <CardDescription>Existence du bucket</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[120px]">
                {renderResult(results.bucketExists)}
              </ScrollArea>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => runIndividualTest("bucketExists", checkBucketExists)}
                disabled={loading}
              >
                Retester
              </Button>
            </CardContent>
          </Card>

          {/* Test 3: Bucket public */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  <CardTitle className="text-lg">Visibilité</CardTitle>
                </div>
                {getStatusIcon(results.bucketPublic)}
              </div>
              <CardDescription>Bucket public</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[120px]">
                {renderResult(results.bucketPublic)}
              </ScrollArea>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => runIndividualTest("bucketPublic", checkBucketIsPublic)}
                disabled={loading}
              >
                Retester
              </Button>
            </CardContent>
          </Card>

          {/* Test 4: Liste fichiers */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileImage className="h-5 w-5" />
                  <CardTitle className="text-lg">Fichiers</CardTitle>
                </div>
                {getStatusIcon(results.fileList)}
              </div>
              <CardDescription>Liste des fichiers</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[120px]">
                {renderResult(results.fileList)}
              </ScrollArea>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => runIndividualTest("fileList", listBucketFiles)}
                disabled={loading}
              >
                Retester
              </Button>
            </CardContent>
          </Card>

          {/* Test 5: Upload test */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  <CardTitle className="text-lg">Upload</CardTitle>
                </div>
                {getStatusIcon(results.uploadTest)}
              </div>
              <CardDescription>Test d'upload</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[120px]">
                {renderResult(results.uploadTest)}
              </ScrollArea>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => runIndividualTest("uploadTest", testImageUpload)}
                disabled={loading}
              >
                Retester
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Instructions */}
      {hasRun && summary && summary.failed > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Actions Requises</CardTitle>
            <CardDescription>
              Suivez ces étapes pour résoudre les problèmes détectés
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!results.bucketExists?.success && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>1. Créer le bucket "product-images"</AlertTitle>
                <AlertDescription>
                  <ol className="list-decimal ml-4 mt-2 space-y-1">
                    <li>Allez dans votre Dashboard Supabase</li>
                    <li>Cliquez sur "Storage" dans le menu</li>
                    <li>Cliquez sur "Create a new bucket"</li>
                    <li>Nommez-le: <code className="bg-muted px-1 py-0.5 rounded">product-images</code></li>
                    <li>Cochez "Public bucket"</li>
                    <li>Cliquez sur "Create bucket"</li>
                  </ol>
                </AlertDescription>
              </Alert>
            )}

            {results.bucketExists?.success && !results.bucketPublic?.success && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>2. Rendre le bucket public</AlertTitle>
                <AlertDescription>
                  <ol className="list-decimal ml-4 mt-2 space-y-1">
                    <li>Dans Storage, cliquez sur le bucket "product-images"</li>
                    <li>Cliquez sur "Settings"</li>
                    <li>Activez "Public bucket"</li>
                    <li>Sauvegardez</li>
                  </ol>
                </AlertDescription>
              </Alert>
            )}

            {results.bucketExists?.success && results.bucketPublic?.success && !results.uploadTest?.success && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>3. Vérifier les permissions RLS</AlertTitle>
                <AlertDescription>
                  <p className="mt-2">
                    Si le bucket est public mais l'upload échoue, vérifiez les Row Level Security (RLS) policies.
                  </p>
                  <p className="mt-2 text-sm">
                    Dans Supabase → Storage → Policies, assurez-vous que les utilisateurs authentifiés peuvent uploader.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Relancer le diagnostic</AlertTitle>
              <AlertDescription>
                Une fois les corrections effectuées, relancez le diagnostic pour vérifier que tout fonctionne.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Message de succès */}
      {hasRun && allPassed && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <CardTitle className="text-green-700 dark:text-green-400">
                Tout est configuré correctement !
              </CardTitle>
            </div>
            <CardDescription className="text-green-600 dark:text-green-500">
              Votre configuration Supabase Storage est opérationnelle. Les images devraient s'afficher correctement.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default Diagnostic;
