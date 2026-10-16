export const categories={"零食":["饼干","薯片 / 膨化","坚果","糖果 / 巧克力","糕点","果干 / 蜜饯","肉干 / 卤味","其他零食"],"调味品":["盐 / 糖","酱油 / 醋","食用油","香辛料","酱料","火锅 / 汤料"],"主食":["大米","面粉","面条 / 意面","杂粮 / 豆类","速食","面包"],"生鲜冷藏":["蔬菜","水果","肉禽","海鲜","蛋类","奶制品","冷冻食品"],"饮品":["饮用水","茶叶","咖啡","果汁 / 汽水","酒类","冲饮"],"厨房用品":["锅具","餐具","烘焙工具","保鲜用品","厨房小电器"],"清洁日用":["纸品","洗衣用品","清洁剂","清洁工具","垃圾袋","一次性用品"],"洗护美妆":["洗发护发","沐浴用品","口腔护理","护肤","彩妆","卫生用品"],"衣物配饰":["上衣","裤装","裙装","内衣 / 袜子","外套","鞋履","包袋","饰品"],"家居织物":["床品","毛巾","被褥","窗帘","收纳用品"],"数码工具":["电子设备","线材 / 充电器","电池","五金工具","文具","书籍 / 文件"],"健康护理":["常备药","急救用品","保健品","护理器械"],"兴趣生活":["运动用品","玩具","手工材料","园艺","宠物食品","宠物用品","其他物品"]};
const rectangle=c=>c&&typeof c.id==='string'&&typeof c.name==='string'&&c.name.trim().length>0&&c.name.length<=80&&[c.x,c.y,c.w,c.h].every(Number.isFinite)&&c.x>=0&&c.y>=0&&c.w>=5&&c.h>=5&&c.x+c.w<=100.1&&c.y+c.h<=100.1&&/^#[a-f0-9]{6}$/i.test(c.color);
export const initial=()=>({version:2,rooms:[{id:'kitchen-room',name:'厨房',x:3,y:3,w:46,h:48,color:'#e9efdf'},{id:'living-room',name:'客厅',x:51,y:3,w:46,h:48,color:'#f0e7d7'},{id:'bedroom',name:'卧室',x:3,y:53,w:46,h:44,color:'#ebe6ef'}],cabinets:[{id:'kitchen',room:'kitchen-room',name:'调味柜',x:6,y:6,w:88,h:30,color:'#e9efdf'},{id:'snacks',room:'living-room',name:'零食柜',x:8,y:8,w:84,h:42,color:'#f0e7d7'},{id:'fridge',room:'kitchen-room',name:'冰箱',x:6,y:46,w:65,h:48,color:'#e1ece9'},{id:'wardrobe',room:'bedroom',name:'衣柜',x:6,y:12,w:65,h:65,color:'#ebe6ef'}],items:[],cart:[]});
export function migrate(s){
 if(s?.version!==1)return s;
 // Keep the old geometry and cabinet IDs intact so existing items and photos stay connected.
 return {...s,version:2,rooms:[{id:'legacy-home',name:'原有空间',x:2,y:2,w:96,h:96,color:'#eef0e6'}],cabinets:s.cabinets.map(c=>({...c,room:'legacy-home'}))};
}
export const cabinetLocation=(s,c)=>[s.rooms?.find(r=>r.id===c?.room)?.name,c?.name].filter(Boolean).join(' · ');
export function valid(s){
 if(!s||![1,2].includes(s.version)||!Array.isArray(s.cabinets)||s.cabinets.length>200||!s.cabinets.every(rectangle))return false;
 if(s.version===2&&(!Array.isArray(s.rooms)||s.rooms.length>100||!s.rooms.every(rectangle)||new Set(s.rooms.map(r=>r.id)).size!==s.rooms.length||!s.cabinets.every(c=>s.rooms.some(r=>r.id===c.room))))return false;
 return Array.isArray(s.items)&&s.items.length<=10000&&s.items.every(i=>i&&typeof i.id==='string'&&typeof i.name==='string'&&i.name.length<=100&&categories[i.group]?.includes(i.category)&&s.cabinets.some(c=>c.id===i.cabinet)&&Number.isFinite(i.qty)&&i.qty>=0&&i.qty<=9999&&typeof i.note==='string'&&i.note.length<=1000&&typeof i.expiry==='string'&&(!i.photo||/^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(i.photo)))&&Array.isArray(s.cart)&&s.cart.length<=10000&&s.cart.every(c=>c&&typeof c.id==='string'&&typeof c.name==='string'&&c.name.length<=100)&&new Set(s.items.map(i=>i.id)).size===s.items.length&&new Set(s.cabinets.map(i=>i.id)).size===s.cabinets.length;
}
export const snacks=s=>s.items.filter(i=>i.group==='零食'&&i.qty>0);
export const search=(s,q,group,cabinet)=>s.items.filter(i=>(!group||i.group===group)&&(!cabinet||i.cabinet===cabinet)&&[i.name,i.category,i.note,cabinetLocation(s,s.cabinets.find(c=>c.id===i.cabinet))].join(' ').toLowerCase().includes(q.toLowerCase()));
export function drawSnack(s,previous){let a=snacks(s);if(a.length>1)a=a.filter(i=>i.id!==previous);return a[Math.floor(Math.random()*a.length)]}
export function addCart(s,item){if(!s.cart.some(c=>c.id===item.id))s.cart.push({id:item.id,name:item.name})}

export function nextRoomRect(rooms){
 for(const size of [{w:46,h:44},{w:30,h:30},{w:22,h:22}])for(let y=3;y+size.h<=98;y+=5)for(let x=3;x+size.w<=98;x+=5){const rect={x,y,...size};if(!rooms.some(r=>rect.x<r.x+r.w+1&&rect.x+rect.w+1>r.x&&rect.y<r.y+r.h+1&&rect.y+rect.h+1>r.y))return rect;}
 return null;
}
