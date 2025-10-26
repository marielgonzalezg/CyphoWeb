"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";



export default function Header() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  }
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
          <button className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
            Home Screen
          </button>
          <button className="px-6 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            Metas
          </button>
          <button className="px-6 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            Monitoreo Gastos
          </button>
          <button className="px-6 py-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            Chequeo Financiero
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button onClick={handleLogin} 
          className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition-colors font-medium">
            Login →
          </button>
        </div>
      </div>
    </nav>
  );
}
