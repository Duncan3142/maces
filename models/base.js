'use strict';

function baseModel(Model, modelMap, Validator) {

	class BaseModel extends Model {

		static modelClass(className) {
			return modelMap.get(className);
		}

		static createValidator() {
			return Validator;
		}
	}

	return BaseModel;
}

module.exports = baseModel;
