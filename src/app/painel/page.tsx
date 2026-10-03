"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Comercio {
  id: string;
  nome: string;
  slug: string;
  whatsapp: string;
  plano: string;
  ciclo?: string;
  status_assinatura?: string;
  trial_ate?: string;
}

export default function PainelPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [comercio, setComercio] = useState<Comercio | null>(null);
  const [copiado, setCopiado] = useState(false);

  // Estados do Modal de Planos / Checkout
  const [modalAberto, setModalAberto] = useState(false);
  const [planoEscolhido, setPlanoEscolhido] = useState<"basico" | "pro" | "premium">("pro");
  const [cicloEscolhido, setCicloEscolhido] = useState<"mensal" | "anual">("mensal");
  const [codigoCupom, setCodigoCupom] = useState("");
  const [msgCupom, setMsgCupom] = useState<{ texto: string; sucesso: boolean } | null>(null);
  const [descontoPercentual, setDescontoPercentual] = useState<number>(0);
  const [processandoAssinatura, setProcessandoAssinatura] = useState(false);

  // E-mail autorizado para visualização da Área Master
  const ADMIN_EMAIL = "neto.mmp@gmail.com";

  const precos = {
    basico: { mensal: 19.9, anual: 199.0 },
    pro: { mensal: 34.9, anual: 349.0 },
    premium: { mensal: 59.9, anual: 599.0 },
  };

  const carregarDados = async () => {
    // 1. Verifica autenticação do usuário
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUserEmail(user.email ?? null);

    // 2. Busca o comércio vinculado ao usuário
    const { data, error } = await supabase
      .from("comercios")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!error && data) {
      setComercio(data);
      if (data.plano) setPlanoEscolhido(data.plano as "basico" | "pro" | "premium");
      if (data.ciclo) setCicloEscolhido(data.ciclo as "mensal" | "anual");
    }

    setCarregando(false);
  };

  useEffect(() => {
    carregarDados();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const copiarLink = () => {
    if (!comercio) return;
    const url = `https://${comercio.slug}.manu.vercel.app`;
    navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  // Cálculo de dias restantes do Trial
  const calcularDiasRestantes = () => {
    if (!comercio?.trial_ate) return 0;
    const dataFim = new Date(comercio.trial_ate).getTime();
    const dataHoje = new Date().getTime();
    const diferencaMs = dataFim - dataHoje;
    const dias = Math.ceil(diferencaMs / (1000 * 60 * 60 * 24));
    return dias > 0 ? dias : 0;
  };

  const diasRestantes = calcularDiasRestantes();
  const trialExpirado =
    (comercio?.status_assinatura === "trial" || !comercio?.status_assinatura) &&
    diasRestantes <= 0;

  // Aplicação e Validação de Cupom
  const aplicarCupom = async () => {
    if (!codigoCupom.trim()) return;
    setMsgCupom(null);

    const { data, error } = await supabase
      .from("cupons")
      .select("*")
      .eq("codigo", codigoCupom.trim().toUpperCase())
      .eq("ativo", true)
      .single();

    if (error || !data) {
      setMsgCupom({ texto: "Cupom inválido ou expirado.", sucesso: false });
      setDescontoPercentual(0);
      return;
    }

    // Se for cupom de dias extras de teste (ex: TRIAL7)
    if (data.dias_extras_trial > 0 && comercio) {
      const dataAtualBase = comercio.trial_ate ? new Date(comercio.trial_ate) : new Date();
      const novaData = new Date(
        dataAtualBase.getTime() + data.dias_extras_trial * 24 * 60 * 60 * 1000
      );

      await supabase
        .from("comercios")
        .update({
          trial_ate: novaData.toISOString(),
          status_assinatura: "trial",
        })
        .eq("id", comercio.id);

      setMsgCupom({
        texto: `Sucesso! +${data.dias_extras_trial} dias de teste adicionados à sua conta.`,
        sucesso: true,
      });
      await carregarDados();
      return;
    }

    // Se for cupom de desconto percentual (ex: LIBERADO100)
    if (data.desconto_percentual > 0) {
      setDescontoPercentual(data.desconto_percentual);
      setMsgCupom({
        texto: `Cupom aplicado! ${data.desconto_percentual}% de desconto.`,
        sucesso: true,
      });
    }
  };

  // Finalização da Escolha do Plano
  const handleFinalizarAssinatura = async () => {
    if (!comercio) return;
    setProcessandoAssinatura(true);

    try {
      // Caso 1: Cupom de 100% de desconto -> Ativação instantânea
      if (descontoPercentual === 100) {
        const { error } = await supabase
          .from("comercios")
          .update({
            plano: planoEscolhido,
            ciclo: cicloEscolhido,
            status_assinatura: "ativo",
          })
          .eq("id", comercio.id);

        if (error) throw error;

        await carregarDados();
        setModalAberto(false);
        alert("Assinatura ativada com sucesso pelo cupom de 100%!");
        return;
      }

      // Caso 2: Pagamento normal via Gateway
      alert(
        `Redirecionando para o pagamento do plano ${planoEscolhido.toUpperCase()} (${cicloEscolhido})...`
      );
    } catch (err: any) {
      alert("Erro ao processar assinatura: " + (err.message || "Tente novamente"));
    } finally {
      setProcessandoAssinatura(false);
    }
  };

  const valorOriginal = precos[planoEscolhido][cicloEscolhido];
  const valorFinal = valorOriginal - (valorOriginal * descontoPercentual) / 100;

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#07090E] text-slate-200 flex items-center justify-center font-sans text-sm">
        Carregando seu painel...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Cabeçalho do Painel */}
      <header className="border-b border-slate-800 bg-[#0E131F]/90 backdrop-blur-md px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-sm text-white">
            m
          </div>
          <div>
            <span className="font-black text-base text-white tracking-tight">
              manu<span className="text-blue-500">.</span>
            </span>
            <span className="hidden sm:inline-block ml-3 px-2 py-0.5 rounded-md bg-slate-800 text-xs font-semibold text-slate-300">
              Painel de Gestão
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Botão visível exclusivamente para o seu e-mail */}
          {userEmail === ADMIN_EMAIL && (
            <button
              onClick={() => router.push("/admin")}
              className="text-xs font-black bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 px-3 py-1.5 rounded-xl transition border border-indigo-500/40 cursor-pointer flex items-center gap-1.5"
            >
              <span>⚙️️</span>
              <span className="hidden sm:inline">Área Master</span> Admin
            </button>
          )}

          <span className="text-xs sm:text-sm font-medium text-slate-300 hidden sm:inline">
            {comercio?.nome || "Meu Estabelecimento"}
          </span>
          <button
            onClick={handleLogout}
            className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl transition border border-slate-700 cursor-pointer"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Banner do Período de Testes / Assinatura */}
        {comercio?.status_assinatura === "ativo" ? (
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
              <div>
                <p className="text-sm font-bold text-white">Assinatura Ativa</p>
                <p className="text-xs text-slate-300">
                  Seu aplicativo está 100% liberado para agendamentos de clientes.
                </p>
              </div>
            </div>
            <button
              onClick={() => setModalAberto(true)}
              className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl border border-slate-700 transition cursor-pointer"
            >
              Gerenciar Assinatura
            </button>
          </div>
        ) : trialExpirado ? (
          <div className="bg-rose-950/50 border border-rose-500/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black text-rose-300">
                Seu período de teste grátis terminou
              </p>
              <p className="text-xs text-slate-300 mt-0.5">
                Escolha o plano definitivo para manter sua agenda funcionando e seus clientes agendando.
              </p>
            </div>
            <button
              onClick={() => setModalAberto(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm rounded-xl transition shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              Escolher Plano Agora
            </button>
          </div>
        ) : (
          <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center font-black text-blue-400 text-sm">
                {diasRestantes}d
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  Período de Teste Gratuito: Restam {diasRestantes}{" "}
                  {diasRestantes === 1 ? "dia" : "dias"}
                </p>
                <p className="text-xs text-slate-300">
                  Aproveite para configurar seus serviços e divulgar o link aos seus clientes.
                </p>
              </div>
            </div>
            <button
              onClick={() => setModalAberto(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md cursor-pointer"
            >
              Ativar Plano Definitivo
            </button>
          </div>
        )}

        {/* Banner do Link do App */}
        <div className="bg-gradient-to-r from-blue-900/30 via-[#0E131F] to-[#0E131F] border border-blue-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div>
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-wider border border-blue-500/30">
              Seu App está no ar
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-3 mb-1">
              {comercio?.nome}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Compartilhe o link com seus clientes para receber agendamentos automáticos:
            </p>
            <p className="font-mono text-sm sm:text-base font-bold text-blue-400 mt-2">
              https://{comercio?.slug}.manu.vercel.app
            </p>
          </div>

          <button
            onClick={copiarLink}
            className="w-full md:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-blue-600/30 cursor-pointer flex items-center justify-center gap-2"
          >
            {copiado ? "✓ Link Copiado!" : "Copiar Link do App"}
          </button>
        </div>

        {/* Resumo Rápido */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0E131F] border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs uppercase font-bold text-slate-400">Plano Atual</span>
            <p className="text-xl font-black text-white mt-1 capitalize">
              {comercio?.plano || "Profissional"}
            </p>
            <p className="text-xs text-blue-400 font-semibold mt-1">
              {comercio?.status_assinatura === "ativo"
                ? "Assinatura Ativa"
                : `Período de Testes (${diasRestantes} dias)`}
            </p>
          </div>

          <div className="bg-[#0E131F] border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs uppercase font-bold text-slate-400">Agendamentos Hoje</span>
            <p className="text-xl font-black text-white mt-1">0</p>
            <p className="text-xs text-slate-400 mt-1">Nenhum atendimento pendente</p>
          </div>

          <div className="bg-[#0E131F] border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs uppercase font-bold text-slate-400">WhatsApp Vinculado</span>
            <p className="text-xl font-black text-white mt-1 font-mono">
              {comercio?.whatsapp || "—"}
            </p>
            <p className="text-xs text-slate-400 mt-1">Recebe notificações</p>
          </div>
        </div>

        {/* Próximos Atendimentos */}
        <div className="bg-[#0E131F] border border-slate-800 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-white">Próximos Agendamentos</h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Os horários marcados pelos seus clientes aparecerão listados aqui.
              </p>
            </div>
          </div>

          <div className="p-8 border border-dashed border-slate-800 rounded-2xl text-center">
            <p className="text-sm font-semibold text-slate-300">
              Nenhum agendamento registrado ainda.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Assim que o primeiro cliente agendar pelo seu link, o card com nome, serviço e valor aparecerá aqui.
            </p>
          </div>
        </div>
      </main>

      {/* Modal de Escolha do Plano e Cupons */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E131F] border border-slate-700 w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Escolha seu Plano Definitivo</h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Ativação automática sem burocracia ou fidelidade.
                </p>
              </div>
              <button
                onClick={() => setModalAberto(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Seletor Ciclo */}
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setCicloEscolhido("mensal")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                  cicloEscolhido === "mensal"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Mensal
              </button>
              <button
                onClick={() => setCicloEscolhido("anual")}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  cicloEscolhido === "anual"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Anual
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-black border border-emerald-500/30">
                  2 MESES OFF
                </span>
              </button>
            </div>

            {/* Cards dos 3 Planos */}
            <div className="space-y-3">
              {(
                [
                  {
                    id: "basico",
                    nome: "Básico",
                    desc: "Agenda automatizada e lembretes individuais",
                  },
                  {
                    id: "pro",
                    nome: "Profissional",
                    desc: "Recebimento via Pix (Sinal ou Total) + WhatsApp em lote",
                    destaque: true,
                  },
                  {
                    id: "premium",
                    nome: "Premium",
                    desc: "Cartão de Crédito + Sincronização Google/Outlook/Apple",
                  },
                ] as const
              ).map((p) => {
                const selecionado = planoEscolhido === p.id;
                const preco = precos[p.id][cicloEscolhido];

                return (
                  <div
                    key={p.id}
                    onClick={() => setPlanoEscolhido(p.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      selecionado
                        ? "border-blue-500 bg-blue-950/20 shadow-md"
                        : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-white">{p.nome}</span>
                        {"destaque" in p && p.destaque && (
                          <span className="text-[10px] uppercase font-black bg-blue-600/30 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
                            Recomendado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{p.desc}</p>
                    </div>

                    <div className="text-right pl-4">
                      <span className="text-base font-black text-white">
                        R$ {preco.toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        /{cicloEscolhido === "anual" ? "ano" : "mês"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Campo de Cupom de Desconto */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Cupom Promocional ou de Teste
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="EX: LIBERADO100 ou TRIAL7"
                  value={codigoCupom}
                  onChange={(e) => setCodigoCupom(e.target.value.toUpperCase())}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono uppercase"
                />
                <button
                  type="button"
                  onClick={aplicarCupom}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
                >
                  Aplicar
                </button>
              </div>

              {msgCupom && (
                <p
                  className={`text-xs mt-2 font-medium ${
                    msgCupom.sucesso ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {msgCupom.texto}
                </p>
              )}
            </div>

            {/* Total e Botão de Ativação */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Total a pagar:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">
                    R$ {valorFinal.toFixed(2).replace(".", ",")}
                  </span>
                  {descontoPercentual > 0 && (
                    <span className="text-xs text-emerald-400 font-bold line-through">
                      R$ {valorOriginal.toFixed(2).replace(".", ",")}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleFinalizarAssinatura}
                disabled={processandoAssinatura}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl transition shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50"
              >
                {processandoAssinatura
                  ? "Ativando..."
                  : descontoPercentual === 100
                  ? "Ativar 100% Grátis"
                  : "Prosseguir para Pagamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}