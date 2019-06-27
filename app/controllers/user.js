'use strict';

function viewDefs() {
	return [
		{
			view: 'index',
			path: '/'
		},
		{
			view: 'about',
			path: '/about',
			args: {headerImage: 'committee'}
		},
		{
			view: 'history',
			path: '/history'
		},
		{
			view: 'thanks',
			path: '/thanks'
		},
		{
			view: 'photos',
			path: '/photos'
		},
		{
			view: 'login',
			path: '/login'
		}
	];
}

module.exports = viewDefs;
