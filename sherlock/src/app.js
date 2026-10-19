import {
  PRESET_PROGRAMS,
  compileAndRunSherlock,
  buildStepState,
} from './engine/sherlockEngine.js';
import { SherlockStage } from './stage/SherlockStage.js';
import { getQuinelingTelemetry } from './designers/designer8_quineling.js';

const PRESET_EDITORIAL_META = {
  factorial: { title: 'Factorial', sub: 'fact(4)' },
  list_fold: { title: 'List sum', sub: 'sum_list([5, 8, 3])' },
  tree_fold: { title: 'Tree sum', sub: 'sum_tree(branch(…))' },
  mutual_even_odd: { title: 'Mutual recursion', sub: 'is_even(4)' },
  lexical_let: { title: 'Lexical let', sub: 'cube_plus(12, 272)' },
  checked_underflow: { title: 'Checked arithmetic', sub: 'clamp_sub(3, 9)' },
  stack_overflow: { title: 'Frame limit', sub: 'dive(6) · limit 5' },
  fuel_exhaustion: { title: 'Fuel limit', sub: 'count_down(5) · fuel 14' },
};

const state = {
  activePresetId: 'factorial',
  source: PRESET_PROGRAMS[0].source,
  fuel: PRESET_PROGRAMS[0].defaultFuel,
  stackLimit: PRESET_PROGRAMS[0].defaultStackLimit,
  trace: null,
  playhead: 0,
  playing: true,
  speed: 1.0,
  lastTick: performance.now(),
  lastRenderedStepIdx: -1,
  lastRingsHtml: '',
  lastFramesHtml: '',
  lastCallsHtml: '',
  lastActiveLine: -1,
  lastLineCount: -1,
  lastTransitionHtml: '',
  lastQdlMorphHtml: '',
  lastFramesTelemetryHtml: '',
  lastCallsTelemetryHtml: '',
  lastFuelTelemetryHtml: '',
  requestSeq: 0,
  appliedRequestSeq: 0,
  rafId: 0,
  disposed: false,
};

const CONTROL_STRIP_SECTORS = [
  { key: 'Eval', badge: 'EVAL', title: 'Control::Eval(expr)' },
  { key: 'Push', badge: 'PUSH', title: 'Control::Push(frame, next)' },
  { key: 'Return', badge: 'RET', title: 'Control::Return(val)' },
  { key: 'Invoke', badge: 'INVOKE', title: 'Control::Invoke(name, args)' },
  { key: 'Enter', badge: 'ENTER', title: 'Control::Enter(func, args)' },
  { key: 'Bound', badge: 'BOUND', title: 'Control::Bound(func, env)' },
  { key: 'Cases', badge: 'CASES', title: 'Control::Cases(scrutinee, arms)' },
  { key: 'CaseResult', badge: 'MATCH', title: 'Control::CaseResult(matched)' },
  { key: 'PrimitiveResult', badge: 'PRIM', title: 'Control::PrimitiveResult(val)' },
  { key: 'Error', badge: 'ERR', title: 'Control::Error(code)' },
];

const els = {
  presetStrip: document.getElementById('presetStrip'),
  stagePresetStrip: document.getElementById('stagePresetStrip'),
  presetDescription: document.getElementById('presetDescription'),
  sourceEditor: document.getElementById('sourceEditor'),
  editorLineNumbers: document.getElementById('editorLineNumbers'),
  compileRunBtn: document.getElementById('compileRunBtn'),
  compileErrorBanner: document.getElementById('compileErrorBanner'),
  fuelSlider: document.getElementById('fuelSlider'),
  fuelValLabel: document.getElementById('fuelValLabel'),
  stackSlider: document.getElementById('stackSlider'),
  stackValLabel: document.getElementById('stackValLabel'),
  activeAstBadge: document.getElementById('activeAstBadge'),
  activeSpanBadge: document.getElementById('activeSpanBadge'),
  stageStatusBadge: document.getElementById('stageStatusBadge'),
  hudControlSummary: document.getElementById('hudControlSummary'),
  stageCaptionSep: document.getElementById('stageCaptionSep'),
  recursionEquationText: document.getElementById('recursionEquationText'),
  stageInspectText: document.getElementById('stageInspectText'),
  playPauseBtn: document.getElementById('playPauseBtn'),
  stepPrevBtn: document.getElementById('stepPrevBtn'),
  stepNextBtn: document.getElementById('stepNextBtn'),
  resetStepBtn: document.getElementById('resetStepBtn'),
  scrubberStepLabel: document.getElementById('scrubberStepLabel'),
  stepScrubber: document.getElementById('stepScrubber'),
  speedSelect: document.getElementById('speedSelect'),
  cameraLensBar: document.getElementById('cameraLensBar'),
  touchZoomInBtn: document.getElementById('touchZoomInBtn'),
  touchZoomOutBtn: document.getElementById('touchZoomOutBtn'),
  touchResetViewBtn: document.getElementById('touchResetViewBtn'),
  touchBoreGroup: document.getElementById('touchBoreGroup'),
  touchBoreUpBtn: document.getElementById('touchBoreUpBtn'),
  touchBoreDownBtn: document.getElementById('touchBoreDownBtn'),
  telemetryRuleBadge: document.getElementById('telemetryRuleBadge'),
  telemetryStatus: document.getElementById('telemetryStatus'),
  telemetryTransition: document.getElementById('telemetryTransition'),
  telemetryControl: document.getElementById('telemetryControl'),
  telemetryQdlMorph: document.getElementById('telemetryQdlMorph'),
  telemetryFrames: document.getElementById('telemetryFrames'),
  telemetryCalls: document.getElementById('telemetryCalls'),
  telemetryFuel: document.getElementById('telemetryFuel'),
  ringsSummaryBadge: document.getElementById('ringsSummaryBadge'),
  sixRingsGauge: document.getElementById('sixRingsGauge'),
  frameStackCount: document.getElementById('frameStackCount'),
  frameStackList: document.getElementById('frameStackList'),
  recursionModePill: document.getElementById('recursionModePill'),
  recursionCallsTrack: document.getElementById('recursionCallsTrack'),
  canvas: document.getElementById('sherlockCanvas'),
};

function getDefaultStageHint(preset = stage?.activePreset) {
  if (typeof preset === 'string' && preset.startsWith('interior')) {
    return 'Drag to look · Pinch or ↑/↓ to rise/descend · 2-finger pan · Double-tap reset';
  }
  return 'Drag to orbit · Pinch to zoom · 2-finger pan · Double-tap reset';
}

const stage = new SherlockStage(els.canvas, {
  onInspect: (meta) => {
    if (!els.stageInspectText) return;
    if (!meta) {
      els.stageInspectText.textContent = getDefaultStageHint(stage?.activePreset);
      return;
    }
    const title = meta.title || meta.id || 'Die component';
    const sub = meta.subtitle || (typeof meta.details === 'string' ? meta.details : '');
    els.stageInspectText.textContent = sub ? `${title} — ${sub}` : title;
  },
});
if (typeof window !== 'undefined') {
  window.__sherlockStage = stage;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatAlgebraicText(str) {
  return String(str || '')
    .replace(/\[hole\]/g, '[?]')
    .replace(/\bMul\b/g, '×')
    .replace(/\bAdd\b/g, '+')
    .replace(/\bSub\b/g, '−')
    .replace(/\bLt\b/g, '<')
    .replace(/\bEq\b/g, '==')
    .replace(/\s*\*\s*/g, ' × ')
    .replace(/\s*-\s*/g, ' − ');
}

function formatShortEnvHint(fr, fallbackEnvHint = '') {
  if (fr && Array.isArray(fr.bindings)) {
    if (fr.bindings.length === 0) return 'root';
    return fr.bindings
      .slice(0, 2)
      .map((b) => `${b.name}=${b.valueSummary}`)
      .join(', ');
  }
  return fallbackEnvHint;
}

function getFrameSlotMeta(fr, fallbackEnvHint = '') {
  if (!fr) {
    return {
      cls: 'slot-idle',
      itemCls: '',
      family: 'IDLE',
      readout: '—',
      tooltip: 'Idle half-ring arc',
    };
  }

  const rawLabel = String(fr.label || '');
  const normalizedOp = formatAlgebraicText(rawLabel);
  const envHint = formatShortEnvHint(fr, fallbackEnvHint);
  const envSuffix = envHint ? ` (${envHint})` : '';

  if (fr.kind === 'Return') {
    const retType = rawLabel.replace(/^return\s*:\s*/i, '').trim() || 'Val';
    return {
      cls: 'slot-env slot-env-return',
      itemCls: 'is-env',
      family: 'ENV',
      readout: `RET:${retType}${envSuffix}`,
      tooltip: `ENV · Return(${retType})${envSuffix} — Teal #0d9488`,
    };
  }

  if (fr.kind === 'Scope') {
    const bCount = fr.bindings ? fr.bindings.length : 0;
    const scopeBase = bCount > 0 ? `SCOPE(${bCount})` : 'SCOPE';
    return {
      cls: 'slot-env slot-env-scope',
      itemCls: 'is-env is-env-scope',
      family: 'ENV',
      readout: `${scopeBase}${envSuffix}`,
      tooltip: `ENV · Scope (${bCount} bindings)${envSuffix} — Sky-Cyan #0284c7`,
    };
  }

  if (fr.kind === 'Right') {
    return {
      cls: 'slot-op slot-op-right',
      itemCls: 'is-operand is-op is-op-right',
      family: 'OP·R',
      readout: `${normalizedOp}${envSuffix}`,
      tooltip: `OP · Right(${normalizedOp})${envSuffix} — Gold #b45309 (Rule 149 in-place rewrite)`,
    };
  }

  if (fr.kind === 'Left') {
    return {
      cls: 'slot-op slot-op-left',
      itemCls: 'is-operand is-op',
      family: 'OP·L',
      readout: `${normalizedOp}${envSuffix}`,
      tooltip: `OP · Left(${normalizedOp})${envSuffix} — Amber #d97706 (Rule 117 push)`,
    };
  }

  if (fr.kind === 'Args') {
    const shortArgs = formatAlgebraicText(rawLabel.replace(/\s+args\)/i, ')'));
    return {
      cls: 'slot-op slot-op-left',
      itemCls: 'is-operand is-op',
      family: 'OP',
      readout: `${shortArgs}${envSuffix}`,
      tooltip: `OP · Args(${rawLabel})${envSuffix} — Amber #d97706`,
    };
  }

  if (fr.kind === 'Unary') {
    return {
      cls: 'slot-op slot-op-left',
      itemCls: 'is-operand is-op',
      family: 'OP',
      readout: `${normalizedOp}${envSuffix}`,
      tooltip: `OP · Unary(${normalizedOp})${envSuffix} — Amber #d97706`,
    };
  }

  if (fr.kind === 'If') {
    return {
      cls: 'slot-gate',
      itemCls: 'is-gate',
      family: 'GATE',
      readout: `IF [?]${envSuffix}`,
      tooltip: `GATE · If (${fr.detail || 'branch'})${envSuffix}`,
    };
  }

  if (fr.kind === 'Match') {
    return {
      cls: 'slot-gate',
      itemCls: 'is-gate',
      family: 'GATE',
      readout: `MATCH [?]${envSuffix}`,
      tooltip: `GATE · ${rawLabel}${envSuffix}`,
    };
  }

  if (fr.kind === 'Let') {
    const varName = rawLabel.replace(/^let\s+/i, '').replace(/\s*=.*$/, '').trim() || 'x';
    return {
      cls: 'slot-gate',
      itemCls: 'is-gate',
      family: 'GATE',
      readout: `LET ${varName}=[?]${envSuffix}`,
      tooltip: `GATE · Let ${varName} = [?]${envSuffix}`,
    };
  }

  return {
    cls: 'slot-op slot-op-left',
    itemCls: 'is-operand is-op',
    family: 'OP',
    readout: normalizedOp || fr.kind,
    tooltip: `${fr.kind}: ${normalizedOp}`,
  };
}

function formatControlDisplay(step) {
  if (!step) return 'Ready';
  const raw = step.controlSummary || '';
  const kind = step.after?.control?.kind || step.controlKind || 'Eval';
  if (
    kind === 'Eval' &&
    !raw.startsWith('Eval(') &&
    !raw.startsWith('Done(') &&
    !raw.startsWith('Rejected') &&
    !raw.startsWith('Exhausted')
  ) {
    return `Eval(${formatAlgebraicText(raw)})`;
  }
  return formatAlgebraicText(raw);
}

function formatOutcomePill(outcome) {
  if (!outcome) return 'Ready';
  if (outcome.kind === 'Done') {
    const val = outcome.summary || '';
    return val.startsWith('Done') ? val : `Done (${val})`;
  }
  if (outcome.kind === 'Rejected') {
    return outcome.code !== undefined ? `Rejected (error ${outcome.code})` : outcome.summary || 'Rejected';
  }
  if (outcome.kind === 'Exhausted') {
    return 'Exhausted';
  }
  return outcome.summary || outcome.kind || 'Ready';
}

function selectPreset(preset) {
  if (!preset) return;
  state.activePresetId = preset.id;
  state.source = preset.source;
  state.fuel = preset.defaultFuel;
  state.stackLimit = preset.defaultStackLimit;
  els.sourceEditor.value = state.source;
  els.fuelSlider.value = String(state.fuel);
  els.fuelValLabel.textContent = String(state.fuel);
  els.stackSlider.value = String(state.stackLimit);
  els.stackValLabel.textContent = String(state.stackLimit);
  els.presetDescription.textContent = preset.description;
  renderPresets();
  executeCurrentSource(true);
}

let presetButtonsMap = null;
let stagePresetButtonsMap = null;
const cameraLensButtons = els.cameraLensBar
  ? Array.from(els.cameraLensBar.querySelectorAll('button'))
  : [];
let editorLineSpans = [];

function scrollActivePillIntoStrip(container, btn) {
  if (!container || !btn || container.scrollWidth <= container.clientWidth) return;
  const targetLeft =
    btn.offsetLeft - container.clientWidth * 0.5 + btn.offsetWidth * 0.5;
  container.scrollTo({
    left: Math.max(0, targetLeft),
    behavior: 'smooth',
  });
}

function renderPresets() {
  if (!presetButtonsMap) {
    presetButtonsMap = new Map();
    stagePresetButtonsMap = new Map();
    if (els.presetStrip) els.presetStrip.innerHTML = '';
    if (els.stagePresetStrip) els.stagePresetStrip.innerHTML = '';
    for (const p of PRESET_PROGRAMS) {
      const meta = PRESET_EDITORIAL_META[p.id] || { title: p.title, sub: p.badge };
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'preset-btn';
      btn.dataset.presetId = p.id;
      btn.innerHTML = `<span>${escapeHtml(meta.title)}</span><small>${escapeHtml(meta.sub)}</small>`;
      btn.addEventListener('click', () => selectPreset(p));
      if (els.presetStrip) els.presetStrip.appendChild(btn);
      presetButtonsMap.set(p.id, btn);

      if (els.stagePresetStrip) {
        const sBtn = document.createElement('button');
        sBtn.type = 'button';
        sBtn.className = 'preset-btn preset-chip';
        sBtn.dataset.presetId = p.id;
        sBtn.innerHTML = `<span class="chip-title">${escapeHtml(meta.title)}</span><small class="chip-sub">${escapeHtml(meta.sub)}</small>`;
        sBtn.addEventListener('click', () => selectPreset(p));
        els.stagePresetStrip.appendChild(sBtn);
        stagePresetButtonsMap.set(p.id, sBtn);
      }
    }
  }
  for (const [id, btn] of presetButtonsMap.entries()) {
    const isActive = id === state.activePresetId;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  }
  if (stagePresetButtonsMap) {
    for (const [id, sBtn] of stagePresetButtonsMap.entries()) {
      const isActive = id === state.activePresetId;
      sBtn.classList.toggle('active', isActive);
      sBtn.setAttribute('aria-pressed', String(isActive));
      if (isActive) {
        scrollActivePillIntoStrip(els.stagePresetStrip, sBtn);
      }
    }
  }
  const activePreset = PRESET_PROGRAMS.find((p) => p.id === state.activePresetId);
  if (activePreset && els.presetDescription) {
    els.presetDescription.textContent = activePreset.description;
  }
}

function updateCameraLensButtons(activePreset) {
  for (let i = 0; i < cameraLensButtons.length; i++) {
    const btn = cameraLensButtons[i];
    const isActive = btn.dataset.preset === activePreset;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
    if (isActive) {
      scrollActivePillIntoStrip(els.cameraLensBar, btn);
    }
  }
  if (els.touchBoreGroup) {
    const isInterior = typeof activePreset === 'string' && activePreset.startsWith('interior');
    els.touchBoreGroup.classList.toggle('hidden', !isInterior);
  }
  if (els.stageInspectText) {
    els.stageInspectText.textContent = getDefaultStageHint(activePreset);
  }
}

function updateEditorLineNumbers(activeLine = 1) {
  const val = els.sourceEditor.value || '';
  let lines = 1;
  for (let i = 0; i < val.length; i++) {
    if (val.charCodeAt(i) === 10) lines++;
  }
  if (lines !== state.lastLineCount) {
    state.lastLineCount = lines;
    state.lastActiveLine = -1;
    els.editorLineNumbers.textContent = '';
    editorLineSpans = new Array(lines);
    const frag = document.createDocumentFragment();
    for (let i = 1; i <= lines; i++) {
      const sp = document.createElement('span');
      sp.textContent = `${i}\n`;
      editorLineSpans[i - 1] = sp;
      frag.appendChild(sp);
    }
    els.editorLineNumbers.appendChild(frag);
  }
  if (activeLine !== state.lastActiveLine) {
    if (state.lastActiveLine >= 1 && editorLineSpans[state.lastActiveLine - 1]) {
      editorLineSpans[state.lastActiveLine - 1].classList.remove('active-line');
    }
    if (activeLine >= 1 && editorLineSpans[activeLine - 1]) {
      editorLineSpans[activeLine - 1].classList.add('active-line');
    }
    state.lastActiveLine = activeLine;
  }
}

async function executeCurrentSource(resetPlayhead = true) {
  const reqId = ++state.requestSeq;
  const candidateSource = els.sourceEditor.value;
  const res = await compileAndRunSherlock(candidateSource, {
    fuel: state.fuel,
    stackLimit: state.stackLimit,
    sliceWidth: 4,
    preferRust: true,
  });

  if (reqId < state.appliedRequestSeq) {
    return;
  }
  state.appliedRequestSeq = reqId;

  if (!res.ok) {
    els.compileErrorBanner.textContent = res.error || 'Compilation error';
    els.compileErrorBanner.classList.remove('hidden');
    return;
  }

  state.source = candidateSource;
  els.compileErrorBanner.classList.add('hidden');
  state.trace = res;

  const maxStep = Math.max(0, res.steps.length - 1);
  els.stepScrubber.max = String(maxStep);
  els.stepScrubber.step = '1';
  if (resetPlayhead) {
    state.playhead = 0;
  } else {
    state.playhead = Math.min(state.playhead, maxStep);
  }
  state.lastRenderedStepIdx = -1;
  syncStepUI(Math.floor(state.playhead));
}

function getStepStatusInfo(step) {
  if (!step) {
    return { label: 'Evaluating', badgeClass: 'status-evaluating', ddClass: 'is-evaluating' };
  }
  if (step.ruleLine === 80) {
    return { label: 'Done', badgeClass: 'status-done', ddClass: 'is-done' };
  }
  if (step.ruleLine === 82 || step.controlKind === 'Error') {
    return { label: 'Rejected', badgeClass: 'status-rejected', ddClass: 'is-stopped' };
  }
  if (step.ruleLine === 84) {
    return { label: 'Exhausted', badgeClass: 'status-exhausted', ddClass: 'is-stopped' };
  }
  return { label: 'Evaluating', badgeClass: 'status-evaluating', ddClass: 'is-evaluating' };
}

function resolveFrameEnvText(frames, idx, activeBindings) {
  const fr = frames[idx];
  if (fr.bindings && fr.bindings.length > 0) {
    return fr.bindings.map((b) => `${b.name} = ${b.valueSummary}`).join(', ');
  }
  // If a pending operand frame (e.g. Right or Unary) doesn't store its own env map, borrow enclosing bindings
  for (let j = idx - 1; j >= 0; j--) {
    if (frames[j].bindings && frames[j].bindings.length > 0) {
      return frames[j].bindings.map((b) => `${b.name} = ${b.valueSummary}`).join(', ');
    }
  }
  if (activeBindings && activeBindings.length > 0) {
    return activeBindings.map((b) => `${b.name} = ${b.valueSummary}`).join(', ');
  }
  return fr.detail || 'root scope';
}

function resolveChronoEnvHint(chronoFrames, chronoIdx, activeBindings) {
  const fr = chronoFrames[chronoIdx];
  if (!fr) return '';
  if (Array.isArray(fr.bindings)) {
    if (fr.bindings.length === 0) return 'root';
    return fr.bindings
      .slice(0, 2)
      .map((b) => `${b.name}=${b.valueSummary}`)
      .join(', ');
  }
  if (activeBindings && activeBindings.length > 0) {
    return activeBindings
      .slice(0, 2)
      .map((b) => `${b.name}=${b.valueSummary}`)
      .join(', ');
  }
  for (let j = chronoIdx - 1; j >= 0; j--) {
    const prev = chronoFrames[j];
    if (prev && Array.isArray(prev.bindings) && prev.bindings.length > 0) {
      return prev.bindings
        .slice(0, 2)
        .map((b) => `${b.name}=${b.valueSummary}`)
        .join(', ');
    }
  }
  return '';
}

let ringsDomCache = null;

function ensureRingsDomBuilt() {
  if (ringsDomCache || !els.sixRingsGauge) return ringsDomCache;
  els.sixRingsGauge.textContent = '';
  const frag = document.createDocumentFragment();
  const ringNodes = [];

  for (let r = 0; r < 6; r++) {
    const idxA = r * 2;
    const idxB = r * 2 + 1;
    const slotLo = String(idxA + 1).padStart(2, '0');
    const slotHi = String(idxB + 1).padStart(2, '0');

    const pill = document.createElement('div');
    pill.className = 'ring-pill ring-idle';

    const top = document.createElement('div');
    top.className = 'ring-pill-top';
    const ringId = document.createElement('span');
    ringId.className = 'ring-id';
    ringId.textContent = `R${r + 1} (${slotHi})`;
    const slotsIdx = document.createElement('span');
    slotsIdx.className = 'ring-slots-idx';
    slotsIdx.textContent = `${slotLo}–${slotHi}`;
    top.append(ringId, slotsIdx);

    const rowA = document.createElement('div');
    rowA.className = 'ring-slot-row slot-idle';
    const mainA = document.createElement('span');
    mainA.className = 'slot-main';
    const keyA = document.createElement('span');
    keyA.className = 'slot-key';
    keyA.textContent = 'West A:';
    const valA = document.createElement('span');
    valA.className = 'slot-val';
    valA.textContent = '—';
    mainA.append(keyA, valA);
    rowA.appendChild(mainA);

    const rowB = document.createElement('div');
    rowB.className = 'ring-slot-row slot-idle';
    const mainB = document.createElement('span');
    mainB.className = 'slot-main';
    const keyB = document.createElement('span');
    keyB.className = 'slot-key';
    keyB.textContent = 'East B:';
    const valB = document.createElement('span');
    valB.className = 'slot-val';
    valB.textContent = '—';
    mainB.append(keyB, valB);
    rowB.appendChild(mainB);

    let overflowBadge = null;
    if (r === 5) {
      overflowBadge = document.createElement('span');
      overflowBadge.className = 'overflow-badge hidden';
      overflowBadge.style.display = 'none';
      rowB.appendChild(overflowBadge);
    }

    pill.append(top, rowA, rowB);
    frag.appendChild(pill);
    ringNodes.push({ slotLo, slotHi, pill, rowA, valA, rowB, valB, overflowBadge });
  }

  const strip = document.createElement('div');
  strip.className = 'control-sector-strip';
  strip.setAttribute('aria-label', '10-Sector Control Stator');

  const stripTop = document.createElement('div');
  stripTop.className = 'control-strip-top';
  const stripLabel = document.createElement('span');
  stripLabel.textContent = '10-Sector Control Stator';
  const needleStrong = document.createElement('strong');
  needleStrong.textContent = 'Needle → Center (0 frames)';
  stripTop.append(stripLabel, needleStrong);

  const sectorGrid = document.createElement('div');
  sectorGrid.className = 'control-sector-grid';
  const sectorChips = CONTROL_STRIP_SECTORS.map((sec) => {
    const chip = document.createElement('span');
    chip.className = 'control-sector-chip';
    chip.title = sec.title;
    chip.textContent = sec.badge;
    sectorGrid.appendChild(chip);
    return { keyLower: sec.key.toLowerCase(), isErrorKey: sec.key === 'Error', chip };
  });

  strip.append(stripTop, sectorGrid);
  frag.appendChild(strip);
  els.sixRingsGauge.appendChild(frag);

  ringsDomCache = { ringNodes, needleStrong, sectorChips };
  return ringsDomCache;
}

function syncStepUI(stepIdx, prebuiltStepState = null) {
  if (!state.trace || !state.trace.steps.length) return;
  const totalSteps = state.trace.steps.length;
  const clampedIdx = Math.max(0, Math.min(totalSteps - 1, stepIdx));
  state.lastRenderedStepIdx = clampedIdx;

  const step = state.trace.steps[clampedIdx];
  const stepState = prebuiltStepState || getOrBuildStepState(clampedIdx, 0, 0.016);

  const statusInfo = getStepStatusInfo(step);
  const controlText = formatControlDisplay(step);
  const rec = stepState.recursion;
  const equationText = formatAlgebraicText(rec?.equation || step.controlSummary || '');

  // 1. Stage Caption Bar (below canvas)
  if (els.stageStatusBadge) {
    if (els.stageStatusBadge.textContent !== statusInfo.label) {
      els.stageStatusBadge.textContent = statusInfo.label;
    }
    els.stageStatusBadge.className = `status-badge ${statusInfo.badgeClass}`;
  }
  if (els.hudControlSummary) {
    els.hudControlSummary.textContent = controlText;
  }
  if (els.recursionEquationText) {
    els.recursionEquationText.textContent = equationText;
  }

  // 2. Scrubber Step Label & Transport Bound States
  if (els.scrubberStepLabel) {
    els.scrubberStepLabel.textContent = `Step ${clampedIdx + 1} / ${totalSteps}`;
  }
  if (els.stepScrubber) {
    els.stepScrubber.value = String(clampedIdx);
    els.stepScrubber.setAttribute(
      'aria-valuetext',
      `Step ${clampedIdx + 1} of ${totalSteps}, ${statusInfo.label}, Rule ${step.ruleId}`
    );
  }
  if (els.stepPrevBtn) {
    els.stepPrevBtn.disabled = clampedIdx <= 0;
  }
  if (els.stepNextBtn) {
    els.stepNextBtn.disabled = clampedIdx >= totalSteps - 1;
  }

  // 3. Active Source Line & Provenance
  const origin = step.after.controlOrigin;
  if (els.activeAstBadge && state.cachedTraceForAstBadge !== state.trace) {
    state.cachedTraceForAstBadge = state.trace;
    const activeMeta = PRESET_EDITORIAL_META[state.activePresetId];
    const title = activeMeta?.title || state.trace.programName || 'Sherlock Program';
    const entryExpr = state.trace.programImage?.expressions?.find((e) => e.astPath === 'entry/');
    const entryMatch = String(state.source || '').match(/\bentry\s+([\s\S]*?)\s*;/);
    const liveEntry = (entryExpr?.text || (entryMatch ? entryMatch[1] : '') || activeMeta?.sub || '')
      .replace(/\s+/g, ' ')
      .trim();
    const shortEntry = liveEntry.length > 36 ? `${liveEntry.slice(0, 35)}…` : liveEntry;
    els.activeAstBadge.textContent = shortEntry ? `${title} · ${shortEntry}` : title;
  }
  if (els.activeSpanBadge) {
    els.activeSpanBadge.textContent = `Line ${origin.line}`;
  }
  updateEditorLineNumbers(origin.line);

  // 4. Right Rail: Inspector Telemetry DL
  const frames = step.after.frames || [];
  const chronoFrames = [...frames].reverse();
  const activeBindings = step.after.envRoots?.[0]?.bindings || [];
  const litRings = Math.min(6, Math.ceil(chronoFrames.length / 2));
  const overflowFrames = Math.max(0, chronoFrames.length - 12);
  const initialFuel = state.trace.steps[0]?.before?.fuel ?? state.fuel;
  const fuelPct =
    initialFuel > 0 ? Math.max(0, Math.min(100, Math.round((step.after.fuel / initialFuel) * 100))) : 0;
  const rawCtrlKind = String(step.after?.control?.kind || step.controlKind || 'Eval');
  const ctrlKindUpper = rawCtrlKind.toUpperCase();
  const activeCallCount = rec
    ? rec.calls.filter((c) => c.status === 'active' || c.status === 'waiting').length
    : 0;

  els.telemetryRuleBadge.textContent = `Rule ${step.ruleId}`;

  if (els.telemetryStatus) {
    els.telemetryStatus.textContent =
      statusInfo.label === 'Done' && state.trace.outcome?.summary
        ? `Done (${state.trace.outcome.summary})`
        : statusInfo.label;
    els.telemetryStatus.className = statusInfo.ddClass;
  }
  if (els.telemetryTransition) {
    const transitionHtml = `${clampedIdx + 1} / ${totalSteps} <small>Rule ${escapeHtml(step.ruleId)} &middot; ${escapeHtml(step.ruleName)}</small>`;
    if (transitionHtml !== state.lastTransitionHtml) {
      state.lastTransitionHtml = transitionHtml;
      els.telemetryTransition.innerHTML = transitionHtml;
    }
  }
  if (els.telemetryControl) {
    els.telemetryControl.textContent = controlText;
  }

  // Live QDL Quineling Core Morphogenesis Telemetry
  const qdlTel = getQuinelingTelemetry({
    presetId: state.activePresetId,
    source: state.source,
    trace: state.trace,
    step,
    stepIndex: clampedIdx,
  });
  if (els.telemetryQdlMorph) {
    const qdlHtml = `<strong>${escapeHtml(qdlTel.speciesName)}</strong> <small>&middot; ${escapeHtml(qdlTel.family)} (${escapeHtml(qdlTel.mechanism)}) &middot; ${escapeHtml(qdlTel.morphGesture)}</small>`;
    if (qdlHtml !== state.lastQdlMorphHtml) {
      state.lastQdlMorphHtml = qdlHtml;
      els.telemetryQdlMorph.innerHTML = qdlHtml;
    }
  }

  if (els.telemetryFrames) {
    const ringNote =
      overflowFrames > 0
        ? `${Math.min(12, chronoFrames.length)}/12 slots (${litRings}/6 rings, +${overflowFrames} overflow)`
        : `${chronoFrames.length}/12 slots (${litRings}/6 rings)`;
    const framesTelemetryHtml = `${frames.length} <small>&middot; ${ringNote}</small>`;
    if (framesTelemetryHtml !== state.lastFramesTelemetryHtml) {
      state.lastFramesTelemetryHtml = framesTelemetryHtml;
      els.telemetryFrames.innerHTML = framesTelemetryHtml;
    }
  }
  if (els.telemetryCalls) {
    const callsTelemetryHtml = `${activeCallCount} <small>&middot; ${rec ? rec.calls.length : 0} total</small>`;
    if (callsTelemetryHtml !== state.lastCallsTelemetryHtml) {
      state.lastCallsTelemetryHtml = callsTelemetryHtml;
      els.telemetryCalls.innerHTML = callsTelemetryHtml;
    }
  }
  if (els.telemetryFuel) {
    const fuelTelemetryHtml = `${step.after.fuel} / ${initialFuel} <small>&middot; charge ${step.charge}</small>`;
    if (fuelTelemetryHtml !== state.lastFuelTelemetryHtml) {
      state.lastFuelTelemetryHtml = fuelTelemetryHtml;
      els.telemetryFuel.innerHTML = fuelTelemetryHtml;
    }
  }

  // 5. 6 Stacked Horizontal Split-Arc Ring Rows (West Slot A | East Slot B) + 10-Sector Control Strip (Zero-Allocation In-Place DOM Update)
  if (els.sixRingsGauge && els.ringsSummaryBadge) {
    const visibleSlots = Math.min(12, chronoFrames.length);
    els.ringsSummaryBadge.textContent =
      overflowFrames > 0
        ? `${visibleSlots}/12 (+${overflowFrames}) · FUEL ${fuelPct}% · CTRL: ${ctrlKindUpper}`
        : `${visibleSlots}/12 SLOTS · FUEL ${fuelPct}% · CTRL: ${ctrlKindUpper}`;

    const frontierChronoIdx = chronoFrames.length > 0 ? Math.min(11, chronoFrames.length - 1) : -1;
    const activeRingIdx = frontierChronoIdx >= 0 ? Math.floor(frontierChronoIdx / 2) : -1;
    const dom = ensureRingsDomBuilt();

    if (dom) {
      for (let r = 0; r < 6; r++) {
        const rn = dom.ringNodes[r];
        const idxA = r * 2;
        const idxB = r * 2 + 1;
        const fA = chronoFrames[idxA];
        const fB = chronoFrames[idxB];
        const fill = (fA ? 1 : 0) + (fB ? 1 : 0);
        const hintA = resolveChronoEnvHint(chronoFrames, idxA, activeBindings);
        const hintB = resolveChronoEnvHint(chronoFrames, idxB, activeBindings);
        const metaA = getFrameSlotMeta(fA, hintA);
        const metaB = getFrameSlotMeta(fB, hintB);
        const isFocusRing = r === activeRingIdx;
        const isFrontierA = idxA === frontierChronoIdx;
        const isFrontierB = idxB === frontierChronoIdx;
        const isSlotBOverflow = r === 5 && overflowFrames > 0;
        const ringStateCls = fill === 0 ? 'ring-idle' : isFocusRing ? 'ring-active' : 'ring-occupied';

        rn.pill.className = `ring-pill ${ringStateCls}`;
        rn.pill.title = `Ring R${r + 1} (Chrono Slots ${rn.slotLo}–${rn.slotHi}) · West A: ${metaA.readout} | East B: ${metaB.readout}`;

        rn.rowA.className = `ring-slot-row ${metaA.cls}${isFrontierA ? ' slot-frontier' : ''}`;
        if (isFrontierA) rn.rowA.setAttribute('aria-current', 'true');
        else rn.rowA.removeAttribute('aria-current');
        rn.rowA.title = `West Slot A (#${rn.slotLo}): ${metaA.tooltip}`;
        if (rn.valA.textContent !== metaA.readout) rn.valA.textContent = metaA.readout;

        rn.rowB.className = `ring-slot-row ${metaB.cls}${isFrontierB ? ' slot-frontier' : ''}${isSlotBOverflow ? ' slot-overflow' : ''}`;
        if (isFrontierB) rn.rowB.setAttribute('aria-current', 'true');
        else rn.rowB.removeAttribute('aria-current');
        rn.rowB.title = `East Slot B (#${rn.slotHi}): ${metaB.tooltip}${isSlotBOverflow ? ` (+${overflowFrames} overflow beyond 12-slot window)` : ''}`;
        if (rn.valB.textContent !== metaB.readout) rn.valB.textContent = metaB.readout;

        if (rn.overflowBadge) {
          if (isSlotBOverflow) {
            rn.overflowBadge.style.display = '';
            rn.overflowBadge.className = 'overflow-badge';
            rn.overflowBadge.textContent = `+${overflowFrames} overflow`;
            rn.overflowBadge.title = `${overflowFrames} additional frame(s) beyond the 12-slot window`;
          } else {
            rn.overflowBadge.style.display = 'none';
          }
        }
      }

      const activeSectorKey = (
        statusInfo.label === 'Done'
          ? 'Return'
          : statusInfo.label === 'Rejected' || statusInfo.label === 'Exhausted'
            ? 'Error'
            : rawCtrlKind
      ).toLowerCase();

      const needleHemisphere =
        frontierChronoIdx < 0
          ? 'Center (0 frames)'
          : frontierChronoIdx % 2 === 0
            ? `West Slot A (R${activeRingIdx + 1}·A)`
            : `East Slot B (R${activeRingIdx + 1}·B)`;
      dom.needleStrong.textContent = `Needle → ${needleHemisphere}`;

      for (let s = 0; s < dom.sectorChips.length; s++) {
        const sc = dom.sectorChips[s];
        const isSecActive = sc.keyLower === activeSectorKey;
        const toneCls = isSecActive
          ? statusInfo.label === 'Done'
            ? ' is-done'
            : statusInfo.label === 'Rejected' || statusInfo.label === 'Exhausted' || sc.isErrorKey
              ? ' is-fault'
              : ''
          : '';
        sc.chip.className = `control-sector-chip${isSecActive ? ' active' : ''}${toneCls}`;
        if (isSecActive) sc.chip.setAttribute('aria-current', 'step');
        else sc.chip.removeAttribute('aria-current');
      }
    }
  }

  // 6. Saved frames, top first
  els.frameStackCount.textContent = `${frames.length} of ${step.after.stackLimit} limit`;
  let framesHtml = '';
  if (frames.length === 0) {
    const rootEnvStr =
      activeBindings.length > 0
        ? `Active env: ${activeBindings.map((b) => `${b.name} = ${b.valueSummary}`).join(', ')}`
        : 'No saved frames.';
    framesHtml = `<p class="empty-note">${escapeHtml(rootEnvStr)}</p>`;
  } else {
    framesHtml = frames
      .map((fr, idx) => {
        const slotMeta = getFrameSlotMeta(fr);
        const chronoIdx = frames.length - 1 - idx;
        const ringNum = Math.floor(chronoIdx / 2) + 1;
        const slotChar = chronoIdx % 2 === 0 ? 'A' : 'B';
        const topClass = idx === 0 ? 'is-top' : '';
        const opLabel = formatAlgebraicText(fr.label);
        const envText = resolveFrameEnvText(frames, idx, activeBindings);
        const borrowedNote = fr.kind === 'Right' || fr.kind === 'Unary' ? ' (enclosing)' : '';
        const kindTag =
          ringNum <= 6
            ? `R${ringNum}·${slotChar} · ${slotMeta.family} · ${fr.kind}`
            : `+${chronoIdx - 11} overflow · ${slotMeta.family} · ${fr.kind}`;
        return `
          <div class="frame-item ${slotMeta.itemCls} ${topClass}">
            <div class="frame-item-top">
              <span class="frame-op">${escapeHtml(opLabel)}</span>
              <span class="frame-kind-tag">${escapeHtml(kindTag)}</span>
            </div>
            <div class="frame-env-row">Env${borrowedNote}: ${escapeHtml(envText)}</div>
          </div>
        `;
      })
      .join('');
  }
  if (framesHtml !== state.lastFramesHtml) {
    state.lastFramesHtml = framesHtml;
    els.frameStackList.innerHTML = framesHtml;
  }

  // 7. Active calls chain
  if (rec && els.recursionModePill && els.recursionCallsTrack) {
    const modeLabel =
      rec.mode === 'RESOLVED'
        ? 'Resolved'
        : rec.mode === 'UNWINDING'
          ? 'Unwinding'
          : rec.mode === 'BASE CASE'
            ? 'Base case'
            : rec.mode === 'FAULT'
              ? 'Stopped'
              : 'Unfolding';
    els.recursionModePill.textContent = modeLabel;
    els.recursionModePill.className = `recursion-mode-pill ${
      rec.mode === 'UNWINDING' || rec.mode === 'RESOLVED'
        ? 'unwinding'
        : rec.mode === 'BASE CASE'
          ? 'base'
          : rec.mode === 'FAULT'
            ? 'fault'
            : ''
    }`;

    let callsHtml = '';
    if (rec.calls.length === 0) {
      callsHtml = `<span class="empty-note">Entry expression &rarr; ${escapeHtml(controlText)}</span>`;
    } else {
      callsHtml = rec.calls
        .map((c, idx) => {
          const retSuffix = c.status === 'returned' && c.returnValue ? ` = ${c.returnValue}` : '';
          const arrow = idx < rec.calls.length - 1 ? `<span class="rec-call-arrow">&rarr;</span>` : '';
          const stepTarget = c.status === 'returned' && c.returnStep !== null ? c.returnStep : c.invokeStep;
          return `<button type="button" class="rec-call-node ${c.status}" data-step="${stepTarget}" title="Jump to ${escapeHtml(c.label)}">${escapeHtml(c.label)}${escapeHtml(retSuffix)}</button>${arrow}`;
        })
        .join('');
    }
    if (callsHtml !== state.lastCallsHtml) {
      state.lastCallsHtml = callsHtml;
      els.recursionCallsTrack.innerHTML = callsHtml;
    }
  }
}

function updatePlayButton() {
  els.playPauseBtn.textContent = state.playing ? 'Pause' : 'Play';
}

// Delegated click listener for Active Calls chain buttons
if (els.recursionCallsTrack) {
  els.recursionCallsTrack.addEventListener('click', (ev) => {
    const node = ev.target.closest('.rec-call-node');
    if (!node) return;
    state.playing = false;
    updatePlayButton();
    state.playhead = Number(node.dataset.step || 0);
    els.stepScrubber.value = String(Math.floor(state.playhead));
    syncStepUI(Math.floor(state.playhead));
  });
}

// Event Listeners
els.compileRunBtn.addEventListener('click', () => executeCurrentSource(true));
els.sourceEditor.addEventListener('keydown', (ev) => {
  if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') {
    ev.preventDefault();
    executeCurrentSource(true);
  }
});
els.sourceEditor.addEventListener('input', () => {
  updateEditorLineNumbers(1);
  executeCurrentSource(false);
});
els.sourceEditor.addEventListener('scroll', () => {
  if (els.editorLineNumbers) {
    els.editorLineNumbers.scrollTop = els.sourceEditor.scrollTop;
  }
});

els.fuelSlider.addEventListener('input', () => {
  state.fuel = Number(els.fuelSlider.value);
  els.fuelValLabel.textContent = String(state.fuel);
  executeCurrentSource(false);
});

els.stackSlider.addEventListener('input', () => {
  state.stackLimit = Number(els.stackSlider.value);
  els.stackValLabel.textContent = String(state.stackLimit);
  executeCurrentSource(false);
});

els.playPauseBtn.addEventListener('click', () => {
  state.playing = !state.playing;
  if (state.playing && state.trace && state.playhead >= state.trace.steps.length - 1) {
    state.playhead = 0;
  }
  updatePlayButton();
});

els.stepPrevBtn.addEventListener('click', () => {
  state.playing = false;
  updatePlayButton();
  state.playhead = Math.max(0, Math.floor(state.playhead) - 1);
  els.stepScrubber.value = String(state.playhead);
  syncStepUI(Math.floor(state.playhead));
});

els.stepNextBtn.addEventListener('click', () => {
  state.playing = false;
  updatePlayButton();
  const maxStep = state.trace ? Math.max(0, state.trace.steps.length - 1) : 0;
  state.playhead = Math.min(maxStep, Math.floor(state.playhead) + 1);
  els.stepScrubber.value = String(state.playhead);
  syncStepUI(Math.floor(state.playhead));
});

if (els.resetStepBtn) {
  els.resetStepBtn.addEventListener('click', () => {
    state.playing = false;
    updatePlayButton();
    state.playhead = 0;
    els.stepScrubber.value = '0';
    syncStepUI(0);
  });
}

els.stepScrubber.addEventListener('input', () => {
  state.playing = false;
  updatePlayButton();
  const nextStep = Math.round(Number(els.stepScrubber.value));
  state.playhead = nextStep;
  if (nextStep !== state.lastRenderedStepIdx) {
    syncStepUI(nextStep);
  }
});

els.speedSelect.addEventListener('change', () => {
  state.speed = Number(els.speedSelect.value || 1.0);
});

for (const btn of els.cameraLensBar.querySelectorAll('button')) {
  btn.addEventListener('click', () => {
    const preset = btn.dataset.preset;
    stage.setCameraPreset(preset);
    updateCameraLensButtons(preset);
  });
}

function dispatchCanvasWheelStep(deltaY) {
  if (!els.canvas) return;
  els.canvas.dispatchEvent(
    new WheelEvent('wheel', {
      deltaY,
      bubbles: true,
      cancelable: true,
    })
  );
}

function bindHoldableHudButton(btn, stepFn) {
  if (!btn) return;
  let holdTimer = null;
  const stopHold = () => {
    if (holdTimer !== null) {
      clearInterval(holdTimer);
      holdTimer = null;
    }
  };
  btn.addEventListener('pointerdown', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    stepFn();
    stopHold();
    holdTimer = setInterval(stepFn, 95);
  });
  btn.addEventListener('pointerup', stopHold);
  btn.addEventListener('pointercancel', stopHold);
  btn.addEventListener('pointerleave', stopHold);
  btn.addEventListener('click', (ev) => {
    if (ev.detail === 0) stepFn();
  });
}

bindHoldableHudButton(els.touchZoomInBtn, () => dispatchCanvasWheelStep(-180));
bindHoldableHudButton(els.touchZoomOutBtn, () => dispatchCanvasWheelStep(180));
bindHoldableHudButton(els.touchBoreUpBtn, () => dispatchCanvasWheelStep(-160));
bindHoldableHudButton(els.touchBoreDownBtn, () => dispatchCanvasWheelStep(160));

if (els.touchResetViewBtn) {
  els.touchResetViewBtn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    const activePreset = stage.activePreset || 'overview';
    if (typeof stage.subsystems?.cinema?.resetCamera === 'function') {
      stage.subsystems.cinema.resetCamera();
    } else {
      stage.setCameraPreset(activePreset);
    }
    updateCameraLensButtons(activePreset);
  });
}

function onWindowKeyDown(ev) {
  if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
  const active = document.activeElement;
  const tag = active?.tagName;
  if (
    tag === 'TEXTAREA' ||
    tag === 'INPUT' ||
    tag === 'SELECT' ||
    tag === 'BUTTON' ||
    tag === 'SUMMARY' ||
    active?.isContentEditable ||
    active?.getAttribute?.('role') === 'button'
  ) {
    return;
  }
  if (ev.code === 'Space') {
    ev.preventDefault();
    els.playPauseBtn.click();
  } else if (ev.code === 'ArrowLeft') {
    ev.preventDefault();
    els.stepPrevBtn.click();
  } else if (ev.code === 'ArrowRight') {
    ev.preventDefault();
    els.stepNextBtn.click();
  } else if (ev.key >= '1' && ev.key <= '8') {
    const idx = Number(ev.key) - 1;
    if (PRESET_PROGRAMS[idx]) {
      ev.preventDefault();
      selectPreset(PRESET_PROGRAMS[idx]);
    }
  }
}

function onVisibilityChange() {
  if (!document.hidden) {
    const now = performance.now();
    state.lastTick = now;
    if (stage) stage.lastTime = now;
  }
}

window.addEventListener('keydown', onWindowKeyDown);
if (typeof document !== 'undefined' && document.addEventListener) {
  document.addEventListener('visibilitychange', onVisibilityChange);
}

function getOrBuildStepState(stepIdx, stepFraction = 0, dt = 0.016) {
  const totalSteps = state.trace?.steps?.length || 0;
  const clampedIdx = Math.max(0, Math.min(Math.max(0, totalSteps - 1), stepIdx));
  if (
    state.cachedStepState &&
    state.cachedTraceRef === state.trace &&
    state.cachedStepIdx === clampedIdx
  ) {
    const cached = state.cachedStepState;
    cached.stepFraction = stepFraction;
    cached.sub = stepFraction;
    cached.progress =
      totalSteps > 1
        ? Math.min(1, Math.max(0, (clampedIdx + stepFraction) / (totalSteps - 1)))
        : 1;
    const livePhase =
      clampedIdx === 0 && stepFraction < 0.45 ? 'INGEST' : cached._basePhase || cached.phase;
    cached.phase = livePhase;
    cached.aperture =
      livePhase === 'INGEST'
        ? Math.min(1, 0.38 + stepFraction * 0.54)
        : livePhase === 'ERROR'
          ? 1.0
          : 0.92;
    cached.ambient = stage.ambient;
    cached.dt = dt;
    cached.presetId = state.activePresetId;
    cached.source = state.source;
    cached.playing = state.playing;
    return cached;
  }

  const built = buildStepState({
    trace: state.trace,
    playhead: clampedIdx + stepFraction,
    ambient: stage.ambient,
    dt,
  });
  built._basePhase =
    clampedIdx === 0
      ? buildStepState({
          trace: state.trace,
          playhead: 0.5,
          ambient: stage.ambient,
          dt,
        }).phase
      : built.phase;
  built.sub = stepFraction;
  built.presetId = state.activePresetId;
  built.source = state.source;
  built.playing = state.playing;
  state.cachedStepState = built;
  state.cachedTraceRef = state.trace;
  state.cachedStepIdx = clampedIdx;
  return built;
}

// Animation Loop
function animate(now) {
  if (state.disposed) return;
  state.rafId = requestAnimationFrame(animate);
  const dt = Math.min(0.05, Math.max(0.001, (now - state.lastTick) / 1000));
  state.lastTick = now;

  if (state.trace && state.trace.steps.length > 0) {
    const maxStep = state.trace.steps.length - 1;
    if (state.playing) {
      state.playhead += dt * 3.2 * state.speed;
      if (state.playhead >= maxStep + 3.5) {
        state.playhead = 0;
      }
    }

    const clampedPlayhead = Math.min(maxStep, Math.max(0, state.playhead));
    const currentIdx = Math.floor(clampedPlayhead);
    const stepFraction = clampedPlayhead - currentIdx;
    const stepState = getOrBuildStepState(currentIdx, stepFraction, dt);

    stage.render(stepState);

    if (currentIdx !== state.lastRenderedStepIdx) {
      syncStepUI(currentIdx, stepState);
    }
  }
}

export function disposeApp() {
  if (state.disposed) return;
  state.disposed = true;
  state.playing = false;
  if (state.rafId) {
    cancelAnimationFrame(state.rafId);
    state.rafId = 0;
  }
  window.removeEventListener('keydown', onWindowKeyDown);
  if (typeof document !== 'undefined' && document.removeEventListener) {
    document.removeEventListener('visibilitychange', onVisibilityChange);
  }
  stage.dispose();
}

if (typeof window !== 'undefined') {
  window.__sherlockApp = { state, stage, selectPreset, executeCurrentSource, dispose: disposeApp };
}

// Initialize Workbench
els.sourceEditor.value = state.source;
renderPresets();
executeCurrentSource(true);
state.rafId = requestAnimationFrame(animate);
