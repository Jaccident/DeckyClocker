import asyncio
import os
import re

# Accepts only "YYYY-MM-DD HH:MM:SS".
# As the plugin runs as root, this regex ensures only compliantly shaped inputs reach timedatectl.
# It checks the shape only; timedatectl itself rejects impossible dates (e.g. 2026-02-30).
# It does not validate that input won't cause a system error (tested year bounds are set in Frontend).
TIME_RE = re.compile(r"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$")

def _clean_env():
    # Decky Loader is a PyInstaller bundle.
    # It points LD_LIBRARY_PATH at its own bundled libraries, and child processes inherit that.
    # Without a cleanup, timedatectl loads Decky's libcrypto instead of the system one and fails.
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

    # This is called on plugin load, unload, and uninstall to ensure the system is left in a Synchronized state.
    async def _restore_ntp(self):
        try:
            await self._run("timedatectl", "set-ntp", "true")
        except Exception:
            pass  # never let cleanup raise

    async def get_status(self):
        """Return {"ok": bool, "error": str, "ntp": bool, "timezone": str, "now": str}.

        On failure, ok is False and error explains why, so the frontend can show
        an "unknown" state instead of guessing.
        """
        code, out, err = await self._run("timedatectl", "show", "-p", "NTP", "-p", "Timezone")
        if code != 0:
            return {"ok": False, "error": err or "timedatectl failed", "ntp": False, "timezone": "", "now": ""}
        # timedatectl show prints "KEY=value" lines; split each on the first "=".
        info = dict(line.split("=", 1) for line in out.splitlines() if "=" in line)
        if "NTP" not in info:
            return {"ok": False, "error": "Unexpected timedatectl output", "ntp": False, "timezone": "", "now": ""}
        # "date" gives local time in the system timezone, matching what set_time interprets.
        code, now, err = await self._run("date", "+%Y-%m-%d %H:%M:%S")
        if code != 0:
            return {"ok": False, "error": err or "date failed", "ntp": False, "timezone": "", "now": ""}
        return {
            "ok": True,
            "error": "",
            "ntp": info["NTP"] == "yes",
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


    #The following three functions are called on plugin load, unload, and uninstall to ensure the system is left in a Synchronized state.
    #These are a safeguard against the user disabling NTP and leaving the system in an unsynchronized state after the plugin is removed, or Decky Loader is restarted.
    #These should not be removed without being replaced without a similar safeguard.
    
    #Runs on Reboot as "set-ntp false" can survive.
    async def _main(self):
        await self._restore_ntp()

    #Runs when the plugin is disabled, reloaded, or the loader restarts.
    async def _unload(self):
        await self._restore_ntp()

    # Runs when the plugin is removed (explicit inclusion).
    # Not every Decky version will call this; _unload (above) still runs when the plugin stops. 
    async def _uninstall(self):
        await self._restore_ntp()