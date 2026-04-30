import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Share2, Check, RotateCcw } from "lucide-react";
import { Lang, dict } from "@/lib/i18n";
import { toast } from "sonner";

interface Props {
  text: string;
  lang: Lang;
  onReset: () => void;
}

export const SummaryOutput = ({ text, lang, onReset }: Props) => {
  const t = dict[lang];
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(t.copied);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // canceled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="glass-card rounded-2xl p-5 turquoise-glow">
        <pre className="whitespace-pre-wrap break-words font-mono text-sm text-foreground/95 leading-relaxed">
          {text}
        </pre>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={handleCopy}
          className="bg-turquoise text-night hover:bg-turquoise-glow font-semibold h-12"
        >
          {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
          {copied ? t.copied : t.copy}
        </Button>
        <Button
          onClick={handleShare}
          variant="outline"
          className="border-turquoise/50 text-turquoise hover:bg-turquoise/10 hover:text-turquoise h-12 font-semibold"
        >
          <Share2 className="h-4 w-4 mr-2" />
          {t.share}
        </Button>
      </div>
      <Button
        onClick={onReset}
        variant="ghost"
        className="w-full text-muted-foreground hover:text-turquoise"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        {t.reset}
      </Button>
    </div>
  );
};
