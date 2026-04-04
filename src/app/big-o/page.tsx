'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type BigOKey = 'O1' | 'Ologn' | 'On' | 'Onlogn' | 'On2' | 'On3' | 'O2n';

interface LineStep {
  lineIndex: number;
  rawComplexity: string;
  explanation: string;
  stateVars?: Record<string, string>;
  runningTotal?: string;
}

interface Example {
  title: string;
  description: string;
  code: string[];
  steps: LineStep[];
  finalRaw: string;
  simplification: string[];
  finalBigO: BigOKey;
}

interface NotationDef {
  key: BigOKey;
  label: string;
  name: string;
  color: string;
  accent: string;
  graphFn: (n: number) => number;
  description: string;
  examples: Example[];
}

// ─── Graph Config ─────────────────────────────────────────────────────────────

const BIG_O_ORDER: BigOKey[] = [
  'O1',
  'Ologn',
  'On',
  'Onlogn',
  'On2',
  'On3',
  'O2n',
];

const GRAPH_COLORS: Record<BigOKey, string> = {
  O1: '#34d399',
  Ologn: '#38bdf8',
  On: '#a78bfa',
  Onlogn: '#fb923c',
  On2: '#fbbf24',
  On3: '#f87171',
  O2n: '#ec4899',
};

const GRAPH_LABELS: Record<BigOKey, string> = {
  O1: 'O(1)',
  Ologn: 'O(log n)',
  On: 'O(n)',
  Onlogn: 'O(n log n)',
  On2: 'O(n²)',
  On3: 'O(n³)',
  O2n: 'O(2ⁿ)',
};

function graphFn(key: BigOKey, n: number): number {
  switch (key) {
    case 'O1':
      return 1;
    case 'Ologn':
      return Math.log2(n + 1);
    case 'On':
      return n;
    case 'Onlogn':
      return n * Math.log2(n + 1);
    case 'On2':
      return n * n;
    case 'On3':
      return n * n * n;
    case 'O2n':
      return Math.pow(2, n);
  }
}

// ─── Notation Definitions ─────────────────────────────────────────────────────

const NOTATIONS: NotationDef[] = [
  {
    key: 'O1',
    label: 'O(1)',
    name: 'Waktu Konstan',
    color: 'from-emerald-500/20 to-emerald-900/10',
    accent: '#34d399',
    graphFn: (n) => graphFn('O1', n),
    description: 'Waktu eksekusi tetap konstan berapapun ukuran input.',
    examples: [
      {
        title: 'Akses Elemen Array',
        description: 'Mengakses elemen berdasarkan indeks — selalu 1 operasi.',
        code: [
          'public int getElement(int[] arr, int index) {',
          '    return arr[index];',
          '}',
        ],
        steps: [
          {
            lineIndex: 0,
            rawComplexity: 'O(1)',
            explanation: 'Deklarasi fungsi — tidak ada biaya',
            stateVars: {},
          },
          {
            lineIndex: 1,
            rawComplexity: 'O(1)',
            explanation:
              'Akses indeks langsung — selalu 1 langkah tanpa peduli ukuran array',
            stateVars: { 'arr[index]': 'pencarian memori langsung' },
          },
          {
            lineIndex: 2,
            rawComplexity: 'O(1)',
            explanation: 'Akhir fungsi',
            stateVars: {},
          },
        ],
        finalRaw: 'O(1) + O(1) = O(1 + 1)',
        simplification: [
          'O(1 + 1)',
          '→ Hapus konstanta: O(1)',
          '→ Hasil akhir: O(1)',
        ],
        finalBigO: 'O1',
      },
      {
        title: 'Pencarian HashMap',
        description: 'HashMap get — rata-rata pencarian O(1).',
        code: [
          'public String getValue(HashMap<String,String> map, String key) {',
          '    String result = map.get(key);',
          '    return result;',
          '}',
        ],
        steps: [
          {
            lineIndex: 0,
            rawComplexity: 'O(1)',
            explanation: 'Deklarasi fungsi',
            stateVars: {},
          },
          {
            lineIndex: 1,
            rawComplexity: 'O(1)',
            explanation:
              'HashMap.get() langsung melakukan hash key — O(1) rata-rata',
            stateVars: { 'hash(key)': 'dihitung sekali' },
          },
          {
            lineIndex: 2,
            rawComplexity: 'O(1)',
            explanation: 'Pernyataan return — konstan',
            stateVars: {},
          },
          {
            lineIndex: 3,
            rawComplexity: 'O(1)',
            explanation: 'Akhir fungsi',
            stateVars: {},
          },
        ],
        finalRaw: 'O(1) + O(1) + O(1)',
        simplification: [
          'O(1) + O(1) + O(1)',
          '→ Hapus konstanta: O(3)',
          '→ Hasil akhir: O(1)',
        ],
        finalBigO: 'O1',
      },
      {
        title: 'Push Stack',
        description: 'Push ke stack — penyisipan waktu konstan.',
        code: [
          'public void push(Stack<Integer> stack, int val) {',
          '    stack.push(val);',
          '    System.out.println("Ditambahkan: " + val);',
          '}',
        ],
        steps: [
          {
            lineIndex: 0,
            rawComplexity: 'O(1)',
            explanation: 'Deklarasi fungsi',
            stateVars: {},
          },
          {
            lineIndex: 1,
            rawComplexity: 'O(1)',
            explanation: 'Push ke atas stack — selalu 1 operasi',
            stateVars: { 'stack.size': '+1' },
          },
          {
            lineIndex: 2,
            rawComplexity: 'O(1)',
            explanation: 'Pernyataan print — output konstan',
            stateVars: {},
          },
          {
            lineIndex: 3,
            rawComplexity: 'O(1)',
            explanation: 'Akhir fungsi',
            stateVars: {},
          },
        ],
        finalRaw: 'O(1) + O(1) + O(1)',
        simplification: [
          'O(1) + O(1) + O(1)',
          '→ Hapus konstanta: O(3)',
          '→ Hasil akhir: O(1)',
        ],
        finalBigO: 'O1',
      },
    ],
  },
  {
    key: 'Ologn',
    label: 'O(log n)',
    name: 'Waktu Logaritmik',
    color: 'from-sky-500/20 to-sky-900/10',
    accent: '#38bdf8',
    graphFn: (n) => graphFn('Ologn', n),
    description:
      'Membagi masalah menjadi setengah di setiap langkah. Sangat efisien.',
    examples: [
      {
        title: 'Binary Search',
        description:
          'Setiap langkah memotong ruang pencarian menjadi setengah.',
        code: [
          'public int binarySearch(int[] arr, int target) {',
          '    int left = 0, right = arr.length - 1;',
          '    while (left <= right) {',
          '        int mid = (left + right) / 2;',
          '        if (arr[mid] == target) return mid;',
          '        else if (arr[mid] < target) left = mid + 1;',
          '        else right = mid - 1;',
          '    }',
          '    return -1;',
          '}',
        ],
        steps: [
          {
            lineIndex: 0,
            rawComplexity: 'O(1)',
            explanation: 'Deklarasi fungsi',
            stateVars: {},
          },
          {
            lineIndex: 1,
            rawComplexity: 'O(1)',
            explanation: 'Inisialisasi pointer kiri dan kanan — konstan',
            stateVars: { left: '0', right: 'n-1' },
          },
          {
            lineIndex: 2,
            rawComplexity: 'O(log n)',
            explanation:
              'Loop berjalan log₂(n) kali — membagi ruang pencarian setengah setiap iterasi',
            stateVars: { iterasi: 'log₂(n)' },
          },
          {
            lineIndex: 3,
            rawComplexity: 'O(1)',
            explanation: 'Hitung mid — aritmatika konstan',
            stateVars: { mid: '(left+right)/2' },
          },
          {
            lineIndex: 4,
            rawComplexity: 'O(1)',
            explanation: 'Perbandingan — konstan',
            stateVars: {},
          },
          {
            lineIndex: 5,
            rawComplexity: 'O(1)',
            explanation: 'Sesuaikan left — konstan',
            stateVars: {},
          },
          {
            lineIndex: 6,
            rawComplexity: 'O(1)',
            explanation: 'Sesuaikan right — konstan',
            stateVars: {},
          },
          {
            lineIndex: 8,
            rawComplexity: 'O(1)',
            explanation: 'Return — konstan',
            stateVars: {},
          },
        ],
        finalRaw: 'O(1) + O(log n) * O(1)',
        simplification: [
          'O(1) + O(log n × 1)',
          '→ Suku dominan: O(log n)',
          '→ Hasil akhir: O(log n)',
        ],
        finalBigO: 'Ologn',
      },
      {
        title: 'Hitung Tinggi Pohon',
        description: 'Melintasi tinggi BST seimbang — log n level.',
        code: [
          'public int treeHeight(TreeNode root) {',
          '    if (root == null) return 0;',
          '    int left = treeHeight(root.left);',
          '    int right = treeHeight(root.right);',
          '    return Math.max(left, right) + 1;',
          '}',
        ],
        steps: [
          {
            lineIndex: 0,
            rawComplexity: 'O(1)',
            explanation: 'Deklarasi fungsi',
            stateVars: {},
          },
          {
            lineIndex: 1,
            rawComplexity: 'O(1)',
            explanation: 'Pengecekan kasus dasar — konstan',
            stateVars: {},
          },
          {
            lineIndex: 2,
            rawComplexity: 'O(log n)',
            explanation: 'Rekursi kiri — BST seimbang punya kedalaman log n',
            stateVars: { kedalaman: 'log₂(n)' },
          },
          {
            lineIndex: 3,
            rawComplexity: 'O(log n)',
            explanation: 'Rekursi kanan — kedalaman log n yang sama',
            stateVars: { kedalaman: 'log₂(n)' },
          },
          {
            lineIndex: 4,
            rawComplexity: 'O(1)',
            explanation: 'Math.max — perbandingan konstan',
            stateVars: {},
          },
        ],
        finalRaw: 'O(log n) + O(log n)',
        simplification: [
          'O(log n) + O(log n)',
          '→ O(2 log n)',
          '→ Hapus konstanta: O(log n)',
          '→ Hasil akhir: O(log n)',
        ],
        finalBigO: 'Ologn',
      },
      {
        title: 'Cek Pangkat Dua',
        description: 'Hitung berapa kali n bisa dibagi dua.',
        code: [
          'public int countHalving(int n) {',
          '    int count = 0;',
          '    while (n > 1) {',
          '        n = n / 2;',
          '        count++;',
          '    }',
          '    return count;',
          '}',
        ],
        steps: [
          {
            lineIndex: 0,
            rawComplexity: 'O(1)',
            explanation: 'Deklarasi fungsi',
            stateVars: {},
          },
          {
            lineIndex: 1,
            rawComplexity: 'O(1)',
            explanation: 'Inisialisasi count',
            stateVars: { count: '0' },
          },
          {
            lineIndex: 2,
            rawComplexity: 'O(log n)',
            explanation: 'Loop membagi n setiap kali — berjalan log₂(n) kali',
            stateVars: { iterasi: 'log₂(n)' },
          },
          {
            lineIndex: 3,
            rawComplexity: 'O(1)',
            explanation: 'Pembagian integer — konstan',
            stateVars: { n: 'n/2' },
          },
          {
            lineIndex: 4,
            rawComplexity: 'O(1)',
            explanation: 'Tambah counter — konstan',
            stateVars: { count: 'count+1' },
          },
          {
            lineIndex: 6,
            rawComplexity: 'O(1)',
            explanation: 'Return — konstan',
            stateVars: {},
          },
        ],
        finalRaw: 'O(1) + O(log n) × O(1)',
        simplification: [
          'O(log n × 1)',
          '→ Suku dominan: O(log n)',
          '→ Hasil akhir: O(log n)',
        ],
        finalBigO: 'Ologn',
      },
    ],
  },
  {
    key: 'On',
    label: 'O(n)',
    name: 'Waktu Linear',
    color: 'from-violet-500/20 to-violet-900/10',
    accent: '#a78bfa',
    graphFn: (n) => graphFn('On', n),
    description: 'Waktu tumbuh secara linear seiring ukuran input.',
    examples: [
      {
        title: 'Pencarian Linear',
        description: 'Pindai setiap elemen satu per satu.',
        code: [
          'public int linearSearch(int[] arr, int target) {',
          '    for (int i = 0; i < arr.length; i++) {',
          '        if (arr[i] == target) {',
          '            return i;',
          '        }',
          '    }',
          '    return -1;',
          '}',
        ],
        steps: [
          {
            lineIndex: 0,
            rawComplexity: 'O(1)',
            explanation: 'Deklarasi fungsi',
            stateVars: {},
          },
          {
            lineIndex: 1,
            rawComplexity: 'O(n)',
            explanation: 'For loop berjalan n kali — sekali per elemen',
            stateVars: { i: '0 → n-1' },
          },
          {
            lineIndex: 2,
            rawComplexity: 'O(1)',
            explanation: 'Akses array + perbandingan — konstan per iterasi',
            stateVars: { 'arr[i]': 'dicek' },
          },
          {
            lineIndex: 3,
            rawComplexity: 'O(1)',
            explanation: 'Return — konstan',
            stateVars: {},
          },
          {
            lineIndex: 6,
            rawComplexity: 'O(1)',
            explanation: 'Return -1 — konstan',
            stateVars: {},
          },
        ],
        finalRaw: 'O(1) + O(n) × O(1) + O(1)',
        simplification: [
          'O(n × 1)',
          '→ Suku dominan: O(n)',
          '→ Hasil akhir: O(n)',
        ],
        finalBigO: 'On',
      },
      {
        title: 'Jumlah Array',
        description: 'Jumlahkan semua elemen — menyentuh setiap elemen sekali.',
        code: [
          'public int arraySum(int[] arr) {',
          '    int sum = 0;',
          '    for (int i = 0; i < arr.length; i++) {',
          '        sum += arr[i];',
          '    }',
          '    return sum;',
          '}',
        ],
        steps: [
          {
            lineIndex: 0,
            rawComplexity: 'O(1)',
            explanation: 'Deklarasi fungsi',
            stateVars: {},
          },
          {
            lineIndex: 1,
            rawComplexity: 'O(1)',
            explanation: 'Inisialisasi sum — konstan',
            stateVars: { sum: '0' },
          },
          {
            lineIndex: 2,
            rawComplexity: 'O(n)',
            explanation: 'Loop berjalan n kali',
            stateVars: { i: '0 → n-1' },
          },
          {
            lineIndex: 3,
            rawComplexity: 'O(1)',
            explanation: 'Penjumlahan per langkah — konstan',
            stateVars: { sum: 'sum + arr[i]' },
          },
          {
            lineIndex: 5,
            rawComplexity: 'O(1)',
            explanation: 'Return sum — konstan',
            stateVars: {},
          },
        ],
        finalRaw: 'O(1) + O(n) + O(1)',
        simplification: [
          'O(1 + n + 1)',
          '→ Suku dominan: O(n)',
          '→ Hasil akhir: O(n)',
        ],
        finalBigO: 'On',
      },
      {
        title: 'Balik String',
        description: 'Balik string — mengunjungi setiap karakter sekali.',
        code: [
          'public String reverse(String s) {',
          '    StringBuilder sb = new StringBuilder();',
          '    for (int i = s.length()-1; i >= 0; i--) {',
          '        sb.append(s.charAt(i));',
          '    }',
          '    return sb.toString();',
          '}',
        ],
        steps: [
          {
            lineIndex: 0,
            rawComplexity: 'O(1)',
            explanation: 'Deklarasi fungsi',
            stateVars: {},
          },
          {
            lineIndex: 1,
            rawComplexity: 'O(1)',
            explanation: 'Buat StringBuilder — inisialisasi konstan',
            stateVars: {},
          },
          {
            lineIndex: 2,
            rawComplexity: 'O(n)',
            explanation: 'Loop iterasi n kali (panjang string)',
            stateVars: { i: 'n-1 → 0' },
          },
          {
            lineIndex: 3,
            rawComplexity: 'O(1)',
            explanation: 'charAt + append — konstan per iterasi',
            stateVars: {},
          },
          {
            lineIndex: 5,
            rawComplexity: 'O(1)',
            explanation: 'toString — konstan',
            stateVars: {},
          },
        ],
        finalRaw: 'O(1) + O(n) × O(1) + O(1)',
        simplification: [
          'O(n × 1)',
          '→ Suku dominan: O(n)',
          '→ Hasil akhir: O(n)',
        ],
        finalBigO: 'On',
      },
    ],
  },
  {
    key: 'Onlogn',
    label: 'O(n log n)',
    name: 'Waktu Linearitmik',
    color: 'from-orange-500/20 to-orange-900/10',
    accent: '#fb923c',
    graphFn: (n) => graphFn('Onlogn', n),
    description: 'Umum pada algoritma pengurutan yang efisien.',
    examples: [
      {
        title: 'Merge Sort',
        description:
          'Bagi menjadi setengah (log n) dan gabungkan (n) di setiap level.',
        code: [
          'public void mergeSort(int[] arr, int l, int r) {',
          '    if (l < r) {',
          '        int mid = (l + r) / 2;',
          '        mergeSort(arr, l, mid);',
          '        mergeSort(arr, mid+1, r);',
          '        merge(arr, l, mid, r);',
          '    }',
          '}',
          'private void merge(int[] arr, int l, int m, int r) {',
          '    // salin & gabungkan dua setengah — O(n) kerja',
          '}',
        ],
        steps: [
          {
            lineIndex: 0,
            rawComplexity: 'O(1)',
            explanation: 'Deklarasi fungsi',
            stateVars: {},
          },
          {
            lineIndex: 1,
            rawComplexity: 'O(1)',
            explanation: 'Pengecekan kasus dasar',
            stateVars: {},
          },
          {
            lineIndex: 2,
            rawComplexity: 'O(1)',
            explanation: 'Hitung mid — konstan',
            stateVars: { mid: '(l+r)/2' },
          },
          {
            lineIndex: 3,
            rawComplexity: 'O(log n)',
            explanation: 'Rekursi setengah kiri — log n level rekursi',
            stateVars: { level: 'log₂(n)' },
          },
          {
            lineIndex: 4,
            rawComplexity: 'O(log n)',
            explanation: 'Rekursi setengah kanan — log n level',
            stateVars: { level: 'log₂(n)' },
          },
          {
            lineIndex: 5,
            rawComplexity: 'O(n)',
            explanation:
              'merge() memindai semua elemen di level ini — O(n) per level',
            stateVars: { kerja: 'n per level' },
          },
          {
            lineIndex: 8,
            rawComplexity: 'O(n)',
            explanation: 'Total fungsi merge di semua level = O(n)',
            stateVars: {},
          },
        ],
        finalRaw: 'O(log n) level × O(n) merge per level',
        simplification: [
          'O(log n) × O(n)',
          '→ O(n log n)',
          '→ Hasil akhir: O(n log n)',
        ],
        finalBigO: 'Onlogn',
      },
      {
        title: 'Quick Sort (Rata-rata)',
        description: 'Partisi (n) pada log n level rata-rata.',
        code: [
          'public void quickSort(int[] arr, int low, int high) {',
          '    if (low < high) {',
          '        int pivot = partition(arr, low, high);',
          '        quickSort(arr, low, pivot - 1);',
          '        quickSort(arr, pivot + 1, high);',
          '    }',
          '}',
          'private int partition(int[] arr, int low, int high) {',
          '    int pivot = arr[high];',
          '    int i = low - 1;',
          '    for (int j = low; j < high; j++) {',
          '        if (arr[j] <= pivot) { i++; swap(arr,i,j); }',
          '    }',
          '    swap(arr, i+1, high);',
          '    return i + 1;',
          '}',
        ],
        steps: [
          {
            lineIndex: 0,
            rawComplexity: 'O(1)',
            explanation: 'Deklarasi fungsi',
            stateVars: {},
          },
          {
            lineIndex: 1,
            rawComplexity: 'O(1)',
            explanation: 'Pengecekan kasus dasar',
            stateVars: {},
          },
          {
            lineIndex: 2,
            rawComplexity: 'O(n)',
            explanation:
              'partition() memindai sub-array — O(n) kerja per level',
            stateVars: { kerja: 'n perbandingan' },
          },
          {
            lineIndex: 3,
            rawComplexity: 'O(log n)',
            explanation:
              'Kedalaman rekursi rata-rata — log n level (pivot seimbang)',
            stateVars: { level: 'log₂(n) rata-rata' },
          },
          {
            lineIndex: 4,
            rawComplexity: 'O(log n)',
            explanation: 'Rekursi kanan — kedalaman log n yang sama',
            stateVars: {},
          },
          {
            lineIndex: 10,
            rawComplexity: 'O(n)',
            explanation: 'For loop dalam — n iterasi per panggilan partisi',
            stateVars: { j: 'low → high' },
          },
        ],
        finalRaw: 'O(log n) level × O(n) partisi',
        simplification: [
          'O(log n) × O(n)',
          '→ O(n log n) kasus rata-rata',
          '→ Hasil akhir: O(n log n)',
        ],
        finalBigO: 'Onlogn',
      },
      {
        title: 'Heap Sort',
        description:
          'Bangun heap O(n) + ekstrak n kali O(log n) masing-masing.',
        code: [
          'public void heapSort(int[] arr) {',
          '    int n = arr.length;',
          '    for (int i = n/2-1; i >= 0; i--)',
          '        heapify(arr, n, i);',
          '    for (int i = n-1; i > 0; i--) {',
          '        swap(arr, 0, i);',
          '        heapify(arr, i, 0);',
          '    }',
          '}',
          'void heapify(int[] arr, int n, int i) {',
          '    // sift down — O(log n)',
          '}',
        ],
        steps: [
          {
            lineIndex: 0,
            rawComplexity: 'O(1)',
            explanation: 'Deklarasi fungsi',
            stateVars: {},
          },
          {
            lineIndex: 1,
            rawComplexity: 'O(1)',
            explanation: 'Ambil panjang array',
            stateVars: { n: 'arr.length' },
          },
          {
            lineIndex: 2,
            rawComplexity: 'O(n)',
            explanation: 'Fase bangun heap — total berjalan n/2 iterasi = O(n)',
            stateVars: { iterasi: 'n/2' },
          },
          {
            lineIndex: 3,
            rawComplexity: 'O(log n)',
            explanation: 'Panggilan heapify — O(log n) sift-down masing-masing',
            stateVars: {},
          },
          {
            lineIndex: 4,
            rawComplexity: 'O(n)',
            explanation: 'Fase ekstrak — berjalan n-1 kali',
            stateVars: { i: 'n-1 → 1' },
          },
          {
            lineIndex: 5,
            rawComplexity: 'O(1)',
            explanation: 'Tukar root dengan terakhir — konstan',
            stateVars: {},
          },
          {
            lineIndex: 6,
            rawComplexity: 'O(log n)',
            explanation: 'Re-heapify — O(log n) setiap panggilan',
            stateVars: {},
          },
        ],
        finalRaw: 'O(n) bangun + O(n × log n) ekstrak',
        simplification: [
          'O(n) + O(n log n)',
          '→ Suku dominan: O(n log n)',
          '→ Hasil akhir: O(n log n)',
        ],
        finalBigO: 'Onlogn',
      },
    ],
  },
  {
    key: 'On2',
    label: 'O(n²)',
    name: 'Waktu Kuadratik',
    color: 'from-yellow-500/20 to-yellow-900/10',
    accent: '#fbbf24',
    graphFn: (n) => graphFn('On2', n),
    description: 'Loop bersarang atas n — tumbuh dengan cepat.',
    examples: [
      {
        title: 'Bubble Sort',
        description: 'Loop bersarang membandingkan setiap pasangan.',
        code: [
          'public void bubbleSort(int[] arr) {',
          '    int n = arr.length;',
          '    for (int i = 0; i < n-1; i++) {',
          '        for (int j = 0; j < n-i-1; j++) {',
          '            if (arr[j] > arr[j+1]) {',
          '                int temp = arr[j];',
          '                arr[j] = arr[j+1];',
          '                arr[j+1] = temp;',
          '            }',
          '        }',
          '    }',
          '}',
        ],
        steps: [
          {
            lineIndex: 0,
            rawComplexity: 'O(1)',
            explanation: 'Deklarasi fungsi',
            stateVars: {},
          },
          {
            lineIndex: 1,
            rawComplexity: 'O(1)',
            explanation: 'Ambil panjang — konstan',
            stateVars: { n: 'arr.length' },
          },
          {
            lineIndex: 2,
            rawComplexity: 'O(n)',
            explanation: 'Loop luar — berjalan n-1 kali',
            stateVars: { i: '0 → n-2' },
          },
          {
            lineIndex: 3,
            rawComplexity: 'O(n)',
            explanation: 'Loop dalam — berjalan n-i-1 kali ≈ O(n)',
            stateVars: { j: '0 → n-i-2' },
          },
          {
            lineIndex: 4,
            rawComplexity: 'O(1)',
            explanation: 'Perbandingan — konstan per pasangan',
            stateVars: {},
          },
          {
            lineIndex: 5,
            rawComplexity: 'O(1)',
            explanation: 'Operasi tukar — konstan',
            stateVars: {},
          },
        ],
        finalRaw: 'O(n) × O(n) = O(n × n)',
        simplification: ['O(n) × O(n)', '→ O(n²)', '→ Hasil akhir: O(n²)'],
        finalBigO: 'On2',
      },
      {
        title: 'Perkalian Matriks (Naif)',
        description: 'Tiga loop bersarang — n × n × n/n per sel output.',
        code: [
          'public int[][] multiply(int[][] A, int[][] B, int n) {',
          '    int[][] C = new int[n][n];',
          '    for (int i = 0; i < n; i++) {',
          '        for (int j = 0; j < n; j++) {',
          '            for (int k = 0; k < n; k++) {',
          '                C[i][j] += A[i][k] * B[k][j];',
          '            }',
          '        }',
          '    }',
          '    return C;',
          '}',
        ],
        steps: [
          {
            lineIndex: 0,
            rawComplexity: 'O(1)',
            explanation: 'Deklarasi fungsi',
            stateVars: {},
          },
          {
            lineIndex: 1,
            rawComplexity: 'O(n²)',
            explanation: 'Alokasi matriks n×n — O(n²)',
            stateVars: { ukuran: 'n×n' },
          },
          {
            lineIndex: 2,
            rawComplexity: 'O(n)',
            explanation: 'Loop luar i — n iterasi',
            stateVars: { i: '0 → n-1' },
          },
          {
            lineIndex: 3,
            rawComplexity: 'O(n)',
            explanation: 'Loop tengah j — n iterasi',
            stateVars: { j: '0 → n-1' },
          },
          {
            lineIndex: 4,
            rawComplexity: 'O(n)',
            explanation: 'Loop dalam k — n iterasi',
            stateVars: { k: '0 → n-1' },
          },
          {
            lineIndex: 5,
            rawComplexity: 'O(1)',
            explanation: 'Kali + akumulasi — konstan per sel',
            stateVars: {},
          },
        ],
        finalRaw: 'O(n²) alokasi + O(n) × O(n) × O(n)',
        simplification: [
          'O(n²) + O(n³)',
          '→ Suku dominan: O(n³)',
          '→ Hasil akhir: O(n³)',
        ],
        finalBigO: 'On3',
      },
      {
        title: 'Cek Duplikat',
        description: 'Bandingkan setiap pasangan elemen.',
        code: [
          'public boolean hasDuplicate(int[] arr) {',
          '    int n = arr.length;',
          '    for (int i = 0; i < n; i++) {',
          '        for (int j = i+1; j < n; j++) {',
          '            if (arr[i] == arr[j])',
          '                return true;',
          '        }',
          '    }',
          '    return false;',
          '}',
        ],
        steps: [
          {
            lineIndex: 0,
            rawComplexity: 'O(1)',
            explanation: 'Deklarasi fungsi',
            stateVars: {},
          },
          {
            lineIndex: 1,
            rawComplexity: 'O(1)',
            explanation: 'Ambil panjang — konstan',
            stateVars: { n: 'arr.length' },
          },
          {
            lineIndex: 2,
            rawComplexity: 'O(n)',
            explanation: 'Loop luar — n iterasi',
            stateVars: { i: '0 → n-1' },
          },
          {
            lineIndex: 3,
            rawComplexity: 'O(n)',
            explanation: 'Loop dalam — hingga n-i-1 iterasi ≈ O(n)',
            stateVars: { j: 'i+1 → n-1' },
          },
          {
            lineIndex: 4,
            rawComplexity: 'O(1)',
            explanation: 'Perbandingan — konstan',
            stateVars: {},
          },
          {
            lineIndex: 8,
            rawComplexity: 'O(1)',
            explanation: 'Return false — konstan',
            stateVars: {},
          },
        ],
        finalRaw: 'O(n) × O(n) = O(n × n)',
        simplification: ['O(n × n)', '→ O(n²)', '→ Hasil akhir: O(n²)'],
        finalBigO: 'On2',
      },
    ],
  },
  {
    key: 'On3',
    label: 'O(n³)',
    name: 'Waktu Kubik',
    color: 'from-red-500/20 to-red-900/10',
    accent: '#f87171',
    graphFn: (n) => graphFn('On3', n),
    description: 'Tiga loop bersarang — tumbuh sangat cepat.',
    examples: [
      {
        title: 'Masalah 3-Sum',
        description: 'Temukan semua triplet — tiga loop bersarang.',
        code: [
          'public List<List<Integer>> threeSum(int[] arr) {',
          '    List<List<Integer>> result = new ArrayList<>();',
          '    int n = arr.length;',
          '    for (int i = 0; i < n; i++) {',
          '        for (int j = i+1; j < n; j++) {',
          '            for (int k = j+1; k < n; k++) {',
          '                if (arr[i]+arr[j]+arr[k] == 0)',
          '                    result.add(Arrays.asList(arr[i],arr[j],arr[k]));',
          '            }',
          '        }',
          '    }',
          '    return result;',
          '}',
        ],
        steps: [
          {
            lineIndex: 0,
            rawComplexity: 'O(1)',
            explanation: 'Deklarasi fungsi',
            stateVars: {},
          },
          {
            lineIndex: 1,
            rawComplexity: 'O(1)',
            explanation: 'Inisialisasi list result',
            stateVars: {},
          },
          {
            lineIndex: 2,
            rawComplexity: 'O(1)',
            explanation: 'Ambil panjang',
            stateVars: { n: 'arr.length' },
          },
          {
            lineIndex: 3,
            rawComplexity: 'O(n)',
            explanation: 'Loop pertama — n iterasi',
            stateVars: { i: '0 → n-1' },
          },
          {
            lineIndex: 4,
            rawComplexity: 'O(n)',
            explanation: 'Loop kedua — ~n iterasi',
            stateVars: { j: 'i+1 → n-1' },
          },
          {
            lineIndex: 5,
            rawComplexity: 'O(n)',
            explanation: 'Loop ketiga — ~n iterasi',
            stateVars: { k: 'j+1 → n-1' },
          },
          {
            lineIndex: 6,
            rawComplexity: 'O(1)',
            explanation: 'Cek jumlah — konstan',
            stateVars: {},
          },
        ],
        finalRaw: 'O(n) × O(n) × O(n)',
        simplification: ['O(n × n × n)', '→ O(n³)', '→ Hasil akhir: O(n³)'],
        finalBigO: 'On3',
      },
      {
        title: 'Floyd-Warshall (Semua Pasang Jalur Terpendek)',
        description: 'Tiga loop bersarang atas n simpul.',
        code: [
          'public void floydWarshall(int[][] dist, int n) {',
          '    for (int k = 0; k < n; k++) {',
          '        for (int i = 0; i < n; i++) {',
          '            for (int j = 0; j < n; j++) {',
          '                if (dist[i][k] + dist[k][j] < dist[i][j])',
          '                    dist[i][j] = dist[i][k] + dist[k][j];',
          '            }',
          '        }',
          '    }',
          '}',
        ],
        steps: [
          {
            lineIndex: 0,
            rawComplexity: 'O(1)',
            explanation: 'Deklarasi fungsi',
            stateVars: {},
          },
          {
            lineIndex: 1,
            rawComplexity: 'O(n)',
            explanation: 'Loop luar k — n simpul perantara',
            stateVars: { k: '0 → n-1' },
          },
          {
            lineIndex: 2,
            rawComplexity: 'O(n)',
            explanation: 'Loop tengah i — n simpul sumber',
            stateVars: { i: '0 → n-1' },
          },
          {
            lineIndex: 3,
            rawComplexity: 'O(n)',
            explanation: 'Loop dalam j — n simpul tujuan',
            stateVars: { j: '0 → n-1' },
          },
          {
            lineIndex: 4,
            rawComplexity: 'O(1)',
            explanation: 'Cek dan perbarui jarak — konstan',
            stateVars: {},
          },
        ],
        finalRaw: 'O(n) × O(n) × O(n)',
        simplification: ['O(n³)', '→ Hasil akhir: O(n³)'],
        finalBigO: 'On3',
      },
      {
        title: 'Pangkat Matriks Naif',
        description: 'Kalikan matriks dengan dirinya sendiri n kali.',
        code: [
          'public int[][] matrixPow(int[][] M, int p, int n) {',
          '    int[][] result = identity(n);',
          '    for (int t = 0; t < p; t++) {',
          '        int[][] temp = new int[n][n];',
          '        for (int i = 0; i < n; i++) {',
          '            for (int j = 0; j < n; j++) {',
          '                for (int k = 0; k < n; k++)',
          '                    temp[i][j] += result[i][k] * M[k][j];',
          '            }',
          '        }',
          '        result = temp;',
          '    }',
          '    return result;',
          '}',
        ],
        steps: [
          {
            lineIndex: 0,
            rawComplexity: 'O(1)',
            explanation: 'Deklarasi fungsi',
            stateVars: {},
          },
          {
            lineIndex: 1,
            rawComplexity: 'O(n²)',
            explanation: 'Buat matriks identitas',
            stateVars: {},
          },
          {
            lineIndex: 2,
            rawComplexity: 'O(p)',
            explanation: 'Loop luar — p iterasi',
            stateVars: { t: '0 → p-1' },
          },
          {
            lineIndex: 4,
            rawComplexity: 'O(n)',
            explanation: 'Loop i — n baris',
            stateVars: { i: '0 → n-1' },
          },
          {
            lineIndex: 5,
            rawComplexity: 'O(n)',
            explanation: 'Loop j — n kolom',
            stateVars: { j: '0 → n-1' },
          },
          {
            lineIndex: 6,
            rawComplexity: 'O(n)',
            explanation: 'Loop k — n operasi kali-tambah',
            stateVars: { k: '0 → n-1' },
          },
        ],
        finalRaw: 'O(p) × O(n) × O(n) × O(n)',
        simplification: [
          'O(p × n³)',
          '→ Jika p = n: O(n⁴), jika p konstan: O(n³)',
          '→ Hasil akhir: O(n³)',
        ],
        finalBigO: 'On3',
      },
    ],
  },
  {
    key: 'O2n',
    label: 'O(2ⁿ)',
    name: 'Waktu Eksponensial',
    color: 'from-pink-500/20 to-pink-900/10',
    accent: '#ec4899',
    graphFn: (n) => graphFn('O2n', n),
    description:
      'Berlipat ganda setiap penambahan input — hindari untuk n besar.',
    examples: [
      {
        title: 'Fibonacci (Rekursif)',
        description:
          'Setiap panggilan bercabang menjadi 2 — pohon eksponensial.',
        code: [
          'public int fib(int n) {',
          '    if (n <= 1) return n;',
          '    return fib(n-1) + fib(n-2);',
          '}',
        ],
        steps: [
          {
            lineIndex: 0,
            rawComplexity: 'O(1)',
            explanation: 'Deklarasi fungsi',
            stateVars: {},
          },
          {
            lineIndex: 1,
            rawComplexity: 'O(1)',
            explanation: 'Kasus dasar — konstan',
            stateVars: { 'n <= 1': 'kasus dasar' },
          },
          {
            lineIndex: 2,
            rawComplexity: 'O(2ⁿ)',
            explanation:
              'Setiap panggilan membuat 2 panggilan rekursif → membentuk pohon biner dengan kedalaman n → total 2ⁿ panggilan',
            stateVars: { panggilan: '2ⁿ', kedalaman: 'n level' },
          },
        ],
        finalRaw: '2 cabang × n level = 2ⁿ simpul',
        simplification: [
          'Pohon rekursi biner dengan kedalaman n',
          '→ Total simpul = 2ⁿ',
          '→ Hasil akhir: O(2ⁿ)',
        ],
        finalBigO: 'O2n',
      },
      {
        title: 'Himpunan Kuasa',
        description: 'Hasilkan semua subset — ada 2ⁿ subset.',
        code: [
          'public List<List<Integer>> powerSet(int[] arr) {',
          '    List<List<Integer>> result = new ArrayList<>();',
          '    result.add(new ArrayList<>());',
          '    for (int num : arr) {',
          '        int size = result.size();',
          '        for (int i = 0; i < size; i++) {',
          '            List<Integer> subset = new ArrayList<>(result.get(i));',
          '            subset.add(num);',
          '            result.add(subset);',
          '        }',
          '    }',
          '    return result;',
          '}',
        ],
        steps: [
          {
            lineIndex: 0,
            rawComplexity: 'O(1)',
            explanation: 'Deklarasi fungsi',
            stateVars: {},
          },
          {
            lineIndex: 1,
            rawComplexity: 'O(1)',
            explanation: 'Inisialisasi list result',
            stateVars: {},
          },
          {
            lineIndex: 2,
            rawComplexity: 'O(1)',
            explanation: 'Tambahkan himpunan kosong — dasar',
            stateVars: { subset: '1' },
          },
          {
            lineIndex: 3,
            rawComplexity: 'O(n)',
            explanation: 'Untuk setiap elemen — n iterasi',
            stateVars: { num: 'setiap elemen' },
          },
          {
            lineIndex: 5,
            rawComplexity: 'O(2ⁿ)',
            explanation:
              'Ukuran loop dalam berlipat ganda setiap iterasi luar: 1→2→4→8… = 2ⁿ total',
            stateVars: { ukuran: 'berlipat ganda setiap putaran' },
          },
          {
            lineIndex: 6,
            rawComplexity: 'O(n)',
            explanation: 'Salin subset — O(n) kasus terburuk per salinan',
            stateVars: {},
          },
        ],
        finalRaw: 'Total subset = 2ⁿ, masing-masing hingga ukuran n',
        simplification: [
          'O(n × 2ⁿ)',
          '→ Dominan: O(2ⁿ) untuk n besar',
          '→ Hasil akhir: O(2ⁿ)',
        ],
        finalBigO: 'O2n',
      },
      {
        title: 'Menara Hanoi',
        description: 'n cakram membutuhkan 2ⁿ - 1 gerakan.',
        code: [
          'public void hanoi(int n, char from, char to, char aux) {',
          '    if (n == 1) {',
          '        System.out.println("Pindah cakram 1: "+from+" → "+to);',
          '        return;',
          '    }',
          '    hanoi(n-1, from, aux, to);',
          '    System.out.println("Pindah cakram "+n+": "+from+" → "+to);',
          '    hanoi(n-1, aux, to, from);',
          '}',
        ],
        steps: [
          {
            lineIndex: 0,
            rawComplexity: 'O(1)',
            explanation: 'Deklarasi fungsi',
            stateVars: {},
          },
          {
            lineIndex: 1,
            rawComplexity: 'O(1)',
            explanation: 'Kasus dasar n=1 — konstan',
            stateVars: { 'n==1': '1 gerakan' },
          },
          {
            lineIndex: 5,
            rawComplexity: 'O(2ⁿ)',
            explanation:
              'Panggilan rekursif untuk n-1 cakram — T(n) = 2T(n-1)+1 → O(2ⁿ)',
            stateVars: { T_n: '2T(n-1)+1' },
          },
          {
            lineIndex: 6,
            rawComplexity: 'O(1)',
            explanation: 'Cetak gerakan — konstan',
            stateVars: { gerakan: '2ⁿ - 1 total' },
          },
          {
            lineIndex: 7,
            rawComplexity: 'O(2ⁿ)',
            explanation: 'Panggilan rekursif kedua — rekurens yang sama',
            stateVars: {},
          },
        ],
        finalRaw: 'T(n) = 2T(n-1) + 1 → Terselesaikan menjadi 2ⁿ - 1',
        simplification: [
          'T(n) = 2T(n-1) + 1',
          '→ Rekurens terselesaikan menjadi 2ⁿ - 1',
          '→ Hasil akhir: O(2ⁿ)',
        ],
        finalBigO: 'O2n',
      },
    ],
  },
];

// ─── Big O Graph Component ────────────────────────────────────────────────────

function BigOGraph({ highlightKey }: { highlightKey: BigOKey }) {
  const W = 340,
    H = 220,
    PAD = 36;
  const N = 12;
  const xs = Array.from({ length: N }, (_, i) => i + 1);

  const allVals = BIG_O_ORDER.flatMap((k) => xs.map((x) => graphFn(k, x)));
  const maxVal = Math.min(Math.max(...allVals), graphFn('On2', N) * 1.1);

  const toX = (i: number) => PAD + ((i - 1) / (N - 1)) * (W - PAD * 1.5);
  const toY = (v: number) =>
    H - PAD - Math.min(v / maxVal, 1) * (H - PAD * 1.8);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full">
      <defs>
        {BIG_O_ORDER.map((k) => (
          <filter key={k} id={`glow-${k}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
      </defs>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={PAD}
          x2={W - PAD / 2}
          y1={toY(maxVal * f)}
          y2={toY(maxVal * f)}
          stroke="#1e293b"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
      ))}
      <line
        x1={PAD}
        y1={PAD / 2}
        x2={PAD}
        y2={H - PAD}
        stroke="#334155"
        strokeWidth="1.5"
      />
      <line
        x1={PAD}
        y1={H - PAD}
        x2={W - PAD / 2}
        y2={H - PAD}
        stroke="#334155"
        strokeWidth="1.5"
      />
      <text x={PAD / 2} y={PAD} fill="#475569" fontSize="9" textAnchor="middle">
        ops
      </text>
      <text
        x={W - PAD / 2 + 4}
        y={H - PAD + 4}
        fill="#475569"
        fontSize="9"
        textAnchor="start"
      >
        n
      </text>
      {BIG_O_ORDER.map((k) => {
        const isActive = k === highlightKey;
        const pts = xs
          .map((x) => `${toX(x)},${toY(Math.min(graphFn(k, x), maxVal))}`)
          .join(' ');
        return (
          <g key={k}>
            <polyline
              points={pts}
              fill="none"
              stroke={isActive ? GRAPH_COLORS[k] : '#1e293b'}
              strokeWidth={isActive ? 2.5 : 1}
              opacity={isActive ? 1 : 0.25}
              filter={isActive ? `url(#glow-${k})` : undefined}
            />
            {isActive && (
              <text
                x={toX(N) + 4}
                y={toY(Math.min(graphFn(k, N), maxVal))}
                fill={GRAPH_COLORS[k]}
                fontSize="9"
                dominantBaseline="middle"
              >
                {GRAPH_LABELS[k]}
              </text>
            )}
          </g>
        );
      })}
      {BIG_O_ORDER.filter((k) => k !== highlightKey).map((k) => (
        <text
          key={k}
          x={toX(N) + 4}
          y={toY(Math.min(graphFn(k, N), maxVal))}
          fill="#334155"
          fontSize="8"
          dominantBaseline="middle"
        >
          {GRAPH_LABELS[k]}
        </text>
      ))}
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BigOPage() {
  const [selectedNotation, setSelectedNotation] = useState<NotationDef>(
    NOTATIONS[0],
  );
  const [selectedExampleIdx, setSelectedExampleIdx] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [showFinal, setShowFinal] = useState(false);

  const example = selectedNotation.examples[selectedExampleIdx];
  const totalSteps = example.steps.length;
  const step = showFinal ? null : example.steps[currentStep];
  const activeLines = step ? [step.lineIndex] : [];

  const handleSelectNotation = (n: NotationDef) => {
    setSelectedNotation(n);
    setSelectedExampleIdx(0);
    setCurrentStep(0);
    setShowFinal(false);
  };

  const handleSelectExample = (idx: number) => {
    setSelectedExampleIdx(idx);
    setCurrentStep(0);
    setShowFinal(false);
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setShowFinal(true);
    }
  };

  const handlePrev = () => {
    if (showFinal) {
      setShowFinal(false);
    } else if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const stepProgress = showFinal ? totalSteps : currentStep;
  const hasShown = useRef(false);

  useEffect(() => {
    if (hasShown.current) return;

    hasShown.current = true;
    toast.info('Disarankan menggunakan device desktop');
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#0d1117] font-mono text-slate-200">
      <div className="sticky top-0 z-50 border-b border-slate-800 bg-[#0d1117]/95 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href={'/'}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-sky-500 text-sm font-bold text-white">
                BO
              </div>
            </Link>
            <div>
              <h1 className="text-base leading-none font-bold text-white">
                Notasi Big O
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Visualisasi Kompleksitas Interaktif
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {NOTATIONS.map((n) => (
              <button
                key={n.key}
                onClick={() => handleSelectNotation(n)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedNotation.key === n.key
                    ? 'border-violet-400 bg-violet-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.5)]'
                    : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                }`}
              >
                {n.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-800/60 bg-slate-900/30 px-4 py-2">
          <span className="text-xs text-slate-500">Contoh:</span>
          {selectedNotation.examples.map((ex, i) => (
            <button
              key={i}
              onClick={() => handleSelectExample(i)}
              className={`rounded-md border px-3 py-1 text-xs transition-all ${
                selectedExampleIdx === i
                  ? 'border-slate-500 bg-slate-700 text-slate-200'
                  : 'border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              {ex.title}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-slate-600">
              {selectedNotation.name}
            </span>
            <Badge
              variant="outlined"
              className="border-slate-700 text-xs text-violet-400"
            >
              {selectedNotation.label}
            </Badge>
          </div>
        </div>
      </div>

      <div
        className="grid min-h-0 flex-1 grid-cols-2 gap-0"
        style={{ height: 'calc(100vh - 110px)' }}
      >
        <div className="flex flex-col border-r border-slate-800 bg-[#161b22]">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="ml-2 text-xs text-slate-400">
                {example.title.toLowerCase().replace(/ /g, '_')}.java
              </span>
            </div>
            <span className="text-xs text-slate-500">
              {example.description}
            </span>
          </div>

          <div className="min-h-[52px] border-b border-slate-800 bg-slate-900/20 px-4 py-2.5">
            {!showFinal &&
            step &&
            Object.keys(step.stateVars || {}).length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs tracking-wider text-slate-600 uppercase">
                  Status:
                </span>
                {Object.entries(step.stateVars!).map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1"
                  >
                    <span className="text-xs font-semibold text-violet-400">
                      {k}
                    </span>
                    <span className="text-xs text-slate-500">=</span>
                    <span className="text-xs text-amber-300">{v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-600 italic">
                {showFinal
                  ? '✅ Analisis selesai — lihat penyederhanaan di kanan'
                  : 'Langkahi untuk melihat status...'}
              </p>
            )}
          </div>

          <div className="flex-1 overflow-auto p-2">
            {example.code.map((line, idx) => {
              const isActive = !showFinal && activeLines.includes(idx);
              const isDim =
                !showFinal &&
                activeLines.length > 0 &&
                !activeLines.includes(idx);
              return (
                <div
                  key={idx}
                  className={`flex items-start rounded-md transition-all duration-200 ${
                    isActive
                      ? 'border-l-2 border-violet-400 bg-violet-500/20'
                      : 'border-l-2 border-transparent'
                  }`}
                >
                  <span
                    className={`w-10 shrink-0 px-2 py-1.5 text-right text-xs transition-colors select-none ${isActive ? 'text-violet-400' : 'text-slate-600'}`}
                  >
                    {idx + 1}
                  </span>
                  <pre
                    className={`flex-1 py-1.5 pr-4 text-sm leading-relaxed break-all whitespace-pre-wrap transition-opacity duration-200 ${
                      isActive
                        ? 'text-white opacity-100'
                        : isDim
                          ? 'text-slate-600 opacity-35'
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

          <div className="border-t border-slate-800 bg-slate-900/30 px-4 py-3">
            <div className="mb-2 flex items-center justify-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-slate-800">
                <div
                  className="h-1.5 rounded-full bg-violet-500 transition-all"
                  style={{ width: `${(stepProgress / totalSteps) * 100}%` }}
                />
              </div>
              <span className="shrink-0 text-xs text-slate-500">
                {showFinal ? 'Selesai' : `${currentStep + 1}/${totalSteps}`}
              </span>
            </div>
            <div className="flex justify-center gap-2">
              <Button
                variant="outlined"
                size="sm"
                onClick={() => {
                  setCurrentStep(0);
                  setShowFinal(false);
                }}
                disabled={currentStep === 0 && !showFinal}
                className="h-8 border-slate-700 bg-slate-800 px-3 text-xs text-slate-300 hover:bg-slate-700 disabled:opacity-30"
              >
                ⏮ Ulang
              </Button>
              <Button
                variant="outlined"
                size="sm"
                onClick={handlePrev}
                disabled={currentStep === 0 && !showFinal}
                className="h-8 border-slate-700 bg-slate-800 px-4 text-xs text-slate-300 hover:bg-slate-700 disabled:opacity-30"
              >
                ← Sebelumnya
              </Button>
              <Button
                variant="outlined"
                size="sm"
                onClick={handleNext}
                disabled={showFinal}
                className="h-8 border-slate-700 bg-slate-800 px-4 text-xs text-slate-300 hover:bg-slate-700 disabled:opacity-30"
              >
                {currentStep === totalSteps - 1 && !showFinal
                  ? 'Selesaikan →'
                  : 'Berikutnya →'}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col overflow-hidden bg-[#161b22]">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="ml-2 text-xs text-slate-400">
                kompleksitas.tampilan
              </span>
            </div>
            <Badge
              variant="outlined"
              className="border-slate-700 text-xs"
              style={{ color: selectedNotation.accent }}
            >
              {showFinal
                ? `Akhir: ${selectedNotation.label}`
                : step
                  ? `Saat ini: ${step.rawComplexity}`
                  : '—'}
            </Badge>
          </div>

          <div className="flex flex-1 flex-col gap-4 overflow-auto px-5 py-4">
            {!showFinal && step ? (
              <>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <p className="mb-2 text-xs tracking-wider text-slate-500 uppercase">
                    Analisis Baris {step.lineIndex + 1}
                  </p>
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className="rounded-lg border px-3 py-1.5 text-sm font-bold"
                      style={{
                        borderColor: selectedNotation.accent,
                        color: selectedNotation.accent,
                        background: `${selectedNotation.accent}15`,
                      }}
                    >
                      {step.rawComplexity}
                    </div>
                    <p className="text-sm text-slate-300">{step.explanation}</p>
                  </div>
                </div>

                <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <p className="mb-3 text-xs tracking-wider text-slate-500 uppercase">
                    Kompleksitas Per Baris (sejauh ini)
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {example.steps.slice(0, currentStep + 1).map((s, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                          i === currentStep
                            ? 'border border-violet-500/40 bg-violet-500/15'
                            : 'bg-slate-800/40'
                        }`}
                      >
                        <span className="w-16 shrink-0 text-xs text-slate-600">
                          Baris {s.lineIndex + 1}
                        </span>
                        <span
                          className={`shrink-0 font-mono text-xs font-bold ${i === currentStep ? 'text-white' : 'text-slate-400'}`}
                          style={
                            i === currentStep
                              ? { color: selectedNotation.accent }
                              : {}
                          }
                        >
                          {s.rawComplexity}
                        </span>
                        <span
                          className={`text-xs ${i === currentStep ? 'text-slate-300' : 'text-slate-600'}`}
                        >
                          {s.explanation}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : showFinal ? (
              <>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <p className="mb-2 text-xs tracking-wider text-slate-500 uppercase">
                    Kompleksitas Mentah
                  </p>
                  <p className="font-mono text-sm text-slate-300">
                    {example.finalRaw}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <p className="mb-3 text-xs tracking-wider text-slate-500 uppercase">
                    Aturan Penyederhanaan
                  </p>
                  <div className="flex flex-col gap-2">
                    {example.simplification.map((s, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-2 rounded-lg px-3 py-2 ${
                          i === example.simplification.length - 1
                            ? 'border bg-slate-800/50'
                            : 'bg-slate-800/20'
                        }`}
                        style={
                          i === example.simplification.length - 1
                            ? { borderColor: selectedNotation.accent }
                            : {}
                        }
                      >
                        <span className="mt-0.5 text-xs text-slate-600">
                          {i + 1}.
                        </span>
                        <span
                          className={`font-mono text-xs ${
                            i === example.simplification.length - 1
                              ? 'font-bold'
                              : 'text-slate-400'
                          }`}
                          style={
                            i === example.simplification.length - 1
                              ? { color: selectedNotation.accent }
                              : {}
                          }
                        >
                          {s}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <p className="mb-3 text-xs tracking-wider text-slate-500 uppercase">
                    Aturan yang Diterapkan
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        rule: 'Hapus Konstanta',
                        desc: 'O(2n) → O(n), O(3) → O(1)',
                      },
                      { rule: 'Suku Dominan', desc: 'O(n² + n) → O(n²)' },
                      {
                        rule: 'Hapus Suku Lebih Kecil',
                        desc: 'O(n³ + n²) → O(n³)',
                      },
                      {
                        rule: 'Kasus Terburuk',
                        desc: 'Selalu analisis skenario terburuk',
                      },
                    ].map((r) => (
                      <div
                        key={r.rule}
                        className="rounded-lg bg-slate-800/40 p-2.5"
                      >
                        <p className="mb-0.5 text-xs font-semibold text-slate-300">
                          {r.rule}
                        </p>
                        <p className="text-xs text-slate-600">{r.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs tracking-wider text-slate-500 uppercase">
                      Grafik Performa
                    </p>
                    <div
                      className="rounded-lg border px-3 py-1 text-xs font-bold"
                      style={{
                        borderColor: selectedNotation.accent,
                        color: selectedNotation.accent,
                        background: `${selectedNotation.accent}20`,
                      }}
                    >
                      {selectedNotation.label} disorot
                    </div>
                  </div>
                  <div className="h-52">
                    <BigOGraph highlightKey={selectedNotation.key} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {BIG_O_ORDER.map((k) => (
                      <div
                        key={k}
                        className={`flex items-center gap-1.5 rounded-md px-2 py-1 transition-all ${
                          k === selectedNotation.key
                            ? 'border border-slate-600 bg-slate-800'
                            : 'opacity-30'
                        }`}
                      >
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: GRAPH_COLORS[k] }}
                        />
                        <span
                          className="text-xs"
                          style={{
                            color:
                              k === selectedNotation.key
                                ? GRAPH_COLORS[k]
                                : '#475569',
                          }}
                        >
                          {GRAPH_LABELS[k]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-slate-600">
                <div className="text-4xl">⏱</div>
                <p className="text-sm">
                  Langkahi kode untuk menganalisis kompleksitas
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
