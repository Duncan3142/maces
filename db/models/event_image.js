'use strict';

function eventImageModel(BaseModel) {

	class EventImage extends BaseModel {
		static get tableName() {
			return 'event_image';
		}

		static get jsonSchema() {
			return {
				type: 'object',
				required: ['event_id', 'media_id'],

				properties: {
					id: {type: 'integer'},
					event_id: {type: 'integer'},
					media_id: {type: 'integer'}
				}
			};
		}

	}

	return EventImage;
}

//Export model
module.exports = eventImageModel;
