import type { RefObject } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Lang } from "@/lib/i18n";
import { VOUCHER_COPY } from "@/lib/vouchers";
import { Download, FileDown, Printer, Share2 } from "lucide-react";

const safeFilePart = (value: string) => value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "onix-voucher";

export const VoucherActions = ({
  elementRef,
  lang,
  filename,
  shareUrl,
}: {
  elementRef: RefObject<HTMLDivElement>;
  lang: Lang;
  filename: string;
  shareUrl: string;
}) => {
  const copy = VOUCHER_COPY[lang];
  const makePng = async () => {
    const element = elementRef.current;
    if (!element) throw new Error("voucher_not_ready");
    return await toPng(element, {
      cacheBust: true,
      width: 540,
      height: 678,
      pixelRatio: 2,
      backgroundColor: "#061522",
      style: { width: "540px", height: "678px" },
    });
  };

  const downloadPng = async () => {
    try {
      const dataUrl = await makePng();
      const link = document.createElement("a");
      link.download = `${safeFilePart(filename)}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      toast.error(lang === "pt" ? "Não foi possível preparar a imagem. Tente novamente." : "Could not prepare the image. Please try again.");
    }
  };

  const downloadPdf = async () => {
    try {
      const dataUrl = await makePng();
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [210, 263.67], compress: true });
      pdf.addImage(dataUrl, "PNG", 0, 0, 210, 263.67, undefined, "FAST");
      pdf.save(`${safeFilePart(filename)}.pdf`);
    } catch {
      toast.error(lang === "pt" ? "Não foi possível preparar o PDF. Tente novamente." : "Could not prepare the PDF. Please try again.");
    }
  };

  const share = async () => {
    try {
      const dataUrl = await makePng();
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `${safeFilePart(filename)}.png`, { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: copy.shareTitle, text: copy.bookingNotice, url: shareUrl, files: [file] });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success(copy.copied);
        return;
      }
      window.prompt(copy.share, shareUrl);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success(copy.copied);
      } catch {
        window.prompt(copy.share, shareUrl);
      }
    }
  };

  return (
    <div className="no-print grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Button type="button" variant="outline" onClick={downloadPng} className="min-h-11 border-turquoise/30 bg-night/60 text-foreground">
        <Download className="mr-2 h-4 w-4" />{copy.downloadPng}
      </Button>
      <Button type="button" variant="outline" onClick={downloadPdf} className="min-h-11 border-turquoise/30 bg-night/60 text-foreground">
        <FileDown className="mr-2 h-4 w-4" />{copy.downloadPdf}
      </Button>
      <Button type="button" variant="outline" onClick={share} className="min-h-11 border-turquoise/30 bg-night/60 text-foreground">
        <Share2 className="mr-2 h-4 w-4" />{copy.share}
      </Button>
      <Button type="button" variant="outline" onClick={() => window.print()} className="min-h-11 border-turquoise/30 bg-night/60 text-foreground">
        <Printer className="mr-2 h-4 w-4" />{copy.print}
      </Button>
    </div>
  );
};
