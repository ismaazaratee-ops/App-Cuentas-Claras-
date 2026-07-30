import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Home, Wallet, PiggyBank, TrendingUp, CalendarCheck, Receipt,
  AlertTriangle, Info, Plus, Trash2, Save, LayoutDashboard,
  ShoppingCart, Tag, Landmark, Users, Truck, RotateCcw, Download, Upload,
} from "lucide-react";

// ---------- Tokens de marca (colección "Vender Online") ----------
const NAVY = "#1B2A4A";
const BLUE = "#2E5EAA";
const ORANGE = "#E8734A";
const BROWN = "#8A4B2E"; // acento del módulo de negocio
const GREEN = "#2E8B57";
const RED = "#C0392B";
const CREAM = "#FAFAF8";
const BORDER = "#E4E1D9";

const fmt = (n) => {
  const v = Number(n) || 0;
  return v.toLocaleString("es-AR", { maximumFractionDigits: 0 });
};
const pct = (n) => `${((Number(n) || 0) * 100).toFixed(1)}%`;
const uid = () => Math.random().toString(36).slice(2, 10);

const TIPOS_NEGOCIO = [
  "Almacén", "Pollería", "Carnicería", "Verdulería", "Supermercado", "Peluquería",
  "Fiambrería", "Rotisería", "Restaurante", "Pizzería", "Ferretería",
  "Limpieza y descartables", "Mueblería", "Hamburguesería", "Farmacia",
  "Distribuidora", "Panadería", "Forrajería", "Veterinaria", "Electrodomésticos",
  "Bicicletería", "Cafetería", "Estética", "Perfumería", "Otro",
];

// ---------- Estado inicial ----------
const initialData = {
  ingresoMensual: 350000,
  deudas: [
    { acreedor: "", monto: "", tasa: "", pagoMin: "" },
    { acreedor: "", monto: "", tasa: "", pagoMin: "" },
    { acreedor: "", monto: "", tasa: "", pagoMin: "" },
  ],
  presupuesto: {
    pct: { necesidades: 0.5, deudas: 0.3, deseos: 0.15, fondo: 0.05 },
    real: { necesidades: "", deudas: "", deseos: "", fondo: "" },
  },
  gastosHormiga: [{ semana: 1, categoria: "", descripcion: "", monto: "" }],
  flujoCaja: { ingresos: ["", "", "", ""], egresos: ["", "", "", ""] },
  fondoEmergencia: { gastoEsencialManual: "", aportes: ["", "", "", "", "", ""] },
  plan90: [
    { mes: "Mes 1", objetivo: "", accion: "", estado: "Pendiente" },
    { mes: "Mes 2", objetivo: "", accion: "", estado: "Pendiente" },
    { mes: "Mes 3", objetivo: "", accion: "", estado: "Pendiente" },
  ],
  negocio: {
    tipoNegocio: "Almacén",
    ventas: [
      { id: uid(), fecha: "", turno: "Mañana", categoria: "", producto: "", cantidad: "", precioUnit: "", tipoVenta: "Minorista", medioPago: "Efectivo" },
    ],
    precios: [
      { id: uid(), categoria: "", producto: "", costo: "", precioMayor: "", precioMenor: "" },
    ],
    gastosInternos: [
      { id: uid(), fecha: "", categoria: "Mercadería / Insumos", descripcion: "", monto: "" },
    ],
    clientes: [
      { id: uid(), cliente: "", fecha: "", concepto: "", debe: "", haber: "" },
    ],
    proveedores: [
      { id: uid(), proveedor: "", fecha: "", concepto: "", debo: "", pagado: "" },
    ],
    devoluciones: [
      { id: uid(), fecha: "", cliente: "", producto: "", motivo: "", monto: "", estado: "Pendiente" },
    ],
  },
};

const NAV_GROUPS = [
  {
    label: "Finanzas personales",
    items: [
      { id: "resumen", label: "Resumen", icon: Home },
      { id: "deudas", label: "Deudas", icon: AlertTriangle },
      { id: "presupuesto", label: "Presupuesto", icon: Wallet },
      { id: "hormiga", label: "Gastos Hormiga", icon: Receipt },
      { id: "flujo", label: "Flujo de Caja", icon: TrendingUp },
      { id: "fondo", label: "Fondo Emergencia", icon: PiggyBank },
      { id: "plan90", label: "Plan 90 Días", icon: CalendarCheck },
    ],
  },
  {
    label: "Gestión de negocio",
    items: [
      { id: "dashNegocio", label: "Dashboard Negocio", icon: LayoutDashboard },
      { id: "ventas", label: "Ventas", icon: ShoppingCart },
      { id: "precios", label: "Precios Mayor/Menor", icon: Tag },
      { id: "gastosInt", label: "Gastos Internos", icon: Landmark },
      { id: "clientes", label: "Cta. Cte. Clientes", icon: Users },
      { id: "proveedores", label: "Cta. Cte. Proveedores", icon: Truck },
      { id: "devoluciones", label: "Devoluciones / Reclamos", icon: RotateCcw },
    ],
  },
];

// ---------- Componentes de utilidad ----------
function Card({ children, style, className = "" }) {
  return (
    <div className={`rounded-xl border p-5 md:p-6 ${className}`} style={{ borderColor: BORDER, backgroundColor: "#fff", ...style }}>
      {children}
    </div>
  );
}
function SectionTitle({ title, subtitle, accent = ORANGE }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl md:text-3xl font-bold" style={{ color: NAVY }}>{title}</h2>
      {subtitle && <p className="text-sm mt-1" style={{ color: "#6B7280" }}>{subtitle}</p>}
      <div className="h-1 w-14 rounded-full mt-3" style={{ backgroundColor: accent }} />
    </div>
  );
}
function NumInput({ value, onChange, placeholder = "0" }) {
  return (
    <input
      type="number" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full rounded-md px-3 py-2 text-sm outline-none"
      style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFBEF" }}
      onFocus={(e) => (e.target.style.boxShadow = `0 0 0 2px ${ORANGE}55`)}
      onBlur={(e) => (e.target.style.boxShadow = "none")}
    />
  );
}
function TextInput({ value, onChange, placeholder = "" }) {
  return (
    <input
      type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full rounded-md px-3 py-2 text-sm outline-none"
      style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFBEF" }}
      onFocus={(e) => (e.target.style.boxShadow = `0 0 0 2px ${ORANGE}55`)}
      onBlur={(e) => (e.target.style.boxShadow = "none")}
    />
  );
}
function DateInput({ value, onChange }) {
  return (
    <input
      type="date" value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md px-2 py-2 text-sm outline-none"
      style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFBEF" }}
    />
  );
}
function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-md px-2 py-2 text-sm"
      style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFBEF" }}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
function ProgressBar({ value, color = ORANGE }) {
  const v = Math.max(0, Math.min(1, value || 0));
  return (
    <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "#EEEAE0" }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${v * 100}%`, backgroundColor: color }} />
    </div>
  );
}
function StatCard({ label, value, hint, tone = "navy" }) {
  const color = tone === "orange" ? ORANGE : tone === "red" ? RED : tone === "green" ? GREEN : tone === "brown" ? BROWN : NAVY;
  return (
    <Card className="flex-1 min-w-[210px]">
      <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8B93A6" }}>{label}</div>
      <div className="text-2xl font-bold mt-1.5" style={{ color }}>{value}</div>
      {hint && <div className="text-xs mt-1.5" style={{ color: "#9AA1B0" }}>{hint}</div>}
    </Card>
  );
}
function AddButton({ onClick, label, color = ORANGE }) {
  return (
    <button onClick={onClick} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-md" style={{ color, border: `1px solid ${color}55` }}>
      <Plus size={16} /> {label}
    </button>
  );
}
function DelBtn({ onClick }) {
  return <button onClick={onClick} className="p-1.5 rounded hover:bg-gray-100"><Trash2 size={16} style={{ color: "#B0B6C0" }} /></button>;
}
function Th({ children, first, last }) {
  return <th className={`text-white text-xs font-semibold uppercase px-3 py-2.5 text-left ${first ? "rounded-l-md" : ""} ${last ? "rounded-r-md" : ""}`}>{children}</th>;
}

// ---------- App principal ----------
export default function App() {
  const [tab, setTab] = useState("resumen");
  const [data, setData] = useState(initialData);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("sali-de-las-deudas-data", false);
        if (res && res.value) {
          const parsed = JSON.parse(res.value);
          setData({ ...initialData, ...parsed, negocio: { ...initialData.negocio, ...(parsed.negocio || {}) } });
        }
      } catch (e) { /* sin datos previos */ }
      finally { setLoaded(true); }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    setSaving(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try { await window.storage.set("sali-de-las-deudas-data", JSON.stringify(data), false); }
      catch (e) { /* silencioso */ }
      finally { setSaving(false); }
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [data, loaded]);

  const update = useCallback((path, value) => {
    setData((prev) => {
      const next = structuredClone(prev);
      let obj = next;
      for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
      obj[path[path.length - 1]] = value;
      return next;
    });
  }, []);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sali-de-las-deudas-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        setData({ ...initialData, ...parsed, negocio: { ...initialData.negocio, ...(parsed.negocio || {}) } });
      } catch (err) {
        alert("No se pudo leer el archivo. Verificá que sea un backup exportado desde esta misma app.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ---------- Cálculos: finanzas personales ----------
  const totalDeuda = data.deudas.reduce((s, d) => s + (Number(d.monto) || 0), 0);
  const totalPagoMin = data.deudas.reduce((s, d) => s + (Number(d.pagoMin) || 0), 0);
  const ingreso = Number(data.ingresoMensual) || 0;
  const ratio = ingreso > 0 ? totalPagoMin / ingreso : 0;
  const situacion = ratio < 0.2 ? "Manejable" : ratio < 0.4 ? "Ajustada" : "Crítica";
  const situacionColor = ratio < 0.2 ? GREEN : ratio < 0.4 ? ORANGE : RED;

  const presCategorias = [
    { key: "necesidades", label: "Necesidades esenciales" },
    { key: "deudas", label: "Pago de deudas" },
    { key: "deseos", label: "Deseos / flexibles" },
    { key: "fondo", label: "Fondo de emergencia" },
  ];
  const presSugerido = (key) => ingreso * (data.presupuesto.pct[key] || 0);
  const presDiferenciaTotal = presCategorias.reduce((s, c) => {
    const real = Number(data.presupuesto.real[c.key]) || 0;
    return s + (presSugerido(c.key) - real);
  }, 0);

  const gastosHormigaPorSemana = [1, 2, 3, 4].map((w) =>
    data.gastosHormiga.filter((g) => Number(g.semana) === w).reduce((s, g) => s + (Number(g.monto) || 0), 0));
  const totalHormiga = gastosHormigaPorSemana.reduce((a, b) => a + b, 0);

  const flujoSaldos = data.flujoCaja.ingresos.map((ing, i) => (Number(ing) || 0) - (Number(data.flujoCaja.egresos[i]) || 0));
  const flujoAcumulados = flujoSaldos.reduce((acc, s, i) => { acc.push(i === 0 ? s : acc[i - 1] + s); return acc; }, []);
  const hayCajaNegativa = flujoAcumulados.some((v) => v < 0);

  const gastoEsencialAuto = Number(data.presupuesto.real.necesidades) || 0;
  const gastoEsencial = Number(data.fondoEmergencia.gastoEsencialManual) || gastoEsencialAuto;
  const meta1 = gastoEsencial * 1, meta3 = gastoEsencial * 3, meta6 = gastoEsencial * 6;
  const fondoAcumulados = data.fondoEmergencia.aportes.reduce((acc, a, i) => {
    const prev = i === 0 ? 0 : acc[i - 1]; acc.push(prev + (Number(a) || 0)); return acc;
  }, []);
  const fondoTotal = fondoAcumulados.length ? fondoAcumulados[fondoAcumulados.length - 1] : 0;
  const fondoPct1 = meta1 > 0 ? fondoTotal / meta1 : 0;

  // ---------- Cálculos: negocio ----------
  const neg = data.negocio;
  const ventaTotal = (v) => (Number(v.cantidad) || 0) * (Number(v.precioUnit) || 0);
  const ventasTotales = neg.ventas.reduce((s, v) => s + ventaTotal(v), 0);
  const ventasPorTurno = ["Mañana", "Tarde", "Noche"].map((t) => neg.ventas.filter((v) => v.turno === t).reduce((s, v) => s + ventaTotal(v), 0));
  const ventasPorPago = ["Efectivo", "Tarjeta", "Transferencia"].map((p) => neg.ventas.filter((v) => v.medioPago === p).reduce((s, v) => s + ventaTotal(v), 0));
  const ventasPorTipo = ["Mayorista", "Minorista"].map((t) => neg.ventas.filter((v) => v.tipoVenta === t).reduce((s, v) => s + ventaTotal(v), 0));

  const totalGastosInternos = neg.gastosInternos.reduce((s, g) => s + (Number(g.monto) || 0), 0);
  const CATEGORIAS_GASTO = ["Sueldos", "Alquiler", "Servicios", "Mercadería / Insumos", "Impuestos", "Mantenimiento", "Transporte", "Otro"];
  const gastosPorCategoria = CATEGORIAS_GASTO.map((c) => neg.gastosInternos.filter((g) => g.categoria === c).reduce((s, g) => s + (Number(g.monto) || 0), 0));

  const nombresUnicos = (arr, key) => [...new Set(arr.map((x) => (x[key] || "").trim()).filter(Boolean))];
  const clientesUnicos = nombresUnicos(neg.clientes, "cliente");
  const saldoCliente = (nombre) => {
    const debe = neg.clientes.filter((c) => c.cliente === nombre).reduce((s, c) => s + (Number(c.debe) || 0), 0);
    const haber = neg.clientes.filter((c) => c.cliente === nombre).reduce((s, c) => s + (Number(c.haber) || 0), 0);
    return { debe, haber, saldo: debe - haber };
  };
  const deudaClientesTotal = clientesUnicos.reduce((s, n) => s + saldoCliente(n).saldo, 0);

  const proveedoresUnicos = nombresUnicos(neg.proveedores, "proveedor");
  const saldoProveedor = (nombre) => {
    const debo = neg.proveedores.filter((p) => p.proveedor === nombre).reduce((s, p) => s + (Number(p.debo) || 0), 0);
    const pagado = neg.proveedores.filter((p) => p.proveedor === nombre).reduce((s, p) => s + (Number(p.pagado) || 0), 0);
    return { debo, pagado, saldo: debo - pagado };
  };
  const deudaProveedoresTotal = proveedoresUnicos.reduce((s, n) => s + saldoProveedor(n).saldo, 0);

  const totalDevoluciones = neg.devoluciones.reduce((s, d) => s + (Number(d.monto) || 0), 0);
  const reclamosPendientes = neg.devoluciones.filter((d) => d.estado === "Pendiente").length;

  const resultadoPeriodo = ventasTotales - totalGastosInternos;

  const updNeg = (key, arr) => update(["negocio", key], arr);
  const rowUpd = (key, id, field, value) => {
    const arr = neg[key].map((row) => (row.id === id ? { ...row, [field]: value } : row));
    updNeg(key, arr);
  };
  const rowDel = (key, id) => updNeg(key, neg[key].filter((r) => r.id !== id));

  // ---------- Render: finanzas personales (igual que antes) ----------
  const renderResumen = () => (
    <>
      {totalDeuda === 0 && totalPagoMin === 0 && ventasTotales === 0 && (
        <Card className="mb-6" style={{ backgroundColor: NAVY, borderColor: NAVY }}>
          <div className="text-white">
            <div className="text-xl md:text-2xl font-bold mb-2">Ordená tu plata. Hacé crecer tu negocio.</div>
            <p className="text-sm mb-4" style={{ color: "#C7D0E3" }}>
              Todo lo que necesitás para dejar de andar a los ponchazos con tus números — en un solo lugar, sin Excel complicado ni contador.
            </p>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {[
                "Sabé cuánto debés y cómo pagarlo más rápido",
                "Armá un presupuesto que sí podés sostener",
                "Controlá ventas, precios y quién te debe",
                "Anticipate a los problemas de caja antes de que pasen",
              ].map((txt) => (
                <div key={txt} className="flex items-start gap-2 text-sm" style={{ color: "#E9ECF5" }}>
                  <span style={{ color: ORANGE }}>✓</span>{txt}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
      <SectionTitle title="Resumen general" subtitle="Tu panorama de un vistazo, tomado de todas las secciones." />
      <div className="flex flex-wrap gap-4 mb-6">
        <StatCard label="Total de deudas" value={`$${fmt(totalDeuda)}`} tone="red" />
        <StatCard label="Ratio deuda-ingreso" value={pct(ratio)} hint={situacion} tone={ratio < 0.2 ? "green" : ratio < 0.4 ? "orange" : "red"} />
        <StatCard label="Gastos hormiga del mes" value={`$${fmt(totalHormiga)}`} tone="orange" />
        <StatCard label="Fondo de emergencia" value={`$${fmt(fondoTotal)}`} hint={meta1 > 0 ? `${pct(fondoPct1)} de tu Meta 1` : "Definí tu gasto esencial"} tone="green" />
      </div>
      <Card>
        <div className="flex items-center gap-2 mb-4"><Info size={18} style={{ color: BLUE }} /><span className="font-semibold" style={{ color: NAVY }}>Cómo estás parado hoy</span></div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1"><span style={{ color: "#555" }}>Ratio deuda-ingreso</span><span className="font-semibold" style={{ color: situacionColor }}>{situacion}</span></div>
            <ProgressBar value={Math.min(ratio / 0.5, 1)} color={situacionColor} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1"><span style={{ color: "#555" }}>Presupuesto: diferencia total</span><span className="font-semibold" style={{ color: presDiferenciaTotal >= 0 ? GREEN : RED }}>{presDiferenciaTotal >= 0 ? "+" : ""}{fmt(presDiferenciaTotal)}</span></div>
            <p className="text-xs" style={{ color: "#9AA1B0" }}>{presDiferenciaTotal >= 0 ? "Estás dentro de lo presupuestado." : "Te excediste del presupuesto este mes."}</p>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1"><span style={{ color: "#555" }}>Progreso fondo de emergencia (Meta 1)</span><span className="font-semibold" style={{ color: GREEN }}>{pct(fondoPct1)}</span></div>
            <ProgressBar value={fondoPct1} color={GREEN} />
          </div>
          {hayCajaNegativa && (
            <div className="flex items-start gap-2 p-3 rounded-md" style={{ backgroundColor: "#FDEDE6" }}>
              <AlertTriangle size={16} style={{ color: ORANGE, marginTop: 2 }} />
              <span className="text-sm" style={{ color: "#7A3B22" }}>Tu flujo de caja proyecta saldo negativo en alguna semana. Revisá "Flujo de Caja".</span>
            </div>
          )}
        </div>
      </Card>
    </>
  );

  const renderDeudas = () => (
    <>
      <SectionTitle title="Diagnóstico de deudas" subtitle="Cargá cada deuda, sin dejar ninguna afuera." />
      <Card className="mb-6">
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#8B93A6" }}>Ingreso mensual total</label>
        <div className="mt-1 max-w-xs"><NumInput value={data.ingresoMensual} onChange={(v) => update(["ingresoMensual"], v)} /></div>
      </Card>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead><tr style={{ backgroundColor: NAVY }}>
              <Th first>Acreedor</Th><Th>Monto total</Th><Th>Tasa interés anual (%)</Th><Th>Pago mínimo mensual</Th><Th last></Th>
            </tr></thead>
            <tbody>
              {data.deudas.map((d, i) => (
                <tr key={i} className="border-b" style={{ borderColor: BORDER }}>
                  <td className="px-3 py-2"><TextInput value={d.acreedor} onChange={(v) => { const arr = [...data.deudas]; arr[i] = { ...arr[i], acreedor: v }; update(["deudas"], arr); }} placeholder="Ej: Tarjeta Banco X" /></td>
                  <td className="px-3 py-2"><NumInput value={d.monto} onChange={(v) => { const arr = [...data.deudas]; arr[i] = { ...arr[i], monto: v }; update(["deudas"], arr); }} /></td>
                  <td className="px-3 py-2"><NumInput value={d.tasa} onChange={(v) => { const arr = [...data.deudas]; arr[i] = { ...arr[i], tasa: v }; update(["deudas"], arr); }} /></td>
                  <td className="px-3 py-2"><NumInput value={d.pagoMin} onChange={(v) => { const arr = [...data.deudas]; arr[i] = { ...arr[i], pagoMin: v }; update(["deudas"], arr); }} /></td>
                  <td className="px-3 py-2"><DelBtn onClick={() => update(["deudas"], data.deudas.filter((_, idx) => idx !== i))} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AddButton label="Agregar deuda" onClick={() => update(["deudas"], [...data.deudas, { acreedor: "", monto: "", tasa: "", pagoMin: "" }])} />
        <div className="mt-6 pt-5 grid sm:grid-cols-3 gap-4" style={{ borderTop: `1px solid ${BORDER}` }}>
          <div><div className="text-xs font-semibold uppercase" style={{ color: "#8B93A6" }}>Total deuda</div><div className="text-xl font-bold" style={{ color: NAVY }}>${fmt(totalDeuda)}</div></div>
          <div><div className="text-xs font-semibold uppercase" style={{ color: "#8B93A6" }}>Pagos mínimos / mes</div><div className="text-xl font-bold" style={{ color: NAVY }}>${fmt(totalPagoMin)}</div></div>
          <div><div className="text-xs font-semibold uppercase" style={{ color: "#8B93A6" }}>Ratio deuda-ingreso</div><div className="text-xl font-bold" style={{ color: situacionColor }}>{pct(ratio)} · {situacion}</div></div>
        </div>
      </Card>
    </>
  );

  const renderPresupuesto = () => (
    <>
      <SectionTitle title="Presupuesto mensual" subtitle="Regla 50/30/20 adaptada. Ajustá los % si tu situación lo requiere." />
      <Card>
        <div className="mb-4 text-sm" style={{ color: "#555" }}>Ingreso mensual: <strong style={{ color: NAVY }}>${fmt(ingreso)}</strong> <span style={{ color: "#9AA1B0" }}>(de la sección Deudas)</span></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead><tr style={{ backgroundColor: NAVY }}><Th first>Categoría</Th><Th>% sugerido</Th><Th>Monto sugerido</Th><Th>Monto real</Th><Th last>Diferencia</Th></tr></thead>
            <tbody>
              {presCategorias.map((c) => {
                const sugerido = presSugerido(c.key), real = Number(data.presupuesto.real[c.key]) || 0, dif = sugerido - real;
                return (
                  <tr key={c.key} className="border-b" style={{ borderColor: BORDER }}>
                    <td className="px-3 py-2.5 font-medium" style={{ color: NAVY }}>{c.label}</td>
                    <td className="px-3 py-2 w-28"><NumInput value={data.presupuesto.pct[c.key] * 100} onChange={(v) => update(["presupuesto", "pct", c.key], (Number(v) || 0) / 100)} /></td>
                    <td className="px-3 py-2.5">${fmt(sugerido)}</td>
                    <td className="px-3 py-2 w-32"><NumInput value={data.presupuesto.real[c.key]} onChange={(v) => update(["presupuesto", "real", c.key], v)} /></td>
                    <td className="px-3 py-2.5 font-semibold" style={{ color: dif >= 0 ? GREEN : RED }}>{dif >= 0 ? "+" : ""}{fmt(dif)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-5 flex items-center justify-between p-3 rounded-md" style={{ backgroundColor: presDiferenciaTotal >= 0 ? "#E8F5EC" : "#FDEDE6" }}>
          <span className="text-sm font-semibold" style={{ color: presDiferenciaTotal >= 0 ? GREEN : RED }}>Diferencia total: {presDiferenciaTotal >= 0 ? "+" : ""}${fmt(presDiferenciaTotal)}</span>
          <span className="text-xs" style={{ color: "#6B7280" }}>{presDiferenciaTotal >= 0 ? "Dentro de presupuesto" : "Te excediste este mes"}</span>
        </div>
      </Card>
    </>
  );

  const renderHormiga = () => (
    <>
      <SectionTitle title="Gastos hormiga" subtitle="Registrá cada gasto chico. El resumen semanal se calcula solo." />
      <Card className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead><tr style={{ backgroundColor: NAVY }}><Th first>Semana</Th><Th>Categoría</Th><Th>Descripción</Th><Th>Monto</Th><Th last></Th></tr></thead>
            <tbody>
              {data.gastosHormiga.map((g, i) => (
                <tr key={i} className="border-b" style={{ borderColor: BORDER }}>
                  <td className="px-3 py-2 w-24"><Select value={g.semana} onChange={(v) => { const arr = [...data.gastosHormiga]; arr[i] = { ...arr[i], semana: Number(v) }; update(["gastosHormiga"], arr); }} options={[1, 2, 3, 4]} /></td>
                  <td className="px-3 py-2"><TextInput value={g.categoria} onChange={(v) => { const arr = [...data.gastosHormiga]; arr[i] = { ...arr[i], categoria: v }; update(["gastosHormiga"], arr); }} placeholder="Delivery, café..." /></td>
                  <td className="px-3 py-2"><TextInput value={g.descripcion} onChange={(v) => { const arr = [...data.gastosHormiga]; arr[i] = { ...arr[i], descripcion: v }; update(["gastosHormiga"], arr); }} /></td>
                  <td className="px-3 py-2 w-32"><NumInput value={g.monto} onChange={(v) => { const arr = [...data.gastosHormiga]; arr[i] = { ...arr[i], monto: v }; update(["gastosHormiga"], arr); }} /></td>
                  <td className="px-3 py-2"><DelBtn onClick={() => update(["gastosHormiga"], data.gastosHormiga.filter((_, idx) => idx !== i))} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AddButton label="Agregar gasto" onClick={() => update(["gastosHormiga"], [...data.gastosHormiga, { semana: 1, categoria: "", descripcion: "", monto: "" }])} />
      </Card>
      <Card>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {gastosHormigaPorSemana.map((total, i) => (
            <div key={i}><div className="text-xs font-semibold uppercase" style={{ color: "#8B93A6" }}>Semana {i + 1}</div><div className="text-lg font-bold" style={{ color: NAVY }}>${fmt(total)}</div></div>
          ))}
        </div>
        <div className="pt-4 flex justify-between items-center" style={{ borderTop: `1px solid ${BORDER}` }}>
          <span className="font-semibold" style={{ color: NAVY }}>Total del mes</span><span className="text-xl font-bold" style={{ color: ORANGE }}>${fmt(totalHormiga)}</span>
        </div>
      </Card>
    </>
  );

  const renderFlujo = () => (
    <>
      <SectionTitle title="Flujo de caja" subtitle="Para comerciantes: proyectá ingresos y egresos semana a semana." />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead><tr style={{ backgroundColor: NAVY }}><Th first>Concepto</Th>{[1, 2, 3, 4].map((w) => <th key={w} className="text-white text-xs font-semibold uppercase px-3 py-2.5 text-center">Semana {w}</th>)}</tr></thead>
            <tbody>
              <tr className="border-b" style={{ borderColor: BORDER }}>
                <td className="px-3 py-2.5 font-medium" style={{ color: NAVY }}>Ingresos esperados</td>
                {data.flujoCaja.ingresos.map((v, i) => <td key={i} className="px-3 py-2"><NumInput value={v} onChange={(val) => { const arr = [...data.flujoCaja.ingresos]; arr[i] = val; update(["flujoCaja", "ingresos"], arr); }} /></td>)}
              </tr>
              <tr className="border-b" style={{ borderColor: BORDER }}>
                <td className="px-3 py-2.5 font-medium" style={{ color: NAVY }}>Egresos esperados</td>
                {data.flujoCaja.egresos.map((v, i) => <td key={i} className="px-3 py-2"><NumInput value={v} onChange={(val) => { const arr = [...data.flujoCaja.egresos]; arr[i] = val; update(["flujoCaja", "egresos"], arr); }} /></td>)}
              </tr>
              <tr className="border-b" style={{ borderColor: BORDER }}>
                <td className="px-3 py-2.5 font-semibold" style={{ color: NAVY }}>Saldo semanal</td>
                {flujoSaldos.map((s, i) => <td key={i} className="px-3 py-2.5 text-center font-semibold" style={{ color: s >= 0 ? GREEN : RED }}>${fmt(s)}</td>)}
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-semibold" style={{ color: NAVY }}>Saldo acumulado</td>
                {flujoAcumulados.map((s, i) => <td key={i} className="px-3 py-2.5 text-center font-bold" style={{ color: s >= 0 ? GREEN : RED }}>${fmt(s)}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
        {hayCajaNegativa && (
          <div className="mt-5 flex items-start gap-2 p-3 rounded-md" style={{ backgroundColor: "#FDEDE6" }}>
            <AlertTriangle size={16} style={{ color: ORANGE, marginTop: 2 }} />
            <span className="text-sm" style={{ color: "#7A3B22" }}>Alguna semana proyecta saldo acumulado negativo: podés anticiparlo con tiempo.</span>
          </div>
        )}
      </Card>
    </>
  );

  const renderFondo = () => (
    <>
      <SectionTitle title="Fondo de emergencia" subtitle="Tu colchón mientras pagás deudas." />
      <Card className="mb-6">
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#8B93A6" }}>Gasto esencial mensual {gastoEsencialAuto > 0 && !data.fondoEmergencia.gastoEsencialManual && "(tomado del Presupuesto)"}</label>
        <div className="mt-1 max-w-xs"><NumInput value={data.fondoEmergencia.gastoEsencialManual} onChange={(v) => update(["fondoEmergencia", "gastoEsencialManual"], v)} placeholder={gastoEsencialAuto ? String(gastoEsencialAuto) : "0"} /></div>
        <div className="grid sm:grid-cols-3 gap-4 mt-5">
          {[["Meta 1 (1 mes)", meta1], ["Meta 2 (3 meses)", meta3], ["Meta 3 (6 meses)", meta6]].map(([label, val]) => (
            <div key={label} className="p-3 rounded-md" style={{ backgroundColor: "#F5F6F9" }}><div className="text-xs font-semibold uppercase" style={{ color: "#8B93A6" }}>{label}</div><div className="text-lg font-bold" style={{ color: NAVY }}>${fmt(val)}</div></div>
          ))}
        </div>
      </Card>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead><tr style={{ backgroundColor: NAVY }}><Th first>Mes</Th><Th>Aporte</Th><Th>Acumulado</Th><Th last>% Meta 1</Th></tr></thead>
            <tbody>
              {data.fondoEmergencia.aportes.map((a, i) => (
                <tr key={i} className="border-b" style={{ borderColor: BORDER }}>
                  <td className="px-3 py-2.5" style={{ color: NAVY }}>Mes {i + 1}</td>
                  <td className="px-3 py-2 w-32"><NumInput value={a} onChange={(v) => { const arr = [...data.fondoEmergencia.aportes]; arr[i] = v; update(["fondoEmergencia", "aportes"], arr); }} /></td>
                  <td className="px-3 py-2.5 font-semibold" style={{ color: NAVY }}>${fmt(fondoAcumulados[i])}</td>
                  <td className="px-3 py-2.5"><div className="flex items-center gap-2"><div className="w-20"><ProgressBar value={meta1 > 0 ? fondoAcumulados[i] / meta1 : 0} color={GREEN} /></div><span className="text-xs font-medium" style={{ color: GREEN }}>{meta1 > 0 ? pct(fondoAcumulados[i] / meta1) : "—"}</span></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );

  const renderPlan90 = () => (
    <>
      <SectionTitle title="Plan de 90 días" subtitle="Un objetivo concreto por mes." />
      <Card>
        <div className="space-y-4">
          {data.plan90.map((m, i) => (
            <div key={i} className="p-4 rounded-lg" style={{ border: `1px solid ${BORDER}` }}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold" style={{ color: ORANGE }}>{m.mes}</span>
                <select value={m.estado} onChange={(e) => { const arr = [...data.plan90]; arr[i] = { ...arr[i], estado: e.target.value }; update(["plan90"], arr); }}
                  className="text-xs font-semibold rounded-full px-3 py-1"
                  style={{ border: `1px solid ${BORDER}`, backgroundColor: m.estado === "Cumplido" ? "#E8F5EC" : m.estado === "En progreso" ? "#FDEDE6" : "#F5F6F9", color: m.estado === "Cumplido" ? GREEN : m.estado === "En progreso" ? ORANGE : "#8B93A6" }}>
                  <option>Pendiente</option><option>En progreso</option><option>Cumplido</option>
                </select>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold uppercase" style={{ color: "#8B93A6" }}>Objetivo principal</label><TextInput value={m.objetivo} onChange={(v) => { const arr = [...data.plan90]; arr[i] = { ...arr[i], objetivo: v }; update(["plan90"], arr); }} /></div>
                <div><label className="text-xs font-semibold uppercase" style={{ color: "#8B93A6" }}>Acción concreta</label><TextInput value={m.accion} onChange={(v) => { const arr = [...data.plan90]; arr[i] = { ...arr[i], accion: v }; update(["plan90"], arr); }} /></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );

  // ---------- Render: gestión de negocio ----------
  const renderDashNegocio = () => (
    <>
      <SectionTitle title="Dashboard del negocio" subtitle="Panorama comercial completo, para cualquier rubro." accent={BROWN} />
      <Card className="mb-6">
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#8B93A6" }}>Tipo de negocio (solo referencia)</label>
        <div className="mt-1 max-w-xs"><Select value={neg.tipoNegocio} onChange={(v) => update(["negocio", "tipoNegocio"], v)} options={TIPOS_NEGOCIO} /></div>
      </Card>
      <div className="flex flex-wrap gap-4 mb-6">
        <StatCard label="Ventas totales" value={`$${fmt(ventasTotales)}`} tone="brown" />
        <StatCard label="Gastos internos" value={`$${fmt(totalGastosInternos)}`} tone="red" />
        <StatCard label="Resultado del período" value={`$${fmt(resultadoPeriodo)}`} tone={resultadoPeriodo >= 0 ? "green" : "red"} />
        <StatCard label="Deuda de clientes" value={`$${fmt(deudaClientesTotal)}`} tone="orange" />
        <StatCard label="Deuda a proveedores" value={`$${fmt(deudaProveedoresTotal)}`} tone="navy" />
        <StatCard label="Devoluciones" value={`$${fmt(totalDevoluciones)}`} hint={`${reclamosPendientes} reclamo(s) pendiente(s)`} tone="orange" />
      </div>
      <Card>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-semibold mb-3" style={{ color: NAVY }}>Ventas por turno</div>
            {["Mañana", "Tarde", "Noche"].map((t, i) => (
              <div key={t} className="mb-2.5">
                <div className="flex justify-between text-xs mb-1"><span style={{ color: "#555" }}>{t}</span><span className="font-semibold" style={{ color: NAVY }}>${fmt(ventasPorTurno[i])}</span></div>
                <ProgressBar value={ventasTotales > 0 ? ventasPorTurno[i] / ventasTotales : 0} color={BROWN} />
              </div>
            ))}
          </div>
          <div>
            <div className="text-sm font-semibold mb-3" style={{ color: NAVY }}>Ventas por medio de pago</div>
            {["Efectivo", "Tarjeta", "Transferencia"].map((p, i) => (
              <div key={p} className="mb-2.5">
                <div className="flex justify-between text-xs mb-1"><span style={{ color: "#555" }}>{p}</span><span className="font-semibold" style={{ color: NAVY }}>${fmt(ventasPorPago[i])}</span></div>
                <ProgressBar value={ventasTotales > 0 ? ventasPorPago[i] / ventasTotales : 0} color={BLUE} />
              </div>
            ))}
          </div>
        </div>
      </Card>
    </>
  );

  const renderVentas = () => (
    <>
      <SectionTitle title="Ventas" subtitle="Registrá cada venta: turno, tipo y medio de pago." accent={BROWN} />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead><tr style={{ backgroundColor: BROWN }}>
              <Th first>Fecha</Th><Th>Turno</Th><Th>Categoría</Th><Th>Producto/Servicio</Th><Th>Cant.</Th><Th>Precio Unit.</Th><Th>Tipo</Th><Th>Medio Pago</Th><Th>Total</Th><Th last></Th>
            </tr></thead>
            <tbody>
              {neg.ventas.map((v) => (
                <tr key={v.id} className="border-b" style={{ borderColor: BORDER }}>
                  <td className="px-2 py-2 w-32"><DateInput value={v.fecha} onChange={(val) => rowUpd("ventas", v.id, "fecha", val)} /></td>
                  <td className="px-2 py-2 w-24"><Select value={v.turno} onChange={(val) => rowUpd("ventas", v.id, "turno", val)} options={["Mañana", "Tarde", "Noche"]} /></td>
                  <td className="px-2 py-2"><TextInput value={v.categoria} onChange={(val) => rowUpd("ventas", v.id, "categoria", val)} /></td>
                  <td className="px-2 py-2"><TextInput value={v.producto} onChange={(val) => rowUpd("ventas", v.id, "producto", val)} /></td>
                  <td className="px-2 py-2 w-20"><NumInput value={v.cantidad} onChange={(val) => rowUpd("ventas", v.id, "cantidad", val)} /></td>
                  <td className="px-2 py-2 w-28"><NumInput value={v.precioUnit} onChange={(val) => rowUpd("ventas", v.id, "precioUnit", val)} /></td>
                  <td className="px-2 py-2 w-28"><Select value={v.tipoVenta} onChange={(val) => rowUpd("ventas", v.id, "tipoVenta", val)} options={["Mayorista", "Minorista"]} /></td>
                  <td className="px-2 py-2 w-32"><Select value={v.medioPago} onChange={(val) => rowUpd("ventas", v.id, "medioPago", val)} options={["Efectivo", "Tarjeta", "Transferencia"]} /></td>
                  <td className="px-3 py-2.5 font-semibold text-center" style={{ color: NAVY }}>${fmt(ventaTotal(v))}</td>
                  <td className="px-2 py-2"><DelBtn onClick={() => rowDel("ventas", v.id)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AddButton color={BROWN} label="Agregar venta" onClick={() => updNeg("ventas", [...neg.ventas, { id: uid(), fecha: "", turno: "Mañana", categoria: "", producto: "", cantidad: "", precioUnit: "", tipoVenta: "Minorista", medioPago: "Efectivo" }])} />
        <div className="mt-6 pt-5 grid sm:grid-cols-3 gap-4" style={{ borderTop: `1px solid ${BORDER}` }}>
          <div><div className="text-xs font-semibold uppercase" style={{ color: "#8B93A6" }}>Mayorista</div><div className="text-lg font-bold" style={{ color: NAVY }}>${fmt(ventasPorTipo[0])}</div></div>
          <div><div className="text-xs font-semibold uppercase" style={{ color: "#8B93A6" }}>Minorista</div><div className="text-lg font-bold" style={{ color: NAVY }}>${fmt(ventasPorTipo[1])}</div></div>
          <div><div className="text-xs font-semibold uppercase" style={{ color: "#8B93A6" }}>Total ventas</div><div className="text-lg font-bold" style={{ color: BROWN }}>${fmt(ventasTotales)}</div></div>
        </div>
      </Card>
    </>
  );

  const renderPrecios = () => (
    <>
      <SectionTitle title="Precios mayorista y minorista" subtitle="Tu lista de precios, con margen calculado solo." accent={BROWN} />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead><tr style={{ backgroundColor: BROWN }}><Th first>Categoría</Th><Th>Producto/Servicio</Th><Th>Costo</Th><Th>P. Mayorista</Th><Th>P. Minorista</Th><Th>Margen May.</Th><Th>Margen Min.</Th><Th last></Th></tr></thead>
            <tbody>
              {neg.precios.map((p) => {
                const costo = Number(p.costo) || 0, pMay = Number(p.precioMayor) || 0, pMen = Number(p.precioMenor) || 0;
                const margMay = pMay > 0 ? (pMay - costo) / pMay : 0, margMen = pMen > 0 ? (pMen - costo) / pMen : 0;
                return (
                  <tr key={p.id} className="border-b" style={{ borderColor: BORDER }}>
                    <td className="px-2 py-2"><TextInput value={p.categoria} onChange={(v) => rowUpd("precios", p.id, "categoria", v)} /></td>
                    <td className="px-2 py-2"><TextInput value={p.producto} onChange={(v) => rowUpd("precios", p.id, "producto", v)} /></td>
                    <td className="px-2 py-2 w-28"><NumInput value={p.costo} onChange={(v) => rowUpd("precios", p.id, "costo", v)} /></td>
                    <td className="px-2 py-2 w-28"><NumInput value={p.precioMayor} onChange={(v) => rowUpd("precios", p.id, "precioMayor", v)} /></td>
                    <td className="px-2 py-2 w-28"><NumInput value={p.precioMenor} onChange={(v) => rowUpd("precios", p.id, "precioMenor", v)} /></td>
                    <td className="px-3 py-2.5 text-center font-semibold" style={{ color: margMay >= 0.15 ? GREEN : ORANGE }}>{pMay > 0 ? pct(margMay) : "—"}</td>
                    <td className="px-3 py-2.5 text-center font-semibold" style={{ color: margMen >= 0.15 ? GREEN : ORANGE }}>{pMen > 0 ? pct(margMen) : "—"}</td>
                    <td className="px-2 py-2"><DelBtn onClick={() => rowDel("precios", p.id)} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <AddButton color={BROWN} label="Agregar producto/servicio" onClick={() => updNeg("precios", [...neg.precios, { id: uid(), categoria: "", producto: "", costo: "", precioMayor: "", precioMenor: "" }])} />
      </Card>
    </>
  );

  const renderGastosInt = () => (
    <>
      <SectionTitle title="Gastos internos" subtitle="Sueldos, alquiler, servicios, mercadería y todo lo que sale de la caja." accent={BROWN} />
      <Card className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead><tr style={{ backgroundColor: BROWN }}><Th first>Fecha</Th><Th>Categoría</Th><Th>Descripción</Th><Th>Monto</Th><Th last></Th></tr></thead>
            <tbody>
              {neg.gastosInternos.map((g) => (
                <tr key={g.id} className="border-b" style={{ borderColor: BORDER }}>
                  <td className="px-2 py-2 w-32"><DateInput value={g.fecha} onChange={(v) => rowUpd("gastosInternos", g.id, "fecha", v)} /></td>
                  <td className="px-2 py-2 w-48"><Select value={g.categoria} onChange={(v) => rowUpd("gastosInternos", g.id, "categoria", v)} options={CATEGORIAS_GASTO} /></td>
                  <td className="px-2 py-2"><TextInput value={g.descripcion} onChange={(v) => rowUpd("gastosInternos", g.id, "descripcion", v)} /></td>
                  <td className="px-2 py-2 w-32"><NumInput value={g.monto} onChange={(v) => rowUpd("gastosInternos", g.id, "monto", v)} /></td>
                  <td className="px-2 py-2"><DelBtn onClick={() => rowDel("gastosInternos", g.id)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AddButton color={BROWN} label="Agregar gasto" onClick={() => updNeg("gastosInternos", [...neg.gastosInternos, { id: uid(), fecha: "", categoria: "Mercadería / Insumos", descripcion: "", monto: "" }])} />
      </Card>
      <Card>
        <div className="text-sm font-semibold mb-3" style={{ color: NAVY }}>Por categoría</div>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5">
          {CATEGORIAS_GASTO.map((c, i) => (
            <div key={c} className="flex justify-between text-sm"><span style={{ color: "#555" }}>{c}</span><span className="font-semibold" style={{ color: NAVY }}>${fmt(gastosPorCategoria[i])}</span></div>
          ))}
        </div>
        <div className="mt-5 pt-4 flex justify-between items-center" style={{ borderTop: `1px solid ${BORDER}` }}>
          <span className="font-semibold" style={{ color: NAVY }}>Total gastos internos</span><span className="text-xl font-bold" style={{ color: RED }}>${fmt(totalGastosInternos)}</span>
        </div>
      </Card>
    </>
  );

  const renderClientes = () => (
    <>
      <SectionTitle title="Cuenta corriente de clientes" subtitle="Fiados (Debe) y pagos recibidos (Haber). El saldo se calcula solo." accent={BROWN} />
      <Card className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead><tr style={{ backgroundColor: BROWN }}><Th first>Cliente</Th><Th>Fecha</Th><Th>Concepto</Th><Th>Debe (fiado)</Th><Th>Haber (pagó)</Th><Th last></Th></tr></thead>
            <tbody>
              {neg.clientes.map((c) => (
                <tr key={c.id} className="border-b" style={{ borderColor: BORDER }}>
                  <td className="px-2 py-2"><TextInput value={c.cliente} onChange={(v) => rowUpd("clientes", c.id, "cliente", v)} placeholder="Nombre del cliente" /></td>
                  <td className="px-2 py-2 w-32"><DateInput value={c.fecha} onChange={(v) => rowUpd("clientes", c.id, "fecha", v)} /></td>
                  <td className="px-2 py-2"><TextInput value={c.concepto} onChange={(v) => rowUpd("clientes", c.id, "concepto", v)} /></td>
                  <td className="px-2 py-2 w-28"><NumInput value={c.debe} onChange={(v) => rowUpd("clientes", c.id, "debe", v)} /></td>
                  <td className="px-2 py-2 w-28"><NumInput value={c.haber} onChange={(v) => rowUpd("clientes", c.id, "haber", v)} /></td>
                  <td className="px-2 py-2"><DelBtn onClick={() => rowDel("clientes", c.id)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AddButton color={BROWN} label="Agregar movimiento" onClick={() => updNeg("clientes", [...neg.clientes, { id: uid(), cliente: "", fecha: "", concepto: "", debe: "", haber: "" }])} />
      </Card>
      <Card>
        <div className="text-sm font-semibold mb-3" style={{ color: NAVY }}>Saldo por cliente</div>
        {clientesUnicos.length === 0 && <p className="text-sm" style={{ color: "#9AA1B0" }}>Cargá el nombre de un cliente arriba para ver su saldo acá.</p>}
        <div className="space-y-2">
          {clientesUnicos.map((n) => {
            const s = saldoCliente(n);
            return (
              <div key={n} className="flex items-center justify-between p-2.5 rounded-md" style={{ backgroundColor: "#F5F6F9" }}>
                <span className="text-sm font-medium" style={{ color: NAVY }}>{n}</span>
                <span className="text-sm font-bold" style={{ color: s.saldo > 0 ? RED : GREEN }}>${fmt(s.saldo)}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-5 pt-4 flex justify-between items-center" style={{ borderTop: `1px solid ${BORDER}` }}>
          <span className="font-semibold" style={{ color: NAVY }}>Deuda total de clientes</span><span className="text-xl font-bold" style={{ color: RED }}>${fmt(deudaClientesTotal)}</span>
        </div>
      </Card>
    </>
  );

  const renderProveedores = () => (
    <>
      <SectionTitle title="Cuenta corriente de proveedores" subtitle="Lo que les debés (Debo) y lo que pagaste (Pagado)." accent={BROWN} />
      <Card className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead><tr style={{ backgroundColor: BROWN }}><Th first>Proveedor</Th><Th>Fecha</Th><Th>Concepto</Th><Th>Debo</Th><Th>Pagado</Th><Th last></Th></tr></thead>
            <tbody>
              {neg.proveedores.map((p) => (
                <tr key={p.id} className="border-b" style={{ borderColor: BORDER }}>
                  <td className="px-2 py-2"><TextInput value={p.proveedor} onChange={(v) => rowUpd("proveedores", p.id, "proveedor", v)} placeholder="Nombre del proveedor" /></td>
                  <td className="px-2 py-2 w-32"><DateInput value={p.fecha} onChange={(v) => rowUpd("proveedores", p.id, "fecha", v)} /></td>
                  <td className="px-2 py-2"><TextInput value={p.concepto} onChange={(v) => rowUpd("proveedores", p.id, "concepto", v)} /></td>
                  <td className="px-2 py-2 w-28"><NumInput value={p.debo} onChange={(v) => rowUpd("proveedores", p.id, "debo", v)} /></td>
                  <td className="px-2 py-2 w-28"><NumInput value={p.pagado} onChange={(v) => rowUpd("proveedores", p.id, "pagado", v)} /></td>
                  <td className="px-2 py-2"><DelBtn onClick={() => rowDel("proveedores", p.id)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AddButton color={BROWN} label="Agregar movimiento" onClick={() => updNeg("proveedores", [...neg.proveedores, { id: uid(), proveedor: "", fecha: "", concepto: "", debo: "", pagado: "" }])} />
      </Card>
      <Card>
        <div className="text-sm font-semibold mb-3" style={{ color: NAVY }}>Saldo por proveedor</div>
        {proveedoresUnicos.length === 0 && <p className="text-sm" style={{ color: "#9AA1B0" }}>Cargá el nombre de un proveedor arriba para ver su saldo acá.</p>}
        <div className="space-y-2">
          {proveedoresUnicos.map((n) => {
            const s = saldoProveedor(n);
            return (
              <div key={n} className="flex items-center justify-between p-2.5 rounded-md" style={{ backgroundColor: "#F5F6F9" }}>
                <span className="text-sm font-medium" style={{ color: NAVY }}>{n}</span>
                <span className="text-sm font-bold" style={{ color: s.saldo > 0 ? RED : GREEN }}>${fmt(s.saldo)}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-5 pt-4 flex justify-between items-center" style={{ borderTop: `1px solid ${BORDER}` }}>
          <span className="font-semibold" style={{ color: NAVY }}>Deuda total a proveedores</span><span className="text-xl font-bold" style={{ color: RED }}>${fmt(deudaProveedoresTotal)}</span>
        </div>
      </Card>
    </>
  );

  const renderDevoluciones = () => (
    <>
      <SectionTitle title="Devoluciones y reclamos" subtitle="Registro de productos devueltos o reclamos de clientes." accent={BROWN} />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead><tr style={{ backgroundColor: BROWN }}><Th first>Fecha</Th><Th>Cliente</Th><Th>Producto/Servicio</Th><Th>Motivo</Th><Th>Monto</Th><Th>Estado</Th><Th last></Th></tr></thead>
            <tbody>
              {neg.devoluciones.map((d) => (
                <tr key={d.id} className="border-b" style={{ borderColor: BORDER }}>
                  <td className="px-2 py-2 w-32"><DateInput value={d.fecha} onChange={(v) => rowUpd("devoluciones", d.id, "fecha", v)} /></td>
                  <td className="px-2 py-2"><TextInput value={d.cliente} onChange={(v) => rowUpd("devoluciones", d.id, "cliente", v)} /></td>
                  <td className="px-2 py-2"><TextInput value={d.producto} onChange={(v) => rowUpd("devoluciones", d.id, "producto", v)} /></td>
                  <td className="px-2 py-2"><TextInput value={d.motivo} onChange={(v) => rowUpd("devoluciones", d.id, "motivo", v)} /></td>
                  <td className="px-2 py-2 w-28"><NumInput value={d.monto} onChange={(v) => rowUpd("devoluciones", d.id, "monto", v)} /></td>
                  <td className="px-2 py-2 w-36">
                    <select value={d.estado} onChange={(e) => rowUpd("devoluciones", d.id, "estado", e.target.value)} className="text-xs font-semibold rounded-full px-3 py-1.5 w-full"
                      style={{ border: `1px solid ${BORDER}`, backgroundColor: d.estado === "Resuelto" ? "#E8F5EC" : "#FDEDE6", color: d.estado === "Resuelto" ? GREEN : ORANGE }}>
                      <option>Pendiente</option><option>Resuelto</option>
                    </select>
                  </td>
                  <td className="px-2 py-2"><DelBtn onClick={() => rowDel("devoluciones", d.id)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AddButton color={BROWN} label="Agregar registro" onClick={() => updNeg("devoluciones", [...neg.devoluciones, { id: uid(), fecha: "", cliente: "", producto: "", motivo: "", monto: "", estado: "Pendiente" }])} />
        <div className="mt-6 pt-5 flex flex-wrap gap-6" style={{ borderTop: `1px solid ${BORDER}` }}>
          <div><div className="text-xs font-semibold uppercase" style={{ color: "#8B93A6" }}>Total devuelto</div><div className="text-lg font-bold" style={{ color: NAVY }}>${fmt(totalDevoluciones)}</div></div>
          <div><div className="text-xs font-semibold uppercase" style={{ color: "#8B93A6" }}>Reclamos pendientes</div><div className="text-lg font-bold" style={{ color: ORANGE }}>{reclamosPendientes}</div></div>
        </div>
      </Card>
    </>
  );

  const renderers = {
    resumen: renderResumen, deudas: renderDeudas, presupuesto: renderPresupuesto, hormiga: renderHormiga,
    flujo: renderFlujo, fondo: renderFondo, plan90: renderPlan90,
    dashNegocio: renderDashNegocio, ventas: renderVentas, precios: renderPrecios, gastosInt: renderGastosInt,
    clientes: renderClientes, proveedores: renderProveedores, devoluciones: renderDevoluciones,
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ backgroundColor: CREAM, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <aside className="md:w-64 flex-none" style={{ backgroundColor: NAVY }}>
        <div className="p-5 md:p-6">
          <div className="text-white font-bold text-xl leading-tight">Cuentas Claras</div>
          <div className="text-xs mt-1 leading-snug" style={{ color: "#9FB0D0" }}>Salí de deudas y ordená tu negocio, todo en un solo lugar</div>
        </div>
        <nav className="px-2 md:px-3 pb-3 md:pb-4 overflow-x-auto md:overflow-visible">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-3 md:mb-4">
              <div className="hidden md:block px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: "#5D6D93" }}>{group.label}</div>
              <div className="flex md:flex-col gap-1">
                {group.items.map((item) => {
                  const Icon = item.icon, active = tab === item.id;
                  const accent = group.label === "Gestión de negocio" ? BROWN : ORANGE;
                  return (
                    <button key={item.id} onClick={() => setTab(item.id)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-none md:w-full text-left"
                      style={{ backgroundColor: active ? accent : "transparent", color: active ? "#1A1206" : "#C7D0E3" }}>
                      <Icon size={16} />{item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="hidden md:flex flex-col gap-2 px-4 pb-6 mt-2">
          <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: "#7C8AAE" }}><Save size={13} />{saving ? "Guardando..." : "Datos guardados"}</div>
          <button onClick={exportData} className="flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-md" style={{ backgroundColor: "#22315A", color: "#C7D0E3" }}>
            <Download size={14} /> Exportar datos
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-md" style={{ backgroundColor: "#22315A", color: "#C7D0E3" }}>
            <Upload size={14} /> Importar datos
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={importData} className="hidden" />
        </div>
      </aside>

      <main className="flex-1 p-5 md:p-10 max-w-5xl">
        {renderers[tab]()}
        <p className="text-xs mt-10 pb-4" style={{ color: "#B5BAC4" }}>
          <strong>Cuentas Claras</strong> te ayuda a salir de deudas, armar tu presupuesto y llevar las cuentas de tu negocio — sin Excel complicado ni contador. Tus datos se guardan automáticamente en este dispositivo.
          Usá "Exportar datos" para descargar un respaldo y "Importar datos" para restaurarlo en otro dispositivo o navegador.
        </p>
      </main>
    </div>
  );
}
