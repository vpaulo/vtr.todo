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
		this.importantBtn = document.querySelector('.important');
		this.note = document.querySelector('.note');
		this.countElems = document.querySelectorAll('.count');
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
		db.postMessage({ type: 'display' });
		db.postMessage({ type: 'getAll' });
	}

	clear(data) {
		logger(data.message);
		this.taskInput.value = '';
		this.taskList.innerHTML = '';
	}

	tasks(data) {
		logger(`Task: ${data.value.id} - ${data.value.title}`);
		this.taskList.innerHTML += `<li data-id="${data.value.id}"><span class="completed-ckeck">O</span><button class="show-details">${data.value.title}</button><span class="importance-check">*</span>`;
	}

	details(data) {
		logger('Details: ', data);
		this.detailsContainer.setAttribute('aria-label', `Detail for task: ${data.value.title}`);
		this.detailsContainer.dataset.id = data.value.id;
		this.titleInput.value = data.value.title;
		this.note.value = data.value.note || '';
	}

	allTasks(data) {
		logger('allTasks: ', data);
		const myDayTotal = data.value.filter(d => d.my_day).length;
		const importantTotal = data.value.filter(d => d.important).length;
		const tasksListTotal = data.value.length; // TODO: change total for tasks list after adding lists functionality
		Array.from(this.countElems).forEach(elem => {
			if (elem.classList.contains('count-my-day')) {
				elem.innerText = myDayTotal;
			}
			if (elem.classList.contains('count-important')) {
				elem.innerText = importantTotal;
			}
			if (elem.classList.contains('count-tasks')) {
				elem.innerText = tasksListTotal;
			}
		});
	}

	addEventListeners(db) {
		Array.from(this.addTaskBtn).forEach(btn => {
			btn.addEventListener('click', () => { this.addTask(db); }, false);
		});

		this.taskList.addEventListener('click', e => {
			if (e.target.classList.contains('show-details')) {
				this.showDetails(e.target, db);
			}

			if (e.target.classList.contains('importance-check')) {
				this.handleEvent('importantTask', db, +e.target.parentNode.dataset.id);
			}

			if (e.target.classList.contains('completed-ckeck')) {
				this.handleEvent('completedTask', db, +e.target.parentNode.dataset.id);
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

		this.close.addEventListener('click', this.hideDetails, false);

		this.importantBtn.addEventListener('click', () => {
			this.handleEvent('importantTask', db);
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
			db.postMessage({ type: 'showDetails', id });
			this.detailsContainer.classList.remove('details--closed');
		}
	}

	hideDetails() {
		this.detailsContainer.classList.add('details--closed');
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
}