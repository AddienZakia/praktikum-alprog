'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type ErrorKey =
  | 'NullPointerException'
  | 'ArrayIndexOutOfBoundsException'
  | 'ClassCastException'
  | 'NumberFormatException'
  | 'ArithmeticException'
  | 'StackOverflowError'
  | 'IllegalArgumentException'
  | 'IOException';

interface CodeStep {
  lineIndex: number;
  phase: 'normal' | 'try' | 'throw' | 'catch' | 'finally' | 'recovered';
  description: string;
  stateVars?: Record<string, string>;
  consoleOutput?: string;
  isError?: boolean;
}

interface ErrorExample {
  title: string;
  realWorld: string;
  realWorldDetail: string;
  code: string[];
  steps: CodeStep[];
}

interface ErrorDef {
  key: ErrorKey;
  label: string;
  category: 'RuntimeException' | 'CheckedException' | 'Error';
  accent: string;
  description: string;
  impact: string;
  examples: ErrorExample[];
}

// ─── Error Definitions ────────────────────────────────────────────────────────

const ERRORS: ErrorDef[] = [
  {
    key: 'NullPointerException',
    label: 'NullPointerException',
    category: 'RuntimeException',
    accent: '#f87171',
    description:
      'Muncul saat kamu akses anggota dari objek yang nilainya null.',
    impact:
      'Error runtime paling umum di Java — selalu cek null sebelum pakai!',
    examples: [
      {
        title: 'Null User Object',
        realWorld: 'E-Commerce: Sesi Pengguna Kedaluwarsa',
        realWorldDetail:
          'Sesi user kedaluwarsa, tapi kode masih mencoba akses user.getName() untuk tampilkan profil. Objek session null → NPE crash halamannya.',
        code: [
          'public class UserService {',
          '    public String getUserName(User user) {',
          '        try {',
          '            String name = user.getName(); // user could be null!',
          '            System.out.println("User: " + name);',
          '            return name;',
          '        } catch (NullPointerException e) {',
          '            System.out.println("ERROR: User is null - " + e.getMessage());',
          '            return "Guest";',
          '        } finally {',
          '            System.out.println("getUserName() finished.");',
          '        }',
          '    }',
          '}',
        ],
        steps: [
          {
            lineIndex: 1,
            phase: 'normal',
            description: 'Method called with user = null',
            stateVars: { user: 'null' },
          },
          {
            lineIndex: 2,
            phase: 'try',
            description: 'Enter try block',
            stateVars: { user: 'null' },
          },
          {
            lineIndex: 3,
            phase: 'throw',
            description:
              'user.getName() → user is null! NullPointerException thrown!',
            stateVars: { user: 'null', error: 'NPE!' },
            consoleOutput: '',
            isError: true,
          },
          {
            lineIndex: 6,
            phase: 'catch',
            description: 'Caught NullPointerException in catch block',
            stateVars: { e: 'NullPointerException' },
            consoleOutput:
              'ERROR: User is null - Cannot invoke "User.getName()" because "user" is null',
          },
          {
            lineIndex: 7,
            phase: 'catch',
            description: "Return default value 'Guest'",
            stateVars: { result: '"Guest"' },
          },
          {
            lineIndex: 9,
            phase: 'finally',
            description: 'Finally block always executes',
            consoleOutput: 'getUserName() finished.',
          },
          {
            lineIndex: 11,
            phase: 'recovered',
            description: "Method returns 'Guest' safely — no crash!",
            stateVars: { returned: '"Guest"' },
          },
        ],
      },
      {
        title: 'Null Collection',
        realWorld: 'Perbankan: Daftar Akun Kosong',
        realWorldDetail:
          'API mengembalikan null bukan list kosong ketika tidak ada akun. Memanggil .size() pada null crash modul transaksi.',
        code: [
          'public class AccountService {',
          '    public int countAccounts(List<Account> accounts) {',
          '        try {',
          '            return accounts.size(); // accounts might be null!',
          '        } catch (NullPointerException e) {',
          '            System.out.println("Accounts list is null: " + e.getMessage());',
          '            return 0;',
          '        } finally {',
          '            System.out.println("countAccounts() done.");',
          '        }',
          '    }',
          '}',
        ],
        steps: [
          {
            lineIndex: 1,
            phase: 'normal',
            description: 'Called with accounts = null',
            stateVars: { accounts: 'null' },
          },
          {
            lineIndex: 2,
            phase: 'try',
            description: 'Enter try block',
            stateVars: {},
          },
          {
            lineIndex: 3,
            phase: 'throw',
            description:
              "accounts.size() → NPE! Can't call method on null list",
            stateVars: { accounts: 'null' },
            consoleOutput: '',
            isError: true,
          },
          {
            lineIndex: 4,
            phase: 'catch',
            description: 'Catch NullPointerException',
            stateVars: { e: 'NPE' },
            consoleOutput:
              'Accounts list is null: Cannot invoke "List.size()" because "accounts" is null',
          },
          {
            lineIndex: 7,
            phase: 'finally',
            description: 'Finally runs regardless',
            consoleOutput: 'countAccounts() done.',
          },
          {
            lineIndex: 10,
            phase: 'recovered',
            description: 'Returns 0 safely',
            stateVars: { returned: '0' },
          },
        ],
      },
      {
        title: 'Chained Null',
        realWorld: 'Sistem HR: Departemen Karyawan Kosong',
        realWorldDetail:
          'employee.getDepartment().getManager().getName() — tautan mana pun dalam rantai ini bisa null dan menyebabkan NPE di kalkulasi gaji.',
        code: [
          'public class HRService {',
          '    public String getManagerName(Employee emp) {',
          '        try {',
          '            // Dangerous chained call!',
          '            return emp.getDepartment().getManager().getName();',
          '        } catch (NullPointerException e) {',
          '            System.out.println("Null in chain: " + e.getMessage());',
          '            return "No Manager";',
          '        } finally {',
          '            System.out.println("getManagerName() finished.");',
          '        }',
          '    }',
          '}',
        ],
        steps: [
          {
            lineIndex: 1,
            phase: 'normal',
            description: 'Called with emp.getDepartment() returning null',
            stateVars: { 'emp.dept': 'null' },
          },
          {
            lineIndex: 2,
            phase: 'try',
            description: 'Enter try block',
            stateVars: {},
          },
          {
            lineIndex: 4,
            phase: 'throw',
            description:
              'emp.getDepartment() = null → .getManager() throws NPE!',
            stateVars: { 'getDepartment()': 'null' },
            consoleOutput: '',
            isError: true,
          },
          {
            lineIndex: 5,
            phase: 'catch',
            description: 'Catch the chained NPE',
            consoleOutput:
              'Null in chain: Cannot invoke "Department.getManager()" because getDepartment() returned null',
          },
          {
            lineIndex: 8,
            phase: 'finally',
            description: 'Finally always runs',
            consoleOutput: 'getManagerName() finished.',
          },
          {
            lineIndex: 11,
            phase: 'recovered',
            description: "Returns 'No Manager' safely",
            stateVars: { returned: '"No Manager"' },
          },
        ],
      },
    ],
  },
  {
    key: 'ArrayIndexOutOfBoundsException',
    label: 'ArrayIndexOutOfBounds',
    category: 'RuntimeException',
    accent: '#fb923c',
    description: 'Muncul saat akses array dengan index yang tidak valid.',
    impact:
      'Sering terjadi di dalam loop — selalu validasi index < array.length.',
    examples: [
      {
        title: 'Loop Overflow',
        realWorld: 'Pemrosesan Data: Parser CSV',
        realWorldDetail:
          'CSV punya 10 kolom tapi kode mencoba akses kolom ke-11 (index 10) karena off-by-one di loop — crash pipeline import.',
        code: [
          'public class CSVParser {',
          '    public void parseRow(String[] columns) {',
          '        try {',
          '            for (int i = 0; i <= columns.length; i++) { // BUG: should be <',
          '                System.out.println(columns[i]);',
          '            }',
          '        } catch (ArrayIndexOutOfBoundsException e) {',
          '            System.out.println("Index error: " + e.getMessage());',
          '        } finally {',
          '            System.out.println("parseRow() done.");',
          '        }',
          '    }',
          '}',
        ],
        steps: [
          {
            lineIndex: 1,
            phase: 'normal',
            description: 'parseRow called with 3-element array',
            stateVars: { 'columns.length': '3' },
          },
          {
            lineIndex: 2,
            phase: 'try',
            description: 'Enter try block',
            stateVars: {},
          },
          {
            lineIndex: 3,
            phase: 'normal',
            description: 'Loop: i=0, columns[0] OK',
            stateVars: { i: '0' },
            consoleOutput: 'columns[0]',
          },
          {
            lineIndex: 3,
            phase: 'normal',
            description: 'Loop: i=1, columns[1] OK',
            stateVars: { i: '1' },
            consoleOutput: 'columns[1]',
          },
          {
            lineIndex: 3,
            phase: 'normal',
            description: 'Loop: i=2, columns[2] OK',
            stateVars: { i: '2' },
            consoleOutput: 'columns[2]',
          },
          {
            lineIndex: 4,
            phase: 'throw',
            description:
              "i=3 (= length!) → columns[3] doesn't exist → AIOOBE thrown!",
            stateVars: { i: '3', 'columns.length': '3' },
            isError: true,
          },
          {
            lineIndex: 6,
            phase: 'catch',
            description: 'Catch ArrayIndexOutOfBoundsException',
            consoleOutput: 'Index error: Index 3 out of bounds for length 3',
          },
          {
            lineIndex: 8,
            phase: 'finally',
            description: 'Finally runs',
            consoleOutput: 'parseRow() done.',
          },
          {
            lineIndex: 11,
            phase: 'recovered',
            description: 'Exception handled — no crash',
            stateVars: {},
          },
        ],
      },
    ],
  },
  {
    key: 'NumberFormatException',
    label: 'NumberFormatException',
    category: 'RuntimeException',
    accent: '#fbbf24',
    description: 'Muncul saat parsing string yang bukan angka valid.',
    impact: 'Selalu validasi input user sebelum parsing ke Integer/Double.',
    examples: [
      {
        title: 'Invalid User Input',
        realWorld: 'Form Web: Validasi Field Usia',
        realWorldDetail:
          "User ketik 'dua puluh' bukan '20' di field usia. Integer.parseInt('dua puluh') crash endpoint registrasi.",
        code: [
          'public class RegistrationService {',
          '    public int parseAge(String ageInput) {',
          '        try {',
          '            int age = Integer.parseInt(ageInput);',
          '            System.out.println("Age parsed: " + age);',
          '            return age;',
          '        } catch (NumberFormatException e) {',
          '            System.out.println("Invalid age: \'" + ageInput + "\' - " + e.getMessage());',
          '            return -1;',
          '        } finally {',
          '            System.out.println("parseAge() finished.");',
          '        }',
          '    }',
          '}',
        ],
        steps: [
          {
            lineIndex: 1,
            phase: 'normal',
            description: 'parseAge called with ageInput = "twenty"',
            stateVars: { ageInput: '"twenty"' },
          },
          {
            lineIndex: 2,
            phase: 'try',
            description: 'Enter try block',
            stateVars: {},
          },
          {
            lineIndex: 3,
            phase: 'throw',
            description:
              'Integer.parseInt("twenty") → not a valid integer! NumberFormatException thrown!',
            stateVars: { ageInput: '"twenty"' },
            isError: true,
          },
          {
            lineIndex: 6,
            phase: 'catch',
            description: 'Catch NumberFormatException',
            consoleOutput:
              'Invalid age: \'twenty\' - For input string: "twenty"',
          },
          {
            lineIndex: 9,
            phase: 'finally',
            description: 'Finally runs',
            consoleOutput: 'parseAge() finished.',
          },
          {
            lineIndex: 12,
            phase: 'recovered',
            description: 'Returns -1 as sentinel value',
            stateVars: { returned: '-1' },
          },
        ],
      },
    ],
  },
  {
    key: 'ArithmeticException',
    label: 'ArithmeticException',
    category: 'RuntimeException',
    accent: '#a78bfa',
    description:
      'Muncul untuk error aritmatika, paling sering pembagian dengan nol.',
    impact: 'Validasi pembagi sebelum melakukan operasi pembagian.',
    examples: [
      {
        title: 'Division By Zero',
        realWorld: 'Aplikasi Keuangan: Kalkulator Rata-rata',
        realWorldDetail:
          'Menghitung rata-rata pengeluaran per hari, tapi bulan ini ada 0 transaksi. Bagi total dengan 0 crash dashboard analitik.',
        code: [
          'public class FinanceService {',
          '    public double calcAverage(int total, int count) {',
          '        try {',
          '            double avg = total / count; // count could be 0!',
          '            System.out.println("Average: " + avg);',
          '            return avg;',
          '        } catch (ArithmeticException e) {',
          '            System.out.println("Math error: " + e.getMessage());',
          '            return 0.0;',
          '        } finally {',
          '            System.out.println("calcAverage() done.");',
          '        }',
          '    }',
          '}',
        ],
        steps: [
          {
            lineIndex: 1,
            phase: 'normal',
            description: 'Called with total=500, count=0',
            stateVars: { total: '500', count: '0' },
          },
          {
            lineIndex: 2,
            phase: 'try',
            description: 'Enter try block',
            stateVars: {},
          },
          {
            lineIndex: 3,
            phase: 'throw',
            description:
              'total / count → 500 / 0 → ArithmeticException: / by zero!',
            stateVars: { total: '500', count: '0' },
            isError: true,
          },
          {
            lineIndex: 6,
            phase: 'catch',
            description: 'Catch ArithmeticException',
            consoleOutput: 'Math error: / by zero',
          },
          {
            lineIndex: 9,
            phase: 'finally',
            description: 'Finally executes',
            consoleOutput: 'calcAverage() done.',
          },
          {
            lineIndex: 12,
            phase: 'recovered',
            description: 'Returns 0.0 safely',
            stateVars: { returned: '0.0' },
          },
        ],
      },
    ],
  },
  {
    key: 'ClassCastException',
    label: 'ClassCastException',
    category: 'RuntimeException',
    accent: '#38bdf8',
    description: 'Muncul saat cast objek ke tipe yang tidak kompatibel.',
    impact:
      'Gunakan instanceof sebelum cast untuk verifikasi kompatibilitas tipe.',
    examples: [
      {
        title: 'Invalid Type Cast',
        realWorld: 'Sistem Inventaris: Tipe Produk Tidak Cocok',
        realWorldDetail:
          'List Product generik berisi Electronics dan Clothing. Cast objek Clothing ke Electronics crash laporan inventaris.',
        code: [
          'public class InventoryService {',
          '    public void processProduct(Object product) {',
          '        try {',
          '            Electronics elec = (Electronics) product; // unsafe cast!',
          '            elec.getWarrantyPeriod();',
          '        } catch (ClassCastException e) {',
          '            System.out.println("Cast failed: " + e.getMessage());',
          '            System.out.println("Use instanceof before casting!");',
          '        } finally {',
          '            System.out.println("processProduct() done.");',
          '        }',
          '    }',
          '}',
        ],
        steps: [
          {
            lineIndex: 1,
            phase: 'normal',
            description: 'product is actually a Clothing instance',
            stateVars: { 'product.type': 'Clothing' },
          },
          {
            lineIndex: 2,
            phase: 'try',
            description: 'Enter try block',
            stateVars: {},
          },
          {
            lineIndex: 3,
            phase: 'throw',
            description:
              '(Electronics) Clothing → incompatible types! ClassCastException thrown!',
            stateVars: { actual: 'Clothing', expected: 'Electronics' },
            isError: true,
          },
          {
            lineIndex: 5,
            phase: 'catch',
            description: 'Catch ClassCastException',
            consoleOutput:
              'Cast failed: class Clothing cannot be cast to class Electronics',
          },
          {
            lineIndex: 6,
            phase: 'catch',
            description: 'Advise to use instanceof',
            consoleOutput: 'Use instanceof before casting!',
          },
          {
            lineIndex: 8,
            phase: 'finally',
            description: 'Finally runs',
            consoleOutput: 'processProduct() done.',
          },
          {
            lineIndex: 11,
            phase: 'recovered',
            description: 'Exception handled gracefully',
            stateVars: {},
          },
        ],
      },
    ],
  },
  {
    key: 'StackOverflowError',
    label: 'StackOverflowError',
    category: 'Error',
    accent: '#ec4899',
    description:
      'Muncul saat kedalaman call stack melebihi batas (biasanya rekursi tak terbatas).',
    impact: 'Selalu definisikan base case di fungsi rekursif!',
    examples: [
      {
        title: 'Infinite Recursion',
        realWorld: 'Config Loader: Referensi Melingkar',
        realWorldDetail:
          'ConfigA load ConfigB yang load ConfigA lagi — loop tak terbatas di resolusi config crash server saat startup.',
        code: [
          'public class ConfigLoader {',
          '    public Config load(String name) {',
          '        // Missing base case!',
          '        Config dep = load(name); // calls itself forever!',
          '        return dep;',
          '    }',
          '    public Config loadSafe(String name, int depth) {',
          '        try {',
          '            if (depth > 100) throw new RuntimeException("Too deep!");',
          '            return loadSafe(name, depth + 1);',
          '        } catch (StackOverflowError e) {',
          '            System.out.println("Stack overflow! Add base case.");',
          '            return Config.defaultConfig();',
          '        }',
          '    }',
          '}',
        ],
        steps: [
          {
            lineIndex: 1,
            phase: 'normal',
            description: "loadSafe('app', 0) called",
            stateVars: { depth: '0', name: '"app"' },
          },
          {
            lineIndex: 7,
            phase: 'try',
            description: 'Enter try block — depth check OK',
            stateVars: { depth: '0' },
          },
          {
            lineIndex: 8,
            phase: 'normal',
            description: 'depth=0 < 100, recurse with depth+1',
            stateVars: { depth: '0 → 1' },
          },
          {
            lineIndex: 8,
            phase: 'normal',
            description: 'Recursing... depth grows: 1, 2, 3...100...',
            stateVars: { depth: '1..100..' },
          },
          {
            lineIndex: 9,
            phase: 'throw',
            description:
              'Call stack exhausted! StackOverflowError thrown by JVM!',
            stateVars: { depth: 'MAX', 'call stack': 'FULL' },
            isError: true,
          },
          {
            lineIndex: 10,
            phase: 'catch',
            description: 'Catch StackOverflowError',
            consoleOutput: 'Stack overflow! Add base case.',
          },
          {
            lineIndex: 12,
            phase: 'recovered',
            description: 'Return default config safely',
            stateVars: { returned: 'Config.defaultConfig()' },
          },
        ],
      },
    ],
  },
  {
    key: 'IllegalArgumentException',
    label: 'IllegalArgumentException',
    category: 'RuntimeException',
    accent: '#34d399',
    description: 'Muncul saat metode menerima argumen yang tidak sesuai.',
    impact: 'Gunakan untuk validasi input — dokumentasikan argumen yang valid.',
    examples: [
      {
        title: 'Invalid Parameter',
        realWorld: 'Payment Gateway: Jumlah Negatif',
        realWorldDetail:
          'Bug di modul refund mengirim nilai negatif ke payment processor. IAE mencegah pembayaran tidak valid diproses.',
        code: [
          'public class PaymentService {',
          '    public void processPayment(double amount) {',
          '        try {',
          '            if (amount <= 0) {',
          '                throw new IllegalArgumentException(',
          '                    "Amount must be positive: " + amount);',
          '            }',
          '            System.out.println("Processing: $" + amount);',
          '        } catch (IllegalArgumentException e) {',
          '            System.out.println("Invalid payment: " + e.getMessage());',
          '        } finally {',
          '            System.out.println("processPayment() done.");',
          '        }',
          '    }',
          '}',
        ],
        steps: [
          {
            lineIndex: 1,
            phase: 'normal',
            description: 'processPayment called with amount = -50.0',
            stateVars: { amount: '-50.0' },
          },
          {
            lineIndex: 2,
            phase: 'try',
            description: 'Enter try block',
            stateVars: {},
          },
          {
            lineIndex: 3,
            phase: 'normal',
            description: 'Check: amount (-50.0) <= 0? YES',
            stateVars: { 'amount <= 0': 'true' },
          },
          {
            lineIndex: 4,
            phase: 'throw',
            description: 'Explicitly throw IllegalArgumentException!',
            stateVars: { amount: '-50.0' },
            isError: true,
          },
          {
            lineIndex: 8,
            phase: 'catch',
            description: 'Catch IllegalArgumentException',
            consoleOutput: 'Invalid payment: Amount must be positive: -50.0',
          },
          {
            lineIndex: 10,
            phase: 'finally',
            description: 'Finally runs',
            consoleOutput: 'processPayment() done.',
          },
          {
            lineIndex: 13,
            phase: 'recovered',
            description: 'Payment rejected — funds safe',
            stateVars: { status: 'rejected' },
          },
        ],
      },
    ],
  },
  {
    key: 'IOException',
    label: 'IOException',
    category: 'CheckedException',
    accent: '#fb7185',
    description:
      'Checked exception — harus ditangani saat melakukan operasi I/O.',
    impact:
      'Operasi file/jaringan selalu berisiko IOException — harus dideklarasikan atau ditangkap.',
    examples: [
      {
        title: 'File Not Found',
        realWorld: 'Generator Laporan: Template Hilang',
        realWorldDetail:
          'Engine laporan mencoba baca template.html untuk generate email. Kalau file template dihapus atau hilang, IOException crash job laporan malam.',
        code: [
          'import java.io.*;',
          'public class ReportService {',
          '    public String readTemplate(String path) {',
          '        StringBuilder content = new StringBuilder();',
          '        try (BufferedReader br = new BufferedReader(new FileReader(path))) {',
          '            String line;',
          '            while ((line = br.readLine()) != null) {',
          '                content.append(line);',
          '            }',
          '        } catch (FileNotFoundException e) {',
          '            System.out.println("File missing: " + e.getMessage());',
          '            return "<default>template</default>";',
          '        } catch (IOException e) {',
          '            System.out.println("IO Error: " + e.getMessage());',
          '        } finally {',
          '            System.out.println("readTemplate() done.");',
          '        }',
          '        return content.toString();',
          '    }',
          '}',
        ],
        steps: [
          {
            lineIndex: 2,
            phase: 'normal',
            description: "readTemplate called with path = 'template.html'",
            stateVars: { path: '"template.html"' },
          },
          {
            lineIndex: 3,
            phase: 'normal',
            description: 'Initialize StringBuilder',
            stateVars: { content: 'empty' },
          },
          {
            lineIndex: 4,
            phase: 'try',
            description: 'Try-with-resources: open FileReader',
            stateVars: { path: '"template.html"' },
          },
          {
            lineIndex: 4,
            phase: 'throw',
            description:
              'FileNotFoundException! template.html does not exist on disk',
            stateVars: { file: 'NOT FOUND' },
            isError: true,
          },
          {
            lineIndex: 9,
            phase: 'catch',
            description: 'Catch FileNotFoundException (more specific first)',
            consoleOutput:
              'File missing: template.html (No such file or directory)',
          },
          {
            lineIndex: 10,
            phase: 'catch',
            description: 'Return default template',
            stateVars: { returned: '"<default>template</default>"' },
          },
          {
            lineIndex: 14,
            phase: 'finally',
            description:
              'Finally runs — resources auto-closed by try-with-resources',
            consoleOutput: 'readTemplate() done.',
          },
          {
            lineIndex: 17,
            phase: 'recovered',
            description: 'Service continues with default template',
            stateVars: { status: 'degraded gracefully' },
          },
        ],
      },
    ],
  },
];

// ─── Phase Colors ─────────────────────────────────────────────────────────────

const PHASE_STYLES = {
  normal: {
    bg: 'bg-slate-800/40',
    border: 'border-transparent',
    text: 'text-slate-300',
  },
  try: {
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    text: 'text-sky-300',
  },
  throw: {
    bg: 'bg-rose-500/20',
    border: 'border-rose-500/50',
    text: 'text-rose-300',
  },
  catch: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-300',
  },
  finally: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    text: 'text-violet-300',
  },
  recovered: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-300',
  },
};

const PHASE_LABELS = {
  normal: 'BERJALAN',
  try: 'TRY',
  throw: '⚠ EXCEPTION',
  catch: 'CATCH',
  finally: 'FINALLY',
  recovered: '✓ PULIH',
};

// ─── Terminal Component ────────────────────────────────────────────────────────

function Terminal({ lines }: { lines: { text: string; isError: boolean }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines]);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-[#0a0e14]">
      <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900/50 px-3 py-2">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <span className="ml-1 text-xs text-slate-500">terminal</span>
        <span className="ml-auto text-xs text-slate-600">
          Java Runtime Environment
        </span>
      </div>
      <div
        ref={ref}
        className="max-h-[180px] min-h-[120px] flex-1 overflow-auto p-3 font-mono text-xs"
      >
        {lines.length === 0 ? (
          <span className="text-slate-700">$ menunggu output...</span>
        ) : (
          lines.map((l, i) => (
            <div
              key={i}
              className={`leading-5 ${l.isError ? 'text-rose-400' : 'text-emerald-400'}`}
            >
              {l.isError && (
                <span className="mr-1 text-rose-600">
                  Exception in thread "main"
                </span>
              )}
              {l.text}
            </div>
          ))
        )}
        <span className="animate-pulse text-slate-700">█</span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

// ─── Keyboard Hint ────────────────────────────────────────────────────────────

function KeyboardHint() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 backdrop-blur">
      <span className="text-xs text-slate-500">Navigasi pakai keyboard:</span>
      <div className="flex items-center gap-1">
        <kbd className="inline-flex h-5 w-6 items-center justify-center rounded border border-slate-700 bg-slate-800 font-mono text-xs text-slate-400 shadow-[0_1px_0_rgba(0,0,0,0.4)]">
          ←
        </kbd>
        <kbd className="inline-flex h-5 w-6 items-center justify-center rounded border border-slate-700 bg-slate-800 font-mono text-xs text-slate-400 shadow-[0_1px_0_rgba(0,0,0,0.4)]">
          →
        </kbd>
      </div>
    </div>
  );
}

export default function ExceptionHandlingPage() {
  const [selectedError, setSelectedError] = useState<ErrorDef>(ERRORS[0]);
  const [selectedExampleIdx, setSelectedExampleIdx] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [terminalLines, setTerminalLines] = useState<
    { text: string; isError: boolean }[]
  >([]);

  const example =
    selectedError.examples[
      Math.min(selectedExampleIdx, selectedError.examples.length - 1)
    ];
  const totalSteps = example.steps.length;
  const step = example.steps[currentStep];

  const handleSelectError = (e: ErrorDef) => {
    setSelectedError(e);
    setSelectedExampleIdx(0);
    setCurrentStep(0);
    setTerminalLines([]);
  };

  // ── Keyboard navigation ──────────────────────────────────────────────────

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      const nextStep = example.steps[currentStep + 1];
      if (
        nextStep.consoleOutput !== undefined &&
        nextStep.consoleOutput !== ''
      ) {
        setTerminalLines((prev) => [
          ...prev,
          { text: nextStep.consoleOutput!, isError: nextStep.isError || false },
        ]);
      }
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, totalSteps]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const handleReset = () => {
    setCurrentStep(0);
    setTerminalLines([]);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleNext, handlePrev]);

  const catColor =
    selectedError.category === 'Error'
      ? '#ec4899'
      : selectedError.category === 'CheckedException'
        ? '#38bdf8'
        : '#fb923c';

  const hasShown = useRef(false);

  useEffect(() => {
    if (hasShown.current) return;

    hasShown.current = true;
    toast.info('Disarankan menggunakan perangkat desktop');
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#0d1117] font-mono text-slate-200">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-slate-800 bg-[#0d1117]/95 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href={'/'}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 text-sm font-bold text-white">
                EH
              </div>
            </Link>
            <div>
              <h1 className="text-base leading-none font-bold text-white">
                Exception Handling
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Tipe Error Java — Visualisasi Interaktif
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {ERRORS.map((e) => (
              <button
                key={e.key}
                onClick={() => handleSelectError(e)}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all ${
                  selectedError.key === e.key
                    ? 'border-violet-400 bg-violet-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.5)]'
                    : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                }`}
              >
                {e.label.replace('Exception', 'Ex.').replace('Error', 'Err.')}
              </button>
            ))}
          </div>
        </div>
        {/* Example sub-bar */}
        <div className="flex items-center gap-3 border-t border-slate-800/60 bg-slate-900/30 px-4 py-2">
          <span className="text-xs text-slate-500">Example:</span>
          {selectedError.examples.map((ex, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedExampleIdx(i);
                setCurrentStep(0);
                setTerminalLines([]);
              }}
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
            <Badge
              variant="outlined"
              className="text-xs"
              style={{ borderColor: catColor, color: catColor }}
            >
              {selectedError.category}
            </Badge>
          </div>
        </div>
      </div>

      {/* Split View */}
      <div
        className="grid min-h-0 flex-1 grid-cols-2 gap-0"
        style={{ height: 'calc(100vh - 110px)' }}
      >
        {/* LEFT: Code Panel */}
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
            <div
              className={`rounded-md border px-2.5 py-0.5 text-xs font-bold ${PHASE_STYLES[step.phase].bg} ${PHASE_STYLES[step.phase].border} ${PHASE_STYLES[step.phase].text}`}
            >
              {PHASE_LABELS[step.phase]}
            </div>
          </div>

          {/* State vars */}
          <div className="flex min-h-[52px] items-center border-b border-slate-800 bg-slate-900/20 px-4 py-2.5">
            {step.stateVars && Object.keys(step.stateVars).length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs tracking-wider text-slate-300 uppercase">
                  State:
                </span>
                {Object.entries(step.stateVars).map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1"
                  >
                    <span className="text-xs font-semibold text-violet-400">
                      {k}
                    </span>
                    <span className="text-xs text-slate-500">=</span>
                    <span
                      className={`text-xs ${step.isError ? 'text-rose-400' : 'text-amber-300'}`}
                    >
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-300 italic">
                {step.description}
              </p>
            )}
          </div>

          {/* Code */}
          <div className="flex-1 overflow-auto p-2">
            {example.code.map((line, idx) => {
              const isActive = idx === step.lineIndex;
              const isDim = !isActive;
              const ph = isActive ? step.phase : 'normal';
              const activeBg = isActive
                ? ph === 'throw'
                  ? 'bg-rose-500/20 border-l-2 border-rose-400'
                  : ph === 'catch'
                    ? 'bg-amber-500/15 border-l-2 border-amber-400'
                    : ph === 'finally'
                      ? 'bg-violet-500/20 border-l-2 border-violet-400'
                      : ph === 'try'
                        ? 'bg-sky-500/10 border-l-2 border-sky-400'
                        : ph === 'recovered'
                          ? 'bg-emerald-500/10 border-l-2 border-emerald-400'
                          : 'bg-violet-500/20 border-l-2 border-violet-400'
                : 'border-l-2 border-transparent';
              const textColor = isActive
                ? ph === 'throw'
                  ? 'text-rose-100'
                  : 'text-white'
                : isDim
                  ? 'text-slate-600 opacity-35'
                  : 'text-slate-300';

              return (
                <div
                  key={idx}
                  className={`flex items-start rounded-r-md transition-all duration-200 ${activeBg}`}
                >
                  <span
                    className={`w-10 shrink-0 px-2 py-1.5 text-right text-xs select-none ${isActive ? 'text-violet-400' : 'text-slate-700'}`}
                  >
                    {idx + 1}
                  </span>
                  <pre
                    className={`flex-1 py-1.5 pr-4 text-sm leading-relaxed break-all whitespace-pre-wrap transition-opacity duration-200 ${textColor}`}
                  >
                    {line}
                  </pre>
                  {isActive && step.isError && (
                    <span className="mt-1.5 mr-2 shrink-0 animate-bounce text-xs text-rose-400">
                      ⚠
                    </span>
                  )}
                  {isActive && !step.isError && (
                    <span className="mt-1.5 mr-2 shrink-0 animate-pulse text-xs text-violet-400">
                      ◀
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Terminal */}
          <div className="border-t border-slate-800 bg-slate-900/30 px-4 py-3">
            <Terminal lines={terminalLines} />
          </div>

          {/* Controls */}
          <div className="border-t border-slate-800 bg-slate-900/30 px-4 py-3">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-slate-800">
                <div
                  className="h-1.5 rounded-full bg-violet-500 transition-all"
                  style={{
                    width: `${(currentStep / (totalSteps - 1)) * 100}%`,
                  }}
                />
              </div>
              <span className="shrink-0 text-xs text-slate-500">
                {currentStep + 1}/{totalSteps}
              </span>
            </div>
            <div className="mb-2 flex justify-center">
              <KeyboardHint />
            </div>
            <div className="flex justify-center gap-2">
              <Button
                variant="outlined"
                size="sm"
                onClick={handleReset}
                disabled={currentStep === 0}
                className="h-8 border-slate-700 bg-slate-800 px-3 text-xs text-slate-300 hover:bg-slate-700 disabled:opacity-30"
              >
                ⏮ Reset
              </Button>
              <Button
                variant="outlined"
                size="sm"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="h-8 border-slate-700 bg-slate-800 px-4 text-xs text-slate-300 hover:bg-slate-700 disabled:opacity-30"
              >
                ← Prev
              </Button>
              <Button
                variant="outlined"
                size="sm"
                onClick={handleNext}
                disabled={currentStep === totalSteps - 1}
                className="h-8 border-slate-700 bg-slate-800 px-4 text-xs text-slate-300 hover:bg-slate-700 disabled:opacity-30"
              >
                Next →
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT: Info Panel */}
        <div className="flex flex-col overflow-hidden bg-[#161b22]">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="ml-2 text-xs text-slate-400">
                exception.info
              </span>
            </div>
          </div>

          <div className="flex min-h-[52px] items-center border-b border-slate-800 bg-slate-900/30 px-4 py-2.5">
            <p className="text-sm leading-snug text-slate-300">
              {step.description}
            </p>
          </div>

          <div className="flex flex-1 flex-col gap-4 overflow-auto px-5 py-4">
            {/* Error info */}
            <div
              className="rounded-xl border p-4"
              style={{
                borderColor: `${selectedError.accent}40`,
                background: `${selectedError.accent}08`,
              }}
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="mb-1 text-xs tracking-wider text-slate-500 uppercase">
                    Tipe Exception
                  </p>
                  <p
                    className="text-sm font-bold"
                    style={{ color: selectedError.accent }}
                  >
                    {selectedError.key}
                  </p>
                </div>
                <Badge
                  variant="outlined"
                  className="text-xs"
                  style={{ borderColor: catColor, color: catColor }}
                >
                  {selectedError.category}
                </Badge>
              </div>
              <p className="mb-2 text-xs text-slate-400">
                {selectedError.description}
              </p>
              <div className="flex items-start gap-2 rounded-lg bg-slate-900/50 px-3 py-2">
                <span className="mt-0.5 text-xs text-amber-400">⚡</span>
                <p className="text-xs text-amber-300/80">
                  {selectedError.impact}
                </p>
              </div>
            </div>

            {/* Real-world scenario */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="mb-2 text-xs tracking-wider text-slate-500 uppercase">
                Skenario Dunia Nyata
              </p>
              <p className="mb-1 text-sm font-semibold text-slate-200">
                {example.realWorld}
              </p>
              <p className="text-xs leading-relaxed text-slate-400">
                {example.realWorldDetail}
              </p>
            </div>

            {/* Flow phases legend */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="mb-3 text-xs tracking-wider text-slate-500 uppercase">
                Alur Eksekusi
              </p>
              <div className="flex flex-col gap-1.5">
                {(
                  ['try', 'throw', 'catch', 'finally', 'recovered'] as const
                ).map((ph) => {
                  const isCurrentPhase = step.phase === ph;
                  return (
                    <div
                      key={ph}
                      className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-all ${
                        isCurrentPhase
                          ? `${PHASE_STYLES[ph].bg} ${PHASE_STYLES[ph].border}`
                          : 'border-transparent bg-slate-800/20'
                      }`}
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${isCurrentPhase ? 'animate-pulse' : ''}`}
                        style={{
                          background: isCurrentPhase
                            ? selectedError.accent
                            : '#334155',
                        }}
                      />
                      <span
                        className={`w-24 font-mono text-xs font-bold ${isCurrentPhase ? PHASE_STYLES[ph].text : 'text-slate-600'}`}
                      >
                        {PHASE_LABELS[ph]}
                      </span>
                      <span
                        className={`text-xs ${isCurrentPhase ? 'text-slate-300' : 'text-slate-700'}`}
                      >
                        {ph === 'try'
                          ? 'Kode yang mungkin lempar exception'
                          : ph === 'throw'
                            ? 'Exception dilempar di sini'
                            : ph === 'catch'
                              ? 'Tangkap dan handle exception-nya'
                              : ph === 'finally'
                                ? 'Selalu dijalankan (bersih-bersih)'
                                : 'Program lanjut dengan aman'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* try-catch-finally structure */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="mb-3 text-xs tracking-wider text-slate-500 uppercase">
                Hierarki Exception Java
              </p>
              <div className="font-mono text-xs">
                {[
                  { label: 'Throwable', indent: 0, color: '#94a3b8' },
                  {
                    label: '├── Error (JVM errors)',
                    indent: 1,
                    color: '#ec4899',
                  },
                  {
                    label: '│   └── StackOverflowError',
                    indent: 2,
                    color:
                      selectedError.key === 'StackOverflowError'
                        ? '#ec4899'
                        : '#475569',
                  },
                  { label: '└── Exception', indent: 1, color: '#94a3b8' },
                  {
                    label: '    ├── IOException (Checked)',
                    indent: 2,
                    color:
                      selectedError.key === 'IOException'
                        ? '#fb7185'
                        : '#475569',
                  },
                  {
                    label: '    └── RuntimeException (Unchecked)',
                    indent: 2,
                    color: '#94a3b8',
                  },
                  {
                    label: '        ├── NullPointerException',
                    indent: 3,
                    color:
                      selectedError.key === 'NullPointerException'
                        ? '#f87171'
                        : '#475569',
                  },
                  {
                    label: '        ├── ArrayIndexOutOfBoundsException',
                    indent: 3,
                    color:
                      selectedError.key === 'ArrayIndexOutOfBoundsException'
                        ? '#fb923c'
                        : '#475569',
                  },
                  {
                    label: '        ├── ClassCastException',
                    indent: 3,
                    color:
                      selectedError.key === 'ClassCastException'
                        ? '#38bdf8'
                        : '#475569',
                  },
                  {
                    label: '        ├── NumberFormatException',
                    indent: 3,
                    color:
                      selectedError.key === 'NumberFormatException'
                        ? '#fbbf24'
                        : '#475569',
                  },
                  {
                    label: '        ├── ArithmeticException',
                    indent: 3,
                    color:
                      selectedError.key === 'ArithmeticException'
                        ? '#a78bfa'
                        : '#475569',
                  },
                  {
                    label: '        └── IllegalArgumentException',
                    indent: 3,
                    color:
                      selectedError.key === 'IllegalArgumentException'
                        ? '#34d399'
                        : '#475569',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`py-0.5 transition-all ${item.color !== '#475569' ? 'font-semibold' : ''}`}
                    style={{
                      paddingLeft: `${item.indent * 12}px`,
                      color: item.color,
                    }}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
