/**
 * FluxifyJME - The Market Liquidity Providing Platform
 * Core Application Engine & Algorithmic Models
 * 
 * Founder & CEO: Jamie, JaeMin Song
 *  - Cross-border PE/VC | Global Macro & Event-Driven Hedge Fund Manager | Chief Portfolio Manager
 *  - Alternative Investment | PE/HF | Digital Asset | RWA ⊃ STO
 *  - Certified Research Analyst (CRA)
 *  - Certified Investment Manager (CIM)
 *  - The University of Newcastle (Australia), Faculty of Business & Law
 *  - Strategic FP&A & Startup Valuation Expert
 *  - LinkedIn: https://www.linkedin.com/in/jme-song/
 *  - Notion: https://app.notion.com/p/JmeMind-f8d28f8d40d94279a1c6a8f2dec76690
 * 
 * Global Edition (100% English | FX Rate: US$ 1 = KRW 1,400)
 *  1. Secondary Market Liquidity Providing Web/App Platform for Alternative Assets
 *  2. Selected Advisory Track Record: Hana Capital (Mandate Entity: FluxifyJME)
 *  3. Global 5 Top-tier Quant Framework (Citadel, Jane Street, Renaissance, Man AHL, AQR)
 *  4. KMV Merton Structural Credit Model (Distance-to-Default & EDF)
 *  5. Cash Flow & Valuation Laboratory (DCF, Reverse DCF, MOIC, TVPI, DPI, RVPI, MIRR, IRR)
 *  6. Next-Gen ZK-ML & Federated Learning (Dynamic LTV Contraction, Margin Call, Dutch Auction)
 *  7. App-in-Toss & Viva Republica Strategic M&A Two-Track Roadmap
 *  8. Google Gemini 3.5 Flash Lite (v1beta) Native Client (Standalone / No Build / No Server)
 */

'use strict';

/* ==========================================================================
   1. GLOBAL STATE & CONFIGURATION
   ========================================================================= */

const CONFIG = {
  GEMINI_MODEL: 'gemini-3.5-flash-lite',
  API_VERSION: 'v1beta',
  STORAGE_KEY_API: 'fluxify_gemini_key',
  STORAGE_KEY_ALLOCATION: 'fluxify_asset_allocation',
  // User provided API Key pre-configured as fallback default
  DEFAULT_API_KEY: 'AQ.Ab8RN6ITZ64OyfyVYN_sCYpXgi-MO-99spjZYcdb_WlSLn_jpQ'
};

const state = {
  apiKey: localStorage.getItem(CONFIG.STORAGE_KEY_API) || CONFIG.DEFAULT_API_KEY,
  activeTab: 'tab-dashboard',
  navTimeRange: '1M',

  // Core-Satellite Allocation Weights (%)
  allocation: {
    equity: 40,        // Traditional Buyout & Core Projects
    fixedIncome: 20,   // Bonds & Infrastructure (Senior Debt)
    alternative: 30,   // Private Equity Secondary
    sto: 10,           // RWA & Security Tokens (Tokenized Asset)
    fx: 10             // FX & Cash Liquidity Buffer
  },

  // Quant Parameters
  rfRate: 3.5, // Risk-free rate 3.5%
  riskAversion: 4,

  // Tranche Structure (Total US$ 100,000 Scenario)
  tranche: {
    seniorRatio: 60,
    seniorYield: 5.0,
    mezzRatio: 25,
    mezzYield: 9.0,
    juniorRatio: 15,
    juniorYield: 15.0,
    recoveryRate: 100
  },

  // KMV Merton Credit Model Parameters (in US$ Millions)
  kmv: {
    assetV: 1000,   // Firm Asset Value US$ 1,000M
    debtD: 600,     // Default Point Debt US$ 600M
    mu: 10.0,       // Expected Return 10%
    sigma: 20.0,    // Volatility 20%
    t: 1.0          // Maturity 1 Year
  },

  // AI Chat History
  chatHistory: []
};

/* ==========================================================================
   2. INITIALIZATION & LIFECYCLE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  initTabs();
  initNavHistoryCanvas();
  initAllocationSliders();
  initKMVModel();
  initQuantFrontier();
  initTrancheModel();
  initLabMetrics();
  initZkmlSimulator();
  initGeminiClient();

  // Initial canvas render & responsive resizing
  window.addEventListener('resize', debounce(renderAllCanvases, 150));
  renderAllCanvases();
});

function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function initStorage() {
  const savedAlloc = localStorage.getItem(CONFIG.STORAGE_KEY_ALLOCATION);
  if (savedAlloc) {
    try {
      const parsed = JSON.parse(savedAlloc);
      state.allocation = { ...state.allocation, ...parsed };
    } catch (e) {
      console.warn('Failed to parse saved allocation:', e);
    }
  }
}

/* ==========================================================================
   3. TAB NAVIGATION
   ========================================================================== */

function initTabs() {
  const defaultTab = 'tab-dashboard';
  switchTab(defaultTab);
}

function switchTab(tabId) {
  state.activeTab = tabId;

  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  document.querySelectorAll('.tab-panel').forEach(panel => {
    if (panel.id === tabId) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });

  // Re-render relevant canvases on tab transition
  setTimeout(() => {
    if (tabId === 'tab-dashboard') {
      drawNavHistoryCanvas();
      drawAssetDonutChart();
    } else if (tabId === 'tab-analytics') {
      drawFrontierCanvas();
      drawTrancheCanvas();
    }
  }, 60);
}

/* ==========================================================================
   4. TAB 1: NAV HISTORY LINE CANVAS CHART (Toss Invest Style)
   ========================================================================== */

function initNavHistoryCanvas() {
  drawNavHistoryCanvas();
}

function changeNavHistoryRange(range) {
  state.navTimeRange = range;
  document.querySelectorAll('.time-btn').forEach(btn => {
    if (btn.innerText.trim() === range) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  drawNavHistoryCanvas();
}

function drawNavHistoryCanvas() {
  const canvas = document.getElementById('navHistoryCanvas');
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || 680;
  const height = rect.height || 220;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  // Generate synthetic smooth historical data in US$ Millions
  let pointsCount = 30;
  if (state.navTimeRange === '3M') pointsCount = 45;
  if (state.navTimeRange === '6M') pointsCount = 60;
  if (state.navTimeRange === '1Y') pointsCount = 80;

  const startVal = 548.8; // US$ M
  const endVal = 557.6;   // US$ M
  const data = [];
  for (let i = 0; i < pointsCount; i++) {
    const progress = i / (pointsCount - 1);
    const trend = startVal + (endVal - startVal) * progress;
    const wave = Math.sin(progress * Math.PI * 4) * 1.8 + Math.cos(progress * Math.PI * 2) * 1.2;
    data.push(trend + wave);
  }
  data[data.length - 1] = endVal; // Anchor exact value

  const minVal = Math.min(...data) - 3.0;
  const maxVal = Math.max(...data) + 3.0;

  const paddingLeft = 10;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 20;
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const coords = data.map((val, idx) => {
    const x = paddingLeft + (idx / (pointsCount - 1)) * chartW;
    const y = paddingTop + (1 - (val - minVal) / (maxVal - minVal)) * chartH;
    return { x, y };
  });

  // Background Gridlines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  for (let g = 0; g <= 4; g++) {
    const gy = paddingTop + (g / 4) * chartH;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, gy);
    ctx.lineTo(width - paddingRight, gy);
    ctx.stroke();
  }

  // Gradient Fill Area
  const grad = ctx.createLinearGradient(0, paddingTop, 0, height);
  grad.addColorStop(0, 'rgba(49, 130, 246, 0.22)');
  grad.addColorStop(1, 'rgba(49, 130, 246, 0.0)');

  ctx.beginPath();
  ctx.moveTo(coords[0].x, height - paddingBottom);
  coords.forEach(pt => ctx.lineTo(pt.x, pt.y));
  ctx.lineTo(coords[coords.length - 1].x, height - paddingBottom);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Smooth Line Stroke (Toss Blue)
  ctx.beginPath();
  ctx.moveTo(coords[0].x, coords[0].y);
  for (let i = 0; i < coords.length - 1; i++) {
    const xc = (coords[i].x + coords[i + 1].x) / 2;
    const yc = (coords[i].y + coords[i + 1].y) / 2;
    ctx.quadraticCurveTo(coords[i].x, coords[i].y, xc, yc);
  }
  ctx.lineTo(coords[coords.length - 1].x, coords[coords.length - 1].y);
  ctx.strokeStyle = '#3182f6';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // End point highlight dot
  const last = coords[coords.length - 1];
  ctx.beginPath();
  ctx.arc(last.x, last.y, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#3182f6';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(last.x, last.y, 8, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(49, 130, 246, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

/* ==========================================================================
   5. TAB 1: ASSET ALLOCATION SLIDERS & DONUT CANVAS
   ========================================================================== */

function initAllocationSliders() {
  updateAllocationLabels();
  drawAssetDonutChart();
}

function updateAllocation() {
  state.allocation.equity = parseInt(document.getElementById('sliderEquity').value, 10) || 0;
  state.allocation.fixedIncome = parseInt(document.getElementById('sliderFixedIncome').value, 10) || 0;
  state.allocation.alternative = parseInt(document.getElementById('sliderAlternative').value, 10) || 0;
  state.allocation.sto = parseInt(document.getElementById('sliderSto').value, 10) || 0;
  state.allocation.fx = parseInt(document.getElementById('sliderFx').value, 10) || 0;

  localStorage.setItem(CONFIG.STORAGE_KEY_ALLOCATION, JSON.stringify(state.allocation));
  updateAllocationLabels();
  drawAssetDonutChart();
  calculatePortfolioKPIs();
}

function updateAllocationLabels() {
  document.getElementById('sliderEquity').value = state.allocation.equity;
  document.getElementById('sliderFixedIncome').value = state.allocation.fixedIncome;
  document.getElementById('sliderAlternative').value = state.allocation.alternative;
  document.getElementById('sliderSto').value = state.allocation.sto;
  document.getElementById('sliderFx').value = state.allocation.fx;

  document.getElementById('sliderValEquity').innerText = `${state.allocation.equity}%`;
  document.getElementById('sliderValFixedIncome').innerText = `${state.allocation.fixedIncome}%`;
  document.getElementById('sliderValAlternative').innerText = `${state.allocation.alternative}%`;
  document.getElementById('sliderValSto').innerText = `${state.allocation.sto}%`;
  document.getElementById('sliderValFx').innerText = `${state.allocation.fx}%`;

  const total = state.allocation.equity + state.allocation.fixedIncome +
                state.allocation.alternative + state.allocation.sto + state.allocation.fx;
  const totalEl = document.getElementById('totalAllocationWeight');
  if (totalEl) {
    totalEl.innerText = `${total}%`;
    totalEl.className = total === 100 ? 'val text-emerald' : 'val text-rose';
  }
}

function resetAllocationPreset(presetType) {
  if (presetType === 'default') {
    state.allocation = { equity: 40, fixedIncome: 20, alternative: 30, sto: 10, fx: 10 };
  } else if (presetType === 'balanced') {
    state.allocation = { equity: 20, fixedIncome: 20, alternative: 20, sto: 20, fx: 20 };
  }
  localStorage.setItem(CONFIG.STORAGE_KEY_ALLOCATION, JSON.stringify(state.allocation));
  updateAllocationLabels();
  drawAssetDonutChart();
  calculatePortfolioKPIs();
}

function calculatePortfolioKPIs() {
  const eq = state.allocation.equity / 100;
  const fi = state.allocation.fixedIncome / 100;
  const alt = state.allocation.alternative / 100;
  const sto = state.allocation.sto / 100;
  const fx = state.allocation.fx / 100;

  // Asset return assumptions: Equity 12%, FI 6%, Alt 11%, STO 8%, FX 4%
  const expReturn = (eq * 12.0 + fi * 6.0 + alt * 11.0 + sto * 8.0 + fx * 4.0);
  // Volatility assumptions
  const expVol = Math.sqrt(
    Math.pow(eq * 16, 2) + Math.pow(fi * 4, 2) + Math.pow(alt * 14, 2) +
    Math.pow(sto * 12, 2) + Math.pow(fx * 6, 2) + 2 * eq * alt * 10
  );
  const sharpe = (expReturn - state.rfRate) / (expVol || 1);

  const kpiReturnEl = document.getElementById('kpiReturn');
  const kpiVolEl = document.getElementById('kpiVolatility');
  const kpiSharpeEl = document.getElementById('kpiSharpe');

  if (kpiReturnEl) kpiReturnEl.innerText = `${expReturn.toFixed(2)}%`;
  if (kpiVolEl) kpiVolEl.innerText = `${expVol.toFixed(2)}%`;
  if (kpiSharpeEl) kpiSharpeEl.innerText = sharpe.toFixed(2);
}

function drawAssetDonutChart() {
  const canvas = document.getElementById('assetDonutCanvas');
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || 220;
  const height = rect.height || 220;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  const total = state.allocation.equity + state.allocation.fixedIncome +
                state.allocation.alternative + state.allocation.sto + state.allocation.fx;
  if (total === 0) return;

  const slices = [
    { weight: state.allocation.equity, color: '#3182f6' },      // Toss Blue
    { weight: state.allocation.fixedIncome, color: '#38bdf8' }, // Cyan
    { weight: state.allocation.alternative, color: '#818cf8' }, // Purple
    { weight: state.allocation.sto, color: '#10b981' },         // Emerald
    { weight: state.allocation.fx, color: '#e2b774' }           // Gold
  ];

  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = Math.min(centerX, centerY) - 8;
  const innerRadius = outerRadius * 0.68;

  let startAngle = -Math.PI / 2;

  slices.forEach(slice => {
    if (slice.weight <= 0) return;
    const sliceAngle = (slice.weight / total) * Math.PI * 2;
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
    ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
    ctx.closePath();

    ctx.fillStyle = slice.color;
    ctx.fill();

    // Subtle slice boundary line
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#070b14';
    ctx.stroke();

    startAngle = endAngle;
  });
}

/* ==========================================================================
   6. TAB 3: MPT EFFICIENT FRONTIER CANVAS (Markowitz CAL & Tangency)
   ========================================================================== */

function initQuantFrontier() {
  redrawFrontier();
}

function onRiskAversionChange() {
  const slider = document.getElementById('riskAversionSlider');
  state.riskAversion = parseFloat(slider.value);
  document.getElementById('riskAversionVal').innerText = state.riskAversion;
  redrawFrontier();
}

function redrawFrontier() {
  const rfInput = document.getElementById('rfInput');
  if (rfInput) state.rfRate = parseFloat(rfInput.value) || 3.5;
  drawFrontierCanvas();
}

function optimizeMaxSharpe() {
  switchTab('tab-analytics');
  state.riskAversion = 4;
  const slider = document.getElementById('riskAversionSlider');
  if (slider) slider.value = 4;
  const valEl = document.getElementById('riskAversionVal');
  if (valEl) valEl.innerText = '4';
  redrawFrontier();
}

function applyOptimalAllocation() {
  state.allocation = { equity: 35, fixedIncome: 25, alternative: 25, sto: 10, fx: 5 };
  localStorage.setItem(CONFIG.STORAGE_KEY_ALLOCATION, JSON.stringify(state.allocation));
  updateAllocationLabels();
  drawAssetDonutChart();
  calculatePortfolioKPIs();
  alert('Optimal Tangency (Max Sharpe) asset weights have been applied to your portfolio cockpit.');
}

function drawFrontierCanvas() {
  const canvas = document.getElementById('frontierCanvas');
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || 620;
  const height = rect.height || 300;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  const paddingLeft = 55;
  const paddingBottom = 40;
  const paddingTop = 20;
  const paddingRight = 30;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const minX = 0, maxX = 25; // Risk sigma (%)
  const minY = 0, maxY = 18; // Expected Return (%)

  function toX(v) { return paddingLeft + ((v - minX) / (maxX - minX)) * chartW; }
  function toY(v) { return height - paddingBottom - ((v - minY) / (maxY - minY)) * chartH; }

  // Draw Gridlines & Axes
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  ctx.font = '10px JetBrains Mono';
  ctx.fillStyle = '#64748b';

  // Horizontal return grid
  for (let r = 0; r <= maxY; r += 3) {
    const y = toY(r);
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(width - paddingRight, y);
    ctx.stroke();
    ctx.fillText(`${r}%`, paddingLeft - 30, y + 3);
  }

  // Vertical risk grid
  for (let s = 0; s <= maxX; s += 5) {
    const x = toX(s);
    ctx.beginPath();
    ctx.moveTo(x, paddingTop);
    ctx.lineTo(x, height - paddingBottom);
    ctx.stroke();
    ctx.fillText(`${s}%`, x - 8, height - paddingBottom + 18);
  }

  // Axis Labels in English
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px Pretendard, sans-serif';
  ctx.fillText('Portfolio Risk (σ, Volatility)', width / 2 - 50, height - 8);

  ctx.save();
  ctx.translate(14, height / 2 + 35);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Expected Return (E[R])', 0, 0);
  ctx.restore();

  // Draw Markowitz Efficient Frontier Curve
  ctx.beginPath();
  const frontierPts = [];
  for (let r = 5.0; r <= 15.0; r += 0.2) {
    const sigma = Math.sqrt(Math.pow((r - 7.5) * 2.2, 2) + 36);
    frontierPts.push({ sigma, r });
  }

  frontierPts.forEach((pt, i) => {
    const x = toX(pt.sigma);
    const y = toY(pt.r);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Tangency Point (Optimal Portfolio)
  const tangencySigma = 11.8;
  const tangencyR = 9.11;
  const tangencyX = toX(tangencySigma);
  const tangencyY = toY(tangencyR);

  // Capital Allocation Line (CAL): Rf through Tangency Portfolio
  const rfX = toX(0);
  const rfY = toY(state.rfRate);

  const calSlope = (tangencyR - state.rfRate) / tangencySigma;
  const maxCalR = state.rfRate + calSlope * 22;
  const endCalX = toX(22);
  const endCalY = toY(maxCalR);

  ctx.beginPath();
  ctx.moveTo(rfX, rfY);
  ctx.lineTo(endCalX, endCalY);
  ctx.strokeStyle = '#3182f6';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Rf Dot
  ctx.beginPath();
  ctx.arc(rfX, rfY, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#3182f6';
  ctx.fill();
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px Pretendard, sans-serif';
  ctx.fillText(`Rf (${state.rfRate}%)`, rfX + 8, rfY + 3);

  // Tangency Dot (Glowing Emerald)
  ctx.beginPath();
  ctx.arc(tangencyX, tangencyY, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#10b981';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(tangencyX, tangencyY, 10, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillText('Optimal Tangency', tangencyX + 12, tangencyY - 6);

  // Update Stats Box
  const sharpe = (tangencyR - state.rfRate) / tangencySigma;
  const optSharpeEl = document.getElementById('optSharpeVal');
  const optReturnEl = document.getElementById('optReturnVal');
  const optRiskEl = document.getElementById('optRiskVal');

  if (optSharpeEl) optSharpeEl.innerText = sharpe.toFixed(2);
  if (optReturnEl) optReturnEl.innerText = `${tangencyR.toFixed(2)}%`;
  if (optRiskEl) optRiskEl.innerText = `${tangencySigma.toFixed(2)}%`;
}

/* ==========================================================================
   7. TAB 3: KMV MERTON STRUCTURAL CREDIT MODEL
   ========================================================================== */

function initKMVModel() {
  calculateKMVModel();
}

function calculateKMVModel() {
  const V = parseFloat(document.getElementById('kmvAssetV').value) || 1000;
  const D = parseFloat(document.getElementById('kmvDebtD').value) || 600;
  const mu = (parseFloat(document.getElementById('kmvMu').value) || 10) / 100;
  const sigma = (parseFloat(document.getElementById('kmvSigma').value) || 20) / 100;
  const T = parseFloat(document.getElementById('kmvT').value) || 1.0;

  // Distance to Default (DD):
  // DD = [ ln(V / D) + (mu - 0.5 * sigma^2) * T ] / (sigma * sqrt(T))
  const numerator = Math.log(V / D) + (mu - 0.5 * Math.pow(sigma, 2)) * T;
  const denominator = sigma * Math.sqrt(T);
  const DD = numerator / (denominator || 1);

  // Expected Default Frequency (EDF) = N(-DD) via standard cumulative normal
  const edf = normalCDF(-DD) * 100;

  // Grade classification
  let rating = 'AAA / Prime Ultra-Low Risk';
  let ratingColor = 'text-emerald';
  if (DD < 1.5) {
    rating = 'CCC / High Default Risk (Distress)';
    ratingColor = 'text-rose';
  } else if (DD < 2.2) {
    rating = 'BB / Speculative Watch';
    ratingColor = 'text-gold';
  } else if (DD < 2.8) {
    rating = 'BBB / Investment Grade (Sweet Spot)';
    ratingColor = 'text-cyan';
  } else if (DD < 3.5) {
    rating = 'A / Upper Investment Grade';
    ratingColor = 'text-blue';
  }

  const outputBox = document.getElementById('kmvOutputBox');
  if (outputBox) {
    outputBox.innerHTML = `
      <div class="kmv-result-row">
        <span class="kmv-result-lbl">Distance-to-Default (DD):</span>
        <strong class="kmv-result-val text-primary-light">${DD.toFixed(3)} &sigma;</strong>
      </div>
      <div class="kmv-result-row">
        <span class="kmv-result-lbl">Expected Default Frequency (EDF):</span>
        <strong class="kmv-result-val text-emerald">${edf < 0.001 ? '< 0.001%' : edf.toFixed(4) + '%'}</strong>
      </div>
      <div class="kmv-result-row">
        <span class="kmv-result-lbl">Implied Credit Grade (Merton):</span>
        <strong class="kmv-result-val ${ratingColor}">${rating}</strong>
      </div>
      <div class="kmv-formula-box">
        <strong>Merton Mathematical Formula:</strong><br>
        <code>DD = [ ln(V/D) + (&mu; - &frac12;&sigma;<sub>V</sub><sup>2</sup>)T ] / ( &sigma;<sub>V</sub>&radic;T )</code><br>
        Live Evaluation: [ ln(${V}/${D}) + (${(mu*100).toFixed(1)}% - &frac12;&times;${(sigma*100).toFixed(1)}%<sup>2</sup>)&times;${T} ] / ${(sigma*Math.sqrt(T)).toFixed(3)}
      </div>
    `;
  }
}

// Standard Cumulative Normal Distribution Approximation (Abramowitz & Stegun)
function normalCDF(x) {
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x) / Math.SQRT2;

  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

  return 0.5 * (1.0 + sign * y);
}

/* ==========================================================================
   8. TAB 3: TRANCHE WATERFALL SIMULATOR
   ========================================================================== */

function initTrancheModel() {
  updateTrancheModel();
}

function onRecoveryRateChange() {
  const slider = document.getElementById('recoveryRateSlider');
  state.tranche.recoveryRate = parseInt(slider.value, 10);
  document.getElementById('recoveryRateVal').innerText = `${state.tranche.recoveryRate}%`;
  updateTrancheModel();
}

function updateTrancheModel() {
  const seniorR = parseFloat(document.getElementById('seniorRatio').value) || 60;
  const seniorY = parseFloat(document.getElementById('seniorYield').value) || 5.0;
  const mezzR = parseFloat(document.getElementById('mezzRatio').value) || 25;
  const mezzY = parseFloat(document.getElementById('mezzYield').value) || 9.0;
  const juniorR = parseFloat(document.getElementById('juniorRatio').value) || 15;
  const juniorY = parseFloat(document.getElementById('juniorYield').value) || 15.0;

  state.tranche = {
    seniorRatio: seniorR,
    seniorYield: seniorY,
    mezzRatio: mezzR,
    mezzYield: mezzY,
    juniorRatio: juniorR,
    juniorYield: juniorY,
    recoveryRate: state.tranche.recoveryRate
  };

  // Waterfall Calculation (US$ 100,000 Scenario)
  const totalPrincipal = 100000;
  const seniorPrincipal = totalPrincipal * (seniorR / 100);
  const mezzPrincipal = totalPrincipal * (mezzR / 100);
  const juniorPrincipal = totalPrincipal * (juniorR / 100);

  const totalRecovered = totalPrincipal * (state.tranche.recoveryRate / 100);

  // Senior Waterfall
  let remaining = totalRecovered;
  const seniorTarget = seniorPrincipal * (1 + seniorY / 100);
  const seniorPayout = Math.min(remaining, seniorTarget);
  remaining = Math.max(0, remaining - seniorPayout);

  // Mezzanine Waterfall
  const mezzTarget = mezzPrincipal * (1 + mezzY / 100);
  const mezzPayout = Math.min(remaining, mezzTarget);
  remaining = Math.max(0, remaining - mezzPayout);

  // Junior Waterfall (residual)
  const juniorPayout = remaining;

  // Realized Returns
  const seniorReturn = ((seniorPayout - seniorPrincipal) / seniorPrincipal) * 100;
  const mezzReturn = ((mezzPayout - mezzPrincipal) / mezzPrincipal) * 100;
  const juniorReturn = ((juniorPayout - juniorPrincipal) / juniorPrincipal) * 100;

  // Update Table
  const tbody = document.getElementById('trancheTableBody');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td><strong class="text-blue">Senior Debt</strong></td>
        <td>US$ ${seniorPrincipal.toLocaleString()}</td>
        <td>US$ ${Math.round(seniorPayout).toLocaleString()}</td>
        <td class="${seniorReturn >= 0 ? 'text-emerald' : 'text-rose'}">${seniorReturn >= 0 ? '+' : ''}${seniorReturn.toFixed(1)}%</td>
        <td>${seniorPayout >= seniorPrincipal ? '🛡️ Capital Preserved' : '⚠️ Principal Impaired'}</td>
      </tr>
      <tr>
        <td><strong class="text-cyan">Mezzanine</strong></td>
        <td>US$ ${mezzPrincipal.toLocaleString()}</td>
        <td>US$ ${Math.round(mezzPayout).toLocaleString()}</td>
        <td class="${mezzReturn >= 0 ? 'text-emerald' : 'text-rose'}">${mezzReturn >= 0 ? '+' : ''}${mezzReturn.toFixed(1)}%</td>
        <td>${mezzPayout >= mezzPrincipal ? '🛡️ Capital Preserved' : '⚠️ Principal Impaired'}</td>
      </tr>
      <tr>
        <td><strong class="text-purple">Junior / Equity</strong></td>
        <td>US$ ${juniorPrincipal.toLocaleString()}</td>
        <td>US$ ${Math.round(juniorPayout).toLocaleString()}</td>
        <td class="${juniorReturn >= 0 ? 'text-emerald' : 'text-rose'}">${juniorReturn >= 0 ? '+' : ''}${juniorReturn.toFixed(1)}%</td>
        <td>${juniorPayout < juniorPrincipal ? '🛑 1st Loss Absorbed' : '🚀 Outperformance Earned'}</td>
      </tr>
    `;
  }

  drawTrancheCanvas({
    senior: seniorPayout / totalPrincipal,
    mezz: mezzPayout / totalPrincipal,
    junior: juniorPayout / totalPrincipal,
    total: totalRecovered / totalPrincipal
  });
}

function drawTrancheCanvas(data) {
  const canvas = document.getElementById('trancheCanvas');
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || 460;
  const height = rect.height || 240;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  if (!data) return;

  const paddingLeft = 40;
  const paddingBottom = 30;
  const barW = 75;
  const maxH = height - 60;

  // 1. Initial Tranches Bar (US$ 100k Par)
  const x1 = paddingLeft + 50;
  let currentY = height - paddingBottom;

  const seniorH = (state.tranche.seniorRatio / 100) * maxH * 0.7;
  const mezzH = (state.tranche.mezzRatio / 100) * maxH * 0.7;
  const juniorH = (state.tranche.juniorRatio / 100) * maxH * 0.7;

  // Senior slice
  currentY -= seniorH;
  ctx.fillStyle = '#3182f6';
  ctx.fillRect(x1, currentY, barW, seniorH);

  // Mezz slice
  currentY -= mezzH;
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(x1, currentY, barW, mezzH);

  // Junior slice
  currentY -= juniorH;
  ctx.fillStyle = '#818cf8';
  ctx.fillRect(x1, currentY, barW, juniorH);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px Pretendard, sans-serif';
  ctx.fillText('Capital at Par (US$ 100k)', x1 - 25, height - 10);

  // 2. Recovered Waterfall Bar
  const x2 = x1 + 160;
  currentY = height - paddingBottom;

  const scale = (maxH * 0.7);
  const sH = data.senior * scale;
  const mH = data.mezz * scale;
  const jH = data.junior * scale;

  currentY -= sH;
  ctx.fillStyle = '#3182f6';
  ctx.fillRect(x2, currentY, barW, sH);

  currentY -= mH;
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(x2, currentY, barW, mH);

  currentY -= jH;
  ctx.fillStyle = '#818cf8';
  ctx.fillRect(x2, currentY, barW, jH);

  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`Recovered (${state.tranche.recoveryRate}%)`, x2 - 15, height - 10);
}

/* ==========================================================================
   9. TAB 3: CASH FLOW, VALUATION, TAX & FX LAB
   ========================================================================== */

function initLabMetrics() {
  calculateLPMetrics();
  calculateDCFMetrics();
  calculateFXMetrics();
  calculateTaxMetrics();
}

function calculateLPMetrics() {
  const paidIn = parseFloat(document.getElementById('lpPaidIn').value) || 100;
  const distributed = parseFloat(document.getElementById('lpDistributed').value) || 28;
  const nav = parseFloat(document.getElementById('lpRemainingNav').value) || 90;
  const years = parseFloat(document.getElementById('lpHoldingPeriod').value) || 3;
  const reinvestRate = (parseFloat(document.getElementById('lpReinvestRate').value) || 3.5) / 100;

  // TVPI / MOIC = (Distributed + NAV) / PaidIn
  const tvpi = (distributed + nav) / (paidIn || 1);
  // DPI = Distributed / PaidIn
  const dpi = distributed / (paidIn || 1);
  // RVPI = NAV / PaidIn
  const rvpi = nav / (paidIn || 1);

  // Simple CAGR IRR = (TVPI)^(1/years) - 1
  const irr = (Math.pow(tvpi, 1 / (years || 1)) - 1) * 100;

  // Simplified MIRR
  const fv = distributed * Math.pow(1 + reinvestRate, years) + nav;
  const mirr = (Math.pow(fv / (paidIn || 1), 1 / (years || 1)) - 1) * 100;

  document.getElementById('metricMoic').innerText = `${tvpi.toFixed(2)}x`;
  document.getElementById('metricDpi').innerText = `${dpi.toFixed(2)}x`;
  document.getElementById('metricRvpi').innerText = `${rvpi.toFixed(2)}x`;
  document.getElementById('metricIrr').innerText = `${irr.toFixed(2)}%`;
  document.getElementById('metricMirr').innerText = `${mirr.toFixed(2)}%`;
}

function calculateDCFMetrics() {
  const fcf1 = parseFloat(document.getElementById('dcfFcf1').value) || 10;
  const discountRate = (parseFloat(document.getElementById('dcfDiscountRate').value) || 10) / 100;
  const terminalGrowth = (parseFloat(document.getElementById('dcfTerminalGrowth').value) || 2) / 100;
  const currentVal = parseFloat(document.getElementById('dcfCurrentVal').value) || 100;

  // Gordon Growth DCF = FCF1 / (WACC - g)
  let dcfVal = 0;
  if (discountRate > terminalGrowth) {
    dcfVal = fcf1 / (discountRate - terminalGrowth);
  }

  // Reverse DCF Implied Growth: g = WACC - (FCF1 / EnterpriseValue)
  const impliedG = (discountRate - (fcf1 / (currentVal || 1))) * 100;

  document.getElementById('dcfOutputVal').innerText = `US$ ${dcfVal.toFixed(2)}M`;
  document.getElementById('dcfReverseGrowth').innerText = `${impliedG.toFixed(2)}%`;
}

function calculateFXMetrics() {
  const amount = parseFloat(document.getElementById('fxForeignAmount').value) || 100000;
  const rate = parseFloat(document.getElementById('fxExchangeRate').value) || 1.08;
  const hedgeBp = parseFloat(document.getElementById('fxHedgeCostBp').value) || 25;
  const feeBp = parseFloat(document.getElementById('fxExchangeFeeBp').value) || 15;

  const grossUsd = amount * rate;
  const totalCostPct = (hedgeBp + feeBp) / 10000;
  const totalCostUsd = grossUsd * totalCostPct;
  const netUsd = grossUsd - totalCostUsd;

  document.getElementById('fxConvertedKrw').innerText = `US$ ${Math.round(grossUsd).toLocaleString()}`;
  document.getElementById('fxTotalCostKrw').innerText = `US$ ${Math.round(totalCostUsd).toLocaleString()}`;
  document.getElementById('fxNetKrw').innerText = `US$ ${Math.round(netUsd).toLocaleString()}`;
}

function calculateTaxMetrics() {
  const base = parseFloat(document.getElementById('taxTaxableBase').value) || 100000;
  const rate = (parseFloat(document.getElementById('taxRatePercent').value) || 20) / 100;

  const tax = base * rate;
  const net = base - tax;

  document.getElementById('taxEstTax').innerText = `US$ ${Math.round(tax).toLocaleString()}`;
  document.getElementById('taxEstNet').innerText = `US$ ${Math.round(net).toLocaleString()}`;
}

/* ==========================================================================
   10. TAB 3: ADVANCED ZK-ML & DYNAMIC LTV CONTRACTION SIMULATOR
   ========================================================================== */

function initZkmlSimulator() {
  calculateHealthFactor();
}

function calculateHealthFactor() {
  const collateral = parseFloat(document.getElementById('hfCollateralVal').value) || 120;
  const debt = parseFloat(document.getElementById('hfTotalDebt').value) || 80;
  const baseLtv = parseFloat(document.getElementById('hfBaseLtv').value) || 70;

  document.getElementById('dynamicLtvVal').innerText = `${baseLtv}%`;

  // HF = (Collateral * LTV) / Debt
  const hf = (collateral * (baseLtv / 100)) / (debt || 1);
  const hfEl = document.getElementById('healthFactorVal');
  const badgeEl = document.getElementById('marginCallBadge');

  if (hfEl) hfEl.innerText = hf.toFixed(2);

  if (badgeEl) {
    if (hf >= 1.0) {
      badgeEl.innerText = 'Safe';
      badgeEl.className = 'hf-badge';
      if (hfEl) hfEl.className = 'hf-num text-emerald';
    } else {
      badgeEl.innerText = '⚠️ Margin Call Active';
      badgeEl.className = 'hf-badge danger';
      if (hfEl) hfEl.className = 'hf-num text-rose';
    }
  }
}

/* ==========================================================================
   11. TAB 4: APP-IN-TOSS PAYMENT SIMULATION
   ========================================================================== */

function simulateTossPayment() {
  alert('Toss Mini-App Demo: TOSSKRW Gasless Settlement and ERC-3643 Smart Contract Signature simulated successfully.');
}

/* ==========================================================================
   12. MODALS (API, KYC, QUANT, AI DRAWER)
   ========================================================================== */

function openApiModal() {
  const modal = document.getElementById('apiModal');
  if (modal) modal.style.display = 'flex';
  const input = document.getElementById('inputApiKey');
  if (input) input.value = state.apiKey;
}

function closeApiModal() {
  const modal = document.getElementById('apiModal');
  if (modal) modal.style.display = 'none';
  const feedback = document.getElementById('apiTestFeedback');
  if (feedback) feedback.style.display = 'none';
}

function openKycModal() {
  const modal = document.getElementById('kycModal');
  if (modal) modal.style.display = 'flex';
}

function closeKycModal() {
  const modal = document.getElementById('kycModal');
  if (modal) modal.style.display = 'none';
}

function openQuantDetailModal() {
  const modal = document.getElementById('quantDetailModal');
  if (modal) modal.style.display = 'flex';
}

function closeQuantDetailModal() {
  const modal = document.getElementById('quantDetailModal');
  if (modal) modal.style.display = 'none';
}

function openAiChatModal() {
  const modal = document.getElementById('aiDrawerModal');
  if (modal) modal.style.display = 'flex';
  const input = document.getElementById('drawerChatInput');
  if (input) setTimeout(() => input.focus(), 100);
}

function closeAiChatModal() {
  const modal = document.getElementById('aiDrawerModal');
  if (modal) modal.style.display = 'none';
}

function toggleApiKeyVisibility() {
  const input = document.getElementById('inputApiKey');
  const btn = document.getElementById('btnEye');
  if (!input || !btn) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerText = '🔒';
  } else {
    input.type = 'password';
    btn.innerText = '👁️';
  }
}

function saveApiKey() {
  const input = document.getElementById('inputApiKey');
  if (!input) return;
  const key = input.value.trim();
  if (!key) {
    alert('Please enter a valid API Key.');
    return;
  }
  state.apiKey = key;
  localStorage.setItem(CONFIG.STORAGE_KEY_API, key);
  updateApiKeyBadge(true);
  closeApiModal();
  alert('Gemini 3.5 Flash Lite API Key securely saved in your browser localStorage.');
}

function clearApiKey() {
  if (confirm('Are you sure you want to reset your API key to default?')) {
    localStorage.removeItem(CONFIG.STORAGE_KEY_API);
    state.apiKey = CONFIG.DEFAULT_API_KEY;
    document.getElementById('inputApiKey').value = '';
    updateApiKeyBadge(true); // default fallback key remains
    alert('Restored to pre-configured demo API key.');
  }
}

/* ==========================================================================
   13. GOOGLE GEMINI 3.5 FLASH LITE (v1beta) API CLIENT
   ========================================================================== */

function initGeminiClient() {
  updateApiKeyBadge(Boolean(state.apiKey));
}

function updateApiKeyBadge(isConnected) {
  const badge = document.getElementById('apiKeyStatusBadge');
  if (!badge) return;
  if (isConnected) {
    badge.className = 'api-status-badge status-connected';
    badge.innerHTML = '<span class="status-indicator"></span><span class="status-label">API Connected</span>';
  } else {
    badge.className = 'api-status-badge status-disconnected';
    badge.innerHTML = '<span class="status-indicator"></span><span class="status-label">API Key Required</span>';
  }
}

async function testApiKey() {
  const input = document.getElementById('inputApiKey');
  const feedback = document.getElementById('apiTestFeedback');
  const btn = document.getElementById('btnTestApi');

  const key = input ? input.value.trim() : state.apiKey;
  if (!key) {
    feedback.className = 'test-feedback error';
    feedback.innerText = 'Please enter an API Key.';
    feedback.style.display = 'block';
    return;
  }

  btn.disabled = true;
  feedback.className = 'test-feedback';
  feedback.innerText = 'Testing Google Gemini 3.5 Flash Lite v1beta connection...';
  feedback.style.display = 'block';

  try {
    const url = `https://generativelanguage.googleapis.com/${CONFIG.API_VERSION}/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${encodeURIComponent(key)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Ping connection test. Reply with exactly: "OK".' }] }]
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    feedback.className = 'test-feedback success';
    feedback.innerHTML = `<strong>Connection Successful!</strong> Model response: <code>${reply.trim()}</code>`;
  } catch (err) {
    feedback.className = 'test-feedback error';
    feedback.innerHTML = `<strong>Connection Failed:</strong> ${err.message}`;
  } finally {
    btn.disabled = false;
  }
}

function buildSystemInstruction() {
  return `You are Jamie (JaeMin) Song, Founder, CEO, and Chief Portfolio Manager of 'FluxifyJME Inc. (The Market Liquidity Providing Platform)'.

[Founder & Consultant Profile]
• Jamie (JaeMin) Song
• Cross-border PE/VC | Global Macro & Event-Driven Hedge Fund Manager | Chief Portfolio Manager
• Alternative Investment | PE/HF | Digital Asset | RWA ⊃ STO
• The University of Newcastle (Australia), Faculty of Business & Law
• Professional Credentials: Certified Research Analyst (CRA), Certified Investment Manager (CIM), IR Consultant, ISO 9001 & 14001 Lead Auditor, KBI Digital Finance DT, AI & Blockchain Specialist, Maekyung TEST (High Honors), Securities Advisory Broker, Variable Insurance License, ITT Business English Interpretation (1st Grade) & Translation (1st Grade).
• Core Expertise: Cross-border private equity (PE), venture capital (VC), accelerator (AC) due diligence, startup valuation (DCF, Reverse DCF, RIM, LBO), strategic FP&A, fund formation, governance, and liquidation.

[FluxifyJME Business Architecture & Philosophy]
• Corporate Entity: FluxifyJME Inc. (Business Registration: 637-09-03030).
• Naming Philosophy: Flux (Continuous change, liquidity rate, calculus) + Flex (Capital liquidity generation) + Finance (Fi) + Jamie (Jme) = "Creating Your Own Financial Flow".
• Mission: Translating Traditional Finance (TradFi) quantitative valuation models into Web3 smart contracts to overcome liquidity constraints in private alternative markets ("Less but better").
• 5-Layer DeFi Architecture: Settlement (L1/L2) -> Asset (ERC-3643/1400) -> Protocol (Smart Waterfall, Catch-up) -> Application (Web/App) -> Aggregation (Cross-protocol Orderbook & NAV).
• 3-Tier Revenue Model: Tier 1 Tokenization (1.0~1.5%) & AMM Trading Fees (0.1~0.3%); Tier 2 Unstructured AI Valuation SaaS Subscriptions; Tier 3 Proprietary Algorithmic Fund Management (1~2%) + Carried Interest (10~20%).
• Strategic M&A Two-Track Roadmap: Institutional B2B validation ($200M AUM target) followed by App-in-Toss mini-app deployment (onboarding 30M+ users with TOSSKRW gasless settlement), leading to strategic M&A by Viva Republica (Toss).
• Risk Engineering: Cross-Silo Federated Learning (VFL/HFL, SecAgg, DP, HE), ZK-ML on-chain risk bridge (RiskModelRegistry.sol, DynamicPricingEngine.sol, RWAVault.sol), dynamic LTV contraction, Health Factor (HF) monitoring, and Dutch Auction liquidation.
• Currency Standards: All monetary figures are in US$ with baseline conversion applied at US$ 1 = KRW 1,400.

[Strict Confidentiality & Compliance Guidelines]
• Hana Capital advisory track record is external consulting executed by FluxifyJME. Client internal AUM, exact portfolio figures, and proprietary returns are strictly confidential and must never be disclosed or represented as FluxifyJME's own funds.
• Answer strictly in professional, articulate, institutional-grade English with standard financial engineering notation. Use Markdown and bullet points for structural clarity.`;
}

async function callGeminiAPI(userPrompt) {
  const key = state.apiKey;
  if (!key) throw new Error('API Key is not configured.');

  const url = `https://generativelanguage.googleapis.com/${CONFIG.API_VERSION}/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${encodeURIComponent(key)}`;

  const bodyData = {
    system_instruction: {
      parts: [{ text: buildSystemInstruction() }]
    },
    contents: [
      ...state.chatHistory.slice(-6).map(item => ({
        role: item.role === 'user' ? 'user' : 'model',
        parts: [{ text: item.text }]
      })),
      {
        role: 'user',
        parts: [{ text: userPrompt }]
      }
    ],
    generationConfig: {
      temperature: 0.4,
      topP: 0.95,
      maxOutputTokens: 2048
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyData)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Received empty text response from Gemini.');
  return text;
}

/* ==========================================================================
   14. AI DRAWER CONVERSATION & PRESET PROMPTS
   ========================================================================== */

function sendDrawerPreset(num) {
  const prompts = {
    1: 'Analyze institutional LP Fund portfolio governance, IPS structuring, and Pacing models for a US$ 500M+ alternative asset portfolio.',
    2: 'Explain smart contract waterfall distribution and automated catch-up logic to defend LPs against GP capital call and sub-line distortions.',
    3: 'Elaborate on the App-in-Toss distribution strategy and strategic M&A exit roadmap targeting Viva Republica (Toss superapp).',
    4: 'Detail cross-border macro hedging strategies and currency mismatch controls for global private debt and secondary assets in 2026.',
    5: 'Walk through the KMV Merton structural credit risk model calculating Distance-to-Default (DD) and Expected Default Frequency (EDF).',
    6: 'Explain Federated Learning (FL) and ZK-SNARKs-based ZK-ML risk bridging for dynamic LTV auto-contraction and Dutch auction liquidations.'
  };

  const text = prompts[num];
  if (text) {
    const input = document.getElementById('drawerChatInput');
    if (input) input.value = text;
    handleDrawerChatSubmit(new Event('submit'));
  }
}

function consultMacroStrategy() {
  openAiChatModal();
  sendDrawerPreset(4);
}

function handleDrawerKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleDrawerChatSubmit(e);
  }
}

async function handleDrawerChatSubmit(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('drawerChatInput');
  const btn = document.getElementById('drawerSendBtn');
  const userText = input ? input.value.trim() : '';

  if (!userText) return;

  appendDrawerChatMessage('user', userText);
  if (input) input.value = '';

  state.chatHistory.push({ role: 'user', text: userText });

  const loadingId = appendDrawerLoadingMessage();
  if (btn) btn.disabled = true;

  try {
    const aiReply = await callGeminiAPI(userText);
    removeDrawerLoadingMessage(loadingId);
    appendDrawerChatMessage('ai', aiReply);
    state.chatHistory.push({ role: 'model', text: aiReply });
  } catch (err) {
    removeDrawerLoadingMessage(loadingId);
    appendDrawerChatMessage('ai', `⚠️ Advisory generation error: ${err.message}\nPlease verify that your Gemini API Key is registered in [API Settings].`);
  } finally {
    if (btn) btn.disabled = false;
  }
}

function appendDrawerChatMessage(role, text) {
  const container = document.getElementById('drawerChatMessages');
  if (!container) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg msg-${role}`;

  const avatar = role === 'ai' ? 'JS' : 'You';
  const senderTitle = role === 'ai' ? 'FluxifyJME AI Advisory · Jamie Song Persona' : 'Institutional Investor';

  msgDiv.innerHTML = `
    <div class="msg-avatar">${avatar}</div>
    <div class="msg-body">
      <div class="msg-sender">
        <strong>${role === 'ai' ? 'FluxifyJME Chief Advisor' : 'Investor (You)'}</strong>
        <span class="sender-title">${senderTitle}</span>
      </div>
      <div class="msg-text">${formatMarkdown(text)}</div>
    </div>
  `;

  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function appendDrawerLoadingMessage() {
  const container = document.getElementById('drawerChatMessages');
  if (!container) return null;

  const id = 'loading_' + Date.now();
  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-msg msg-ai';
  msgDiv.id = id;

  msgDiv.innerHTML = `
    <div class="msg-avatar">JS</div>
    <div class="msg-body">
      <div class="msg-sender">
        <strong>FluxifyJME AI Advisory</strong>
        <span class="sender-title">Synthesizing quantitative strategy...</span>
      </div>
      <div class="msg-text">
        <span class="pulse-indicator"></span> <em>Gemini 3.5 Flash Lite is evaluating financial models...</em>
      </div>
    </div>
  `;

  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeDrawerLoadingMessage(id) {
  if (!id) return;
  const el = document.getElementById(id);
  if (el) el.remove();
}

function clearDrawerChat() {
  if (confirm('Do you wish to clear conversation history?')) {
    state.chatHistory = [];
    const container = document.getElementById('drawerChatMessages');
    if (container) {
      container.innerHTML = `
        <div class="chat-msg msg-ai">
          <div class="msg-avatar">JS</div>
          <div class="msg-body">
            <div class="msg-sender">
              <strong>FluxifyJME AI Advisory</strong>
              <span class="sender-title">Cross-border PE/VC · CRA · CIM · Strategic FP&amp;A · FluxifyJME</span>
            </div>
            <div class="msg-text">
              <p>Conversation history has been cleared. Inquire regarding alternative deal evaluation, mezzanine tranche structuring, KMV credit modeling, or our App-in-Toss M&amp;A roadmap.</p>
            </div>
          </div>
        </div>
      `;
    }
  }
}

function formatMarkdown(text) {
  if (!text) return '';
  let html = escapeHtml(text);

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Headings
  html = html.replace(/^### (.*$)/gim, '<h4 style="margin: 8px 0 4px; color: var(--text-primary);">$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 style="margin: 10px 0 6px; color: var(--text-primary);">$1</h3>');
  // Unordered list items
  html = html.replace(/^\s*[-•]\s+(.*$)/gim, '<li style="margin-left: 16px;">$1</li>');
  // Line breaks
  html = html.replace(/\n\n/g, '<br><br>');
  html = html.replace(/\n/g, '<br>');

  return html;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function exportConsultingReport() {
  window.print();
}

function renderAllCanvases() {
  drawNavHistoryCanvas();
  drawAssetDonutChart();
  drawFrontierCanvas();
  drawTrancheCanvas();
}
