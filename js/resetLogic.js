// js/resetLogic.js

// =====================================================
// PANACEA RESET LOGIC
// Premium reset + adaptive nervous-system practice logic
// =====================================================


// -----------------------------------------------------
// lingua app
// usa localStorage.lang ("de" / "it") se presente,
// altrimenti <html lang="..">, fallback "de"
// -----------------------------------------------------
export function getLang() {
  const ls = (localStorage.getItem("lang") || "").toLowerCase();
  if (ls === "it" || ls === "de") return ls;

  const h = (document.documentElement.lang || "").toLowerCase();
  if (h.startsWith("it")) return "it";

  return "de";
}


// -----------------------------------------------------
// helper: clamp numerico sicuro
// -----------------------------------------------------
function clamp(value, min, max) {
  const n = Number(value);
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}


// -----------------------------------------------------
// carica i reset premium
// -----------------------------------------------------
export async function loadPremiumResets() {
  const response = await fetch("./data/resetPremium.json", { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Errore caricamento resetPremium.json: ${response.status}`);
  }

  return await response.json();
}


// -----------------------------------------------------
// carica le pratiche dinamiche
// usa ./data/practices.json
// struttura attesa:
// { "practices": [ ... ] }
// -----------------------------------------------------
export async function loadPractices() {
  const response = await fetch("./data/practices.json", { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Errore caricamento practices.json: ${response.status}`);
  }

  const data = await response.json();

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.practices)) return data.practices;

  return [];
}


// -----------------------------------------------------
// 1-10 -> livello
// -----------------------------------------------------
export function level(value) {
  const v = clamp(value, 1, 10);

  if (v >= 7) return "hoch";
  if (v >= 4) return "mittel";
  return "niedrig";
}


// -----------------------------------------------------
// trova combinazione migliore premium reset
// -----------------------------------------------------
export function pickReset(resets, stressValue, energyValue) {
  if (!Array.isArray(resets) || resets.length === 0) return null;

  const stressLevel = level(stressValue);
  const energyLevel = level(energyValue);

  let match = resets.find(
    (r) => r.stress === stressLevel && r.energy === energyLevel
  );

  if (!match) {
    match = resets.find((r) => r.stress === stressLevel);
  }

  if (!match) {
    match = resets[0];
  }

  return match;
}


// -----------------------------------------------------
// helper: prendi testo bilingue (supporta string o {de,it})
// -----------------------------------------------------
function t(val, lang) {
  if (val == null) return "";
  if (typeof val === "string") return val;

  if (typeof val === "object") {
    return val[lang] || val.de || val.it || "";
  }

  return "";
}


// -----------------------------------------------------
// helper: random da array
// -----------------------------------------------------
function randomItem(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx];
}


// -----------------------------------------------------
// helper: mescola array
// -----------------------------------------------------
function shuffle(arr) {
  const copy = [...arr];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}


// -----------------------------------------------------
// helper: random da texts (supporta array o {de:[], it:[]})
// -----------------------------------------------------
function pickText(entry, lang) {
  if (!entry) return "";

  // caso A: entry.text
  if (entry.text) return t(entry.text, lang);

  // caso B: entry.texts
  if (entry.texts) {
    let arr = entry.texts;

    if (typeof arr === "object" && !Array.isArray(arr)) {
      arr = arr[lang] || arr.de || arr.it || [];
    }

    if (Array.isArray(arr) && arr.length) {
      return randomItem(arr) || "";
    }
  }

  return "";
}


// -----------------------------------------------------
// INTRO dinamico scientifico
// -----------------------------------------------------
export function getResetIntro(stress, energy, lang = getLang()) {
  const s = clamp(stress, 1, 10);
  const e = clamp(energy, 1, 10);

  if (lang === "it") {
    if (s >= 8 && e <= 4) {
      return "Il tuo sistema nervoso ha bisogno soprattutto di calma, orientamento e sicurezza.";
    }
    if (s >= 8 && e > 4) {
      return "Il tuo sistema sembra molto attivato. Ora possono aiutarti scarico controllato, regolazione e respiro.";
    }
    if (s >= 6) {
      return "Un reset breve con grounding, respiro e presenza può essere utile in questo momento.";
    }
    if (s <= 3 && e <= 4) {
      return "In questo momento il tuo sistema ha bisogno più di una lieve attivazione che di una forte calma.";
    }
    return "Un reset equilibrato può sostenere presenza, chiarezza e stabilità interiore.";
  }

  // DE
  if (s >= 8 && e <= 4) {
    return "Dein Nervensystem braucht jetzt vor allem Ruhe, Orientierung und Sicherheit.";
  }
  if (s >= 8 && e > 4) {
    return "Dein System wirkt stark aktiviert. Jetzt helfen Regulation, kontrollierte Entlastung und ein ruhiger Atem.";
  }
  if (s >= 6) {
    return "Ein kurzer Reset mit Erdung, Atmung und bewusster Präsenz kann jetzt hilfreich sein.";
  }
  if (s <= 3 && e <= 4) {
    return "Dein System braucht jetzt eher sanfte Aktivierung als starke Beruhigung.";
  }
  return "Ein ausgewogener Reset unterstützt jetzt Präsenz, Klarheit und innere Stabilität.";
}


// -----------------------------------------------------
// LOGICA SMART DELLE PRATICHE
// Seleziona 3 pratiche in sequenza coerente:
// 1 grounding / orienting / activation
// 2 calming / release / positive
// 3 recovery / awareness / grounding
// -----------------------------------------------------
export function getPanaceaReset(practices, stress, energy) {
  const safeStress = clamp(stress, 1, 10);
  const safeEnergy = clamp(energy, 1, 10);

  if (!Array.isArray(practices) || practices.length === 0) {
    return [];
  }

  let sequence = [];

  // profili più regolati e coerenti con nervous system logic
  if (safeStress >= 8 && safeEnergy <= 4) {
    sequence = ["grounding", "calming", "recovery"];
  } else if (safeStress >= 8 && safeEnergy > 4) {
    sequence = ["grounding", "release", "calming"];
  } else if (safeStress >= 6) {
    sequence = ["grounding", "calming", "awareness"];
  } else if (safeStress <= 3 && safeEnergy <= 4) {
    sequence = ["activation", "positive", "grounding"];
  } else {
    sequence = ["awareness", "grounding", "positive"];
  }

  const result = [];

  for (const target of sequence) {
    const matches = practices.filter((practice) => {
      const alreadyUsed = result.some((p) => p.id === practice.id);

      const intensityOk =
        safeStress >= 8
          ? practice.intensity === "low"
          : ["low", "medium"].includes(practice.intensity);

      return (
        !alreadyUsed &&
        practice.nervousSystem === target &&
        intensityOk
      );
    });

    if (matches.length > 0) {
      result.push(randomItem(matches));
    }
  }

  // fallback: completa fino a 3
  if (result.length < 3) {
    const remaining = practices.filter(
      (practice) => !result.some((p) => p.id === practice.id)
    );

    const safeRemaining =
      safeStress >= 8
        ? remaining.filter((p) => p.intensity === "low")
        : remaining.filter((p) => ["low", "medium"].includes(p.intensity));

    const shuffled = shuffle(safeRemaining);
    result.push(...shuffled.slice(0, 3 - result.length));
  }

  return result.slice(0, 3);
}


// -----------------------------------------------------
// format singola pratica in base alla lingua
// supporta campi stringa o {de,it}
// -----------------------------------------------------
export function localizePractice(practice, lang = getLang()) {
  if (!practice) return null;

  return {
    ...practice,
    title: t(practice.title, lang),
    category: t(practice.category, lang),
    duration: t(practice.duration, lang),
    instruction: t(practice.instruction, lang),
    effect: t(practice.effect, lang)
  };
}


// -----------------------------------------------------
// restituisce 3 pratiche già localizzate
// -----------------------------------------------------
export function pickDynamicPractices(practices, stress, energy, lang = getLang()) {
  const selected = getPanaceaReset(practices, stress, energy);
  return selected.map((p) => localizePractice(p, lang));
}


// -----------------------------------------------------
// render lista pratiche in HTML
// ogni pratica viene mostrata come mini-card
// -----------------------------------------------------
export function renderPracticesList(practices, containerId = "resetPractices", lang = getLang()) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!Array.isArray(practices) || practices.length === 0) {
    container.innerHTML = "";
    container.style.display = "none";
    return;
  }

  container.style.display = "block";

  const durationLabel = lang === "it" ? "Durata" : "Dauer";
  const effectLabel = lang === "it" ? "Effetto" : "Wirkung";

  container.innerHTML = practices.map((p) => {
    const title = p.title || "";
    const duration = p.duration || "";
    const instruction = p.instruction || "";
    const effect = p.effect || "";

    return `
      <div class="practice-card">
        <div class="practice-title">${title}</div>
        ${duration ? `<div class="practice-duration"><strong>${durationLabel}:</strong> ${duration}</div>` : ""}
        ${instruction ? `<div class="practice-instruction">${instruction}</div>` : ""}
        ${effect ? `<div class="practice-effect"><strong>${effectLabel}:</strong> ${effect}</div>` : ""}
      </div>
    `;
  }).join("");
}


// -----------------------------------------------------
// render completo premium reset
// scrive:
// - titolo
// - testo
// - breathing
// - intro dinamica
// - pratiche dinamiche
//
// opzionale: se nel tuo HTML un elemento non esiste,
// non succede nulla.
// -----------------------------------------------------
export async function renderPremiumReset(stressValue, energyValue, opts = {}) {
  const {
    titleElId = "resetTitle",
    textElId = "resetText",
    breathElId = "resetBreath",
    introElId = "resetIntro",
    practicesElId = "resetPractices"
  } = opts;

  const lang = getLang();

  // 1) premium reset base
  const resets = await loadPremiumResets();
  const selectedReset = pickReset(resets, stressValue, energyValue);

  // sicurezza
  const title = selectedReset ? t(selectedReset.title, lang) : "";
  const text = selectedReset ? pickText(selectedReset, lang) : "";

  const titleEl = document.getElementById(titleElId);
  const textEl = document.getElementById(textElId);

  if (titleEl) titleEl.textContent = title || "";
  if (textEl) textEl.textContent = text || "";

  // 2) intro dinamica
  const introEl = document.getElementById(introElId);
  if (introEl) {
    introEl.textContent = getResetIntro(stressValue, energyValue, lang);
  }

  // 3) breathing opzionale
  const breathEl = document.getElementById(breathElId);
  if (breathEl) {
    const b = selectedReset?.breathing;

    if (b && b.inhale && b.exhale && b.minutes) {
      const label =
        lang === "it"
          ? `Respiro: In ${b.inhale}s · Out ${b.exhale}s · Durata ${b.minutes} min`
          : `Atem: Ein ${b.inhale}s · Aus ${b.exhale}s · Dauer ${b.minutes} Min`;

      breathEl.textContent = label;
      breathEl.style.display = "block";
    } else {
      breathEl.textContent = "";
      breathEl.style.display = "none";
    }
  }

  // 4) pratiche dinamiche opzionali
  try {
    const practices = await loadPractices();
    const selectedPractices = pickDynamicPractices(
      practices,
      stressValue,
      energyValue,
      lang
    );

    renderPracticesList(selectedPractices, practicesElId, lang);

    return {
      selectedReset,
      selectedPractices,
      intro: getResetIntro(stressValue, energyValue, lang)
    };
  } catch (error) {
    // se practices.json non esiste ancora,
    // il reset premium continua a funzionare
    const practicesContainer = document.getElementById(practicesElId);
    if (practicesContainer) {
      practicesContainer.innerHTML = "";
      practicesContainer.style.display = "none";
    }

    return {
      selectedReset,
      selectedPractices: [],
      intro: getResetIntro(stressValue, energyValue, lang),
      practicesError: error
    };
  }
}
