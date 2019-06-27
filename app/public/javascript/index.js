import Vue from 'https://cdn.jsdelivr.net/npm/vue/dist/vue.esm.browser.js';

async function getEvents() {
	const response = await fetch('/api/events');
	return new Vue({
		el: '#app',
		data: {
			message: 'for much good times',
			events: response,
			peekaboo: true
		}
	});
}

getEvents();
