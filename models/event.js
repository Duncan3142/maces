'use strict';

function eventModel(BaseModel) {

	class Event extends BaseModel {

		image() {
			return this.media.find(media => media.usage === 'image');
		}

		document() {
			return this.media.find(media => media.usage === 'document');
		}

		static get tableName() {
			return 'event';
		}

		static get jsonSchema() {
			return {
				type: 'object',
				required: ['title','description','when','location','start','end'],

				properties: {
					id: {type: 'integer'},
					title: {type: 'string', minLength: 1},
					description: {type: 'string', minLength: 1},
					when: {type: 'string', minLength: 1},
					location: {type: 'string', minLength: 1},
					start: {class: 'date'},
					end: {class: 'date'}
				}
			};
		}

		static get relationMappings() {
			return {
				media: {
					relation: BaseModel.ManyToManyRelation,
					modelClass: this.modelClass('media'),
					join: {
						from: 'event.id',
						// ManyToMany relation needs the `through` object
						// to describe the join table.
						through: {
							// If you have a model class for the join table
							// you need to specify it like this:
							modelClass: this.modelClass('event_media'),
							from: 'event_media.event_id',
							to: 'event_media.media_id',
							extra: ['usage']
						},
						to: 'media.id'
					}
				},
				event_media: {
					relation: BaseModel.HasManyRelation,
					modelClass: this.modelClass('event_media'),
					join: {
						from: 'event.id',
						to: 'event_media.event_id'
					}
				}
			};
		}
	}

	return Event;
}

module.exports = eventModel;
