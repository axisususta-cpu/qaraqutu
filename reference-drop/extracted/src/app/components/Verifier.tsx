import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  Search,
  QrCode,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Clock,
  MapPin,
  Hash,
  ChevronRight,
} from "lucide-react";
import { QaraqutuLogo } from "./Logo";

interface VerifierProps {
  isDark: boolean;
}

type VerifyState = "idle" | "loading" | "success" | "error" | "warning";

const mockCodes: Record<string, any> = {
  "QQ-2024-ALPHA-001": {
    status: "success",
    product: "Qaraqutu Premium Sertifikası",
    serial: "QQ-2024-ALPHA-001",
    issueDate: "15 Ocak 2024",
    expiryDate: "15 Ocak 2026",
    manufacturer: "Qaraqutu Technologies",
    origin: "Azerbaycan, Bakü",
    chain: "0x7f3a...b92c",
    verified: true,
  },
  "QQ-TEST-DEMO": {
    status: "success",
    product: "Demo Doğrulama Belgesi",
    serial: "QQ-TEST-DEMO",
    issueDate: "1 Mart 2025",
    expiryDate: "1 Mart 2027",
    manufacturer: "Qaraqutu Technologies",
    origin: "Türkiye, İstanbul",
    chain: "0x9a1b...d45f",
    verified: true,
  },
  "QQ-FAKE-999": {
    status: "error",
    message: "Bu kod geçersiz veya sahte! Ürünü satın almayın.",
  },
  "QQ-WARN-EXP": {
    status: "warning",
    product: "Qaraqutu Standart Sertifika",
    serial: "QQ-WARN-EXP",
    issueDate: "10 Ocak 2022",
    expiryDate: "10 Ocak 2024",
    manufacturer: "Qaraqutu Technologies",
    origin: "Azerbaycan, Bakü",
    message: "Bu sertifikanın süresi dolmuş.",
  },
};

const quickCodes = [
  { code: "QQ-2024-ALPHA-001", label: "Geçerli" },
  { code: "QQ-TEST-DEMO", label: "Demo" },
  { code: "QQ-FAKE-999", label: "Sahte" },
  { code: "QQ-WARN-EXP", label: "Süresi Dolmuş" },
];

export function Verifier({ isDark }: VerifierProps) {
  const [code, setCode] = useState("");
  const [state, setState] = useState<VerifyState>("idle");
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleVerify = async (inputCode?: string) => {
    const verifyCode = (inputCode || code).trim().toUpperCase();
    if (!verifyCode) return;
    setCode(verifyCode);
    setState("loading");
    setResult(null);

    await new Promise((r) => setTimeout(r, 1800));

    const found = mockCodes[verifyCode];
    if (found) {
      setState(found.status);
      setResult(found);
    } else {
      setState("error");
      setResult({ message: "Bu kod sistemde bulunamadı. Kodu kontrol edip tekrar deneyin." });
    }
  };

  const handleReset = () => {
    setState("idle");
    setResult(null);
    setCode("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stateConfig = {
    success: {
      icon: ShieldCheck,
      color: "#22c55e",
      bg: "rgba(34,197,94,0.1)",
      border: "rgba(34,197,94,0.3)",
      label: "DOĞRULANDI",
      gradient: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))",
    },
    error: {
      icon: ShieldX,
      color: "#ef4444",
      bg: "rgba(239,68,68,0.1)",
      border: "rgba(239,68,68,0.3)",
      label: "GEÇERSİZ",
      gradient: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))",
    },
    warning: {
      icon: ShieldAlert,
      color: "#F97316",
      bg: "rgba(249,115,22,0.1)",
      border: "rgba(249,115,22,0.3)",
      label: "UYARI",
      gradient: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05))",
    },
  };

  return (
    <section
      id="verify"
      className="relative py-24 overflow-hidden"
      style={{
        background: isDark
          ? "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(249,115,22,0.08) 0%, transparent 70%), #0d0d0d"
          : "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(249,115,22,0.06) 0%, transparent 70%), #f5f5f5",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)",
          transform: "translate(-40%, -40%)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)",
          transform: "translate(40%, 40%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
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
            <ShieldCheck size={12} />
            Güvenli Doğrulama Merkezi
          </div>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 5vw, 3rem)",
              fontWeight: 800,
              color: isDark ? "#ffffff" : "#0a0a0a",
              lineHeight: 1.2,
            }}
          >
            Ürününüzü{" "}
            <span style={{ color: "#F97316" }}>Doğrulayın</span>
          </h2>
          <p
            style={{
              color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
              marginTop: "12px",
              fontSize: "1rem",
            }}
          >
            Ürün kodunu veya seri numarasını girerek özgünlüğünü saniyeler içinde öğrenin.
          </p>
        </motion.div>

        {/* Main Verifier Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="rounded-3xl overflow-hidden"
          style={{
            background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.9)",
            border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
            boxShadow: isDark
              ? "0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(249,115,22,0.1)"
              : "0 25px 80px rgba(0,0,0,0.1), 0 0 0 1px rgba(249,115,22,0.1)",
          }}
        >
          {/* Card Header with Logo */}
          <div
            className="px-8 py-6 flex items-center justify-between"
            style={{
              background: "linear-gradient(135deg, rgba(249,115,22,0.12), rgba(249,115,22,0.04))",
              borderBottom: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #F97316, #EA580C)",
                  boxShadow: "0 0 20px rgba(249,115,22,0.4)",
                }}
              >
                <QaraqutuLogo size={32} />
              </div>
              <div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: isDark ? "#fff" : "#0a0a0a" }}>
                  Qaraqutu Doğrulayıcı
                </div>
                <div style={{ fontSize: "0.75rem", color: "#F97316", letterSpacing: "0.05em" }}>
                  Güvenli · Anlık · Güvenilir
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span style={{ fontSize: "0.75rem", color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
                Sistem Aktif
              </span>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {state === "idle" || state === "loading" ? (
                <motion.div
                  key="input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Input */}
                  <div className="relative mb-4">
                    <div
                      className="flex items-center rounded-2xl overflow-hidden transition-all duration-300"
                      style={{
                        background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                        border: "2px solid",
                        borderColor: code ? "#F97316" : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                        boxShadow: code ? "0 0 20px rgba(249,115,22,0.15)" : "none",
                      }}
                    >
                      <div className="pl-5 pr-3">
                        <Search size={20} style={{ color: "#F97316" }} />
                      </div>
                      <input
                        ref={inputRef}
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                        placeholder="Ürün kodunu girin (ör: QQ-2024-ALPHA-001)"
                        className="flex-1 bg-transparent outline-none py-4 pr-4"
                        style={{
                          color: isDark ? "#ffffff" : "#0a0a0a",
                          fontSize: "1rem",
                          letterSpacing: "0.02em",
                        }}
                        disabled={state === "loading"}
                      />
                      <button
                        className="px-4 py-2 mr-2 rounded-xl flex items-center gap-2 transition-all duration-200"
                        style={{
                          background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                          color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)",
                          fontSize: "0.75rem",
                        }}
                        title="QR Kod Tara"
                      >
                        <QrCode size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Quick test codes */}
                  <div className="mb-6">
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginBottom: "8px",
                      }}
                    >
                      Hızlı Test Kodları:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {quickCodes.map((qc) => (
                        <button
                          key={qc.code}
                          onClick={() => { setCode(qc.code); }}
                          className="px-3 py-1.5 rounded-xl transition-all duration-200 hover:scale-105"
                          style={{
                            background: isDark ? "rgba(249,115,22,0.08)" : "rgba(249,115,22,0.06)",
                            border: "1px solid rgba(249,115,22,0.2)",
                            color: "#F97316",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          {qc.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Verify Button */}
                  <button
                    onClick={() => handleVerify()}
                    disabled={!code || state === "loading"}
                    className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background:
                        state === "loading"
                          ? "rgba(249,115,22,0.5)"
                          : "linear-gradient(135deg, #F97316, #EA580C)",
                      color: "white",
                      fontSize: "1rem",
                      fontWeight: 700,
                      boxShadow: code
                        ? "0 0 30px rgba(249,115,22,0.4), 0 8px 24px rgba(249,115,22,0.2)"
                        : "none",
                    }}
                  >
                    {state === "loading" ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <RefreshCw size={20} />
                        </motion.div>
                        Doğrulanıyor...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={20} />
                        Doğrula
                        <ChevronRight size={18} />
                      </>
                    )}
                  </button>

                  {/* Loading progress */}
                  {state === "loading" && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 1.8, ease: "easeInOut" }}
                      className="mt-4 h-1 rounded-full origin-left"
                      style={{ background: "linear-gradient(90deg, #F97316, #FB923C)" }}
                    />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {(() => {
                    const cfg = stateConfig[state as keyof typeof stateConfig];
                    const Icon = cfg.icon;
                    return (
                      <div>
                        {/* Result Header */}
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5, type: "spring" }}
                          className="flex flex-col sm:flex-row items-center gap-5 mb-8 p-6 rounded-2xl"
                          style={{
                            background: cfg.gradient,
                            border: `1px solid ${cfg.border}`,
                          }}
                        >
                          <motion.div
                            initial={{ rotate: -30, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-20 h-20 rounded-3xl flex items-center justify-center flex-shrink-0"
                            style={{
                              background: cfg.bg,
                              border: `2px solid ${cfg.border}`,
                              boxShadow: `0 0 30px ${cfg.color}30`,
                            }}
                          >
                            <Icon size={40} style={{ color: cfg.color }} />
                          </motion.div>

                          <div className="text-center sm:text-left">
                            <div
                              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2"
                              style={{
                                background: cfg.bg,
                                border: `1px solid ${cfg.border}`,
                                fontSize: "0.7rem",
                                fontWeight: 800,
                                letterSpacing: "0.15em",
                                color: cfg.color,
                              }}
                            >
                              {state === "success" && <CheckCircle size={12} />}
                              {state === "error" && <XCircle size={12} />}
                              {state === "warning" && <AlertCircle size={12} />}
                              {cfg.label}
                            </div>
                            <div
                              style={{
                                fontSize: "1.1rem",
                                fontWeight: 700,
                                color: isDark ? "#fff" : "#0a0a0a",
                              }}
                            >
                              {result?.product ||
                                (state === "error"
                                  ? "Doğrulama Başarısız"
                                  : "Dikkat Gerekiyor")}
                            </div>
                            {result?.message && (
                              <p
                                style={{
                                  fontSize: "0.875rem",
                                  color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
                                  marginTop: "4px",
                                }}
                              >
                                {result.message}
                              </p>
                            )}
                          </div>
                        </motion.div>

                        {/* Detail rows */}
                        {result?.serial && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6"
                          >
                            {[
                              { icon: Hash, label: "Seri No", value: result.serial },
                              { icon: CheckCircle, label: "Üretici", value: result.manufacturer },
                              { icon: Clock, label: "Yayın Tarihi", value: result.issueDate },
                              { icon: Clock, label: "Geçerlilik", value: result.expiryDate },
                              { icon: MapPin, label: "Menşei", value: result.origin },
                              { icon: ExternalLink, label: "Blockchain", value: result.chain },
                            ].map((item, i) => (
                              <motion.div
                                key={item.label}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.05 }}
                                className="flex items-center gap-3 p-3 rounded-xl"
                                style={{
                                  background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
                                  border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
                                }}
                              >
                                <item.icon size={14} style={{ color: "#F97316", flexShrink: 0 }} />
                                <div className="min-w-0 flex-1">
                                  <div
                                    style={{
                                      fontSize: "0.65rem",
                                      color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)",
                                      letterSpacing: "0.08em",
                                      textTransform: "uppercase",
                                    }}
                                  >
                                    {item.label}
                                  </div>
                                  <div
                                    className="truncate"
                                    style={{
                                      fontSize: "0.8rem",
                                      fontWeight: 600,
                                      color: isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.8)",
                                    }}
                                  >
                                    {item.value}
                                  </div>
                                </div>
                                {item.label === "Seri No" && (
                                  <button
                                    onClick={() => handleCopy(item.value)}
                                    style={{ color: "#F97316", flexShrink: 0 }}
                                  >
                                    <Copy size={14} />
                                  </button>
                                )}
                              </motion.div>
                            ))}
                          </motion.div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={handleReset}
                            className="flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02]"
                            style={{
                              background: "linear-gradient(135deg, #F97316, #EA580C)",
                              color: "white",
                              fontWeight: 700,
                              fontSize: "0.9rem",
                              boxShadow: "0 0 20px rgba(249,115,22,0.3)",
                            }}
                          >
                            <RefreshCw size={16} />
                            Yeni Sorgulama
                          </button>
                          {result?.serial && (
                            <button
                              onClick={() => handleCopy(result.serial)}
                              className="px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02]"
                              style={{
                                background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                                border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                                color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
                                fontSize: "0.85rem",
                              }}
                            >
                              {copied ? <CheckCircle size={16} style={{ color: "#22c55e" }} /> : <Copy size={16} />}
                              {copied ? "Kopyalandı!" : "Kopyala"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Card Footer */}
          <div
            className="px-8 py-4 flex items-center justify-between"
            style={{
              borderTop: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
              background: isDark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)",
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: "rgba(249,115,22,0.1)" }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#F97316" }} />
              </div>
              <span style={{ fontSize: "0.7rem", color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }}>
                256-bit SSL şifreleme
              </span>
            </div>
            <span style={{ fontSize: "0.7rem", color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }}>
              © 2025 Qaraqutu Technologies
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
