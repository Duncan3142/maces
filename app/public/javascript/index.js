import Vue from 'https://cdn.jsdelivr.net/npm/vue/dist/vue.esm.browser.js';

async function getEvents() {
	const response = await fetch('/api/events/upcoming');
	const events = await response.json();
	for (const event of events) {
		event.description = event.description.split('\n');
	}
	return new Vue({
		el: '#app',
		data: {
			events: events
		}
	});
}

getEvents();
