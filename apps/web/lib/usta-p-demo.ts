/**
 * Usta P Demo Trigger Model
 * Prewritten narration scripts for controlled demo mode.
 * No freeform AI; no chatbot. Script output only.
 * Reserved shape for future voice layer (PersonaPlex / Usta P voice).
 */

export type UstaPScenarioId = "togg" | "insurance" | "unitree";

export interface UstaPScript {
  id: UstaPScenarioId;
  label: string;
  labelTr: string;
  /** Full narration text for display and future voice playback */
  segments: string[];
}

/** Prewritten scripts. Stored as structured constants. */
export const USTA_P_SCRIPTS: Record<UstaPScenarioId, UstaPScript> = {
  togg: {
    id: "togg",
    label: "TOGG",
    labelTr: "TOGG",
    segments: [
      "QARAQUTU inceleme başlatıldı.",
      "Vaka sınıfı: araç olay incelemesi.",
      "Kaydedilmiş delil ve türetilmiş değerlendirme ayrı gösterilmektedir.",
      "Doğrulama zinciri incelemeye hazırdır. Bu çıktı kusur veya niyet kararı vermez.",
      "Sonraki güvenli adım: olay paketini seçin, veri zincirini doğrulayın, ardından yapılandırılmış çıktıya geçin.",
    ],
  },
  insurance: {
    id: "insurance",
    label: "Insurance",
    labelTr: "Sigorta",
    segments: [
      "QARAQUTU inceleme başlatıldı.",
      "Vaka sınıfı: sigorta talebi olay incelemesi.",
      "Kaydedilmiş delil ve türetilmiş değerlendirme ayrı gösterilmektedir.",
      "Doğrulama zinciri incelemeye hazırdır. Bu çıktı kusur veya niyet kararı vermez.",
      "Sonraki güvenli adım: delil katmanlarını inceleyin, doğrulama kaydını kontrol edin, belge üretimine geçin.",
    ],
  },
  unitree: {
    id: "unitree",
    label: "Unitree / Macau",
    labelTr: "Unitree / Makao",
    segments: [
      "QARAQUTU inceleme başlatıldı.",
      "Vaka sınıfı: kamusal robotik olay incelemesi.",
      "Olay kimliği: MACAU-G1-032026.",
      "Kaydedilmiş delil ve türetilmiş değerlendirme ayrı gösterilmektedir.",
      "Bu ayrım, olay sonrası yorum ile ham kaydın birbirine karışmasını önlemek içindir.",
      "Doğrulama zinciri incelemeye hazırdır.",
      "Bu çıktı, kusur veya niyet kararı vermez.",
      "Bu çıktı, olayın bağlamını, kayıt bütünlüğünü ve inceleme izini korumayı amaçlar.",
      "Sonraki güvenli adım: zaman akışını inceleyin, veri zincirini doğrulayın ve ardından yapılandırılmış inceleme çıktısına geçin.",
    ],
  },
};

/** Closing segment shown when "Usta P bitir." / Finish is triggered. Turkish. */
export const USTA_P_CLOSING_SEGMENT_TR =
  "Sistemin söylediği gibi, kanıt bütünlüğü değişmezdir.\n\nSayın yetkililer... Sizler harika makineler, muazzam otonom sistemler inşa ediyorsunuz. Dünyayı değiştiriyorsunuz. Ancak bu makineler yarın sokağa indiğinde, insanlarla iç içe yaşamaya başladığında, bir kaza veya kriz anında toplumun sizden isteyeceği ilk şey teknoloji değil; güvendir, adalettir, şeffaflıktır.\n\nİnsanlar, bir robotun veya otonom aracın hata yapabileceğini kabul edebilir. Ama o hatanın üstünün örtülmesini, verinin bükülmesini, neyin kayıt neyin yorum olduğunun birbirine karışmasını asla affetmez.\n\nQaraqutu sadece bir yazılım değil; sizin ürettiğiniz bu muazzam teknolojinin toplumla, insanla ve hukukla yaptığı güven sözleşmesinin dijital şahididir. Biz makinelerin değil, insanların birbirine olan güvenini korumak için buradayız. Çünkü teknoloji ne kadar değişirse değişsin, insanın gerçeğe ve adalete duyduğu ihtiyaç hep aynı kalacaktır.";

/** Closing segment when "please pilis" (English mode). */
export const USTA_P_CLOSING_SEGMENT_EN =
  "As the system has stated, evidence integrity does not change.\n\nDistinguished participants... You are building remarkable machines and extraordinary autonomous systems. You are changing the world. But when these machines enter public life and begin to coexist with people, the first thing society will ask of you in a crisis or incident will not be technology. It will be trust, fairness, and transparency.\n\nPeople may accept that a robot or autonomous vehicle can make a mistake. What they will not forgive is the concealment of that mistake, the distortion of data, or the collapse of the distinction between what was recorded and what was later interpreted.\n\nQARAQUTU is not merely software. It is the digital witness of the trust contract between your technology and the people, institutions, and legal systems that must live with it. We are here not only to protect machines, but to preserve human trust in the face of autonomous complexity. Because no matter how much technology changes, the human need for truth and justice remains the same.";

/** Keyboard shortcut for triggering active Usta P script. Ctrl+Q. Avoids conflict with browser quit where possible. */
export const USTA_P_KEYBOARD_SHORTCUT = "Ctrl+Q";

/** Reserved integration shape for future voice layer (PersonaPlex / Usta P voice). */
export interface UstaPVoiceIntegration {
  onNarrationStart?: (script: UstaPScript) => void;
  onNarrationStop?: () => void;
  onScriptSelected?: (script: UstaPScript) => void;
  /** Current script selected for narration (read by voice layer) */
  getSelectedScript?: () => UstaPScript | null;
}
