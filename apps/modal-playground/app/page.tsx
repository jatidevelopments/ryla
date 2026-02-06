'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  PRESET_PROMPTS,
  getEndpointsByCategory,
  getEndpointLabel,
  getEndpointMeta,
} from '@/lib/constants';
import { buildBodyForEndpoint } from '@/lib/body-builder';
import { fileToDataUrl } from '@/lib/file-to-data-url';
import {
  callModalEndpoint,
  callRunComfyEndpoint,
  fetchRunComfyEndpoints,
  type RunComfyDeployment,
} from '@/lib/api';

type PlaygroundResponse = Awaited<ReturnType<typeof callModalEndpoint>>;

type ResultState =
  | { status: 'idle' }
  | { status: 'loading'; startedAt: number }
  | { status: 'done'; data: PlaygroundResponse };

type RunRef = {
  prompt: string;
  seed: number;
  startedAt: number;
  finishedAt: number;
};

const DEFAULT_ADVANCED = { width: 1024, height: 1024, steps: 20, cfg: 5 };

const inputClass =
  'w-full rounded-lg border bg-[var(--input-bg)] border-[var(--border-default)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-subtle)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-colors';
const cardClass =
  'rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5';
const labelClass = 'text-xs font-medium text-[var(--muted)] uppercase tracking-wider';

export type Provider = 'modal' | 'runcomfy';

export default function PlaygroundPage() {
  const [provider, setProvider] = useState<Provider>('modal');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [presetId, setPresetId] = useState(PRESET_PROMPTS[0].id);
  const [customPrompt, setCustomPrompt] = useState('');
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const [advanced, setAdvanced] = useState(DEFAULT_ADVANCED);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [refImage, setRefImage] = useState<string | null>(null);
  const [loraId, setLoraId] = useState('');
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [selectedEndpoints, setSelectedEndpoints] = useState<Set<string>>(
    new Set(['/flux-dev'])
  );
  const [results, setResults] = useState<Record<string, ResultState>>({});
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<RunRef | null>(null);
  const [_tick, setTick] = useState(0);

  const [runcomfyDeployments, setRuncomfyDeployments] = useState<
    RunComfyDeployment[] | { error: string } | null
 >(null);
  const [selectedRunComfyIds, setSelectedRunComfyIds] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (provider !== 'runcomfy') return;
    let cancelled = false;
    fetchRunComfyEndpoints().then((data) => {
      if (!cancelled) setRuncomfyDeployments(data);
    });
    return () => {
      cancelled = true;
    };
  }, [provider]);

  const prompt = useCustomPrompt
    ? customPrompt
    : (PRESET_PROMPTS.find((p) => p.id === presetId)?.prompt ?? '');

  const groups = getEndpointsByCategory();
  const selectedList =
    provider === 'modal'
      ? Array.from(selectedEndpoints)
      : Array.from(selectedRunComfyIds);
  const needsRef =
    provider === 'modal' &&
    selectedList.some((p) => getEndpointMeta(p)?.needsRefImage);
  const needsLora =
    provider === 'modal' &&
    selectedList.some((p) => getEndpointMeta(p)?.needsLora);
  const needsInputImage =
    provider === 'modal' &&
    selectedList.some((p) => getEndpointMeta(p)?.needsImage);

  const runBatchModal = useCallback(
    async (endpoints: string[], useSeed?: number) => {
      if (endpoints.length === 0) return;
      const usedSeed = useSeed ?? Math.floor(Math.random() * 1e9);
      const startedAt = Date.now();
      const inputs = {
        prompt,
        seed: usedSeed,
        width: advanced.width,
        height: advanced.height,
        steps: advanced.steps,
        cfg: advanced.cfg,
        refImageDataUrl: refImage || undefined,
        loraId: loraId || undefined,
        inputImageDataUrl: inputImage || undefined,
      };

      setRunning(true);
      const now = Date.now();
      setResults(
        Object.fromEntries(
          endpoints.map((e) => [
            e,
            { status: 'loading' as const, startedAt: now },
          ])
        )
      );

      const next: Record<string, ResultState> = {};
      await Promise.all(
        endpoints.map(async (endpoint) => {
          const meta = getEndpointMeta(endpoint);
          const body = meta
            ? buildBodyForEndpoint(meta, inputs)
            : { ...inputs };
          const data = await callModalEndpoint(endpoint, body);
          next[endpoint] = { status: 'done', data };
        })
      );
      setResults((prev) => ({ ...prev, ...next }));
      setLastRun({ prompt, seed: usedSeed, startedAt, finishedAt: Date.now() });
      setRunning(false);
    },
    [prompt, advanced, refImage, loraId, inputImage]
  );

  const runBatchRunComfy = useCallback(
    async (deploymentIds: string[], useSeed?: number) => {
      if (deploymentIds.length === 0) return;
      const usedSeed = useSeed ?? Math.floor(Math.random() * 1e9);
      const startedAt = Date.now();

      setRunning(true);
      const now = Date.now();
      setResults(
        Object.fromEntries(
          deploymentIds.map((id) => [
            id,
            { status: 'loading' as const, startedAt: now },
          ])
        )
      );

      const next: Record<string, ResultState> = {};
      await Promise.all(
        deploymentIds.map(async (id) => {
          const data = await callRunComfyEndpoint(id, {
            prompt,
            seed: usedSeed,
          });
          next[id] = { status: 'done', data };
        })
      );
      setResults((prev) => ({ ...prev, ...next }));
      setLastRun({ prompt, seed: usedSeed, startedAt, finishedAt: Date.now() });
      setRunning(false);
    },
    [prompt]
  );

  const runBatch = useCallback(
    (endpoints: string[], useSeed?: number) => {
      if (provider === 'modal') runBatchModal(endpoints, useSeed);
      else runBatchRunComfy(endpoints, useSeed);
    },
    [provider, runBatchModal, runBatchRunComfy]
  );

  const run = useCallback(() => {
    runBatch(selectedList);
  }, [runBatch, selectedList]);

  const regenerateOne = useCallback(
    async (endpointKey: string) => {
      const usedSeed = lastRun?.seed ?? Math.floor(Math.random() * 1e9);
      if (provider === 'modal') {
        const inputs = {
          prompt: lastRun?.prompt ?? prompt,
          seed: usedSeed,
          width: advanced.width,
          height: advanced.height,
          steps: advanced.steps,
          cfg: advanced.cfg,
          refImageDataUrl: refImage || undefined,
          loraId: loraId || undefined,
          inputImageDataUrl: inputImage || undefined,
        };
        const meta = getEndpointMeta(endpointKey);
        const body = meta ? buildBodyForEndpoint(meta, inputs) : inputs;
        setResults((prev) => ({
          ...prev,
          [endpointKey]: { status: 'loading' as const, startedAt: Date.now() },
        }));
        const data = await callModalEndpoint(endpointKey, body);
        setResults((prev) => ({ ...prev, [endpointKey]: { status: 'done', data } }));
      } else {
        setResults((prev) => ({
          ...prev,
          [endpointKey]: { status: 'loading' as const, startedAt: Date.now() },
        }));
        const data = await callRunComfyEndpoint(endpointKey, {
          prompt: lastRun?.prompt ?? prompt,
          seed: usedSeed,
        });
        setResults((prev) => ({ ...prev, [endpointKey]: { status: 'done', data } }));
      }
    },
    [provider, lastRun, prompt, advanced, refImage, loraId, inputImage]
  );

  const regenerateAll = useCallback(() => {
    const endpoints = Object.keys(results);
    if (endpoints.length === 0) return;
    runBatch(endpoints, lastRun?.seed);
  }, [results, lastRun?.seed, runBatch]);

  const runcomfyList =
    Array.isArray(runcomfyDeployments) ? runcomfyDeployments : [];
  const runcomfyError =
    runcomfyDeployments && !Array.isArray(runcomfyDeployments)
      ? (runcomfyDeployments as { error: string }).error
      : null;
  const getRunComfyLabel = (id: string) =>
    runcomfyList.find((d) => d.id === id)?.name ?? id;

  const copySeed = useCallback(() => {
    if (lastRun) navigator.clipboard.writeText(String(lastRun.seed));
  }, [lastRun]);

  const copyPrompt = useCallback(() => {
    if (lastRun) navigator.clipboard.writeText(lastRun.prompt);
  }, [lastRun]);

  const hasResults = Object.keys(results).length > 0;
  const doneEntries = Object.entries(results).filter(([, s]) => s.status === 'done');
  const successCount = doneEntries.filter(([, s]) => !s.data.error).length;
  const failCount = doneEntries.length - successCount;
  const totalCostUsd = doneEntries.reduce(
    (sum, [, s]) => sum + (s.data.costUsd ?? 0),
    0
  );
  const totalTimeSec = doneEntries.reduce(
    (sum, [, s]) => sum + (s.data.executionTimeSec ?? 0),
    0
  );
  const completedCount = doneEntries.length;
  const totalCount = selectedList.length;
  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Studio-style background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-40 right-0 h-[500px] w-[500px] opacity-30"
          style={{
            background:
              'radial-gradient(circle, rgba(168, 85, 247, 0.18) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute -bottom-40 left-0 h-[400px] w-[400px] opacity-20"
          style={{
            background:
              'radial-gradient(circle, rgba(236, 72, 153, 0.14) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6 sm:px-6 space-y-6">
        {/* Header + Provider selector */}
        <header
          className={cardClass}
          style={{ borderLeft: '3px solid var(--primary)' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold text-[var(--foreground)] tracking-tight">
                Endpoint Playground
              </h1>
              <p className="text-sm text-[var(--muted)] mt-1 max-w-xl">
                {provider === 'modal'
                  ? 'Test and compare Modal.com endpoints. Same prompt, optional ref image and LoRA.'
                  : 'Test and compare RunComfy deployments. Same prompt and seed; list from your RunComfy account.'}
              </p>
            </div>
            <div className="flex rounded-lg border border-[var(--border-default)] bg-[var(--input-bg)] p-0.5">
              <button
                type="button"
                onClick={() => setProvider('modal')}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  provider === 'modal'
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                Modal
              </button>
              <button
                type="button"
                onClick={() => setProvider('runcomfy')}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  provider === 'runcomfy'
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                RunComfy
              </button>
            </div>
          </div>
        </header>

        {/* Prompt */}
        <section className={cardClass + ' space-y-4'}>
          <div className="flex items-center gap-6">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="promptMode"
                checked={!useCustomPrompt}
                onChange={() => setUseCustomPrompt(false)}
                className="rounded-full border-[var(--border-default)] bg-[var(--input-bg)] text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <span className="text-sm font-medium text-[var(--foreground)]">
                Preset
              </span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="promptMode"
                checked={useCustomPrompt}
                onChange={() => setUseCustomPrompt(true)}
                className="rounded-full border-[var(--border-default)] bg-[var(--input-bg)] text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <span className="text-sm font-medium text-[var(--foreground)]">
                Custom
              </span>
            </label>
          </div>
          {!useCustomPrompt ? (
            <>
              <select
                value={presetId}
                onChange={(e) => setPresetId(e.target.value)}
                className={inputClass + ' max-w-lg'}
              >
                {PRESET_PROMPTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-[var(--muted)] max-w-lg leading-relaxed">
                {prompt}
              </p>
            </>
          ) : (
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Describe your image..."
              rows={3}
              className={inputClass + ' max-w-lg resize-y'}
            />
          )}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <label className="flex items-center gap-2">
              <span className={labelClass}>Seed</span>
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(Number(e.target.value) || 0)}
                className={inputClass + ' w-32'}
              />
            </label>
            <button
              type="button"
              onClick={() => setSeed(Math.floor(Math.random() * 1e9))}
              className="text-sm text-[var(--primary)] hover:text-[var(--primary-pink)] transition-colors"
            >
              Random
            </button>
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              {showAdvanced ? 'Hide' : 'Show'} advanced
            </button>
          </div>
          {showAdvanced && (
            <div className="flex flex-wrap gap-6 pt-2 border-t border-[var(--border-muted)]">
              {[
                { key: 'width', label: 'W', value: advanced.width, set: (v: number) => setAdvanced((a) => ({ ...a, width: v })) },
                { key: 'height', label: 'H', value: advanced.height, set: (v: number) => setAdvanced((a) => ({ ...a, height: v })) },
                { key: 'steps', label: 'Steps', value: advanced.steps, set: (v: number) => setAdvanced((a) => ({ ...a, steps: v })) },
                { key: 'cfg', label: 'CFG', value: advanced.cfg, set: (v: number) => setAdvanced((a) => ({ ...a, cfg: v })) },
              ].map(({ label, value, set }) => (
                <label key={label} className="flex items-center gap-2">
                  <span className={labelClass}>{label}</span>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => set(Number(e.target.value) || value)}
                    className={inputClass + ' w-20'}
                  />
                </label>
              ))}
            </div>
          )}
        </section>

        {/* Optional inputs */}
        <section className={cardClass + ' space-y-4'}>
          <h2 className={labelClass}>Extra inputs (when needed)</h2>
          <div className="flex flex-wrap gap-8">
            {(needsRef || refImage) && (
              <div>
                <p className="text-xs text-[var(--muted)] mb-2">Reference image (face)</p>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) setRefImage(await fileToDataUrl(f));
                    }}
                    className="text-sm text-[var(--muted)] file:mr-2 file:rounded-lg file:border-0 file:bg-[var(--input-bg)] file:px-3 file:py-1.5 file:text-sm file:text-[var(--foreground)]"
                  />
                  {refImage && (
                    <button
                      type="button"
                      onClick={() => setRefImage(null)}
                      className="text-xs text-[var(--muted)] hover:text-red-400 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {refImage && (
                  <img
                    src={refImage}
                    alt="Ref"
                    className="mt-2 h-16 w-16 object-cover rounded-lg border border-[var(--border-default)]"
                  />
                )}
              </div>
            )}
            {(needsLora || loraId) && (
              <div>
                <p className="text-xs text-[var(--muted)] mb-2">LoRA ID</p>
                <input
                  type="text"
                  value={loraId}
                  onChange={(e) => setLoraId(e.target.value)}
                  placeholder="e.g. character-abc123"
                  className={inputClass + ' w-48'}
                />
              </div>
            )}
            {(needsInputImage || inputImage) && (
              <div>
                <p className="text-xs text-[var(--muted)] mb-2">Input image (upscale)</p>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) setInputImage(await fileToDataUrl(f));
                    }}
                    className="text-sm text-[var(--muted)] file:mr-2 file:rounded-lg file:border-0 file:bg-[var(--input-bg)] file:px-3 file:py-1.5 file:text-sm file:text-[var(--foreground)]"
                  />
                  {inputImage && (
                    <button
                      type="button"
                      onClick={() => setInputImage(null)}
                      className="text-xs text-[var(--muted)] hover:text-red-400 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          {provider === 'modal' &&
            !needsRef &&
            !needsLora &&
            !needsInputImage &&
            selectedList.length > 0 && (
              <p className="text-xs text-[var(--muted-subtle)]">
                Select Face / LoRA / Upscale endpoints to see their inputs.
              </p>
            )}
        </section>

        {/* Endpoints by category (Modal) or RunComfy deployments */}
        <section className={cardClass + ' space-y-4'}>
          <h2 className={labelClass}>
            {provider === 'modal' ? 'Endpoints' : 'RunComfy deployments'}
          </h2>
          {provider === 'modal' ? (
            groups.map(({ category, endpoints }) => (
              <div key={category}>
                <p className="text-xs font-medium text-[var(--muted)] mb-2">
                  {category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {endpoints.map((e) => {
                    const needRef = e.needsRefImage && !refImage;
                    const needLora = e.needsLora && !loraId;
                    const needImg = e.needsImage && !inputImage;
                    const missing = needRef || needLora || needImg;
                    const selected = selectedEndpoints.has(e.path);
                    return (
                      <label
                        key={e.path}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                          missing
                            ? 'border-amber-500/40 bg-amber-500/5'
                            : selected
                              ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                              : 'border-[var(--border-default)] bg-[var(--input-bg)] hover:border-[var(--muted)]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => {
                            setSelectedEndpoints((prev) => {
                              const next = new Set(prev);
                              if (next.has(e.path)) next.delete(e.path);
                              else next.add(e.path);
                              return next;
                            });
                          }}
                          className="rounded border-[var(--border-default)] bg-[var(--input-bg)] text-[var(--primary)] focus:ring-[var(--primary)]"
                        />
                        <span className="text-sm text-[var(--foreground)]">
                          {e.label}
                        </span>
                        {missing && (
                          <span className="text-xs text-amber-400">
                            {needRef && 'need ref'}
                            {needLora && 'need LoRA'}
                            {needImg && 'need image'}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))
          ) : runcomfyError ? (
            <p className="text-sm text-amber-500">{runcomfyError}</p>
          ) : runcomfyList.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              Loading deployments… (set RUNCOMFY_API_TOKEN on the API)
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setSelectedRunComfyIds(new Set(runcomfyList.map((d) => d.id)))}
                  className="text-sm text-[var(--primary)] hover:text-[var(--primary-pink)] transition-colors"
                >
                  Select all
                </button>
                <span className="text-[var(--muted)]">|</span>
                <button
                  type="button"
                  onClick={() => setSelectedRunComfyIds(new Set())}
                  className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  Clear
                </button>
                <span className="text-[var(--muted)] ml-2">
                  {selectedRunComfyIds.size} of {runcomfyList.length} selected
                </span>
                <button
                  type="button"
                  onClick={() => runBatch(runcomfyList.map((d) => d.id))}
                  disabled={running || !prompt.trim()}
                  className="ml-auto px-4 py-2 rounded-lg text-sm font-medium bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)] hover:bg-[var(--primary)]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Test all ({runcomfyList.length})
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
              {runcomfyList.map((d) => {
                const selected = selectedRunComfyIds.has(d.id);
                return (
                  <label
                    key={d.id}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                      selected
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                        : 'border-[var(--border-default)] bg-[var(--input-bg)] hover:border-[var(--muted)]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => {
                        setSelectedRunComfyIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(d.id)) next.delete(d.id);
                          else next.add(d.id);
                          return next;
                        });
                      }}
                      className="rounded border-[var(--border-default)] bg-[var(--input-bg)] text-[var(--primary)] focus:ring-[var(--primary)]"
                    />
                    <span className="text-sm text-[var(--foreground)] truncate max-w-[200px]" title={d.name}>
                      {d.name}
                    </span>
                  </label>
                );
              })}
              </div>
            </>
          )}
        </section>

        {/* Run bar - studio-style sticky bar */}
        <div className="sticky top-0 z-20 flex flex-wrap items-center gap-4 py-4 px-4 -mx-4 sm:-mx-6 rounded-xl bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border-default)]">
          <button
            type="button"
            onClick={run}
            disabled={
              running ||
              selectedList.length === 0 ||
              !prompt.trim() ||
              (provider === 'runcomfy' && runcomfyList.length === 0)
            }
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[var(--primary)] to-[var(--primary-pink)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-lg shadow-[var(--primary)]/20"
          >
            {running ? `${completedCount} / ${selectedList.length}` : 'Run'}
          </button>
          {hasResults && (
            <button
              type="button"
              onClick={regenerateAll}
              disabled={running}
              className="px-5 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--input-bg)] text-[var(--foreground)] text-sm font-medium hover:bg-[var(--border-muted)] disabled:opacity-50 transition-colors"
            >
              Regenerate all
            </button>
          )}
          {running && (
            <div className="flex items-center gap-3 min-w-[180px]">
              <div className="flex-1 h-1.5 rounded-full bg-[var(--input-bg)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-pink)] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-sm text-[var(--muted)] tabular-nums">
                {completedCount}/{totalCount}
              </span>
            </div>
          )}
        </div>

        {/* Results */}
        {hasResults && (
          <section className="space-y-4">
            <div
              className={
                cardClass +
                ' flex flex-wrap items-center justify-between gap-4'
              }
            >
              <h2 className={labelClass}>Results</h2>
              {lastRun && (
                <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
                  <span title={lastRun.prompt} className="max-w-[200px] truncate">
                    {lastRun.prompt.slice(0, 50)}…
                  </span>
                  <span>Seed: {lastRun.seed}</span>
                  <button
                    type="button"
                    onClick={copySeed}
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    Copy seed
                  </button>
                  <button
                    type="button"
                    onClick={copyPrompt}
                    className="hover:text-[var(--foreground)] transition-colors"
                  >
                    Copy prompt
                  </button>
                  <span>
                    {successCount} ok, {failCount} failed
                  </span>
                  {totalTimeSec > 0 && (
                    <span>Gen: {totalTimeSec.toFixed(1)}s</span>
                  )}
                  {lastRun.finishedAt > lastRun.startedAt && (
                    <span>
                      Wall:{' '}
                      {((lastRun.finishedAt - lastRun.startedAt) / 1000).toFixed(
                        1
                      )}
                      s
                    </span>
                  )}
                  {totalCostUsd > 0 && (
                    <span className="font-medium text-[var(--foreground)]">
                      ${totalCostUsd.toFixed(4)}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Object.entries(results).map(([endpoint, state]) => (
                <div
                  key={endpoint}
                  className={
                    'rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden flex flex-col'
                  }
                >
                  <div className="px-3 py-2 border-b border-[var(--border-default)] flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[var(--muted)] truncate">
                      {provider === 'modal'
                        ? getEndpointLabel(endpoint)
                        : getRunComfyLabel(endpoint)}
                    </span>
                    {state.status === 'done' && !state.data.error && (
                      <button
                        type="button"
                        onClick={() => regenerateOne(endpoint)}
                        className="shrink-0 text-xs text-[var(--primary)] hover:text-[var(--primary-pink)] transition-colors"
                      >
                        Regenerate
                      </button>
                    )}
                  </div>
                  <div className="aspect-square flex flex-col items-center justify-center min-h-[120px] bg-[var(--input-bg)] gap-2">
                    {state.status === 'loading' && (
                      <>
                        <span className="text-[var(--muted)] text-sm font-medium">
                          Generating…
                        </span>
                        <span className="text-[var(--foreground)] text-lg tabular-nums">
                          {Math.floor((Date.now() - state.startedAt) / 1000)}s
                        </span>
                        <div className="w-6 h-6 border-2 border-[var(--border-default)] border-t-[var(--primary)] rounded-full animate-spin" />
                      </>
                    )}
                    {state.status === 'done' &&
                      (state.data.error ? (
                        <span className="text-red-400 text-xs px-2 text-center">
                          {state.data.error}
                        </span>
                      ) : state.data.imageBase64 ? (
                        <img
                          src={`data:${state.data.contentType ?? 'image/png'};base64,${state.data.imageBase64}`}
                          alt={endpoint}
                          className="w-full h-full object-contain"
                        />
                      ) : null)}
                  </div>
                  {state.status === 'done' && (
                    <div className="px-3 py-2 border-t border-[var(--border-default)] text-xs text-[var(--muted)] space-y-0.5">
                      {state.data.error ? (
                        <p>Error</p>
                      ) : (
                        <>
                          {state.data.executionTimeSec != null && (
                            <p>Time: {state.data.executionTimeSec.toFixed(1)}s</p>
                          )}
                          {state.data.costUsd != null && (
                            <p>Cost: ${state.data.costUsd.toFixed(4)}</p>
                          )}
                          {state.data.gpuType && (
                            <p>GPU: {state.data.gpuType}</p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {!hasResults && selectedList.length > 0 && !running && (
          <p
            className={
              cardClass +
              ' text-sm text-[var(--muted)]'
            }
          >
            {provider === 'modal'
              ? 'Click Run to generate. Add a reference image or LoRA ID above if you selected Face or LoRA endpoints.'
              : 'Click Run to generate with the same prompt and seed for each selected deployment.'}
          </p>
        )}
      </div>
    </div>
  );
}
