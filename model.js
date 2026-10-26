import {validUpgrade,changeGrid} from './operations.js?v=outdoor2';
export const categories={"零食":["饼干","薯片 / 膨化","坚果","糖果 / 巧克力","糕点","果干 / 蜜饯","肉干 / 卤味","其他零食"],"调味品":["盐 / 糖","酱油 / 醋","食用油","香辛料","酱料","火锅 / 汤料"],"主食":["大米","面粉","面条 / 意面","杂粮 / 豆类","速食","面包"],"生鲜冷藏":["蔬菜","水果","肉禽","海鲜","蛋类","奶制品","冷冻食品"],"饮品":["饮用水","茶叶","咖啡","果汁 / 汽水","酒类","冲饮"],"厨房用品":["锅具","餐具","烘焙工具","保鲜用品","厨房小电器"],"清洁日用":["纸品","洗衣用品","清洁剂","清洁工具","垃圾袋","一次性用品"],"洗护美妆":["洗发护发","沐浴用品","口腔护理","护肤","彩妆","卫生用品"],"衣物配饰":["上衣","裤装","裙装","内衣 / 袜子","外套","鞋履","包袋","饰品"],"家居织物":["床品","毛巾","被褥","窗帘","收纳用品"],"数码工具":["电子设备","线材 / 充电器","电池","五金工具","文具","书籍 / 文件"],"健康护理":["常备药","急救用品","保健品","护理器械"],"兴趣生活":["运动用品","玩具","手工材料","园艺","宠物食品","宠物用品","其他物品"]};
const safeId=id=>typeof id==='string'&&id.length>0&&id.length<=120&&!/[<>"'&/#?\s]/.test(id);
const named=c=>typeof c.name==='string'&&c.name.trim().length>0&&c.name.length<=80;
const rectangle=c=>c&&safeId(c.id)&&[c.x,c.y,c.w,c.h].every(Number.isFinite)&&c.x>=0&&c.y>=0&&c.w>=5&&c.h>=5&&c.x+c.w<=100.1&&c.y+c.h<=100.1&&/^#[a-f0-9]{6}$/i.test(c.color);
export const initial=()=>{const s=migrate({version:3,rooms:[{id:'living-room',name:'客厅',x:0,y:0,w:100,h:53,color:'#ffffff'},{id:'kitchen-room',name:'厨房',x:0,y:53,w:42,h:47,color:'#ffffff'},{id:'bedroom',name:'卧室',x:42,y:53,w:58,h:47,color:'#ffffff'}],cabinets:[{id:'snacks',room:'living-room',openSide:'none',x:0,y:0,w:55,h:24,color:'#9fddff'},{id:'books',room:'living-room',openSide:'none',x:0,y:57,w:22,h:43,color:'#d9bdff'},{id:'wardrobe',room:'living-room',openSide:'none',x:78,y:25,w:22,h:43,color:'#a9ebc7'},{id:'kitchen',room:'kitchen-room',openSide:'none',x:0,y:12,w:37,h:72,color:'#ffe77d'},{id:'fridge',room:'bedroom',openSide:'none',x:70,y:0,w:30,h:43,color:'#e6d3b5'},{id:'misc',room:'bedroom',openSide:'none',x:0,y:64,w:100,h:36,color:'#ffb4ce'}],items:[],cart:[]});s.cabinets.forEach((c,n)=>{c.icon=['cookie','book-open','shirt','cooking-pot','archive',''][n];if(c.id==='misc')c.name='杂物';c.color=palette[n]});changeGrid(s,'standard');return s};
export function migrate(s){
 if(s?.version===1)s={...s,version:2,rooms:[{id:'legacy-home',name:'原有空间',x:2,y:2,w:96,h:96,color:'#eef0e6'}],cabinets:s.cabinets.map(c=>({...c,room:'legacy-home'}))};
 if(s?.version===2)s={...s,version:3,cabinets:s.cabinets.map(({name,...c})=>({...c,openSide:'none'}))};
 if(s?.version===3)s={...s,version:4,cabinets:s.cabinets.map(c=>({...c,name:'',icon:'',cells:makeTemplate('shelves')})),items:s.items.map(i=>({...i,cell:s.cabinets.find(c=>c.id===i.cabinet)?.cells?.[0]?.id||'shelf-1'}))};
 if(s?.version===4)s={...s,version:5,grid:'standard',cabinets:s.cabinets.map(c=>({...c,cells:c.cells.map(n=>({...n,groups:[]}))})),items:s.items.map(i=>({...i,unit:'件',tags:[],groupId:''}))};
 return s;
}
export const openSides=['none','top','right','bottom','left'];
export const storageLabel=(s,c)=>c?.name|| (c?'收纳 '+(s.cabinets.filter(x=>x.room===c.room).findIndex(x=>x.id===c.id)+1):'');
export const cabinetLocation=(s,c)=>[s.rooms?.find(r=>r.id===c?.room)?.name,storageLabel(s,c)].filter(Boolean).join(' · ');
export function valid(s){
 if(!s||![1,2,3,4,5].includes(s.version)||!Array.isArray(s.cabinets)||s.cabinets.length>200||!s.cabinets.every(c=>rectangle(c)&&(s.version>=3?openSides.includes(c.openSide):named(c))))return false;
 if(s.version>=2&&(!Array.isArray(s.rooms)||s.rooms.length>100||!s.rooms.every(r=>rectangle(r)&&named(r))||new Set(s.rooms.map(r=>r.id)).size!==s.rooms.length||!s.cabinets.every(c=>s.rooms.some(r=>r.id===c.room))))return false;
 if(s.version>=4&&!s.cabinets.every(c=>typeof c.name==='string'&&c.name.length<=80&&typeof c.icon==='string'&&Array.isArray(c.cells)&&(s.version===5||c.cells.length>0)&&c.cells.length<=60&&c.cells.every(x=>x&&safeId(x.id))&&new Set(c.cells.map(x=>x.id)).size===c.cells.length&&c.cells.every(x=>rectangle(x)&&typeof x.name==='string'&&x.name.length<=80&&typeof x.icon==='string'&&openSides.includes(x.openSide))&&!c.cells.some((a,n)=>c.cells.slice(n+1).some(b=>overlaps(a,b)))))return false;
 if(s.version===5&&!validUpgrade(s))return false;
 return Array.isArray(s.items)&&s.items.length<=10000&&s.items.every(i=>i&&safeId(i.id)&&typeof i.name==='string'&&i.name.length<=100&&Array.isArray(categories[i.group])&&categories[i.group].includes(i.category)&&s.cabinets.some(c=>c.id===i.cabinet&&(s.version<4||c.cells.some(x=>x.id===i.cell)))&&Number.isFinite(i.qty)&&i.qty>=0&&i.qty<=9999&&typeof i.note==='string'&&i.note.length<=1000&&typeof i.expiry==='string'&&(!i.photo||/^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(i.photo)))&&Array.isArray(s.cart)&&s.cart.length<=10000&&s.cart.every(c=>c&&safeId(c.id)&&typeof c.name==='string'&&c.name.length<=100)&&new Set(s.items.map(i=>i.id)).size===s.items.length&&new Set(s.cabinets.map(i=>i.id)).size===s.cabinets.length;
}
export const snacks=s=>s.items.filter(i=>i.group==='零食'&&i.qty>0);
export const search=(s,q,group,cabinet)=>s.items.filter(i=>(!group||i.group===group)&&(!cabinet||i.cabinet===cabinet)&&[i.name,i.category,i.note,...(i.tags||[]),s.cabinets.find(c=>c.id===i.cabinet)?.cells?.find(x=>x.id===i.cell)?.groups?.find(g=>g.id===i.groupId)?.name||'',s.cabinets.find(c=>c.id===i.cabinet)?.cells?.find(x=>x.id===i.cell)?.name||'',cabinetLocation(s,s.cabinets.find(c=>c.id===i.cabinet))].join(' ').toLowerCase().includes(q.toLowerCase()));
export function drawSnack(s,previous){let a=snacks(s);if(a.length>1)a=a.filter(i=>i.id!==previous);return a[Math.floor(Math.random()*a.length)]}
export function addCart(s,item){if(!s.cart.some(c=>c.id===item.id))s.cart.push({id:item.id,name:item.name})}

export function nextRoomRect(rooms){
 for(const size of [{w:46,h:44},{w:30,h:30},{w:22,h:22}])for(let y=3;y+size.h<=98;y+=5)for(let x=3;x+size.w<=98;x+=5){const rect={x,y,...size};if(!rooms.some(r=>rect.x<r.x+r.w+1&&rect.x+rect.w+1>r.x&&rect.y<r.y+r.h+1&&rect.y+rect.h+1>r.y))return rect;}
 return null;
}

export const palette=['#cbd8ce','#ccd8dd','#ead8bf','#e6be58','#edb581','#e6e1d5'];
export function noteInk(hex){const rgb=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255),hi=Math.max(...rgb),lo=Math.min(...rgb),d=hi-lo;let h=0;if(d){h=hi===rgb[0]?((rgb[1]-rgb[2])/d)%6:hi===rgb[1]?(rgb[2]-rgb[0])/d+2:(rgb[0]-rgb[1])/d+4;h*=60;if(h<0)h+=360}return `hsl(${h.toFixed(1)} ${d?58:10}% 30%)`}
export const overlaps=(a,b,gap=0)=>a.x<b.x+b.w+gap-.01&&a.x+a.w+gap>b.x+.01&&a.y<b.y+b.h+gap-.01&&a.y+a.h+gap>b.y+.01;
export function placeRect(rect,others,{snap=false,gap=1}={}){
 const r={...rect,w:Math.min(100,Math.max(5,rect.w)),h:Math.min(100,Math.max(5,rect.h))};r.x=Math.max(0,Math.min(100-r.w,r.x));r.y=Math.max(0,Math.min(100-r.h,r.y));
 const clear=a=>!others.some(b=>overlaps(a,b,gap));
 if(snap){const edges=[{...r,x:0},{...r,x:100-r.w},{...r,y:0},{...r,y:100-r.h}].sort((a,b)=>Math.hypot(a.x-r.x,a.y-r.y)-Math.hypot(b.x-r.x,b.y-r.y));for(const edge of edges){if(clear(edge))return edge;for(let n=1;n<=100;n++)for(const dir of [-1,1]){const a={...edge};if(edge.x===0||edge.x===100-r.w)a.y=Math.max(0,Math.min(100-r.h,r.y+n*dir));else a.x=Math.max(0,Math.min(100-r.w,r.x+n*dir));if(clear(a))return a}}return null}
 return clear(r)?r:null;
}
export function makeTemplate(type){const raw=type==='wardrobe'?[[0,0,43,100],[45,0,55,32],[45,34,55,32],[45,68,55,32]]:type==='drawers'?[[0,0,100,24],[0,26,100,24],[0,52,100,22],[0,76,100,24]]:[[0,0,100,32],[0,34,100,32],[0,68,100,32]];return raw.map(([x,y,w,h],n)=>({id:type==='shelves'?`shelf-${n+1}`:`${type}-${n+1}`,x,y,w,h,color:(type==='wardrobe'?[palette[1],palette[2],palette[3],palette[0]]:[palette[0],palette[3],palette[4],palette[1]])[n],name:'',icon:'',openSide:'none',groups:[]}))}
export function applyTemplate(s,c,type){const cells=makeTemplate(type);s.items.filter(i=>i.cabinet===c.id).forEach(i=>{const index=c.cells.findIndex(x=>x.id===i.cell);i.cell=cells[Math.max(0,Math.min(index,cells.length-1))].id});c.cells=cells.map(n=>({...n,groups:[]}));s.items.filter(i=>i.cabinet===c.id).forEach(i=>i.groupId='')}
