"""Recover highlighted node membership for every original frame; render the geometry as vectors."""
from pathlib import Path
import json,sys
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, distance_transform_edt
from contourpy import contour_generator

root=Path(__file__).resolve().parents[1]
data=json.loads(Path(sys.argv[1]).read_text())
sequence=json.loads(Path(sys.argv[2]).read_text())
gif=Image.open(sys.argv[3])
assert gif.n_frames==218 and gif.size==(1280,768)
nodes={p["id"]:[p["x"],p["y"]] for p in data["nodes"]}
assert sorted(nodes)==list(range(len(nodes)))
points=[nodes[i] for i in range(len(nodes))]
edges=[[e["source"],e["target"]] for e in data["edges"]]
possible_blue=set(sequence["rounds"][-1]["stateAfter"])
possible_amber=set(sequence["frontierCandidates"])|possible_blue
for r in sequence["rounds"]:possible_amber.update(r["intentPath"]);possible_amber.update(r["newlyExplored"])
coords=np.rint(points).astype(int)

# Expand the actual active node geometry to a smooth non-convex envelope.
def outline(ids):
    if len(ids)<7:return ""
    xy=coords[ids]
    x,y=xy.min(axis=0)-31; X,Y=xy.max(axis=0)+32
    field=np.ones((Y-y,X-x),dtype=bool)
    field[xy[:,1]-y,xy[:,0]-x]=False
    distance=gaussian_filter(distance_transform_edt(field),sigma=4.2)
    contours=contour_generator(x=np.arange(x,X),y=np.arange(y,Y),z=distance).lines(19.5)
    paths=[]
    for line in contours:
        if len(line)<18:continue
        line=line[::4]
        paths.append("M"+"L".join(f"{v[0]:.1f},{v[1]:.1f}" for v in line)+"Z")
    return ''.join(paths)

frames=[]
cache={}
for i in range(gif.n_frames):
    gif.seek(i)
    p=np.array(gif.convert("RGB"),dtype=np.int16)[coords[:,1],coords[:,0]]
    r,g,b=p.T
    blue=sorted(set(np.where((b-r>60)&(g-r>38)&(r<115))[0]) & possible_blue)
    amber=sorted(set(np.where((r-b>100)&(r-g>45)&(b<132))[0]) & possible_amber)
    # The source can color a nearby ring/leader at a background node. Do not
    # treat such pixels as invented research nodes outside the source cohorts.
    for group in (blue,amber):
        key=tuple(map(int,group))
        if key not in cache:cache[key]=outline(group)
    frames.append([list(map(int,blue)),list(map(int,amber)),cache[tuple(blue)],cache[tuple(amber)]])
assert frames[18][0]==sorted(sequence["initialState"])
assert set(frames[189][0])==possible_blue
unique=[];indices={};timeline=[]
for blue,amber,blue_outline,amber_outline in frames:
    key=(tuple(blue),tuple(amber))
    if key not in indices:
        indices[key]=len(unique)
        unique.append([blue,amber,blue_outline,amber_outline])
    timeline.append(indices[key])
out={"nodes":points,"edges":edges,"states":unique,"timeline":timeline,"intent":sequence["rounds"][0]["intentPath"],"frontier":sequence["frontierCandidates"]}
(root/"public/research-world/idea-vector.json").write_text(json.dumps(out,separators=(",",":"))+"\n")
