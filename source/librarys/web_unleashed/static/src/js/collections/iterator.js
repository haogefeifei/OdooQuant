openerp.unleashed.module('web_unleashed', function(base, _, Backbone){

    var BaseCollection = base.collections('BaseCollection');
    var Iterator = base.models('Iterator'),
        _super = BaseCollection.prototype;

    /*
     * @class
     * @module      web_unleashed
     * @name        IteratorsCollection
     * @classdesc   Collection with selectable model
     * @mixes       BaseCollection
     *
     * @author Michel Meyer <michel[at]zazabe.fr>
     */
    var Iterators = BaseCollection.extend({

        /*
         * @property {Backbone.Model} model default model used to create collection items
         */
        model: Iterator,

        /*
         * - initialize the position to an undefined index
         * - bind events
         */
        initialize: function(){
            this.current_index = null;
            this.bind();

            _super.initialize.apply(this, arguments);
        },

        /*
         * bind model selection event, used to update the current selected element
         */
        bind: function(){
            this.on('select', this.select, this);
        },

        /*
         * unbind all event listeners
         */
        unbind: function(){
            this.off(null, null, this);
        },

        /*
         * select a model in the collection
         *
         * @param {Backbone.Model} model model to select in the collection
         */
        select: function(model){
            var index = this.indexOf(model);
            if(index < 0){
                throw base.error('model can not be found in the collection');
            }
            this.current_index = index;

            var previous_selected = this.where({selected: true});
            if(previous_selected.length > 0){
                _.each(previous_selected, function(model_selected){
                    model_selected.set({selected: false});
                });
            }
            model.set({selected: true});
        },

        /*
         * define the current index based on model index in the collection
         *
         * @param {Integer} val model index
         * @returns {Integer} current selected index
         */
        index: function(val){
            if(val != null){
                if(!this.at(val)){
                    throw base.error('no item at index %s',  val);
                }
                this.current_index = val;
            }
            if(this.current_index == null){
                throw base.error('no item have been selected yet.');
            }
            return this.current_index;

        },

        /*
         * get the first model
         *
         * @returns {Backbone.Model}
         */
        first: function(){
            return this.at(0);
        },

        /*
         * get the last model
         *
         * @returns {Backbone.Model}
         */
        last: function(){
            return this.length > 0 ? this.at(this.length - 1) : null;
        },

        /*
         * get the current selected model
         *
         * @returns {Backbone.Model}
         */
        current: function(){
            return this.current != null ? this.at(this.index()) : null;
        },

        /*
         * get the next model, or the first if the selected model is the last
         *
         * @returns {Backbone.Model}
         */
        next: function() {
            return this.at((this.index() + 1) % _.size(this));
        },

        /*
         * get the previous model, or the last if the selected model is the first
         *
         * @returns {Backbone.Model}
         */
        prev: function() {
            var index = this.index() - 1;
            return this.at(index > -1 ? index : _.size(this) - 1);
        },

        /*
         * get all model ids
         *
         * @returns {Array}
         */
        ids: function(){
            return this.map(function(model){
                return model.get('id');
            });
        }
    });

    base.collections('Iterators', Iterators);

});