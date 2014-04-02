/**
 * @module select
 */

modules.define(
    'select',
    ['strings__escape'],
    function(provide, escape, Select) {

/**
 * @exports
 * @class select
 * @bem
 */
provide(Select.decl({ modName : 'type', modVal : 'check' }, /** @lends select.prototype */{
    _updateControl : function() {
        var name = this.getName(),
            cls = Select.buildClass('control');

        this.elem('control').remove();
        this.dropElemCache('control');

        this.domElem.prepend(
            this.getVal()
                .map(function(val) { // Using string concatenation to not depend on template engines
                    return '<input ' +
                        'type="hidden" ' +
                        'name="' + name + '" ' +
                        'class="' + cls + '" ' +
                        'value="' + escape.attr(JSON.stringify(val)) + '"/>';
                }));
    },

    _updateButton : function() {
        var checkedItems = this._getCheckedItems();

        this._button
            .toggleMod('checked', true, '', !!checkedItems.length)
            .setText(
                checkedItems.length === 1?
                    checkedItems[0].getText() : // one checked
                    checkedItems.reduce(function(res, item) { // many checked
                        return res + (res? ', ' : '') + (item.params.checkedText || item.getText());
                    }, '') ||
                        this.params.text); // none checked
    },

    _onMenuItemClick : function(_, data) {
        data.source === 'keyboard' && (this._preventToToggleOpened = true);
    },

    _onButtonClick : function() {
        this._preventToToggleOpened?
            this._preventToToggleOpened = false :
            this.__base.apply(this, arguments);
    }
}));

});
