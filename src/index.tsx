import { callable, definePlugin, toaster } from "@decky/api";
import { PanelSection, PanelSectionRow, ButtonItem, SliderField, Field } from "@decky/ui";
import { useEffect, useState } from "react";
import { TbClockCog, TbChevronDown, TbChevronUp } from "react-icons/tb";

type Result = { ok: boolean; error: string };
type Status = { ntp: boolean; timezone: string; now: string };

// Backend calls. These names *MUST* match the method names in main.py *EXACTLY*.
const getStatus = callable<[], Status>("get_status");
const setTime = callable<[string], Result>("set_time");
const setNtp = callable<[boolean], Result>("set_ntp");

// Day 0 of the next month is the last day of this one (m is 1-based), so this handles 28/29/30/31 and leap years.
const daysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
const pad = (n: number) => String(n).padStart(2, "0");
// Use "YYYY-MM-DD HH:MM:SS" for Date & Time layout.
const formatTime = (t: Date) =>
  `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())} ${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`;
// Truncates long error text, Toasts cut off long messages.
const short = (s: string) => (s.length > 80 ? s.slice(0, 77) + "..." : s);
const notify = (body: string) => toaster.toast({ title: "DeckyClocker", body });

function Content() {
  // Placeholder values. Replaced by loadStatus().
  const initial = new Date();
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth() + 1);
  const [day, setDay] = useState(initial.getDate());
  const [hour, setHour] = useState(initial.getHours());
  const [minute, setMinute] = useState(initial.getMinutes());
  const [ntp, setNtpState] = useState(true);
  const [timezone, setTimezone] = useState("");
  const [loading, setLoading] = useState(true);
  const [deviceNow, setDeviceNow] = useState(new Date());
  const [showInfo, setShowInfo] = useState(false);

  // Reads the Deck's current NTP state (synchronisation to server), timezone, and time from the backend and syncs the sliders to it, so the panel doesn't show stale data from previous user sessions.
  const loadStatus = async () => {
    try {
      const s = await getStatus();
      console.log("get_status result:", s);
      setNtpState(s.ntp);
      setTimezone(s.timezone);
      // Backend sends "YYYY-MM-DD HH:MM:SS"; seconds aren't used in the Slider UI (they are shown in Device Time though).
      const m = s.now.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/);
      if (m) {
        setYear(Number(m[1]));
        setMonth(Number(m[2]));
        setDay(Number(m[3]));
        setHour(Number(m[4]));
        setMinute(Number(m[5]));
      }
    } catch (e) {
      console.log("get_status threw:", e);
      notify("Could not read time status");
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

  // Turns automatic time (NTP) on. Used by "Restore Synchronized Time" UI elements
  // in notify(STRING), STRING is used to populate the post-action Toast.
  const applyNtp = async (enabled: boolean) => {
    try {
      const result = await setNtp(enabled);
      console.log("set_ntp result:", result);
      if (result.ok) {
        setNtpState(enabled);
        if (enabled) {
          notify("Synchronized device time restored");
          setTimeout(loadStatus, 3000); // give NTP a moment to sync, then refresh
        }
      } else {
        notify(short(result.error || "Synchronization failed"));
      }
    } catch (e) {
      console.log("set_ntp threw:", e);
      notify("Critical Error: e001"); // e001 = set_ntp call threw (backend unreachable or crashed)
    }
  };

  // Sends the slider values to the backend in "YYYY-MM-DD HH:MM:00" format. NTP not sent as backend disables that first.
  const applyTime = async () => {
    // Final safeguard against invalid date value.
    const safeDay = Math.min(day, daysInMonth(year, month));
    const value = `${year}-${pad(month)}-${pad(safeDay)} ${pad(hour)}:${pad(minute)}:00`;
    console.log("Applying time:", value);
    try {
      const result = await setTime(value);
      console.log("set_time result:", result);
      if (result.ok) {
        setNtpState(false);
        notify("Custom device time applied");
      } else {
        notify(short(result.error || "Custom time failed"));
      }
    } catch (e) {
      console.log("set_time threw:", e);
      notify("Critical Error: e002"); // e002 = set_time call threw (backend unreachable or crashed)
    }
  };

  return (
    <>
      {/* Collapsible User Guide section. The guide is hidden by default, and can be toggled with the "Show User Guide" button. */}
      <PanelSection>
        <PanelSectionRow>
          <Field
            focusable
            onActivate={() => setShowInfo((v) => !v)}
            onClick={() => setShowInfo((v) => !v)}
            label={showInfo ? "Hide User Guide" : "Show User Guide"}
            bottomSeparator="none"
          >
            {showInfo ? <TbChevronUp /> : <TbChevronDown />}
          </Field>
        </PanelSectionRow>
        {showInfo && (
          <>
            <PanelSectionRow>
              <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
                DeckyClocker is a tool for setting a custom date and time on SteamOS. It can be used to unlock achievements, access time-limited content, or test software that depends on the system clock. It's not intended for long-term use, and you should restore the system clock to a Synchronized state after use. Use this tool at your own risk. The author is not responsible for any issues that may arise from its use.
                <br />
                <br />
                Use the sliders below to select a custom date and time, then click "Apply Custom Time" below to apply it. When you're done, click "Restore Synchronized Time" to return to the system clock.
                <br />
                <br />
                <strong>Please Note:</strong>
                <br />
                It can take a moment for a Custom Time to show on the Steam UI after Applying it.
              </div>
            </PanelSectionRow>
          </>
        )}
      </PanelSection>
      {/* Always visible section */}
      <PanelSection title={"Date & Time"}>
        <PanelSectionRow>
          <div style={{ fontSize: "14px" }}>
            {/* Current System Clock Synchronization Status */}
             System Clock: <strong>{ntp ? "Synchronized" : "Custom"}</strong>
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          <div style={{ fontSize: "14px" }}>
            {/* Current Device Time */}
            Device Time: <strong>{formatTime(deviceNow)}</strong>
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          <div style={{ fontSize: "14px" }}>
            {/* Current Timezone (this could be removed, it's informational.
            If removed also remove the corresponding state variable, and setTimezone(s.timezone) in loadStatus to avoid warning) */}
            Timezone: <strong>{timezone || "loading..."}</strong>
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          <div style={{ height: "4px" }} />
        </PanelSectionRow>
        <PanelSectionRow>
          {/* Year Slider, 2010 -> 2040.
          Earliest game I could find complaints regarding was MLB2K12.
          Could be earlier if necessary.
          Look at free input or a stepper if range increases */}
          <SliderField label="Year" value={year} min={2010} max={2040} step={1} showValue onChange={changeYear} />
        </PanelSectionRow>
        <PanelSectionRow>
          {/* Month Slider */}
          <SliderField label="Month" value={month} min={1} max={12} step={1} showValue onChange={changeMonth} />
        </PanelSectionRow>
        <PanelSectionRow>
          {/* Day Slider, max value is the number of days in the selected month that year */}
          <SliderField
            label="Day"
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
          <SliderField label="Hour" value={hour} min={0} max={23} step={1} showValue onChange={setHour} />
        </PanelSectionRow>
        <PanelSectionRow>
          {/* Minute Slider */}
          <SliderField label="Minute" value={minute} min={0} max={59} step={1} showValue onChange={setMinute} />
        </PanelSectionRow>
        <PanelSectionRow>
          {/* This button applies the custom time input by the user */}
          <ButtonItem layout="below" disabled={loading} onClick={applyTime}>
            Apply Custom Time
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          {/* This button restores the synchronized time */}
          <ButtonItem layout="below" onClick={() => applyNtp(true)}>
            Restore Synchronized Time
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          {/* User warning */}
          <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
            A very out of sync clock can impact Steam logins, downloads, and HTTPS connections.
            Use "Restore Synchronized Time" above to fix it.
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          <div style={{ height: "8px" }} />
        </PanelSectionRow>
        <PanelSectionRow>
          {/* A cheely wee credit, if you're in here adding things you BETTER be adding yourself to this too! */}
          <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
            Developed with ❤️ by Jack
          </div>
        </PanelSectionRow>
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