import Typography from '@/components/Typography';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Interactive Programming Visualizer',
  description:
    'Learn programming concepts interactively with Java. Explore Big O, Exception Handling, OOP, UML, Sorting, and Searching algorithms through visual simulations.',

  openGraph: {
    title: 'Interactive Programming Visualizer',
    description:
      'Interactive learning platform for Java programming concepts with visual simulations.',
    url: 'https://your-domain.com',
    siteName: 'Programming Visualizer',
    images: [
      {
        url: '/og-home.png',
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
};

const CONTENT_Visual = [
  {
    icon: 'BON',
    title: 'Big-O Notation',
    description: 'Visualisasi Kompleksitas Interaktif',
    colors: 'bg-gradient-to-br from-emerald-500 to-sky-500',
    link: '/big-o',
  },
  {
    icon: 'AV',
    title: 'Algorithm Visualizer',
    description: 'Sorting and Searching Algorithm',
    colors: 'bg-linear-to-br from-violet-500 to-sky-500',
    link: '/algorithm',
  },
  {
    icon: 'EH',
    title: 'Error Handling',
    description: 'Tipe Error Java — Visualisasi Interaktif',
    colors: 'bg-linear-to-br from-rose-500 to-orange-500',
    link: '/error-handling',
  },
  {
    icon: 'CO',
    title: 'Class dan Object',
    description: 'Visualisasi Blueprint → Instance',
    colors: 'bg-gradient-to-br from-emerald-500 to-sky-500',
    link: '/class-object',
  },
  {
    icon: 'OOP',
    title: 'Object Oriented Programming',
    description: 'Inheritance · Encapsulation · Polimorfism · Abstract',
    colors: 'bg-gradient-to-br from-violet-500 to-fuchsia-500',
    link: '/object-oriented-programming',
  },
  {
    icon: 'UML',
    title: 'UML Class Diagram',
    description: 'Click diagram elements to jump to code',
    colors: 'bg-gradient-to-br from-amber-500 to-violet-500',
    link: '/uml-diagram',
  },
];

export default function page() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-[#121926]">
      <div className="flex flex-col items-center justify-center">
        <Typography variant="d" weight="bold" className="text-white">
          Algoritma dan Pemrograman 2
        </Typography>

        <Typography variant="hm" className="text-[#91a1b8]">
          Implmentasi Visual Interaktif
        </Typography>
      </div>

      <div className="flex w-[90%] flex-wrap justify-center gap-4">
        {CONTENT_Visual.map((x, i) => {
          return (
            <Link key={i} href={x.link} className="block">
              <div
                className={cn(
                  'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-500 hover:text-slate-200',
                  'flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-semibold transition-all',
                  'space-x-4',
                )}
              >
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-lg text-base font-bold text-white',
                    x.colors,
                  )}
                >
                  {x.icon}
                </div>

                <div>
                  <Typography
                    variant="xl"
                    className="text-base leading-none font-bold text-white"
                  >
                    {x.title}
                  </Typography>

                  <Typography variant="l" className="text-xs text-slate-500">
                    {x.description}
                  </Typography>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
