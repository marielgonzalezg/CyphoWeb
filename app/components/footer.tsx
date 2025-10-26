import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8 flex justify-between items-center text-gray-600">
        <p>© 2025 Banorte. Asistente Financiero con Claude + MCP</p>

        {/* ChatBot button */}
        <Link
          href="/ChatBot"
          className="transition-transform hover:scale-105"
        >
        </Link>
      </div>
    </footer>
  );
}
