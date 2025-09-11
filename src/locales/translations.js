// src/locales/translations.js
import * as Localization from "expo-localization";
import { I18n } from "i18n-js"; // ⚠️ usa a classe I18n, não o default export

const i18n = new I18n({
  pt: {
    // --- Títulos / labels
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

    // --- Resultados
    valorHora: "📌 Valor hora base (VH) — BRUTO: {{valor}} €",
    baseHorasExtra: "🧮 Base das horas extra (somatório VH): {{valor}} €",
    acrescimos: "➕ Acréscimos de horas extra — BRUTO: {{valor}} €",
    subsidioNoturno: "🌙 Subsídio noturno (normais + extra) — BRUTO: {{valor}} €",
    subsidioInclui: "  • Inclui {{valor}} € de horas normais noturnas",
    totalExtra: "💵 Total BRUTO pelas HORAS EXTRA: {{valor}} €",
    totalNoturno: "💵 Total BRUTO pelas HORAS NOTURNAS (normais): {{valor}} €",

    // --- Observações
    observacoes: "ℹ️ Observações / Enquadramento",
    obs1: "• Valores BRUTOS.",
    obs2: "• O subsídio noturno (+25% do VH) aplica-se às horas entre 22h–07h e é acumulável com o acréscimo de hora extra, exceto se definido de forma diferente no contrato de trabalho ou em Contrato Coletivo de Trabalho.",

    // --- Histórico
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

    // --- Consentimento
    gerirConsent: "Gerir consentimento de anúncios",
    labelEstado: "Estado:",
    estadoPersonalizados: "Personalizados",
    estadoNaoPersonalizados: "Não personalizados",
    consentTitle: "Consentimento",
    consentOn: "Ativados anúncios personalizados.",
    consentOff: "Ativados anúncios não personalizados.",
    consentErr: "Não foi possível alterar agora.",

    // --- Placeholders
    placeholderSalario: "Ex.: 1000",
    placeholderHorasSemana: "Ex.: 40",
    placeholderHorasExtra: "Ex.: 2",
    placeholderHorasNoturnas: "Ex.: 1",

    // --- Alertas
    alertaDadosTitulo: "Dados em falta",
    alertaDadosMsg: "Preenche salário bruto mensal e horas semanais.",
    alertaInvalidoTitulo: "Valor inválido",
    alertaNegativos: "As horas não podem ser negativas.",
    alertaNoturnasExcedem: "Horas noturnas extra não podem exceder o total de horas extra.",
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
    regraDiaUtil: "1st +25%, next +37.5%",
    regraDescanso: "+50%/h",
    calcular: "CALCULATE",
    // ... mantém resto das traduções em inglês
  },
});

// Definições
i18n.locale = Localization.locale?.startsWith("pt") ? "pt" : "en";
i18n.enableFallback = true;

export default i18n;
