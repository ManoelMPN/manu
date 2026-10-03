"use client";

import { useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [faturamentoAnual, setFaturamentoAnual] = useState(false);
  const [comparativoAberto, setComparativoAberto] = useState(false);
  const [faqAberta, setFaqAberta] = useState<number | null>(null);

  const rolarParaPlanos = () => {
    const el = document.getElementById("planos");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const cicloQuery = faturamentoAnual ? "anual" : "mensal";

  const faqs = [
    {
      p: "Preciso cadastrar cartão de crédito para iniciar o teste?",
      r: "Não! Você cria sua conta em menos de 1 minuto apenas com seu WhatsApp e e-mail. Não pedimos dados de cartão de crédito para começar o teste de 7 dias.",
    },
    {
      p: "O que acontece quando os 7 dias grátis terminarem?",
      r: "Você escolhe o plano que melhor atende o seu negócio diretamente no seu painel. Se não quiser continuar, nenhuma cobrança surpresa será feita.",
    },
    {
      p: "Como funciona a sincronização com Google Agenda, Outlook e Apple?",
      r: "Assim que um cliente agenda pelo seu link, o evento surge automaticamente no calendário nativo do seu celular ou computador, com nome, serviço e horário reservado.",
    },
    {
      p: "Como recebo os pagamentos via Pix ou Cartão?",
      r: "Os recebimentos caem direto na sua conta bancária cadastrada via gateway transparente, com liquidação rápida e sem retenções indevidas.",
    },
    {
      p: "Meu cliente precisa baixar algum aplicativo?",
      r: "Não. O cliente abre o link do seu app pelo navegador em qualquer celular, escolhe o serviço e conclui em menos de 1 minuto.",
    },
    {
      p: "Posso cancelar minha assinatura quando quiser?",
      r: "Sim. O manu não possui fidelidade contratual, carência ou multas de cancelamento.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* Luz de Fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] max-w-[850px] h-[450px] bg-gradient-to-b from-blue-600/25 via-indigo-600/15 to-transparent blur-[130px] pointer-events-none -z-10"></div>

      {/* Cabeçalho */}
      <header className="sticky top-0 z-40 bg-[#07090E]/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20">
              m
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              manu<span className="text-blue-500">.</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-bold text-slate-200 hover:text-white px-3.5 py-2 rounded-xl transition hover:bg-slate-800/80"
            >
              Entrar
            </Link>
            <button
              onClick={rolarParaPlanos}
              className="text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl transition shadow-md shadow-blue-600/25 cursor-pointer"
            >
              Testar 7 dias grátis
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-14 sm:pt-20 pb-14 sm:pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-blue-300 text-xs sm:text-sm font-bold mb-8 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          7 DIAS DE TESTE GRÁTIS • SEM CARTÃO DE CRÉDITO
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15] max-w-4xl mx-auto mb-6">
          Sua agenda no piloto automático.
        </h1>

        <p className="text-base sm:text-xl text-slate-200 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
          O seu cliente agenda em segundos, paga via Pix ou Cartão e o compromisso entra direto na sua agenda (Google, Outlook e Apple), com lembretes automáticos no WhatsApp.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
          <button
            onClick={rolarParaPlanos}
            className="w-full sm:w-auto px-9 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-base transition shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95 cursor-pointer"
          >
            Começar 7 dias grátis
          </button>
        </div>
        <p className="text-xs text-slate-400 mb-16">
          Configuração em 3 minutos • Cancele quando quiser
        </p>

        {/* Métricas Centrais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
          <div className="bg-[#0E131F] border border-slate-800 p-5 rounded-2xl text-center shadow-lg">
            <span className="text-3xl sm:text-4xl font-black text-blue-400 block mb-1">3 min</span>
            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-snug">
              Para configurar e colocar seu link no ar
            </p>
          </div>
          <div className="bg-[#0E131F] border border-slate-800 p-5 rounded-2xl text-center shadow-lg">
            <span className="text-3xl sm:text-4xl font-black text-emerald-400 block mb-1">-80%</span>
            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-snug">
              De faltas exigindo sinal antecipado
            </p>
          </div>
          <div className="bg-[#0E131F] border border-slate-800 p-5 rounded-2xl text-center shadow-lg">
            <span className="text-3xl sm:text-4xl font-black text-white block mb-1">7 dias</span>
            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-snug">
              100% grátis para testar com clientes
            </p>
          </div>
          <div className="bg-[#0E131F] border border-slate-800 p-5 rounded-2xl text-center shadow-lg">
            <span className="text-3xl sm:text-4xl font-black text-indigo-400 block mb-1">100%</span>
            <p className="text-xs sm:text-sm text-slate-200 font-medium leading-snug">
              Direto no navegador, sem baixar nada
            </p>
          </div>
        </div>

        {/* Integrações */}
        <div className="max-w-2xl mx-auto p-4 sm:p-5 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700">
          <p className="text-xs uppercase tracking-wider font-bold text-slate-300 mb-3">
            Sincronização em tempo real nativa
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-sm font-bold text-slate-200">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Google Agenda
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span> Microsoft Outlook
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white"></span> Apple iCloud
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> WhatsApp Lembretes
            </span>
          </div>
        </div>
      </section>

      {/* Como Funciona em 4 Passos */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto border-t border-slate-800">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3">
            Como funciona na prática
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Configuração rápida para você começar a receber agendamentos hoje mesmo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="bg-[#0E131F] border border-slate-800 p-6 rounded-2xl flex flex-col justify-between items-center shadow-lg hover:border-slate-700 transition">
            <div>
              <span className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono font-black text-base flex items-center justify-center mx-auto mb-3">
                01
              </span>
              <h3 className="font-bold text-base text-white mb-2">Crie sua Conta Grátis</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Cadastre seus dados em 20 segundos. Sem cartão de crédito para iniciar seus 7 dias.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-800/80 text-xs font-mono text-emerald-400 font-semibold">
              7 dias liberados
            </div>
          </div>

          <div className="bg-[#0E131F] border border-slate-800 p-6 rounded-2xl flex flex-col justify-between items-center shadow-lg hover:border-slate-700 transition">
            <div>
              <span className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono font-black text-base flex items-center justify-center mx-auto mb-3">
                02
              </span>
              <h3 className="font-bold text-base text-white mb-2">Configure os Serviços</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Defina valores, horários e duração de cada atendimento no seu painel.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-800/80 text-xs text-blue-400 font-semibold font-mono">
              seunegocio.manu.vercel.app
            </div>
          </div>

          <div className="bg-[#0E131F] border border-slate-800 p-6 rounded-2xl flex flex-col justify-between items-center shadow-lg hover:border-slate-700 transition">
            <div>
              <span className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono font-black text-base flex items-center justify-center mx-auto mb-3">
                03
              </span>
              <h3 className="font-bold text-base text-white mb-2">Compartilhe o Link</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Coloque na bio do Instagram ou envie no WhatsApp. Seus clientes agendam sem baixar app.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-800/80 text-xs text-slate-300 font-medium">
              Acesso direto no celular
            </div>
          </div>

          <div className="bg-[#0E131F] border border-slate-800 p-6 rounded-2xl flex flex-col justify-between items-center shadow-lg hover:border-slate-700 transition">
            <div>
              <span className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono font-black text-base flex items-center justify-center mx-auto mb-3">
                04
              </span>
              <h3 className="font-bold text-base text-white mb-2">Receba e Fidelize</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Notificações automáticas no WhatsApp e sincronização instantânea com sua agenda.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-800/80 text-xs text-emerald-400 font-bold">
              Zero faltas e zero atrito
            </div>
          </div>
        </div>
      </section>

      {/* Planos e Preços */}
      <section id="planos" className="py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto text-center border-t border-slate-800">
        <div className="inline-block px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold mb-3 border border-emerald-500/30">
          EXPERIMENTE QUALQUER PLANO POR 7 DIAS GRÁTIS
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white mb-3 tracking-tight">
          Escolha o plano ideal para você
        </h2>
        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-10">
          Comece hoje mesmo sem pagar nada. Altere de plano ou cancele a qualquer momento.
        </p>

        {/* Toggle Mensal / Anual */}
        <div className="flex items-center justify-center gap-3.5 mb-14">
          <span className={`text-sm font-bold ${!faturamentoAnual ? "text-white" : "text-slate-400"}`}>
            Mensal
          </span>
          <button
            onClick={() => setFaturamentoAnual(!faturamentoAnual)}
            className="w-14 h-7 bg-slate-800 rounded-full p-1 transition-colors duration-200 relative flex items-center border border-slate-700 cursor-pointer"
          >
            <div
              className={`w-5 h-5 rounded-full bg-blue-500 transition-transform duration-200 ${
                faturamentoAnual ? "translate-x-7" : "translate-x-0"
              }`}
            ></div>
          </button>
          <span className={`text-sm font-bold flex items-center gap-2 ${faturamentoAnual ? "text-white" : "text-slate-400"}`}>
            Anual
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/30">
              2 MESES OFF
            </span>
          </span>
        </div>

        {/* Cards dos Planos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-left items-stretch max-w-5xl mx-auto">
          {/* Básico */}
          <div className="bg-[#0D111A] rounded-3xl p-6 sm:p-7 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition shadow-lg">
            <div>
              <h3 className="text-xl font-black text-white mb-1">Básico</h3>
              <p className="text-sm text-slate-300 mb-6">Para organizar a agenda e aposentar o papel</p>

              <div className="mb-6">
                {faturamentoAnual ? (
                  <div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-black text-white">R$ 199,00</span>
                      <span className="text-slate-300 text-sm ml-1 font-semibold">/ano</span>
                    </div>
                    <p className="text-xs text-emerald-300 font-bold mt-1">
                      Equivale a R$ 16,58/mês após os 7 dias
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-black text-white">R$ 19,90</span>
                      <span className="text-slate-300 text-sm ml-1 font-semibold">/mês</span>
                    </div>
                    <p className="text-xs text-emerald-300 font-bold mt-1">
                      Primeiros 7 dias grátis
                    </p>
                  </div>
                )}
              </div>

              <ul className="space-y-3.5 text-sm text-slate-200 mb-8">
                <li className="flex items-start gap-2.5">
                  <span className="text-blue-400 font-bold">✓</span> App exclusivo com seu link próprio
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-blue-400 font-bold">✓</span> Agendamentos ilimitados 24h
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-blue-400 font-bold">✓</span> Pagamento presencial no local
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-blue-400 font-bold">✓</span> Tempo de intervalo entre atendimentos
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-blue-400 font-bold">✓</span> Lembrete individual no WhatsApp
                </li>
              </ul>
            </div>

            <Link
              href={`/cadastro?plano=basico&ciclo=${cicloQuery}`}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm text-center transition border border-slate-700 block cursor-pointer"
            >
              Testar 7 dias grátis
            </Link>
          </div>

          {/* Profissional */}
          <div className="bg-gradient-to-b from-[#131B2E] to-[#0E1524] rounded-3xl p-6 sm:p-7 border-2 border-blue-500 shadow-2xl relative flex flex-col justify-between">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-md">
              Recomendado
            </span>

            <div>
              <h3 className="text-xl font-black text-white mb-1">Profissional</h3>
              <p className="text-sm text-slate-300 mb-6">Para eliminar faltas exigindo sinal no Pix</p>

              <div className="mb-6">
                {faturamentoAnual ? (
                  <div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-black text-white">R$ 349,00</span>
                      <span className="text-slate-300 text-sm ml-1 font-semibold">/ano</span>
                    </div>
                    <p className="text-xs text-emerald-300 font-bold mt-1">
                      Equivale a R$ 29,08/mês após os 7 dias
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-black text-white">R$ 34,90</span>
                      <span className="text-slate-300 text-sm ml-1 font-semibold">/mês</span>
                    </div>
                    <p className="text-xs text-emerald-300 font-bold mt-1">
                      Primeiros 7 dias grátis
                    </p>
                  </div>
                )}
              </div>

              <ul className="space-y-3.5 text-sm text-slate-100 mb-8">
                <li className="flex items-start gap-2.5 font-bold text-blue-400">
                  <span>✓</span> Tudo do Básico incluído
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <strong>Pix Online Automático</strong> (Integral ou Sinal)
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  Gerador de cupons promocionais
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  Disparo de lembretes em lote para o dia
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  Histórico e cadastro de clientes
                </li>
              </ul>
            </div>

            <Link
              href={`/cadastro?plano=pro&ciclo=${cicloQuery}`}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm text-center transition shadow-lg shadow-blue-600/30 block cursor-pointer"
            >
              Testar 7 dias grátis
            </Link>
          </div>

          {/* Premium */}
          <div className="bg-[#0D111A] rounded-3xl p-6 sm:p-7 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition shadow-lg">
            <div>
              <h3 className="text-xl font-black text-white mb-1">Premium</h3>
              <p className="text-sm text-slate-300 mb-6">Cartão de crédito e calendários integrados</p>

              <div className="mb-6">
                {faturamentoAnual ? (
                  <div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-black text-white">R$ 599,00</span>
                      <span className="text-slate-300 text-sm ml-1 font-semibold">/ano</span>
                    </div>
                    <p className="text-xs text-emerald-300 font-bold mt-1">
                      Equivale a R$ 49,91/mês após os 7 dias
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-black text-white">R$ 59,90</span>
                      <span className="text-slate-300 text-sm ml-1 font-semibold">/mês</span>
                    </div>
                    <p className="text-xs text-emerald-300 font-bold mt-1">
                      Primeiros 7 dias grátis
                    </p>
                  </div>
                )}
              </div>

              <ul className="space-y-3.5 text-sm text-slate-200 mb-8">
                <li className="flex items-start gap-2.5 font-bold text-blue-400">
                  <span>✓</span> Tudo do Profissional
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <strong>Cartão de Crédito Online</strong> (com parcelamento)
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <strong>Sincronização Google, Outlook e Apple</strong>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  Relatório semanal de atendimentos
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  Suporte prioritário
                </li>
              </ul>
            </div>

            <Link
              href={`/cadastro?plano=premium&ciclo=${cicloQuery}`}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm text-center transition border border-slate-700 block cursor-pointer"
            >
              Testar 7 dias grátis
            </Link>
          </div>
        </div>

        {/* Tabela Comparativa */}
        <div className="mt-12">
          <button
            onClick={() => setComparativoAberto(!comparativoAberto)}
            className="text-sm font-bold text-slate-300 hover:text-white transition underline underline-offset-4 cursor-pointer"
          >
            {comparativoAberto ? "Ocultar tabela comparativa ▲" : "+ Ver tabela comparativa de todos os recursos ▼"}
          </button>

          {comparativoAberto && (
            <div className="mt-6 max-w-4xl mx-auto bg-[#0E131F] border border-slate-800 rounded-2xl overflow-x-auto text-sm text-left shadow-2xl transition">
              <div className="min-w-[550px]">
                <div className="grid grid-cols-4 p-4 bg-slate-900 font-black text-slate-200 border-b border-slate-800">
                  <span>Recurso</span>
                  <span className="text-center">Básico</span>
                  <span className="text-center text-blue-400">Profissional</span>
                  <span className="text-center">Premium</span>
                </div>

                {[
                  ["Período de teste gratuito", "7 Dias", "7 Dias", "7 Dias"],
                  ["Link próprio exclusivo", "Sim", "Sim", "Sim"],
                  ["Agendamentos ilimitados", "Sim", "Sim", "Sim"],
                  ["Pagamento no Local", "Sim", "Sim", "Sim"],
                  ["Intervalo entre atendimentos", "Sim", "Sim", "Sim"],
                  ["Lembretes de WhatsApp individuais", "Sim", "Sim", "Sim"],
                  ["Recebimento via Pix (e Sinal)", "—", "Sim", "Sim"],
                  ["Criador de Cupons Promocionais", "—", "Sim", "Sim"],
                  ["Disparo de WhatsApp em Lote", "—", "Sim", "Sim"],
                  ["Cartão de Crédito Online", "—", "—", "Sim"],
                  ["Google Calendar, Outlook e Apple Sync", "—", "—", "Sim"],
                  ["Relatórios Semanais de Métricas", "—", "—", "Sim"],
                ].map(([recurso, b, p, pr], idx) => (
                  <div key={idx} className="grid grid-cols-4 p-4 border-b border-slate-800/80 items-center">
                    <span className="font-semibold text-slate-200">{recurso}</span>
                    <span className="text-center text-slate-400">{b}</span>
                    <span className="text-center font-bold text-blue-400">{p}</span>
                    <span className="text-center font-bold text-white">{pr}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-8 tracking-tight">
          Perguntas Frequentes
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              onClick={() => setFaqAberta(faqAberta === index ? null : index)}
              className="bg-[#0E131F] border border-slate-800 rounded-2xl p-5 cursor-pointer transition hover:border-slate-700 shadow-md"
            >
              <div className="flex justify-between items-center gap-4">
                <h3 className="font-bold text-base text-slate-100">{faq.p}</h3>
                <span className="text-xl font-bold text-slate-300">
                  {faqAberta === index ? "−" : "+"}
                </span>
              </div>
              {faqAberta === index && (
                <p className="mt-3 text-sm text-slate-300 leading-relaxed font-normal">
                  {faq.r}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Rodapé Limpo */}
      <footer className="py-10 bg-[#04060A] text-slate-300 text-sm border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-black text-sm text-white">
              m
            </span>
            <span className="font-black text-lg text-white tracking-tight">manu.</span>
          </div>
          <p className="text-slate-400">© 2026 manu.</p>
        </div>
      </footer>
    </div>
  );
}