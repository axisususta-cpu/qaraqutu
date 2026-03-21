import React from "react";
import { motion } from "motion/react";
import { Package, ScanLine, ShieldCheck, Download } from "lucide-react";
import { QaraqutuLogo } from "./Logo";

interface HowItWorksProps {
  isDark: boolean;
  onNavigate: (section: string) => void;
}

const steps = [
  {
    step: "01",
    icon: Package,
    title: "Ürünü Hazırla",
    desc: "Markanız için benzersiz Qaraqutu doğrulama kodları ve QR etiketleri oluşturun. Her ürüne özel dijital kimlik atanır.",
    color: "#F97316",
  },
  {
    step: "02",
    icon: ScanLine,
    title: "Kodu Tara veya Gir",
    desc: "Müşteri ürün üzerindeki QR kodu kamerası ile tarar veya seri numarasını Qaraqutu platformuna girer.",
    color: "#FB923C",
  },
  {
    step: "03",
    icon: ShieldCheck,
    title: "Anında Doğrulama",
    desc: "Blockchain ağı sorgulanır ve milisaniyeler içinde ürünün gerçekliği, menşei ve geçerlilik durumu döndürülür.",
    color: "#EA580C",
  },
  {
    step: "04",
    icon: Download,
    title: "Sertifika Al",
    desc: "Başarılı doğrulama sonrasında dijital sertifika indirilir ve kayıt blockchain üzerinde kalıcı olarak saklanır.",
    color: "#F97316",
  },
];

export function HowItWorks({ isDark, onNavigate }: HowItWorksProps) {
  return (
    <section
      id="how"
      className="relative py-24 overflow-hidden"
      style={{
        background: isDark
          ? "linear-gradient(180deg, #0a0a0a 0%, #0f0f0f 100%)"
          : "linear-gradient(180deg, #f5f5f5 0%, #eeeeee 100%)",
      }}
    >
      {/* Orange accent blob */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(249,115,22,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
            style={{
              background: "rgba(249,115,22,0.1)",
              border: "1px solid rgba(249,115,22,0.3)",
              color: "#F97316",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Süreç
          </div>

          <h2
            style={{
              fontSize: "clamp(1.8rem, 5vw, 3rem)",
              fontWeight: 800,
              color: isDark ? "#ffffff" : "#0a0a0a",
              lineHeight: 1.2,
            }}
          >
            4 Adımda{" "}
            <span style={{ color: "#F97316" }}>Doğrulama</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div
            className="absolute top-16 left-0 right-0 h-px hidden lg:block"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(249,115,22,0.3), rgba(249,115,22,0.3), transparent)",
              margin: "0 12.5%",
            }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.12 }}
                className="relative flex flex-col items-center text-center"
              >
                {/* Step number + icon */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-6 z-10"
                  style={{
                    background: "linear-gradient(135deg, #F97316, #EA580C)",
                    boxShadow: `0 0 30px rgba(249,115,22,0.4), 0 8px 24px rgba(249,115,22,0.2)`,
                  }}
                >
                  <step.icon size={28} style={{ color: "white" }} />
                  <div
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{
                      background: isDark ? "#1a1a1a" : "#ffffff",
                      border: "2px solid #F97316",
                      fontSize: "0.6rem",
                      fontWeight: 800,
                      color: "#F97316",
                    }}
                  >
                    {step.step}
                  </div>
                </motion.div>

                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: isDark ? "#ffffff" : "#0a0a0a",
                    marginBottom: "8px",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.45)",
                    lineHeight: 1.7,
                  }}
                >
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-20 rounded-3xl overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg, #F97316, #EA580C, #C2410C)",
          }}
        >
          {/* Pattern overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 40%)`,
            }}
          />
          {/* Grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-12 py-10">
            <div className="flex items-center gap-5">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <QaraqutuLogo size={64} />
              </motion.div>
              <div>
                <h3
                  style={{
                    fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
                    fontWeight: 800,
                    color: "#ffffff",
                    lineHeight: 1.2,
                  }}
                >
                  Hemen Doğrulamaya Başlayın
                </h3>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem", marginTop: "4px" }}>
                  Ücretsiz deneyin · Kredi kartı gerekmez
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate("verify")}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex-shrink-0"
              style={{
                background: "#ffffff",
                color: "#EA580C",
                fontSize: "1rem",
                fontWeight: 800,
                boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
              }}
            >
              <ShieldCheck size={20} />
              Ücretsiz Dene
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
