// English is the source of truth: every key must exist here.
const english = {
  // Toasts
  applied: "Custom device time applied",
  customFailed: "Custom time failed",
  syncRestored: "Synchronized device time restored",
  syncPending: "Automatic time is on, but not synced yet. Check the Deck is online.",
  syncFailed: "Synchronization failed",
  readFailed: "Could not read time status",
  criticalError: "Critical Error",

  // Sections and status rows
  sectionCurrent: "Current Settings",
  sectionCustom: "Customise Time",
  systemClock: "System Clock",
  clockUnknown: "Unknown",
  clockCustom: "Custom",
  clockWaiting: "Waiting for sync",
  clockSynced: "Synchronized",
  deviceTime: "Device Time",
  timezone: "Timezone",
  loading: "loading...",

  // Sliders
  year: "Year",
  month: "Month",
  day: "Day",
  hour: "Hour",
  minute: "Minute",

  // Buttons
  applyBtn: "Apply Custom Time",
  applying: "Applying...",
  restoreBtn: "Restore Synchronized Time",
  restoring: "Restoring...",

  // Guide
  showGuide: "User Guide",
  hideGuide: "Hide User Guide",
  guideIntro:
    "DeckyClocker is a tool for setting a custom date and time on SteamOS. It can be used to unlock achievements, access time-limited content, or test software that depends on the system clock. It's not intended for long-term use, and you should restore the system clock to a Synchronized state after use. Use this tool at your own risk. The author is not responsible for any issues that may arise from its use.",
  guideUsage:
    'Use the sliders below to select a custom date and time, then click "Apply Custom Time" below to apply it. When you\'re done, click "Restore Synchronized Time" to return to the system clock.',
  guideNoteTitle: "Please Note:",
  guideNote: "It can take a moment for a Custom Time to show on the Steam UI after Applying it.",
  warning:
    'A very out of sync clock can impact Steam logins, downloads, and HTTPS connections. Use "Restore Synchronized Time" above to fix it.',
};

export type Key = keyof typeof english;
// Other languages may be incomplete; any missing key falls back to English.
type Dict = Partial<Record<Key, string>>;

const schinese: Dict = {
  // Toasts
  applied: "已应用自定义设备时间",
  customFailed: "设置自定义时间失败",
  syncRestored: "已恢复同步的设备时间",
  syncPending: "自动时间已开启，但尚未同步。请检查 Deck 是否已联网。",
  syncFailed: "同步失败",
  readFailed: "无法读取时间状态",
  criticalError: "严重错误",

  // Sections and status rows
  sectionCurrent: "当前设置",
  sectionCustom: "自定义时间",
  systemClock: "系统时钟",
  clockUnknown: "未知",
  clockCustom: "自定义",
  clockWaiting: "等待同步",
  clockSynced: "已同步",
  deviceTime: "设备时间",
  timezone: "时区",
  loading: "加载中...",

  // Sliders
  year: "年",
  month: "月",
  day: "日",
  hour: "时",
  minute: "分",

  // Buttons
  applyBtn: "应用自定义时间",
  applying: "正在应用...",
  restoreBtn: "恢复同步时间",
  restoring: "正在恢复...",

  // Guide
  showGuide: "使用指南",
  hideGuide: "隐藏使用指南",
  guideIntro:
    "DeckyClocker 是用于在 SteamOS 上设置自定义日期和时间的工具。可用于解锁成就、访问限时内容，或测试依赖系统时钟的软件。它不适合长期使用，使用后请将系统时钟恢复为同步状态。使用本工具风险自负，作者对因使用而可能产生的任何问题概不负责。",
  guideUsage:
    "使用下方的滑块选择自定义日期和时间，然后点击下方的“应用自定义时间”。完成后，点击“恢复同步时间”以返回系统时钟。",
  guideNoteTitle: "请注意：",
  guideNote: "应用自定义时间后，Steam 界面可能需要片刻才会显示新的时间。",
  warning:
    "系统时间严重不准可能影响 Steam 登录、下载和 HTTPS 连接。请使用上方的“恢复同步时间”来修复。",
};

const tchinese: Dict = {
  // Toasts
  applied: "已套用自訂裝置時間",
  customFailed: "設定自訂時間失敗",
  syncRestored: "已恢復同步的裝置時間",
  syncPending: "自動時間已開啟，但尚未同步。請檢查 Deck 是否已連線。",
  syncFailed: "同步失敗",
  readFailed: "無法讀取時間狀態",
  criticalError: "嚴重錯誤",

  // Sections and status rows
  sectionCurrent: "目前設定",
  sectionCustom: "自訂時間",
  systemClock: "系統時鐘",
  clockUnknown: "未知",
  clockCustom: "自訂",
  clockWaiting: "等待同步",
  clockSynced: "已同步",
  deviceTime: "裝置時間",
  timezone: "時區",
  loading: "載入中...",

  // Sliders
  year: "年",
  month: "月",
  day: "日",
  hour: "時",
  minute: "分",

  // Buttons
  applyBtn: "套用自訂時間",
  applying: "正在套用...",
  restoreBtn: "恢復同步時間",
  restoring: "正在恢復...",

  // Guide
  showGuide: "使用指南",
  hideGuide: "隱藏使用指南",
  guideIntro:
    "DeckyClocker 是用於在 SteamOS 上設定自訂日期和時間的工具。可用於解鎖成就、存取限時內容，或測試依賴系統時鐘的軟體。它不適合長期使用，使用後請將系統時鐘恢復為同步狀態。使用本工具風險自負，作者對因使用而可能產生的任何問題概不負責。",
  guideUsage:
    "使用下方的滑桿選擇自訂日期和時間，然後點選下方的「套用自訂時間」。完成後，點選「恢復同步時間」以返回系統時鐘。",
  guideNoteTitle: "請注意：",
  guideNote: "套用自訂時間後，Steam 介面可能需要片刻才會顯示新的時間。",
  warning:
    "系統時間嚴重不準可能影響 Steam 登入、下載和 HTTPS 連線。請使用上方的「恢復同步時間」來修復。",
};

const french: Dict = {
  // Toasts
  applied: "Heure personnalisée appliquée",
  customFailed: "Échec de l'heure personnalisée",
  syncRestored: "Heure synchronisée rétablie",
  syncPending: "L'heure automatique est activée, mais pas encore synchronisée. Vérifiez que la Deck est en ligne.",
  syncFailed: "Échec de la synchronisation",
  readFailed: "Impossible de lire l'état de l'heure",
  criticalError: "Erreur critique",

  // Sections and status rows
  sectionCurrent: "Réglages actuels",
  sectionCustom: "Personnaliser l'heure",
  systemClock: "Horloge système",
  clockUnknown: "Inconnu",
  clockCustom: "Personnalisée",
  clockWaiting: "En attente de synchro",
  clockSynced: "Synchronisée",
  deviceTime: "Heure actuelle",
  timezone: "Fuseau horaire",
  loading: "chargement...",

  // Sliders
  year: "Année",
  month: "Mois",
  day: "Jour",
  hour: "Heure",
  minute: "Minute",

  // Buttons
  applyBtn: "Appliquer la personnalisation",
  applying: "Application...",
  restoreBtn: "Rétablir l'heure synchronisée",
  restoring: "Rétablissement...",

  // Guide
  showGuide: "Guide d'utilisation",
  hideGuide: "Masquer le guide",
  guideIntro:
    "DeckyClocker permet de définir une date et une heure personnalisées sur SteamOS. Il peut servir à débloquer des succès, accéder à du contenu limité dans le temps ou tester des logiciels qui dépendent de l'horloge système. Il n'est pas conçu pour une utilisation prolongée : rétablissez l'horloge synchronisée après usage. Vous utilisez cet outil à vos risques et périls. L'auteur n'est pas responsable des problèmes éventuels liés à son utilisation.",
  guideUsage:
    "Utilisez les curseurs ci-dessous pour choisir une date et une heure, puis appuyez sur « Appliquer la personnalisation ». Une fois terminé, appuyez sur « Rétablir l'heure synchronisée » pour revenir à l'horloge système.",
  guideNoteTitle: "À noter :",
  guideNote: "L'heure personnalisée peut mettre un moment à apparaître dans l'interface Steam.",
  warning:
    "Une horloge très décalée peut perturber les connexions Steam, les téléchargements et les connexions HTTPS. Utilisez « Rétablir l'heure synchronisée » ci-dessus pour corriger cela.",
};

const italian: Dict = {
  // Toasts
  applied: "Ora personalizzata applicata",
  customFailed: "Impostazione dell'ora personalizzata non riuscita",
  syncRestored: "Ora sincronizzata ripristinata",
  syncPending: "L'ora automatica è attiva, ma non ancora sincronizzata. Controlla che la Deck sia online.",
  syncFailed: "Sincronizzazione non riuscita",
  readFailed: "Impossibile leggere lo stato dell'ora",
  criticalError: "Errore critico",

  // Sections and status rows
  sectionCurrent: "Impostazioni attuali",
  sectionCustom: "Personalizza ora",
  systemClock: "Orologio di sistema",
  clockUnknown: "Sconosciuto",
  clockCustom: "Personalizzato",
  clockWaiting: "In attesa di sincronizzazione",
  clockSynced: "Sincronizzato",
  deviceTime: "Ora attuale",
  timezone: "Fuso orario",
  loading: "caricamento...",

  // Sliders
  year: "Anno",
  month: "Mese",
  day: "Giorno",
  hour: "Ora",
  minute: "Minuto",

  // Buttons
  applyBtn: "Applica ora personalizzata",
  applying: "Applicazione...",
  restoreBtn: "Ripristina ora sincronizzata",
  restoring: "Ripristino...",

  // Guide
  showGuide: "Guida all'uso",
  hideGuide: "Nascondi guida",
  guideIntro:
    "DeckyClocker è uno strumento per impostare una data e un'ora personalizzate su SteamOS. Può servire a sbloccare obiettivi, accedere a contenuti a tempo limitato o testare software che dipende dall'orologio di sistema. Non è pensato per un uso prolungato: dopo l'uso ripristina l'orologio sincronizzato. Usi lo strumento a proprio rischio. L'autore non è responsabile di eventuali problemi derivanti dal suo utilizzo.",
  guideUsage:
    "Usa i cursori qui sotto per scegliere data e ora, poi premi «Applica ora personalizzata». Al termine, premi «Ripristina ora sincronizzata» per tornare all'orologio di sistema.",
  guideNoteTitle: "Nota bene:",
  guideNote: "L'ora personalizzata può impiegare qualche istante per comparire nell'interfaccia di Steam.",
  warning:
    "Un orologio molto sfasato può compromettere gli accessi a Steam, i download e le connessioni HTTPS. Usa «Ripristina ora sincronizzata» qui sopra per risolvere.",
};

const german: Dict = {
  // Toasts
  applied: "Benutzerdefinierte Uhrzeit angewendet",
  customFailed: "Benutzerdefinierte Uhrzeit fehlgeschlagen",
  syncRestored: "Synchronisierte Uhrzeit wiederhergestellt",
  syncPending: "Automatische Zeit ist aktiv, aber noch nicht synchronisiert. Prüfe, ob das Deck online ist.",
  syncFailed: "Synchronisierung fehlgeschlagen",
  readFailed: "Zeitstatus konnte nicht gelesen werden",
  criticalError: "Kritischer Fehler",

  // Sections and status rows
  sectionCurrent: "Aktuelle Einstellungen",
  sectionCustom: "Zeit anpassen",
  systemClock: "Systemuhr",
  clockUnknown: "Unbekannt",
  clockCustom: "Benutzerdefiniert",
  clockWaiting: "Warte auf Synchronisierung",
  clockSynced: "Synchronisiert",
  deviceTime: "Gerätezeit",
  timezone: "Zeitzone",
  loading: "lädt...",

  // Sliders
  year: "Jahr",
  month: "Monat",
  day: "Tag",
  hour: "Stunde",
  minute: "Minute",

  // Buttons
  applyBtn: "Zeitänderung anwenden",
  applying: "Wird angewendet...",
  restoreBtn: "Zeit synchronisieren",
  restoring: "Wird wiederhergestellt...",

  // Guide
  showGuide: "Anleitung",
  hideGuide: "Anleitung ausblenden",
  guideIntro:
    "DeckyClocker dient dazu, unter SteamOS ein benutzerdefiniertes Datum und eine Uhrzeit festzulegen. Es kann genutzt werden, um Erfolge freizuschalten, auf zeitlich begrenzte Inhalte zuzugreifen oder Software zu testen, die von der Systemuhr abhängt. Es ist nicht für den Dauergebrauch gedacht: Stelle die synchronisierte Systemuhr nach der Nutzung wieder her. Die Nutzung erfolgt auf eigene Gefahr. Der Autor haftet nicht für Probleme, die durch die Verwendung entstehen.",
  guideUsage:
    "Wähle mit den Schiebereglern unten Datum und Uhrzeit aus und tippe dann auf „Zeitänderung anwenden“. Tippe anschließend auf „Zeit synchronisieren“, um zur Systemuhr zurückzukehren.",
  guideNoteTitle: "Bitte beachten:",
  guideNote: "Es kann einen Moment dauern, bis die benutzerdefinierte Zeit in der Steam-Oberfläche erscheint.",
  warning:
    "Eine stark abweichende Uhr kann Steam-Anmeldungen, Downloads und HTTPS-Verbindungen beeinträchtigen. Nutze oben „Zeit synchronisieren“, um das zu beheben.",
};

const spanish: Dict = {
  // Toasts
  applied: "Hora personalizada aplicada",
  customFailed: "Error al establecer la hora personalizada",
  syncRestored: "Hora sincronizada restaurada",
  syncPending: "La hora automática está activada, pero aún no se ha sincronizado. Comprueba que la Deck esté conectada.",
  syncFailed: "Error de sincronización",
  readFailed: "No se pudo leer el estado de la hora",
  criticalError: "Error crítico",

  // Sections and status rows
  sectionCurrent: "Ajustes actuales",
  sectionCustom: "Personalizar hora",
  systemClock: "Reloj del sistema",
  clockUnknown: "Desconocido",
  clockCustom: "Personalizado",
  clockWaiting: "Esperando sincronización",
  clockSynced: "Sincronizado",
  deviceTime: "Hora actual",
  timezone: "Zona horaria",
  loading: "cargando...",

  // Sliders
  year: "Año",
  month: "Mes",
  day: "Día",
  hour: "Hora",
  minute: "Minuto",

  // Buttons
  applyBtn: "Aplicar hora personalizada",
  applying: "Aplicando...",
  restoreBtn: "Restaurar hora sincronizada",
  restoring: "Restaurando...",

  // Guide
  showGuide: "Guía de uso",
  hideGuide: "Ocultar guía",
  guideIntro:
    "DeckyClocker es una herramienta para establecer una fecha y hora personalizadas en SteamOS. Se puede usar para desbloquear logros, acceder a contenido por tiempo limitado o probar software que depende del reloj del sistema. No está pensada para un uso prolongado: restaura el reloj sincronizado después de usarla. Úsala bajo tu propia responsabilidad. El autor no se hace responsable de los problemas que puedan surgir de su uso.",
  guideUsage:
    "Usa los controles deslizantes de abajo para elegir fecha y hora, y pulsa «Aplicar hora personalizada». Al terminar, pulsa «Restaurar hora sincronizada» para volver al reloj del sistema.",
  guideNoteTitle: "Ten en cuenta:",
  guideNote: "La hora personalizada puede tardar un momento en mostrarse en la interfaz de Steam.",
  warning:
    "Un reloj muy desajustado puede afectar a los inicios de sesión de Steam, las descargas y las conexiones HTTPS. Usa «Restaurar hora sincronizada» arriba para solucionarlo.",
};

const dutch: Dict = {
  // Toasts
  applied: "Aangepaste tijd toegepast",
  customFailed: "Aangepaste tijd instellen mislukt",
  syncRestored: "Gesynchroniseerde tijd hersteld",
  syncPending: "Automatische tijd staat aan, maar is nog niet gesynchroniseerd. Controleer of de Deck online is.",
  syncFailed: "Synchronisatie mislukt",
  readFailed: "Tijdstatus kon niet worden gelezen",
  criticalError: "Kritieke fout",

  // Sections and status rows
  sectionCurrent: "Huidige instellingen",
  sectionCustom: "Tijd aanpassen",
  systemClock: "Systeemklok",
  clockUnknown: "Onbekend",
  clockCustom: "Aangepast",
  clockWaiting: "Wachten op synchronisatie",
  clockSynced: "Gesynchroniseerd",
  deviceTime: "Apparaattijd",
  timezone: "Tijdzone",
  loading: "laden...",

  // Sliders
  year: "Jaar",
  month: "Maand",
  day: "Dag",
  hour: "Uur",
  minute: "Minuut",

  // Buttons
  applyBtn: "Aangepaste tijd toepassen",
  applying: "Toepassen...",
  restoreBtn: "Synchronisatie herstellen",
  restoring: "Herstellen...",

  // Guide
  showGuide: "Gebruikershandleiding",
  hideGuide: "Handleiding verbergen",
  guideIntro:
    "DeckyClocker is een hulpmiddel om op SteamOS een aangepaste datum en tijd in te stellen. Je kunt het gebruiken om prestaties te ontgrendelen, toegang te krijgen tot tijdelijke content of software te testen die van de systeemklok afhangt. Het is niet bedoeld voor langdurig gebruik: herstel na gebruik de gesynchroniseerde systeemklok. Gebruik op eigen risico. De auteur is niet verantwoordelijk voor problemen die uit het gebruik voortvloeien.",
  guideUsage:
    "Kies met de schuifregelaars hieronder een datum en tijd en druk op “Aangepaste tijd toepassen”. Druk daarna op “Synchronisatie herstellen” om terug te keren naar de systeemklok.",
  guideNoteTitle: "Let op:",
  guideNote: "Het kan even duren voordat de aangepaste tijd in de Steam-interface verschijnt.",
  warning:
    "Een sterk afwijkende klok kan Steam-aanmeldingen, downloads en HTTPS-verbindingen verstoren. Gebruik hierboven “Synchronisatie herstellen” om dit op te lossen.",
};

// Keyed by Steam's locale names. Add more here as translations arrive.
const dictionaries: Record<string, Dict> = {
    schinese,
    tchinese,
    french,
    italian,
    german,
    spanish,
    latam: spanish, // Latin American Spanish reuses the Spanish dictionary for now
    dutch,
 };

// Testing aid: forces a language regardless of Steam's setting. null = follow Steam.
let override: string | null = null;

// Picks the first of Steam's preferred locales that we have a dictionary for.
// Read on every call, so a language change in Steam applies without a reload.
const activeDict = (): Dict => {
  if (override !== null) return dictionaries[override] ?? {}; // {} = English
  try {
    const locales: unknown = (window as any).LocalizationManager?.m_rgLocalesToUse;
    if (Array.isArray(locales)) {
      for (const l of locales) {
        if (typeof l === "string" && dictionaries[l]) return dictionaries[l];
      }
    }
  } catch {
    // Internal Steam API unavailable: fall through to English.
  }
  return {};
};

// Translate a key: current language first, then English.
export const t = (key: Key): string => activeDict()[key] ?? english[key];

// Codes the test button cycles through: follow Steam, English, then every dictionary.
export const languageCodes: string[] = ["auto", "english", ...Object.keys(dictionaries)];
export const getLanguageOverride = (): string => override ?? "auto";
export const setLanguageOverride = (code: string) => {
  override = code === "auto" ? null : code;
};