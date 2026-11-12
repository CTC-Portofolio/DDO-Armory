export type Category = 'Named loot' | 'Cannith craftables' | 'Named craftables';
export interface Copy { id: string; location: string; mythic?: number; reaper?: number; augments: string[]; mods?: string[] }
export interface Version { ml: number; stats: string[]; copies: Copy[] }
export interface Item { id: string; name: string; type: string; pack: string; category: Category; icon: string; versions: Version[] }
const copy = (id: string, location: string, mythic?: number, reaper?: number): Copy => ({ id, location, mythic, reaper, augments: ['Example resistance augment', 'Empty'] });
// Fictional fixtures: these are UI examples, not an authoritative DDO catalogue.
export const items: Item[] = [
  { id: 'ring', name: 'Ring of the Wayfarer', type: 'Ring', pack: 'Example expansion', category: 'Named loot', icon: 'pi-circle', versions: [
    { ml: 15, stats: ['Example Dexterity +6', 'Example Resistance +5'], copies: [copy('ring-a', 'Mule A → bank', 1), copy('ring-b', 'Mule A → bank', undefined, 1), copy('ring-c', 'Main → inventory', 3, 1)] },
    { ml: 29, stats: ['Example Dexterity +13', 'Example Resistance +10'], copies: [] }] },
  { id: 'cloak', name: 'Cloak of Quiet Steps', type: 'Cloak', pack: 'Example expansion', category: 'Named loot', icon: 'pi-flag', versions: [
    { ml: 15, stats: ['Example Hide +15', 'Example Move Silently +15'], copies: [copy('cloak-a', 'Shared bank')] },
    { ml: 29, stats: ['Example Hide +22', 'Example Move Silently +22'], copies: [] }] },
  { id: 'helm', name: 'Helm of the Sentinel', type: 'Helm', pack: 'Example quest pack', category: 'Named loot', icon: 'pi-shield', versions: [{ ml: 15, stats: ['Example Fortification +100%'], copies: [] }] },
  { id: 'necklace', name: 'Pendant of the Dawn', type: 'Necklace', pack: 'Example quest pack', category: 'Named loot', icon: 'pi-sparkles', versions: [{ ml: 15, stats: ['Example Wisdom +6'], copies: [copy('neck-a', 'Mule B → bank', 1)] }] },
  { id: 'sword', name: 'Blade of the Long Road', type: 'Weapon', pack: 'Example expansion', category: 'Named loot', icon: 'pi-bolt', versions: [{ ml: 15, stats: ['Example Enhancement +5'], copies: [] }] },
  { id: 'boots', name: 'Boots of the Wanderer', type: 'Boots', pack: 'Example quest pack', category: 'Named loot', icon: 'pi-compass', versions: [{ ml: 15, stats: ['Example Striding +30%'], copies: [copy('boots-a', 'Main → inventory')] }] },
  { id: 'blank', name: 'Crafting blank: ring', type: 'Ring', pack: 'Crafting blanks', category: 'Cannith craftables', icon: 'pi-circle', versions: [{ ml: 1, stats: ['Non-named crafting base'], copies: [{ id: 'blank-a', location: 'Mule A → bank', augments: ['Empty'] }] }] },
  { id: 'crafted', name: 'Example crafted necklace', type: 'Necklace', pack: 'Example crafting pack', category: 'Named craftables', icon: 'pi-wrench', versions: [{ ml: 29, stats: ['Example shared base effect'], copies: [{ id: 'crafted-a', location: 'Main → inventory', augments: ['Example stat augment', 'Empty'], mods: ['Example crafted mod A', 'Example crafted mod B'] }] }] },
];
