/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/plugin/additionalElements/AddElementsDialog",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4"
], function (
	AddElementsDialog,
	Log,
	sinon
) {
	"use strict";

	jQuery("#qunit-fixture").hide();

	var sandbox = sinon.sandbox.create();

	function createDialog(bCFE) {
		var aElements = [
			{
				selected: false,
				label: "label1",
				tooltip: "tooltip1",
				elementId: "field1",
				originalLabel: "original",
				type: "invisible"
			},
			{
				selected: true,
				label: "label2",
				tooltip: "tooltip2",
				name: "field2",
				type: "odata"
			},
			{
				selected: true,
				label: "label3",
				tooltip: "tooltip3",
				referencedComplexPropertyName: "complexPropName",
				name: "field3",
				type: "odata"
			},
			{
				selected: false,
				label: "label4",
				tooltip: "tooltip4",
				referencedComplexPropertyName: "duplicateComplexPropName",
				duplicateComplexName: true,
				name: "field4",
				type: "odata"
			}
		];

		var oAddElementsDialog = new AddElementsDialog({
			title: "hugo",
			customFieldEnabled: bCFE
		});

		oAddElementsDialog.setElements(aElements);

		return oAddElementsDialog;
	}

	QUnit.module("Given that a AddElementsDialog is available...", {
		beforeEach: function (assert) {},
		afterEach: function () {
			this.oAddElementsDialog.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when item is selected, focus should persist", function(assert) {
			var done = assert.async();

			function getItemByPath(aItems, sBindingPath) {
				return aItems.filter(function (oItem) {
					return oItem.getBindingContext().getPath() === sBindingPath;
				})[0];
			}

			this.oAddElementsDialog = createDialog();

			var oList = this.oAddElementsDialog.getList();
			var sBindingPath = oList.getItems()[0].getBindingContext().getPath();


			this.oAddElementsDialog.attachOpened(function() {
				var oTargetItem = getItemByPath(oList.getItems(), sBindingPath);
				oTargetItem.$().focus();
				assert.strictEqual(document.activeElement, oTargetItem.getDomRef());
				oTargetItem.$().trigger("tap");

				// Wait until list is re-rendered
				setTimeout(function () {
					var oTargetItem = getItemByPath(oList.getItems(), sBindingPath);
					assert.strictEqual(document.activeElement, oTargetItem.getDomRef());
					done();
				});
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when AddElementsDialog gets initialized and open is called,", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog = createDialog();

			this.oAddElementsDialog.attachOpened(function() {
				assert.ok(true, "then dialog pops up,");
				assert.equal(this.getTitle(), "hugo", "then the title is set");
				assert.equal(this._oList.getItems().length, 4, "then 4 elements internally known");
				assert.equal(this.getElements().length, 4, "then 4 elements externally known");
				assert.equal(this.getSelectedElements().length, 2, "then 2 selected elements");
				assert.equal(this._oCustomFieldButton.getEnabled(), false, "then the customField-button is disabled");
				assert.equal(this._oList.getItems()[0].getContent()[0].getItems()[1].getText(), "was original", "then the originalLabel is set");
				done();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when AddElementsDialog gets initialized with customFieldsEnabled set and open is called", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog = createDialog(true);

			this.oAddElementsDialog.attachOpenCustomField(function() {
				assert.ok(true, "then the openCustomField event is fired");
				done();
			});
			this.oAddElementsDialog.attachOpened(function() {
				assert.equal(this._oCustomFieldButton.getEnabled(), true, "then the button is enabled");
				this._oCustomFieldButton.firePress();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when on opened AddElementsDialog OK is pressed,", function(assert) {
			this.oAddElementsDialog = createDialog();

			this.oAddElementsDialog.attachOpened(function() {
				this._submitDialog();
			});

			return this.oAddElementsDialog.open().then(function() {
				assert.ok(true, "then the promise got resolved");
			});
		});

		QUnit.test("when on opened AddElementsDialog Cancel is pressed,", function(assert) {
			this.oAddElementsDialog = createDialog();

			this.oAddElementsDialog.attachOpened(function() {
				this._cancelDialog();
			});

			return this.oAddElementsDialog.open().then(function() {
				assert.ok(false, "then the promise got rejected");
			}).catch(function() {
				assert.ok(true, "then the promise got rejected");
			});
		});

		QUnit.test("when on opened AddElementsDialog the list gets filtered via input", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog = createDialog();

			this.oAddElementsDialog.attachOpened(function () {
				assert.equal(this._oList.getItems().length, 4, "then 4");
				this._updateModelFilter({getParameter: function() {return "2";}});
				assert.equal(this._oList.getItems().length, 1, "then 1");
				this._updateModelFilter({getParameter: function() {return null;}});
				assert.equal(this._oList.getItems().length, 4, "then 4");
				this._updateModelFilter({getParameter: function() {return "complex";}});
				assert.equal(this._oList.getItems().length, 1, "then 1");
				assert.equal(this._oList.getItems()[0].getContent()[0].getItems()[0].getText(), "label4 (duplicateComplexPropName)", "then only label4 where complex is part of the label (duplicateComplexName)");
				this._updateModelFilter({getParameter: function() {return null;}});
				this._updateModelFilter({getParameter: function() {return "orig";}});
				assert.equal(this._oList.getItems().length, 1, "then 1");
				assert.equal(this._oList.getItems()[0].getContent()[0].getItems()[0].getText(), "label1", "then only label1 with original name");
				done();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when on opened AddElementsDialog the resort-button is pressed,", function (assert) {
			var done = assert.async();

			this.oAddElementsDialog = createDialog();

			this.oAddElementsDialog.attachOpened(function() {
				assert.equal(this._oList.getItems().length, 4, "then 4");
				assert.equal(this._oList.getItems()[0].getContent()[0].getItems()[0].getText(), "label1", "then label1 is first");
				this._resortList();
				assert.equal(this._oList.getItems()[0].getContent()[0].getItems()[0].getText(), "label4 (duplicateComplexPropName)", "then label2 is first");
				done();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when unsupported element type is specified", function (assert) {
			var fnDone = assert.async();
			this.oAddElementsDialog = createDialog();

			sandbox.stub(Log, "error")
				.callThrough()
				.withArgs(sinon.match("unsupported data type"))
				.callsFake(function () {
					assert.ok(true);
					fnDone();
				});

			this.oAddElementsDialog.setElements([{
				label: "label1",
				type: "unknown"
			}]);
		});
	});
});
