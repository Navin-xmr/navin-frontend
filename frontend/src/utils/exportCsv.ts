/**
 * Export utility for generating and downloading CSV files
 */

export interface CsvData {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Converts an array of data objects to CSV format
 * @param data - Array of data objects to convert
 * @param filename - Name of the CSV file to download
 */
export function exportToCsv(data: CsvData[], filename: string): void {
  if (!data || data.length === 0) {
    throw new Error("No data provided for CSV export");
  }

  // Get all unique keys from the data
  const keys = Array.from(
    new Set(data.flatMap((obj) => Object.keys(obj)))
  );

  // Create CSV header
  const header = keys.map((key) => `"${key}"`).join(",");

  // Create CSV rows
  const rows = data.map((obj) =>
    keys
      .map((key) => {
        const value = obj[key];
        if (value === null || value === undefined) return '""';
        const stringValue = String(value);
        // Escape quotes and wrap in quotes if contains comma or quote
        if (stringValue.includes(",") || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return `"${stringValue}"`;
      })
      .join(",")
  );

  // Combine header and rows
  const csv = [header, ...rows].join("\n");

  // Create a Blob and download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the object URL
  URL.revokeObjectURL(url);
}
