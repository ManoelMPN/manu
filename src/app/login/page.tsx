"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("E-mail ou senha incorretos.");
        }
        throw error;
      }

      if (data?.user) {
        router.push("/painel");
      }
    } catch (err: any) {
      setErro(err.message || "Erro ao entrar na conta.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="bg-[#0E131F] border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-sm text-white">
              m
            </div>
            <span className="font-black text-xl text-white">
              manu<span className="text-blue-500">.</span>
            </span>
          </Link>
          <span className="text-xs font-semibold text-slate-400">Acesso ao Painel</span>
        </div>

        <h1 className="text-2xl font-black text-white mb-2">Entrar na sua conta</h1>
        <p className="text-sm text-slate-300 mb-6">
          Acesse a gestão dos seus agendamentos e faturamento.
        </p>

        {erro && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3.5 rounded-xl text-sm mb-5 leading-relaxed">
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-200 mb-1.5">
              Seu E-mail
            </label>
            <input
              type="email"
              required
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-200 mb-1.5">
              Sua Senha
            </label>
            <input
              type="password"
              required
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl transition shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50 mt-2"
          >
            {carregando ? "Entrando..." : "Entrar no Painel"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-sm text-slate-400">
            Ainda não tem uma conta?{" "}
            <Link href="/cadastro" className="text-blue-400 font-bold hover:underline">
              Criar minha agenda
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}