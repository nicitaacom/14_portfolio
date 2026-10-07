# Shareable project modals

Clicking **More info** adds `?modal=<modal name>` to the current URL. Opening or refreshing that URL
opens the same project modal automatically. Browser Back and Forward also update the modal.

| File | Purpose |
| --- | --- |
| `app/interfaces/TModals.ts` | The supported modal names |
| `app/utils/modalQuery.ts` | Adds or removes a modal query parameter while keeping the current path, other parameters, and hash |
| `app/components/Modals/ModalMoreInfo.tsx` | Reads `modal` with `useSearchParams` and opens the matching modal |
| `app/components/ProjectsSwitcher.tsx` | Opens project modals from the More info buttons |
| `app/components/Layout.tsx` | Mounts the project modals so shared URLs can open them |
| `app/utm-stats/UTMTracker.tsx` | Removes only UTM parameters after tracking a visit, preserving modal links |

Examples:

```text
/?modal=23MoreInfo
/de?modal=ndaMoreInfo
/pl?modal=rizAdminDashboard
```

Opening a modal uses native `history.pushState` inside `startTransition`, as in `23_store`.
Closing it uses `history.replaceState` to remove only its own `modal` value. These updates reach
Next's `useSearchParams` without a route request or a page reload. Unknown modal names are ignored.

## Adding a project modal

1. Add its name to `TModals` in `app/interfaces/TModals.ts`.
2. Create a project component that passes that name to `ModalMoreInfo`:

```tsx
<ModalMoreInfo
  modalQuery="23MoreInfo"
  label="23_store"
  collaborators={[{ description: "Project details" }]}
/>
```

3. Export and render it in `app/components/Layout.tsx`.
4. Open it from its project button:

```tsx
import { openModalOnCurrentPage } from "@/utils/modalQuery"

<Button onClick={() => openModalOnCurrentPage("23MoreInfo")}>More info</Button>
```

## Appointment modal

The appointment modal uses `useModalsStore` because opening it requires the selected booking date
and time. `Appointment` is excluded from project modal query helpers.
