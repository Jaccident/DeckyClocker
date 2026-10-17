# DeckyClocker

## About DeckyClocker
DeckyClocker is a small plugin for DeckyLoader that makes spoofing your system time on SteamOS possible, enabling access to time locked content and achievements in games. 
It allows users the freedom to override the system clock to be whatever they need it to be, and resynchronise it with one button press.

## How DeckyClocker Works
DeckyClocker modifies the system clock via timedatectl, this is not per-title time, but the whole system at once. It won't impact your gamespeed, or anything else. To do this it requires Root permission to run.

## Notes and Risks
- DeckyClocker was developed to aid in very specific use cases, it's not generally recommended for longterm use. Additionally a system clock set to a very different time to Steam's servers can pose issues with a number of core OS functions, so it's recommended users Synchronize their clock again after use, and if they ever encounter unexpected behaviour with Steam servers.
- To avoid major issues with custom time being stuck on, and the plugin preventing the Deck from reaching Steam servers, I have made the decision to make the the plugin fail off. What this means for you it that if Decky reloads, the plugin is unloaded/uninstalled, or the Deck restarts.
- Any bit of software asking for Root permission is a risk, not only because the author might be a bad actor, but because Root permission allows malformed code to make mistakes in your system that can be hard to repair. Every effort has been taken to make sure each action DeckyClocker takes is safe, but like with any othe software requesting Root permission, procede with caution!

## Developer
I'm just a retired game developer with an itch to see Fez through to the end one more time, and a fag packet calculation that put the "once a week" event happening at a deeply unsociable hour.

This plugin was developed with love, and provided without warranty ❤️