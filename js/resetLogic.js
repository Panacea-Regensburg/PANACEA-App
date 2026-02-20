// Carica il file JSON con i reset premium
async function loadPremiumResets() {
  const response = await fetch("./data/resetPremium.json");
  return await response.json();
}

// Trasforma valore 1-10 in livello
function level(value) {
  if (value >= 7) return "hoch";
  if (value >= 4) return "mittel";
  return "niedrig";
}

// Seleziona il reset giusto
function pickReset(resets, stressValue, energyValue) {
  const stressLevel = level(stressValue);
  const energyLevel = level(energyValue);

  // Cerca combinazione precisa
  let match = resets.find(r =>
    r.stress === stressLevel && r.energy === energyLevel
  );

  // Fallback se non trova combinazione esatta
  if (!match) {
    match = resets.find(r => r.stress === stressLevel);
  }

  // Se ancora niente, prende il primo
  if (!match) {
    match = resets[0];
  }

  return match;
}

// Funzione principale che mostra il reset
async function renderPremiumReset(stressValue, energyValue) {
  const resets = await loadPremiumResets();
  const selectedReset = pickReset(resets, stressValue, energyValue);

  document.getElementById("resetTitle").textContent = selectedReset.title;
  document.getElementById("resetText").textContent = selectedReset.text;
}
