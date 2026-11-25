"""Lossless alpha atlas exporter. Usage: python scripts/export-idea-frames.py SOURCE.gif"""
import sys
import json
from bisect import bisect_right
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor
from PIL import Image
import numpy as np

root=Path(__file__).resolve().parents[1]
chapters=json.loads((root/'app/graph-svg/idea-story.json').read_text())
starts=[c[0] for c in chapters]
out=root/'public/research-world/frames'
out.mkdir(parents=True,exist_ok=True)
W,H,Y=1280,576,76

def write(job):
    number,items=job
    atlas=Image.new('RGBA',(W*3,H*2))
    for i,frame in enumerate(items):
        atlas.paste(frame, (i%3*W,i//3*H))
    atlas.save(out/f'{number:02d}.webp',lossless=True,method=3)

def frames(source, visibility):
    im=Image.open(source)
    assert im.size==(1280,768) and im.n_frames==218
    batch=[]
    for i in range(im.n_frames):
        im.seek(i)
        a=np.array(im.convert('RGBA'))
        stage=bisect_right(starts,i)-1
        mask=0
        for j,(x,y,X,Y0,*_) in enumerate(chapters[stage][4]):
            patch=a[2*y+5:2*Y0-5,2*x+5:2*X-5,:3]
            fill=np.all(patch==[252,252,251],axis=2)
            if fill.mean()>.36:
                mask|=1<<j
                patch[:]=[252,252,251]
        visibility.append(mask)
        # Recover alpha at antialiased edges rather than leaving a pale fringe.
        # Re-compositing on the original matte reproduces the source within 1 RGB level.
        a=a[Y:Y+H]
        matte=np.array([247,247,246],dtype=np.float32)
        rgb=a[:,:,:3].astype(np.float32)
        delta=rgb-matte
        minimum=np.max(np.where(delta<0,-delta/matte,delta/(255-matte)),axis=2)
        opaque_card=np.all(rgb==[252,252,251],axis=2)
        alpha=np.where(opaque_card,1,np.minimum(1,minimum*1.28))
        alpha=np.ceil(alpha*255)/255
        a[:,:,:3]=np.clip(np.rint(matte+delta/np.where(alpha>0,alpha,1)[:,:,None]),0,255)
        a[:,:,3]=np.rint(alpha*255)
        a[alpha==0]=0
        frame=Image.fromarray(a)
        if i==0:frame.save(out/'poster.webp',lossless=True,method=3)
        batch.append(frame)
        if len(batch)==6 or i==im.n_frames-1:
            yield i//6,batch
            batch=[]

if __name__=="__main__":
    visibility=[]
    with ProcessPoolExecutor(4) as pool:
        for _ in pool.map(write,frames(sys.argv[1],visibility)):pass
    (root/'app/graph-svg/idea-label-frames.json').write_text(json.dumps(visibility)+'\n')
