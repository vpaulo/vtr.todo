import { logger } from './logger.js';

export class Rminder {
	constructor() {
		this.mediaQueryList = matchMedia('only screen and (max-width: 900px)');
		this.smallMediaQuery = matchMedia('only screen and (max-width: 630px)');

		this.taskInput = document.getElementById('task');
		this.addTaskBtn = document.querySelector('.add-task');
		this.taskList = document.querySelector('.tasks__list');
		this.detailsContainer = document.querySelector('.details');
		this.titleInput = document.querySelector('.title');
		this.rename = document.querySelector('.rename');
		this.remove = document.querySelector('.remove');
		this.close = document.querySelector('.close');
		this.myDay = document.querySelector('.my-day');
		this.importanceCheckBtn = this.detailsContainer?.querySelector('.importance-check');
		this.completedCheck = this.detailsContainer?.querySelector('.completed-ckeck');
		this.note = document.querySelector('.note');
		this.noteBtn = document.querySelector('.add-note');
		this.countMyDay = document.querySelector('.count-my-day');
		this.countImportant = document.querySelector('.count-important');
		this.countCompleted = document.querySelector('.count-completed');
		this.countTasks = document.querySelector('.count-tasks');
		this.menuBtn = document.querySelector('.menu');
		this.sidebar = document.querySelector('.sidebar');
		this.checkSquareTmp = document.getElementById('check-square');
		this.starTmp = document.getElementById('star');
		this.lists = document.querySelector('.lists');
		this.listTitle = document.querySelector('.list-title');
		this.mainContainer = document.querySelector('.main');
		this.creationDate = document.querySelector('.creation-date');
		this.toggleCompleted = document.querySelector('.toggle-completed');
		this.settingsBtn = document.querySelector('.app__settings');
		this.filterBtn = document.querySelector('.list-filter');
		[...this.orderFilters] = document.querySelectorAll('.order-filter');
		this.modal = document.querySelector('.modal');
		this.modalCancel = this.modal?.querySelector('.default');
		this.modalDelete = this.modal?.querySelector('.warning');
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
		this.countCompleted.innerText = data.filter(d => d.completed).length;
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
				this.setSelected(e.target.closest('[data-id]'));
			}

			if (e.target.classList.contains('importance-check') || e.target.closest('.importance-check')) {
				const parent = e.target.closest('[data-id]');
				this.handleEvent('importantTask', db, +parent.dataset.id);
			}

			if (e.target.classList.contains('completed-ckeck') || e.target.closest('.completed-ckeck')) {
				const parent = e.target.closest('[data-id]');
				if (parent.dataset.id === this.detailsContainer.dataset.id && this.toggleCompleted.checked) {
					this.hideDetails();
				}
				this.handleEvent('completedTask', db, +parent.dataset.id);
			}

		}, false);

		// TODO: create common function to handle completed check events
		this.completedCheck.addEventListener('click', e => {
			const parent = e.target.closest('[data-id]');
			if (this.toggleCompleted.checked) {
				this.hideDetails();
			}
			this.handleEvent('completedTask', db, +parent.dataset.id);
		}, false);

		this.lists.addEventListener('click', e => {
			const list = e.target?.dataset.name || e.target.closest('li')?.dataset.name;
			if (list) {
				this.showList(list, db);

				if (this.smallMediaQuery.matches) {
					this.hideSidebar();
				}
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

		this.rename.addEventListener('vp-button:click', () => {	this.renameTask(db); });
		this.noteBtn.addEventListener('vp-button:click', () => { this.setTaskNote(db); });

		this.remove.addEventListener('click', () => {
			this.modal.classList.add('open');
		}, false);

		this.modalCancel.addEventListener('click', () => {
			this.modal.classList.remove('open');
		}, false);

		this.modalDelete.addEventListener('click', () => {
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

		this.mediaQueryList.addEventListener('change', this.screenTest.bind(this), false);

		this.toggleCompleted.addEventListener('click', (evt) => { this.settingsCompleted(evt.target, db); }, false);

		this.settingsBtn.addEventListener('click', () => this.toggle(this.settingsBtn), false);
		this.filterBtn.addEventListener('click', () => this.toggle(this.filterBtn), false);

		this.orderFilters.forEach(filter => filter.addEventListener('change', evt => { this.filterUpdate(evt.target, db); }, false));

		window.addEventListener('resize', this.setDocHeight, false);
		window.addEventListener('orientationchange', this.setDocHeight, false);
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
		const list = this.mainContainer.dataset.list;
		if (title) {
			db.postMessage({ type: 'renameTask', id, title, list });
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
			this.detailsContainer.classList.add('expanded');
			this.screenTest();
		}
	}

	hideDetails() {
		this.detailsContainer.classList.remove('expanded');
		this.taskList.querySelector('.selected')?.classList?.remove('selected');
		this.modal.classList.remove('open');
		this.screenTest();
	}

	toggleSidebar() {
		this.sidebar.classList.toggle('expanded');
		this.screenTest(undefined, this.detailsContainer);
	}

	hideSidebar() {
		this.sidebar.classList.remove('expanded');
		this.screenTest();
	}

	handleEvent(type, db, id = +this.detailsContainer.dataset.id) {
		const list = this.mainContainer.dataset.list;
		db.postMessage({ type, id, list });
	}

	setTaskNote(db) {
		const id = +this.detailsContainer.dataset.id;
		const text = this.note.value.trim();
		const list = this.mainContainer.dataset.list;
		if (text) {
			db.postMessage({ type: 'noteTask', id, note: text, list });
		} else {
			logger('Required field(s) missing: note');
		}
	}

	selectList({ list }) {
		document.querySelector('.list.selected')?.classList?.remove('selected');
		document.querySelector(`.list[data-name="${list}"]`).classList.add('selected');
	}

	showList(list, db) {
		this.selectList({ list });
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

	screenTest(mql = this.mediaQueryList, elem = this.sidebar) {
		if (mql.matches && document.querySelectorAll('.expanded').length > 1) {
			elem.classList.remove('expanded');
		}

		if (this.smallMediaQuery.matches && document.querySelector('.expanded')) {
			this.mainContainer?.classList.add('hidden');
		} else {
			this.mainContainer?.classList.remove('hidden');
		}
	}

	setDocHeight() {
		document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`);
	}

	setSelected(el) {
		this.taskList.querySelector('.selected')?.classList?.remove('selected');
		el.classList.add('selected');
	}

	settingsCompleted(elem, db) {
		const checked = elem.checked;
		const list = this.mainContainer.dataset.list;
		db.postMessage({ type: 'settings', completed: checked, list });
	}

	toggle(elem) {
		elem.classList.toggle('open');
	}

	settings({ settings } = {}) {
		if (!settings) {
			return false;
		}

		const completedList = this.lists.querySelector('[data-name="completed"]');
		if (settings.completed === 'hide') {
			this.toggleCompleted.checked = true;
			completedList.classList.add('hidden');
			if (completedList.classList.contains('selected')) {
				this.lists.querySelector('[data-name="tasks"]').click(); // Select Tasks list if Completed list was selected before hidding
			}
		} else {
			this.toggleCompleted.checked = false;
			completedList.classList.remove('hidden');
		}

		if (settings.filter) {
			this.orderFilters.forEach(filter => {
				if (filter.value === settings.filter) {
					filter.parentNode.click();
				}
			});
		}
	}

	filterUpdate(elem, db) {
		db.postMessage({ type: 'filter', filter: elem.value });
	}
}