// TODO: verify if using window onload is safer solution?
// window.addEventListener('load', () => {
// 	console.log('window loaded');
// });
import { Rminder } from './js/Rminder.js';
import { dbMessage } from './js/dbMessage.js';
(() => {
	console.log('loaded');

	const rminder = new Rminder();
	const db = new Worker('./js/workers/dbw.js');

	db.postMessage({ type: 'launch' });
	db.onmessage = (event) => dbMessage(rminder, event.data, db);
})();