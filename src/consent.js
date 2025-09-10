// src/consent.js
import mobileAds, { MaxAdContentRating } from "react-native-google-mobile-ads";
import {
  AdsConsent,
  AdsConsentDebugGeography,
} from "react-native-google-mobile-ads";

async function gather() {
  // 1) Atualiza info de consentimento (com debug opcional)
  await AdsConsent.requestInfoUpdate({
    debugGeography: DEBUG_UMP
      ? AdsConsentDebugGeography.EEA
      : AdsConsentDebugGeography.DISABLED,
    // testDeviceIdentifiers: ['HASHED-DEVICE-ID'], // opcional
  });

  // 2) Carrega/mostra formulário se necessário
  await AdsConsent.loadAndShowConsentFormIfRequired();

  // 3) Lê o estado atual + escolhas do utilizador
  const info = await AdsConsent.getConsentInfo(); // { status, canRequestAds, isConsentFormAvailable }
  let choices = {};
  try {
    choices = await AdsConsent.getUserChoices(); // pode falhar em alguns ambientes
  } catch (_) {}

  // Personalizados se o utilizador permitiu "selectPersonalisedAds"
  const canServePersonalizedAds = choices?.selectPersonalisedAds === true;

  return {
    status: info?.status,                     // UNKNOWN | REQUIRED | NOT_REQUIRED | OBTAINED
    canRequestAds: !!info?.canRequestAds,     // se o SDK pode pedir anúncios
    canServePersonalizedAds,                  // flag para personalizar (ou não)
  };
}

export async function initAdsAndConsent() {
  // Regras de pedido (opcional mas recomendado)
  await mobileAds().setRequestConfiguration({
    maxAdContentRating: MaxAdContentRating.PG,
    tagForChildDirectedTreatment: false,
    tagForUnderAgeOfConsent: false,
    testDeviceIdentifiers: [],
  });

  const consent = await gather();

  // Inicializa o SDK de anúncios (podes condicionar por canRequestAds se quiseres)
  await mobileAds().initialize();

  return consent;
}

// Botão "Gerir consentimento"
export async function manageConsent() {
  await AdsConsent.reset();      // força reapresentar o formulário
  const consent = await gather();
  return consent;
}
