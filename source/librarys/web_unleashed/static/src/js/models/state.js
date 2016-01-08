openerp.unleashed.module('web_unleashed', function(base, _, Backbone){
    
    var _super = Backbone.Model.prototype;
    
    /*
     * @class
     * @module      web_unleashed
     * @name        State
     * @classdesc   manage the state of a view, useful to keep the state persistent by using URL parameters
     * @mixes       Backbone.Model
     * 
     * @author Michel Meyer <michel[at]zazabe.fr>
     */
    var State = Backbone.Model.extend({
        
        /*
         * @property {Object} defaults URL parameters used by default
         */
        defaults: {
            action: null,
            menu_id: null,
            model: null,
            view_type: null
        },
        
        /*
         * @abstract
         * Link some object with the state manager 
         */
        link: function(){
        },
        
        /*
         * @abstract
         * Bind linked object events with the state and apply changes to the State model to push URL parameters 
         */
        bind: function(){
        },
        
        /*
         * @abstract
         * Unbind listeners on linked objects 
         */
        unbind: function(){
        },
        
        /*
         * @abstract
         * Configure linked object based on the current state
         * @returns {jQuery.Deferred.promise} 
         */
        process: function(){
            this.set($.bbq.getState());
            this.push();
            return $.when();
        },
        
        /*
         * @abstract
         * Fire the "change" event to push the current state 
         */
        push: function(){
            this.trigger('change', this);
        },
        
        /*
         * Destroy the state model and remove all listeners 
         */
        destroy: function(){
            this.unbind();
            _super.destroy.apply(this, arguments);
        }
    });

    base.models('State', State);
});