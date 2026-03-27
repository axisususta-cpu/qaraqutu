export type OperatingMode = "demo" | "pilot" | "live";
export type IntegrationSourceId = "demo_archive" | "connected_device" | "uploaded_package";

export interface IntegrationSourceReadiness {
  id: IntegrationSourceId;
  badgeTr: string;
  badgeEn: string;
  detailTr: string;
  detailEn: string;
  selectable: boolean;
}

export interface LiveIntegrationReadiness {
  operatingMode: OperatingMode;
  modeBadgeTr: string;
  modeBadgeEn: string;
  modeTitleTr: string;
  modeTitleEn: string;
  modeBodyTr: string;
  modeBodyEn: string;
  operatorBoundaryTr: string;
  operatorBoundaryEn: string;
  sources: IntegrationSourceReadiness[];
}

function normalizeOperatingMode(raw: string | undefined): OperatingMode {
  if (raw === "pilot" || raw === "live") return raw;
  return "demo";
}

export function getLiveIntegrationReadiness(): LiveIntegrationReadiness {
  const operatingMode = normalizeOperatingMode(process.env.NEXT_PUBLIC_QARAQUTU_OPERATING_MODE);

  const modeBadgeTr = operatingMode === "live" ? "Canlı mod bildirildi" : operatingMode === "pilot" ? "Pilot mod bildirildi" : "Demo mod etkin";
  const modeBadgeEn = operatingMode === "live" ? "Live mode declared" : operatingMode === "pilot" ? "Pilot mode declared" : "Demo mode active";
  const modeTitleTr =
    operatingMode === "live"
      ? "Canlı mod bayrağı var; yalnız hazır ilan edilen kanallar ileride açılabilir."
      : operatingMode === "pilot"
      ? "Pilot hazırlık ilan edildi; connected_device hattı seçilebilir, fakat bounded pilot sınırında tutulur."
      : "Mevcut sürüm demo arşivini tam vaka hattı olarak korur; connected_device ise bounded pilot yüzeyi olarak seçilebilir.";
  const modeTitleEn =
    operatingMode === "live"
      ? "A live-mode flag is declared; only explicitly readied channels may be opened later."
      : operatingMode === "pilot"
      ? "Pilot readiness is declared; the connected-device lane becomes selectable, but stays bounded as a pilot surface."
      : "Demo archive remains the full case lane in the current release, while connected-device can be selected as a bounded pilot surface.";
  const modeBodyTr =
    operatingMode === "live"
      ? "Bu slice canlı endpoint entegrasyonu açmaz. Connected-device hattı readiness, erişim ve backend sağlığını dürüstçe gösterebilir; yine de sahte canlı veri üretmez."
      : operatingMode === "pilot"
      ? "Pilot cihaz yüzeyi kullanıcı seçimine girer; fakat aktif cihaz feed'i bağlı değilse verifier yalnız bounded pilot durumunu gösterir."
      : "Verifier demo arşivini vaka incelemesi için açık tutar; connected_device ise demo veri göstermeden bounded pilot sağlık yüzeyi sunar.";
  const modeBodyEn =
    operatingMode === "live"
      ? "This slice does not enable live endpoint integration. The connected-device lane can truthfully expose readiness, access, and backend health, but it still does not fabricate live device data."
      : operatingMode === "pilot"
      ? "The connected-device surface enters user selection, but if no pilot feed is attached the verifier only shows bounded pilot status."
      : "The verifier keeps demo archive open for case review while connected-device exposes a bounded pilot health surface without demo leakage.";

  return {
    operatingMode,
    modeBadgeTr,
    modeBadgeEn,
    modeTitleTr,
    modeTitleEn,
    modeBodyTr,
    modeBodyEn,
    operatorBoundaryTr:
      "Operator rolü bu sürümde trusted access, verifier role lens ve export policy içinde kontrollü olarak açılmıştır. Connected_device seçilebilir bounded pilot lane olarak görünür; uploaded_package ve gerçek canlı endpoint entegrasyonu kapalı kalır.",
    operatorBoundaryEn:
      "Operator is opened in this release as a controlled trusted-access role, verifier role lens, and export-policy actor. Connected-device is visible as a selectable bounded pilot lane, while uploaded-package and real live endpoint integration remain closed.",
    sources: [
      {
        id: "demo_archive",
        badgeTr: "Etkin demo kaynak",
        badgeEn: "Active demo source",
        detailTr: "Bu sürümde kullanıcı seçimine ve olay incelemesine gerçekten giren tek kaynak hattı budur.",
        detailEn: "This is the only source lane that actually enters user selection and event inspection in the current release.",
        selectable: true,
      },
      {
        id: "connected_device",
        badgeTr: "Bounded pilot hattı",
        badgeEn: "Bounded pilot lane",
        detailTr:
          "Hat kullanıcı seçimine girer, fakat ready sayılması yalnız server-side pilot config ve authenticated probe ile mümkündür. Demo olayları bu kanala taşınmaz.",
        detailEn:
          "The lane enters source selection, but it is only treated as ready after server-side pilot config and an authenticated probe succeed. Demo events are not reused here.",
        selectable: true,
      },
      {
        id: "uploaded_package",
        badgeTr: "Entegrasyon iskeleti",
        badgeEn: "Integration skeleton",
        detailTr:
          "Dış paket yüzeyi görünür tutulur, ancak bu slice'ta aktive edilmez. Source selector ortak kaldığı için connected_device ile UI coupling riski taşır ve veri hattı kapalıdır.",
        detailEn:
          "The external-package surface stays visible but is not activated in this slice. Because the source selector is shared, it carries UI coupling risk with connected-device and its data lane remains closed.",
        selectable: false,
      },
    ],
  };
}