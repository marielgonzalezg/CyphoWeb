'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Calendar, Check, Plus } from 'lucide-react';

interface Meta {
  id_meta: number;
  nombre: string;
  monto_meta: number;
  monto_actual: number;
  categoria: string;
  fecha_limite: string;
  estatus: 'Completa' | 'Incompleta';
}

export default function MetasSupabasePage() {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newMeta, setNewMeta] = useState({
    nombre: '',
    monto_meta: 0,
    categoria: 'Educacion',
    fecha_limite: '',
  });
  const [montoAgregar, setMontoAgregar] = useState<number>(0);
  const [selectedMeta, setSelectedMeta] = useState<Meta | null>(null);

  const idUsuario = localStorage.getItem("id_usuario");

  const fetchMetas = async () => {
    const { data, error } = await supabase
      .from('metas')
      .select('*')
      .eq('id_usuario', idUsuario)
      .order('id_meta', { ascending: true });

    if (error) console.error(error);
    else setMetas(data as Meta[]);
  };

  useEffect(() => {
    fetchMetas();
  }, []);

  const calcularProgreso = (meta: Meta) =>
    meta.monto_meta ? (meta.monto_actual / meta.monto_meta) * 100 : 0;

  const diasRestantes = (fecha: string) => {
    const hoy = new Date();
    const limite = new Date(fecha);
    const diff = Math.ceil((limite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const agregarMeta = async () => {
    const { error } = await supabase.from('metas').insert({
      ...newMeta,
      monto_actual: 0,
      estatus: 'Incompleta',
      id_usuario: idUsuario, 
    });

    if (error) console.error(error);
    else {
      setNewMeta({ nombre: '', monto_meta: 0, categoria: 'Educacion', fecha_limite: '' });
      setShowForm(false);
      fetchMetas();
    }
  };

  const actualizarMeta = async () => {
    if (!selectedMeta) return;

    const nuevoMonto = selectedMeta.monto_actual + montoAgregar;
    const estatusActualizado = nuevoMonto >= selectedMeta.monto_meta ? 'Completa' : 'Incompleta';

    const { error } = await supabase
      .from('metas')
      .update({ monto_actual: nuevoMonto, estatus: estatusActualizado })
      .eq('id_meta', selectedMeta.id_meta);

    if (error) console.error(error);
    else {
      setSelectedMeta(null);
      setMontoAgregar(0);
      fetchMetas();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="flex justify-between items-center text-center mb-12">
        <h1 className="text-5xl font-bold text-red-600">Tus Metas</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-red-700 transition"
        >
          <Plus className="w-5 h-5" /> Nueva Meta
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-3xl shadow-lg mb-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Agregar Meta</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nombre"
              value={newMeta.nombre}
              onChange={(e) => setNewMeta({ ...newMeta, nombre: e.target.value })}
              className="w-full border p-3 rounded-lg"
            />
            <input
              type="number"
              placeholder="Monto Meta"
              value={newMeta.monto_meta}
              onChange={(e) =>
                setNewMeta({ ...newMeta, monto_meta: parseFloat(e.target.value) })
              }
              className="w-full border p-3 rounded-lg"
            />
            <input
              type="date"
              value={newMeta.fecha_limite}
              onChange={(e) => setNewMeta({ ...newMeta, fecha_limite: e.target.value })}
              className="w-full border p-3 rounded-lg"
            />
            <select
              value={newMeta.categoria}
              onChange={(e) => setNewMeta({ ...newMeta, categoria: e.target.value })}
              className="w-full border p-3 rounded-lg"
            >
              <option value="Educacion">Educación</option>
              <option value="Transporte">Transporte</option>
              <option value="Entretenimiento">Entretenimiento</option>
              <option value="Ahorro">Ahorro</option>
            </select>
            <div className="flex gap-4">
              <button
                onClick={agregarMeta}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition"
              >
                Guardar
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {metas.map((meta) => {
          const progreso = calcularProgreso(meta);
          const dias = diasRestantes(meta.fecha_limite);

          return (
            <div
              key={meta.id_meta}
              className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 duration-500 border-4 border-red-600"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">{meta.nombre}</h3>
                <Check className="w-6 h-6 text-red-600" />
              </div>

              <div className="flex justify-center mb-4">
                <div className="relative w-28 h-28">
                  <svg className="w-28 h-28 transform -rotate-90">
                    <circle cx="56" cy="56" r="50" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                    <circle
                      cx="56"
                      cy="56"
                      r="50"
                      stroke="#DC2626"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - progreso / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-red-600">
                      {progreso.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-gray-700">Ahorrado:</span>
                  <span className="font-bold text-gray-900">${meta.monto_actual.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-gray-700">Meta:</span>
                  <span className="font-bold text-gray-900">${meta.monto_meta.toLocaleString()}</span>
                </div>
                <div className="flex justify-between bg-red-100 p-2 rounded-lg text-red-600 font-bold">
                  <span>Falta:</span>
                  <span>${(meta.monto_meta - meta.monto_actual).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mb-4 bg-gray-100 rounded-lg p-2 text-gray-700 text-xs">
                <Calendar className="w-3 h-3" />
                <span>{dias > 0 ? `${dias} días restantes` : '¡Expirado!'}</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  value={selectedMeta?.id_meta === meta.id_meta ? montoAgregar : ''}
                  onChange={(e) => {
                    setSelectedMeta(meta);
                    setMontoAgregar(parseFloat(e.target.value));
                  }}
                  placeholder="Monto a agregar"
                  className="flex-1 border p-2 rounded-lg"
                />
                <button
                  onClick={actualizarMeta}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition"
                >
                  Agregar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
