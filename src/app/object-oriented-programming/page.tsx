'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

type PillarKey =
  | 'inheritance'
  | 'encapsulation'
  | 'polymorphism'
  | 'abstraction';

interface CodeStep {
  lineIndex: number;
  file: string;
  description: string;
  stateVars?: Record<string, string>;
  highlightClasses?: string[];
  highlightRelation?: string;
  phase:
    | 'normal'
    | 'inherit'
    | 'override'
    | 'encapsulate'
    | 'polymorphic'
    | 'abstract';
}

interface ClassNode {
  name: string;
  kind: 'abstract' | 'interface' | 'concrete' | 'parent';
  fields?: string[];
  methods?: string[];
  accent: string;
}

interface PillarScenario {
  key: PillarKey;
  label: string;
  shortDesc: string;
  accent: string;
  definition: string;
  benefit: string;
  classes: ClassNode[];
  files: Record<string, string[]>;
  steps: CodeStep[];
}

// ─── Pillar Definitions ───────────────────────────────────────────────────────

const PILLARS: PillarScenario[] = [
  {
    key: 'inheritance',
    label: 'Pewarisan',
    shortDesc: 'Gunakan ulang kode parent di kelas anak',
    accent: '#38bdf8',
    definition:
      'Sebuah kelas (anak) mewarisi field dan method dari kelas lain (parent) menggunakan kata kunci extends.',
    benefit:
      'Penggunaan ulang kode — tulis sekali di parent, gunakan di semua anak. Memodelkan hubungan IS-A.',
    classes: [
      {
        name: 'Animal',
        kind: 'parent',
        accent: '#38bdf8',
        fields: ['name: String', 'age: int'],
        methods: ['eat()', 'sleep()', 'makeSound()'],
      },
      {
        name: 'Dog',
        kind: 'concrete',
        accent: '#34d399',
        fields: ['breed: String'],
        methods: ['makeSound() ← override', 'fetch()'],
      },
      {
        name: 'Cat',
        kind: 'concrete',
        accent: '#fb923c',
        fields: ['isIndoor: boolean'],
        methods: ['makeSound() ← override', 'purr()'],
      },
    ],
    files: {
      'Animal.java': [
        'public class Animal {',
        '    protected String name;',
        '    protected int age;',
        '',
        '    public Animal(String name, int age) {',
        '        this.name = name;',
        '        this.age  = age;',
        '    }',
        '',
        '    public void eat()   { System.out.println(name + " sedang makan"); }',
        '    public void sleep() { System.out.println(name + " sedang tidur"); }',
        '',
        '    public void makeSound() {',
        '        System.out.println("..."); // default',
        '    }',
        '}',
      ],
      'Dog.java': [
        'public class Dog extends Animal {',
        '    private String breed;',
        '',
        '    public Dog(String name, int age, String breed) {',
        '        super(name, age); // panggil constructor parent',
        '        this.breed = breed;',
        '    }',
        '',
        '    @Override',
        '    public void makeSound() {',
        '        System.out.println(name + " bilang: Guk!");',
        '    }',
        '',
        '    public void fetch() {',
        '        System.out.println(name + " mengambil bola!");',
        '    }',
        '}',
      ],
      'Main.java': [
        'public class Main {',
        '    public static void main(String[] args) {',
        '        Dog d = new Dog("Buddy", 3, "Labrador");',
        '        Cat c = new Cat("Whiskers", 2, true);',
        '        d.eat();         // diwarisi dari Animal',
        '        d.makeSound();   // versi Dog yang di-override',
        '        d.fetch();       // method khusus Dog',
        '        c.makeSound();   // versi Cat yang di-override',
        '    }',
        '}',
      ],
    },
    steps: [
      {
        lineIndex: 0,
        file: 'Animal.java',
        description: 'Animal adalah kelas PARENT (dasar)',
        phase: 'inherit',
        highlightClasses: ['Animal'],
      },
      {
        lineIndex: 1,
        file: 'Animal.java',
        description: 'field protected — dapat diakses oleh kelas anak',
        phase: 'normal',
        highlightClasses: ['Animal'],
        stateVars: { akses: 'protected' },
      },
      {
        lineIndex: 12,
        file: 'Animal.java',
        description: 'makeSound() didefinisikan di parent — bisa di-override',
        phase: 'normal',
        highlightClasses: ['Animal'],
      },
      {
        lineIndex: 0,
        file: 'Dog.java',
        description: 'Dog EXTENDS Animal — Dog IS-A Animal',
        phase: 'inherit',
        highlightClasses: ['Animal', 'Dog'],
        highlightRelation: 'Animal→Dog',
      },
      {
        lineIndex: 4,
        file: 'Dog.java',
        description:
          'super(name, age) — memanggil constructor Animal terlebih dahulu',
        phase: 'inherit',
        highlightClasses: ['Animal', 'Dog'],
        stateVars: { 'super()': 'constructor Animal' },
      },
      {
        lineIndex: 9,
        file: 'Dog.java',
        description: '@Override — Dog menyediakan makeSound() miliknya sendiri',
        phase: 'override',
        highlightClasses: ['Dog'],
        stateVars: { override: 'makeSound()' },
      },
      {
        lineIndex: 2,
        file: 'Main.java',
        description: 'new Dog() — membuat instance Dog (juga IS-A Animal)',
        phase: 'inherit',
        highlightClasses: ['Dog'],
        stateVars: { d: 'Dog@memori' },
      },
      {
        lineIndex: 4,
        file: 'Main.java',
        description:
          'd.eat() — diwarisi dari Animal! Dog tidak mendefinisikan ini',
        phase: 'inherit',
        highlightClasses: ['Animal', 'Dog'],
        stateVars: { output: '"Buddy sedang makan"' },
      },
      {
        lineIndex: 5,
        file: 'Main.java',
        description: 'd.makeSound() — versi Dog yang dipanggil (di-override)',
        phase: 'override',
        highlightClasses: ['Dog'],
        stateVars: { output: '"Buddy bilang: Guk!"' },
      },
      {
        lineIndex: 6,
        file: 'Main.java',
        description: 'd.fetch() — method khusus Dog, Animal tidak punya ini',
        phase: 'normal',
        highlightClasses: ['Dog'],
        stateVars: { output: '"Buddy mengambil bola!"' },
      },
    ],
  },
  {
    key: 'encapsulation',
    label: 'Enkapsulasi',
    shortDesc: 'Sembunyikan data, ekspos melalui method',
    accent: '#f87171',
    definition:
      'Satukan data (field) dan method yang beroperasi pada data menjadi satu unit, menyembunyikan keadaan internal dengan access modifier.',
    benefit:
      'Perlindungan data — mencegah modifikasi langsung pada field. Akses terkontrol via getter/setter.',
    classes: [
      {
        name: 'BankAccount',
        kind: 'concrete',
        accent: '#f87171',
        fields: ['- balance: double', '- pin: String', '- owner: String'],
        methods: [
          '+ deposit()',
          '+ withdraw()',
          '+ getBalance()',
          '- validatePin()',
        ],
      },
    ],
    files: {
      'BankAccount.java': [
        'public class BankAccount {',
        '    private double balance; // tersembunyi dari luar!',
        '    private String pin;     // data sensitif',
        '    private String owner;',
        '',
        '    public BankAccount(String owner, String pin, double init) {',
        '        this.owner   = owner;',
        '        this.pin     = pin;',
        '        this.balance = init;',
        '    }',
        '',
        '    // Getter publik — akses baca terkontrol',
        '    public double getBalance() {',
        '        return balance;',
        '    }',
        '',
        '    // Setter publik dengan validasi',
        '    public void deposit(double amount) {',
        '        if (amount > 0) balance += amount;',
        '        else System.out.println("Jumlah tidak valid!");',
        '    }',
        '',
        '    public boolean withdraw(double amount, String inputPin) {',
        '        if (!validatePin(inputPin)) {',
        '            System.out.println("PIN salah!");',
        '            return false;',
        '        }',
        '        if (amount > balance) { System.out.println("Saldo tidak cukup!"); return false; }',
        '        balance -= amount;',
        '        return true;',
        '    }',
        '',
        '    private boolean validatePin(String input) { // helper private',
        '        return pin.equals(input);',
        '    }',
        '}',
      ],
      'Main.java': [
        'public class Main {',
        '    public static void main(String[] args) {',
        '        BankAccount acc = new BankAccount("Budi","1234",500.0);',
        '        // acc.balance = 9999; // ERROR! private',
        '        // acc.pin = "0000";  // ERROR! private',
        '        acc.deposit(200.0);',
        '        System.out.println(acc.getBalance()); // 700.0',
        '        acc.withdraw(100.0, "1234");          // PIN benar',
        '        acc.withdraw(100.0, "9999");          // PIN salah',
        '    }',
        '}',
      ],
    },
    steps: [
      {
        lineIndex: 0,
        file: 'BankAccount.java',
        description:
          'Kelas BankAccount — mengenkapsulasi semua logika perbankan',
        phase: 'encapsulate',
        highlightClasses: ['BankAccount'],
      },
      {
        lineIndex: 1,
        file: 'BankAccount.java',
        description: 'private double balance — TIDAK BISA diakses dari luar!',
        phase: 'encapsulate',
        stateVars: { 'access modifier': 'private' },
        highlightClasses: ['BankAccount'],
      },
      {
        lineIndex: 2,
        file: 'BankAccount.java',
        description: 'private String pin — sensitif, sepenuhnya tersembunyi',
        phase: 'encapsulate',
        stateVars: { 'access modifier': 'private' },
      },
      {
        lineIndex: 12,
        file: 'BankAccount.java',
        description:
          'public getBalance() — akses BACA terkontrol ke field private',
        phase: 'encapsulate',
        stateVars: { pola: 'getter' },
      },
      {
        lineIndex: 17,
        file: 'BankAccount.java',
        description:
          'deposit() memvalidasi sebelum mengubah balance — nilai tidak valid tidak bisa masuk!',
        phase: 'encapsulate',
        stateVars: { validasi: 'amount > 0' },
      },
      {
        lineIndex: 22,
        file: 'BankAccount.java',
        description: 'withdraw() memerlukan PIN — menerapkan aturan bisnis',
        phase: 'encapsulate',
        stateVars: { keamanan: 'cek PIN' },
      },
      {
        lineIndex: 31,
        file: 'BankAccount.java',
        description:
          'private validatePin() — helper internal, tersembunyi dari luar',
        phase: 'encapsulate',
        stateVars: { akses: 'private' },
      },
      {
        lineIndex: 2,
        file: 'Main.java',
        description:
          'Buat akun — constructor adalah satu-satunya cara mengatur keadaan awal',
        phase: 'normal',
        stateVars: { balance: '500.0', owner: '"Budi"' },
      },
      {
        lineIndex: 3,
        file: 'Main.java',
        description:
          'acc.balance = 9999 akan menjadi ERROR KOMPILASI — private!',
        phase: 'encapsulate',
        stateVars: { ERROR: 'Tidak bisa akses anggota private' },
      },
      {
        lineIndex: 5,
        file: 'Main.java',
        description: 'acc.deposit(200.0) — valid, melewati validasi',
        phase: 'normal',
        stateVars: { balance: '700.0' },
      },
      {
        lineIndex: 7,
        file: 'Main.java',
        description: 'withdraw dengan PIN benar — berhasil',
        phase: 'normal',
        stateVars: { balance: '600.0', PIN: '✓ benar' },
      },
      {
        lineIndex: 8,
        file: 'Main.java',
        description: 'withdraw dengan PIN salah — ditolak oleh validatePin()',
        phase: 'encapsulate',
        stateVars: { output: '"PIN salah!"', PIN: '✗ salah' },
      },
    ],
  },
  {
    key: 'polymorphism',
    label: 'Polimorfisme',
    shortDesc: 'Satu antarmuka, banyak perilaku',
    accent: '#a78bfa',
    definition:
      'Kemampuan kelas yang berbeda untuk merespons panggilan method yang sama dengan cara mereka sendiri (method overriding + method overloading).',
    benefit:
      'Tulis satu antarmuka, tangani banyak tipe objek. Memungkinkan kode yang fleksibel dan mudah diperluas.',
    classes: [
      {
        name: 'Shape',
        kind: 'abstract',
        accent: '#a78bfa',
        fields: ['color: String'],
        methods: ['draw() ← abstrak', 'area() ← abstrak', 'describe()'],
      },
      {
        name: 'Circle',
        kind: 'concrete',
        accent: '#34d399',
        fields: ['radius: double'],
        methods: ['draw()', 'area()'],
      },
      {
        name: 'Rectangle',
        kind: 'concrete',
        accent: '#fb923c',
        fields: ['width: double', 'height: double'],
        methods: ['draw()', 'area()'],
      },
      {
        name: 'Triangle',
        kind: 'concrete',
        accent: '#f87171',
        fields: ['base: double', 'height: double'],
        methods: ['draw()', 'area()'],
      },
    ],
    files: {
      'Shape.java': [
        'public abstract class Shape {',
        '    protected String color;',
        '',
        '    public Shape(String color) {',
        '        this.color = color;',
        '    }',
        '',
        '    public abstract void draw();   // harus di-override',
        '    public abstract double area(); // harus di-override',
        '',
        '    public void describe() {',
        '        System.out.println(color + " bentuk, luas=" + area());',
        '    }',
        '}',
      ],
      'Circle.java': [
        'public class Circle extends Shape {',
        '    private double radius;',
        '',
        '    public Circle(String color, double radius) {',
        '        super(color);',
        '        this.radius = radius;',
        '    }',
        '',
        '    @Override',
        '    public void draw()  { System.out.println("Menggambar lingkaran ○"); }',
        '',
        '    @Override',
        '    public double area() { return Math.PI * radius * radius; }',
        '}',
      ],
      'Main.java': [
        'public class Main {',
        '    public static void main(String[] args) {',
        '        Shape[] shapes = {',
        '            new Circle("Merah", 5.0),',
        '            new Rectangle("Biru", 4.0, 3.0),',
        '            new Triangle("Hijau", 6.0, 4.0)',
        '        };',
        '        for (Shape s : shapes) {',
        '            s.draw();    // panggilan polimorfik!',
        '            s.describe();',
        '        }',
        '    }',
        '}',
      ],
    },
    steps: [
      {
        lineIndex: 0,
        file: 'Shape.java',
        description: 'abstract class Shape — mendefinisikan antarmuka umum',
        phase: 'abstract',
        highlightClasses: ['Shape'],
      },
      {
        lineIndex: 7,
        file: 'Shape.java',
        description:
          'abstract draw() — setiap bentuk HARUS mengimplementasi ini',
        phase: 'abstract',
        highlightClasses: ['Shape'],
        stateVars: { abstrak: 'memaksa override' },
      },
      {
        lineIndex: 10,
        file: 'Shape.java',
        description:
          'describe() menggunakan area() — bekerja secara polimorfik untuk SEMUA bentuk',
        phase: 'polymorphic',
        highlightClasses: ['Shape'],
      },
      {
        lineIndex: 0,
        file: 'Circle.java',
        description:
          'Circle extends Shape — mewarisi + harus mengimplementasi method abstrak',
        phase: 'inherit',
        highlightClasses: ['Shape', 'Circle'],
      },
      {
        lineIndex: 8,
        file: 'Circle.java',
        description: 'Circle.draw() — versi draw() miliknya sendiri',
        phase: 'polymorphic',
        highlightClasses: ['Circle'],
        stateVars: { 'draw()': 'versi Circle' },
      },
      {
        lineIndex: 11,
        file: 'Circle.java',
        description: 'Circle.area() — π × r²',
        phase: 'polymorphic',
        highlightClasses: ['Circle'],
        stateVars: { rumus: 'π × r²' },
      },
      {
        lineIndex: 2,
        file: 'Main.java',
        description:
          'Array Shape — menampung Circle, Rectangle, Triangle (polimorfisme!)',
        phase: 'polymorphic',
        highlightClasses: ['Shape', 'Circle', 'Rectangle', 'Triangle'],
        stateVars: { tipe: 'Shape[] — array polimorfik' },
      },
      {
        lineIndex: 7,
        file: 'Main.java',
        description:
          'Loop atas shapes — kode sama, perilaku berbeda per tipe objek',
        phase: 'polymorphic',
        highlightClasses: ['Shape'],
      },
      {
        lineIndex: 8,
        file: 'Main.java',
        description: 's.draw() pada Circle → Circle.draw() dipanggil otomatis!',
        phase: 'polymorphic',
        highlightClasses: ['Circle'],
        stateVars: {
          dipanggil: 'Circle.draw()',
          output: '"Menggambar lingkaran ○"',
        },
      },
      {
        lineIndex: 8,
        file: 'Main.java',
        description:
          's.draw() pada Rectangle → Rectangle.draw() dipanggil otomatis!',
        phase: 'polymorphic',
        highlightClasses: ['Rectangle'],
        stateVars: {
          dipanggil: 'Rectangle.draw()',
          output: '"Menggambar persegi □"',
        },
      },
      {
        lineIndex: 8,
        file: 'Main.java',
        description:
          's.draw() pada Triangle → Triangle.draw() dipanggil otomatis!',
        phase: 'polymorphic',
        highlightClasses: ['Triangle'],
        stateVars: {
          dipanggil: 'Triangle.draw()',
          output: '"Menggambar segitiga △"',
        },
      },
    ],
  },
  {
    key: 'abstraction',
    label: 'Abstraksi',
    shortDesc: 'Sembunyikan implementasi, tampilkan antarmuka',
    accent: '#fbbf24',
    definition:
      'Kelas abstrak dan antarmuka mendefinisikan APA yang bisa dilakukan kelas tanpa menentukan BAGAIMANA. Detail implementasi disembunyikan.',
    benefit:
      'Fokus pada yang penting — sembunyikan kerumitan. Menegakkan kontrak yang harus dipenuhi semua subkelas.',
    classes: [
      {
        name: '<<interface>>\\nPaymentGateway',
        kind: 'interface',
        accent: '#fbbf24',
        fields: [],
        methods: ['processPayment()', 'refund()', 'getStatus()'],
      },
      {
        name: 'StripePayment',
        kind: 'concrete',
        accent: '#34d399',
        fields: ['apiKey: String'],
        methods: ['processPayment()', 'refund()', 'getStatus()'],
      },
      {
        name: 'PayPalPayment',
        kind: 'concrete',
        accent: '#38bdf8',
        fields: ['clientId: String'],
        methods: ['processPayment()', 'refund()', 'getStatus()'],
      },
    ],
    files: {
      'PaymentGateway.java': [
        '// Interface — abstraksi murni',
        'public interface PaymentGateway {',
        '    boolean processPayment(double amount, String currency);',
        '    boolean refund(String transactionId);',
        '    String  getStatus(String transactionId);',
        '    // Tidak ada implementasi di sini!',
        '}',
      ],
      'StripePayment.java': [
        'public class StripePayment implements PaymentGateway {',
        '    private String apiKey;',
        '',
        '    public StripePayment(String apiKey) {',
        '        this.apiKey = apiKey;',
        '    }',
        '',
        '    @Override',
        '    public boolean processPayment(double amount, String currency) {',
        '        System.out.println("Stripe: menagih " + amount + " " + currency);',
        '        // Logika API khusus Stripe...',
        '        return true;',
        '    }',
        '',
        '    @Override',
        '    public boolean refund(String txId) {',
        '        System.out.println("Stripe refund: " + txId);',
        '        return true;',
        '    }',
        '',
        '    @Override',
        '    public String getStatus(String txId) { return "stripe_" + txId + "_ok"; }',
        '}',
      ],
      'Main.java': [
        'public class Main {',
        '    public static void main(String[] args) {',
        '        // Gunakan abstraksi — kode ke antarmuka!',
        '        PaymentGateway gateway;',
        '',
        '        // Ganti implementasi dengan mudah:',
        '        gateway = new StripePayment("sk_live_...");',
        '        // gateway = new PayPalPayment("client_id"); // juga bisa!',
        '',
        '        gateway.processPayment(99.99, "USD");',
        '        gateway.refund("txn_abc123");',
        '        System.out.println(gateway.getStatus("txn_abc123"));',
        '    }',
        '}',
      ],
    },
    steps: [
      {
        lineIndex: 1,
        file: 'PaymentGateway.java',
        description:
          'interface PaymentGateway — mendefinisikan KONTRAK (apa, bukan bagaimana)',
        phase: 'abstract',
        highlightClasses: ['<<interface>>\\nPaymentGateway'],
      },
      {
        lineIndex: 2,
        file: 'PaymentGateway.java',
        description:
          'processPayment() — dideklarasikan tapi TIDAK ADA implementasi!',
        phase: 'abstract',
        stateVars: { abstraksi: 'hanya tanda tangan' },
      },
      {
        lineIndex: 3,
        file: 'PaymentGateway.java',
        description:
          'refund() — semua implementor harus menyediakan perilaku ini',
        phase: 'abstract',
        stateVars: { menegakkan: 'semua implementor' },
      },
      {
        lineIndex: 0,
        file: 'StripePayment.java',
        description:
          'StripePayment IMPLEMENTS PaymentGateway — memenuhi kontrak',
        phase: 'abstract',
        highlightClasses: ['<<interface>>\\nPaymentGateway', 'StripePayment'],
      },
      {
        lineIndex: 8,
        file: 'StripePayment.java',
        description:
          'processPayment() — implementasi khusus Stripe (panggilan API Stripe)',
        phase: 'normal',
        highlightClasses: ['StripePayment'],
        stateVars: { impl: 'API Stripe' },
      },
      {
        lineIndex: 15,
        file: 'StripePayment.java',
        description: 'refund() — logika refund milik Stripe',
        phase: 'normal',
        highlightClasses: ['StripePayment'],
      },
      {
        lineIndex: 3,
        file: 'Main.java',
        description:
          'PaymentGateway gateway — dideklarasikan sebagai tipe INTERFACE (abstraksi)',
        phase: 'abstract',
        highlightClasses: ['<<interface>>\\nPaymentGateway'],
        stateVars: { tipe: 'PaymentGateway (interface)' },
      },
      {
        lineIndex: 6,
        file: 'Main.java',
        description:
          'Assign StripePayment — bisa diganti ke PayPal tanpa mengubah kode lain!',
        phase: 'polymorphic',
        highlightClasses: ['StripePayment'],
        stateVars: { gateway: 'StripePayment' },
      },
      {
        lineIndex: 9,
        file: 'Main.java',
        description:
          'gateway.processPayment() — pemanggil tidak tahu itu Stripe! Abstraksi bekerja!',
        phase: 'abstract',
        highlightClasses: ['StripePayment'],
        stateVars: { output: '"Stripe: menagih 99.99 USD"' },
      },
      {
        lineIndex: 10,
        file: 'Main.java',
        description:
          'gateway.refund() — antarmuka sama, bisa ganti ke PayPal kapan saja',
        phase: 'abstract',
        stateVars: { output: '"Stripe refund: txn_abc123"' },
      },
    ],
  },
];

// ─── Class Hierarchy Diagram ──────────────────────────────────────────────────

function ClassDiagram({
  scenario,
  activeClasses,
}: {
  scenario: PillarScenario;
  activeClasses: string[];
}) {
  const classes = scenario.classes;
  if (classes.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
      <p className="mb-3 text-xs tracking-wider text-slate-500 uppercase">
        Diagram Kelas
      </p>
      <div className="flex flex-col gap-2">
        {classes.map((cls, i) => {
          const isActive = activeClasses.some((a) =>
            a.includes(cls.name.split('\\n').pop()!),
          );
          const isParent =
            cls.kind === 'parent' ||
            cls.kind === 'abstract' ||
            cls.kind === 'interface';

          return (
            <div key={cls.name}>
              {i > 0 && isParent === false && (
                <div className="my-1 flex justify-center">
                  <div
                    className="h-4 border-l-2 border-dashed"
                    style={{ borderColor: `${cls.accent}50` }}
                  />
                </div>
              )}
              <div
                className={`overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                  isActive ? 'shadow-lg' : 'opacity-50'
                }`}
                style={{ borderColor: isActive ? cls.accent : '#1e293b' }}
              >
                <div
                  className="flex items-center gap-2 border-b px-3 py-2"
                  style={{
                    borderColor: `${cls.accent}30`,
                    background: isActive ? `${cls.accent}15` : '#1e293b50',
                  }}
                >
                  {cls.kind === 'interface' && (
                    <span
                      className="rounded border px-1.5 py-0.5 text-xs"
                      style={{
                        borderColor: `${cls.accent}50`,
                        color: cls.accent,
                      }}
                    >
                      interface
                    </span>
                  )}
                  {cls.kind === 'abstract' && (
                    <span
                      className="rounded border px-1.5 py-0.5 text-xs"
                      style={{
                        borderColor: `${cls.accent}50`,
                        color: cls.accent,
                      }}
                    >
                      abstrak
                    </span>
                  )}
                  <span
                    className="font-mono text-sm font-bold"
                    style={{ color: isActive ? cls.accent : '#475569' }}
                  >
                    {cls.name.replace('\\n', ' ')}
                  </span>
                </div>
                {cls.fields && cls.fields.length > 0 && (
                  <div className="border-b border-slate-800/50 px-3 py-1.5">
                    {cls.fields.map((f) => (
                      <p
                        key={f}
                        className="font-mono text-xs"
                        style={{ color: isActive ? '#94a3b8' : '#334155' }}
                      >
                        {f}
                      </p>
                    ))}
                  </div>
                )}
                {cls.methods && cls.methods.length > 0 && (
                  <div className="px-3 py-1.5">
                    {cls.methods.map((m) => (
                      <p
                        key={m}
                        className="font-mono text-xs"
                        style={{ color: isActive ? '#a78bfa' : '#2d3748' }}
                      >
                        {m}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OOPPillarsPage() {
  const [selectedPillar, setSelectedPillar] = useState<PillarScenario>(
    PILLARS[0],
  );
  const [activeFile, setActiveFile] = useState<string>(
    Object.keys(PILLARS[0].files)[0],
  );
  const [currentStep, setCurrentStep] = useState(0);

  const step = selectedPillar.steps[currentStep];
  const totalSteps = selectedPillar.steps.length;
  const displayCode = selectedPillar.files[activeFile] || [];
  const activeLineIdx = step.file === activeFile ? step.lineIndex : -1;
  const fileNames = Object.keys(selectedPillar.files);

  const handleSelectPillar = (p: PillarScenario) => {
    setSelectedPillar(p);
    setCurrentStep(0);
    setActiveFile(Object.keys(p.files)[0]);
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      const next = selectedPillar.steps[currentStep + 1];
      setCurrentStep((s) => s + 1);
      setActiveFile(next.file);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prev = selectedPillar.steps[currentStep - 1];
      setCurrentStep((s) => s - 1);
      setActiveFile(prev.file);
    }
  };

  const hasShown = useRef(false);

  useEffect(() => {
    if (hasShown.current) return;

    hasShown.current = true;
    toast.info('Disarankan menggunakan device desktop');
  }, []);

  const phaseStyles: Record<string, string> = {
    normal: 'text-slate-400 border-slate-700 bg-slate-800/50',
    inherit: 'text-sky-400 border-sky-500/40 bg-sky-500/10',
    override: 'text-violet-400 border-violet-500/40 bg-violet-500/10',
    encapsulate: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
    polymorphic: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
    abstract: 'text-fuchsia-400 border-fuchsia-500/40 bg-fuchsia-500/10',
  };
  const phaseLabels: Record<string, string> = {
    normal: '▶ Berjalan',
    inherit: '↕ Mewarisi',
    override: '⟲ Override',
    encapsulate: '🔒 Enkapsulasi',
    polymorphic: '◈ Polimorfik',
    abstract: '◇ Abstrak',
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0d1117] font-mono text-slate-200">
      <div className="sticky top-0 z-50 border-b border-slate-800 bg-[#0d1117]/95 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href={'/'}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
                OOP
              </div>
            </Link>
            <div>
              <h1 className="text-base leading-none font-bold text-white">
                Pilar OOP
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Pewarisan · Enkapsulasi · Polimorfisme · Abstraksi
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {PILLARS.map((p) => (
              <button
                key={p.key}
                onClick={() => handleSelectPillar(p)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedPillar.key === p.key
                    ? 'border-violet-400 bg-violet-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.5)]'
                    : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                }`}
              >
                <span
                  className="mr-1.5 inline-block h-2 w-2 rounded-full"
                  style={{ background: p.accent }}
                />
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-slate-800/60 bg-slate-900/30 px-4 py-2">
          <span className="text-xs text-slate-500">File:</span>
          {fileNames.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFile(f)}
              className={`rounded-md border px-3 py-1 text-xs transition-all ${
                activeFile === f
                  ? 'border-slate-500 bg-slate-700 text-slate-200'
                  : 'border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
          <div
            className={`ml-auto rounded-md border px-2.5 py-0.5 text-xs font-semibold ${phaseStyles[step.phase]}`}
          >
            {phaseLabels[step.phase]}
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
              <span className="ml-2 text-xs text-slate-400">{activeFile}</span>
              {step.file !== activeFile && (
                <Badge
                  variant="outlined"
                  className="border-amber-700 text-xs text-amber-600"
                >
                  aktif di: {step.file}
                </Badge>
              )}
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
                    <span className="text-xs text-amber-300">{v}</span>
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
            {displayCode.map((line, idx) => {
              const isActive = idx === activeLineIdx;
              const isDim = activeLineIdx >= 0 && !isActive;
              const lineColor = isActive
                ? step.phase === 'encapsulate'
                  ? 'bg-rose-500/20 border-l-2 border-rose-400'
                  : step.phase === 'abstract'
                    ? 'bg-fuchsia-500/20 border-l-2 border-fuchsia-400'
                    : step.phase === 'polymorphic'
                      ? 'bg-amber-500/15 border-l-2 border-amber-400'
                      : step.phase === 'inherit'
                        ? 'bg-sky-500/15 border-l-2 border-sky-400'
                        : 'bg-violet-500/20 border-l-2 border-violet-400'
                : 'border-l-2 border-transparent';

              return (
                <div
                  key={idx}
                  className={`flex items-start rounded-r-md transition-all duration-200 ${lineColor}`}
                >
                  <span
                    className={`w-10 shrink-0 px-2 py-1.5 text-right text-xs select-none ${isActive ? 'text-violet-400' : 'text-slate-700'}`}
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
            <div className="mb-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-slate-800">
                <div
                  className="h-1.5 rounded-full bg-violet-500 transition-all"
                  style={{
                    width: `${(currentStep / (totalSteps - 1)) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs text-slate-500">
                {currentStep + 1}/{totalSteps}
              </span>
            </div>
            <div className="flex justify-center gap-2">
              <Button
                variant="outlined"
                size="sm"
                onClick={() => {
                  setCurrentStep(0);
                  setActiveFile(fileNames[0]);
                }}
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
                diagram.tampilan
              </span>
            </div>
            <span className="max-w-[300px] text-right text-xs text-slate-500">
              {step.description}
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-4 overflow-auto px-5 py-4">
            <div
              className="rounded-xl border p-4"
              style={{
                borderColor: `${selectedPillar.accent}40`,
                background: `${selectedPillar.accent}08`,
              }}
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: selectedPillar.accent }}
                />
                <p
                  className="text-sm font-bold"
                  style={{ color: selectedPillar.accent }}
                >
                  {selectedPillar.label}
                </p>
              </div>
              <p className="mb-2 text-xs leading-relaxed text-slate-300">
                {selectedPillar.definition}
              </p>
              <div className="flex items-start gap-2 rounded-lg bg-slate-900/50 px-3 py-2">
                <span className="text-xs text-amber-400">⚡</span>
                <p className="text-xs text-amber-300/80">
                  {selectedPillar.benefit}
                </p>
              </div>
            </div>

            <ClassDiagram
              scenario={selectedPillar}
              activeClasses={step.highlightClasses || []}
            />

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="mb-3 text-xs tracking-wider text-slate-500 uppercase">
                4 Pilar OOP
              </p>
              <div className="grid grid-cols-2 gap-2">
                {PILLARS.map((p) => (
                  <div
                    key={p.key}
                    className={`cursor-pointer rounded-lg border p-2.5 transition-all ${
                      selectedPillar.key === p.key
                        ? 'border-slate-600 bg-slate-800/60'
                        : 'border-slate-800 bg-slate-800/20 opacity-50'
                    }`}
                    onClick={() => handleSelectPillar(p)}
                  >
                    <p
                      className="mb-0.5 text-xs font-bold"
                      style={{ color: p.accent }}
                    >
                      {p.label}
                    </p>
                    <p className="text-xs text-slate-600">{p.shortDesc}</p>
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
