"use client";

import React, { useMemo, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

/** Colores */
const COLORS = { primary:"#FE0024", text:"#777777", white:"#FFFFFF", muted:"#DDDDDD" };

/* Tipos */
type WeekPoint = { week: string; income: number; expense: number };
type CatPoint = { name: string; value: number };
type Tx = { date: string; description: string; category: string; amount: number };

interface transacciones {
  id_transaccion: number;
  id_usuario: number;
  fecha: string;                // 'YYYY-MM-DD'
  tipo: "ingreso" | "gasto";
  monto: number;
  categoria: string;
  descripcion?: string | null;
}

/* Utils */
function peso(n: number) {
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
}
function parseFechaLocal(yyyy_mm_dd: string) {
  const [y, m, d] = yyyy_mm_dd.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function monthRange(yyyy_mm: string) {
  const [y, m] = yyyy_mm.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const next = new Date(y, m, 1);
  const fmt = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
  return { startISO: fmt(start), nextISO: fmt(next) };
}

/* Controles / Gráficas (igual que tu código) */
function MonthSwitcher({ value, onChange }: { value: string; onChange: (v: string) => void; }) {
  const date = useMemo(() => new Date(value + "-01T00:00:00"), [value]);
  const label = date.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
  function addMonths(current: string, delta: number) {
    const d = new Date(current + "-01T00:00:00"); d.setMonth(d.getMonth() + delta);
    const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, "0"); return `${y}-${m}`;
  }
  return (
    <div className="flex items-center gap-3">
      <button onClick={() => onChange(addMonths(value, -1))} className="p-2 rounded-full border border-[#DDDDDD] hover:bg-[#DDDDDD]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <div className="flex items-center gap-2 bg-[#FFFFFF] rounded-xl px-4 py-2 border border-[#DDDDDD]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2" stroke={COLORS.text} strokeWidth="2"/><path d="M3 10h18" stroke={COLORS.text} strokeWidth="2"/><path d="M8 3v4M16 3v4" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round"/></svg>
        <span className="font-bold text-[#777777] capitalize">{label}</span>
      </div>
      <button onClick={() => onChange(addMonths(value, 1))} className="p-2 rounded-full border border-[#DDDDDD] hover:bg-[#DDDDDD]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  );
}
function BarsIncomeExpense({ data }: { data: WeekPoint[] }) {
  const width = 560, height = 260, pad = { top:20,right:20,bottom:40,left:50 };
  const innerW = width - pad.left - pad.right, innerH = height - pad.top - pad.bottom;
  const maxY = Math.max(1, ...data.flatMap(d => [d.income, d.expense]));
  const xBand = innerW / Math.max(1, data.length); const barW = Math.min(28, (xBand - 16) / 2);
  const yScale = (v:number)=> innerH - (v / maxY) * innerH;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-72">
      <g transform={`translate(${pad.left},${pad.top})`}>
        {[0,0.25,0.5,0.75,1].map((t,i)=> <line key={i} x1={0} x2={innerW} y1={t*innerH} y2={t*innerH} stroke={COLORS.muted} strokeDasharray="3 3" opacity={0.8}/>)}
        {[0,0.25,0.5,0.75,1].map((t,i)=> <text key={i} x={-8} y={innerH - t*innerH} textAnchor="end" dominantBaseline="middle" fill={COLORS.text} fontSize="10">{Math.round(t*maxY).toLocaleString("es-MX")}</text>)}
        {data.map((d,i)=> {
          const x0 = i*xBand + 8, hI = innerH - yScale(d.income), hE = innerH - yScale(d.expense);
          return (
            <g key={i}>
              <rect x={x0} y={yScale(d.income)} width={barW} height={hI} fill={COLORS.primary} rx="6" />
              <rect x={x0+barW+8} y={yScale(d.expense)} width={barW} height={hE} fill={COLORS.text} rx="6" />
              <text x={x0+barW} y={innerH+18} textAnchor="middle" fill={COLORS.text} fontSize="10">{d.week.replace("Semana ","S")}</text>
            </g>
          );
        })}
        <g transform={`translate(${innerW - 160}, -10)`}>
          <rect x={0} y={0} width={12} height={12} rx={3} fill={COLORS.primary}/><text x={18} y={10} fontSize="11" fill={COLORS.text}>Ingresos</text>
          <rect x={90} y={0} width={12} height={12} rx={3} fill={COLORS.text}/><text x={108} y={10} fontSize="11" fill={COLORS.text}>Gastos</text>
        </g>
      </g>
    </svg>
  );
}
function PieByCategory({ data }: { data: CatPoint[] }) {
  const size=260,cx=size/2,cy=size/2,rO=100,rI=60,total=data.reduce((s,d)=>s+d.value,0)||1;
  const palette=[COLORS.primary,"#C4001C","#FF4D68",COLORS.text,COLORS.muted];
  let start=-Math.PI/2;
  const slices=data.map((d,i)=>{const ang=(d.value/total)*2*Math.PI,end=start+ang,large=ang>Math.PI?1:0;
    const x1o=cx+rO*Math.cos(start),y1o=cy+rO*Math.sin(start),x2o=cx+rO*Math.cos(end),y2o=cy+rO*Math.sin(end);
    const x1i=cx+rI*Math.cos(end),y1i=cy+rI*Math.sin(end),x2i=cx+rI*Math.cos(start),y2i=cy+rI*Math.sin(start);
    const path=`M ${x1o} ${y1o} A ${rO} ${rO} 0 ${large} 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${rI} ${rI} 0 ${large} 0 ${x2i} ${y2i} Z`; start=end;
    return { path, color: palette[i%palette.length], name:d.name, value:d.value };
  });
  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-72">
        <g>{slices.map((s,i)=><path key={i} d={s.path} fill={s.color}/>)}
          <circle cx={cx} cy={cy} r={rI-1} fill={COLORS.white}/>
          <text x={cx} y={cy-4} textAnchor="middle" className="font-black" fill={COLORS.primary}>
            {Math.round((data.reduce((a,b)=>a+b.value,0)/1000)*10)/10}k
          </text>
          <text x={cx} y={cy+12} textAnchor="middle" fontSize="10" fill={COLORS.text}>Gasto total</text>
        </g>
      </svg>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2">
        {data.map((d,i)=>(
          <div key={i} className="flex items-center gap-2 text-sm text-[#777777]">
            <span className="inline-block w-3 h-3 rounded" style={{background: palette[i%palette.length]}}/>
            <span className="font-semibold">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------- Lógica Supabase ----------- */

export default function FinanzasMensuales({ idUsuario }: { idUsuario?: number }) {
  const userId = localStorage.getItem("id_usuario");

  const [month, setMonth] = useState<string>("2025-10");
  const [transactions, setTransactions] = useState<transacciones[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugMsg, setDebugMsg] = useState<string>("");

  // helper para intentar con distintos nombres de tabla
  async function fetchMonthRows(tableName: string, startISO: string, nextISO: string) {
    return await supabase
      .from(tableName)
      .select("id_transaccion,id_usuario,fecha,tipo,monto,categoria,descripcion")
      .eq("id_usuario", userId)
      .gte("fecha", startISO)
      .lt("fecha", nextISO)
      .order("fecha", { ascending: false });
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { startISO, nextISO } = monthRange(month);

      // Intenta con "transacciones"
      let { data, error } = await fetchMonthRows("transacciones", startISO, nextISO);
      console.log("[Finanzas] try transacciones", { error, rows: data?.length });

      if (error) {
        console.error("Error fetching transactions:", error);
        setDebugMsg(`Error Supabase: ${error.message ?? error}`);
        setTransactions([]);
      } else {
        setTransactions((data ?? []).map((t: any) => ({ ...t, monto: Number(t.monto) })));
      }
      setLoading(false);
    }
    fetchData();
  }, [month, userId]);

  /* Derivados */
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
    arr.sort((a, b) => Number(a.week.replace(/\D/g, "")) - Number(b.week.replace(/\D/g, "")));
    return arr;
  }, [transactions]);

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

  const totals = useMemo(() => {
    const income = weeks.reduce((s, w) => s + w.income, 0);
    const expense = weeks.reduce((s, w) => s + w.expense, 0);
    const balance = income - expense;
    const savingRate = income ? Math.max(0, (income - expense) / income) : 0;
    return { income, expense, balance, savingRate };
  }, [weeks]);

  const topTransactions: Tx[] = useMemo(() => {
    return transactions.slice(0, 10).map((t) => ({
      date: t.fecha,
      description: t.descripcion || t.categoria,
      category: t.categoria,
      amount: t.tipo === "ingreso" ? Number(t.monto) : -Number(t.monto),
    }));
  }, [transactions]);

  /* Render */
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
        {/* Debug helper (puedes quitarlo cuando confirmes) */}
        {debugMsg && (
          <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 px-4 py-2 text-sm">
            {debugMsg}
          </div>
        )}

        <div className="mb-8 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-[#FE0024]">Resumen mensual</h1>
            <p className="text-[#777777] font-semibold">Gastos e ingresos por mes con gráficas</p>
          </div>
          <MonthSwitcher value={month} onChange={setMonth} />
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
            <div className={`text-3xl font-black ${totals.balance >= 0 ? "text-[#FE0024]" : "text-[#777777]"}`}>{peso(totals.balance)}</div>
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
            {weeks.length > 0 ? <BarsIncomeExpense data={weeks} /> : <div className="h-72 flex items-center justify-center text-[#777777]">No hay datos para este mes</div>}
          </div>
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
            <h2 className="text-lg font-black text-[#777777] mb-4">Gasto por categoría</h2>
            {expensesByCategory.length > 0 ? <PieByCategory data={expensesByCategory} /> : <div className="h-72 flex items-center justify-center text-[#777777]">No hay gastos para este mes</div>}
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#DDDDDD] p-6 shadow-sm">
          <h2 className="text-lg font-black text-[#777777] mb-4">Movimientos destacados</h2>
          {transactions.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-[#777777] border-b border-[#DDDDDD]">
                    <th className="py-3">Fecha</th><th className="py-3">Descripción</th><th className="py-3">Categoría</th><th className="py-3 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0,10).map((t, idx) => (
                    <tr key={idx} className="border-b border-[#DDDDDD] last:border-0">
                      <td className="py-3 text-[#777777]">{parseFechaLocal(t.fecha).toLocaleDateString("es-MX")}</td>
                      <td className="py-3 font-semibold text-[#777777]">{t.descripcion || t.categoria}</td>
                      <td className="py-3 text-[#777777]">{t.categoria}</td>
                      <td className={`py-3 text-right font-black ${t.tipo === "gasto" ? "text-[#777777]" : "text-[#FE0024]"}`}>
                        {peso(t.tipo === "gasto" ? -Number(t.monto) : Number(t.monto))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (<div className="py-8 text-center text-[#777777]">No hay transacciones para este mes</div>)}
        </div>
      </div>
    </div>
  );
}
