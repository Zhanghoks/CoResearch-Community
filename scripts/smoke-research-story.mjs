import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";
const url=process.env.RW_SMOKE_URL??"http://localhost:3457";
const out=process.env.RW_SMOKE_OUTPUT??"smoke-artifacts/research-story";
const executablePath=process.env.RW_CHROMIUM_PATH;
const b=await chromium.launch(executablePath?{executablePath,args:["--no-sandbox","--disable-dev-shm-usage"]}:{});
fs.mkdirSync(out,{recursive:true});
const ideaOffset=119;
const ends=[0,24,48,72,96,118,...[18,37,56,79,100,125,144,170,189,217].map(n=>ideaOffset+n)];
const wait=(p,n)=>p.locator(`#research-world .idea-vector[data-frame="${n}"]`).waitFor({timeout:11000});
async function setup(p) {
  await p.goto(url,{waitUntil:"networkidle"});
  await p.locator("#research-world").evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY-Math.ceil(document.querySelector("body > header").getBoundingClientRect().height),behavior:"instant"}));
  await wait(p,0);
}
try {
  const p=await b.newPage({viewport:{width:1280,height:900}});
  const errors=[];p.on("pageerror",e=>errors.push(e.message));
  await setup(p);
  await p.mouse.move(650,400);
  const stage = p.locator(".idea-stage");
  const root=p.locator("#research-world");
  const start=await p.evaluate(()=>scrollY);
  await p.evaluate(y=>scrollTo({top:y-25,behavior:"instant"}),start);
  await p.mouse.wheel(0,92);
  await p.waitForFunction(y=>Math.abs(scrollY-(y+67))<=2,start);
  assert.equal(await root.getAttribute("data-engaged"),"false");
  assert.equal(await p.locator("#research-world .idea-vector").getAttribute("data-frame"),"0");
  await p.evaluate(y=>scrollTo({top:y,behavior:"instant"}),start);
  await p.screenshot({path:`${out}/Community-自然进入.png`});
  await p.mouse.wheel(0,1000);
  await p.waitForFunction(()=>document.querySelector("#research-world").getBoundingClientRect().bottom<0);
  await p.evaluate(y=>scrollTo({top:y,behavior:"instant"}),start);
  await p.getByRole("button",{name:"开始讲解"}).click();
  assert.equal(await root.getAttribute("data-engaged"),"true");
  assert.equal(await p.evaluate(()=>scrollY),start);
  const graphTop=(await p.locator(".idea-art").boundingBox()).y;
  await wait(p,ends[1]);
  assert.equal(await p.locator(".idea-progress button").count(),15);
  assert.match(await p.locator(".idea-progress p").textContent(),/01 \/ 15.*Foundations/);
  await p.screenshot({path:`${out}/Community-01-研究起点.png`});
  const graph=p.locator(".idea-vector");
  const count=async()=>Number(await graph.getAttribute("data-visible-nodes"));
  const countFirst=await count();
  assert(countFirst>0&&countFirst<300);
  await p.mouse.wheel(0,12);
  await p.waitForFunction(()=>document.querySelector(".idea-stage").style.getPropertyValue("--idea-gesture")==="0.5");
  assert.equal(await graph.getAttribute("data-frame"),String(ends[1]));
  await p.waitForFunction(()=>document.querySelector(".idea-stage").dataset.direction==="none");
  await p.mouse.wheel(0,480);await p.mouse.wheel(0,210);await p.mouse.wheel(0,80);
  await wait(p,ends[2]);
  assert.match(await p.locator(".idea-progress p").textContent(),/02 \/ 15/);
  let previousCount=countFirst;
  for(let i=2;i<=5;i++){
    if(i>2){await p.mouse.wheel(0,280);await wait(p,ends[i]);}
    const currentCount=await count();
    assert(currentCount>previousCount);
    previousCount=currentCount;
    assert.equal(await p.evaluate(()=>scrollY),start);
    assert(Math.abs((await p.locator(".idea-art").boundingBox()).y-graphTop)<=2);
    if(i===3)await p.screenshot({path:`${out}/Community-03-研究分叉.png`});
  }
  assert.equal(previousCount,1327);
  const baseProof=async()=>Promise.all(["nodes","edges"].map(layer=>graph.locator(`path[data-layer=base-${layer}]`).getAttribute("d")));
  const fifth=await baseProof();
  await p.screenshot({path:`${out}/Community-05-完整图谱.png`});
  await p.evaluate(boundary=>{
    const svg=document.querySelector(".idea-vector");
    const capture=new MutationObserver(()=>{
      if(Number(svg.dataset.frame)===boundary){
        window.__ideaHandoff={
          paths:["nodes","edges"].map(layer=>svg.querySelector(`[data-layer="base-${layer}"]`).getAttribute("d")),
          position:svg.parentElement.getBoundingClientRect().y,
          y:scrollY,
        };
        capture.disconnect();
      }
    });
    capture.observe(svg,{attributes:true,attributeFilter:["data-frame"]});
  },ideaOffset);
  await p.mouse.wheel(0,280);
  await wait(p,ends[6]);
  assert.match(await p.locator(".idea-progress p").textContent(),/06 \/ 15.*Idea Space/);
  const handoff=await p.evaluate(()=>window.__ideaHandoff);
  assert.deepEqual(handoff?.paths,fifth,"step 6 begins with the exact settled step 5 graph");
  assert.equal(handoff.y,start);
  assert(Math.abs(handoff.position-graphTop)<=2);
  assert((await graph.locator("path[data-region=blue]").getAttribute("d")).length>50);
  await p.screenshot({path:`${out}/Community-06-Idea.png`});
  await p.mouse.wheel(0,-280);await wait(p,ends[5]);
  assert.deepEqual(await baseProof(),fifth);
  await p.mouse.wheel(0,280);await wait(p,ends[6]);
  for(let i=7;i<=15;i++){
    await p.mouse.wheel(0,280);await wait(p,ends[i]);
    if(i===14){
      await graph.locator('[data-frontier-boundary="closed"]').waitFor();
      assert.equal(await graph.locator("[data-boundary-crossing],[data-open-question]").count(),0);
      await p.screenshot({path:`${out}/Community-14-研究边界.png`});
    }
  }
  await graph.locator('[data-frontier-boundary="breached"]').waitFor();
  await graph.locator("[data-boundary-crossing]").waitFor();
  await graph.locator("[data-open-question]").waitFor();
  assert(await graph.locator("[data-boundary-crossing]").evaluate(path=>{
    const start=path.getPointAtLength(0), end=path.getPointAtLength(path.getTotalLength());
    return start.x<1143&&end.x>1143;
  }));
  assert.match(await p.locator(".idea-caption h3").textContent(),/Open Question/);
  assert.equal(await p.locator("#research-world a[download]").count(),0);
  assert.equal(await p.locator(".idea-badge strong").last().textContent(),"Open Question");
  const vectorProof = async () => ({
    nodes: await graph.getAttribute("data-nodes"),
    edges: await graph.getAttribute("data-edges"),
    region: await graph.locator("path[data-region=blue]").getAttribute("d"),
  });
  const proof=await vectorProof();
  assert.equal(proof.nodes,"1327");
  assert.equal(proof.edges,"3306");
  assert(proof.region.length>50);
  assert.equal(await graph.locator("image,rect").count(),0);
  await p.screenshot({path:`${out}/Community-Open-Question.png`});
  await p.addStyleTag({content:"body { background-color: #e8eef8 !important; }"});
  await p.screenshot({path:`${out}/Community-透明换底验收.png`});
  await p.mouse.wheel(0,-280);await wait(p,ends[14]);
  assert.match(await p.locator(".idea-progress p").textContent(),/14 \/ 15/);
  await graph.locator('[data-frontier-boundary="closed"]').waitFor();
  assert.equal(await graph.locator("[data-open-question]").count(),0);
  await p.mouse.wheel(0,280);await wait(p,ends[15]);
  assert.deepEqual(await vectorProof(),proof,"the vector geometry should be identical on a reverse round trip");
  await p.mouse.wheel(0,860);
  await p.waitForFunction(()=>document.querySelector(".idea-stage").getBoundingClientRect().top < 0);
  await p.evaluate(y=>scrollTo({top:y,behavior:"instant"}),start);
  await p.getByRole("button",{name:"第 8 步：Idea Intent"}).click();
  await wait(p,ends[8]);
  await p.getByRole("button",{name:"跳过讲解"}).click();
  assert.equal(await p.evaluate(()=>document.activeElement.id),"research-world-end");
  assert((await stage.boundingBox()).y<0);
  await p.evaluate(y=>scrollTo({top:y,behavior:"instant"}),start);
  await p.getByRole("button",{name:"继续讲解"}).click();await wait(p,ends[8]);
  assert.equal(await root.getAttribute("data-engaged"),"true");
  await p.keyboard.press("Escape");
  assert.equal(await root.getAttribute("data-engaged"),"false");
  assert.deepEqual(errors,[]);
  console.log("PASS desktop: 15 chapters, momentum lock, reverse, re-entrance, transparent redraw and exit");
  const m=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  await setup(m);
  await m.getByRole("button",{name:"开始讲解"}).click();
  await wait(m,ends[1]);
  const c=await m.context().newCDPSession(m);
  await c.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:121,y:267}]});
  for(const x of [140,160,200]) await c.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x,y:270}]});
  await c.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
  assert.equal(await m.locator("#research-world .idea-vector").getAttribute("data-frame"),String(ends[1]));
  await c.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:181,y:267}]});
  for(const y of [250,225,190,160]) await c.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:181,y}]});
  await c.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
  await wait(m,ends[2]);
  assert.match(await m.locator(".idea-caption h3").textContent(),/积累/);
  await m.locator(".idea-progress button").nth(4).click();await wait(m,ends[5]);
  await c.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:181,y:267}]});
  for(const y of [250,225,190,160]) await c.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:181,y}]});
  await c.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
  await wait(m,ends[6]);
  assert.match(await m.locator(".idea-caption h3").textContent(),/有限/);
  await m.locator(".idea-progress button").last().click();
  await wait(m,ends[15]);
  await m.locator(".idea-mobile-labels").getByText("待验证的问题").waitFor();
  await m.screenshot({path:`${out}/Community-手机版.png`});
  assert(await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await c.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:181,y:267}]});
  for(const y of [245,220,190]) await c.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:181,y}]});
  await c.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
  await m.waitForFunction(()=>document.querySelector(".idea-story").dataset.engaged==="false"&&document.querySelector(".idea-stage").getBoundingClientRect().top<0);
  console.log("PASS mobile: one touch gesture advances one step, readable HTML caption, and natural handoff after the last step");
  const r=await b.newPage({viewport:{width:320,height:788},reducedMotion:"reduce"});
  await setup(r);
  assert.equal(await r.locator("#research-world").getAttribute("data-manual"),"true");
  await r.getByRole("button",{name:"开始讲解"}).click();
  await wait(r,ends[1]);
  for(let i=2;i<=15;i++){
    await r.getByRole("button",{name:"下一段"}).click();await wait(r,ends[i]);
  }
  assert(await r.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  console.log("PASS reduced motion: manual chapter steps");
} finally {await b.close();}
