import { logger } from './logger.js';

export class Rminder {
	constructor() {
		this.taskInput = document.getElementById('task');
		this.addTaskBtn = document.querySelector('.add-task');
		this.taskList = document.querySelector('.tasks__list');
		this.detailsContainer = document.querySelector('.details');
		this.titleInput = document.querySelector('.title');
		this.rename = document.querySelector('.rename');
		this.remove = document.querySelector('.remove');
		this.close = document.querySelector('.close');
		this.myDay = document.querySelector('.my-day');
		this.importanceCheckBtn = this.detailsContainer.querySelector('.importance-check');
		this.note = document.querySelector('.note');
		this.countMyDay = document.querySelector('.count-my-day');
		this.countImportant = document.querySelector('.count-important');
		this.countTasks = document.querySelector('.count-tasks');
		this.menuBtn = document.querySelector('.menu');
		this.sidebar = document.querySelector('.sidebar');
		this.checkSquareTmp = document.getElementById('check-square');
		this.starTmp = document.getElementById('star');
		this.lists = document.querySelector('.lists');
		this.listTitle = document.querySelector('.list-title');
		this.mainContainer = document.querySelector('.main');
		this.creationDate = document.querySelector('.creation-date');
	}

	launch(data) {
		logger('web worker initialised: ', data);
	}

	success(data) {
		const msg = typeof data.message !== 'undefined' ? `Success: ${data.message}` : 'Success: ';
		logger(msg, data);
	}

	opened(data, db) {
		logger(data.message);
		this.addEventListeners(db);
	}

	clear(data) {
		logger(data.message);
		this.taskInput.value = '';
		this.taskList.innerHTML = '';
	}

	tasks({ value: data, list }) {
		logger('Tasks:', data);
		let dt = data;
		let title = 'Tasks';
		let name = 'tasks';

		if (list?.title) {	
			dt = list.value;
			title = list.title;
			name = list.name;
		}

		// Show tasks
		this.taskList.innerHTML = dt.map(task => `<li class="${task.completed ? 'completed ' : ''}${task.important ? 'important ' : ''}" data-id="${task.id}"><span class="completed-ckeck" title="Set it as complete">${this.checkSquareTmp.innerHTML}</span><button class="show-details">${task.title}</button><span class="importance-check" title="Set it as important">${this.starTmp.innerHTML}</span>`).join('');
		// Show counters
		this.countMyDay.innerText = data.filter(d => d.my_day).length;
		this.countImportant.innerText = data.filter(d => d.important).length;
		this.countTasks.innerText = data.length; // TODO: change total for tasks list after adding lists functionality
		// Set List title
		this.listTitle.innerText = title;
		this.mainContainer.dataset.list = name;

		this.setDetailClasses(data);
	}

	details({ value: data }) {
		logger('Details: ', data);
		const date = new Date(data.creation_date);
		this.detailsContainer.setAttribute('aria-label', `Detail for task: ${data.title}`);
		this.detailsContainer.dataset.id = data.id;
		this.titleInput.value = data.title;
		this.note.value = data.note || '';
		this.creationDate.innerText = new Intl.DateTimeFormat().format(date);

		this.setDetailClasses(data);
	}

	addEventListeners(db) {
		this.addTaskBtn.addEventListener('click', () => { this.addTask(db); }, false);

		this.taskList.addEventListener('click', e => {
			if (e.target.classList.contains('show-details')) {
				this.showDetails(e.target, db);
			}

			if (e.target.classList.contains('importance-check') || e.target.closest('.importance-check')) {
				const parent = e.target.closest('[data-id]');
				this.handleEvent('importantTask', db, +parent.dataset.id);
			}

			if (e.target.classList.contains('completed-ckeck') || e.target.closest('.completed-ckeck')) {
				const parent = e.target.closest('[data-id]');
				this.handleEvent('completedTask', db, +parent.dataset.id);
			}

		}, false);

		this.lists.addEventListener('click', e => {
			const list = e.target.dataset.name || e.target.closest('li').dataset.name;
			if (list) {
				this.showList(list, db);
			}
		}, false);

		this.taskInput.addEventListener('keyup', event => {
			if (event.code === 'Enter') {
				this.addTask(db);
			}
		}, false);

		this.titleInput.addEventListener('keyup', event => {
			if (event.code === 'Enter') {
				this.renameTask(db);
			}
		}, false);

		this.rename.addEventListener('click', () => {
			this.renameTask(db);
		}, false);

		this.remove.addEventListener('click', () => {
			this.handleEvent('removeTask', db);
		}, false);

		this.close.addEventListener('click', this.hideDetails.bind(this), false);
		this.menuBtn.addEventListener('click', this.toggleSidebar.bind(this), false);

		this.importanceCheckBtn.addEventListener('click', (e) => {
			const parent = e.target.closest('[data-id]');
			this.handleEvent('importantTask', db, +parent.dataset.id);
		}, false);

		this.myDay.addEventListener('click', () => {
			this.handleEvent('myDayTask', db);
		}, false);

		this.note.addEventListener('blur', () => {
			this.setTaskNote(db);
		}, false);
	}

	addTask(db) {
		const title = this.taskInput.value.trim();
		const creationDate = Date.now();
		const list = this.mainContainer.dataset.list;
		if (title) {
			db.postMessage({ type: 'addTask', title, creationDate, list });
		} else {
			logger('Required field(s) missing: title');
		}
	}

	renameTask(db) {
		const title = this.titleInput.value.trim();
		const id = +this.detailsContainer.dataset.id; // convert id to number
		if (title) {
			db.postMessage({ type: 'renameTask', id, title });
		} else {
			logger('Required field(s) missing: title');
		}
	}

	showDetails(elem, db) {
		if (elem.classList.contains('show-details')) {
			const parent = elem.parentNode;
			const id = +parent.dataset.id;
			if (id !== +this.detailsContainer.dataset.id) {
				db.postMessage({ type: 'showDetails', id });
			}
			this.detailsContainer.classList.remove('details--closed');
		}
	}

	hideDetails() {
		this.detailsContainer.classList.add('details--closed');
	}

	toggleSidebar() {
		this.sidebar.classList.toggle('expanded');
	}

	handleEvent(type, db, id = +this.detailsContainer.dataset.id) {
		db.postMessage({ type, id });
	}

	setTaskNote(db) {
		const id = +this.detailsContainer.dataset.id;
		const text = this.note.value.trim();
		if (text) {
			db.postMessage({ type: 'noteTask', id, note: text });
		} else {
			logger('Required field(s) missing: note');
		}
	}

	showList(list, db) {
		db.postMessage({ type: 'list', list });
	}

	setDetailClasses(data) {
		const id = +this.detailsContainer.dataset.id;
		let dt = data;
		
		if (Array.isArray(data)) {
			dt = data.find(d => d.id === id);
		}
		
		this.detailsContainer.classList.remove('important', 'completed', 'today');

		if (dt?.important) {
			this.detailsContainer.classList.add('important');
		}

		if (dt?.completed) {
			this.detailsContainer.classList.add('completed');
		}

		if (dt?.my_day) {
			this.detailsContainer.classList.add('today');
		}
	}
}