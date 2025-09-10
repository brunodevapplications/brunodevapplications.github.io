import mobileAds, { MaxAdContentRating } from "react-native-google-mobile-ads";
import { AdsConsent, AdsConsentDebugGeography } from "react-native-google-mobile-ads";

// ⚠️ DEV: força mostrar o formulário como se estivesses na EEE.
// Coloca em "false" quando fores para produção.
const DEBUG_UMP = true;

async function readState() {
  const info = await AdsConsent.getConsentInfo(); // { status, canRequestAds, isConsentFormAvailable }
  let choices = {};
  try {
    choices = await AdsConsent.getUserChoices(); // pode não estar disponível em todos os devices
  } catch (_) {}

  const canServePersonalizedAds = choices?.selectPersonalisedAds === true;
  return { info, choices, canServePersonalizedAds };
}

/**
 * Inicializa AdMob + pede consentimento inicial
 */
export async function initAdsAndConsent() {
  // 1) Configuração dos anúncios (nível de conteúdo, idade, etc.)
  await mobileAds().setRequestConfiguration({
    maxAdContentRating: MaxAdContentRating.PG,
    tagForChildDirectedTreatment: false,
    tagForUnderAgeOfConsent: false,
    testDeviceIdentifiers: [], // podes adicionar o teu device ID aqui
  });

  // 2) Atualiza informação de consentimento
  await AdsConsent.requestInfoUpdate({
    debugGeography: DEBUG_UMP
      ? AdsConsentDebugGeography.EEA
      : AdsConsentDebugGeography.DISABLED,
  });

  // 3) Mostra o formulário se for necessário
  await AdsConsent.loadAndShowConsentFormIfRequired();

  // 4) Lê estado atual
  const { canServePersonalizedAds } = await readState();

  // 5) Inicializa AdMob (só depois do consentimento)
  await mobileAds().initialize();

  return { canServePersonalizedAds };
}

/**
 * Botão "Gerir consentimento"
 */
export async function manageConsent() {
  // 1) Limpa estado anterior
  await AdsConsent.reset();

  // 2) Atualiza info novamente
  await AdsConsent.requestInfoUpdate({
    debugGeography: DEBUG_UMP
      ? AdsConsentDebugGeography.EEA
      : AdsConsentDebugGeography.DISABLED,
  });

  // 3) Força reabrir o formulário
  try {
    await AdsConsent.loadAndShowConsentForm();
  } catch (e) {
    // fallback: se não houver form disponível
    await AdsConsent.loadAndShowConsentFormIfRequired();
  }

  // 4) Lê estado atualizado
  const { canServePersonalizedAds } = await readState();
  return { canServePersonalizedAds };
}
