import React, { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ArrowRight, ShieldCheck, Zap, Globe } from "lucide-react";
import { QaraqutuLogo } from "./Logo";

interface HeroProps {
  isDark: boolean;
  onNavigate: (section: string) => void;
}

function FloatingParticle({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: x, top: y, width: size, height: size, background: "rgba(249,115,22,0.15)" }}
      animate={{
        y: [0, -30, 0],
        opacity: [0.3, 0.8, 0.3],
        scale: [1, 1.3, 1],
      }}
      transition={{ duration: 4 + delay, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

export function Hero({ isDark, onNavigate }: HeroProps) {
  const stats = [
    { value: "2.4M+", label: "Doğrulama", icon: ShieldCheck },
    { value: "99.9%", label: "Güvenilirlik", icon: Zap },
    { value: "180+", label: "Ülke", icon: Globe },
  ];

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: isDark
          ? "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(249,115,22,0.15) 0%, transparent 60%), #0a0a0a"
          : "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(249,115,22,0.1) 0%, transparent 60%), #fafafa",
      }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: isDark
            ? `linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px)`
            : `linear-gradient(rgba(249,115,22,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.06) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating particles */}
      <FloatingParticle delay={0} x="10%" y="20%" size={8} />
      <FloatingParticle delay={1} x="85%" y="15%" size={12} />
      <FloatingParticle delay={2} x="70%" y="60%" size={6} />
      <FloatingParticle delay={0.5} x="20%" y="70%" size={10} />
      <FloatingParticle delay={1.5} x="50%" y="85%" size={7} />
      <FloatingParticle delay={3} x="90%" y="45%" size={9} />

      {/* Big orange glow orb */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -60%)",
        }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{
            background: "rgba(249,115,22,0.1)",
            border: "1px solid rgba(249,115,22,0.3)",
            color: "#F97316",
            fontSize: "0.8rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#F97316" }}
          />
          Dijital Kimlik Doğrulama Platformu
        </motion.div>

        {/* Logo + Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <QaraqutuLogo size={96} />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{
            fontSize: "clamp(2.5rem, 8vw, 5rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: isDark ? "#ffffff" : "#0a0a0a",
          }}
        >
          Gerçeği{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #F97316, #FB923C)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Doğrula.
          </span>
          <br />
          Güveni{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #EA580C, #F97316)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            İnşa Et.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="max-w-2xl mx-auto mt-6 mb-10"
          style={{
            color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)",
            fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
            lineHeight: 1.7,
          }}
        >
          Qaraqutu ile ürünlerinizin, belgelerinizin ve dijital varlıklarınızın özgünlüğünü
          saniyeler içinde doğrulayın. Blockchain destekli, kurcalamaya karşı korumalı.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <button
            onClick={() => onNavigate("verify")}
            className="group flex items-center gap-3 px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #F97316, #EA580C)",
              color: "white",
              fontSize: "1rem",
              fontWeight: 700,
              boxShadow: "0 0 30px rgba(249,115,22,0.4), 0 8px 30px rgba(249,115,22,0.2)",
            }}
          >
            <ShieldCheck size={20} />
            Hemen Doğrula
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform duration-200"
            />
          </button>

          <button
            onClick={() => onNavigate("how")}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
              border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
              color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)",
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            Nasıl Çalışır?
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="grid grid-cols-3 gap-4 max-w-xl mx-auto"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}
              className="flex flex-col items-center p-4 rounded-2xl"
              style={{
                background: isDark ? "rgba(249,115,22,0.05)" : "rgba(249,115,22,0.04)",
                border: "1px solid rgba(249,115,22,0.15)",
              }}
            >
              <stat.icon size={20} style={{ color: "#F97316", marginBottom: "6px" }} />
              <span
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: "#F97316",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
                  marginTop: "4px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="w-6 h-10 rounded-full border-2 flex items-start justify-center pt-2"
          style={{ borderColor: "rgba(249,115,22,0.4)" }}
        >
          <motion.div
            className="w-1 h-2 rounded-full"
            style={{ background: "#F97316" }}
            animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
