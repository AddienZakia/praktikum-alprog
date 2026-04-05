'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type DiagramKey = 'simple' | 'inheritance' | 'fullsystem';

interface UMLField {
  visibility: '+' | '-' | '#' | '~';
  name: string;
  type: string;
  isStatic?: boolean;
}

interface UMLMethod {
  visibility: '+' | '-' | '#' | '~';
  name: string;
  params?: string;
  returnType: string;
  isAbstract?: boolean;
  isStatic?: boolean;
}

interface UMLClass {
  id: string;
  name: string;
  stereotype?: 'interface' | 'abstract' | 'enum';
  x: number;
  y: number;
  w: number;
  fields: UMLField[];
  methods: UMLMethod[];
  accent: string;
}

interface UMLRelation {
  from: string;
  to: string;
  type: 'extends' | 'implements' | 'uses' | 'has' | 'hasMany';
  label?: string;
  fromLabel?: string;
  toLabel?: string;
}

interface CodeStep {
  lineIndex: number;
  file: string;
  description: string;
  highlightClasses: string[];
  highlightRelations: string[];
  stateVars?: Record<string, string>;
  phase: 'normal' | 'class' | 'relation' | 'method' | 'field';
}

interface DiagramScenario {
  key: DiagramKey;
  title: string;
  description: string;
  classes: UMLClass[];
  relations: UMLRelation[];
  files: Record<string, string[]>;
  steps: CodeStep[];
}

// ─── Visibility Labels ────────────────────────────────────────────────────────

const VIS_COLORS: Record<string, string> = {
  '+': '#34d399',
  '-': '#f87171',
  '#': '#fbbf24',
  '~': '#94a3b8',
};

// ─── Diagram Scenarios ────────────────────────────────────────────────────────

const SCENARIOS: DiagramScenario[] = [
  {
    key: 'simple',
    title: 'Class Sederhana',
    description: 'Satu class — field, method, dan visibility modifier',
    classes: [
      {
        id: 'Person',
        name: 'Person',
        x: 160,
        y: 60,
        w: 200,
        accent: '#38bdf8',
        fields: [
          { visibility: '-', name: 'name', type: 'String' },
          { visibility: '-', name: 'age', type: 'int' },
          { visibility: '-', name: 'email', type: 'String' },
        ],
        methods: [
          {
            visibility: '+',
            name: 'Person',
            params: 'name:String, age:int',
            returnType: '',
          },
          { visibility: '+', name: 'getName', returnType: 'String' },
          { visibility: '+', name: 'getAge', returnType: 'int' },
          {
            visibility: '+',
            name: 'setEmail',
            params: 'email:String',
            returnType: 'void',
          },
          { visibility: '+', name: 'greet', returnType: 'String' },
          { visibility: '-', name: 'validate', returnType: 'boolean' },
        ],
      },
    ],
    relations: [],
    files: {
      'Person.java': [
        'public class Person {',
        '    private String name;  // - (private)',
        '    private int    age;',
        '    private String email;',
        '',
        '    // + (public constructor)',
        '    public Person(String name, int age) {',
        '        this.name = name;',
        '        this.age  = age;',
        '    }',
        '',
        '    public String getName() { return name; }   // + getter',
        '    public int    getAge()  { return age; }',
        '',
        '    public void setEmail(String email) {       // + setter',
        '        if (validate()) this.email = email;',
        '    }',
        '',
        '    public String greet() {                    // + public method',
        '        return "Hi, I\'m " + name + "!";',
        '    }',
        '',
        '    private boolean validate() { return age >= 0; } // - private',
        '}',
      ],
    },
    steps: [
      {
        lineIndex: 0,
        file: 'Person.java',
        description: 'Class Person — sesuai dengan kotak class di UML',
        phase: 'class',
        highlightClasses: ['Person'],
        highlightRelations: [],
      },
      {
        lineIndex: 1,
        file: 'Person.java',
        description:
          "private name → ditampilkan sebagai '- name: String' di UML",
        phase: 'field',
        highlightClasses: ['Person'],
        highlightRelations: [],
        stateVars: { UML: '- name: String', visibility: 'private' },
      },
      {
        lineIndex: 2,
        file: 'Person.java',
        description: "private age → '- age: int'",
        phase: 'field',
        highlightClasses: ['Person'],
        highlightRelations: [],
        stateVars: { UML: '- age: int' },
      },
      {
        lineIndex: 3,
        file: 'Person.java',
        description: "private email → '- email: String'",
        phase: 'field',
        highlightClasses: ['Person'],
        highlightRelations: [],
        stateVars: { UML: '- email: String' },
      },
      {
        lineIndex: 6,
        file: 'Person.java',
        description: "constructor public → '+ Person(name,age)' di UML",
        phase: 'method',
        highlightClasses: ['Person'],
        highlightRelations: [],
        stateVars: { UML: '+ Person(name:String,age:int)' },
      },
      {
        lineIndex: 11,
        file: 'Person.java',
        description: "public getName() → '+ getName(): String'",
        phase: 'method',
        highlightClasses: ['Person'],
        highlightRelations: [],
        stateVars: { UML: '+ getName(): String' },
      },
      {
        lineIndex: 14,
        file: 'Person.java',
        description: "public setEmail() → '+ setEmail(email): void'",
        phase: 'method',
        highlightClasses: ['Person'],
        highlightRelations: [],
        stateVars: { UML: '+ setEmail(email:String): void' },
      },
      {
        lineIndex: 18,
        file: 'Person.java',
        description: "public greet() → '+ greet(): String'",
        phase: 'method',
        highlightClasses: ['Person'],
        highlightRelations: [],
        stateVars: { UML: '+ greet(): String' },
      },
      {
        lineIndex: 22,
        file: 'Person.java',
        description:
          "private validate() → '- validate(): boolean' (hanya untuk internal)",
        phase: 'method',
        highlightClasses: ['Person'],
        highlightRelations: [],
        stateVars: { UML: '- validate(): boolean', visibility: 'private' },
      },
    ],
  },
  {
    key: 'inheritance',
    title: 'Inheritance + Interface',
    description: 'extends (inheritance) dan implements (interface) dalam UML',
    classes: [
      {
        id: 'Drawable',
        name: 'Drawable',
        stereotype: 'interface',
        x: 160,
        y: 20,
        w: 190,
        accent: '#a78bfa',
        fields: [],
        methods: [
          {
            visibility: '+',
            name: 'draw',
            returnType: 'void',
            isAbstract: true,
          },
          {
            visibility: '+',
            name: 'resize',
            params: 'factor:double',
            returnType: 'void',
            isAbstract: true,
          },
        ],
      },
      {
        id: 'Shape',
        name: 'Shape',
        stereotype: 'abstract',
        x: 160,
        y: 165,
        w: 190,
        accent: '#fbbf24',
        fields: [
          { visibility: '#', name: 'color', type: 'String' },
          { visibility: '#', name: 'filled', type: 'boolean' },
        ],
        methods: [
          {
            visibility: '+',
            name: 'Shape',
            params: 'color:String',
            returnType: '',
          },
          {
            visibility: '+',
            name: 'area',
            returnType: 'double',
            isAbstract: true,
          },
          {
            visibility: '+',
            name: 'perimeter',
            returnType: 'double',
            isAbstract: true,
          },
          { visibility: '+', name: 'toString', returnType: 'String' },
        ],
      },
      {
        id: 'Circle',
        name: 'Circle',
        x: 40,
        y: 360,
        w: 170,
        accent: '#34d399',
        fields: [{ visibility: '-', name: 'radius', type: 'double' }],
        methods: [
          {
            visibility: '+',
            name: 'Circle',
            params: 'color:String,radius:double',
            returnType: '',
          },
          { visibility: '+', name: 'area', returnType: 'double' },
          { visibility: '+', name: 'perimeter', returnType: 'double' },
          { visibility: '+', name: 'draw', returnType: 'void' },
          {
            visibility: '+',
            name: 'resize',
            params: 'factor:double',
            returnType: 'void',
          },
        ],
      },
      {
        id: 'Rectangle',
        name: 'Rectangle',
        x: 260,
        y: 360,
        w: 175,
        accent: '#fb923c',
        fields: [
          { visibility: '-', name: 'width', type: 'double' },
          { visibility: '-', name: 'height', type: 'double' },
        ],
        methods: [
          {
            visibility: '+',
            name: 'Rectangle',
            params: 'color:String,w:double,h:double',
            returnType: '',
          },
          { visibility: '+', name: 'area', returnType: 'double' },
          { visibility: '+', name: 'perimeter', returnType: 'double' },
          { visibility: '+', name: 'draw', returnType: 'void' },
          {
            visibility: '+',
            name: 'resize',
            params: 'factor:double',
            returnType: 'void',
          },
        ],
      },
    ],
    relations: [
      {
        from: 'Shape',
        to: 'Drawable',
        type: 'implements',
        label: 'implements',
      },
      { from: 'Circle', to: 'Shape', type: 'extends', label: 'extends' },
      { from: 'Rectangle', to: 'Shape', type: 'extends', label: 'extends' },
    ],
    files: {
      'Drawable.java': [
        'public interface Drawable {',
        '    void draw();',
        '    void resize(double factor);',
        '}',
      ],
      'Shape.java': [
        'public abstract class Shape implements Drawable {',
        '    protected String  color;',
        '    protected boolean filled;',
        '',
        '    public Shape(String color) {',
        '        this.color = color;',
        '    }',
        '',
        '    public abstract double area();',
        '    public abstract double perimeter();',
        '',
        '    @Override',
        '    public String toString() {',
        '        return "Shape[" + color + "]";',
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
        '    @Override public double area()      { return Math.PI * radius * radius; }',
        '    @Override public double perimeter() { return 2 * Math.PI * radius; }',
        '    @Override public void draw()   { System.out.println("Drawing ○"); }',
        '    @Override public void resize(double f) { radius *= f; }',
        '}',
      ],
      'Main.java': [
        'public class Main {',
        '    public static void main(String[] args) {',
        '        Shape[] shapes = { new Circle("red",5), new Rectangle("blue",4,3) };',
        '        for (Shape s : shapes) {',
        '            s.draw();',
        '            System.out.println("Area: " + s.area());',
        '        }',
        '    }',
        '}',
      ],
    },
    steps: [
      {
        lineIndex: 0,
        file: 'Drawable.java',
        description:
          'Interface Drawable — ditampilkan dengan stereotype <<interface>> di UML',
        phase: 'class',
        highlightClasses: ['Drawable'],
        highlightRelations: [],
      },
      {
        lineIndex: 1,
        file: 'Drawable.java',
        description: 'draw() — method abstract, ditampilkan miring di UML',
        phase: 'method',
        highlightClasses: ['Drawable'],
        highlightRelations: [],
        stateVars: { UML: '+ draw(): void {abstract}' },
      },
      {
        lineIndex: 0,
        file: 'Shape.java',
        description:
          'Shape implements Drawable — panah putus-putus di UML (implements)',
        phase: 'relation',
        highlightClasses: ['Shape', 'Drawable'],
        highlightRelations: ['Shape→Drawable'],
      },
      {
        lineIndex: 1,
        file: 'Shape.java',
        description:
          'field protected — ditampilkan sebagai # di UML (bisa diakses subclass)',
        phase: 'field',
        highlightClasses: ['Shape'],
        highlightRelations: [],
        stateVars: { UML: '# color: String', '# filled': 'boolean' },
      },
      {
        lineIndex: 8,
        file: 'Shape.java',
        description:
          'abstract area() — harus diimplementasikan oleh Circle dan Rectangle',
        phase: 'method',
        highlightClasses: ['Shape'],
        highlightRelations: [],
        stateVars: { UML: '+ area(): double {abstract}' },
      },
      {
        lineIndex: 0,
        file: 'Circle.java',
        description:
          'Circle extends Shape — panah solid di UML (inheritance/extends)',
        phase: 'relation',
        highlightClasses: ['Circle', 'Shape'],
        highlightRelations: ['Circle→Shape'],
      },
      {
        lineIndex: 1,
        file: 'Circle.java',
        description: 'private radius — field milik Circle sendiri',
        phase: 'field',
        highlightClasses: ['Circle'],
        highlightRelations: [],
        stateVars: { UML: '- radius: double' },
      },
      {
        lineIndex: 8,
        file: 'Circle.java',
        description: 'Override semua method abstract dari Shape + Drawable',
        phase: 'method',
        highlightClasses: ['Circle'],
        highlightRelations: ['Circle→Shape', 'Shape→Drawable'],
        stateVars: { implements: 'area, perimeter, draw, resize' },
      },
      {
        lineIndex: 2,
        file: 'Main.java',
        description:
          'Array polimorfik — menampung Circle dan Rectangle (keduanya IS-A Shape)',
        phase: 'class',
        highlightClasses: ['Circle', 'Rectangle', 'Shape'],
        highlightRelations: ['Circle→Shape', 'Rectangle→Shape'],
      },
      {
        lineIndex: 4,
        file: 'Main.java',
        description: 's.draw() — pemanggilan polimorfik pada referensi Shape',
        phase: 'method',
        highlightClasses: ['Circle', 'Rectangle'],
        highlightRelations: [
          'Circle→Shape',
          'Rectangle→Shape',
          'Shape→Drawable',
        ],
      },
    ],
  },
  {
    key: 'fullsystem',
    title: 'Sistem Lengkap — Perpustakaan',
    description: 'Asosiasi, agregasi, komposisi, dan dependensi dalam UML',
    classes: [
      {
        id: 'Library',
        name: 'Library',
        x: 150,
        y: 20,
        w: 185,
        accent: '#38bdf8',
        fields: [
          { visibility: '-', name: 'name', type: 'String' },
          { visibility: '-', name: 'books', type: 'List<Book>' },
        ],
        methods: [
          {
            visibility: '+',
            name: 'addBook',
            params: 'b:Book',
            returnType: 'void',
          },
          {
            visibility: '+',
            name: 'removeBook',
            params: 'isbn:String',
            returnType: 'boolean',
          },
          {
            visibility: '+',
            name: 'findBook',
            params: 'title:String',
            returnType: 'Book',
          },
          { visibility: '+', name: 'getMembers', returnType: 'List<Member>' },
        ],
      },
      {
        id: 'Book',
        name: 'Book',
        x: 360,
        y: 20,
        w: 175,
        accent: '#34d399',
        fields: [
          { visibility: '-', name: 'isbn', type: 'String' },
          { visibility: '-', name: 'title', type: 'String' },
          { visibility: '-', name: 'author', type: 'Author' },
          { visibility: '-', name: 'copies', type: 'int' },
        ],
        methods: [
          { visibility: '+', name: 'isAvailable', returnType: 'boolean' },
          { visibility: '+', name: 'checkout', returnType: 'void' },
          { visibility: '+', name: 'returnBook', returnType: 'void' },
        ],
      },
      {
        id: 'Author',
        name: 'Author',
        x: 360,
        y: 230,
        w: 170,
        accent: '#a78bfa',
        fields: [
          { visibility: '-', name: 'name', type: 'String' },
          { visibility: '-', name: 'email', type: 'String' },
        ],
        methods: [{ visibility: '+', name: 'getName', returnType: 'String' }],
      },
      {
        id: 'Member',
        name: 'Member',
        x: 20,
        y: 230,
        w: 175,
        accent: '#fb923c',
        fields: [
          { visibility: '-', name: 'memberId', type: 'String' },
          { visibility: '-', name: 'name', type: 'String' },
          { visibility: '-', name: 'borrowed', type: 'List<Book>' },
        ],
        methods: [
          {
            visibility: '+',
            name: 'borrowBook',
            params: 'b:Book',
            returnType: 'void',
          },
          {
            visibility: '+',
            name: 'returnBook',
            params: 'b:Book',
            returnType: 'void',
          },
          { visibility: '+', name: 'getHistory', returnType: 'List<Book>' },
        ],
      },
      {
        id: 'Loan',
        name: 'Loan',
        x: 150,
        y: 230,
        w: 170,
        accent: '#f87171',
        fields: [
          { visibility: '-', name: 'book', type: 'Book' },
          { visibility: '-', name: 'member', type: 'Member' },
          { visibility: '-', name: 'loanDate', type: 'Date' },
          { visibility: '-', name: 'dueDate', type: 'Date' },
        ],
        methods: [
          { visibility: '+', name: 'isOverdue', returnType: 'boolean' },
          { visibility: '+', name: 'calcFine', returnType: 'double' },
        ],
      },
    ],
    relations: [
      {
        from: 'Library',
        to: 'Book',
        type: 'hasMany',
        label: '1..*',
        fromLabel: '1',
      },
      {
        from: 'Library',
        to: 'Member',
        type: 'hasMany',
        label: '0..*',
        fromLabel: '1',
      },
      {
        from: 'Book',
        to: 'Author',
        type: 'has',
        label: '1',
        fromLabel: '1..*',
      },
      { from: 'Loan', to: 'Book', type: 'uses', label: '1' },
      { from: 'Loan', to: 'Member', type: 'uses', label: '1' },
    ],
    files: {
      'Library.java': [
        'public class Library {',
        '    private String name;',
        '    private List<Book>   books   = new ArrayList<>();',
        '    private List<Member> members = new ArrayList<>();',
        '',
        '    public void addBook(Book b)    { books.add(b); }',
        '    public boolean removeBook(String isbn) {',
        '        return books.removeIf(b -> b.getIsbn().equals(isbn));',
        '    }',
        '    public Book findBook(String title) {',
        '        return books.stream()',
        '                    .filter(b -> b.getTitle().equals(title))',
        '                    .findFirst().orElse(null);',
        '    }',
        '    public List<Member> getMembers() { return members; }',
        '}',
      ],
      'Book.java': [
        'public class Book {',
        '    private String isbn;',
        '    private String title;',
        '    private Author author; // HAS-A Author',
        '    private int copies;',
        '',
        '    public boolean isAvailable() { return copies > 0; }',
        '    public void checkout()  { if (copies>0) copies--; }',
        '    public void returnBook(){ copies++; }',
        '    // getters...',
        '}',
      ],
      'Loan.java': [
        'public class Loan {',
        '    private Book   book;   // association',
        '    private Member member; // association',
        '    private Date   loanDate;',
        '    private Date   dueDate;',
        '',
        '    public boolean isOverdue() {',
        '        return new Date().after(dueDate);',
        '    }',
        '    public double calcFine() {',
        '        long days = (new Date().getTime() - dueDate.getTime()) / 86400000;',
        '        return days > 0 ? days * 0.5 : 0;',
        '    }',
        '}',
      ],
    },
    steps: [
      {
        lineIndex: 0,
        file: 'Library.java',
        description:
          'Library — class utama yang MENGAGREGASI Books dan Members',
        phase: 'class',
        highlightClasses: ['Library'],
        highlightRelations: [],
      },
      {
        lineIndex: 2,
        file: 'Library.java',
        description:
          'List<Book> — Library PUNYA BANYAK Books (agregasi 1..* di UML)',
        phase: 'relation',
        highlightClasses: ['Library', 'Book'],
        highlightRelations: ['Library→Book'],
        stateVars: { UML: '◆— 1..*' },
      },
      {
        lineIndex: 3,
        file: 'Library.java',
        description: 'List<Member> — Library PUNYA BANYAK Members (agregasi)',
        phase: 'relation',
        highlightClasses: ['Library', 'Member'],
        highlightRelations: ['Library→Member'],
        stateVars: { UML: '◆— 0..*' },
      },
      {
        lineIndex: 0,
        file: 'Book.java',
        description: 'Class Book — menyimpan isbn, title, copies',
        phase: 'class',
        highlightClasses: ['Book'],
        highlightRelations: [],
      },
      {
        lineIndex: 3,
        file: 'Book.java',
        description: 'private Author author — Book HAS-A Author (asosiasi 1→1)',
        phase: 'relation',
        highlightClasses: ['Book', 'Author'],
        highlightRelations: ['Book→Author'],
        stateVars: { UML: '— 1 Author' },
      },
      {
        lineIndex: 6,
        file: 'Book.java',
        description: 'isAvailable() cek copies > 0',
        phase: 'method',
        highlightClasses: ['Book'],
        highlightRelations: [],
        stateVars: { logic: 'copies > 0' },
      },
      {
        lineIndex: 0,
        file: 'Loan.java',
        description: 'Loan — menghubungkan Book DAN Member (association class)',
        phase: 'class',
        highlightClasses: ['Loan'],
        highlightRelations: [],
      },
      {
        lineIndex: 1,
        file: 'Loan.java',
        description: 'Loan berasosiasi ke Book — UML: Loan ——→ Book',
        phase: 'relation',
        highlightClasses: ['Loan', 'Book'],
        highlightRelations: ['Loan→Book'],
        stateVars: { UML: 'Loan ——→ Book (uses)' },
      },
      {
        lineIndex: 2,
        file: 'Loan.java',
        description: 'Loan berasosiasi ke Member',
        phase: 'relation',
        highlightClasses: ['Loan', 'Member'],
        highlightRelations: ['Loan→Member'],
        stateVars: { UML: 'Loan ——→ Member (uses)' },
      },
      {
        lineIndex: 6,
        file: 'Loan.java',
        description: 'isOverdue() — pakai Date untuk cek status pinjaman',
        phase: 'method',
        highlightClasses: ['Loan'],
        highlightRelations: [],
      },
      {
        lineIndex: 9,
        file: 'Loan.java',
        description: 'calcFine() — aturan bisnis di class Loan',
        phase: 'method',
        highlightClasses: ['Loan'],
        highlightRelations: [],
        stateVars: { fine: 'days × 0.5' },
      },
    ],
  },
];

// ─── UML Diagram SVG ─────────────────────────────────────────────────────────

function UMLDiagram({
  scenario,
  activeClasses,
  activeRelations,
  onClickClass,
}: {
  scenario: DiagramScenario;
  activeClasses: string[];
  activeRelations: string[];
  onClickClass: (id: string) => void;
}) {
  const VIS_SYMBOL: Record<string, string> = {
    '+': '+',
    '-': '−',
    '#': '#',
    '~': '~',
  };

  // Compute SVG dimensions based on classes
  const maxX = Math.max(...scenario.classes.map((c) => c.x + c.w + 20));
  const maxY = Math.max(
    ...scenario.classes.map((c) => {
      const h = 36 + (c.fields.length + c.methods.length) * 18 + 20;
      return c.y + h + 20;
    }),
  );

  const classHeight = (cls: UMLClass) =>
    36 +
    (cls.fields.length > 0 ? cls.fields.length * 18 + 8 : 0) +
    (cls.methods.length > 0 ? cls.methods.length * 18 + 8 : 0) +
    12;

  return (
    <div className="w-full overflow-auto rounded-xl border border-slate-800 bg-[#0d1117]">
      <svg
        viewBox={`0 0 ${maxX} ${maxY}`}
        width={maxX}
        height={maxY}
        className="min-w-full"
      >
        {/* Relations */}
        {scenario.relations.map((rel, i) => {
          const fromCls = scenario.classes.find((c) => c.id === rel.from);
          const toCls = scenario.classes.find((c) => c.id === rel.to);
          if (!fromCls || !toCls) return null;
          const relKey = `${rel.from}→${rel.to}`;
          const isActive = activeRelations.includes(relKey);

          const fromCx = fromCls.x + fromCls.w / 2;
          const fromCy = fromCls.y + classHeight(fromCls) / 2;
          const toCx = toCls.x + toCls.w / 2;
          const toCy = toCls.y;

          const stroke = isActive ? '#a78bfa' : '#334155';
          const dash =
            rel.type === 'implements'
              ? '6,4'
              : rel.type === 'uses'
                ? '4,3'
                : undefined;

          return (
            <g key={i}>
              <defs>
                <marker
                  id={`arrow-${i}`}
                  markerWidth="10"
                  markerHeight="7"
                  refX="10"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill={
                      rel.type === 'extends' || rel.type === 'implements'
                        ? 'none'
                        : stroke
                    }
                    stroke={stroke}
                    strokeWidth="1"
                  />
                </marker>
              </defs>
              <line
                x1={fromCx}
                y1={fromCy}
                x2={toCx}
                y2={toCy}
                stroke={stroke}
                strokeWidth={isActive ? 2 : 1}
                strokeDasharray={dash}
                markerEnd={`url(#arrow-${i})`}
              />
              {rel.label && (
                <text
                  x={(fromCx + toCx) / 2 + 6}
                  y={(fromCy + toCy) / 2}
                  fill={isActive ? '#a78bfa' : '#475569'}
                  fontSize="10"
                  textAnchor="start"
                >
                  {rel.label}
                </text>
              )}
              <text
                x={fromCx + 6}
                y={fromCy - 4}
                fill={isActive ? '#94a3b8' : '#334155'}
                fontSize="9"
              >
                {rel.fromLabel}
              </text>
            </g>
          );
        })}

        {/* Classes */}
        {scenario.classes.map((cls) => {
          const isActive = activeClasses.includes(cls.id);
          const h = classHeight(cls);
          const sepY1 = cls.y + 36;
          const sepY2 =
            cls.fields.length > 0
              ? cls.y + 36 + cls.fields.length * 18 + 8
              : sepY1;

          return (
            <g
              key={cls.id}
              onClick={() => onClickClass(cls.id)}
              className="cursor-pointer"
            >
              {/* Drop shadow */}
              {isActive && (
                <rect
                  x={cls.x + 2}
                  y={cls.y + 2}
                  width={cls.w}
                  height={h}
                  rx="6"
                  fill={cls.accent}
                  opacity="0.12"
                />
              )}
              {/* Box */}
              <rect
                x={cls.x}
                y={cls.y}
                width={cls.w}
                height={h}
                rx="6"
                fill="#161b22"
                stroke={isActive ? cls.accent : '#1e293b'}
                strokeWidth={isActive ? 2 : 1}
              />

              {/* Header */}
              <rect
                x={cls.x}
                y={cls.y}
                width={cls.w}
                height={36}
                rx="6"
                fill={isActive ? `${cls.accent}22` : '#1a2030'}
              />
              <rect
                x={cls.x}
                y={cls.y + 16}
                width={cls.w}
                height={20}
                fill={isActive ? `${cls.accent}22` : '#1a2030'}
              />

              {/* Stereotype */}
              {cls.stereotype && (
                <text
                  x={cls.x + cls.w / 2}
                  y={cls.y + 14}
                  textAnchor="middle"
                  fill={isActive ? cls.accent : '#475569'}
                  fontSize="10"
                >
                  «{cls.stereotype}»
                </text>
              )}
              {/* Class name */}
              <text
                x={cls.x + cls.w / 2}
                y={cls.stereotype ? cls.y + 28 : cls.y + 22}
                textAnchor="middle"
                fill={isActive ? cls.accent : '#64748b'}
                fontSize="12"
                fontWeight="bold"
                fontStyle={cls.stereotype === 'abstract' ? 'italic' : 'normal'}
              >
                {cls.name}
              </text>

              {/* Fields separator */}
              <line
                x1={cls.x}
                y1={sepY1}
                x2={cls.x + cls.w}
                y2={sepY1}
                stroke={isActive ? `${cls.accent}40` : '#1e293b'}
                strokeWidth="1"
              />

              {/* Fields */}
              {cls.fields.map((f, fi) => (
                <g key={fi}>
                  <text
                    x={cls.x + 10}
                    y={cls.y + 36 + 8 + fi * 18 + 12}
                    fill={isActive ? VIS_COLORS[f.visibility] : '#334155'}
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {VIS_SYMBOL[f.visibility]} {f.name}: {f.type}
                  </text>
                </g>
              ))}

              {/* Methods separator */}
              {cls.fields.length > 0 && (
                <line
                  x1={cls.x}
                  y1={sepY2}
                  x2={cls.x + cls.w}
                  y2={sepY2}
                  stroke={isActive ? `${cls.accent}40` : '#1e293b'}
                  strokeWidth="1"
                />
              )}

              {/* Methods */}
              {cls.methods.map((m, mi) => (
                <text
                  key={mi}
                  x={cls.x + 10}
                  y={sepY2 + 8 + mi * 18 + 12}
                  fill={
                    isActive
                      ? m.visibility === '-'
                        ? '#f87171'
                        : '#a78bfa'
                      : '#334155'
                  }
                  fontSize="10"
                  fontFamily="monospace"
                  fontStyle={m.isAbstract ? 'italic' : 'normal'}
                >
                  {VIS_SYMBOL[m.visibility]} {m.name}
                  {m.params ? `(${m.params})` : '()'}
                  {m.returnType ? `: ${m.returnType}` : ''}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
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

export default function UMLPage() {
  const [selectedScenario, setSelectedScenario] = useState<DiagramScenario>(
    SCENARIOS[0],
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [activeFile, setActiveFile] = useState<string>(
    Object.keys(SCENARIOS[0].files)[0],
  );

  const step = selectedScenario.steps[currentStep];
  const totalSteps = selectedScenario.steps.length;
  const displayCode = selectedScenario.files[activeFile] || [];
  const activeLineIdx = step.file === activeFile ? step.lineIndex : -1;
  const fileNames = Object.keys(selectedScenario.files);

  const handleSelectScenario = (s: DiagramScenario) => {
    setSelectedScenario(s);
    setCurrentStep(0);
    setActiveFile(Object.keys(s.files)[0]);
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

  const handleClickClass = (id: string) => {
    // Find if any step has this class highlighted
    const relevantStep = selectedScenario.steps.findIndex((s) =>
      s.highlightClasses.includes(id),
    );
    if (relevantStep >= 0) {
      setCurrentStep(relevantStep);
      setActiveFile(selectedScenario.steps[relevantStep].file);
    }
  };

  const phaseColor =
    step.phase === 'class'
      ? 'text-sky-400 border-sky-500/40 bg-sky-500/10'
      : step.phase === 'relation'
        ? 'text-violet-400 border-violet-500/40 bg-violet-500/10'
        : step.phase === 'method'
          ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
          : step.phase === 'field'
            ? 'text-rose-400 border-rose-500/40 bg-rose-500/10'
            : 'text-slate-400 border-slate-700 bg-slate-800/50';

  const phaseLabel =
    step.phase === 'class'
      ? '□ Class'
      : step.phase === 'relation'
        ? '↔ Relasi'
        : step.phase === 'method'
          ? 'ƒ Method'
          : step.phase === 'field'
            ? '• Field'
            : '▶ Berjalan';

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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-violet-500 text-sm font-bold text-white">
                UML
              </div>
            </Link>
            <div>
              <h1 className="text-base leading-none font-bold text-white">
                UML Class Diagram
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Klik elemen diagram untuk langsung ke kodenya
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
        {/* File selector sub-bar */}
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
              <span className="ml-2 text-xs text-slate-400">{activeFile}</span>
              {step.file !== activeFile && (
                <Badge
                  variant="outlined"
                  className="border-amber-700 text-xs text-amber-600"
                >
                  aktif: {step.file}
                </Badge>
              )}
            </div>
          </div>

          {/* State */}
          <div className="flex min-h-[52px] items-center border-b border-slate-800 bg-slate-900/20 px-4 py-2.5">
            {step.stateVars && Object.keys(step.stateVars).length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs tracking-wider text-slate-300 uppercase">
                  UML:
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
                  setActiveFile(fileNames[0]);
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

        {/* RIGHT: UML Diagram Panel */}
        <div className="flex flex-col overflow-hidden bg-[#161b22]">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="ml-2 text-xs text-slate-400">uml.diagram</span>
              <span className="ml-2 text-xs text-slate-600">
                ← klik class untuk loncat ke kode
              </span>
            </div>
          </div>

          <div className="flex min-h-[52px] items-center border-b border-slate-800 bg-slate-900/30 px-4 py-2.5">
            <p className="text-sm leading-snug text-slate-300">
              {step.description}
            </p>
          </div>

          <div className="flex flex-1 flex-col gap-4 overflow-auto px-4 py-4">
            {/* UML Diagram */}
            <UMLDiagram
              scenario={selectedScenario}
              activeClasses={step.highlightClasses}
              activeRelations={step.highlightRelations}
              onClickClass={handleClickClass}
            />

            {/* UML Legend */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="mb-3 text-xs tracking-wider text-slate-500 uppercase">
                Legenda Notasi UML
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { sym: '+ ', label: 'public', color: '#34d399' },
                  { sym: '− ', label: 'private', color: '#f87171' },
                  { sym: '# ', label: 'protected', color: '#fbbf24' },
                  { sym: '~ ', label: 'package', color: '#94a3b8' },
                  { sym: '——▷', label: 'extends (solid)', color: '#38bdf8' },
                  {
                    sym: '- -▷',
                    label: 'implements (putus-putus)',
                    color: '#a78bfa',
                  },
                  { sym: '——→', label: 'asosiasi/uses', color: '#94a3b8' },
                  { sym: '◆——', label: 'agregasi/hasMany', color: '#fb923c' },
                  { sym: '1..*', label: 'multiplisitas', color: '#64748b' },
                  {
                    sym: '«if»',
                    label: 'stereotype interface',
                    color: '#a78bfa',
                  },
                ].map((item) => (
                  <div key={item.sym} className="flex items-center gap-2">
                    <code
                      className="w-12 shrink-0 font-mono text-xs"
                      style={{ color: item.color }}
                    >
                      {item.sym}
                    </code>
                    <span className="text-xs text-slate-500">{item.label}</span>
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
