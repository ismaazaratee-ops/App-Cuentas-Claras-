import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Home, Wallet, PiggyBank, TrendingUp, CalendarCheck, Receipt,
  AlertTriangle, CheckCircle2, Plus, Trash2, Info, Save,
} from "lucide-react";

// ---------- Tokens de marca (colección "Vender Online") ----------
const NAVY = "#1B2A4A";
const NAVY_SOFT = "#2E3E63";
const BLUE = "#2E5EAA";
const ORANGE = "#E8734A";
const GREEN = "#2E8B57";
const RED = "#C0392B";
const CREAM = "#FAFAF8";
const BORDER = "#E4E1D9";

const fmt = (n) => {
  const v = Number(n) || 0;
  return v.toLocaleString("es-AR", { maximumFractionDigits: 0 });
};
const pct = (n) => `${((Number(n) || 0) * 100).toFixed(1)}%`;

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
  gastosHormiga: [
    { semana: 1, categoria: "", descripcion: "", monto: "" },
  ],
  flujoCaja: {
    ingresos: ["", "", "", ""],
    egresos: ["", "", "", ""],
  },
  fondoEmergencia: {
    gastoEsencialManual: "",
    aportes: ["", "", "", "", "", ""],
  },
  plan90: [
    { mes: "Mes 1", objetivo: "", accion: "", estado: "Pendiente" },
    { mes: "Mes 2", objetivo: "", accion: "", estado: "Pendiente" },
    { mes: "Mes 3", objetivo: "", accion: "", estado: "Pendiente" },
  ],
};

const NAV_ITEMS = [
  { id: "resumen", label: "Resumen", icon: Home },
  { id: "deudas", label: "Deudas", icon: AlertTriangle },
  { id: "presupuesto", label: "Presupuesto", icon: Wallet },
  { id: "hormiga", label: "Gastos Hormiga", icon: Receipt },
  { id: "flujo", label: "Flujo de Caja", icon: TrendingUp },
  { id: "fondo", label: "Fondo Emergencia", icon: PiggyBank },
  { id: "plan90", label: "Plan 90 Días", icon: CalendarCheck },
];

// ---------- Componentes de utilidad ----------
function Card({ children, style, className = "" }) {
  return (
    <div
      className={`rounded-xl border p-5 md:p-6 ${className}`}
      style={{ borderColor: BORDER, backgroundColor: "#fff", ...style }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl md:text-3xl font-bold" style={{ color: NAVY }}>{title}</h2>
      {subtitle && <p className="text-sm mt-1" style={{ color: "#6B7280" }}>{subtitle}</p>}
    </div>
  );
}

function NumInput({ value, onChange, placeholder = "0", className = "" }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ${className}`}
      style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFBEF" }}
      onFocus={(e) => (e.target.style.boxShadow = `0 0 0 2px ${ORANGE}55`)}
      onBlur={(e) => (e.target.style.boxShadow = "none")}
    />
  );
}

function TextInput({ value, onChange, placeholder = "", className = "" }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-md px-3 py-2 text-sm outline-none ${className}`}
      style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFBEF" }}
      onFocus={(e) => (e.target.style.boxShadow = `0 0 0 2px ${ORANGE}55`)}
      onBlur={(e) => (e.target.style.boxShadow = "none")}
    />
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
  const color = tone === "orange" ? ORANGE : tone === "red" ? RED : tone === "green" ? GREEN : NAVY;
  return (
    <Card className="flex-1 min-w-[220px]">
      <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8B93A6" }}>{label}</div>
      <div className="text-2xl font-bold mt-1.5" style={{ color }}>{value}</div>
      {hint && <div className="text-xs mt-1.5" style={{ color: "#9AA1B0" }}>{hint}</div>}
    </Card>
  );
}

// ---------- App principal ----------
export default function App() {
  const [tab, setTab] = useState("resumen");
  const [data, setData] = useState(initialData);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef(null);

  // Cargar datos guardados
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("sali-de-las-deudas-data", false);
        if (res && res.value) {
          setData({ ...initialData, ...JSON.parse(res.value) });
        }
      } catch (e) {
        // no hay datos guardados todavía
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Guardar datos (debounced)
  useEffect(() => {
    if (!loaded) return;
    setSaving(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await window.storage.set("sali-de-las-deudas-data", JSON.stringify(data), false);
      } catch (e) {
        // silencioso
      } finally {
        setSaving(false);
      }
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

  // ---------- Cálculos derivados ----------
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
    data.gastosHormiga.filter((g) => Number(g.semana) === w).reduce((s, g) => s + (Number(g.monto) || 0), 0)
  );
  const totalHormiga = gastosHormigaPorSemana.reduce((a, b) => a + b, 0);

  const flujoSaldos = data.flujoCaja.ingresos.map((ing, i) => (Number(ing) || 0) - (Number(data.flujoCaja.egresos[i]) || 0));
  const flujoAcumulados = flujoSaldos.reduce((acc, s, i) => {
    acc.push(i === 0 ? s : acc[i - 1] + s);
    return acc;
  }, []);
  const hayCajaNegativa = flujoAcumulados.some((v) => v < 0);

  const gastoEsencialAuto = Number(data.presupuesto.real.necesidades) || 0;
  const gastoEsencial = Number(data.fondoEmergencia.gastoEsencialManual) || gastoEsencialAuto;
  const meta1 = gastoEsencial * 1;
  const meta3 = gastoEsencial * 3;
  const meta6 = gastoEsencial * 6;
  const fondoAcumulados = data.fondoEmergencia.aportes.reduce((acc, a, i) => {
    const prev = i === 0 ? 0 : acc[i - 1];
    acc.push(prev + (Number(a) || 0));
    return acc;
  }, []);
  const fondoTotal = fondoAcumulados.length ? fondoAcumulados[fondoAcumulados.length - 1] : 0;
  const fondoPct1 = meta1 > 0 ? fondoTotal / meta1 : 0;

  // ---------- Render por tab ----------
  const renderResumen = () => (
    <>
      <SectionTitle title="Resumen general" subtitle="Tu panorama de un vistazo, tomado de todas las secciones." />
      <div className="flex flex-wrap gap-4 mb-6">
        <StatCard label="Total de deudas" value={`$${fmt(totalDeuda)}`} tone="red" />
        <StatCard label="Ratio deuda-ingreso" value={pct(ratio)} hint={situacion} tone={ratio < 0.2 ? "green" : ratio < 0.4 ? "orange" : "red"} />
        <StatCard label="Gastos hormiga del mes" value={`$${fmt(totalHormiga)}`} tone="orange" />
        <StatCard label="Fondo de emergencia" value={`$${fmt(fondoTotal)}`} hint={meta1 > 0 ? `${pct(fondoPct1)} de tu Meta 1` : "Definí tu gasto esencial"} tone="green" />
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Info size={18} style={{ color: BLUE }} />
          <span className="font-semibold" style={{ color: NAVY }}>Cómo estás parado hoy</span>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: "#555" }}>Ratio deuda-ingreso</span>
              <span className="font-semibold" style={{ color: situacionColor }}>{situacion}</span>
            </div>
            <ProgressBar value={Math.min(ratio / 0.5, 1)} color={situacionColor} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: "#555" }}>Presupuesto: diferencia total</span>
              <span className="font-semibold" style={{ color: presDiferenciaTotal >= 0 ? GREEN : RED }}>
                {presDiferenciaTotal >= 0 ? "+" : ""}{fmt(presDiferenciaTotal)}
              </span>
            </div>
            <p className="text-xs" style={{ color: "#9AA1B0" }}>
              {presDiferenciaTotal >= 0 ? "Estás dentro de lo presupuestado." : "Te excediste del presupuesto este mes — revisá gastos hormiga."}
            </p>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: "#555" }}>Progreso fondo de emergencia (Meta 1)</span>
              <span className="font-semibold" style={{ color: GREEN }}>{pct(fondoPct1)}</span>
            </div>
            <ProgressBar value={fondoPct1} color={GREEN} />
          </div>
          {hayCajaNegativa && (
            <div className="flex items-start gap-2 p-3 rounded-md" style={{ backgroundColor: "#FDEDE6" }}>
              <AlertTriangle size={16} style={{ color: ORANGE, marginTop: 2 }} />
              <span className="text-sm" style={{ color: "#7A3B22" }}>
                Tu flujo de caja proyecta saldo negativo en alguna semana. Revisá la pestaña "Flujo de Caja".
              </span>
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
        <div className="mt-1 max-w-xs">
          <NumInput value={data.ingresoMensual} onChange={(v) => update(["ingresoMensual"], v)} />
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr style={{ backgroundColor: NAVY }}>
                {["Acreedor", "Monto total", "Tasa interés anual (%)", "Pago mínimo mensual", ""].map((h) => (
                  <th key={h} className="text-white text-xs font-semibold uppercase px-3 py-2.5 text-left first:rounded-l-md last:rounded-r-md">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.deudas.map((d, i) => (
                <tr key={i} className="border-b" style={{ borderColor: BORDER }}>
                  <td className="px-3 py-2"><TextInput value={d.acreedor} onChange={(v) => { const arr = [...data.deudas]; arr[i] = { ...arr[i], acreedor: v }; update(["deudas"], arr); }} placeholder="Ej: Tarjeta Banco X" /></td>
                  <td className="px-3 py-2"><NumInput value={d.monto} onChange={(v) => { const arr = [...data.deudas]; arr[i] = { ...arr[i], monto: v }; update(["deudas"], arr); }} /></td>
                  <td className="px-3 py-2"><NumInput value={d.tasa} onChange={(v) => { const arr = [...data.deudas]; arr[i] = { ...arr[i], tasa: v }; update(["deudas"], arr); }} /></td>
                  <td className="px-3 py-2"><NumInput value={d.pagoMin} onChange={(v) => { const arr = [...data.deudas]; arr[i] = { ...arr[i], pagoMin: v }; update(["deudas"], arr); }} /></td>
                  <td className="px-3 py-2">
                    <button onClick={() => update(["deudas"], data.deudas.filter((_, idx) => idx !== i))} className="p-1.5 rounded hover:bg-gray-100">
                      <Trash2 size={16} style={{ color: "#B0B6C0" }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={() => update(["deudas"], [...data.deudas, { acreedor: "", monto: "", tasa: "", pagoMin: "" }])}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-md"
          style={{ color: ORANGE, border: `1px solid ${ORANGE}55` }}
        >
          <Plus size={16} /> Agregar deuda
        </button>

        <div className="mt-6 pt-5 grid sm:grid-cols-3 gap-4" style={{ borderTop: `1px solid ${BORDER}` }}>
          <div>
            <div className="text-xs font-semibold uppercase" style={{ color: "#8B93A6" }}>Total deuda</div>
            <div className="text-xl font-bold" style={{ color: NAVY }}>${fmt(totalDeuda)}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase" style={{ color: "#8B93A6" }}>Pagos mínimos / mes</div>
            <div className="text-xl font-bold" style={{ color: NAVY }}>${fmt(totalPagoMin)}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase" style={{ color: "#8B93A6" }}>Ratio deuda-ingreso</div>
            <div className="text-xl font-bold" style={{ color: situacionColor }}>{pct(ratio)} · {situacion}</div>
          </div>
        </div>
      </Card>
    </>
  );

  const renderPresupuesto = () => (
    <>
      <SectionTitle title="Presupuesto mensual" subtitle="Regla 50/30/20 adaptada. Ajustá los % si tu situación lo requiere." />
      <Card>
        <div className="mb-4 text-sm" style={{ color: "#555" }}>
          Ingreso mensual: <strong style={{ color: NAVY }}>${fmt(ingreso)}</strong> <span style={{ color: "#9AA1B0" }}>(se toma de la sección Deudas)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr style={{ backgroundColor: NAVY }}>
                {["Categoría", "% sugerido", "Monto sugerido", "Monto real", "Diferencia"].map((h) => (
                  <th key={h} className="text-white text-xs font-semibold uppercase px-3 py-2.5 text-left first:rounded-l-md last:rounded-r-md">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {presCategorias.map((c) => {
                const sugerido = presSugerido(c.key);
                const real = Number(data.presupuesto.real[c.key]) || 0;
                const dif = sugerido - real;
                return (
                  <tr key={c.key} className="border-b" style={{ borderColor: BORDER }}>
                    <td className="px-3 py-2.5 font-medium" style={{ color: NAVY }}>{c.label}</td>
                    <td className="px-3 py-2 w-28">
                      <NumInput
                        value={data.presupuesto.pct[c.key] * 100}
                        onChange={(v) => update(["presupuesto", "pct", c.key], (Number(v) || 0) / 100)}
                      />
                    </td>
                    <td className="px-3 py-2.5">${fmt(sugerido)}</td>
                    <td className="px-3 py-2 w-32">
                      <NumInput value={data.presupuesto.real[c.key]} onChange={(v) => update(["presupuesto", "real", c.key], v)} />
                    </td>
                    <td className="px-3 py-2.5 font-semibold" style={{ color: dif >= 0 ? GREEN : RED }}>
                      {dif >= 0 ? "+" : ""}{fmt(dif)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-5 flex items-center justify-between p-3 rounded-md" style={{ backgroundColor: presDiferenciaTotal >= 0 ? "#E8F5EC" : "#FDEDE6" }}>
          <span className="text-sm font-semibold" style={{ color: presDiferenciaTotal >= 0 ? GREEN : RED }}>
            Diferencia total: {presDiferenciaTotal >= 0 ? "+" : ""}${fmt(presDiferenciaTotal)}
          </span>
          <span className="text-xs" style={{ color: "#6B7280" }}>
            {presDiferenciaTotal >= 0 ? "Dentro de presupuesto" : "Te excediste este mes"}
          </span>
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
            <thead>
              <tr style={{ backgroundColor: NAVY }}>
                {["Semana", "Categoría", "Descripción", "Monto", ""].map((h) => (
                  <th key={h} className="text-white text-xs font-semibold uppercase px-3 py-2.5 text-left first:rounded-l-md last:rounded-r-md">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.gastosHormiga.map((g, i) => (
                <tr key={i} className="border-b" style={{ borderColor: BORDER }}>
                  <td className="px-3 py-2 w-24">
                    <select
                      value={g.semana}
                      onChange={(e) => { const arr = [...data.gastosHormiga]; arr[i] = { ...arr[i], semana: Number(e.target.value) }; update(["gastosHormiga"], arr); }}
                      className="w-full rounded-md px-2 py-2 text-sm"
                      style={{ border: `1px solid ${BORDER}`, backgroundColor: "#FFFBEF" }}
                    >
                      {[1, 2, 3, 4].map((w) => <option key={w} value={w}>Sem {w}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2"><TextInput value={g.categoria} onChange={(v) => { const arr = [...data.gastosHormiga]; arr[i] = { ...arr[i], categoria: v }; update(["gastosHormiga"], arr); }} placeholder="Delivery, café..." /></td>
                  <td className="px-3 py-2"><TextInput value={g.descripcion} onChange={(v) => { const arr = [...data.gastosHormiga]; arr[i] = { ...arr[i], descripcion: v }; update(["gastosHormiga"], arr); }} /></td>
                  <td className="px-3 py-2 w-32"><NumInput value={g.monto} onChange={(v) => { const arr = [...data.gastosHormiga]; arr[i] = { ...arr[i], monto: v }; update(["gastosHormiga"], arr); }} /></td>
                  <td className="px-3 py-2">
                    <button onClick={() => update(["gastosHormiga"], data.gastosHormiga.filter((_, idx) => idx !== i))} className="p-1.5 rounded hover:bg-gray-100">
                      <Trash2 size={16} style={{ color: "#B0B6C0" }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={() => update(["gastosHormiga"], [...data.gastosHormiga, { semana: 1, categoria: "", descripcion: "", monto: "" }])}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-md"
          style={{ color: ORANGE, border: `1px solid ${ORANGE}55` }}
        >
          <Plus size={16} /> Agregar gasto
        </button>
      </Card>

      <Card>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {gastosHormigaPorSemana.map((total, i) => (
            <div key={i}>
              <div className="text-xs font-semibold uppercase" style={{ color: "#8B93A6" }}>Semana {i + 1}</div>
              <div className="text-lg font-bold" style={{ color: NAVY }}>${fmt(total)}</div>
            </div>
          ))}
        </div>
        <div className="pt-4 flex justify-between items-center" style={{ borderTop: `1px solid ${BORDER}` }}>
          <span className="font-semibold" style={{ color: NAVY }}>Total del mes</span>
          <span className="text-xl font-bold" style={{ color: ORANGE }}>${fmt(totalHormiga)}</span>
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
            <thead>
              <tr style={{ backgroundColor: NAVY }}>
                <th className="text-white text-xs font-semibold uppercase px-3 py-2.5 text-left rounded-l-md">Concepto</th>
                {[1, 2, 3, 4].map((w) => (
                  <th key={w} className="text-white text-xs font-semibold uppercase px-3 py-2.5 text-center last:rounded-r-md">Semana {w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b" style={{ borderColor: BORDER }}>
                <td className="px-3 py-2.5 font-medium" style={{ color: NAVY }}>Ingresos esperados</td>
                {data.flujoCaja.ingresos.map((v, i) => (
                  <td key={i} className="px-3 py-2"><NumInput value={v} onChange={(val) => { const arr = [...data.flujoCaja.ingresos]; arr[i] = val; update(["flujoCaja", "ingresos"], arr); }} /></td>
                ))}
              </tr>
              <tr className="border-b" style={{ borderColor: BORDER }}>
                <td className="px-3 py-2.5 font-medium" style={{ color: NAVY }}>Egresos esperados</td>
                {data.flujoCaja.egresos.map((v, i) => (
                  <td key={i} className="px-3 py-2"><NumInput value={v} onChange={(val) => { const arr = [...data.flujoCaja.egresos]; arr[i] = val; update(["flujoCaja", "egresos"], arr); }} /></td>
                ))}
              </tr>
              <tr className="border-b" style={{ borderColor: BORDER }}>
                <td className="px-3 py-2.5 font-semibold" style={{ color: NAVY }}>Saldo semanal</td>
                {flujoSaldos.map((s, i) => (
                  <td key={i} className="px-3 py-2.5 text-center font-semibold" style={{ color: s >= 0 ? GREEN : RED }}>${fmt(s)}</td>
                ))}
              </tr>
              <tr>
                <td className="px-3 py-2.5 font-semibold" style={{ color: NAVY }}>Saldo acumulado</td>
                {flujoAcumulados.map((s, i) => (
                  <td key={i} className="px-3 py-2.5 text-center font-bold" style={{ color: s >= 0 ? GREEN : RED }}>${fmt(s)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        {hayCajaNegativa && (
          <div className="mt-5 flex items-start gap-2 p-3 rounded-md" style={{ backgroundColor: "#FDEDE6" }}>
            <AlertTriangle size={16} style={{ color: ORANGE, marginTop: 2 }} />
            <span className="text-sm" style={{ color: "#7A3B22" }}>
              Alguna semana proyecta saldo acumulado negativo: ese es el momento exacto donde vas a tener un problema de caja. Podés anticiparlo con tiempo.
            </span>
          </div>
        )}
      </Card>
    </>
  );

  const renderFondo = () => (
    <>
      <SectionTitle title="Fondo de emergencia" subtitle="Tu colchón mientras pagás deudas." />
      <Card className="mb-6">
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#8B93A6" }}>
          Gasto esencial mensual {gastoEsencialAuto > 0 && !data.fondoEmergencia.gastoEsencialManual && "(tomado del Presupuesto)"}
        </label>
        <div className="mt-1 max-w-xs">
          <NumInput
            value={data.fondoEmergencia.gastoEsencialManual}
            onChange={(v) => update(["fondoEmergencia", "gastoEsencialManual"], v)}
            placeholder={gastoEsencialAuto ? String(gastoEsencialAuto) : "0"}
          />
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mt-5">
          {[["Meta 1 (1 mes)", meta1], ["Meta 2 (3 meses)", meta3], ["Meta 3 (6 meses)", meta6]].map(([label, val]) => (
            <div key={label} className="p-3 rounded-md" style={{ backgroundColor: "#F5F6F9" }}>
              <div className="text-xs font-semibold uppercase" style={{ color: "#8B93A6" }}>{label}</div>
              <div className="text-lg font-bold" style={{ color: NAVY }}>${fmt(val)}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr style={{ backgroundColor: NAVY }}>
                {["Mes", "Aporte", "Acumulado", "% Meta 1"].map((h) => (
                  <th key={h} className="text-white text-xs font-semibold uppercase px-3 py-2.5 text-left first:rounded-l-md last:rounded-r-md">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.fondoEmergencia.aportes.map((a, i) => (
                <tr key={i} className="border-b" style={{ borderColor: BORDER }}>
                  <td className="px-3 py-2.5" style={{ color: NAVY }}>Mes {i + 1}</td>
                  <td className="px-3 py-2 w-32"><NumInput value={a} onChange={(v) => { const arr = [...data.fondoEmergencia.aportes]; arr[i] = v; update(["fondoEmergencia", "aportes"], arr); }} /></td>
                  <td className="px-3 py-2.5 font-semibold" style={{ color: NAVY }}>${fmt(fondoAcumulados[i])}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-20"><ProgressBar value={meta1 > 0 ? fondoAcumulados[i] / meta1 : 0} color={GREEN} /></div>
                      <span className="text-xs font-medium" style={{ color: GREEN }}>{meta1 > 0 ? pct(fondoAcumulados[i] / meta1) : "—"}</span>
                    </div>
                  </td>
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
                <select
                  value={m.estado}
                  onChange={(e) => { const arr = [...data.plan90]; arr[i] = { ...arr[i], estado: e.target.value }; update(["plan90"], arr); }}
                  className="text-xs font-semibold rounded-full px-3 py-1"
                  style={{
                    border: `1px solid ${BORDER}`,
                    backgroundColor: m.estado === "Cumplido" ? "#E8F5EC" : m.estado === "En progreso" ? "#FDEDE6" : "#F5F6F9",
                    color: m.estado === "Cumplido" ? GREEN : m.estado === "En progreso" ? ORANGE : "#8B93A6",
                  }}
                >
                  <option>Pendiente</option>
                  <option>En progreso</option>
                  <option>Cumplido</option>
                </select>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase" style={{ color: "#8B93A6" }}>Objetivo principal</label>
                  <TextInput value={m.objetivo} onChange={(v) => { const arr = [...data.plan90]; arr[i] = { ...arr[i], objetivo: v }; update(["plan90"], arr); }} />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase" style={{ color: "#8B93A6" }}>Acción concreta</label>
                  <TextInput value={m.accion} onChange={(v) => { const arr = [...data.plan90]; arr[i] = { ...arr[i], accion: v }; update(["plan90"], arr); }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );

  const renderers = {
    resumen: renderResumen,
    deudas: renderDeudas,
    presupuesto: renderPresupuesto,
    hormiga: renderHormiga,
    flujo: renderFlujo,
    fondo: renderFondo,
    plan90: renderPlan90,
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ backgroundColor: CREAM, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Sidebar */}
      <aside className="md:w-64 flex-none" style={{ backgroundColor: NAVY }}>
        <div className="p-5 md:p-6">
          <div className="text-white font-bold text-lg leading-tight">Salí de las Deudas</div>
          <div className="text-xs mt-0.5" style={{ color: "#9FB0D0" }}>Panel de gestión financiera</div>
        </div>
        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible px-2 md:px-3 pb-3 md:pb-6 gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-none md:w-full text-left"
                style={{
                  backgroundColor: active ? ORANGE : "transparent",
                  color: active ? "#1A1206" : "#C7D0E3",
                }}
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="hidden md:flex items-center gap-1.5 px-6 pb-5 text-xs" style={{ color: "#7C8AAE" }}>
          <Save size={13} />
          {saving ? "Guardando..." : "Datos guardados"}
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 p-5 md:p-10 max-w-4xl">
        {renderers[tab]()}
        <p className="text-xs mt-10 pb-4" style={{ color: "#B5BAC4" }}>
          Complementa al ebook "Salí de las Deudas" — colección Vender Online. Tus datos se guardan automáticamente en este dispositivo.
        </p>
      </main>
    </div>
  );
}
