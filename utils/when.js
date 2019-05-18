'use strict';

const moment = require('moment');

const diffYearMonth = {
	check(start, end) {
		return (start.getFullYear() != end.getFullYear()) || (start.getMonth() != end.getMonth());
	},
	format(start, end) {
		return `${moment(start).format('ddd Do MMM')} till ${moment(end).format('ddd Do MMM')}`;
	}
};

const diffDay = {
	check(start, end) {
		return start.getDay() != end.getDay();
	},
	format(start, end) {
		return `${moment(start).format('ddd Do')} till ${moment(end).format('ddd Do MMM')}`;
	}
};

const diffTime = {
	check(start, end) {
		return (start.getHours() != end.getHours()) || (start.getMinutes() != end.getMinutes());
	},
	format(start, end) {
		return `${moment(start).format('ddd Do hh:mm a')} till ${moment(end).format('hh:mm a')}`;
	}
};

const diffNone = {
	check() {
		return true;
	},
	format(start) {
		return moment(start).format('ddd Do MMM');
	}
};

let formats = [diffYearMonth, diffDay, diffTime, diffNone];

function format(start, end) {
	return formats.find((format) => format.check(start, end)).format(start, end);
}

module.exports = format;
