'use strict';

function eventMediaModel(BaseModel) {

	class EventMedia extends BaseModel {
		static get tableName() {
			return 'event_media';
		}

		static get jsonSchema() {
			return {
				type: 'object',
				required: ['event_id', 'media_id', 'usage'],

				properties: {
					id: {type: 'integer'},
					usage: {type: 'string'},
					event_id: {type: 'integer'},
					media_id: {type: 'integer'}
				}
			};
		}

		static get relationMappings() {
			return {
				event: {
					relation: BaseModel.BelongsToOneRelation,
					modelClass: this.modelClass('event'),
					join: {
						from: 'event_media.event_id',
						to: 'event.id'
					}
				},
				media: {
					relation: BaseModel.BelongsToOneRelation,
					modelClass: this.modelClass('media'),
					join: {
						from: 'event_media.media_id',
						to: 'media.id'
					}
				}
			};
		}
	}

	return EventMedia;
}

//Export model
module.exports = eventMediaModel;
