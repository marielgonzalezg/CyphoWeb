"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();


  const navItems = [
    { href: "/", label: "Inicio" },
    { href: "/metas", label: "Metas" },
    { href: "/gastos", label: "Monitoreo Gastos" },
    { href: "/ChatBot", label: "ChatBot" },
  ];

  return (
    <header className="bg-gradient-to-r from-white via-gray-50 to-white shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo con efecto hover */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="transition-transform hover:scale-105 duration-300">
            <Image
              src="/BanorteLogoPNG.png"
              alt="BanorteLogo"
              width={200}
              height={140}
              priority
              className="drop-shadow-md"
            />
          </Link>
        </div>

        {/* Navigation con efectos mejorados */}
        <div className="flex space-x-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={`
                    px-6 py-2.5 rounded-full font-semibold 
                    transition-all duration-300 
                    transform hover:scale-105
                    shadow-md hover:shadow-lg
                    ${
                      isActive
                        ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-red-200"
                        : "bg-white text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border border-gray-200"
                    }
                  `}
                >
                  {item.label}
                </button>
              </Link>
            );
          })}
        </div>

        {/* Login Button mejorado */}
        <div className="flex items-center space-x-3">
          <Link href="/login">
            <button className="
              bg-gradient-to-r from-red-600 to-red-700 
              text-white px-8 py-2.5 rounded-full 
              hover:from-red-700 hover:to-red-800 
              transition-all duration-300 
              font-semibold 
              shadow-lg hover:shadow-xl 
              transform hover:scale-105
              hover:shadow-red-200
            ">
              Salir →
            </button>
          </Link>
        </div>
      </nav>
    </header>
  );
}