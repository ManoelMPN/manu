"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function FormularioCadastro() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const planoInicial = searchParams.get("plano") || "pro";
  const cicloInicial = searchParams.get("ciclo") || "mensal";

  const [plano] = useState(planoInicial);
  const [ciclo] = useState(cicloInicial);

  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cupom, setCupom] = useState("");
  const [descontoPercentual, setDescontoPercentual] = useState(0);
  const [diasTrialExtras, setDiasTrialExtras] = useState(0);
  const [msgCupom, setMsgCupom] = useState<{ texto: string; sucesso: boolean } | null>(null);

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const tabelaPrecos: Record<string, { mensal: number; anual: number; label: string }> = {
    basico: { mensal: 19.9, anual: 199.0, label: "Básico" },
    pro: { mensal: 34.9, anual: 349.0, label: "Profissional" },
    premium: { mensal: 59.9, anual: 599.0, label: "Premium" },
  };

  const dadosPlano = tabelaPrecos[plano] || tabelaPrecos.pro;
  const valorPosTeste = ciclo === "anual" ? dadosPlano.anual : dadosPlano.mensal;

  // Tradução amigável dos erros para Português do Brasil
  const traduzirErro = (mensagem: string) => {
    if (mensagem.includes("User already registered")) {
      return "Este e-mail já está cadastrado. Clique em 'Entrar no painel' abaixo para fazer login.";
    }
    if (mensagem.includes("Password should be at least")) {
      return "A senha deve ter no mínimo 6 caracteres.";
    }
    if (mensagem.includes("Invalid login credentials")) {
      return "E-mail ou senha incorretos.";
    }
    if (mensagem.includes("row-level security")) {
      return "Erro de permissão no banco de dados. Tente novamente.";
    }
    return mensagem || "Não foi possível concluir o cadastro. Verifique os dados e tente novamente.";
  };

  // Gera o slug automaticamente baseado no nome do negócio
  const handleNomeChange = (valor: string) => {
    setNome(valor);
    const slugFormatado = valor
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 20);
    setSlug(slugFormatado);
  };

  // Máscara de WhatsApp (DDD + celular)
  const handleWhatsappChange = (valor: string) => {
    const nums = valor.replace(/\D/g, "").slice(0, 11);
    let formatado = nums;
    if (nums.length > 2) formatado = `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    if (nums.length > 7) formatado = `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
    setWhatsapp(formatado);
  };

  // Validação do cupom
  const aplicarCupom = async () => {
    if (!cupom.trim()) return;
    setMsgCupom(null);

    const { data, error } = await supabase
      .from("cupons")
      .select("*")
      .eq("codigo", cupom.trim().toUpperCase())
      .eq("ativo", true)
      .single();

    if (error || !data) {
      setMsgCupom({ texto: "Cupom inválido ou expirado.", sucesso: false });
      setDescontoPercentual(0);
      setDiasTrialExtras(0);
      return;
    }

    if (data.desconto_percentual > 0) {
      setDescontoPercentual(data.desconto_percentual);
      setMsgCupom({
        texto: `Cupom aplicado! ${data.desconto_percentual}% de desconto após os 7 dias.`,
        sucesso: true,
      });
    }

    if (data.dias_extras_trial > 0) {
      setDiasTrialExtras(data.dias_extras_trial);
      setMsgCupom({
        texto: `Cupom aplicado! +${data.dias_extras_trial} dias adicionados ao seu teste gratuito.`,
        sucesso: true,
      });
    }
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    try {
      // 1. Cria o utilizador no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
      });

      if (authError) throw authError;

      let userId = authData.user?.id;

      // 2. Garante a sessão ativa
      if (!authData.session) {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: senha,
        });
        if (loginError) throw loginError;
        userId = loginData.user.id;
      }

      if (!userId) throw new Error("Não foi possível autenticar o usuário.");

      // 3. Calcula o período de teste (7 dias + dias extras de cupom)
      const totalDiasTrial = 7 + diasTrialExtras;
      const dataTrialFim = new Date();
      dataTrialFim.setDate(dataTrialFim.getDate() + totalDiasTrial);

      // 4. Grava os dados do negócio associando o nome do responsável
      const { error: dbError } = await supabase.from("comercios").insert({
        user_id: userId,
        nome: nome.trim(),
        nome_responsavel: nomeResponsavel.trim(),
        slug: slug.trim(),
        whatsapp: whatsapp.trim(),
        plano: plano,
        ciclo: ciclo,
        status_assinatura: descontoPercentual === 100 ? "ativo" : "trial",
        trial_ate: dataTrialFim.toISOString(),
      });

      if (dbError) throw dbError;

      // 5. Redireciona de imediato para o painel
      router.push("/painel");
    } catch (err: any) {
      setErro(traduzirErro(err.message || ""));
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans flex flex-col justify-center items-center px-4 py-12 selection:bg-blue-600 selection:text-white">
      {/* Logótipo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/20">
          m
        </div>
        <span className="text-2xl font-black tracking-tight text-white">
          manu<span className="text-blue-500">.</span>
        </span>
      </Link>

      <div className="w-full max-w-md bg-[#0E131F] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            7 DIAS GRÁTIS • SEM CARTÃO DE CRÉDITO
          </div>
          <h1 className="text-2xl font-black text-white">Crie seu aplicativo</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Plano selecionado: <strong className="text-white capitalize">{dadosPlano.label} ({ciclo})</strong>
          </p>
        </div>

        {erro && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 font-semibold leading-relaxed">
            {erro}
          </div>
        )}

        <form onSubmit={handleCadastro} className="space-y-4">
          {/* Nome Pessoal do Responsável */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Seu Nome Completo
            </label>
            <input
              type="text"
              placeholder="Ex: Manoel Silva"
              value={nomeResponsavel}
              onChange={(e) => setNomeResponsavel(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Nome do Negócio */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Nome do seu negócio ou atendimento
            </label>
            <input
              type="text"
              placeholder="Ex: Studio Silva Barber"
              value={nome}
              onChange={(e) => handleNomeChange(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
            {slug && (
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Link do seu app: <span className="text-blue-400 font-bold">{slug}.manu.vercel.app</span>
              </p>
            )}
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              WhatsApp para Contato
            </label>
            <input
              type="tel"
              placeholder="(11) 99999-9999"
              value={whatsapp}
              onChange={(e) => handleWhatsappChange(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono transition"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              Apenas números com DDD
            </span>
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Seu E-mail
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Palavra-passe */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Crie uma Senha
            </label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Cupão Opcional */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Cupom Promocional (Opcional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: LIBERADO100"
                value={cupom}
                onChange={(e) => setCupom(e.target.value.toUpperCase())}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase font-mono focus:border-blue-500 focus:outline-none"
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
              <p className={`text-xs mt-1.5 font-medium ${msgCupom.sucesso ? "text-emerald-400" : "text-rose-400"}`}>
                {msgCupom.texto}
              </p>
            )}
          </div>

          {/* Resumo da Oferta */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Hoje (Período de Testes):</span>
              <span className="text-emerald-400 font-black text-sm">
                R$ 0,00 <span className="text-[10px] font-normal text-slate-400">({7 + diasTrialExtras} dias grátis)</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs border-t border-slate-800/80 pt-2">
              <span className="text-slate-400">Após o período de teste:</span>
              <span className="font-bold text-slate-200">
                {descontoPercentual === 100 ? (
                  <span className="text-emerald-400 font-black">Grátis (100% OFF)</span>
                ) : (
                  <>R$ {(valorPosTeste - (valorPosTeste * descontoPercentual) / 100).toFixed(2).replace(".", ",")} /{ciclo === "anual" ? "ano" : "mês"}</>
                )}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 pt-1 text-center">
              🔒 Sem cobrança no cadastro • Cancele ou altere quando quiser
            </p>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl transition shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50"
          >
            {carregando ? "Criando seu aplicativo..." : "Começar Meus 7 Dias Grátis ➔"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 pt-2">
          Já possui uma conta?{" "}
          <Link href="/login" className="text-blue-400 font-bold hover:underline">
            Entrar no painel
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function CadastroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07090E] flex items-center justify-center text-xs text-slate-400">Carregando...</div>}>
      <FormularioCadastro />
    </Suspense>
  );
}