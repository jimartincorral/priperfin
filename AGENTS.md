# AGENTS.md

This file provides coding guidelines for AI agents working in the PriPerFin codebase.

## Project Structure

```
priperfin/
├── apps/
│   ├── api/          # NestJS backend (TypeScript, Prisma, SQLite)
│   ├── web/          # Lit frontend (TypeScript, Vite)
│   └── desktop/      # Electron app
├── config.yaml       # Home Assistant add-on config (VERSION SOURCE OF TRUTH)
└── CLAUDE.md         # Project-specific context for Claude
```

## Build, Lint, and Test Commands

### Monorepo-level (from root)
```bash
pnpm dev              # Start API + Web in parallel
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm lint             # Lint all packages
```

### API (from apps/api or via pnpm -C apps/api)
```bash
pnpm start:dev        # Watch mode development
pnpm build            # Compile TypeScript with NestJS
pnpm lint             # ESLint with auto-fix
pnpm format           # Prettier formatting
pnpm test             # Run all Jest tests
pnpm test:watch       # Watch mode
pnpm test -- rules.service.spec.ts        # Run single test file
pnpm test -- -t "test name pattern"       # Run tests matching pattern
pnpm test:cov         # Coverage report
```

### Web (from apps/web)
```bash
pnpm dev              # Vite dev server on 0.0.0.0:5173
pnpm build            # TypeScript + Vite production build
pnpm test             # Vitest run
pnpm test:watch       # Vitest watch mode
```

### Database (from apps/api)
```bash
npx prisma generate   # Regenerate client after schema changes
npx prisma db push    # Apply schema to database
npx prisma studio     # Open database GUI
```

## Code Style Guidelines

### TypeScript

**Strict Mode**: Enabled with `strictNullChecks`, `noImplicitAny`, and `strictBindCallApply`.

**Imports**: Group by external, internal, types
```typescript
// Backend (NestJS)
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRuleDto } from './dto/create-rule.dto';

// Frontend (Lit)
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { api } from '../api/client';
```

**Formatting**: Prettier with single quotes and trailing commas
```json
{
  "singleQuote": true,
  "trailingComma": "all"
}
```

**Naming Conventions**:
- **Files**: kebab-case (`rules.service.ts`, `view-expenses.ts`)
- **Classes**: PascalCase (`RulesService`, `ViewRules`)
- **Variables/Functions**: camelCase (`findAll`, `editingRule`)
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Decorators**: NestJS uses `@Injectable()`, Lit uses `@customElement()`, `@state()`, `@property()`

### Backend (NestJS)

**Service Pattern**:
```typescript
@Injectable()
export class RulesService {
  private readonly logger = new Logger(RulesService.name);
  
  constructor(
    private prisma: PrismaService,
    private ruleEvaluator: RuleEvaluatorService,
  ) {}
  
  async findOne(id: string) {
    const rule = await this.prisma.categorizationRule.findUnique({
      where: { id },
    });
    if (!rule) throw new NotFoundException(`Rule ${id} not found`);
    return rule;
  }
}
```

**DTOs**: Use `class-validator` decorators
```typescript
export class CreateRuleDto {
  @IsString()
  name: string;
  
  @IsEnum(RuleMode)
  mode: RuleMode;
}
```

**API Endpoints**: REST at `/api/*`, use proper HTTP methods

### Frontend (Lit)

**Component Pattern**:
```typescript
@customElement('view-rules')
export class ViewRules extends LitElement {
  @state() rules: any[] = [];
  @state() loading = false;
  
  static styles = css`
    :host { display: block; }
    .card { background: var(--md-sys-color-surface); }
  `;
  
  render() {
    return html`<div class="card">...</div>`;
  }
}
```

**Styling**: Use Material Design 3 CSS variables
```css
/* Colors */
var(--md-sys-color-surface)
var(--md-sys-color-on-surface)
var(--md-sys-color-primary)
var(--md-sys-color-error-container)

/* Typography */
var(--md-sys-typescale-headline-large)
var(--md-sys-typescale-body-medium)
```

**State Management**: Use `@state()` for reactive properties, not manual DOM manipulation

**i18n**: Always use translation keys
```typescript
import { i18n } from '../i18n/i18n';
html`<h1>${i18n.t('rules.title')}</h1>`;
```

## Error Handling

**Backend**: Use NestJS exceptions
```typescript
throw new NotFoundException('Resource not found');
throw new BadRequestException('Invalid input');
```

**Frontend**: Try-catch with user-friendly alerts
```typescript
try {
  await api.post('/rules', data);
  alert(i18n.t('success_message'));
} catch (e) {
  console.error(e);
  alert(i18n.t('error_message'));
}
```

## Testing

**Backend (Jest)**: Test file pattern `*.spec.ts`
```typescript
describe('RulesService', () => {
  it('should find all rules', async () => {
    const result = await service.findAll();
    expect(result).toBeDefined();
  });
});
```

**Run single test**: `pnpm test -- rules.service.spec.ts`

## Git Workflow

**CRITICAL**: Only commit when explicitly requested. Do not auto-commit.

**Version Management**: Update `config.yaml` version field when releasing.

**Release Process**: See CLAUDE.md for complete instructions. Every version bump requires a GitHub Release.

## Important Constraints

1. **Dark Mode**: Use CSS variables, never hardcode colors like `#fff`, `white`, or `#000`
2. **Null Safety**: Always check for null/undefined before accessing properties
3. **TypeScript**: Avoid `any` where possible, prefer proper types
4. **Build Verification**: Always run `pnpm build` before committing
5. **Translations**: Never hardcode UI strings, use i18n keys
6. **Nested Categories**: Display parent-child hierarchy with `&nbsp;&nbsp;&nbsp;&nbsp;` indentation

## Common Patterns

**Category Dropdown with Nesting**:
```typescript
${categories.filter(c => !c.parentId).map(parent => html`
  <option value="${parent.id}">${parent.icon} ${parent.name}</option>
  ${categories.filter(c => c.parentId === parent.id).map(child => html`
    <option value="${child.id}">&nbsp;&nbsp;&nbsp;&nbsp;${child.icon} ${child.name}</option>
  `)}
`)}
```

**API Client Usage**:
```typescript
import { api } from '../api/client';
const data = await api.get('/rules');
await api.post('/rules', createDto);
await api.patch(`/rules/${id}`, updateDto);
```

---

For project architecture, deployment, and domain details, see **CLAUDE.md**.
