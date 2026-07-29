import html2pdf from "html2pdf.js";
import type React from "react";

export async function exportShipmentPdf(
  trackingNumber: string,
  containerRef: React.RefObject<HTMLElement | null>
): Promise<void> {
  if (!containerRef.current) {
    throw new Error("Shipment content is not available to export.");
  }

  const options = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename: `shipment-${trackingNumber}.pdf`,
    image: { type: "png" as const, quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
  };

  try {
    await html2pdf().set(options).from(containerRef.current).save();
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Failed to generate shipment PDF.");
  }
}
