import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  FlatList,
} from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as SystemUI from "expo-system-ui";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { initAdsAndConsent, manageConsent } from "./src/consent";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "./src/locales/translations";

// --- App root com SafeAreaProvider ---
export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

const STORAGE_KEY = "@horas_extra_history";
const MAX_HISTORY = 50;

function MainApp() {
  const insets = useSafeAreaInsets();

  // ---- estado do formulário ----
  const [salario, setSalario] = useState("");
  const [horasSemana, setHorasSemana] = useState("");
  const [horasExtra, setHorasExtra] = useState("");
  const [horasNoturnasExtra, setHorasNoturnasExtra] = useState("");
  const [horasNoturnasNormais, setHorasNoturnasNormais] = useState("");
  const [tipo, setTipo] = useState("diaUtil"); // "diaUtil" | "descanso"

  // ---- anúncios / consentimento ----
  const [consent, setConsent] = useState(null);
  const [adKey, setAdKey] = useState(0); // força remount do banner ao mudar consent

  // ---- cálculo & histórico ----
  const [resultado, setResultado] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);

  useEffect(() => {
    (async () => {
      await SystemUI.setBackgroundColorAsync("#ffffff");
      try {
        // carregar histórico no arranque
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setHistory(JSON.parse(saved));
      } catch (e) {
        console.warn("Falha a ler histórico", e);
      }

      // consent / ads
      try {
        const c = await initAdsAndConsent();
        setConsent(c);
        setAdKey((k) => k + 1);
      } catch (e) {
        console.warn("Consent init error:", e);
        setConsent({ canServePersonalizedAds: false });
        setAdKey((k) => k + 1);
      }
    })();
  }, []);

  const onManageConsent = async () => {
    try {
      const c = await manageConsent();
      setConsent(c);
      setAdKey((k) => k + 1);
      Alert.alert(
        i18n.t("consentTitle"),
        c.canServePersonalizedAds ? i18n.t("consentOn") : i18n.t("consentOff")
      );
    } catch (e) {
      console.warn("Manage consent error:", e);
      Alert.alert(i18n.t("consentTitle"), i18n.t("consentErr"));
    }
  };

  const parseNum = (v) => {
    const n = parseFloat(String(v ?? "").replace(",", ".").trim());
    return isNaN(n) ? 0 : n;
  };

  const formatDate = (d) => {
    try {
      const dt = new Date(d);
      const pad = (x) => String(x).padStart(2, "0");
      return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()} ${pad(dt.getHours())}:${pad(
        dt.getMinutes()
      )}`;
    } catch {
      return String(d);
    }
  };

  const saveHistory = async (entry) => {
    try {
      const list = [entry, ...history].slice(0, MAX_HISTORY);
      setHistory(list);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn("Falha a guardar histórico", e);
    }
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setHistory([]);
    } catch (e) {
      console.warn("Falha a limpar histórico", e);
    }
  };

  const calcular = () => {
    const salarioNum = parseNum(salario);
    const horasSemanaNum = parseNum(horasSemana);
    const horasExtraNum = Math.floor(parseNum(horasExtra));
    const hNoturnasExtraNum = Math.floor(parseNum(horasNoturnasExtra));
    const hNoturnasNormaisNum = Math.floor(parseNum(horasNoturnasNormais));

    if (!salarioNum || !horasSemanaNum) {
      Alert.alert(i18n.t("alertaDadosTitulo"), i18n.t("alertaDadosMsg"));
      return;
    }
    if (horasExtraNum < 0 || hNoturnasExtraNum < 0 || hNoturnasNormaisNum < 0) {
      Alert.alert(i18n.t("alertaInvalidoTitulo"), i18n.t("alertaNegativos"));
      return;
    }
    if (hNoturnasExtraNum > horasExtraNum) {
      Alert.alert(i18n.t("alertaInvalidoTitulo"), i18n.t("alertaNoturnasExcedem"));
      return;
    }

    // Valor Hora (Portugal): (Salário Bruto Mensal * 12) / (52 * Horas Semanais)
    const VH = (salarioNum * 12) / (52 * horasSemanaNum);
    const SN = VH * 0.25; // subsídio noturno por hora

    let totalAcrescimosExtra = 0; // acréscimos de hora extra (bruto)
    let totalNoturno = 0;         // subsídio noturno (bruto) de normais + extra
    let totalBrutoExtras = 0;     // base + extra + noturno (apenas horas extra)
    let baseHorasExtra = 0;       // somatório VH das horas extra

    if (horasExtraNum > 0) {
      // as últimas hNoturnasExtraNum são noturnas
      for (let i = 1; i <= horasExtraNum; i++) {
        const isNightExtra = i > (horasExtraNum - hNoturnasExtraNum);

        // acréscimo de hora extra
        let acrescimoExtra = 0;
        if (tipo === "diaUtil") {
          acrescimoExtra = i === 1 ? VH * 0.25 : VH * 0.375; // 1ª +25%, seguintes +37.5%
        } else {
          acrescimoExtra = VH * 0.5; // descanso/feriado +50%/h
        }

        const addNoturno = isNightExtra ? SN : 0; // SN se esta hora extra for noturna
        const totalHora = VH + acrescimoExtra + addNoturno;

        baseHorasExtra += VH;
        totalAcrescimosExtra += acrescimoExtra;
        totalNoturno += addNoturno;
        totalBrutoExtras += totalHora;
      }
    }

    // subsídio noturno de horas normais (não extra)
    const noturnoHorasNormais = hNoturnasNormaisNum * SN;
    totalNoturno += noturnoHorasNormais;

    // total BRUTO de horas normais noturnas quando não há extra
    const totalBrutoNoturnasNormais =
      hNoturnasNormaisNum > 0 && horasExtraNum === 0 ? hNoturnasNormaisNum * (VH + SN) : 0;

    const res = {
      VH: VH.toFixed(2),
      acrescimosExtra: totalAcrescimosExtra.toFixed(2),
      noturno: totalNoturno.toFixed(2),
      totalBrutoExtras: totalBrutoExtras.toFixed(2),
      baseHorasExtra: baseHorasExtra.toFixed(2),
      noturnoHorasNormais: noturnoHorasNormais.toFixed(2),
      totalBrutoNoturnasNormais: totalBrutoNoturnasNormais.toFixed(2),
      isNightOnly: horasExtraNum === 0 && hNoturnasNormaisNum > 0,
    };

    setResultado(res);

    // --- guardar no histórico (auto) ---
    const entry = {
      id: Date.now().toString(),
      at: new Date().toISOString(),
      input: {
        salario: salarioNum,
        horasSemana: horasSemanaNum,
        horasExtra: horasExtraNum,
        horasNoturnasExtra: hNoturnasExtraNum,
        horasNoturnasNormais: hNoturnasNormaisNum,
        tipo,
      },
      output: res,
    };
    saveHistory(entry);
  };

  const renderItem = ({ item }) => {
    const { input, output } = item;
    return (
      <View style={styles.histItem}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.histDate}>{formatDate(item.at)}</Text>
          <Text style={styles.histPill}>
            {input.tipo === "diaUtil" ? i18n.t("histPillDiaUtil") : i18n.t("histPillDescanso")}
          </Text>
        </View>
        <Text style={styles.histLine}>
          {i18n.t("histSalarioHoras", { salario: input.salario, horasSemana: input.horasSemana })}
        </Text>
        <Text style={styles.histLine}>
          {i18n.t("histExtrasLine", {
            hExtra: input.horasExtra,
            hNoturnasExtra: input.horasNoturnasExtra,
            hNoturnasNormais: input.horasNoturnasNormais,
          })}
        </Text>
        <Text style={styles.histLine}>
          {i18n.t("histVHLine", { vh: output.VH, extra: output.acrescimosExtra, noturno: output.noturno })}
        </Text>
        {parseFloat(output.totalBrutoExtras) > 0 ? (
          <Text style={styles.histTotal}>{i18n.t("histTotalExtra", { valor: output.totalBrutoExtras })}</Text>
        ) : (
          <Text style={styles.histTotal}>{i18n.t("histTotalNoturno", { valor: output.totalBrutoNoturnasNormais })}</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 140 + (insets.bottom || 0) }}
        keyboardShouldPersistTaps="handled"
        style={{ backgroundColor: "#fff" }}
      >
        <Text style={styles.title}>{i18n.t("title")}</Text>

        <Text>{i18n.t("salario")}</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={salario}
          onChangeText={setSalario}
          placeholder={i18n.t("placeholderSalario")}
        />

        <Text>{i18n.t("horasSemana")}</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={horasSemana}
          onChangeText={setHorasSemana}
          placeholder={i18n.t("placeholderHorasSemana")}
        />

        <Text>{i18n.t("horasExtra")}</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={horasExtra}
          onChangeText={setHorasExtra}
          placeholder={i18n.t("placeholderHorasExtra")}
        />

        <Text>{i18n.t("horasExtraNocturnas")}</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={horasNoturnasExtra}
          onChangeText={setHorasNoturnasExtra}
          placeholder={i18n.t("placeholderHorasNoturnas")}
        />

        <Text>{i18n.t("horasNormaisNocturnas")}</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={horasNoturnasNormais}
          onChangeText={setHorasNoturnasNormais}
          placeholder={i18n.t("placeholderHorasNoturnas")}
        />

        <Text>{i18n.t("tipoDia")}</Text>
        <View style={styles.segment}>
          <Pressable
            onPress={() => setTipo("diaUtil")}
            style={[styles.segmentBtn, tipo === "diaUtil" && styles.segmentBtnActive]}
          >
            <Text style={[styles.segmentTxt, tipo === "diaUtil" && styles.segmentTxtActive]}>{i18n.t("diaUtil")}</Text>
            <Text style={[styles.segmentSub, tipo === "diaUtil" && styles.segmentTxtActive]}>{i18n.t("regraDiaUtil")}</Text>
          </Pressable>

          <Pressable
            onPress={() => setTipo("descanso")}
            style={[styles.segmentBtn, styles.segmentBtnRight, tipo === "descanso" && styles.segmentBtnActive]}
          >
            <Text style={[styles.segmentTxt, tipo === "descanso" && styles.segmentTxtActive]}>{i18n.t("descanso")}</Text>
            <Text style={[styles.segmentSub, tipo === "descanso" && styles.segmentTxtActive]}>{i18n.t("regraDescanso")}</Text>
          </Pressable>
        </View>

        <Button title={i18n.t("calcular")} onPress={calcular} />

        {resultado && (
          <View style={styles.resultado}>
            <Text>{i18n.t("valorHora", { valor: resultado.VH })}</Text>

            {parseFloat(resultado.totalBrutoExtras) > 0 && (
              <>
                <Text>{i18n.t("baseHorasExtra", { valor: resultado.baseHorasExtra })}</Text>
                <Text>{i18n.t("acrescimos", { valor: resultado.acrescimosExtra })}</Text>
              </>
            )}

            <Text>{i18n.t("subsidioNoturno", { valor: resultado.noturno })}</Text>
            <Text>{i18n.t("subsidioInclui", { valor: resultado.noturnoHorasNormais })}</Text>

            {parseFloat(resultado.totalBrutoExtras) > 0 && (
              <Text style={styles.total}>{i18n.t("totalExtra", { valor: resultado.totalBrutoExtras })}</Text>
            )}

            {resultado.isNightOnly && (
              <Text style={styles.total}>{i18n.t("totalNoturno", { valor: resultado.totalBrutoNoturnasNormais })}</Text>
            )}

            <View style={styles.legalBox}>
              <Text style={styles.legalTitle}>{i18n.t("observacoes")}</Text>
              <Text style={styles.legalTxt}>• {i18n.t("obs1").replace("• ", "")}</Text>
              <Text style={styles.legalTxt}>• {i18n.t("obs2").replace("• ", "")}</Text>
            </View>
          </View>
        )}

        {/* --- HISTÓRICO --- */}
        <View style={styles.histBox}>
          <View style={styles.histHeader}>
            <Text style={styles.histTitle}>{i18n.t("historico")}</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable onPress={() => setShowHistory((v) => !v)} style={styles.histBtn}>
                <Text>{showHistory ? i18n.t("ocultar") : i18n.t("mostrar")}</Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  Alert.alert(i18n.t("confirmarLimpar"), i18n.t("tensCerteza"), [
                    { text: i18n.t("cancelar"), style: "cancel" },
                    { text: i18n.t("limpar"), style: "destructive", onPress: clearHistory },
                  ])
                }
                style={styles.histBtn}
              >
                <Text>{i18n.t("limpar")}</Text>
              </Pressable>
            </View>
          </View>

          {showHistory && history.length === 0 && (
            <Text style={{ color: "#666" }}>{i18n.t("semRegistos")}</Text>
          )}

          {showHistory && history.length > 0 && (
            <FlatList
              data={history}
              keyExtractor={(it) => it.id}
              renderItem={renderItem}
              scrollEnabled={false}
              contentContainerStyle={{ gap: 10, paddingTop: 8 }}
            />
          )}
        </View>
      </ScrollView>

      {/* --- BANNER FIXO NO RODAPÉ --- */}
      {consent && (
        <View style={[styles.bannerWrap, { paddingBottom: insets.bottom || 8 }]}>
          <Pressable onPress={onManageConsent} style={styles.manageBtn}>
            <Text>{i18n.t("gerirConsent")}</Text>
          </Pressable>
          <Text style={styles.bannerState}>
            {i18n.t("labelEstado")} {consent.canServePersonalizedAds ? i18n.t("estadoPersonalizados") : i18n.t("estadoNaoPersonalizados")}
          </Text>
          <BannerAd
            key={adKey}
            unitId={TestIds.BANNER} // trocar pelo teu ad unit id em produção
            size={BannerAdSize.ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: !consent.canServePersonalizedAds,
            }}
            onAdFailedToLoad={(e) => console.log("Banner error", e)}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  resultado: {
    marginTop: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  total: { marginTop: 8, fontSize: 18, fontWeight: "bold", color: "#2E8B57" },
  legalBox: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  legalTitle: { fontWeight: "bold", marginBottom: 6 },
  legalTxt: { fontSize: 12, color: "#444", marginBottom: 4 },

  // Seletor segmentado
  segment: { flexDirection: "row", marginBottom: 15 },
  segmentBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
    marginRight: 10,
  },
  segmentBtnRight: { marginRight: 0 },
  segmentBtnActive: { borderColor: "#2E8B57", backgroundColor: "#eaf6ef" },
  segmentTxt: { fontWeight: "600" },
  segmentTxtActive: { color: "#2E8B57" },
  segmentSub: { fontSize: 12, color: "#666", marginTop: 2 },

  // Histórico
  histBox: { marginTop: 20, padding: 12, borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 8, backgroundColor: "#fff" },
  histHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  histTitle: { fontSize: 18, fontWeight: "600" },
  histBtn: { paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderRadius: 8, borderColor: "#ccc", backgroundColor: "#fff" },
  histItem: { padding: 10, borderWidth: 1, borderColor: "#eee", borderRadius: 8, backgroundColor: "#fafafa" },
  histDate: { fontSize: 12, color: "#666", marginBottom: 4 },
  histPill: { fontSize: 12, color: "#2E8B57" , fontWeight: "600" },
  histLine: { fontSize: 13, color: "#333", marginTop: 2 },
  histTotal: { marginTop: 6, fontSize: 14, fontWeight: "700", color: "#2E8B57" },

  // Banner footer
  bannerWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingTop: 6,
    zIndex: 5,
  },
  manageBtn: {
    marginTop: 6,
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  bannerState: { fontSize: 11, color: "#777", marginTop: 4, marginBottom: 6 },
});
