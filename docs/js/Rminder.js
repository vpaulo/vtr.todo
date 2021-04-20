import{logger as t}from"./logger.js";export class Rminder{constructor(){this.mediaQueryList=matchMedia("only screen and (max-width: 900px)");this.smallMediaQuery=matchMedia("only screen and (max-width: 630px)");this.taskInput=document.getElementById("task");this.addTaskBtn=document.querySelector(".add-task");this.taskList=document.querySelector(".tasks__list");this.detailsContainer=document.querySelector(".details");this.titleInput=document.querySelector(".title");this.rename=document.querySelector(".rename");this.remove=document.querySelector(".remove");this.close=document.querySelector(".close");this.myDay=document.querySelector(".my-day");this.importanceCheckBtn=this.detailsContainer?.querySelector(".importance-check");this.completedCheck=this.detailsContainer?.querySelector(".completed-ckeck");this.note=document.querySelector(".note");this.noteBtn=document.querySelector(".add-note");this.countMyDay=document.querySelector(".count-my-day");this.countImportant=document.querySelector(".count-important");this.countTasks=document.querySelector(".count-tasks");this.menuBtn=document.querySelector(".menu");this.sidebar=document.querySelector(".sidebar");this.checkSquareTmp=document.getElementById("check-square");this.starTmp=document.getElementById("star");this.lists=document.querySelector(".lists");this.listTitle=document.querySelector(".list-title");this.mainContainer=document.querySelector(".main");this.creationDate=document.querySelector(".creation-date")}launch(e){t("web worker initialised: ",e)}success(e){const s=typeof e.message!=="undefined"?`Success: ${e.message}`:"Success: ";t(s,e)}opened(e,s){t(e.message);this.addEventListeners(s)}clear(e){t(e.message);this.taskInput.value="";this.taskList.innerHTML=""}tasks({value:e,list:s}){t("Tasks:",e);let i=e;let a="Tasks";let n="tasks";if(s?.title){i=s.value;a=s.title;n=s.name}this.taskList.innerHTML=i.map((t=>`<li class="${t.completed?"completed ":""}${t.important?"important ":""}" data-id="${t.id}"><span class="completed-ckeck" title="Set it as complete">${this.checkSquareTmp.innerHTML}</span><button class="show-details">${t.title}</button><span class="importance-check" title="Set it as important">${this.starTmp.innerHTML}</span>`)).join("");this.countMyDay.innerText=e.filter((t=>t.my_day)).length;this.countImportant.innerText=e.filter((t=>t.important)).length;this.countTasks.innerText=e.length;this.listTitle.innerText=a;this.mainContainer.dataset.list=n;this.setDetailClasses(e)}details({value:e}){t("Details: ",e);const s=new Date(e.creation_date);this.detailsContainer.setAttribute("aria-label",`Detail for task: ${e.title}`);this.detailsContainer.dataset.id=e.id;this.titleInput.value=e.title;this.note.value=e.note||"";this.creationDate.innerText=(new Intl.DateTimeFormat).format(s);this.setDetailClasses(e)}addEventListeners(t){this.addTaskBtn.addEventListener("click",(()=>{this.addTask(t)}),false);this.taskList.addEventListener("click",(e=>{if(e.target.classList.contains("show-details")){this.showDetails(e.target,t);this.setSelected(e.target.closest("[data-id]"))}if(e.target.classList.contains("importance-check")||e.target.closest(".importance-check")){const s=e.target.closest("[data-id]");this.handleEvent("importantTask",t,+s.dataset.id)}if(e.target.classList.contains("completed-ckeck")||e.target.closest(".completed-ckeck")){const s=e.target.closest("[data-id]");this.handleEvent("completedTask",t,+s.dataset.id)}}),false);this.completedCheck.addEventListener("click",(e=>{const s=e.target.closest("[data-id]");this.handleEvent("completedTask",t,+s.dataset.id)}),false);this.lists.addEventListener("click",(e=>{const s=e.target?.dataset.name||e.target.closest("li")?.dataset.name;if(s){this.showList(s,t);if(this.smallMediaQuery.matches){this.hideSidebar()}}}),false);this.taskInput.addEventListener("keyup",(e=>{if(e.code==="Enter"){this.addTask(t)}}),false);this.titleInput.addEventListener("keyup",(e=>{if(e.code==="Enter"){this.renameTask(t)}}),false);this.rename.addEventListener("click",(()=>{this.renameTask(t)}),false);this.remove.addEventListener("click",(()=>{this.handleEvent("removeTask",t)}),false);this.close.addEventListener("click",this.hideDetails.bind(this),false);this.menuBtn.addEventListener("click",this.toggleSidebar.bind(this),false);this.importanceCheckBtn.addEventListener("click",(e=>{const s=e.target.closest("[data-id]");this.handleEvent("importantTask",t,+s.dataset.id)}),false);this.myDay.addEventListener("click",(()=>{this.handleEvent("myDayTask",t)}),false);this.noteBtn.addEventListener("click",(()=>{this.setTaskNote(t)}),false);this.mediaQueryList.addEventListener("change",this.screenTest.bind(this),false);window.addEventListener("resize",this.setDocHeight,false);window.addEventListener("orientationchange",this.setDocHeight,false)}addTask(e){const s=this.taskInput.value.trim();const i=Date.now();const a=this.mainContainer.dataset.list;if(s){e.postMessage({type:"addTask",title:s,creationDate:i,list:a})}else{t("Required field(s) missing: title")}}renameTask(e){const s=this.titleInput.value.trim();const i=+this.detailsContainer.dataset.id;const a=this.mainContainer.dataset.list;if(s){e.postMessage({type:"renameTask",id:i,title:s,list:a})}else{t("Required field(s) missing: title")}}showDetails(t,e){if(t.classList.contains("show-details")){const s=t.parentNode;const i=+s.dataset.id;if(i!==+this.detailsContainer.dataset.id){e.postMessage({type:"showDetails",id:i})}this.detailsContainer.classList.add("expanded");this.screenTest()}}hideDetails(){this.detailsContainer.classList.remove("expanded");this.taskList.querySelector(".selected")?.classList?.remove("selected");this.screenTest()}toggleSidebar(){this.sidebar.classList.toggle("expanded");this.screenTest(undefined,this.detailsContainer)}hideSidebar(){this.sidebar.classList.remove("expanded");this.screenTest()}handleEvent(t,e,s=+this.detailsContainer.dataset.id){const i=this.mainContainer.dataset.list;e.postMessage({type:t,id:s,list:i})}setTaskNote(e){const s=+this.detailsContainer.dataset.id;const i=this.note.value.trim();const a=this.mainContainer.dataset.list;if(i){e.postMessage({type:"noteTask",id:s,note:i,list:a})}else{t("Required field(s) missing: note")}}showList(t,e){document.querySelector(".list.selected")?.classList?.remove("selected");document.querySelector(`.list[data-name="${t}"]`).classList.add("selected");e.postMessage({type:"list",list:t})}setDetailClasses(t){const e=+this.detailsContainer.dataset.id;let s=t;if(Array.isArray(t)){s=t.find((t=>t.id===e))}this.detailsContainer.classList.remove("important","completed","today");if(s?.important){this.detailsContainer.classList.add("important")}if(s?.completed){this.detailsContainer.classList.add("completed")}if(s?.my_day){this.detailsContainer.classList.add("today")}}screenTest(t=this.mediaQueryList,e=this.sidebar){if(t.matches&&document.querySelectorAll(".expanded").length>1){e.classList.remove("expanded")}if(this.smallMediaQuery.matches&&document.querySelector(".expanded")){this.mainContainer?.classList.add("hidden")}else{this.mainContainer?.classList.remove("hidden")}}setDocHeight(){document.documentElement.style.setProperty("--vh",`${window.innerHeight}px`)}setSelected(t){this.taskList.querySelector(".selected")?.classList?.remove("selected");t.classList.add("selected")}}