export const grids = {coarse:{cols:8,rows:6,label:'粗 · 8×6'},standard:{cols:12,rows:9,label:'标准 · 12×9'},fine:{cols:16,rows:12,label:'细 · 16×12'}};
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export const collision=(a,b)=>a.x<b.x+b.w-.01&&a.x+a.w>b.x+.01&&a.y<b.y+b.h-.01&&a.y+a.h>b.y+.01;
export function snapRect(rect,grid){
 const w=clamp(Math.round(rect.w*grid.cols/100),1,grid.cols),h=clamp(Math.round(rect.h*grid.rows/100),1,grid.rows);
 return {...rect,x:clamp(Math.round(rect.x*grid.cols/100),0,grid.cols-w)*100/grid.cols,y:clamp(Math.round(rect.y*grid.rows/100),0,grid.rows-h)*100/grid.rows,w:w*100/grid.cols,h:h*100/grid.rows};
}
export function fitRect(rect,others,grid,{nearest=false}={}){
 const snapped=snapRect(rect,grid);
 if(!others.some(n=>collision(snapped,n)))return snapped;
 if(!nearest)return null;
 const positions=[];
 for(let y=0;y<grid.rows;y++)for(let x=0;x<grid.cols;x++){
  const r={...snapped,x:x*100/grid.cols,y:y*100/grid.rows};
  if(r.x+r.w<=100.01&&r.y+r.h<=100.01&&!others.some(n=>collision(r,n)))positions.push(r);
 }
 return positions.sort((a,b)=>Math.hypot(a.x-snapped.x,a.y-snapped.y)-Math.hypot(b.x-snapped.x,b.y-snapped.y))[0]||null;
}
export function alignLayout(nodes,grid){
 const placed=[];
 for(const n of [...nodes].sort((a,b)=>b.w*b.h-a.w*a.h)){
  const r=fitRect(n,placed,grid,{nearest:true});
  if(!r)throw Error('这个网格放不下当前布局，请选择更细的网格或先腾出空间');
  placed.push(r);
 }
 return nodes.map(n=>({...n,...placed.find(r=>r.id===n.id)}));
}
export function pinchRect(rect,startDistance,distance,grid){
 if(!Number.isFinite(startDistance)||startDistance<=0||!Number.isFinite(distance)||distance<=0)throw Error('缩放距离无效');
 const scale=distance/startDistance;
 return snapRect({...rect,w:rect.w*scale,h:rect.h*scale},grid);
}
