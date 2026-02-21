// js/resetLogic.js
// Premium Reset Logic (DE/IT) – reads language from localStorage: panacea_lang ("de"|"it")

const STORAGE_LANG = "panacea_lang";
const RESET_CACHE_KEY = "panacea_resetPremium_cache_v1";

function getLang(){
  const saved = localStorage.getItem(STORAGE_LANG);
  return (saved === "it") ? "it" : "de";
}

// safe getter for bilingual fields
function t(field, lang){
  if(field == null) return "";
  if(typeof field === "string") return field;         // backward compatible
  if(typeof field === "object") return field[lang] || field.de || field.it || "";
  return "";
}

// Load JSON (expected shape: { de:[...], it:[...] }  OR legacy: [...] )
async function loadPremiumResets(){
  const res = await fetch("./data/resetPremium.json", { cache: "no-store" });
  if(!res.ok) throw new Error("resetPremium.json not reachable");
  const data = await res.json();

  // legacy: array
  if(Array.isArray(data)) return { de: data, it: data };

  // new: object with de/it arrays
  if(data && Array.isArray(data.de) && Array.isArray(data.it)) return data;

  throw new Error("resetPremium.json format invalid");
}

// value 1–10 -> level string used in JSON
function level(value){
  const v = Number(value);
  if(v >= 7) return "hoch";
  if(v >= 4) return "mittel";
  return "niedrig";
}

function pickReset(list, stressValue, energyValue){
  const stressL = level(stressValue);
  const energyL = level(energyValue);

  let match = list.find(r => r.stress === stressL && r.energy === energyL);
  if(!match) match = list.find(r => r.stress === stressL);
  if(!match) match = list[0];
  return match;
}

// Optional: cache in localStorage to avoid fetch every slider move
async function getResetsCached(){
  try{
    const raw = localStorage.getItem(RESET_CACHE_KEY);
    if(raw){
      const cached = JSON.parse(raw);
      if(cached && cached.de && cached.it) return cached;
    }
  }catch(e){}

  const data = await loadPremiumResets();
  try{ localStorage.setItem(RESET_CACHE_KEY, JSON.stringify(data)); }catch(e){}
  return data;
}

// Main render (uses current language)
async function renderPremiumReset(stressValue, energyValue){
  const lang = getLang();
  const data = await getResetsCached();

  const list = (lang === "it") ? data.it : data.de;
  const selected = pickReset(list, stressValue, energyValue);

  // These ids must exist in your page:
  // #resetTitle, #resetText
  const titleEl = document.getElementById("resetTitle");
  const textEl  = document.getElementById("resetText");

  if(titleEl) titleEl.textContent = t(selected.title, lang);
  if(textEl)  textEl.textContent  = t(selected.text, lang);
}

// expose to window if you call it from inline script
window.renderPremiumReset = renderPremiumReset;
