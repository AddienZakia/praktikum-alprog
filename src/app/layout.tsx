import { NunitoSans } from '@/lib/font';
import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

type Props = {
  children: React.ReactNode;
  params: { slug?: string };
};

const metadataMap: Record<string, { title: string; description: string }> = {
  '': {
    title: 'Interactive Programming Visualizer',
    description:
      'Learn programming concepts interactively with Java. Explore Big O, Exception Handling, OOP, UML, and Algorithms.',
  },
  'big-o': {
    title: 'Big O Notation Visualizer',
    description:
      'Understand time complexity with interactive Big O simulations using Java.',
  },
  'exception-handling': {
    title: 'Java Exception Handling Visualizer',
    description:
      'Learn Java exception handling with interactive simulations and real-world cases.',
  },
  'class-object': {
    title: 'Class and Object Visualizer',
    description:
      'Explore Java class structure, objects, and blueprint visualization interactively.',
  },
  oop: {
    title: 'OOP Concepts Visualizer',
    description:
      'Learn inheritance, encapsulation, polymorphism, and abstraction interactively.',
  },
  uml: {
    title: 'UML Class Diagram Visualizer',
    description:
      'Understand UML diagrams and their relationship with Java class implementations.',
  },
  algorithms: {
    title: 'Sorting & Searching Algorithm Visualizer',
    description:
      'Visualize sorting and searching algorithms like Bubble Sort, Quick Sort, Linear Search, and Binary Search.',
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params?.slug ?? '';
  const data = metadataMap[slug] || metadataMap[''];

  return {
    title: data.title,
    description: data.description,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${NunitoSans.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
