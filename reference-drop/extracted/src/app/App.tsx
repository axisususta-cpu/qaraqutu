import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Verifier } from "./components/Verifier";
import { Features } from "./components/Features";
import { HowItWorks } from "./components/HowItWorks";
import { Footer } from "./components/Footer";

type Theme = "light" | "dark";

export default function App() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [activeSection, setActiveSection] = useState("home");

  // Apply theme class to document
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Track scroll position to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "verify", "features", "how"];
      const scrollPos = window.scrollY + 100;

      for (const section of sections.reverse()) {
        const el = document.getElementById(section);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(section);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigate = useCallback((section: string) => {
    const el = document.getElementById(section);
    if (el) {
      const offset = 64;
      const top = el.offsetTop - offset;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveSection(section);
    }
  }, []);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const isDark = theme === "dark";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: isDark ? "#0a0a0a" : "#fafafa",
        transition: "background 0.3s ease",
      }}
    >
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        activeSection={activeSection}
        onNavigate={handleNavigate}
      />

      <main>
        <Hero isDark={isDark} onNavigate={handleNavigate} />
        <Verifier isDark={isDark} />
        <Features isDark={isDark} />
        <HowItWorks isDark={isDark} onNavigate={handleNavigate} />
      </main>

      <Footer isDark={isDark} />
    </div>
  );
}
