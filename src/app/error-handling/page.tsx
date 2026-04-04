'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
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
    description: 'Dilempar saat mengakses anggota dari referensi objek null.',
    impact:
      'Error runtime Java paling umum — selalu cek null sebelum digunakan.',
    examples: [
      {
        title: 'Objek User Null',
        realWorld: 'E-Commerce: Sesi Pengguna Kedaluwarsa',
        realWorldDetail:
          'Sesi pengguna kedaluwarsa, tapi kode mencoba mengakses user.getName() untuk menampilkan profil. Objek sesi null → NPE mencrash halaman.',
        code: [
          'public class UserService {',
          '    public String getUserName(User user) {',
          '        try {',
          '            String name = user.getName(); // user bisa null!',
          '            System.out.println("Pengguna: " + name);',
          '            return name;',
          '        } catch (NullPointerException e) {',
          '            System.out.println("ERROR: User null - " + e.getMessage());',
          '            return "Tamu";',
          '        } finally {',
          '            System.out.println("getUserName() selesai.");',
          '        }',
          '    }',
          '}',
        ],
        steps: [
          {
            lineIndex: 1,
            phase: 'normal',
            description: 'Method dipanggil dengan user = null',
            stateVars: { user: 'null' },
          },
          {
            lineIndex: 2,
            phase: 'try',
            description: 'Masuk blok try',
            stateVars: { user: 'null' },
          },
          {
            lineIndex: 3,
            phase: 'throw',
            description:
              'user.getName() → user null! NullPointerException dilempar!',
            stateVars: { user: 'null', error: 'NPE!' },
            consoleOutput: '',
            isError: true,
          },
          {
            lineIndex: 6,
            phase: 'catch',
            description: 'NullPointerException ditangkap di blok catch',
            stateVars: { e: 'NullPointerException' },
            consoleOutput:
              'ERROR: User null - Cannot invoke "User.getName()" because "user" is null',
          },
          {
            lineIndex: 7,
            phase: 'catch',
            description: "Kembalikan nilai default 'Tamu'",
            stateVars: { result: '"Tamu"' },
          },
          {
            lineIndex: 9,
            phase: 'finally',
            description: 'Blok finally selalu dieksekusi',
            consoleOutput: 'getUserName() selesai.',
          },
          {
            lineIndex: 11,
            phase: 'recovered',
            description:
              "Method mengembalikan 'Tamu' dengan aman — tidak crash!",
            stateVars: { dikembalikan: '"Tamu"' },
          },
        ],
      },
      {
        title: 'Koleksi Null',
        realWorld: 'Perbankan: Daftar Akun Kosong',
        realWorldDetail:
          'API mengembalikan null alih-alih list kosong saat tidak ada akun. Memanggil .size() pada null mencrash modul transaksi.',
        code: [
          'public class AccountService {',
          '    public int countAccounts(List<Account> accounts) {',
          '        try {',
          '            return accounts.size(); // accounts bisa null!',
          '        } catch (NullPointerException e) {',
          '            System.out.println("List akun null: " + e.getMessage());',
          '            return 0;',
          '        } finally {',
          '            System.out.println("countAccounts() selesai.");',
          '        }',
          '    }',
          '}',
        ],
        steps: [
          {
            lineIndex: 1,
            phase: 'normal',
            description: 'Dipanggil dengan accounts = null',
            stateVars: { accounts: 'null' },
          },
          {
            lineIndex: 2,
            phase: 'try',
            description: 'Masuk blok try',
            stateVars: {},
          },
          {
            lineIndex: 3,
            phase: 'throw',
            description:
              'accounts.size() → NPE! Tidak bisa memanggil method pada list null',
            stateVars: { accounts: 'null' },
            consoleOutput: '',
            isError: true,
          },
          {
            lineIndex: 4,
            phase: 'catch',
            description: 'Tangkap NullPointerException',
            stateVars: { e: 'NPE' },
            consoleOutput:
              'List akun null: Cannot invoke "List.size()" because "accounts" is null',
          },
          {
            lineIndex: 7,
            phase: 'finally',
            description: 'Finally berjalan tanpa peduli apapun',
            consoleOutput: 'countAccounts() selesai.',
          },
          {
            lineIndex: 10,
            phase: 'recovered',
            description: 'Mengembalikan 0 dengan aman',
            stateVars: { dikembalikan: '0' },
          },
        ],
      },
      {
        title: 'Null Berantai',
        realWorld: 'Sistem HRD: Departemen Karyawan Tidak Ada',
        realWorldDetail:
          'employee.getDepartment().getManager().getName() — setiap tautan dalam rantai ini bisa null dan menyebabkan NPE dalam perhitungan gaji.',
        code: [
          'public class HRService {',
          '    public String getManagerName(Employee emp) {',
          '        try {',
          '            // Panggilan berantai berbahaya!',
          '            return emp.getDepartment().getManager().getName();',
          '        } catch (NullPointerException e) {',
          '            System.out.println("Null di rantai: " + e.getMessage());',
          '            return "Tidak Ada Manajer";',
          '        } finally {',
          '            System.out.println("getManagerName() selesai.");',
          '        }',
          '    }',
          '}',
        ],
        steps: [
          {
            lineIndex: 1,
            phase: 'normal',
            description:
              'Dipanggil dengan emp.getDepartment() mengembalikan null',
            stateVars: { 'emp.dept': 'null' },
          },
          {
            lineIndex: 2,
            phase: 'try',
            description: 'Masuk blok try',
            stateVars: {},
          },
          {
            lineIndex: 4,
            phase: 'throw',
            description:
              'emp.getDepartment() = null → .getManager() melempar NPE!',
            stateVars: { 'getDepartment()': 'null' },
            consoleOutput: '',
            isError: true,
          },
          {
            lineIndex: 5,
            phase: 'catch',
            description: 'Tangkap NPE berantai',
            consoleOutput:
              'Null di rantai: Cannot invoke "Department.getManager()" because getDepartment() returned null',
          },
          {
            lineIndex: 8,
            phase: 'finally',
            description: 'Finally selalu berjalan',
            consoleOutput: 'getManagerName() selesai.',
          },
          {
            lineIndex: 11,
            phase: 'recovered',
            description: "Mengembalikan 'Tidak Ada Manajer' dengan aman",
            stateVars: { dikembalikan: '"Tidak Ada Manajer"' },
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
    description:
      'Dilempar saat mengakses array dengan indeks yang tidak valid.',
    impact: 'Umum dalam loop — selalu validasi indeks < array.length.',
    examples: [
      {
        title: 'Loop Melebihi Batas',
        realWorld: 'Pemrosesan Data: Parser CSV',
        realWorldDetail:
          'CSV punya 10 kolom tapi kode mencoba mengakses kolom ke-11 (indeks 10) karena off-by-one dalam loop — mencrash pipeline import.',
        code: [
          'public class CSVParser {',
          '    public void parseRow(String[] columns) {',
          '        try {',
          '            for (int i = 0; i <= columns.length; i++) { // BUG: harusnya <',
          '                System.out.println(columns[i]);',
          '            }',
          '        } catch (ArrayIndexOutOfBoundsException e) {',
          '            System.out.println("Error indeks: " + e.getMessage());',
          '        } finally {',
          '            System.out.println("parseRow() selesai.");',
          '        }',
          '    }',
          '}',
        ],
        steps: [
          {
            lineIndex: 1,
            phase: 'normal',
            description: 'parseRow dipanggil dengan array 3 elemen',
            stateVars: { 'columns.length': '3' },
          },
          {
            lineIndex: 2,
            phase: 'try',
            description: 'Masuk blok try',
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
              'i=3 (= length!) → columns[3] tidak ada → AIOOBE dilempar!',
            stateVars: { i: '3', 'columns.length': '3' },
            isError: true,
          },
          {
            lineIndex: 6,
            phase: 'catch',
            description: 'Tangkap ArrayIndexOutOfBoundsException',
            consoleOutput: 'Error indeks: Index 3 out of bounds for length 3',
          },
          {
            lineIndex: 8,
            phase: 'finally',
            description: 'Finally berjalan',
            consoleOutput: 'parseRow() selesai.',
          },
          {
            lineIndex: 11,
            phase: 'recovered',
            description: 'Exception ditangani — tidak crash',
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
    description: 'Dilempar saat parsing string yang bukan angka valid.',
    impact: 'Selalu validasi input pengguna sebelum parsing ke Integer/Double.',
    examples: [
      {
        title: 'Input Pengguna Tidak Valid',
        realWorld: 'Form Web: Validasi Field Umur',
        realWorldDetail:
          "Pengguna mengetik 'dua puluh' alih-alih '20' di field umur. Integer.parseInt('dua puluh') mencrash endpoint pendaftaran.",
        code: [
          'public class RegistrationService {',
          '    public int parseAge(String ageInput) {',
          '        try {',
          '            int age = Integer.parseInt(ageInput);',
          '            System.out.println("Umur berhasil diparse: " + age);',
          '            return age;',
          '        } catch (NumberFormatException e) {',
          '            System.out.println("Umur tidak valid: \'" + ageInput + "\' - " + e.getMessage());',
          '            return -1;',
          '        } finally {',
          '            System.out.println("parseAge() selesai.");',
          '        }',
          '    }',
          '}',
        ],
        steps: [
          {
            lineIndex: 1,
            phase: 'normal',
            description: 'parseAge dipanggil dengan ageInput = "dua puluh"',
            stateVars: { ageInput: '"dua puluh"' },
          },
          {
            lineIndex: 2,
            phase: 'try',
            description: 'Masuk blok try',
            stateVars: {},
          },
          {
            lineIndex: 3,
            phase: 'throw',
            description:
              'Integer.parseInt("dua puluh") → bukan integer valid! NumberFormatException dilempar!',
            stateVars: { ageInput: '"dua puluh"' },
            isError: true,
          },
          {
            lineIndex: 6,
            phase: 'catch',
            description: 'Tangkap NumberFormatException',
            consoleOutput:
              'Umur tidak valid: \'dua puluh\' - For input string: "dua puluh"',
          },
          {
            lineIndex: 9,
            phase: 'finally',
            description: 'Finally berjalan',
            consoleOutput: 'parseAge() selesai.',
          },
          {
            lineIndex: 12,
            phase: 'recovered',
            description: 'Mengembalikan -1 sebagai nilai sentinel',
            stateVars: { dikembalikan: '-1' },
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
      'Dilempar untuk error aritmatika, paling umum pembagian dengan nol.',
    impact: 'Validasi pembagi sebelum melakukan operasi pembagian.',
    examples: [
      {
        title: 'Pembagian Dengan Nol',
        realWorld: 'Aplikasi Keuangan: Kalkulator Rata-rata',
        realWorldDetail:
          'Menghitung rata-rata pengeluaran per hari, tapi bulan tidak ada transaksi. Membagi total dengan 0 mencrash dashboard analitik.',
        code: [
          'public class FinanceService {',
          '    public double calcAverage(int total, int count) {',
          '        try {',
          '            double avg = total / count; // count bisa 0!',
          '            System.out.println("Rata-rata: " + avg);',
          '            return avg;',
          '        } catch (ArithmeticException e) {',
          '            System.out.println("Error matematika: " + e.getMessage());',
          '            return 0.0;',
          '        } finally {',
          '            System.out.println("calcAverage() selesai.");',
          '        }',
          '    }',
          '}',
        ],
        steps: [
          {
            lineIndex: 1,
            phase: 'normal',
            description: 'Dipanggil dengan total=500, count=0',
            stateVars: { total: '500', count: '0' },
          },
          {
            lineIndex: 2,
            phase: 'try',
            description: 'Masuk blok try',
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
            description: 'Tangkap ArithmeticException',
            consoleOutput: 'Error matematika: / by zero',
          },
          {
            lineIndex: 9,
            phase: 'finally',
            description: 'Finally dieksekusi',
            consoleOutput: 'calcAverage() selesai.',
          },
          {
            lineIndex: 12,
            phase: 'recovered',
            description: 'Mengembalikan 0.0 dengan aman',
            stateVars: { dikembalikan: '0.0' },
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
    description:
      'Dilempar saat mencoba cast objek ke tipe yang tidak kompatibel.',
    impact:
      'Gunakan instanceof sebelum casting untuk memverifikasi kompatibilitas tipe.',
    examples: [
      {
        title: 'Cast Tipe Tidak Valid',
        realWorld: 'Sistem Inventaris: Ketidakcocokan Tipe Produk',
        realWorldDetail:
          'List Produk generik berisi Electronics dan Clothing. Melakukan cast objek Clothing ke Electronics mencrash laporan inventaris.',
        code: [
          'public class InventoryService {',
          '    public void processProduct(Object product) {',
          '        try {',
          '            Electronics elec = (Electronics) product; // cast tidak aman!',
          '            elec.getWarrantyPeriod();',
          '        } catch (ClassCastException e) {',
          '            System.out.println("Cast gagal: " + e.getMessage());',
          '            System.out.println("Gunakan instanceof sebelum casting!");',
          '        } finally {',
          '            System.out.println("processProduct() selesai.");',
          '        }',
          '    }',
          '}',
        ],
        steps: [
          {
            lineIndex: 1,
            phase: 'normal',
            description: 'product sebenarnya adalah instance Clothing',
            stateVars: { 'product.type': 'Clothing' },
          },
          {
            lineIndex: 2,
            phase: 'try',
            description: 'Masuk blok try',
            stateVars: {},
          },
          {
            lineIndex: 3,
            phase: 'throw',
            description:
              '(Electronics) Clothing → tipe tidak kompatibel! ClassCastException dilempar!',
            stateVars: { aktual: 'Clothing', diharapkan: 'Electronics' },
            isError: true,
          },
          {
            lineIndex: 5,
            phase: 'catch',
            description: 'Tangkap ClassCastException',
            consoleOutput:
              'Cast gagal: class Clothing cannot be cast to class Electronics',
          },
          {
            lineIndex: 6,
            phase: 'catch',
            description: 'Sarankan penggunaan instanceof',
            consoleOutput: 'Gunakan instanceof sebelum casting!',
          },
          {
            lineIndex: 8,
            phase: 'finally',
            description: 'Finally berjalan',
            consoleOutput: 'processProduct() selesai.',
          },
          {
            lineIndex: 11,
            phase: 'recovered',
            description: 'Exception ditangani dengan baik',
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
      'Dilempar saat kedalaman call stack melebihi batas (biasanya rekursi tak terbatas).',
    impact: 'Selalu definisikan kasus dasar dalam fungsi rekursif.',
    examples: [
      {
        title: 'Rekursi Tak Terbatas',
        realWorld: 'Pemuat Konfigurasi: Referensi Sirkular',
        realWorldDetail:
          'ConfigA memuat ConfigB yang memuat ConfigA lagi — loop tak terbatas dalam resolusi konfigurasi mencrash server saat startup.',
        code: [
          'public class ConfigLoader {',
          '    public Config load(String name) {',
          '        // Tidak ada kasus dasar!',
          '        Config dep = load(name); // memanggil dirinya sendiri selamanya!',
          '        return dep;',
          '    }',
          '    public Config loadSafe(String name, int depth) {',
          '        try {',
          '            if (depth > 100) throw new RuntimeException("Terlalu dalam!");',
          '            return loadSafe(name, depth + 1);',
          '        } catch (StackOverflowError e) {',
          '            System.out.println("Stack overflow! Tambahkan kasus dasar.");',
          '            return Config.defaultConfig();',
          '        }',
          '    }',
          '}',
        ],
        steps: [
          {
            lineIndex: 1,
            phase: 'normal',
            description: "loadSafe('app', 0) dipanggil",
            stateVars: { depth: '0', name: '"app"' },
          },
          {
            lineIndex: 7,
            phase: 'try',
            description: 'Masuk blok try — pengecekan depth OK',
            stateVars: { depth: '0' },
          },
          {
            lineIndex: 8,
            phase: 'normal',
            description: 'depth=0 < 100, rekursi dengan depth+1',
            stateVars: { depth: '0 → 1' },
          },
          {
            lineIndex: 8,
            phase: 'normal',
            description: 'Merekursi... depth bertambah: 1, 2, 3...100...',
            stateVars: { depth: '1..100..' },
          },
          {
            lineIndex: 9,
            phase: 'throw',
            description:
              'Call stack habis! StackOverflowError dilempar oleh JVM!',
            stateVars: { depth: 'MAKS', 'call stack': 'PENUH' },
            isError: true,
          },
          {
            lineIndex: 10,
            phase: 'catch',
            description: 'Tangkap StackOverflowError',
            consoleOutput: 'Stack overflow! Tambahkan kasus dasar.',
          },
          {
            lineIndex: 12,
            phase: 'recovered',
            description: 'Kembalikan konfigurasi default dengan aman',
            stateVars: { dikembalikan: 'Config.defaultConfig()' },
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
    description: 'Dilempar saat method menerima argumen yang tidak sesuai.',
    impact: 'Gunakan untuk validasi input — dokumentasikan argumen yang valid.',
    examples: [
      {
        title: 'Parameter Tidak Valid',
        realWorld: 'Payment Gateway: Jumlah Negatif',
        realWorldDetail:
          'Bug dalam modul refund mengirimkan nilai negatif ke pemroses pembayaran. IAE mencegah pembayaran tidak valid diproses.',
        code: [
          'public class PaymentService {',
          '    public void processPayment(double amount) {',
          '        try {',
          '            if (amount <= 0) {',
          '                throw new IllegalArgumentException(',
          '                    "Jumlah harus positif: " + amount);',
          '            }',
          '            System.out.println("Memproses: Rp" + amount);',
          '        } catch (IllegalArgumentException e) {',
          '            System.out.println("Pembayaran tidak valid: " + e.getMessage());',
          '        } finally {',
          '            System.out.println("processPayment() selesai.");',
          '        }',
          '    }',
          '}',
        ],
        steps: [
          {
            lineIndex: 1,
            phase: 'normal',
            description: 'processPayment dipanggil dengan amount = -50.0',
            stateVars: { amount: '-50.0' },
          },
          {
            lineIndex: 2,
            phase: 'try',
            description: 'Masuk blok try',
            stateVars: {},
          },
          {
            lineIndex: 3,
            phase: 'normal',
            description: 'Cek: amount (-50.0) <= 0? YA',
            stateVars: { 'amount <= 0': 'true' },
          },
          {
            lineIndex: 4,
            phase: 'throw',
            description: 'Lempar IllegalArgumentException secara eksplisit!',
            stateVars: { amount: '-50.0' },
            isError: true,
          },
          {
            lineIndex: 8,
            phase: 'catch',
            description: 'Tangkap IllegalArgumentException',
            consoleOutput:
              'Pembayaran tidak valid: Jumlah harus positif: -50.0',
          },
          {
            lineIndex: 10,
            phase: 'finally',
            description: 'Finally berjalan',
            consoleOutput: 'processPayment() selesai.',
          },
          {
            lineIndex: 13,
            phase: 'recovered',
            description: 'Pembayaran ditolak — dana aman',
            stateVars: { status: 'ditolak' },
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
        title: 'File Tidak Ditemukan',
        realWorld: 'Generator Laporan: Template Hilang',
        realWorldDetail:
          'Mesin laporan mencoba membaca template.html untuk pembuatan email. Jika file template dihapus atau hilang, IOException mencrash pekerjaan laporan harian.',
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
          '            System.out.println("File tidak ada: " + e.getMessage());',
          '            return "<default>template</default>";',
          '        } catch (IOException e) {',
          '            System.out.println("Error IO: " + e.getMessage());',
          '        } finally {',
          '            System.out.println("readTemplate() selesai.");',
          '        }',
          '        return content.toString();',
          '    }',
          '}',
        ],
        steps: [
          {
            lineIndex: 2,
            phase: 'normal',
            description: "readTemplate dipanggil dengan path = 'template.html'",
            stateVars: { path: '"template.html"' },
          },
          {
            lineIndex: 3,
            phase: 'normal',
            description: 'Inisialisasi StringBuilder',
            stateVars: { content: 'kosong' },
          },
          {
            lineIndex: 4,
            phase: 'try',
            description: 'Try-with-resources: buka FileReader',
            stateVars: { path: '"template.html"' },
          },
          {
            lineIndex: 4,
            phase: 'throw',
            description:
              'FileNotFoundException! template.html tidak ada di disk',
            stateVars: { file: 'TIDAK DITEMUKAN' },
            isError: true,
          },
          {
            lineIndex: 9,
            phase: 'catch',
            description:
              'Tangkap FileNotFoundException (yang lebih spesifik duluan)',
            consoleOutput:
              'File tidak ada: template.html (No such file or directory)',
          },
          {
            lineIndex: 10,
            phase: 'catch',
            description: 'Kembalikan template default',
            stateVars: { dikembalikan: '"<default>template</default>"' },
          },
          {
            lineIndex: 14,
            phase: 'finally',
            description:
              'Finally berjalan — resource ditutup otomatis oleh try-with-resources',
            consoleOutput: 'readTemplate() selesai.',
          },
          {
            lineIndex: 17,
            phase: 'recovered',
            description: 'Layanan melanjutkan dengan template default',
            stateVars: { status: 'degradasi dengan baik' },
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

  const hasShown = useRef(false);

  useEffect(() => {
    if (hasShown.current) return;

    hasShown.current = true;
    toast.info('Disarankan menggunakan device desktop');
  }, []);

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

  const handleNext = () => {
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
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setTerminalLines([]);
  };

  const catColor =
    selectedError.category === 'Error'
      ? '#ec4899'
      : selectedError.category === 'CheckedException'
        ? '#38bdf8'
        : '#fb923c';

  return (
    <div className="flex min-h-screen flex-col bg-[#0d1117] font-mono text-slate-200">
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
                Penanganan Exception
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
        <div className="flex items-center gap-3 border-t border-slate-800/60 bg-slate-900/30 px-4 py-2">
          <span className="text-xs text-slate-500">Contoh:</span>
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
            <div
              className={`rounded-md border px-2.5 py-0.5 text-xs font-bold ${PHASE_STYLES[step.phase].bg} ${PHASE_STYLES[step.phase].border} ${PHASE_STYLES[step.phase].text}`}
            >
              {PHASE_LABELS[step.phase]}
            </div>
          </div>

          <div className="flex min-h-[52px] items-center border-b border-slate-800 bg-slate-900/20 px-4 py-2.5">
            {step.stateVars && Object.keys(step.stateVars).length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs tracking-wider text-slate-600 uppercase">
                  Status:
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
              <p className="text-xs text-slate-600 italic">
                {step.description}
              </p>
            )}
          </div>

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

          <div className="border-t border-slate-800 bg-slate-900/30 px-4 py-3">
            <Terminal lines={terminalLines} />
          </div>

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
            <div className="flex justify-center gap-2">
              <Button
                variant="outlined"
                size="sm"
                onClick={handleReset}
                disabled={currentStep === 0}
                className="h-8 border-slate-700 bg-slate-800 px-3 text-xs text-slate-300 hover:bg-slate-700 disabled:opacity-30"
              >
                ⏮ Ulang
              </Button>
              <Button
                variant="outlined"
                size="sm"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="h-8 border-slate-700 bg-slate-800 px-4 text-xs text-slate-300 hover:bg-slate-700 disabled:opacity-30"
              >
                ← Sebelumnya
              </Button>
              <Button
                variant="outlined"
                size="sm"
                onClick={handleNext}
                disabled={currentStep === totalSteps - 1}
                className="h-8 border-slate-700 bg-slate-800 px-4 text-xs text-slate-300 hover:bg-slate-700 disabled:opacity-30"
              >
                Berikutnya →
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
                exception.info
              </span>
            </div>
            <span className="text-xs text-slate-500">{step.description}</span>
          </div>

          <div className="flex flex-1 flex-col gap-4 overflow-auto px-5 py-4">
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
                          ? 'Kode yang mungkin melempar'
                          : ph === 'throw'
                            ? 'Exception dilempar di sini'
                            : ph === 'catch'
                              ? 'Tangani exception'
                              : ph === 'finally'
                                ? 'Selalu dieksekusi (pembersihan)'
                                : 'Program melanjutkan dengan aman'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="mb-3 text-xs tracking-wider text-slate-500 uppercase">
                Hierarki Exception Java
              </p>
              <div className="font-mono text-xs">
                {[
                  { label: 'Throwable', indent: 0, color: '#94a3b8' },
                  {
                    label: '├── Error (error JVM)',
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
