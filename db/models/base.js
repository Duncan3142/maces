'use strict';

function macesModel(ObjectionModel, modelMap, Validator) {

	class MacesModel extends ObjectionModel {

		static modelClass(className) {
			return modelMap.get(className);
		}

		static createValidator() {
			return Validator;
		}
	}

	return MacesModel;
}

module.exports = macesModel;
