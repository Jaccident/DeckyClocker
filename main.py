import asyncio
import os
import re

TIME_RE = re.compile(r"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$")

def _clean_env():
    env = os.environ.copy()
    for var in ("LD_LIBRARY_PATH", "LD_PRELOAD"):
        orig = env.pop(var + "_ORIG", None)
        if orig is not None:
            env[var] = orig
        else:
            env.pop(var, None)
    return env

class Plugin:
    async def _run(self, *args):
        proc = await asyncio.create_subprocess_exec(
            *args,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=_clean_env(),
        )
        out, err = await proc.communicate()
        return proc.returncode, out.decode().strip(), err.decode().strip()

    async def _restore_ntp(self):
        try:
            await self._run("timedatectl", "set-ntp", "true")
        except Exception:
            pass  # never let cleanup raise

    async def get_status(self):
        _, out, _ = await self._run("timedatectl", "show", "-p", "NTP", "-p", "Timezone")
        info = dict(line.split("=", 1) for line in out.splitlines() if "=" in line)
        _, now, _ = await self._run("date", "+%Y-%m-%d %H:%M:%S")
        return {
            "ntp": info.get("NTP") == "yes",
            "timezone": info.get("Timezone", ""),
            "now": now,
        }

    async def set_ntp(self, enabled: bool):
        code, _, err = await self._run("timedatectl", "set-ntp", "true" if enabled else "false")
        return {"ok": code == 0, "error": err}

    async def set_time(self, value: str):
        if not TIME_RE.match(value):
            return {"ok": False, "error": "Invalid format"}
        code, _, err = await self._run("timedatectl", "set-ntp", "false")
        if code != 0:
            return {"ok": False, "error": err or "Could not disable automatic time"}
        code, _, err = await self._run("timedatectl", "set-time", value)
        return {"ok": code == 0, "error": err}

    async def _main(self):
        # Safety net: if a previous session left NTP off (e.g. across a reboot),
        # start synchronized.
        await self._restore_ntp()

    async def _unload(self):
        await self._restore_ntp()

    async def _uninstall(self):
        await self._restore_ntp()