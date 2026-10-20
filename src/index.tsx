import { callable, definePlugin, toaster } from "@decky/api";
import { PanelSection, PanelSectionRow, ButtonItem, SliderField, Field } from "@decky/ui";
import { useEffect, useRef, useState } from "react";
import { TbClockCog, TbChevronDown, TbChevronUp } from "react-icons/tb";
import { t, languageCodes, getLanguageOverride, setLanguageOverride } from "./i18n";

// ---- Tunable timings (milliseconds) ----
// Buttons stay locked this long after an operation finishes, so they don't flicker back mid-operation.
const COOLDOWN_MS = 1000;
// After Restore, re-check the clock this often until it reports synchronised...
const SYNC_POLL_INTERVAL_MS = 1000;
// ...for at most this many checks (interval x attempts = the longest the buttons stay locked waiting).
const SYNC_POLL_ATTEMPTS = 10;

// Testing aid: shows a button that cycles the panel language. Set to false before publishing.
const DEV_LANGUAGE_SWITCHER = false;

type Result = { ok: boolean; error: string };
// ntp is the NTP state after the call, or null if the backend couldn't determine it.
type TimeResult = { ok: boolean; error: string; ntp: boolean | null };
// ntp = automatic time is enabled (the setting). synced = the clock has actually synchronised with a time server.
type Status = { ok: boolean; error: string; ntp: boolean; synced: boolean; timezone: string; now: string };
// Which operation currently holds the lock (null = idle).
type BusyKind = "apply" | "restore" | null;

// Backend calls. These names *MUST* match the method names in main.py *EXACTLY*.
const getStatus = callable<[], Status>("get_status");
const setTime = callable<[string], TimeResult>("set_time");
const setNtp = callable<[boolean], Result>("set_ntp");

// Day 0 of the next month is the last day of this one (m is 1-based), so this handles 28/29/30/31 and leap years.
const daysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
const pad = (n: number) => String(n).padStart(2, "0");
// Use "YYYY-MM-DD HH:MM:SS" for Date & Time layout.
const formatTime = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
// Truncates long error text, Toasts cut off long messages.
const short = (s: string) => (s.length > 80 ? s.slice(0, 77) + "..." : s);
const notify = (body: string) => toaster.toast({ title: "DeckyClocker", body });
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function Content() {
  // Placeholder values. Replaced by loadStatus().
  const initial = new Date();
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth() + 1);
  const [day, setDay] = useState(initial.getDate());
  const [hour, setHour] = useState(initial.getHours());
  const [minute, setMinute] = useState(initial.getMinutes());
  const [ntp, setNtpState] = useState<boolean | null>(null); // null = not known yet or read failed
  const [synced, setSynced] = useState(false);               // only meaningful when ntp is true
  const [timezone, setTimezone] = useState("");
  const [loading, setLoading] = useState(true);
  const [deviceNow, setDeviceNow] = useState(new Date());
  const [showInfo, setShowInfo] = useState(false);
  const [busy, setBusy] = useState<BusyKind>(null); // which button was pressed; drives disabled state and labels
  const busyRef = useRef(false);                    // the real lock, because state updates are async
  const [langCode, setLangCode] = useState(getLanguageOverride());

  // Reads NTP state, sync state, timezone and time from the backend.
  // sliders: also move the sliders to the Deck's current time (default true).
  // quiet:   suppress the error toast (used while polling).
  // Returns true only if automatic time is on AND the clock has synchronised.
  const loadStatus = async (opts: { sliders?: boolean; quiet?: boolean } = {}): Promise<boolean> => {
    const { sliders = true, quiet = false } = opts;
    try {
      const s = await getStatus();
      console.log("get_status result:", s);
      if (!s.ok) {
        setNtpState(null);
        setSynced(false);
        if (!quiet) notify(short(s.error || t("readFailed")));
        return false;
      }
      setNtpState(s.ntp);
      setSynced(s.synced);
      setTimezone(s.timezone);
      if (sliders) {
        // Backend sends "YYYY-MM-DD HH:MM:SS"; seconds aren't used in the Slider UI (they are shown in Device Time though).
        const m = s.now.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/);
        if (m) {
          setYear(Number(m[1]));
          setMonth(Number(m[2]));
          setDay(Number(m[3]));
          setHour(Number(m[4]));
          setMinute(Number(m[5]));
        }
      }
      return s.ntp && s.synced;
    } catch (e) {
      console.log("get_status threw:", e);
      if (!quiet) notify(t("readFailed"));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load real status once when the panel opens.
  useEffect(() => {
    loadStatus();
  }, []);

  // Tick the displayed clock every second. Frontend only, no backend calls.
  useEffect(() => {
    const id = setInterval(() => setDeviceNow(new Date()), 1000);
    return () => clearInterval(id); // stop ticking when the panel closes
  }, []);

  // Changing year or month can make the current day invalid (e.g. 31-JAN -> 31-FEB, or 29-FEB in leap year -> 29-FEB in a non-leap year), so reduce the day down to the new month's length.
  const changeYear = (v: number) => {
    setYear(v);
    setDay((d) => Math.min(d, daysInMonth(v, month)));
  };

  const changeMonth = (v: number) => {
    setMonth(v);
    setDay((d) => Math.min(d, daysInMonth(year, v)));
  };

  // Runs one backend operation at a time. A second press while one is in flight
  // (or cooling down) is ignored. "kind" records which button was pressed.
  const runExclusive = async (kind: Exclude<BusyKind, null>, fn: () => Promise<void>) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(kind);
    try {
      await fn();
    } finally {
      // Release only after the cooldown, so the buttons don't flicker back mid-operation.
      setTimeout(() => {
        busyRef.current = false;
        setBusy(null);
      }, COOLDOWN_MS);
    }
  };

  // Turns automatic time (NTP) on, then waits for the clock to actually synchronise.
  // Used by "Restore Synchronized Time". notify(STRING) populates the post-action Toast.
  const applyNtp = (enabled: boolean) =>
    runExclusive("restore", async () => {
      try {
        const result = await setNtp(enabled);
        console.log("set_ntp result:", result);
        if (result.ok) {
          setNtpState(enabled);
          setSynced(false); // unknown until the poll reads it
          if (enabled) {
            // Re-poll until synced or out of attempts. The lock holds throughout.
            let isSynced = false;
            for (let i = 0; i < SYNC_POLL_ATTEMPTS && !isSynced; i++) {
              await sleep(SYNC_POLL_INTERVAL_MS);
              isSynced = await loadStatus({ sliders: false, quiet: true });
            }
            await loadStatus({ quiet: true }); // one final read, this time moving the sliders to the corrected time
            notify(isSynced ? t("syncRestored") : t("syncPending"));
          }
        } else {
          notify(short(result.error || t("syncFailed")));
        }
      } catch (e) {
        console.log("set_ntp threw:", e);
        notify(`${t("criticalError")}: e001`); // e001 = set_ntp call threw (backend unreachable or crashed)
      }
    });

  // Sends the slider values to the backend in "YYYY-MM-DD HH:MM:00" format. NTP not sent as backend disables that first.
  const applyTime = () =>
    runExclusive("apply", async () => {
      // Final safeguard against invalid date value.
      const safeDay = Math.min(day, daysInMonth(year, month));
      const value = `${year}-${pad(month)}-${pad(safeDay)} ${pad(hour)}:${pad(minute)}:00`;
      console.log("Applying time:", value);
      try {
        const result = await setTime(value);
        console.log("set_time result:", result);
        // The backend reports the real NTP state after the call (and rolls it back
        // on failure), so the System Clock row can't disagree with reality.
        if (result.ntp !== null) setNtpState(result.ntp);
        if (result.ok) {
          notify(t("applied"));
        } else {
          notify(short(result.error || t("customFailed")));
        }
      } catch (e) {
        console.log("set_time threw:", e);
        notify(`${t("criticalError")}: e002`); // e002 = set_time call threw (backend unreachable or crashed)
      }
    });

  return (
    <>
      {/* Collapsible User Guide section. The guide is hidden by default, and can be toggled with the "User Guide" button. */}
      <PanelSection>
        <PanelSectionRow>
          <div style={{ height: ".8px", background: "rgba(255, 255, 255, 0.15)" }} />
        </PanelSectionRow>
        <PanelSectionRow>
          <Field
            focusable
            onActivate={() => setShowInfo((v) => !v)}
            onClick={() => setShowInfo((v) => !v)}
            label={showInfo ? t("hideGuide") : t("showGuide")}
            //bottomSeparator="none" //UI choice
          >
            {showInfo ? <TbChevronUp /> : <TbChevronDown />}
          </Field>
        </PanelSectionRow>
        {showInfo && (
          <>
            <PanelSectionRow>
              <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
                {t("guideIntro")}
                <br />
                <br />
                {t("guideUsage")}
                <br />
                <br />
                <strong>{t("guideNoteTitle")}</strong>
                <br />
                {t("guideNote")}
              </div>
            </PanelSectionRow>
          </>
        )}
      </PanelSection>
      {/* Always visible section */}
      <PanelSection title={t("sectionCurrent")}>
        <PanelSectionRow>
          <div style={{ fontSize: "14px" }}>
            {/* Current System Clock Synchronization Status.
            Four states: Unknown (read failed), Custom (NTP off), Waiting for sync (NTP on, not yet synced), Synchronized. */}
            {t("systemClock")}: <strong>{
              ntp === null ? t("clockUnknown")
              : !ntp ? t("clockCustom")
              : synced ? t("clockSynced")
              : t("clockWaiting")
            }</strong>
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          <div style={{ fontSize: "14px" }}>
            {/* Current Device Time */}
            {t("deviceTime")}: <strong>{formatTime(deviceNow)}</strong>
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          <div
            style={{
              fontSize: "14px",
              borderBottom: ".8px solid rgba(255, 255, 255, 0.15)",
              paddingBottom: "8px",
            }}
          >
            {t("timezone")}: <strong>{timezone || t("loading")}</strong>
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          {/* This button restores the synchronized time */}
          <ButtonItem layout="below" disabled={busy !== null} onClick={() => applyNtp(true)}>
            {busy === "restore" ? t("restoring") : t("restoreBtn")}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
      <PanelSection title={t("sectionCustom")}>
        <PanelSectionRow>
          {/* Year Slider, 2003 -> 2040.
          Earliest game I could find complaints regarding was MLB2K12.
          Could be earlier if necessary.
          Look at free input or a stepper if range increases */}
          <SliderField label={t("year")} value={year} min={2003} max={2040} step={1} showValue onChange={changeYear} />
        </PanelSectionRow>
        <PanelSectionRow>
          {/* Month Slider */}
          <SliderField label={t("month")} value={month} min={1} max={12} step={1} showValue onChange={changeMonth} />
        </PanelSectionRow>
        <PanelSectionRow>
          {/* Day Slider, max value is the number of days in the selected month that year */}
          <SliderField
            label={t("day")}
            value={Math.min(day, daysInMonth(year, month))}
            min={1}
            max={daysInMonth(year, month)}
            step={1}
            showValue
            onChange={setDay}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          {/* Hour Slider */}
          <SliderField label={t("hour")} value={hour} min={0} max={23} step={1} showValue onChange={setHour} />
        </PanelSectionRow>
        <PanelSectionRow>
          {/* Minute Slider */}
          <SliderField label={t("minute")} value={minute} min={0} max={59} step={1} showValue onChange={setMinute} />
        </PanelSectionRow>
        <PanelSectionRow>
          {/* This button applies the custom time input by the user.
          Both buttons are disabled while busy; only the pressed one shows its in-progress text. */}
          <ButtonItem layout="below" disabled={loading || busy !== null} onClick={applyTime}>
            {busy === "apply" ? t("applying") : t("applyBtn")}
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <div style={{ height: "4px" }} />
        </PanelSectionRow>
        <PanelSectionRow>
          {/* User warning */}
          <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
            {t("warning")}
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          <div style={{ height: "4px" }} />
        </PanelSectionRow>
        <PanelSectionRow>
          {/* A cheeky wee credit, if you're in here adding things you BETTER be adding yourself to this too! */}
          <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
            Developed with ❤️ by Jack and nanwangjkl.
          </div>
        </PanelSectionRow>
        {/* Dev only: cycles the panel language for testing. Set DEV_LANGUAGE_SWITCHER to false before publishing. */}
        {DEV_LANGUAGE_SWITCHER && (
          <PanelSectionRow>
            <ButtonItem
              layout="below"
              onClick={() => {
                const next = languageCodes[(languageCodes.indexOf(langCode) + 1) % languageCodes.length];
                setLanguageOverride(next);
                setLangCode(next);
              }}
            >
              {`Test language: ${langCode}`}
            </ButtonItem>
          </PanelSectionRow>
        )}
      </PanelSection>
    </>
  );
}

// This is the plugin definition. It tells Decky Loader what to display in the plugin panel, and what icon to use.
export default definePlugin(() => ({
  name: "DeckyClocker",
  content: <Content />,
  icon: <TbClockCog />,
}));