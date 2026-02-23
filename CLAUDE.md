# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

All development runs via Docker Compose from the repo root:

```bash
docker compose up           # Start all services
docker compose up backend   # Start only backend + its deps
docker compose down         # Stop all services
```

### Backend (NestJS) — run inside the container or with local Node:

```bash
cd backend
npm run start:dev           # Watch mode
npm run start:debug         # Watch mode + debugger on port 9229
npm run build               # Compile to dist/
npm run lint                # ESLint with autofix
npm run test                # Jest unit tests
npm run test:watch          # Jest in watch mode
npm run test:cov            # Coverage report
npm run test:e2e            # E2E tests (test/jest-e2e.json)
```

### Frontend (Next.js) — run inside the container or with local Node:

```bash
cd frontend
npm run dev                 # Dev server on port 3000
npm run build               # Production build
npm run lint                # ESLint
```

### Prisma (run from `backend/`):

```bash
npx prisma migrate dev      # Create and apply migration
npx prisma migrate deploy   # Apply pending migrations (used in entrypoint.sh)
npx prisma generate         # Regenerate client to generated/prisma/
npx prisma studio           # GUI (also available via docker compose on PRISMA_STUDIO_PORT)
```

### Adding shadcn components (run from `frontend/`):

```bash
npx shadcn add <component>
```

## Architecture

### Monorepo layout

```
/
├── backend/
│   ├── src/
│   │   ├── main.ts                          CORS + global ValidationPipe (whitelist)
│   │   ├── app.module.ts                    Root: PrismaModule, UsersModule, AuthModule
│   │   ├── prisma/prisma.service.ts         PrismaClient via PrismaPg adapter (DATABASE_URL)
│   │   ├── users/users.service.ts           findOne, create (bcrypt hash), update, delete
│   │   ├── users/dto/create-user.dto.ts     Input validation (class-validator)
│   │   ├── users/dto/user.dto.ts            Response shape (@Expose + ClassSerializerInterceptor)
│   │   ├── auth/auth.service.ts             validateUser() + login() → JWT
│   │   ├── auth/auth.controller.ts          POST /auth/login|signup, GET /auth/profile
│   │   ├── auth/strategies/local.strategy.ts   passport-local; usernameField=email
│   │   ├── auth/strategies/jwt.starategy.ts    passport-jwt; validates payload → user lookup
│   │   ├── auth/guards/                     JwtAuthGuard, LocalAuthGuard, RolesGuard
│   │   └── auth/decorators/roles.ts         @Roles(...Role[]) sets ROLES_KEY metadata
│   ├── prisma/
│   │   ├── schema.prisma                    Generator config only (multi-file setup)
│   │   └── models/user.prisma               User model + Role enum (USER/ADMIN)
│   ├── generated/prisma/                    Prisma client output — do not edit
│   ├── prisma.config.ts                     Points prisma CLI at prisma/ dir
│   └── entrypoint.sh                        Runs migrate deploy before app start
├── frontend/
│   └── src/
│       ├── app/layout.tsx                   Root layout: Geist fonts, Header, .container wrapper
│       ├── app/globals.css                  Tailwind v4 @import + CSS variable theme (light/dark)
│       ├── components/header.tsx            Header; owns modal open state, passes triggerRef
│       ├── components/modal.tsx             Custom modal via React context; controlled + uncontrolled modes
│       ├── components/ui/button.tsx         shadcn Button with cva variants
│       └── lib/utils.ts                     cn() = clsx + tailwind-merge
├── docker-compose.yml
└── .env                                     Shared env for all Docker services
```

The root `package.json` is a workspace config only (no runnable scripts of value).

### Backend

- **Entry**: `src/main.ts` — bootstraps NestJS, enables CORS for `FRONTEND_URL`, applies global `ValidationPipe` (whitelist + forbidNonWhitelisted)
- **Module graph**: `AppModule` → `PrismaModule` (global) + `UsersModule` + `AuthModule`
- **Prisma**: schema lives in `prisma/` (multi-file: `schema.prisma` + `models/*.prisma`). Client is generated to `generated/prisma/`. `PrismaService` uses `PrismaPg` adapter (driver-level connection).
- **Auth flow**: `POST /auth/login` → `LocalAuthGuard` (validates credentials) → returns JWT. `POST /auth/signup` → `UsersService.create`. `GET /auth/profile` → `JwtAuthGuard`. Role-based access uses `@Roles()` decorator + `RolesGuard`.
- **DTOs**: `class-validator` decorators for input validation; `class-transformer` + `@Expose()` on `UserDto` for response serialization via `ClassSerializerInterceptor`.
- **Note**: JWT strategy file is misnamed `jwt.starategy.ts` (typo — keep consistent if referencing).

### Frontend

- **Path alias**: `@/` → `src/`
- **Styling**: Tailwind CSS v4 (imported via `@import "tailwindcss"` in `globals.css`, not a plugin). CSS variables for theming. `prettier-plugin-tailwindcss` sorts classes on format.
- **shadcn/ui**: configured in `components.json`, style `new-york`, base color `neutral`. Components go to `src/components/ui/`.
- **Modal system**: Custom implementation in `src/components/modal.tsx`. Uses React context. Supports both controlled mode (`controls` prop) and uncontrolled. Pass `triggerElement` ref to exclude the trigger from click-outside detection.

### Environment variables

Single `.env` at the repo root is consumed by Docker Compose and by the backend `ConfigService`. Required vars: `DATABASE_URL`, `JWT_SECRET`, `PORT`, `DEBUG_PORT`, `DB_*`, `REDIS_PORT`, `FRONTEND_URL`, `PRISMA_STUDIO_PORT`.

### Ports

| Service       | Port |
|---------------|------|
| Backend API   | 5000 |
| Frontend      | 3000 |
| Postgres      | 5432 |
| Redis         | 6379 |
| Prisma Studio | 5555 |
| Debug         | 9229 |

## Conventions

### Commits
Conventional Commits — no scope, no `Co-Authored-By` trailer.
Format: `<type>: <description>` (imperative, lowercase, no period)
Breaking change: `<type>!: <description>` + `BREAKING CHANGE:` in footer
Body/footer optional — use for motivation or issue refs (`Closes #123`)
Types: `feat` `fix` `refactor` `perf` `style` `test` `docs` `build` `ops` `chore`

### Code patterns

**Backend**
- New module: `*.module.ts` + `*.service.ts` + `*.controller.ts` in `src/<feature>/`, registered in `app.module.ts`
- New Prisma model: add `*.prisma` in `prisma/models/`, run `prisma migrate dev` then `prisma generate`
- Import Prisma types from `generated/prisma/client` or `generated/prisma/enums`
- `PrismaService` is global — inject directly, no need to import `PrismaModule` per feature
- Input DTO: `class-validator` decorators on `CreateXDto`
- Output DTO: `@Expose()` fields on `XDto` + `@UseInterceptors(ClassSerializerInterceptor)` on route
- Guards: `@UseGuards(JwtAuthGuard)` / `@UseGuards(LocalAuthGuard)` / `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(Role.ADMIN)`
- Config: `ConfigService.get<string>('KEY')` — all vars from root `.env`

**Frontend**
- Path alias: `@/` → `src/`
- Tailwind v4: `@import "tailwindcss"` in `globals.css` (not a plugin). Use `cn()` from `@/lib/utils` for conditional classes
- Add shadcn components: `npx shadcn add <component>` from `frontend/` → outputs to `src/components/ui/`
- Modal (controlled pattern):
  ```tsx
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  <button ref={triggerRef} onClick={() => setIsOpen(true)}>open</button>
  <Modal triggerElement={triggerRef} controls={{ isOpen, setIsOpen }}>
    <ModalContent><ModalTitle>Title</ModalTitle></ModalContent>
  </Modal>
  ```
