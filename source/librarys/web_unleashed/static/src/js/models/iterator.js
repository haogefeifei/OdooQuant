openerp.unleashed.module('web_unleashed', function(base, _, Backbone){

    var BaseModel = base.models('BaseModel'),
        _super = BaseModel.prototype;

    /*
     * @class
     * @module      web_unleashed
     * @name        Iterator
     * @classdesc   Iterator Model, with selection support
     * @mixes       BaseModel
     *
     * @author Michel Meyer <michel[at]zazabe.fr>
     */
    var Iterator = BaseModel.extend({

        /*
         * Force to unselected state at initialization
         */
        initialize: function(){
            this.set({selected: false});
            _super.initialize.apply(this, arguments);
        },

        /*
         * Select a model
         *
         * @param {Boolean} force force the selection of a model, even if the model is already selected
         */
        select: function(force){
            if(!this.selected() || force){
                this.set({
                    selected: true
                });
                this.trigger('select', this);
            }
        },

        /*
         * Get the model selection state
         *
         * @returns {Boolean} true if selected
         */
        selected: function(){
            return this.get('selected') || false;
        }

    });

    base.models('Iterator', Iterator);
});