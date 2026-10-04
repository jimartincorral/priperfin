# PriPerFin Desktop

The Electron shell that turns PriPerFin into a standalone Windows/macOS app.
It bundles the NestJS API, the built Lit frontend and a private SQLite database,
so an end user needs no Node.js, no pnpm and no terminal.

End-user install instructions live in the [root README](../../README.md#desktop-app).
Release testing is covered by [TESTING.md](./TESTING.md) — work through it
before tagging a release that touches this package, `apps/api` or the packaging.

## How it works

```
Electron main process
  ├─ reap a server orphaned by a previous hard kill (pidfile)
  ├─ prisma db push                (bundled CLI, creates/updates the schema)
  ├─ spawn dist/src/main.js        (process.execPath + ELECTRON_RUN_AS_NODE=1)
  ├─ poll GET /health until ready
  └─ window.loadURL(http://127.0.0.1:<port>)
```

The server runs **out of process** on purpose. Several constructors in the API
throw during boot (`PrismaService`'s schema validation, `BackupService`'s
directory and key checks). In-process those would take down Electron itself and
leave the user with a window that never appears; out of process we get an exit
code and the captured output, and can show a real error dialog.

The port is probed at startup rather than hardcoded, so the app never collides
with a Home Assistant add-on or a dev server on 3000. The server binds
`127.0.0.1`, which keeps it on `IngressSecurityMiddleware`'s loopback allow-list
and avoids a Windows Firewall prompt.

## Layout

| Path | Purpose |
| --- | --- |
| `src/main.ts` | App lifecycle, window, error dialogs |
| `src/server-process.ts` | Port probe, spawn, health poll, supervision, teardown |
| `src/db-push.ts` | Runs the bundled Prisma CLI before the server starts |
| `src/paths.ts` | userData/resources resolution and the server env contract |
| `scripts/stage-server.mjs` | Builds `build/server`: a self-contained production API |
| `scripts/rebuild-natives.mjs` | Rebuilds native modules for Electron's ABI |
| `scripts/pack.mjs` | stage → rebuild → compile → electron-builder |

`build/server` and `build/dev-resources` are generated and gitignored.

## Building

```bash
pnpm -F api build && pnpm -F web build

pnpm desktop:win    # Windows installer  (must run on Windows)
pnpm desktop:mac    # macOS disk image    (must run on macOS)
```

Cross-compiling is not possible: `better-sqlite3` and `bcrypt` are compiled for
the host at package time, and a `.dmg` needs macOS's `hdiutil`. CI builds each
platform on its own runner.

## Running locally

```bash
pnpm -F api build && pnpm -F web build
pnpm -F desktop stage && pnpm -F desktop rebuild:natives   # once, and after API changes
pnpm desktop:dev
```

Dev mode runs against `build/server` rather than `apps/api` directly, because
the native modules in `apps/api/node_modules` are built for stock Node, not for
Electron's ABI. It also means dev exercises the packaging path.

## Things that will bite you

- **`dist/src/main.js`, not `dist/main.js`.** `apps/api/prisma.config.ts` sits at
  the api package root and is included in the TypeScript build, which shifts the
  inferred `rootDir`. `run.sh` depends on the same path. `stage-server.mjs`
  asserts it.
- **`npmRebuild: false` is deliberate.** electron-builder's own rebuild only
  covers this package's `node_modules`, never the `extraResources` tree, so it
  would silently ship a `better_sqlite3.node` built for the wrong ABI. The
  symptom is a cryptic `NODE_MODULE_VERSION` error on first launch, not a build
  failure. `scripts/rebuild-natives.mjs` handles it and asserts the result.
- **`prebuilds/` is excluded from the package.** `node-gyp-build` checks
  `build/Release` before `prebuilds`, so the Electron-ABI binary wins — but only
  if the rebuild produced one, which is why that is asserted.
- **Never drop `--publish never`.** electron-builder's GitHub publisher creates
  *draft* releases, which Home Assistant cannot see.
- **pnpm's symlinked `node_modules` is not a problem here.** The packaged server
  is built by `stage-server.mjs` with its own `npm install` into
  `build/server`, a tree of real directories, precisely because
  electron-builder's copy and `@electron/rebuild`'s module walk both misbehave
  against `.pnpm` symlinks. Nothing in packaging reads `apps/desktop/node_modules`
  except electron and electron-builder themselves.
- **Size.** The bundled Prisma CLI drags in Prisma Studio and accounts for
  roughly 180MB of the installed footprint. `db push` only loads
  `@prisma/studio-core/data/*`, so the packaging filter drops Studio's UI bundle
  and its UI-only dependencies (~43MB). If the app ever needs to get smaller,
  replacing `db push` with a generated DDL baseline is the big lever.
