'use strict';

const moment = require('moment');

function format(start, end) {

	if ((start.getFullYear() != end.getFullYear()) || (start.getMonth() != end.getMonth())) {
		return `${moment(start).format('ddd Do MMM')} till ${moment(end).format('ddd Do MMM')}`;
	} else if (start.getDay() != end.getDay()) {
		return `${moment(start).format('ddd Do')} till ${moment(end).format('ddd Do MMM')}`;
	} else if ((start.getHours() != end.getHours()) || (start.getMinutes() != end.getMinutes())) {
		return `${moment(start).format('ddd Do hh:mm a')} till ${moment(end).format('hh:mm a')}`;
	} else {
		return moment(start).format('ddd Do MMM');
	}
}

module.exports = format;
