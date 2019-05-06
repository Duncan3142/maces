'use strict';

function indexController(models, raw, ref) {
	return {
		index: async function(req, res, next) {
			try {
				const Event = models.get('event');
				const Media = models.get('media');
				const events = await Event.query()
					.select([
						'event.id',
						'event.title',
						'event.description',
						'event.when',
						'event.location',
						'event.start',
						'event.end',
						raw("coalesce(?, '{}')", [
							Media.query()
								.select(raw("array_agg(jsonb_build_object('id',media.id, 'type',media.type, 'name',media.name, 'description',media.description))"))
								.joinRelation('event_media')
								.where('event_id', ref('event.id'))
								.groupBy('event_media.event_id')
						]).as('media')
					])
					.where('event.end', '>', new Date())
					.orderBy('event.start');
				res.render('index', { title: 'Macmillan East Sheen Home', events });
			} catch(err) {
				return next(err);
			}
		}
	};
}

// GET home page.
module.exports = indexController;
