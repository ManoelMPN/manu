"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Comercio {
  id: string;
  nome: string;
  nome_responsavel?: string;
  slug: string;
  whatsapp: string;
  plano: string;
  status_assinatura: string;
  trial_ate?: string;
  logo_url?: string;
}

interface Servico {
  id: string;
  nome: string;
  duracao: string;
  preco: number;
  descricao?: string;
}

export default function PaginaAgendamentoCliente() {
  const params = useParams();
  const slug = params?.slug as string;

  const [carregando, setCarregando] = useState(true);
  const [comercio, setComercio] = useState<Comercio | null>(null);
  const [etapa, setEtapa] = useState<1 | 2 | 3 | 4>(1); // 1: Serviço, 2: Data/Hora, 3: Identificação, 4: Sucesso

  // Seleções do cliente
  const [servicoEscolhido, setServicoEscolhido] = useState<Servico | null>(null);
  const [dataEscolhida, setDataEscolhida] = useState<string>("");
  const [horarioEscolhido, setHorarioEscolhido] = useState<string>("");
  const [nomeCliente, setNomeCliente] = useState("");
  const [whatsappCliente, setWhatsappCliente] = useState("");
  const [observacao, setObservacao] = useState("");

  // Lista de serviços padrão (caso o comerciante ainda não tenha cadastrado personalizados)
  const servicosPadrao: Servico[] = [
    {
      id: "1",
      nome: "Atendimento Completo",
      duracao: "45 min",
      preco: 50.0,
      descricao: "Atendimento padrão com hora marcada e sem filas.",
    },
    {
      id: "2",
      nome: "Sessão Express",
      duracao: "30 min",
      preco: 35.0,
      descricao: "Serviço rápido e focado para o seu dia a dia.",
    },
    {
      id: "3",
      nome: "Atendimento VIP / Especial",
      duracao: "60 min",
      preco: 80.0,
      descricao: "Experiência completa com horário estendido.",
    },
  ];

  // Gera os próximos 6 dias úteis para escolha
  const gerarDatasDisponiveis = () => {
    const datas = [];
    const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      datas.push({
        dataFormatada: d.toISOString().split("T")[0],
        diaSemana: i === 0 ? "Hoje" : i === 1 ? "Amanhã" : diasSemana[d.getDay()],
        diaNumero: d.getDate(),
        mes: meses[d.getMonth()],
      });
    }
    return datas;
  };

  const datasDisponiveis = gerarDatasDisponiveis();

  // Horários disponíveis
  const horariosDisponiveis = [
    "09:00", "10:00", "11:00", "13:30", "14:30", "15:30", "16:30", "17:30", "18:30"
  ];

  useEffect(() => {
    async function carregarComercio() {
      if (!slug) return;

      const { data, error } = await supabase
        .from("comercios")
        .select("*")
        .eq("slug", slug.toLowerCase())
        .single();

      if (!error && data) {
        setComercio(data);
      }
      setCarregando(false);
    }

    carregarComercio();
  }, [slug]);

  // Checa se a conta do comerciante está em dia ou com teste ativo
  const verificarStatusConta = () => {
    if (!comercio) return false;
    if (comercio.status_assinatura === "ativo") return true;
    if (comercio.status_assinatura === "pausado") return false;

    // Se estiver em trial, verifica se ainda restam dias
    if (comercio.trial_ate) {
      const agora = new Date().getTime();
      const fimTrial = new Date(comercio.trial_ate).getTime();
      return fimTrial > agora;
    }
    return false;
  };

  // Máscara de WhatsApp para o cliente
  const handleWhatsappChange = (val: string) => {
    const nums = val.replace(/\D/g, "").slice(0, 11);
    let formatado = nums;
    if (nums.length > 2) formatado = `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    if (nums.length > 7) formatado = `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
    setWhatsappCliente(formatado);
  };

  const handleFinalizarAgendamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!servicoEscolhido || !dataEscolhida || !horarioEscolhido || !nomeCliente || !whatsappCliente) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Avança para a tela de confirmação
    setEtapa(4);
  };

  // Enviar confirmação no WhatsApp do estabelecimento
  const abrirWhatsAppConfirmacao = () => {
    if (!comercio || !servicoEscolhido) return;
    const numComercio = comercio.whatsapp.replace(/\D/g, "");
    const dddNumero = numComercio.startsWith("55") ? numComercio : `55${numComercio}`;

    const texto = encodeURIComponent(
      `Olá! Acabei de fazer um agendamento pelo seu aplicativo:\n\n` +
      `📌 *Serviço:* ${servicoEscolhido.nome}\n` +
      `📅 *Data:* ${dataEscolhida}\n` +
      `⏰ *Horário:* ${horarioEscolhido}\n` +
      `👤 *Meu Nome:* ${nomeCliente}\n` +
      `📱 *Meu WhatsApp:* ${whatsappCliente}\n` +
      (observacao ? `📝 *Observação:* ${observacao}\n\n` : `\n`) +
      `Poderia confirmar meu horário? Obrigado!`
    );

    window.open(`https://wa.me/${dddNumero}?text=${texto}`, "_blank");
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#07090E] text-slate-300 flex items-center justify-center font-sans text-sm">
        Carregando agenda...
      </div>
    );
  }

  // Estabelecimento não encontrado
  if (!comercio) {
    return (
      <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-2xl text-rose-400 mb-4">
          ✕
        </div>
        <h1 className="text-xl font-black">Agenda não encontrada</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          O link que você acessou não corresponde a nenhum estabelecimento cadastrado.
        </p>
      </div>
    );
  }

  // Estabelecimento com teste expirado ou pausado
  const contaAtiva = verificarStatusConta();
  if (!contaAtiva) {
    return (
      <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl text-amber-400 mb-4">
          ⏸
        </div>
        <h1 className="text-xl font-black">{comercio.nome}</h1>
        <p className="text-xs text-slate-400 mt-2 max-w-xs">
          Esta agenda online está temporariamente pausada para novos agendamentos automáticos.
        </p>
        <a
          href={`https://wa.me/55${comercio.whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          className="mt-6 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition"
        >
          Falar diretamente pelo WhatsApp
        </a>
      </div>
    );
  }

  // Define se exibe logo ou o monograma elegante
  const permiteLogo = comercio.plano === "pro" || comercio.plano === "premium";
  const temLogoValida = permiteLogo && comercio.logo_url;
  const primeiraLetra = comercio.nome.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      {/* Topo do Estabelecimento */}
      <header className="border-b border-slate-800 bg-[#0E131F]/95 backdrop-blur-md px-4 py-4 sticky top-0 z-20">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo ou Monograma Elegante */}
            {temLogoValida ? (
              <img
                src={comercio.logo_url}
                alt={comercio.nome}
                className="w-11 h-11 rounded-2xl object-cover border border-slate-700 shadow-md"
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-lg text-white shadow-md shadow-blue-500/20">
                {primeiraLetra}
              </div>
            )}

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-sm sm:text-base text-white leading-tight">
                  {comercio.nome}
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Aberto para agendamentos"></span>
              </div>
              <p className="text-[11px] text-slate-400">Agendamento Online 24h</p>
            </div>
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
            manu.
          </span>
        </div>
      </header>

      {/* Conteúdo Central (Passo a Passo) */}
      <main className="max-w-md mx-auto w-full p-4 flex-1">
        {/* ETAPA 1: Escolha do Serviço */}
        {etapa === 1 && (
          <div className="space-y-4 pt-2">
            <div>
              <h2 className="text-base font-black text-white">Escolha um serviço</h2>
              <p className="text-xs text-slate-400">Selecione o atendimento desejado para continuar:</p>
            </div>

            <div className="space-y-2.5">
              {servicosPadrao.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setServicoEscolhido(s);
                    setEtapa(2);
                  }}
                  className="bg-[#0E131F] border border-slate-800 hover:border-blue-500/60 p-4 rounded-2xl transition cursor-pointer active:scale-[0.99] flex items-center justify-between shadow-sm group"
                >
                  <div className="space-y-1 pr-3">
                    <h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition">
                      {s.nome}
                    </h3>
                    {s.descricao && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {s.descricao}
                      </p>
                    )}
                    <span className="inline-block text-[11px] font-mono text-slate-400">
                      ⏱ {s.duracao}
                    </span>
                  </div>

                  <div className="text-right whitespace-nowrap pl-2">
                    <span className="text-sm font-black text-emerald-400">
                      R$ {s.preco.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="block text-[11px] font-bold text-blue-400 mt-1">
                      Agendar ➔
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ETAPA 2: Escolha de Data e Horário */}
        {etapa === 2 && servicoEscolhido && (
          <div className="space-y-5 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-blue-400 font-bold">Passo 2 de 3</span>
                <h2 className="text-base font-black text-white">Escolha data e horário</h2>
              </div>
              <button
                onClick={() => setEtapa(1)}
                className="text-xs font-semibold text-slate-400 hover:text-white"
              >
                ← Trocar Serviço
              </button>
            </div>

            {/* Resumo do Serviço */}
            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
              <span className="font-bold text-white">{servicoEscolhido.nome}</span>
              <span className="text-emerald-400 font-black">
                R$ {servicoEscolhido.preco.toFixed(2).replace(".", ",")}
              </span>
            </div>

            {/* Carrossel de Dias */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                1. Selecione o dia
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {datasDisponiveis.map((item) => {
                  const sel = dataEscolhida === item.dataFormatada;
                  return (
                    <button
                      key={item.dataFormatada}
                      type="button"
                      onClick={() => setDataEscolhida(item.dataFormatada)}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        sel
                          ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30"
                          : "bg-[#0E131F] border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <span className="text-[10px] block font-bold uppercase">{item.diaSemana}</span>
                      <span className="text-base font-black block my-0.5">{item.diaNumero}</span>
                      <span className="text-[10px] block opacity-70">{item.mes}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grade de Horários */}
            {dataEscolhida && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  2. Selecione o horário
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {horariosDisponiveis.map((h) => {
                    const sel = horarioEscolhido === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHorarioEscolhido(h)}
                        className={`py-2.5 rounded-xl border text-xs font-bold font-mono transition cursor-pointer ${
                          sel
                            ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30"
                            : "bg-[#0E131F] border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {dataEscolhida && horarioEscolhido && (
              <button
                onClick={() => setEtapa(3)}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl transition shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                Continuar para Seus Dados ➔
              </button>
            )}
          </div>
        )}

        {/* ETAPA 3: Dados do Cliente */}
        {etapa === 3 && servicoEscolhido && (
          <form onSubmit={handleFinalizarAgendamento} className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-blue-400 font-bold">Passo 3 de 3</span>
                <h2 className="text-base font-black text-white">Seus dados para reserva</h2>
              </div>
              <button
                type="button"
                onClick={() => setEtapa(2)}
                className="text-xs font-semibold text-slate-400 hover:text-white"
              >
                ← Voltar
              </button>
            </div>

            {/* Resumo da Data/Hora */}
            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-white">{servicoEscolhido.nome}</p>
                <p className="text-slate-400 font-mono mt-0.5">
                  Dia {dataEscolhida} às {horarioEscolhido}
                </p>
              </div>
              <span className="text-emerald-400 font-black text-sm">
                R$ {servicoEscolhido.preco.toFixed(2).replace(".", ",")}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Seu Nome Completo
              </label>
              <input
                type="text"
                placeholder="Ex: Carlos Eduardo"
                value={nomeCliente}
                onChange={(e) => setNomeCliente(e.target.value)}
                required
                className="w-full bg-[#0E131F] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Seu WhatsApp
              </label>
              <input
                type="tel"
                placeholder="(11) 99999-9999"
                value={whatsappCliente}
                onChange={(e) => handleWhatsappChange(e.target.value)}
                required
                className="w-full bg-[#0E131F] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Você receberá o lembrete por este número
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Observações (Opcional)
              </label>
              <textarea
                placeholder="Alguma preferência ou detalhe específico?"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                rows={2}
                className="w-full bg-[#0E131F] border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl transition shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              Confirmar Agendamento ✓
            </button>
          </form>
        )}

        {/* ETAPA 4: Tela de Sucesso */}
        {etapa === 4 && servicoEscolhido && (
          <div className="pt-4 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-3xl font-black mx-auto shadow-lg shadow-emerald-500/20">
              ✓
            </div>

            <div>
              <h2 className="text-xl font-black text-white">Agendamento Realizado!</h2>
              <p className="text-xs text-slate-300 mt-1">
                Seu horário com <strong className="text-white">{comercio.nome}</strong> foi reservado.
              </p>
            </div>

            <div className="bg-[#0E131F] border border-slate-800 p-5 rounded-2xl text-left space-y-3 shadow-lg">
              <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                <span className="text-slate-400">Serviço:</span>
                <span className="font-bold text-white">{servicoEscolhido.nome}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                <span className="text-slate-400">Data e Hora:</span>
                <span className="font-bold text-blue-400 font-mono">
                  {dataEscolhida} às {horarioEscolhido}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-slate-800 pb-2">
                <span className="text-slate-400">Cliente:</span>
                <span className="font-bold text-white">{nomeCliente}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Valor Estimado:</span>
                <span className="font-black text-emerald-400">
                  R$ {servicoEscolhido.preco.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={abrirWhatsAppConfirmacao}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl transition shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>💬</span> Confirmar no WhatsApp do Estabelecimento
              </button>

              <button
                onClick={() => {
                  setEtapa(1);
                  setServicoEscolhido(null);
                  setDataEscolhida("");
                  setHorarioEscolhido("");
                }}
                className="text-xs text-slate-400 hover:text-white transition cursor-pointer"
              >
                Fazer outro agendamento
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Rodapé Discreto */}
      <footer className="py-4 border-t border-slate-800/60 text-center text-[11px] text-slate-400">
        Agendamentos com a tecnologia <span className="font-black text-white">manu.</span>
      </footer>
    </div>
  );
}