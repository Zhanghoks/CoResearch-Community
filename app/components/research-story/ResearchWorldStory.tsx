"use client";

import { useEffect, useRef, useState } from "react";
import { asset, chapters, displayAt, ending, growthCount, last } from "../../graph-svg/idea-player";
import { IdeaVectorGraph, loadIdeaVector, type IdeaVectorData } from "./IdeaVectorGraph";
import { useViewPreferences } from "../view-preferences";
import "./idea-story.css";

const WHEEL_THRESHOLD = 24;
const TOUCH_THRESHOLD = 38;
const GESTURE_GAP_MS = 165;
const clamp = (step: number) => Math.max(0, Math.min(last, step));

export function ResearchWorldStory() {
  const root = useRef<HTMLElement>(null);
  const sticky = useRef<HTMLDivElement>(null);
  const [vector, setVector] = useState<IdeaVectorData | null>(null);
  const jump = useRef<(step: number) => void>(() => {});
  const shift = useRef<(delta: number) => boolean>(() => false);
  const exit = useRef<HTMLDivElement>(null);
  const engaged = useRef(false);
  const resume = useRef<() => void>(() => {});
  const restart = useRef<() => void>(() => {});
  const position = useRef({ chapter: last, frame: -1 });
  const pause = useRef<() => void>(() => {});
  const [activeMode, setActiveMode] = useState(false);
  const [visited, setVisited] = useState(false);
  const [shown, setShown] = useState(() => ({...displayAt(ending(last)),frame:-1}));
  const [failed, setFailed] = useState(false);
  const [reduce, short] = useViewPreferences();
  const manual = reduce || short;

  useEffect(() => {
    const section=root.current, stage=sticky.current;
    if (!section || !stage) return;
    let currentFrame=position.current.frame;
    const header=document.querySelector("body > header");
    let selected=position.current.chapter, version=0, wheelTimer=0, blocked=false, deltaSum=0;
    let touch:{x:number;y:number;axis:"x"|"y"|null;used:boolean;visual:boolean}|null=null;
    const feedback=(distance:number, threshold:number)=>{
      stage.style.setProperty("--idea-gesture", String(Math.min(1,Math.abs(distance)/threshold)));
      stage.dataset.direction=distance<0?"back":distance>0?"forward":"none";
    };
    const resize=()=>{
      section.style.setProperty("--idea-top",`${Math.ceil(header?.getBoundingClientRect().height ?? 0)}px`);
    };
    resize();
    const observer=new ResizeObserver(resize);
    if(header)observer.observe(header);
    const select=async (index:number, animate:boolean, fromBeginning=false)=>{
      const stamp=++version;
      selected=index;
      position.current.chapter=index;
      setFailed(false);
      const target=ending(index);
      const start=animate&&index===1&&(fromBeginning||currentFrame<=0) ? 1 : animate&&currentFrame>=0 ? currentFrame : target;
      const dir=Math.sign(target-start);
      stage.dataset.moving=String(dir!==0);
      const interval=Math.max(24, Math.min(42, 630/Math.max(1,Math.abs(target-start))));
      try {
        const vectorData=await loadIdeaVector();
        if(stamp!==version)return;
        setVector(vectorData);
        for(let n=start;;n+=dir){
          if(stamp!==version)break;
          currentFrame=n;
          position.current.frame=n;
          setShown({...displayAt(n),frame:n});
          if(n===target) break;
          await new Promise(resolve=>window.setTimeout(resolve,interval));
        }
      } catch { if(stamp===version)setFailed(true); }
      finally {
        if(stamp===version){stage.dataset.moving="false";feedback(0,1);}
      }
    };
    const go=(input:number)=>{
      const next=clamp(input);
      if(next!==selected || currentFrame!==ending(next)) void select(next,!manual&&Math.abs(next-selected)===1);
    };
    restart.current=()=>{void select(1,!manual,true);};
    resume.current=()=>{if(currentFrame!==ending(selected))void select(selected,!manual&&currentFrame>=0);};
    pause.current=()=>{
      version++;clearTimeout(wheelTimer);
      blocked=false;deltaSum=0;touch=null;
      stage.dataset.moving="false";
      feedback(0,1);
    };
    jump.current=go;
    shift.current=(delta)=>{
      if(!engaged.current)return false;
      const next=clamp(selected+delta);
      if(next===selected||next===0)return false;
      go(next);return true;
    };
    const release=()=>{
      pause.current();engaged.current=false;setActiveMode(false);
    };

    const wheel=(ev:WheelEvent)=>{
      if(!engaged.current||ev.ctrlKey||!ev.deltaY||Math.abs(ev.deltaX)>Math.abs(ev.deltaY))return;
      clearTimeout(wheelTimer);
      wheelTimer=window.setTimeout(()=>{
        if(stage.dataset.moving!=="true")feedback(0,1);
        blocked=false;deltaSum=0;
      },GESTURE_GAP_MS);
      if(blocked){ev.preventDefault();return;}
      const d=ev.deltaY*(ev.deltaMode===1?16:ev.deltaMode===2?innerHeight:1);
      if((selected<=1&&d<0)||(selected===last&&d>0)){release();return;}
      ev.preventDefault();
      if(deltaSum&&(deltaSum>0)!==(d>0))deltaSum=0;
      deltaSum+=d;
      feedback(deltaSum,WHEEL_THRESHOLD);
      if(Math.abs(deltaSum)>=WHEEL_THRESHOLD&&shift.current(Math.sign(deltaSum)))blocked=true;
    };
    const touchstart=(ev:TouchEvent)=>{
      if(!engaged.current||ev.touches.length!==1||(ev.target instanceof Element&&ev.target.closest("button")))return;
      const {clientX:x,clientY:y}=ev.touches[0];
      touch={x,y,axis:null,used:false,visual:ev.target instanceof Element&&Boolean(ev.target.closest(".idea-visual"))};
    };
    const touchmove=(ev:TouchEvent)=>{
      if(!engaged.current||!touch||ev.touches.length!==1||(!touch.visual&&!ev.cancelable))return;
      if(touch.used){if(ev.cancelable)ev.preventDefault();return;}
      const {clientX,clientY}=ev.touches[0];
      const d=touch.y-clientY, dx=touch.x-clientX;
      if(!touch.axis&&Math.max(Math.abs(d),Math.abs(dx))>6)touch.axis=Math.abs(dx)>Math.abs(d)?"x":"y";
      if(touch.axis!=="y")return;
      if((selected<=1&&d<0)||(selected===last&&d>0)){
        if(!touch.visual){release();return;}
        if(Math.abs(d)<TOUCH_THRESHOLD)return;
        if(ev.cancelable)ev.preventDefault();
        release();
        if(d>0)exit.current?.scrollIntoView({block:"start",behavior:"smooth"});
        else scrollBy({top:-Math.max(170,innerHeight*.55),behavior:"smooth"});
        return;
      }
      if(ev.cancelable)ev.preventDefault();
      feedback(d,TOUCH_THRESHOLD);
      if(Math.abs(d)>=TOUCH_THRESHOLD&&shift.current(Math.sign(d)))touch.used=true;
    };
    const touchend=()=>{
      if(!touch?.used)feedback(0,1);
      touch=null;
    };
    const preload=new IntersectionObserver(([entry])=>{
      if(!entry.isIntersecting)return;
      preload.disconnect();
      if(currentFrame<0&&version===0)void select(selected,false);
    },{rootMargin:"350px"});
    preload.observe(stage);
    const visibility=new IntersectionObserver(([entry])=>{
      if(!entry.isIntersecting&&engaged.current)release();
    });
    visibility.observe(stage);
    if(!manual){
      stage.addEventListener("wheel",wheel,{passive:false});
      stage.addEventListener("touchstart",touchstart,{passive:true});
      stage.addEventListener("touchmove",touchmove,{passive:false});
      stage.addEventListener("touchend",touchend);
      stage.addEventListener("touchcancel",touchend);
    }
    return ()=>{
      shift.current=()=>false;resume.current=()=>{};restart.current=()=>{};pause.current=()=>{};
      delete stage.dataset.moving;feedback(0,1);
      version++;preload.disconnect();visibility.disconnect();observer.disconnect();clearTimeout(wheelTimer);
      stage.removeEventListener("wheel",wheel);
      stage.removeEventListener("touchstart",touchstart);stage.removeEventListener("touchmove",touchmove);
      stage.removeEventListener("touchend",touchend);stage.removeEventListener("touchcancel",touchend);
    };
  },[manual]);

  function startStory(next?:number){
    engaged.current=true;
    setActiveMode(true);
    setVisited(true);
    if(next===undefined){
      if(!visited||shown.step===last)restart.current();
      else resume.current();
    }
    else jump.current(next);
    sticky.current?.focus({preventScroll:true});
  }
  function skipStory(){
    engaged.current=false;
    setActiveMode(false);
    pause.current();
    exit.current?.scrollIntoView({block:"start",behavior:"instant"});
    exit.current?.focus({preventScroll:true});
  }
  const {step,mask,frame,ideaFrame,visibleNodes}=shown;
  const isIdea=step>growthCount;
  const showBoundary=step>=last-1;
  const [,name,title,body,items]=chapters[step];
  const badges=items.filter((_,index)=>mask&(1<<index));
  return (
    <>
    <section ref={root} id="research-world" className="idea-story" data-manual={manual} data-engaged={activeMode} aria-label="Research World 图谱讲解">
      <div ref={sticky} className="idea-stage" tabIndex={0} onKeyDown={event=>{
        if(!engaged.current)return;
        if(event.key==="Escape"){event.preventDefault();skipStory();return;}
        if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","PageUp","PageDown"].includes(event.key))return;
        const delta=["ArrowRight","ArrowDown","PageDown"].includes(event.key)?1:-1;
        if(shift.current(delta))event.preventDefault();
      }}>
        <header className="idea-heading">
          <div>
            <h2>{isIdea?"Idea Space":"Research World"}</h2>
            <ul className="idea-key" data-show={isIdea} aria-hidden={!isIdea}><li>已理解</li><li>正在探索</li><li>未探索</li>{showBoundary&&<li className="idea-boundary-key">已有研究边界</li>}</ul>
          </div>
          <div className="idea-progress">
            <p>{step===0?"概览":`${String(step).padStart(2,"0")} / ${last}`} <b>·</b> {name}</p>
            <nav aria-label="章节进度">{chapters.slice(1).map((chapter,index)=><button key={chapter[0]} type="button" aria-label={`第 ${index+1} 步：${chapter[1]}`} aria-current={step===index+1?"step":undefined} data-passed={step>=index+1} data-phase-start={index===growthCount} onClick={()=>startStory(index+1)}><span /></button>)}</nav>
          </div>
        </header>
        <div className="idea-visual">
          <div className="idea-art">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="idea-poster" src={`${asset}/poster.webp`} alt="" width={1280} height={576}/>
            {vector&&frame>=0&&<IdeaVectorGraph data={vector} frame={ideaFrame} timelineFrame={frame} step={isIdea?step-growthCount:0} visibleNodes={visibleNodes} badges={badges} name={name}/>}
            {vector&&badges.map(([x,y,X,Y,head,detail,tone])=><div key={head} className="idea-badge" data-tone={tone} style={{left:`${(x+X)/12.8}%`,top:`${(y+Y-76)/5.76}%`,width:`${(X-x)/6.4}%`}}><strong>{head}</strong><small>{detail}</small></div>)}
          </div>
        </div>
        <ul className="idea-mobile-labels">{badges.map(([, , , , head,detail,tone])=><li key={head} data-tone={tone}><strong>{head}</strong><span>{detail}</span></li>)}</ul>
        <div className="idea-caption"><h3>{title}</h3><p>{body}</p></div>
        <footer className="idea-controls">
          {activeMode ? <div className="idea-step-controls">
            <button type="button" data-dir="back" aria-label="上一段" disabled={step<=1} onClick={()=>shift.current(-1)}>←</button>
            <span className="idea-gesture-track" aria-hidden="true"><i /></span>
            <span>{manual?"切换章节":step===last?"已读完，可以继续下滑":"一滑一步 · 上滑回看"}</span>
            <button type="button" data-dir="forward" aria-label="下一段" disabled={step===last} onClick={()=>shift.current(1)}>→</button>
          </div> : <button type="button" className="idea-start" onClick={()=>startStory()}>{visited?(step===last?"从头再看":"继续讲解"):"开始讲解"} <span aria-hidden="true">→</span></button>}
          <button type="button" className="idea-skip" onClick={skipStory}>{activeMode?"跳过讲解":"直接去正文"} <span aria-hidden="true">↓</span></button>
        </footer>
        {failed&&<p className="idea-status" role="status">画面暂未加载，请再试一次。</p>}
      </div>
    </section>
    <div id="research-world-end" ref={exit} tabIndex={-1} className="idea-exit" />
    </>
  );
}
