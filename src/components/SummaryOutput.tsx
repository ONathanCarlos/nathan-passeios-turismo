import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, RotateCcw } from "lucide-react";
import { Lang, dict } from "@/lib/i18n";
import { toast } from "sonner";

interface Props {
  text: string;
  lang: Lang;
  onReset: () => void;
}

const WA_NUMBER = "5522998216796";

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

  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="glass-card rounded-2xl p-5 turquoise-glow bg-night/70 backdrop-blur-md">
        <pre className="whitespace-pre-wrap break-words font-mono text-sm text-foreground leading-relaxed">
          {text}
        </pre>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          onClick={handleCopy}
          className="bg-turquoise text-night hover:bg-turquoise-glow font-semibold h-12"
        >
          {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
          {copied ? t.copied : t.copy}
        </Button>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rgb-border block"
        >
          <span className="flex items-center justify-center gap-2 rounded-[0.6rem] bg-card/95 px-4 h-[calc(3rem-4px)] text-sm font-bold text-foreground hover:bg-card transition-colors">
            <svg viewBox="0 0 32 32" className="w-5 h-5 fill-[#25D366]" aria-hidden="true">
              <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.745.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.79 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.302.13-.561.13-.762 0-.53-.057-.72-.486-.93-.428-.215-1.43-.701-1.96-.701zM16.066 6.733c-5.244 0-9.553 4.31-9.553 9.554 0 1.79.5 3.532 1.46 5.05L6 26.067l4.818-1.502a9.482 9.482 0 0 0 5.266 1.59h.014c5.252 0 9.561-4.309 9.561-9.553 0-2.55-1.075-4.945-2.864-6.756a9.49 9.49 0 0 0-6.729-2.713zm0 17.486h-.013a7.93 7.93 0 0 1-4.046-1.103l-.288-.172-3.022.945.96-2.937-.187-.302a7.929 7.929 0 0 1-1.218-4.252c0-4.382 3.561-7.943 7.943-7.943a7.886 7.886 0 0 1 5.61 2.32 7.881 7.881 0 0 1 2.327 5.616 7.972 7.972 0 0 1-7.957 7.928z" />
            </svg>
            {t.share}
          </span>
        </a>
      </div>
      <Button
        onClick={onReset}
        variant="ghost"
        className="w-full text-foreground/90 hover:text-turquoise bg-night/40 backdrop-blur-sm"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        {t.reset}
      </Button>
    </div>
  );
};
