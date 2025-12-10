// Very simple, rule-based orchestrator for the internal chat.
// Later, this can be replaced or enriched with a real LLM call.

export type OrchestratorLanguage = "en" | "fr" | "ar";
export type OrchestratorFlow =
  | "A_RDV_DIRECT"
  | "B_DETAILING_PPF"
  | "C_MECHANICAL"
  | "UNKNOWN";

export type OrchestratorResult = {
  reply: string;
  language: OrchestratorLanguage;
  flow: OrchestratorFlow;
};

// 1) Language detection: very lightweight, just for MVP
function detectLanguage(text: string): OrchestratorLanguage {
  const raw = text || "";
  const t = raw.toLowerCase();

  // Crude Arabic detection: presence of Arabic characters
  if (/[ء-ي]/.test(raw)) {
    return "ar";
  }

  // Crude French hints (extended)
  const frenchHints = [
    "bonjour",
    "salut",
    "voiture",
    "rdv",
    "rendez-vous",
    "nettoyage",
    "intérieur",
    "interieur",
    "extérieur",
    "exterieur",
    "problème",
    "probleme",
    "moteur",
    "frein",
    "freins",
    "vibration",
    "vibrations",
    "accélération",
    "acceleration",
    "j'ai",
    "j ai",
  ];

  if (frenchHints.some((w) => t.includes(w))) {
    return "fr";
  }

  // Default: English
  return "en";
}


// 2) Flow detection: A (RDV direct), B (detailing/PPF), C (mechanical)
function detectFlow(text: string): OrchestratorFlow {
  const t = text.toLowerCase();

  // Flow C: mechanical problem
  if (
    t.includes("noise") ||
    t.includes("vibration") ||
    t.includes("engine") ||
    t.includes("brakes") ||
    t.includes("brake") ||
    t.includes("check engine") ||
    t.includes("probleme moteur") ||
    t.includes("problème moteur") ||
    t.includes("vibration") ||
    t.includes("bruit") ||
    t.includes("moteur") ||
    t.includes("frein")
  ) {
    return "C_MECHANICAL";
  }

  // Flow B: detailing / PPF / paint / polish
  if (
    t.includes("detail") ||
    t.includes("detailing") ||
    t.includes("ppf") ||
    t.includes("polish") ||
    t.includes("ceramic") ||
    t.includes("ceramique") ||
    t.includes("céramique") ||
    t.includes("lustrage") ||
    t.includes("polissage") ||
    t.includes("film")
  ) {
    return "B_DETAILING_PPF";
  }

  // Otherwise Flow A: direct RDV
  if (t.includes("rdv") || t.includes("appointment") || t.includes("book")) {
    return "A_RDV_DIRECT";
  }

  // default: A for MVP (direct RDV)
  return "A_RDV_DIRECT";
}

// 3) Texts per language & flow, with global upsell
function buildReply(
  language: OrchestratorLanguage,
  flow: OrchestratorFlow,
  original: string,
): string {
  // Common safety sentence (prices / diagnostic)
  const safety_fr =
    "Les tarifs et le diagnostic définitifs seront confirmés après inspection par notre équipe.";
  const safety_en =
    "Final pricing and the definitive diagnosis will be confirmed after inspection by our team.";
  const safety_ar =
    "سيتم تأكيد الأسعار والتشخيص النهائي بعد فحص السيارة من قِبَل فريقنا.";

  if (language === "fr") {
    switch (flow) {
      case "B_DETAILING_PPF":
        return [
          "Merci pour votre message. Je peux vous aider pour votre demande de detailing / PPF.",
          "Pouvez-vous m’indiquer la marque, le modèle et l’année du véhicule, puis envoyer 2–3 photos ?",
          "Souhaitez-vous ajouter notre option premium sur ce service ? La plupart de nos clients la prennent pour un résultat plus durable et une meilleure protection.",
          safety_fr,
        ].join(" ");
      case "C_MECHANICAL":
        return [
          "Merci, j’ai bien noté que vous avez un souci mécanique.",
          "Pouvez-vous décrire les symptômes, l’urgence, et envoyer une courte vidéo si un bruit ou une vibration est présent ?",
          "Souhaitez-vous ajouter notre option premium (contrôle préventif complet en plus de votre demande) ? La plupart de nos clients la choisissent pour sécuriser le véhicule.",
          safety_fr,
        ].join(" ");
      case "A_RDV_DIRECT":
      default:
        return [
          "Merci, je peux vous aider à planifier un rendez-vous.",
          "Pouvez-vous me préciser le service souhaité ainsi que la marque, le modèle et l’année de votre véhicule ?",
          "Souhaitez-vous ajouter notre option premium sur ce service ? La plupart de nos clients la choisissent pour un meilleur résultat et une tenue plus longue.",
          safety_fr,
        ].join(" ");
    }
  }

  if (language === "ar") {
    switch (flow) {
      case "B_DETAILING_PPF":
        return [
          "شكرًا لرسالتك، يمكنني مساعدتك في خدمة التلميع / الحماية PPF.",
          "من فضلك أرسل نوع السيارة، الموديل، سنة الصنع، مع 2–3 صور للسيارة.",
          "هل ترغب في إضافة باقة الترقية المميزة لهذا النوع من الخدمة؟ أغلب عملائنا يختارونها لنتيجة أفضل وحماية تدوم أطول.",
          safety_ar,
        ].join(" ");
      case "C_MECHANICAL":
        return [
          "تم استلام طلبك بخصوص مشكلة ميكانيكية.",
          "من فضلك صف الأعراض ودرجة الاستعجال، وإن أمكن أرسل فيديو قصير يوضح الصوت أو الاهتزاز.",
          "هل ترغب في إضافة باقة الترقية المميزة (فحص وقائي كامل مع خدمتك)؟ أغلب العملاء يختارونها لزيادة الأمان.",
          safety_ar,
        ].join(" ");
      case "A_RDV_DIRECT":
      default:
        return [
          "شكرًا لك، يمكنني مساعدتك في حجز موعد.",
          "من فضلك أخبرني بالخدمة المطلوبة مع نوع السيارة، الموديل وسنة الصنع.",
          "هل ترغب في إضافة باقة الترقية المميزة لهذه الخدمة؟ أغلب عملائنا يختارونها لنتيجة أفضل تدوم لفترة أطول.",
          safety_ar,
        ].join(" ");
    }
  }

  // English (default)
  switch (flow) {
    case "B_DETAILING_PPF":
      return [
        "Thank you for your message. I can help you with your detailing / PPF request.",
        "Please send your car make, model and year, plus 2–3 photos of the vehicle.",
        "Would you like to add our premium add-on for this service? Most clients choose it for better, longer-lasting results and extra protection.",
        safety_en,
      ].join(" ");
    case "C_MECHANICAL":
      return [
        "Got it, you are describing a mechanical issue.",
        "Please describe the symptoms, how urgent it is, and, if possible, send a short video showing the noise or vibration.",
        "Would you like to add our premium add-on (a preventive full check on top of your request)? Most clients choose it to keep the car safer and more reliable.",
        safety_en,
      ].join(" ");
    case "A_RDV_DIRECT":
    default:
      return [
        "Thank you, I can help you book an appointment.",
        "Please confirm the service you want and your car make, model and year.",
        "Would you like to add our premium add-on for this service? Most clients choose it for better, longer-lasting results.",
        safety_en,
      ].join(" ");
  }
}

// 4) Main entry point used by the internal chat route
export async function runInternalOrchestrator(
  input: string,
): Promise<OrchestratorResult> {
  const language = detectLanguage(input);
  const flow = detectFlow(input);
  const reply = buildReply(language, flow, input);

  return {
    reply,
    language,
    flow,
  };
}
