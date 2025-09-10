// src/locales/translations.js
import * as Localization from "expo-localization";
import i18n from "i18n-js";

i18n.translations = {
  pt: {
    // Títulos / labels
    title: "Horas+ Extra PT 🚀",
    salario: "💰 Salário bruto mensal (€)",
    horasSemana: "⌛ Horas semanais contratadas",
    horasExtra: "⏱️ Nº de horas extra (total)",
    horasExtraNocturnas: "🌙 Nº de horas EXTRA em período noturno (22h–07h)",
    horasNormaisNocturnas: "🌙 Nº de horas NORMAIS em período noturno (22h–07h)",
    tipoDia: "⚙️ Tipo de dia para as HORAS EXTRA",
    diaUtil: "Dia útil",
    descanso: "Descanso/Feriado",
    regraDiaUtil: "1ª +25%, seguintes +37,5%",
    regraDescanso: "+50%/h",
    calcular: "CALCULAR",

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
    obs2: "• O subsídio noturno (+25% do VH) aplica-se às horas entre 22h–07h e é acumulável com o acréscimo de hora extra, exceto se definido de forma diferente no contrato de trabalho ou em Contrato Coletivo de Trabalho.",

    // Histórico
    historico: "📒 Histórico",
    mostrar: "Mostrar",
    ocultar: "Ocultar",
    limpar: "Limpar",
    cancelar: "Cancelar",
    confirmarLimpar: "Limpar histórico",
    tensCerteza: "Tens a certeza?",
    semRegistos: "Sem registos ainda. Faz um cálculo para guardar aqui.",
    histPillDiaUtil: "Dia útil",
    histPillDescanso: "Descanso/Feriado",
    histSalarioHoras: "💰 Salário: {{salario}}€ • ⌛ {{horasSemana}}h/sem",
    histExtrasLine: "⏱️ Extra: {{hExtra}}h (🌙 {{hNoturnasExtra}}h) • Normais 🌙 {{hNoturnasNormais}}h",
    histVHLine: "📌 VH: {{vh}}€ • Extra: {{extra}}€ • Noturno: {{noturno}}€",
    histTotalExtra: "💵 Total EXTRA: {{valor}}€",
    histTotalNoturno: "💵 Total NOTURNO (normais): {{valor}}€",

    // Consentimento / Banner
    gerirConsent: "Gerir consentimento de anúncios",
    labelEstado: "Estado:",
    estadoPersonalizados: "Personalizados",
    estadoNaoPersonalizados: "Não personalizados",
    consentTitle: "Consentimento",
    consentOn: "Ativados anúncios personalizados.",
    consentOff: "Ativados anúncios não personalizados.",
    consentErr: "Não foi possível alterar agora.",

    // Placeholders
    placeholderSalario: "Ex.: 1000",
    placeholderHorasSemana: "Ex.: 40",
    placeholderHorasExtra: "Ex.: 2",
    placeholderHorasNoturnas: "Ex.: 1",

    // Alertas de validação
    alertaDadosTitulo: "Dados em falta",
    alertaDadosMsg: "Preenche salário bruto mensal e horas semanais.",
    alertaInvalidoTitulo: "Valor inválido",
    alertaNegativos: "As horas não podem ser negativas.",
    alertaNoturnasExcedem: "Horas noturnas extra não podem exceder o total de horas extra.",
  },

  en: {
    // Titles / labels
    title: "Overtime+ PT 🚀",
    salario: "💰 Gross monthly salary (€)",
    horasSemana: "⌛ Weekly contracted hours",
    horasExtra: "⏱️ Total overtime hours",
    horasExtraNocturnas: "🌙 OVERTIME hours during night period (10PM–7AM)",
    horasNormaisNocturnas: "🌙 NORMAL hours during night period (10PM–7AM)",
    tipoDia: "⚙️ Day type for OVERTIME",
    diaUtil: "Workday",
    descanso: "Rest day / Holiday",
    regraDiaUtil: "1st +25%, next +37.5%",
    regraDescanso: "+50%/h",
    calcular: "CALCULATE",

    // Results
    valorHora: "📌 Base hourly rate (VH) — GROSS: {{valor}} €",
    baseHorasExtra: "🧮 Base of overtime hours (sum of VH): {{valor}} €",
    acrescimos: "➕ Overtime increments — GROSS: {{valor}} €",
    subsidioNoturno: "🌙 Night allowance (normal + overtime) — GROSS: {{valor}} €",
    subsidioInclui: "  • Includes {{valor}} € from normal night hours",
    totalExtra: "💵 GROSS total for OVERTIME HOURS: {{valor}} €",
    totalNoturno: "💵 GROSS total for NIGHT HOURS (normal): {{valor}} €",

    // Notes
    observacoes: "ℹ️ Notes / Legal context",
    obs1: "• GROSS values.",
    obs2: "• The night allowance (+25% of VH) applies to hours between 22:00–07:00 and is cumulative with overtime increments, unless otherwise defined in the employment contract or collective agreement.",

    // History
    historico: "📒 History",
    mostrar: "Show",
    ocultar: "Hide",
    limpar: "Clear",
    cancelar: "Cancel",
    confirmarLimpar: "Clear history",
    tensCerteza: "Are you sure?",
    semRegistos: "No entries yet. Run a calculation to save it here.",
    histPillDiaUtil: "Workday",
    histPillDescanso: "Rest/Holiday",
    histSalarioHoras: "💰 Salary: {{salario}}€ • ⌛ {{horasSemana}}h/wk",
    histExtrasLine: "⏱️ Overtime: {{hExtra}}h (🌙 {{hNoturnasExtra}}h) • Normal 🌙 {{hNoturnasNormais}}h",
    histVHLine: "📌 VH: {{vh}}€ • Extra: {{extra}}€ • Night: {{noturno}}€",
    histTotalExtra: "💵 OVERTIME total: {{valor}}€",
    histTotalNoturno: "💵 NIGHT (normal) total: {{valor}}€",

    // Consent / Banner
    gerirConsent: "Manage ad consent",
    labelEstado: "Status:",
    estadoPersonalizados: "Personalized",
    estadoNaoPersonalizados: "Non-personalized",
    consentTitle: "Consent",
    consentOn: "Personalized ads enabled.",
    consentOff: "Non-personalized ads enabled.",
    consentErr: "Could not change now.",

    // Placeholders
    placeholderSalario: "e.g., 1000",
    placeholderHorasSemana: "e.g., 40",
    placeholderHorasExtra: "e.g., 2",
    placeholderHorasNoturnas: "e.g., 1",

    // Alerts
    alertaDadosTitulo: "Missing data",
    alertaDadosMsg: "Fill gross monthly salary and weekly hours.",
    alertaInvalidoTitulo: "Invalid value",
    alertaNegativos: "Hours cannot be negative.",
    alertaNoturnasExcedem: "Night overtime cannot exceed total overtime.",
  },
};

i18n.locale = Localization.locale?.startsWith("pt") ? "pt" : "en";
i18n.fallbacks = true;

export default i18n;
