/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/fl/changeHandler/BaseRename'
], function (BaseRename) {
	"use strict";

	return {
		"hideControl": "default",
		"rename": BaseRename.createRenameChangeHandler({
			propertyName: "text",
			translationTextType: "XFLD"
		}),
		"unhideControl": "default"
	};
}, /* bExport= */ false);