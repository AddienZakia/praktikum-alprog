'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type ScenarioKey = 'basic' | 'constructor' | 'multifile';

interface BlueprintField {
  kind: 'attribute' | 'method' | 'constructor';
  name: string;
  type?: string;
  params?: string;
  active?: boolean;
}

// interface ObjectInstance {
//   name: string;
//   fields: Record<string, string>;
//   active?: boolean;
// }

interface CodeStep {
  lineIndex: number;
  file: 'class' | 'main';
  description: string;
  stateVars?: Record<string, string>;
  activeBlueprint?: string[];
  activeObjects?: string[];
  objectState?: Record<string, Record<string, string>>;
  highlightObjectField?: string;
  phase: 'normal' | 'instantiate' | 'method' | 'return' | 'import';
}

interface Scenario {
  key: ScenarioKey;
  title: string;
  description: string;
  classCode: string[];
  mainCode: string[];
  blueprint: BlueprintField[];
  steps: CodeStep[];
}

// ─── Scenarios ────────────────────────────────────────────────────────────────

const SCENARIOS: Scenario[] = [
  {
    key: 'basic',
    title: 'Class Blueprint → Object',
    description:
      'Pahami gimana class mendefinisikan blueprint dan object adalah instansi dari class tersebut.',
    classCode: [
      '// File: Car.java',
      'public class Car {',
      '    // Attributes (fields)',
      '    String brand;',
      '    String color;',
      '    int year;',
      '',
      '    // Method',
      '    public void honk() {',
      '        System.out.println(brand + " says: Beep!");',
      '    }',
      '',
      '    public String getInfo() {',
      '        return brand + " " + color + " (" + year + ")";',
      '    }',
      '}',
    ],
    mainCode: [
      '// File: Main.java',
      'public class Main {',
      '    public static void main(String[] args) {',
      '        Car myCar = new Car();',
      '        myCar.brand = "Toyota";',
      '        myCar.color = "Red";',
      '        myCar.year  = 2024;',
      '        myCar.honk();',
      '        String info = myCar.getInfo();',
      '        System.out.println(info);',
      '    }',
      '}',
    ],
    blueprint: [
      { kind: 'attribute', name: 'brand', type: 'String' },
      { kind: 'attribute', name: 'color', type: 'String' },
      { kind: 'attribute', name: 'year', type: 'int' },
      { kind: 'method', name: 'honk()', type: 'void' },
      { kind: 'method', name: 'getInfo()', type: 'String' },
    ],
    steps: [
      {
        lineIndex: 1,
        file: 'class',
        description: 'Class Car didefinisikan — ini adalah BLUEPRINT-nya',
        phase: 'normal',
        activeBlueprint: [],
      },
      {
        lineIndex: 3,
        file: 'class',
        description: 'Blueprint deklarasi atribut: brand (String)',
        phase: 'normal',
        activeBlueprint: ['brand'],
      },
      {
        lineIndex: 4,
        file: 'class',
        description: 'Blueprint deklarasi atribut: color (String)',
        phase: 'normal',
        activeBlueprint: ['color'],
      },
      {
        lineIndex: 5,
        file: 'class',
        description: 'Blueprint deklarasi atribut: year (int)',
        phase: 'normal',
        activeBlueprint: ['year'],
      },
      {
        lineIndex: 8,
        file: 'class',
        description: 'Blueprint deklarasi method: honk()',
        phase: 'normal',
        activeBlueprint: ['honk()'],
      },
      {
        lineIndex: 12,
        file: 'class',
        description: 'Blueprint deklarasi method: getInfo()',
        phase: 'normal',
        activeBlueprint: ['getInfo()'],
      },
      {
        lineIndex: 3,
        file: 'main',
        description: 'new Car() — JVM bikin instance object dari blueprint!',
        phase: 'instantiate',
        activeBlueprint: [],
        activeObjects: ['myCar'],
        objectState: { myCar: { brand: 'null', color: 'null', year: '0' } },
      },
      {
        lineIndex: 4,
        file: 'main',
        description: 'myCar.brand = "Toyota" — setting attribute on the object',
        phase: 'normal',
        activeBlueprint: ['brand'],
        activeObjects: ['myCar'],
        objectState: { myCar: { brand: '"Toyota"', color: 'null', year: '0' } },
        highlightObjectField: 'brand',
      },
      {
        lineIndex: 5,
        file: 'main',
        description: 'myCar.color = "Red"',
        phase: 'normal',
        activeBlueprint: ['color'],
        activeObjects: ['myCar'],
        objectState: {
          myCar: { brand: '"Toyota"', color: '"Red"', year: '0' },
        },
        highlightObjectField: 'color',
      },
      {
        lineIndex: 6,
        file: 'main',
        description: 'myCar.year = 2024',
        phase: 'normal',
        activeBlueprint: ['year'],
        activeObjects: ['myCar'],
        objectState: {
          myCar: { brand: '"Toyota"', color: '"Red"', year: '2024' },
        },
        highlightObjectField: 'year',
      },
      {
        lineIndex: 7,
        file: 'main',
        description:
          'myCar.honk() — memanggil method yang sudah didefinisikan di blueprint',
        phase: 'method',
        activeBlueprint: ['honk()'],
        activeObjects: ['myCar'],
        objectState: {
          myCar: { brand: '"Toyota"', color: '"Red"', year: '2024' },
        },
        stateVars: { output: '"Toyota says: Beep!"' },
      },
      {
        lineIndex: 8,
        file: 'main',
        description:
          'myCar.getInfo() — mengembalikan string yang sudah diformat',
        phase: 'method',
        activeBlueprint: ['getInfo()'],
        activeObjects: ['myCar'],
        stateVars: { info: '"Toyota Red (2024)"' },
      },
    ],
  },
  {
    key: 'constructor',
    title: 'Constructor & Multiple Objects',
    description:
      'Pakai constructor untuk inisialisasi object, buat banyak instansi dari satu blueprint.',
    classCode: [
      '// File: Student.java',
      'public class Student {',
      '    String name;',
      '    int    grade;',
      '    double gpa;',
      '',
      '    // Constructor',
      '    public Student(String name, int grade, double gpa) {',
      '        this.name  = name;',
      '        this.grade = grade;',
      '        this.gpa   = gpa;',
      '    }',
      '',
      '    public void printReport() {',
      '        System.out.println(name + " | Grade: " + grade + " | GPA: " + gpa);',
      '    }',
      '}',
    ],
    mainCode: [
      '// File: Main.java',
      'public class Main {',
      '    public static void main(String[] args) {',
      '        Student s1 = new Student("Alice", 12, 3.9);',
      '        Student s2 = new Student("Bob",   11, 3.5);',
      '        Student s3 = new Student("Charlie",10, 3.7);',
      '        s1.printReport();',
      '        s2.printReport();',
      '        s3.printReport();',
      '    }',
      '}',
    ],
    blueprint: [
      { kind: 'attribute', name: 'name', type: 'String' },
      { kind: 'attribute', name: 'grade', type: 'int' },
      { kind: 'attribute', name: 'gpa', type: 'double' },
      {
        kind: 'constructor',
        name: 'Student(name,grade,gpa)',
        type: 'Constructor',
      },
      { kind: 'method', name: 'printReport()', type: 'void' },
    ],
    steps: [
      {
        lineIndex: 1,
        file: 'class',
        description: 'Blueprint class Student didefinisikan',
        phase: 'normal',
        activeBlueprint: [],
      },
      {
        lineIndex: 2,
        file: 'class',
        description: 'Atribut: name (String)',
        phase: 'normal',
        activeBlueprint: ['name'],
      },
      {
        lineIndex: 3,
        file: 'class',
        description: 'Atribut: grade (int)',
        phase: 'normal',
        activeBlueprint: ['grade'],
      },
      {
        lineIndex: 4,
        file: 'class',
        description: 'Atribut: gpa (double)',
        phase: 'normal',
        activeBlueprint: ['gpa'],
      },
      {
        lineIndex: 7,
        file: 'class',
        description:
          'Constructor didefinisikan — langsung inisialisasi 3 field sekaligus',
        phase: 'normal',
        activeBlueprint: ['Student(name,grade,gpa)'],
      },
      {
        lineIndex: 13,
        file: 'class',
        description: 'Method: printReport() didefinisikan',
        phase: 'normal',
        activeBlueprint: ['printReport()'],
      },
      {
        lineIndex: 3,
        file: 'main',
        description:
          'new Student("Alice", 12, 3.9) — constructor called, s1 created',
        phase: 'instantiate',
        activeBlueprint: ['Student(name,grade,gpa)'],
        activeObjects: ['s1'],
        objectState: { s1: { name: '"Alice"', grade: '12', gpa: '3.9' } },
      },
      {
        lineIndex: 4,
        file: 'main',
        description: 'new Student("Bob", 11, 3.5) — second object s2 created',
        phase: 'instantiate',
        activeBlueprint: ['Student(name,grade,gpa)'],
        activeObjects: ['s1', 's2'],
        objectState: {
          s1: { name: '"Alice"', grade: '12', gpa: '3.9' },
          s2: { name: '"Bob"', grade: '11', gpa: '3.5' },
        },
      },
      {
        lineIndex: 5,
        file: 'main',
        description: 'new Student("Charlie", 10, 3.7) — third object s3',
        phase: 'instantiate',
        activeBlueprint: ['Student(name,grade,gpa)'],
        activeObjects: ['s1', 's2', 's3'],
        objectState: {
          s1: { name: '"Alice"', grade: '12', gpa: '3.9' },
          s2: { name: '"Bob"', grade: '11', gpa: '3.5' },
          s3: { name: '"Charlie"', grade: '10', gpa: '3.7' },
        },
      },
      {
        lineIndex: 6,
        file: 'main',
        description: 's1.printReport() — data milik s1 yang dipakai',
        phase: 'method',
        activeBlueprint: ['printReport()'],
        activeObjects: ['s1'],
        stateVars: { output: '"Alice | Grade: 12 | GPA: 3.9"' },
      },
      {
        lineIndex: 7,
        file: 'main',
        description:
          's2.printReport() — data milik s2 (method sama, object beda!)',
        phase: 'method',
        activeBlueprint: ['printReport()'],
        activeObjects: ['s2'],
        stateVars: { output: '"Bob | Grade: 11 | GPA: 3.5"' },
      },
      {
        lineIndex: 8,
        file: 'main',
        description: 's3.printReport() — data milik s3',
        phase: 'method',
        activeBlueprint: ['printReport()'],
        activeObjects: ['s3'],
        stateVars: { output: '"Charlie | Grade: 10 | GPA: 3.7"' },
      },
    ],
  },
  {
    key: 'multifile',
    title: 'Multi-File / Import Module',
    description:
      'Class di file terpisah — import dan pakai ulang seperti modul di proyek besar.',
    classCode: [
      '// File: BankAccount.java  (separate file!)',
      'public class BankAccount {',
      '    private String owner;',
      '    private double balance;',
      '',
      '    public BankAccount(String owner, double initialBalance) {',
      '        this.owner   = owner;',
      '        this.balance = initialBalance;',
      '    }',
      '',
      '    public void deposit(double amount) {',
      '        balance += amount;',
      '        System.out.println(owner + " deposited: " + amount);',
      '    }',
      '',
      '    public void withdraw(double amount) {',
      '        if (amount <= balance) balance -= amount;',
      '        else System.out.println("Insufficient funds!");',
      '    }',
      '',
      '    public double getBalance() { return balance; }',
      '    public String getOwner()   { return owner; }',
      '}',
    ],
    mainCode: [
      '// File: Main.java',
      '// No import needed — same package!',
      'public class Main {',
      '    public static void main(String[] args) {',
      '        BankAccount acc = new BankAccount("Alice", 1000.0);',
      '        acc.deposit(500.0);',
      '        acc.withdraw(200.0);',
      '        System.out.println("Balance: " + acc.getBalance());',
      '    }',
      '}',
    ],
    blueprint: [
      { kind: 'attribute', name: 'owner', type: 'String (private)' },
      { kind: 'attribute', name: 'balance', type: 'double (private)' },
      {
        kind: 'constructor',
        name: 'BankAccount(owner,balance)',
        type: 'Constructor',
      },
      { kind: 'method', name: 'deposit(amount)', type: 'void' },
      { kind: 'method', name: 'withdraw(amount)', type: 'void' },
      { kind: 'method', name: 'getBalance()', type: 'double' },
      { kind: 'method', name: 'getOwner()', type: 'String' },
    ],
    steps: [
      {
        lineIndex: 0,
        file: 'class',
        description:
          'BankAccount.java — file terpisah yang berperan sebagai modul',
        phase: 'import',
      },
      {
        lineIndex: 1,
        file: 'class',
        description: 'Blueprint class: 2 atribut private',
        phase: 'normal',
        activeBlueprint: ['owner', 'balance'],
      },
      {
        lineIndex: 5,
        file: 'class',
        description: 'Constructor inisialisasi owner dan balance',
        phase: 'normal',
        activeBlueprint: ['BankAccount(owner,balance)'],
      },
      {
        lineIndex: 10,
        file: 'class',
        description: 'deposit() — tambahkan ke balance',
        phase: 'normal',
        activeBlueprint: ['deposit(amount)'],
      },
      {
        lineIndex: 15,
        file: 'class',
        description: 'withdraw() — kurangi dengan validasi aman',
        phase: 'normal',
        activeBlueprint: ['withdraw(amount)'],
      },
      {
        lineIndex: 20,
        file: 'class',
        description: 'Method getter expose data private dengan aman',
        phase: 'normal',
        activeBlueprint: ['getBalance()', 'getOwner()'],
      },
      {
        lineIndex: 1,
        file: 'main',
        description:
          'Main.java — pakai BankAccount seperti modul (package sama)',
        phase: 'import',
      },
      {
        lineIndex: 4,
        file: 'main',
        description: 'new BankAccount("Alice", 1000.0) — object created',
        phase: 'instantiate',
        activeBlueprint: ['BankAccount(owner,balance)'],
        activeObjects: ['acc'],
        objectState: { acc: { owner: '"Alice"', balance: '1000.0' } },
      },
      {
        lineIndex: 5,
        file: 'main',
        description: 'acc.deposit(500.0) — balance bertambah',
        phase: 'method',
        activeBlueprint: ['deposit(amount)'],
        activeObjects: ['acc'],
        objectState: { acc: { owner: '"Alice"', balance: '1500.0' } },
        stateVars: { output: '"Alice deposited: 500.0"' },
      },
      {
        lineIndex: 6,
        file: 'main',
        description: 'acc.withdraw(200.0) — balance berkurang',
        phase: 'method',
        activeBlueprint: ['withdraw(amount)'],
        activeObjects: ['acc'],
        objectState: { acc: { owner: '"Alice"', balance: '1300.0' } },
      },
      {
        lineIndex: 7,
        file: 'main',
        description: 'acc.getBalance() — kembalikan field private lewat getter',
        phase: 'method',
        activeBlueprint: ['getBalance()'],
        activeObjects: ['acc'],
        stateVars: { returned: '1300.0' },
      },
    ],
  },
];

// ─── Blueprint Visualization ─────────────────────────────────────────────────

function BlueprintCard({
  blueprint,
  activeNames,
  scenario,
}: {
  blueprint: BlueprintField[];
  activeNames: string[];
  scenario: Scenario;
}) {
  return (
    <div className="overflow-hidden rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/30">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-700 bg-slate-800 px-4 py-2">
        <div className="h-2 w-2 rounded-full bg-sky-400" />
        <span className="text-xs font-bold tracking-wider text-sky-300 uppercase">
          BLUEPRINT CLASS
        </span>
        <span className="ml-1 text-xs text-slate-500">
          {scenario.key === 'basic'
            ? 'Car'
            : scenario.key === 'constructor'
              ? 'Student'
              : 'BankAccount'}
        </span>
      </div>
      {/* Attributes */}
      <div className="flex flex-col gap-1 p-3">
        {blueprint
          .filter((f) => f.kind === 'attribute')
          .map((f) => (
            <div
              key={f.name}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-all duration-300 ${
                activeNames.includes(f.name)
                  ? 'border-sky-500/50 bg-sky-500/15 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                  : 'border-slate-800 bg-slate-800/40'
              }`}
            >
              <span
                className={`text-xs ${activeNames.includes(f.name) ? 'text-amber-400' : 'text-slate-600'}`}
              >
                ▸
              </span>
              <span
                className={`font-mono text-xs ${activeNames.includes(f.name) ? 'text-white' : 'text-slate-400'}`}
              >
                {f.name}
              </span>
              <span
                className={`ml-auto text-xs ${activeNames.includes(f.name) ? 'text-sky-400' : 'text-slate-700'}`}
              >
                {f.type}
              </span>
            </div>
          ))}
        {/* Separator */}
        <div className="my-1 border-t border-slate-800" />
        {/* Constructors */}
        {blueprint
          .filter((f) => f.kind === 'constructor')
          .map((f) => (
            <div
              key={f.name}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-all duration-300 ${
                activeNames.includes(f.name)
                  ? 'border-amber-500/50 bg-amber-500/15 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
                  : 'border-slate-800 bg-slate-800/40'
              }`}
            >
              <span
                className={`text-xs ${activeNames.includes(f.name) ? 'text-amber-400' : 'text-slate-600'}`}
              >
                ⚙
              </span>
              <span
                className={`font-mono text-xs ${activeNames.includes(f.name) ? 'text-amber-300' : 'text-slate-400'}`}
              >
                {f.name}
              </span>
              <span className="ml-auto text-xs text-amber-700">{f.type}</span>
            </div>
          ))}
        {/* Methods */}
        {blueprint
          .filter((f) => f.kind === 'method')
          .map((f) => (
            <div
              key={f.name}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-all duration-300 ${
                activeNames.includes(f.name)
                  ? 'border-violet-500/50 bg-violet-500/15 shadow-[0_0_10px_rgba(167,139,250,0.2)]'
                  : 'border-slate-800 bg-slate-800/40'
              }`}
            >
              <span
                className={`text-xs ${activeNames.includes(f.name) ? 'text-violet-400' : 'text-slate-600'}`}
              >
                ƒ
              </span>
              <span
                className={`font-mono text-xs ${activeNames.includes(f.name) ? 'text-violet-300' : 'text-slate-400'}`}
              >
                {f.name}
              </span>
              <span
                className={`ml-auto text-xs ${activeNames.includes(f.name) ? 'text-violet-500' : 'text-slate-700'}`}
              >
                {f.type}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

// ─── Object Instance Card ────────────────────────────────────────────────────

function ObjectCard({
  name,
  fields,
  isActive,
  highlightField,
}: {
  name: string;
  fields: Record<string, string>;
  isActive: boolean;
  highlightField?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border-2 transition-all duration-300 ${
        isActive
          ? 'border-emerald-500/60 shadow-[0_0_16px_rgba(52,211,153,0.25)]'
          : 'border-slate-700 opacity-60'
      }`}
    >
      <div
        className={`flex items-center gap-2 border-b px-3 py-2 ${isActive ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-slate-700 bg-slate-800'}`}
      >
        <div
          className={`h-2 w-2 rounded-full ${isActive ? 'animate-pulse bg-emerald-400' : 'bg-slate-600'}`}
        />
        <span
          className={`text-xs font-bold ${isActive ? 'text-emerald-300' : 'text-slate-500'}`}
        >
          OBJECT: {name}
        </span>
        <span
          className={`ml-auto text-xs ${isActive ? 'text-emerald-600' : 'text-slate-700'}`}
        >
          0x
          {Math.floor(Math.random() * 0xffff)
            .toString(16)
            .toUpperCase()}
        </span>
      </div>
      <div className="flex flex-col gap-1 bg-slate-900/50 p-2.5">
        {Object.entries(fields).map(([k, v]) => (
          <div
            key={k}
            className={`flex items-center gap-2 rounded-md px-2.5 py-1 transition-all ${
              highlightField === k && isActive
                ? 'border border-amber-500/30 bg-amber-500/15'
                : 'bg-slate-800/30'
            }`}
          >
            <span className="text-xs text-slate-600">{k}:</span>
            <span
              className={`ml-auto font-mono text-xs ${highlightField === k && isActive ? 'text-amber-300' : 'text-emerald-400'}`}
            >
              {v}
            </span>
          </div>
        ))}
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

export default function ClassObjectPage() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(
    SCENARIOS[0],
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [activeFile, setActiveFile] = useState<'class' | 'main'>('class');

  const step = selectedScenario.steps[currentStep];
  const totalSteps = selectedScenario.steps.length;

  const handleSelectScenario = (s: Scenario) => {
    setSelectedScenario(s);
    setCurrentStep(0);
    setActiveFile('class');
  };

  // ── Keyboard navigation ──────────────────────────────────────────────────

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      const next = selectedScenario.steps[currentStep + 1];
      setCurrentStep((s) => s + 1);
      setActiveFile(next.file);
    }
  }, [currentStep, totalSteps]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      const prev = selectedScenario.steps[currentStep - 1];
      setCurrentStep((s) => s - 1);
      setActiveFile(prev.file);
    }
  }, [currentStep]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleNext, handlePrev]);

  const displayCode =
    activeFile === 'class'
      ? selectedScenario.classCode
      : selectedScenario.mainCode;
  const activeLineIdx = step.file === activeFile ? step.lineIndex : -1;

  const phaseColor =
    step.phase === 'instantiate'
      ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
      : step.phase === 'method'
        ? 'text-violet-400 border-violet-500/40 bg-violet-500/10'
        : step.phase === 'import'
          ? 'text-sky-400 border-sky-500/40 bg-sky-500/10'
          : step.phase === 'return'
            ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
            : 'text-slate-400 border-slate-700 bg-slate-800/50';

  const phaseLabel =
    step.phase === 'instantiate'
      ? '⚡ new Object()'
      : step.phase === 'method'
        ? 'ƒ Pemanggilan Method'
        : step.phase === 'import'
          ? '📦 Modul'
          : step.phase === 'return'
            ? '↩ Return'
            : '▶ Berjalan';

  const hasShown = useRef(false);

  useEffect(() => {
    if (hasShown.current) return;

    hasShown.current = true;
    toast.info('Disarankan menggunakan device desktop');
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#0d1117] font-mono text-slate-200">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-slate-800 bg-[#0d1117]/95 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href={'/'}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 text-sm font-bold text-white">
                CO
              </div>
            </Link>
            <div>
              <h1 className="text-base leading-none font-bold text-white">
                Class &amp; Object
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Blueprint → Instance Visualizer
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {SCENARIOS.map((s) => (
              <button
                key={s.key}
                onClick={() => handleSelectScenario(s)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedScenario.key === s.key
                    ? 'border-violet-400 bg-violet-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.5)]'
                    : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-slate-800/60 bg-slate-900/30 px-4 py-2">
          <span className="text-xs text-slate-500">File:</span>
          {(['class', 'main'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFile(f)}
              className={`rounded-md border px-3 py-1 text-xs transition-all ${
                activeFile === f
                  ? 'border-slate-500 bg-slate-700 text-slate-200'
                  : 'border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              {f === 'class'
                ? selectedScenario.key === 'basic'
                  ? 'Car.java'
                  : selectedScenario.key === 'constructor'
                    ? 'Student.java'
                    : 'BankAccount.java'
                : 'Main.java'}
            </button>
          ))}
          <div
            className={`ml-auto rounded-md border px-2.5 py-0.5 text-xs font-semibold ${phaseColor}`}
          >
            {phaseLabel}
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
                {activeFile === 'class'
                  ? selectedScenario.key === 'basic'
                    ? 'Car.java'
                    : selectedScenario.key === 'constructor'
                      ? 'Student.java'
                      : 'BankAccount.java'
                  : 'Main.java'}
              </span>
              {step.file !== activeFile && (
                <Badge
                  variant="outlined"
                  className="border-amber-700 text-xs text-amber-600"
                >
                  sedang di file lain
                </Badge>
              )}
            </div>
          </div>
          {/* State */}
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
                    <span className="text-xs text-amber-300">{v}</span>
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
            {displayCode.map((line, idx) => {
              const isActive = idx === activeLineIdx;
              const isDim = activeLineIdx >= 0 && !isActive;
              return (
                <div
                  key={idx}
                  className={`flex items-start rounded-r-md transition-all duration-200 ${
                    isActive
                      ? 'border-l-2 border-violet-400 bg-violet-500/20'
                      : 'border-l-2 border-transparent'
                  }`}
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
              <span className="text-xs text-slate-500">
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
                onClick={() => {
                  setCurrentStep(0);
                  setActiveFile('class');
                }}
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

        {/* RIGHT: Blueprint + Objects Panel */}
        <div className="flex flex-col overflow-hidden bg-[#161b22]">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="ml-2 text-xs text-slate-400">
                blueprint.view
              </span>
            </div>
          </div>

          <div className="flex min-h-[52px] items-center border-b border-slate-800 bg-slate-900/30 px-4 py-2.5">
            <p className="text-sm leading-snug text-slate-300">
              {step.description}
            </p>
          </div>

          <div className="flex flex-1 flex-col gap-4 overflow-auto px-5 py-4">
            {/* Blueprint */}
            <BlueprintCard
              blueprint={selectedScenario.blueprint}
              activeNames={step.activeBlueprint || []}
              scenario={selectedScenario}
            />

            {/* Arrow */}
            {step.activeObjects && step.activeObjects.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-dashed border-emerald-500/30" />
                <div className="px-2 text-xs text-emerald-500/60">
                  instantiate ▼
                </div>
                <div className="flex-1 border-t border-dashed border-emerald-500/30" />
              </div>
            )}

            {/* Object instances */}
            {step.objectState && (
              <div className="flex flex-col gap-3">
                <p className="text-xs tracking-wider text-slate-500 uppercase">
                  Instance Object
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(step.objectState).map(([name, fields]) => (
                    <ObjectCard
                      key={name}
                      name={name}
                      fields={fields}
                      isActive={step.activeObjects?.includes(name) || false}
                      highlightField={step.highlightObjectField}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Concept explanation */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="mb-2 text-xs tracking-wider text-slate-500 uppercase">
                Konsep Kunci
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    label: 'Class',
                    desc: 'Blueprint / Template',
                    icon: '📋',
                    color: 'text-sky-400',
                  },
                  {
                    label: 'Object',
                    desc: 'Instance di memori',
                    icon: '📦',
                    color: 'text-emerald-400',
                  },
                  {
                    label: 'Attribute',
                    desc: 'Data / State',
                    icon: '🏷',
                    color: 'text-amber-400',
                  },
                  {
                    label: 'Method',
                    desc: 'Perilaku / Aksi',
                    icon: '⚡',
                    color: 'text-violet-400',
                  },
                ].map((c) => (
                  <div
                    key={c.label}
                    className="flex items-start gap-2 rounded-lg bg-slate-800/40 p-2.5"
                  >
                    <span className="text-sm">{c.icon}</span>
                    <div>
                      <p className={`text-xs font-bold ${c.color}`}>
                        {c.label}
                      </p>
                      <p className="text-xs text-slate-600">{c.desc}</p>
                    </div>
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
