import Link from "next/link";
import Header from "../app/components/header";
import Footer from "../app/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Aprende, Invierte y Diviértete
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            Toma el primer paso hacia tu libertad financiera.
          </p>
          <Link
            href="/chat"
            className="inline-block bg-red-600 text-white px-10 py-4 rounded-full text-lg font-medium hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Comienza →
          </Link>
        </div>

        {/* Cards Section */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Metas a corto plazo
              </h3>
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#FEE2E2"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#DC2626"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56 * 0.75} ${
                        2 * Math.PI * 56
                      }`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">
                      75%
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-center text-gray-700 font-medium">Bicicleta</p>
            </div>

            {/* Card 2 */}
            <div className="bg-gradient-to-br from-red-500 to-pink-400 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow text-white">
              <h3 className="text-xl font-bold mb-2">Hola, Mariel.</h3>
              <p className="text-sm opacity-90 mb-8">
                Estos son tus gastos de este mes:
              </p>

              <div className="relative h-40">
                <svg className="w-full h-full" viewBox="0 0 300 150">
                  <polyline
                    points="20,120 60,80 100,100 140,60 180,70 220,40 260,50"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.8"
                  />
                  {[20, 60, 100, 140, 180, 220, 260].map((x, i) => (
                    <circle key={i} cx={x} cy={[120, 80, 100, 60, 70, 40, 50][i]} r="4" fill="white" />
                  ))}
                </svg>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Alerta de gastos
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Este mes tus gastos fueron más elevados de lo normal. Considera
                reducir gastos innecesarios.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
