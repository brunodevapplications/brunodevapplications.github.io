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
        "Consentimento",
        c.canServePersonalizedAds ? "Ativados anúncios personalizados." : "Ativados anúncios não personalizados."
      );
    } catch (e) {
      console.warn("Manage consent error:", e);
      Alert.alert("Consentimento", "Não foi possível alterar agora.");
    }
  };

  const parseNum = (v) => {
    const n = parseFloat((v || "").toString().replace(",", "."));
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
      Alert.alert("Dados em falta", "Preenche salário bruto mensal e horas semanais.");
      return;
    }
    if (horasExtraNum < 0 || hNoturnasExtraNum < 0 || hNoturnasNormaisNum < 0) {
      Alert.alert("Valor inválido", "As horas não podem ser negativas.");
      return;
    }
    if (hNoturnasExtraNum > horasExtraNum) {
      Alert.alert("Valor inválido", "Horas noturnas extra não podem exceder o total de horas extra.");
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
          <Text style={styles.histPill}>{input.tipo === "diaUtil" ? "Dia útil" : "Descanso/Feriado"}</Text>
        </View>
        <Text style={styles.histLine}>
          💰 Salário: {input.salario}€ • ⌛ {input.horasSemana}h/sem
        </Text>
        <Text style={styles.histLine}>
          ⏱️ Extra: {input.horasExtra}h (🌙 {input.horasNoturnasExtra}h) • Normais 🌙 {input.horasNoturnasNormais}h
        </Text>
        <Text style={styles.histLine}>
          📌 VH: {output.VH}€ • Extra: {output.acrescimosExtra}€ • Noturno: {output.noturno}€
        </Text>
        {parseFloat(output.totalBrutoExtras) > 0 ? (
          <Text style={styles.histTotal}>💵 Total EXTRA: {output.totalBrutoExtras}€</Text>
        ) : (
          <Text style={styles.histTotal}>💵 Total NOTURNO (normais): {output.totalBrutoNoturnasNormais}€</Text>
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
        <Text style={styles.title}>Horas+ Extra PT 🚀</Text>

        <Text>💰 Salário bruto mensal (€)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={salario}
          onChangeText={setSalario}
          placeholder="Ex.: 1000"
        />

        <Text>⌛ Horas semanais contratadas</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={horasSemana}
          onChangeText={setHorasSemana}
          placeholder="Ex.: 40"
        />

        <Text>⏱️ Nº de horas extra (total)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={horasExtra}
          onChangeText={setHorasExtra}
          placeholder="Ex.: 2"
        />

        <Text>🌙 Nº de horas EXTRA em período noturno (22h–07h)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={horasNoturnasExtra}
          onChangeText={setHorasNoturnasExtra}
          placeholder="Ex.: 1"
        />

        <Text>🌙 Nº de horas NORMAIS em período noturno (22h–07h)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={horasNoturnasNormais}
          onChangeText={setHorasNoturnasNormais}
          placeholder="Ex.: 1"
        />

        <Text>⚙️ Tipo de dia para as HORAS EXTRA</Text>
        <View style={styles.segment}>
          <Pressable
            onPress={() => setTipo("diaUtil")}
            style={[styles.segmentBtn, tipo === "diaUtil" && styles.segmentBtnActive]}
          >
            <Text style={[styles.segmentTxt, tipo === "diaUtil" && styles.segmentTxtActive]}>Dia útil</Text>
            <Text style={[styles.segmentSub, tipo === "diaUtil" && styles.segmentTxtActive]}>
              1ª +25%, seguintes +37,5%
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setTipo("descanso")}
            style={[styles.segmentBtn, styles.segmentBtnRight, tipo === "descanso" && styles.segmentBtnActive]}
          >
            <Text style={[styles.segmentTxt, tipo === "descanso" && styles.segmentTxtActive]}>
              Descanso/Feriado
            </Text>
            <Text style={[styles.segmentSub, tipo === "descanso" && styles.segmentTxtActive]}>+50%/h</Text>
          </Pressable>
        </View>

        <Button title="CALCULAR" onPress={calcular} />

        {resultado && (
          <View style={styles.resultado}>
            <Text>📌 Valor hora base (VH) — BRUTO: {resultado.VH} €</Text>

            {parseFloat(resultado.totalBrutoExtras) > 0 && (
              <>
                <Text>🧮 Base das horas extra (somatório VH): {resultado.baseHorasExtra} €</Text>
                <Text>➕ Acréscimos de horas extra — BRUTO: {resultado.acrescimosExtra} €</Text>
              </>
            )}

            <Text>🌙 Subsídio noturno (normais + extra) — BRUTO: {resultado.noturno} €</Text>
            <Text>  • Inclui {resultado.noturnoHorasNormais} € de horas normais noturnas</Text>

            {parseFloat(resultado.totalBrutoExtras) > 0 && (
              <Text style={styles.total}>💵 Total BRUTO pelas HORAS EXTRA: {resultado.totalBrutoExtras} €</Text>
            )}

            {resultado.isNightOnly && (
              <Text style={styles.total}>
                💵 Total BRUTO pelas HORAS NOTURNAS (normais): {resultado.totalBrutoNoturnasNormais} €
              </Text>
            )}

            <View style={styles.legalBox}>
              <Text style={styles.legalTitle}>ℹ️ Observações / Enquadramento</Text>
              <Text style={styles.legalTxt}>
                • Valores <Text style={{ fontWeight: "bold" }}>BRUTOS</Text>.
              </Text>
              <Text style={styles.legalTxt}>
                • O subsídio noturno (+25% do VH) aplica-se às horas entre 22h–07h e é acumulável
                com o acréscimo de hora extra, exceto se definido de forma diferente no contrato de
                trabalho ou em Contrato Coletivo de Trabalho.
              </Text>
            </View>
          </View>
        )}

        {/* --- HISTÓRICO --- */}
        <View style={styles.histBox}>
          <View style={styles.histHeader}>
            <Text style={styles.histTitle}>📒 Histórico</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable onPress={() => setShowHistory((v) => !v)} style={styles.histBtn}>
                <Text>{showHistory ? "Ocultar" : "Mostrar"}</Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  Alert.alert("Limpar histórico", "Tens a certeza?", [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Limpar", style: "destructive", onPress: clearHistory },
                  ])
                }
                style={styles.histBtn}
              >
                <Text>Limpar</Text>
              </Pressable>
            </View>
          </View>

          {showHistory && history.length === 0 && (
            <Text style={{ color: "#666" }}>Sem registos ainda. Faz um cálculo para guardar aqui.</Text>
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
            <Text>Gerir consentimento de anúncios</Text>
          </Pressable>
          <Text style={styles.bannerState}>
            Estado: {consent.canServePersonalizedAds ? "Personalizados" : "Não personalizados"}
          </Text>
          <BannerAd
            key={adKey} // recarrega ao mudar consent
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
