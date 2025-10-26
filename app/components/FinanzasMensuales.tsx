"use client";

import React, { useMemo, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

/** Paleta Banorte */
const COLORS = {
  primary: "#FE0024",
  text: "#777777",
  white: "#FFFFFF",
  muted: "#DDDDDD",
};

type WeekPoint = { week: string; income: number; expense: number };
type CatPoint = { name: string; value: number };
type TxRow = {
  id_transaccion: number;
  id_usuario: number;
  fecha: string;           // 'YYYY-MM-DD'
  tipo: "ingreso" | "gasto";
  monto: number;
  categoria: string;
  descripcion?: string | null;
};

function peso(n: number) {
  return n.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
}

// Parsear 'YYYY-MM-DD' como fecha LOCAL (evita desfases por UTC)
function parseFechaLocal(yyyy_mm_dd: string) {
  const [y, m, d] = yyyy_mm_dd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Obtener primer día y primer día del mes siguiente (para filtro < next)
function monthRange(yyyy_mm: string) {
  const [y, m] = yyyy_mm.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const next = new Date(y, m, 1);
  const fmt = (dt: Date) =>
    `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
      dt.getDate()
    ).padStart(2, "0")}`;
  return { startISO: fmt(start), nextISO: fmt(next) };
}

/* ---------------------- COMPONENTES SVG ---------------------- */

function MonthSwitcher({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const date = useMemo(() => new Date(value + "-01T00:00:00"), [value]);
  const label = date.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });

  function addMonths(current: string, delta: number) {
    const d = new Date(current + "-01T00:00:00");
    d.setMonth(d.getMonth() + delta);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(addMonths(value, -1))}
        className="p-2 rounded-full border border-[#DDDDDD] hover:bg-[#DDDDDD]"
        aria-label="Mes anterior"
        title="Mes anterior"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 6l-6 6 6 6"
            stroke={COLORS.text}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="flex items-center gap-2 bg-[#FFFFFF] rounded-xl px-4 py-2 border border-[#DDDDDD]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect
            x="3"
            y="5"
            width="18"
            height="16"
            rx="2"
            stroke={COLORS.text}
            strokeWidth="2"
          />
          <path d="M3 10h18" stroke={COLORS.text} strokeWidth="2" />
          <path
            d="M8 3v4M16 3v4"
            stroke={COLORS.text}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span className="font-bold text-[#777777] capitalize">{label}</span>
      </div>

      <button
        onClick={() => onChange(addMonths(value, 1))}
        className="p-2 rounded-full border border-[#DDDDDD] hover:bg-[#DDDDDD]"
        aria-label="Mes siguiente"
        title="Mes siguiente"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 6l6 6-6 6"
            stroke={COLORS.text}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

function BarsIncomeExpense({ data }: { data: WeekPoint[] }) {
  const width = 560;
  const height = 260;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const maxY = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]));
  const xBand = innerW / Math.max(1, data.length);
  const barW = Math.min(28, (xBand - 16) / 2);

  function yScale(v: number) {
    return innerH - (v / maxY) * innerH;
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-72">
      <g transform={`translate(${padding.left},${padding.top})`}>
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = t * innerH;
          return (
            <line
              key={i}
              x1={0}
              x2={innerW}
              y1={y}
              y2={y}
              stroke={COLORS.muted}
              strokeDasharray="3 3"
              opacity={0.8}
            />
          );
        })}

        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = innerH - t * innerH;
          const val = Math.round(t * maxY);
          return (
            <text
              key={i}
              x={-8}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              fill={COLORS.text}
              fontSize="10"
            >
              {val.toLocaleString("es-MX")}
            </text>
          );
        })}

        {data.map((d, i) => {
          const x0 = i * xBand + 8;
          const hIncome = innerH - yScale(d.income);
          const hExpense = innerH - yScale(d.expense);
          return (
            <g key={i}>
              <rect
                x={x0}
                y={yScale(d.income)}
                width={barW}
                height={hIncome}
                fill={COLORS.primary}
                rx="6"
              />
              <rect
                x={x0 + barW + 8}
                y={yScale(d.expense)}
                width={barW}
                height={hExpense}
                fill={COLORS.text}
                rx="6"
              />
              <text
                x={x0 + barW}
                y={innerH + 18}
                textAnchor="middle"
                fill={COLORS.text}
                fontSize="10"
              >
                {d.week.replace("Semana ", "S")}
              </text>
            </g>
          );
        })}

        <g transform={`translate(${innerW - 160}, ${-10})`}>
          <rect x={0} y={0} width={12} height={12} rx={3} fill={COLORS.primary} />
          <text x={18} y={10} fontSize="11" fill={COLORS.text}>
            Ingresos
          </text>
          <rect x={90} y={0} width={12} height={12} rx={3} fill={COLORS.text} />
          <text x={108} y={10} fontSize="11" fill={COLORS.text}>
            Gastos
          </text>
        </g>
      </g>
    </svg>
  );
}

function PieByCategory({ data }: { data: CatPoint[] }) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 100;
  const rInner = 60;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  const palette = [COLORS.primary, "#C4001C", "#FF4D68", COLORS.text, COLORS.muted];

  let startAngle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const angle = (d.value / total) * Math.PI * 2;
    const endAngle = startAngle + angle;
    const largeArc = angle > Math.PI ? 1 : 0;

    const x1o = cx + rOuter * Math.cos(startAngle);
    const y1o = cy + rOuter * Math.sin(startAngle);
    const x2o = cx + rOuter * Math.cos(endAngle);
    const y2o = cy + rOuter * Math.sin(endAngle);

    const x1i = cx + rInner * Math.cos(endAngle);
    const y1i = cy + rInner * Math.sin(endAngle);
    const x2i = cx + rInner * Math.cos(startAngle);
    const y2i = cy + rInner * Math.sin(startAngle);

    const path = `
      M ${x1o} ${y1o}
      A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2o} ${y2o}
      L ${x1i} ${y1i}
      A ${rInner} ${rInner} 0 ${largeArc} 0 ${x2i} ${y2i}
      Z
    `;
    startAngle = endAngle;
    return { path, color: palette[i % palette.length], name: d.name, value: d.value };
  });

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-72">
        <g>
          {slices.map((s, i) => (
            <path key={i} d={s.path} fill={s.color} />
          ))}
          <circle cx={cx} cy={cy} r={rInner - 1} fill={COLORS.white} />
          <text x={cx} y={cy - 4} textAnchor="middle" className="font-black" fill={COLORS.primary}>
            {Math.round((data.reduce((a, b) => a + b.value, 0) / 1000) * 10) / 10}k
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill={COLORS.text}>
            Gasto total
          </text>
        </g>
      </svg>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-[#777777]">
            <span className="inline-block w-3 h-3 rounded" style={{ background: palette[i % palette.length] }} />
            <span className="font-semibold">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineBalance({ data }: { data: { name: string; balance: number }[] }) {
  const width = 960;
  const height = 260;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const maxY = Math.max(...data.map((d) => d.balance), 0);
  const minY = Math.min(...data.map((d) => d.balance), 0);
  const spanY = Math.max(1, maxY - minY);

  function x(i: number) {
    if (data.length === 1) return innerW / 2;
    return (i / (data.length - 1)) * innerW;
  }
  function y(v: number) {
    return innerH - ((v - minY) / spanY) * innerH;
  }

  const path = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.balance)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-72">
      <g transform={`translate(${padding.left},${padding.top})`}>
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const yy = t * innerH;
          return <line key={i} x1={0} x2={innerW} y1={yy} y2={yy} stroke={COLORS.muted} strokeDasharray="3 3" />;
        })}

        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const val = minY + t * spanY;
          const yy = innerH - t * innerH;
          return (
            <text key={i} x={-8} y={yy} textAnchor="end" dominantBaseline="middle" fill={COLORS.text} fontSize="10">
              {Math.round(val).toLocaleString("es-MX")}
            </text>
          );
        })}

        {data.map((d, i) => (
          <text key={i} x={x(i)} y={innerH + 18} textAnchor="middle" fill={COLORS.text} fontSize="10">
            {d.name.replace("Semana ", "S")}
          </text>
        ))}

        <path d={path} fill="none" stroke={COLORS.primary} strokeWidth={3} />
        {data.map((d, i) => (
          <circle key={i} cx={x(i)} cy={y(d.balance)} r={4} fill={COLORS.primary} stroke={COLORS.white} strokeWidth={2} />
        ))}
      </g>
    </svg>
  );
}

/* ---------------------------- PÁGINA CON SUPABASE ---------------------------- */

export default function FinanzasMensuales({ idUsuario }: { idUsuario: number }) {
  const [month, setMonth] = useState<string>("2025-10");
  const [transactions, setTransactions] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const { startISO, nextISO } = monthRange(month);

      const { data, error } = await supabase
        .from("Transacciones")
        .select(
          "id_transaccion,id_usuario,fecha,tipo,monto,categoria,descripcion"
        )
        .eq("id_usuario", idUsuario)
        .gte("fecha", startISO) // >= primer día del mes
        .lt("fecha", nextISO)   // < primer día del siguiente mes
        .order("fecha", { ascending: false });

      if (error) {
        console.error("Error fetching transactions:", error);
        setTransactions([]);
      } else {
        // Asegurar número en monto
        setTransactions((data || []).map((t) => ({ ...t, monto: Number(t.monto) })));
      }
      setLoading(false);
    }
    fetchData();
  }, [month, idUsuario]);

  // Agrupar por semana (1–4/5)
  const weeks: WeekPoint[] = useMemo(() => {
    const weekMap: Record<string, { income: number; expense: number }> = {};
    transactions.forEach((t) => {
      const date = parseFechaLocal(t.fecha);
      const week = `Semana ${Math.ceil(date.getDate() / 7)}`;
      if (!weekMap[week]) weekMap[week] = { income: 0, expense: 0 };
      if (t.tipo === "ingreso") weekMap[week].income += Number(t.monto);
      else weekMap[week].expense += Number(t.monto);
    });

    const arr = Object.entries(weekMap).map(([week, val]) => ({ week, ...val }));
    // ordenar por número de semana
    arr.sort(
      (a, b) =>
        Number(a.week.replace(/\D/g, "")) - Number(b.week.replace(/\D/g, ""))
    );
    return arr;
  }, [transactions]);

  // Gastos por categoría
  const expensesByCategory: CatPoint[] = useMemo(() => {
    const catMap: Record<string, number> = {};
    transactions.forEach((t) => {
      if (t.tipo === "gasto") {
        if (!catMap[t.categoria]) catMap[t.categoria] = 0;
        catMap[t.categoria] += Number(t.monto);
      }
    });
    return Object.entries(catMap).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Balance acumulado
  const cumBalance = useMemo(() => {
    let running = 0;
    return weeks.map((w) => {
      running += w.income - w.expense;
      return { name: w.week, balance: running };
    });
  }, [weeks]);

  // Totales
  const totals = useMemo(() => {
    const income = weeks.reduce((s, w) => s + w.income, 0);
    const expense = weeks.reduce((s, w) => s + w.expense, 0);
    const balance = income - expense;
    const savingRate = income ? Math.max(0, (income - expense) / income) : 0;
    return { income, expense, balance, savingRate };
  }, [weeks]);

  // Top transacciones
  const topTransactions = useMemo(() => {
    return transactions.slice(0, 10).map((t) => ({
      date: t.fecha,
      description: t.descripcion || t.categoria,
      category: t.categoria,
      amount: t.tipo === "ingreso" ? Number(t.monto) : -Number(t.monto),
    }));
  }, [transactions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] py-8 px-4 flex items-center justify-center">
        <div className="text-[#777777] text-lg">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-[#FE0024]">Resumen mensual</h1>
            <p className="text-[#777777] font-semibold">
              Gastos e ingresos por mes con gráficas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <MonthSwitcher value={month} onChange={setMonth} />
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#DDDDDD] hover:bg-[#DDDDDD]"
              title="Exportar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 3v12" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" />
                <path d="M8 11l4 4 4-4" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 20h16" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-[#777777] font-semibold">Exportar</span>
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
            <div className="text-sm font-bold text-[#777777] mb-2">Ingresos</div>
            <div className="text-3xl font-black text-[#FE0024]">{peso(totals.income)}</div>
            <div className="text-xs text-[#777777] mt-1">Total del mes</div>
          </div>

          <div className="bg-[#FFFFFF] rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
            <div className="text-sm font-bold text-[#777777] mb-2">Gastos</div>
            <div className="text-3xl font-black text-[#777777]">{peso(totals.expense)}</div>
            <div className="text-xs text-[#777777] mt-1">Total del mes</div>
          </div>

          <div className="bg-[#FFFFFF] rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
            <div className="text-sm font-bold text-[#777777] mb-2">Balance</div>
            <div className={`text-3xl font-black ${totals.balance >= 0 ? "text-[#FE0024]" : "text-[#777777]"}`}>
              {peso(totals.balance)}
            </div>
            <div className="text-xs text-[#777777] mt-1">Ingresos - Gastos</div>
          </div>

          <div className="bg-[#FFFFFF] rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
            <div className="text-sm font-bold text-[#777777] mb-2">Tasa de ahorro</div>
            <div className="text-3xl font-black text-[#FE0024]">{(totals.savingRate * 100).toFixed(0)}%</div>
            <div className="text-xs text-[#777777] mt-1">(Balance / Ingresos)</div>
          </div>
        </div>

        {/* Gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
            <h2 className="text-lg font-black text-[#777777] mb-4">Ingresos vs Gastos (semanal)</h2>
            {weeks.length > 0 ? (
              <BarsIncomeExpense data={weeks} />
            ) : (
              <div className="h-72 flex items-center justify-center text-[#777777]">
                No hay datos para este mes
              </div>
            )}
          </div>

          <div className="bg-[#FFFFFF] rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
            <h2 className="text-lg font-black text-[#777777] mb-4">Gasto por categoría</h2>
            {expensesByCategory.length > 0 ? (
              <PieByCategory data={expensesByCategory} />
            ) : (
              <div className="h-72 flex items-center justify-center text-[#777777]">
                No hay gastos para este mes
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#FFFFFF] rounded-2xl border border-[#DDDDDD] p-6 shadow-sm mb-8">
          <h2 className="text-lg font-black text-[#777777] mb-4">Balance acumulado</h2>
          {cumBalance.length > 0 ? (
            <LineBalance data={cumBalance} />
          ) : (
            <div className="h-72 flex items-center justify-center text-[#777777]">
              No hay datos para este mes
            </div>
          )}
        </div>

        {/* Tabla */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
          <h2 className="text-lg font-black text-[#777777] mb-4">Movimientos destacados</h2>
          {topTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-[#777777] border-b border-[#DDDDDD]">
                    <th className="py-3">Fecha</th>
                    <th className="py-3">Descripción</th>
                    <th className="py-3">Categoría</th>
                    <th className="py-3 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {topTransactions.map((t, idx) => (
                    <tr key={idx} className="border-b border-[#DDDDDD] last:border-0">
                      <td className="py-3 text-[#777777]">
                        {parseFechaLocal(t.date).toLocaleDateString("es-MX")}
                      </td>
                      <td className="py-3 font-semibold text-[#777777]">{t.description}</td>
                      <td className="py-3 text-[#777777]">{t.category}</td>
                      <td className={`py-3 text-right font-black ${t.amount < 0 ? "text-[#777777]" : "text-[#FE0024]"}`}>
                        {peso(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-[#777777]">
              No hay transacciones para este mes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
