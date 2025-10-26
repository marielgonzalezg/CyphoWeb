'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../app/lib/supabaseClient';
import Link from "next/link";
 
interface Meta {
  id_meta: number;
  nombre: string;
  monto_meta: number;
  monto_actual: number;
  estatus: 'Completa' | 'Incompleta';
}

interface Usuario {
  id_usuario: number;
  nombre: string;
}

interface Transaccion {
  id_usuario: number;
  tipo: 'ingreso' | 'gasto';
  monto: number;
}

export default function Home() {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [balance, setBalance] = useState<number>(0);

  const idUsuario = localStorage.getItem("id_usuario");

  /** Traer metas */
  const fetchMetas = async () => {
    const { data, error } = await supabase
      .from('metas')
      .select('*')
      .eq('id_usuario', idUsuario)
      .order('id_meta', { ascending: true });

    if (error) console.error(error);
    else setMetas(data as Meta[]);
  };

  /** Traer usuario */
  const fetchUsuario = async () => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id_usuario, nombre')
      .eq('id_usuario', idUsuario)
      .single();

    if (error) console.error('Error fetching usuario:', error);
    else setUsuario(data as Usuario);
  };

  /** Calcular balance (ingresos - gastos) */
  const fetchBalance = async () => {
    const { data, error } = await supabase
      .from('transacciones')
      .select('tipo, monto')
      .eq('id_usuario', idUsuario);

    if (error) {
      console.error('Error fetching transacciones:', error);
      return;
    }

    let totalIngresos = 0;
    let totalGastos = 0;

    (data as Transaccion[]).forEach((t) => {
      if (t.tipo === 'ingreso') totalIngresos += Number(t.monto);
      else totalGastos += Number(t.monto);
    });

    setBalance(totalIngresos - totalGastos);
  };

  useEffect(() => {
    fetchMetas();
    fetchUsuario();
    fetchBalance();
  }, []);

  /** Calcular progreso promedio de metas */
  const progresoPromedio = () => {
    if (!metas.length) return 0;
    const totalProgreso = metas.reduce((acc, meta) => {
      return acc + (meta.monto_meta ? meta.monto_actual / meta.monto_meta : 0);
    }, 0);
    return (totalProgreso / metas.length) * 100;
  };

  const progreso = progresoPromedio();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      <main className="flex-grow relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-red-600 mb-6">
            Aprende, Invierte y Diviértete
          </h1>
          <h3 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-10">
            Toma el primer paso hacia tu libertad financiera.
          </h3>
        </div>

        {/* Cards Section */}
        <div className="max-w-7xl mx-auto px-4 pb-16 relative z-10">
          <div className="grid md:grid-cols-3 gap-6">

            {/* Card 1: Progreso metas */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 hover:scale-105 duration-500">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Metas a corto plazo
              </h3>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-56 h-56">
                  <svg className="w-56 h-56 transform -rotate-90">
                    <circle
                      cx="112"
                      cy="112"
                      r="100"
                      stroke="#E5E7EB"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="112"
                      cy="112"
                      r="100"
                      stroke="#DC2626"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 100}`}
                      strokeDashoffset={`${2 * Math.PI * 100 * (1 - progreso / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-gray-900">
                      {progreso.toFixed(0)}%
                    </span>
                    <span className="text-lg text-gray-500 mt-2">
                      Progreso promedio
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-center text-gray-700 font-medium mt-4">
                Resumen de tus metas
              </p>
            </div>

            {/* Card 2: Usuario activo mejorada */}
            <Link href="/ChatBot">
              <div className="cursor-pointer relative overflow-hidden rounded-4xl p-10 md:col-span-2
                              flex flex-col items-center justify-between text-white
                              shadow-[0_0_25px_rgba(230,0,38,0.5)]
                              hover:shadow-[0_0_50px_rgba(255,0,76,0.8)]
                              hover:scale-110 transition-all transform hover:-translate-y-3 duration-500">
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#E60026] via-[#FF004C] to-[#B0001F]
                                animate-gradient-x opacity-80"></div>
                <div className="absolute w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.2),transparent)]
                                animate-rotate-slow opacity-30 -z-20"></div>
                <div className="absolute inset-0 -z-30">
                  {[...Array(50)].map((_, i) => (
                    <span key={i} className={`absolute w-1 h-1 bg-white rounded-full animate-pulse-slow`}
                          style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s` }} />
                  ))}
                </div>
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg animate-pulse">
                  <span className="text-red-600 font-bold text-2xl">💬</span>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-xl opacity-90 mb-2 animate-fadeIn text-center">¡Bienvenido de nuevo,</p>
                  <h3 className="text-4xl font-extrabold animate-fadeIn text-center">{usuario ? usuario.nombre : "Usuario"}!</h3>
                </div>
                <p className="mt-8 text-base opacity-90 animate-fadeIn animate-delay-100 text-center
                              bg-white/20 px-4 py-2 rounded-full shadow-md backdrop-blur-sm hover:bg-white/30 transition">
                  Chatea con nuestro asistente especializado →
                </p>
              </div>
            </Link>

            {/* Card 3: Balance */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 hover:scale-105 duration-500">
              <h3 className="text-xl font-bold text-gray-800 mb-6 animate-fadeIn">
                Balance general
              </h3>
              <p className="text-gray-700 leading-relaxed text-center animate-fadeIn animate-delay-200">
                Tu balance actual es:
              </p>
              <p className={`text-4xl font-extrabold text-center mt-4 ${balance >= 0 ? "text-red-600" : "text-red-600"}`}>
                ${balance.toLocaleString('es-MX')}
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
