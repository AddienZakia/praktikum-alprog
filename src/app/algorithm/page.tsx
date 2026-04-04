'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────

type AlgoKey =
  | 'linearSearch'
  | 'binarySearch'
  | 'bubbleSort'
  | 'insertionSort'
  | 'selectionSort';

interface Step {
  line: number[];
  // arr snapshot for this step (always present)
  arr: number[];
  state: Record<string, string | number | number[]>;
  description: string;
  highlights: number[];
  swapping?: [number, number];
  found?: number;
  sorted?: number[];
  comparing?: number[];
  pivot?: number;
}

// ─── Algorithm Definitions ────────────────────────────────────────────────────

const ALGORITHMS: Record<
  AlgoKey,
  {
    name: string;
    category: 'Search' | 'Sort';
    code: string[];
    color: string;
    accent: string;
  }
> = {
  linearSearch: {
    name: 'Linear Search',
    category: 'Search',
    color: 'from-sky-500/20 to-blue-600/10',
    accent: '#38bdf8',
    code: [
      'function linearSearch(arr, target) {',
      '  for (let i = 0; i < arr.length; i++) {',
      '    if (arr[i] === target) {',
      '      return i;',
      '    }',
      '  }',
      '  return -1;',
      '}',
    ],
  },
  binarySearch: {
    name: 'Binary Search',
    category: 'Search',
    color: 'from-violet-500/20 to-purple-600/10',
    accent: '#a78bfa',
    code: [
      'function binarySearch(arr, target) {',
      '  let left = 0, right = arr.length - 1;',
      '  while (left <= right) {',
      '    let mid = Math.floor((left + right) / 2);',
      '    if (arr[mid] === target) return mid;',
      '    else if (arr[mid] < target) left = mid + 1;',
      '    else right = mid - 1;',
      '  }',
      '  return -1;',
      '}',
    ],
  },
  bubbleSort: {
    name: 'Bubble Sort',
    category: 'Sort',
    color: 'from-amber-500/20 to-orange-600/10',
    accent: '#fbbf24',
    code: [
      'function bubbleSort(arr) {',
      '  let n = arr.length;',
      '  for (let i = 0; i < n - 1; i++) {',
      '    for (let j = 0; j < n - i - 1; j++) {',
      '      if (arr[j] > arr[j + 1]) {',
      '        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];',
      '      }',
      '    }',
      '  }',
      '  return arr;',
      '}',
    ],
  },
  insertionSort: {
    name: 'Insertion Sort',
    category: 'Sort',
    color: 'from-emerald-500/20 to-green-600/10',
    accent: '#34d399',
    code: [
      'function insertionSort(arr) {',
      '  for (let i = 1; i < arr.length; i++) {',
      '    let key = arr[i];',
      '    let j = i - 1;',
      '    while (j >= 0 && arr[j] > key) {',
      '      arr[j + 1] = arr[j];',
      '      j--;',
      '    }',
      '    arr[j + 1] = key;',
      '  }',
      '  return arr;',
      '}',
    ],
  },
  selectionSort: {
    name: 'Selection Sort',
    category: 'Sort',
    color: 'from-rose-500/20 to-pink-600/10',
    accent: '#fb7185',
    code: [
      'function selectionSort(arr) {',
      '  let n = arr.length;',
      '  for (let i = 0; i < n - 1; i++) {',
      '    let minIdx = i;',
      '    for (let j = i + 1; j < n; j++) {',
      '      if (arr[j] < arr[minIdx]) {',
      '        minIdx = j;',
      '      }',
      '    }',
      '    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];',
      '  }',
      '  return arr;',
      '}',
    ],
  },
};

// ─── Step Generators ─────────────────────────────────────────────────────────

function genLinearSearch(arr: number[], target: number): Step[] {
  const steps: Step[] = [];
  steps.push({
    line: [0],
    arr: [...arr],
    state: { arr: [...arr], target },
    description: `Mulai linear search untuk target = ${target}`,
    highlights: [],
  });
  for (let i = 0; i < arr.length; i++) {
    steps.push({
      line: [1],
      arr: [...arr],
      state: { i, arr: [...arr], target },
      description: `Loop: i = ${i}, cek apakah i < ${arr.length}`,
      highlights: [i],
      comparing: [i],
    });
    steps.push({
      line: [2],
      arr: [...arr],
      state: { i, 'arr[i]': arr[i], target },
      description: `Bandingkan arr[${i}] = ${arr[i]} dengan target = ${target}`,
      highlights: [i],
      comparing: [i],
    });
    if (arr[i] === target) {
      steps.push({
        line: [3],
        arr: [...arr],
        state: { i, result: i },
        description: `✅ Ditemukan! arr[${i}] = ${target}, return ${i}`,
        highlights: [i],
        found: i,
      });
      return steps;
    }
  }
  steps.push({
    line: [6],
    arr: [...arr],
    state: { result: -1 },
    description: `❌ Target ${target} tidak ditemukan, return -1`,
    highlights: [],
    found: -1,
  });
  return steps;
}

function genBinarySearch(arr: number[], target: number): Step[] {
  const sorted = [...arr].sort((a, b) => a - b);
  const steps: Step[] = [];
  steps.push({
    line: [0],
    arr: [...sorted],
    state: { arr: sorted, target },
    description: `Binary search pada array terurut untuk target = ${target}`,
    highlights: [],
  });
  let left = 0;
  let right = sorted.length - 1;
  steps.push({
    line: [1],
    arr: [...sorted],
    state: { left, right },
    description: `Inisialisasi: left = ${left}, right = ${right}`,
    highlights: Array.from({ length: sorted.length }, (_, i) => i),
  });
  while (left <= right) {
    steps.push({
      line: [2],
      arr: [...sorted],
      state: { left, right },
      description: `Cek: left (${left}) <= right (${right})? ${left <= right}`,
      highlights: Array.from({ length: right - left + 1 }, (_, i) => left + i),
    });
    const mid = Math.floor((left + right) / 2);
    steps.push({
      line: [3],
      arr: [...sorted],
      state: { left, right, mid },
      description: `mid = floor((${left} + ${right}) / 2) = ${mid}`,
      highlights: [mid],
      comparing: [mid],
    });
    steps.push({
      line: [4],
      arr: [...sorted],
      state: { 'arr[mid]': sorted[mid], target, mid },
      description: `arr[${mid}] = ${sorted[mid]}, target = ${target}`,
      highlights: [mid],
      comparing: [mid],
    });
    if (sorted[mid] === target) {
      steps.push({
        line: [4],
        arr: [...sorted],
        state: { result: mid },
        description: `✅ Ditemukan! arr[${mid}] = ${target}, return ${mid}`,
        highlights: [mid],
        found: mid,
      });
      return steps;
    } else if (sorted[mid] < target) {
      steps.push({
        line: [5],
        arr: [...sorted],
        state: { left: mid + 1, right },
        description: `arr[${mid}]=${sorted[mid]} < ${target}, cari di kanan → left = ${mid + 1}`,
        highlights: Array.from({ length: right - mid }, (_, i) => mid + 1 + i),
      });
      left = mid + 1;
    } else {
      steps.push({
        line: [6],
        arr: [...sorted],
        state: { left, right: mid - 1 },
        description: `arr[${mid}]=${sorted[mid]} > ${target}, cari di kiri → right = ${mid - 1}`,
        highlights: Array.from({ length: mid - left }, (_, i) => left + i),
      });
      right = mid - 1;
    }
  }
  steps.push({
    line: [8],
    arr: [...sorted],
    state: { result: -1 },
    description: `❌ Target ${target} tidak ditemukan, return -1`,
    highlights: [],
    found: -1,
  });
  return steps;
}

function genBubbleSort(arr: number[]): Step[] {
  const a = [...arr];
  const steps: Step[] = [];
  const n = a.length;
  const sorted: number[] = [];
  steps.push({
    line: [0],
    arr: [...a],
    state: { arr: [...a] },
    description: 'Mulai Bubble Sort',
    highlights: [],
  });
  steps.push({
    line: [1],
    arr: [...a],
    state: { n },
    description: `n = arr.length = ${n}`,
    highlights: [],
  });
  for (let i = 0; i < n - 1; i++) {
    steps.push({
      line: [2],
      arr: [...a],
      state: { i, n },
      description: `Pass ke-${i + 1}: i = ${i}`,
      highlights: [],
      sorted: [...sorted],
    });
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({
        line: [3],
        arr: [...a],
        state: { i, j },
        description: `j = ${j}, bandingkan arr[${j}]=${a[j]} dan arr[${j + 1}]=${a[j + 1]}`,
        highlights: [j, j + 1],
        comparing: [j, j + 1],
        sorted: [...sorted],
      });
      steps.push({
        line: [4],
        arr: [...a],
        state: { 'arr[j]': a[j], 'arr[j+1]': a[j + 1] },
        description: `${a[j]} > ${a[j + 1]}? ${a[j] > a[j + 1] ? 'Ya, swap!' : 'Tidak, lanjut'}`,
        highlights: [j, j + 1],
        comparing: [j, j + 1],
        sorted: [...sorted],
      });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({
          line: [5],
          arr: [...a],
          state: { arr: [...a] },
          description: `Swap arr[${j}] dan arr[${j + 1}] → [${a.join(', ')}]`,
          highlights: [j, j + 1],
          swapping: [j, j + 1],
          sorted: [...sorted],
        });
      }
    }
    sorted.unshift(n - 1 - i);
  }
  sorted.unshift(0);
  steps.push({
    line: [8],
    arr: [...a],
    state: { arr: [...a] },
    description: `✅ Array terurut: [${a.join(', ')}]`,
    highlights: [],
    sorted: Array.from({ length: n }, (_, i) => i),
  });
  return steps;
}

function genInsertionSort(arr: number[]): Step[] {
  const a = [...arr];
  const steps: Step[] = [];
  steps.push({
    line: [0],
    arr: [...a],
    state: { arr: [...a] },
    description: 'Mulai Insertion Sort',
    highlights: [],
    sorted: [0],
  });
  for (let i = 1; i < a.length; i++) {
    steps.push({
      line: [1],
      arr: [...a],
      state: { i },
      description: `i = ${i}, ambil elemen arr[${i}] = ${a[i]}`,
      highlights: [i],
      sorted: Array.from({ length: i }, (_, k) => k),
    });
    const key = a[i];
    steps.push({
      line: [2],
      arr: [...a],
      state: { key, i },
      description: `key = arr[${i}] = ${key}`,
      highlights: [i],
      sorted: Array.from({ length: i }, (_, k) => k),
    });
    let j = i - 1;
    steps.push({
      line: [3],
      arr: [...a],
      state: { j, key },
      description: `j = i - 1 = ${j}`,
      highlights: [j],
      sorted: Array.from({ length: i }, (_, k) => k),
    });
    while (j >= 0 && a[j] > key) {
      steps.push({
        line: [4],
        arr: [...a],
        state: { 'arr[j]': a[j], key, j },
        description: `arr[${j}]=${a[j]} > key=${key}? Ya, geser`,
        highlights: [j, j + 1],
        comparing: [j],
        sorted: Array.from({ length: i }, (_, k) => k),
      });
      a[j + 1] = a[j];
      steps.push({
        line: [5],
        arr: [...a],
        state: { 'arr[j+1]': a[j + 1], arr: [...a] },
        description: `arr[${j + 1}] = arr[${j}] = ${a[j]} → [${a.join(', ')}]`,
        highlights: [j, j + 1],
        swapping: [j, j + 1],
        sorted: Array.from({ length: i }, (_, k) => k),
      });
      j--;
    }
    a[j + 1] = key;
    steps.push({
      line: [7],
      arr: [...a],
      state: { 'arr[j+1]': key, j: j + 1 },
      description: `Sisipkan key=${key} di posisi ${j + 1} → [${a.join(', ')}]`,
      highlights: [j + 1],
      sorted: Array.from({ length: i + 1 }, (_, k) => k),
    });
  }
  steps.push({
    line: [9],
    arr: [...a],
    state: { arr: [...a] },
    description: `✅ Array terurut: [${a.join(', ')}]`,
    highlights: [],
    sorted: Array.from({ length: a.length }, (_, i) => i),
  });
  return steps;
}

function genSelectionSort(arr: number[]): Step[] {
  const a = [...arr];
  const steps: Step[] = [];
  const n = a.length;
  const sorted: number[] = [];
  steps.push({
    line: [0],
    arr: [...a],
    state: { arr: [...a] },
    description: 'Mulai Selection Sort',
    highlights: [],
  });
  steps.push({
    line: [1],
    arr: [...a],
    state: { n },
    description: `n = ${n}`,
    highlights: [],
  });
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    steps.push({
      line: [2],
      arr: [...a],
      state: { i },
      description: `Pass ke-${i + 1}: cari minimum dari indeks ${i} sampai ${n - 1}`,
      highlights: Array.from({ length: n - i }, (_, k) => i + k),
      sorted: [...sorted],
    });
    steps.push({
      line: [3],
      arr: [...a],
      state: { minIdx: i, i },
      description: `minIdx = ${i} (asumsikan arr[${i}]=${a[i]} adalah minimum)`,
      highlights: [i],
      pivot: i,
      sorted: [...sorted],
    });
    for (let j = i + 1; j < n; j++) {
      steps.push({
        line: [4],
        arr: [...a],
        state: { j, 'arr[j]': a[j], 'arr[minIdx]': a[minIdx], minIdx },
        description: `j = ${j}, bandingkan arr[${j}]=${a[j]} < arr[minIdx=${minIdx}]=${a[minIdx]}?`,
        highlights: [j, minIdx],
        comparing: [j, minIdx],
        pivot: minIdx,
        sorted: [...sorted],
      });
      if (a[j] < a[minIdx]) {
        minIdx = j;
        steps.push({
          line: [5],
          arr: [...a],
          state: { minIdx },
          description: `Minimum baru ditemukan! minIdx = ${minIdx}, nilai = ${a[minIdx]}`,
          highlights: [minIdx],
          pivot: minIdx,
          sorted: [...sorted],
        });
      }
    }
    steps.push({
      line: [7],
      arr: [...a],
      state: { i, minIdx },
      description: `Swap arr[${i}]=${a[i]} dengan arr[${minIdx}]=${a[minIdx]}`,
      highlights: [i, minIdx],
      swapping: [i, minIdx],
      sorted: [...sorted],
    });
    [a[i], a[minIdx]] = [a[minIdx], a[i]];
    sorted.push(i);
    steps.push({
      line: [7],
      arr: [...a],
      state: { arr: [...a] },
      description: `Setelah swap: [${a.join(', ')}]`,
      highlights: [i],
      sorted: [...sorted],
    });
  }
  sorted.push(n - 1);
  steps.push({
    line: [9],
    arr: [...a],
    state: { arr: [...a] },
    description: `✅ Array terurut: [${a.join(', ')}]`,
    highlights: [],
    sorted: Array.from({ length: n }, (_, i) => i),
  });
  return steps;
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  error?: string;
}

function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  className,
  error,
}: InputProps) {
  return (
    <div className="flex w-full flex-col gap-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={cn(
          `rounded-lg border px-3 py-2 transition-all outline-none ${error ? 'border-red-500' : 'border-gray-300'}`,
          className,
        )}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

export default function AlgorithmVisualizer() {
  const [selectedAlgo, setSelectedAlgo] = useState<AlgoKey>('linearSearch');
  const [arrayInput, setArrayInput] = useState('5, 3, 8, 1, 9, 2, 7, 4, 6');
  const [targetInput, setTargetInput] = useState('7');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerated, setIsGenerated] = useState(false);

  const algo = ALGORITHMS[selectedAlgo];
  const isSearch =
    selectedAlgo === 'linearSearch' || selectedAlgo === 'binarySearch';

  const parseArray = () =>
    arrayInput
      .split(',')
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));

  const generate = useCallback(() => {
    const arr = parseArray();
    const target = parseInt(targetInput);
    let s: Step[] = [];
    switch (selectedAlgo) {
      case 'linearSearch':
        s = genLinearSearch(arr, isNaN(target) ? 0 : target);
        break;
      case 'binarySearch':
        s = genBinarySearch(arr, isNaN(target) ? 0 : target);
        break;
      case 'bubbleSort':
        s = genBubbleSort(arr);
        break;
      case 'insertionSort':
        s = genInsertionSort(arr);
        break;
      case 'selectionSort':
        s = genSelectionSort(arr);
        break;
    }
    setSteps(s);
    setCurrentStep(0);
    setIsGenerated(true);
  }, [selectedAlgo, arrayInput, targetInput]);

  useEffect(() => {
    setIsGenerated(false);
    setSteps([]);
    setCurrentStep(0);
  }, [selectedAlgo]);

  // ✅ FIX: Use step.arr (snapshot) instead of re-parsing arrayInput
  const step = steps[currentStep];
  const displayArr = isGenerated && step ? step.arr : parseArray();

  const maxVal = Math.max(...displayArr, 1);

  // ─── Bar Colors ──────────────────────────────────────────────────────────────
  const getBarStyle = (idx: number) => {
    if (!isGenerated || !step) {
      return {
        bg: 'bg-slate-600',
        border: 'border-slate-500',
        glow: '',
        scale: '',
      };
    }
    const isSorted = step.sorted?.includes(idx);
    const isFound = step.found !== undefined && step.found === idx;
    const isSwapping = step.swapping?.includes(idx);
    const isComparing = step.comparing?.includes(idx);
    const isHighlighted = step.highlights?.includes(idx);
    const isPivot = step.pivot === idx;

    if (isFound && step.found !== -1)
      return {
        bg: 'bg-emerald-400',
        border: 'border-emerald-300',
        glow: 'shadow-[0_0_20px_rgba(52,211,153,0.8)]',
        scale: 'scale-110',
      };
    if (isSwapping)
      return {
        bg: 'bg-rose-400',
        border: 'border-rose-300',
        glow: 'shadow-[0_0_16px_rgba(251,113,133,0.7)]',
        scale: 'scale-105',
      };
    if (isPivot)
      return {
        bg: 'bg-amber-400',
        border: 'border-amber-300',
        glow: 'shadow-[0_0_14px_rgba(251,191,36,0.7)]',
        scale: 'scale-105',
      };
    if (isComparing)
      return {
        bg: 'bg-sky-400',
        border: 'border-sky-300',
        glow: 'shadow-[0_0_14px_rgba(56,189,248,0.7)]',
        scale: 'scale-105',
      };
    if (isHighlighted)
      return {
        bg: 'bg-violet-400',
        border: 'border-violet-300',
        glow: 'shadow-[0_0_10px_rgba(167,139,250,0.5)]',
        scale: '',
      };
    if (isSorted)
      return {
        bg: 'bg-emerald-600',
        border: 'border-emerald-500',
        glow: '',
        scale: '',
      };
    return {
      bg: 'bg-slate-600',
      border: 'border-slate-500',
      glow: '',
      scale: '',
    };
  };

  useEffect(() => {
    toast.info('Disarankan menggunakan device desktop');
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1117] font-mono text-slate-200">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-slate-800 bg-[#0d1117]/95 backdrop-blur">
        <div className="mx-auto flex max-w-400 flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href={'/'}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-sky-500 text-sm font-bold text-white">
                AV
              </div>
            </Link>
            <div>
              <h1 className="text-base leading-none font-bold text-white">
                Algorithm Visualizer
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Interactive Learning Tool
              </p>
            </div>
          </div>

          {/* Algorithm Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(ALGORITHMS) as AlgoKey[]).map((key) => {
              const a = ALGORITHMS[key];
              const active = selectedAlgo === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedAlgo(key)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? 'border-violet-400 bg-violet-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.5)]'
                      : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                  }`}
                >
                  <span
                    className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                      a.category === 'Search' ? 'bg-sky-400' : 'bg-amber-400'
                    }`}
                  />
                  {a.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Config Bar */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-end gap-4 px-4 py-3">
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-slate-400">Array (pisah koma)</Label>
            <Input
              value={arrayInput}
              onChange={(e) => {
                setArrayInput(e.target.value);
                setIsGenerated(false);
              }}
              className="h-8 w-72 border-slate-700 bg-slate-800 font-mono text-xs text-slate-200"
              placeholder="1, 2, 3, 4, ..."
            />
          </div>
          {isSearch && (
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-slate-400">Target</Label>
              <Input
                value={targetInput}
                onChange={(e) => {
                  setTargetInput(e.target.value);
                  setIsGenerated(false);
                }}
                className="h-8 w-20 border-slate-700 bg-slate-800 font-mono text-xs text-slate-200"
                placeholder="7"
              />
            </div>
          )}
          <Button
            onClick={generate}
            className="h-8 border-0 bg-violet-600 px-5 text-xs text-white hover:bg-violet-500"
          >
            ▶ Generate Steps
          </Button>
          {isGenerated && (
            <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
              <span className="font-bold text-violet-400">{steps.length}</span>{' '}
              langkah ditemukan
            </div>
          )}
        </div>
      </div>

      {/* Main Split View */}
      <div className="mx-auto max-w-[1600px] px-4 py-4">
        <div className="grid h-[calc(100vh-220px)] min-h-[500px] grid-cols-2 gap-4">
          {/* ── LEFT: Code Panel ── */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#161b22]">
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="ml-2 text-xs text-slate-400">
                  {algo.name.toLowerCase().replace(' ', '_')}.js
                </span>
              </div>
              <Badge
                variant="outlined"
                className={`border-slate-700 text-xs ${
                  algo.category === 'Search' ? 'text-sky-400' : 'text-amber-400'
                }`}
              >
                {algo.category}
              </Badge>
            </div>

            {/* State Display */}
            {isGenerated && step && (
              <div className="border-b border-slate-800 bg-slate-900/30 px-4 py-2.5">
                <p className="mb-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Current State
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(step.state).map(([k, v]) => {
                    if (Array.isArray(v)) return null;
                    return (
                      <div
                        key={k}
                        className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1"
                      >
                        <span className="text-xs font-semibold text-violet-400">
                          {k}
                        </span>
                        <span className="text-xs text-slate-500">=</span>
                        <span className="font-mono text-xs text-amber-300">
                          {JSON.stringify(v)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Code */}
            <div className="flex-1 overflow-auto p-2">
              <div className="font-mono text-sm">
                {algo.code.map((line, idx) => {
                  const isActive = isGenerated && step?.line.includes(idx);
                  const isDim = isGenerated && step && !step.line.includes(idx);
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-0 rounded-md transition-all duration-200 ${
                        isActive
                          ? 'border-l-2 border-violet-400 bg-violet-500/20'
                          : 'border-l-2 border-transparent'
                      }`}
                    >
                      <span
                        className={`w-10 shrink-0 px-2 py-1.5 text-right text-xs transition-colors select-none ${
                          isActive ? 'text-violet-400' : 'text-slate-600'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <pre
                        className={`flex-1 py-1.5 pr-4 text-sm leading-relaxed break-all whitespace-pre-wrap transition-opacity duration-200 ${
                          isActive
                            ? 'text-white opacity-100'
                            : isDim
                              ? 'text-slate-600 opacity-40'
                              : 'text-slate-300 opacity-100'
                        }`}
                      >
                        {line}
                      </pre>
                      {isActive && (
                        <span className="mt-1.5 mr-2 shrink-0 animate-pulse text-xs text-violet-400">
                          ◀
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Visualization Panel ── */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#161b22]">
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="ml-2 text-xs text-slate-400">
                  visualization.view
                </span>
              </div>
              {isGenerated && (
                <span className="text-xs text-slate-500">
                  Step{' '}
                  <span className="font-bold text-white">
                    {currentStep + 1}
                  </span>{' '}
                  / {steps.length}
                </span>
              )}
            </div>

            {/* Description */}
            {isGenerated && step ? (
              <div className="flex min-h-[52px] items-center border-b border-slate-800 bg-slate-900/30 px-4 py-2.5">
                <p className="text-sm leading-snug text-slate-300">
                  {step.description}
                </p>
              </div>
            ) : (
              <div className="flex min-h-[52px] items-center border-b border-slate-800 bg-slate-900/30 px-4 py-2.5">
                <p className="text-sm text-slate-600">
                  Klik &quot;Generate Steps&quot; untuk mulai visualisasi...
                </p>
              </div>
            )}

            {/* Visualization Area */}
            <div className="flex flex-1 flex-col items-center justify-center gap-6 overflow-hidden px-6 py-4">
              {!isGenerated ? (
                <div className="flex flex-col items-center gap-4 text-slate-600">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 text-3xl">
                    📊
                  </div>
                  <p className="text-sm">Visualisasi akan muncul di sini</p>
                </div>
              ) : (
                <>
                  {/* Bar Chart */}
                  <div className="flex min-h-0 w-full flex-1 items-end justify-center gap-1.5 pb-2">
                    {displayArr.map((val, idx) => {
                      const barStyle = getBarStyle(idx);
                      const heightPct = Math.max((val / maxVal) * 100, 8);
                      return (
                        <div
                          key={idx}
                          className="flex min-w-0 flex-1 flex-col items-center gap-1"
                          style={{ maxWidth: '64px' }}
                        >
                          <span
                            className={`text-xs font-bold transition-colors ${
                              barStyle.scale ? 'text-white' : 'text-slate-500'
                            }`}
                          >
                            {val}
                          </span>
                          <div
                            className={`w-full rounded-t-md border transition-all duration-300 ${barStyle.bg} ${barStyle.border} ${barStyle.glow} ${barStyle.scale}`}
                            style={{
                              height: `${heightPct}%`,
                              minHeight: '20px',
                              transform: barStyle.scale
                                ? 'scaleY(1.05)'
                                : 'scaleY(1)',
                              transformOrigin: 'bottom',
                            }}
                          />
                          <span className="font-mono text-xs text-slate-600">
                            [{idx}]
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap justify-center gap-3">
                    <LegendItem color="bg-sky-400" label="Dibandingkan" />
                    <LegendItem color="bg-violet-400" label="Highlighted" />
                    <LegendItem color="bg-rose-400" label="Swap" />
                    <LegendItem color="bg-amber-400" label="Minimum/Pivot" />
                    <LegendItem color="bg-emerald-400" label="Ditemukan" />
                    <LegendItem color="bg-emerald-600" label="Terurut" />
                  </div>
                </>
              )}
            </div>

            {/* Step Controls */}
            <div className="border-t border-slate-800 bg-slate-900/30 px-4 py-3">
              {isGenerated && steps.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {/* Slider */}
                  <div className="flex items-center gap-3">
                    <span className="w-4 shrink-0 text-xs text-slate-600">
                      0
                    </span>
                    <Slider
                      min={0}
                      max={steps.length - 1}
                      value={[currentStep]}
                      onValueChange={([v]) => setCurrentStep(v)}
                      className="flex-1"
                    />
                    <span className="w-6 shrink-0 text-right text-xs text-slate-600">
                      {steps.length - 1}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outlined"
                      size="sm"
                      onClick={() => setCurrentStep(0)}
                      disabled={currentStep === 0}
                      className="h-8 border-slate-700 bg-purple-500 px-3 text-xs font-semibold text-slate-300 hover:bg-purple-700 disabled:opacity-30"
                    >
                      ⏮ Awal
                    </Button>
                    <Button
                      variant="outlined"
                      size="sm"
                      onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                      disabled={currentStep === 0}
                      className="h-8 border-slate-700 bg-purple-500 px-4 text-xs text-slate-300 hover:bg-purple-700 disabled:opacity-30"
                    >
                      ← Prev
                    </Button>
                    <div className="min-w-[80px] rounded-md border border-slate-700 bg-purple-900 px-4 py-1.5 text-center text-xs font-bold text-slate-300">
                      {currentStep + 1} / {steps.length}
                    </div>
                    <Button
                      variant="outlined"
                      size="sm"
                      onClick={() =>
                        setCurrentStep((s) => Math.min(steps.length - 1, s + 1))
                      }
                      disabled={currentStep === steps.length - 1}
                      className="h-8 border-slate-700 bg-purple-500 px-4 text-xs text-slate-300 hover:bg-purple-700 disabled:opacity-30"
                    >
                      Next →
                    </Button>
                    <Button
                      variant="outlined"
                      size="sm"
                      onClick={() => setCurrentStep(steps.length - 1)}
                      disabled={currentStep === steps.length - 1}
                      className="h-8 border-slate-700 bg-purple-500 px-3 text-xs text-slate-300 hover:bg-purple-700 disabled:opacity-30"
                    >
                      Akhir ⏭
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="py-1 text-center text-xs text-slate-600">
                  Generate steps terlebih dahulu
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`h-3 w-3 rounded-sm ${color}`} />
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}
