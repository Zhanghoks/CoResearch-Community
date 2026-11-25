import type { ReactElement } from "react";

type Point = [number, number];
type State = [number[],number[],string,string];
export interface IdeaVectorData {
  nodes: Point[];
  edges: [number,number][];
  states: State[];
  timeline: number[];
  intent: number[];
  frontier: number[];
}
export type Callout = [number,number,number,number,string,string,"blue"|"amber"];
const assetRoot = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/research-world`;
let load: Promise<IdeaVectorData> | null = null;
export function loadIdeaVector() {
  load ??= fetch(`${assetRoot}/idea-vector.json`).then(response=>{
    if (!response.ok) throw new Error("Could not load the graph");
    return response.json() as Promise<IdeaVectorData>;
  }).catch((error: unknown)=>{load=null;throw error;});
  return load;
}
const memo = new WeakMap<IdeaVectorData,{dots:string;edges:string}>();
const xy = ([x,y]: Point) => `${x},${y}`;
const line = (a: Point,b: Point) => `M${xy(a)}L${xy(b)}`;
const diamond = ([x,y]: Point,r=3.1) => `M${x},${y-r}l${r},${r}l${-r},${r}l${-r},${-r}Z`;

function base(data:IdeaVectorData) {
  let paths=memo.get(data);
  if(!paths){
    paths={
      edges:data.edges.map(([i,j])=>line(data.nodes[i],data.nodes[j])).join(""),
      dots:data.nodes.map(dot).join(""),
    };
    memo.set(data,paths);
  }
  return paths;
}
function closest(nodes:Point[], ids:number[], at:Point) {
  return ids.reduce<number|undefined>((best,id)=>{
    const dist=([x,y]:Point)=>(x-at[0])**2+(y-at[1])**2;
    return best===undefined||dist(nodes[id])<dist(nodes[best])?id:best;
  },undefined);
}

const dot = ([x,y]: Point) => `M${x-2},${y}a2,2 0 1,0 4,0a2,2 0 1,0 -4,0Z`;
const tone = (a: number[], b: number[], t: number) => `rgb(${a.map((c,i)=>c+(b[i]-c)*t).join(" ")})`;

export function IdeaVectorGraph({data,frame,timelineFrame,step,visibleNodes,badges,name}:{
  data:IdeaVectorData;frame:number;timelineFrame:number;step:number;visibleNodes?:number;badges:Callout[];name:string;
}):ReactElement {
  const {nodes,edges}=data;
  const [blue,amber,blueOutline,amberOutline]=data.states[data.timeline[frame]];
  const blueSet=new Set(blue), amberSet=new Set(amber);
  const edgeInk=["",""];
  for(const [a,b] of edges){
    if(blueSet.has(a)&&blueSet.has(b))edgeInk[0]+=line(nodes[a],nodes[b]);
    else if((amberSet.has(a)&&(amberSet.has(b)||blueSet.has(b)))||(amberSet.has(b)&&blueSet.has(a)))edgeInk[1]+=line(nodes[a],nodes[b]);
  }
  const shownCount=visibleNodes??nodes.length;
  const paths=shownCount===nodes.length?base(data):{
    edges:edges.filter(([i,j])=>i<shownCount&&j<shownCount).map(([i,j])=>line(nodes[i],nodes[j])).join(""),
    dots:nodes.slice(0,shownCount).map(dot).join(""),
  };
  const blend=step===0?0:Math.min(frame/18,1);
  const intent=data.intent.map(id=>nodes[id]);
  const intentLength=step===3?Math.min(intent.length,1+Math.floor((frame-38)/3)):0;
  const questionPoint:Point=[1168,316];
  const showBoundary=step>=9;
  const clamp01=(n:number)=>Math.min(1,Math.max(0,n));
  const breach=clamp01((frame-195)/7);
  const pathProgress=clamp01((frame-191)/18);
  const questionProgress=clamp01((frame-203)/10);
  const anchor=data.frontier.reduce((best,id)=>nodes[id][0]>nodes[best][0]?id:best);
  const frontierPoint=nodes[anchor];
  return (
    <svg className="idea-vector" data-frame={timelineFrame} data-visible-nodes={shownCount} data-nodes={nodes.length} data-edges={edges.length} viewBox="0 76 1280 576" role="img" aria-label={`矢量研究图谱：${name}`}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path data-layer="base-edges" d={paths.edges} stroke={tone([102,116,117],[166,176,173],blend)} strokeWidth={.82-.13*blend} opacity={.43+.04*blend}/>
        <path data-layer="base-nodes" d={paths.dots} fill={tone([52,66,68],[111,122,123],blend)} opacity={.91-.22*blend}/>
        <path data-region="blue" d={blueOutline} fill="#d5e5f3" fillOpacity={.36} stroke="#4b82b4" strokeOpacity={.93} strokeWidth={1.45}/>
        <path data-region="amber" d={amberOutline} fill="#f1dfc8" fillOpacity={.35} stroke="#bb843d" strokeOpacity={.92} strokeWidth={1.4}/>
        <path d={edgeInk[0]} stroke="#4b82b6" strokeWidth={1.15} opacity={.88}/>
        <path d={edgeInk[1]} stroke="#bf752e" strokeWidth={1.2} opacity={.85}/>
        {intentLength>1&&<polyline points={intent.slice(0,intentLength).map(xy).join(" ")} stroke="#b5722a" strokeWidth={1.15} strokeDasharray="4 3"/>}
        <path d={blue.map(i=>diamond(nodes[i])).join("")} fill="#2a6397"/>
        <path d={amber.map(i=>diamond(nodes[i])).join("")} fill="#aa631e"/>
        {step>=1&&step<=4&&blue.length>0&&<circle cx={775} cy={360} r={8.4} stroke="#2a6397" strokeWidth={1.55}/>}
        {showBoundary&&<g data-frontier-boundary={breach===0?"closed":"breached"} opacity={clamp01((frame-170)/9)}>
          {/* This open arc marks the local literature frontier, not the blue Idea State. */}
          <path d="M1103 227 Q1143 252 1143 307 M1143 325 Q1143 375 1100 398" stroke="#77638d" strokeWidth={2} strokeDasharray="5 4"/>
          <path d={`M1143 307V${316-9*breach} M1143 325V${316+9*breach}`} stroke="#77638d" strokeWidth={2} strokeOpacity={1-breach}/>
          <circle cx={frontierPoint[0]} cy={frontierPoint[1]} r={6.5} stroke="#77638d" strokeWidth={1.45}/>
        </g>}
        {pathProgress>0&&<path data-boundary-crossing d={line(frontierPoint,[1161,316])} pathLength={1} stroke="#995713" strokeWidth={2.35} strokeDasharray="1" strokeDashoffset={1-pathProgress}/>}
        {questionProgress>0&&<g data-open-question opacity={questionProgress}>
          <circle cx={questionPoint[0]} cy={questionPoint[1]} r={12} stroke="#ad691f" strokeOpacity={.6} strokeWidth={1.25} strokeDasharray="2.2 3"/>
          <path d={diamond(questionPoint,6.5)} fill="#fdfff7" stroke="#995713" strokeWidth={1.7}/>
        </g>}
        {badges.map(([x,y,X,Y,title,,tone])=>{
          const center:Point=[x+X,y+Y], id=closest(nodes,tone==="amber"&&amber.length?amber:blue,center);
          if(id===undefined&&title!=="Open Question")return null;
          const target=title==="Open Question"?questionPoint:nodes[id!];
          const origin:Point=[center[0],target[1]>=center[1]?Y*2-1:y*2+1];
          return <path key={title} d={line(origin,target)} stroke={tone==="blue"?"#4c83b1":"#bc803a"} strokeWidth={1} opacity={.76}/>;
        })}
      </g>
    </svg>
  );
}
