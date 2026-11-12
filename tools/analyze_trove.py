"""Measure and round-trip a lossless dictionary encoding of the supplied exports."""
import collections
import gzip
import hashlib
import base64
import json
from pathlib import Path

SOURCE = Path('C:/Users/Catalin TC/AppData/Roaming/Dungeon Helper/plugins/Trove/Moonsea/7AF4C1DAF0D6DF20B3DDC20E72D19C61843BE44364E5CB8C2D15E2B645623EAC')
NAMES = ['-147211412827388677-inventory.json', '-159596311802643573-inventory.json', 'account.json', 'Arbytresse-1-159596311802643573-bank.json', 'Choosen Sunrise-156218612074831076-bank.json', 'Choosen Sunrise-156218612074831076-inventory.json', 'Lladie Emberblade-147211412827388677-bank.json']
OUT = Path(__file__).resolve().parents[1] / 'analysis'
OUT.mkdir(exist_ok=True)

def dump(x):
    return json.dumps(x, ensure_ascii=False, separators=(',', ':')).encode('utf-8')

docs = {n: json.loads((SOURCE / n).read_text(encoding='utf-8-sig')) for n in NAMES}
counts = collections.Counter()
field_bytes = collections.Counter()
items = []

def inspect(x):
    if isinstance(x, dict):
        if 'ItemId' in x and 'Name' in x:
            items.append(x)
            for k, v in x.items():
                field_bytes[k] += len(dump(v))
        for k, v in x.items():
            counts[k] += 1
            inspect(v)
    elif isinstance(x, list):
        for v in x:
            inspect(v)
    elif isinstance(x, str):
        counts[x] += 1

inspect(docs)
# Only intern strings whose repetitions save more than their dictionary entry costs.
strings = [s for s, n in counts.items() if (len(dump(s)) - 7) * n > len(dump(s)) + 1]
ids = {s: i for i, s in enumerate(strings)}

def encode(x):
    if isinstance(x, dict):
        return {('@' + str(ids[k]) if k in ids else k): encode(v) for k, v in x.items()}
    if isinstance(x, list):
        return [encode(v) for v in x]
    if isinstance(x, str) and x in ids:
        return {'$': ids[x]}
    return x

def decode(x):
    if isinstance(x, dict):
        if set(x) == {'$'}:
            return strings[x['$']]
        return {(strings[int(k[1:])] if k.startswith('@') else k): decode(v) for k, v in x.items()}
    if isinstance(x, list):
        return [decode(v) for v in x]
    return x

encoded = encode(docs)
assert decode(encoded) == docs
packed = dump({'format': 'trove-dictionary-v1', 'strings': strings, 'files': encoded})
original = sum((SOURCE / n).stat().st_size for n in NAMES)
compact = dump(docs)
gz = gzip.compress(packed, mtime=0)
assert gzip.decompress(gz) == packed
(OUT / 'trove-packed.json').write_bytes(packed)
(OUT / 'trove-packed.json.gz').write_bytes(gz)
report = {
    'source_files': len(docs), 'original_bytes': original, 'minified_bytes': len(compact),
    'dictionary_json_bytes': len(packed), 'dictionary_gzip_bytes': len(gz),
    'item_records_including_nested': len(items),
    'distinct_item_ids': len({str(i['ItemId']) for i in items}),
    'unique_icons': len({i.get('IconSource') for i in items if i.get('IconSource')}),
    'largest_item_fields_bytes': field_bytes.most_common(12),
    'top_level_keys': {n: list(d) if isinstance(d, dict) else type(d).__name__ for n,d in docs.items()},
    'treasure_types': dict(collections.Counter(i.get('TreasureType') for i in items)),
    'all_item_fields': sorted({k for i in items for k in i}),
    'round_trip_verified': True,
}

# Browser-facing mapping: move embedded images to a separate asset store and
# represent large integers as strings before JavaScript can round them.
icons = {}
def map_browser(x):
    if isinstance(x, dict):
        result = {}
        for k, v in x.items():
            if k == 'IconSource' and isinstance(v, str) and v.startswith('data:'):
                digest = hashlib.sha256(v.encode()).hexdigest()
                icons[digest] = v
                result['IconRef'] = digest
            else:
                result[k] = map_browser(v)
        return result
    if isinstance(x, list):
        return [map_browser(v) for v in x]
    if isinstance(x, int) and not isinstance(x, bool) and abs(x) > 2**53 - 1:
        return str(x)
    return x

mapped = map_browser(docs)

def verify_mapping(before, after):
    if isinstance(before, dict):
        assert len(before) == len(after)
        for k, v in before.items():
            if k == 'IconSource' and isinstance(v, str) and v.startswith('data:'):
                assert icons[after['IconRef']] == v
            else:
                verify_mapping(v, after[k])
    elif isinstance(before, list):
        assert len(before) == len(after)
        for a, b in zip(before, after):
            verify_mapping(a, b)
    elif isinstance(before, int) and not isinstance(before, bool) and abs(before) > 2**53 - 1:
        assert str(before) == after
    else:
        assert before == after

verify_mapping(docs, mapped)
browser_bytes = dump({'format': 'trove-browser-v1', 'files': mapped})
(OUT / 'trove-inventory.json').write_bytes(browser_bytes)
(OUT / 'trove-inventory.json.gz').write_bytes(gzip.compress(browser_bytes, mtime=0))
(OUT / 'trove-icons.json').write_bytes(dump(icons))
binary_icons = sum(len(base64.b64decode(v.split(',', 1)[1])) for v in icons.values())
report.update({
    'browser_inventory_bytes': len(browser_bytes),
    'browser_inventory_gzip_bytes': len(gzip.compress(browser_bytes, mtime=0)),
    'separate_unique_icons_json_bytes': len(dump(icons)),
    'separate_unique_icons_binary_bytes': binary_icons,
    'browser_mapping_verified': True,
    'browser_inventory_below_1MB': len(browser_bytes) < 1_000_000,
})
(OUT / 'trove-size-report.json').write_bytes(json.dumps(report, ensure_ascii=False, indent=2).encode())
print(json.dumps(report, ensure_ascii=False, indent=2))
