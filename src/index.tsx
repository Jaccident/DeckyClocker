import { callable, definePlugin, toaster } from "@decky/api";
import { PanelSection, PanelSectionRow, ButtonItem, SliderField, ToggleField, Field } from "@decky/ui";
import { useEffect, useState } from "react";
import { TbClockCog, TbChevronDown, TbChevronUp } from "react-icons/tb";

type Result = { ok: boolean; error: string };
type Status = { ntp: boolean; timezone: string; now: string };

const getStatus = callable<[], Status>("get_status");
const setTime = callable<[string], Result>("set_time");
const setNtp = callable<[boolean], Result>("set_ntp");

const daysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();
const pad = (n: number) => String(n).padStart(2, "0");
const formatTime = (t: Date) =>
  `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())} ${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`;
const short = (s: string) => (s.length > 80 ? s.slice(0, 77) + "..." : s);
const notify = (body: string) => toaster.toast({ title: "DeckyClocker", body });

function Content() {
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

  const loadStatus = async () => {
    try {
      const s = await getStatus();
      console.log("get_status result:", s);
      setNtpState(s.ntp);
      setTimezone(s.timezone);
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

  useEffect(() => {
    loadStatus();
  }, []);

useEffect(() => {
  const id = setInterval(() => setDeviceNow(new Date()), 1000);
  return () => clearInterval(id); // stop ticking when the panel closes
}, []);

  const changeYear = (v: number) => {
    setYear(v);
    setDay((d) => Math.min(d, daysInMonth(v, month)));
  };

  const changeMonth = (v: number) => {
    setMonth(v);
    setDay((d) => Math.min(d, daysInMonth(year, v)));
  };

  const applyNtp = async (enabled: boolean) => {
    try {
      const result = await setNtp(enabled);
      console.log("set_ntp result:", result);
      if (result.ok) {
        setNtpState(enabled);
        if (enabled) {
          notify("Automatic time restored");
          setTimeout(loadStatus, 3000); // give NTP a moment to sync, then refresh
        }
      } else {
        notify(short(result.error || "Failed to change automatic time"));
      }
    } catch (e) {
      console.log("set_ntp threw:", e);
      notify("Backend call failed");
    }
  };

  const applyTime = async () => {
    const safeDay = Math.min(day, daysInMonth(year, month));
    const value = `${year}-${pad(month)}-${pad(safeDay)} ${pad(hour)}:${pad(minute)}:00`;
    console.log("Applying time:", value);
    try {
      const result = await setTime(value);
      console.log("set_time result:", result);
      if (result.ok) {
        setNtpState(false);
        notify("Time set successfully");
      } else {
        notify(short(result.error || "Failed to set time"));
      }
    } catch (e) {
      console.log("set_time threw:", e);
      notify("Backend call failed");
    }
  };

  return (
    <>
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

      <PanelSection title={"Date & Time"}>
        <PanelSectionRow>
          <div style={{ fontSize: "14px" }}>
             System Clock: <strong>{ntp ? "Synchronized" : "Custom"}</strong>
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          <div style={{ fontSize: "14px" }}>
            Device Time: <strong>{formatTime(deviceNow)}</strong>
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          <div style={{ height: "4px" }} />
        </PanelSectionRow>
        <PanelSectionRow>
          <SliderField label="Year" value={year} min={2020} max={2040} step={1} showValue onChange={changeYear} />
        </PanelSectionRow>
        <PanelSectionRow>
          <SliderField label="Month" value={month} min={1} max={12} step={1} showValue onChange={changeMonth} />
        </PanelSectionRow>
        <PanelSectionRow>
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
          <SliderField label="Hour" value={hour} min={0} max={23} step={1} showValue onChange={setHour} />
        </PanelSectionRow>
        <PanelSectionRow>
          <SliderField label="Minute" value={minute} min={0} max={59} step={1} showValue onChange={setMinute} />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="below" disabled={loading} onClick={applyTime}>
            Apply Custom Time
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={() => applyNtp(true)}>
            Restore Synchronized Time
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
            A very out of sync clock can impact Steam logins, downloads, and HTTPS connections.
            Use "Restore Synchronized Time" above to fix it.
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          <div style={{ height: "8px" }} />
        </PanelSectionRow>
        <PanelSectionRow>
          <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
            Developed with ❤️ by Jack
          </div>
        </PanelSectionRow>
      </PanelSection>
    </>
  );
}

export default definePlugin(() => ({
  name: "DeckyClocker",
  content: <Content />,
  icon: <TbClockCog />,
}));