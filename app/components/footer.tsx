import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-600">
        <p>© 2024 Banorte. Asistente Financiero con Claude + MCP</p>
      </div>

      {/* Floating ChatBot button */}
      <Link
        href="/ChatBot"
        className="fixed bottom-6 right-6 transition-transform hover:scale-105"
      >
        <Image
          src="/ChatBotFotoPNG.png"
          alt="ChatBot"
          width={70}
          height={70}
          priority
        />
      </Link>
    </footer>
  );
}
