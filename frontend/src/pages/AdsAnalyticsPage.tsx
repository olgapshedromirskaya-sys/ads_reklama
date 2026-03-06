// @ts-nocheck
import { useState } from "react";

const T={bg:"#151c2e",card:"#1e2640",card2:"#252e4a",border:"rgba(255,255,255,0.07)",text:"#ffffff",sub:"#8892a4",green:"#4ade80",yellow:"#fbbf24",red:"#f87171",wb:"#7c3aed",ozon:"#2563eb"};
const S={card:{background:T.card,borderRadius:16,padding:16,border:`1px solid ${T.border}`},card2:{background:T.card2,borderRadius:12,padding:12,border:`1px solid ${T.border}`}};

// ── MOCK DATA ──────────────────────────────────────────────────────────────────
const DEMO={
  wb:{
    today:{revenue:285000,revenuePlan:450000,orders:187,ordersPlan:400,adSpend:38427,adSpendPlan:120000,conversion:3.2,conversionPlan:5,fromAd:{ordered:79,orderedRevenue:194900,buyoutPct:87.3}},
    budgetPlan:120000, revenuePlan:900000, ordersPlan:800, buyoutPlan:85,
    campaigns:[
      {id:1,name:"Кроссовки женские",drr:12.4,spend:38427,orders:187,cpo:205,status:"ok",
        keywords:["кроссовки женские","кроссовки на платформе","белые кроссовки"]},
      {id:2,name:"Джинсы slim fit",  drr:24.1,spend:15200,orders:31, cpo:490,status:"bad",
        keywords:["джинсы slim fit","джинсы скинни"]},
      {id:3,name:"Белые кроссовки",  drr:8.7, spend:9800, orders:62, cpo:158,status:"ok",
        keywords:["белые кроссовки"]},
    ],
    keywords:[
      {keyword:"кроссовки женские",    campaignId:1,pos:3, posPrev:5, posSearch:3, posShelves:2, bidSearch:220,bidShelves:175,bidCompSearch:190,bidCompShelves:155, orders:187,baskets:240,ctr:1.42,drr:12.4,spend:826, revenue:6500, impressions:1063,clicks:15},
      {keyword:"кроссовки на платформе",campaignId:1,pos:12,posPrev:12,posSearch:12,posShelves:8, bidSearch:220,bidShelves:175,bidCompSearch:180,bidCompShelves:140, orders:94, baskets:120,ctr:0.94,drr:18.2,spend:580, revenue:3186, impressions:890, clicks:8},
      {keyword:"белые кроссовки",      campaignId:1,pos:7, posPrev:5, posSearch:7, posShelves:5, bidSearch:210,bidShelves:170,bidCompSearch:165,bidCompShelves:130, orders:62, baskets:80, ctr:0.67,drr:21.5,spend:420, revenue:1953, impressions:760, clicks:5,alert:true},
      {keyword:"джинсы slim fit",      campaignId:2,pos:22,posPrev:19,posSearch:22,posShelves:18,bidSearch:155,bidShelves:120,bidCompSearch:200,bidCompShelves:160, orders:18, baskets:35, ctr:0.47,drr:31.2,spend:285, revenue:913,  impressions:520, clicks:2,alert:true},
      {keyword:"джинсы скинни",        campaignId:2,pos:31,posPrev:27,posSearch:31,posShelves:25,bidSearch:145,bidShelves:110,bidCompSearch:190,bidCompShelves:150, orders:13, baskets:22, ctr:0.38,drr:28.7,spend:195, revenue:680,  impressions:410, clicks:1,alert:true},
    ],
    daily:[
      {date:"05.03",dow:"чт",impressions:934, cpm:336,clicks:9, ctr:0.96,cpc:34.9,spend:314, baskets:4,cpl:105,orders:1,cpo:314, cro:11.11,drr:11.2,revenue:2800,sources:[{type:"поиск",pct:26,spend:82, impressions:245,clicks:4,ctr:1.63,orders:1},{type:"полки",pct:73,spend:232,impressions:684,clicks:5,ctr:0.73,orders:0},{type:"каталог",pct:1,spend:3,impressions:5,clicks:0,ctr:0,orders:0}]},
      {date:"04.03",dow:"ср",impressions:122, cpm:264,clicks:0, ctr:0,   cpc:0,   spend:32,  baskets:0,cpl:null,orders:0,cpo:null,cro:0,    drr:0,    revenue:0,   sources:[{type:"поиск",pct:15,spend:5, impressions:18,clicks:0,ctr:0,orders:0},{type:"полки",pct:85,spend:27,impressions:104,clicks:0,ctr:0,orders:0}]},
      {date:"03.03",dow:"вт",impressions:2968,cpm:341,clicks:25,ctr:0.84,cpc:40.4,spend:1011,baskets:3,cpl:337,orders:1,cpo:1011,cro:4.0, drr:28.5, revenue:3550, sources:[{type:"поиск",pct:27,spend:273,impressions:800,clicks:9, ctr:1.13,orders:1},{type:"полки",pct:73,spend:738,impressions:2168,clicks:16,ctr:0.74,orders:0}]},
      {date:"02.03",dow:"пн",impressions:3269,cpm:309,clicks:24,ctr:0.73,cpc:42.1,spend:1011,baskets:2,cpl:505,orders:1,cpo:1011,cro:8.33,drr:31.2, revenue:3240, sources:[{type:"поиск",pct:22,spend:222,impressions:708,clicks:7, ctr:0.99,orders:1},{type:"полки",pct:78,spend:789,impressions:2540,clicks:17,ctr:0.67,orders:0}]},
      {date:"01.03",dow:"вс",impressions:4120,cpm:298,clicks:31,ctr:0.75,cpc:38.2,spend:1184,baskets:5,cpl:237,orders:2,cpo:592, cro:6.45, drr:22.3, revenue:5310, sources:[{type:"поиск",pct:30,spend:355,impressions:1236,clicks:12,ctr:0.97,orders:2},{type:"полки",pct:70,spend:829,impressions:2884,clicks:19,ctr:0.66,orders:0}]},
      {date:"28.02",dow:"сб",impressions:3854,cpm:315,clicks:28,ctr:0.73,cpc:41.5,spend:1162,baskets:6,cpl:194,orders:2,cpo:581, cro:7.14, drr:19.8, revenue:5868, sources:[{type:"поиск",pct:28,spend:325,impressions:1079,clicks:10,ctr:0.93,orders:2},{type:"полки",pct:72,spend:837,impressions:2775,clicks:18,ctr:0.65,orders:0}]},
      {date:"27.02",dow:"пт",impressions:2100,cpm:290,clicks:18,ctr:0.86,cpc:38.0,spend:684, baskets:3,cpl:228,orders:1,cpo:684, cro:5.56, drr:16.4, revenue:4168, sources:[{type:"поиск",pct:32,spend:219,impressions:672,clicks:7,ctr:1.04,orders:1},{type:"полки",pct:68,spend:465,impressions:1428,clicks:11,ctr:0.77,orders:0}]},
    ],
    positions:[
      {keyword:"кроссовки женские",     freq:84295,dates:[{date:"05.03",promo:true, price:547,shows:">700",posSearch:3, posShelves:2, cpm:220},{date:"28.02",promo:true, price:545,shows:">700",posSearch:5, posShelves:4, cpm:220},{date:"21.02",promo:false,price:520,shows:">700",posSearch:8, posShelves:7, cpm:180}]},
      {keyword:"кроссовки на платформе",freq:19745,dates:[{date:"05.03",promo:true, price:547,shows:">700",posSearch:12,posShelves:8, cpm:220},{date:"28.02",promo:true, price:545,shows:">700",posSearch:12,posShelves:9, cpm:220},{date:"21.02",promo:false,price:520,shows:"412", posSearch:15,posShelves:11,cpm:180}]},
      {keyword:"белые кроссовки",       freq:16330,dates:[{date:"05.03",promo:true, price:547,shows:"560", posSearch:7, posShelves:5, cpm:210},{date:"28.02",promo:true, price:545,shows:"490", posSearch:5, posShelves:4, cpm:210},{date:"21.02",promo:false,price:520,shows:"380", posSearch:9, posShelves:7, cpm:170}]},
      {keyword:"джинсы slim fit",       freq:19353,dates:[{date:"05.03",promo:true, price:547,shows:"320", posSearch:22,posShelves:18,cpm:155},{date:"28.02",promo:true, price:545,shows:"290", posSearch:19,posShelves:15,cpm:155},{date:"21.02",promo:false,price:520,shows:"210", posSearch:16,posShelves:13,cpm:130}]},
      {keyword:"джинсы скинни",         freq:7217, dates:[{date:"05.03",promo:true, price:547,shows:"180", posSearch:31,posShelves:25,cpm:145},{date:"28.02",promo:true, price:545,shows:"160", posSearch:27,posShelves:22,cpm:145},{date:"21.02",promo:false,price:520,shows:"120", posSearch:24,posShelves:19,cpm:120}]},
    ],
    clusters:[
      {keyword:"кроссовки женские",freq:84295,cpm:220,avgPos:3,impressions:1063,clicks:15,ctr:1.42,cpc:55.1,spend:826,costShare:32.1,baskets:240,orders:187,revenue:6500},
      {keyword:"кроссовки на платформе",freq:19745,cpm:220,avgPos:12,impressions:890,clicks:8,ctr:0.94,cpc:82.6,spend:580,costShare:19.8,baskets:120,orders:94,revenue:3186},
      {keyword:"белые кроссовки",freq:16330,cpm:210,avgPos:7,impressions:760,clicks:5,ctr:0.67,cpc:84.0,spend:420,costShare:14.3,baskets:80,orders:62,revenue:1953,alert:true},
      {keyword:"джинсы slim fit",freq:19353,cpm:155,avgPos:22,impressions:520,clicks:2,ctr:0.47,cpc:142.5,spend:285,costShare:9.7,baskets:35,orders:18,revenue:913,alert:true},
      {keyword:"джинсы скинни",freq:7217,cpm:145,avgPos:31,impressions:410,clicks:1,ctr:0.38,cpc:195.0,spend:195,costShare:6.6,baskets:22,orders:13,revenue:680,alert:true},
      {keyword:"женские кроссовки купить",freq:38228,cpm:220,avgPos:5,impressions:98,clicks:3,ctr:3.06,cpc:25.3,spend:76,costShare:2.6,baskets:15,orders:8,revenue:640,best:true},
    ],
    minusActive:[
      {id:1,keyword:"мужские кроссовки",impressions:820,clicks:3,ctr:0.37,spend:248,orders:0,addedDaysAgo:3,reason:"low_ctr"},
      {id:2,keyword:"детские кроссовки",impressions:540,clicks:1,ctr:0.19,spend:163,orders:0,addedDaysAgo:5,reason:"low_ctr"},
      {id:3,keyword:"кроссовки мужские",impressions:310,clicks:2,ctr:0.65,spend:194,orders:0,addedDaysAgo:1,reason:"no_orders"},
      {id:4,keyword:"спортивные кроссовки",impressions:290,clicks:4,ctr:1.38,spend:316,orders:0,addedDaysAgo:2,reason:"no_orders"},
    ],
    minusArchive:[
      {id:10,keyword:"обувь женская",impressions:1240,clicks:4,ctr:0.32,spend:410,orders:0,deletedAt:"01.03.2026",deletedBy:"авто",reason:"CTR < 0.5%"},
      {id:11,keyword:"туфли",impressions:890,clicks:2,ctr:0.22,spend:280,orders:0,deletedAt:"28.02.2026",deletedBy:"авто",reason:"CTR < 0.5%"},
      {id:12,keyword:"сапоги женские",impressions:320,clicks:3,ctr:0.94,spend:195,orders:0,deletedAt:"25.02.2026",deletedBy:"ручное",reason:"Ручное удаление"},
    ],
  },
  ozon:{
    today:{revenue:180000,revenuePlan:300000,orders:138,ordersPlan:400,adSpend:10000,adSpendPlan:60000,conversion:2.5,conversionPlan:4,fromAd:{ordered:79,orderedRevenue:194900,buyoutPct:87.3}},
    budgetPlan:60000, revenuePlan:600000, ordersPlan:600, buyoutPlan:80,
    campaigns:[
      {id:1,name:"Рюкзак туристический",drr:16.4,spend:72000,orders:220,cpo:327,status:"warn",keywords:["рюкзак туристический","рюкзак для походов"]},
      {id:2,name:"Термокружка 450мл",   drr:12.3,spend:52000,orders:150,cpo:347,status:"ok",keywords:["термокружка 450мл","термокружка с крышкой"]},
      {id:3,name:"Куртка зимняя XL",    drr:7.1, spend:58500,orders:190,cpo:308,status:"ok",keywords:["куртка зимняя"]},
    ],
    keywords:[
      {keyword:"рюкзак туристический",campaignId:1,pos:8, posPrev:11,posSearch:8, posShelves:6, bidSearch:340,bidShelves:260,bidCompSearch:310,bidCompShelves:240,orders:220,baskets:310,ctr:1.21,drr:16.4,spend:720, revenue:4390, impressions:890, clicks:10},
      {keyword:"рюкзак для походов",  campaignId:1,pos:15,posPrev:15,posSearch:15,posShelves:12,bidSearch:290,bidShelves:220,bidCompSearch:260,bidCompShelves:200,orders:95, baskets:130,ctr:0.88,drr:19.8,spend:480, revenue:2424, impressions:720, clicks:6},
      {keyword:"термокружка 450мл",   campaignId:2,pos:4, posPrev:6, posSearch:4, posShelves:3, bidSearch:180,bidShelves:140,bidCompSearch:160,bidCompShelves:125,orders:150,baskets:210,ctr:1.54,drr:12.3,spend:520, revenue:4228, impressions:650, clicks:10},
      {keyword:"термокружка с крышкой",campaignId:2,pos:21,posPrev:18,posSearch:21,posShelves:16,bidSearch:155,bidShelves:120,bidCompSearch:175,bidCompShelves:140,orders:42, baskets:65, ctr:0.62,drr:23.1,spend:210, revenue:909,  impressions:480, clicks:3,alert:true},
      {keyword:"куртка зимняя",       campaignId:3,pos:3, posPrev:4, posSearch:3, posShelves:2, bidSearch:420,bidShelves:330,bidCompSearch:390,bidCompShelves:310,orders:190,baskets:260,ctr:1.38,drr:7.1, spend:585, revenue:8239, impressions:1100,clicks:15},
    ],
    daily:[
      {date:"05.03",dow:"чт",impressions:1240,cpm:285,clicks:14,ctr:1.13,cpc:28.5,spend:399, baskets:6,cpl:66,orders:2,cpo:200,cro:14.3, drr:8.9, revenue:4483,sources:[{type:"поиск",pct:35,spend:140,impressions:434,clicks:8,ctr:1.84,orders:2},{type:"полки",pct:65,spend:259,impressions:806,clicks:6,ctr:0.74,orders:0}]},
      {date:"04.03",dow:"ср",impressions:980, cpm:260,clicks:8, ctr:0.82,cpc:32.1,spend:257, baskets:3,cpl:86,orders:1,cpo:257,cro:12.5, drr:11.4,revenue:2254,sources:[{type:"поиск",pct:40,spend:103,impressions:392,clicks:5,ctr:1.28,orders:1},{type:"полки",pct:60,spend:154,impressions:588,clicks:3,ctr:0.51,orders:0}]},
      {date:"03.03",dow:"вт",impressions:3120,cpm:310,clicks:29,ctr:0.93,cpc:36.8,spend:1067,baskets:8,cpl:133,orders:3,cpo:356,cro:10.3, drr:14.2,revenue:7514,sources:[{type:"поиск",pct:38,spend:405,impressions:1186,clicks:14,ctr:1.18,orders:3},{type:"полки",pct:62,spend:662,impressions:1934,clicks:15,ctr:0.78,orders:0}]},
      {date:"02.03",dow:"пн",impressions:2840,cpm:295,clicks:22,ctr:0.77,cpc:38.9,spend:856, baskets:5,cpl:171,orders:2,cpo:428,cro:9.09, drr:18.6,revenue:4602,sources:[{type:"поиск",pct:36,spend:308,impressions:1022,clicks:10,ctr:0.98,orders:2},{type:"полки",pct:64,spend:548,impressions:1818,clicks:12,ctr:0.66,orders:0}]},
      {date:"01.03",dow:"вс",impressions:4320,cpm:305,clicks:38,ctr:0.88,cpc:34.2,spend:1300,baskets:9,cpl:144,orders:4,cpo:325,cro:10.5, drr:12.1,revenue:10744,sources:[{type:"поиск",pct:40,spend:520,impressions:1728,clicks:18,ctr:1.04,orders:4},{type:"полки",pct:60,spend:780,impressions:2592,clicks:20,ctr:0.77,orders:0}]},
      {date:"28.02",dow:"сб",impressions:3980,cpm:318,clicks:34,ctr:0.85,cpc:35.6,spend:1210,baskets:8,cpl:151,orders:3,cpo:403,cro:8.82, drr:13.8,revenue:8768,sources:[{type:"поиск",pct:38,spend:460,impressions:1512,clicks:15,ctr:0.99,orders:3},{type:"полки",pct:62,spend:750,impressions:2468,clicks:19,ctr:0.77,orders:0}]},
      {date:"27.02",dow:"пт",impressions:2600,cpm:275,clicks:20,ctr:0.77,cpc:35.0,spend:700, baskets:5,cpl:140,orders:2,cpo:350,cro:10.0, drr:10.5,revenue:6667,sources:[{type:"поиск",pct:37,spend:259,impressions:962,clicks:8,ctr:0.83,orders:2},{type:"полки",pct:63,spend:441,impressions:1638,clicks:12,ctr:0.73,orders:0}]},
    ],
    positions:[
      {keyword:"рюкзак туристический",freq:62100,dates:[{date:"05.03",promo:true, price:3490,shows:">700",posSearch:8, posShelves:6, cpm:340},{date:"28.02",promo:true, price:3490,shows:">700",posSearch:11,posShelves:9, cpm:340},{date:"21.02",promo:false,price:3200,shows:">700",posSearch:14,posShelves:11,cpm:280}]},
      {keyword:"рюкзак для походов",  freq:18400,dates:[{date:"05.03",promo:true, price:3490,shows:"480", posSearch:15,posShelves:12,cpm:290},{date:"28.02",promo:true, price:3490,shows:"420", posSearch:15,posShelves:12,cpm:290},{date:"21.02",promo:false,price:3200,shows:"360", posSearch:18,posShelves:14,cpm:240}]},
      {keyword:"термокружка 450мл",   freq:24800,dates:[{date:"05.03",promo:true, price:890, shows:">700",posSearch:4, posShelves:3, cpm:180},{date:"28.02",promo:true, price:890, shows:">700",posSearch:6, posShelves:5, cpm:180},{date:"21.02",promo:false,price:850, shows:"510", posSearch:9, posShelves:7, cpm:150}]},
      {keyword:"куртка зимняя",       freq:91200,dates:[{date:"05.03",promo:true, price:6800,shows:">700",posSearch:3, posShelves:2, cpm:420},{date:"28.02",promo:true, price:6800,shows:">700",posSearch:4, posShelves:3, cpm:420},{date:"21.02",promo:false,price:6500,shows:">700",posSearch:6, posShelves:5, cpm:350}]},
    ],
    clusters:[
      {keyword:"рюкзак туристический",freq:62100,cpm:340,avgPos:8,impressions:890,clicks:10,ctr:1.21,cpc:72.0,spend:720,costShare:28.5,baskets:310,orders:220,revenue:4390},
      {keyword:"рюкзак для походов",  freq:18400,cpm:290,avgPos:15,impressions:720,clicks:6, ctr:0.88,cpc:80.0,spend:480,costShare:19.0,baskets:130,orders:95, revenue:2424},
      {keyword:"термокружка 450мл",   freq:24800,cpm:180,avgPos:4, impressions:650,clicks:10,ctr:1.54,cpc:52.0,spend:520,costShare:20.6,baskets:210,orders:150,revenue:4228,best:true},
      {keyword:"куртка зимняя",       freq:91200,cpm:420,avgPos:3, impressions:1100,clicks:15,ctr:1.38,cpc:39.0,spend:585,costShare:23.2,baskets:260,orders:190,revenue:8239},
      {keyword:"термокружка с крышкой",freq:8900,cpm:155,avgPos:21,impressions:480,clicks:3, ctr:0.62,cpc:70.0,spend:210,costShare:8.3, baskets:65, orders:42, revenue:909, alert:true},
    ],
    minusActive:[
      {id:1,keyword:"рюкзак детский",impressions:620,clicks:2,ctr:0.32,spend:186,orders:0,addedDaysAgo:2,reason:"low_ctr"},
      {id:2,keyword:"сумка дорожная",impressions:440,clicks:1,ctr:0.23,spend:132,orders:0,addedDaysAgo:4,reason:"low_ctr"},
    ],
    minusArchive:[
      {id:10,keyword:"чемодан",impressions:980,clicks:3,ctr:0.31,spend:294,orders:0,deletedAt:"02.03.2026",deletedBy:"авто",reason:"CTR < 0.5%"},
      {id:11,keyword:"сумка городская",impressions:560,clicks:2,ctr:0.36,spend:168,orders:0,deletedAt:"28.02.2026",deletedBy:"ручное",reason:"Ручное удаление"},
    ],
  },
};

// ── УТИЛИТЫ ────────────────────────────────────────────────────────────────────
const fmt={
  pct:v=>v==null?"—":`${v.toFixed(2)}%`,
  pct1:v=>v==null?"—":`${v.toFixed(1)}%`,
  rub:v=>v==null?"—":`${Math.round(v).toLocaleString("ru-RU")} ₽`,
  rubK:v=>v==null?"—":v>=1000?`${(v/1000).toFixed(0)} 000 ₽`:`${Math.round(v)} ₽`,
  num:v=>v==null?"—":Number(v).toLocaleString("ru-RU"),
};
function getDrrStatus(drr,target){
  if(!target||drr==null||drr===0)return"neutral";
  if(drr<=target*0.9)return"great";
  if(drr<=target)return"good";
  if(drr<=target*1.15)return"warn";
  return"bad";
}
const DRR_ST={great:{c:T.green,l:"↓ ниже цели"},good:{c:T.green,l:"✓ норма"},warn:{c:T.yellow,l:"↑ растёт"},bad:{c:T.red,l:"↑↑ высокий"},neutral:{c:T.sub,l:""}};
function DrrBadge({drr,target}){
  if(!drr||drr===0)return <span style={{color:T.sub,fontFamily:"monospace"}}>—</span>;
  const st=DRR_ST[getDrrStatus(drr,target)];
  const delta=target?drr-target:null;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:1}}>
      <span style={{color:st.c,fontFamily:"monospace",fontWeight:700,fontSize:12}}>{fmt.pct1(drr)}</span>
      {st.l&&<span style={{color:st.c,fontSize:9}}>{st.l}</span>}
      {delta!==null&&delta!==0&&<span style={{color:delta>0?T.red:T.green,fontSize:9}}>{delta>0?`+${delta.toFixed(1)}`:delta.toFixed(1)}%</span>}
    </div>
  );
}
function getCtrSt(ctr){
  if(ctr===0)return{bg:"rgba(255,255,255,0.05)",c:T.sub};
  if(ctr>=3) return{bg:"#7c3aed",c:"#fff"};
  if(ctr>=1) return{bg:"#15803d",c:"#fff"};
  if(ctr>=0.7)return{bg:"transparent",c:T.text};
  return{bg:"#dc2626",c:"#fff"};
}
function SectionTitle({children,marginBottom=10}){
  return <div style={{fontSize:11,fontWeight:700,color:T.sub,letterSpacing:1,textTransform:"uppercase",marginBottom}}>{children}</div>;
}
function Tabs({tabs,active,onChange,accent}){
  return(
    <div style={{display:"flex",gap:4,marginBottom:12,flexWrap:"wrap"}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>onChange(t.id)}
          style={{padding:"6px 12px",borderRadius:8,border:"none",fontSize:11,fontWeight:active===t.id?700:400,cursor:"pointer",
            background:active===t.id?(accent||T.wb):"rgba(255,255,255,0.05)",color:active===t.id?"#fff":T.sub}}>
          {t.label}
        </button>
      ))}
    </div>
  );
}
const selectStyle={width:"100%",background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:"9px 12px",fontSize:13,color:T.text,outline:"none",boxSizing:"border-box"};

// Выбор периода + кампании (переиспользуемый компонент)
const PERIODS=[{id:"today",l:"Сегодня"},{id:"yesterday",l:"Вчера"},{id:"7d",l:"7 дней"},{id:"custom",l:"Период"}];
function PeriodPicker({period,onChange,campaigns,selectedCampaign,onChangeCampaign}){
  const [customFrom,setCustomFrom]=useState("01.03.2026");
  const [customTo,setCustomTo]=useState("05.03.2026");
  return(
    <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:12}}>
      <div style={{display:"flex",gap:4}}>
        {PERIODS.map(p=>(
          <button key={p.id} onClick={()=>onChange(p.id)}
            style={{padding:"5px 10px",borderRadius:8,border:"none",fontSize:11,cursor:"pointer",
              background:period===p.id?"rgba(124,58,237,0.3)":"rgba(255,255,255,0.05)",
              color:period===p.id?"#c4b5fd":T.sub,fontWeight:period===p.id?700:400}}>
            {p.l}
          </button>
        ))}
      </div>
      {period==="custom"&&(
        <div style={{display:"flex",gap:4,alignItems:"center",fontSize:11,color:T.sub}}>
          <input value={customFrom} onChange={e=>setCustomFrom(e.target.value)}
            style={{background:T.card2,border:`1px solid ${T.border}`,borderRadius:8,padding:"4px 8px",fontSize:11,color:T.text,width:90,outline:"none"}}/>
          <span>—</span>
          <input value={customTo} onChange={e=>setCustomTo(e.target.value)}
            style={{background:T.card2,border:`1px solid ${T.border}`,borderRadius:8,padding:"4px 8px",fontSize:11,color:T.text,width:90,outline:"none"}}/>
        </div>
      )}
      {campaigns&&(
        <select value={selectedCampaign} onChange={e=>onChangeCampaign(e.target.value)}
          style={{background:T.card2,border:`1px solid ${T.border}`,borderRadius:8,padding:"5px 10px",fontSize:11,color:T.text,outline:"none",cursor:"pointer"}}>
          <option value="all">Все кампании</option>
          {campaigns.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ОБЗОР
// ═══════════════════════════════════════════════════════════════════════════════
function TabOverview({data,platform,targetDrr,onGoToPlanFact}){
  const d=data.today;
  const today=data.daily[0];
  const yesterday=data.daily[1];
  const allDays=data.daily;

  // Переключатели периода для ключевых блоков
  const [metricsPeriod,setMetricsPeriod]=useState("7d");
  const [placementsPeriod,setPlacementsPeriod]=useState("7d");

  function getPeriodDays(period){
    if(period==="today") return allDays.slice(0,1);
    if(period==="yesterday") return allDays.slice(1,2);
    return allDays.slice(0,7);
  }

  const PERIOD_BTNS=[{id:"today",l:"Сегодня"},{id:"yesterday",l:"Вчера"},{id:"7d",l:"7 дней"}];
  function PeriodSwitch({value,onChange}){
    return(
      <div style={{display:"flex",gap:4,marginBottom:12}}>
        {PERIOD_BTNS.map(p=>(
          <button key={p.id} onClick={()=>onChange(p.id)}
            style={{padding:"4px 10px",borderRadius:7,border:`1px solid ${value===p.id?"rgba(124,58,237,0.5)":T.border}`,
              background:value===p.id?"rgba(124,58,237,0.15)":"transparent",
              color:value===p.id?"#c4b5fd":T.sub,fontSize:11,fontWeight:value===p.id?700:400,cursor:"pointer"}}>
            {p.l}
          </button>
        ))}
      </div>
    );
  }

  // Агрегаты по выбранному периоду — метрики
  const mDays=getPeriodDays(metricsPeriod);
  const totalSpend=mDays.reduce((s,x)=>s+x.spend,0);
  const totalRev=mDays.reduce((s,x)=>s+x.revenue,0);
  const totalImpr=mDays.reduce((s,x)=>s+x.impressions,0);
  const totalClicks=mDays.reduce((s,x)=>s+x.clicks,0);
  const totalBaskets=mDays.reduce((s,x)=>s+x.baskets,0);
  const totalOrders=mDays.reduce((s,x)=>s+x.orders,0);
  const factDrr=totalRev>0?totalSpend/totalRev*100:null;
  const drrSt=getDrrStatus(factDrr,targetDrr);

  // Для спарклайна всегда берём 7 дней
  const week=allDays.slice(0,7);
  const avgCpm=totalImpr>0?totalSpend/totalImpr*1000:0;
  const avgCtr=totalImpr>0?totalClicks/totalImpr*100:0;
  const avgCpc=totalClicks>0?totalSpend/totalClicks:0;
  const avgCpl=totalBaskets>0?totalSpend/totalBaskets:0;
  const avgCpo=totalOrders>0?totalSpend/totalOrders:0;
  const cro=totalBaskets>0?totalOrders/totalBaskets*100:0;

  // Динамика корзин сегодня/вчера
  const basketToday=today?.baskets||0;
  const basketYest=yesterday?.baskets||0;
  const basketDiff=basketToday-basketYest;
  const basketPct=basketYest>0?basketDiff/basketYest*100:0;

  // Бюджет
  const budgetSpendPct=data.budgetPlan>0?Math.round(totalSpend/data.budgetPlan*100):null;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>

      {/* ── ПЛАН/ФАКТ КАРТОЧКА ── */}
      <div style={{...S.card,background:"rgba(124,58,237,0.06)",borderColor:"rgba(124,58,237,0.2)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <SectionTitle marginBottom={0}>📋 План / Факт</SectionTitle>
          <button onClick={onGoToPlanFact} style={{fontSize:10,color:"#a78bfa",background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.25)",borderRadius:7,padding:"3px 8px",cursor:"pointer"}}>
            {targetDrr?"Изменить":"Задать ДРР →"}
          </button>
        </div>
        {!targetDrr?(
          <div style={{fontSize:12,color:T.yellow,background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:8,padding:"8px 12px"}}>
            ⚠️ Задайте целевой ДРР — метрики отображаются без ориентира
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {/* ДРР */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:11,color:T.sub,marginBottom:2}}>ДРР факт / цель</div>
                <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                  <span style={{fontSize:26,fontWeight:700,fontFamily:"monospace",color:DRR_ST[drrSt].c}}>{factDrr?factDrr.toFixed(1):"—"}%</span>
                  <span style={{fontSize:13,color:T.sub}}>/ {targetDrr}%</span>
                </div>
              </div>
              <div style={{fontSize:22,padding:"10px 14px",borderRadius:12,background:`${DRR_ST[drrSt].c}18`,border:`1px solid ${DRR_ST[drrSt].c}30`}}>
                {drrSt==="great"?"🎯":drrSt==="good"?"✅":drrSt==="warn"?"⚠️":"🚨"}
              </div>
            </div>
            {/* Бюджет прогресс */}
            {data.budgetPlan>0&&(
              <div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:5}}>
                  <span style={{color:T.sub}}>💰 Бюджет: {fmt.rubK(totalSpend)} / {fmt.rubK(data.budgetPlan)}</span>
                  <span style={{color:budgetSpendPct>=90?T.red:budgetSpendPct>=70?T.yellow:T.green,fontWeight:700}}>{budgetSpendPct}%</span>
                </div>
                <div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${Math.min(budgetSpendPct,100)}%`,background:budgetSpendPct>=90?T.red:budgetSpendPct>=70?T.yellow:T.green,borderRadius:3}}/>
                </div>
              </div>
            )}
            {/* Мини метрики план/факт */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
              {[
                {l:"Выручка",f:fmt.rubK(totalRev),p:fmt.rubK(data.revenuePlan),pct:data.revenuePlan?Math.round(totalRev/data.revenuePlan*100):null},
                {l:"Заказы",f:totalOrders,p:data.ordersPlan,pct:data.ordersPlan?Math.round(totalOrders/data.ordersPlan*100):null},
                {l:"% выкупа",f:`${d.fromAd.buyoutPct}%`,p:`${data.buyoutPlan}%`,pct:data.buyoutPlan?Math.round(d.fromAd.buyoutPct/data.buyoutPlan*100):null},
              ].map(m=>(
                <div key={m.l} style={{...S.card2,padding:"8px 10px"}}>
                  <div style={{fontSize:9,color:T.sub,marginBottom:2}}>{m.l}</div>
                  <div style={{fontSize:12,fontWeight:700,color:T.text}}>{m.f}</div>
                  <div style={{fontSize:9,color:T.sub}}>план: {m.p}</div>
                  {m.pct!=null&&<div style={{fontSize:9,fontWeight:700,color:m.pct>=80?T.green:m.pct>=50?T.yellow:T.red,marginTop:2}}>{m.pct}%</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── СЕГОДНЯ КЛЮЧЕВЫЕ МЕТРИКИ ── */}
      <div style={S.card}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
          <SectionTitle marginBottom={0}>Сегодня</SectionTitle>
          <span style={{fontSize:11,color:T.sub}}>{platform==="wb"?"🟣 Wildberries":"🔵 Ozon"}</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          {[
            {icon:"💰",label:"Выручка",val:fmt.rubK(d.revenue),plan:d.revenuePlan,valRaw:d.revenue},
            {icon:"📦",label:"Заказы", val:d.orders,           plan:d.ordersPlan, valRaw:d.orders},
            {icon:"📢",label:"Расход", val:fmt.rubK(d.adSpend),plan:d.adSpendPlan,valRaw:d.adSpend},
            {icon:"🔄",label:"Конверсия",val:`${d.conversion}%`,plan:d.conversionPlan,valRaw:d.conversion},
          ].map(m=>{
            const p=m.plan?Math.round(m.valRaw/m.plan*100):0;
            const col=p>=80?T.green:p>=50?T.yellow:T.red;
            return(
              <div key={m.label} style={S.card2}>
                <div style={{fontSize:11,color:T.sub}}>{m.icon} {m.label}</div>
                <div style={{fontSize:20,fontWeight:700,color:T.text,fontFamily:"monospace"}}>{m.val}</div>
                <div style={{fontSize:10,color:col,marginTop:2}}>▼ {100-p}% к плану</div>
              </div>
            );
          })}
        </div>
        {/* Корзины с динамикой */}
        <div style={{...S.card2,borderColor:basketDiff>0?"rgba(74,222,128,0.2)":basketDiff<0?"rgba(248,113,113,0.2)":T.border}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:11,color:T.sub,marginBottom:4}}>🛒 Корзины сегодня</div>
              <div style={{display:"flex",alignItems:"baseline",gap:10}}>
                <span style={{fontSize:24,fontWeight:700,fontFamily:"monospace",color:T.text}}>{basketToday}</span>
                <span style={{fontSize:13,fontWeight:700,color:basketDiff>0?T.green:basketDiff<0?T.red:T.sub}}>
                  {basketDiff>0?`↑ +${basketDiff}`:basketDiff<0?`↓ ${basketDiff}`:"→ без изм."}
                </span>
                {basketYest>0&&<span style={{fontSize:11,color:T.sub}}>({basketPct>0?"+":""}{basketPct.toFixed(0)}% к вчера)</span>}
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:9,color:T.sub,marginBottom:2}}>Спарклайн</div>
              <div style={{display:"flex",gap:2,alignItems:"flex-end"}}>
                {week.slice().reverse().map((d2,i)=>{
                  const maxB=Math.max(...week.map(x=>x.baskets),1);
                  const h=Math.max(3,Math.round(d2.baskets/maxB*28));
                  return <div key={i} style={{width:6,height:h,borderRadius:2,background:i===week.length-1?"#a78bfa":"rgba(167,139,250,0.35)"}}/>;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ПОЛНЫЕ МЕТРИКИ РЕКЛАМЫ ── */}
      <div style={S.card}>
        <SectionTitle>📊 Метрики рекламы</SectionTitle>
        <PeriodSwitch value={metricsPeriod} onChange={setMetricsPeriod}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          {[
            {l:"Показы",      v:fmt.num(totalImpr),     sub:""},
            {l:"Клики",       v:fmt.num(totalClicks),   sub:""},
            {l:"CPM ср.",     v:fmt.rub(avgCpm),        sub:"за 1000 показов"},
            {l:"CTR",         v:fmt.pct(avgCtr),        sub:"клики/показы"},
            {l:"CPC",         v:fmt.rub(avgCpc),        sub:"цена клика"},
            {l:"CPL",         v:fmt.rub(avgCpl),        sub:"цена корзины"},
            {l:"CPO",         v:fmt.rub(avgCpo),        sub:"цена заказа"},
            {l:"CRO",         v:fmt.pct1(cro),          sub:"корзина→заказ"},
          ].map(m=>(
            <div key={m.l} style={{...S.card2,padding:"9px 10px"}}>
              <div style={{fontSize:10,color:T.sub,marginBottom:2}}>{m.l}</div>
              <div style={{fontSize:16,fontWeight:700,fontFamily:"monospace",color:T.text}}>{m.v}</div>
              {m.sub&&<div style={{fontSize:9,color:T.sub,marginTop:1}}>{m.sub}</div>}
            </div>
          ))}
        </div>
        {/* Доп. метрики */}
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {[
            {l:"📋 Заказано с рекламы",v:`${d.fromAd.ordered} шт | ${fmt.rubK(d.fromAd.orderedRevenue)}`},
            {l:"📊 % выкупа трафика",  v:`${d.fromAd.buyoutPct}%`,c:d.fromAd.buyoutPct>=80?T.green:d.fromAd.buyoutPct>=60?T.yellow:T.red},
            {l:"💸 Доля затрат в выручке",v:totalRev>0?`${(totalSpend/totalRev*100).toFixed(1)}%`:"—"},
            {l:"📈 CRF (корзина→заказ)", v:totalOrders>0&&totalBaskets>0?`${(totalOrders/totalBaskets*100).toFixed(1)}%`:"—"},
          ].map(m=>(
            <div key={m.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${T.border}`}}>
              <span style={{fontSize:12,color:T.sub}}>{m.l}</span>
              <span style={{fontSize:13,fontWeight:600,color:m.c||T.text}}>{m.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── МЕСТА РАЗМЕЩЕНИЯ ── */}
      <div style={S.card}>
        <SectionTitle>📍 По местам размещения</SectionTitle>
        <PeriodSwitch value={placementsPeriod} onChange={setPlacementsPeriod}/>
        {(()=>{
          const pDays=getPeriodDays(placementsPeriod);
          const pSrcAgg={};
          pDays.forEach(day=>{
            (day.sources||[]).forEach(s=>{
              if(!pSrcAgg[s.type])pSrcAgg[s.type]={type:s.type,spend:0,impressions:0,clicks:0,orders:0};
              pSrcAgg[s.type].spend+=s.spend;
              pSrcAgg[s.type].impressions+=s.impressions;
              pSrcAgg[s.type].clicks+=s.clicks;
              pSrcAgg[s.type].orders+=s.orders||0;
            });
          });
          const pTotalSpend=pDays.reduce((s,x)=>s+x.spend,0);
          Object.values(pSrcAgg).forEach(s=>{
            s.ctr=s.impressions>0?s.clicks/s.impressions*100:0;
            s.cpm=s.impressions>0?s.spend/s.impressions*1000:0;
            s.cpc=s.clicks>0?s.spend/s.clicks:0;
            s.pct=pTotalSpend>0?s.spend/pTotalSpend*100:0;
          });
          const pSources=Object.values(pSrcAgg).sort((a,b)=>b.spend-a.spend);
          const SRC_COLOR={поиск:"#6366f1",полки:"#0ea5e9",каталог:"#f59e0b"};
          return(
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {pSources.map(s=>(
                <div key={s.type} style={{...S.card2,borderLeft:`3px solid ${SRC_COLOR[s.type]||"#6366f1"}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <span style={{fontSize:13,fontWeight:700,color:T.text,textTransform:"capitalize"}}>{s.type}</span>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <span style={{fontSize:11,color:T.sub}}>{s.pct.toFixed(0)}% бюджета</span>
                      <div style={{background:`${SRC_COLOR[s.type]||"#6366f1"}20`,borderRadius:6,padding:"2px 8px"}}>
                        <span style={{fontSize:11,fontWeight:700,color:SRC_COLOR[s.type]||"#6366f1"}}>{fmt.rubK(s.spend)}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:2,marginBottom:10,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${s.pct}%`,background:SRC_COLOR[s.type]||"#6366f1",borderRadius:2}}/>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                    {[
                      {l:"Показы",v:fmt.num(s.impressions)},
                      {l:"Клики", v:fmt.num(s.clicks)},
                      {l:"CTR",   v:`${s.ctr.toFixed(2)}%`},
                      {l:"CPM",   v:fmt.rub(s.cpm)},
                      {l:"CPC",   v:fmt.rub(s.cpc)},
                      {l:"Заказы",v:fmt.num(s.orders)},
                    ].map(m=>(
                      <div key={m.l} style={{textAlign:"center",padding:"5px 2px",background:"rgba(255,255,255,0.02)",borderRadius:6}}>
                        <div style={{fontSize:9,color:T.sub,marginBottom:2}}>{m.l}</div>
                        <div style={{fontSize:12,fontWeight:700,fontFamily:"monospace",color:T.text}}>{m.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* ── ПО КАМПАНИЯМ ── */}
      <div style={S.card}>
        <SectionTitle>По кампаниям</SectionTitle>
        {[...data.campaigns].sort((a,b)=>b.drr-a.drr).map(c=>{
          const drrSt2=getDrrStatus(c.drr,targetDrr);
          // Корзины по кампании из keywords
          const campKws=data.keywords.filter(k=>k.campaignId===c.id);
          const campBaskets=campKws.reduce((s,k)=>s+k.baskets,0);
          return(
            <div key={c.id} style={{padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,color:T.text,fontWeight:600}}>{c.name}</div>
                  <div style={{display:"flex",gap:12,marginTop:4,flexWrap:"wrap"}}>
                    <span style={{fontSize:11,color:T.sub}}>{fmt.rubK(c.spend)}</span>
                    <span style={{fontSize:11,color:T.sub}}>CPO {fmt.rub(c.cpo)}</span>
                    <span style={{fontSize:11,color:"#38bdf8"}}>🛒 {campBaskets} корз.</span>
                    <span style={{fontSize:11,color:T.sub}}>{c.orders} зак.</span>
                  </div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:15,fontWeight:700,fontFamily:"monospace",color:!targetDrr?T.text:DRR_ST[drrSt2].c}}>{c.drr}%</div>
                  <div style={{fontSize:9,color:T.sub}}>ДРР</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ВОРОНКА — по кампании + период
// ═══════════════════════════════════════════════════════════════════════════════
function TabFunnel({data}){
  const [period,setPeriod]=useState("7d");
  const [selCamp,setSelCamp]=useState("all");

  // Фильтр дней по периоду (упрощённо для демо)
  const allDays=data.daily;
  const days=period==="today"?allDays.slice(0,1):period==="yesterday"?allDays.slice(1,2):allDays;

  // Фильтр ключей по кампании
  const kws=selCamp==="all"?data.keywords:data.keywords.filter(k=>String(k.campaignId)===String(selCamp));

  const totals={
    impressions:days.reduce((s,d)=>s+d.impressions,0),
    clicks:days.reduce((s,d)=>s+d.clicks,0),
    baskets:days.reduce((s,d)=>s+d.baskets,0),
    orders:days.reduce((s,d)=>s+d.orders,0),
    buyout:Math.round(days.reduce((s,d)=>s+d.orders,0)*0.873),
  };
  const steps=[
    {label:"👁 Показы",  val:totals.impressions,pct:100,cr:null},
    {label:"👆 Клики",   val:totals.clicks,      pct:totals.impressions?+(totals.clicks/totals.impressions*100).toFixed(2):0,cr:"CTR"},
    {label:"🛒 Корзины", val:totals.baskets,     pct:totals.clicks?+(totals.baskets/totals.clicks*100).toFixed(1):0,cr:"CR корзина"},
    {label:"📦 Заказы",  val:totals.orders,      pct:totals.baskets?+(totals.orders/totals.baskets*100).toFixed(1):0,cr:"CR заказ"},
    {label:"✅ Выкуп",   val:totals.buyout,      pct:totals.orders?+(totals.buyout/totals.orders*100).toFixed(1):0,cr:"% выкупа"},
  ];
  const maxVal=steps[0].val||1;
  const cols=["#6366f1","#3b82f6","#0ea5e9",T.green,T.yellow];

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={S.card}>
        <SectionTitle>🔽 Воронка продаж</SectionTitle>
        <PeriodPicker period={period} onChange={setPeriod} campaigns={data.campaigns} selectedCampaign={selCamp} onChangeCampaign={setSelCamp}/>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {steps.map((s,i)=>{
            const w=s.val/maxVal*100;
            return(
              <div key={s.label}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:13,color:T.text,fontWeight:500}}>{s.label}</span>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontFamily:"monospace",fontWeight:700,color:T.text,fontSize:14}}>{fmt.num(s.val)}</span>
                    {s.cr&&<span style={{fontSize:11,color:cols[i],fontWeight:600,background:`${cols[i]}18`,padding:"2px 8px",borderRadius:8}}>{s.cr}: {s.pct}%</span>}
                  </div>
                </div>
                <div style={{height:28,background:"rgba(255,255,255,0.04)",borderRadius:8,overflow:"hidden",position:"relative"}}>
                  <div style={{height:"100%",width:`${w}%`,background:`${cols[i]}30`,borderRadius:8}}/>
                  <div style={{height:4,width:`${w}%`,background:cols[i],borderRadius:2,position:"absolute",bottom:0,left:0}}/>
                </div>
                {i<steps.length-1&&<div style={{textAlign:"center",fontSize:10,color:T.sub,margin:"2px 0"}}>↓ конверсия {steps[i+1].pct}%</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* По каждой кампании */}
      <div style={S.card}>
        <SectionTitle>По кампаниям</SectionTitle>
        {data.campaigns.map(c=>{
          const ratio=c.orders/Math.max(totals.orders,1);
          const cImp=Math.round(totals.impressions*ratio);
          const cCl=Math.round(cImp*0.012);
          const cBsk=Math.round(cCl*0.25);
          const cBykt=Math.round(c.orders*0.87);
          const csteps=[cImp,cCl,cBsk,c.orders,cBykt];
          const clabels=["Показы","Клики","Корзины","Заказы","Выкуп"];
          return(
            <div key={c.id} style={{...S.card2,marginBottom:8}}>
              <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:8}}>{c.name}</div>
              <div style={{display:"flex",gap:4,alignItems:"flex-end"}}>
                {csteps.map((v,i)=>{
                  const h=csteps[0]?Math.max(v/csteps[0]*56,6):6;
                  return(
                    <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                      <div style={{width:"100%",height:h,background:cols[i],borderRadius:4,opacity:0.8}}/>
                      <div style={{fontSize:9,color:T.sub,textAlign:"center"}}>{clabels[i]}</div>
                      <div style={{fontSize:10,fontFamily:"monospace",color:T.text,fontWeight:600}}>{fmt.num(v)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* По ключам топ-5 с фильтром */}
      <div style={S.card}>
        <SectionTitle>По ключевым словам (топ-5)</SectionTitle>
        <PeriodPicker period={period} onChange={setPeriod} campaigns={data.campaigns} selectedCampaign={selCamp} onChangeCampaign={setSelCamp}/>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead>
              <tr>{["Ключ","Показы","Клики","CTR","Корзины","Заказы","CR зак.","Выкуп"].map(h=>(
                <th key={h} style={{padding:"6px 8px",textAlign:"left",color:T.sub,borderBottom:`1px solid ${T.border}`,whiteSpace:"nowrap"}}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {kws.slice(0,5).map(kw=>{
                const bykt=Math.round(kw.orders*0.87);
                const crOrder=kw.baskets?+(kw.orders/kw.baskets*100).toFixed(1):0;
                const ctrSt=getCtrSt(kw.ctr);
                return(
                  <tr key={kw.keyword} style={{borderBottom:`1px solid ${T.border}`}}>
                    <td style={{padding:"7px 8px",color:T.text,maxWidth:130}}>{kw.keyword}</td>
                    <td style={{padding:"7px 8px",fontFamily:"monospace",color:T.sub}}>{fmt.num(kw.impressions)}</td>
                    <td style={{padding:"7px 8px",fontFamily:"monospace",color:T.sub}}>{kw.clicks}</td>
                    <td style={{padding:"7px 8px"}}>
                      <span style={{fontFamily:"monospace",fontWeight:700,fontSize:11,padding:"2px 6px",borderRadius:6,background:ctrSt.bg,color:ctrSt.c}}>{fmt.pct(kw.ctr)}</span>
                    </td>
                    <td style={{padding:"7px 8px",fontFamily:"monospace",color:T.sub}}>{kw.baskets}</td>
                    <td style={{padding:"7px 8px",fontFamily:"monospace",color:T.text,fontWeight:700}}>{kw.orders}</td>
                    <td style={{padding:"7px 8px",fontFamily:"monospace",color:crOrder>=5?T.green:crOrder>=2?T.yellow:T.red}}>{crOrder}%</td>
                    <td style={{padding:"7px 8px",fontFamily:"monospace",color:T.green}}>{bykt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// РАЗМЕЩЕНИЕ + выбор периода
// ═══════════════════════════════════════════════════════════════════════════════
function TabPlacements({data,targetDrr}){
  const [period,setPeriod]=useState("7d");
  const [kwPeriod,setKwPeriod]=useState("7d");
  const days=period==="today"?data.daily.slice(0,1):period==="yesterday"?data.daily.slice(1,2):data.daily;
  const PERIOD_BTNS2=[{id:"today",l:"Сегодня"},{id:"yesterday",l:"Вчера"},{id:"7d",l:"7 дней"}];
  function PeriodSwitch2({value,onChange}){
    return(
      <div style={{display:"flex",gap:4,marginBottom:12}}>
        {PERIOD_BTNS2.map(p=>(
          <button key={p.id} onClick={()=>onChange(p.id)}
            style={{padding:"4px 10px",borderRadius:7,border:`1px solid ${value===p.id?"rgba(124,58,237,0.5)":T.border}`,
              background:value===p.id?"rgba(124,58,237,0.15)":"transparent",
              color:value===p.id?"#c4b5fd":T.sub,fontSize:11,fontWeight:value===p.id?700:400,cursor:"pointer"}}>
            {p.l}
          </button>
        ))}
      </div>
    );
  }
  const placementIcons={"поиск":"🔍","полки":"🗂","каталог":"📋"};
  const types=["поиск","полки","каталог"];
  const totals=types.map(type=>{
    const rows=days.flatMap(d=>(d.sources||[]).filter(s=>s.type===type));
    return{type,spend:rows.reduce((s,r)=>s+r.spend,0),impressions:rows.reduce((s,r)=>s+(r.impressions||0),0),clicks:rows.reduce((s,r)=>s+(r.clicks||0),0),orders:rows.reduce((s,r)=>s+(r.orders||0),0)};
  }).filter(t=>t.impressions>0);
  const totalSpendAll=totals.reduce((s,t)=>s+t.spend,0);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={S.card}>
        <SectionTitle>Сводка по типам размещения</SectionTitle>
        <PeriodPicker period={period} onChange={setPeriod}/>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {totals.map(t=>{
            const ctr=t.impressions?+(t.clicks/t.impressions*100).toFixed(2):0;
            const cpc=t.clicks?+(t.spend/t.clicks).toFixed(0):0;
            const revenue=t.orders*1800;
            const drr=revenue?+(t.spend/revenue*100).toFixed(1):null;
            const sharePct=totalSpendAll?Math.round(t.spend/totalSpendAll*100):0;
            const accentCol=t.type==="поиск"?"#6366f1":t.type==="полки"?"#3b82f6":"#0ea5e9";
            return(
              <div key={t.type} style={S.card2}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:20}}>{placementIcons[t.type]}</span>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:T.text,textTransform:"capitalize"}}>{t.type}</div>
                      <div style={{fontSize:11,color:T.sub}}>{sharePct}% бюджета</div>
                    </div>
                  </div>
                  <DrrBadge drr={drr} target={targetDrr}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
                  {[{l:"Показы",v:fmt.num(t.impressions)},{l:"Клики",v:fmt.num(t.clicks)},{l:"CTR",v:fmt.pct(ctr),c:ctr>=1?T.green:ctr>=0.7?T.text:T.red},{l:"CPC",v:fmt.rub(cpc)},{l:"Затраты",v:fmt.rub(t.spend),bold:true}].map(m=>(
                    <div key={m.l}><div style={{fontSize:9,color:T.sub}}>{m.l}</div><div style={{fontSize:12,fontFamily:"monospace",fontWeight:m.bold?700:500,color:m.c||T.text}}>{m.v}</div></div>
                  ))}
                </div>
                <div style={{marginTop:8,height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${sharePct}%`,background:accentCol,borderRadius:2}}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── КЛЮЧИ — расширенная карточная таблица ── */}
      <div style={S.card}>
        <SectionTitle>По ключевым словам — полные метрики</SectionTitle>
        <PeriodSwitch2 value={kwPeriod} onChange={setKwPeriod}/>
        {(()=>{
          // Масштабируем метрики ключей по выбранному периоду
          const kwScale=kwPeriod==="today"?1/7:kwPeriod==="yesterday"?1/6:1;
          return(
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {data.keywords.map((kw,ki)=>{
                const kwS={...kw,
                  impressions:Math.round(kw.impressions*kwScale),
                  clicks:Math.max(0,Math.round(kw.clicks*kwScale)),
                  baskets:Math.max(0,Math.round(kw.baskets*kwScale)),
                  orders:Math.max(0,Math.round(kw.orders*kwScale)),
                  spend:Math.round(kw.spend*kwScale),
                  revenue:Math.round(kw.revenue*kwScale),
                };
                const drr=kwS.revenue>0?kwS.spend/kwS.revenue*100:null;
                const ctrSt=getCtrSt(kwS.ctr);
                const pc=pos=>pos<=5?"#4ade80":pos<=10?"#86efac":pos<=20?"#fbbf24":"#f87171";
                const dS=kwS.posPrev-kwS.posSearch;
                const dP=Math.round((kwS.posPrev-kwS.posShelves)*0.8);
                const cpl=kwS.baskets>0?kwS.spend/kwS.baskets:null;
                const cro=kwS.baskets>0?kwS.orders/kwS.baskets*100:0;
                const crf=kwS.impressions>0?kwS.baskets/kwS.impressions*100:0;
                // Мок динамики корзин: ±рандомно на основе ki
                const basketDiff=[2,-1,0,1,-2,3][ki%6];
                const basketYest=Math.max(1,kwS.baskets-basketDiff);
                const basketPct=basketYest>0?basketDiff/basketYest*100:0;
                return(
                  <div key={kw.keyword} style={{...S.card2,borderLeft:`3px solid ${kwS.alert?"rgba(248,113,113,0.6)":drr&&targetDrr&&drr>targetDrr?"rgba(251,191,36,0.5)":"rgba(74,222,128,0.3)"}`}}>
                    {/* Строка 1: Ключ + позиции */}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
                          {kwS.alert&&<span style={{fontSize:10}}>⚠️</span>}
                          <span style={{fontSize:13,color:T.text,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{kwS.keyword}</span>
                        </div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          {/* Поиск */}
                          <div style={{display:"flex",alignItems:"center",gap:3,background:"rgba(99,102,241,0.1)",borderRadius:6,padding:"2px 7px"}}>
                            <span style={{fontSize:9,color:"#a5b4fc"}}>🔍</span>
                            <span style={{fontFamily:"monospace",fontWeight:700,fontSize:12,color:pc(kwS.posSearch)}}>{kwS.posSearch}</span>
                            <span style={{fontSize:10,fontWeight:700,color:dS>0?T.green:dS<0?T.red:T.sub}}>{dS>0?`↑${dS}`:dS<0?`↓${Math.abs(dS)}`:"→"}</span>
                            <span style={{fontSize:9,color:T.sub}}>{kwS.bidSearch}₽</span>
                          </div>
                          {/* Полки */}
                          <div style={{display:"flex",alignItems:"center",gap:3,background:"rgba(59,130,246,0.1)",borderRadius:6,padding:"2px 7px"}}>
                            <span style={{fontSize:9,color:"#93c5fd"}}>🗂</span>
                            <span style={{fontFamily:"monospace",fontWeight:700,fontSize:12,color:pc(kwS.posShelves)}}>{kwS.posShelves}</span>
                            <span style={{fontSize:10,fontWeight:700,color:dP>0?T.green:dP<0?T.red:T.sub}}>{dP>0?`↑${dP}`:dP<0?`↓${Math.abs(dP)}`:"→"}</span>
                            <span style={{fontSize:9,color:T.sub}}>{kwS.bidShelves}₽</span>
                          </div>
                        </div>
                      </div>
                      {/* ДРР */}
                      <DrrBadge drr={drr} target={targetDrr}/>
                    </div>

                    {/* Строка 2: Метрики трафика */}
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,marginBottom:8}}>
                      {[
                        {l:"Показы",v:fmt.num(kwS.impressions),sub:""},
                        {l:"Клики",v:kwS.clicks,sub:""},
                        {l:"CTR",v:fmt.pct(kwS.ctr),c:ctrSt.c,bg:ctrSt.bg},
                        {l:"CPC",v:fmt.rub(kwS.spend/Math.max(kwS.clicks,1)),sub:""},
                      ].map(m=>(
                        <div key={m.l} style={{textAlign:"center",background:m.bg||"rgba(255,255,255,0.02)",borderRadius:6,padding:"4px 2px"}}>
                          <div style={{fontSize:9,color:T.sub}}>{m.l}</div>
                          <div style={{fontSize:11,fontWeight:700,fontFamily:"monospace",color:m.c||T.text}}>{m.v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Строка 3: Корзины с динамикой */}
                    <div style={{...S.card2,padding:"7px 10px",marginBottom:8,background:basketDiff>0?"rgba(74,222,128,0.05)":basketDiff<0?"rgba(248,113,113,0.05)":"rgba(255,255,255,0.02)",borderColor:basketDiff>0?"rgba(74,222,128,0.2)":basketDiff<0?"rgba(248,113,113,0.2)":T.border}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:16}}>🛒</span>
                          <div>
                            <div style={{fontSize:9,color:T.sub}}>Корзины</div>
                            <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                              <span style={{fontSize:18,fontWeight:700,fontFamily:"monospace",color:T.text}}>{kwS.baskets}</span>
                              <span style={{fontSize:12,fontWeight:700,color:basketDiff>0?T.green:basketDiff<0?T.red:T.sub}}>
                                {basketDiff>0?`↑ +${basketDiff}`:basketDiff<0?`↓ ${basketDiff}`:"→"}
                              </span>
                              <span style={{fontSize:10,color:T.sub}}>({basketPct>0?"+":""}{basketPct.toFixed(0)}% к вчера)</span>
                            </div>
                          </div>
                        </div>
                        <div style={{display:"flex",gap:12}}>
                          <div style={{textAlign:"center"}}>
                            <div style={{fontSize:9,color:T.sub}}>CPL</div>
                            <div style={{fontSize:12,fontWeight:700,fontFamily:"monospace",color:T.text}}>{cpl?fmt.rub(cpl):"—"}</div>
                          </div>
                          <div style={{textAlign:"center"}}>
                            <div style={{fontSize:9,color:T.sub}}>CRO</div>
                            <div style={{fontSize:12,fontWeight:700,fontFamily:"monospace",color:cro>=10?T.green:cro>=5?T.yellow:T.red}}>{cro.toFixed(1)}%</div>
                          </div>
                          <div style={{textAlign:"center"}}>
                            <div style={{fontSize:9,color:T.sub}}>CRF</div>
                            <div style={{fontSize:12,fontWeight:700,fontFamily:"monospace",color:T.text}}>{crf.toFixed(2)}%</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Строка 4: Заказы + затраты + доля */}
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5}}>
                      {[
                        {l:"Заказы",v:kwS.orders,c:kwS.orders>0?T.green:T.red},
                        {l:"Затраты",v:fmt.rub(kwS.spend),sub:""},
                        {l:"Выручка",v:fmt.rubK(kwS.revenue),sub:""},
                        {l:"Доля затр.",v:kwS.revenue>0?`${(kwS.spend/kwS.revenue*100).toFixed(1)}%`:"—",sub:""},
                      ].map(m=>(
                        <div key={m.l} style={{textAlign:"center",background:"rgba(255,255,255,0.02)",borderRadius:6,padding:"4px 2px"}}>
                          <div style={{fontSize:9,color:T.sub}}>{m.l}</div>
                          <div style={{fontSize:11,fontWeight:700,fontFamily:"monospace",color:m.c||T.text}}>{m.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ДИАГНОСТИКА
// ═══════════════════════════════════════════════════════════════════════════════
function TabDiagnostics({data,targetDrr,onGoToPlanFact}){
  const days=data.daily.filter(d=>d.drr>0);
  const totalSpend=days.reduce((s,d)=>s+d.spend,0);
  const totalRevenue=days.reduce((s,d)=>s+d.revenue,0);
  const factDrr=totalRevenue>0?totalSpend/totalRevenue*100:null;
  const totalCtr=data.clusters.reduce((s,k)=>s+k.impressions,0)?data.clusters.reduce((s,k)=>s+k.clicks,0)/data.clusters.reduce((s,k)=>s+k.impressions,0)*100:0;
  const issues=[];
  if(targetDrr&&factDrr&&factDrr>targetDrr*1.15)
    issues.push({level:"critical",icon:"🔴",title:"ДРР значительно выше цели",desc:`Факт ${factDrr.toFixed(1)}% при цели ${targetDrr}%. Превышение: +${(factDrr-targetDrr).toFixed(1)}%.`,rec:"Снизьте ставки у кампаний с высоким ДРР или уменьшите бюджет."});
  else if(targetDrr&&factDrr&&factDrr>targetDrr)
    issues.push({level:"warn",icon:"🟡",title:"ДРР чуть выше цели",desc:`Факт ${factDrr.toFixed(1)}% при цели ${targetDrr}%.`,rec:"Оптимизируйте ключи с нулевыми заказами и высоким расходом."});
  else if(targetDrr&&factDrr)
    issues.push({level:"ok",icon:"🟢",title:"ДРР в норме",desc:`Факт ${factDrr.toFixed(1)}% — в рамках цели ${targetDrr}%.`,rec:""});
  else
    issues.push({level:"warn",icon:"🟡",title:"Целевой ДРР не установлен",desc:"Невозможно оценить эффективность без ориентира.",rec:"Установите целевой ДРР в разделе «План/Факт».",action:{label:"Установить →",fn:onGoToPlanFact}});
  if(totalCtr<0.7)
    issues.push({level:"critical",icon:"🔴",title:"Низкий CTR в кластерах",desc:`Средний CTR ${totalCtr.toFixed(2)}% — ниже нормы 0.7%.`,rec:"Проверьте главное фото, заголовок и цену. Возможно нужна акция."});
  const fallingKws=data.keywords.filter(k=>k.posPrev-k.pos<-2);
  if(fallingKws.length>0)
    issues.push({level:"critical",icon:"🔴",title:`Позиции падают: ${fallingKws.length} ключей`,desc:fallingKws.map(k=>`«${k.keyword}» ${k.posPrev}→${k.pos}`).join(", "),rec:"Повысьте ставки CPM на эти ключевые слова."});
  const highDrrKws=data.keywords.filter(k=>targetDrr&&k.drr>targetDrr*1.3);
  if(highDrrKws.length>0)
    issues.push({level:"warn",icon:"🟡",title:`${highDrrKws.length} ключей с высоким ДРР`,desc:highDrrKws.map(k=>`«${k.keyword}» ДРР ${k.drr}%`).join(", "),rec:"Рассмотрите снижение ставок или перевод в минус-слова."});
  const zeroKws=data.keywords.filter(k=>k.orders===0&&k.spend>200);
  if(zeroKws.length>0)
    issues.push({level:"warn",icon:"🟡",title:`${zeroKws.length} ключей без заказов с расходом`,desc:zeroKws.map(k=>`«${k.keyword}» ${k.spend}₽`).join(", "),rec:"Добавьте в минус-слова или снизьте ставки."});

  // Рекомендации по ставкам — с текущей, рекомендованной, конкурентной и причиной
  const bidRecs=data.keywords.map(kw=>{
    const drr=kw.revenue>0?kw.spend/kw.revenue*100:null;
    let action,newBidSearch,newBidShelves,reason,priority;
    if(kw.pos>15&&kw.ctr>=0.9){
      action="↑ повысить";newBidSearch=kw.bidSearch+40;newBidShelves=kw.bidShelves+30;
      reason="Позиция низкая при хорошем CTR";priority=1;
    } else if(kw.ctr<0.5&&kw.pos<=20){
      action="↓ снизить";newBidSearch=Math.max(kw.bidSearch-30,80);newBidShelves=Math.max(kw.bidShelves-25,60);
      reason="Низкий CTR — ставка не окупается";priority=2;
    } else if(targetDrr&&drr&&drr>targetDrr*1.2){
      action="↓ снизить";newBidSearch=Math.max(kw.bidSearch-20,80);newBidShelves=Math.max(kw.bidShelves-15,60);
      reason=`ДРР ${drr.toFixed(1)}% — выше цели`;priority=2;
    } else {
      action="→ держать";newBidSearch=kw.bidSearch;newBidShelves=kw.bidShelves;
      reason="Стабильные показатели";priority=3;
    }
    return{keyword:kw.keyword,action,curSearch:kw.bidSearch,newSearch:newBidSearch,curShelves:kw.bidShelves,newShelves:newBidShelves,compSearch:kw.bidCompSearch,compShelves:kw.bidCompShelves,reason,priority,drr,pos:kw.posSearch,ctr:kw.ctr};
  }).sort((a,b)=>a.priority-b.priority);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={S.card}>
        <SectionTitle>🔧 Авто-диагностика</SectionTitle>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {issues.map((issue,i)=>(
            <div key={i} style={{...S.card2,background:issue.level==="critical"?"rgba(248,113,113,0.08)":issue.level==="ok"?"rgba(74,222,128,0.08)":"rgba(251,191,36,0.08)",borderColor:issue.level==="critical"?"rgba(248,113,113,0.25)":issue.level==="ok"?"rgba(74,222,128,0.25)":"rgba(251,191,36,0.25)"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                <span style={{fontSize:18,flexShrink:0}}>{issue.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:3}}>{issue.title}</div>
                  <div style={{fontSize:11,color:T.sub,marginBottom:issue.rec?6:0}}>{issue.desc}</div>
                  {issue.rec&&<div style={{fontSize:11,color:issue.level==="critical"?T.red:issue.level==="ok"?T.green:T.yellow}}>💡 {issue.rec}</div>}
                  {issue.action&&<button onClick={issue.action.fn} style={{marginTop:6,fontSize:11,color:T.yellow,background:"rgba(251,191,36,0.15)",border:"none",borderRadius:8,padding:"4px 10px",cursor:"pointer"}}>{issue.action.label}</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={S.card}>
        <SectionTitle>📊 Рекомендации по ставкам</SectionTitle>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {bidRecs.map((r,i)=>{
            const actionCol=r.action.startsWith("↑")?T.green:r.action.startsWith("↓")?T.red:T.sub;
            return(
              <div key={i} style={{...S.card2,border:`1px solid ${r.action.startsWith("↑")?"rgba(74,222,128,0.2)":r.action.startsWith("↓")?"rgba(248,113,113,0.2)":T.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <div style={{fontSize:12,color:T.text,fontWeight:600}}>{r.keyword}</div>
                    <div style={{fontSize:11,color:T.sub,marginTop:2}}>{r.reason}</div>
                  </div>
                  <span style={{fontSize:14,fontWeight:700,color:actionCol,flexShrink:0,marginLeft:8}}>{r.action}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {/* Поиск */}
                  <div style={{background:"rgba(99,102,241,0.08)",borderRadius:10,padding:"8px 10px",border:"1px solid rgba(99,102,241,0.15)"}}>
                    <div style={{fontSize:10,color:"#a5b4fc",marginBottom:6}}>🔍 Поиск</div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:10,color:T.sub}}>Сейчас</div>
                        <div style={{fontSize:14,fontFamily:"monospace",fontWeight:700,color:T.text}}>{r.curSearch} ₽</div>
                      </div>
                      <span style={{fontSize:16,color:actionCol}}>→</span>
                      <div>
                        <div style={{fontSize:10,color:T.sub}}>Рекомендуется</div>
                        <div style={{fontSize:14,fontFamily:"monospace",fontWeight:700,color:actionCol}}>{r.newSearch} ₽</div>
                      </div>
                    </div>
                    <div style={{marginTop:6,paddingTop:6,borderTop:`1px solid rgba(255,255,255,0.05)`,display:"flex",justifyContent:"space-between"}}>
                      <span style={{fontSize:10,color:T.sub}}>Мин. для топ-5</span>
                      <span style={{fontSize:11,fontFamily:"monospace",color:"#a5b4fc"}}>{r.compSearch} ₽</span>
                    </div>
                  </div>
                  {/* Полки */}
                  <div style={{background:"rgba(59,130,246,0.08)",borderRadius:10,padding:"8px 10px",border:"1px solid rgba(59,130,246,0.15)"}}>
                    <div style={{fontSize:10,color:"#93c5fd",marginBottom:6}}>🗂 Полки</div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:10,color:T.sub}}>Сейчас</div>
                        <div style={{fontSize:14,fontFamily:"monospace",fontWeight:700,color:T.text}}>{r.curShelves} ₽</div>
                      </div>
                      <span style={{fontSize:16,color:actionCol}}>→</span>
                      <div>
                        <div style={{fontSize:10,color:T.sub}}>Рекомендуется</div>
                        <div style={{fontSize:14,fontFamily:"monospace",fontWeight:700,color:actionCol}}>{r.newShelves} ₽</div>
                      </div>
                    </div>
                    <div style={{marginTop:6,paddingTop:6,borderTop:`1px solid rgba(255,255,255,0.05)`,display:"flex",justifyContent:"space-between"}}>
                      <span style={{fontSize:10,color:T.sub}}>Мин. для топ-5</span>
                      <span style={{fontSize:11,fontFamily:"monospace",color:"#93c5fd"}}>{r.compShelves} ₽</span>
                    </div>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginTop:8}}>
                  {[{l:"Позиция",v:r.pos},{l:"CTR",v:fmt.pct(r.ctr),c:getCtrSt(r.ctr).c!==T.text?getCtrSt(r.ctr).c:T.text},{l:"ДРР",v:r.drr?fmt.pct1(r.drr):"—"}].map(m=>(
                    <div key={m.l} style={{textAlign:"center"}}>
                      <div style={{fontSize:9,color:T.sub}}>{m.l}</div>
                      <div style={{fontSize:12,fontFamily:"monospace",fontWeight:600,color:m.c||T.text}}>{m.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ПОЗИЦИИ С МЕСТАМИ + ИСТОРИЯ было/стало + период
// ═══════════════════════════════════════════════════════════════════════════════
function TabPositionsByPlacement({data,targetDrr}){
  const [expanded,setExpanded]=useState(null);
  const [period,setPeriod]=useState("7d");
  const dates=data.positions[0]?.dates||[];
  const pc=pos=>pos<=5?"#4ade80":pos<=10?"#86efac":pos<=20?"#fbbf24":"#f87171";

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={S.card}>
        <SectionTitle>📍 Позиции по ключам с местами размещения</SectionTitle>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {data.keywords.map(kw=>{
            const delta=kw.posPrev-kw.pos;
            const drr=kw.revenue>0?kw.spend/kw.revenue*100:null;
            const isExp=expanded===kw.keyword;
            return(
              <div key={kw.keyword}>
                <div onClick={()=>setExpanded(isExp?null:kw.keyword)} style={{...S.card2,cursor:"pointer"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                        {kw.alert&&<span style={{fontSize:11}}>⚠️</span>}
                        <span style={{fontSize:13,fontWeight:600,color:T.text}}>{kw.keyword}</span>
                        <span style={{fontSize:11,color:delta>0?T.green:delta<0?T.red:T.sub,fontWeight:700}}>
                          {delta>0?`↑${delta}`:delta<0?`↓${Math.abs(delta)}`:"→"}
                        </span>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                        <div style={{background:"rgba(99,102,241,0.1)",borderRadius:10,padding:"8px 10px",border:"1px solid rgba(99,102,241,0.2)"}}>
                          <div style={{fontSize:10,color:"#a5b4fc",marginBottom:4}}>🔍 Поиск</div>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <span style={{fontSize:20,fontWeight:700,fontFamily:"monospace",color:pc(kw.posSearch)}}>{kw.posSearch}</span>
                            <div><div style={{fontSize:11,color:T.sub}}>Ставка CPM</div><div style={{fontSize:12,fontFamily:"monospace",color:T.text}}>{kw.bidSearch} ₽</div></div>
                          </div>
                        </div>
                        <div style={{background:"rgba(59,130,246,0.1)",borderRadius:10,padding:"8px 10px",border:"1px solid rgba(59,130,246,0.2)"}}>
                          <div style={{fontSize:10,color:"#93c5fd",marginBottom:4}}>🗂 Полки</div>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <span style={{fontSize:20,fontWeight:700,fontFamily:"monospace",color:pc(kw.posShelves)}}>{kw.posShelves}</span>
                            <div><div style={{fontSize:11,color:T.sub}}>Ставка CPM</div><div style={{fontSize:12,fontFamily:"monospace",color:T.text}}>{kw.bidShelves} ₽</div></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{textAlign:"right",marginLeft:12,flexShrink:0}}>
                      <div style={{fontSize:10,color:T.sub,marginBottom:2}}>ДРР</div>
                      <DrrBadge drr={drr} target={targetDrr}/>
                    </div>
                  </div>
                  {isExp&&(
                    <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${T.border}`,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                      {[{l:"Заказы",v:kw.orders},{l:"Корзины",v:kw.baskets},{l:"CTR",v:fmt.pct(kw.ctr)},{l:"Расход",v:fmt.rub(kw.spend)}].map(m=>(
                        <div key={m.l} style={S.card2}><div style={{fontSize:10,color:T.sub}}>{m.l}</div><div style={{fontSize:12,fontFamily:"monospace",fontWeight:700,color:T.text}}>{m.v}</div></div>
                      ))}
                    </div>
                  )}
                  <div style={{textAlign:"right",fontSize:10,color:T.sub,marginTop:6}}>{isExp?"▲":"▼"}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* История позиций было/стало */}
      <div style={S.card}>
        <SectionTitle>📈 История позиций — было / стало</SectionTitle>
        <PeriodPicker period={period} onChange={setPeriod}/>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead>
              <tr>
                <th style={{padding:"7px 10px",textAlign:"left",color:T.sub,background:T.card2,minWidth:160}}>Запрос</th>
                <th style={{padding:"7px 6px",textAlign:"left",color:T.sub,background:T.card2}}>Частота</th>
                <th style={{padding:"7px 6px",textAlign:"center",color:T.sub,background:T.card2}}>Было → Стало</th>
                {dates.map(d=><th key={d.date} style={{padding:"7px 10px",textAlign:"center",color:T.sub,background:T.card2,minWidth:130}}>{d.date}</th>)}
              </tr>
              <tr style={{background:T.card}}>
                <td colSpan={3}/>
                {dates.map((d,i)=>(
                  <td key={i} style={{padding:"5px 10px",textAlign:"center"}}>
                    <span style={{fontSize:10,padding:"2px 6px",borderRadius:10,background:d.promo?"rgba(74,222,128,0.15)":"rgba(255,255,255,0.06)",color:d.promo?T.green:T.sub}}>{d.promo?"В акции":"Не в акции"}</span>
                    <span style={{fontSize:10,color:T.sub,marginLeft:4}}>{d.price} ₽</span>
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.positions.map((kw,ki)=>{
                const first=kw.dates[kw.dates.length-1];
                const last=kw.dates[0];
                const deltaS=first&&last?first.posSearch-last.posSearch:0;
                const deltaP=first&&last?first.posShelves-last.posShelves:0;
                return(
                  <tr key={kw.keyword} style={{borderTop:`1px solid ${T.border}`,background:ki%2?"rgba(255,255,255,0.01)":"transparent"}}>
                    <td style={{padding:"9px 10px",color:T.text}}>{kw.keyword}</td>
                    <td style={{padding:"9px 6px",fontFamily:"monospace",color:T.sub}}>{fmt.num(kw.freq)}</td>
                    {/* Было/стало */}
                    <td style={{padding:"9px 10px",textAlign:"center"}}>
                      {first&&last?(
                        <div style={{display:"flex",flexDirection:"column",gap:3,alignItems:"center"}}>
                          <div style={{display:"flex",alignItems:"center",gap:4,fontSize:11}}>
                            <span style={{color:"#a5b4fc",fontSize:10}}>🔍</span>
                            <span style={{fontFamily:"monospace",color:T.sub}}>{first.posSearch}</span>
                            <span style={{color:T.sub}}>→</span>
                            <span style={{fontFamily:"monospace",fontWeight:700,color:pc(last.posSearch)}}>{last.posSearch}</span>
                            <span style={{fontSize:11,fontWeight:700,color:deltaS>0?T.green:deltaS<0?T.red:T.sub}}>{deltaS>0?`↑${deltaS}`:deltaS<0?`↓${Math.abs(deltaS)}`:"="}</span>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:4,fontSize:11}}>
                            <span style={{color:"#93c5fd",fontSize:10}}>🗂</span>
                            <span style={{fontFamily:"monospace",color:T.sub}}>{first.posShelves}</span>
                            <span style={{color:T.sub}}>→</span>
                            <span style={{fontFamily:"monospace",fontWeight:700,color:pc(last.posShelves)}}>{last.posShelves}</span>
                            <span style={{fontSize:11,fontWeight:700,color:deltaP>0?T.green:deltaP<0?T.red:T.sub}}>{deltaP>0?`↑${deltaP}`:deltaP<0?`↓${Math.abs(deltaP)}`:"="}</span>
                          </div>
                        </div>
                      ):"—"}
                    </td>
                    {kw.dates.map((d,di)=>(
                      <td key={di} style={{padding:"9px 10px",textAlign:"center"}}>
                        <div style={{display:"flex",flexDirection:"column",gap:3,alignItems:"center"}}>
                          <div style={{display:"flex",alignItems:"center",gap:3,fontSize:11}}>
                            <span style={{color:"#a5b4fc",fontSize:10}}>🔍</span>
                            <span style={{fontFamily:"monospace",fontWeight:700,fontSize:12,padding:"1px 5px",borderRadius:5,background:`${pc(d.posSearch)}18`,color:pc(d.posSearch)}}>{d.posSearch}</span>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:3,fontSize:11}}>
                            <span style={{color:"#93c5fd",fontSize:10}}>🗂</span>
                            <span style={{fontFamily:"monospace",fontWeight:700,fontSize:12,padding:"1px 5px",borderRadius:5,background:`${pc(d.posShelves)}18`,color:pc(d.posShelves)}}>{d.posShelves}</span>
                          </div>
                          <span style={{fontSize:10,color:T.sub,fontFamily:"monospace"}}>CPM {d.cpm} ₽</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// АВТО-МИНУСОВКА
// ═══════════════════════════════════════════════════════════════════════════════
function TabAutoMinus({data}){
  const [subTab,setSubTab]=useState("active");
  const [mode,setMode]=useState("manual");
  const [selected,setSelected]=useState(new Set());
  const [archived,setArchived]=useState(data.minusArchive);
  const [active,setActive]=useState(data.minusActive);
  const REASON_LABELS={low_ctr:"CTR ниже нормы",no_orders:"Нет заказов",high_drr:"Высокий ДРР",manual:"Ручное"};

  function deleteSelected(){
    const toArchive=active.filter(k=>selected.has(k.id)).map(k=>({...k,deletedAt:new Date().toLocaleDateString("ru-RU"),deletedBy:"ручное",reason:"Ручное удаление"}));
    setArchived(prev=>[...toArchive,...prev]);setActive(prev=>prev.filter(k=>!selected.has(k.id)));setSelected(new Set());
  }
  function restore(id){
    const item=archived.find(k=>k.id===id);if(!item)return;
    setActive(prev=>[{...item,addedDaysAgo:0,reason:"restored"},...prev]);setArchived(prev=>prev.filter(k=>k.id!==id));
  }
  function autoDelete(){
    const cands=active.filter(k=>k.ctr<0.5||k.orders===0);
    const toArchive=cands.map(k=>({...k,deletedAt:new Date().toLocaleDateString("ru-RU"),deletedBy:"авто",reason:k.ctr<0.5?"CTR < 0.5%":"0 заказов при расходе > 200₽"}));
    setArchived(prev=>[...toArchive,...prev]);setActive(prev=>prev.filter(k=>!cands.find(c=>c.id===k.id)));
  }

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={S.card}>
        <SectionTitle>Режим работы</SectionTitle>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[{id:"manual",icon:"✋",label:"Ручное удаление",desc:"Выбираешь запросы сам"},{id:"auto",icon:"🤖",label:"Авто-удаление",desc:"Система сама удаляет по порогам"}].map(m=>(
            <button key={m.id} onClick={()=>setMode(m.id)}
              style={{...S.card2,border:`2px solid ${mode===m.id?"rgba(124,58,237,0.6)":T.border}`,cursor:"pointer",textAlign:"left",background:mode===m.id?"rgba(124,58,237,0.1)":T.card2}}>
              <div style={{fontSize:18,marginBottom:4}}>{m.icon}</div>
              <div style={{fontSize:13,fontWeight:700,color:T.text}}>{m.label}</div>
              <div style={{fontSize:11,color:T.sub,marginTop:2}}>{m.desc}</div>
            </button>
          ))}
        </div>
        {mode==="auto"&&(
          <div style={{marginTop:12,background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:12,padding:12}}>
            <div style={{fontSize:11,color:T.sub,marginBottom:10}}>CTR &lt; 0.5% при показах &gt; 300 · Нет заказов при расходе &gt; 200₽</div>
            <button onClick={autoDelete} style={{background:"#dc2626",color:"#fff",border:"none",borderRadius:10,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer",width:"100%"}}>
              🤖 Применить авто-минусовку ({active.filter(k=>k.ctr<0.5||k.orders===0).length} запросов)
            </button>
          </div>
        )}
      </div>
      <Tabs tabs={[{id:"active",label:`🚫 Нерелевантные (${active.length})`},{id:"archive",label:`📦 Архив (${archived.length})`}]} active={subTab} onChange={setSubTab}/>

      {subTab==="active"&&(
        <div style={S.card}>
          {mode==="manual"&&selected.size>0&&(
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:10,padding:"8px 12px"}}>
              <span style={{fontSize:12,color:T.red}}>Выбрано: {selected.size}</span>
              <button onClick={deleteSelected} style={{background:"#dc2626",color:"#fff",border:"none",borderRadius:8,padding:"5px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>Удалить выбранные</button>
            </div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {active.map(kw=>(
              <div key={kw.id} style={{...S.card2,border:`1px solid ${selected.has(kw.id)?"rgba(248,113,113,0.4)":T.border}`,background:selected.has(kw.id)?"rgba(248,113,113,0.06)":T.card2}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  {mode==="manual"&&<input type="checkbox" checked={selected.has(kw.id)} onChange={()=>setSelected(prev=>{const n=new Set(prev);n.has(kw.id)?n.delete(kw.id):n.add(kw.id);return n;})} style={{marginTop:3,accentColor:"#dc2626",flexShrink:0}}/>}
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,color:T.text,fontWeight:500}}>{kw.keyword}</div>
                    <div style={{fontSize:11,color:T.sub,marginTop:2}}>Причина: {REASON_LABELS[kw.reason]||kw.reason} · {kw.addedDaysAgo}д. назад</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,marginTop:8}}>
                      {[{l:"Показы",v:fmt.num(kw.impressions)},{l:"Клики",v:kw.clicks},{l:"CTR",v:fmt.pct(kw.ctr),c:kw.ctr<0.5?T.red:T.text},{l:"Расход",v:fmt.rub(kw.spend),c:T.yellow},{l:"Заказы",v:kw.orders,c:kw.orders===0?T.red:T.green}].map(m=>(
                        <div key={m.l}><div style={{fontSize:9,color:T.sub}}>{m.l}</div><div style={{fontSize:12,fontFamily:"monospace",fontWeight:600,color:m.c||T.text}}>{m.v}</div></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {active.length===0&&<div style={{textAlign:"center",padding:24,color:T.sub,fontSize:13}}>✅ Нет нерелевантных запросов</div>}
          </div>
        </div>
      )}

      {subTab==="archive"&&(
        <div style={S.card}>
          <div style={{fontSize:11,color:T.sub,marginBottom:12}}>Удалённые запросы — можно восстановить обратно</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {archived.map(kw=>(
              <div key={kw.id} style={S.card2}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,color:T.text,fontWeight:500}}>{kw.keyword}</div>
                    <div style={{fontSize:11,color:T.sub,marginTop:2}}>Удалён: {kw.deletedAt} · {kw.deletedBy} · {kw.reason}</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,marginTop:8}}>
                      {[{l:"Показы",v:fmt.num(kw.impressions)},{l:"CTR",v:fmt.pct(kw.ctr),c:kw.ctr<0.5?T.red:T.text},{l:"Расход",v:fmt.rub(kw.spend),c:T.yellow},{l:"Заказы",v:kw.orders,c:T.red},{l:"CPO",v:kw.orders>0?fmt.rub(kw.spend/kw.orders):"—",c:T.sub}].map(m=>(
                        <div key={m.l}><div style={{fontSize:9,color:T.sub}}>{m.l}</div><div style={{fontSize:11,fontFamily:"monospace",fontWeight:600,color:m.c||T.text}}>{m.v}</div></div>
                      ))}
                    </div>
                  </div>
                  <button onClick={()=>restore(kw.id)} style={{marginLeft:10,background:"rgba(74,222,128,0.15)",color:T.green,border:"1px solid rgba(74,222,128,0.3)",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:600,cursor:"pointer",flexShrink:0}}>↩ Восстановить</button>
                </div>
              </div>
            ))}
            {archived.length===0&&<div style={{textAlign:"center",padding:24,color:T.sub,fontSize:13}}>Архив пуст</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ПЛАН/ФАКТ — только ДРР + рекламный бюджет
// ═══════════════════════════════════════════════════════════════════════════════
function TabPlanFact({data,targetDrr,onSetTargetDrr,category,onSetCategory,budget,onSetBudget}){
  const [inputDrr,setInputDrr]=useState(targetDrr?.toString()??"");
  const [inputCat,setInputCat]=useState(category??"");
  const [inputBudget,setInputBudget]=useState(budget?.toString()??"");
  const [editing,setEditing]=useState(!targetDrr);

  const activeDays=data.daily.filter(d=>d.drr>0);
  const totalSpend=activeDays.reduce((s,d)=>s+d.spend,0);
  const totalRevenue=activeDays.reduce((s,d)=>s+d.revenue,0);
  const factDrr=totalRevenue>0?totalSpend/totalRevenue*100:null;
  const status=getDrrStatus(factDrr,targetDrr);
  const st=DRR_ST[status];
  const budgetPct=budget&&totalSpend?Math.round(totalSpend/budget*100):null;

  function save(){
    const v=parseFloat(inputDrr);if(isNaN(v)||v<=0)return;
    onSetTargetDrr(v);
    onSetCategory(inputCat||"Без категории");
    const b=parseFloat(inputBudget);if(!isNaN(b)&&b>0)onSetBudget(b);
    setEditing(false);
  }

  const inp=(extra={})=>({width:"100%",background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 12px",fontSize:14,color:T.text,outline:"none",boxSizing:"border-box",...extra});

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12,maxWidth:480}}>
      <div style={S.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <SectionTitle>🎯 Целевой ДРР и бюджет</SectionTitle>
            <div style={{fontSize:11,color:T.sub}}>Все блоки ориентируются на эти значения</div>
          </div>
          {!editing&&targetDrr&&<button onClick={()=>setEditing(true)} style={{fontSize:11,color:"#a78bfa",background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.3)",borderRadius:8,padding:"4px 10px",cursor:"pointer",flexShrink:0}}>Изменить</button>}
        </div>

        {!editing&&targetDrr?(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {/* ДРР */}
            <div style={{display:"flex",alignItems:"center",gap:16}}>
              <div style={{fontSize:52,fontWeight:700,fontFamily:"monospace",color:T.text,lineHeight:1}}>{targetDrr}%</div>
              <div>
                <div style={{fontSize:11,color:T.sub,marginBottom:4}}>Целевой ДРР</div>
                {category&&<div style={{fontSize:11,color:"#a78bfa",background:"rgba(167,139,250,0.15)",border:"1px solid rgba(167,139,250,0.25)",borderRadius:20,padding:"3px 10px",display:"inline-block"}}>{category}</div>}
              </div>
            </div>
            {/* Бюджет */}
            {budget>0&&(
              <div style={{...S.card2}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{fontSize:12,color:T.sub}}>💰 Рекламный бюджет на месяц</div>
                  <div style={{fontFamily:"monospace",fontWeight:700,color:T.text,fontSize:15}}>{fmt.rub(budget)}</div>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:T.sub,marginBottom:6}}>
                  <span>Потрачено: {fmt.rub(totalSpend)}</span>
                  <span style={{color:budgetPct>=90?T.red:budgetPct>=70?T.yellow:T.green,fontWeight:700}}>{budgetPct}%</span>
                </div>
                <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${Math.min(budgetPct,100)}%`,background:budgetPct>=90?T.red:budgetPct>=70?T.yellow:T.green,borderRadius:3}}/>
                </div>
              </div>
            )}
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div>
              <div style={{fontSize:11,color:T.sub,marginBottom:6}}>Категория товара</div>
              <input value={inputCat} onChange={e=>setInputCat(e.target.value)} placeholder="Например: Кроссовки женские" style={inp({fontSize:13})}/>
            </div>
            <div>
              <div style={{fontSize:11,color:T.sub,marginBottom:6}}>🎯 Целевой ДРР (%)</div>
              <input type="number" value={inputDrr} onChange={e=>setInputDrr(e.target.value)} placeholder="20" style={inp({fontSize:22,fontFamily:"monospace",fontWeight:700})}/>
              <div style={{fontSize:10,color:T.sub,marginTop:5}}>Ориентиры: электроника 5–8% · косметика 12–18% · одежда 15–20%</div>
            </div>
            <div>
              <div style={{fontSize:11,color:T.sub,marginBottom:6}}>💰 Рекламный бюджет на месяц (₽)</div>
              <input type="number" value={inputBudget} onChange={e=>setInputBudget(e.target.value)} placeholder="120000" style={inp({fontFamily:"monospace",fontWeight:600})}/>
            </div>
            <button onClick={save} style={{background:T.wb,color:"#fff",border:"none",borderRadius:10,padding:"13px",fontSize:14,fontWeight:700,cursor:"pointer",width:"100%",marginTop:4}}>
              💾 Сохранить
            </button>
          </div>
        )}
      </div>

      {/* Факт ДРР */}
      {targetDrr&&factDrr&&(
        <div style={{...S.card,background:status==="bad"?"rgba(248,113,113,0.06)":status==="warn"?"rgba(251,191,36,0.06)":"rgba(74,222,128,0.06)",borderColor:status==="bad"?"rgba(248,113,113,0.25)":status==="warn"?"rgba(251,191,36,0.25)":"rgba(74,222,128,0.25)"}}>
          <SectionTitle>📊 Факт ДРР за период</SectionTitle>
          <div style={{display:"flex",alignItems:"center",gap:20,marginBottom:14}}>
            <div style={{position:"relative",width:90,height:90,flexShrink:0}}>
              <svg viewBox="0 0 36 36" style={{width:90,height:90,transform:"rotate(-90deg)"}}>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5"/>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke={status==="bad"?T.red:status==="warn"?T.yellow:T.green} strokeWidth="3.5" strokeDasharray={`${Math.min(factDrr/(targetDrr*1.5)*100,100)} 100`} strokeLinecap="round"/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <div style={{fontSize:16,fontWeight:700,fontFamily:"monospace",color:st.c}}>{fmt.pct1(factDrr)}</div>
                <div style={{fontSize:9,color:T.sub}}>факт</div>
              </div>
            </div>
            <div style={{flex:1}}>
              {[{l:"Цель",v:`${targetDrr}%`},{l:"Факт",v:fmt.pct1(factDrr),c:st.c},{l:"Отклонение",v:`${factDrr<=targetDrr?"↓":"↑"} ${Math.abs(factDrr-targetDrr).toFixed(1)}%`,c:factDrr<=targetDrr?T.green:T.red}].map(r=>(
                <div key={r.l} style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:12,color:T.sub}}>{r.l}</span>
                  <span style={{fontSize:13,fontWeight:700,fontFamily:"monospace",color:r.c||T.text}}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{fontSize:10,color:T.sub,marginBottom:8}}>Динамика по дням</div>
          <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
            {[...activeDays].reverse().map((d,i,arr)=>{
              const prev=arr[i-1];const change=prev&&prev.drr>0?d.drr-prev.drr:null;const ds=getDrrStatus(d.drr,targetDrr);
              return(
                <div key={d.date} style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <div style={{width:50,height:50,borderRadius:10,background:ds==="bad"?"rgba(248,113,113,0.12)":ds==="warn"?"rgba(251,191,36,0.12)":"rgba(74,222,128,0.12)",border:`1px solid ${ds==="bad"?"rgba(248,113,113,0.3)":ds==="warn"?"rgba(251,191,36,0.3)":"rgba(74,222,128,0.3)"}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                    <div style={{fontSize:12,fontWeight:700,fontFamily:"monospace",color:DRR_ST[ds].c}}>{d.drr.toFixed(0)}%</div>
                    {change!==null&&change!==0&&<div style={{fontSize:9,fontWeight:700,color:change>0?T.red:T.green}}>{change>0?`↑${change.toFixed(1)}`:`↓${Math.abs(change).toFixed(1)}`}</div>}
                  </div>
                  <div style={{fontSize:9,color:T.sub}}>{d.date}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ЭКРАН — НЕТ ДОСТУПА
// ═══════════════════════════════════════════════════════════════════════════════
function AccessDenied({tgUser,onRequestAccess}){
  const [sent,setSent]=useState(false);
  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}>
      <div style={{fontSize:56,marginBottom:16}}>🔒</div>
      <div style={{fontSize:20,fontWeight:700,color:T.text,marginBottom:8}}>Нет доступа</div>
      <div style={{fontSize:13,color:T.sub,marginBottom:24,maxWidth:300,lineHeight:1.6}}>
        Приложение доступно только приглашённым пользователям. Обратитесь к владельцу аккаунта.
      </div>
      {tgUser&&(
        <div style={{...S.card2,marginBottom:20,textAlign:"left",width:"100%",maxWidth:320}}>
          <div style={{fontSize:11,color:T.sub,marginBottom:4}}>Ваш Telegram</div>
          <div style={{fontSize:14,fontWeight:600,color:T.text}}>
            {tgUser.first_name}{tgUser.last_name?" "+tgUser.last_name:""}
          </div>
          {tgUser.username&&<div style={{fontSize:12,color:"#a78bfa",marginTop:2}}>@{tgUser.username}</div>}
          <div style={{fontSize:11,color:T.sub,marginTop:4,fontFamily:"monospace"}}>ID: {tgUser.id}</div>
        </div>
      )}
      <button onClick={()=>{onRequestAccess();setSent(true);}} disabled={sent}
        style={{background:sent?"rgba(74,222,128,0.15)":T.wb,color:sent?T.green:"#fff",border:sent?"1px solid rgba(74,222,128,0.3)":"none",borderRadius:12,padding:"13px 28px",fontSize:14,fontWeight:700,cursor:sent?"default":"pointer",width:"100%",maxWidth:320}}>
        {sent?"✅ Запрос отправлен владельцу":"Запросить доступ"}
      </button>
      {sent&&<div style={{fontSize:11,color:T.sub,marginTop:12}}>Владелец получит уведомление в Telegram</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// НАСТРОЙКИ — API ключи + сотрудники (доступ по Telegram ID)
// ═══════════════════════════════════════════════════════════════════════════════
function TabSettings({currentUserTgId}){
  const [wbKey,setWbKey]=useState("");
  const [ozonKey,setOzonKey]=useState("");
  const [ozonClientId,setOzonClientId]=useState("");
  const [wbSaved,setWbSaved]=useState(false);
  const [ozonSaved,setOzonSaved]=useState(false);
  const [employees,setEmployees]=useState([
    {id:1,name:"Анна Иванова",  tgUsername:"anna_ivanova",  tgId:"123456789", role:"Менеджер",      access:["wb","ozon"]},
    {id:2,name:"Дмитрий Петров",tgUsername:"dmitry_petrov", tgId:"987654321", role:"Аналитик",      access:["wb"]},
  ]);
  const [showAddEmp,setShowAddEmp]=useState(false);
  const [newName,setNewName]=useState("");
  const [newTgUsername,setNewTgUsername]=useState("");
  const [newTgId,setNewTgId]=useState("");
  const [newRole,setNewRole]=useState("Менеджер");
  const [newAccess,setNewAccess]=useState(["wb","ozon"]);

  const inp={width:"100%",background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 12px",fontSize:13,color:T.text,outline:"none",boxSizing:"border-box"};

  function addEmployee(){
    if(!newName||!newTgId)return;
    setEmployees(prev=>[...prev,{id:Date.now(),name:newName,tgUsername:newTgUsername.replace("@",""),tgId:newTgId,role:newRole,access:newAccess}]);
    setNewName("");setNewTgUsername("");setNewTgId("");setNewRole("Менеджер");setNewAccess(["wb","ozon"]);setShowAddEmp(false);
  }

  function removeEmployee(id){setEmployees(prev=>prev.filter(e=>e.id!==id));}

  const ROLES=["Менеджер","Аналитик","Администратор","Только просмотр"];
  const ROLE_COLORS={"Администратор":"#f59e0b","Менеджер":"#a78bfa","Аналитик":"#38bdf8","Только просмотр":"#8892a4"};

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12,maxWidth:520}}>

      {/* Как работает доступ */}
      <div style={{...S.card,background:"rgba(167,139,250,0.06)",borderColor:"rgba(167,139,250,0.2)"}}>
        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
          <span style={{fontSize:20}}>🔐</span>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:4}}>Доступ по Telegram ID</div>
            <div style={{fontSize:11,color:T.sub,lineHeight:1.7}}>
              Приложение открывается только у пользователей из списка ниже. Telegram автоматически передаёт ID при открытии Mini App — ничего вводить не нужно.
            </div>
          </div>
        </div>
      </div>

      {/* WB API */}
      <div style={S.card}>
        <SectionTitle>🟣 Wildberries — API ключ</SectionTitle>
        <div style={{fontSize:11,color:T.sub,marginBottom:12}}>Личный кабинет WB → Настройки → Доступ к API</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div>
            <div style={{fontSize:11,color:T.sub,marginBottom:5}}>API ключ</div>
            <input type="password" value={wbKey} onChange={e=>{setWbKey(e.target.value);setWbSaved(false);}}
              placeholder="eyJhbGciOiJSUzI1NiIsInR5c..." style={{...inp,fontFamily:"monospace"}}/>
          </div>
          <button onClick={()=>setWbSaved(true)}
            style={{background:wbSaved?"rgba(74,222,128,0.15)":T.wb,color:wbSaved?T.green:"#fff",border:wbSaved?"1px solid rgba(74,222,128,0.3)":"none",borderRadius:10,padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer",width:"100%"}}>
            {wbSaved?"✅ Сохранено":"Подключить WB"}
          </button>
        </div>
      </div>

      {/* Ozon API */}
      <div style={S.card}>
        <SectionTitle>🔵 Ozon — API ключ</SectionTitle>
        <div style={{fontSize:11,color:T.sub,marginBottom:12}}>Личный кабинет Ozon → Настройки → API ключи</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div>
            <div style={{fontSize:11,color:T.sub,marginBottom:5}}>Client ID</div>
            <input value={ozonClientId} onChange={e=>{setOzonClientId(e.target.value);setOzonSaved(false);}}
              placeholder="12345678" style={{...inp,fontFamily:"monospace"}}/>
          </div>
          <div>
            <div style={{fontSize:11,color:T.sub,marginBottom:5}}>API ключ</div>
            <input type="password" value={ozonKey} onChange={e=>{setOzonKey(e.target.value);setOzonSaved(false);}}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" style={{...inp,fontFamily:"monospace"}}/>
          </div>
          <button onClick={()=>setOzonSaved(true)}
            style={{background:ozonSaved?"rgba(74,222,128,0.15)":T.ozon,color:ozonSaved?T.green:"#fff",border:ozonSaved?"1px solid rgba(74,222,128,0.3)":"none",borderRadius:10,padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer",width:"100%"}}>
            {ozonSaved?"✅ Сохранено":"Подключить Ozon"}
          </button>
        </div>
      </div>

      {/* Сотрудники */}
      <div style={S.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <SectionTitle marginBottom={0}>👥 Доступ сотрудников</SectionTitle>
            <div style={{fontSize:11,color:T.sub,marginTop:3}}>{employees.length} пользователей имеют доступ</div>
          </div>
          <button onClick={()=>setShowAddEmp(!showAddEmp)}
            style={{fontSize:12,color:"#a78bfa",background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.3)",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontWeight:600,flexShrink:0}}>
            {showAddEmp?"Отмена":"+ Добавить"}
          </button>
        </div>

        {/* Форма добавления */}
        {showAddEmp&&(
          <div style={{...S.card2,marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:12}}>Новый сотрудник</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div>
                <div style={{fontSize:10,color:T.sub,marginBottom:4}}>Имя сотрудника</div>
                <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Иванова Анна" style={inp}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div>
                  <div style={{fontSize:10,color:T.sub,marginBottom:4}}>@username в Telegram</div>
                  <input value={newTgUsername} onChange={e=>setNewTgUsername(e.target.value)} placeholder="@anna_ivanova" style={{...inp,fontFamily:"monospace"}}/>
                </div>
                <div>
                  <div style={{fontSize:10,color:T.sub,marginBottom:4}}>Telegram ID <span style={{color:T.red}}>*</span></div>
                  <input value={newTgId} onChange={e=>setNewTgId(e.target.value)} placeholder="123456789" style={{...inp,fontFamily:"monospace"}}/>
                </div>
              </div>
              <div style={{fontSize:10,color:"rgba(251,191,36,0.8)",background:"rgba(251,191,36,0.06)",border:"1px solid rgba(251,191,36,0.15)",borderRadius:8,padding:"8px 10px"}}>
                💡 Telegram ID можно узнать через бота @userinfobot — сотрудник пишет боту и получает свой ID
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div>
                  <div style={{fontSize:10,color:T.sub,marginBottom:4}}>Роль</div>
                  <select value={newRole} onChange={e=>setNewRole(e.target.value)} style={{...selectStyle,width:"100%"}}>
                    {ROLES.map(r=><option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{fontSize:10,color:T.sub,marginBottom:4}}>Площадки</div>
                  <div style={{display:"flex",gap:10,paddingTop:8}}>
                    {["wb","ozon"].map(p=>(
                      <label key={p} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer"}}>
                        <input type="checkbox" checked={newAccess.includes(p)}
                          onChange={()=>setNewAccess(prev=>prev.includes(p)?prev.filter(x=>x!==p):[...prev,p])}
                          style={{accentColor:p==="wb"?T.wb:T.ozon,width:14,height:14}}/>
                        <span style={{fontSize:12,color:T.text}}>{p==="wb"?"WB":"Ozon"}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={addEmployee} disabled={!newName||!newTgId}
                style={{background:newName&&newTgId?"rgba(167,139,250,0.2)":"rgba(255,255,255,0.04)",color:newName&&newTgId?"#a78bfa":T.sub,border:`1px solid ${newName&&newTgId?"rgba(167,139,250,0.3)":T.border}`,borderRadius:10,padding:"10px",fontSize:13,fontWeight:700,cursor:newName&&newTgId?"pointer":"default",width:"100%"}}>
                Добавить сотрудника
              </button>
            </div>
          </div>
        )}

        {/* Список */}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {employees.map(e=>{
            const isCurrentUser=e.tgId===currentUserTgId;
            return(
              <div key={e.id} style={{...S.card2,border:`1px solid ${isCurrentUser?"rgba(167,139,250,0.3)":T.border}`,background:isCurrentUser?"rgba(167,139,250,0.05)":T.card2}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                  <div style={{display:"flex",gap:10,alignItems:"flex-start",flex:1}}>
                    {/* Аватар */}
                    <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${T.wb},${T.ozon})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#fff",flexShrink:0}}>
                      {e.name[0]}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                        <span style={{fontSize:13,color:T.text,fontWeight:600}}>{e.name}</span>
                        {isCurrentUser&&<span style={{fontSize:9,color:"#a78bfa",background:"rgba(167,139,250,0.15)",padding:"1px 6px",borderRadius:10}}>это вы</span>}
                      </div>
                      <div style={{fontSize:11,color:"#a78bfa",marginTop:1}}>
                        {e.tgUsername?"@"+e.tgUsername+" · ":""}
                        <span style={{fontFamily:"monospace",color:T.sub}}>ID: {e.tgId}</span>
                      </div>
                      <div style={{display:"flex",gap:5,marginTop:6,flexWrap:"wrap"}}>
                        <span style={{fontSize:10,color:ROLE_COLORS[e.role]||"#a78bfa",background:`${ROLE_COLORS[e.role]||"#a78bfa"}15`,padding:"2px 8px",borderRadius:10,border:`1px solid ${ROLE_COLORS[e.role]||"#a78bfa"}30`}}>{e.role}</span>
                        {e.access.map(p=>(
                          <span key={p} style={{fontSize:10,color:"#fff",background:p==="wb"?T.wb:T.ozon,padding:"2px 8px",borderRadius:10}}>{p.toUpperCase()}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {!isCurrentUser&&(
                    <button onClick={()=>removeEmployee(e.id)}
                      style={{background:"rgba(248,113,113,0.08)",color:T.red,border:"1px solid rgba(248,113,113,0.2)",borderRadius:8,padding:"5px 10px",fontSize:11,cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}}>
                      Удалить
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// УПРАВЛЕНИЕ СТАВКАМИ
// ═══════════════════════════════════════════════════════════════════════════════
function TabBids({data,targetDrr}){
  const [mode,setMode]=useState("smart"); // smart | manual | strategy

  const MODES=[
    {id:"smart",    icon:"🤖", label:"Авто-умное"},
    {id:"manual",   icon:"✋", label:"Ручное"},
    {id:"strategy", icon:"⚡", label:"Стратегии"},
  ];

  const inp=(extra={})=>({width:"100%",background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:"9px 12px",fontSize:13,color:T.text,outline:"none",boxSizing:"border-box",...extra});

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {/* Переключатель режима */}
      <div style={{...S.card,padding:8}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
          {MODES.map(m=>(
            <button key={m.id} onClick={()=>setMode(m.id)}
              style={{padding:"10px 6px",borderRadius:10,border:`1px solid ${mode===m.id?"rgba(124,58,237,0.5)":T.border}`,
                background:mode===m.id?"rgba(124,58,237,0.15)":"transparent",
                color:mode===m.id?"#c4b5fd":T.sub,fontSize:12,fontWeight:mode===m.id?700:400,cursor:"pointer",
                display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <span style={{fontSize:20}}>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ═══ АВТО-УМНОЕ ═══ */}
      {mode==="smart"&&<SmartBidsTab data={data} targetDrr={targetDrr} inp={inp}/>}

      {/* ═══ РУЧНОЕ ═══ */}
      {mode==="manual"&&<ManualBidsTab data={data} inp={inp}/>}

      {/* ═══ СТРАТЕГИИ ═══ */}
      {mode==="strategy"&&<StrategyTab data={data} inp={inp}/>}
    </div>
  );
}

// ─── АВТО-УМНОЕ управление ────────────────────────────────────────────────────
function SmartBidsTab({data,targetDrr,inp}){
  const [settings,setSettings]=useState(
    data.campaigns.reduce((acc,c)=>({...acc,[c.id]:{
      enabled:false, mode:"position", targetPos:5,
      minBid:100, maxBid:500, step:20,
      checkInterval:60,
    }}),{})
  );
  const [logs,setLogs]=useState([
    {time:"14:32",kw:"кроссовки женские",action:"↑ повышена",from:220,to:240,reason:"Позиция упала с 3 до 7"},
    {time:"13:15",kw:"белые кроссовки",  action:"↓ снижена", from:210,to:190,reason:"ДРР превысил цель"},
    {time:"11:48",kw:"джинсы slim fit",  action:"→ без изменений",from:155,to:155,reason:"Показатели стабильны"},
  ]);

  const SMART_MODES=[
    {id:"position",label:"Удержание позиции",desc:"Поддерживать топ-N в поиске"},
    {id:"drr",     label:"Контроль ДРР",     desc:"Не превышать целевой ДРР"},
    {id:"cpo",     label:"Минимальный CPO",  desc:"Оптимизировать цену заказа"},
    {id:"balance", label:"Баланс",           desc:"Позиция + ДРР одновременно"},
  ];

  function toggle(campId){
    setSettings(p=>({...p,[campId]:{...p[campId],enabled:!p[campId].enabled}}));
  }
  function upd(campId,key,val){
    setSettings(p=>({...p,[campId]:{...p[campId],[key]:val}}));
  }

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {/* Описание */}
      <div style={{...S.card,background:"rgba(124,58,237,0.06)",borderColor:"rgba(124,58,237,0.2)"}}>
        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
          <span style={{fontSize:22}}>🤖</span>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:4}}>Авто-умное управление ставками</div>
            <div style={{fontSize:11,color:T.sub,lineHeight:1.7}}>
              Система автоматически корректирует ставки CPM каждые N минут в рамках заданных лимитов.
              Никогда не выходит за пределы мин/макс ставки.
            </div>
          </div>
        </div>
      </div>

      {/* Настройки по кампаниям */}
      {data.campaigns.map(c=>{
        const s=settings[c.id];
        return(
          <div key={c.id} style={{...S.card,borderColor:s.enabled?"rgba(74,222,128,0.25)":T.border,
            background:s.enabled?"rgba(74,222,128,0.03)":T.card}}>
            {/* Заголовок кампании */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:s.enabled?14:0}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:T.text}}>{c.name}</div>
                <div style={{fontSize:11,color:T.sub,marginTop:2}}>
                  ДРР {c.drr}% · {c.orders} заказов · CPO {fmt.rub(c.cpo)}
                </div>
              </div>
              {/* Тогл включения */}
              <div onClick={()=>toggle(c.id)} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:11,color:s.enabled?T.green:T.sub}}>{s.enabled?"Включено":"Выключено"}</span>
                <div style={{width:44,height:24,borderRadius:12,background:s.enabled?"rgba(74,222,128,0.3)":"rgba(255,255,255,0.08)",
                  border:`1px solid ${s.enabled?"rgba(74,222,128,0.5)":T.border}`,position:"relative",transition:"all 0.2s"}}>
                  <div style={{position:"absolute",top:3,left:s.enabled?22:3,width:16,height:16,borderRadius:"50%",
                    background:s.enabled?T.green:T.sub,transition:"left 0.2s"}}/>
                </div>
              </div>
            </div>

            {s.enabled&&(
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {/* Стратегия */}
                <div>
                  <div style={{fontSize:11,color:T.sub,marginBottom:6}}>Стратегия</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    {SMART_MODES.map(m=>(
                      <button key={m.id} onClick={()=>upd(c.id,"mode",m.id)}
                        style={{padding:"8px 10px",borderRadius:8,border:`1px solid ${s.mode===m.id?"rgba(124,58,237,0.5)":T.border}`,
                          background:s.mode===m.id?"rgba(124,58,237,0.12)":"transparent",
                          color:s.mode===m.id?"#c4b5fd":T.sub,fontSize:11,cursor:"pointer",textAlign:"left"}}>
                        <div style={{fontWeight:s.mode===m.id?700:400}}>{m.label}</div>
                        <div style={{fontSize:9,marginTop:2,opacity:0.7}}>{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Целевая позиция (только для mode=position или balance) */}
                {(s.mode==="position"||s.mode==="balance")&&(
                  <div>
                    <div style={{fontSize:11,color:T.sub,marginBottom:6}}>🎯 Целевая позиция (топ-N)</div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <input type="range" min={1} max={20} value={s.targetPos}
                        onChange={e=>upd(c.id,"targetPos",+e.target.value)}
                        style={{flex:1,accentColor:"#7c3aed"}}/>
                      <div style={{fontSize:18,fontWeight:700,fontFamily:"monospace",color:"#c4b5fd",minWidth:36,textAlign:"center"}}>
                        {s.targetPos}
                      </div>
                    </div>
                  </div>
                )}

                {/* Лимиты ставок */}
                <div>
                  <div style={{fontSize:11,color:T.sub,marginBottom:8}}>💰 Лимиты ставки CPM</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                    {[
                      {l:"Мин. ставка ₽",k:"minBid",min:50,max:300},
                      {l:"Макс. ставка ₽",k:"maxBid",min:100,max:1000},
                      {l:"Шаг изменения ₽",k:"step",min:5,max:100},
                    ].map(f=>(
                      <div key={f.k}>
                        <div style={{fontSize:10,color:T.sub,marginBottom:4}}>{f.l}</div>
                        <input type="number" value={s[f.k]} min={f.min} max={f.max}
                          onChange={e=>upd(c.id,f.k,+e.target.value)}
                          style={{...inp({fontSize:14,fontFamily:"monospace",fontWeight:700,padding:"8px 10px"})}}/>
                      </div>
                    ))}
                  </div>
                  {/* Визуальная шкала мин/макс */}
                  <div style={{marginTop:10,position:"relative",height:6,background:"rgba(255,255,255,0.06)",borderRadius:3}}>
                    <div style={{
                      position:"absolute",height:"100%",borderRadius:3,background:"linear-gradient(90deg,#4ade80,#7c3aed)",
                      left:`${(s.minBid/1000)*100}%`,
                      width:`${((s.maxBid-s.minBid)/1000)*100}%`
                    }}/>
                    <div style={{position:"absolute",top:-3,left:`${(s.minBid/1000)*100}%`,width:12,height:12,borderRadius:"50%",background:T.green,transform:"translateX(-50%)",border:"2px solid #151c2e"}}/>
                    <div style={{position:"absolute",top:-3,left:`${(s.maxBid/1000)*100}%`,width:12,height:12,borderRadius:"50%",background:"#a78bfa",transform:"translateX(-50%)",border:"2px solid #151c2e"}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
                    <span style={{fontSize:10,color:T.green}}>мин: {s.minBid} ₽</span>
                    <span style={{fontSize:10,color:"#a78bfa"}}>макс: {s.maxBid} ₽</span>
                  </div>
                </div>

                {/* Частота проверки */}
                <div>
                  <div style={{fontSize:11,color:T.sub,marginBottom:6}}>⏱ Проверять каждые</div>
                  <div style={{display:"flex",gap:6}}>
                    {[15,30,60,120].map(m=>(
                      <button key={m} onClick={()=>upd(c.id,"checkInterval",m)}
                        style={{flex:1,padding:"7px 4px",borderRadius:8,border:`1px solid ${s.checkInterval===m?"rgba(124,58,237,0.5)":T.border}`,
                          background:s.checkInterval===m?"rgba(124,58,237,0.12)":"transparent",
                          color:s.checkInterval===m?"#c4b5fd":T.sub,fontSize:11,cursor:"pointer",fontWeight:s.checkInterval===m?700:400}}>
                        {m<60?`${m} мин`:`${m/60} ч`}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{padding:"8px 12px",background:"rgba(74,222,128,0.06)",border:"1px solid rgba(74,222,128,0.15)",borderRadius:8,fontSize:11,color:T.green}}>
                  ✅ Авто-управление активно · Следующая проверка через {s.checkInterval} мин
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Лог изменений */}
      <div style={S.card}>
        <SectionTitle>📋 Лог авто-изменений</SectionTitle>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {logs.map((l,i)=>(
            <div key={i} style={{...S.card2,display:"flex",alignItems:"center",gap:10}}>
              <div style={{fontSize:10,color:T.sub,fontFamily:"monospace",flexShrink:0,minWidth:36}}>{l.time}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,color:T.text,fontWeight:500}}>{l.kw}</div>
                <div style={{fontSize:10,color:T.sub,marginTop:1}}>{l.reason}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:12,fontWeight:700,color:l.action.includes("↑")?T.green:l.action.includes("↓")?T.red:T.sub}}>{l.action}</div>
                <div style={{fontSize:10,fontFamily:"monospace",color:T.sub}}>{l.from}→{l.to} ₽</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── РУЧНОЕ управление ────────────────────────────────────────────────────────
function ManualBidsTab({data,inp}){
  const [bids,setBids]=useState(
    data.keywords.reduce((acc,k)=>({...acc,[k.keyword]:{search:k.bidSearch,shelves:k.bidShelves,type:"CPM"}}),{})
  );
  const [selected,setSelected]=useState(new Set());
  const [massValue,setMassValue]=useState("");
  const [massType,setMassType]=useState("set"); // set | add | pct
  const [history,setHistory]=useState([]);
  const [copyFrom,setCopyFrom]=useState("");

  function applyBid(kw,field,val){
    const v=Math.max(50,Math.min(2000,+val||0));
    setBids(p=>({...p,[kw]:{...p[kw],[field]:v}}));
    setHistory(p=>[{time:new Date().toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"}),kw,field,from:bids[kw][field],to:v},...p.slice(0,9)]);
  }

  function applyMass(){
    if(!massValue||selected.size===0)return;
    const newBids={...bids};
    selected.forEach(kw=>{
      const cur=newBids[kw].search;
      let newVal;
      if(massType==="set") newVal=+massValue;
      else if(massType==="add") newVal=cur+(+massValue);
      else newVal=Math.round(cur*(1+(+massValue)/100));
      newVal=Math.max(50,Math.min(2000,newVal));
      newBids[kw]={...newBids[kw],search:newVal,shelves:Math.round(newVal*0.8)};
    });
    setBids(newBids);
    setSelected(new Set());
    setMassValue("");
  }

  function toggleSelect(kw){
    setSelected(p=>{const n=new Set(p);n.has(kw)?n.delete(kw):n.add(kw);return n;});
  }
  function selectAll(){setSelected(p=>p.size===data.keywords.length?new Set():new Set(data.keywords.map(k=>k.keyword)));}

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {/* Массовое изменение */}
      {selected.size>0&&(
        <div style={{...S.card,background:"rgba(124,58,237,0.06)",borderColor:"rgba(124,58,237,0.3)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#c4b5fd",marginBottom:10}}>
            ✏️ Массовое изменение — выбрано {selected.size} ключей
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-end"}}>
            <div style={{flex:1,minWidth:120}}>
              <div style={{fontSize:10,color:T.sub,marginBottom:4}}>Тип изменения</div>
              <select value={massType} onChange={e=>setMassType(e.target.value)} style={{...selectStyle,width:"100%"}}>
                <option value="set">Установить (₽)</option>
                <option value="add">Добавить (±₽)</option>
                <option value="pct">Изменить (%)</option>
              </select>
            </div>
            <div style={{flex:1,minWidth:100}}>
              <div style={{fontSize:10,color:T.sub,marginBottom:4}}>
                {massType==="set"?"Новая ставка ₽":massType==="add"?"Изменение ±₽":"Изменение %"}
              </div>
              <input type="number" value={massValue} onChange={e=>setMassValue(e.target.value)}
                placeholder={massType==="set"?"250":massType==="add"?"+30":"10"}
                style={inp({fontFamily:"monospace",fontWeight:700})}/>
            </div>
            <button onClick={applyMass}
              style={{background:T.wb,color:"#fff",border:"none",borderRadius:10,padding:"9px 16px",fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
              Применить
            </button>
            <button onClick={()=>setSelected(new Set())}
              style={{background:"transparent",color:T.sub,border:`1px solid ${T.border}`,borderRadius:10,padding:"9px 12px",fontSize:12,cursor:"pointer"}}>
              Сбросить
            </button>
          </div>
        </div>
      )}

      {/* Таблица ключей */}
      <div style={S.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <SectionTitle marginBottom={0}>Ставки по ключевым словам</SectionTitle>
          <button onClick={selectAll} style={{fontSize:11,color:"#a78bfa",background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.2)",borderRadius:8,padding:"4px 10px",cursor:"pointer"}}>
            {selected.size===data.keywords.length?"Снять всё":"Выбрать всё"}
          </button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {data.keywords.map(kw=>{
            const b=bids[kw.keyword];
            const isSel=selected.has(kw.keyword);
            const origSearch=kw.bidSearch;
            const changedS=b.search!==origSearch;
            return(
              <div key={kw.keyword} style={{...S.card2,
                border:`1px solid ${isSel?"rgba(124,58,237,0.4)":changedS?"rgba(251,191,36,0.25)":T.border}`,
                background:isSel?"rgba(124,58,237,0.06)":T.card2}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <input type="checkbox" checked={isSel} onChange={()=>toggleSelect(kw.keyword)}
                    style={{accentColor:T.wb,width:14,height:14,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,color:T.text,fontWeight:600,marginBottom:6,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{kw.keyword}</div>
                    {/* Тип ставки */}
                    <div style={{display:"flex",gap:4,marginBottom:8}}>
                      {["CPM","CPC"].map(t=>(
                        <button key={t} onClick={()=>setBids(p=>({...p,[kw.keyword]:{...p[kw.keyword],type:t}}))}
                          style={{padding:"2px 10px",borderRadius:6,border:`1px solid ${b.type===t?"rgba(124,58,237,0.5)":T.border}`,
                            background:b.type===t?"rgba(124,58,237,0.15)":"transparent",
                            color:b.type===t?"#c4b5fd":T.sub,fontSize:10,cursor:"pointer",fontWeight:b.type===t?700:400}}>
                          {t}
                        </button>
                      ))}
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      {[
                        {l:"🔍 Поиск CPM",f:"search",orig:kw.bidSearch},
                        {l:"🗂 Полки CPM", f:"shelves",orig:kw.bidShelves},
                      ].map(field=>{
                        const changed=b[field.f]!==field.orig;
                        return(
                          <div key={field.f}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                              <span style={{fontSize:10,color:T.sub}}>{field.l}</span>
                              {changed&&<span style={{fontSize:9,color:T.yellow}}>изм.</span>}
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:4}}>
                              <button onClick={()=>applyBid(kw.keyword,field.f,b[field.f]-10)}
                                style={{width:26,height:26,borderRadius:6,border:`1px solid ${T.border}`,background:"transparent",color:T.red,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                              <input type="number" value={b[field.f]}
                                onChange={e=>applyBid(kw.keyword,field.f,e.target.value)}
                                style={{flex:1,background:changed?"rgba(251,191,36,0.08)":"rgba(255,255,255,0.04)",border:`1px solid ${changed?"rgba(251,191,36,0.3)":T.border}`,borderRadius:8,padding:"5px 8px",fontSize:13,color:changed?T.yellow:T.text,outline:"none",textAlign:"center",fontFamily:"monospace",fontWeight:700}}/>
                              <button onClick={()=>applyBid(kw.keyword,field.f,b[field.f]+10)}
                                style={{width:26,height:26,borderRadius:6,border:`1px solid ${T.border}`,background:"transparent",color:T.green,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                            </div>
                            {changed&&<div style={{fontSize:9,color:T.sub,textAlign:"center",marginTop:2}}>было: {field.orig} ₽</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:9,color:T.sub}}>Позиция</div>
                    <div style={{fontSize:18,fontWeight:700,fontFamily:"monospace",color:kw.pos<=5?T.green:kw.pos<=15?T.yellow:T.red}}>{kw.pos}</div>
                    <div style={{fontSize:9,color:T.sub,marginTop:4}}>CTR</div>
                    <div style={{fontSize:12,fontFamily:"monospace",color:T.text}}>{kw.ctr}%</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* История изменений */}
      {history.length>0&&(
        <div style={S.card}>
          <SectionTitle>📋 История изменений</SectionTitle>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {history.map((h,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${T.border}`}}>
                <div>
                  <span style={{fontSize:10,color:T.sub,fontFamily:"monospace"}}>{h.time} · </span>
                  <span style={{fontSize:12,color:T.text}}>{h.kw}</span>
                  <span style={{fontSize:10,color:T.sub}}> · {h.field==="search"?"Поиск":"Полки"}</span>
                </div>
                <div style={{fontSize:12,fontFamily:"monospace",color:T.yellow}}>{h.from} → {h.to} ₽</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── СТРАТЕГИИ ────────────────────────────────────────────────────────────────
function StrategyTab({data,inp}){
  const [strategies,setStrategies]=useState(
    data.campaigns.reduce((acc,c)=>({...acc,[c.id]:{
      scheduleEnabled:false,
      scheduleStart:"09:00", scheduleEnd:"23:00",
      scheduleDays:[1,2,3,4,5],
      bidType:"CPM",
      autoPause:true, budgetLimit:0,
      peakHours:false, peakStart:"11:00", peakEnd:"14:00",
      peakBidBoost:20,
    }}),{})
  );

  const DAYS=["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
  function upd(id,key,val){setStrategies(p=>({...p,[id]:{...p[id],[key]:val}}));}
  function toggleDay(id,d){
    const days=strategies[id].scheduleDays;
    upd(id,"scheduleDays",days.includes(d)?days.filter(x=>x!==d):[...days,d].sort());
  }

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{...S.card,background:"rgba(251,191,36,0.04)",borderColor:"rgba(251,191,36,0.15)"}}>
        <div style={{display:"flex",gap:10}}>
          <span style={{fontSize:22}}>⚡</span>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:3}}>Авто-стратегии</div>
            <div style={{fontSize:11,color:T.sub,lineHeight:1.7}}>Автоматически управляют кампаниями по расписанию, бюджету и пиковым часам.</div>
          </div>
        </div>
      </div>

      {data.campaigns.map(c=>{
        const s=strategies[c.id];
        const activeCount=[s.scheduleEnabled,s.autoPause&&s.budgetLimit>0,s.peakHours].filter(Boolean).length;
        return(
          <div key={c.id} style={{...S.card,borderColor:activeCount>0?"rgba(251,191,36,0.2)":T.border}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:T.text}}>{c.name}</div>
                <div style={{fontSize:11,color:T.sub,marginTop:2}}>
                  {activeCount>0
                    ?<span style={{color:T.yellow}}>⚡ {activeCount} {activeCount===1?"стратегия":"стратегии"} активны</span>
                    :"Нет активных стратегий"}
                </div>
              </div>
              <div style={{...S.card2,padding:"4px 10px"}}>
                <span style={{fontSize:11,color:c.status==="ok"?T.green:T.red,fontWeight:600}}>
                  {c.status==="ok"?"● Работает":"● Пауза"}
                </span>
              </div>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:10}}>

              {/* 1. Расписание */}
              <div style={{...S.card2,borderColor:s.scheduleEnabled?"rgba(74,222,128,0.2)":T.border}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:s.scheduleEnabled?12:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:16}}>📅</span>
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:T.text}}>Расписание</div>
                      <div style={{fontSize:10,color:T.sub}}>Включать/выключать по времени</div>
                    </div>
                  </div>
                  <div onClick={()=>upd(c.id,"scheduleEnabled",!s.scheduleEnabled)} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:38,height:22,borderRadius:11,background:s.scheduleEnabled?"rgba(74,222,128,0.3)":"rgba(255,255,255,0.08)",border:`1px solid ${s.scheduleEnabled?"rgba(74,222,128,0.5)":T.border}`,position:"relative"}}>
                      <div style={{position:"absolute",top:3,left:s.scheduleEnabled?18:3,width:14,height:14,borderRadius:"50%",background:s.scheduleEnabled?T.green:T.sub,transition:"left 0.2s"}}/>
                    </div>
                  </div>
                </div>
                {s.scheduleEnabled&&(
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                      {[{l:"Старт",k:"scheduleStart"},{l:"Стоп",k:"scheduleEnd"}].map(f=>(
                        <div key={f.k}>
                          <div style={{fontSize:10,color:T.sub,marginBottom:4}}>{f.l}</div>
                          <input type="time" value={s[f.k]} onChange={e=>upd(c.id,f.k,e.target.value)}
                            style={{...inp({fontFamily:"monospace",fontWeight:600,fontSize:14})}}/>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{fontSize:10,color:T.sub,marginBottom:6}}>Дни недели</div>
                      <div style={{display:"flex",gap:5}}>
                        {DAYS.map((d,i)=>{
                          const dayNum=i+1;
                          const active=s.scheduleDays.includes(dayNum);
                          return(
                            <button key={d} onClick={()=>toggleDay(c.id,dayNum)}
                              style={{flex:1,padding:"6px 2px",borderRadius:8,border:`1px solid ${active?"rgba(74,222,128,0.4)":T.border}`,
                                background:active?"rgba(74,222,128,0.12)":"transparent",
                                color:active?T.green:T.sub,fontSize:10,cursor:"pointer",fontWeight:active?700:400}}>
                              {d}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Тип ставки */}
              <div style={S.card2}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:16}}>💱</span>
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:T.text}}>Тип ставки</div>
                      <div style={{fontSize:10,color:T.sub}}>CPM (за 1000 показов) или CPC (за клик)</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:4}}>
                    {["CPM","CPC"].map(t=>(
                      <button key={t} onClick={()=>upd(c.id,"bidType",t)}
                        style={{padding:"5px 12px",borderRadius:8,border:`1px solid ${s.bidType===t?"rgba(124,58,237,0.5)":T.border}`,
                          background:s.bidType===t?"rgba(124,58,237,0.15)":"transparent",
                          color:s.bidType===t?"#c4b5fd":T.sub,fontSize:12,cursor:"pointer",fontWeight:s.bidType===t?700:400}}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Авто-пауза по бюджету */}
              <div style={{...S.card2,borderColor:s.autoPause&&s.budgetLimit>0?"rgba(248,113,113,0.2)":T.border}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:s.autoPause?10:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:16}}>🛑</span>
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:T.text}}>Авто-пауза при исчерпании бюджета</div>
                      <div style={{fontSize:10,color:T.sub}}>Остановить кампанию при лимите расхода</div>
                    </div>
                  </div>
                  <div onClick={()=>upd(c.id,"autoPause",!s.autoPause)} style={{cursor:"pointer"}}>
                    <div style={{width:38,height:22,borderRadius:11,background:s.autoPause?"rgba(248,113,113,0.3)":"rgba(255,255,255,0.08)",border:`1px solid ${s.autoPause?"rgba(248,113,113,0.4)":T.border}`,position:"relative"}}>
                      <div style={{position:"absolute",top:3,left:s.autoPause?18:3,width:14,height:14,borderRadius:"50%",background:s.autoPause?T.red:T.sub,transition:"left 0.2s"}}/>
                    </div>
                  </div>
                </div>
                {s.autoPause&&(
                  <div>
                    <div style={{fontSize:10,color:T.sub,marginBottom:4}}>Лимит расхода в день (₽)</div>
                    <input type="number" value={s.budgetLimit||""} onChange={e=>upd(c.id,"budgetLimit",+e.target.value)}
                      placeholder="5000" style={inp({fontFamily:"monospace",fontWeight:600})}/>
                    {s.budgetLimit>0&&<div style={{fontSize:10,color:T.red,marginTop:4}}>
                      🛑 Кампания остановится при расходе {fmt.rub(s.budgetLimit)}/день
                    </div>}
                  </div>
                )}
              </div>

              {/* 4. Авто-старт в пиковые часы */}
              <div style={{...S.card2,borderColor:s.peakHours?"rgba(251,191,36,0.2)":T.border}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:s.peakHours?10:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:16}}>🚀</span>
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:T.text}}>Авто-старт в пиковые часы</div>
                      <div style={{fontSize:10,color:T.sub}}>Повышать ставки в часы пик продаж</div>
                    </div>
                  </div>
                  <div onClick={()=>upd(c.id,"peakHours",!s.peakHours)} style={{cursor:"pointer"}}>
                    <div style={{width:38,height:22,borderRadius:11,background:s.peakHours?"rgba(251,191,36,0.3)":"rgba(255,255,255,0.08)",border:`1px solid ${s.peakHours?"rgba(251,191,36,0.4)":T.border}`,position:"relative"}}>
                      <div style={{position:"absolute",top:3,left:s.peakHours?18:3,width:14,height:14,borderRadius:"50%",background:s.peakHours?T.yellow:T.sub,transition:"left 0.2s"}}/>
                    </div>
                  </div>
                </div>
                {s.peakHours&&(
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                      <div>
                        <div style={{fontSize:10,color:T.sub,marginBottom:4}}>Начало пика</div>
                        <input type="time" value={s.peakStart} onChange={e=>upd(c.id,"peakStart",e.target.value)}
                          style={inp({fontFamily:"monospace",fontWeight:600})}/>
                      </div>
                      <div>
                        <div style={{fontSize:10,color:T.sub,marginBottom:4}}>Конец пика</div>
                        <input type="time" value={s.peakEnd} onChange={e=>upd(c.id,"peakEnd",e.target.value)}
                          style={inp({fontFamily:"monospace",fontWeight:600})}/>
                      </div>
                      <div>
                        <div style={{fontSize:10,color:T.sub,marginBottom:4}}>Буст ставки %</div>
                        <input type="number" value={s.peakBidBoost} min={5} max={100}
                          onChange={e=>upd(c.id,"peakBidBoost",+e.target.value)}
                          style={inp({fontFamily:"monospace",fontWeight:700})}/>
                      </div>
                    </div>
                    <div style={{fontSize:10,color:T.yellow,background:"rgba(251,191,36,0.06)",border:"1px solid rgba(251,191,36,0.15)",borderRadius:8,padding:"6px 10px"}}>
                      🚀 В {s.peakStart}–{s.peakEnd} ставки будут повышены на {s.peakBidBoost}%
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// APP — 3 главные вкладки + подвкладки
// ═══════════════════════════════════════════════════════════════════════════════

// Подвкладки для каждого раздела
const SUB_TABS={
  dashboard:[
    {id:"overview",    label:"Обзор"},
    {id:"funnel",      label:"Воронка"},
    {id:"placements",  label:"Размещение"},
    {id:"positions",   label:"Позиции"},
    {id:"diagnostics", label:"Диагностика"},
    {id:"planfact",    label:"План/Факт"},
  ],
  bids:[
    {id:"bids_smart",    label:"🤖 Авто"},
    {id:"bids_manual",   label:"✋ Ручное"},
    {id:"bids_strategy", label:"⚡ Стратегии"},
    {id:"bids_minus",    label:"🚫 Минусовка"},
  ],
  settings:[
    {id:"settings_main", label:"Настройки"},
  ],
};

export default function App(){
  const MOCK_TG_USERS=[
    {id:"545972485",first_name:"Olga",last_name:"Pshedromirskaya",username:"NeuroFrilans"},
    {id:"123456789",first_name:"Анна",last_name:"Иванова",username:"anna_ivanova"},
    {id:"555000111",first_name:"Незнакомец",last_name:"",username:"unknown_user"},
  ];
  const OWNER_ID="545972485";
  const ALLOWED_IDS=["545972485","123456789"];
  const [mockUserIdx,setMockUserIdx]=useState(0);
  const tgUser=MOCK_TG_USERS[mockUserIdx];
  const isOwner=tgUser.id===OWNER_ID;
  const isAllowed=ALLOWED_IDS.includes(tgUser.id);

  const [platform,setPlatform]=useState("wb");
  const [mainTab,setMainTab]=useState("dashboard");
  const [subTab,setSubTab]=useState("overview");
  const [drrWB,setDrrWB]=useState(null);
  const [catWB,setCatWB]=useState("");
  const [budgetWB,setBudgetWB]=useState(null);
  const [drrOzon,setDrrOzon]=useState(null);
  const [catOzon,setCatOzon]=useState("");
  const [budgetOzon,setBudgetOzon]=useState(null);

  const data=DEMO[platform];
  const targetDrr=platform==="wb"?drrWB:drrOzon;
  const category=platform==="wb"?catWB:catOzon;
  const budget=platform==="wb"?budgetWB:budgetOzon;
  const setDrr=platform==="wb"?setDrrWB:setDrrOzon;
  const setCat=platform==="wb"?setCatWB:setCatOzon;
  const setBudget=platform==="wb"?setBudgetWB:setBudgetOzon;
  const accent=platform==="wb"?T.wb:T.ozon;

  // Переключение главной вкладки — сбрасывает подвкладку на первую
  function goMain(tab){
    setMainTab(tab);
    setSubTab(SUB_TABS[tab][0].id);
  }

  // Навигация изнутри (например кнопка "Задайте ДРР")
  function goToPlanFact(){goMain("dashboard");setSubTab("planfact");}

  const BOTTOM_TABS=[
    {id:"dashboard",icon:"🏠",label:"Дашборд"},
    {id:"bids",     icon:"💰",label:"Ставки"},
    {id:"settings", icon:"⚙️", label:"Настройки"},
  ];

  const DemoUserSwitch=(
    <div style={{position:"fixed",bottom:76,right:12,zIndex:100}}>
      <div style={{...S.card,padding:10,fontSize:11,minWidth:210}}>
        <div style={{color:T.sub,marginBottom:6,fontSize:10}}>🧪 ДЕМО — смена пользователя</div>
        {MOCK_TG_USERS.map((u,i)=>(
          <button key={u.id} onClick={()=>setMockUserIdx(i)}
            style={{display:"block",width:"100%",textAlign:"left",
              background:mockUserIdx===i?"rgba(167,139,250,0.15)":"transparent",
              border:`1px solid ${mockUserIdx===i?"rgba(167,139,250,0.4)":"transparent"}`,
              borderRadius:8,padding:"5px 8px",cursor:"pointer",marginBottom:3,
              color:ALLOWED_IDS.includes(u.id)?T.green:T.red,fontSize:11}}>
            {u.id===OWNER_ID?"👑":ALLOWED_IDS.includes(u.id)?"✅":"🔒"} {u.first_name} {u.last_name} · @{u.username}
          </button>
        ))}
      </div>
    </div>
  );

  if(!isAllowed){
    return(<><AccessDenied tgUser={tgUser} onRequestAccess={()=>{}}/>{DemoUserSwitch}</>);
  }

  const subs=SUB_TABS[mainTab];

  return(
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"system-ui,sans-serif",paddingBottom:64}}>

      {/* ── ШАПКА ── */}
      <div style={{background:T.card,borderBottom:`1px solid ${T.border}`,padding:"10px 16px",position:"sticky",top:0,zIndex:30}}>
        <div style={{maxWidth:600,margin:"0 auto"}}>
          {/* Платформа + ДРР */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div style={{display:"flex",gap:6}}>
              {[{id:"wb",label:"🟣 WB",bg:T.wb},{id:"ozon",label:"🔵 Ozon",bg:T.ozon}].map(p=>(
                <button key={p.id} onClick={()=>setPlatform(p.id)}
                  style={{padding:"5px 14px",borderRadius:8,border:`2px solid ${platform===p.id?p.bg:"transparent"}`,
                    background:platform===p.id?p.bg:"rgba(255,255,255,0.05)",
                    color:T.text,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  {p.label}
                </button>
              ))}
            </div>
            {targetDrr?(
              <div style={{fontSize:11,color:"#a78bfa",fontWeight:700,fontFamily:"monospace"}}>🎯 {targetDrr}%</div>
            ):(
              <button onClick={goToPlanFact}
                style={{fontSize:11,color:T.yellow,background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.25)",borderRadius:8,padding:"4px 10px",cursor:"pointer"}}>
                ⚠️ Задайте ДРР
              </button>
            )}
          </div>

          {/* Подвкладки текущего раздела */}
          {subs.length>1&&(
            <div style={{display:"flex",gap:3,overflowX:"auto",paddingBottom:2}}>
              {subs.map(s=>(
                <button key={s.id} onClick={()=>setSubTab(s.id)}
                  style={{padding:"5px 10px",borderRadius:7,border:"none",whiteSpace:"nowrap",flexShrink:0,
                    background:subTab===s.id?accent:"rgba(255,255,255,0.05)",
                    color:subTab===s.id?"#fff":T.sub,
                    fontSize:11,fontWeight:subTab===s.id?700:400,cursor:"pointer",position:"relative"}}>
                  {s.label}
                  {s.id==="planfact"&&!targetDrr&&(
                    <span style={{position:"absolute",top:2,right:2,width:5,height:5,borderRadius:"50%",background:T.yellow}}/>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── КОНТЕНТ ── */}
      <div style={{maxWidth:600,margin:"0 auto",padding:"12px 16px"}}>
        {/* Дашборд */}
        {subTab==="overview"    &&<TabOverview    data={data} platform={platform} targetDrr={targetDrr} onGoToPlanFact={goToPlanFact}/>}
        {subTab==="funnel"      &&<TabFunnel      data={data}/>}
        {subTab==="placements"  &&<TabPlacements  data={data} targetDrr={targetDrr}/>}
        {subTab==="positions"   &&<TabPositionsByPlacement data={data} targetDrr={targetDrr}/>}
        {subTab==="diagnostics" &&<TabDiagnostics data={data} targetDrr={targetDrr} onGoToPlanFact={goToPlanFact}/>}
        {subTab==="planfact"    &&<TabPlanFact    data={data} targetDrr={targetDrr} onSetTargetDrr={setDrr} category={category} onSetCategory={setCat} budget={budget} onSetBudget={setBudget}/>}
        {/* Ставки */}
        {subTab==="bids_smart"    &&<SmartBidsTab    data={data} targetDrr={targetDrr} inp={(e={})=>({width:"100%",background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:"9px 12px",fontSize:13,color:T.text,outline:"none",boxSizing:"border-box",...e})}/>}
        {subTab==="bids_manual"   &&<ManualBidsTab   data={data} inp={(e={})=>({width:"100%",background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:"9px 12px",fontSize:13,color:T.text,outline:"none",boxSizing:"border-box",...e})}/>}
        {subTab==="bids_strategy" &&<StrategyTab     data={data} inp={(e={})=>({width:"100%",background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:"9px 12px",fontSize:13,color:T.text,outline:"none",boxSizing:"border-box",...e})}/>}
        {subTab==="bids_minus"    &&<TabAutoMinus    data={data}/>}
        {/* Настройки */}
        {subTab==="settings_main" &&<TabSettings     currentUserTgId={tgUser.id}/>}
      </div>

      {/* ── НИЖНЯЯ НАВИГАЦИЯ ── */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:40,
        background:T.card,borderTop:`1px solid ${T.border}`,
        display:"flex",justifyContent:"space-around",alignItems:"center",
        padding:"8px 0 12px",maxWidth:"100%"}}>
        {BOTTOM_TABS.map(tab=>{
          const isActive=mainTab===tab.id;
          const hasDot=tab.id==="dashboard"&&!targetDrr;
          return(
            <button key={tab.id} onClick={()=>goMain(tab.id)}
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,
                background:"transparent",border:"none",cursor:"pointer",
                color:isActive?accent:T.sub,padding:"4px 20px",position:"relative",
                minWidth:80,transition:"color 0.15s"}}>
              {hasDot&&<span style={{position:"absolute",top:0,right:16,width:7,height:7,borderRadius:"50%",background:T.yellow}}/>}
              <span style={{fontSize:22,lineHeight:1}}>{tab.icon}</span>
              <span style={{fontSize:10,fontWeight:isActive?700:400,letterSpacing:"0.3px"}}>{tab.label}</span>
              {isActive&&<div style={{position:"absolute",bottom:-12,left:"50%",transform:"translateX(-50%)",
                width:32,height:3,borderRadius:2,background:accent}}/>}
            </button>
          );
        })}
      </div>

      {DemoUserSwitch}
    </div>
  );
}
