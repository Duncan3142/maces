'use strict';

function adminModel(BaseModel) {

	class Admin extends BaseModel {
		static get tableName() {
			return 'admin';
		}

		static get jsonSchema() {
			return {
				type: 'object',
				required: ['email', 'hash'],

				properties: {
					email: {type: 'string', format: 'email'},
					hash: {type: 'string'}
				}
			};
		}
	}

	return Admin;
}

//Export model
module.exports = adminModel;
