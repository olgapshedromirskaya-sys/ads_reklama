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
      {id:1,name:"Кроссовки женские",drr:12.4,spend:38427,orders:187,cpo:205,status:"ok",buyoutPct:89.2,orderedRevenue:142600,
        keywords:["кроссовки женские","кроссовки на платформе","белые кроссовки"]},
      {id:2,name:"Джинсы slim fit",  drr:24.1,spend:15200,orders:31, cpo:490,status:"bad",buyoutPct:71.4,orderedRevenue:28600,
        keywords:["джинсы slim fit","джинсы скинни"]},
      {id:3,name:"Белые кроссовки",  drr:8.7, spend:9800, orders:62, cpo:158,status:"ok",buyoutPct:91.8,orderedRevenue:58100,
        keywords:["белые кроссовки"]},
    ],
    keywords:[
      {keyword:"кроссовки женские",    campaignId:1,pos:3, posPrev:5, posSearch:3, posShelves:2, bidSearch:220,bidShelves:175,bidCompSearch:190,bidCompShelves:155, orders:187,baskets:240,ctr:1.42,drr:12.4,spend:826, revenue:6500, impressions:1063,clicks:15},
      {keyword:"кроссовки на платформе",campaignId:1,pos:12,posPrev:12,posSearch:12,posShelves:8, bidSearch:220,bidShelves:175,bidCompSearch:180,bidCompShelves:140, orders:94, baskets:120,ctr:0.94,drr:18.2,spend:580, revenue:3186, impressions:890, clicks:8},
      {keyword:"белые кроссовки",      campaignId:3,pos:7, posPrev:5, posSearch:7, posShelves:5, bidSearch:210,bidShelves:170,bidCompSearch:165,bidCompShelves:130, orders:62, baskets:80, ctr:0.67,drr:21.5,spend:420, revenue:1953, impressions:760, clicks:5,alert:true},
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
      {keyword:"кроссовки женские",     campaignId:1,freq:84295,dates:[{date:"05.03",promo:true, price:547,shows:">700",posSearch:3, posShelves:2, cpm:220},{date:"28.02",promo:true, price:545,shows:">700",posSearch:5, posShelves:4, cpm:220},{date:"21.02",promo:false,price:520,shows:">700",posSearch:8, posShelves:7, cpm:180}]},
      {keyword:"кроссовки на платформе",campaignId:1,freq:19745,dates:[{date:"05.03",promo:true, price:547,shows:">700",posSearch:12,posShelves:8, cpm:220},{date:"28.02",promo:true, price:545,shows:">700",posSearch:12,posShelves:9, cpm:220},{date:"21.02",promo:false,price:520,shows:"412", posSearch:15,posShelves:11,cpm:180}]},
      {keyword:"белые кроссовки",       campaignId:3,freq:16330,dates:[{date:"05.03",promo:true, price:547,shows:"560", posSearch:7, posShelves:5, cpm:210},{date:"28.02",promo:true, price:545,shows:"490", posSearch:5, posShelves:4, cpm:210},{date:"21.02",promo:false,price:520,shows:"380", posSearch:9, posShelves:7, cpm:170}]},
      {keyword:"джинсы slim fit",       campaignId:2,freq:19353,dates:[{date:"05.03",promo:true, price:547,shows:"320", posSearch:22,posShelves:18,cpm:155},{date:"28.02",promo:true, price:545,shows:"290", posSearch:19,posShelves:15,cpm:155},{date:"21.02",promo:false,price:520,shows:"210", posSearch:16,posShelves:13,cpm:130}]},
      {keyword:"джинсы скинни",         campaignId:2,freq:7217, dates:[{date:"05.03",promo:true, price:547,shows:"180", posSearch:31,posShelves:25,cpm:145},{date:"28.02",promo:true, price:545,shows:"160", posSearch:27,posShelves:22,cpm:145},{date:"21.02",promo:false,price:520,shows:"120", posSearch:24,posShelves:19,cpm:120}]},
    ],
    clusters:[
      {keyword:"кроссовки женские",campaignId:1,freq:84295,cpm:220,avgPos:3,impressions:1063,clicks:15,ctr:1.42,cpc:55.1,spend:826,costShare:32.1,baskets:240,orders:187,revenue:6500},
      {keyword:"кроссовки на платформе",campaignId:1,freq:19745,cpm:220,avgPos:12,impressions:890,clicks:8,ctr:0.94,cpc:82.6,spend:580,costShare:19.8,baskets:120,orders:94,revenue:3186},
      {keyword:"белые кроссовки",campaignId:3,freq:16330,cpm:210,avgPos:7,impressions:760,clicks:5,ctr:0.67,cpc:84.0,spend:420,costShare:14.3,baskets:80,orders:62,revenue:1953,alert:true},
      {keyword:"джинсы slim fit",campaignId:2,freq:19353,cpm:155,avgPos:22,impressions:520,clicks:2,ctr:0.47,cpc:142.5,spend:285,costShare:9.7,baskets:35,orders:18,revenue:913,alert:true},
      {keyword:"джинсы скинни",campaignId:2,freq:7217,cpm:145,avgPos:31,impressions:410,clicks:1,ctr:0.38,cpc:195.0,spend:195,costShare:6.6,baskets:22,orders:13,revenue:680,alert:true},
      {keyword:"женские кроссовки купить",freq:38228,cpm:220,avgPos:5,impressions:98,clicks:3,ctr:3.06,cpc:25.3,spend:76,costShare:2.6,baskets:15,orders:8,revenue:640,best:true},
    ],
    minusActive:[
      {id:1,campaignId:1,keyword:"мужские кроссовки",impressions:820,clicks:3,ctr:0.37,spend:248,orders:0,addedDaysAgo:3,reason:"low_ctr",pos:78},
      {id:2,campaignId:1,keyword:"детские кроссовки",impressions:540,clicks:1,ctr:0.19,spend:163,orders:0,addedDaysAgo:5,reason:"low_ctr",pos:112},
      {id:3,campaignId:2,keyword:"джинсы широкие",impressions:310,clicks:2,ctr:0.65,spend:194,orders:0,addedDaysAgo:1,reason:"no_orders"},
      {id:4,campaignId:2,keyword:"брюки slim",impressions:290,clicks:4,ctr:1.38,spend:316,orders:0,addedDaysAgo:2,reason:"no_orders"},
      {id:5,campaignId:3,keyword:"кроссовки серые",impressions:480,clicks:3,ctr:0.63,spend:214,orders:0,addedDaysAgo:2,reason:"low_ctr",pos:67},
      {id:6,campaignId:3,keyword:"кроссовки цветные",impressions:340,clicks:1,ctr:0.29,spend:175,orders:0,addedDaysAgo:4,reason:"low_ctr",pos:143},
    ],
    minusArchive:[
      {id:10,campaignId:1,keyword:"обувь женская",impressions:1240,clicks:4,ctr:0.32,spend:410,orders:0,pos:87,deletedAt:"01.03.2026",deletedBy:"авто",reason:"CTR < 0.5%"},
      {id:11,campaignId:1,keyword:"туфли",impressions:890,clicks:2,ctr:0.22,spend:280,orders:0,pos:134,deletedAt:"28.02.2026",deletedBy:"авто",reason:"CTR < 0.5%"},
      {id:12,campaignId:2,keyword:"штаны мужские",impressions:320,clicks:3,ctr:0.94,spend:195,orders:0,pos:52,deletedAt:"25.02.2026",deletedBy:"ручное",reason:"Ручное удаление"},
      {id:13,campaignId:3,keyword:"кроссовки чёрные",impressions:560,clicks:2,ctr:0.36,spend:198,orders:0,pos:102,deletedAt:"03.03.2026",deletedBy:"авто",reason:"CTR < 0.5%"},
    ],
  },
  ozon:{
    today:{revenue:180000,revenuePlan:300000,orders:138,ordersPlan:400,adSpend:10000,adSpendPlan:60000,conversion:2.5,conversionPlan:4,fromAd:{ordered:79,orderedRevenue:194900,buyoutPct:87.3}},
    budgetPlan:60000, revenuePlan:600000, ordersPlan:600, buyoutPlan:80,
    campaigns:[
      {id:1,name:"Рюкзак туристический",drr:16.4,spend:72000,orders:220,cpo:327,status:"warn",buyoutPct:82.5,orderedRevenue:88400,keywords:["рюкзак туристический","рюкзак для походов"]},
      {id:2,name:"Термокружка 450мл",   drr:12.3,spend:52000,orders:150,cpo:347,status:"ok",buyoutPct:91.3,orderedRevenue:64200,keywords:["термокружка 450мл","термокружка с крышкой"]},
      {id:3,name:"Куртка зимняя XL",    drr:7.1, spend:58500,orders:190,cpo:308,status:"ok",buyoutPct:88.7,orderedRevenue:125900,keywords:["куртка зимняя"]},
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
      {keyword:"рюкзак туристический",campaignId:1,freq:62100,dates:[{date:"05.03",promo:true, price:3490,shows:">700",posSearch:8, posShelves:6, cpm:340},{date:"28.02",promo:true, price:3490,shows:">700",posSearch:11,posShelves:9, cpm:340},{date:"21.02",promo:false,price:3200,shows:">700",posSearch:14,posShelves:11,cpm:280}]},
      {keyword:"рюкзак для походов",  campaignId:1,freq:18400,dates:[{date:"05.03",promo:true, price:3490,shows:"480", posSearch:15,posShelves:12,cpm:290},{date:"28.02",promo:true, price:3490,shows:"420", posSearch:15,posShelves:12,cpm:290},{date:"21.02",promo:false,price:3200,shows:"360", posSearch:18,posShelves:14,cpm:240}]},
      {keyword:"термокружка 450мл",   campaignId:2,freq:24800,dates:[{date:"05.03",promo:true, price:890, shows:">700",posSearch:4, posShelves:3, cpm:180},{date:"28.02",promo:true, price:890, shows:">700",posSearch:6, posShelves:5, cpm:180},{date:"21.02",promo:false,price:850, shows:"510", posSearch:9, posShelves:7, cpm:150}]},
      {keyword:"куртка зимняя",       campaignId:3,freq:91200,dates:[{date:"05.03",promo:true, price:6800,shows:">700",posSearch:3, posShelves:2, cpm:420},{date:"28.02",promo:true, price:6800,shows:">700",posSearch:4, posShelves:3, cpm:420},{date:"21.02",promo:false,price:6500,shows:">700",posSearch:6, posShelves:5, cpm:350}]},
    ],
    clusters:[
      {keyword:"рюкзак туристический",campaignId:1,freq:62100,cpm:340,avgPos:8,impressions:890,clicks:10,ctr:1.21,cpc:72.0,spend:720,costShare:28.5,baskets:310,orders:220,revenue:4390},
      {keyword:"рюкзак для походов",  freq:18400,cpm:290,avgPos:15,impressions:720,clicks:6, ctr:0.88,cpc:80.0,spend:480,costShare:19.0,baskets:130,orders:95, revenue:2424},
      {keyword:"термокружка 450мл",   freq:24800,cpm:180,avgPos:4, impressions:650,clicks:10,ctr:1.54,cpc:52.0,spend:520,costShare:20.6,baskets:210,orders:150,revenue:4228,best:true},
      {keyword:"куртка зимняя",       freq:91200,cpm:420,avgPos:3, impressions:1100,clicks:15,ctr:1.38,cpc:39.0,spend:585,costShare:23.2,baskets:260,orders:190,revenue:8239},
      {keyword:"термокружка с крышкой",freq:8900,cpm:155,avgPos:21,impressions:480,clicks:3, ctr:0.62,cpc:70.0,spend:210,costShare:8.3, baskets:65, orders:42, revenue:909, alert:true},
    ],
    minusActive:[
      {id:1,campaignId:1,keyword:"рюкзак детский",impressions:620,clicks:2,ctr:0.32,spend:186,orders:0,addedDaysAgo:2,reason:"low_ctr"},
      {id:2,campaignId:2,keyword:"сумка дорожная",impressions:440,clicks:1,ctr:0.23,spend:132,orders:0,addedDaysAgo:4,reason:"low_ctr"},
    ],
    minusArchive:[
      {id:10,campaignId:1,keyword:"чемодан",impressions:980,clicks:3,ctr:0.31,spend:294,orders:0,deletedAt:"02.03.2026",deletedBy:"авто",reason:"CTR < 0.5%"},
      {id:11,campaignId:2,keyword:"сумка городская",impressions:560,clicks:2,ctr:0.36,spend:168,orders:0,deletedAt:"28.02.2026",deletedBy:"ручное",reason:"Ручное удаление"},
    ],
  },
};

// ── УТИЛИТЫ ────────────────────────────────────────────────────────────────────
const fmt={
  pct:v=>v==null?"—":`${v.toFixed(2)}%`,
  pct1:v=>v==null?"—":`${v.toFixed(1)}%`,
  rub:v=>v==null?"—":`${Math.round(v).toLocaleString("ru-RU")} ₽`,
  rubK:v=>v==null?"—":v>=1000?`${(Math.round(v)/1000).toFixed(0)} 000 ₽`:`${Math.round(v)} ₽`,
  num:v=>v==null?"—":Math.round(Number(v)).toLocaleString("ru-RU"),
};

// ── кампания → масштаб (для демо-данных) ─────────────────────────────────────
function getCampScale(campaigns, selCamp){
  if(selCamp==="all"||!selCamp) return {spendScale:1,ordersScale:1,camp:null};
  const allSpend=campaigns.reduce((s,c)=>s+c.spend,0)||1;
  const allOrders=campaigns.reduce((s,c)=>s+c.orders,0)||1;
  const camp=campaigns.find(c=>String(c.id)===String(selCamp));
  if(!camp) return {spendScale:1,ordersScale:1,camp:null};
  return {spendScale:camp.spend/allSpend, ordersScale:camp.orders/allOrders, camp};
}
function scaleDays(days, spendScale, ordersScale){
  return days.map(d=>({
    ...d,
    spend:      d.spend       * spendScale,
    revenue:    d.revenue     * ordersScale,
    impressions:d.impressions * spendScale,
    clicks:     d.clicks      * spendScale,
    baskets:    d.baskets     * ordersScale,
    orders:     d.orders      * ordersScale,
    sources:(d.sources||[]).map(s=>({
      ...s,
      spend:      (s.spend||0)       * spendScale,
      impressions:(s.impressions||0) * spendScale,
      clicks:     (s.clicks||0)      * spendScale,
      orders:     (s.orders||0)      * ordersScale,
    })),
  }));
}
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
  if(ctr>=3) return{bg:"rgba(124,58,237,0.25)",c:"#c4b5fd"};
  if(ctr>=1) return{bg:"rgba(74,222,128,0.18)",c:"#4ade80"};
  if(ctr>=0.7)return{bg:"rgba(255,255,255,0.06)",c:T.text};
  return{bg:"rgba(248,113,113,0.2)",c:"#fca5a5"};
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
// ВЫБОР КАМПАНИИ — universal dropdown
// ═══════════════════════════════════════════════════════════════════════════════
function CampaignSelect({campaigns,value,onChange,style={}}){
  const SS={
    background:T.card2,
    border:`1px solid rgba(124,58,237,0.4)`,
    borderRadius:9,
    padding:"6px 10px",
    fontSize:12,
    color:T.text,
    outline:"none",
    cursor:"pointer",
    width:"100%",
    marginBottom:12,
    ...style,
  };
  return(
    <select value={value} onChange={e=>onChange(e.target.value)} style={SS}>
      <option value="all">📋 Все кампании</option>
      {(campaigns||[]).map(c=>(
        <option key={c.id} value={String(c.id)}>{c.name}</option>
      ))}
    </select>
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

  // Переключатели периода для каждого блока
  const [metricsPeriod,setMetricsPeriod]=useState("7d");
  const [placementsPeriod,setPlacementsPeriod]=useState("7d");
  const [kwPeriod,setKwPeriod]=useState("7d");
  const [overviewCamp,setOverviewCamp]=useState("all"); // единый фильтр кампании для всего Обзора

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

  const {spendScale:campScale,ordersScale:campOrdersScale}=getCampScale(data.campaigns,overviewCamp);
  const scaledDays=scaleDays(mDays,campScale,campOrdersScale);
  const totalSpend=scaledDays.reduce((s,x)=>s+x.spend,0);
  const totalRev=scaledDays.reduce((s,x)=>s+x.revenue,0);
  const totalImpr=scaledDays.reduce((s,x)=>s+x.impressions,0);
  const totalClicks=scaledDays.reduce((s,x)=>s+x.clicks,0);
  const totalBaskets=scaledDays.reduce((s,x)=>s+x.baskets,0);
  const totalOrders=scaledDays.reduce((s,x)=>s+x.orders,0);
  const factDrr=totalRev>0?totalSpend/totalRev*100:null;

  // для спарклайна всегда берём 7 дней
  const week=allDays.slice(0,7);
  const avgCpm=totalImpr>0?totalSpend/totalImpr*1000:0;
  const avgCtr=totalImpr>0?totalClicks/totalImpr*100:0;
  const avgCpc=totalClicks>0?totalSpend/totalClicks:0;
  const avgCpl=totalBaskets>0?totalSpend/totalBaskets:0;
  const avgCpo=totalOrders>0?totalSpend/totalOrders:0;
  const cro=totalBaskets>0?totalOrders/totalBaskets*100:0;
  const drrSt=getDrrStatus(factDrr,targetDrr);

  // Места размещения (агрегат за неделю)
  const srcAgg={};
  week.forEach(day=>{
    (day.sources||[]).forEach(s=>{
      if(!srcAgg[s.type])srcAgg[s.type]={type:s.type,spend:0,impressions:0,clicks:0,orders:0,baskets:0};
      srcAgg[s.type].spend+=s.spend;
      srcAgg[s.type].impressions+=s.impressions;
      srcAgg[s.type].clicks+=s.clicks;
      srcAgg[s.type].orders+=s.orders||0;
    });
  });
  // Корзины по источнику — оцениваем пропорционально
  Object.values(srcAgg).forEach(s=>{
    s.ctr=s.impressions>0?s.clicks/s.impressions*100:0;
    s.cpm=s.impressions>0?s.spend/s.impressions*1000:0;
    s.cpc=s.clicks>0?s.spend/s.clicks:0;
    s.cpl=totalBaskets>0?s.spend/totalBaskets:0;
    s.pct=totalSpend>0?s.spend/totalSpend*100:0;
  });
  const sources=Object.values(srcAgg).sort((a,b)=>b.spend-a.spend);

  // Динамика корзин сегодня/вчера
  const basketToday=today?.baskets||0;
  const basketYest=yesterday?.baskets||0;
  const basketDiff=basketToday-basketYest;
  const basketPct=basketYest>0?basketDiff/basketYest*100:0;

  // Бюджет
  const budgetSpendPct=data.budgetPlan>0?Math.round(totalSpend/data.budgetPlan*100):null;

  const SRC_COLOR={поиск:"#6366f1",полки:"#0ea5e9",каталог:"#f59e0b"};

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
                {drrSt==="great"?"🎯":drrSt==="ok"?"✅":drrSt==="warn"?"⚠️":"🚨"}
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
                {l:"% выкупа",f:`${d.fromAd.buyoutPct}%`,p:`${data.buyoutPlan}%`,pct:Math.round(d.fromAd.buyoutPct/data.buyoutPlan*100)},
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

      {/* ── ЕДИНЫЙ ФИЛЬТР КАМПАНИИ ── */}
      <CampaignSelect campaigns={data.campaigns} value={overviewCamp} onChange={setOverviewCamp}
        style={{marginBottom:4}}/>

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
        {(()=>{
          // Данные "с рекламы" — берём из выбранной кампании или суммируем все
          const campObj=overviewCamp==="all"?null:data.campaigns.find(c=>String(c.id)===String(overviewCamp));
          const adOrdered=campObj?campObj.orders:data.campaigns.reduce((s,c)=>s+c.orders,0);
          const adRevenue=campObj?campObj.orderedRevenue||Math.round(campObj.orders*campObj.cpo*3.2):d.fromAd.orderedRevenue;
          const buyoutPct=campObj?campObj.buyoutPct:d.fromAd.buyoutPct;
          const crf=totalBaskets>0&&totalOrders>0?(totalOrders/totalBaskets*100).toFixed(1):null;
          return(
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {[
            {l:"📋 Заказано с рекламы",v:`${adOrdered} шт | ${fmt.rubK(adRevenue)}`},
            {l:"📊 % выкупа трафика",  v:`${buyoutPct}%`,c:buyoutPct>=80?T.green:buyoutPct>=60?T.yellow:T.red},
            {l:"💸 Доля затрат в выручке",v:totalRev>0?`${(totalSpend/totalRev*100).toFixed(1)}%`:"—"},
            {l:"📈 CRF (корзина→заказ)", v:crf?`${crf}%`:"—"},
          ].map(m=>(
            <div key={m.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:`1px solid ${T.border}`}}>
              <span style={{fontSize:12,color:T.sub}}>{m.l}</span>
              <span style={{fontSize:13,fontWeight:600,color:m.c||T.text}}>{m.v}</span>
            </div>
          ))}
        </div>
          );
        })()}
      </div>

            {/* ── ПО КЛЮЧЕВЫМ СЛОВАМ — полные метрики ── */}
      <KeywordsMetricsBlock data={data} targetDrr={targetDrr}/>

      {/* ── ИСТОРИЯ ПОЗИЦИЙ ── */}
      <PositionHistoryBlock data={data} targetDrr={targetDrr}/>

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
function TabFunnel({data,targetDrr}){
  const [period,setPeriod]=useState("7d");
  const [selCamp,setSelCamp]=useState("all");
  const [deletedFunnelKws,setDeletedFunnelKws]=useState(new Set());
  function deleteFunnelKw(kw){setDeletedFunnelKws(prev=>{const n=new Set(prev);n.add(kw);return n;});}

  // Фильтр дней по периоду (упрощённо для демо)
  const allDays=data.daily;
  const days=period==="today"?allDays.slice(0,1):period==="yesterday"?allDays.slice(1,2):allDays;

  // Фильтр ключей по кампании
  const kws=(selCamp==="all"?data.keywords:data.keywords.filter(k=>String(k.campaignId)===String(selCamp))).filter(k=>!deletedFunnelKws.has(k.keyword));

  const {spendScale:funnelScale,ordersScale:funnelOrdScale}=getCampScale(data.campaigns,selCamp);
  const funnelDays=scaleDays(days,funnelScale,funnelOrdScale);
  const totals={
    impressions:funnelDays.reduce((s,d)=>s+d.impressions,0),
    clicks:funnelDays.reduce((s,d)=>s+d.clicks,0),
    baskets:funnelDays.reduce((s,d)=>s+d.baskets,0),
    orders:funnelDays.reduce((s,d)=>s+d.orders,0),
  };
  const steps=[
    {label:"👁 Показы",  val:totals.impressions,pct:100,cr:null},
    {label:"👆 Клики",   val:totals.clicks,      pct:totals.impressions?+(totals.clicks/totals.impressions*100).toFixed(2):0,cr:"CTR"},
    {label:"🛒 Корзины", val:totals.baskets,     pct:totals.clicks?+(totals.baskets/totals.clicks*100).toFixed(1):0,cr:"CR корзина"},
    {label:"📦 Заказы",  val:totals.orders,      pct:totals.baskets?+(totals.orders/totals.baskets*100).toFixed(1):0,cr:"CR заказ"},
  ];
  const maxVal=steps[0].val||1;
  const cols=["#6366f1","#3b82f6","#0ea5e9",T.green];

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
          const csteps=[cImp,cCl,cBsk,c.orders];
          const clabels=["Показы","Клики","Корзины","Заказы"];
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

      {/* ── ПОЛНАЯ СТАТИСТИКА РЕКЛАМНЫХ КАМПАНИЙ ── */}
      <div style={{...S.card,background:"rgba(99,102,241,0.04)",borderColor:"rgba(99,102,241,0.2)",padding:"10px 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#c4b5fd"}}>📊 Полная статистика рекламных кампаний</div>
          <div style={{fontSize:10,color:T.sub}}>по ключевым запросам</div>
        </div>
        <div style={{fontSize:11,color:T.sub,marginTop:3}}>Все показатели по каждому ключу — прокрутите таблицу вправо</div>
      </div>
      <CampaignSelect campaigns={data.campaigns} value={selCamp} onChange={setSelCamp}/>

      {/* По ключевым словам — все ключи, полные метрики по каждой кампании */}
      {data.campaigns.filter(c=>selCamp==="all"||String(c.id)===String(selCamp)).map(camp=>{
        const campKwsFull=kws.filter(k=>String(k.campaignId)===String(camp.id));
        const kwScale=period==="today"?1/7:period==="yesterday"?1/6:1;
        if(campKwsFull.length===0) return null;
        return(
          <div key={camp.id} style={S.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{fontSize:14,fontWeight:700,color:T.text}}>{camp.name}</div>
              <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:8,
                background:camp.drr<=(targetDrr||20)?"rgba(74,222,128,0.12)":"rgba(248,113,113,0.12)",
                color:camp.drr<=(targetDrr||20)?T.green:T.red}}>ДРР {camp.drr}%</span>
            </div>
            {/* Горизонтальный скролл */}
            <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",marginLeft:-4,marginRight:-4,paddingLeft:4,paddingRight:4}}>
              <div style={{minWidth:680}}>
                {/* Заголовок */}
                <div style={{display:"grid",gridTemplateColumns:"140px 64px 56px 60px 56px 56px 68px 60px 56px 60px 64px 32px",
                  gap:0,paddingBottom:5,borderBottom:`1px solid ${T.border}`,marginBottom:2}}>
                  {["Запрос","Показы","CPM","Переход","CTR","CPC","Затраты","Корзины","CPL","Заказы","ДРР РК",""].map((h,hi)=>(
                    <div key={hi} style={{fontSize:9,color:T.sub,textAlign:hi>0?"center":"left",
                      fontWeight:600,padding:"0 3px",letterSpacing:"0.02em"}}>{h}</div>
                  ))}
                </div>
                {campKwsFull.map((kw,ki)=>{
                  const imp=Math.round(kw.impressions*kwScale);
                  const cl=Math.max(0,Math.round(kw.clicks*kwScale));
                  const bsk=Math.max(0,Math.round(kw.baskets*kwScale));
                  const ord=Math.max(0,Math.round(kw.orders*kwScale));
                  const sp=Math.round(kw.spend*kwScale);
                  const rev=Math.round(kw.revenue*kwScale);
                  const cpm=imp>0?(sp/imp*1000):0;
                  const cpc=cl>0?sp/cl:0;
                  const ctrSt=getCtrSt(kw.ctr);
                  const cpl=bsk>0?sp/bsk:0;
                  const drr=rev>0?(sp/rev*100):null;
                  const isOdd=ki%2===1;
                  return(
                    <div key={kw.keyword} style={{display:"grid",
                      gridTemplateColumns:"140px 64px 56px 60px 56px 56px 68px 60px 56px 60px 64px 32px",
                      gap:0,padding:"7px 0",borderBottom:`1px solid rgba(255,255,255,0.04)`,
                      background:isOdd?"rgba(255,255,255,0.015)":"transparent",alignItems:"center"}}>
                      <div style={{fontSize:11,color:T.text,fontWeight:600,
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",padding:"0 3px"}}
                        title={kw.keyword}>{kw.keyword}</div>
                      <div style={{textAlign:"center",padding:"0 2px"}}><span style={{fontSize:11,fontFamily:"monospace",color:T.sub}}>{fmt.num(imp)}</span></div>
                      <div style={{textAlign:"center",padding:"0 2px"}}><span style={{fontSize:11,fontFamily:"monospace",color:T.sub}}>{cpm>0?`${cpm.toFixed(0)}₽`:"—"}</span></div>
                      <div style={{textAlign:"center",padding:"0 2px"}}><span style={{fontSize:12,fontFamily:"monospace",color:T.text,fontWeight:600}}>{cl}</span></div>
                      <div style={{textAlign:"center",padding:"0 2px"}}><span style={{fontSize:11,fontFamily:"monospace",padding:"2px 5px",borderRadius:5,background:ctrSt.bg,color:ctrSt.c,fontWeight:700}}>{fmt.pct(kw.ctr)}</span></div>
                      <div style={{textAlign:"center",padding:"0 2px"}}><span style={{fontSize:11,fontFamily:"monospace",color:T.sub}}>{cpc>0?`${cpc.toFixed(0)}₽`:"—"}</span></div>
                      <div style={{textAlign:"center",padding:"0 2px"}}><span style={{fontSize:11,fontFamily:"monospace",color:T.yellow,fontWeight:700}}>{fmt.rub(sp)}</span></div>
                      <div style={{textAlign:"center",padding:"0 2px"}}><span style={{fontSize:12,fontFamily:"monospace",color:T.text,fontWeight:600}}>{bsk}</span></div>
                      <div style={{textAlign:"center",padding:"0 2px"}}><span style={{fontSize:11,fontFamily:"monospace",color:T.sub}}>{cpl>0?`${cpl.toFixed(0)}₽`:"—"}</span></div>
                      <div style={{textAlign:"center",padding:"0 2px"}}><span style={{fontSize:13,fontFamily:"monospace",color:ord>0?T.green:T.red,fontWeight:700}}>{ord}</span></div>
                      <div style={{textAlign:"center",padding:"0 2px"}}><span style={{fontSize:11,fontFamily:"monospace",
                        color:drr==null?T.sub:drr<=(targetDrr||20)?T.green:T.red,fontWeight:600}}>
                        {drr!=null?`${drr.toFixed(1)}%`:"—"}</span></div>
                      <div style={{textAlign:"center"}}>
                        <button onClick={()=>deleteFunnelKw(kw.keyword)} title="Удалить ключ"
                          style={{background:"transparent",border:"none",cursor:"pointer",padding:"3px",color:"rgba(248,113,113,0.6)",fontSize:15,lineHeight:1}}>🗑</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{textAlign:"center",fontSize:9,color:"rgba(255,255,255,0.2)",marginTop:6}}>← прокрутите →</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── По ключевым словам — полные метрики по кампании с местами размещения ───
function KeywordsMetricsBlock({data,targetDrr}){
  const [selCamp,setSelCamp]=useState("all");
  const [kwPeriod,setKwPeriod]=useState("7d");
  const [deletedKws,setDeletedKws]=useState(new Set());
  const PERIOD_BTNS2=[{id:"today",l:"Сегодня"},{id:"yesterday",l:"Вчера"},{id:"7d",l:"7 дней"}];
  const campKws=(selCamp==="all"?data.keywords:data.keywords.filter(k=>String(k.campaignId)===String(selCamp)))
    .filter(k=>!deletedKws.has(k.keyword));
  function deleteKw(kw){setDeletedKws(prev=>{const n=new Set(prev);n.add(kw);return n;});}
  const kwScale=kwPeriod==="today"?1/7:kwPeriod==="yesterday"?1/6:1;
  const pc=pos=>pos<=5?"#4ade80":pos<=10?"#86efac":pos<=20?"#fbbf24":"#f87171";
  // Placement colors & icons
  const PL={search:{icon:"🔍",label:"Поиск",col:"#818cf8"},shelves:{icon:"🗂",label:"Полки",col:"#60a5fa"},catalog:{icon:"📋",label:"Каталог",col:"#34d399"}};
  return(
    <div style={S.card}>
      <SectionTitle>📋 По ключевым словам — места размещения</SectionTitle>
      <CampaignSelect campaigns={data.campaigns} value={selCamp} onChange={setSelCamp}/>
      <div style={{display:"flex",gap:4,marginBottom:12}}>
        {PERIOD_BTNS2.map(p=>(
          <button key={p.id} onClick={()=>setKwPeriod(p.id)}
            style={{padding:"4px 10px",borderRadius:7,border:`1px solid ${kwPeriod===p.id?"rgba(124,58,237,0.5)":T.border}`,
              background:kwPeriod===p.id?"rgba(124,58,237,0.15)":"transparent",
              color:kwPeriod===p.id?"#c4b5fd":T.sub,fontSize:11,fontWeight:kwPeriod===p.id?700:400,cursor:"pointer"}}>
            {p.l}
          </button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {campKws.slice(0,10).map((kw,ki)=>{
          const kwS={...kw,
            impressions:Math.round(kw.impressions*kwScale),
            clicks:Math.max(1,Math.round(kw.clicks*kwScale)),
            baskets:Math.max(1,Math.round(kw.baskets*kwScale)),
            orders:Math.max(kwPeriod==="today"?0:1,Math.round(kw.orders*kwScale)),
            spend:Math.round(kw.spend*kwScale),
            revenue:Math.round(kw.revenue*kwScale),
          };
          const drr=kwS.revenue>0?kwS.spend/kwS.revenue*100:null;
          const ctrSt=getCtrSt(kw.ctr);
          const dS=kwS.posPrev-kwS.posSearch;
          const dP=Math.round((kwS.posPrev-kwS.posShelves)*0.8);
          const cpl=kwS.baskets>0?kwS.spend/kwS.baskets:null;
          const cpo=kwS.orders>0?kwS.spend/kwS.orders:null;
          const cro=kwS.baskets>0?kwS.orders/kwS.baskets*100:0;
          const cpm=kwS.impressions>0?kwS.spend/kwS.impressions*1000:0;
          // Симулируем данные по местам размещения (поиск ~60%, полки ~30%, каталог ~10%)
          const plData=[
            {key:"search",  icon:"🔍",label:"Поиск",   col:"#818cf8",imp:Math.round(kwS.impressions*0.60),cl:Math.round(kwS.clicks*0.62),sp:Math.round(kwS.spend*0.60),pos:kwS.posSearch,delta:dS},
            {key:"shelves", icon:"🗂",label:"Полки",   col:"#60a5fa",imp:Math.round(kwS.impressions*0.30),cl:Math.round(kwS.clicks*0.30),sp:Math.round(kwS.spend*0.30),pos:kwS.posShelves,delta:dP},
            ...(selCamp!=="all"||true?[{key:"catalog",icon:"📋",label:"Каталог",col:"#34d399",imp:Math.round(kwS.impressions*0.10),cl:Math.round(kwS.clicks*0.08),sp:Math.round(kwS.spend*0.10),pos:Math.round(kwS.posSearch*1.2),delta:0}]:[]),
          ];
          return(
            <div key={kw.keyword} style={{...S.card2,borderLeft:`3px solid ${kw.alert?"rgba(248,113,113,0.6)":drr&&targetDrr&&drr>targetDrr?"rgba(251,191,36,0.5)":"rgba(74,222,128,0.3)"}`}}>
              {/* Header row: keyword + drr + delete */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:6,flex:1,minWidth:0}}>
                  {kwS.alert&&<span style={{fontSize:10,flexShrink:0}}>⚠️</span>}
                  <span style={{fontSize:13,color:T.text,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{kwS.keyword}</span>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                  <DrrBadge drr={drr} target={targetDrr}/>
                  <button onClick={()=>deleteKw(kw.keyword)} title="Удалить ключ"
                    style={{background:"rgba(248,113,113,0.1)",color:T.red,border:"1px solid rgba(248,113,113,0.2)",borderRadius:7,padding:"4px 8px",fontSize:14,cursor:"pointer",lineHeight:1}}>🗑</button>
                </div>
              </div>
              {/* Summary metrics */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4,marginBottom:8}}>
                {[
                  {l:"Показы",   v:fmt.num(kwS.impressions),c:T.text},
                  {l:"CTR",      v:fmt.pct(kw.ctr),c:ctrSt.c,bg:ctrSt.bg},
                  {l:"Корзины",  v:kwS.baskets,c:T.text},
                  {l:"Заказы",   v:kwS.orders,c:kwS.orders>0?T.green:T.red},
                  {l:"ДРР",      v:drr?`${drr.toFixed(1)}%`:"—",c:drr&&targetDrr?drr>targetDrr?T.red:T.green:T.sub},
                ].map(m=>(
                  <div key={m.l} style={{textAlign:"center",background:m.bg||"rgba(255,255,255,0.02)",borderRadius:6,padding:"4px 2px"}}>
                    <div style={{fontSize:8,color:T.sub,marginBottom:1}}>{m.l}</div>
                    <div style={{fontSize:11,fontWeight:700,fontFamily:"monospace",color:m.c||T.text}}>{m.v}</div>
                  </div>
                ))}
              </div>
              {/* Placement rows */}
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {plData.map(pl=>{
                  const plCtr=pl.imp>0?pl.cl/pl.imp*100:0;
                  const plCpc=pl.cl>0?pl.sp/pl.cl:0;
                  const plCpm=pl.imp>0?pl.sp/pl.imp*1000:0;
                  const plShare=kwS.spend>0?pl.sp/kwS.spend*100:0;
                  return(
                    <div key={pl.key} style={{...S.card2,background:"rgba(255,255,255,0.015)",borderColor:"transparent",padding:"7px 10px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                        <div style={{display:"flex",alignItems:"center",gap:5}}>
                          <span style={{fontSize:16}}>{pl.icon}</span>
                          <span style={{fontSize:12,fontWeight:700,color:pl.col}}>{pl.label}</span>
                          <span style={{fontSize:10,fontFamily:"monospace",padding:"1px 5px",borderRadius:4,background:`${pc(pl.pos)}18`,color:pc(pl.pos),fontWeight:700}}>#{pl.pos}</span>
                          {pl.delta!==0&&<span style={{fontSize:10,fontWeight:700,color:pl.delta>0?T.green:T.red}}>{pl.delta>0?`↑${pl.delta}`:`↓${Math.abs(pl.delta)}`}</span>}
                        </div>
                        <div style={{fontSize:10,color:T.sub}}>{plShare.toFixed(0)}% бюджета</div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:3}}>
                        {[
                          {l:"Показы",v:fmt.num(pl.imp)},
                          {l:"CPM",   v:plCpm>0?`${plCpm.toFixed(0)}₽`:"—"},
                          {l:"Клики", v:pl.cl},
                          {l:"CTR",   v:`${plCtr.toFixed(2)}%`,c:plCtr>=1?T.green:plCtr>=0.5?T.text:T.red},
                          {l:"CPC",   v:plCpc>0?`${plCpc.toFixed(0)}₽`:"—"},
                        ].map(m=>(
                          <div key={m.l} style={{textAlign:"center"}}>
                            <div style={{fontSize:8,color:T.sub}}>{m.l}</div>
                            <div style={{fontSize:10,fontFamily:"monospace",fontWeight:600,color:m.c||T.sub}}>{m.v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {campKws.length===0&&<div style={{textAlign:"center",padding:20,color:T.sub,fontSize:12}}>Нет ключей для отображения</div>}
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
  const [selCamp,setSelCamp]=useState("all");
  const days=period==="today"?data.daily.slice(0,1):period==="yesterday"?data.daily.slice(1,2):data.daily;
  const campKws=selCamp==="all"?data.keywords:data.keywords.filter(k=>String(k.campaignId)===String(selCamp));
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
  const {spendScale:placScale,ordersScale:placOrdScale}=getCampScale(data.campaigns,selCamp);
  const placDays=scaleDays(days,placScale,placOrdScale);
  const totals=types.map(type=>{
    const rows=placDays.flatMap(d=>(d.sources||[]).filter(s=>s.type===type));
    return{type,
      spend:rows.reduce((s,r)=>s+r.spend,0),
      impressions:rows.reduce((s,r)=>s+(r.impressions||0),0),
      clicks:rows.reduce((s,r)=>s+(r.clicks||0),0),
      orders:rows.reduce((s,r)=>s+(r.orders||0),0),
    };
  }).filter(t=>t.impressions>0);
  const totalSpendAll=totals.reduce((s,t)=>s+t.spend,0);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={S.card}>
        <SectionTitle>Сводка по типам размещения</SectionTitle>
        <CampaignSelect campaigns={data.campaigns} value={selCamp} onChange={setSelCamp}/>
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

      {/* ── КЛЮЧИ — расширенная таблица ── */}
      <div style={S.card}>
        <SectionTitle>По ключевым словам — полные метрики</SectionTitle>
        <CampaignSelect campaigns={data.campaigns} value={selCamp} onChange={setSelCamp}/>
        <PeriodSwitch2 value={kwPeriod} onChange={setKwPeriod}/>
        {(()=>{
          // Масштабируем метрики ключей по выбранному периоду
          const kwScale=kwPeriod==="today"?1/7:kwPeriod==="yesterday"?1/6:1;
          return(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {campKws.map((kw,ki)=>{
            const kwS={...kw,
              impressions:Math.round(kw.impressions*kwScale),
              clicks:Math.max(1,Math.round(kw.clicks*kwScale)),
              baskets:Math.max(1,Math.round(kw.baskets*kwScale)),
              orders:Math.max(kwPeriod==="today"?0:1,Math.round(kw.orders*kwScale)),
              spend:Math.round(kw.spend*kwScale),
              revenue:Math.round(kw.revenue*kwScale),
            };
            const drr=kwS.revenue>0?kwS.spend/kwS.revenue*100:null;
            const ctrSt=getCtrSt(kw.ctr);
            const pc=pos=>pos<=5?"#4ade80":pos<=10?"#86efac":pos<=20?"#fbbf24":"#f87171";
            const dS=kwS.posPrev-kwS.posSearch;
            const dP=Math.round((kwS.posPrev-kwS.posShelves)*0.8);
            const cpl=kwS.baskets>0?kwS.spend/kwS.baskets:null;
            const cro=kwS.baskets>0?kwS.orders/kwS.baskets*100:0;
            const crf=kwS.impressions>0?kwS.baskets/kwS.impressions*100:0;
            // Мок динамики корзин: ±рандомно на основе ki
            const basketDiff=[2,-1,0,1,-2,3][ki%6];
            const basketYest=Math.max(1,kwS.baskets-(basketDiff));
            const basketPct=basketYest>0?basketDiff/basketYest*100:0;
            return(
              <div key={kw.keyword} style={{...S.card2,borderLeft:`3px solid ${kw.alert?"rgba(248,113,113,0.6)":drr&&targetDrr&&drr>targetDrr?"rgba(251,191,36,0.5)":"rgba(74,222,128,0.3)"}`}}>
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
                        <span style={{fontFamily:"monospace",fontWeight:700,fontSize:12,color:pc(kw.posSearch)}}>{kwS.posSearch}</span>
                        <span style={{fontSize:10,fontWeight:700,color:dS>0?T.green:dS<0?T.red:T.sub}}>{dS>0?`↑${dS}`:dS<0?`↓${Math.abs(dS)}`:"→"}</span>
                        <span style={{fontSize:9,color:T.sub}}>{kwS.bidSearch}₽</span>
                      </div>
                      {/* Полки */}
                      <div style={{display:"flex",alignItems:"center",gap:3,background:"rgba(59,130,246,0.1)",borderRadius:6,padding:"2px 7px"}}>
                        <span style={{fontSize:9,color:"#93c5fd"}}>🗂</span>
                        <span style={{fontFamily:"monospace",fontWeight:700,fontSize:12,color:pc(kw.posShelves)}}>{kwS.posShelves}</span>
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
                    {l:"Клики",v:kw.clicks,sub:""},
                    {l:"CTR",v:fmt.pct(kw.ctr),c:ctrSt.c,bg:ctrSt.bg},
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
                    {l:"Заказы",v:kw.orders,c:kw.orders>0?T.green:T.red},
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
  const [selCamp,setSelCamp]=useState("all");
  const {spendScale:diagScale,ordersScale:diagOrdScale}=getCampScale(data.campaigns,selCamp);
  const diagKws=selCamp==="all"?data.keywords:data.keywords.filter(k=>String(k.campaignId)===String(selCamp));
  const diagClusters=selCamp==="all"?data.clusters:data.clusters.filter(k=>String(k.campaignId)===String(selCamp));
  const rawDays=data.daily.filter(d=>d.drr>0);
  const days=scaleDays(rawDays,diagScale,diagOrdScale);
  const totalSpend=days.reduce((s,d)=>s+d.spend,0);
  const totalRevenue=days.reduce((s,d)=>s+d.revenue,0);
  const factDrr=totalRevenue>0?totalSpend/totalRevenue*100:null;
  const totalCtr=diagClusters.reduce((s,k)=>s+k.impressions,0)?diagClusters.reduce((s,k)=>s+k.clicks,0)/diagClusters.reduce((s,k)=>s+k.impressions,0)*100:0;
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
  const fallingKws=diagKws.filter(k=>k.posPrev-k.pos<-2);
  if(fallingKws.length>0)
    issues.push({level:"critical",icon:"🔴",title:`Позиции падают: ${fallingKws.length} ключей`,desc:fallingKws.map(k=>`«${k.keyword}» ${k.posPrev}→${k.pos}`).join(", "),rec:"Повысьте ставки CPM на эти ключевые слова."});
  const highDrrKws=diagKws.filter(k=>targetDrr&&k.drr>targetDrr*1.3);
  if(highDrrKws.length>0)
    issues.push({level:"warn",icon:"🟡",title:`${highDrrKws.length} ключей с высоким ДРР`,desc:highDrrKws.map(k=>`«${k.keyword}» ДРР ${k.drr}%`).join(", "),rec:"Рассмотрите снижение ставок или перевод в минус-слова."});
  const zeroKws=diagKws.filter(k=>k.orders===0&&k.spend>200);
  if(zeroKws.length>0)
    issues.push({level:"warn",icon:"🟡",title:`${zeroKws.length} ключей без заказов с расходом`,desc:zeroKws.map(k=>`«${k.keyword}» ${k.spend}₽`).join(", "),rec:"Добавьте в минус-слова или снизьте ставки."});

  // Рекомендации по ставкам — с текущей, рекомендованной, конкурентной и причиной
  const filtKwsForRec=diagKws;
  const bidRecs=filtKwsForRec.map(kw=>{
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

  // Управление ставками прямо из диагностики
  const [diagBids,setDiagBids]=useState(
    ()=>data.keywords.reduce((acc,k)=>({...acc,[k.keyword]:{search:k.bidSearch,shelves:k.bidShelves}}),{})
  );
  const [appliedBids,setAppliedBids]=useState(new Set());
  const [diagToast,setDiagToast]=useState("");
  function diagShowToast(msg){setDiagToast(msg);setTimeout(()=>setDiagToast(""),3000);}
  function applyDiagBid(keyword,search,shelves){
    setDiagBids(p=>({...p,[keyword]:{search,shelves}}));
    setAppliedBids(p=>{const n=new Set(p);n.add(keyword);return n;});
    diagShowToast(`✅ Ставки «${keyword}» обновлены`);
  }
  function applyRecommended(r){applyDiagBid(r.keyword,r.newSearch,r.newShelves);}

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

      {diagToast&&(
        <div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",zIndex:99,
          background:"rgba(74,222,128,0.95)",color:"#fff",fontWeight:700,fontSize:13,
          padding:"10px 20px",borderRadius:12,boxShadow:"0 4px 20px rgba(0,0,0,0.4)",
          whiteSpace:"nowrap",pointerEvents:"none"}}>
          {diagToast}
        </div>
      )}

      <div style={S.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <SectionTitle marginBottom={0}>📊 Рекомендации и управление ставками</SectionTitle>
          <CampaignSelect campaigns={data.campaigns} value={selCamp} onChange={setSelCamp}/>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {bidRecs.map((r,i)=>{
            const actionCol=r.action.startsWith("↑")?T.green:r.action.startsWith("↓")?T.red:T.sub;
            const curBid=diagBids[r.keyword]||{search:r.curSearch,shelves:r.curShelves};
            const isApplied=appliedBids.has(r.keyword);
            const searchChanged=curBid.search!==r.curSearch;
            const shelvesChanged=curBid.shelves!==r.curShelves;
            const hasChanges=searchChanged||shelvesChanged;
            return(
              <div key={i} style={{...S.card2,
                border:`1px solid ${isApplied?"rgba(74,222,128,0.3)":r.action.startsWith("↑")?"rgba(74,222,128,0.15)":r.action.startsWith("↓")?"rgba(248,113,113,0.15)":T.border}`,
                background:isApplied?"rgba(74,222,128,0.04)":T.card2}}>
                {/* Шапка */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:12,color:T.text,fontWeight:700}}>{r.keyword}</span>
                      {isApplied&&<span style={{fontSize:10,color:"#6ee7b7",background:"rgba(74,222,128,0.15)",padding:"1px 7px",borderRadius:8,fontWeight:600}}>✓ применено</span>}
                    </div>
                    <div style={{fontSize:11,color:T.sub,marginTop:2}}>💡 {r.reason}</div>
                  </div>
                  <div style={{display:"flex",gap:8,flexShrink:0,marginLeft:8}}>
                    {[{l:"Поз",v:r.pos},{l:"CTR",v:`${r.ctr}%`},{l:"ДРР",v:r.drr?`${r.drr.toFixed(0)}%`:"—"}].map(m=>(
                      <div key={m.l} style={{textAlign:"center"}}>
                        <div style={{fontSize:8,color:T.sub}}>{m.l}</div>
                        <div style={{fontSize:11,fontFamily:"monospace",fontWeight:600,color:T.text}}>{m.v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Рекомендация-плашка */}
                {r.action!=="→ держать"&&(
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                    background:r.action.startsWith("↑")?"rgba(74,222,128,0.06)":"rgba(248,113,113,0.06)",
                    border:`1px solid ${r.action.startsWith("↑")?"rgba(74,222,128,0.2)":"rgba(248,113,113,0.2)"}`,
                    borderRadius:8,padding:"6px 10px",marginBottom:8}}>
                    <span style={{fontSize:11,color:actionCol,fontWeight:600}}>{r.action} ставки</span>
                    <button onClick={()=>applyRecommended(r)}
                      style={{background:r.action.startsWith("↑")?"rgba(74,222,128,0.2)":"rgba(248,113,113,0.15)",
                        color:actionCol,border:`1px solid ${actionCol}40`,borderRadius:7,
                        padding:"4px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                      Применить рекомендацию
                    </button>
                  </div>
                )}

                {/* Поля ставок — редактируемые */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8}}>
                  {[
                    {label:"🔍 Поиск CPM",field:"search",rec:r.newSearch,comp:r.compSearch,colBg:"rgba(99,102,241,0.06)",colBorder:"rgba(99,102,241,0.2)",colText:"#a5b4fc"},
                    {label:"🗂 Полки CPM", field:"shelves",rec:r.newShelves,comp:r.compShelves,colBg:"rgba(59,130,246,0.06)",colBorder:"rgba(59,130,246,0.2)",colText:"#93c5fd"},
                  ].map(f=>{
                    const val=curBid[f.field];
                    const changed=val!==(f.field==="search"?r.curSearch:r.curShelves);
                    return(
                      <div key={f.field} style={{background:f.colBg,borderRadius:10,padding:"8px 10px",border:`1px solid ${f.colBorder}`}}>
                        <div style={{fontSize:10,color:f.colText,marginBottom:6,fontWeight:600}}>{f.label}</div>
                        {/* Было → Рекомендовано */}
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:T.sub,marginBottom:5}}>
                          <span>Сейчас: <b style={{color:T.text}}>{f.field==="search"?r.curSearch:r.curShelves} ₽</b></span>
                          <span>Рек: <b style={{color:actionCol}}>{f.rec} ₽</b></span>
                          <span>Конкурент: <b style={{color:f.colText}}>{f.comp} ₽</b></span>
                        </div>
                        {/* Инпут с кнопками */}
                        <div style={{display:"flex",alignItems:"center",gap:4,minWidth:0}}>
                          <button onClick={()=>setDiagBids(p=>({...p,[r.keyword]:{...p[r.keyword],[f.field]:Math.max(50,val-10)}}))}
                            style={{width:36,height:36,borderRadius:9,border:`1px solid ${T.border}`,background:"rgba(248,113,113,0.08)",color:T.red,fontSize:17,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>−</button>
                          <input type="number" value={val}
                            onChange={e=>setDiagBids(p=>({...p,[r.keyword]:{...p[r.keyword],[f.field]:e.target.value===""?0:+e.target.value}}))}
                            onBlur={e=>setDiagBids(p=>({...p,[r.keyword]:{...p[r.keyword],[f.field]:Math.max(50,Math.min(2000,+e.target.value||50))}}))}
                            style={{flex:1,background:changed?"rgba(251,191,36,0.08)":"rgba(255,255,255,0.04)",
                              border:`1px solid ${changed?"rgba(251,191,36,0.4)":T.border}`,
                              borderRadius:8,padding:"8px 4px",fontSize:14,fontFamily:"monospace",fontWeight:700,
                              color:changed?T.yellow:T.text,outline:"none",textAlign:"center",minWidth:0}}/>
                          <button onClick={()=>setDiagBids(p=>({...p,[r.keyword]:{...p[r.keyword],[f.field]:Math.min(2000,val+10)}}))}
                            style={{width:36,height:36,borderRadius:9,border:`1px solid ${T.border}`,background:"rgba(74,222,128,0.08)",color:T.green,fontSize:17,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>+</button>
                        </div>
                        {changed&&<div style={{fontSize:9,color:T.sub,textAlign:"center",marginTop:3}}>
                          было: {f.field==="search"?r.curSearch:r.curShelves} ₽
                        </div>}
                      </div>
                    );
                  })}
                </div>

                {/* Кнопка применить свои значения */}
                {hasChanges&&!isApplied&&(
                  <button onClick={()=>applyDiagBid(r.keyword,curBid.search,curBid.shelves)}
                    style={{marginTop:8,width:"100%",padding:"9px",borderRadius:10,border:"1px solid rgba(124,58,237,0.4)",
                      background:"rgba(124,58,237,0.15)",color:"#c4b5fd",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                    ✓ Применить изменения ставок
                  </button>
                )}
                {isApplied&&hasChanges&&(
                  <div style={{marginTop:8,textAlign:"center",fontSize:11,color:"#6ee7b7"}}>
                    ✅ Ставки сохранены и отправлены в кампанию
                  </div>
                )}
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
  const [selCamp,setSelCamp]=useState("all");
  // dates для header — из первой отфильтрованной записи (обновляется при смене кампании ниже)
  const pc=pos=>pos<=5?"#4ade80":pos<=10?"#86efac":pos<=20?"#fbbf24":"#f87171";
  const filtKws=selCamp==="all"?data.keywords:data.keywords.filter(k=>String(k.campaignId)===String(selCamp));
  const filtPos=selCamp==="all"?data.positions:data.positions.filter(k=>String(k.campaignId)===String(selCamp));
  const dates=(filtPos[0]||data.positions[0])?.dates||[];

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={S.card}>
        <SectionTitle>📍 Позиции по ключам с местами размещения</SectionTitle>
        <CampaignSelect campaigns={data.campaigns} value={selCamp} onChange={setSelCamp}/>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {filtKws.map(kw=>{
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
        <CampaignSelect campaigns={data.campaigns} value={selCamp} onChange={setSelCamp}/>
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
              {filtPos.map((kw,ki)=>{
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
  const [selCamp,setSelCamp]=useState("all");
  const [selected,setSelected]=useState(new Set());
  const [archived,setArchived]=useState(data.minusArchive);
  const [active,setActive]=useState(data.minusActive);
  // Релевантные — ключи удалённые из кампании, но помеченные как релевантные (можно вернуть)
  const [relevant,setRelevant]=useState([
    {id:101,campaignId:1,keyword:"кроссовки замшевые",impressions:1240,clicks:8,ctr:0.65,spend:312,orders:2,addedDaysAgo:4,reason:"no_orders",movedAt:"06.03.2026",note:"Мало заказов при минимальной ставке — повысить ставку"},
    {id:102,campaignId:1,keyword:"кроссовки белые женские",impressions:2100,clicks:18,ctr:0.86,spend:485,orders:4,addedDaysAgo:6,reason:"low_ctr",movedAt:"04.03.2026",note:"Была низкая ставка — сейчас подняли"},
    {id:103,campaignId:2,keyword:"джинсы женские зауженные",impressions:890,clicks:5,ctr:0.56,spend:271,orders:1,addedDaysAgo:3,reason:"no_orders",movedAt:"05.03.2026",note:"Ключ целевой — вернуть при ставке 200₽+"},
  ]);
  const REASON_LABELS={low_ctr:"CTR ниже нормы",no_orders:"Нет заказов",high_drr:"Высокий ДРР",manual:"Ручное",restored:"Восстановлен"};
  const filtActive=selCamp==="all"?active:active.filter(k=>String(k.campaignId)===String(selCamp));
  const filtArchived=selCamp==="all"?archived:archived.filter(k=>String(k.campaignId)===String(selCamp));
  const filtRelevant=selCamp==="all"?relevant:relevant.filter(k=>String(k.campaignId)===String(selCamp));

  const [toastMsg,setToastMsg]=useState("");
  function showToast(msg){setToastMsg(msg);setTimeout(()=>setToastMsg(""),3000);}

  function deleteSelected(){
    const toArchive=active.filter(k=>selected.has(k.id)).map(k=>({...k,deletedAt:new Date().toLocaleDateString("ru-RU"),deletedBy:"ручное",reason:"Ручное удаление"}));
    setArchived(prev=>[...toArchive,...prev]);setActive(prev=>prev.filter(k=>!selected.has(k.id)));setSelected(new Set());
  }
  function moveToRelevant(id){
    const item=active.find(k=>k.id===id);if(!item)return;
    setRelevant(prev=>[{...item,movedAt:new Date().toLocaleDateString("ru-RU"),note:"Релевантный — временно отключён"},...prev]);
    setActive(prev=>prev.filter(k=>k.id!==id));
  }
  function restoreFromRelevant(id){
    const item=relevant.find(k=>k.id===id);if(!item)return;
    setActive(prev=>[{...item,addedDaysAgo:0,reason:"restored"},...prev]);
    setRelevant(prev=>prev.filter(k=>k.id!==id));
    showToast(`✅ «${item.keyword}» возвращён в кампанию`);
  }
  function moveArchivedToRelevant(id){
    const item=archived.find(k=>k.id===id);if(!item)return;
    setRelevant(prev=>[{...item,movedAt:new Date().toLocaleDateString("ru-RU"),note:"Перемещён из архива"},...prev]);
    setArchived(prev=>prev.filter(k=>k.id!==id));
  }
  function restore(id){
    const item=archived.find(k=>k.id===id);if(!item)return;
    setActive(prev=>[{...item,addedDaysAgo:0,reason:"restored"},...prev]);setArchived(prev=>prev.filter(k=>k.id!==id));
  }
  function autoDelete(){
    const cands=filtActive.filter(k=>k.ctr<0.5||k.orders===0);
    const toArchive=cands.map(k=>({...k,deletedAt:new Date().toLocaleDateString("ru-RU"),deletedBy:"авто",reason:k.ctr<0.5?"CTR < 0.5%":"0 заказов при расходе > 200₽"}));
    setArchived(prev=>[...toArchive,...prev]);setActive(prev=>prev.filter(k=>!cands.find(c=>c.id===k.id)));
  }

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {toastMsg&&(
        <div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",zIndex:99,
          background:"rgba(16,185,129,0.95)",color:"#fff",fontWeight:700,fontSize:13,
          padding:"10px 20px",borderRadius:12,boxShadow:"0 4px 20px rgba(0,0,0,0.4)",
          whiteSpace:"nowrap",pointerEvents:"none"}}>
          {toastMsg}
        </div>
      )}
      <div style={S.card}>
        <SectionTitle>Режим работы</SectionTitle>
        <CampaignSelect campaigns={data.campaigns} value={selCamp} onChange={setSelCamp}/>
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
              🤖 Применить авто-минусовку ({filtActive.filter(k=>k.ctr<0.5||k.orders===0).length} запросов)
            </button>
          </div>
        )}
      </div>
      <div style={{display:"flex",gap:4,marginBottom:12,overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:2}}>
        {[
          {id:"active",  label:`Нерелевантные (${filtActive.length})`},
          {id:"relevant",label:`Релевантные (${filtRelevant.length})`},
          {id:"archive", label:`Архив (${filtArchived.length})`},
        ].map(t=>(
          <button key={t.id} onClick={()=>setSubTab(t.id)}
            style={{padding:"7px 11px",borderRadius:9,border:`1px solid ${subTab===t.id?"rgba(124,58,237,0.5)":"rgba(255,255,255,0.08)"}`,
              whiteSpace:"nowrap",flexShrink:0,cursor:"pointer",fontSize:12,fontWeight:subTab===t.id?700:400,
              background:subTab===t.id?"rgba(124,58,237,0.2)":"rgba(255,255,255,0.04)",
              color:subTab===t.id?"#c4b5fd":T.sub}}>
            {t.label}
          </button>
        ))}
      </div>

      {subTab==="active"&&(
        <div style={S.card}>
          {mode==="manual"&&selected.size>0&&(
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:10,padding:"8px 12px"}}>
              <span style={{fontSize:12,color:T.red}}>Выбрано: {selected.size}</span>
              <button onClick={deleteSelected} style={{background:"#dc2626",color:"#fff",border:"none",borderRadius:8,padding:"5px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>Удалить выбранные</button>
            </div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {filtActive.map(kw=>{
              const posCol=!kw.pos?T.sub:kw.pos<=20?"#4ade80":kw.pos<=50?"#fbbf24":kw.pos<=100?"#fb923c":"#f87171";
              return(
              <div key={kw.id} style={{...S.card2,border:`1px solid ${selected.has(kw.id)?"rgba(248,113,113,0.4)":T.border}`,background:selected.has(kw.id)?"rgba(248,113,113,0.06)":T.card2}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  {mode==="manual"&&<input type="checkbox" checked={selected.has(kw.id)} onChange={()=>setSelected(prev=>{const n=new Set(prev);n.has(kw.id)?n.delete(kw.id):n.add(kw.id);return n;})} style={{marginTop:3,accentColor:"#dc2626",flexShrink:0}}/>}
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{fontSize:13,color:T.text,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{kw.keyword}</div>
                          {kw.pos&&(
                            <span style={{fontSize:11,fontFamily:"monospace",fontWeight:700,color:posCol,
                              background:`${posCol}18`,border:`1px solid ${posCol}30`,borderRadius:6,
                              padding:"1px 7px",flexShrink:0}}>#{kw.pos}</span>
                          )}
                        </div>
                        <div style={{fontSize:11,color:T.sub,marginTop:2}}>Причина: {REASON_LABELS[kw.reason]||kw.reason} · {kw.addedDaysAgo}д. назад</div>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5,marginBottom:8}}>
                      {[{l:"Показы",v:fmt.num(kw.impressions)},{l:"Клики",v:kw.clicks},{l:"CTR",v:fmt.pct(kw.ctr),c:kw.ctr<0.5?T.red:T.text},{l:"Расход",v:fmt.rub(kw.spend),c:T.yellow},{l:"Заказы",v:kw.orders,c:kw.orders===0?T.red:T.green}].map(m=>(
                        <div key={m.l} style={{textAlign:"center",background:"rgba(255,255,255,0.02)",borderRadius:6,padding:"4px 2px"}}>
                          <div style={{fontSize:8,color:T.sub}}>{m.l}</div>
                          <div style={{fontSize:12,fontFamily:"monospace",fontWeight:600,color:m.c||T.text}}>{m.v}</div>
                        </div>
                      ))}
                    </div>
                    <button onClick={()=>{
                        const toArchive={...kw,deletedAt:new Date().toLocaleDateString("ru-RU"),deletedBy:"ручное",reason:"Нерелевантный запрос"};
                        setArchived(prev=>[toArchive,...prev]);
                        setActive(prev=>prev.filter(k=>k.id!==kw.id));
                      }}
                      style={{width:"100%",padding:"8px",borderRadius:8,background:"rgba(248,113,113,0.08)",
                        color:T.red,border:"1px solid rgba(248,113,113,0.2)",fontSize:12,
                        fontWeight:600,cursor:"pointer"}}>🗑 Удалить в архив</button>
                  </div>
                </div>
              </div>
            );})}
            {filtActive.length===0&&<div style={{textAlign:"center",padding:24,color:T.sub,fontSize:13}}>✅ Нет нерелевантных запросов</div>}
          </div>
        </div>
      )}

      {subTab==="relevant"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{...S.card,background:"rgba(74,222,128,0.04)",borderColor:"rgba(74,222,128,0.15)",padding:"10px 14px"}}>
            <div style={{fontSize:12,fontWeight:600,color:"#6ee7b7",marginBottom:3}}>✅ Релевантные ключи</div>
            <div style={{fontSize:11,color:T.sub,lineHeight:1.6}}>
              Целевые ключи, временно отключённые из кампании. Например: ставка была недостаточна — подняли, теперь можно вернуть и отследить динамику.
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {filtRelevant.map(kw=>{
              const cpo=kw.orders>0?kw.spend/kw.orders:null;
              return(
                <div key={kw.id} style={{...S.card2,borderColor:"rgba(74,222,128,0.25)",background:"rgba(74,222,128,0.04)",borderLeft:"3px solid rgba(74,222,128,0.5)"}}>
                  {/* Шапка */}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,color:T.text,fontWeight:700}}>{kw.keyword}</div>
                      <div style={{display:"flex",gap:6,marginTop:3,flexWrap:"wrap"}}>
                        <span style={{fontSize:10,color:"#6ee7b7",background:"rgba(74,222,128,0.1)",padding:"1px 7px",borderRadius:10,fontWeight:600}}>✅ Релевантный</span>
                        <span style={{fontSize:10,color:T.sub}}>отложен {kw.movedAt}</span>
                      </div>
                    </div>
                    {kw.orders>0&&<span style={{fontSize:10,fontFamily:"monospace",color:T.green,fontWeight:700,background:"rgba(74,222,128,0.1)",padding:"2px 7px",borderRadius:8,flexShrink:0}}>{kw.orders} зак.</span>}
                  </div>
                  {/* Причина + заметка */}
                  <div style={{...S.card2,background:"rgba(74,222,128,0.06)",borderColor:"rgba(74,222,128,0.15)",padding:"6px 10px",marginBottom:8}}>
                    <div style={{fontSize:10,color:"#86efac",fontStyle:"italic"}}>💬 {kw.note}</div>
                  </div>
                  {/* Метрики */}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5,marginBottom:10}}>
                    {[
                      {l:"Показы",v:fmt.num(kw.impressions)},
                      {l:"Клики",v:kw.clicks},
                      {l:"CTR",v:fmt.pct(kw.ctr),c:kw.ctr>=0.8?T.green:kw.ctr>=0.5?T.yellow:T.red},
                      {l:"Расход",v:fmt.rub(kw.spend),c:T.yellow},
                      {l:cpo?"CPO":"Заказы",v:cpo?fmt.rub(cpo):(kw.orders===0?"—":kw.orders),c:kw.orders===0?T.sub:T.green},
                    ].map(m=>(
                      <div key={m.l} style={{textAlign:"center",background:"rgba(255,255,255,0.02)",borderRadius:6,padding:"4px 2px"}}>
                        <div style={{fontSize:8,color:T.sub}}>{m.l}</div>
                        <div style={{fontSize:11,fontFamily:"monospace",fontWeight:600,color:m.c||T.text}}>{m.v}</div>
                      </div>
                    ))}
                  </div>
                  {/* Кнопки */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    <button onClick={()=>restoreFromRelevant(kw.id)}
                      style={{padding:"9px 6px",borderRadius:10,border:"1px solid rgba(74,222,128,0.4)",
                        background:"rgba(74,222,128,0.15)",color:"#6ee7b7",fontSize:12,fontWeight:700,cursor:"pointer",
                        display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                      ↩ Вернуть в кампанию
                    </button>
                    <button onClick={()=>{setArchived(prev=>[{...kw,deletedAt:new Date().toLocaleDateString("ru-RU"),deletedBy:"ручное",reason:"Из релевантных"},...prev]);setRelevant(prev=>prev.filter(k=>k.id!==kw.id));}}
                      style={{padding:"9px 6px",borderRadius:10,border:`1px solid ${T.border}`,
                        background:"transparent",color:T.sub,fontSize:11,cursor:"pointer",
                        display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                      🗑 В архив
                    </button>
                  </div>
                </div>
              );
            })}
            {filtRelevant.length===0&&(
              <div style={{...S.card,textAlign:"center",padding:"32px 20px"}}>
                <div style={{fontSize:28,marginBottom:8}}>📋</div>
                <div style={{fontSize:13,color:T.text,fontWeight:600,marginBottom:4}}>Нет релевантных ключей</div>
                <div style={{fontSize:11,color:T.sub}}>Удалённые ключи попадают в Архив</div>
              </div>
            )}
          </div>
        </div>
      )}

      {subTab==="archive"&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{...S.card,padding:"10px 14px",background:"rgba(248,113,113,0.04)",borderColor:"rgba(248,113,113,0.15)"}}>
            <div style={{fontSize:12,fontWeight:600,color:"#fca5a5",marginBottom:2}}>📦 Архив удалённых ключей</div>
            <div style={{fontSize:11,color:T.sub}}>Здесь хранятся удалённые запросы. Видно на какой позиции был ключ — можно вернуть или перенести в релевантные.</div>
          </div>
          {filtArchived.map(kw=>{
            const posCol=!kw.pos?T.sub:kw.pos<=20?"#4ade80":kw.pos<=50?"#fbbf24":kw.pos<=100?"#fb923c":"#f87171";
            const posLabel=!kw.pos?"—":kw.pos<=20?"топ":kw.pos<=50?"средн.":kw.pos<=100?"низкая":"очень низкая";
            return(
              <div key={kw.id} style={{...S.card2,borderLeft:`3px solid rgba(248,113,113,0.3)`}}>
                {/* Шапка */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,color:T.text,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{kw.keyword}</div>
                    <div style={{display:"flex",gap:6,marginTop:3,flexWrap:"wrap",alignItems:"center"}}>
                      <span style={{fontSize:10,color:T.sub}}>удалён {kw.deletedAt}</span>
                      <span style={{fontSize:9,color:"rgba(255,255,255,0.2)"}}>·</span>
                      <span style={{fontSize:10,color:kw.deletedBy==="авто"?"#93c5fd":"#c4b5fd"}}>{kw.deletedBy==="авто"?"🤖 авто":"✋ ручное"}</span>
                      <span style={{fontSize:9,color:"rgba(255,255,255,0.2)"}}>·</span>
                      <span style={{fontSize:10,color:T.sub}}>{kw.reason}</span>
                    </div>
                  </div>
                  {/* Позиция на момент удаления */}
                  {kw.pos&&(
                    <div style={{textAlign:"center",flexShrink:0,marginLeft:10,background:`${posCol}14`,border:`1px solid ${posCol}30`,borderRadius:10,padding:"5px 10px"}}>
                      <div style={{fontSize:8,color:T.sub,marginBottom:1}}>Позиция при удалении</div>
                      <div style={{fontSize:20,fontWeight:700,fontFamily:"monospace",color:posCol,lineHeight:1}}>{kw.pos}</div>
                      <div style={{fontSize:9,color:posCol,marginTop:1}}>{posLabel}</div>
                    </div>
                  )}
                </div>
                {/* Метрики */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4,marginBottom:10}}>
                  {[
                    {l:"Показы",v:fmt.num(kw.impressions)},
                    {l:"Клики",v:kw.clicks||0},
                    {l:"CTR",v:fmt.pct(kw.ctr),c:kw.ctr<0.5?T.red:kw.ctr<0.8?T.yellow:T.green},
                    {l:"Расход",v:fmt.rub(kw.spend),c:T.yellow},
                    {l:"Заказы",v:kw.orders||0,c:kw.orders>0?T.green:T.sub},
                  ].map(m=>(
                    <div key={m.l} style={{textAlign:"center",background:"rgba(255,255,255,0.02)",borderRadius:6,padding:"4px 2px"}}>
                      <div style={{fontSize:8,color:T.sub}}>{m.l}</div>
                      <div style={{fontSize:11,fontFamily:"monospace",fontWeight:600,color:m.c||T.text}}>{m.v}</div>
                    </div>
                  ))}
                </div>
                {/* Кнопки */}
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>restore(kw.id)}
                    style={{flex:1,padding:"9px 6px",borderRadius:9,border:"1px solid rgba(74,222,128,0.35)",
                      background:"rgba(74,222,128,0.1)",color:"#6ee7b7",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                    ↩ Вернуть в кампанию
                  </button>
                </div>
              </div>
            );
          })}
          {filtArchived.length===0&&(
            <div style={{...S.card,textAlign:"center",padding:"32px 20px"}}>
              <div style={{fontSize:28,marginBottom:8}}>📦</div>
              <div style={{fontSize:13,color:T.text,fontWeight:600,marginBottom:4}}>Архив пуст</div>
              <div style={{fontSize:11,color:T.sub}}>Удалённые ключи будут отображаться здесь</div>
            </div>
          )}
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

  const employees=[
    {id:1,name:"Анна Иванова",   tgUsername:"anna_ivanova",  tgId:"123456789", role:"Менеджер", access:["wb","ozon"]},
    {id:2,name:"Дмитрий Петров", tgUsername:"dmitry_petrov", tgId:"987654321", role:"Аналитик", access:["wb"]},
  ];

  const inp={width:"100%",background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 12px",fontSize:13,color:T.text,outline:"none",boxSizing:"border-box"};
  const ROLE_COLORS={"Администратор":"#f59e0b","Менеджер":"#a78bfa","Аналитик":"#38bdf8","Только просмотр":"#8892a4"};

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12,maxWidth:520}}>

      {/* Как работает доступ */}
      <div style={{...S.card,background:"rgba(167,139,250,0.06)",borderColor:"rgba(167,139,250,0.2)"}}>
        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
          <span style={{fontSize:22}}>🔐</span>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:4}}>Доступ по Telegram ID</div>
            <div style={{fontSize:11,color:T.sub,lineHeight:1.8}}>
              Приложение открывается только у приглашённых пользователей. Добавление и удаление сотрудников — через бота.
            </div>
            <div style={{marginTop:10,display:"inline-flex",alignItems:"center",gap:6,background:"rgba(167,139,250,0.12)",border:"1px solid rgba(167,139,250,0.3)",borderRadius:8,padding:"6px 12px"}}>
              <span style={{fontSize:14}}>🤖</span>
              <span style={{fontSize:12,color:"#c4b5fd",fontWeight:600}}>Управление через бота → /adduser</span>
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

      {/* Сотрудники — только просмотр */}
      <div style={S.card}>
        <div style={{marginBottom:14}}>
          <SectionTitle marginBottom={2}>👥 Сотрудники с доступом</SectionTitle>
          <div style={{fontSize:11,color:T.sub}}>{employees.length} пользователя · добавление через бота</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {employees.map(e=>{
            const isCurrentUser=e.tgId===currentUserTgId;
            return(
              <div key={e.id} style={{...S.card2,border:`1px solid ${isCurrentUser?"rgba(167,139,250,0.3)":T.border}`,background:isCurrentUser?"rgba(167,139,250,0.05)":T.card2}}>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{width:38,height:38,borderRadius:"50%",background:`linear-gradient(135deg,${T.wb},${T.ozon})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:"#fff",flexShrink:0}}>
                    {e.name[0]}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                      <span style={{fontSize:13,color:T.text,fontWeight:600}}>{e.name}</span>
                      {isCurrentUser&&<span style={{fontSize:9,color:"#a78bfa",background:"rgba(167,139,250,0.15)",padding:"1px 6px",borderRadius:10}}>это вы</span>}
                    </div>
                    <div style={{fontSize:11,color:"#a78bfa",marginTop:1}}>
                      {e.tgUsername?"@"+e.tgUsername+" · ":""}
                      <span style={{fontFamily:"monospace",fontSize:10,color:T.sub}}>ID: {e.tgId}</span>
                    </div>
                    <div style={{display:"flex",gap:5,marginTop:6,flexWrap:"wrap"}}>
                      <span style={{fontSize:10,color:ROLE_COLORS[e.role]||"#a78bfa",background:`${ROLE_COLORS[e.role]||"#a78bfa"}15`,padding:"2px 8px",borderRadius:10,border:`1px solid ${ROLE_COLORS[e.role]||"#a78bfa"}30`}}>{e.role}</span>
                      {e.access.map(p=>(
                        <span key={p} style={{fontSize:10,color:"#fff",background:p==="wb"?T.wb:T.ozon,padding:"2px 8px",borderRadius:10}}>{p.toUpperCase()}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{marginTop:12,padding:"10px 14px",background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border}`,borderRadius:10,fontSize:11,color:T.sub,textAlign:"center"}}>
          Чтобы добавить или удалить сотрудника — напишите боту команду <span style={{color:"#a78bfa",fontFamily:"monospace"}}>/adduser</span> или <span style={{color:T.red,fontFamily:"monospace"}}>/removeuser</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// УПРАВЛЕНИЕ СТАВКАМИ
// ═══════════════════════════════════════════════════════════════════════════════
function TabBids({data,targetDrr,platform}){
  const [mode,setMode]=useState("smart");
  const MODES=[
    {id:"smart",       icon:"🤖", label:"Авто"},
    {id:"strategy",    icon:"⚡", label:"Стратегии"},
    {id:"autostrategy",icon:"🎯", label:"Авто-план"},
  ];
  const inp=(extra={})=>({width:"100%",background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:"9px 12px",fontSize:13,color:T.text,outline:"none",boxSizing:"border-box",...extra});
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <BidsCabinetBalance platform={platform}/>
      <div style={{...S.card,padding:8}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
          {MODES.map(m=>(
            <button key={m.id} onClick={()=>setMode(m.id)}
              style={{padding:"10px 4px",borderRadius:10,border:`1px solid ${mode===m.id?(m.id==="autostrategy"?"rgba(16,185,129,0.5)":"rgba(124,58,237,0.5)"):T.border}`,
                background:mode===m.id?(m.id==="autostrategy"?"rgba(16,185,129,0.15)":"rgba(124,58,237,0.15)"):"transparent",
                color:mode===m.id?(m.id==="autostrategy"?"#6ee7b7":"#c4b5fd"):T.sub,fontSize:11,fontWeight:mode===m.id?700:400,cursor:"pointer",
                display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <span style={{fontSize:18}}>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>
      {mode==="smart"        &&<SmartBidsTab       data={data} targetDrr={targetDrr} inp={inp}/>}
      {mode==="strategy"     &&<StrategyTab         data={data} inp={inp}/>}
      {mode==="autostrategy" &&<AutoStrategyTab     data={data} targetDrr={targetDrr} inp={inp}/>}
    </div>
  );
}

// ─── АВТО-УМНОЕ управление ────────────────────────────────────────────────────
function SmartBidsTab({data,targetDrr,inp}){
  const [selCamp,setSelCamp]=useState("all");
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
      <CampaignSelect campaigns={data.campaigns} value={selCamp} onChange={setSelCamp}/>
      {data.campaigns.filter(c=>selCamp==="all"||String(c.id)===String(selCamp)).map(c=>{
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
  const [selCamp,setSelCamp]=useState("all");
  const filtCampaigns=selCamp==="all"?data.campaigns:data.campaigns.filter(c=>String(c.id)===String(selCamp));
  const [bids,setBids]=useState(
    data.keywords.reduce((acc,k)=>({...acc,[k.keyword]:{search:k.bidSearch,shelves:k.bidShelves,type:"CPM"}}),{})
  );
  const [selected,setSelected]=useState(new Set());
  const [massValue,setMassValue]=useState("");
  const [massType,setMassType]=useState("set"); // set | add | pct
  const [history,setHistory]=useState([]);
  const [copyFrom,setCopyFrom]=useState("");

  function applyBid(kw,field,val){
    // Allow free typing — only store raw value, clamp on blur via applyBidFinal
    const raw=+val;
    if(val===""||val==="-") return; // ignore empty/partial input
    setBids(p=>({...p,[kw]:{...p[kw],[field]:raw}}));
  }
  function applyBidFinal(kw,field,val){
    const v=Math.max(50,Math.min(2000,+val||50));
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
  function selectAll(){setSelected(p=>p.size===filtKwBids.length?new Set():new Set(filtKwBids.map(k=>k.keyword)));}

  const filtKwBids=selCamp==="all"?data.keywords:data.keywords.filter(k=>String(k.campaignId)===String(selCamp));

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <CampaignSelect campaigns={data.campaigns} value={selCamp} onChange={c=>{setSelCamp(c);setSelected(new Set());}}/>
      {/* Массовое изменение */}
      {selected.size>0&&(
        <div style={{...S.card,background:"rgba(124,58,237,0.06)",borderColor:"rgba(124,58,237,0.3)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"#c4b5fd",marginBottom:10}}>
            ✏️ Массовое изменение — выбрано {selected.size} ключей
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-end"}}>
            <div style={{flex:1,minWidth:120}}>
              <div style={{fontSize:10,color:T.sub,marginBottom:4}}>Тип изменения</div>
              <select value={massType} onChange={e=>setMassType(e.target.value)} style={{background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:"9px 12px",fontSize:13,color:T.text,outline:"none",boxSizing:"border-box",width:"100%"}}>
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
            {selected.size===filtKwBids.length?"Снять всё":"Выбрать всё"}
          </button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {filtKwBids.map(kw=>{
            const b=bids[kw.keyword]||{search:kw.bidSearch,shelves:kw.bidShelves,type:"CPM"};
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
                    {/* Строка 1: ключ + позиция + CTR */}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                      <div style={{fontSize:12,color:T.text,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1,minWidth:0}}>{kw.keyword}</div>
                      <div style={{display:"flex",gap:10,flexShrink:0,marginLeft:8}}>
                        <div style={{textAlign:"center"}}>
                          <div style={{fontSize:8,color:T.sub}}>Позиция</div>
                          <div style={{fontSize:16,fontWeight:700,fontFamily:"monospace",color:kw.pos<=5?T.green:kw.pos<=15?T.yellow:T.red,lineHeight:1}}>{kw.pos}</div>
                        </div>
                        <div style={{textAlign:"center"}}>
                          <div style={{fontSize:8,color:T.sub}}>CTR</div>
                          <div style={{fontSize:12,fontFamily:"monospace",color:T.text,fontWeight:600,lineHeight:1.2}}>{kw.ctr}%</div>
                        </div>
                      </div>
                    </div>
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
                    {/* Ставки */}
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:8}}>
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
                                style={{width:34,height:34,borderRadius:8,border:`1px solid ${T.border}`,background:"rgba(248,113,113,0.08)",color:T.red,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>−</button>
                              <input type="number" value={b[field.f]}
                                onChange={e=>applyBid(kw.keyword,field.f,e.target.value)}
                                onBlur={e=>applyBidFinal(kw.keyword,field.f,e.target.value)}
                                style={{flex:1,background:changed?"rgba(251,191,36,0.08)":"rgba(255,255,255,0.04)",border:`1px solid ${changed?"rgba(251,191,36,0.3)":T.border}`,borderRadius:8,padding:"8px 4px",fontSize:14,color:changed?T.yellow:T.text,outline:"none",textAlign:"center",fontFamily:"monospace",fontWeight:700,minWidth:0}}/>
                              <button onClick={()=>applyBid(kw.keyword,field.f,b[field.f]+10)}
                                style={{width:34,height:34,borderRadius:8,border:`1px solid ${T.border}`,background:"rgba(74,222,128,0.08)",color:T.green,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>+</button>
                            </div>
                            {changed&&<div style={{fontSize:9,color:T.sub,textAlign:"center",marginTop:2}}>было: {field.orig} ₽</div>}
                          </div>
                        );
                      })}
                    </div>
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
  const [selCamp,setSelCamp]=useState("all");
  const [campTab,setCampTab]=useState({}); // per-camp inner tab: strategy | bids | stats | topup
  const getCampTab=(id)=>campTab[id]||"strategy";

  // ── Стратегии (расписание, бюджет, пик) ──────────────────────────────────
  const [strategies,setStrategies]=useState(
    data.campaigns.reduce((acc,c)=>({...acc,[c.id]:{
      scheduleEnabled:false, scheduleStart:"09:00", scheduleEnd:"23:00", scheduleDays:[1,2,3,4,5],
      bidType:"CPM",
      peakHours:false, peakStart:"11:00", peakEnd:"14:00", peakBidBoost:20,
    }}),{})
  );
  const DAYS=["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
  function upd(id,key,val){setStrategies(p=>({...p,[id]:{...p[id],[key]:val}}));}
  function toggleDay(id,d){const days=strategies[id].scheduleDays;upd(id,"scheduleDays",days.includes(d)?days.filter(x=>x!==d):[...days,d].sort());}

  // ── Ставки по ключам (перенесены из ManualBidsTab) ───────────────────────
  const [bids,setBids]=useState(
    data.keywords.reduce((acc,k)=>({...acc,[k.keyword]:{search:k.bidSearch,shelves:k.bidShelves}}),{})
  );
  const [bidHistory,setBidHistory]=useState([]);
  function setBid(kw,field,val){setBids(p=>({...p,[kw]:{...p[kw],[field]:val}}));}
  function setBidFinal(kw,field,val){
    const v=Math.max(50,Math.min(2000,+val||50));
    setBids(p=>({...p,[kw]:{...p[kw],[field]:v}}));
    setBidHistory(p=>[{time:new Date().toLocaleTimeString("ru",{hour:"2-digit",minute:"2-digit"}),kw,field,from:bids[kw][field],to:v},...p.slice(0,9)]);
  }

  // ── Автопополнение кампании ──────────────────────────────────────────────
  const [topups,setTopups]=useState(
    data.campaigns.reduce((acc,c)=>({...acc,[c.id]:{enabled:false,amount:1000,timesPerDay:1}}),{})
  );
  function updTopup(id,key,val){setTopups(p=>({...p,[id]:{...p[id],[key]:val}}));}

  // ── Демо-статистика за 7 дней ────────────────────────────────────────────
  const DAYS7=["03.03","04.03","05.03","06.03","07.03","08.03","09.03"];
  function genStats(campId){
    const base=data.campaigns.find(c=>c.id===campId)||{};
    return DAYS7.map((d,i)=>{
      const noise=()=>0.85+Math.random()*0.3;
      const imp=Math.round((base.impressions||8000)/7*noise());
      const cpm=Math.round((base.cpm||180)*noise());
      const clicks=Math.round(imp*((base.ctr||0.8)/100)*noise());
      const ctr=+(clicks/imp*100).toFixed(2);
      const spend=Math.round(imp/1000*cpm);
      const cpc=clicks>0?+(spend/clicks).toFixed(0):0;
      const baskets=Math.round(clicks*0.12*noise());
      const cpl=baskets>0?+(spend/baskets).toFixed(0):0;
      const orders=Math.round(baskets*0.35*noise());
      const drr=base.revenue?+(spend/(base.revenue/7)*100).toFixed(1):0;
      const pos=Math.round(5*noise());
      return {d,imp,cpm,clicks,ctr,spend,cpc,baskets,cpl,orders,drr,pos};
    });
  }
  const [statsCache]=useState(()=>data.campaigns.reduce((acc,c)=>({...acc,[c.id]:genStats(c.id)}),{}));

  // ── Стратегия ставки: авторасчёт ─────────────────────────────────────────
  function getStratBid(camp,s){
    const kws=data.keywords.filter(k=>String(k.campaignId)===String(camp.id));
    const avgBid=kws.length>0?Math.round(kws.reduce((sum,k)=>sum+k.bidSearch,0)/kws.length):200;
    const peakBoost=s.peakHours?Math.round(avgBid*s.peakBidBoost/100):0;
    const recommended=avgBid+peakBoost;
    const reasons=[];
    if(s.peakHours) reasons.push(`+${s.peakBidBoost}% в пиковые часы (${s.peakStart}–${s.peakEnd})`);
    if(s.scheduleEnabled) reasons.push(`работает ${s.scheduleStart}–${s.scheduleEnd}`);
    if(camp.drr>20) reasons.push("ДРР выше нормы → ставка консервативная");
    else reasons.push("ДРР в норме → ставка конкурентная");
    return {recommended, reasons, avgBid};
  }
  const [bidOverrides,setBidOverrides]=useState({});
  function getEffBid(campId,recommended){
    return bidOverrides[campId]!==undefined?bidOverrides[campId]:recommended;
  }

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{...S.card,background:"rgba(251,191,36,0.04)",borderColor:"rgba(251,191,36,0.15)"}}>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontSize:22}}>⚡</span>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:T.text}}>Стратегии + Ставки</div>
            <div style={{fontSize:11,color:T.sub,marginTop:2}}>Управляйте ставками и стратегиями по каждой кампании</div>
          </div>
        </div>
      </div>

      <CampaignSelect campaigns={data.campaigns} value={selCamp} onChange={setSelCamp}/>

      {data.campaigns.filter(c=>selCamp==="all"||String(c.id)===String(selCamp)).map(c=>{
        const s=strategies[c.id];
        const t=topups[c.id];
        const tab=getCampTab(c.id);
        const {recommended,reasons,avgBid}=getStratBid(c,s);
        const effBid=getEffBid(c.id,recommended);
        const campKws=data.keywords.filter(k=>String(k.campaignId)===String(c.id));
        const stats=statsCache[c.id];

        // активные стратегии
        const activeCount=[s.scheduleEnabled,s.peakHours].filter(Boolean).length;
        const now=new Date(),nowMin=now.getHours()*60+now.getMinutes(),todayNum=now.getDay()||7;
        const hmm=(t)=>{const[h,m]=t.split(":").map(Number);return h*60+m;};
        const inSchedule=s.scheduleEnabled&&s.scheduleDays.includes(todayNum)&&nowMin>=hmm(s.scheduleStart)&&nowMin<hmm(s.scheduleEnd);
        const inPeak=s.peakHours&&nowMin>=hmm(s.peakStart)&&nowMin<hmm(s.peakEnd);

        return(
          <div key={c.id} style={{...S.card,borderColor:activeCount>0?"rgba(251,191,36,0.25)":T.border}}>
            {/* Заголовок кампании */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:T.text}}>{c.name}</div>
                <div style={{fontSize:11,color:T.sub,marginTop:1}}>
                  ДРР {c.drr}% · {c.orders} зак. · CPO {fmt.rub(c.cpo)}
                  {activeCount>0&&<span style={{color:T.yellow,marginLeft:6}}>· ⚡{activeCount} стр.</span>}
                </div>
              </div>
              <span style={{fontSize:11,color:c.status==="ok"?T.green:T.red,fontWeight:600,background:c.status==="ok"?"rgba(74,222,128,0.1)":"rgba(248,113,113,0.1)",border:`1px solid ${c.status==="ok"?"rgba(74,222,128,0.2)":"rgba(248,113,113,0.2)"}`,borderRadius:7,padding:"3px 8px"}}>
                {c.status==="ok"?"● Работает":"● Пауза"}
              </span>
            </div>

            {/* Табы внутри кампании */}
            <div style={{display:"flex",gap:4,marginBottom:12,overflowX:"auto",paddingBottom:2}}>
              {[
                {id:"strategy",label:"📅 Стратегии"},
                {id:"bids",    label:"💰 Ставки"},
                {id:"stats",   label:"📊 Статистика"},
                {id:"topup",   label:"💳 Пополнение"},
              ].map(tb=>(
                <button key={tb.id} onClick={()=>setCampTab(p=>({...p,[c.id]:tb.id}))}
                  style={{padding:"5px 10px",borderRadius:8,border:`1px solid ${tab===tb.id?"rgba(251,191,36,0.4)":T.border}`,
                    whiteSpace:"nowrap",flexShrink:0,fontSize:11,fontWeight:tab===tb.id?700:400,cursor:"pointer",
                    background:tab===tb.id?"rgba(251,191,36,0.12)":"rgba(255,255,255,0.03)",
                    color:tab===tb.id?T.yellow:T.sub}}>
                  {tb.label}
                </button>
              ))}
            </div>

            {/* ═══ ТАБ: СТРАТЕГИИ ═══ */}
            {tab==="strategy"&&(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>

                {/* Авто-ставка от стратегии */}
                <div style={{...S.card2,borderColor:"rgba(251,191,36,0.25)",background:"rgba(251,191,36,0.04)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:T.yellow}}>🎯 Авто-ставка стратегии</div>
                      <div style={{fontSize:10,color:T.sub,marginTop:2}}>Ставка рассчитана на основе данных кампании</div>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:9,color:T.sub}}>Рекомендовано</div>
                      <div style={{fontSize:20,fontWeight:700,fontFamily:"monospace",color:T.yellow}}>{recommended} ₽</div>
                      <div style={{fontSize:9,color:T.sub}}>CPM</div>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:10}}>
                    {reasons.map((r,i)=>(
                      <div key={i} style={{fontSize:10,color:T.sub,display:"flex",gap:6,alignItems:"flex-start"}}>
                        <span style={{color:T.yellow,flexShrink:0}}>→</span><span>{r}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{fontSize:11,fontWeight:600,color:T.text,marginBottom:6}}>Ваша корректировка CPM:</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <button onClick={()=>setBidOverrides(p=>({...p,[c.id]:Math.max(50,getEffBid(c.id,recommended)-20)}))}
                      style={{width:36,height:36,borderRadius:8,border:`1px solid ${T.border}`,background:"rgba(248,113,113,0.1)",color:T.red,fontSize:18,cursor:"pointer"}}>−</button>
                    <input type="number"
                      value={effBid}
                      onChange={e=>setBidOverrides(p=>({...p,[c.id]:+e.target.value||recommended}))}
                      onBlur={e=>setBidOverrides(p=>({...p,[c.id]:Math.max(50,Math.min(2000,+e.target.value||recommended))}))}
                      style={{flex:1,background:T.card2,border:`1px solid ${effBid!==recommended?"rgba(251,191,36,0.5)":T.border}`,borderRadius:10,padding:"8px",textAlign:"center",fontSize:16,fontFamily:"monospace",fontWeight:700,color:effBid!==recommended?T.yellow:T.text,outline:"none"}}/>
                    <button onClick={()=>setBidOverrides(p=>({...p,[c.id]:Math.min(2000,getEffBid(c.id,recommended)+20)}))}
                      style={{width:36,height:36,borderRadius:8,border:`1px solid ${T.border}`,background:"rgba(74,222,128,0.1)",color:T.green,fontSize:18,cursor:"pointer"}}>+</button>
                    {effBid!==recommended&&(
                      <button onClick={()=>setBidOverrides(p=>{const n={...p};delete n[c.id];return n;})}
                        style={{fontSize:10,color:T.sub,background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,borderRadius:7,padding:"4px 8px",cursor:"pointer"}}>сброс</button>
                    )}
                  </div>
                  {effBid!==recommended&&(
                    <div style={{marginTop:8,fontSize:10,color:T.yellow,background:"rgba(251,191,36,0.06)",border:"1px solid rgba(251,191,36,0.15)",borderRadius:8,padding:"6px 10px"}}>
                      ⚡ Применена ваша ставка {effBid} ₽ (рекомендовано {recommended} ₽)
                    </div>
                  )}
                </div>

                {/* Расписание */}
                <div style={{...S.card2,borderColor:s.scheduleEnabled?"rgba(74,222,128,0.2)":T.border}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:s.scheduleEnabled?12:0}}>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span style={{fontSize:16}}>📅</span>
                      <div>
                        <div style={{fontSize:12,fontWeight:600,color:T.text}}>Расписание</div>
                        <div style={{fontSize:10,color:T.sub}}>Вкл/выкл по времени</div>
                      </div>
                    </div>
                    <div onClick={()=>upd(c.id,"scheduleEnabled",!s.scheduleEnabled)} style={{cursor:"pointer"}}>
                      <div style={{width:38,height:22,borderRadius:11,background:s.scheduleEnabled?"rgba(74,222,128,0.3)":"rgba(255,255,255,0.08)",border:`1px solid ${s.scheduleEnabled?"rgba(74,222,128,0.5)":T.border}`,position:"relative"}}>
                        <div style={{position:"absolute",top:3,left:s.scheduleEnabled?18:3,width:14,height:14,borderRadius:"50%",background:s.scheduleEnabled?T.green:T.sub,transition:"left 0.2s"}}/>
                      </div>
                    </div>
                  </div>
                  {s.scheduleEnabled&&(
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                        <div><div style={{fontSize:10,color:T.sub,marginBottom:4}}>Начало</div>
                          <input type="time" value={s.scheduleStart} onChange={e=>upd(c.id,"scheduleStart",e.target.value)} style={{...inp({fontFamily:"monospace",fontWeight:600})}}/></div>
                        <div><div style={{fontSize:10,color:T.sub,marginBottom:4}}>Конец</div>
                          <input type="time" value={s.scheduleEnd} onChange={e=>upd(c.id,"scheduleEnd",e.target.value)} style={{...inp({fontFamily:"monospace",fontWeight:600})}}/></div>
                      </div>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                        {DAYS.map((d,i)=>(
                          <button key={d} onClick={()=>toggleDay(c.id,i+1)}
                            style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${s.scheduleDays.includes(i+1)?"rgba(74,222,128,0.4)":T.border}`,
                              background:s.scheduleDays.includes(i+1)?"rgba(74,222,128,0.12)":"transparent",
                              color:s.scheduleDays.includes(i+1)?T.green:T.sub,fontSize:11,cursor:"pointer"}}>
                            {d}
                          </button>
                        ))}
                      </div>
                      {inSchedule
                        ?<div style={{fontSize:10,color:T.green,background:"rgba(74,222,128,0.06)",border:"1px solid rgba(74,222,128,0.15)",borderRadius:8,padding:"5px 10px"}}>📅 Расписание активно · до {s.scheduleEnd}</div>
                        :<div style={{fontSize:10,color:T.sub,background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border}`,borderRadius:8,padding:"5px 10px"}}>⏸ Вне расписания — кампания приостановлена</div>}
                    </div>
                  )}
                </div>

                {/* Авто-пауза */}
                {/* Пиковые часы */}
                <div style={{...S.card2,borderColor:s.peakHours?"rgba(251,191,36,0.2)":T.border}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:s.peakHours?10:0}}>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <span style={{fontSize:16}}>🚀</span>
                      <div>
                        <div style={{fontSize:12,fontWeight:600,color:T.text}}>Пиковые часы</div>
                        <div style={{fontSize:10,color:T.sub}}>Повысить ставки в часы пик</div>
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
                        <div><div style={{fontSize:10,color:T.sub,marginBottom:4}}>Начало пика</div>
                          <input type="time" value={s.peakStart} onChange={e=>upd(c.id,"peakStart",e.target.value)} style={inp({fontFamily:"monospace",fontWeight:600})}/></div>
                        <div><div style={{fontSize:10,color:T.sub,marginBottom:4}}>Конец пика</div>
                          <input type="time" value={s.peakEnd} onChange={e=>upd(c.id,"peakEnd",e.target.value)} style={inp({fontFamily:"monospace",fontWeight:600})}/></div>
                        <div><div style={{fontSize:10,color:T.sub,marginBottom:4}}>Буст %</div>
                          <input type="number" value={s.peakBidBoost} min={5} max={100} onChange={e=>upd(c.id,"peakBidBoost",+e.target.value)} style={inp({fontFamily:"monospace",fontWeight:700})}/></div>
                      </div>
                      {inPeak
                        ?<div style={{fontSize:10,color:T.yellow,background:"rgba(251,191,36,0.06)",border:"1px solid rgba(251,191,36,0.15)",borderRadius:8,padding:"5px 10px"}}>⚡ Пиковые часы активны · ставки +{s.peakBidBoost}% до {s.peakEnd}</div>
                        :<div style={{fontSize:10,color:T.sub,background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border}`,borderRadius:8,padding:"5px 10px"}}>⏳ Ожидают · старт в {s.peakStart}</div>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══ ТАБ: СТАВКИ ═══ */}
            {tab==="bids"&&(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div style={{...S.card2,background:"rgba(99,102,241,0.04)",borderColor:"rgba(99,102,241,0.15)",padding:"8px 12px"}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#c4b5fd"}}>💰 Ставки по ключевым словам</div>
                  <div style={{fontSize:10,color:T.sub,marginTop:2}}>Корректируйте ставку для каждого ключа. Рекомендованная — от стратегии.</div>
                </div>
                {campKws.length===0&&<div style={{textAlign:"center",padding:20,color:T.sub,fontSize:12}}>Нет ключей в этой кампании</div>}
                {campKws.map(kw=>{
                  const b=bids[kw.keyword]||{search:kw.bidSearch,shelves:kw.bidShelves};
                  const posCol=kw.pos<=5?"#4ade80":kw.pos<=15?"#fbbf24":"#fb923c";
                  return(
                    <div key={kw.keyword} style={{...S.card2}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12,fontWeight:700,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{kw.keyword}</div>
                          <div style={{display:"flex",gap:8,marginTop:3}}>
                            <span style={{fontSize:10,color:posCol,fontFamily:"monospace",fontWeight:700}}>#{kw.pos}</span>
                            <span style={{fontSize:10,color:kw.ctr>=0.8?T.green:T.yellow}}>CTR {kw.ctr}%</span>
                            <span style={{fontSize:10,color:T.sub}}>ДРР {kw.drr}%</span>
                          </div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontSize:9,color:T.sub}}>Стратегия рек.</div>
                          <div style={{fontSize:13,fontWeight:700,color:T.yellow}}>{effBid} ₽</div>
                        </div>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:8}}>
                        {[{label:"🔍 Поиск CPM",field:"search"},{label:"🗂 Полки CPM",field:"shelves"}].map(f=>(
                          <div key={f.field}>
                            <div style={{fontSize:10,color:T.sub,marginBottom:4}}>{f.label}</div>
                            <div style={{display:"flex",alignItems:"center",gap:4}}>
                              <button onClick={()=>setBid(kw.keyword,f.field,Math.max(50,(b[f.field]||50)-20))}
                                style={{width:34,height:34,borderRadius:8,border:`1px solid ${T.border}`,background:"rgba(248,113,113,0.08)",color:T.red,fontSize:16,cursor:"pointer",flexShrink:0}}>−</button>
                              <input type="number" value={b[f.field]||""}
                                onChange={e=>setBid(kw.keyword,f.field,e.target.value)}
                                onBlur={e=>setBidFinal(kw.keyword,f.field,e.target.value)}
                                style={{flex:1,background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 4px",textAlign:"center",fontSize:14,fontFamily:"monospace",fontWeight:700,color:T.text,outline:"none"}}/>
                              <button onClick={()=>setBid(kw.keyword,f.field,Math.min(2000,(b[f.field]||50)+20))}
                                style={{width:34,height:34,borderRadius:8,border:`1px solid ${T.border}`,background:"rgba(74,222,128,0.08)",color:T.green,fontSize:16,cursor:"pointer",flexShrink:0}}>+</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {bidHistory.length>0&&(
                  <div style={{...S.card2,padding:"8px 12px"}}>
                    <div style={{fontSize:10,fontWeight:600,color:T.sub,marginBottom:6}}>ИСТОРИЯ ИЗМЕНЕНИЙ</div>
                    {bidHistory.slice(0,5).map((h,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:10,color:T.sub,paddingBottom:4,marginBottom:4,borderBottom:i<4?`1px solid rgba(255,255,255,0.04)`:"none"}}>
                        <span style={{color:T.text}}>{h.kw}</span>
                        <span>{h.field==="search"?"Поиск":"Полки"}: {h.from}→<span style={{color:T.green,fontWeight:700}}>{h.to} ₽</span> · {h.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ═══ ТАБ: СТАТИСТИКА ═══ */}
            {tab==="stats"&&(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div style={{...S.card2,background:"rgba(59,130,246,0.04)",borderColor:"rgba(59,130,246,0.15)",padding:"8px 12px"}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#93c5fd"}}>📊 Статистика стратегии за 7 дней</div>
                  <div style={{fontSize:10,color:T.sub,marginTop:2}}>Эффективность работы стратегии по дням</div>
                </div>
                <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
                  <table style={{width:"100%",minWidth:700,borderCollapse:"collapse"}}>
                    <thead>
                      <tr style={{background:"rgba(255,255,255,0.03)"}}>
                        {["Дата","Показы","CPM","Перех.","CTR","CPC","Затраты","Корз.","CPL","Заказы","ДРР","Поз."].map(h=>(
                          <th key={h} style={{padding:"6px 8px",textAlign:"center",fontSize:9,color:T.sub,fontWeight:600,whiteSpace:"nowrap",borderBottom:`1px solid ${T.border}`}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stats.map((row,i)=>(
                        <tr key={i} style={{borderBottom:`1px solid rgba(255,255,255,0.04)`}}>
                          <td style={{padding:"6px 8px",fontSize:10,color:T.text,fontWeight:600,whiteSpace:"nowrap"}}>{row.d}</td>
                          <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.text}}>{fmt.num(row.imp)}</td>
                          <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.yellow}}>{row.cpm}</td>
                          <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.text}}>{fmt.num(row.clicks)}</td>
                          <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:row.ctr>=0.8?T.green:T.yellow}}>{row.ctr}%</td>
                          <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.text}}>{row.cpc}₽</td>
                          <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.yellow}}>{fmt.rub(row.spend)}</td>
                          <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.text}}>{row.baskets}</td>
                          <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.sub}}>{row.cpl}₽</td>
                          <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:row.orders>0?T.green:T.red,fontWeight:700}}>{row.orders}</td>
                          <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:row.drr>25?T.red:row.drr>18?T.yellow:T.green}}>{row.drr}%</td>
                          <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"center",color:row.pos<=5?"#4ade80":row.pos<=10?"#fbbf24":"#fb923c",fontWeight:700}}>#{row.pos}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{background:"rgba(255,255,255,0.03)",borderTop:`1px solid ${T.border}`}}>
                        <td style={{padding:"6px 8px",fontSize:10,fontWeight:700,color:T.text}}>Итого</td>
                        <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.text,fontWeight:700}}>{fmt.num(stats.reduce((s,r)=>s+r.imp,0))}</td>
                        <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.yellow}}>—</td>
                        <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.text,fontWeight:700}}>{fmt.num(stats.reduce((s,r)=>s+r.clicks,0))}</td>
                        <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.green}}>{(stats.reduce((s,r)=>s+r.clicks,0)/Math.max(1,stats.reduce((s,r)=>s+r.imp,0))*100).toFixed(2)}%</td>
                        <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.text}}>—</td>
                        <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.yellow,fontWeight:700}}>{fmt.rub(stats.reduce((s,r)=>s+r.spend,0))}</td>
                        <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.text,fontWeight:700}}>{stats.reduce((s,r)=>s+r.baskets,0)}</td>
                        <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.sub}}>—</td>
                        <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.green,fontWeight:700}}>{stats.reduce((s,r)=>s+r.orders,0)}</td>
                        <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.yellow}}>{(stats.reduce((s,r)=>s+r.spend,0)/Math.max(1,stats.reduce((s,r)=>s+r.orders,0)*2500)*100).toFixed(1)}%</td>
                        <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"center",color:T.sub}}>—</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* ═══ ТАБ: АВТОПОПОЛНЕНИЕ ═══ */}
            {tab==="topup"&&(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{...S.card2,background:"rgba(74,222,128,0.04)",borderColor:"rgba(74,222,128,0.15)",padding:"8px 12px"}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#6ee7b7"}}>💳 Автопополнение бюджета кампании</div>
                  <div style={{fontSize:10,color:T.sub,marginTop:2}}>На ВБ автопополнение привязано к конкретной кампании</div>
                </div>
                <div style={{...S.card2}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:t.enabled?14:0}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:T.text}}>Автопополнение</div>
                      <div style={{fontSize:10,color:T.sub,marginTop:1}}>Пополнять бюджет автоматически</div>
                    </div>
                    <div onClick={()=>updTopup(c.id,"enabled",!t.enabled)} style={{cursor:"pointer"}}>
                      <div style={{width:42,height:24,borderRadius:12,background:t.enabled?"rgba(74,222,128,0.3)":"rgba(255,255,255,0.08)",border:`1px solid ${t.enabled?"rgba(74,222,128,0.5)":T.border}`,position:"relative"}}>
                        <div style={{position:"absolute",top:3,left:t.enabled?21:3,width:16,height:16,borderRadius:"50%",background:t.enabled?"#4ade80":T.sub,transition:"left 0.2s"}}/>
                      </div>
                    </div>
                  </div>
                  {t.enabled&&(
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                        <div>
                          <div style={{fontSize:10,color:T.sub,marginBottom:4}}>Пополнять на, ₽</div>
                          <input type="number" value={t.amount}
                            onChange={e=>updTopup(c.id,"amount",+e.target.value)}
                            onBlur={e=>updTopup(c.id,"amount",Math.max(1000,+e.target.value))}
                            style={{...inp({fontFamily:"monospace",fontWeight:700})}}/>
                          <div style={{fontSize:9,color:T.sub,marginTop:2}}>Минимум 1 000 ₽</div>
                        </div>
                        <div>
                          <div style={{fontSize:10,color:T.sub,marginBottom:4}}>Раз в день (не чаще)</div>
                          <input type="number" value={t.timesPerDay} min={1} max={10}
                            onChange={e=>updTopup(c.id,"timesPerDay",Math.max(1,Math.min(10,+e.target.value)))}
                            style={{...inp({fontFamily:"monospace",fontWeight:700})}}/>
                        </div>
                      </div>
                      <div style={{fontSize:11,color:T.green,background:"rgba(74,222,128,0.06)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:8,padding:"8px 12px",lineHeight:1.6}}>
                        ✅ Пополнять «{c.name}» на <strong>{t.amount.toLocaleString("ru-RU")} ₽</strong><br/>
                        не чаще {t.timesPerDay} {t.timesPerDay===1?"раза":"раз"} в день
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

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
    {id:"diagnostics", label:"Диагностика"},
    {id:"planfact",    label:"План/Факт"},
  ],
  bids:[
    {id:"bids_smart",        label:"🤖 Авто"},
    {id:"bids_strategy",     label:"⚡ Стратегии"},
    {id:"bids_autostrategy", label:"🎯 Авто-план"},
    {id:"bids_minus",        label:"🚫 Минусовка"},
  ],
  settings:[
    {id:"settings_main", label:"Настройки"},
  ],
};

// ─── История позиций — было/стало ────────────────────────────────────────────
function PositionHistoryBlock({data,targetDrr}){
  const [selCamp,setSelCamp]=useState("all");
  const [period,setPeriod]=useState("7d");
  const [deletedPos,setDeletedPos]=useState(new Set());
  const filtPos=(selCamp==="all"?data.positions:data.positions.filter(k=>String(k.campaignId)===String(selCamp)))
    .filter(k=>!deletedPos.has(k.keyword))
    .slice(0,10);
  const dates=(filtPos[0]||data.positions[0])?.dates||[];
  const pc=pos=>pos<=5?"#4ade80":pos<=10?"#86efac":pos<=20?"#fbbf24":"#f87171";
  function deletePos(kw){setDeletedPos(prev=>{const n=new Set(prev);n.add(kw);return n;});}
  const PERIOD_BTNS=[{id:"today",l:"Сегодня"},{id:"yesterday",l:"Вчера"},{id:"7d",l:"7 дней"},{id:"period",l:"Период"}];
  const shownDates=period==="today"?dates.slice(0,1):period==="yesterday"?dates.slice(1,2):dates;
  return(
    <div style={S.card}>
      <SectionTitle>📈 История позиций — было / стало</SectionTitle>
      <CampaignSelect campaigns={data.campaigns} value={selCamp} onChange={setSelCamp}/>
      <div style={{display:"flex",gap:4,marginBottom:12}}>
        {PERIOD_BTNS.map(p=>(
          <button key={p.id} onClick={()=>setPeriod(p.id)}
            style={{padding:"4px 10px",borderRadius:7,border:`1px solid ${period===p.id?"rgba(124,58,237,0.5)":T.border}`,
              background:period===p.id?"rgba(124,58,237,0.15)":"transparent",
              color:period===p.id?"#c4b5fd":T.sub,fontSize:11,fontWeight:period===p.id?700:400,cursor:"pointer"}}>
            {p.l}
          </button>
        ))}
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
          <thead>
            <tr>
              <th style={{padding:"7px 10px",textAlign:"left",color:T.sub,background:T.card2,minWidth:140}}>Запрос</th>
              <th style={{padding:"7px 6px",textAlign:"center",color:T.sub,background:T.card2}}>Было → Стало</th>
              {shownDates.map(d=><th key={d.date} style={{padding:"7px 10px",textAlign:"center",color:T.sub,background:T.card2,minWidth:110}}>{d.date}</th>)}
              <th style={{padding:"7px 6px",background:T.card2}}/>
            </tr>
            <tr style={{background:T.card}}>
              <td colSpan={2}/>
              {shownDates.map((d,i)=>(
                <td key={i} style={{padding:"5px 10px",textAlign:"center"}}>
                  <span style={{fontSize:10,padding:"2px 6px",borderRadius:10,background:d.promo?"rgba(74,222,128,0.15)":"rgba(255,255,255,0.06)",color:d.promo?T.green:T.sub}}>{d.promo?"В акции":"Не в акции"}</span>
                  <span style={{fontSize:10,color:T.sub,marginLeft:3}}>{d.price} ₽</span>
                </td>
              ))}
              <td/>
            </tr>
          </thead>
          <tbody>
            {filtPos.map((kw,ki)=>{
              const first=kw.dates[kw.dates.length-1];
              const last=kw.dates[0];
              const deltaS=first&&last?first.posSearch-last.posSearch:0;
              const deltaP=first&&last?first.posShelves-last.posShelves:0;
              const shownKwDates=period==="today"?kw.dates.slice(0,1):period==="yesterday"?kw.dates.slice(1,2):kw.dates;
              return(
                <tr key={kw.keyword} style={{borderTop:`1px solid ${T.border}`,background:ki%2?"rgba(255,255,255,0.01)":"transparent"}}>
                  <td style={{padding:"9px 10px",color:T.text,fontWeight:500}}>{kw.keyword}</td>
                  <td style={{padding:"9px 10px",textAlign:"center"}}>
                    {first&&last?(
                      <div style={{display:"flex",flexDirection:"column",gap:3,alignItems:"center"}}>
                        <div style={{display:"flex",alignItems:"center",gap:3,fontSize:11}}>
                          <span style={{color:"#a5b4fc",fontSize:10}}>🔍</span>
                          <span style={{fontFamily:"monospace",color:T.sub}}>{first.posSearch}</span>
                          <span style={{color:T.sub}}>→</span>
                          <span style={{fontFamily:"monospace",fontWeight:700,color:pc(last.posSearch)}}>{last.posSearch}</span>
                          <span style={{fontSize:11,fontWeight:700,color:deltaS>0?T.green:deltaS<0?T.red:T.sub}}>{deltaS>0?`↑${deltaS}`:deltaS<0?`↓${Math.abs(deltaS)}`:""}</span>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:3,fontSize:11}}>
                          <span style={{color:"#93c5fd",fontSize:10}}>🗂</span>
                          <span style={{fontFamily:"monospace",color:T.sub}}>{first.posShelves}</span>
                          <span style={{color:T.sub}}>→</span>
                          <span style={{fontFamily:"monospace",fontWeight:700,color:pc(last.posShelves)}}>{last.posShelves}</span>
                          <span style={{fontSize:11,fontWeight:700,color:deltaP>0?T.green:deltaP<0?T.red:T.sub}}>{deltaP>0?`↑${deltaP}`:deltaP<0?`↓${Math.abs(deltaP)}`:""}</span>
                        </div>
                      </div>
                    ):"—"}
                  </td>
                  {shownKwDates.map((d,di)=>(
                    <td key={di} style={{padding:"9px 10px",textAlign:"center"}}>
                      <div style={{display:"flex",flexDirection:"column",gap:3,alignItems:"center"}}>
                        <div style={{display:"flex",alignItems:"center",gap:3}}>
                          <span style={{color:"#a5b4fc",fontSize:10}}>🔍</span>
                          <span style={{fontFamily:"monospace",fontWeight:700,fontSize:12,padding:"1px 5px",borderRadius:5,background:`${pc(d.posSearch)}18`,color:pc(d.posSearch)}}>{d.posSearch}</span>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:3}}>
                          <span style={{color:"#93c5fd",fontSize:10}}>🗂</span>
                          <span style={{fontFamily:"monospace",fontWeight:700,fontSize:12,padding:"1px 5px",borderRadius:5,background:`${pc(d.posShelves)}18`,color:pc(d.posShelves)}}>{d.posShelves}</span>
                        </div>
                        <div style={{fontSize:9,color:T.sub}}>{d.shows} показ</div>
                      </div>
                    </td>
                  ))}
                  <td style={{padding:"9px 6px",textAlign:"center"}}>
                    <button onClick={()=>deletePos(kw.keyword)} title="Удалить ключ"
                      style={{background:"rgba(248,113,113,0.1)",color:T.red,border:"none",borderRadius:6,padding:"4px 6px",fontSize:13,cursor:"pointer",lineHeight:1}}>🗑</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {filtPos.length===0&&<div style={{textAlign:"center",padding:20,color:T.sub,fontSize:12}}>Нет данных по позициям</div>}
    </div>
  );
}

// ─── Баланс рекламного кабинета + авто-пополнение ────────────────────────────
function CampAutoTopup({campId,campName,inp}){
  const [autoTopup,setAutoTopup]=useState(false);
  const [topupAmount,setTopupAmount]=useState(1000);
  const [timesPerDay,setTimesPerDay]=useState(1);
  return(
    <div style={{borderTop:`1px solid ${T.border}`,marginTop:10,paddingTop:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:autoTopup?10:0}}>
        <div>
          <div style={{fontSize:12,fontWeight:600,color:T.text}}>💳 Автопополнение кампании</div>
          <div style={{fontSize:10,color:T.sub,marginTop:1}}>Пополнять бюджет этой кампании автоматически</div>
        </div>
        <div onClick={()=>setAutoTopup(p=>!p)} style={{cursor:"pointer"}}>
          <div style={{width:42,height:24,borderRadius:12,
            background:autoTopup?"rgba(74,222,128,0.3)":"rgba(255,255,255,0.08)",
            border:`1px solid ${autoTopup?"rgba(74,222,128,0.5)":T.border}`,position:"relative"}}>
            <div style={{position:"absolute",top:3,left:autoTopup?21:3,width:16,height:16,
              borderRadius:"50%",background:autoTopup?"#4ade80":T.sub,transition:"left 0.2s"}}/>
          </div>
        </div>
      </div>
      {autoTopup&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div>
              <div style={{fontSize:10,color:T.sub,marginBottom:4}}>Пополнять на, ₽</div>
              <input type="number" value={topupAmount} onChange={e=>setTopupAmount(Math.max(1000,+e.target.value))}
                style={{width:"100%",background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 10px",fontSize:13,color:T.text,outline:"none",boxSizing:"border-box",fontFamily:"monospace",fontWeight:600}}/>
              <div style={{fontSize:9,color:T.sub,marginTop:2}}>Минимум 1 000 ₽</div>
            </div>
            <div>
              <div style={{fontSize:10,color:T.sub,marginBottom:4}}>Не чаще раз в день</div>
              <input type="number" value={timesPerDay} min={1} max={10} onChange={e=>setTimesPerDay(Math.max(1,Math.min(10,+e.target.value)))}
                style={{width:"100%",background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 10px",fontSize:13,color:T.text,outline:"none",boxSizing:"border-box",fontFamily:"monospace",fontWeight:600}}/>
            </div>
          </div>
          <div style={{fontSize:11,color:T.green,background:"rgba(74,222,128,0.06)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:8,padding:"7px 10px"}}>
            ✅ Пополнять на {topupAmount.toLocaleString("ru-RU")} ₽ — не чаще {timesPerDay} {timesPerDay===1?"раза":"раз"} в день
          </div>
        </div>
      )}
    </div>
  );
}

function BidsCabinetBalance({platform}){
  const DEMO_BALANCE={wb:258969,ozon:12700};
  const balance=DEMO_BALANCE[platform]||0;
  const isLow=balance<5000;
  return(
    <div style={{...S.card,borderColor:isLow?"rgba(248,113,113,0.3)":T.border,
      background:isLow?"rgba(248,113,113,0.03)":T.card}}>
      <div style={{fontSize:11,color:T.sub,marginBottom:6}}>
        {platform==="wb"?"🟣 WB":"🔵 Ozon"} · Единый счёт рекламного кабинета
      </div>
      <div style={{display:"flex",alignItems:"baseline",gap:10}}>
        <span style={{fontSize:30,fontWeight:700,fontFamily:"monospace",color:isLow?T.red:T.text}}>
          {balance.toLocaleString("ru-RU")} ₽
        </span>
        {isLow&&<span style={{fontSize:12,color:T.red,fontWeight:600}}>⚠️ Низкий баланс</span>}
      </div>
      <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,marginTop:10,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${Math.min(balance/300000*100,100)}%`,
          background:isLow?"#f87171":balance<50000?"#fbbf24":"#4ade80",borderRadius:2}}/>
      </div>
    </div>
  );
}

// ─── АВТО-СТРАТЕГИЯ ──────────────────────────────────────────────────────────
function AutoStrategyTab({data,targetDrr,inp}){
  const [goal,setGoal]=useState("balance");
  const [selCamp,setSelCamp]=useState("all");
  const [autoApply,setAutoApply]=useState(false);
  const [running,setRunning]=useState(false);
  const [ran,setRan]=useState(false);
  const [log,setLog]=useState([]);
  const [topups,setTopups]=useState(
    data.campaigns.reduce((acc,c)=>({...acc,[c.id]:{enabled:false,amount:1000,timesPerDay:1}}),{})
  );
  function updTopup(id,key,val){setTopups(p=>({...p,[id]:{...p[id],[key]:val}}));}

  const GOALS=[
    {id:"growth",  icon:"🚀", label:"Рост продаж",   desc:"Максимум заказов, ДРР может вырасти"},
    {id:"balance", icon:"⚖️", label:"Баланс",         desc:"Больше продаж при соблюдении ДРР"},
    {id:"economy", icon:"💰", label:"Экономия",       desc:"Жёсткий контроль ДРР, снижение расходов"},
  ];

  const tDrr=targetDrr||20;
  const targetCamps=selCamp==="all"?data.campaigns:data.campaigns.filter(c=>String(c.id)===String(selCamp));

  // Расчёт рекомендованной ставки для стратегии
  function calcStratBid(camp){
    const kws=data.keywords.filter(k=>String(k.campaignId)===String(camp.id));
    const avgBid=kws.length>0?Math.round(kws.reduce((s,k)=>s+k.bidSearch,0)/kws.length):200;
    const drrFactor=camp.drr>tDrr?0.85:camp.drr<tDrr*0.7?1.2:1.0;
    const goalFactor=goal==="growth"?1.25:goal==="economy"?0.8:1.0;
    const recommended=Math.round(avgBid*drrFactor*goalFactor);
    const reasons=[];
    if(goal==="growth") reasons.push("цель — рост, ставка повышена на 25%");
    if(goal==="economy") reasons.push("цель — экономия, ставка снижена на 20%");
    if(camp.drr>tDrr) reasons.push(`ДРР ${camp.drr}% выше цели → ставка снижена на 15%`);
    if(camp.drr<tDrr*0.7) reasons.push(`ДРР ${camp.drr}% значительно ниже цели → есть потенциал, ставка повышена`);
    reasons.push(`средняя ставка ключей ${avgBid} ₽`);
    return {recommended, reasons};
  }

  function runAnalysis(){
    setRunning(true); setRan(false); setLog([]);
    const allSpend=data.campaigns.reduce((s,c)=>s+c.spend,0)||1;
    const steps=[];

    targetCamps.forEach(c=>{
      const campKws=data.keywords.filter(k=>String(k.campaignId)===String(c.id));
      const goodKws=campKws.filter(k=>k.drr<=tDrr&&k.orders>0);
      const badKws=campKws.filter(k=>k.drr>tDrr*1.2||k.orders===0&&k.spend>200);
      const spendShare=(c.spend/allSpend*100).toFixed(0);
      const {recommended,reasons}=calcStratBid(c);

      if(c.drr<=tDrr*0.7){
        const boost=goal==="growth"?"+25%":goal==="balance"?"+15%":"+5%";
        steps.push({type:"up",camp:c.name,action:`Увеличить бюджет ${boost}`,
          reason:`ДРР ${c.drr}% — значительно ниже цели ${tDrr}%. Доля бюджета ${spendShare}%.`,
          detail:goodKws.length>0?`Эффективные ключи: ${goodKws.map(k=>k.keyword).join(", ")}`:null,
          bid:recommended, bidReasons:reasons, priority:1});
      } else if(c.drr>tDrr*1.15){
        const cut=goal==="economy"?"-30%":goal==="balance"?"-20%":"-10%";
        steps.push({type:"down",camp:c.name,action:`Снизить бюджет ${cut}`,
          reason:`ДРР ${c.drr}% — превышает цель ${tDrr}% на ${(c.drr-tDrr).toFixed(1)}%.`,
          detail:badKws.length>0?`Ключи с перерасходом: ${badKws.map(k=>k.keyword).join(", ")}`:null,
          bid:recommended, bidReasons:reasons, priority:1});
      } else {
        steps.push({type:"ok",camp:c.name,action:"Параметры оптимальны",
          reason:`ДРР ${c.drr}% — в норме. Плавная корректировка.`,detail:null,
          bid:recommended, bidReasons:reasons, priority:3});
      }
    });

    const filtKws=selCamp==="all"?data.keywords:data.keywords.filter(k=>String(k.campaignId)===String(selCamp));
    const fallingKws=filtKws.filter(k=>k.posPrev-k.pos<-3&&k.ctr>=0.8);
    if(fallingKws.length>0) steps.push({type:"bid_up",camp:"Все кампании",
      action:`Повысить ставки: ${fallingKws.length} ключей`,
      reason:"Позиции падают при хорошем CTR — конкуренты подняли ставки.",
      detail:fallingKws.map(k=>`«${k.keyword}» ${k.posPrev}→${k.pos}`).join("; "),
      bid:null,bidReasons:null,priority:2});

    const zeroKws=filtKws.filter(k=>k.orders===0&&k.spend>300);
    if(zeroKws.length>0) steps.push({type:"minus",camp:"Все кампании",
      action:`В минус-слова: ${zeroKws.length} ключей`,
      reason:"Расход без заказов — нецелевой трафик.",
      detail:zeroKws.map(k=>`«${k.keyword}» −${k.spend}₽`).join("; "),
      bid:null,bidReasons:null,priority:2});

    steps.sort((a,b)=>a.priority-b.priority);
    setTimeout(()=>{setLog(steps);setRunning(false);setRan(true);},1400);
  }

  const TYPE_STYLE={
    up:      {icon:"📈",color:T.green,  bg:"rgba(74,222,128,0.08)", border:"rgba(74,222,128,0.2)"},
    down:    {icon:"📉",color:T.red,    bg:"rgba(248,113,113,0.08)",border:"rgba(248,113,113,0.2)"},
    ok:      {icon:"✅",color:T.sub,    bg:"rgba(255,255,255,0.03)",border:T.border},
    bid_up:  {icon:"⬆️",color:"#93c5fd",bg:"rgba(59,130,246,0.08)", border:"rgba(59,130,246,0.2)"},
    bid_down:{icon:"⬇️",color:T.yellow, bg:"rgba(251,191,36,0.06)", border:"rgba(251,191,36,0.2)"},
    minus:   {icon:"🚫",color:T.red,    bg:"rgba(248,113,113,0.06)",border:"rgba(248,113,113,0.15)"},
  };

  const campBase=targetCamps.reduce((s,c)=>s+c.orders,0);
  const projOrders=ran?Math.round(campBase*(goal==="growth"?1.22:goal==="balance"?1.12:1.03)):null;
  const projDrr=ran?(tDrr*(goal==="growth"?1.06:goal==="balance"?0.96:0.85)).toFixed(1):null;
  const projRevGrow=goal==="growth"?"+22%":goal==="balance"?"+12%":"+3%";

  // Демо-статистика за 7 дней (авто-план)
  const DAYS7=["03.03","04.03","05.03","06.03","07.03","08.03","09.03"];
  function genStats(){
    return DAYS7.map(d=>{
      const noise=()=>0.85+Math.random()*0.3;
      const imp=Math.round(targetCamps.reduce((s,c)=>s+(c.impressions||8000)/7*noise(),0));
      const cpm=Math.round(targetCamps.reduce((s,c)=>s+(c.cpm||180)*noise(),0)/Math.max(1,targetCamps.length));
      const clicks=Math.round(imp*0.008*noise());
      const spend=Math.round(imp/1000*cpm);
      const orders=Math.round(clicks*0.04*noise());
      const baskets=Math.round(orders/0.35);
      const drr=+(spend/Math.max(1,orders*2500)*100).toFixed(1);
      const pos=Math.round(5*noise());
      return{d,imp,cpm,clicks,ctr:+(clicks/Math.max(1,imp)*100).toFixed(2),spend,cpc:+(spend/Math.max(1,clicks)).toFixed(0),baskets,cpl:+(spend/Math.max(1,baskets)).toFixed(0),orders,drr,pos};
    });
  }
  const [planStats]=useState(()=>genStats());

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>

      <div style={{...S.card,background:"rgba(16,185,129,0.05)",borderColor:"rgba(16,185,129,0.2)"}}>
        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
          <span style={{fontSize:24}}>🎯</span>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:3}}>Авто-план роста продаж</div>
            <div style={{fontSize:11,color:T.sub,lineHeight:1.6}}>Анализирует кампании и ключи, рассчитывает оптимальные ставки и предлагает конкретные действия.</div>
            {!targetDrr&&<div style={{marginTop:5,fontSize:11,color:T.yellow}}>⚠️ Целевой ДРР не установлен — расчёт приблизительный</div>}
          </div>
        </div>
      </div>

      {/* Выбор кампании */}
      <CampaignSelect campaigns={data.campaigns} value={selCamp} onChange={v=>{setSelCamp(v);setRan(false);setLog([]);}}/>

      {/* Приоритет */}
      <div style={S.card}>
        <div style={{fontSize:11,color:T.sub,marginBottom:8,fontWeight:600,letterSpacing:"0.05em"}}>ПРИОРИТЕТ СТРАТЕГИИ</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {GOALS.map(g=>(
            <div key={g.id} onClick={()=>setGoal(g.id)}
              style={{...S.card2,cursor:"pointer",borderColor:goal===g.id?"rgba(16,185,129,0.4)":T.border,
                background:goal===g.id?"rgba(16,185,129,0.07)":T.card2,display:"flex",alignItems:"center",gap:12,padding:"10px 12px"}}>
              <span style={{fontSize:20,flexShrink:0}}>{g.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:goal===g.id?"#6ee7b7":T.text}}>{g.label}</div>
                <div style={{fontSize:10,color:T.sub,marginTop:1}}>{g.desc}</div>
              </div>
              <div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${goal===g.id?"#6ee7b7":T.border}`,background:goal===g.id?"#6ee7b7":"transparent",flexShrink:0}}/>
            </div>
          ))}
        </div>
      </div>

      {/* Авто-применение */}
      <div style={{...S.card,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:12,fontWeight:600,color:T.text}}>Авто-применение</div>
          <div style={{fontSize:10,color:T.sub,marginTop:1}}>Применять рекомендации каждые 6 ч</div>
        </div>
        <div onClick={()=>setAutoApply(p=>!p)} style={{cursor:"pointer"}}>
          <div style={{width:42,height:24,borderRadius:12,background:autoApply?"rgba(16,185,129,0.3)":"rgba(255,255,255,0.08)",border:`1px solid ${autoApply?"rgba(16,185,129,0.5)":T.border}`,position:"relative"}}>
            <div style={{position:"absolute",top:3,left:autoApply?21:3,width:16,height:16,borderRadius:"50%",background:autoApply?"#6ee7b7":T.sub,transition:"left 0.2s"}}/>
          </div>
        </div>
      </div>

      {/* Кнопка запуска */}
      <button onClick={runAnalysis} disabled={running}
        style={{padding:"14px",borderRadius:12,border:"none",cursor:running?"default":"pointer",
          background:running?"rgba(255,255,255,0.05)":"rgba(16,185,129,0.2)",
          color:running?T.sub:"#6ee7b7",fontSize:14,fontWeight:700,
          display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        {running?<><span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>⏳</span> Анализируем...</>:"🚀 Запустить анализ"}
      </button>

      {/* ── РЕЗУЛЬТАТЫ ── */}
      {ran&&(
        <>
          {/* Прогноз подробный */}
          <div style={{...S.card,borderColor:"rgba(16,185,129,0.3)",background:"rgba(16,185,129,0.04)"}}>
            <div style={{fontSize:12,fontWeight:700,color:"#6ee7b7",marginBottom:10}}>📈 ПРОГНОЗ ПОСЛЕ ПРИМЕНЕНИЯ</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
              {[
                {l:"Заказы",v:`+${projOrders-campBase}`,sub:`${campBase}→${projOrders}`,c:T.green},
                {l:"Рост выручки",v:projRevGrow,sub:"прогноз",c:T.green},
                {l:"Ожидаемый ДРР",v:`${projDrr}%`,sub:`цель ${tDrr}%`,c:+projDrr<=tDrr?T.green:T.yellow},
              ].map(m=>(
                <div key={m.l} style={{textAlign:"center",background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"10px 6px",border:`1px solid rgba(255,255,255,0.06)`}}>
                  <div style={{fontSize:9,color:T.sub,marginBottom:4}}>{m.l}</div>
                  <div style={{fontSize:18,fontWeight:700,fontFamily:"monospace",color:m.c}}>{m.v}</div>
                  <div style={{fontSize:9,color:T.sub,marginTop:2}}>{m.sub}</div>
                </div>
              ))}
            </div>

            {/* Ставки по кампаниям в прогнозе */}
            <div style={{fontSize:11,fontWeight:600,color:T.text,marginBottom:8}}>Ставки для достижения цели:</div>
            {targetCamps.map(c=>{
              const {recommended,reasons}=calcStratBid(c);
              return(
                <div key={c.id} style={{...S.card2,marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div style={{fontSize:12,fontWeight:700,color:T.text}}>{c.name}</div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:9,color:T.sub}}>CPM</div>
                      <div style={{fontSize:18,fontWeight:700,fontFamily:"monospace",color:T.yellow}}>{recommended} ₽</div>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:3}}>
                    {reasons.map((r,i)=>(
                      <div key={i} style={{fontSize:10,color:T.sub,display:"flex",gap:6}}>
                        <span style={{color:T.yellow,flexShrink:0}}>→</span><span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Список действий */}
          <div style={{...S.card}}>
            <div style={{fontSize:11,fontWeight:700,color:T.text,marginBottom:10,letterSpacing:"0.05em"}}>ПЛАН ДЕЙСТВИЙ</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {log.map((item,i)=>{
                const st=TYPE_STYLE[item.type]||TYPE_STYLE.ok;
                return(
                  <div key={i} style={{borderRadius:10,padding:"10px 12px",background:st.bg,border:`1px solid ${st.border}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:item.reason?6:0}}>
                      <div style={{display:"flex",gap:8,alignItems:"center",flex:1}}>
                        <span style={{fontSize:16,flexShrink:0}}>{st.icon}</span>
                        <div>
                          <div style={{fontSize:11,color:T.sub,marginBottom:1}}>{item.camp}</div>
                          <div style={{fontSize:12,fontWeight:700,color:st.color}}>{item.action}</div>
                        </div>
                      </div>
                      {item.bid&&(
                        <div style={{textAlign:"center",flexShrink:0,marginLeft:10,background:"rgba(251,191,36,0.1)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:8,padding:"4px 10px"}}>
                          <div style={{fontSize:8,color:T.sub}}>ставка</div>
                          <div style={{fontSize:14,fontWeight:700,color:T.yellow,fontFamily:"monospace"}}>{item.bid} ₽</div>
                        </div>
                      )}
                    </div>
                    {item.reason&&<div style={{fontSize:10,color:T.sub,marginLeft:24}}>{item.reason}</div>}
                    {item.detail&&<div style={{fontSize:10,color:T.sub,marginLeft:24,marginTop:3,fontStyle:"italic"}}>{item.detail}</div>}
                    {item.bidReasons&&(
                      <div style={{marginLeft:24,marginTop:4}}>
                        {item.bidReasons.map((r,j)=>(
                          <div key={j} style={{fontSize:9,color:T.sub,display:"flex",gap:4}}>
                            <span style={{color:T.yellow}}>·</span><span>{r}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Статистика авто-плана за 7 дней */}
          <div style={S.card}>
            <div style={{fontSize:11,fontWeight:700,color:"#93c5fd",marginBottom:10}}>📊 Прогноз по дням (7 дней)</div>
            <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
              <table style={{width:"100%",minWidth:700,borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"rgba(255,255,255,0.03)"}}>
                    {["Дата","Показы","CPM","Перех.","CTR","CPC","Затраты","Корз.","CPL","Заказы","ДРР","Поз."].map(h=>(
                      <th key={h} style={{padding:"6px 8px",textAlign:"center",fontSize:9,color:T.sub,fontWeight:600,whiteSpace:"nowrap",borderBottom:`1px solid ${T.border}`}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {planStats.map((row,i)=>(
                    <tr key={i} style={{borderBottom:`1px solid rgba(255,255,255,0.04)`}}>
                      <td style={{padding:"6px 8px",fontSize:10,color:T.text,fontWeight:600,whiteSpace:"nowrap"}}>{row.d}</td>
                      <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.text}}>{fmt.num(row.imp)}</td>
                      <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.yellow}}>{row.cpm}</td>
                      <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.text}}>{fmt.num(row.clicks)}</td>
                      <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:row.ctr>=0.8?T.green:T.yellow}}>{row.ctr}%</td>
                      <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.text}}>{row.cpc}₽</td>
                      <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.yellow}}>{fmt.rub(row.spend)}</td>
                      <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.text}}>{row.baskets}</td>
                      <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.sub}}>{row.cpl}₽</td>
                      <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:row.orders>0?T.green:T.red,fontWeight:700}}>{row.orders}</td>
                      <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:row.drr>25?T.red:row.drr>18?T.yellow:T.green}}>{row.drr}%</td>
                      <td style={{padding:"6px 8px",fontSize:10,fontFamily:"monospace",textAlign:"center",color:row.pos<=5?"#4ade80":row.pos<=10?"#fbbf24":"#fb923c",fontWeight:700}}>#{row.pos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Автопополнение к каждой кампании */}
          <div style={S.card}>
            <div style={{fontSize:11,fontWeight:700,color:"#6ee7b7",marginBottom:10}}>💳 Автопополнение кампаний</div>
            {targetCamps.map(c=>{
              const t=topups[c.id];
              return(
                <div key={c.id} style={{...S.card2,marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:t.enabled?12:0}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:T.text}}>{c.name}</div>
                      <div style={{fontSize:10,color:T.sub,marginTop:1}}>ДРР {c.drr}% · {c.orders} заказов</div>
                    </div>
                    <div onClick={()=>updTopup(c.id,"enabled",!t.enabled)} style={{cursor:"pointer"}}>
                      <div style={{width:42,height:24,borderRadius:12,background:t.enabled?"rgba(74,222,128,0.3)":"rgba(255,255,255,0.08)",border:`1px solid ${t.enabled?"rgba(74,222,128,0.5)":T.border}`,position:"relative"}}>
                        <div style={{position:"absolute",top:3,left:t.enabled?21:3,width:16,height:16,borderRadius:"50%",background:t.enabled?"#4ade80":T.sub,transition:"left 0.2s"}}/>
                      </div>
                    </div>
                  </div>
                  {t.enabled&&(
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                        <div>
                          <div style={{fontSize:10,color:T.sub,marginBottom:4}}>Пополнять на, ₽</div>
                          <input type="number" value={t.amount}
                            onChange={e=>updTopup(c.id,"amount",+e.target.value)}
                            onBlur={e=>updTopup(c.id,"amount",Math.max(1000,+e.target.value))}
                            style={{width:"100%",background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 10px",fontSize:13,color:T.text,outline:"none",boxSizing:"border-box",fontFamily:"monospace",fontWeight:600}}/>
                          <div style={{fontSize:9,color:T.sub,marginTop:2}}>Мин. 1 000 ₽</div>
                        </div>
                        <div>
                          <div style={{fontSize:10,color:T.sub,marginBottom:4}}>Не чаще раз в день</div>
                          <input type="number" value={t.timesPerDay} min={1} max={10}
                            onChange={e=>updTopup(c.id,"timesPerDay",Math.max(1,Math.min(10,+e.target.value)))}
                            style={{width:"100%",background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 10px",fontSize:13,color:T.text,outline:"none",boxSizing:"border-box",fontFamily:"monospace",fontWeight:600}}/>
                        </div>
                      </div>
                      <div style={{fontSize:11,color:T.green,background:"rgba(74,222,128,0.06)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:8,padding:"7px 10px"}}>
                        ✅ {t.amount.toLocaleString("ru-RU")} ₽ — не чаще {t.timesPerDay} {t.timesPerDay===1?"раза":"раз"} в день
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}


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

  // ── localStorage helpers ──────────────────────────────────────────────────
  function loadLS(key,fallback){try{const v=localStorage.getItem(key);return v!=null?JSON.parse(v):fallback;}catch{return fallback;}}
  function saveLS(key,val){try{localStorage.setItem(key,JSON.stringify(val));}catch{}}

  const [drrWB,setDrrWBRaw]=useState(()=>loadLS("pf_drr_wb",null));
  const [catWB,setCatWBRaw]=useState(()=>loadLS("pf_cat_wb",""));
  const [budgetWB,setBudgetWBRaw]=useState(()=>loadLS("pf_budget_wb",null));
  const [drrOzon,setDrrOzonRaw]=useState(()=>loadLS("pf_drr_ozon",null));
  const [catOzon,setCatOzonRaw]=useState(()=>loadLS("pf_cat_ozon",""));
  const [budgetOzon,setBudgetOzonRaw]=useState(()=>loadLS("pf_budget_ozon",null));

  function setDrrWB(v){setDrrWBRaw(v);saveLS("pf_drr_wb",v);}
  function setCatWB(v){setCatWBRaw(v);saveLS("pf_cat_wb",v);}
  function setBudgetWB(v){setBudgetWBRaw(v);saveLS("pf_budget_wb",v);}
  function setDrrOzon(v){setDrrOzonRaw(v);saveLS("pf_drr_ozon",v);}
  function setCatOzon(v){setCatOzonRaw(v);saveLS("pf_cat_ozon",v);}
  function setBudgetOzon(v){setBudgetOzonRaw(v);saveLS("pf_budget_ozon",v);}

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



  const subs=SUB_TABS[mainTab];

  const BOTTOM_TABS=[
    {id:"dashboard",icon:"🏠",label:"Дашборд"},
    {id:"bids",     icon:"💰",label:"Ставки"},
    {id:"settings", icon:"⚙️", label:"Настройки"},
  ];

  return(
    <div style={{background:T.bg,color:T.text,fontFamily:"system-ui,sans-serif",minHeight:"100vh",paddingBottom:70}}>

      {/* ── ШАПКА ── */}
      <div style={{background:T.card,borderBottom:`1px solid ${T.border}`,padding:"10px 16px",position:"sticky",top:0,zIndex:30}}>
        <div style={{maxWidth:600,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:subs.length>1?8:0}}>
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
        {subTab==="overview"    &&<TabOverview    data={data} platform={platform} targetDrr={targetDrr} onGoToPlanFact={goToPlanFact}/>}
        {subTab==="funnel"      &&<TabFunnel      data={data} targetDrr={targetDrr}/>}
        {subTab==="diagnostics" &&<TabDiagnostics data={data} targetDrr={targetDrr} onGoToPlanFact={goToPlanFact}/>}
        {subTab==="planfact"    &&<TabPlanFact    data={data} targetDrr={targetDrr} onSetTargetDrr={setDrr} category={category} onSetCategory={setCat} budget={budget} onSetBudget={setBudget}/>}
        {/* platform passed from parent App via TabBids */}
        {mainTab==="bids"&&<BidsCabinetBalance platform={platform} inp={(e={})=>({width:"100%",background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:"9px 12px",fontSize:13,color:T.text,outline:"none",boxSizing:"border-box",...e})}/>}
        {subTab==="bids_smart"        &&<SmartBidsTab      data={data} targetDrr={targetDrr} inp={(e={})=>({width:"100%",background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:"9px 12px",fontSize:13,color:T.text,outline:"none",boxSizing:"border-box",...e})}/>}
        {subTab==="bids_strategy"     &&<StrategyTab        data={data} inp={(e={})=>({width:"100%",background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:"9px 12px",fontSize:13,color:T.text,outline:"none",boxSizing:"border-box",...e})}/>}
        {subTab==="bids_autostrategy" &&<AutoStrategyTab    data={data} targetDrr={targetDrr} inp={(e={})=>({width:"100%",background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:"9px 12px",fontSize:13,color:T.text,outline:"none",boxSizing:"border-box",...e})}/>}
        {subTab==="bids_balance"      &&<BidsCabinetBalance platform={platform} inp={(e={})=>({width:"100%",background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:"9px 12px",fontSize:13,color:T.text,outline:"none",boxSizing:"border-box",...e})}/>}
        {subTab==="bids_minus"        &&<TabAutoMinus       data={data}/>}
        {subTab==="settings_main" &&<TabSettings     currentUserTgId={tgUser.id}/>}
      </div>

      {/* ── НИЖНЯЯ НАВИГАЦИЯ ── */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:40,
        background:T.card,borderTop:`1px solid ${T.border}`,
        display:"flex",justifyContent:"space-around",alignItems:"center",
        padding:"8px 0 12px"}}>
        {BOTTOM_TABS.map(tab=>{
          const isActive=mainTab===tab.id;
          const hasDot=tab.id==="dashboard"&&!targetDrr;
          return(
            <button key={tab.id} onClick={()=>goMain(tab.id)}
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,
                background:"transparent",border:"none",cursor:"pointer",
                color:isActive?accent:T.sub,padding:"4px 24px",position:"relative",
                transition:"color 0.15s"}}>
              {hasDot&&<span style={{position:"absolute",top:0,right:18,width:7,height:7,borderRadius:"50%",background:T.yellow}}/>}
              <span style={{fontSize:22,lineHeight:1}}>{tab.icon}</span>
              <span style={{fontSize:10,fontWeight:isActive?700:400}}>{tab.label}</span>
              {isActive&&<div style={{position:"absolute",bottom:-12,left:"50%",transform:"translateX(-50%)",
                width:32,height:3,borderRadius:2,background:accent}}/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
