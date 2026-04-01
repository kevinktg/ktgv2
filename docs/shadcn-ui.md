# shadcn/ui on ktgv2

Prerequisites for the shadcn-ui workflow are satisfied. Use this doc when adding components or onboarding.

## Prerequisites (met)

| Requirement | Location |
|-------------|----------|
| Schema + aliases | [`components.json`](../components.json) — `style: new-york`, JSX, `@/components/ui`, `@/lib/utils` |
| Theme tokens | [`src/app/globals.css`](../src/app/globals.css) — CSS variables (`--background`, `--card`, etc.) |
| `cn()` helper | [`src/lib/utils.js`](../src/lib/utils.js) |

Stack: Tailwind CSS v4, Next.js App Router — see [`AGENTS.md`](../AGENTS.md).

## Installed components

Under [`src/components/ui/`](../src/components/ui/):

- `button`, `card`, `badge`, `accordion`, `navigation-menu`, `separator`, `skeleton`
- Custom: `matter-button`

Examples in use: [`src/components/Header.jsx`](../src/components/Header.jsx), [`src/components/hub/SnippetViewer.jsx`](../src/components/hub/SnippetViewer.jsx), [`src/components/ValidationSection.jsx`](../src/components/ValidationSection.jsx).

## Adding components

From the repository root (this project uses **npm**):

```bash
npx shadcn@latest add <component>
```

Install in dependency order when building a feature: foundation (`button`, `input`, `label`, `card` — add missing pieces as needed), then overlays (`dialog`, `sheet`), forms (`form` may need `react-hook-form`, `zod`, `@hookform/resolvers`), etc.

**Customisation:** edit files only under `src/components/ui/`. Prefer semantic tokens (`bg-card`, `border-border`, `text-muted-foreground`) over raw palette classes.

## Gotchas (from shadcn skill)

- **Radix Select:** do not use `value=""`; use a sentinel like `__any__`.
- **React Hook Form + Input:** use `value={field.value ?? ''}` when spreading is unsafe for controlled inputs.
- **Dialog width:** override with breakpoint-prefixed max-width, e.g. `sm:max-w-6xl`, not bare `max-w-6xl` alone.

## Next steps (when you have a feature)

Pick components from the [shadcn catalogue](https://ui.shadcn.com/docs/components), run `npx shadcn@latest add …`, wire into `src/app/` or `src/components/`, imports from `@/components/ui/...`.

Optional: audit a route for raw Tailwind colours vs tokens; add a full recipe (e.g. contact form) once the screen is defined.
