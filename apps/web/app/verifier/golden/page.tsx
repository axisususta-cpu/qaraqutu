"use client";

import React, { useState } from "react";
import { UstaPDemoTrigger } from "../UstaPDemoTrigger";

const incidentLogs = [
  { id: 1, time: "19:42:10.000", mode: "AUTONOMOUS", speed: "1.2 m/s", event: "Normal seyir.", status: "ok", hash: "0x8f...3a1" },
  { id: 2, time: "19:42:12.500", mode: "AUTONOMOUS", speed: "1.5 m/s", event: "Yaya tespit edildi (Mesafe: 3m).", status: "warning", hash: "0x9a...2b4" },
  { id: 3, time: "19:42:14.200", mode: "OPERATOR_TAKEOVER", speed: "2.1 m/s", event: "Ani hızlanma. Operatör kontrolü devraldı.", status: "critical", hash: "0xc4...7f9" },
  { id: 4, time: "19:42:16.000", mode: "MANUAL", speed: "0.0 m/s", event: "Acil durdurma (E-Stop) tetiklendi.", status: "resolved", hash: "0xd1...8e2" },
];

export default function QaraqutuVerifierGoldenPage() {
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setIsVerified(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <UstaPDemoTrigger defaultScenario="unitree" language="tr" emphasizeForDemo />
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-wider text-blue-400">QARAQUTU</h1>
            <p className="text-sm text-gray-400">Critical Incident Review Surface</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Olay ID: <span className="text-white font-mono">MACAU-G1-032026</span></p>
            <p className="text-sm text-gray-400">Durum: <span className="text-red-400 animate-pulse">Post-Incident Lock</span></p>
            <p className="text-xs text-slate-500 mt-1">Sunum asistanı: <span className="text-slate-400">Usta P → sağ üstte</span></p>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow-lg border border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold mb-2">Kanıt Bütünlüğü (Evidence Chain)</h2>
              <p className="text-sm text-gray-400">Bu modül, olay anındaki sensör ve operatör loglarının sonradan değiştirilmediğini kriptografik olarak doğrular.</p>
            </div>
            <button
              onClick={handleVerify}
              disabled={isVerified || verifying}
              className={`px-6 py-3 rounded-md font-bold transition-all ${
                isVerified ? "bg-green-600 text-white cursor-default" :
                verifying ? "bg-yellow-500 text-gray-900 cursor-wait" :
                "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
            >
              {isVerified ? "✓ Doğrulandı (Immutable)" : verifying ? "Hash Kontrolü Yapılıyor..." : "Veri Zincirini Doğrula"}
            </button>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-6 border-b border-gray-700 pb-2">Olay Rekonstrüksiyonu (Timeline)</h2>
          <div className="space-y-4">
            {incidentLogs.map((log) => (
              <div
                key={log.id}
                className={`p-4 rounded-md border-l-4 ${
                  log.status === "critical" ? "border-red-500 bg-red-900/20" :
                  log.status === "warning" ? "border-yellow-500 bg-yellow-900/20" :
                  log.status === "resolved" ? "border-green-500 bg-green-900/20" :
                  "border-blue-500 bg-gray-700/50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="font-mono text-sm text-gray-400 w-24">{log.time}</div>
                    <div>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded mb-2 inline-block ${
                          log.mode === "AUTONOMOUS" ? "bg-blue-900 text-blue-300" : "bg-orange-900 text-orange-300"
                        }`}
                      >
                        {log.mode}
                      </span>
                      <p className="font-semibold text-lg">{log.event}</p>
                      <p className="text-sm text-gray-400 mt-1">Hız: {log.speed}</p>
                    </div>
                  </div>
                  <div className={`font-mono text-xs ${isVerified ? "text-green-400" : "text-gray-500"}`}>
                    SHA-256: {log.hash}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
