// @ts-nocheck
import { useState } from "react";

const T={bg:"#151c2e",card:"#1e2640",card2:"#252e4a",border:"rgba(255,255,255,0.07)",text:"#ffffff",sub:"#8892a4",green:"#4ade80",yellow:"#fbbf24",red:"#f87171",wb:"#7c3aed",ozon:"#2563eb"};
const S={card:{background:T.card,borderRadius:16,padding:16,border:`1px solid ${T.border}`},card2:{background:T.card2,borderRadius:12,padding:12,border:`1px solid ${T.border}`}};

// ── MOCK DATA ──────────────────────────────────────────────────────────────────
const DEMO={
  wb:{
    today:{revenue:285000,revenuePlan:450000,orders:187,ordersPlan:400,adSpend:38427,adSpendPlan:120000,conversion:3.2,conversionPlan:5,fromAd:{ordered:79,orderedRevenue:194900,buyoutPct:87.3}},
    budgetPlan:120000,revenuePlan:900000,ordersPlan:800,buyoutPlan:85,
    campaigns:[
      {id:1,name:"Кроссовки женские",drr:12.4,spend:38427,orders:187,cpo:205,status:"active",buyoutPct:89.2,orderedRevenue:142600,impressions:8200,ctr:0.92,cpm:185,revenue:310000,keywords:["кроссовки женские","кроссовки на платформе","белые кроссовки"]},
      {id:2,name:"Джинсы slim fit",drr:24.1,spend:15200,orders:31,cpo:490,status:"active",buyoutPct:71.4,orderedRevenue:28600,impressions:5400,ctr:0.71,cpm:155,revenue:63000,keywords:["джинсы slim fit","джинсы скинни"]},
      {id:3,name:"Белые кроссовки",drr:8.7,spend:9800,orders:62,cpo:158,status:"paused",buyoutPct:91.8,orderedRevenue:58100,impressions:4100,ctr:0.84,cpm:170,revenue:112000,keywords:["белые кроссовки"]},
    ],
    keywords:[
      {keyword:"кроссовки женские",campaignId:1,pos:3,posPrev:5,posSearch:3,posShelves:2,bidSearch:220,bidShelves:175,bidCompSearch:190,bidCompShelves:155,orders:187,baskets:240,ctr:1.42,drr:12.4,spend:826,revenue:6500,impressions:1063,clicks:15},
      {keyword:"кроссовки на платформе",campaignId:1,pos:12,posPrev:12,posSearch:12,posShelves:8,bidSearch:220,bidShelves:175,bidCompSearch:180,bidCompShelves:140,orders:94,baskets:120,ctr:0.94,drr:18.2,spend:580,revenue:3186,impressions:890,clicks:8},
      {keyword:"белые кроссовки",campaignId:3,pos:7,posPrev:5,posSearch:7,posShelves:5,bidSearch:210,bidShelves:170,bidCompSearch:165,bidCompShelves:130,orders:62,baskets:80,ctr:0.67,drr:21.5,spend:420,revenue:1953,impressions:760,clicks:5,alert:true},
      {keyword:"джинсы slim fit",campaignId:2,pos:22,posPrev:19,posSearch:22,posShelves:18,bidSearch:155,bidShelves:120,bidCompSearch:200,bidCompShelves:160,orders:18,baskets:35,ctr:0.47,drr:31.2,spend:285,revenue:913,impressions:520,clicks:2,alert:true},
      {keyword:"джинсы скинни",campaignId:2,pos:31,posPrev:27,posSearch:31,posShelves:25,bidSearch:145,bidShelves:110,bidCompSearch:190,bidCompShelves:150,orders:13,baskets:22,ctr:0.38,drr:28.7,spend:195,revenue:680,impressions:410,clicks:1,alert:true},
    ],
    daily:[
      {date:"11.03",dow:"ср",impressions:934,cpm:336,clicks:9,ctr:0.96,cpc:34.9,spend:314,baskets:4,cpl:105,orders:1,cpo:314,cro:11.11,drr:11.2,revenue:2800,sources:[{type:"поиск",pct:26,spend:82,impressions:245,clicks:4,ctr:1.63,orders:1},{type:"полки",pct:73,spend:232,impressions:684,clicks:5,ctr:0.73,orders:0}]},
      {date:"10.03",dow:"вт",impressions:1840,cpm:301,clicks:16,ctr:0.87,cpc:37.2,spend:553,baskets:3,cpl:184,orders:1,cpo:553,cro:6.25,drr:16.4,revenue:3370,sources:[{type:"поиск",pct:28,spend:155,impressions:515,clicks:7,ctr:1.36,orders:1},{type:"полки",pct:70,spend:387,impressions:1288,clicks:9,ctr:0.70,orders:0}]},
      {date:"09.03",dow:"пн",impressions:2968,cpm:341,clicks:25,ctr:0.84,cpc:40.4,spend:1011,baskets:3,cpl:337,orders:1,cpo:1011,cro:4.0,drr:28.5,revenue:3550,sources:[{type:"поиск",pct:27,spend:273,impressions:800,clicks:9,ctr:1.13,orders:1},{type:"полки",pct:73,spend:738,impressions:2168,clicks:16,ctr:0.74,orders:0}]},
      {date:"08.03",dow:"вс",impressions:3269,cpm:309,clicks:24,ctr:0.73,cpc:42.1,spend:1011,baskets:2,cpl:505,orders:1,cpo:1011,cro:8.33,drr:31.2,revenue:3240,sources:[{type:"поиск",pct:22,spend:222,impressions:708,clicks:7,ctr:0.99,orders:1},{type:"полки",pct:78,spend:789,impressions:2540,clicks:17,ctr:0.67,orders:0}]},
      {date:"07.03",dow:"сб",impressions:4120,cpm:298,clicks:31,ctr:0.75,cpc:38.2,spend:1184,baskets:5,cpl:237,orders:2,cpo:592,cro:6.45,drr:22.3,revenue:5310,sources:[{type:"поиск",pct:30,spend:355,impressions:1236,clicks:12,ctr:0.97,orders:2},{type:"полки",pct:70,spend:829,impressions:2884,clicks:19,ctr:0.66,orders:0}]},
      {date:"06.03",dow:"пт",impressions:3854,cpm:315,clicks:28,ctr:0.73,cpc:41.5,spend:1162,baskets:6,cpl:194,orders:2,cpo:581,cro:7.14,drr:19.8,revenue:5868,sources:[{type:"поиск",pct:28,spend:325,impressions:1079,clicks:10,ctr:0.93,orders:2},{type:"полки",pct:72,spend:837,impressions:2775,clicks:18,ctr:0.65,orders:0}]},
      {date:"05.03",dow:"чт",impressions:2100,cpm:290,clicks:18,ctr:0.86,cpc:38.0,spend:684,baskets:3,cpl:228,orders:1,cpo:684,cro:5.56,drr:16.4,revenue:4168,sources:[{type:"поиск",pct:32,spend:219,impressions:672,clicks:7,ctr:1.04,orders:1},{type:"полки",pct:68,spend:465,impressions:1428,clicks:11,ctr:0.77,orders:0}]},
    ],
    positions:[
      {keyword:"кроссовки женские",campaignId:1,freq:84295,dates:[{date:"11.03",promo:true,price:547,shows:">700",posSearch:3,posShelves:2,cpm:220},{date:"10.03",promo:true,price:547,shows:">700",posSearch:3,posShelves:2,cpm:215},{date:"09.03",promo:true,price:547,shows:">700",posSearch:4,posShelves:3,cpm:210},{date:"08.03",promo:true,price:547,shows:">700",posSearch:5,posShelves:3,cpm:205},{date:"07.03",promo:true,price:547,shows:">700",posSearch:6,posShelves:4,cpm:200},{date:"06.03",promo:true,price:520,shows:">700",posSearch:7,posShelves:5,cpm:195},{date:"05.03",promo:false,price:520,shows:">700",posSearch:7,posShelves:5,cpm:190}]},
      {keyword:"кроссовки на платформе",campaignId:1,freq:19745,dates:[{date:"11.03",promo:true,price:547,shows:">700",posSearch:12,posShelves:8,cpm:220},{date:"10.03",promo:true,price:547,shows:">700",posSearch:12,posShelves:8,cpm:215},{date:"09.03",promo:true,price:547,shows:">700",posSearch:13,posShelves:9,cpm:210},{date:"08.03",promo:true,price:547,shows:"650",posSearch:14,posShelves:9,cpm:205},{date:"07.03",promo:true,price:547,shows:"580",posSearch:15,posShelves:10,cpm:200},{date:"06.03",promo:true,price:520,shows:"520",posSearch:16,posShelves:11,cpm:195},{date:"05.03",promo:false,price:520,shows:"412",posSearch:16,posShelves:11,cpm:190}]},
      {keyword:"белые кроссовки",campaignId:3,freq:16330,dates:[{date:"11.03",promo:true,price:547,shows:"560",posSearch:7,posShelves:5,cpm:210},{date:"10.03",promo:true,price:547,shows:"530",posSearch:7,posShelves:5,cpm:205},{date:"09.03",promo:true,price:547,shows:"510",posSearch:8,posShelves:6,cpm:200},{date:"08.03",promo:true,price:547,shows:"490",posSearch:9,posShelves:6,cpm:195},{date:"07.03",promo:true,price:547,shows:"460",posSearch:10,posShelves:7,cpm:190},{date:"06.03",promo:true,price:520,shows:"420",posSearch:11,posShelves:8,cpm:185},{date:"05.03",promo:false,price:520,shows:"380",posSearch:11,posShelves:8,cpm:180}]},
      {keyword:"джинсы slim fit",campaignId:2,freq:19353,dates:[{date:"11.03",promo:true,price:547,shows:"320",posSearch:22,posShelves:18,cpm:155},{date:"10.03",promo:true,price:547,shows:"300",posSearch:22,posShelves:18,cpm:150},{date:"09.03",promo:true,price:547,shows:"280",posSearch:23,posShelves:19,cpm:145},{date:"08.03",promo:true,price:547,shows:"260",posSearch:24,posShelves:19,cpm:140},{date:"07.03",promo:true,price:547,shows:"240",posSearch:25,posShelves:20,cpm:135},{date:"06.03",promo:true,price:520,shows:"225",posSearch:26,posShelves:21,cpm:130},{date:"05.03",promo:false,price:520,shows:"210",posSearch:26,posShelves:21,cpm:125}]},
      {keyword:"джинсы скинни",campaignId:2,freq:7217,dates:[{date:"11.03",promo:true,price:547,shows:"180",posSearch:31,posShelves:25,cpm:145},{date:"10.03",promo:true,price:547,shows:"165",posSearch:31,posShelves:25,cpm:140},{date:"09.03",promo:true,price:547,shows:"155",posSearch:32,posShelves:26,cpm:135},{date:"08.03",promo:true,price:547,shows:"145",posSearch:33,posShelves:26,cpm:130},{date:"07.03",promo:true,price:547,shows:"135",posSearch:34,posShelves:27,cpm:125},{date:"06.03",promo:true,price:520,shows:"128",posSearch:35,posShelves:28,cpm:120},{date:"05.03",promo:false,price:520,shows:"120",posSearch:35,posShelves:28,cpm:115}]},
    ],
    clusters:[
      {keyword:"кроссовки женские",campaignId:1,freq:84295,cpm:220,avgPos:3,impressions:1063,clicks:15,ctr:1.42,cpc:55.1,spend:826,costShare:32.1,baskets:240,orders:187,revenue:6500},
      {keyword:"кроссовки на платформе",campaignId:1,freq:19745,cpm:220,avgPos:12,impressions:890,clicks:8,ctr:0.94,cpc:82.6,spend:580,costShare:19.8,baskets:120,orders:94,revenue:3186},
      {keyword:"белые кроссовки",campaignId:3,freq:16330,cpm:210,avgPos:7,impressions:760,clicks:5,ctr:0.67,cpc:84.0,spend:420,costShare:14.3,baskets:80,orders:62,revenue:1953,alert:true},
      {keyword:"джинсы slim fit",campaignId:2,freq:19353,cpm:155,avgPos:22,impressions:520,clicks:2,ctr:0.47,cpc:142.5,spend:285,costShare:9.7,baskets:35,orders:18,revenue:913,alert:true},
      {keyword:"джинсы скинни",campaignId:2,freq:7217,cpm:145,avgPos:31,impressions:410,clicks:1,ctr:0.38,cpc:195.0,spend:195,costShare:6.6,baskets:22,orders:13,revenue:680,alert:true},
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
      {id:10,campaignId:1,keyword:"обувь женская",impressions:1240,clicks:4,ctr:0.32,spend:410,orders:0,pos:87,deletedAt:"07.03.2026",deletedBy:"авто",reason:"CTR < 0.5%"},
      {id:11,campaignId:1,keyword:"туфли",impressions:890,clicks:2,ctr:0.22,spend:280,orders:0,pos:134,deletedAt:"12.03.2026",deletedBy:"авто",reason:"CTR < 0.5%"},
      {id:12,campaignId:2,keyword:"штаны мужские",impressions:320,clicks:3,ctr:0.94,spend:195,orders:0,pos:52,deletedAt:"25.02.2026",deletedBy:"ручное",reason:"Ручное удаление"},
      {id:13,campaignId:3,keyword:"кроссовки чёрные",impressions:560,clicks:2,ctr:0.36,spend:198,orders:0,pos:102,deletedAt:"09.03.2026",deletedBy:"авто",reason:"CTR < 0.5%"},
    ],
  },
  ozon:{
    today:{revenue:180000,revenuePlan:300000,orders:138,ordersPlan:400,adSpend:10000,adSpendPlan:60000,conversion:2.5,conversionPlan:4,fromAd:{ordered:79,orderedRevenue:194900,buyoutPct:87.3}},
    budgetPlan:60000,revenuePlan:600000,ordersPlan:600,buyoutPlan:80,
    campaigns:[
      {id:1,name:"Рюкзак туристический",drr:16.4,spend:72000,orders:220,cpo:327,status:"active",buyoutPct:82.5,orderedRevenue:88400,impressions:9100,ctr:0.88,cpm:195,revenue:440000,keywords:["рюкзак туристический","рюкзак для походов"]},
      {id:2,name:"Термокружка 450мл",drr:12.3,spend:52000,orders:150,cpo:347,status:"active",buyoutPct:91.3,orderedRevenue:64200,impressions:6800,ctr:1.12,cpm:165,revenue:423000,keywords:["термокружка 450мл","термокружка с крышкой"]},
      {id:3,name:"Куртка зимняя XL",drr:7.1,spend:58500,orders:190,cpo:308,status:"active",buyoutPct:88.7,orderedRevenue:125900,impressions:11200,ctr:1.31,cpm:220,revenue:825000,keywords:["куртка зимняя"]},
    ],
    keywords:[
      {keyword:"рюкзак туристический",campaignId:1,pos:8,posPrev:11,posSearch:8,posShelves:6,bidSearch:340,bidShelves:260,bidCompSearch:310,bidCompShelves:240,orders:220,baskets:310,ctr:1.21,drr:16.4,spend:720,revenue:4390,impressions:890,clicks:10},
      {keyword:"рюкзак для походов",campaignId:1,pos:15,posPrev:15,posSearch:15,posShelves:12,bidSearch:290,bidShelves:220,bidCompSearch:260,bidCompShelves:200,orders:95,baskets:130,ctr:0.88,drr:19.8,spend:480,revenue:2424,impressions:720,clicks:6},
      {keyword:"термокружка 450мл",campaignId:2,pos:4,posPrev:6,posSearch:4,posShelves:3,bidSearch:180,bidShelves:140,bidCompSearch:160,bidCompShelves:125,orders:150,baskets:210,ctr:1.54,drr:12.3,spend:520,revenue:4228,impressions:650,clicks:10},
      {keyword:"термокружка с крышкой",campaignId:2,pos:21,posPrev:18,posSearch:21,posShelves:16,bidSearch:155,bidShelves:120,bidCompSearch:175,bidCompShelves:140,orders:42,baskets:65,ctr:0.62,drr:23.1,spend:210,revenue:909,impressions:480,clicks:3,alert:true},
      {keyword:"куртка зимняя",campaignId:3,pos:3,posPrev:4,posSearch:3,posShelves:2,bidSearch:420,bidShelves:330,bidCompSearch:390,bidCompShelves:310,orders:190,baskets:260,ctr:1.38,drr:7.1,spend:585,revenue:8239,impressions:1100,clicks:15},
    ],
    daily:[
      {date:"11.03",dow:"ср",impressions:1240,cpm:285,clicks:14,ctr:1.13,cpc:28.5,spend:399,baskets:6,cpl:66,orders:2,cpo:200,cro:14.3,drr:8.9,revenue:4483,sources:[{type:"поиск",pct:35,spend:140,impressions:434,clicks:8,ctr:1.84,orders:2},{type:"полки",pct:65,spend:259,impressions:806,clicks:6,ctr:0.74,orders:0}]},
      {date:"10.03",dow:"вт",impressions:980,cpm:260,clicks:8,ctr:0.82,cpc:32.1,spend:257,baskets:3,cpl:86,orders:1,cpo:257,cro:12.5,drr:11.4,revenue:2254,sources:[{type:"поиск",pct:40,spend:103,impressions:392,clicks:5,ctr:1.28,orders:1},{type:"полки",pct:60,spend:154,impressions:588,clicks:3,ctr:0.51,orders:0}]},
      {date:"09.03",dow:"пн",impressions:3120,cpm:310,clicks:29,ctr:0.93,cpc:36.8,spend:1067,baskets:8,cpl:133,orders:3,cpo:356,cro:10.3,drr:14.2,revenue:7514,sources:[{type:"поиск",pct:38,spend:405,impressions:1186,clicks:14,ctr:1.18,orders:3},{type:"полки",pct:62,spend:662,impressions:1934,clicks:15,ctr:0.78,orders:0}]},
      {date:"08.03",dow:"вс",impressions:2840,cpm:295,clicks:22,ctr:0.77,cpc:38.9,spend:856,baskets:5,cpl:171,orders:2,cpo:428,cro:9.09,drr:18.6,revenue:4602,sources:[{type:"поиск",pct:36,spend:308,impressions:1022,clicks:10,ctr:0.98,orders:2},{type:"полки",pct:64,spend:548,impressions:1818,clicks:12,ctr:0.66,orders:0}]},
      {date:"07.03",dow:"сб",impressions:4320,cpm:305,clicks:38,ctr:0.88,cpc:34.2,spend:1300,baskets:9,cpl:144,orders:4,cpo:325,cro:10.5,drr:12.1,revenue:10744,sources:[{type:"поиск",pct:40,spend:520,impressions:1728,clicks:18,ctr:1.04,orders:4},{type:"полки",pct:60,spend:780,impressions:2592,clicks:20,ctr:0.77,orders:0}]},
      {date:"06.03",dow:"пт",impressions:3980,cpm:318,clicks:34,ctr:0.85,cpc:35.6,spend:1210,baskets:8,cpl:151,orders:3,cpo:403,cro:8.82,drr:13.8,revenue:8768,sources:[{type:"поиск",pct:38,spend:460,impressions:1512,clicks:15,ctr:0.99,orders:3},{type:"полки",pct:62,spend:750,impressions:2468,clicks:19,ctr:0.77,orders:0}]},
      {date:"05.03",dow:"чт",impressions:2600,cpm:275,clicks:20,ctr:0.77,cpc:35.0,spend:700,baskets:5,cpl:140,orders:2,cpo:350,cro:10.0,drr:10.5,revenue:6667,sources:[{type:"поиск",pct:37,spend:259,impressions:962,clicks:8,ctr:0.83,orders:2},{type:"полки",pct:63,spend:441,impressions:1638,clicks:12,ctr:0.73,orders:0}]},
    ],
    positions:[
      {keyword:"рюкзак туристический",campaignId:1,freq:62100,dates:[{date:"11.03",promo:true,price:3490,shows:">700",posSearch:8,posShelves:6,cpm:340},{date:"10.03",promo:true,price:3490,shows:">700",posSearch:8,posShelves:6,cpm:335},{date:"09.03",promo:true,price:3490,shows:">700",posSearch:9,posShelves:7,cpm:330},{date:"08.03",promo:true,price:3490,shows:">700",posSearch:10,posShelves:7,cpm:325},{date:"07.03",promo:true,price:3490,shows:">700",posSearch:11,posShelves:8,cpm:320},{date:"06.03",promo:true,price:3463,shows:">700",posSearch:12,posShelves:9,cpm:315},{date:"05.03",promo:false,price:3463,shows:">700",posSearch:12,posShelves:9,cpm:310}]},
      {keyword:"термокружка 450мл",campaignId:2,freq:24800,dates:[{date:"11.03",promo:true,price:890,shows:">700",posSearch:4,posShelves:3,cpm:180},{date:"10.03",promo:true,price:890,shows:">700",posSearch:4,posShelves:3,cpm:175},{date:"09.03",promo:true,price:890,shows:">700",posSearch:5,posShelves:4,cpm:170},{date:"08.03",promo:true,price:890,shows:"620",posSearch:6,posShelves:4,cpm:165},{date:"07.03",promo:true,price:890,shows:"580",posSearch:7,posShelves:5,cpm:160},{date:"06.03",promo:true,price:863,shows:"540",posSearch:8,posShelves:6,cpm:155},{date:"05.03",promo:false,price:863,shows:"510",posSearch:8,posShelves:6,cpm:150}]},
      {keyword:"куртка зимняя",campaignId:3,freq:91200,dates:[{date:"11.03",promo:true,price:6800,shows:">700",posSearch:3,posShelves:2,cpm:420},{date:"10.03",promo:true,price:6800,shows:">700",posSearch:3,posShelves:2,cpm:415},{date:"09.03",promo:true,price:6800,shows:">700",posSearch:4,posShelves:3,cpm:410},{date:"08.03",promo:true,price:6800,shows:">700",posSearch:5,posShelves:3,cpm:405},{date:"07.03",promo:true,price:6800,shows:">700",posSearch:6,posShelves:4,cpm:400},{date:"06.03",promo:true,price:6773,shows:">700",posSearch:7,posShelves:5,cpm:395},{date:"05.03",promo:false,price:6773,shows:">700",posSearch:7,posShelves:5,cpm:390}]},
    ],
    clusters:[
      {keyword:"рюкзак туристический",campaignId:1,freq:62100,cpm:340,avgPos:8,impressions:890,clicks:10,ctr:1.21,cpc:72.0,spend:720,costShare:28.5,baskets:310,orders:220,revenue:4390},
      {keyword:"термокружка 450мл",freq:24800,cpm:180,avgPos:4,impressions:650,clicks:10,ctr:1.54,cpc:52.0,spend:520,costShare:20.6,baskets:210,orders:150,revenue:4228,best:true},
      {keyword:"куртка зимняя",freq:91200,cpm:420,avgPos:3,impressions:1100,clicks:15,ctr:1.38,cpc:39.0,spend:585,costShare:23.2,baskets:260,orders:190,revenue:8239},
    ],
    minusActive:[
      {id:1,campaignId:1,keyword:"рюкзак детский",impressions:620,clicks:2,ctr:0.32,spend:186,orders:0,addedDaysAgo:2,reason:"low_ctr"},
      {id:2,campaignId:2,keyword:"сумка дорожная",impressions:440,clicks:1,ctr:0.23,spend:132,orders:0,addedDaysAgo:4,reason:"low_ctr"},
    ],
    minusArchive:[
      {id:10,campaignId:1,keyword:"чемодан",impressions:980,clicks:3,ctr:0.31,spend:294,orders:0,deletedAt:"08.03.2026",deletedBy:"авто",reason:"CTR < 0.5%"},
      {id:11,campaignId:2,keyword:"сумка городская",impressions:560,clicks:2,ctr:0.36,spend:168,orders:0,deletedAt:"12.03.2026",deletedBy:"ручное",reason:"Ручное удаление"},
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

function getDrrStatus(drr,target){
  if(!target||drr==null||drr===0)return"neutral";
  if(drr<=target*0.9)return"great";
  if(drr<=target)return"good";
  if(drr<=target*1.15)return"warn";
  return"bad";
}
const DRR_ST={great:{c:T.green,l:"↓ ниже цели"},good:{c:T.green,l:"✓ норма"},warn:{c:T.yellow,l:"↑ растёт"},bad:{c:T.red,l:"↑↑ высокий"},neutral:{c:T.sub,l:""}};

function DrrBadge({drr,target}){
  if(!drr||drr===0)return<span style={{color:T.sub,fontFamily:"monospace"}}>—</span>;
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
  if(ctr>=3)return{bg:"rgba(124,58,237,0.25)",c:"#c4b5fd"};
  if(ctr>=1)return{bg:"rgba(74,222,128,0.18)",c:"#4ade80"};
  if(ctr>=0.7)return{bg:"rgba(255,255,255,0.06)",c:T.text};
  return{bg:"rgba(248,113,113,0.2)",c:"#fca5a5"};
}

function SectionTitle({children,marginBottom=10}){
  return<div style={{fontSize:11,fontWeight:700,color:T.sub,letterSpacing:1,textTransform:"uppercase",marginBottom}}>{children}</div>;
}

function getCampScale(campaigns,selCamp){
  if(selCamp==="all"||!selCamp)return{spendScale:1,ordersScale:1,camp:null};
  const allSpend=campaigns.reduce((s,c)=>s+c.spend,0)||1;
  const allOrders=campaigns.reduce((s,c)=>s+c.orders,0)||1;
  const camp=campaigns.find(c=>String(c.id)===String(selCamp));
  if(!camp)return{spendScale:1,ordersScale:1,camp:null};
  return{spendScale:camp.spend/allSpend,ordersScale:camp.orders/allOrders,camp};
}

function scaleDays(days,spendScale,ordersScale){
  return days.map(d=>({
    ...d,
    spend:d.spend*spendScale,
    revenue:d.revenue*ordersScale,
    impressions:d.impressions*spendScale,
    clicks:d.clicks*spendScale,
    baskets:d.baskets*ordersScale,
    orders:d.orders*ordersScale,
    sources:(d.sources||[]).map(s=>({...s,spend:(s.spend||0)*spendScale,impressions:(s.impressions||0)*spendScale,clicks:(s.clicks||0)*spendScale,orders:(s.orders||0)*ordersScale})),
  }));
}

// ── Toggle helper ──────────────────────────────────────────────────────────────
function Toggle({value,onChange,color="#4ade80"}){
  return(
    <div onClick={onChange} style={{cursor:"pointer"}}>
      <div style={{width:42,height:24,borderRadius:12,background:value?`${color}40`:"rgba(255,255,255,0.08)",border:`1px solid ${value?color:T.border}`,position:"relative"}}>
        <div style={{position:"absolute",top:3,left:value?21:3,width:16,height:16,borderRadius:"50%",background:value?color:T.sub,transition:"left 0.2s"}}/>
      </div>
    </div>
  );
}

const PERIODS=[{id:"today",l:"Сегодня"},{id:"yesterday",l:"Вчера"},{id:"7d",l:"7 дней"},{id:"custom",l:"Период"}];

function PeriodPicker({period,onChange,campaigns,selectedCampaign,onChangeCampaign}){
  const [customFrom,setCustomFrom]=useState("07.03.2026");
  const [customTo,setCustomTo]=useState("11.03.2026");
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

function CampaignSelect({campaigns,value,onChange,style={}}){
  return(
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{background:T.card2,border:`1px solid rgba(124,58,237,0.4)`,borderRadius:9,padding:"6px 10px",fontSize:12,color:T.text,outline:"none",cursor:"pointer",width:"100%",marginBottom:12,...style}}>
      <option value="all">📋 Все кампании</option>
      {(campaigns||[]).map(c=><option key={c.id} value={String(c.id)}>{c.name}</option>)}
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
  const [metricsPeriod,setMetricsPeriod]=useState("7d");
  const [overviewCamp,setOverviewCamp]=useState("all");
  function getPeriodDays(period){
    if(period==="today")return allDays.slice(0,1);
    if(period==="yesterday")return allDays.slice(1,2);
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
  const week=allDays.slice(0,7);
  const avgCpm=totalImpr>0?totalSpend/totalImpr*1000:0;
  const avgCtr=totalImpr>0?totalClicks/totalImpr*100:0;
  const avgCpc=totalClicks>0?totalSpend/totalClicks:0;
  const avgCpl=totalBaskets>0?totalSpend/totalBaskets:0;
  const avgCpo=totalOrders>0?totalSpend/totalOrders:0;
  const cro=totalBaskets>0?totalOrders/totalBaskets*100:0;
  const drrSt=getDrrStatus(factDrr,targetDrr);
  const basketToday=today?.baskets||0;
  const basketYest=yesterday?.baskets||0;
  const basketDiff=basketToday-basketYest;
  const basketPct=basketYest>0?basketDiff/basketYest*100:0;
  const budgetSpendPct=data.budgetPlan>0?Math.round(totalSpend/data.budgetPlan*100):null;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
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
      <div style={S.card}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
          <SectionTitle marginBottom={0}>Сегодня</SectionTitle>
          <span style={{fontSize:11,color:T.sub}}>{platform==="wb"?"🟣 Wildberries":"🔵 Ozon"}</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          {[
            {icon:"💰",label:"Выручка",val:fmt.rubK(d.revenue),plan:d.revenuePlan,valRaw:d.revenue},
            {icon:"📦",label:"Заказы",val:d.orders,plan:d.ordersPlan,valRaw:d.orders},
            {icon:"📢",label:"Расход",val:fmt.rubK(d.adSpend),plan:d.adSpendPlan,valRaw:d.adSpend},
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
                  return<div key={i} style={{width:6,height:h,borderRadius:2,background:i===week.length-1?"#a78bfa":"rgba(167,139,250,0.35)"}}/>;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <CampaignSelect campaigns={data.campaigns} value={overviewCamp} onChange={setOverviewCamp} style={{marginBottom:4}}/>
      <div style={S.card}>
        <SectionTitle>📊 Метрики рекламы</SectionTitle>
        <PeriodSwitch value={metricsPeriod} onChange={setMetricsPeriod}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
          {[
            {l:"Показы",v:fmt.num(totalImpr),sub:""},
            {l:"Клики",v:fmt.num(totalClicks),sub:""},
            {l:"CPM ср.",v:fmt.rub(avgCpm),sub:"за 1000 показов"},
            {l:"CTR",v:fmt.pct(avgCtr),sub:"клики/показы"},
            {l:"CPC",v:fmt.rub(avgCpc),sub:"цена клика"},
            {l:"CPL",v:fmt.rub(avgCpl),sub:"цена корзины"},
            {l:"CPO",v:fmt.rub(avgCpo),sub:"цена заказа"},
            {l:"CRO",v:fmt.pct1(cro),sub:"корзина→заказ"},
          ].map(m=>(
            <div key={m.l} style={{...S.card2,padding:"9px 10px"}}>
              <div style={{fontSize:10,color:T.sub,marginBottom:2}}>{m.l}</div>
              <div style={{fontSize:16,fontWeight:700,fontFamily:"monospace",color:T.text}}>{m.v}</div>
              {m.sub&&<div style={{fontSize:9,color:T.sub,marginTop:1}}>{m.sub}</div>}
            </div>
          ))}
        </div>
        {(()=>{
          const campObj=overviewCamp==="all"?null:data.campaigns.find(c=>String(c.id)===String(overviewCamp));
          const adOrdered=campObj?campObj.orders:data.campaigns.reduce((s,c)=>s+c.orders,0);
          const adRevenue=campObj?campObj.orderedRevenue||Math.round(campObj.orders*campObj.cpo*3.2):d.fromAd.orderedRevenue;
          const buyoutPct=campObj?campObj.buyoutPct:d.fromAd.buyoutPct;
          const crf=totalBaskets>0&&totalOrders>0?(totalOrders/totalBaskets*100).toFixed(1):null;
          return(
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {[
                {l:"📋 Заказано с рекламы",v:`${adOrdered} шт | ${fmt.rubK(adRevenue)}`},
                {l:"📊 % выкупа трафика",v:`${buyoutPct}%`,c:buyoutPct>=80?T.green:buyoutPct>=60?T.yellow:T.red},
                {l:"💸 Доля затрат в выручке",v:totalRev>0?`${(totalSpend/totalRev*100).toFixed(1)}%`:"—"},
                {l:"📈 CRF (корзина→заказ)",v:crf?`${crf}%`:"—"},
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
      <div style={S.card}>
        <SectionTitle>По кампаниям</SectionTitle>
        {[...data.campaigns].sort((a,b)=>b.drr-a.drr).map(c=>{
          const drrSt2=getDrrStatus(c.drr,targetDrr);
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
// ВОРОНКА
// ═══════════════════════════════════════════════════════════════════════════════
function TabFunnel({data,targetDrr}){
  const [period,setPeriod]=useState("7d");
  const [selCamp,setSelCamp]=useState("all");
  const allDays=data.daily;
  const days=period==="today"?allDays.slice(0,1):period==="yesterday"?allDays.slice(1,2):allDays;
  const kws=selCamp==="all"?data.keywords:data.keywords.filter(k=>String(k.campaignId)===String(selCamp));
  const {spendScale:funnelScale,ordersScale:funnelOrdScale}=getCampScale(data.campaigns,selCamp);
  const funnelDays=scaleDays(days,funnelScale,funnelOrdScale);
  const totals={
    impressions:funnelDays.reduce((s,d)=>s+d.impressions,0),
    clicks:funnelDays.reduce((s,d)=>s+d.clicks,0),
    baskets:funnelDays.reduce((s,d)=>s+d.baskets,0),
    orders:funnelDays.reduce((s,d)=>s+d.orders,0),
  };
  const steps=[
    {label:"👁 Показы",val:totals.impressions,pct:100,cr:null},
    {label:"👆 Клики",val:totals.clicks,pct:totals.impressions?+(totals.clicks/totals.impressions*100).toFixed(2):0,cr:"CTR"},
    {label:"🛒 Корзины",val:totals.baskets,pct:totals.clicks?+(totals.baskets/totals.clicks*100).toFixed(1):0,cr:"CR корзина"},
    {label:"📦 Заказы",val:totals.orders,pct:totals.baskets?+(totals.orders/totals.baskets*100).toFixed(1):0,cr:"CR заказ"},
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
  const rawDays=data.daily.filter(d=>d.drr>0);
  const days=scaleDays(rawDays,diagScale,diagOrdScale);
  const totalSpend=days.reduce((s,d)=>s+d.spend,0);
  const totalRevenue=days.reduce((s,d)=>s+d.revenue,0);
  const factDrr=totalRevenue>0?totalSpend/totalRevenue*100:null;
  const diagClusters=selCamp==="all"?data.clusters:data.clusters.filter(k=>String(k.campaignId)===String(selCamp));
  const totalCtr=diagClusters.reduce((s,k)=>s+k.impressions,0)?diagClusters.reduce((s,k)=>s+k.clicks,0)/diagClusters.reduce((s,k)=>s+k.impressions,0)*100:0;
  const issues=[];
  if(targetDrr&&factDrr&&factDrr>targetDrr*1.15)issues.push({level:"critical",icon:"🔴",title:"ДРР значительно выше цели",desc:`Факт ${factDrr.toFixed(1)}% при цели ${targetDrr}%. Превышение: +${(factDrr-targetDrr).toFixed(1)}%.`,rec:"Снизьте ставки у кампаний с высоким ДРР или уменьшите бюджет."});
  else if(targetDrr&&factDrr&&factDrr>targetDrr)issues.push({level:"warn",icon:"🟡",title:"ДРР чуть выше цели",desc:`Факт ${factDrr.toFixed(1)}% при цели ${targetDrr}%.`,rec:"Оптимизируйте ключи с нулевыми заказами и высоким расходом."});
  else if(targetDrr&&factDrr)issues.push({level:"ok",icon:"🟢",title:"ДРР в норме",desc:`Факт ${factDrr.toFixed(1)}% — в рамках цели ${targetDrr}%.`,rec:""});
  else issues.push({level:"warn",icon:"🟡",title:"Целевой ДРР не установлен",desc:"Невозможно оценить эффективность без ориентира.",rec:"Установите целевой ДРР в разделе «План/Факт».",action:{label:"Установить →",fn:onGoToPlanFact}});
  if(totalCtr<0.7)issues.push({level:"critical",icon:"🔴",title:"Низкий CTR в кластерах",desc:`Средний CTR ${totalCtr.toFixed(2)}% — ниже нормы 0.7%.`,rec:"Проверьте главное фото, заголовок и цену."});
  const fallingKws=diagKws.filter(k=>k.posPrev-k.pos<-2);
  if(fallingKws.length>0)issues.push({level:"critical",icon:"🔴",title:`Позиции падают: ${fallingKws.length} ключей`,desc:fallingKws.map(k=>`«${k.keyword}» ${k.posPrev}→${k.pos}`).join(", "),rec:"Повысьте ставки CPM на эти ключевые слова."});
  const bidRecs=diagKws.map(kw=>{
    const drr=kw.revenue>0?kw.spend/kw.revenue*100:null;
    let action,newBidSearch,newBidShelves,reason,priority;
    if(kw.pos>15&&kw.ctr>=0.9){action="↑ повысить";newBidSearch=kw.bidSearch+40;newBidShelves=kw.bidShelves+30;reason="Позиция низкая при хорошем CTR";priority=1;}
    else if(kw.ctr<0.5&&kw.pos<=20){action="↓ снизить";newBidSearch=Math.max(kw.bidSearch-30,80);newBidShelves=Math.max(kw.bidShelves-25,60);reason="Низкий CTR — ставка не окупается";priority=2;}
    else if(targetDrr&&drr&&drr>targetDrr*1.2){action="↓ снизить";newBidSearch=Math.max(kw.bidSearch-20,80);newBidShelves=Math.max(kw.bidShelves-15,60);reason=`ДРР ${drr.toFixed(1)}% — выше цели`;priority=2;}
    else{action="→ держать";newBidSearch=kw.bidSearch;newBidShelves=kw.bidShelves;reason="Стабильные показатели";priority=3;}
    return{keyword:kw.keyword,action,curSearch:kw.bidSearch,newSearch:newBidSearch,curShelves:kw.bidShelves,newShelves:newBidShelves,compSearch:kw.bidCompSearch,compShelves:kw.bidCompShelves,reason,priority,drr,pos:kw.posSearch,ctr:kw.ctr};
  }).sort((a,b)=>a.priority-b.priority);
  const [diagBids,setDiagBids]=useState(()=>data.keywords.reduce((acc,k)=>({...acc,[k.keyword]:{search:k.bidSearch,shelves:k.bidShelves}}),{}));
  const [appliedBids,setAppliedBids]=useState(new Set());
  const [diagToast,setDiagToast]=useState("");
  function diagShowToast(msg){setDiagToast(msg);setTimeout(()=>setDiagToast(""),3000);}
  function applyDiagBid(keyword,search,shelves){
    setDiagBids(p=>({...p,[keyword]:{search,shelves}}));
    setAppliedBids(p=>{const n=new Set(p);n.add(keyword);return n;});
    diagShowToast(`✅ Ставки «${keyword}» обновлены`);
  }
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {diagToast&&(
        <div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",zIndex:99,background:"rgba(74,222,128,0.95)",color:"#fff",fontWeight:700,fontSize:13,padding:"10px 20px",borderRadius:12,pointerEvents:"none"}}>
          {diagToast}
        </div>
      )}
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
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <SectionTitle marginBottom={0}>📊 Рекомендации по ставкам</SectionTitle>
          <CampaignSelect campaigns={data.campaigns} value={selCamp} onChange={setSelCamp} style={{marginBottom:0,width:"auto"}}/>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {bidRecs.map((r,i)=>{
            const actionCol=r.action.startsWith("↑")?T.green:r.action.startsWith("↓")?T.red:T.sub;
            const curBid=diagBids[r.keyword]||{search:r.curSearch,shelves:r.curShelves};
            const isApplied=appliedBids.has(r.keyword);
            const hasChanges=curBid.search!==r.curSearch||curBid.shelves!==r.curShelves;
            return(
              <div key={i} style={{...S.card2,border:`1px solid ${isApplied?"rgba(74,222,128,0.3)":T.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:12,color:T.text,fontWeight:700}}>{r.keyword}</span>
                      {isApplied&&<span style={{fontSize:10,color:"#6ee7b7",background:"rgba(74,222,128,0.15)",padding:"1px 7px",borderRadius:8}}>✓ применено</span>}
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
                {r.action!=="→ держать"&&(
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:r.action.startsWith("↑")?"rgba(74,222,128,0.06)":"rgba(248,113,113,0.06)",border:`1px solid ${r.action.startsWith("↑")?"rgba(74,222,128,0.2)":"rgba(248,113,113,0.2)"}`,borderRadius:8,padding:"6px 10px",marginBottom:8}}>
                    <span style={{fontSize:11,color:actionCol,fontWeight:600}}>{r.action} ставки</span>
                    <button onClick={()=>applyDiagBid(r.keyword,r.newSearch,r.newShelves)}
                      style={{background:r.action.startsWith("↑")?"rgba(74,222,128,0.2)":"rgba(248,113,113,0.15)",color:actionCol,border:`1px solid ${actionCol}40`,borderRadius:7,padding:"4px 12px",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                      Применить
                    </button>
                  </div>
                )}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[{label:"🔍 Поиск CPM",field:"search",rec:r.newSearch,comp:r.compSearch},{label:"🗂 Полки CPM",field:"shelves",rec:r.newShelves,comp:r.compShelves}].map(f=>{
                    const val=curBid[f.field];
                    const changed=val!==(f.field==="search"?r.curSearch:r.curShelves);
                    return(
                      <div key={f.field} style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"8px 10px",border:`1px solid ${T.border}`}}>
                        <div style={{fontSize:10,color:T.sub,marginBottom:5,fontWeight:600}}>{f.label}</div>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:T.sub,marginBottom:5}}>
                          <span>Сейчас: <b style={{color:T.text}}>{f.field==="search"?r.curSearch:r.curShelves} ₽</b></span>
                          <span>Рек: <b style={{color:actionCol}}>{f.rec} ₽</b></span>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:4}}>
                          <button onClick={()=>setDiagBids(p=>({...p,[r.keyword]:{...p[r.keyword],[f.field]:Math.max(50,val-10)}}))}
                            style={{width:34,height:34,borderRadius:8,border:`1px solid ${T.border}`,background:"rgba(248,113,113,0.08)",color:T.red,fontSize:16,cursor:"pointer"}}>−</button>
                          <input type="number" value={val}
                            onChange={e=>setDiagBids(p=>({...p,[r.keyword]:{...p[r.keyword],[f.field]:+e.target.value||50}}))}
                            style={{flex:1,background:changed?"rgba(251,191,36,0.08)":"rgba(255,255,255,0.04)",border:`1px solid ${changed?"rgba(251,191,36,0.4)":T.border}`,borderRadius:8,padding:"8px 4px",fontSize:14,fontFamily:"monospace",fontWeight:700,color:changed?T.yellow:T.text,outline:"none",textAlign:"center"}}/>
                          <button onClick={()=>setDiagBids(p=>({...p,[r.keyword]:{...p[r.keyword],[f.field]:Math.min(2000,val+10)}}))}
                            style={{width:34,height:34,borderRadius:8,border:`1px solid ${T.border}`,background:"rgba(74,222,128,0.08)",color:T.green,fontSize:16,cursor:"pointer"}}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {hasChanges&&!isApplied&&(
                  <button onClick={()=>applyDiagBid(r.keyword,curBid.search,curBid.shelves)}
                    style={{marginTop:8,width:"100%",padding:"9px",borderRadius:10,border:"1px solid rgba(124,58,237,0.4)",background:"rgba(124,58,237,0.15)",color:"#c4b5fd",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                    ✓ Применить изменения
                  </button>
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
// ПЛАН/ФАКТ
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
    onSetTargetDrr(v);onSetCategory(inputCat||"Без категории");
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
            <div style={{display:"flex",alignItems:"center",gap:16}}>
              <div style={{fontSize:52,fontWeight:700,fontFamily:"monospace",color:T.text,lineHeight:1}}>{targetDrr}%</div>
              <div>
                <div style={{fontSize:11,color:T.sub,marginBottom:4}}>Целевой ДРР</div>
                {category&&<div style={{fontSize:11,color:"#a78bfa",background:"rgba(167,139,250,0.15)",border:"1px solid rgba(167,139,250,0.25)",borderRadius:20,padding:"3px 10px",display:"inline-block"}}>{category}</div>}
              </div>
            </div>
            {budget>0&&(
              <div style={S.card2}>
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
// АВТО-МИНУСОВКА
// ═══════════════════════════════════════════════════════════════════════════════
function TabAutoMinus({data}){
  const [subTab,setSubTab]=useState("active");
  const [mode,setMode]=useState("manual");
  const [selCamp,setSelCamp]=useState("all");
  const [selected,setSelected]=useState(new Set());
  const [archived,setArchived]=useState(data.minusArchive);
  const [active,setActive]=useState(data.minusActive);
  const REASON_LABELS={low_ctr:"CTR ниже нормы",no_orders:"Нет заказов",high_drr:"Высокий ДРР",manual:"Ручное",restored:"Восстановлен"};
  const filtActive=selCamp==="all"?active:active.filter(k=>String(k.campaignId)===String(selCamp));
  const filtArchived=selCamp==="all"?archived:archived.filter(k=>String(k.campaignId)===String(selCamp));
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
      <div style={{display:"flex",gap:4,marginBottom:4}}>
        {[{id:"active",label:`Нерелевантные (${filtActive.length})`},{id:"archive",label:`Архив (${filtArchived.length})`}].map(t=>(
          <button key={t.id} onClick={()=>setSubTab(t.id)}
            style={{padding:"7px 11px",borderRadius:9,border:`1px solid ${subTab===t.id?"rgba(124,58,237,0.5)":"rgba(255,255,255,0.08)"}`,cursor:"pointer",fontSize:12,fontWeight:subTab===t.id?700:400,background:subTab===t.id?"rgba(124,58,237,0.2)":"rgba(255,255,255,0.04)",color:subTab===t.id?"#c4b5fd":T.sub}}>
            {t.label}
          </button>
        ))}
      </div>
      {subTab==="active"&&(
        <div style={S.card}>
          {mode==="manual"&&selected.size>0&&(
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:10,padding:"8px 12px"}}>
              <span style={{fontSize:12,color:T.red}}>Выбрано: {selected.size}</span>
              <button onClick={()=>{
                const toArc=active.filter(k=>selected.has(k.id)).map(k=>({...k,deletedAt:new Date().toLocaleDateString("ru-RU"),deletedBy:"ручное",reason:"Ручное удаление"}));
                setArchived(prev=>[...toArc,...prev]);setActive(prev=>prev.filter(k=>!selected.has(k.id)));setSelected(new Set());
              }} style={{background:"#dc2626",color:"#fff",border:"none",borderRadius:8,padding:"5px 14px",fontSize:12,fontWeight:700,cursor:"pointer"}}>Удалить выбранные</button>
            </div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {filtActive.map(kw=>(
              <div key={kw.id} style={{...S.card2,border:`1px solid ${selected.has(kw.id)?"rgba(248,113,113,0.4)":T.border}`,background:selected.has(kw.id)?"rgba(248,113,113,0.06)":T.card2}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  {mode==="manual"&&<input type="checkbox" checked={selected.has(kw.id)} onChange={()=>setSelected(prev=>{const n=new Set(prev);n.has(kw.id)?n.delete(kw.id):n.add(kw.id);return n;})} style={{marginTop:3,accentColor:"#dc2626",flexShrink:0}}/>}
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                      <div>
                        <div style={{fontSize:13,color:T.text,fontWeight:600}}>{kw.keyword}</div>
                        <div style={{fontSize:11,color:T.sub,marginTop:2}}>Причина: {REASON_LABELS[kw.reason]||kw.reason} · {kw.addedDaysAgo}д. назад</div>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,marginBottom:8}}>
                      {[{l:"Показы",v:fmt.num(kw.impressions)},{l:"CTR",v:fmt.pct(kw.ctr),c:kw.ctr<0.5?T.red:T.text},{l:"Расход",v:fmt.rub(kw.spend),c:T.yellow},{l:"Заказы",v:kw.orders,c:kw.orders===0?T.red:T.green}].map(m=>(
                        <div key={m.l} style={{textAlign:"center",background:"rgba(255,255,255,0.02)",borderRadius:6,padding:"4px 2px"}}>
                          <div style={{fontSize:8,color:T.sub}}>{m.l}</div>
                          <div style={{fontSize:12,fontFamily:"monospace",fontWeight:600,color:m.c||T.text}}>{m.v}</div>
                        </div>
                      ))}
                    </div>
                    <button onClick={()=>{
                      const toArc={...kw,deletedAt:new Date().toLocaleDateString("ru-RU"),deletedBy:"ручное",reason:"Нерелевантный запрос"};
                      setArchived(prev=>[toArc,...prev]);setActive(prev=>prev.filter(k=>k.id!==kw.id));
                    }} style={{width:"100%",padding:"8px",borderRadius:8,background:"rgba(248,113,113,0.08)",color:T.red,border:"1px solid rgba(248,113,113,0.2)",fontSize:12,fontWeight:600,cursor:"pointer"}}>🗑 Удалить в архив</button>
                  </div>
                </div>
              </div>
            ))}
            {filtActive.length===0&&<div style={{textAlign:"center",padding:24,color:T.sub,fontSize:13}}>✅ Нет нерелевантных запросов</div>}
          </div>
        </div>
      )}
      {subTab==="archive"&&(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {filtArchived.map(kw=>(
            <div key={kw.id} style={{...S.card2,borderLeft:"3px solid rgba(248,113,113,0.3)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div>
                  <div style={{fontSize:13,color:T.text,fontWeight:700}}>{kw.keyword}</div>
                  <div style={{fontSize:10,color:T.sub,marginTop:3}}>удалён {kw.deletedAt} · {kw.deletedBy==="авто"?"🤖 авто":"✋ ручное"} · {kw.reason}</div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4,marginBottom:10}}>
                {[{l:"Показы",v:fmt.num(kw.impressions)},{l:"CTR",v:fmt.pct(kw.ctr),c:kw.ctr<0.5?T.red:T.green},{l:"Расход",v:fmt.rub(kw.spend),c:T.yellow},{l:"Заказы",v:kw.orders||0,c:(kw.orders||0)>0?T.green:T.sub}].map(m=>(
                  <div key={m.l} style={{textAlign:"center",background:"rgba(255,255,255,0.02)",borderRadius:6,padding:"4px 2px"}}>
                    <div style={{fontSize:8,color:T.sub}}>{m.l}</div>
                    <div style={{fontSize:11,fontFamily:"monospace",fontWeight:600,color:m.c||T.text}}>{m.v}</div>
                  </div>
                ))}
              </div>
              <button onClick={()=>restore(kw.id)} style={{width:"100%",padding:"9px 6px",borderRadius:9,border:"1px solid rgba(74,222,128,0.35)",background:"rgba(74,222,128,0.1)",color:"#6ee7b7",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                ↩ Вернуть в кампанию
              </button>
            </div>
          ))}
          {filtArchived.length===0&&<div style={{...S.card,textAlign:"center",padding:"32px 20px"}}><div style={{fontSize:28,marginBottom:8}}>📦</div><div style={{fontSize:13,color:T.text,fontWeight:600}}>Архив пуст</div></div>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// НАСТРОЙКИ
// ═══════════════════════════════════════════════════════════════════════════════
function TabSettings({currentUserTgId}){
  const [wbKey,setWbKey]=useState("");
  const [ozonKey,setOzonKey]=useState("");
  const [ozonClientId,setOzonClientId]=useState("");
  const [wbSaved,setWbSaved]=useState(false);
  const [ozonSaved,setOzonSaved]=useState(false);
  const employees=[
    {id:1,name:"Анна Иванова",tgUsername:"anna_ivanova",tgId:"123456789",role:"Менеджер",access:["wb","ozon"]},
    {id:2,name:"Дмитрий Петров",tgUsername:"dmitry_petrov",tgId:"987654321",role:"Аналитик",access:["wb"]},
  ];
  const inp={width:"100%",background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 12px",fontSize:13,color:T.text,outline:"none",boxSizing:"border-box"};
  const ROLE_COLORS={"Администратор":"#f59e0b","Менеджер":"#a78bfa","Аналитик":"#38bdf8","Только просмотр":"#8892a4"};
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12,maxWidth:520}}>
      <div style={{...S.card,background:"rgba(167,139,250,0.06)",borderColor:"rgba(167,139,250,0.2)"}}>
        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
          <span style={{fontSize:22}}>🔐</span>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:T.text,marginBottom:4}}>Доступ по Telegram ID</div>
            <div style={{fontSize:11,color:T.sub,lineHeight:1.8}}>Приложение открывается только у приглашённых пользователей.</div>
            <div style={{marginTop:10,display:"inline-flex",alignItems:"center",gap:6,background:"rgba(167,139,250,0.12)",border:"1px solid rgba(167,139,250,0.3)",borderRadius:8,padding:"6px 12px"}}>
              <span style={{fontSize:14}}>🤖</span>
              <span style={{fontSize:12,color:"#c4b5fd",fontWeight:600}}>Управление через бота → /adduser</span>
            </div>
          </div>
        </div>
      </div>
      <div style={S.card}>
        <SectionTitle>🟣 Wildberries — API ключ</SectionTitle>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div>
            <div style={{fontSize:11,color:T.sub,marginBottom:5}}>API ключ</div>
            <input type="password" value={wbKey} onChange={e=>{setWbKey(e.target.value);setWbSaved(false);}} placeholder="eyJhbGciOiJSUzI1NiIsInR5c..." style={{...inp,fontFamily:"monospace"}}/>
          </div>
          <button onClick={()=>setWbSaved(true)} style={{background:wbSaved?"rgba(74,222,128,0.15)":T.wb,color:wbSaved?T.green:"#fff",border:wbSaved?"1px solid rgba(74,222,128,0.3)":"none",borderRadius:10,padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer",width:"100%"}}>
            {wbSaved?"✅ Сохранено":"Подключить WB"}
          </button>
        </div>
      </div>
      <div style={S.card}>
        <SectionTitle>🔵 Ozon — API ключ</SectionTitle>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div>
            <div style={{fontSize:11,color:T.sub,marginBottom:5}}>Client ID</div>
            <input value={ozonClientId} onChange={e=>{setOzonClientId(e.target.value);setOzonSaved(false);}} placeholder="12345678" style={{...inp,fontFamily:"monospace"}}/>
          </div>
          <div>
            <div style={{fontSize:11,color:T.sub,marginBottom:5}}>API ключ</div>
            <input type="password" value={ozonKey} onChange={e=>{setOzonKey(e.target.value);setOzonSaved(false);}} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" style={{...inp,fontFamily:"monospace"}}/>
          </div>
          <button onClick={()=>setOzonSaved(true)} style={{background:ozonSaved?"rgba(74,222,128,0.15)":T.ozon,color:ozonSaved?T.green:"#fff",border:ozonSaved?"1px solid rgba(74,222,128,0.3)":"none",borderRadius:10,padding:"10px",fontSize:13,fontWeight:700,cursor:"pointer",width:"100%"}}>
            {ozonSaved?"✅ Сохранено":"Подключить Ozon"}
          </button>
        </div>
      </div>
      <div style={S.card}>
        <div style={{marginBottom:14}}>
          <SectionTitle marginBottom={2}>👥 Сотрудники с доступом</SectionTitle>
          <div style={{fontSize:11,color:T.sub}}>{employees.length} пользователя · добавление через бота</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {employees.map(e=>{
            const isMe=e.tgId===currentUserTgId;
            return(
              <div key={e.id} style={{...S.card2,border:`1px solid ${isMe?"rgba(167,139,250,0.3)":T.border}`,background:isMe?"rgba(167,139,250,0.05)":T.card2}}>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{width:38,height:38,borderRadius:"50%",background:`linear-gradient(135deg,${T.wb},${T.ozon})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:"#fff",flexShrink:0}}>{e.name[0]}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                      <span style={{fontSize:13,color:T.text,fontWeight:600}}>{e.name}</span>
                      {isMe&&<span style={{fontSize:9,color:"#a78bfa",background:"rgba(167,139,250,0.15)",padding:"1px 6px",borderRadius:10}}>это вы</span>}
                    </div>
                    <div style={{fontSize:11,color:"#a78bfa",marginTop:1}}>{e.tgUsername?"@"+e.tgUsername+" · ":""}<span style={{fontFamily:"monospace",fontSize:10,color:T.sub}}>ID: {e.tgId}</span></div>
                    <div style={{display:"flex",gap:5,marginTop:6,flexWrap:"wrap"}}>
                      <span style={{fontSize:10,color:ROLE_COLORS[e.role]||"#a78bfa",background:`${ROLE_COLORS[e.role]||"#a78bfa"}15`,padding:"2px 8px",borderRadius:10,border:`1px solid ${ROLE_COLORS[e.role]||"#a78bfa"}30`}}>{e.role}</span>
                      {e.access.map(p=><span key={p} style={{fontSize:10,color:"#fff",background:p==="wb"?T.wb:T.ozon,padding:"2px 8px",borderRadius:10}}>{p.toUpperCase()}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{marginTop:12,padding:"10px 14px",background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border}`,borderRadius:10,fontSize:11,color:T.sub,textAlign:"center"}}>
          Чтобы добавить или удалить сотрудника — напишите боту <span style={{color:"#a78bfa",fontFamily:"monospace"}}>/adduser</span> или <span style={{color:T.red,fontFamily:"monospace"}}>/removeuser</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ВКЛАДКА СТАВКИ — ПЕРЕРАБОТАННАЯ СТРУКТУРА
// Блок 1: Баланс кабинета (общий счёт)
// Блок 2: Общая статистика по всем РК за 7 дней (один раз)
// Блок 3: Настройки стратегии (один раз для всех РК)
// Блок 4: Список РК — только уникальное: ручное и авто пополнение + ключи
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Баланс кабинета ──────────────────────────────────────────────────────────
function BidsCabinetBalance({platform}){
  const DEMO_BALANCE={wb:258969,ozon:12700};
  const balance=DEMO_BALANCE[platform]||0;
  const isLow=balance<5000;
  return(
    <div style={{...S.card,borderColor:isLow?"rgba(248,113,113,0.3)":T.border,background:isLow?"rgba(248,113,113,0.03)":T.card}}>
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
        <div style={{height:"100%",width:`${Math.min(balance/300000*100,100)}%`,background:isLow?"#f87171":balance<50000?"#fbbf24":"#4ade80",borderRadius:2}}/>
      </div>
    </div>
  );
}

// ─── Общая статистика по всем РК (один раз, не в каждой карточке) ─────────────
function GlobalBidStats({data}){
  const [selCamp,setSelCamp]=useState("all");
  const camps=data.campaigns;
  const {spendScale,ordersScale}=getCampScale(camps,selCamp);
  const scaledDays=scaleDays(data.daily,spendScale,ordersScale);

  const totals={
    imp:scaledDays.reduce((s,d)=>s+d.impressions,0),
    clicks:scaledDays.reduce((s,d)=>s+d.clicks,0),
    spend:scaledDays.reduce((s,d)=>s+d.spend,0),
    baskets:scaledDays.reduce((s,d)=>s+d.baskets,0),
    orders:scaledDays.reduce((s,d)=>s+d.orders,0),
    revenue:scaledDays.reduce((s,d)=>s+d.revenue,0),
  };
  const avgCtr=totals.imp>0?(totals.clicks/totals.imp*100).toFixed(2):"—";
  const avgDrr=totals.revenue>0?(totals.spend/totals.revenue*100).toFixed(1):"—";
  const avgCpo=totals.orders>0?Math.round(totals.spend/totals.orders):0;

  return(
    <div style={S.card}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <SectionTitle marginBottom={0}>📊 Статистика за 7 дней</SectionTitle>
        <select value={selCamp} onChange={e=>setSelCamp(e.target.value)}
          style={{background:T.card2,border:`1px solid ${T.border}`,borderRadius:8,padding:"4px 10px",fontSize:11,color:T.text,outline:"none",cursor:"pointer"}}>
          <option value="all">Все кампании</option>
          {camps.map(c=><option key={c.id} value={String(c.id)}>{c.name}</option>)}
        </select>
      </div>

      {/* Сводка */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:12}}>
        {[
          {l:"Затраты",v:fmt.rub(totals.spend),c:T.yellow},
          {l:"Заказы",v:fmt.num(totals.orders),c:totals.orders>0?T.green:T.red},
          {l:"ДРР",v:`${avgDrr}%`,c:parseFloat(avgDrr)>25?T.red:parseFloat(avgDrr)>18?T.yellow:T.green},
          {l:"Показы",v:fmt.num(totals.imp),c:T.text},
          {l:"CTR",v:`${avgCtr}%`,c:parseFloat(avgCtr)>=0.8?T.green:T.yellow},
          {l:"CPO",v:avgCpo>0?fmt.rub(avgCpo):"—",c:T.text},
        ].map(m=>(
          <div key={m.l} style={{textAlign:"center",background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"8px 4px"}}>
            <div style={{fontSize:9,color:T.sub,marginBottom:3}}>{m.l}</div>
            <div style={{fontSize:13,fontWeight:700,fontFamily:"monospace",color:m.c}}>{m.v}</div>
          </div>
        ))}
      </div>

      {/* Таблица по дням */}
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",minWidth:500,borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:"rgba(255,255,255,0.03)"}}>
              {["Дата","Показы","Клики","CTR","Затраты","Корзины","Заказы","ДРР"].map(h=>(
                <th key={h} style={{padding:"5px 5px",textAlign:"center",fontSize:9,color:T.sub,fontWeight:600,borderBottom:`1px solid ${T.border}`,whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scaledDays.map((row,i)=>(
              <tr key={i} style={{borderBottom:`1px solid rgba(255,255,255,0.04)`}}>
                <td style={{padding:"5px 5px",fontSize:10,color:T.text,fontWeight:600,whiteSpace:"nowrap"}}>{row.date}</td>
                <td style={{padding:"5px 5px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.sub}}>{fmt.num(row.impressions)}</td>
                <td style={{padding:"5px 5px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.text}}>{fmt.num(row.clicks)}</td>
                <td style={{padding:"5px 5px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:row.ctr>=0.8?T.green:T.yellow}}>{row.ctr}%</td>
                <td style={{padding:"5px 5px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.yellow}}>{fmt.rub(row.spend)}</td>
                <td style={{padding:"5px 5px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.text}}>{Math.round(row.baskets)}</td>
                <td style={{padding:"5px 5px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:row.orders>0?T.green:T.red,fontWeight:700}}>{Math.round(row.orders)}</td>
                <td style={{padding:"5px 5px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:row.drr>25?T.red:row.drr>18?T.yellow:T.green}}>{row.drr}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{background:"rgba(255,255,255,0.03)",borderTop:`1px solid ${T.border}`}}>
              <td style={{padding:"5px 5px",fontSize:10,fontWeight:700,color:T.text}}>Итого</td>
              <td style={{padding:"5px 5px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.text,fontWeight:700}}>{fmt.num(totals.imp)}</td>
              <td style={{padding:"5px 5px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.text,fontWeight:700}}>{fmt.num(totals.clicks)}</td>
              <td style={{padding:"5px 5px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.green}}>{avgCtr}%</td>
              <td style={{padding:"5px 5px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.yellow,fontWeight:700}}>{fmt.rub(totals.spend)}</td>
              <td style={{padding:"5px 5px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.text,fontWeight:700}}>{fmt.num(totals.baskets)}</td>
              <td style={{padding:"5px 5px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.green,fontWeight:700}}>{fmt.num(totals.orders)}</td>
              <td style={{padding:"5px 5px",fontSize:10,fontFamily:"monospace",textAlign:"right",color:T.yellow}}>{avgDrr}%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ─── Настройки стратегии — ОДИН РАЗ для всех РК ──────────────────────────────
function StrategyGlobalSettings({data,targetDrr}){
  const [mode,setMode]=useState("auto");
  const [autoSettings,setAutoSettings]=useState({stratMode:"position",targetPos:5,minBid:100,maxBid:500,step:20,checkInterval:60});
  const [schedule,setSchedule]=useState({enabled:false,start:"09:00",end:"23:00",days:[1,2,3,4,5]});
  const [peak,setPeak]=useState({enabled:false,start:"11:00",end:"14:00",boost:20});
  const [autoGoal,setAutoGoal]=useState("balance");
  const DAYS_LABELS=["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
  const inpS=(extra={})=>({width:"100%",background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:"9px 12px",fontSize:13,color:T.text,outline:"none",boxSizing:"border-box",...extra});
  function toggleDay(d){setSchedule(s=>({...s,days:s.days.includes(d)?s.days.filter(x=>x!==d):[...s.days,d].sort()}));}
  const MODES=[
    {id:"auto",icon:"🤖",label:"Авто"},
    {id:"strategy",icon:"⚡",label:"Стратегии"},
    {id:"autoplan",icon:"🎯",label:"Авто-план"},
  ];
  const AUTO_MODES=[
    {id:"position",label:"Удержание позиции",desc:"Поддерживать топ-N"},
    {id:"drr",label:"Контроль ДРР",desc:"Не превышать ДРР"},
    {id:"cpo",label:"Минимальный CPO",desc:"Цена заказа"},
    {id:"balance",label:"Баланс",desc:"Позиция + ДРР"},
  ];
  const GOALS=[
    {id:"growth",icon:"🚀",label:"Рост продаж",desc:"Макс. заказов, ДРР может вырасти"},
    {id:"balance",icon:"⚖️",label:"Баланс",desc:"Больше продаж при ДРР"},
    {id:"economy",icon:"💰",label:"Экономия",desc:"Жёсткий контроль ДРР"},
  ];
  return(
    <div style={S.card}>
      <SectionTitle>Стратегия — применяется ко всем РК</SectionTitle>
      <div style={{...S.card2,background:"rgba(124,58,237,0.05)",borderColor:"rgba(124,58,237,0.2)",padding:"8px 12px",fontSize:11,color:T.sub,marginBottom:12}}>
        Настройте один раз — параметры применяются ко всем активным кампаниям. Переопределить для отдельной РК можно в строке кампании.
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:14}}>
        {MODES.map(m=>(
          <button key={m.id} onClick={()=>setMode(m.id)}
            style={{padding:"10px 6px",borderRadius:10,border:`1px solid ${mode===m.id?"rgba(124,58,237,0.5)":T.border}`,background:mode===m.id?"rgba(124,58,237,0.15)":"transparent",color:mode===m.id?"#c4b5fd":T.sub,fontSize:11,fontWeight:mode===m.id?700:400,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <span style={{fontSize:18}}>{m.icon}</span><span>{m.label}</span>
          </button>
        ))}
      </div>

      {mode==="auto"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {AUTO_MODES.map(m=>(
              <button key={m.id} onClick={()=>setAutoSettings(s=>({...s,stratMode:m.id}))}
                style={{padding:"8px 10px",borderRadius:8,border:`1px solid ${autoSettings.stratMode===m.id?"rgba(124,58,237,0.5)":T.border}`,background:autoSettings.stratMode===m.id?"rgba(124,58,237,0.12)":"transparent",color:autoSettings.stratMode===m.id?"#c4b5fd":T.sub,fontSize:11,cursor:"pointer",textAlign:"left"}}>
                <div style={{fontWeight:autoSettings.stratMode===m.id?700:400}}>{m.label}</div>
                <div style={{fontSize:9,marginTop:1,opacity:0.7}}>{m.desc}</div>
              </button>
            ))}
          </div>
          {(autoSettings.stratMode==="position"||autoSettings.stratMode==="balance")&&(
            <div>
              <div style={{fontSize:11,color:T.sub,marginBottom:6}}>🎯 Целевая позиция (топ-N)</div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <input type="range" min={1} max={20} value={autoSettings.targetPos} onChange={e=>setAutoSettings(s=>({...s,targetPos:+e.target.value}))} style={{flex:1,accentColor:"#7c3aed"}}/>
                <div style={{fontSize:18,fontWeight:700,fontFamily:"monospace",color:"#c4b5fd",minWidth:36,textAlign:"center"}}>{autoSettings.targetPos}</div>
              </div>
            </div>
          )}
          <div>
            <div style={{fontSize:11,color:T.sub,marginBottom:6}}>💰 Лимиты ставки CPM (для всех РК)</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {[{l:"Мин. ₽",k:"minBid"},{l:"Макс. ₽",k:"maxBid"},{l:"Шаг ₽",k:"step"}].map(f=>(
                <div key={f.k}>
                  <div style={{fontSize:10,color:T.sub,marginBottom:4}}>{f.l}</div>
                  <input type="number" value={autoSettings[f.k]} onChange={e=>setAutoSettings(s=>({...s,[f.k]:+e.target.value}))} style={inpS({fontSize:14,fontFamily:"monospace",fontWeight:700,padding:"8px"})}/>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:11,color:T.sub,marginBottom:6}}>⏱ Проверять каждые</div>
            <div style={{display:"flex",gap:6}}>
              {[15,30,60,120].map(m=>(
                <button key={m} onClick={()=>setAutoSettings(s=>({...s,checkInterval:m}))}
                  style={{flex:1,padding:"7px 4px",borderRadius:8,border:`1px solid ${autoSettings.checkInterval===m?"rgba(124,58,237,0.5)":T.border}`,background:autoSettings.checkInterval===m?"rgba(124,58,237,0.12)":"transparent",color:autoSettings.checkInterval===m?"#c4b5fd":T.sub,fontSize:11,cursor:"pointer",fontWeight:autoSettings.checkInterval===m?700:400}}>
                  {m<60?`${m} мин`:`${m/60} ч`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {mode==="strategy"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{...S.card2,borderColor:schedule.enabled?"rgba(74,222,128,0.2)":T.border}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:schedule.enabled?12:0}}>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontSize:16}}>📅</span>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:T.text}}>Расписание</div>
                  <div style={{fontSize:10,color:T.sub}}>Вкл/выкл по времени</div>
                </div>
              </div>
              <Toggle value={schedule.enabled} onChange={()=>setSchedule(s=>({...s,enabled:!s.enabled}))}/>
            </div>
            {schedule.enabled&&(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <div>
                    <div style={{fontSize:10,color:T.sub,marginBottom:4}}>Начало</div>
                    <input type="time" value={schedule.start} onChange={e=>setSchedule(s=>({...s,start:e.target.value}))} style={inpS({fontFamily:"monospace",fontWeight:600})}/>
                  </div>
                  <div>
                    <div style={{fontSize:10,color:T.sub,marginBottom:4}}>Конец</div>
                    <input type="time" value={schedule.end} onChange={e=>setSchedule(s=>({...s,end:e.target.value}))} style={inpS({fontFamily:"monospace",fontWeight:600})}/>
                  </div>
                </div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  {DAYS_LABELS.map((d,i)=>(
                    <button key={d} onClick={()=>toggleDay(i+1)}
                      style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${schedule.days.includes(i+1)?"rgba(74,222,128,0.4)":T.border}`,background:schedule.days.includes(i+1)?"rgba(74,222,128,0.12)":"transparent",color:schedule.days.includes(i+1)?T.green:T.sub,fontSize:11,cursor:"pointer"}}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div style={{...S.card2,borderColor:peak.enabled?"rgba(251,191,36,0.2)":T.border}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:peak.enabled?10:0}}>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontSize:16}}>🚀</span>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:T.text}}>Пиковые часы</div>
                  <div style={{fontSize:10,color:T.sub}}>Повысить ставки в часы пик</div>
                </div>
              </div>
              <Toggle value={peak.enabled} onChange={()=>setPeak(s=>({...s,enabled:!s.enabled}))} color={T.yellow}/>
            </div>
            {peak.enabled&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                <div>
                  <div style={{fontSize:10,color:T.sub,marginBottom:4}}>Начало пика</div>
                  <input type="time" value={peak.start} onChange={e=>setPeak(s=>({...s,start:e.target.value}))} style={inpS({fontFamily:"monospace",fontWeight:600})}/>
                </div>
                <div>
                  <div style={{fontSize:10,color:T.sub,marginBottom:4}}>Конец пика</div>
                  <input type="time" value={peak.end} onChange={e=>setPeak(s=>({...s,end:e.target.value}))} style={inpS({fontFamily:"monospace",fontWeight:600})}/>
                </div>
                <div>
                  <div style={{fontSize:10,color:T.sub,marginBottom:4}}>Буст %</div>
                  <input type="number" value={peak.boost} min={5} max={100} onChange={e=>setPeak(s=>({...s,boost:+e.target.value}))} style={inpS({fontFamily:"monospace",fontWeight:700})}/>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {mode==="autoplan"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{...S.card2,background:"rgba(16,185,129,0.04)",borderColor:"rgba(16,185,129,0.15)",padding:"8px 12px",fontSize:11,color:T.sub}}>
            Приоритет применяется при авто-анализе каждой кампании.
          </div>
          {GOALS.map(g=>(
            <div key={g.id} onClick={()=>setAutoGoal(g.id)}
              style={{...S.card2,cursor:"pointer",borderColor:autoGoal===g.id?"rgba(16,185,129,0.4)":T.border,background:autoGoal===g.id?"rgba(16,185,129,0.07)":T.card2,display:"flex",alignItems:"center",gap:12,padding:"10px 12px"}}>
              <span style={{fontSize:20,flexShrink:0}}>{g.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:autoGoal===g.id?"#6ee7b7":T.text}}>{g.label}</div>
                <div style={{fontSize:10,color:T.sub,marginTop:1}}>{g.desc}</div>
              </div>
              <div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${autoGoal===g.id?"#6ee7b7":T.border}`,background:autoGoal===g.id?"#6ee7b7":"transparent",flexShrink:0}}/>
            </div>
          ))}
          {!targetDrr&&<div style={{fontSize:11,color:T.yellow,background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:8,padding:"8px 12px"}}>⚠️ Целевой ДРР не установлен — установите в «План/Факт»</div>}
        </div>
      )}
    </div>
  );
}

// ─── Список РК — только уникальное: пополнение + ключи ───────────────────────
function CampaignsList({data,targetDrr}){
  const camps=data.campaigns;
  const keywords=data.keywords;
  const inpS=(extra={})=>({width:"100%",background:T.card2,border:`1px solid ${T.border}`,borderRadius:10,padding:"9px 12px",fontSize:13,color:T.text,outline:"none",boxSizing:"border-box",...extra});
  const [manualAmounts,setManualAmounts]=useState(()=>camps.reduce((acc,c)=>({...acc,[c.id]:"1000"}),{}));
  const [topups,setTopups]=useState(()=>camps.reduce((acc,c)=>({...acc,[c.id]:{enabled:false,amount:1000,timesPerDay:1}}),{}));
  const [toasts,setToasts]=useState({});
  const [expanded,setExpanded]=useState({});
  const [bidOverrides,setBidOverrides]=useState(()=>keywords.reduce((acc,k)=>({...acc,[k.keyword]:{search:k.bidSearch,shelves:k.bidShelves}}),{}));
  const [bidToasts,setBidToasts]=useState({});

  function showToast(id,msg){setToasts(t=>({...t,[id]:msg}));setTimeout(()=>setToasts(t=>{const n={...t};delete n[id];return n;}),2500);}
  function showBidToast(kw,msg){setBidToasts(t=>({...t,[kw]:msg}));setTimeout(()=>setBidToasts(t=>{const n={...t};delete n[kw];return n;}),2000);}
  function updTopup(id,key,val){setTopups(p=>({...p,[id]:{...p[id],[key]:val}}));}
  const drrColor=(drr)=>!targetDrr?T.text:drr>targetDrr*1.15?T.red:drr>targetDrr?T.yellow:T.green;
  const posColor=(pos)=>pos<=5?"#4ade80":pos<=15?"#fbbf24":"#fb923c";

  return(
    <div style={S.card}>
      <SectionTitle>Рекламные кампании — бюджет и пополнение</SectionTitle>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {camps.map(c=>{
          const t=topups[c.id];
          const isExp=expanded[c.id];
          const campKws=keywords.filter(k=>String(k.campaignId)===String(c.id));
          const toast=toasts[c.id];
          return(
            <div key={c.id} style={{...S.card2,borderColor:c.status==="active"?"rgba(74,222,128,0.2)":T.border,opacity:c.status==="paused"?0.75:1}}>

              {/* Строка 1: название + ДРР + статус */}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:T.text}}>{c.name}</div>
                  <div style={{display:"flex",gap:10,marginTop:3}}>
                    <span style={{fontSize:11,color:T.sub}}>CPO {fmt.rub(c.cpo)}</span>
                    <span style={{fontSize:11,color:T.sub}}>{c.orders} зак.</span>
                    <span style={{fontSize:11,color:T.sub}}>{fmt.rub(c.spend)} расход</span>
                  </div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:9,color:T.sub}}>ДРР</div>
                    <div style={{fontSize:17,fontWeight:700,fontFamily:"monospace",color:drrColor(c.drr)}}>{c.drr}%</div>
                    {targetDrr&&<div style={{fontSize:9,color:T.sub}}>цель {targetDrr}%</div>}
                  </div>
                  <span style={{fontSize:10,fontWeight:600,padding:"3px 8px",borderRadius:7,background:c.status==="active"?"rgba(74,222,128,0.1)":"rgba(255,255,255,0.05)",color:c.status==="active"?T.green:T.sub,border:`1px solid ${c.status==="active"?"rgba(74,222,128,0.2)":T.border}`}}>
                    {c.status==="active"?"● Активна":"● Пауза"}
                  </span>
                </div>
              </div>

              {/* Строка 2: ручное пополнение */}
              <div style={{marginBottom:10}}>
                <div style={{fontSize:10,color:T.sub,marginBottom:6,fontWeight:600}}>💳 Пополнить бюджет вручную</div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:4,flex:1}}>
                    <button onClick={()=>setManualAmounts(p=>({...p,[c.id]:String(Math.max(1000,(+p[c.id]||1000)-1000))}))}
                      style={{width:34,height:34,borderRadius:8,border:`1px solid ${T.border}`,background:"rgba(248,113,113,0.08)",color:T.red,fontSize:16,cursor:"pointer",flexShrink:0}}>−</button>
                    <input type="number" value={manualAmounts[c.id]} onChange={e=>setManualAmounts(p=>({...p,[c.id]:e.target.value}))}
                      style={{flex:1,background:T.card,border:`1px solid ${T.border}`,borderRadius:8,padding:"7px 8px",fontSize:14,fontFamily:"monospace",fontWeight:700,color:T.text,outline:"none",textAlign:"center"}}/>
                    <span style={{fontSize:12,color:T.sub,flexShrink:0}}>₽</span>
                    <button onClick={()=>setManualAmounts(p=>({...p,[c.id]:String((+p[c.id]||0)+1000)}))}
                      style={{width:34,height:34,borderRadius:8,border:`1px solid ${T.border}`,background:"rgba(74,222,128,0.08)",color:T.green,fontSize:16,cursor:"pointer",flexShrink:0}}>+</button>
                  </div>
                  <button onClick={()=>{const amt=+manualAmounts[c.id];if(amt>=100)showToast(c.id,`✅ Пополнено на ${amt.toLocaleString("ru-RU")} ₽`);}}
                    style={{padding:"7px 14px",borderRadius:9,background:"rgba(124,58,237,0.2)",border:"1px solid rgba(124,58,237,0.4)",color:"#c4b5fd",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
                    Пополнить
                  </button>
                </div>
                {toast&&<div style={{marginTop:6,fontSize:11,color:T.green,background:"rgba(74,222,128,0.06)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:7,padding:"5px 10px"}}>{toast}</div>}
              </div>

              {/* Строка 3: автопополнение */}
              <div style={{borderTop:`1px solid ${T.border}`,paddingTop:10,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:t.enabled?12:0}}>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <span style={{fontSize:14}}>🔄</span>
                    <div>
                      <div style={{fontSize:11,fontWeight:600,color:T.text}}>Автопополнение</div>
                      {t.enabled
                        ?<div style={{fontSize:10,color:T.green}}>{t.amount.toLocaleString("ru-RU")} ₽ · {t.timesPerDay}× в сутки</div>
                        :<div style={{fontSize:10,color:T.sub}}>выкл</div>}
                    </div>
                  </div>
                  <Toggle value={t.enabled} onChange={()=>updTopup(c.id,"enabled",!t.enabled)}/>
                </div>
                {t.enabled&&(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <div>
                      <div style={{fontSize:10,color:T.sub,marginBottom:4}}>Пополнять на, ₽</div>
                      <input type="number" value={t.amount} onChange={e=>updTopup(c.id,"amount",+e.target.value)} onBlur={e=>updTopup(c.id,"amount",Math.max(1000,+e.target.value))} style={inpS({fontFamily:"monospace",fontWeight:700})}/>
                      <div style={{fontSize:9,color:T.sub,marginTop:2}}>Мин. 1 000 ₽</div>
                    </div>
                    <div>
                      <div style={{fontSize:10,color:T.sub,marginBottom:4}}>Раз в сутки (не чаще)</div>
                      <input type="number" value={t.timesPerDay} min={1} max={10} onChange={e=>updTopup(c.id,"timesPerDay",Math.max(1,Math.min(10,+e.target.value)))} style={inpS({fontFamily:"monospace",fontWeight:700})}/>
                    </div>
                  </div>
                )}
              </div>

              {/* Кнопка развернуть ключи */}
              <button onClick={()=>setExpanded(p=>({...p,[c.id]:!p[c.id]}))}
                style={{width:"100%",padding:"7px",borderRadius:8,background:"transparent",border:`1px solid ${T.border}`,color:T.sub,fontSize:11,cursor:"pointer"}}>
                {isExp?`▲ Скрыть ключевые слова`:`▼ Ключевые слова (${campKws.length})`}
              </button>

              {isExp&&(
                <div style={{marginTop:10}}>
                  <div style={{fontSize:10,color:T.sub,marginBottom:8,fontWeight:600}}>СТАВКИ ПО КЛЮЧЕВЫМ СЛОВАМ</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {campKws.map((kw,i)=>{
                      const b=bidOverrides[kw.keyword]||{search:kw.bidSearch,shelves:kw.bidShelves};
                      const drr=kw.revenue>0?kw.spend/kw.revenue*100:null;
                      const dS=kw.posPrev-kw.posSearch;
                      return(
                        <div key={i} style={{...S.card2,background:"rgba(255,255,255,0.02)"}}>
                          {/* Шапка ключа */}
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:12,fontWeight:700,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{kw.keyword}</div>
                              <div style={{display:"flex",gap:6,marginTop:3,flexWrap:"wrap"}}>
                                <div style={{display:"flex",alignItems:"center",gap:3,background:"rgba(99,102,241,0.1)",borderRadius:6,padding:"2px 7px"}}>
                                  <span style={{fontSize:9,color:"#a5b4fc"}}>🔍</span>
                                  <span style={{fontFamily:"monospace",fontWeight:700,fontSize:11,color:posColor(kw.posSearch)}}>{kw.posSearch}</span>
                                  <span style={{fontSize:10,fontWeight:700,color:dS>0?T.green:dS<0?T.red:T.sub}}>{dS>0?`↑${dS}`:dS<0?`↓${Math.abs(dS)}`:"→"}</span>
                                </div>
                                <span style={{fontSize:10,color:kw.ctr>=0.8?T.green:T.yellow}}>CTR {kw.ctr}%</span>
                                <span style={{fontSize:10,color:kw.orders>0?T.green:T.sub}}>{kw.orders} зак.</span>
                                {drr!=null&&<span style={{fontSize:10,color:drrColor(drr)}}>ДРР {drr.toFixed(1)}%</span>}
                              </div>
                            </div>
                          </div>
                          {/* Ставки */}
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                            {[{label:"🔍 Поиск CPM",field:"search",orig:kw.bidSearch},{label:"🗂 Полки CPM",field:"shelves",orig:kw.bidShelves}].map(f=>{
                              const val=b[f.field];
                              const changed=val!==f.orig;
                              return(
                                <div key={f.field}>
                                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                                    <span style={{fontSize:10,color:T.sub}}>{f.label}</span>
                                    {changed&&<span style={{fontSize:9,color:T.yellow}}>изм. (было {f.orig}₽)</span>}
                                  </div>
                                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                                    <button onClick={()=>setBidOverrides(p=>({...p,[kw.keyword]:{...p[kw.keyword],[f.field]:Math.max(50,val-10)}}))}
                                      style={{width:32,height:32,borderRadius:8,border:`1px solid ${T.border}`,background:"rgba(248,113,113,0.08)",color:T.red,fontSize:16,cursor:"pointer",flexShrink:0}}>−</button>
                                    <input type="number" value={val}
                                      onChange={e=>setBidOverrides(p=>({...p,[kw.keyword]:{...p[kw.keyword],[f.field]:+e.target.value||50}}))}
                                      onBlur={e=>setBidOverrides(p=>({...p,[kw.keyword]:{...p[kw.keyword],[f.field]:Math.max(50,Math.min(2000,+e.target.value||50))}}))}
                                      style={{flex:1,background:changed?"rgba(251,191,36,0.08)":"rgba(255,255,255,0.04)",border:`1px solid ${changed?"rgba(251,191,36,0.3)":T.border}`,borderRadius:8,padding:"6px 4px",fontSize:13,fontFamily:"monospace",fontWeight:700,color:changed?T.yellow:T.text,outline:"none",textAlign:"center"}}/>
                                    <button onClick={()=>setBidOverrides(p=>({...p,[kw.keyword]:{...p[kw.keyword],[f.field]:Math.min(2000,val+10)}}))}
                                      style={{width:32,height:32,borderRadius:8,border:`1px solid ${T.border}`,background:"rgba(74,222,128,0.08)",color:T.green,fontSize:16,cursor:"pointer",flexShrink:0}}>+</button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {/* Кнопка сохранить ставки */}
                          {(b.search!==kw.bidSearch||b.shelves!==kw.bidShelves)&&(
                            <button onClick={()=>{setBidOverrides(p=>({...p,[kw.keyword]:{search:b.search,shelves:b.shelves}}));showBidToast(kw.keyword,`✅ Ставки «${kw.keyword}» сохранены`);}}
                              style={{marginTop:8,width:"100%",padding:"7px",borderRadius:8,border:"1px solid rgba(124,58,237,0.4)",background:"rgba(124,58,237,0.15)",color:"#c4b5fd",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                              ✓ Сохранить ставки
                            </button>
                          )}
                          {bidToasts[kw.keyword]&&<div style={{marginTop:5,fontSize:10,color:T.green,background:"rgba(74,222,128,0.06)",borderRadius:6,padding:"4px 8px"}}>{bidToasts[kw.keyword]}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Главная вкладка СТАВКИ ───────────────────────────────────────────────────
function TabBids({data,targetDrr,platform}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {/* 1. Общий баланс кабинета — ПЕРВЫМ, как просили */}
      <BidsCabinetBalance platform={platform}/>

      {/* 2. Общая статистика — ОДИН РАЗ, не в каждой карточке РК */}
      <GlobalBidStats data={data}/>

      {/* 3. Настройки стратегии — ОДИН РАЗ для всех РК */}
      <StrategyGlobalSettings data={data} targetDrr={targetDrr}/>

      {/* 4. Список РК — только уникальное: пополнение + автопополнение + ключи */}
      <CampaignsList data={data} targetDrr={targetDrr}/>
    </div>
  );
}

// ─── Авто-минусовка — вкладка ─────────────────────────────────────────────────
// (уже определена выше как TabAutoMinus)

// ═══════════════════════════════════════════════════════════════════════════════
// РОУТИНГ ПОДВКЛАДОК
// ═══════════════════════════════════════════════════════════════════════════════
const SUB_TABS={
  dashboard:[
    {id:"overview",label:"Обзор"},
    {id:"funnel",label:"Воронка"},
    {id:"diagnostics",label:"Диагностика"},
    {id:"planfact",label:"План/Факт"},
  ],
  bids:[
    {id:"bids_main",label:"💰 Ставки"},
    {id:"bids_minus",label:"🚫 Минусовка"},
  ],
  settings:[
    {id:"settings_main",label:"Настройки"},
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// ГЛАВНЫЙ APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App(){
  const [platform,setPlatform]=useState("wb");
  const [mainTab,setMainTab]=useState("dashboard");
  const [subTab,setSubTab]=useState("overview");

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

  function goMain(tab){setMainTab(tab);setSubTab(SUB_TABS[tab][0].id);}
  function goToPlanFact(){goMain("dashboard");setSubTab("planfact");}

  const subs=SUB_TABS[mainTab];
  const BOTTOM_TABS=[
    {id:"dashboard",icon:"🏠",label:"Дашборд"},
    {id:"bids",icon:"💰",label:"Ставки"},
    {id:"settings",icon:"⚙️",label:"Настройки"},
  ];

  return(
    <div style={{background:T.bg,color:T.text,fontFamily:"system-ui,sans-serif",minHeight:"100vh",paddingBottom:70}}>
      {/* Шапка */}
      <div style={{background:T.card,borderBottom:`1px solid ${T.border}`,padding:"10px 16px",position:"sticky",top:0,zIndex:30}}>
        <div style={{maxWidth:600,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:subs.length>1?8:0}}>
            <div style={{display:"flex",gap:6}}>
              {[{id:"wb",label:"🟣 WB",bg:T.wb},{id:"ozon",label:"🔵 Ozon",bg:T.ozon}].map(p=>(
                <button key={p.id} onClick={()=>setPlatform(p.id)}
                  style={{padding:"5px 14px",borderRadius:8,border:`2px solid ${platform===p.id?p.bg:"transparent"}`,background:platform===p.id?p.bg:"rgba(255,255,255,0.05)",color:T.text,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  {p.label}
                </button>
              ))}
            </div>
            {targetDrr?(
              <div style={{fontSize:11,color:"#a78bfa",fontWeight:700,fontFamily:"monospace"}}>🎯 {targetDrr}%</div>
            ):(
              <button onClick={goToPlanFact} style={{fontSize:11,color:T.yellow,background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.25)",borderRadius:8,padding:"4px 10px",cursor:"pointer"}}>
                ⚠️ Задайте ДРР
              </button>
            )}
          </div>
          {subs.length>1&&(
            <div style={{display:"flex",gap:3,overflowX:"auto",paddingBottom:2}}>
              {subs.map(s=>(
                <button key={s.id} onClick={()=>setSubTab(s.id)}
                  style={{padding:"5px 10px",borderRadius:7,border:"none",whiteSpace:"nowrap",flexShrink:0,background:subTab===s.id?accent:"rgba(255,255,255,0.05)",color:subTab===s.id?"#fff":T.sub,fontSize:11,fontWeight:subTab===s.id?700:400,cursor:"pointer",position:"relative"}}>
                  {s.label}
                  {s.id==="planfact"&&!targetDrr&&<span style={{position:"absolute",top:2,right:2,width:5,height:5,borderRadius:"50%",background:T.yellow}}/>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Контент */}
      <div style={{maxWidth:600,margin:"0 auto",padding:"12px 16px"}}>
        {subTab==="overview"    &&<TabOverview    data={data} platform={platform} targetDrr={targetDrr} onGoToPlanFact={goToPlanFact}/>}
        {subTab==="funnel"      &&<TabFunnel      data={data} targetDrr={targetDrr}/>}
        {subTab==="diagnostics" &&<TabDiagnostics data={data} targetDrr={targetDrr} onGoToPlanFact={goToPlanFact}/>}
        {subTab==="planfact"    &&<TabPlanFact    data={data} targetDrr={targetDrr} onSetTargetDrr={setDrr} category={category} onSetCategory={setCat} budget={budget} onSetBudget={setBudget}/>}
        {subTab==="bids_main"   &&<TabBids        data={data} targetDrr={targetDrr} platform={platform}/>}
        {subTab==="bids_minus"  &&<TabAutoMinus   data={data}/>}
        {subTab==="settings_main"&&<TabSettings   currentUserTgId={"545972485"}/>}
      </div>

      {/* Нижняя навигация */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:40,background:T.card,borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-around",alignItems:"center",padding:"8px 0 12px"}}>
        {BOTTOM_TABS.map(tab=>{
          const isActive=mainTab===tab.id;
          const hasDot=tab.id==="dashboard"&&!targetDrr;
          return(
            <button key={tab.id} onClick={()=>goMain(tab.id)}
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"transparent",border:"none",cursor:"pointer",color:isActive?accent:T.sub,padding:"4px 24px",position:"relative",transition:"color 0.15s"}}>
              {hasDot&&<span style={{position:"absolute",top:0,right:18,width:7,height:7,borderRadius:"50%",background:T.yellow}}/>}
              <span style={{fontSize:22,lineHeight:1}}>{tab.icon}</span>
              <span style={{fontSize:10,fontWeight:isActive?700:400}}>{tab.label}</span>
              {isActive&&<div style={{position:"absolute",bottom:-12,left:"50%",transform:"translateX(-50%)",width:32,height:3,borderRadius:2,background:accent}}/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
