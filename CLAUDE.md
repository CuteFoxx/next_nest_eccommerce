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
│   │   ├── app.module.ts                    Root: PrismaModule, UsersModule, AuthModule, CategoryModule, ProductModule, FileModule
│   │   ├── prisma/prisma.service.ts         PrismaClient via PrismaPg adapter (DATABASE_URL)
│   │   ├── users/users.service.ts           findOne, create (bcrypt hash), update, delete
│   │   ├── users/dto/create-user.dto.ts     Input validation (class-validator)
│   │   ├── users/dto/user.dto.ts            Response shape (@Expose + ClassSerializerInterceptor)
│   │   ├── auth/auth.service.ts             validateUser() + login() → issues JWT cookies
│   │   ├── auth/auth.controller.ts          POST /auth/login|signup|refresh, GET /auth/profile
│   │   ├── auth/strategies/local.strategy.ts      passport-local; usernameField=email
│   │   ├── auth/strategies/jwt.starategy.ts        passport-jwt; reads Authentication cookie → user lookup
│   │   ├── auth/strategies/jwt-refresh.strategy.ts passport-jwt refresh; reads Refresh cookie → verifyRefreshToken
│   │   ├── auth/guards/                     JwtAuthGuard, LocalAuthGuard, JwtRefreshAuthGuard, RolesGuard
│   │   ├── auth/decorators/currentUser.decorator.ts  @CurrentUser() param decorator; extracts req.user
│   │   ├── auth/decorators/roles.ts         @Roles(...Role[]) sets ROLES_KEY metadata
│   │   ├── interceptors/serialize.interceptor.ts    @Serialize(Dto) shorthand for plainToClass serialization
│   │   ├── types/token-payload.interface.ts  TokenPayload { userId: string }
│   │   ├── types/express.d.ts               Augments Express.User as Pick<PrismaUser, 'id'|'email'|'role'>
│   │   ├── file/file.service.ts             upload(file, dto, userId), getUrl(key), delete(id) — wraps StorageService
│   │   ├── file/storage.service.ts          S3-compatible object storage: generateKey, put, delete, getUrl
│   │   ├── category/category.service.ts     CRUD + optional image via FileService; withImageUrl() helper; auto slug+position
│   │   ├── product/product.service.ts       CRUD + file upload on creation
│   │   └── common/utils/slug.ts            generateSlug(name) + uniqueSlug(base, counterFn)
│   ├── prisma/
│   │   ├── schema.prisma                    Generator config only (multi-file setup)
│   │   └── models/                          user.prisma, category.prisma, product.prisma, file.prisma
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
│       ├── lib/utils.ts                     cn() = clsx + tailwind-merge
│       ├── lib/api.ts                       axios instance for client-side requests (NEXT_PUBLIC_API_URL, withCredentials)
│       └── lib/api.server.ts               axios instance for server-side requests (BACKEND_URL, "server-only" guard)
├── docker-compose.yml
└── .env                                     Shared env for all Docker services
```

The root `package.json` is a workspace config only (no runnable scripts of value).

### Backend

- **Entry**: `src/main.ts` — bootstraps NestJS, enables CORS for `FRONTEND_URL`, applies global `ValidationPipe` (whitelist + forbidNonWhitelisted)
- **Module graph**: `AppModule` → `PrismaModule` (global) + `UsersModule` + `AuthModule` + `CategoryModule` + `ProductModule` + `FileModule`
- **Prisma**: schema lives in `prisma/` (multi-file: `schema.prisma` + `models/*.prisma`). Client is generated to `generated/prisma/`. `PrismaService` uses `PrismaPg` adapter (driver-level connection).
- **Auth flow**:
  - `POST /auth/signup` → `UsersService.create`
  - `POST /auth/login` → `LocalAuthGuard` (validates credentials) → `AuthService.login()` sets two httpOnly cookies: `Authentication` (access token) and `Refresh` (refresh token)
  - `POST /auth/refresh` → `JwtRefreshAuthGuard` (reads `Refresh` cookie, bcrypt-compares against stored hash) → re-issues both cookies
  - `GET /auth/profile` → `JwtAuthGuard` (reads `Authentication` cookie)
  - Role-based access: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(Role.ADMIN)`
  - Refresh token is bcrypt-hashed before being stored in `User.refreshToken`; raw token stays only in the httpOnly cookie
  - Cookie expiry is computed with `setSeconds()` from `JWT_EXPIRES_IN_S` / `JWT_REFRESH_EXPIRES_IN_S` (both in **seconds**)
- **DTOs**: `class-validator` decorators for input validation; `@Serialize(XDto)` shorthand decorator (in `interceptors/serialize.interceptor.ts`) wraps `plainToClass` with `excludeExtraneousValues: true`.
- **Note**: JWT strategy file is misnamed `jwt.starategy.ts` (typo — keep consistent if referencing).

### Frontend

- **Path alias**: `@/` → `src/`
- **Styling**: Tailwind CSS v4 (imported via `@import "tailwindcss"` in `globals.css`, not a plugin). CSS variables for theming. `prettier-plugin-tailwindcss` sorts classes on format.
- **shadcn/ui**: configured in `components.json`, style `new-york`, base color `neutral`. Components go to `src/components/ui/`.
- **Modal system**: Custom implementation in `src/components/modal.tsx`. Uses React context. Supports both controlled mode (`controls` prop) and uncontrolled. Pass `triggerElement` ref to exclude the trigger from click-outside detection.
- **API clients**:
  - Client-side (Client Components, event handlers, hooks): `import { api } from '@/lib/api'` — axios with `baseURL: NEXT_PUBLIC_API_URL`, `withCredentials: true`
  - Server-side (Server Components, Route Handlers, server actions): `import { serverApi } from '@/lib/api.server'` — axios with `baseURL: BACKEND_URL`, guarded by `"server-only"` (never sent to the browser)

### Environment variables

Single `.env` at the repo root is consumed by Docker Compose and by the backend `ConfigService`. See `.example.env` for the full list with descriptions. Required vars:

| Variable | Description |
|---|---|
| `PORT` / `DEBUG_PORT` | Backend HTTP and Node debugger ports |
| `DB_HOST/PORT/DATABASE/USERNAME/PASSWORD` | Postgres connection parts |
| `DATABASE_URL` | Full Prisma connection string |
| `REDIS_PORT` | Redis port |
| `JWT_SECRET` | Signing secret for access tokens |
| `JWT_REFRESH_SECRET` | Signing secret for refresh tokens |
| `JWT_EXPIRES_IN_S` | Access token lifetime **in seconds** (e.g. `1800` = 30 min) |
| `JWT_REFRESH_EXPIRES_IN_S` | Refresh token lifetime **in seconds** (e.g. `72000` = 20 h) |
| `FRONTEND_URL` | CORS allow-origin in `main.ts` |
| `PRISMA_STUDIO_PORT` | Prisma Studio GUI port |

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
- Guards: `@UseGuards(JwtAuthGuard)` / `@UseGuards(LocalAuthGuard)` / `@UseGuards(JwtRefreshAuthGuard)` / `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(Role.ADMIN)`
- Current user: `@CurrentUser()` param decorator (from `auth/decorators/currentUser.decorator.ts`) — injects `req.user` typed as `Express.User`
- Serialization: `@Serialize(XDto)` on the route handler (from `interceptors/serialize.interceptor.ts`) — runs `plainToClass` with `excludeExtraneousValues: true`; fields must have `@Expose()` on the DTO
- Auth tokens are issued as httpOnly cookies (`Authentication` + `Refresh`), never in the response body
- Token expiry vars (`JWT_EXPIRES_IN_S`, `JWT_REFRESH_EXPIRES_IN_S`) are in **seconds** — use `setSeconds()` / `getSeconds()` when computing cookie `expires`, not `setMilliseconds()`
- Config: `ConfigService.get<string>('KEY')` — all vars from root `.env`
- File upload + rollback: upload file first, then do the DB write in a `try/catch` — call `fileService.delete(uploadedFile.id)` in the catch before re-throwing
- Image URL on entities: use a private `withImageUrl<T extends { image: File | null }>(entity: T)` method in the service; call `fileService.getUrl(image.key)` and spread the result; map over arrays with this helper before returning
- Slug: `const slug = await uniqueSlug(generateSlug(name), (s) => prisma.model.count({ where: { OR: [{ slug: s }, { slug: { startsWith: \`${s}-\` } }] } }))` — for updates add `NOT: { id }` to the where clause

**Frontend**
- Path alias: `@/` → `src/`
- Tailwind v4: `@import "tailwindcss"` in `globals.css` (not a plugin). Use `cn()` from `@/lib/utils` for conditional classes
- Add shadcn components: `npx shadcn add <component>` from `frontend/` → outputs to `src/components/ui/`
- API requests: use `api` from `@/lib/api` in Client Components; use `serverApi` from `@/lib/api.server` in Server Components / server actions
- Modal (controlled pattern):
  ```tsx
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  <button ref={triggerRef} onClick={() => setIsOpen(true)}>open</button>
  <Modal triggerElement={triggerRef} controls={{ isOpen, setIsOpen }}>
    <ModalContent><ModalTitle>Title</ModalTitle></ModalContent>
  </Modal>
  ```
