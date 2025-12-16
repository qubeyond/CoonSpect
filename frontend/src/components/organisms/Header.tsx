import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useAppStore } from "../../stores/appStore";
import { Menu, LogOut, User, Upload, Home, FileText, Sun, Moon } from "lucide-react"; // убрать в атом Icon!

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useAppStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Закрытие профильного меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const scrollTo = (id: string) => {
    if (id === "hero") {
      // Scroll to top of the page for Главная button
      if (location.pathname !== "/upload") {
        navigate("/");
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      setMenuOpen(false);
      return;
    }
    if (location.pathname !== "/upload") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setProfileMenuOpen(false);
    setMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-dark-400/80 dark:bg-light-400/80 backdrop-blur-md border-b border-purple-800/30 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
        {/* Logo */}
        <h1
          onClick={() => navigate("/")}
          className="text-2xl font-semibold text-purple-400 cursor-pointer hover:text-purple-300 transition"
        >
          CoonSpect
        </h1>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 text-sm text-gray-400 dark:text-gray-600 items-center">
          <button onClick={() => scrollTo("hero")} className="hover:text-purple-400 transition">
            Главная
          </button>
          <button onClick={() => scrollTo("how")} className="hover:text-purple-400 transition">
            Как это работает
          </button>
          <button onClick={() => scrollTo("examples")} className="hover:text-purple-400 transition">
            Примеры
          </button>
          <button onClick={() => navigate("/files")} className="hover:text-purple-400 transition">
            Мои файлы
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="hover:text-purple-400 transition"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                className="flex items-center gap-2 hover:text-purple-400 transition"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <User className="w-4 h-4" />
                {user.username}
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-dark-200 dark:bg-light-200 border border-purple-800/40 rounded-lg shadow-lg overflow-hidden">
                  <button
                    onClick={() => handleNavigation("/profile")}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-left hover:bg-purple-600/20 transition border-b border-purple-800/20"
                  >
                    <User className="w-4 h-4" /> Профиль
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-left hover:bg-purple-600/20 transition"
                  >
                    <LogOut className="w-4 h-4" /> Выйти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="hover:text-purple-400 transition"
            >
              Войти
            </button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-400 dark:text-gray-600 hover:text-purple-400 transition"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-[var(--color-bg-accent)]/95 border-t border-purple-800/40 py-4 px-6 text-[var(--color-text-secondary)] space-y-3">
          <button onClick={() => scrollTo("hero")} className="flex items-center gap-2 hover:text-purple-400 transition w-full text-left">
            <Home className="w-4 h-4" /> Главная
          </button>
          <button onClick={() => scrollTo("how")} className="flex items-center gap-2 hover:text-purple-400 transition w-full text-left">
            <FileText className="w-4 h-4" /> Как это работает
          </button>
          <button onClick={() => scrollTo("examples")} className="flex items-center gap-2 hover:text-purple-400 transition w-full text-left">
            <Upload className="w-4 h-4" /> Примеры
          </button>
          <button onClick={() => navigate("/files")} className="flex items-center gap-2 hover:text-purple-400 transition w-full text-left">
            <FileText className="w-4 h-4" /> Мои файлы
          </button>

          {user ? (
            <>
              <div className="border-t border-purple-800/30 my-2" />
              <button
                onClick={() => handleNavigation("/profile")}
                className="flex items-center gap-2 hover:text-purple-400 transition w-full text-left"
              >
                <User className="w-4 h-4" /> Профиль
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 hover:text-purple-400 transition w-full text-left"
              >
                <LogOut className="w-4 h-4" /> Выйти
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 hover:text-purple-400 transition w-full text-left"
            >
              <User className="w-4 h-4" /> Войти
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;