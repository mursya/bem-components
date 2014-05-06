/**
 * @module select
 */

modules.define(
    'select',
    ['i-bem__dom', 'popup', 'jquery', 'dom'],
    function(provide, BEMDOM, _, $, dom) {

/**
 * @exports
 * @class select
 * @bem
 *
 * @bemmod opened Represents opened state
 */
provide(BEMDOM.decl(this.name, /** @lends select.prototype */{
    beforeSetMod : {
        'opened' : {
            'true' : function() {
                return !this.hasMod('disabled');
            }
        }
    },

    onSetMod : {
        'js' : {
            'inited' : function() {
                this._button = this.findBlockInside('button')
                    .on('click', this._onButtonClick, this);

                this._popup = this.findBlockInside('popup')
                    .setTarget(this._button)
                    .on({ modName : 'visible', modVal : '' }, this._onPopupHide, this);

                this._menu = this._popup.findBlockInside('menu')
                    .on({
                        'change' : this._onMenuChange,
                        'item-click' : this._onMenuItemClick
                    }, this);

                this._refocusOnBlur = false;

                this._updateMenuWidth();
            }
        },

        'focused' : {
            'true' : function() {
                this
                    .bindToDoc('keydown', this._onKeyDown)
                    ._button.setMod('focused');
            },

            '' : function() {
                this
                    .unbindFromDoc('keydown', this._onKeyDown)
                    // NOTE: nextTick because we need to return focus on button in case of pointerpress inside popup
                    .nextTick(function() {
                        this._refocusOnBlur?
                            (this
                                .setMod('focused')
                                ._refocusOnBlur = false) :
                            this.delMod('opened');
                    });
            }
        },

        'opened' : {
            '*' : function(_, modVal) {
                this._popup.setMod('visible', modVal);
                this._menu.setMod('focused', modVal);
            },

            'true' : function() {
                this._updateMenuHeight();
                this
                    .bindToDoc('pointerpress', this._onDocPointerPress)
                    .setMod('focused')
                    ._hoverCheckedOrFirstItem();
            },

            '' : function() {
                this.unbindFromDoc('pointerpress', this._onDocPointerPress);
            }
        },

        'disabled' : {
            '*' : function(modName, modVal) {
                this._button.setMod(modName, modVal);
                this._menu.setMod(modName, modVal);
                this.elem('control').prop('disabled', modVal);
            },

            'true' : function() {
                this._popup.delMod('visible');
            }
        }
    },

    _updateMenuWidth : function() {
        var menuDomElem = this._menu.domElem.css('width', 'auto'),
            menuOwnWidth = menuDomElem.outerWidth(),
            buttonWidth = this._button.domElem.outerWidth();

        menuOwnWidth < buttonWidth && menuDomElem.css('width', buttonWidth);

        this._popup.redraw();
    },

    _updateMenuHeight : function() {
        var drawingParams = this._popup.calcPossibleDrawingParams(),
            menuDomElem = this._menu.domElem,
            menuWidth = menuDomElem.outerWidth(),
            bestHeight = 0;

        drawingParams.forEach(function(params) {
            params.width >= menuWidth && params.height > bestHeight && (bestHeight = params.height);
        });

        bestHeight && menuDomElem.css('max-height', bestHeight);
    },

    _getCheckedItems : function() {
        return this._menu.getItems().filter(function(item) {
            return item.hasMod('checked');
        });
    },

    _hoverCheckedOrFirstItem : function() {
        (this._getCheckedItems()[0] || this._menu.getItems()[0])
            .setMod('hovered');
    },

    _onMenuChange : function() {
        this._updateControl();
        this._updateButton();
        this._updateMenuWidth();

        this.emit('change');
    },

    _onMenuItemClick : function() {},

    _onKeyDown : function(e) {
        if(!this.hasMod('opened') && (e.keyCode === 38 || e.keyCode === 40) && !e.shiftKey) {
            e.preventDefault();
            this.setMod('opened');
        }
    },

    /**
     * Get value
     * @returns {*}
     */
    getVal : function() {
        return this._menu.getVal();
    },

    /**
     * Set value
     * @param {*} val
     * @returns {this}
     */
    setVal : function(val) {
        this._menu.setVal(val);
        return this;
    },

    getName : function() {
        return this.params.name;
    },

    _onButtonClick : function() {
        this.toggleMod('opened');
    },

    _onButtonFocusChange : function(e, data) {
        this.setMod('focused', data.modVal);
    },

    _onPopupHide : function() {
        this.delMod('opened');
    },

    _onDocPointerPress : function(e) {
        this._refocusOnBlur = dom.contains(this._popup.domElem, $(e.target));
    }
}, /** @lends select */{
    live : function() {
        this.liveInitOnBlockInsideEvent(
            { modName : 'focused', modVal : '*' },
            'button',
            this.prototype._onButtonFocusChange);
    }
}));

});
