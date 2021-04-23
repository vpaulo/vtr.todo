const e={name:"rminder",version:2,storeNames:["tasks","settings"],settings:{completed:"show",list:"tasks"}};const t={my_day:"My day",important:"Important",completed:"Completed"};function s(){console.log("openDb ...");const t=indexedDB.open(e.name,e.version);t.onsuccess=()=>{e.db=t.result;console.log("openDb DONE");o();postMessage({type:"opened",message:"DB opened"});p()};t.onerror=e=>{console.error("openDb:",e.target.error)};t.onblocked=e=>{console.error("openDb: Please close all other tabs with the App open",e.target.error)};t.onupgradeneeded=()=>{console.log("openDb.onupgradeneeded");e.db=t.result;if(!e.db.objectStoreNames.contains(e.storeNames[0])){const t=e.db.createObjectStore(e.storeNames[0],{keyPath:"id",autoIncrement:true});t.createIndex("title","title",{unique:false});t.createIndex("important","important",{unique:false});t.createIndex("my_day","my_day",{unique:false});t.createIndex("completed","completed",{unique:false});t.createIndex("note","note",{unique:false});t.createIndex("creation_date","creation_date",{unique:false})}if(!e.db.objectStoreNames.contains(e.storeNames[1])){const t=e.db.createObjectStore(e.storeNames[1],{keyPath:"id",autoIncrement:true});t.createIndex("completed","completed",{unique:false});t.createIndex("list","list",{unique:false})}o()}}function a(){e.db.close()}function o(){e.db.onversionchange=t=>{e.db.close();console.log("openDb: A new version of this page is ready. Please reload or close this tab!",t)}}function n(t,s){return e.db.transaction(t,s).objectStore(t)}function r(t,s,a){const o={title:t,creation_date:s};const r=n(e.storeNames[0],"readwrite");let c;try{if(a==="my_day"){o.my_day=true}if(a==="important"){o.important=true}c=r.add(o)}catch(e){if(e.name=="DataCloneError"){postMessage({type:"failure",message:"This engine doesn't know how to clone a Blob, use Firefox"})}throw e}c.onsuccess=()=>{postMessage({type:"success",message:"addTask: successful"});l(r,a)};c.onerror=()=>{postMessage({type:"failure",message:`addTask: error -> ${c.error}`})}}function c(t,s){const a=n(e.storeNames[0],"readwrite");a.openCursor().onsuccess=e=>{const o=e.target.result;if(o){if(o.value.id===t){const e=o.delete();e.onsuccess=()=>{postMessage({type:"success",message:`Task(${t}): deleted`});postMessage({type:"hideDetails"})}}o.continue()}else{l(a,s)}}}function i(t){const s=n(e.storeNames[0],"readonly");s.openCursor().onsuccess=e=>{const s=e.target.result;if(s){if(s.value.id===t){postMessage({type:"details",key:s.key,value:s.value})}s.continue()}}}function d(t,s,a,o){const r=n(e.storeNames[0],"readwrite");r.openCursor().onsuccess=e=>{const n=e.target.result;if(n){const e=!a||n.value[s]!==a;if(n.value.id===t&&e){const e=n.value;e[s]=a||!e[s];const o=n.update(e);o.onsuccess=()=>{postMessage({type:"success",message:`Task(${t}): ${s} = ${e[s]}`})}}n.continue()}else{l(r,o)}}}function l(s,a,o=e.settings){if(typeof s=="undefined"){s=n(e.storeNames[0],"readonly")}postMessage({type:"clear",message:"Clear"});postMessage({type:"settings",settings:o});s.getAll().onsuccess=e=>{const s=o?.completed==="hide"?e.target.result.filter((e=>!e.completed)):e.target.result;let n=s;if(a!=="tasks"){n=n.filter((e=>e[a]));postMessage({type:"tasks",value:s,list:{title:t[a],name:a,value:n}})}else{postMessage({type:"tasks",value:s})}}}function u(t,s){const a=t?"hide":"show";const o=n(e.storeNames[1],"readwrite");o.openCursor().onsuccess=o=>{const n=o.target.result;if(n){const o=n.value;if(t!==undefined){o.completed=a}o.list=s;e.settings=o;const r=n.update(o);r.onsuccess=()=>{postMessage({type:"success",message:"Settings updated"})};n.continue()}else{l(undefined,s,e.settings)}}}function p(){const t=n(e.storeNames[1],"readonly");t.getAll().onsuccess=t=>{const s=t.target.result;if(t.target.result.length===0){g()}else{e.settings=s[0];l(undefined,s[0].list,s[0]);postMessage({type:"selectList",list:s[0].list})}}}function g(){const t=n(e.storeNames[1],"readwrite");const s=t.add(e.settings);s.onsuccess=()=>{postMessage({type:"success",message:"Set default settings: successful"});l(undefined,e.settings.list,e.settings)};s.onerror=()=>{postMessage({type:"failure",message:`Set default settings: error -> ${s.error}`})}}onmessage=e=>{const{type:t}=e.data;switch(t){case"start":s();break;case"close":a();break;case"addTask":r(e.data.title,e.data.creationDate,e.data.list);break;case"removeTask":c(e.data.id,e.data.list);break;case"renameTask":d(e.data.id,"title",e.data.title,e.data.list);break;case"showDetails":i(e.data.id);break;case"importantTask":d(e.data.id,"important",undefined,e.data.list);break;case"myDayTask":d(e.data.id,"my_day",undefined,e.data.list);break;case"noteTask":d(e.data.id,"note",e.data.note,e.data.list);break;case"completedTask":d(e.data.id,"completed",undefined,e.data.list);break;case"settings":u(e.data.completed,e.data.list);break;case"list":u(undefined,e.data.list);break;case"display":l(undefined,e.data.list);break;default:postMessage({type:t});break}};