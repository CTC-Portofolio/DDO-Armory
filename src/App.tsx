import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { items, type Item, type Category } from './demo';

type View = 'owned' | 'missing' | 'packs';
const categories: Category[] = ['Named loot', 'Cannith craftables', 'Named craftables'];

function ItemDetails({ item }: { item: Item }) {
  const [ml, setMl] = useState(item.versions[0].ml);
  const [expandedCopies, setExpandedCopies] = useState<Record<number, number[]>>({});
  const version = item.versions.find(v => v.ml === ml)!;
  return <div className="item-details">
    <div className="detail-title"><span className={`pi ${item.icon}`} aria-hidden="true"/><div><h2>{item.name}</h2><p>{item.type} · {item.pack}</p></div></div>
    <Accordion><AccordionTab header="Stats"><div className="stats-controls"><label htmlFor="stats-ml">Minimum level</label><Dropdown inputId="stats-ml" value={ml} options={item.versions.map(v => v.ml)} onChange={e => setMl(e.value)} /></div><ul className="stats-list">{version.stats.map(s => <li key={s}>{s}</li>)}</ul><p className="muted small">Base stats for this version. Copy-specific bonuses appear below.</p></AccordionTab></Accordion>
    {item.versions.map(v => <section key={v.ml} className="version-details"><div className="version-heading"><h3>Minimum level {v.ml}</h3><Tag value={v.copies.length ? `${v.copies.length} ${v.copies.length === 1 ? 'copy' : 'copies'}` : 'Missing'} severity={v.copies.length ? 'success' : 'warning'} /></div>
      {v.copies.length ? <Accordion multiple activeIndex={expandedCopies[v.ml] ?? [0]} onTabChange={e => setExpandedCopies(previous => ({ ...previous, [v.ml]: e.index as number[] }))}>{v.copies.map((c, i) => <AccordionTab key={c.id} header={<span className="copy-heading"><span>Copy {i + 1}</span><span className="muted">{c.location}</span></span>}><div className="bonus-tags">{c.mythic && <Tag value={`Mythic +${c.mythic}`} severity="info" />}{c.reaper && <Tag value={`Reaper +${c.reaper}`} severity="danger" />}{!c.mythic && !c.reaper && <span className="muted small">No Mythic or Reaper bonus</span>}</div><dl className="copy-properties">{c.augments.map((a, n) => <div key={n}><dt>Augment {n + 1}</dt><dd>{a}</dd></div>)}{c.mods?.map((m, n) => <div key={`mod-${n}`}><dt>Crafted mod {n + 1}</dt><dd>{m}</dd></div>)}</dl></AccordionTab>)}</Accordion> : <p className="muted small">You don’t own this version.</p>}
    </section>)}
    <footer className="detail-footer"><span>Fictional demo item</span><a href="https://ddowiki.com/" target="_blank" rel="noreferrer">Open DDO Wiki <i className="pi pi-external-link" aria-hidden="true" /></a></footer>
  </div>;
}

export default function App() {
  const [tab, setTab] = useState<'armory' | 'plans'>('armory');
  const [view, setView] = useState<View>('owned');
  const [category, setCategory] = useState<Category>('Named loot');
  const [query, setQuery] = useState('');
  const [type, setType] = useState<string | null>(null);
  const [pack, setPack] = useState<string | null>(null);
  const [selected, setSelected] = useState<Item | null>(null);
  const overlay = useRef<OverlayPanel>(null);
  const activeCard = useRef<HTMLButtonElement | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keepOpen = () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  const scheduleClose = () => { keepOpen(); hideTimer.current = setTimeout(() => overlay.current?.hide(), 250); };
  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);
  useEffect(() => { overlay.current?.hide(); }, [view, category, query, type, pack, tab]);
  const categoryItems = items.filter(i => i.category === category);
  const filtered = categoryItems.filter(i => (!query || i.name.toLowerCase().includes(query.toLowerCase())) && (!type || i.type === type) && (!pack || i.pack === pack) && (view === 'packs' || i.versions.some(v => view === 'owned' ? v.copies.length > 0 : !v.copies.length)));
  const packs = [...new Set(filtered.map(i => i.pack))];
  const versionCount = categoryItems.reduce((n, i) => n + i.versions.length, 0);
  const ownedCount = categoryItems.reduce((n, i) => n + i.versions.filter(v => v.copies.length).length, 0);
  return <div className="app-shell">
    <header className="app-header"><a className="brand" href="./"><span className="brand-mark"><i className="pi pi-shield" aria-hidden="true" /></span><span>DDO <strong>Armory</strong></span></a><nav className="top-nav" aria-label="Main navigation"><button onClick={() => setTab('armory')} aria-current={tab === 'armory' ? 'page' : undefined}>Armory</button><button onClick={() => setTab('plans')} aria-current={tab === 'plans' ? 'page' : undefined}>Gear plan imports <span className="soon">Later</span></button></nav><span className="local-label"><i className="pi pi-desktop" aria-hidden="true"/> Local workspace</span></header>
    <div className="demo-notice"><i className="pi pi-info-circle" aria-hidden="true"/><span>UI preview · fictional items and stats. Imports and storage are coming later.</span><Tag value="Demo" severity="info" /></div>
    {tab === 'plans' ? <main className="coming-soon"><span className="empty-icon pi pi-map"/><h1>Your next build starts here.</h1><p>Import a gear plan and compare it with your armory.</p><Tag value="Planned for a later phase" /><Button label="Back to Armory" outlined onClick={() => setTab('armory')} /></main> : <div className="workspace"><aside className="sidebar"><div className="server-label"><span className="eyebrow">SERVER</span><strong><span className="server-dot"/> Moonsea <span className="muted small">demo</span></strong></div><span className="nav-section-label">Collection</span>{([{ id: 'owned', label: 'Owned items', icon: 'pi-box' }, { id: 'missing', label: 'Missing items', icon: 'pi-search' }, { id: 'packs', label: 'By pack / expansion', icon: 'pi-th-large' }] as const).map(v => <button className={`side-link ${view === v.id ? 'active' : ''}`} key={v.id} onClick={() => setView(v.id)} aria-pressed={view === v.id}><i className={`pi ${v.icon}`} aria-hidden="true"/>{v.label}</button>)}<div className="sidebar-rule"/><span className="nav-section-label">Gear category</span>{categories.map((c, n) => <button className={`side-link ${category === c ? 'active' : ''}`} key={c} onClick={() => { setCategory(c); setType(null); setPack(null); }} aria-pressed={category === c}><i className={`pi ${['pi-star', 'pi-hammer', 'pi-wrench'][n]}`} aria-hidden="true"/>{c}</button>)}<div className="sidebar-note"><i className="pi pi-database" aria-hidden="true"/><p>Your gear. Your PC.<br/><span>Local storage comes next.</span></p></div></aside>
    <main className="main-content"><div className="page-heading"><div><div className="eyebrow">YOUR PERSONAL ARMORY</div><h1>{view === 'owned' ? 'A place for every piece.' : view === 'missing' ? 'Find the missing pieces.' : 'See the bigger picture.'}</h1><p>{view === 'owned' ? 'Find your gear, compare copies, and know where everything lives.' : view === 'missing' ? 'Explore unowned versions in the demonstration catalogue.' : 'Explore your collection by quest pack and expansion.'}</p></div><Button label="Import Trove export" icon="pi pi-upload" disabled tooltip="Imports are planned for the next phase" /></div>
    <div className="collection-toolbar"><div className="collection-label"><h2>{category}</h2><span>{ownedCount} / {versionCount} demo versions owned</span></div><div className="filters"><span className="search-field"><i className="pi pi-search" aria-hidden="true"/><InputText aria-label="Search items" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your armory…" /></span><Dropdown aria-label="Item type" value={type} options={[...new Set(categoryItems.map(i => i.type))]} onChange={e => setType(e.value)} placeholder="All item types" showClear /><Dropdown aria-label="Quest pack or expansion" value={pack} options={[...new Set(categoryItems.map(i => i.pack))]} onChange={e => setPack(e.value)} placeholder="All packs" showClear /></div></div>
    <div className="results-caption" aria-live="polite"><span>{view === 'packs' ? `${packs.length} packs` : `${filtered.length} items`}</span><span><i className="pi pi-mouse" aria-hidden="true"/> Click an item to inspect its copies</span></div>
    {view === 'packs' ? <div className="pack-grid">{packs.map(p => { const versions = filtered.filter(i => i.pack === p).flatMap(i => i.versions); const owned = versions.filter(v => v.copies.length).length; return <button className="pack-card" key={p} onClick={() => { setPack(p); setView('missing'); }}><i className="pi pi-map" aria-hidden="true"/><h3>{p}</h3><p>{owned} / {versions.length} versions owned</p><div className="progress-track"><div style={{ width: `${owned / versions.length * 100}%` }}/></div><span>{versions.length - owned} missing <i className="pi pi-arrow-right"/></span></button>; })}</div> : <div className="item-grid">{filtered.map(item => { const copies = item.versions.flatMap(v => v.copies); const locations = new Set(copies.map(c => c.location)).size; return <button className={`item-card ${!copies.length ? 'unowned' : ''}`} key={item.id} aria-haspopup="dialog" aria-label={`Inspect ${item.name}`} onClick={e => { keepOpen(); setSelected(item); activeCard.current = e.currentTarget; overlay.current?.show(e, e.currentTarget); }} onPointerEnter={keepOpen} onPointerLeave={scheduleClose} onFocus={keepOpen} onBlur={e => { if (!e.relatedTarget?.closest('.p-overlaypanel')) scheduleClose(); }}><div className="card-top"><span className="item-icon"><i className={`pi ${item.icon}`} aria-hidden="true"/></span><span className="item-type">{item.type}</span></div><h3>{item.name}</h3><p className="item-source">{item.pack}</p><div className="version-tags">{item.versions.map(v => <Tag key={v.ml} severity={v.copies.length ? 'success' : 'warning'} value={`ML ${v.ml} · ${v.copies.length ? 'owned' : 'missing'}`} />)}</div><div className="card-footer"><span><i className={`pi ${copies.length ? 'box' : 'minus-circle'}`} aria-hidden="true"/> {copies.length ? `${copies.length} ${copies.length === 1 ? 'copy' : 'copies'} · ${locations} ${locations === 1 ? 'location' : 'locations'}` : 'Not in your collection'}</span><i className="pi pi-arrow-up-right" aria-hidden="true"/></div></button>; })}</div>}
    {!filtered.length && <div className="empty-state"><i className="pi pi-search"/><h2>No matching items</h2><p>Try another search or change your filters.</p><Button label="Clear filters" outlined onClick={() => { setQuery(''); setType(null); setPack(null); }} /></div>}
    <footer className="page-footer"><span><i className="pi pi-circle-fill"/> Demonstration collection</span><span>Built for the gear you keep.</span></footer></main></div>}
    <OverlayPanel ref={overlay} showCloseIcon className="gear-overlay" onMouseEnter={keepOpen} onMouseLeave={scheduleClose} onFocusCapture={keepOpen} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget) && e.relatedTarget !== activeCard.current) scheduleClose(); }} dismissable>{selected && <ItemDetails key={selected.id} item={selected} />}</OverlayPanel>
  </div>;
}

