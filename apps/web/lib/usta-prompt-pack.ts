/**
 * USTA Prompt Pack v1.
 * Controlled narrative witness guide: 6 mandatory triggers, TR/EN cores,
 * silence rules, handoff patterns. No chatbot; no freeform.
 */

export type UstaPTriggerId =
  | "summarize"
  | "recorded_derived"
  | "uncertainty"
  | "verification_state"
  | "next_safe_step"
  | "artifact_help";

export type UstaPDomain = "vehicle" | "drone" | "robot";

export interface UstaPTriggerMeta {
  id: UstaPTriggerId;
  labelTr: string;
  labelEn: string;
  ctaTr: string;
  ctaEn: string;
  coreTr: string;
  coreEn: string;
  shortTr?: string;
  shortEn?: string;
}

/** §4–§9: 6 zorunlu tetik, çekirdek kalıplar. */
export const USTA_TRIGGERS: UstaPTriggerMeta[] = [
  {
    id: "summarize",
    labelTr: "Olayı özetle",
    labelEn: "Summarize event",
    ctaTr: "USTA'dan kısa özet al",
    ctaEn: "Get short summary from USTA",
    coreTr:
      "Bu inceleme, seçili olayın bağlamını özetler. Kaydedilen unsurlar ile yorum katmanı ayrıdır; bu özet nihai hüküm değildir.",
    coreEn:
      "This review summarizes the context of the selected event. Recorded material and interpretive assessment are separate; this summary is not a final determination.",
    shortTr: "Seçili olay bağlamsal olarak özetlenmiştir; nihai hüküm verilmemektedir.",
    shortEn: "The selected event is summarized in context; no final determination is made.",
  },
  {
    id: "recorded_derived",
    labelTr: "Recorded / Derived ayrımını anlat",
    labelEn: "Explain Recorded vs Derived",
    ctaTr: "Ayrımı açıkla",
    ctaEn: "Explain the distinction",
    coreTr:
      "Recorded Evidence, doğrudan kaydedilmiş olay unsurlarını gösterir. Derived Assessment ise bu kayıtların üstüne kurulan yorum katmanıdır. İkisi aynı şey değildir.",
    coreEn:
      "Recorded Evidence shows directly captured event material. Derived Assessment is the interpretive layer built on top of that material. They are not the same.",
    shortTr: "Bu ayrım korunmadan inceleme savunulabilir olmaz. Kayıt ile yorum tek blokta erirse olayın bağlamı zayıflar.",
    shortEn: "Without this distinction, the review is not defensible. If record and interpretation merge, the event context weakens.",
  },
  {
    id: "uncertainty",
    labelTr: "Belirsizlik alanlarını göster",
    labelEn: "Show uncertainty areas",
    ctaTr: "Belirsizliği göster",
    ctaEn: "Show uncertainty",
    coreTr:
      "Bu vakada açık kalan veya tartışmalı unsurlar vardır. Bunlar kapatılmadan kesin hüküm kurulmaz; insan incelemesi gerekebilir.",
    coreEn:
      "There are open or disputed elements in this case. They prevent final certainty and may require human review.",
    shortTr: "Belirsizlik, sistem hatası değil; görünür kılınması gereken inceleme gerçeğidir.",
    shortEn: "Uncertainty is not a system failure; it is a review reality that must be made visible.",
  },
  {
    id: "verification_state",
    labelTr: "Doğrulama durumunu açıkla",
    labelEn: "Explain verification state",
    ctaTr: "Doğrulama durumunu gör",
    ctaEn: "See verification state",
    coreTr:
      "Doğrulama zinciri, hangi adımların desteklendiğini ve hangi adımların kısmi ya da çözümsüz kaldığını gösterir. Bu alan hakikatin kendisi değil, inceleme izidir.",
    coreEn:
      "The verification chain shows which steps are supported and which remain partial or unresolved. It is not truth itself; it is the review trace.",
    shortTr: "Bu bölüm, incelemenin neye dayanarak ilerlediğini gösterir.",
    shortEn: "This section shows what the review is based on.",
  },
  {
    id: "next_safe_step",
    labelTr: "Sonraki güvenli adımı öner",
    labelEn: "Suggest next safe step",
    ctaTr: "Güvenli sonraki adımı gör",
    ctaEn: "See safe next step",
    coreTr:
      "Bir sonraki güvenli adım, açıkta kalan alanı daraltacak insan incelemesini veya role uygun artifact üretimini başlatmaktır.",
    coreEn:
      "The next safe step is to narrow the open area through human review or to initiate a role-appropriate artifact.",
  },
  {
    id: "artifact_help",
    labelTr: "Artifact seçimine yardım et",
    labelEn: "Help with artifact choice",
    ctaTr: "Artifact seçimine yardım",
    ctaEn: "Help choose artifact",
    coreTr:
      "Seçilecek artifact, olayın ne olduğuna göre değil; bu incelemeyi kimin hangi amaçla kullanacağına göre belirlenmelidir.",
    coreEn:
      "The artifact should be chosen not only by what happened, but by who will use the review and for what purpose.",
  },
];

/** §8: Domain-specific next safe step variants. */
export const USTA_NEXT_SAFE_STEP_BY_DOMAIN: Record<
  UstaPDomain,
  { tr: string; en: string }
> = {
  vehicle: {
    tr: "Sürücü müdahalesi, sistem uyarısı ve zaman çizgisi birlikte gözden geçirilmelidir.",
    en: "Driver intervention, system alerting, and timing should be reviewed together.",
  },
  drone: {
    tr: "Komut zinciri ve failover davranışı birlikte doğrulanmalıdır.",
    en: "The command chain and failover behavior should be reviewed together.",
  },
  robot: {
    tr: "Bağlam kaybı ve öncelik davranışı insan incelemesiyle daraltılmalıdır.",
    en: "Context loss and priority behavior should be narrowed through human review.",
  },
};

/** §9: Artifact profile hints for trigger 6. */
export const USTA_ARTIFACT_HINTS: Record<
  string,
  { tr: string; en: string }
> = {
  claims: {
    tr: "Hasar veya claim incelemesi için Claims profili uygundur.",
    en: "Claims is appropriate for damage or claim review.",
  },
  legal: {
    tr: "Zinciri koruyan hukukî inceleme için Legal profili uygundur.",
    en: "Legal is appropriate for chain-preserving legal review.",
  },
  technical: {
    tr: "Teknik rekonstrüksiyon ve sistem davranışı için Technical profili uygundur.",
    en: "Technical is appropriate for reconstruction and system behavior review.",
  },
  safety: {
    tr: "Risk ve güvenli sonraki adım için Safety profili uygundur.",
    en: "Safety is appropriate for risk and safe-next-step review.",
  },
};

/** §10: Silence pattern when context insufficient. */
export const USTA_SILENCE_PATTERN = {
  tr: "Bu adım için görünür bağlam yetersiz. Önce vaka veya ilgili panel seçilmelidir.",
  en: "Visible context is insufficient for this step. Select a case or the relevant panel first.",
};

/** §11: Handoff to human review. */
export const USTA_HANDOFF_PATTERN = {
  tr: "Bu noktada insan incelemesi gereklidir. Sistem, açıkta kalan alanı görünür kılar; nihai sorumluluğu devralmaz.",
  en: "Human review is required at this point. The system makes the open area visible; it does not assume final responsibility.",
};

/** §12: No-go phrases (reference only; USTA must not use these). */
export const USTA_NO_GO_PHRASES = [
  "kesin olarak",
  "suçlu",
  "kusurlu",
  "bilerek yaptı",
  "ihlal sabit",
  "dava sonucu budur",
  "nihai karar verildi",
  "sistem doğruyu buldu",
];

export function getUstaPResponse(
  triggerId: UstaPTriggerId,
  language: "en" | "tr",
  options: {
    domain?: UstaPDomain;
    hasCase?: boolean;
    hasUnknownDisputed?: boolean;
    useShort?: boolean;
    forceHandoff?: boolean;
  } = {}
): string {
  const { domain = "vehicle", hasCase = true, hasUnknownDisputed, useShort, forceHandoff } = options;

  if (forceHandoff) return language === "tr" ? USTA_HANDOFF_PATTERN.tr : USTA_HANDOFF_PATTERN.en;
  if (!hasCase) return language === "tr" ? USTA_SILENCE_PATTERN.tr : USTA_SILENCE_PATTERN.en;

  const trigger = USTA_TRIGGERS.find((t) => t.id === triggerId);
  if (!trigger) return language === "tr" ? USTA_SILENCE_PATTERN.tr : USTA_SILENCE_PATTERN.en;

  if (triggerId === "next_safe_step" && domain) {
    const variant = USTA_NEXT_SAFE_STEP_BY_DOMAIN[domain];
    return language === "tr" ? variant.tr : variant.en;
  }

  if (triggerId === "artifact_help") {
    const core = language === "tr" ? trigger.coreTr : trigger.coreEn;
    const claimsHint = USTA_ARTIFACT_HINTS.claims[language];
    return `${core} — ${claimsHint}`;
  }

  if (useShort && trigger.shortTr && trigger.shortEn)
    return language === "tr" ? trigger.shortTr : trigger.shortEn;
  return language === "tr" ? trigger.coreTr : trigger.coreEn;
}

export function getUstaPTrigger(id: UstaPTriggerId): UstaPTriggerMeta | null {
  return USTA_TRIGGERS.find((t) => t.id === id) ?? null;
}
