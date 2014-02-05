modules.define('i-bem__dom', ['ua'], function(provide, ua, BEMDOM) {

if(ua.msie && ua.version < 10) {
    BEMDOM.decl('input', {
        /**
         * Normalizes focus for IE
         * @private
         */
        _focus : function() {
            var input = this.elem('control')[0];
            if(!input.selectionStart) {
                var range = input.createTextRange();
                range.move('character', input.value.length);
                range.select();
            }
        }
    }, {
        live : function() {
            this.liveBindTo('keyup cut paste', function() {
                // nextTick because when `cut` and `paste` events callbacks are executed, real value is not changed
                this.nextTick(this._tryToUpdateVal);
            });

            return this.__base();
        }
    });
}

provide(BEMDOM);

});
