'use strict';

const removeSpaces = (fileName) => fileName.split(' ').join('_');

function uploadMiddleware(multer, mimetype, filehash) {
	const maxFileSize = 5 * 1024 * 1024; // 5 MB upload limit;

	const upload = multer({
		storage: multer.memoryStorage(),
		limits: {
			fileSize: maxFileSize, // 5 MB upload limit
			files: 1 // 1 file
		}
	});

	return [
		upload.single('file'),
		function (req, res, next) {
			const {originalname: name = '', buffer: file = null} = req.file || {};
			delete req.file;
			req.body.type = mimetype(file);
			req.body.name = name;
			req.body.file = file;
			req.body.hash = filehash(file);
			next();
		}
	];
}

function validatorDefs(mimeTypes) {
	return function(buildCheckFunction) {
		const param = buildCheckFunction(['param']);
		const body = buildCheckFunction(['body']);
		const header = buildCheckFunction(['header']);

		return [
			{
				name: 'id',
				middleware: param('id', 'Media ID required').isInt().toInt()
			},
			{
				name: 'description',
				middleware: body('description', 'Media description required').trim().isLength({ min: 1 })
			},
			{
				name: 'link_text',
				set: 'core',
				middleware: body('link_text', 'Link text required').trim().isLength({ min: 1 })
			},
			{
				name: 'type',
				set: 'core',
				middleware: body('type')
					.isIn(mimeTypes).withMessage(`File must be one of the following mime types: ${mimeTypes}`)
			},
			{
				name: 'name',
				set: 'core',
				middleware: body('name', 'Valid file name required').customSanitizer(removeSpaces).matches(/\w+(?:\.\w+)+/)
			},
			{
				name: 'file',
				set: 'core',
				middleware: body('file', 'File data required').exists({checkNull: true})
			},
			{
				name: 'hash',
				set: 'core',
				middleware: body('hash', 'Valid file hash required').trim().matches(/[a-z0-9]{32}/)
			},
			{
				name: 'ETag',
				set: 'core',
				middleware: header('if-none-match', 'Valid ETag required').optional().trim().matches(/[a-z0-9]{32}/)
			}
		];
	};
}

function routeDef(mediaService, multer, mimetype, filehash) {
	const upload = uploadMiddleware(multer, mimetype, filehash);
	return {
		validators: validatorDefs(mediaService),
		verbs: function(verbHandler) {
			return [
				{
					name: 'get',
					path: '/',
					handler: verbHandler({
						service: mediaService.list,
						requireAuth: true
					})
				},
				{
					name: 'get',
					path: '/:id/data',
					handler: verbHandler({
						service: mediaService.fetchData,
					})
				},
				{
					name: 'get',
					path: '/:id',
					handler: verbHandler({
						fields: ['id'],
						service: mediaService.fetch,
						requireAuth: true
					})
				},
				{
					name: 'post',
					path: '/',
					handler: verbHandler({
						middleware: upload,
						fields: ['description','link_text','type','name','file','hash'],
						service: mediaService.upsert,
						requireAuth: true
					})
				},
				{
					name: 'put',
					path: '/:id',
					handler: verbHandler({
						fields: ['id', 'description','link_text'],
						service: mediaService.upsert,
						requireAuth: true
					})
				},
				{
					name: 'delete',
					path: '/:id',
					handler: verbHandler({
						fields: ['id'],
						service: mediaService.delete,
						requireAuth: true
					})
				}
			];
		}
	};
}

module.exports = routeDef;
