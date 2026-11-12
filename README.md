# DDO Armory

Personal DDO inventory and collection app. Initial UI shell built with Vite, React, TypeScript, and the MIT-licensed PrimeReact 10.9.7 components and Lara Dark Teal theme. No paid PrimeUI components or templates.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. `npm run build` checks TypeScript and builds production assets.

## Current scope

The UI uses fictional, explicitly labeled demonstration data. Search, type/pack/category filters, owned/missing views, and pack browsing work on this small fixture catalogue. Missing means an unowned ML version; it is not a complete game catalogue.

Click an item to open its details. The panel stays open while the pointer is over the item or panel, with a short delay to cross the gap. Base stats are selected by ML. Each physical copy has its own expandable location, augments, crafted mods, and Mythic/Reaper bonuses. Click outside or press Escape to dismiss.

Trove import, IndexedDB persistence, a complete item catalogue, and gear plan import are deferred. No inventory data is read or stored by the UI. Existing `analysis/` outputs are excluded from Git and are not served as app assets.

