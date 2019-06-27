'use strict';

function eventModel(BaseModel) {

	class Event extends BaseModel {

		static get tableName() {
			return 'event';
		}

		static get jsonSchema() {
			return {
				type: 'object',
				required: ['title','description','when','location','start','end'],

				properties: {
					id: {type: 'integer'},
					title: {type: 'string'},
					description: {type: 'string'},
					when: {type: 'string'},
					location: {type: 'string'},
					start: {class: 'date'},
					end: {class: 'date'}
				}
			};
		}

		static get relationMappings() {
			return {
				document: {
					relation: BaseModel.HasOneThroughRelation,
					modelClass: this.modelClass('media'),
					join: {
						from: 'event.id',
						through: {
							modelClass: this.modelClass('event_document'),
							from: 'event_document.event_id',
							to: 'event_document.media_id',
						},
						to: 'media.id'
					}
				},
				image: {
					relation: BaseModel.HasOneThroughRelation,
					modelClass: this.modelClass('media'),
					join: {
						from: 'event.id',
						through: {
							modelClass: this.modelClass('event_image'),
							from: 'event_image.event_id',
							to: 'event_image.media_id',
						},
						to: 'media.id'
					}
				},
			};
		}
	}

	return Event;
}

module.exports = eventModel;
