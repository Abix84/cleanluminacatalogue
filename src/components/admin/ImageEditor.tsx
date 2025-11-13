import { useState, useCallback, useEffect } from "react";
import Cropper, { Area } from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Maximize2,
  Check,
  X,
  Palette,
  Image as ImageIcon,
  Move,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onSave: (croppedImage: Blob) => void;
}

// Fonction pour créer l'image
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

// Fonction pour obtenir l'image recadrée avec redimensionnement automatique
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  backgroundColor = "#ffffff",
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  // Remplir avec la couleur de fond
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Translater et tourner
  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  // Dessiner l'image tournée
  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5,
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  // Canvas temporaire pour le crop
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  if (!tempCtx) {
    throw new Error("No 2d context");
  }

  tempCanvas.width = pixelCrop.width;
  tempCanvas.height = pixelCrop.height;

  tempCtx.fillStyle = backgroundColor;
  tempCtx.fillRect(0, 0, pixelCrop.width, pixelCrop.height);

  tempCtx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y),
  );

  // Canvas final redimensionné à 1000x1000
  const finalCanvas = document.createElement("canvas");
  const finalCtx = finalCanvas.getContext("2d");

  if (!finalCtx) {
    throw new Error("No 2d context");
  }

  const OUTPUT_SIZE = 1000;
  finalCanvas.width = OUTPUT_SIZE;
  finalCanvas.height = OUTPUT_SIZE;

  // Remplir avec la couleur de fond
  finalCtx.fillStyle = backgroundColor;
  finalCtx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  // Redimensionner et dessiner sur le canvas final
  finalCtx.drawImage(
    tempCanvas,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  );

  return new Promise((resolve) => {
    finalCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        }
      },
      "image/jpeg",
      0.92,
    );
  });
}

export const ImageEditor = ({
  open,
  onOpenChange,
  imageSrc,
  onSave,
}: ImageEditorProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [useWhiteBackground, setUseWhiteBackground] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [estimatedFileSize, setEstimatedFileSize] = useState<number | null>(
    null,
  );

  // Paramètres fixes
  const aspect = 1; // Toujours carré
  const outputSize = 1000; // Toujours 1000x1000px
  const quality = 0.92; // Qualité optimale

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        useWhiteBackground ? backgroundColor : "transparent",
      );
      onSave(croppedImage);
      onOpenChange(false);
    } catch (e) {
      console.error("Erreur lors du recadrage:", e);
    } finally {
      setIsProcessing(false);
    }
  }, [
    croppedAreaPixels,
    imageSrc,
    rotation,
    backgroundColor,
    useWhiteBackground,
    onSave,
    onOpenChange,
  ]);

  const resetSettings = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const backgroundColors = [
    { name: "Blanc", value: "#ffffff" },
    { name: "Gris clair", value: "#f5f5f5" },
    { name: "Crème", value: "#faf9f6" },
    { name: "Bleu clair", value: "#e3f2fd" },
    { name: "Transparent", value: "transparent" },
  ];

  // Estimer la taille du fichier
  const estimateFileSize = useCallback(() => {
    if (!croppedAreaPixels) return;

    // Estimation : 1000x1000 pixels * 3 (RGB) * facteur de compression JPEG
    const pixels = outputSize * outputSize;
    const compressionFactor = quality * 0.3;
    const estimatedBytes = pixels * 3 * compressionFactor;
    setEstimatedFileSize(estimatedBytes);
  }, [croppedAreaPixels, outputSize, quality]);

  useEffect(() => {
    estimateFileSize();
  }, [estimateFileSize]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0 overflow-hidden rounded-3xl">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-br from-primary/5 via-primary/3 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                <ImageIcon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  Éditeur d'image
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Format carré 1000×1000px • Qualité optimale 92%
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl h-8 w-8"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Zone de recadrage */}
          <div className="flex-1 relative bg-muted/30">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={aspect}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  style={{
                    containerStyle: {
                      backgroundColor: useWhiteBackground
                        ? backgroundColor
                        : "#f5f5f5",
                    },
                  }}
                />
              </div>
            </div>

            {/* Instructions overlay */}
            <div className="absolute top-4 left-4 right-4 pointer-events-none">
              <Card className="p-3 bg-background/95 backdrop-blur-sm border-primary/20 shadow-lg">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Move className="h-3.5 w-3.5 text-primary" />
                  <span>
                    Glissez pour déplacer • Molette pour zoomer • Ajustez le
                    produit au centre
                  </span>
                </div>
              </Card>
            </div>
          </div>

          {/* Panneau de contrôle */}
          <div className="w-80 border-l bg-background overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Info Format */}
              <Card className="p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Maximize2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Format carré fixe</p>
                    <p className="text-xs text-muted-foreground">1000×1000px</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  ✓ Optimisé pour le web et cohérence visuelle
                </p>
              </Card>

              <div className="h-px bg-border" />

              {/* Zoom */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <ZoomIn className="h-4 w-4 text-primary" />
                    Zoom
                  </Label>
                  <span className="text-xs text-muted-foreground font-mono">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
                <Slider
                  value={[zoom]}
                  min={1}
                  max={3}
                  step={0.1}
                  onValueChange={(value) => setZoom(value[0])}
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-xl"
                    onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-xl"
                    onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ajustez le zoom pour centrer le produit dans le cadre
                </p>
              </div>

              <div className="h-px bg-border" />

              {/* Rotation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <RotateCw className="h-4 w-4 text-primary" />
                    Rotation
                  </Label>
                  <span className="text-xs text-muted-foreground font-mono">
                    {rotation}°
                  </span>
                </div>
                <Slider
                  value={[rotation]}
                  min={-180}
                  max={180}
                  step={1}
                  onValueChange={(value) => setRotation(value[0])}
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-xl"
                    onClick={() => setRotation(rotation - 45)}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    -45°
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-xl"
                    onClick={() => setRotation(rotation + 45)}
                  >
                    <RotateCw className="h-3.5 w-3.5 mr-1" />
                    +45°
                  </Button>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Fond */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" />
                    Arrière-plan
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Fond blanc
                    </span>
                    <Switch
                      checked={useWhiteBackground}
                      onCheckedChange={setUseWhiteBackground}
                    />
                  </div>
                </div>

                {useWhiteBackground && (
                  <div className="grid grid-cols-5 gap-2">
                    {backgroundColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setBackgroundColor(color.value)}
                        className={cn(
                          "h-10 rounded-xl border-2 transition-all hover:scale-110 relative",
                          backgroundColor === color.value
                            ? "border-primary shadow-md scale-110"
                            : "border-muted hover:border-muted-foreground",
                          color.value === "transparent" &&
                            "relative overflow-hidden",
                        )}
                        style={{
                          backgroundColor:
                            color.value !== "transparent"
                              ? color.value
                              : undefined,
                        }}
                        title={color.name}
                      >
                        {color.value === "transparent" && (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted-foreground/20 to-muted" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-0.5 h-8 bg-red-500 rotate-45" />
                            </div>
                          </>
                        )}
                        {backgroundColor === color.value && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="h-4 w-4 text-primary drop-shadow" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-px bg-border" />

              {/* Taille estimée */}
              {estimatedFileSize !== null && (
                <Card className="p-3 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Taille estimée
                      </p>
                      <p className="text-lg font-bold text-primary">
                        {formatFileSize(estimatedFileSize)}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "px-2 py-1 rounded-lg text-xs font-semibold",
                        estimatedFileSize < 200 * 1024
                          ? "bg-green-500/10 text-green-600"
                          : estimatedFileSize < 500 * 1024
                            ? "bg-orange-500/10 text-orange-600"
                            : "bg-red-500/10 text-red-600",
                      )}
                    >
                      {estimatedFileSize < 200 * 1024
                        ? "Optimal"
                        : estimatedFileSize < 500 * 1024
                          ? "Bon"
                          : "Lourd"}
                    </div>
                  </div>
                </Card>
              )}

              <div className="h-px bg-border" />

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl"
                  onClick={resetSettings}
                >
                  Réinitialiser
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/20">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground">
                Format JPEG • 1000×1000px • Qualité 92%
              </p>
              {estimatedFileSize !== null && (
                <>
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                  <p className="text-xs font-medium text-primary">
                    ~{formatFileSize(estimatedFileSize)}
                  </p>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-xl"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={isProcessing}
                className="rounded-xl gap-2 shadow-lg shadow-primary/25"
              >
                {isProcessing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
