import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata = {
  title: 'AR-DUINO-M: Research Data-Entry & Statistical Analysis System',
  description: 'Undergraduate Thesis Evaluation and Statistical Engine for AR-DUINO-M',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Navigation />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="bg-slate-900 text-slate-400 text-xs py-4 border-t border-slate-800 text-center">
          <div className="max-w-7xl mx-auto px-4">
            AR-DUINO-M: Augmented Reality-Driven User Interface for Navigation and Operation of Microcontrollers • Statistical Analysis Engine
          </div>
        </footer>
      </body>
    </html>
  );
}
