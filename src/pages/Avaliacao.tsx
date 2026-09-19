import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, Loader2, ShieldCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HalfStarRating } from "@/components/HalfStarRating";
import { getReviewContext, ReviewContext, ReviewSubmission, submitReview } from "@/lib/reviews";

type LoadState = "loading" | "ready" | "invalid" | "used" | "error";
type Errors = Partial<Record<keyof ReviewSubmission, string>>;

const initialForm: ReviewSubmission = {
  passeio_key: "",
  nota_atendimento: 0,
  nota_plataforma: 0,
  nota_passeio: 0,
  avaliacao_passeio: "",
  melhoria: "",
  nota_recomendacao: 0,
  observacoes: "",
  autorizacao_publicacao: false,
};

const fieldClass = "interactive-field border-turquoise/25 bg-night/80 focus-visible:ring-turquoise";

const Avaliacao = () => {
  const { token = "" } = useParams<{ token: string }>();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [context, setContext] = useState<ReviewContext | null>(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ passeio_nome: string; media_final: number } | null>(null);

  useEffect(() => {
    document.title = "Avalie sua experiência · Nathan Turismo";
    let active = true;
    getReviewContext(token)
      .then((result) => {
        if (!active) return;
        if (result.ok && result.context) {
          setContext(result.context);
          setForm((current) => ({
            ...current,
            passeio_key: result.context?.passeios.length === 1 ? result.context.passeios[0].key : "",
          }));
          setLoadState("ready");
        } else {
          setLoadState(result.error === "already_submitted" ? "used" : "invalid");
        }
      })
      .catch(() => active && setLoadState("error"));
    return () => { active = false; };
  }, [token]);

  const average = useMemo(() => {
    const ratings = [form.nota_atendimento, form.nota_plataforma, form.nota_passeio, form.nota_recomendacao];
    return ratings.every(Boolean) ? ratings.reduce((sum, item) => sum + item, 0) / ratings.length : 0;
  }, [form]);

  const validate = () => {
    const next: Errors = {};
    if (!form.nota_atendimento) next.nota_atendimento = "Avalie o atendimento do Nathan.";
    if (!form.nota_plataforma) next.nota_plataforma = "Avalie a reserva pelo site.";
    if (!form.passeio_key) next.passeio_key = "Selecione o passeio realizado.";
    if (!form.nota_passeio) next.nota_passeio = "Avalie o passeio.";
    if (!form.avaliacao_passeio.trim()) next.avaliacao_passeio = "Conte o que achou do passeio.";
    else if (form.avaliacao_passeio.trim().length > 400) next.avaliacao_passeio = "Use no máximo 400 caracteres.";
    if (form.nota_passeio > 0 && form.nota_passeio < 4 && !form.melhoria.trim()) next.melhoria = "Conte o que podemos melhorar.";
    if (form.melhoria.length > 1000) next.melhoria = "Use no máximo 1000 caracteres.";
    if (!form.nota_recomendacao) next.nota_recomendacao = "Informe se indicaria o passeio.";
    if (form.observacoes.length > 1000) next.observacoes = "Use no máximo 1000 caracteres.";
    if (!form.autorizacao_publicacao) next.autorizacao_publicacao = "A autorização é necessária para enviar.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const result = await submitReview(token, form);
      if (result.ok && result.review) {
        setSubmitted({ passeio_nome: result.review.passeio_nome, media_final: result.review.media_final });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (result.error === "already_submitted") {
        setLoadState("used");
      } else {
        setErrors({ autorizacao_publicacao: "Não foi possível enviar. Confira os campos e tente novamente." });
      }
    } catch {
      setErrors({ autorizacao_publicacao: "Não foi possível conectar. Tente novamente em instantes." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadState === "loading") return <StatusScreen icon={<Loader2 className="h-10 w-10 animate-spin text-turquoise" />} title="Carregando sua avaliação…" />;
  if (loadState === "used") return <StatusScreen icon={<CheckCircle2 className="h-11 w-11 text-turquoise" />} title="Avaliação já registrada" text="Obrigado por compartilhar sua experiência com a gente." />;
  if (loadState === "invalid") return <StatusScreen title="Link de avaliação inválido" text="Confira se o endereço recebido está completo." />;
  if (loadState === "error") return <StatusScreen title="Não foi possível carregar" text="Tente abrir este link novamente em instantes." />;

  if (submitted) {
    return (
      <ReviewShell>
        <section className="glass-card mx-auto max-w-xl rounded-lg p-6 text-center sm:p-9">
          <CheckCircle2 className="mx-auto h-14 w-14 text-turquoise" />
          <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">Muito obrigado!</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sua avaliação foi registrada com sucesso.</p>
          <div className="mt-7 rounded-lg border border-turquoise/20 bg-background/45 p-4 text-left">
            <Summary label="Passeio" value={submitted.passeio_nome} />
            <Summary label="Atendimento do Nathan" value={`${form.nota_atendimento.toLocaleString("pt-BR")} / 5`} />
            <Summary label="Reserva pelo site" value={`${form.nota_plataforma.toLocaleString("pt-BR")} / 5`} />
            <Summary label="Avaliação do passeio" value={`${form.nota_passeio.toLocaleString("pt-BR")} / 5`} />
            <Summary label="Recomendação" value={`${form.nota_recomendacao.toLocaleString("pt-BR")} / 5`} />
            <Summary label="Média final" value={`${submitted.media_final.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} / 5`} strong />
          </div>
          <p className="mt-6 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-bold text-amber-200">
            🎁 Você ganhou 5% de desconto na próxima reserva por ter avaliado sua experiência!
          </p>
        </section>
      </ReviewShell>
    );
  }

  return (
    <ReviewShell>
      <header className="mb-7 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-turquoise/35 bg-turquoise/10">
          <Star className="h-6 w-6 fill-turquoise text-turquoise" />
        </div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Avalie sua experiência</h1>
        <p className="mt-2 text-sm text-muted-foreground">Olá, {context?.cliente_nome}. Sua opinião ajuda a tornar cada passeio ainda melhor.</p>
        <p className="mt-1 text-xs font-semibold text-turquoise-glow">Reserva: {context?.reserva_destino}</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <ReviewSection title="⭐ Atendimento do Nathan" prompt="Como foi o atendimento? 👇">
          <HalfStarRating value={form.nota_atendimento} onChange={(value) => setForm({ ...form, nota_atendimento: value })} label="Atendimento do Nathan" />
          <FieldError text={errors.nota_atendimento} />
        </ReviewSection>

        <ReviewSection title="⭐ E a nossa reserva?" prompt="Foi tranquilo reservar pelo site?">
          <HalfStarRating value={form.nota_plataforma} onChange={(value) => setForm({ ...form, nota_plataforma: value })} label="Reserva pelo site" />
          <FieldError text={errors.nota_plataforma} />
        </ReviewSection>

        <ReviewSection title="⭐ Sobre o passeio" prompt="Qual passeio você fez?">
          <Select value={form.passeio_key} onValueChange={(value) => setForm({ ...form, passeio_key: value })}>
            <SelectTrigger className={fieldClass} aria-label="Passeio realizado">
              <SelectValue placeholder="Selecione o passeio" />
            </SelectTrigger>
            <SelectContent>
              {context?.passeios.map((tour) => <SelectItem key={tour.key} value={tour.key}>{tour.nome}</SelectItem>)}
            </SelectContent>
          </Select>
          <FieldError text={errors.passeio_key} />
          <div className="pt-3">
            <p className="mb-2 text-sm font-semibold">E aí, o que você achou? Conta pra gente! 😄</p>
            <HalfStarRating value={form.nota_passeio} onChange={(value) => setForm({ ...form, nota_passeio: value })} label="Avaliação do passeio" />
            <FieldError text={errors.nota_passeio} />
          </div>
          <Textarea
            className={`${fieldClass} min-h-28`}
            maxLength={400}
            value={form.avaliacao_passeio}
            onChange={(event) => setForm({ ...form, avaliacao_passeio: event.target.value })}
            placeholder="Conte como foi sua experiência"
            aria-label="Comentário sobre o passeio"
          />
          <CharacterCount current={form.avaliacao_passeio.length} max={400} />
          <FieldError text={errors.avaliacao_passeio} />
        </ReviewSection>

        {form.nota_passeio > 0 && form.nota_passeio < 4 && (
          <ReviewSection title="😕 Não foi tudo isso?" prompt="O que a gente pode melhorar?">
            <Textarea
              className={`${fieldClass} min-h-28`}
              maxLength={1000}
              value={form.melhoria}
              onChange={(event) => setForm({ ...form, melhoria: event.target.value })}
              placeholder="Conte pra gente o que poderia ter sido melhor"
              aria-label="O que podemos melhorar"
            />
            <CharacterCount current={form.melhoria.length} max={1000} />
            <FieldError text={errors.melhoria} />
          </ReviewSection>
        )}

        <ReviewSection title="💙 Você indicaria esse passeio pra um amigo?" prompt="De 1 a 5 estrelas">
          <HalfStarRating value={form.nota_recomendacao} onChange={(value) => setForm({ ...form, nota_recomendacao: value })} label="Recomendação do passeio" />
          <FieldError text={errors.nota_recomendacao} />
        </ReviewSection>

        <ReviewSection title="💬 Quer contar mais alguma coisa?" prompt="Manda aí! Pode ser um elogio, uma história do passeio ou qualquer coisa que queira compartilhar.">
          <Textarea
            className={`${fieldClass} min-h-32`}
            maxLength={1000}
            value={form.observacoes}
            onChange={(event) => setForm({ ...form, observacoes: event.target.value })}
            placeholder="Opcional"
            aria-label="Depoimento ou observações"
          />
          <CharacterCount current={form.observacoes.length} max={1000} />
          <FieldError text={errors.observacoes} />
        </ReviewSection>

        <section className="glass-card rounded-lg p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Checkbox
              id="review-consent"
              checked={form.autorizacao_publicacao}
              onCheckedChange={(checked) => setForm({ ...form, autorizacao_publicacao: checked === true })}
              className="mt-0.5 h-5 w-5"
            />
            <label htmlFor="review-consent" className="cursor-pointer text-xs leading-relaxed text-foreground/85">
              Autorizo que esta avaliação seja exibida publicamente no site como depoimento e avaliação de cliente, pelo período máximo de 6 meses. Após esse período, ela deverá deixar de ser exibida e ser removida conforme a política de retenção de dados do sistema.
            </label>
          </div>
          <FieldError text={errors.autorizacao_publicacao} />
        </section>

        <Button type="submit" size="lg" disabled={submitting} className="h-13 w-full font-extrabold">
          {submitting ? <><Loader2 className="animate-spin" /> Enviando…</> : "Enviar avaliação"}
        </Button>
        {average > 0 && <p className="text-center text-xs text-muted-foreground">Média atual: {average.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} / 5</p>}
      </form>
    </ReviewShell>
  );
};

const ReviewShell = ({ children }: { children: React.ReactNode }) => (
  <main className="relative min-h-screen overflow-x-hidden px-4 py-8 sm:py-12">
    <div aria-hidden className="ocean-static-bg pointer-events-none fixed inset-0 z-0" />
    <div className="relative z-10 mx-auto max-w-2xl">{children}</div>
  </main>
);

const ReviewSection = ({ title, prompt, children }: { title: string; prompt: string; children: React.ReactNode }) => (
  <section className="glass-card rounded-lg p-4 sm:p-6">
    <h2 className="text-lg font-extrabold text-foreground">{title}</h2>
    <p className="mb-4 mt-1 text-sm text-muted-foreground">{prompt}</p>
    <div className="space-y-2">{children}</div>
  </section>
);

const FieldError = ({ text }: { text?: string }) => text ? <p className="text-xs font-semibold text-destructive" role="alert">{text}</p> : null;
const CharacterCount = ({ current, max }: { current: number; max: number }) => <p className="text-right text-[11px] text-muted-foreground">{current}/{max}</p>;
const Summary = ({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) => (
  <div className="flex items-start justify-between gap-4 border-b border-border/60 py-2 last:border-0">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className={strong ? "text-sm font-extrabold text-turquoise-glow" : "text-sm font-semibold text-foreground"}>{value}</span>
  </div>
);
const StatusScreen = ({ icon, title, text }: { icon?: React.ReactNode; title: string; text?: string }) => (
  <ReviewShell>
    <section className="glass-card mx-auto mt-[18vh] max-w-md rounded-lg p-7 text-center">
      {icon || <ShieldCheck className="mx-auto h-11 w-11 text-muted-foreground" />}
      <h1 className="mt-4 text-xl font-extrabold">{title}</h1>
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </section>
  </ReviewShell>
);

export default Avaliacao;