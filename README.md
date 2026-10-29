# Ridgeline RC

An original top-down off-road RC truck racing game. You race three rival trucks over four tracks in the Appalachian hills and need to watch for oil slicks, loose wheels bouncing across the road, boost pads and wooden ramps that jump a mud pit.

- **Source:** `index.html`. This is a single file with no build step and no dependencies apart from two Google Fonts. It holds all the art (drawn on a canvas), the music and sound effects (made with Web Audio) and the announcer (the system's text-to-speech voice). The desktop apps are built from it.
- **Download:** the macOS `.dmg` and Windows `.zip` are on the [Releases page](https://github.com/git-cgallagher/ridgeline-rc/releases). To build them yourself, see [Desktop builds](#desktop-builds).
- **License:** MIT. Security reports go through the private advisory form (see [SECURITY.md](SECURITY.md)).
- **Originality:** the name, tracks, trucks, drivers, music and announcer lines are all original. Keep it that way: this is a game *in the genre* of 1980s isometric RC racers, not a copy of any of them.

## How to play

| Key | Does |
|---|---|
| ↑ / W | Throttle |
| ↓ / S | Brake, then reverse |
| ← → / A D | Steer |
| X, Space or Shift | Use a nitro (you start each race with 2 and can carry 5) |
| P or Esc | Pause (Resume / Restart / Quit) |
| M | Music on/off |
| Enter | Choose in menus |

A gamepad also works: left stick or D-pad steers, A or RT is throttle, B or LT brakes, X/Y/RB is nitro and Start pauses.

**Modes**
- **Ridgeline Cup:** all four tracks in a row. Points go 10 / 6 / 3 / 1 for 1st to 4th.
- **Single Race:** pick one track and race the three rivals.
- **Time Trial:** just you and the clock, for chasing lap records.

**On the track**
- **Countdown:** the track name, then three red lights and "Go!". Each step gets a beep and an announcer call.
- **Boost pads** (blue chevrons): a short burst of speed.
- **Ramps:** go over one fast enough and you jump the mud pit behind it. Too slow and you land in the mud, which slows you a lot. You can't steer in the air.
- **Oil slicks:** you spin out for a moment.
- **Loose wheels:** a stray tire bounces across the road now and then. Getting hit spins you and costs speed.
- **Nitro cans** (red canisters): +1 nitro. They come back 8 seconds after someone takes one.
- Driving backwards shows **WRONG WAY**, and laps only count going forwards.

| Track | Laps | Notes |
|---|---|---|
| Pine Hollow Loop | 4 | Asphalt in the pines, one jump |
| Copper Creek Switchback | 3 | Dirt road on the farm, two jumps, a hairpin |
| Thunder Ridge Run | 3 | Rocky ridge, two jumps |
| Moonshine Mesa | 3 | Desert at dusk, three jumps, a chicane |

**Difficulty** (in Settings) sets how fast the rivals are: Rookie, Pro (default) or Ace. Rivals speed up a little when they're far behind you and ease off when far ahead.

## Scoreboard (saved between sessions)

- For each track: the **5 fastest races** and the **5 fastest laps**, with initials, difficulty and date (TT = time trial). Beat one and you type in three initials.
- **Cup results:** the best 8 cup finishes.
- **Career:** races, wins, podiums, time trials, laps, cups won, wipeouts, boosts and air time.
- Settings (music, sound effects, announcer, difficulty) are saved too. Settings → Reset scoreboard clears records and career, but keeps settings and your initials.

The save is the page's `localStorage` (key `ridgeline-rc-save-v1`). The desktop app keeps it in `~/Library/Application Support/Ridgeline RC/` on a Mac and `%APPDATA%\Ridgeline RC\` on Windows, so it lasts across restarts and app updates. Each computer has its own scoreboard.

## Desktop builds

The Mac and Windows apps use Electron to wrap the same game. They work offline because the fonts are bundled with them. The setup is the same as `keystone-quarry`.

**You need:** macOS (it builds both platforms, and Windows builds don't need Wine) and Node 22+.

```bash
npm ci              # installs Electron 44.9.1, @electron/packager and the two font packages
npm start           # runs the game in a desktop window
npm run build:icon  # only when the icon art changes; writes build/icon.icns + build/icon.ico
npm run pack        # builds both platforms (or pack:mac / pack:win)
npm run check       # what CI runs on Linux: builds app/index.html, checks the game script parses and the CSP + fonts are in place
```

| Output | What it is |
|---|---|
| `dist/Ridgeline-RC-mac.dmg` | Universal macOS app (Apple silicon and Intel) for macOS 12 and later |
| `dist/Ridgeline RC-darwin-universal/Ridgeline RC.app` | The same app, not packed |
| `dist/Ridgeline-RC-windows-x64.zip` | Windows 10/11 x64 app folder; run `Ridgeline RC.exe` |

How it fits together:
- `scripts/build-app.js` makes `app/index.html` out of the root `index.html`. It adds a full HTML document and a strict Content Security Policy, and swaps Google Fonts for the bundled `@fontsource` copies. **Never edit `app/` by hand.** To change the game, edit the root `index.html` and run `npm run pack` again.
- `main.js` is the window: sandboxed, with no Node access, no new windows, no navigation and a short menu. It allows audio without a click first; the title screen still waits for a key, which also starts audio in a browser.
- `scripts/make-icon.js` draws the icon (a red RC truck on a dirt track) as 16×16 pixel art.

**CI and releases** (GitHub Actions):
- `ci.yml` runs on every PR and on pushes to `main`. `check` (Ubuntu) runs `npm run check`. `package` (macOS) runs `npm run pack`, then checks the app is universal, ad-hoc signed and in a valid DMG, and that the Windows zip has `Ridgeline RC.exe`. Both are required checks in the `main` ruleset.
- `release.yml` runs when you push a tag `vX.Y.Z`. The tag must match `"version"` in `package.json`. It builds both platforms and publishes a GitHub release with `Ridgeline-RC-X.Y.Z-mac.dmg` and `Ridgeline-RC-X.Y.Z-windows-x64.zip`, using that version's `CHANGELOG.md` section as the notes. To release, bump `version` in `package.json` and `package-lock.json`, add a CHANGELOG section, merge, then `git tag vX.Y.Z && git push origin vX.Y.Z`.
- Actions are pinned to commit SHAs; Dependabot (`.github/dependabot.yml`) updates them monthly.

**To play in a browser** (for a quick test), serve the folder, for example `python3 -m http.server 8765`, and open http://localhost:8765. The Code workspace's `.claude/launch.json` has this as the `ridgeline-rc` preview.

**First launch (the builds are not signed by a publisher):**
- **Mac:** this Mac opens it normally. On other Macs, a downloaded copy gets blocked. Right-click the app and choose **Open**, then **Open** again (on macOS 15+, use **System Settings → Privacy & Security → Open Anyway**).
- **Windows:** SmartScreen shows "Windows protected your PC". Click **More info → Run anyway**.

### ⚠️ Gotchas
- **Ad-hoc sign the Mac app after packaging.** `pack:mac` runs `codesign --force --deep --sign -`, because Apple silicon won't run unsigned code and repackaging breaks Electron's own signature.
- **Pack the `.app` with `hdiutil` or `ditto`, not `zip`.** Electron.framework is full of symlinks, and plain `zip` turns them into copies, which breaks the app.
- **The Electron binary may not download during `npm ci`.** If `node_modules/electron/dist` is missing, run `node node_modules/electron/install.js`. (This happened on the first install here.)
- **The announcer needs a system voice.** It uses `speechSynthesis`, which works offline with the voices built into macOS and Windows. With no English voice installed it stays silent, but the caption at the bottom of the screen still shows each line.
- **The game pauses when the window loses focus.** That's on purpose, but it also means a hidden browser tab (including an agent's preview pane) stops drawing frames. To test from a script, call `updateRace(race)` yourself.

## Ideas for later
- Ghost car for time trials (replay of your best lap).
- More tracks, and unlocking Ace difficulty after a cup win.
- Two-player split screen on one keyboard.
