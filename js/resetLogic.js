// js/resetLogic.js

// --- lingua app ---
// usa localStorage.lang ("de" / "it") se presente, altrimenti <html lang="..">, fallback "de"
export function getLang() {
  const ls = (localStorage.getItem("lang") || "").toLowerCase();
  if (ls === "it" || ls === "de") return ls;
  const h = (document.documentElement.lang || "").toLowerCase();
  if (h.startsWith("it")) return "it";
  return "de";
}

// --- carica i reset premium ---
export async function loadPremiumResets() {
  const response = await fetch("./data/resetPremium.json", { cache: "no-store" });
  return await response.json();
}

// --- 1-10 -> livello ---
export function level(value) {
  const v = Number(value);
  if (v >= 7) return "hoch";
  if (v >= 4) return "mittel";
  return "niedrig";
}

// --- trova combinazione migliore ---
export function pickReset(resets, stressValue, energyValue) {
  const stressLevel = level(stressValue);
  const energyLevel = level(energyValue);

  let match = resets.find(r => r.stress === stressLevel && r.energy === energyLevel);
  if (!match) match = resets.find(r => r.stress === stressLevel);
  if (!match) match = resets[0];
  return match;
}

// --- helper: prendi testo bilingue (supporta string o {de,it}) ---
function t(val, lang) {
  if (val == null) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") return val[lang] || val.de || val.it || "";
  return "";
}

// --- helper: random da texts (supporta array o {de:[], it:[]}) ---
function pickText(entry, lang) {
  // caso A: entry.text (singolo)
  if (entry.text) return t(entry.text, lang);

  // caso B: entry.texts (multipli)
  if (entry.texts) {
    let arr = entry.texts;
    if (typeof arr === "object" && !Array.isArray(arr)) {
      arr = arr[lang] || arr.de || arr.it || [];
    }
    if (Array.isArray(arr) && arr.length) {
      const idx = Math.floor(Math.random() * arr.length);
      return arr[idx];
    }
  }
  return "";
}

// --- render: scrive titolo/testo e (se esiste) breathing ---
export async function renderPremiumReset(stressValue, energyValue, opts = {}) {
  const {
    titleElId = "resetTitle",
    textElId = "resetText",
    breathElId = "resetBreath" // opzionale: se non c'è nel tuo HTML, non fa nulla
  } = opts;

  const lang = getLang();
  const resets = await loadPremiumResets();
  const selectedReset = pickReset(resets, stressValue, energyValue);

  const title = t(selectedReset.title, lang);
  const text = pickText(selectedReset, lang);

  const titleEl = document.getElementById(titleElId);
  const textEl = document.getElementById(textElId);

  if (titleEl) titleEl.textContent = title || "";
  if (textEl) textEl.textContent = text || "";

  // breathing opzionale
  const breathEl = document.getElementById(breathElId);
  if (breathEl) {
    const b = selectedReset.breathing;
    if (b && b.inhale && b.exhale && b.minutes) {
      const label = (lang === "it")
        ? `Respiro: In ${b.inhale}s · Out ${b.exhale}s · Durata ${b.minutes} min`
        : `Atem: Ein ${b.inhale}s · Aus ${b.exhale}s · Dauer ${b.minutes} Min`;
      breathEl.textContent = label;
      breathEl.style.display = "block";
    } else {
      breathEl.textContent = "";
      breathEl.style.display = "none";
    }
  }

  return selectedReset;
}
