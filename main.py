import asyncio
import re

TIME_RE = re.compile(r"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$")

class Plugin:
    async def _run(self, *args):
        proc = await asyncio.create_subprocess_exec(
            *args,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        out, err = await proc.communicate()
        return proc.returncode, out.decode().strip(), err.decode().strip()

    async def get_status(self):
        _, out, _ = await self._run(
            "timedatectl", "show", "-p", "NTP", "-p", "TimeUSec", "-p", "Timezone"
        )
        return out

    async def set_ntp(self, enabled: bool):
        code, _, err = await self._run("timedatectl", "set-ntp", "true" if enabled else "false")
        return {"ok": code == 0, "error": err}

    async def set_time(self, value: str):
        if not TIME_RE.match(value):
            return {"ok": False, "error": "Invalid format"}
        await self._run("timedatectl", "set-ntp", "false")
        code, _, err = await self._run("timedatectl", "set-time", value)
        return {"ok": code == 0, "error": err}

    async def _main(self):
        pass

    async def _unload(self):
        pass