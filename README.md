# DtD40K-foundryvtt

An **unofficial** [Foundry VTT](https://foundryvtt.com/) game system for *Dungeons the Dragoning* (LawfulNice),
revision **7.7a** — a d10 **Roll & Keep** game.

> Fan project. The descriptions shown are summaries in our own words; no full text from the book is reproduced.

## Features (version 0.6.1)

- **Character sheet** in the classic layout of the official sheet, with three modes:
  - **Edit** — characteristics in the 3×3 grid (Power / Finesse / Resistance × Mental / Physical / Social) and 27
    skills in 3 columns, with clickable dots, specialties and GM adjustments (bonuses and overrides of the derived
    values).
  - **Play** — fixed header with HP, Resolve, defenses and Hero Points; skills with search and a "trained only"
    filter; click to roll, with the pool (e.g. `6k3`) next to each entry.
  - **Advance** — like Play, with a `+cost` button on each characteristic, skill and the Power Stat to buy with XP
    (no charge in Edit mode).
- **Derived values** computed automatically: Static Defense, Hit Points, Mental Defense, Resolve, Speed, Resilience
  and maximum Fatigue; combat and social initiative in the footer.
- **Roll & Keep dice**: 10s explode onto the same die, conversion above 10 dice, untrained skills, characteristic 0,
  raises and checks, chat card and Dice So Nice support.
- **Roll dialog**: TN, characteristic swap, modifiers, free raises, stunts (+1k1/+2k2/+3k3), specialty (reroll 1s)
  and roll mode. **Shift + click** rolls directly.
- **Races**: *Races* compendium with the 16 races of 7.7a. Dropping a race on the sheet applies Size and bonuses as
  Active Effects (with the characteristic choice), automates the simple powers and counts uses per scene; the
  *Traits* tab shows the power, the modifiers (the GM toggles them) and an "i" icon with description and lore.
- **Exaltations**: *Exaltations* compendium with the 9 exaltations of 7.7a and *Exalted Assets* with the 75 assets
  (in folders by group). Dropping an exaltation on the sheet creates the Power Stat (capped by Level), the resource
  pool with its computed maximum, the powers unlocked per dot, the spending limit per round, the scene's Tell and the
  Paragon and Dragonblooded choices; assets check exaltation, race and the one-asset limit (except Paragon), automate
  simple effects and cost 100 XP (Perfection's is free), with undo from the XP log.
- **Feats, Assets and Hindrances**: *Feats* compendium with the 274 entries of ch. 7 of 7.7a (181 feats, 49 racial
  feats by race, 22 assets and 22 hindrances). Dropping one on the sheet asks for the subcategory of group feats,
  checks repeats, race, dependencies and the 2-hindrance limit (the GM may add it anyway), applies 15 simple effects
  as toggleable modifiers and grants the feats that races, exaltations and assets give — removed with their source.
- **Classes and XP**: *Classes* compendium with the 103 classes of ch. 6 of 7.7a (18 tracks and 13 standalone).
  Dropping a class on the sheet checks Level and prerequisites (the GM may start it anyway); the *Class & XP* tab
  shows progress on the mandatory feats, completes the class with its bonus (simple ones as toggleable modifiers,
  granted feats) and derives Level from the highest class. **Advance** mode buys characteristics, skills, feats and
  the Power Stat at the 7.7a costs, limited to the class lists (Free Study at double cost), with an XP log, GM awards
  and undo.
- **Equipment**: *Equipment* compendium with the 170 items of chs. XIII and XIV of 7.7a (weapons, armor, gear,
  cybernetics, drugs, magic materials, Wonders and Hearthstones). *Equipment* tab with inventory and equipped items:
  armor gives AP by location and applies the proficiency penalty and Max Dex; weapons roll attack (skill + Level if
  proficient) and damage with a range, aim and fire-mode dialog, qualities, jams and hit location; item effects only
  apply while equipped (the GM can toggle them). Acquisition through the Wealth test with craftsmanship, attempts,
  Liquid Wealth and Wealth Strain; starting equipment slots; drugs with doses and addiction; magic materials and
  hearthstone sockets.
- **Combat**: *Combat* tab with the 38 actions of ch. XVII (controlled turn: one full action or two different half
  actions, free actions and 1 reaction per round), 7.7a conditions as status effects with numeric effects, Critical
  Damage, wounds, fatigue, rest and the Hero Point against death. The damage card gets **Apply** (cover, AP − Pen,
  Resilience, HP and criticals from the 20 tables of the *Combat Tables* compendium, with Undo); the attack card gets
  Dodge and Parry; initiative with the book's tie-breaker; social combat (Resolve, Jaded, Refute), fear tests with
  the Shock Table and insanity with the Trauma Test and derangements.
- **Magic**: *Spells* compendium with the 126 spells of ch. VIII in 9 schools; schools bought with XP in Advance mode
  (class list, capped by Level), each dot unlocking a spell; *Magic* tab with Focus Power (Fettered, Unfettered,
  Push), keywords, spell damage against Aura, target resistance, simple effects, Psychic Phenomena and Perils of the
  Warp rolled and applied, sustained spells charged each turn, Spell Combos and Implement Focus.
- **Sword Schools and Gun Kata**: *Martial Schools* compendium with the 9 Sword Schools and 6 Gun Kata of chs.
  IX–X; schools bought with XP (class list, capped by Level), Martial Adept and Gunslinger Level, numeric passives as
  effects; *Martial* tab with the Special Attack and Trick Shot builder (Style Point budget, 50 XP per point) and their
  use in combat: usage restrictions, skill test, attack/damage/Pen bonuses, qualities and effects on the target.
- **Backgrounds and Alignment**: the 11 Backgrounds in the *Traits* tab with 7 creation dots and 50/100 XP (only at
  creation), named Artifacts and Backings, Wealth from acquisition, Inheritance adding starting picks and the Contacts
  roll; *Deities* compendium (21 gods in 3 pantheons) dropped on the sheet; Alignment Check, Devotion recovery,
  alignment change and rolled Degeneration, recorded per Devotion dot with its effects applied.
- **NPCs and Minions**: NPC actors with the book's stat block (values as printed), built-in weapons in attack, damage
  and Apply, conditions, turn and magic; automated traits (armor, Aura, Regeneration, Fear, Amorphous, Mindless,
  Undead, Caster); *Antagonists* compendium with the 47 stat blocks and 4 Minion Squads; squads attacking with
  (minions)k(TR), damage 5 × (DR + raises), casualties on Apply and allied minion bonuses to a hero.
- **Vehicles**: *Vehicle Components* compendium (components and the 27 vehicle weapons of ch. XV in 8 folders) and
  *Vehicles* (16 sample vehicles); vehicle actor built by drag and drop with a VP budget, slots and warnings, active
  drive and crew linked to characters and NPCs; vehicle actions on the acting crew member's turn (Move, Punch It with
  stunts, Skirmish and Barrage with the gunner's skill, Evasive Maneuvers, Ramming, Jury Rig), Control Test and Out of
  Control, damage through Apply with vehicle criticals and explosions, chases through chat cards and the repair cycle.
- **Ships**: *Ship Components* compendium (hulls, customizable bases, officers, consoles, shields, weapons and
  torpedoes of ch. XVI) and *Ships* (6 NPC ships); builder with BP by Holdings, customization, slots and warnings,
  officers linked to characters and NPCs; ship combat in the tracker (one maneuver and one action per department, Crew
  committed per round, dice kept by the officer), ship attacks and Apply (shield, Disruption, Hull and Crit Chart),
  Evasive, ramming and boarding; fighters, bombardment, Warp travel with encounters, vehicle hangar and repairs.
- **Weapon crafting**: builder (Story Master templates, types and mods) with a preview of the profile, rarity and TN;
  player weapons wait for GM approval and can be crafted (materials through Wealth, then Crafts); Red-Dot Sight,
  Motion Predictor, Breacher, Nonlethal, Unstable and Orgone Array affect the attack.
- **Guided creation**: panel on the sheet during creation with the 6/4/2 and 8/6/4 dots (max 4 and 3), starting XP,
  specialties and a checklist of the steps; ratings capped at 5 (6 by the book's exceptions); Level 1 class, Assets
  and Hindrances only at creation; ending creation asks for confirmation when something is missing.
- **Combat actions**: Suppressing Fire and Overwatch with the 45° zone as a map template, Pinning tests from the card
  and the burst at the start of the shooter's turn; opposed tests (Bull Rush, Knock Down, Disarm, Feint); full Grapple
  with each side's options; Delay outside the turn; the In Cover condition with the cover's AP.
- **Hazards and XP**: GM tools for falling (direct damage, the fatal fall's Critical Damage, Catfall and Acrobatics),
  suffocation and forced march per interval with immune actors detected, and party XP from the Encounter Difficulty
  table or per session.
- **Ammunition**: rounds in the magazine and spare magazines per weapon, spent per shot, bursts (effective ROF with
  what is left) and Suppressing Fire, launchers spending the grenade or missile, reloading over the weapon's time with
  progress, jams locking the weapon until Clear Jam.
- **NPC traits on the map and in the turn**: Flyer flies by default and falls when Stunned, Unconscious or Prone;
  incorporeal Phasing passes through walls and only takes damage from magic or Power Fields; Dark Sight sees in the
  dark and ignores darkness (+5 SD); Crawler ignores difficult terrain; Auto-Stabilized makes Full Auto Burst a half
  action; range warning with elevation. Attack abilities roll from the sheet (Mind Blast in a cone, Frightful
  Presence, Elemental heat, Gauss Weapon, Possession); Minion Squads act in the turn; alternate forms (Warform,
  Elemental composition), Resource Stat and editors in the Antagonist tab.
- **Character builder**: a "New character" button in the Actors tab opens a wizard in the book's order (concept,
  race, exaltation, characteristics and skills by priority, specialties, class, backgrounds with Artifacts and
  Backings by organization, deity, Assets and Hindrances, Exalted Asset, starting XP, equipment by rarity and the items
  inherited through Inheritance, checked against the rating), with a side summary, blocking of choices outside the
  rules (the GM releases them) and a saved draft. Every choice comes with a short description: a line with XP and
  requirements in the lists (Assets, Hindrances, classes, feats, backgrounds, equipment) and a panel with the key facts
  of the selected race, exaltation, deity and Exalted Asset, so players don't need the book. Players who may not
  create actors get the character created by the connected GM.
- **Visual Scriptorium Machina**: character sheet in two layouts, Cogitator (default: side rail with the resources
  always in view) and Illuminated (codex page), picked from the sheet menu; chat cards with dice on d10 facets; light
  (parchment) and dark (cogitator) variants that follow the Foundry theme; bundled free fonts. Details in
  `docs/design-system.md`.
- **Custom icons**: every item, actor and table in the compendiums has an icon on the Cogitator plate (iron octagon,
  brass rim and a glyph in the category color); items and actors created in the world start with their type's icon,
  and the GM updates older world documents in Settings → Compendium icons. The 30 conditions and the system's effects
  use a round seal (iron disc, ring in the color of the severity: damage, incapacitation, restraint, favorable
  stance); item effects use the item's icon.
- Interface in **English** and **Brazilian Portuguese (pt-BR)**.

## Requirements

- Foundry VTT **v13** (tested on 13.351).

## Installation

### From the manifest

In *Game Systems → Install System*, paste the manifest URL:

```text
https://github.com/dominique-carvalho/DtD40K-foundryvtt/releases/latest/download/system.json
```

The manifest always points to the latest release; Foundry tells you when an update is available.

### Local (development)

Build the compendiums first (see [Compendiums](#compendiums)), then create a *junction* from the repository folder to
`Data/systems/dtd40k` (no administrator rights needed):

```powershell
New-Item -ItemType Junction -Path "$env:LOCALAPPDATA\FoundryVTT\Data\systems\dtd40k" -Target "C:\path\to\DtD40K-foundryvtt"
```

Restart Foundry completely: **Dungeons the Dragoning** shows up in *Game Systems*. Foundry resolves the system's path
when the application starts, so changing the junction also needs a full restart (reopening the world keeps the old
path). CSS, templates and language files reload without a restart (`flags.hotReload` in `system.json`).

## Development

Requires Node.js 20+.

```bash
npm install
```

```bash
npm test
```

```bash
npm run lint
```

```bash
npm run test:coverage
```

Main layout:

| Path | Contents |
|---|---|
| `module/config.mjs`, `module/rules/` | Pure rules (no Foundry), covered by Vitest tests |
| `module/data/`, `module/documents/` | Data models, `Actor`/`Item` documents and the services that apply rules to them |
| `module/dice/` | Roll adapter (Foundry Roll, chat, Dice So Nice) |
| `module/apps/` | Sheets, builders, the character builder and dialogs (ApplicationV2) |
| `templates/`, `styles/`, `lang/` | Handlebars, CSS and translations |
| `src/packs/`, `src/icons/`, `scripts/` | JSON source of the compendiums, icon sources and build/extract scripts |
| `specs/`, `docs/` | Specifications (Spec Kit, in Portuguese) and rules analysis |

Development follows the [Spec Kit](https://github.com/github/spec-kit) flow and the constitution in
`.specify/memory/constitution.md`. The rules reference is **DtD 7.7a**; the analysis is in
[`docs/analise-dtd.md`](docs/analise-dtd.md) and what is still missing in [`docs/pendencias.md`](docs/pendencias.md)
(both in Portuguese).

## Compendiums

The compendium source lives in `src/packs/<name>/*.json` (one file per document, versioned). Foundry reads the
compiled LevelDB version in `packs/<name>/`, which is **not versioned** and is built with:

```bash
npm run build:packs
```

- **Close Foundry completely** before building (leaving the world is not enough: the server may keep the pack's
  LOCK). If a pack is in use, the build warns and changes nothing.
- A new checkout or worktree needs this build **before** Foundry points to it; otherwise Foundry creates empty
  databases there.
- After the build, open Foundry and check the compendium (e.g. 16 races).
- Never edit `packs/` by hand; change the JSON in `src/packs/` and build again.
- To edit a compendium in Foundry: right-click the compendium → "Toggle Edit Lock", edit the items, close Foundry and
  run `npm run extract:packs` to write the changes back to `src/packs/` (then review the diff and commit).
- Current compendiums: `races` (16 races, ch. 4 of DtD 7.7a), `exaltations` and `exalted-assets` (ch. 5), `feats`
  (ch. 7), `classes` (103 classes, ch. 6), `equipment` (170 items, chs. XIII–XIV), `combat-tables` (22 tables of
  ch. XVII and the 2 Warp tables), `spells` (126 spells, ch. VIII), `martial-schools` (15 schools, chs. IX–X),
  `deities` (21 gods, ch. XII; the Degeneration table is in `combat-tables`), `antagonists` (47 NPCs and 4 Minion
  Squads, ch. XX, GM only), `vehicle-components` (131 components, weapons and ammunition, ch. XV), `vehicles`
  (16 sample vehicles), `ship-components` (104 parts, ch. XVI) and `ships` (6 NPC ships).

Foundry may rewrite the linked checkout's `system.json` (formatting only); restore it with
`git checkout -- system.json` before committing.

## Icons

Icons are generated from `src/icons/` (`categories.json`: each category's color and default glyph; `curation.json`:
each document's glyph; `conditions.json`: group and glyph of the condition and effect seals; `glyphs/`: the
game-icons.net glyphs in use) into `assets/icons/`:

```bash
npm run build:icons
```

- Run it before `npm run build:packs`: it also writes the icon paths into the JSON in `src/packs`. Without changes,
  it touches nothing.
- A new document without its own glyph uses its category's default and is listed in `src/icons/uncurated.json`; to
  pick one, run `npm run icons:suggest` (candidates in `src/icons/suggestions.json`), note it in `curation.json` and
  download the glyph with `npm run icons:fetch` (the only step that uses the network).
- `tests/unit/icons.test.mjs` fails if any compendium document is left with a Foundry image or a missing file.

## Releasing a version

The [`.github/workflows/release.yml`](.github/workflows/release.yml) workflow runs when a release is published on
GitHub. It runs lint and tests, builds the compendiums, writes the version and download link into `system.json` and
attaches `system.json` + `dtd40k.zip` to the release.

1. Update `version` in `system.json`, `package.json` and `package-lock.json` and the version in this README, and merge
   it into `main`.
2. Publish the release with the tag `vX.Y.Z` (the same version):

```bash
gh release create v0.6.0 --title "v0.6.0" --notes-file notes.md
```

3. Follow the workflow in *Actions*; when it ends, the `releases/latest/download/system.json` manifest points to the
   new version.

## License

No license defined yet. *Dungeons the Dragoning* and its logo (the system background and icon) belong to LawfulNice.
The icon glyphs come from
[game-icons.net](https://game-icons.net) (CC BY 3.0); authors in [`CREDITS.md`](CREDITS.md).
