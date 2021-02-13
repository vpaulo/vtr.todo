import { logger } from './logger.js';

export class Rminder {
	constructor() {
		this.taskInput = document.getElementById('task');
		this.addTaskBtn = document.querySelectorAll('.add-task');
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

	tasks({ value: data }) {
		logger('Tasks:', data);
		// Show tasks
		this.taskList.innerHTML = data.map(dt => `<li class="${dt.completed ? 'completed ' : ''}${dt.important ? 'important ' : ''}" data-id="${dt.id}"><span class="completed-ckeck">${this.checkSquareTmp.innerHTML}</span><button class="show-details">${dt.title}</button><span class="importance-check">${this.starTmp.innerHTML}</span>`).join('');
		// Show counters
		this.countMyDay.innerText = data.filter(d => d.my_day).length;
		this.countImportant.innerText = data.filter(d => d.important).length;
		this.countTasks.innerText = data.length; // TODO: change total for tasks list after adding lists functionality

		this.setDetailClasses(data);
	}

	details({ value: data }) {
		logger('Details: ', data);
		this.detailsContainer.setAttribute('aria-label', `Detail for task: ${data.title}`);
		this.detailsContainer.dataset.id = data.id;
		this.titleInput.value = data.title;
		this.note.value = data.note || '';

		this.setDetailClasses(data);
	}

	addEventListeners(db) {
		Array.from(this.addTaskBtn).forEach(btn => {
			btn.addEventListener('click', () => { this.addTask(db); }, false);
		});

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
		if (title) {
			db.postMessage({ type: 'addTask', title, creationDate });
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

	setDetailClasses(data) {
		const id = +this.detailsContainer.dataset.id;
		let dt = data;
		
		if (Array.isArray(data)) {
			dt = data.find(d => d.id === id);
		}
		
		this.detailsContainer.classList.remove('important', 'completed');

		if (dt?.important) {
			this.detailsContainer.classList.add('important');
		}

		if (dt?.completed) {
			this.detailsContainer.classList.add('completed');
		}
	}
}