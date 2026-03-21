import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon, Menu, X, ShieldCheck } from "lucide-react";
import { LogoFull } from "./Logo";

interface NavbarProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
}

const navLinks = [
  { id: "home", label: "Ana Sayfa" },
  { id: "verify", label: "Doğrulama" },
  { id: "features", label: "Özellikler" },
  { id: "how", label: "Nasıl Çalışır" },
];

export function Navbar({ theme, onToggleTheme, activeSection, onNavigate }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDark = theme === "dark";

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? isDark
              ? "rgba(10,10,10,0.92)"
              : "rgba(255,255,255,0.92)"
            : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled
            ? isDark
              ? "1px solid rgba(249,115,22,0.15)"
              : "1px solid rgba(249,115,22,0.1)"
            : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button onClick={() => onNavigate("home")} className="flex-shrink-0">
              <LogoFull dark={isDark} />
            </button>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className="relative px-4 py-2 rounded-lg transition-all duration-200 group"
                  style={{
                    color: activeSection === link.id
                      ? "#F97316"
                      : isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
                    fontSize: "0.9rem",
                  }}
                >
                  {link.label}
                  {activeSection === link.id && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                      style={{ background: "#F97316" }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* CTA Button */}
              <button
                onClick={() => onNavigate("verify")}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #F97316, #EA580C)",
                  color: "white",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  boxShadow: "0 0 20px rgba(249,115,22,0.3)",
                }}
              >
                <ShieldCheck size={14} />
                Doğrula
              </button>

              {/* Theme Toggle */}
              <button
                onClick={onToggleTheme}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{
                  background: isDark ? "rgba(249,115,22,0.1)" : "rgba(249,115,22,0.08)",
                  border: "1px solid rgba(249,115,22,0.3)",
                  color: "#F97316",
                }}
              >
                <AnimatePresence mode="wait">
                  {isDark ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun size={18} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon size={18} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              {/* Mobile menu */}
              <button
                className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                  color: isDark ? "white" : "black",
                }}
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                background: isDark ? "rgba(10,10,10,0.98)" : "rgba(255,255,255,0.98)",
                borderTop: "1px solid rgba(249,115,22,0.1)",
              }}
            >
              <div className="px-4 py-4 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => { onNavigate(link.id); setMobileOpen(false); }}
                    className="py-3 px-4 rounded-xl text-left transition-all duration-200"
                    style={{
                      color: activeSection === link.id ? "#F97316" : isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
                      background: activeSection === link.id
                        ? "rgba(249,115,22,0.1)"
                        : "transparent",
                      fontSize: "0.95rem",
                    }}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
