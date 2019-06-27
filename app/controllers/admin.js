'use strict';

function viewDefs() {
	return [
		{
			view: 'index',
			path: '/',
			requireAuth: true
		},
		{
			view: 'event',
			path: '/events',
			requireAuth: true
		},
		{
			view: 'event_form',
			path: '/event/create',
			args: {mode: 'create'},
			requireAuth: true
		},
		{
			view: 'event_form',
			path: '/event/edit',
			args: {mode: 'edit'},
			requireAuth: true
		},
		{
			view: 'media',
			path: '/media',
			requireAuth: true
		},
		{
			view: 'media_create',
			path: '/media/upload',
			requireAuth: true
		},
		{
			view: 'media_update',
			path: '/media/update',
			requireAuth: true
		}
	];
}

module.exports = viewDefs;
