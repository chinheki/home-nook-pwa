import {grids,alignLayout,fitRect} from './layout.js?v=outdoor4';

const uid=()=>crypto.randomUUID();
const cabinet=(s,id)=>{const c=s.cabinets.find(c=>c.id===id);if(!c)throw Error('找不到柜子');return c};
const cell=(c,id)=>{const n=c.cells.find(n=>n.id===id);if(!n)throw Error('找不到格子');return n};
const freshCell=n=>{const copy={...structuredClone(n),id:uid(),groups:(n.groups||[]).map(g=>({...g,id:uid()}))};delete copy.photo;return copy};
export function changeGrid(s,key){
 if(!Object.hasOwn(grids,key))throw Error('请选择有效网格');
 // Prepare every layout before applying, so a crowded room never partially changes.
 const layouts=s.rooms.map(r=>({room:r.id,nodes:alignLayout(s.cabinets.filter(c=>c.room===r.id),grids[key])}));
 for(const {nodes} of layouts)for(const c of nodes)c.cells=alignLayout(c.cells,grids[key]);
 s.cabinets=layouts.flatMap(l=>l.nodes);s.grid=key;
}
export function copyCabinet(s,id){
 if(s.cabinets.length>=200)throw Error('最多 200 个收纳');
 const c=cabinet(s,id),rect=fitRect(c,s.cabinets.filter(n=>n.room===c.room),grids[s.grid],{nearest:true});
 if(!rect)throw Error('房间没有足够空位，请先腾出空间');
 const copy={...rect,id:uid(),name:c.name?c.name+' 副本':'',cells:c.cells.map(freshCell)};delete copy.photo;s.cabinets.push(copy);return copy;
}
export function copyCell(s,cabinetId,cellId){
 const c=cabinet(s,cabinetId),n=cell(c,cellId);
 if(c.cells.length>=60)throw Error('最多 60 个格子');
 const rect=fitRect(n,c.cells,grids[s.grid],{nearest:true});
 if(!rect)throw Error('柜子没有足够空位，请先腾出空间');
 const copy=freshCell(rect);c.cells.push(copy);return copy;
}
export function moveCell(s,sourceId,cellId,targetId,placement){
 if(sourceId===targetId)throw Error('请选择其他柜子');
 const source=cabinet(s,sourceId),target=cabinet(s,targetId),n=cell(source,cellId);
 if(target.cells.length>=60)throw Error('目标柜子已达到 60 个格子');
 const rect=fitRect({...n,...placement},target.cells,grids[s.grid]);
 if(!rect)throw Error('这里放不下，请移动预览到空位');
 const moved={...n,...rect,id:target.cells.some(x=>x.id===n.id)?uid():n.id};
 target.cells.push(moved);source.cells=source.cells.filter(x=>x!==n);
 s.items.filter(i=>i.cabinet===sourceId&&i.cell===cellId).forEach(i=>{i.cabinet=targetId;i.cell=moved.id});
 return moved;
}
export function promoteCell(s,sourceId,cellId,roomId,name){
 if(s.cabinets.length>=200||!s.rooms.some(r=>r.id===roomId))throw Error('房间不存在或收纳数量已达上限');
 const source=cabinet(s,sourceId),n=cell(source,cellId),grid=grids[s.grid];
 const rect=fitRect({x:0,y:0,w:n.w,h:n.h},s.cabinets.filter(c=>c.room===roomId),grid,{nearest:true});
 if(!rect)throw Error('房间没有足够空位，请先腾出空间');
 const c={...rect,id:uid(),room:roomId,name:name.trim(),color:n.color,icon:n.icon,openSide:n.openSide,...(n.photo?{photo:n.photo}:{}),cells:[{...n,x:0,y:0,w:100,h:100}]};
 s.cabinets.push(c);source.cells=source.cells.filter(x=>x!==n);
 s.items.filter(i=>i.cabinet===sourceId&&i.cell===cellId).forEach(i=>i.cabinet=c.id);
 return c;
}
export function addGroup(s,cabinetId,cellId,name=''){
 const n=cell(cabinet(s,cabinetId),cellId);
 if(n.groups.length>=100)throw Error('最多 100 个 Group');
 const g={id:uid(),name:name.trim()};n.groups.push(g);return g;
}
export function validUpgrade(s){
 if(!Object.hasOwn(grids,s.grid))return false;
 const safe=id=>typeof id==='string'&&id.length>0&&id.length<=120&&!/[<>"'&/#?\s]/.test(id);
 const validGroup=g=>g&&safe(g.id)&&typeof g.name==='string'&&g.name.length<=80;
 const validCell=n=>Array.isArray(n.groups)&&n.groups.length<=100&&new Set(n.groups.map(g=>g?.id)).size===n.groups.length&&n.groups.every(validGroup);
 if(!s.cabinets.every(c=>c.cells.every(validCell)))return false;
 return Array.isArray(s.items)&&s.items.every(i=>i&&typeof i.unit==='string'&&i.unit.length<=12&&Array.isArray(i.tags)&&i.tags.length<=12&&i.tags.every(t=>typeof t==='string'&&t.length>0&&t.length<=24)&&typeof i.groupId==='string'&&(!i.groupId||s.cabinets.find(c=>c.id===i.cabinet)?.cells.find(n=>n.id===i.cell)?.groups.some(g=>g.id===i.groupId)));
}
