'use strict';

function baseModel(Model, modelMap) {

	class BaseModel extends Model {

		static modelClass(className) {
			return modelMap.get(className);
		}
	}

	return BaseModel;
}

module.exports = baseModel;
