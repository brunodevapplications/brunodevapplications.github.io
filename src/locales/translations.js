import * as Localization from "expo-localization";
import i18n from "i18n-js";

i18n.translations = {
  pt: {
    title: "Horas+ Extra PT 🚀",
    salario: "💰 Salário bruto mensal (€)",
    horasSemana: "⌛ Horas semanais contratadas",
    horasExtra: "⏱️ Nº de horas extra (total)",
    horasExtraNocturnas: "🌙 Nº de horas EXTRA em período noturno (22h–07h)",
    horasNormaisNocturnas: "🌙 Nº de horas NORMAIS em período noturno (22h–07h)",
    tipoDia: "⚙️ Tipo de dia para as HORAS EXTRA",
    diaUtil: "Dia útil",
    descanso: "Descanso/Feriado",
    calcular: "CALCULAR",
    resultado: "📊 Resultados",
    historico: "📒 Histórico",
    limparHistorico: "Limpar histórico",

    // Resultados
    valorHora: "📌 Valor hora base (VH) — BRUTO: {{valor}} €",
    baseHorasExtra: "🧮 Base das horas extra (somatório VH): {{valor}} €",
    acrescimos: "➕ Acréscimos de horas extra — BRUTO: {{valor}} €",
    subsidioNoturno: "🌙 Subsídio noturno (normais + extra) — BRUTO: {{valor}} €",
    subsidioInclui: "  • Inclui {{valor}} € de horas normais noturnas",
    totalExtra: "💵 Total BRUTO pelas HORAS EXTRA: {{valor}} €",
    totalNoturno: "💵 Total BRUTO pelas HORAS NOTURNAS (normais): {{valor}} €",

    // Observações
    observacoes: "ℹ️ Observações / Enquadramento",
    obs1: "• Valores BRUTOS.",
    obs2: "• O subsídio noturno (+25% do VH) aplica-se às horas entre 22h–07h e é acumulável com o acréscimo de hora extra, exceto se definido de forma diferente no contrato de trabalho ou em Contrato Coletivo de Trabalho."
  },
  en: {
    title: "Overtime+ PT 🚀",
    salario: "💰 Gross monthly salary (€)",
    horasSemana: "⌛ Weekly contracted hours",
    horasExtra: "⏱️ Total overtime hours",
    horasExtraNocturnas: "🌙 OVERTIME hours during night period (10PM–7AM)",
    horasNormaisNocturnas: "🌙 NORMAL hours during night period (10PM–7AM)",
    tipoDia: "⚙️ Day type for OVERTIME",
    diaUtil: "Workday",
    descanso: "Rest day / Holiday",
    calcular: "CALCULATE",
    resultado: "📊 Results",
    historico: "📒 History",
    limparHistorico: "Clear history",

    // Results
    valorHora: "📌 Base hourly rate (VH) — GROSS: {{valor}} €",
    baseHorasExtra: "🧮 Base of overtime hours (sum of VH): {{valor}} €",
    acrescimos: "➕ Overtime increments — GROSS: {{valor}} €",
    subsidioNoturno: "🌙 Night work allowance (normal + overtime) — GROSS: {{valor}} €",
    subsidioInclui: "  • Includes {{valor}} € from normal night hours",
    totalExtra: "💵 GROSS total for OVERTIME HOURS: {{valor}} €",
    totalNoturno: "💵 GROSS total for NIGHT HOURS (normal): {{valor}} €",

    // Observations
    observacoes: "ℹ️ Notes / Legal context",
    obs1: "• GROSS values.",
    obs2: "• The night allowance (+25% of VH) applies to hours between 22:00–07:00 and is cumulative with overtime increments, unless otherwise defined in the work contract or collective agreement."
  }
};

i18n.locale = Localization.locale.startsWith("pt") ? "pt" : "en";
i18n.fallbacks = true;

export default i18n;
