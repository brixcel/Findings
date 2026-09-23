'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  GraduationCap,
  Briefcase,
  Scale,
  BarChart3,
  Download,
  Settings,
  Database,
  FlaskConical,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/respondents/new', label: 'Add Respondent', icon: UserPlus },
  { href: '/respondents', label: 'Respondents', icon: Users },
  { href: '/results/student', label: 'Student Results', icon: GraduationCap },
  { href: '/results/expert', label: 'Expert Results', icon: Briefcase },
  { href: '/results/comparison', label: 'Group Comparison', icon: Scale },
  { href: '/analysis/item', label: 'Item Analysis', icon: BarChart3 },
  { href: '/export', label: 'Export', icon: Download },
  { href: '/configuration', label: 'Questionnaire Config', icon: Settings },
  { href: '/demo', label: '150+ Test Suite', icon: FlaskConical },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-sm">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-sky-600 rounded">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide text-slate-100 flex items-center space-x-2">
                <span>AR-DUINO-M</span>
                <span className="text-[10px] uppercase font-semibold bg-sky-950 text-sky-400 border border-sky-800 px-1.5 py-0.5 rounded">
                  Thesis Research System
                </span>
              </div>
              <div className="text-[11px] text-slate-400 hidden sm:block truncate max-w-xl">
                Augmented Reality-Driven User Interface for Microcontrollers Evaluation Engine
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>SQLite Connected</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-1.5 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
