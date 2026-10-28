# Security policy

## Reporting a vulnerability

Please report security issues **privately** through GitHub:
[Report a vulnerability](https://github.com/git-cgallagher/ridgeline-rc/security/advisories/new)
(the **Security** tab, then **Report a vulnerability**). Don't open a public issue for a security problem.

You can expect an acknowledgement within a week. This is a one-person project, so fixes are best effort.

## Supported versions

Only the latest release gets fixes.

## Scope

Ridgeline RC is an offline game. The desktop apps make no network connections, have no accounts and
store only settings and the local scoreboard (in the app's own `localStorage`). The game page runs in a
sandboxed Electron window with no Node access, under a strict Content Security Policy. Release builds
are ad-hoc signed, not notarized; see the README for what that means when you install them.
