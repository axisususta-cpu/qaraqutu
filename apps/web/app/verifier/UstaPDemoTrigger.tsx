"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  USTA_P_CLOSING_SEGMENT_EN,
  USTA_P_CLOSING_SEGMENT_TR,
  USTA_P_KEYBOARD_SHORTCUT,
  USTA_P_SCRIPTS,
  type UstaPScenarioId,
  type UstaPScript,
  type UstaPVoiceIntegration,
} from "../../lib/usta-p-demo";

type PlaybackState = "idle" | "playing" | "paused" | "stopped" | "finishing";

const SEGMENT_DURATION_MS = 4000;
const CLOSING_DISPLAY_MS = 22000;

interface UstaPDemoTriggerProps {
  defaultScenario?: UstaPScenarioId;
  voiceIntegration?: UstaPVoiceIntegration;
  language?: "en" | "tr";
  /** When true (e.g. on golden route), place panel top-right and make entry point more visible for demo. */
  emphasizeForDemo?: boolean;
}

export function UstaPDemoTrigger({
  defaultScenario = "togg",
  voiceIntegration,
  language = "tr",
  emphasizeForDemo = false,
}: UstaPDemoTriggerProps) {
  const [selectedId, setSelectedId] = useState<UstaPScenarioId>(defaultScenario);
  const [scriptVisible, setScriptVisible] = useState(false);
  const [playbackState, setPlaybackState] = useState<PlaybackState>("idle");
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [pleasePilis, setPleasePilis] = useState(false);
  const [showingClosing, setShowingClosing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const segmentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedScript = USTA_P_SCRIPTS[selectedId];
  const segments = selectedScript.segments;

  const clearSegmentTimer = useCallback(() => {
    if (segmentTimerRef.current) {
      clearTimeout(segmentTimerRef.current);
      segmentTimerRef.current = null;
    }
  }, []);

  const advanceSegment = useCallback(() => {
    setCurrentSegmentIndex((i) => {
      if (i + 1 >= segments.length) {
        clearSegmentTimer();
        setPlaybackState("idle");
        setScriptVisible(false);
        return 0;
      }
      return i + 1;
    });
  }, [segments.length, clearSegmentTimer]);

  useEffect(() => {
    if (playbackState !== "playing" || showingClosing) return;
    segmentTimerRef.current = setTimeout(advanceSegment, SEGMENT_DURATION_MS);
    return clearSegmentTimer;
  }, [playbackState, currentSegmentIndex, showingClosing, advanceSegment, clearSegmentTimer]);

  const runNarration = useCallback(() => {
    clearSegmentTimer();
    setShowingClosing(false);
    setCurrentSegmentIndex(0);
    setPlaybackState("playing");
    setScriptVisible(true);
    voiceIntegration?.onNarrationStart?.(selectedScript);
    voiceIntegration?.onScriptSelected?.(selectedScript);
  }, [selectedScript, voiceIntegration, clearSegmentTimer]);

  const pauseNarration = useCallback(() => {
    clearSegmentTimer();
    setPlaybackState("paused");
    voiceIntegration?.onNarrationStop?.();
  }, [voiceIntegration, clearSegmentTimer]);

  const continueNarration = useCallback(() => {
    setPlaybackState("playing");
  }, []);

  const stopNarration = useCallback(() => {
    clearSegmentTimer();
    setPlaybackState("stopped");
    voiceIntegration?.onNarrationStop?.();
  }, [voiceIntegration, clearSegmentTimer]);

  const restartNarration = useCallback(() => {
    clearSegmentTimer();
    setShowingClosing(false);
    setCurrentSegmentIndex(0);
    setPlaybackState("playing");
    setScriptVisible(true);
  }, [clearSegmentTimer]);

  const finishNarration = useCallback(() => {
    clearSegmentTimer();
    setPlaybackState("finishing");
    setShowingClosing(true);
    setScriptVisible(true);
    voiceIntegration?.onNarrationStop?.();
    setTimeout(() => {
      setShowingClosing(false);
      setPlaybackState("idle");
      setScriptVisible(false);
      setCurrentSegmentIndex(0);
    }, CLOSING_DISPLAY_MS);
  }, [voiceIntegration, clearSegmentTimer]);

  const closePanel = useCallback(() => {
    clearSegmentTimer();
    setPlaybackState("idle");
    setScriptVisible(false);
    setShowingClosing(false);
    setCurrentSegmentIndex(0);
    voiceIntegration?.onNarrationStop?.();
  }, [voiceIntegration, clearSegmentTimer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "q" || !e.ctrlKey) return;
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (isInput) return;
      e.preventDefault();
      if (playbackState === "idle") runNarration();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playbackState, runNarration]);

  const isActive = playbackState === "playing" || playbackState === "paused" || playbackState === "stopped" || playbackState === "finishing";

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        ...(emphasizeForDemo ? { top: "1rem", right: "1rem" } : { bottom: "1rem", right: "1rem" }),
        zIndex: 99999,
      }}
    >
      <div
        style={{
          background: "#0F172A",
          border: "1px solid #334155",
          borderRadius: 6,
          padding: "0.55rem 0.7rem",
          fontSize: "0.7rem",
          opacity: 1,
          maxWidth: 360,
          boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            marginBottom: "0.4rem",
            fontWeight: 600,
            fontSize: "0.8rem",
            letterSpacing: "0.04em",
            color: "#E5E7EB",
          }}
        >
          Usta P
        </div>
        <div style={{ fontSize: "0.65rem", opacity: 0.8, marginBottom: "0.25rem" }}>
          {language === "tr" ? "Kontrollü anlatı tanık rehberi" : "Controlled narrative witness guide"}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", alignItems: "center" }}>
          {(Object.keys(USTA_P_SCRIPTS) as UstaPScenarioId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                if (!isActive) setSelectedId(id);
              }}
              disabled={isActive}
              style={{
                padding: "0.2rem 0.4rem",
                borderRadius: 4,
                border: selectedId === id ? "1px solid #4B5563" : "1px solid #374151",
                background: selectedId === id ? "#1F2937" : "transparent",
                color: "#E5E7EB",
                cursor: isActive ? "not-allowed" : "pointer",
                fontSize: "0.7rem",
                opacity: isActive ? 0.7 : 1,
              }}
            >
              {language === "tr" ? USTA_P_SCRIPTS[id].labelTr : USTA_P_SCRIPTS[id].label}
            </button>
          ))}
          <label style={{ display: "flex", alignItems: "center", gap: "0.2rem", marginLeft: "0.25rem", cursor: "pointer", opacity: 0.85 }}>
            <input
              type="checkbox"
              checked={pleasePilis}
              onChange={(e) => setPleasePilis(e.target.checked)}
              disabled={isActive}
              style={{ width: 12, height: 12 }}
            />
            <span style={{ fontSize: "0.65rem" }}>please pilis (EN)</span>
          </label>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem", marginTop: "0.35rem", alignItems: "center" }}>
          <button
            type="button"
            onClick={runNarration}
            disabled={isActive}
            style={{
              padding: "0.2rem 0.5rem",
              borderRadius: 4,
              border: "1px solid #374151",
              background: "#0B1120",
              color: "#E5E7EB",
              cursor: isActive ? "not-allowed" : "pointer",
              fontSize: "0.7rem",
            }}
          >
            Oynat
          </button>
          <button
            type="button"
            onClick={pauseNarration}
            disabled={playbackState !== "playing"}
            style={{
              padding: "0.2rem 0.4rem",
              borderRadius: 4,
              border: "1px solid #374151",
              background: "transparent",
              color: "#E5E7EB",
              cursor: playbackState === "playing" ? "pointer" : "not-allowed",
              fontSize: "0.65rem",
              opacity: playbackState === "playing" ? 1 : 0.5,
            }}
          >
            Bekle
          </button>
          <button
            type="button"
            onClick={continueNarration}
            disabled={playbackState !== "paused" && playbackState !== "stopped"}
            style={{
              padding: "0.2rem 0.4rem",
              borderRadius: 4,
              border: "1px solid #374151",
              background: "transparent",
              color: "#E5E7EB",
              cursor: playbackState === "paused" || playbackState === "stopped" ? "pointer" : "not-allowed",
              fontSize: "0.65rem",
              opacity: playbackState === "paused" || playbackState === "stopped" ? 1 : 0.5,
            }}
          >
            Devam et
          </button>
          <button
            type="button"
            onClick={stopNarration}
            disabled={playbackState !== "playing" && playbackState !== "paused"}
            style={{
              padding: "0.2rem 0.4rem",
              borderRadius: 4,
              border: "1px solid #374151",
              background: "transparent",
              color: "#E5E7EB",
              cursor: playbackState === "playing" || playbackState === "paused" ? "pointer" : "not-allowed",
              fontSize: "0.65rem",
              opacity: playbackState === "playing" || playbackState === "paused" ? 1 : 0.5,
            }}
          >
            Sessiz kal
          </button>
          <button
            type="button"
            onClick={restartNarration}
            disabled={!isActive}
            style={{
              padding: "0.2rem 0.4rem",
              borderRadius: 4,
              border: "1px solid #374151",
              background: "transparent",
              color: "#E5E7EB",
              cursor: isActive ? "pointer" : "not-allowed",
              fontSize: "0.65rem",
              opacity: isActive ? 1 : 0.5,
            }}
          >
            Yeniden başla
          </button>
          <button
            type="button"
            onClick={finishNarration}
            disabled={!isActive}
            style={{
              padding: "0.2rem 0.4rem",
              borderRadius: 4,
              border: "1px solid #374151",
              background: "transparent",
              color: "#E5E7EB",
              cursor: isActive ? "pointer" : "not-allowed",
              fontSize: "0.65rem",
              opacity: isActive ? 1 : 0.5,
            }}
          >
            Bitir
          </button>
        </div>
        {isActive && (
          <div style={{ marginTop: "0.25rem", fontSize: "0.65rem", opacity: 0.7 }}>
            {playbackState === "finishing"
              ? (language === "tr" ? "Kapanış oynatılıyor…" : "Playing closing…")
              : playbackState === "playing"
              ? `${currentSegmentIndex + 1} / ${segments.length}`
              : playbackState === "paused" || playbackState === "stopped"
              ? (language === "tr" ? "Duraklatıldı" : "Paused") + ` — ${currentSegmentIndex + 1} / ${segments.length}`
              : null}
          </div>
        )}
      </div>

      {scriptVisible && (
        <div
          style={{
            marginTop: "0.5rem",
            background: "#020617",
            border: "1px solid #1F2937",
            borderRadius: 6,
            padding: "0.6rem 0.75rem",
            fontSize: "0.75rem",
            maxHeight: 280,
            overflowY: "auto",
          }}
        >
          {showingClosing ? (
            <>
              <div style={{ opacity: 0.7, marginBottom: "0.35rem" }}>
                {language === "tr" ? "Kapanış" : "Closing"} — {pleasePilis ? "EN" : "TR"}
              </div>
              <p style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                {pleasePilis ? USTA_P_CLOSING_SEGMENT_EN : USTA_P_CLOSING_SEGMENT_TR}
              </p>
            </>
          ) : (
            <>
              <div style={{ opacity: 0.7, marginBottom: "0.35rem" }}>{selectedScript.labelTr} — metin</div>
              {segments.map((seg, i) => (
                <p
                  key={i}
                  style={{
                    margin: "0.25rem 0",
                    lineHeight: 1.4,
                    background: i === currentSegmentIndex ? "rgba(55, 65, 81, 0.4)" : "transparent",
                    borderRadius: 4,
                    padding: i === currentSegmentIndex ? "0.2rem 0.35rem" : 0,
                  }}
                >
                  {seg}
                </p>
              ))}
            </>
          )}
          <button
            type="button"
            onClick={closePanel}
            style={{
              marginTop: "0.5rem",
              padding: "0.2rem 0.4rem",
              fontSize: "0.65rem",
              border: "1px solid #374151",
              background: "transparent",
              color: "#9CA3AF",
              cursor: "pointer",
            }}
          >
            Kapat
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => (playbackState === "idle" ? runNarration() : closePanel())}
        title={`Usta P — ${USTA_P_KEYBOARD_SHORTCUT}`}
        style={{
          position: "absolute",
          bottom: "0.25rem",
          right: "0.25rem",
          width: 22,
          height: 22,
          borderRadius: 4,
          border: "1px solid #374151",
          background: "transparent",
          color: "#4B5563",
          fontSize: "0.65rem",
          fontWeight: 700,
          cursor: "pointer",
          opacity: 0.6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        P
      </button>
    </div>
  );
}
