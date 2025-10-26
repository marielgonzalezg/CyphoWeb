// lib/meta.ts

// Helper interno para parsear fechas 'YYYY-MM-DD' como fecha LOCAL
function parseFechaLocal(yyyy_mm_dd: string) {
  const [y, m, d] = yyyy_mm_dd.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export class Meta {
  idMeta: number;
  nombre: string;
  montoMeta: number;
  montoActual: number;
  categoria: string;
  fechaLimite: string; // 'YYYY-MM-DD'

  constructor(
    id: number,
    nombre: string,
    montoMeta: number,
    montoActual: number,
    categoria: string,
    fechaLimite: string,
  ) {
    this.idMeta = id;
    this.nombre = nombre;
    this.montoMeta = montoMeta;
    this.montoActual = montoActual;
    this.categoria = categoria;
    this.fechaLimite = fechaLimite;
  }

  calcularProgreso() {
    if (!this.montoMeta) return 0;
    return Math.min((this.montoActual / this.montoMeta) * 100, 100);
  }

  calcularFaltante() {
    return Math.max(this.montoMeta - this.montoActual, 0);
  }

  calcularDiasRestantes() {
    const hoy = parseFechaLocal(new Date().toISOString().slice(0, 10));
    const limite = parseFechaLocal(this.fechaLimite);
    const diffMs = +limite - +hoy;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  estaCompletada() {
    return this.montoActual >= this.montoMeta;
  }

  agregarFondos(monto: number) {
    const nuevo = Math.max(0, Number.isFinite(monto) ? monto : 0);
    this.montoActual = Math.min(this.montoActual + nuevo, this.montoMeta);
  }
}
