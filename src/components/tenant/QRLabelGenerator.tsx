import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QRCodeSVG } from "qrcode.react";
import { Download, Printer } from "lucide-react";
import { jsPDF } from "jspdf";

interface QRCodeData {
  id: string;
  short_code: string;
  product?: {
    name: string;
    sku: string;
    primary_image_url?: string;
  } | null;
  campaign_name?: string | null;
}

interface QRLabelGeneratorProps {
  qrCodes: QRCodeData[];
  onClose: () => void;
}

type LabelFormat = "50x90" | "62x100" | "a7" | "a6";

interface FormatConfig {
  width: number;
  height: number;
  qrSize: number;
  fontSize: number;
  cols: number;
  rows: number;
  pageWidth: number;
  pageHeight: number;
  marginX: number;
  marginY: number;
  gapX: number;
  gapY: number;
}

const formatConfigs: Record<LabelFormat, FormatConfig> = {
  "50x90": {
    width: 50,
    height: 90,
    qrSize: 35,
    fontSize: 8,
    cols: 4,
    rows: 3,
    pageWidth: 210,
    pageHeight: 297,
    marginX: 5,
    marginY: 8,
    gapX: 0,
    gapY: 3,
  },
  "62x100": {
    width: 62,
    height: 100,
    qrSize: 40,
    fontSize: 9,
    cols: 3,
    rows: 2,
    pageWidth: 210,
    pageHeight: 297,
    marginX: 12,
    marginY: 48,
    gapX: 0,
    gapY: 0,
  },
  a7: {
    width: 74,
    height: 105,
    qrSize: 50,
    fontSize: 10,
    cols: 2,
    rows: 2,
    pageWidth: 210,
    pageHeight: 297,
    marginX: 31,
    marginY: 43,
    gapX: 0,
    gapY: 0,
  },
  a6: {
    width: 105,
    height: 148,
    qrSize: 70,
    fontSize: 12,
    cols: 2,
    rows: 2,
    pageWidth: 210,
    pageHeight: 297,
    marginX: 0,
    marginY: 0,
    gapX: 0,
    gapY: 0,
  },
};

const formatLabels: Record<LabelFormat, string> = {
  "50x90": "50 x 90 mm (12 por folha)",
  "62x100": "62 x 100 mm (6 por folha)",
  a7: "A7 - 74 x 105 mm (4 por folha)",
  a6: "A6 - 105 x 148 mm (4 por folha)",
};

export function QRLabelGenerator({ qrCodes, onClose }: QRLabelGeneratorProps) {
  const [format, setFormat] = useState<LabelFormat>("50x90");
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const config = formatConfigs[format];
  const labelsPerPage = config.cols * config.rows;
  const totalPages = Math.ceil(qrCodes.length / labelsPerPage);

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const baseUrl = window.location.origin;

      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        if (pageIndex > 0) {
          pdf.addPage();
        }

        const startIndex = pageIndex * labelsPerPage;
        const pageQRCodes = qrCodes.slice(startIndex, startIndex + labelsPerPage);

        for (let i = 0; i < pageQRCodes.length; i++) {
          const qr = pageQRCodes[i];
          const col = i % config.cols;
          const row = Math.floor(i / config.cols);

          const x = config.marginX + col * (config.width + config.gapX);
          const y = config.marginY + row * (config.height + config.gapY);

          // Draw border
          pdf.setDrawColor(200);
          pdf.setLineWidth(0.1);
          pdf.rect(x, y, config.width, config.height);

          // Generate QR code as data URL
          const qrCanvas = document.createElement("canvas");
          const QRCode = await import("qrcode");
          await QRCode.toCanvas(qrCanvas, `${baseUrl}/q/${qr.short_code}`, {
            width: config.qrSize * 4, // Higher resolution
            margin: 0,
          });
          const qrDataUrl = qrCanvas.toDataURL("image/png");

          // Calculate centered position for QR
          const qrX = x + (config.width - config.qrSize) / 2;
          const qrY = y + 5;

          // Add QR code image
          pdf.addImage(qrDataUrl, "PNG", qrX, qrY, config.qrSize, config.qrSize);

          // Add product name
          pdf.setFontSize(config.fontSize);
          pdf.setFont("helvetica", "bold");
          const productName = qr.product?.name || "Produto";
          const truncatedName = productName.length > 20 
            ? productName.substring(0, 20) + "..." 
            : productName;
          
          const textY = qrY + config.qrSize + 5;
          pdf.text(truncatedName, x + config.width / 2, textY, { align: "center" });

          // Add SKU
          pdf.setFontSize(config.fontSize - 1);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(100);
          if (qr.product?.sku) {
            pdf.text(qr.product.sku, x + config.width / 2, textY + 4, { align: "center" });
          }

          // Add short code
          pdf.setFontSize(config.fontSize - 2);
          pdf.setTextColor(150);
          pdf.text(qr.short_code, x + config.width / 2, y + config.height - 3, { align: "center" });

          // Reset text color
          pdf.setTextColor(0);
        }
      }

      // Add generation date footer on last page
      pdf.setFontSize(6);
      pdf.setTextColor(150);
      pdf.text(
        `Gerado em ${new Date().toLocaleString("pt-BR")}`,
        config.pageWidth / 2,
        config.pageHeight - 5,
        { align: "center" }
      );

      // Save PDF
      pdf.save(`etiquetas-qr-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Format Selection */}
      <div className="space-y-2">
        <Label>Formato da Etiqueta</Label>
        <Select value={format} onValueChange={(value) => setFormat(value as LabelFormat)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(formatLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Preview */}
      <div className="border rounded-lg p-4 bg-muted/30">
        <p className="text-sm text-muted-foreground mb-4">
          Prévia ({qrCodes.length} etiquetas em {totalPages} página{totalPages > 1 ? "s" : ""})
        </p>
        
        <div 
          ref={previewRef}
          className="bg-white rounded shadow-sm p-4 overflow-auto max-h-[400px]"
          style={{ aspectRatio: "210/297" }}
        >
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
            }}
          >
            {qrCodes.slice(0, labelsPerPage).map((qr) => (
              <div
                key={qr.id}
                className="border border-dashed border-muted-foreground/30 rounded p-2 flex flex-col items-center"
                style={{
                  aspectRatio: `${config.width}/${config.height}`,
                }}
              >
                <QRCodeSVG
                  value={`${window.location.origin}/q/${qr.short_code}`}
                  size={60}
                  level="H"
                />
                <p className="text-xs font-medium mt-1 text-center truncate w-full">
                  {qr.product?.name || "Produto"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {qr.product?.sku}
                </p>
                <p className="text-[8px] text-muted-foreground/60 mt-auto">
                  {qr.short_code}
                </p>
              </div>
            ))}
          </div>
          {qrCodes.length > labelsPerPage && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              +{qrCodes.length - labelsPerPage} etiquetas em páginas adicionais
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={generatePDF} disabled={isGenerating} className="gap-2">
          <Download className="h-4 w-4" />
          {isGenerating ? "Gerando PDF..." : "Baixar PDF"}
        </Button>
      </div>
    </div>
  );
}
