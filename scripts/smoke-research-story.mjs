import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";
const url=process.env.RW_SMOKE_URL??"http://localhost:3457";
const out=process.env.RW_SMOKE_OUTPUT??"smoke-artifacts/research-story";
const executablePath=process.env.RW_CHROMIUM_PATH;
const b=await chromium.launch(executablePath?{executablePath,args:["--no-sandbox","--disable-dev-shm-usage"]}:{});
fs.mkdirSync(out,{recursive:true});
const ends=[0,18,37,56,79,100,125,144,170,189,217];
const wait=(p,n)=>p.locator(`#research-world canvas[data-frame="${n}"]`).waitFor({timeout:11000});
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
  await p.mouse.wheel(0,480);await p.mouse.wheel(0,210);await p.mouse.wheel(0,80);
  await wait(p,18);
  assert.match(await p.locator(".idea-progress p").textContent(),/01 \/ 10/);
  for(let i=2;i<=10;i++){
    await p.mouse.wheel(0,280);await wait(p,ends[i]);
    if(i===4) await p.screenshot({path:`${out}/Community-Explore-01.png`});
  }
  assert.match(await p.locator(".idea-caption h3").textContent(),/Open Question/);
  assert.equal(await p.locator("#research-world a[download]").count(),0);
  assert.equal(await p.locator(".idea-badge strong").last().textContent(),"Open Question");
  const transparency = ()=>p.locator("#research-world canvas").evaluate(canvas=>{
    const data=canvas.getContext("2d").getImageData(0,0,canvas.width,canvas.height).data;
    let clear=0;
    for(let i=3;i<data.length;i+=4)if(data[i]===0)clear++;
    return {corner:data[3],fraction:clear/(canvas.width*canvas.height)};
  });
  const a=await transparency();
  assert(a.corner===0&&a.fraction>.55);
  await p.screenshot({path:`${out}/Community-Open-Question.png`});
  await p.addStyleTag({content:"body { background-color: #e8eef8 !important; }"});
  await p.screenshot({path:`${out}/Community-透明换底验收.png`});
  await p.mouse.wheel(0,-280);await wait(p,189);
  assert.match(await p.locator(".idea-progress p").textContent(),/09 \/ 10/);
  await p.mouse.wheel(0,280);await wait(p,217);
  assert.deepEqual(await transparency(),a,"repainting a transparent frame must not retain old strokes");
  await p.mouse.wheel(0,860);
  await p.waitForFunction(()=>document.querySelector(".idea-stage").getBoundingClientRect().top < 0);
  assert.deepEqual(errors,[]);
  console.log("PASS desktop: 10 wheel steps, momentum lock, reverse, re-entrance, transparent redraw and exit");
  const m=await b.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  await setup(m);
  const c=await m.context().newCDPSession(m);
  await c.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:181,y:267}]});
  for(const y of [250,225,190,160]) await c.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:181,y}]});
  await c.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
  await wait(m,18);
  assert.match(await m.locator(".idea-caption h3").textContent(),/有限/);
  await m.locator(".idea-progress button").last().click();
  await wait(m,217);
  await m.locator(".idea-mobile-labels").getByText("待验证的问题").waitFor();
  await m.screenshot({path:`${out}/Community-手机版.png`});
  assert(await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  console.log("PASS mobile: one touch gesture advances one step, readable HTML caption and callout");
  const r=await b.newPage({viewport:{width:390,height:844},reducedMotion:"reduce"});
  await setup(r);
  assert.equal(await r.locator("#research-world").getAttribute("data-manual"),"true");
  await r.getByRole("button",{name:"下一段"}).click();await wait(r,18);
  console.log("PASS reduced motion: manual chapter steps");
} finally {await b.close();}
