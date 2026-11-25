"""Read the original Research World GIF into visible SVG node prefix counts."""
import hashlib
import json
from pathlib import Path
import sys

from PIL import Image

root = Path(__file__).resolve().parents[1]
graph = json.loads(Path(sys.argv[1]).read_text())
source = Path(sys.argv[2])
vector = json.loads((root / "public/research-world/idea-vector.json").read_text())
nodes = graph["nodes"]
assert [p["id"] for p in nodes] == list(range(len(nodes)))
assert [p["birth"] for p in nodes] == sorted(p["birth"] for p in nodes)
assert [[p["x"], p["y"]] for p in nodes] == vector["nodes"]
assert [[e["source"], e["target"]] for e in graph["edges"]] == vector["edges"]
gif = Image.open(source)
assert gif.n_frames == 118 and gif.size == (1280, 768)
points = [(round(p["x"]), round(p["y"])) for p in nodes]

gif.seek(gif.n_frames - 1)
settled = gif.convert("RGB").load()
counts = []
cuts = []
last_heading = None
for i in range(gif.n_frames):
    gif.seek(i)
    image = gif.convert("RGB")
    heading = image.crop((1060, 25, 1252, 62)).tobytes()
    if heading != last_heading:
        cuts.append(i)
    last_heading = heading
    pixels = image.load()
    # Graph IDs are in source birth order. Fit a prefix by minimizing
    # disagreements with observed visible centers. A neighboring node or
    # crossing edge can cover a center early, so don't trace single pixels.
    score = best_score = 0
    count = 0
    for k, point in enumerate(points, 1):
        score += 1 if sum(pixels[point]) - sum(settled[point]) <= 20 else -1
        if score > best_score:
            best_score, count = score, k
    counts.append(max(count, counts[-1] if counts else 0))

assert cuts == [0, 24, 48, 72, 96]
assert counts[0] == 0 and counts[-1] == len(nodes)
data = {"sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(), "starts": cuts, "counts": counts}
(root / "app/graph-svg/world-growth.json").write_text(json.dumps(data, separators=(",", ":")) + "\n")
