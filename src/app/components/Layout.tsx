import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router';
import {
  LayoutDashboard, Video, Type, Eye, Database, Cpu,
  Target, BarChart2, Settings, Menu, Bell, Search,
  X, ChevronRight, Activity, Sparkles, BookOpen, Sun, Moon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '../context/UserContext';

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
  const { currentUser, login, logout, registerUser, hasPassword } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  // For logging into an existing user that has a password
  const [passwordTarget, setPasswordTarget] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const recentUsersStr = typeof window !== 'undefined' ? localStorage.getItem('signai_recent_users') : null;
  const recentUsers: string[] = recentUsersStr ? JSON.parse(recentUsersStr) : ['Invitado'];

  const handleSelectUser = (u: string) => {
    if (hasPassword(u)) {
      setPasswordTarget(u);
      setPasswordInput('');
      setPasswordError(false);
    } else {
      login(u);
      setShowModal(false);
    }
  };

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTarget) return;
    const success = login(passwordTarget, passwordInput);
    if (success) {
      setPasswordTarget(null);
      setShowModal(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsername.trim()) {
      registerUser(newUsername, newPassword || undefined);
      setNewUsername('');
      setNewPassword('');
      setShowNewPassword(false);
      setShowModal(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowModal(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setPasswordTarget(null);
    setPasswordInput('');
    setPasswordError(false);
  };

  return (
    <>
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
          <div
            onClick={() => setShowModal(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs flex-shrink-0 uppercase"
              style={{ background: 'linear-gradient(135deg, #ADEBB3, #6ED3CF)', fontWeight: 700 }}
            >
              {currentUser.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-gray-800 dark:text-zinc-200" style={{ fontSize: '13px', fontWeight: 500 }}>
                {currentUser}
              </div>
              <div className="text-gray-400 dark:text-zinc-500 truncate" style={{ fontSize: '11px' }}>
                Cambiar perfil
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 dark:text-zinc-500 ml-auto flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-zinc-800"
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                  {passwordTarget ? `Acceder como "${passwordTarget}"` : 'Seleccionar Perfil'}
                </h2>
                <button onClick={closeModal} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Password prompt for existing user */}
              {passwordTarget ? (
                <form onSubmit={handlePasswordLogin} className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 dark:text-zinc-500 font-semibold uppercase mb-1.5">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      placeholder="Escribe tu contraseña..."
                      value={passwordInput}
                      onChange={e => { setPasswordInput(e.target.value); setPasswordError(false); }}
                      autoFocus
                      className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-zinc-800 text-sm outline-none text-gray-800 dark:text-zinc-100 placeholder-gray-400 transition-colors ${passwordError ? 'border-red-400' : 'border-transparent'}`}
                    />
                    {passwordError && (
                      <p className="text-red-500 text-xs mt-1.5">Contraseña incorrecta. Inténtalo de nuevo.</p>
                    )}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setPasswordTarget(null)}
                      className="flex-1 py-2.5 rounded-xl text-gray-500 dark:text-zinc-400 text-sm font-medium border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Volver
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-opacity"
                      style={{ background: 'linear-gradient(135deg, #7BCB9D, #6ED3CF)' }}
                    >
                      Entrar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {/* User list */}
                  <div className="space-y-2 max-h-40 overflow-y-auto mb-4 pr-1">
                    {recentUsers.map(u => (
                      <button
                        key={u}
                        onClick={() => handleSelectUser(u)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                          currentUser === u
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                            : 'bg-gray-50 dark:bg-zinc-800/50 text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-transparent'
                        }`}
                      >
                        <span>{u} {currentUser === u && '✓'}</span>
                        {hasPassword(u) && (
                          <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-normal">🔒</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* New user form */}
                  <div className="border-t border-gray-100 dark:border-zinc-800 pt-4 space-y-2">
                    <p className="text-xs text-gray-400 dark:text-zinc-500 font-semibold uppercase">Nuevo perfil</p>
                    <form onSubmit={handleRegister} className="space-y-2">
                      <input
                        type="text"
                        placeholder="Nombre de usuario..."
                        value={newUsername}
                        onChange={e => setNewUsername(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border-0 bg-gray-50 dark:bg-zinc-800 text-sm outline-none text-gray-800 dark:text-zinc-100 placeholder-gray-400"
                      />
                      {showNewPassword ? (
                        <input
                          type="password"
                          placeholder="Contraseña (opcional)..."
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border-0 bg-gray-50 dark:bg-zinc-800 text-sm outline-none text-gray-800 dark:text-zinc-100 placeholder-gray-400"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(true)}
                          className="text-xs text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 transition-colors"
                        >
                          + Añadir contraseña
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={!newUsername.trim()}
                        className="w-full py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50 transition-opacity"
                        style={{ background: 'linear-gradient(135deg, #7BCB9D, #6ED3CF)' }}
                      >
                        Crear y Entrar
                      </button>
                    </form>
                  </div>

                  {/* Logout */}
                  {currentUser !== 'Invitado' && (
                    <div className="border-t border-gray-100 dark:border-zinc-800 pt-3 mt-3">
                      <button
                        onClick={handleLogout}
                        className="w-full py-2.5 rounded-xl text-red-500 dark:text-red-400 text-sm font-medium border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
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
