"use client";

import { useEffect, useRef, useState } from "react";
import { asset, chapters, displayAt, ending, last, makePlayer } from "../../graph-svg/idea-player";
import { useViewPreferences } from "../view-preferences";
import "./idea-story.css";

const clamp = (step: number) => Math.max(0, Math.min(last, step));

export function ResearchWorldStory() {
  const root = useRef<HTMLElement>(null);
  const sticky = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const jump = useRef<(step: number) => void>(() => {});
  const [shown, setShown] = useState({step:0,mask:0});
  const [failed, setFailed] = useState(false);
  const [reduce, short] = useViewPreferences();
  const manual = reduce || short;

  useEffect(() => {
    const section=root.current, stage=sticky.current, surface=canvas.current;
    if (!section || !stage || !surface) return;
    const player=makePlayer(surface);
    const header=document.querySelector("body > header");
    let top=0, selected=0, version=0, frameReq=0, wheelTimer=0, blocked=false, deltaSum=0;
    let touchY:number|null=null, usedTouch=false;
    const resize=()=>{
      top=Math.ceil(header?.getBoundingClientRect().height ?? 0);
      section.style.setProperty("--idea-top",`${top}px`);
    };
    resize();
    const observer=new ResizeObserver(resize);
    if (header) observer.observe(header);
    const geometry=()=>{
      const y=scrollY, start=section.getBoundingClientRect().top+y-top;
      const length=Math.max(1,section.offsetHeight-stage.offsetHeight);
      return {y,start,length,end:start+length,index:clamp(Math.round((y-start)/length*last))};
    };
    const select=async (index:number, animate:boolean)=>{
      const stamp=++version;
      player.cancel();
      selected=index;
      setFailed(false);
      const target=ending(index);
      const start=animate&&player.frame>=0 ? player.frame : target;
      const dir=Math.sign(target-start);
      try {
        for(let n=start;;n+=dir){
          if(stamp!==version || !await player.draw(n) || stamp!==version) break;
          const state=displayAt(n);
          setShown(old=>old.step===state.step&&old.mask===state.mask?old:state);
          if(n===target) break;
          if(n%6===0)player.warm(n);
          await new Promise(resolve=>window.setTimeout(resolve,65));
        }
        if(stamp===version)player.warm(target);
      } catch { if(stamp===version)setFailed(true); }
    };
    const go=(input:number)=>{
      const next=clamp(input);
      if(!manual){ const {start,length}=geometry(); scrollTo({top:Math.round(start+length*next/last),behavior:"instant"}); }
      if(next!==selected || player.frame<0) void select(next,!manual&&Math.abs(next-selected)===1);
    };
    jump.current=go;
    const consume=(delta:number)=>{
      const {y,start,end,index}=geometry();
      if(y<start-2&&delta>0&&y+delta>=start){go(0);return true;}
      if(y>end+2&&delta<0&&y+delta<=end){go(last);return true;}
      if(y<start-2||y>end+2)return false;
      const next=clamp(index+Math.sign(delta));
      if(next===index)return false;
      go(next);return true;
    };
    const wheel=(ev:WheelEvent)=>{
      if(ev.ctrlKey||!ev.deltaY||Math.abs(ev.deltaX)>Math.abs(ev.deltaY))return;
      clearTimeout(wheelTimer);
      wheelTimer=window.setTimeout(()=>{ blocked=false;deltaSum=0; },170);
      const d=ev.deltaY*(ev.deltaMode===1?16:ev.deltaMode===2?innerHeight:1);
      const {y,start,end,index}=geometry();
      if(y>=start-2&&y<=end+2){
        if(blocked){ev.preventDefault();return;}
        if((index===0&&d<0)||(index===last&&d>0))return;
        deltaSum+=d;
        if(Math.abs(deltaSum)<24){ev.preventDefault();return;}
      }
      if(consume(deltaSum||d)){blocked=true;ev.preventDefault();}
    };
    const touchstart=(ev:TouchEvent)=>{
      if(ev.touches.length!==1||(ev.target instanceof Element&&ev.target.closest("button")))return;
      touchY=ev.touches[0].clientY;usedTouch=false;
    };
    const touchmove=(ev:TouchEvent)=>{
      if(touchY===null||ev.touches.length!==1||!ev.cancelable)return;
      if(usedTouch){ev.preventDefault();return;}
      const {y,start,end,index}=geometry();
      if(y<start-2||y>end+2)return;
      const d=touchY-ev.touches[0].clientY;
      if((index===0&&d<0)||(index===last&&d>0))return;
      if(Math.abs(d)<28){if(Math.abs(d)>6)ev.preventDefault();return;}
      if(consume(d)){usedTouch=true;ev.preventDefault();}
    };
    const touchend=()=>{touchY=null;usedTouch=false;};
    const sync=()=>{
      if(frameReq)return;
      frameReq=requestAnimationFrame(()=>{
        frameReq=0;
        const {y,start,end,index}=geometry();
        if(index!==selected&&y>=start-innerHeight&&y<=end+innerHeight) void select(index,Math.abs(index-selected)===1);
      });
    };
    const preload=new IntersectionObserver(([entry])=>{
      if(!entry.isIntersecting)return;
      preload.disconnect();
      if(player.frame<0)void select(manual?0:geometry().index,false);
    },{rootMargin:"350px"});
    preload.observe(stage);
    if(!manual){
      window.addEventListener("wheel",wheel,{passive:false});
      window.addEventListener("scroll",sync,{passive:true});
      stage.addEventListener("touchstart",touchstart,{passive:true});
      stage.addEventListener("touchmove",touchmove,{passive:false});
      stage.addEventListener("touchend",touchend);
      stage.addEventListener("touchcancel",touchend);
    }
    return ()=>{
      version++;player.cancel();preload.disconnect();observer.disconnect();cancelAnimationFrame(frameReq);clearTimeout(wheelTimer);
      window.removeEventListener("wheel",wheel);window.removeEventListener("scroll",sync);
      stage.removeEventListener("touchstart",touchstart);stage.removeEventListener("touchmove",touchmove);
      stage.removeEventListener("touchend",touchend);stage.removeEventListener("touchcancel",touchend);
    };
  },[manual]);

  const {step,mask}=shown;
  const [,name,title,body,items]=chapters[step];
  const badges=items.filter((_,index)=>mask&(1<<index));
  return (
    <section ref={root} id="research-world" className="idea-story" data-manual={manual} aria-label="Research World 图谱讲解">
      <div ref={sticky} className="idea-stage" tabIndex={0} onKeyDown={event=>{
        if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(event.key))return;
        const next=clamp(step+(["ArrowRight","ArrowDown"].includes(event.key)?1:-1));
        if(next!==step){event.preventDefault();jump.current(next);}
      }}>
        <header className="idea-heading">
          <div>
            <h2>{step===0?"Research World":"Idea Space"}</h2>
            {step>0&&<ul className="idea-key"><li>已理解</li><li>正在探索</li><li>未探索</li></ul>}
          </div>
          <div className="idea-progress">
            <p>{step===0?"概览":`${String(step).padStart(2,"0")} / 10`} <b>·</b> {name}</p>
            <nav aria-label="章节进度">{chapters.slice(1).map((chapter,index)=><button key={chapter[0]} type="button" aria-label={`第 ${index+1} 步：${chapter[1]}`} aria-current={step===index+1?"step":undefined} data-passed={step>=index+1} onClick={()=>jump.current(index+1)}><span /></button>)}</nav>
          </div>
        </header>
        <div className="idea-visual">
          <div className="idea-art">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="idea-poster" src={`${asset}/poster.webp`} alt="" width={1280} height={576}/>
            <canvas ref={canvas} width={1280} height={576} role="img" aria-label={`研究图谱：${name}`}/>
            {badges.map(([x,y,X,Y,head,detail,tone])=><div key={head} className="idea-badge" data-tone={tone} style={{left:`${(x+X)/12.8}%`,top:`${(y+Y-76)/5.76}%`,width:`${(X-x)/6.4}%`}}><strong>{head}</strong><small>{detail}</small></div>)}
          </div>
        </div>
        {badges.length>0&&<ul className="idea-mobile-labels">{badges.map(([, , , , head,detail,tone])=><li key={head} data-tone={tone}><strong>{head}</strong><span>{detail}</span></li>)}</ul>}
        <div className="idea-caption"><h3>{title}</h3><p>{body}</p></div>
        <footer className="idea-controls">
          <button type="button" aria-label="上一段" disabled={step===0} onClick={()=>jump.current(step-1)}>←</button>
          <span>{manual?"切换章节":step===last?"继续下滑查看正文":"下滑一步，展开下一段"}</span>
          <button type="button" aria-label="下一段" disabled={step===last} onClick={()=>jump.current(step+1)}>→</button>
        </footer>
        {failed&&<p className="idea-status" role="status">画面暂未加载，请再试一次。</p>}
      </div>
    </section>
  );
}
