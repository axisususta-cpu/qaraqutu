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
import {
  USTA_TRIGGERS,
  getUstaPResponse,
  type UstaPTriggerId,
  type UstaPDomain,
} from "../../lib/usta-prompt-pack";

type PlaybackState = "idle" | "playing" | "paused" | "stopped" | "finishing";

const SEGMENT_DURATION_MS = 4000;
const CLOSING_DISPLAY_MS = 22000;

interface UstaPDemoTriggerProps {
  defaultScenario?: UstaPScenarioId;
  voiceIntegration?: UstaPVoiceIntegration;
  language?: "en" | "tr";
  /** When true (e.g. on golden route), place panel top-right and make entry point more visible for demo. */
  emphasizeForDemo?: boolean;
  /** For prompt pack: domain for next_safe_step variant. */
  selectedDomain?: UstaPDomain;
  /** When false, triggers show silence pattern. */
  hasCase?: boolean;
}

export function UstaPDemoTrigger({
  defaultScenario = "togg",
  voiceIntegration,
  language = "tr",
  emphasizeForDemo = false,
  selectedDomain = "vehicle",
  hasCase = false,
}: UstaPDemoTriggerProps) {
  const [selectedId, setSelectedId] = useState<UstaPScenarioId>(defaultScenario);
  const [scriptVisible, setScriptVisible] = useState(false);
  const [playbackState, setPlaybackState] = useState<PlaybackState>("idle");
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [pleasePilis, setPleasePilis] = useState(false);
  const [showingClosing, setShowingClosing] = useState(false);
  const [triggerResponse, setTriggerResponse] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const segmentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTrigger = useCallback(
    (triggerId: UstaPTriggerId) => {
      const text = getUstaPResponse(triggerId, language, {
        domain: selectedDomain,
        hasCase,
      });
      setTriggerResponse(text);
      setScriptVisible(true);
    },
    [language, selectedDomain, hasCase]
  );

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
    setTriggerResponse(null);
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
  const roleLabel =
    selectedDomain === "vehicle"
      ? "Claims reviewer"
      : selectedDomain === "drone"
      ? "Legal reviewer"
      : "Technical reviewer";
  const boundaryState = !hasCase
    ? "Insufficient context"
    : playbackState === "finishing"
    ? "Human escalation recommended"
    : "Bounded guidance active";

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
          USTA P — bounded guidance layer
        </div>
        <div style={{ fontSize: "0.65rem", opacity: 0.85, marginBottom: "0.35rem", lineHeight: 1.45 }}>
          {language === "tr"
            ? "Serbest sohbet değildir. Verifier yerine geçmez. Scope ister, eksik bağlamda sınır koyar, riskte escalation önerir."
            : "Not free-form chat. Does not replace verifier. Requests scope, sets boundaries on missing context, and recommends escalation under risk."}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", marginBottom: "0.35rem" }}>
          {["Bounded guidance", "Role-aware", "Trace-sensitive", "Escalation-literate"].map((pill) => (
            <span
              key={pill}
              style={{
                padding: "0.12rem 0.38rem",
                border: "1px solid #374151",
                borderRadius: 999,
                fontSize: "0.6rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "#CBD5E1",
              }}
            >
              {pill}
            </span>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: "0.3rem",
            marginBottom: "0.35rem",
          }}
        >
          <div style={{ border: "1px solid #334155", borderRadius: 5, padding: "0.3rem 0.4rem", background: "#0B1325" }}>
            <div style={{ fontSize: "0.58rem", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Active role mode
            </div>
            <div style={{ fontSize: "0.67rem", color: "#E5E7EB", marginTop: "0.15rem" }}>{roleLabel}</div>
          </div>
          <div style={{ border: "1px solid #334155", borderRadius: 5, padding: "0.3rem 0.4rem", background: "#0B1325" }}>
            <div style={{ fontSize: "0.58rem", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Boundary state
            </div>
            <div style={{ fontSize: "0.67rem", color: "#E5E7EB", marginTop: "0.15rem" }}>{boundaryState}</div>
          </div>
        </div>
        <div style={{ fontSize: "0.6rem", opacity: 0.82, marginBottom: "0.25rem", color: "#94A3B8", lineHeight: 1.45 }}>
          {language === "tr"
            ? "Review yapmaz, execution başlatmaz, diagnostics izlemez. Yalnızca sonraki bounded adımı netleştirir."
            : "Does not perform review, launch execution, or monitor diagnostics. It only clarifies the next bounded step."}
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
            <span style={{ fontSize: "0.65rem" }}>{language === "tr" ? "Kapanış (EN)" : "Closing (EN)"}</span>
          </label>
        </div>
        <div style={{ fontSize: "0.65rem", opacity: 0.85, marginTop: "0.25rem", marginBottom: "0.2rem" }}>
          {language === "tr" ? "Guidance modes (Prompt Pack v1):" : "Guidance modes (Prompt Pack v1):"}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem", alignItems: "center" }}>
          {USTA_TRIGGERS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTrigger(t.id)}
              style={{
                padding: "0.18rem 0.35rem",
                borderRadius: 4,
                border: "1px solid #374151",
                background: "transparent",
                color: "#E5E7EB",
                cursor: "pointer",
                fontSize: "0.65rem",
              }}
              title={language === "tr" ? t.ctaTr : t.ctaEn}
            >
              {language === "tr" ? t.labelTr : t.labelEn}
            </button>
          ))}
        </div>
        <div style={{ fontSize: "0.6rem", color: "#94A3B8", marginTop: "0.28rem", lineHeight: 1.45 }}>
          {language === "tr"
            ? "Insufficient context -> context ister. High-risk ambiguity -> insan review'e yönlendirir."
            : "Insufficient context -> asks for context. High-risk ambiguity -> routes to human review."}
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
            {language === "tr" ? "Run script" : "Run script"}
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
            {language === "tr" ? "Pause" : "Pause"}
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
            {language === "tr" ? "Resume" : "Resume"}
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
            {language === "tr" ? "Silence" : "Silence"}
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
            {language === "tr" ? "Restart" : "Restart"}
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
            {language === "tr" ? "Escalate close" : "Escalate close"}
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
          {triggerResponse !== null ? (
            <>
              <div style={{ opacity: 0.7, marginBottom: "0.35rem" }}>
                {language === "tr" ? "USTA guidance response" : "USTA guidance response"}
              </div>
              <p style={{ margin: 0, lineHeight: 1.5 }}>{triggerResponse}</p>
              <button
                type="button"
                onClick={() => {
                  setTriggerResponse(null);
                  setScriptVisible(false);
                }}
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
                {language === "tr" ? "Close" : "Close"}
              </button>
            </>
          ) : showingClosing ? (
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
              <div style={{ opacity: 0.7, marginBottom: "0.35rem" }}>
                {selectedScript.labelTr} — {language === "tr" ? "bounded script" : "bounded script"}
              </div>
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
            {language === "tr" ? "Close panel" : "Close panel"}
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
