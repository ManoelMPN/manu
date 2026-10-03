"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Comercio {
  id: string;
  nome: string;
  nome_responsavel?: string;
  slug: string;
  whatsapp: string;
  plano: string;
  status_assinatura: string;
  trial_ate: string;
  created_at?: string;
}

interface Cupom {
  id: string;
  codigo: string;
  desconto_percentual: number;
  dias_extras_trial: number;
  ativo: boolean;
}

export default function AdminPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [cupons, setCupons] = useState<Cupom[]>([]);

  // Formulário de novo cupom
  const [novoCodigo, setNovoCodigo] = useState("");
  const [novoDesconto, setNovoDesconto] = useState<number>(0);
  const [novosDiasTrial, setNovosDiasTrial] = useState<number>(0);
  const [salvandoCupom, setSalvandoCupom] = useState(false);

  // E-mail autorizado como Super Admin
  const ADMIN_EMAIL = "neto.mmp@gmail.com";

  const carregarTudo = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.email !== ADMIN_EMAIL) {
      alert("Acesso restrito ao administrador do manu.");
      router.push("/login");
      return;
    }

    setIsAdmin(true);

    // Busca estabelecimentos
    const { data: coms } = await supabase
      .from("comercios")
      .select("*")
      .order("created_at", { ascending: false });

    if (coms) setComercios(coms);

    // Busca cupons
    const { data: cups } = await supabase
      .from("cupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (cups) setCupons(cups);

    setCarregando(false);
  };

  useEffect(() => {
    carregarTudo();
  }, [router]);

  // Criar cupom
  const handleCriarCupom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoCodigo.trim()) return;
    setSalvandoCupom(true);

    const { error } = await supabase.from("cupons").insert({
      codigo: novoCodigo.trim().toUpperCase(),
      desconto_percentual: Number(novoDesconto) || 0,
      dias_extras_trial: Number(novosDiasTrial) || 0,
      ativo: true,
    });

    if (error) {
      alert("Erro ao criar cupom: " + error.message);
    } else {
      setNovoCodigo("");
      setNovoDesconto(0);
      setNovosDiasTrial(0);
      await carregarTudo();
      alert("Cupom criado com sucesso!");
    }
    setSalvandoCupom(false);
  };

  // Alternar status do cupom (ativar/desativar)
  const toggleCupom = async (id: string, statusAtual: boolean) => {
    await supabase.from("cupons").update({ ativo: !statusAtual }).eq("id", id);
    await carregarTudo();
  };

  // Mudar o plano do cliente na hora pelo seletor
  const mudarPlano = async (id: string, novoPlano: string) => {
    const { error } = await supabase
      .from("comercios")
      .update({ plano: novoPlano })
      .eq("id", id);

    if (error) {
      alert("Erro ao atualizar plano: " + error.message);
    } else {
      await carregarTudo();
    }
  };

  // Alternar status da assinatura (Ativo / Pausado / Teste)
  const alternarStatus = async (id: string, statusAtual: string) => {
    const novoStatus = statusAtual === "ativo" ? "pausado" : "ativo";
    const { error } = await supabase
      .from("comercios")
      .update({ status_assinatura: novoStatus })
      .eq("id", id);

    if (error) {
      alert("Erro ao alterar status: " + error.message);
    } else {
      await carregarTudo();
    }
  };

  // Deletar cliente do sistema com confirmação
  const deletarCliente = async (id: string, nomeNegocio: string) => {
    const confirmou = window.confirm(
      `Tem certeza que deseja excluir o cadastro de "${nomeNegocio}"? Essa ação não pode ser desfeita.`
    );
    if (!confirmou) return;

    const { error } = await supabase.from("comercios").delete().eq("id", id);

    if (error) {
      alert("Erro ao excluir cliente: " + error.message);
    } else {
      alert("Cliente excluído com sucesso!");
      await carregarTudo();
    }
  };

  // Enviar oferta personalizada no WhatsApp
  const abrirWhatsAppOferta = (c: Comercio) => {
    const limpo = c.whatsapp.replace(/\D/g, "");
    const numero = limpo.startsWith("55") ? limpo : `55${limpo}`;
    const destinatario = c.nome_responsavel || c.nome;

    const texto = encodeURIComponent(
      `Olá ${destinatario}, tudo bem? Aqui é do manu. Vi que sua agenda no link https://${c.slug}.manu.vercel.app está configurada. Preparei uma condição exclusiva para o seu negócio continuar com agendamentos no automático: liberei um cupom especial de desconto para você ativar no seu painel. Posso te ajudar em alguma configuração?`
    );
    window.open(`https://wa.me/${numero}?text=${texto}`, "_blank");
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#07090E] text-slate-200 flex items-center justify-center font-sans text-sm">
        Carregando painel master...
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans p-4 sm:p-8 space-y-8 selection:bg-blue-600 selection:text-white">
      {/* Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider border border-indigo-500/30">
            Área Master
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
            Super Admin manu<span className="text-blue-500">.</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Gerenciamento de clientes, troca rápida de planos e cupons promocionais.
          </p>
        </div>
        <button
          onClick={() => router.push("/painel")}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer"
        >
          Voltar ao Meu Painel
        </button>
      </div>

      {/* Grid: Criador de Cupons + Gestão de Cupons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário: Criar Novo Cupom */}
        <div className="bg-[#0E131F] border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
          <h2 className="text-lg font-black text-white">Criar Novo Cupom</h2>
          <p className="text-xs text-slate-400">
            Crie ofertas personalizadas para converter clientes do teste ou premiar parceiros.
          </p>

          <form onSubmit={handleCriarCupom} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Código do Cupom
              </label>
              <input
                type="text"
                placeholder="EX: PRO30, CLIENTEVIP"
                value={novoCodigo}
                onChange={(e) => setNovoCodigo(e.target.value.toUpperCase())}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Desconto (%)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 30"
                  min="0"
                  max="100"
                  value={novoDesconto}
                  onChange={(e) => setNovoDesconto(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Dias Extras de Teste
                </label>
                <input
                  type="number"
                  placeholder="Ex: 7"
                  min="0"
                  value={novosDiasTrial}
                  onChange={(e) => setNovosDiasTrial(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={salvandoCupom}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl transition shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50"
            >
              {salvandoCupom ? "Criando..." : "Salvar e Ativar Cupom"}
            </button>
          </form>
        </div>

        {/* Lista de Cupons Existentes */}
        <div className="lg:col-span-2 bg-[#0E131F] border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
          <h2 className="text-lg font-black text-white">Cupons no Sistema</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Benefício</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {cupons.map((cup) => (
                  <tr key={cup.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-mono font-bold text-white text-sm">
                      {cup.codigo}
                    </td>
                    <td className="p-3">
                      {cup.desconto_percentual > 0 && (
                        <span className="text-emerald-400 font-bold mr-2">
                          {cup.desconto_percentual}% OFF
                        </span>
                      )}
                      {cup.dias_extras_trial > 0 && (
                        <span className="text-blue-400 font-bold">
                          +{cup.dias_extras_trial} dias
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cup.ativo
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {cup.ativo ? "Ativo" : "Pausado"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => toggleCupom(cup.id, cup.ativo)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                      >
                        {cup.ativo ? "Desativar" : "Reativar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tabela de Clientes Cadastrados */}
      <div className="bg-[#0E131F] border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white">Clientes / Estabelecimentos</h2>
            <p className="text-xs text-slate-400">
              Altere o plano direto no seletor, libere cortesia ou exclua registros de teste.
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-800 text-slate-300 px-3 py-1 rounded-full">
            Total: {comercios.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3">Negócio / Responsável</th>
                <th className="p-3">WhatsApp</th>
                <th className="p-3">Plano</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {comercios.map((com) => {
                const dias = com.trial_ate
                  ? Math.ceil(
                      (new Date(com.trial_ate).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : 0;

                return (
                  <tr key={com.id} className="hover:bg-slate-900/40">
                    <td className="p-3">
                      <p className="font-bold text-white text-sm">{com.nome}</p>
                      {com.nome_responsavel && (
                        <p className="text-slate-400 text-xs">
                          Resp: <span className="text-slate-200">{com.nome_responsavel}</span>
                        </p>
                      )}
                      <p className="text-slate-500 font-mono text-[11px]">
                        {com.slug}.manu.vercel.app
                      </p>
                    </td>

                    <td className="p-3 font-mono">{com.whatsapp}</td>

                    {/* Seletor dinâmico de Plano */}
                    <td className="p-3">
                      <select
                        value={com.plano?.toLowerCase() || "pro"}
                        onChange={(e) => mudarPlano(com.id, e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-blue-400 font-bold text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="basico">Básico</option>
                        <option value="pro">Profissional</option>
                        <option value="premium">Premium</option>
                      </select>
                    </td>

                    <td className="p-3">
                      {com.status_assinatura === "ativo" ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                          Ativo (Liberado)
                        </span>
                      ) : com.status_assinatura === "pausado" ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px] border border-amber-500/30">
                          Pausado
                        </span>
                      ) : dias > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold text-[10px] border border-blue-500/30">
                          Teste ({dias}d restantes)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/30">
                          Teste Expirado
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => abrirWhatsAppOferta(com)}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1 shadow-md shadow-emerald-600/20 cursor-pointer"
                      >
                        WhatsApp
                      </button>

                      <button
                        onClick={() => alternarStatus(com.id, com.status_assinatura)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                      >
                        {com.status_assinatura === "ativo" ? "Pausar" : "Liberar"}
                      </button>

                      <button
                        onClick={() => deletarCliente(com.id, com.nome)}
                        className="px-2.5 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition border border-rose-500/30 cursor-pointer"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}