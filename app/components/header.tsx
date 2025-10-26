"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname  } from "next/navigation";
import { getUserIdLS, setUserIdLS } from "@/app/lib/session";

export default function Header() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  const pathname = usePathname();

  useEffect(() => {
    setUserId(getUserIdLS());
    const onAuthChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as { userId: string | null };
      setUserId(detail?.userId ?? getUserIdLS());
    };
    window.addEventListener("auth:user-changed", onAuthChange);
    return () => window.removeEventListener("auth:user-changed", onAuthChange);
  }, []);

  const handleLogout = () => {
    setUserIdLS(null);     
    router.push("/login");
  };

  if (pathname === "/login") return null;

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">B</span>
          </div>
          <span className="text-2xl font-bold text-gray-800">BANORTE</span>
        </div>

        <div className="hidden md:flex items-center space-x-2">
          <Link href="/" className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
            Home Screen
          </Link>
          <Link href="/metas" className="px-6 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            Metas
          </Link>
          <Link href="/gastos" className="px-6 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            Monitoreo Gastos
          </Link>
          <Link href="/chequeo" className="px-6 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            Chequeo Financiero
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          {userId ? (
            <button
              onClick={handleLogout}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-200 transition-colors font-medium"
            >
              Cerrar sesión
            </button>
          ) : (
            <Link
              href="/login"
              className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-colors font-medium"
            >
              Login →
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
