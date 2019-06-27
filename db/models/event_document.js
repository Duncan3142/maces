'use strict';

function eventDocumentModel(BaseModel) {

	class EventDocument extends BaseModel {
		static get tableName() {
			return 'event_document';
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

	return EventDocument;
}

//Export model
module.exports = eventDocumentModel;
