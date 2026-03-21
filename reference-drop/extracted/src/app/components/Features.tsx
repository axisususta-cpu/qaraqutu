import React from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Zap,
  Globe,
  Lock,
  Eye,
  Cpu,
  QrCode,
  BarChart3,
} from "lucide-react";

interface FeaturesProps {
  isDark: boolean;
}

const features = [
  {
    icon: ShieldCheck,
    title: "Blockchain Güvencesi",
    desc: "Her doğrulama kaydı değiştirilemez blockchain ağına işlenir. Tam şeffaflık ve güvenilirlik.",
    color: "#F97316",
    tag: "Temel",
  },
  {
    icon: Zap,
    title: "Anlık Doğrulama",
    desc: "Milisaniyeler içinde sonuç. Yüksek performanslı altyapımız ile bekleme süresi sıfıra yakın.",
    color: "#FB923C",
    tag: "Hız",
  },
  {
    icon: QrCode,
    title: "QR & Kod Desteği",
    desc: "QR kod tarama, seri numarası veya özel ürün kodları ile çoklu doğrulama yöntemi.",
    color: "#FDBA74",
    tag: "Esneklik",
  },
  {
    icon: Eye,
    title: "Gerçek Zamanlı İzleme",
    desc: "Ürünlerinizin her tarama kaydını takip edin. Şüpheli aktiviteleri anında tespit edin.",
    color: "#F97316",
    tag: "İzleme",
  },
  {
    icon: Globe,
    title: "Global Erişim",
    desc: "180+ ülkede aktif. Çok dilli destek ve yerel uyumluluk ile dünya genelinde hizmet.",
    color: "#EA580C",
    tag: "Küresel",
  },
  {
    icon: Lock,
    title: "Uçtan Uca Şifreleme",
    desc: "Askeri seviye AES-256 şifreleme. Verileriniz her aşamada korunur.",
    color: "#FB923C",
    tag: "Güvenlik",
  },
  {
    icon: Cpu,
    title: "Yapay Zeka Analizi",
    desc: "Makine öğrenimi modelleri sahte ürünleri %99.8 doğrulukla tespit eder.",
    color: "#F97316",
    tag: "AI",
  },
  {
    icon: BarChart3,
    title: "Detaylı Raporlama",
    desc: "Kapsamlı analitik paneller ve özelleştirilebilir raporlar ile işletme içgörüleri.",
    color: "#FDBA74",
    tag: "Analitik",
  },
];

export function Features({ isDark }: FeaturesProps) {
  return (
    <section
      id="features"
      className="relative py-24 overflow-hidden"
      style={{
        background: isDark ? "#0a0a0a" : "#ffffff",
      }}
    >
      {/* Decorative lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: isDark
            ? `linear-gradient(rgba(249,115,22,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.03) 1px, transparent 1px)`
            : `linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
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
            Platform Özellikleri
          </div>

          <h2
            style={{
              fontSize: "clamp(1.8rem, 5vw, 3rem)",
              fontWeight: 800,
              color: isDark ? "#ffffff" : "#0a0a0a",
              lineHeight: 1.2,
            }}
          >
            Neden{" "}
            <span style={{ color: "#F97316" }}>Qaraqutu?</span>
          </h2>
          <p
            className="max-w-2xl mx-auto mt-4"
            style={{
              color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
              fontSize: "1rem",
              lineHeight: 1.7,
            }}
          >
            Sektörün en gelişmiş doğrulama platformu ile ürünlerinizi ve markalarınızı koruyun.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.07 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group relative p-6 rounded-2xl cursor-pointer transition-all duration-300"
              style={{
                background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 30% 20%, ${feature.color}12 0%, transparent 70%)`,
                  border: `1px solid ${feature.color}20`,
                }}
              />

              {/* Tag */}
              <div
                className="inline-flex items-center px-2 py-0.5 rounded-lg mb-4"
                style={{
                  background: `${feature.color}12`,
                  border: `1px solid ${feature.color}25`,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: feature.color,
                  textTransform: "uppercase",
                }}
              >
                {feature.tag}
              </div>

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: `${feature.color}15`,
                  border: `1px solid ${feature.color}25`,
                }}
              >
                <feature.icon size={22} style={{ color: feature.color }} />
              </div>

              {/* Text */}
              <h3
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: isDark ? "#ffffff" : "#0a0a0a",
                  marginBottom: "8px",
                  lineHeight: 1.3,
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.45)",
                  lineHeight: 1.6,
                }}
              >
                {feature.desc}
              </p>

              {/* Bottom accent */}
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, ${feature.color}, transparent)` }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
