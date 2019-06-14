'use strict';

function mediaModel(BaseModel) {

	class Media extends BaseModel {
		static get tableName() {
			return 'media';
		}

		static get jsonSchema() {
			return {
				type: 'object',
				required: ['description', 'name', 'type', 'file'],

				properties: {
					id: {type: 'integer'},
					description: {type: 'string', minLength: 1},
					name: {type: 'string', minLength: 1},
					type: {type: 'string', minLength: 1},
					file: {class: 'buffer'}
				}
			};
		}

		static get relationMappings() {
			return {
				event: {
					relation: BaseModel.ManyToManyRelation,
					modelClass: this.modelClass('event'),
					join: {
						from: 'media.id',
						// ManyToMany relation needs the `through` object
						// to describe the join table.
						through: {
							// If you have a model class for the join table
							// you need to specify it like this:
							modelClass: this.modelClass('event_media'),
							from: 'event_media.media_id',
							to: 'event_media.event_id'
						},
						to: 'event.id'
					}
				},
				event_media: {
					relation: BaseModel.HasManyRelation,
					modelClass: this.modelClass('event_media'),
					join: {
						from: 'media.id',
						to: 'event_media.media_id'
					}
				}
			};
		}
	}

	return Media;
}

//Export model
module.exports = mediaModel;
