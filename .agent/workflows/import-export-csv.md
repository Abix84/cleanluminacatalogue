---
description: How to use the Import/Export CSV feature
---

# Import/Export CSV Feature

This feature allows administrators to export the product catalog to CSV or JSON and import products from a CSV file.

## Usage

1.  **Navigate to Admin Dashboard**: Go to `/admin`.
2.  **Locate the Buttons**: In the header, next to "Diagnostic", you will see:
    *   **Exporter**: A dropdown menu to choose between "Exporter en JSON" and "Exporter en CSV".
    *   **Importer CSV**: A button to upload a CSV file.

## Export

*   **CSV**: Downloads a `.csv` file containing all products with columns: ID, Nom, Description, Prix, Catégorie, Marque, Entreprise, Image URL.
*   **JSON**: Downloads a `.json` file containing products, categories, and brands. Useful for full backups.

## Import CSV

1.  Click **Importer CSV**.
2.  Select a `.csv` file.
3.  The system will parse the file and add products.
4.  **Format Requirements**:
    *   The CSV must have headers: `Nom`, `Prix`, `Description`, `Catégorie`, `Marque`, `Entreprise`, `Image URL`.
    *   `Nom` is required.
    *   `Catégorie` and `Marque` are matched by name (case-insensitive). If not found, the product is added without them.
    *   `Entreprise` must be "CleanExpress" or "Lumina Distribution".
    *   `Image URL` should be a direct link to an image.

## Technical Details

*   **Component**: `src/components/admin/ImportExportButtons.tsx`
*   **Logic**:
    *   Uses `exportToCSV` and `exportToJSON` from `src/lib/exportUtils.ts`.
    *   Parses CSV client-side using a custom parser to handle quotes correctly.
    *   Uses `addProduct` from `ProductContext` to insert products.
