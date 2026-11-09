import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const script = readFileSync(new URL('../eyes.js', import.meta.url), 'utf8');

function target(top=20,left=20,width=100,height=45){
  return {
    isConnected:true,
    computedStyle:{display:'block',visibility:'visible'},
    getBoundingClientRect(){return {top,left,width,height,right:left+width,bottom:top+height};},
  };
}

function fixture(targets, random = () => 0.25){
  const listeners=new Map(), frames=new Map(), cancelled=[];
  let frameId=0, now=1000;
  function node(tag){
    return {
      tag,id:'',style:{},children:[],parent:null,isConnected:true,
      append(...items){for(const item of items){item.parent=this;this.children.push(item);}},
      appendChild(item){this.append(item);},
      remove(){if(this.parent)this.parent.children=this.parent.children.filter(x=>x!==this);this.isConnected=false;},
    };
  }
  const root=node('html');
  const document={
    documentElement:root,
    createElement:node,
    getElementById(id){
      const visit=n=>n.id===id?n:n.children.map(visit).find(Boolean);
      return visit(root);
    },
    querySelectorAll:()=>targets,
    addEventListener:(type,fn)=>listeners.set(type,fn),
    removeEventListener:(type,fn)=>{if(listeners.get(type)===fn)listeners.delete(type);},
  };
  const window={};
  const context={
    document,window,innerWidth:800,innerHeight:600,
    Date: { now: () => now }, Math: Object.assign(Object.create(Math), { random }),
    getComputedStyle:el=>el.computedStyle,
    requestAnimationFrame(fn){const id=++frameId;frames.set(id,fn);return id;},
    cancelAnimationFrame(id){cancelled.push(id);frames.delete(id);},
  };
  return {
    document,window,listeners,cancelled,
    run:()=>runInNewContext(script,context),
    advance(ms){now+=ms;},
    animate(){const [id,fn]=[...frames].at(-1);frames.delete(id);fn();},
  };
}

test('adds two eyes only to visible, sufficiently large targets',()=>{
  const visible=target(),hidden=target(),offscreen=target(800),tiny=target(0,0,20,12);
  hidden.computedStyle.visibility='hidden';
  const f=fixture([visible,hidden,offscreen,tiny]);
  f.run();
  const overlay=f.document.getElementById('tiny-eyes-overlay-v1');
  assert.ok(overlay);
  assert.equal(overlay.style.pointerEvents,'none');
  assert.equal(overlay.children.length,1);
  assert.equal(overlay.children[0].children.length,2);
  assert.equal(overlay.children[0].children[0].children.length,1);
});

test('pointer movement updates pupils; toggling off cleans up events and frame',()=>{
  const f=fixture([target()]);
  f.run();
  const pupil=f.document.getElementById('tiny-eyes-overlay-v1').children[0].children[0].children[0];
  const before=pupil.style.transform;
  f.listeners.get('pointermove')({clientX:700,clientY:500});
  f.animate();
  assert.notEqual(pupil.style.transform,before);
  f.run();
  assert.equal(f.document.getElementById('tiny-eyes-overlay-v1'),undefined);
  assert.equal(f.listeners.has('pointermove'),false);
  assert.equal(typeof f.window.__tinyEyesCleanup,'undefined');
  assert.equal(f.cancelled.length,1);
});

test('limits overlay creation to 70 targets',()=>{
  const f=fixture(Array.from({length:100},()=>target()));
  f.run();
  assert.equal(f.document.getElementById('tiny-eyes-overlay-v1').children.length,70);
  f.run();
});

test('hides overlay for disconnected target',()=>{
  const el=target(),f=fixture([el]);
  f.run();
  const wrap=f.document.getElementById('tiny-eyes-overlay-v1').children[0];
  el.isConnected=false;
  f.animate();
  assert.equal(wrap.style.display,'none');
  f.run();
});

test('characters blink independently, smoothly and reopen', () => {
  const values = [0, 0.9];
  const f = fixture([target(), target(80)], () => values.shift() ?? 0.5);
  f.run();
  const overlay = f.document.getElementById('tiny-eyes-overlay-v1');
  const first = overlay.children[0].children[0];
  const second = overlay.children[1].children[0];
  assert.equal(first.style.transform, 'scaleY(1.000)');
  f.advance(3001);
  f.animate();
  assert.equal(first.style.transform, 'scaleY(1.000)');
  assert.equal(second.style.transform, 'scaleY(1.000)');
  f.advance(75);
  f.animate();
  const midway = Number(first.style.transform.match(/scaleY\\(([^)]+)\\)/)[1]);
  assert.ok(midway > 0.22 && midway < 1, 'eyelid is part-way closed');
  assert.equal(second.style.transform, 'scaleY(1.000)', 'other character does not blink in sync');
  f.advance(90);
  f.animate();
  const closed = Number(first.style.transform.match(/scaleY\\(([^)]+)\\)/)[1]);
  assert.ok(closed <= midway, 'eyelid moves smoothly towards closing');
  f.advance(220);
  f.animate();
  assert.equal(first.style.transform, 'scaleY(1.000)', 'eye reopens naturally');
  f.run();
});
