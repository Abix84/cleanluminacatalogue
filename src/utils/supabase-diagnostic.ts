import { supabase } from "@/integrations/supabase/client";

// ==========================================
// DIAGNOSTIC SUPABASE STORAGE
// ==========================================

export interface DiagnosticResult {
  success: boolean;
  message: string;
  details?: unknown;
}

const BUCKET_NAME = "product-images";

/**
 * Vérifie la connexion à Supabase
 */
export const checkSupabaseConnection = async (): Promise<DiagnosticResult> => {
  try {
    const { data, error } = await supabase.from("products").select("count");

    if (error) {
      return {
        success: false,
        message: "Impossible de se connecter à Supabase",
        details: error,
      };
    }

    return {
      success: true,
      message: "Connexion à Supabase OK",
      details: data,
    };
  } catch (err) {
    return {
      success: false,
      message: "Erreur de connexion Supabase",
      details: err,
    };
  }
};

/**
 * Vérifie si le bucket product-images existe
 */
export const checkBucketExists = async (): Promise<DiagnosticResult> => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      return {
        success: false,
        message: "Impossible de lister les buckets",
        details: error,
      };
    }

    const bucket = buckets?.find((b) => b.name === BUCKET_NAME);

    if (!bucket) {
      return {
        success: false,
        message: `Le bucket "${BUCKET_NAME}" n'existe pas`,
        details: {
          availableBuckets: buckets?.map((b) => b.name) || [],
          instruction: "Créez le bucket dans Supabase Dashboard → Storage",
        },
      };
    }

    return {
      success: true,
      message: `Le bucket "${BUCKET_NAME}" existe`,
      details: {
        id: bucket.id,
        name: bucket.name,
        public: bucket.public,
        created_at: bucket.created_at,
      },
    };
  } catch (err) {
    return {
      success: false,
      message: "Erreur lors de la vérification du bucket",
      details: err,
    };
  }
};

/**
 * Vérifie si le bucket est public
 */
export const checkBucketIsPublic = async (): Promise<DiagnosticResult> => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      return {
        success: false,
        message: "Impossible de vérifier les permissions du bucket",
        details: error,
      };
    }

    const bucket = buckets?.find((b) => b.name === BUCKET_NAME);

    if (!bucket) {
      return {
        success: false,
        message: `Le bucket "${BUCKET_NAME}" n'existe pas`,
      };
    }

    if (!bucket.public) {
      return {
        success: false,
        message: `Le bucket "${BUCKET_NAME}" n'est pas public`,
        details: {
          instruction:
            "Rendez le bucket public dans Supabase Dashboard → Storage → Settings",
          currentStatus: "private",
        },
      };
    }

    return {
      success: true,
      message: `Le bucket "${BUCKET_NAME}" est public`,
      details: { public: true },
    };
  } catch (err) {
    return {
      success: false,
      message: "Erreur lors de la vérification des permissions",
      details: err,
    };
  }
};

/**
 * Liste les fichiers dans le bucket
 */
export const listBucketFiles = async (): Promise<DiagnosticResult> => {
  try {
    const { data: files, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list("", {
        limit: 10,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      return {
        success: false,
        message: "Impossible de lister les fichiers",
        details: error,
      };
    }

    return {
      success: true,
      message: `${files?.length || 0} fichier(s) trouvé(s)`,
      details: {
        count: files?.length || 0,
        files: files?.map((f) => ({
          name: f.name,
          size: f.metadata?.size || 0,
          created_at: f.created_at,
        })),
      },
    };
  } catch (err) {
    return {
      success: false,
      message: "Erreur lors du listage des fichiers",
      details: err,
    };
  }
};

/**
 * Teste l'upload d'une image de test
 */
export const testImageUpload = async (): Promise<DiagnosticResult> => {
  try {
    // Créer une image de test (1x1 pixel transparent PNG)
    const testImageBlob = new Blob(
      [
        new Uint8Array([
          137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0,
          1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 13, 73, 68,
          65, 84, 120, 218, 99, 100, 96, 96, 96, 0, 0, 0, 4, 0, 1, 90, 90, 85,
          104, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130,
        ]),
      ],
      { type: "image/png" },
    );

    const testFileName = `test-${Date.now()}.png`;

    // Upload
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(testFileName, testImageBlob);

    if (uploadError) {
      return {
        success: false,
        message: "Échec de l'upload de test",
        details: uploadError,
      };
    }

    // Récupérer l'URL publique
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(testFileName);

    // Supprimer le fichier de test
    await supabase.storage.from(BUCKET_NAME).remove([testFileName]);

    return {
      success: true,
      message: "Upload de test réussi",
      details: {
        testFile: testFileName,
        publicUrl: urlData.publicUrl,
        note: "Le fichier de test a été supprimé automatiquement",
      },
    };
  } catch (err) {
    return {
      success: false,
      message: "Erreur lors du test d'upload",
      details: err,
    };
  }
};

/**
 * Vérifie si une URL d'image est accessible
 */
export const checkImageAccessibility = async (
  imageUrl: string,
): Promise<DiagnosticResult> => {
  try {
    const response = await fetch(imageUrl, { method: "HEAD" });

    if (!response.ok) {
      return {
        success: false,
        message: "L'image n'est pas accessible",
        details: {
          url: imageUrl,
          status: response.status,
          statusText: response.statusText,
        },
      };
    }

    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");

    return {
      success: true,
      message: "L'image est accessible",
      details: {
        url: imageUrl,
        contentType,
        size: contentLength
          ? `${parseInt(contentLength) / 1024} KB`
          : "unknown",
      },
    };
  } catch (err) {
    return {
      success: false,
      message: "Impossible d'accéder à l'image",
      details: err,
    };
  }
};

/**
 * Exécute tous les diagnostics
 */
export const runFullDiagnostic = async (): Promise<{
  results: Record<string, DiagnosticResult>;
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
}> => {
  console.log("🔍 Démarrage du diagnostic Supabase Storage...\n");

  const results: Record<string, DiagnosticResult> = {};

  // 1. Connexion Supabase
  console.log("1️⃣ Vérification de la connexion Supabase...");
  results.connection = await checkSupabaseConnection();
  console.log(
    results.connection.success ? "✅" : "❌",
    results.connection.message,
  );
  if (!results.connection.success) {
    console.error("Détails:", results.connection.details);
  }
  console.log("");

  // 2. Existence du bucket
  console.log("2️⃣ Vérification de l'existence du bucket...");
  results.bucketExists = await checkBucketExists();
  console.log(
    results.bucketExists.success ? "✅" : "❌",
    results.bucketExists.message,
  );
  if (!results.bucketExists.success) {
    console.error("Détails:", results.bucketExists.details);
  } else {
    console.log("Détails:", results.bucketExists.details);
  }
  console.log("");

  // 3. Bucket public
  console.log("3️⃣ Vérification que le bucket est public...");
  results.bucketPublic = await checkBucketIsPublic();
  console.log(
    results.bucketPublic.success ? "✅" : "❌",
    results.bucketPublic.message,
  );
  if (!results.bucketPublic.success) {
    console.error("Détails:", results.bucketPublic.details);
  }
  console.log("");

  // 4. Liste des fichiers
  console.log("4️⃣ Liste des fichiers dans le bucket...");
  results.fileList = await listBucketFiles();
  console.log(results.fileList.success ? "✅" : "❌", results.fileList.message);
  if (results.fileList.details) {
    const details = results.fileList.details as { files?: unknown[] };
    console.log("Fichiers:", details.files);
  }
  console.log("");

  // 5. Test d'upload
  console.log("5️⃣ Test d'upload d'image...");
  results.uploadTest = await testImageUpload();
  console.log(
    results.uploadTest.success ? "✅" : "❌",
    results.uploadTest.message,
  );
  if (!results.uploadTest.success) {
    console.error("Détails:", results.uploadTest.details);
  } else {
    const details = results.uploadTest.details as { publicUrl?: string };
    console.log("URL générée:", details?.publicUrl);
  }
  console.log("");

  // Résumé
  const passed = Object.values(results).filter((r) => r.success).length;
  const total = Object.keys(results).length;
  const failed = total - passed;

  console.log("=".repeat(50));
  console.log("📊 RÉSUMÉ DU DIAGNOSTIC");
  console.log("=".repeat(50));
  console.log(`Total de tests: ${total}`);
  console.log(`✅ Réussis: ${passed}`);
  console.log(`❌ Échoués: ${failed}`);
  console.log("=".repeat(50));

  if (failed > 0) {
    console.log("\n⚠️ ACTIONS REQUISES:");
    if (!results.bucketExists.success) {
      console.log(
        "  1. Créer le bucket 'product-images' dans Supabase Dashboard",
      );
    }
    if (!results.bucketPublic.success) {
      console.log("  2. Rendre le bucket 'product-images' public");
    }
    if (!results.uploadTest.success) {
      console.log("  3. Vérifier les permissions d'upload dans Supabase");
    }
  } else {
    console.log("\n✅ Tout est configuré correctement !");
  }

  return {
    results,
    summary: { total, passed, failed },
  };
};
