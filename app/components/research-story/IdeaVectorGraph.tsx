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
      dots:data.nodes.map(([x,y])=>`M${x-2},${y}a2,2 0 1,0 4,0a2,2 0 1,0 -4,0Z`).join(""),
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

export function IdeaVectorGraph({data,frame,step,badges,name}:{
  data:IdeaVectorData;frame:number;step:number;badges:Callout[];name:string;
}):ReactElement {
  const {nodes,edges}=data;
  const [blue,amber,blueOutline,amberOutline]=data.states[data.timeline[frame]];
  const blueSet=new Set(blue), amberSet=new Set(amber);
  const edgeInk=["",""];
  for(const [a,b] of edges){
    if(blueSet.has(a)&&blueSet.has(b))edgeInk[0]+=line(nodes[a],nodes[b]);
    else if((amberSet.has(a)&&(amberSet.has(b)||blueSet.has(b)))||(amberSet.has(b)&&blueSet.has(a)))edgeInk[1]+=line(nodes[a],nodes[b]);
  }
  const paths=base(data);
  const intent=data.intent.map(id=>nodes[id]);
  const intentLength=step===3?Math.min(intent.length,1+Math.floor((frame-38)/3)):0;
  const questionPoint:Point=[1168,316];
  const frontier=step===10&&frame>=201?data.frontier.filter(id=>nodes[id][0]>1060).slice(0,3):[];
  return (
    <svg className="idea-vector" data-frame={frame} data-nodes={nodes.length} data-edges={edges.length} viewBox="0 76 1280 576" role="img" aria-label={`矢量研究图谱：${name}`}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={paths.edges} stroke={step===0?"#667475":"#a6b0ad"} strokeWidth={step===0?.82:.69} opacity={step===0?.43:.47}/>
        <path d={paths.dots} fill={step===0?"#344244":"#6f7a7b"} opacity={step===0?.91:.69}/>
        <path data-region="blue" d={blueOutline} fill="#d5e5f3" fillOpacity={.36} stroke="#4b82b4" strokeOpacity={.93} strokeWidth={1.45}/>
        <path data-region="amber" d={amberOutline} fill="#f1dfc8" fillOpacity={.35} stroke="#bb843d" strokeOpacity={.92} strokeWidth={1.4}/>
        <path d={edgeInk[0]} stroke="#4b82b6" strokeWidth={1.15} opacity={.88}/>
        <path d={edgeInk[1]} stroke="#bf752e" strokeWidth={1.2} opacity={.85}/>
        {intentLength>1&&<polyline points={intent.slice(0,intentLength).map(xy).join(" ")} stroke="#b5722a" strokeWidth={1.15} strokeDasharray="4 3"/>}
        <path d={blue.map(i=>diamond(nodes[i])).join("")} fill="#2a6397"/>
        <path d={amber.map(i=>diamond(nodes[i])).join("")} fill="#aa631e"/>
        {step>=1&&step<=4&&blue.length>0&&<circle cx={775} cy={360} r={8.4} stroke="#2a6397" strokeWidth={1.55}/>}
        {frontier.map(i=><g key={i}>
          <path d={line(nodes[i],questionPoint)} stroke="#bd781e" strokeWidth={1.03} strokeDasharray="3 3" opacity={.79}/>
          <circle cx={nodes[i][0]} cy={nodes[i][1]} r={7} stroke="#b46e22" strokeWidth={1.2}/>
        </g>)}
        {frontier.length>0&&<path d={diamond(questionPoint,6.5)} fill="#fdfff7" stroke="#ba782c" strokeWidth={1.15}/>}
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
