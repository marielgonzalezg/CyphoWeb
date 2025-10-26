'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Eye, EyeOff, User, Lock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';

type Usuario = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
};

export default function Login() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [usuarioLogueado, setUsuarioLogueado] = useState<Usuario | null>(null);

  async function handleLogin() {
    setError('');
    setLoading(true);
    try {
      const nombreClean = nombre.trim();
      const passClean = contrasena.trim();

      if (!nombreClean || !passClean) {
        setError('Ingresa nombre y contraseña');
        setLoading(false);
        return;
      }

      const { data, error: qErr } = await supabase
        .from('usuarios')
        .select('id_usuario,nombre,apellido,correo,contrasena')
        .eq('nombre', nombreClean)
        .eq('contrasena', passClean)
        .limit(1)
        .maybeSingle();

      if (qErr) setError(qErr.message || 'Error al iniciar sesión');
      else if (!data) setError('Nombre o contraseña incorrectos');
      else {
        localStorage.setItem('id_usuario', String(data.id_usuario));
        localStorage.setItem('nombre_usuario', data.nombre);
        setUsuarioLogueado(data as Usuario);
      }
    } catch (e: any) {
      setError(e?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (usuarioLogueado) router.replace('/');
  }, [usuarioLogueado, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block px-8 py-4 rounded-lg mb-4 bg-red-600">
            <h1 className="text-3xl font-bold text-white">BANORTE</h1>
          </div>
          <p className="text-lg text-gray-700">Banca Digital</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Iniciar Sesión</h2>

          {error && (
            <div className="mb-4 p-4 rounded-lg flex items-start gap-3 bg-red-100 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Nombre</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700" />
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none border-gray-300 text-gray-700"
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#FE0024')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#DDDDDD')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border-2 rounded-lg focus:outline-none border-gray-300 text-gray-700"
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#FE0024')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#DDDDDD')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-gray-700" /> : <Eye className="w-5 h-5 text-gray-700" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-white font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-50 transition"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6 text-gray-500">
          © 2025 Banorte. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
