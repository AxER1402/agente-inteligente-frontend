import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router';
import {
  LayoutDashboard, Video, Type, Eye, Database, Cpu,
  Target, BarChart2, Settings, Menu, Bell, Search,
  X, ChevronRight, Activity, Sparkles, BookOpen, Sun, Moon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const C = {
  mint: '#ADEBB3',
  mintDark: '#7BCB9D',
  turquoise: '#6ED3CF',
  lightGray: '#F5F7F6',
};

const navGroups = [
  {
    label: 'Principal',
    items: [
      { icon: LayoutDashboard, label: 'Inicio', path: '/', exact: true },
      { icon: Video, label: 'Traductor en Vivo', path: '/traduccion' },
      { icon: BookOpen, label: 'Aprender Señas', path: '/aprender' },
    ],
  },
  {
    label: 'Herramientas IA',
    items: [
      { icon: Database, label: 'Recolectar Dataset', path: '/dataset' },
      { icon: Cpu, label: 'Entrenar Modelo', path: '/entrenar' },
    ],
  },
];

function NavItem({ item }: { item: { icon: any; label: string; path: string; exact?: boolean } }) {
  const location = useLocation();
  const isActive = item.exact
    ? location.pathname === item.path
    : location.pathname === item.path;

  return (
    <NavLink to={item.path} end={item.exact}>
      <motion.div
        whileHover={{ x: 2 }}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors duration-150"
        style={
          isActive
            ? {
              background: 'linear-gradient(135deg, rgba(173,235,179,0.3), rgba(110,211,207,0.1))',
              borderLeft: `3px solid ${C.mintDark}`,
            }
            : { borderLeft: '3px solid transparent' }
        }
      >
        <item.icon
          className="w-4 h-4 flex-shrink-0"
          style={{ color: isActive ? C.mintDark : '#9CA3AF' }}
        />
        <span
          className={`text-sm truncate ${isActive
            ? 'text-gray-900 dark:text-[#ADEBB3] font-semibold'
            : 'text-gray-500 dark:text-zinc-400 font-normal hover:text-gray-700 dark:hover:text-zinc-200'
            }`}
        >
          {item.label}
        </span>
        {isActive && (
          <ChevronRight className="w-3.5 h-3.5 ml-auto flex-shrink-0" style={{ color: C.mintDark }} />
        )}
      </motion.div>
    </NavLink>
  );
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-100">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3 border-b border-gray-50 dark:border-zinc-800/50">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #ADEBB3, #6ED3CF)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 11V6a2 2 0 0 0-4 0v5" />
            <path d="M14 10V4a2 2 0 0 0-4 0v6" />
            <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
            <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="font-bold text-gray-900 dark:text-zinc-100" style={{ fontSize: '16px', letterSpacing: '-0.03em' }}>
            SignAI
          </div>
          <div className="text-gray-400 dark:text-zinc-500" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
            POWERED BY AI
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 flex-shrink-0">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Status chip */}
      <div className="px-4 pt-4 pb-2">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'linear-gradient(135deg, rgba(173,235,179,0.15), rgba(110,211,207,0.1))' }}
        >
          <div className="relative flex-shrink-0">
            <div className="w-2 h-2 rounded-full" style={{ background: C.mintDark }} />
            <div
              className="absolute inset-0 w-2 h-2 rounded-full animate-ping"
              style={{ background: C.mintDark, opacity: 0.5 }}
            />
          </div>
          <span className="text-[#1A3A2A] dark:text-[#ADEBB3]" style={{ fontSize: '11px', fontWeight: 500 }}>
            Modelo activo · 97.3% precisión
          </span>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-1">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div
              className="px-3 py-2 uppercase text-[#9CA3AF] dark:text-zinc-500"
              style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em' }}
            >
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-gray-50 dark:border-zinc-800/50">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #ADEBB3, #6ED3CF)', fontWeight: 700 }}
          >
            U
          </div>
          <div className="min-w-0">
            <div className="text-gray-800 dark:text-zinc-200" style={{ fontSize: '13px', fontWeight: 500 }}>
              Usuario
            </div>
            <div className="text-gray-400 dark:text-zinc-500 truncate" style={{ fontSize: '11px' }}>
              usuario@signai.app
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 dark:text-zinc-500 ml-auto flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(prev => !prev);

  const currentLabel = navGroups
    .flatMap((g) => g.items)
    .find((i) => (i.exact ? location.pathname === i.path : location.pathname === i.path))?.label || 'SignAI';

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F7F6] dark:bg-zinc-950 text-gray-900 dark:text-zinc-100" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 flex-shrink-0 border-r border-gray-100 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 lg:hidden shadow-2xl"
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header
          className="flex-shrink-0 px-4 lg:px-6 py-3 flex items-center gap-4 bg-white/85 dark:bg-zinc-900/85 border-b border-gray-100 dark:border-zinc-800 backdrop-blur-md"
          style={{
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-zinc-300" />
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: C.mintDark }} />
            <span className="text-gray-700 dark:text-zinc-200" style={{ fontSize: '14px', fontWeight: 500 }}>
              {currentLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(173,235,179,0.15)', fontSize: '11px', color: '#1A3A2A', fontWeight: 500 }}
            >
              <Activity className="w-3 h-3" style={{ color: C.mintDark }} />
              <span className="dark:text-[#ADEBB3]">IA Activa</span>
            </div>

            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Cambiar Tema"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-[#F5F7F6] dark:bg-zinc-950" style={{ fontFamily: 'Inter, sans-serif' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
