import{logger as e}from"./logger.js";export class Rminder{constructor(){this.mediaQueryList=matchMedia("only screen and (max-width: 900px)");this.smallMediaQuery=matchMedia("only screen and (max-width: 630px)");this.taskInput=document.getElementById("task");this.addTaskBtn=document.querySelector(".add-task");this.taskList=document.querySelector(".tasks__list");this.detailsContainer=document.querySelector(".details");this.titleInput=document.querySelector(".title");this.rename=document.querySelector(".rename");this.remove=document.querySelector(".remove");this.close=document.querySelector(".close");this.myDay=document.querySelector(".my-day");this.importanceCheckBtn=this.detailsContainer?.querySelector(".importance-check");this.completedCheck=this.detailsContainer?.querySelector(".completed-ckeck");this.note=document.querySelector(".note");this.noteBtn=document.querySelector(".add-note");this.countMyDay=document.querySelector(".count-my-day");this.countImportant=document.querySelector(".count-important");this.countTasks=document.querySelector(".count-tasks");this.menuBtn=document.querySelector(".menu");this.sidebar=document.querySelector(".sidebar");this.checkSquareTmp=document.getElementById("check-square");this.starTmp=document.getElementById("star");this.lists=document.querySelector(".lists");this.listTitle=document.querySelector(".list-title");this.mainContainer=document.querySelector(".main");this.creationDate=document.querySelector(".creation-date")}launch(t){e("web worker initialised: ",t)}success(t){const s=typeof t.message!=="undefined"?`Success: ${t.message}`:"Success: ";e(s,t)}opened(t,s){e(t.message);this.addEventListeners(s)}clear(t){e(t.message);this.taskInput.value="";this.taskList.innerHTML=""}tasks({value:t,list:s}){e("Tasks:",t);let i=t;let a="Tasks";let n="tasks";if(s?.title){i=s.value;a=s.title;n=s.name}this.taskList.innerHTML=i.map((e=>`<li class="${e.completed?"completed ":""}${e.important?"important ":""}" data-id="${e.id}"><span class="completed-ckeck" title="Set it as complete">${this.checkSquareTmp.innerHTML}</span><button class="show-details">${e.title}</button><span class="importance-check" title="Set it as important">${this.starTmp.innerHTML}</span>`)).join("");this.countMyDay.innerText=t.filter((e=>e.my_day)).length;this.countImportant.innerText=t.filter((e=>e.important)).length;this.countTasks.innerText=t.length;this.listTitle.innerText=a;this.mainContainer.dataset.list=n;this.setDetailClasses(t)}details({value:t}){e("Details: ",t);const s=new Date(t.creation_date);this.detailsContainer.setAttribute("aria-label",`Detail for task: ${t.title}`);this.detailsContainer.dataset.id=t.id;this.titleInput.value=t.title;this.note.value=t.note||"";this.creationDate.innerText=(new Intl.DateTimeFormat).format(s);this.setDetailClasses(t)}addEventListeners(e){this.addTaskBtn.addEventListener("click",(()=>{this.addTask(e)}),false);this.taskList.addEventListener("click",(t=>{if(t.target.classList.contains("show-details")){this.showDetails(t.target,e);this.setSelected(t.target.closest("[data-id]"))}if(t.target.classList.contains("importance-check")||t.target.closest(".importance-check")){const s=t.target.closest("[data-id]");this.handleEvent("importantTask",e,+s.dataset.id)}if(t.target.classList.contains("completed-ckeck")||t.target.closest(".completed-ckeck")){const s=t.target.closest("[data-id]");this.handleEvent("completedTask",e,+s.dataset.id)}}),false);this.completedCheck.addEventListener("click",(t=>{const s=t.target.closest("[data-id]");this.handleEvent("completedTask",e,+s.dataset.id)}),false);this.lists.addEventListener("click",(t=>{const s=t.target?.dataset.name||t.target.closest("li")?.dataset.name;if(s){this.showList(s,e);if(this.smallMediaQuery.matches){this.hideSidebar()}}}),false);this.taskInput.addEventListener("keyup",(t=>{if(t.code==="Enter"){this.addTask(e)}}),false);this.titleInput.addEventListener("keyup",(t=>{if(t.code==="Enter"){this.renameTask(e)}}),false);this.rename.addEventListener("click",(()=>{this.renameTask(e)}),false);this.remove.addEventListener("click",(()=>{this.handleEvent("removeTask",e)}),false);this.close.addEventListener("click",this.hideDetails.bind(this),false);this.menuBtn.addEventListener("click",this.toggleSidebar.bind(this),false);this.importanceCheckBtn.addEventListener("click",(t=>{const s=t.target.closest("[data-id]");this.handleEvent("importantTask",e,+s.dataset.id)}),false);this.myDay.addEventListener("click",(()=>{this.handleEvent("myDayTask",e)}),false);this.noteBtn.addEventListener("click",(()=>{this.setTaskNote(e)}),false);this.mediaQueryList.addEventListener("change",this.screenTest.bind(this),false);window.addEventListener("resize",this.setDocHeight,false);window.addEventListener("orientationchange",this.setDocHeight,false)}addTask(t){const s=this.taskInput.value.trim();const i=Date.now();const a=this.mainContainer.dataset.list;if(s){t.postMessage({type:"addTask",title:s,creationDate:i,list:a})}else{e("Required field(s) missing: title")}}renameTask(t){const s=this.titleInput.value.trim();const i=+this.detailsContainer.dataset.id;if(s){t.postMessage({type:"renameTask",id:i,title:s})}else{e("Required field(s) missing: title")}}showDetails(e,t){if(e.classList.contains("show-details")){const s=e.parentNode;const i=+s.dataset.id;if(i!==+this.detailsContainer.dataset.id){t.postMessage({type:"showDetails",id:i})}this.detailsContainer.classList.add("expanded");this.screenTest()}}hideDetails(){this.detailsContainer.classList.remove("expanded");this.taskList.querySelector(".selected")?.classList?.remove("selected");this.screenTest()}toggleSidebar(){this.sidebar.classList.toggle("expanded");this.screenTest(undefined,this.detailsContainer)}hideSidebar(){this.sidebar.classList.remove("expanded");this.screenTest()}handleEvent(e,t,s=+this.detailsContainer.dataset.id){t.postMessage({type:e,id:s})}setTaskNote(t){const s=+this.detailsContainer.dataset.id;const i=this.note.value.trim();if(i){t.postMessage({type:"noteTask",id:s,note:i})}else{e("Required field(s) missing: note")}}showList(e,t){document.querySelector(".list.selected")?.classList?.remove("selected");document.querySelector(`.list[data-name="${e}"]`).classList.add("selected");t.postMessage({type:"list",list:e})}setDetailClasses(e){const t=+this.detailsContainer.dataset.id;let s=e;if(Array.isArray(e)){s=e.find((e=>e.id===t))}this.detailsContainer.classList.remove("important","completed","today");if(s?.important){this.detailsContainer.classList.add("important")}if(s?.completed){this.detailsContainer.classList.add("completed")}if(s?.my_day){this.detailsContainer.classList.add("today")}}screenTest(e=this.mediaQueryList,t=this.sidebar){if(e.matches&&document.querySelectorAll(".expanded").length>1){t.classList.remove("expanded")}if(this.smallMediaQuery.matches&&document.querySelector(".expanded")){this.mainContainer?.classList.add("hidden")}else{this.mainContainer?.classList.remove("hidden")}}setDocHeight(){document.documentElement.style.setProperty("--vh",`${window.innerHeight}px`)}setSelected(e){this.taskList.querySelector(".selected")?.classList?.remove("selected");e.classList.add("selected")}}