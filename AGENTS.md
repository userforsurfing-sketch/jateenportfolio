<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- Keep the social share rendition in `public/` so the absolute share-image URL is served by the deployment itself, not an external asset host.
- Single scrolling page at `/` with section anchors (`#about`, `#games`, …); the brief asks for smooth-scroll navigation with an active-section indicator.
- All personal content (bio, skills, projects, journey, contact links) lives in `src/content/profile.ts`; unknown values stay `null` and render as labelled placeholders so nothing is invented.
- Arcade games live in `src/components/arcade/games/`, each implementing `GameProps` (`types.ts`) and registered in `registry.ts`; `GameModal` owns pause/restart/sound/score UI so games only handle gameplay.
- Canvas games read colors from CSS tokens via `src/lib/arcade/palette.ts`, keeping the design system as the single source of color.
- Best scores and the sound setting are stored in localStorage via `src/lib/arcade/storage.ts` (higher score is always better).
- Contact form submissions are validated with the shared zod schema in `src/lib/contact.ts` and stored by the `submitContact` server function into `contact_submissions`, which has RLS on and no public policies so visitors can never read submissions.
- Phones held sideways use the `short-landscape` custom variant in `src/styles.css` to place game touch controls beside the board, since those screens have too little height to stack them.
