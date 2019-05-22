function catch404(createError) {
	return function(req, res, next) {
		// catch 404 and forward to error handler
		next(createError(404));
	};
}

function defaultErrorStatus(status) {
	return status || 500;
}

function catchProductionErrors(env, err) {
	return env === 'development' ? err : {};
}

function renderError() {
	return function(err, req, res, next) {
		// set locals, only providing error in development
		res.locals.message = err.message;
		res.locals.error = catchProductionErrors(req.app.get('env'), err);

		// render the error page
		res.status(defaultErrorStatus(err.status));
		res.render('error');
	};
}

function errorHandlers(createError) {
	return [
		catch404(createError),
		renderError()
	];
}

module.exports = errorHandlers;
