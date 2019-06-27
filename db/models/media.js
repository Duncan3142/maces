'use strict';

function mediaModel(BaseModel) {

	class Media extends BaseModel {
		static get tableName() {
			return 'media';
		}

		static get jsonSchema() {
			return {
				type: 'object',
				required: ['description', 'name', 'type', 'file', 'hash'],

				properties: {
					id: {type: 'integer'},
					description: {type: 'string'},
					name: {type: 'string'},
					type: {type: 'string'},
					file: {class: 'buffer'},
					hash: {type: 'string'}
				}
			};
		}

	}

	return Media;
}

//Export model
module.exports = mediaModel;
