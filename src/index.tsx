import { callable, definePlugin } from "@decky/api";
import { PanelSection, PanelSectionRow, ButtonItem, SliderField, ToggleField } from "@decky/ui";
import { useState } from "react";
import { TbClockCog } from "react-icons/tb";

const setTime = callable<[string], { ok: boolean; error: string }>("set_time");
const setNtp = callable<[boolean], { ok: boolean; error: string }>("set_ntp");

function Content() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [day, setDay] = useState(now.getDate());
  const [hour, setHour] = useState(now.getHours());
  const [minute, setMinute] = useState(now.getMinutes());
  const [ntp, setNtpState] = useState(true);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <PanelSection title="Date & Time">
      <PanelSectionRow>
        <ToggleField label="Automatic time (NTP)" checked={ntp}
          onChange={async (v) => { setNtpState(v); await setNtp(v); }} />
      </PanelSectionRow>
      <PanelSectionRow><SliderField label="Year" value={year} min={2020} max={2040} step={1} showValue onChange={setYear} /></PanelSectionRow>
      <PanelSectionRow><SliderField label="Month" value={month} min={1} max={12} step={1} showValue onChange={setMonth} /></PanelSectionRow>
      <PanelSectionRow><SliderField label="Day" value={day} min={1} max={31} step={1} showValue onChange={setDay} /></PanelSectionRow>
      <PanelSectionRow><SliderField label="Hour" value={hour} min={0} max={23} step={1} showValue onChange={setHour} /></PanelSectionRow>
      <PanelSectionRow><SliderField label="Minute" value={minute} min={0} max={59} step={1} showValue onChange={setMinute} /></PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={async () => {
          setNtpState(false);
          await setTime(`${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:00`);
        }}>Apply</ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
}

export default definePlugin(() => ({
  name: "DeckyClocker",
  content: <Content />,
  icon: <TbClockCog />,
}));