/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/layout/cssgrid/CSSGrid",
	"sap/ui/core/HTML",
	"sap/ui/layout/cssgrid/GridItemLayoutData",
	"sap/ui/Device",
	"sap/ui/core/Core"
],
function (
	CSSGrid,
	HTML,
	GridItemLayoutData,
	Device,
	Core
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	var EDGE_VERSION_WITH_GRID_SUPPORT = 16;
	var bBrowserSupportGrid = !Device.browser.msie && !(Device.browser.edge && Device.browser.version < EDGE_VERSION_WITH_GRID_SUPPORT);

	QUnit.module("Init");

	QUnit.test("Initialization", function (assert) {

		// Arrange
		sinon.spy(CSSGrid.prototype, "_initGridLayoutDelegate");

		// Act
		var oGrid = new CSSGrid();

		// Assert
		assert.ok(oGrid.isA("sap.ui.layout.cssgrid.IGridConfigurable"), "Grid should be of type sap.ui.layout.cssgrid.IGridConfigurable");
		assert.ok(oGrid._oGridObserver && oGrid._oGridObserver.isObserved(oGrid, { aggregations: ["items"] }), "Grid items aggregation should be observed");

		assert.equal(oGrid.getItems().length, 0, "Grid should have no items");
		assert.notOk(oGrid.getCustomLayout(), "customLayout should be unset");

		assert.equal(oGrid.getWidth(), "100%", "width should be 100%");
		assert.equal(oGrid.getGridAutoFlow(), "Row", "gridAutoFlow should be unset");
		assert.notOk(oGrid.getGridTemplateColumns(), "gridTemplateColumns should be unset");
		assert.notOk(oGrid.getGridTemplateRows(), "gridTemplateRows should be unset");
		assert.notOk(oGrid.getGridRowGap(), "gridRowGap should be unset");
		assert.notOk(oGrid.getGridColumnGap(), "gridColumnGap should be unset");
		assert.notOk(oGrid.getGridGap(), "gridGap should be unset");
		assert.notOk(oGrid.getGridAutoRows(), "gridAutoRows should be unset");
		assert.notOk(oGrid.getGridAutoColumns(), "gridAutoColumns should be unset");

		assert.ok(CSSGrid.prototype._initGridLayoutDelegate.calledOnce, "GridLayoutDelegate should be initialized");
		assert.ok(oGrid.oGridLayoutDelegate, "GridLayoutDelegate initialized");

		// Cleanup
		CSSGrid.prototype._initGridLayoutDelegate.restore();
	});

	QUnit.test("IGridConfigurable Interface implementation", function (assert) {

		// Arrange
		var bGetGridDomRefs = CSSGrid.prototype.getGridDomRefs && (typeof CSSGrid.prototype.getGridDomRefs === "function"),
			bGetGridLayoutConfiguration = CSSGrid.prototype.getGridLayoutConfiguration && (typeof CSSGrid.prototype.getGridLayoutConfiguration === "function");

		// Assert
		assert.ok(bGetGridDomRefs, "getGridDomRefs should be implemented");
		assert.ok(bGetGridLayoutConfiguration, "getGridLayoutConfiguration should be implemented");
	});

	QUnit.test("IGridConfigurable Interface implementation - getGridDomRefs", function (assert) {

		// Arrange
		var oGrid = new CSSGrid();

		sinon.stub(CSSGrid.prototype, "getDomRef", function () {
			return { test: "test" };
		});

		// Act
		var aGridDomRefs = oGrid.getGridDomRefs();

		// Assert
		assert.ok(Array.isArray(aGridDomRefs), "getGridDomRefs should return an array");
		assert.equal(aGridDomRefs.length, 1, "Should have only one dom ref");
		assert.equal(aGridDomRefs[0].test, "test", "Should have the correct dom ref");

		// Cleanup
		CSSGrid.prototype.getDomRef.restore();
	});

	QUnit.test("IGridConfigurable Interface implementation - getGridLayoutConfiguration custom", function (assert) {

		// Arrange
		var oGrid = new CSSGrid();

		sinon.stub(CSSGrid.prototype, "getCustomLayout", function () {
			return { test: "test" };
		});

		// Act
		var oLayout = oGrid.getGridLayoutConfiguration();

		// Assert
		assert.ok(oLayout && oLayout.test === "test", "Should have a custom layout");

		// Cleanup
		CSSGrid.prototype.getCustomLayout.restore();
	});

	QUnit.test("IGridConfigurable Interface implementation - getGridLayoutConfiguration default", function (assert) {

		// Arrange
		var sRowGap = "1px",
			oGrid = new CSSGrid({
				gridRowGap: sRowGap
			});

		// Act
		var oLayout = oGrid.getGridLayoutConfiguration();

		// Assert
		assert.ok(oLayout && oLayout.isA("sap.ui.layout.cssgrid.GridLayoutBase"), "Should have a layout of type sap.ui.layout.cssgrid.GridLayoutBase");
		assert.ok(oLayout.getGridRowGap(), "gridRowGap should be set");
		assert.equal(oLayout.getGridAutoFlow(), "Row", "gridAutoFlow should be unset");
		assert.notOk(oLayout.getGridTemplateColumns(), "gridTemplateColumns should be unset");
		assert.notOk(oLayout.getGridTemplateRows(), "gridTemplateRows should be unset");
		assert.notOk(oLayout.getGridColumnGap(), "gridColumnGap should be unset");
		assert.notOk(oLayout.getGridGap(), "gridGap should be unset");
		assert.notOk(oLayout.getGridAutoRows(), "gridAutoRows should be unset");
		assert.notOk(oLayout.getGridAutoColumns(), "gridAutoColumns should be unset");
	});

	QUnit.module("Destroy");

	QUnit.test("Delegate", function (assert) {

		// Arrange
		sinon.spy(CSSGrid.prototype, "_destroyGridLayoutDelegate");

		var oGrid = new CSSGrid();

		// Act
		oGrid.destroy();

		// Assert
		assert.ok(CSSGrid.prototype._destroyGridLayoutDelegate.calledOnce, "Should call _destroyGridLayoutDelegate on exit");
		assert.ok(oGrid.oGridLayoutDelegate === null, "Should destroy GridLayoutDelegate on exit");

		// Cleanup
		CSSGrid.prototype._destroyGridLayoutDelegate.restore();
	});

	QUnit.test("Observer", function (assert) {

		// Arrange
		var oGrid = new CSSGrid();

		// Act
		oGrid.destroy();

		// Assert
		assert.ok(oGrid._oGridObserver === null, "Should destroy observer on exit");
	});

	QUnit.module("Items", {
		beforeEach: function () {
			this.oGrid = new CSSGrid();
			this.oGrid.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oGrid.destroy();
		}
	});

	QUnit.test("Items initialization", function (assert) {

		// Arrange
		var aItems = [
			new HTML({ content: "<div></div>" }),
			new HTML({ content: "<div></div>" }),
			new HTML({ content: "<div></div>" })
		];

		sinon.stub(GridItemLayoutData, "_setItemStyles");

		// Act
		aItems.forEach(function (oItem) {
			this.oGrid.addItem(oItem);
		}, this);
		Core.applyChanges();

		// Assert
		assert.ok(this.oGrid.getItems().length === 3, "Should have 3 items");
		assert.ok(GridItemLayoutData._setItemStyles.callCount === 3, "Should set styles for every item");

		// Cleanup
		GridItemLayoutData._setItemStyles.restore();
	});

	QUnit.module("_onGridChange", {
		beforeEach: function () {
			this.oGrid = new CSSGrid();
			this.oSpyAddDelegate = sinon.spy();
			this.oSpyRemoveDelegate = sinon.spy();
		},
		afterEach: function () {
			this.oSpyAddDelegate = null;
			this.oSpyRemoveDelegate = null;
			this.oGrid.destroy();
		}
	});

	QUnit.test("Item inserted", function (assert) {

		// Arrange
		var that = this;

		var oMockChanges = {
			name: "items",
			mutation: "insert",
			child: {
				addEventDelegate: that.oSpyAddDelegate,
				removeEventDelegate: that.oSpyRemoveDelegate
			}
		};

		// Act
		this.oGrid._onGridChange(oMockChanges);

		// Assert
		assert.ok(this.oSpyAddDelegate.calledOnce, "Should add a delegate for an inserted item");
		assert.ok(this.oSpyRemoveDelegate.notCalled, "Should NOT remove a delegate for an inserted item");
	});

	QUnit.test("Item removed", function (assert) {

		// Arrange
		var that = this;

		var oMockChanges = {
			name: "items",
			mutation: "remove",
			child: {
				addEventDelegate: that.oSpyAddDelegate,
				removeEventDelegate: that.oSpyRemoveDelegate
			}
		};

		// Act
		this.oGrid._onGridChange(oMockChanges);

		// Assert
		assert.ok(this.oSpyAddDelegate.notCalled, "Should NOT add a delegate for a removed item");
		assert.ok(this.oSpyRemoveDelegate.calledOnce, "Should remove a delegate for a removed item");
	});

	QUnit.test("Ignore aggregations other than 'items'", function (assert) {

		// Arrange
		var oMockChanges = {
			name: "header",
			mutation: "insert"
		};

		// Act
		this.oGrid._onGridChange(oMockChanges);

		// Assert
		assert.ok(this.oSpyAddDelegate.notCalled, "Should ignore an inserted header aggregation");
		assert.ok(this.oSpyRemoveDelegate.notCalled, "Should ignore a removed header aggregation");
	});

	QUnit.test("Ignore invalid change object", function (assert) {

		// Arrange
		var oMockChanges = {
			name: "items",
			mutation: "insert"
		};

		// Act
		this.oGrid._onGridChange(oMockChanges);

		// Assert
		assert.ok(this.oSpyAddDelegate.notCalled, "Should ignore invalid change object");
		assert.ok(this.oSpyRemoveDelegate.notCalled, "Should ignore invalid change object");
	});

	QUnit.module("LayoutData change", {
		beforeEach: function () {
			this.oGrid = new CSSGrid({
				items: [
					new HTML({ content: "<div></div>" }),
					new HTML({ content: "<div></div>" }),
					new HTML({ content: "<div></div>" })
				]
			});
			this.oLayoutData = new GridItemLayoutData({
				gridRow: "span 4",
				gridColumn: "span 2"
			});
			this.oItem = this.oGrid.getItems()[0];
			this.oGrid.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oGrid.destroy();
			if (this.oLayoutData) {
				this.oLayoutData.destroy();
			}
		}
	});

	QUnit.test("Set item layoutData", function (assert) {

		// Arrange
		sinon.spy(GridItemLayoutData, "_setItemStyles");
		sinon.spy(this.oGrid, "onLayoutDataChange");

		// Act
		this.oItem.setLayoutData(this.oLayoutData);
		Core.applyChanges();

		// Assert
		assert.ok(GridItemLayoutData._setItemStyles.calledOnce, "Should update item styles on layout data change");
		assert.ok(this.oGrid.onLayoutDataChange.calledOnce, "Should call layoutDataChange handler");

		if (bBrowserSupportGrid) {
			assert.ok(this.oItem.getDomRef().style.getPropertyValue("grid-row"), "Should have grid-row property");
			assert.ok(this.oItem.getDomRef().style.getPropertyValue("grid-column"), "Should have grid-column property");
		}

		// Cleanup
		GridItemLayoutData._setItemStyles.restore();
		this.oGrid.onLayoutDataChange.restore();
	});

	QUnit.test("Remove item layoutData", function (assert) {

		// Arrange
		this.oItem.setLayoutData(this.oLayoutData);
		Core.applyChanges();

		// Act
		this.oItem.setLayoutData(null);

		// Assert
		assert.notOk(this.oItem.getDomRef().style.getPropertyValue("grid-row"), "Should NOT have grid-row property");
		assert.notOk(this.oItem.getDomRef().style.getPropertyValue("grid-column"), "Should NOT have grid-column property");
	});


	if (bBrowserSupportGrid) {
		QUnit.test("Change item layoutData", function (assert) {

			// Arrange
			this.oItem.setLayoutData(this.oLayoutData);
			Core.applyChanges();

			// Act
			this.oLayoutData.setGridRow("span 5");

			// Assert
			var sGridRow = this.oItem.getDomRef().style.getPropertyValue("grid-row");

			// Check with indexOf as the browser normalizes the property value.
			assert.ok(sGridRow && sGridRow.indexOf("span 5") > -1, "Should have updated the grid-row property");
		});
	}

	QUnit.module("Clone", {
		beforeEach: function () {
			this.oGrid = new CSSGrid({
				items: [
					new HTML({
						content: "<div></div>",
						layoutData: new GridItemLayoutData({
							gridRow: "span 4"
						})
					}),
					new HTML({ content: "<div></div>" }),
					new HTML({ content: "<div></div>" })
				]
			});
			this.oGrid.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oGrid.destroy();
		}
	});

	QUnit.test("Full cloning", function (assert) {

		// Act
		var oClone = this.oGrid.clone();
		oClone.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		var sGridRow = oClone.getItems()[0].getDomRef().style.getPropertyValue("grid-row");

		// Assert
		assert.ok(oClone, "Should have successfully cloned the Grid");
		assert.equal(oClone.getItems().length, 3, "Should have 3 items");

		if (bBrowserSupportGrid) {
			assert.ok(sGridRow && sGridRow.indexOf("span 4") > -1, "Should have applied the grid-row property");
		}
	});

	QUnit.module("_getLayoutDataForControl");

	QUnit.test("Missing control", function (assert) {
		assert.notOk(GridItemLayoutData._getLayoutDataForControl(), "Should have NO layoutData if a control is not provided");
	});

	QUnit.test("Missing layoutData for control", function (assert) {

		// Arrange
		var oMockControl = {
			getLayoutData: function () { }
		};

		// Act
		var oLayoutData = GridItemLayoutData._getLayoutDataForControl(oMockControl);

		// Assert
		assert.notOk(oLayoutData, "Should have NO layoutData");
	});

	QUnit.test("LayoutData of type GridItemLayoutData", function (assert) {

		// Arrange
		// Mock for a control with layoutData of type 'sap.ui.layout.cssgrid.GridItemLayoutData'
		var oMockControl = {
			getLayoutData: function () {
				return {
					isA: function (sType) {
						if (sType === "sap.ui.layout.cssgrid.GridItemLayoutData") {
							return true;
						}
						return false;
					}
				};
			}
		};

		// Act
		var oLayoutData = GridItemLayoutData._getLayoutDataForControl(oMockControl);

		// Assert
		assert.ok(oLayoutData, "Should have layoutData");
	});

	QUnit.test("LayoutData of type VariantLayoutData with GridItemLayoutData inside", function (assert) {

		// Arrange
		// Mock for a control with layoutData of type 'sap.ui.core.VariantLayoutData'
		var oMockControl = {
			getLayoutData: function () {
				return {
					isA: function (sType) {
						if (sType === "sap.ui.core.VariantLayoutData") {
							return true;
						}
						return false;
					},
					getMultipleLayoutData: function () {
						return [
							{ isA: function () { return true; } },
							{ isA: function () { return false; } },
							{ isA: function () { return false; } }
						];
					}
				};
			}
		};

		// Act
		var oLayoutData = GridItemLayoutData._getLayoutDataForControl(oMockControl);

		// Assert
		assert.ok(oLayoutData, "Should have layoutData");
	});

	QUnit.test("LayoutData of unsupported type", function (assert) {

		// Arrange
		// Mock for a control with layoutData of type different than Variant/GridItem
		var oMockControl = {
			getLayoutData: function () {
				return {
					isA: function () {
						return false;
					}
				};
			}
		};

		// Act
		var oLayoutData = GridItemLayoutData._getLayoutDataForControl(oMockControl);

		// Assert
		assert.notOk(oLayoutData, "Should have NO layoutData");
	});

	QUnit.module("Item styles update");

	QUnit.test("_setItemStyles - Missing item object", function (assert) {

		// Arrange
		sinon.spy(GridItemLayoutData, "_removeItemStyles");
		sinon.spy(GridItemLayoutData, "_setItemStyle");

		// Act
		GridItemLayoutData._setItemStyles();

		// Assert
		assert.ok(GridItemLayoutData._removeItemStyles.notCalled, "Should NOT call _removeItemStyles when no item is provided");
		assert.ok(GridItemLayoutData._setItemStyle.notCalled, "Should NOT call _setItemStyle when no item is provided");

		// Cleanup
		GridItemLayoutData._removeItemStyles.restore();
		GridItemLayoutData._setItemStyle.restore();
	});

	QUnit.test("_setItemStyle", function (assert) {

		// Arrange
		var oGrid = new CSSGrid({
			items: [
				new HTML({
					content: "<div></div>",
					layoutData: new GridItemLayoutData({
						gridRow: "span 4",
						gridColumn: "span 2"
					})
				}),
				new HTML({ content: "<div></div>" }),
				new HTML({ content: "<div></div>" })
			]
		});
		oGrid.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Act
		var oItemDomRef = oGrid.getItems()[0].getDomRef();
		GridItemLayoutData._setItemStyle(oItemDomRef, "grid-column", "");

		// Assert
		assert.notOk(oItemDomRef.style.getPropertyValue("grid-column"), "Should remove the property when empty string");
	});

});