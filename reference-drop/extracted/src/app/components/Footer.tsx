import React from "react";
import { motion } from "motion/react";
import { Github, Twitter, Linkedin, Mail, MapPin, Phone, ArrowUp } from "lucide-react";
import { LogoFull } from "./Logo";

interface FooterProps {
  isDark: boolean;
}

const footerLinks = {
  Platform: ["Doğrulama", "API Entegrasyonu", "Fiyatlandırma", "Durum"],
  Şirket: ["Hakkımızda", "Kariyer", "Blog", "Basın"],
  Destek: ["Yardım Merkezi", "Dokümantasyon", "Topluluk", "İletişim"],
  Hukuki: ["Gizlilik", "Kullanım Koşulları", "Güvenlik", "KVKK"],
};

export function Footer({ isDark }: FooterProps) {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer
      style={{
        background: isDark ? "#080808" : "#0a0a0a",
        borderTop: "1px solid rgba(249,115,22,0.1)",
      }}
    >
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <LogoFull dark={true} />
            <p
              className="mt-4 max-w-xs"
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: "0.85rem",
                lineHeight: 1.7,
              }}
            >
              Blockchain destekli dijital kimlik doğrulama platformu. Ürünlerinizi ve
              markalarınızı sahtecilikten koruyun.
            </p>

            {/* Contact */}
            <div className="mt-6 flex flex-col gap-3">
              {[
                { icon: Mail, text: "hello@qaraqutu.com" },
                { icon: Phone, text: "+994 12 555 00 00" },
                { icon: MapPin, text: "Bakü, Azerbaycan" },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-2"
                  style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}
                >
                  <item.icon size={14} style={{ color: "#F97316", flexShrink: 0 }} />
                  {item.text}
                </div>
              ))}
            </div>

            {/* Social */}
            <div className="flex gap-3 mt-6">
              {[
                { icon: Twitter, href: "#" },
                { icon: Github, href: "#" },
                { icon: Linkedin, href: "#" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{
                    background: "rgba(249,115,22,0.1)",
                    border: "1px solid rgba(249,115,22,0.2)",
                    color: "#F97316",
                  }}
                >
                  <social.icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#F97316",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "16px",
                }}
              >
                {category}
              </h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="transition-colors duration-200 hover:text-orange-400"
                      style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.85rem" }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ borderColor: "rgba(249,115,22,0.08)" }}
      >
        <div className="max-w-7xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.78rem" }}>
            © 2025 Qaraqutu Technologies. Tüm hakları saklıdır.
          </span>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.75rem" }}>
                Tüm sistemler normal
              </span>
            </div>

            <button
              onClick={scrollToTop}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: "rgba(249,115,22,0.1)",
                border: "1px solid rgba(249,115,22,0.2)",
                color: "#F97316",
              }}
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
