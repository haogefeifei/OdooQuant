openerp.unleashed.module('web_unleashed', function(base, _, Backbone){

    var _super = Backbone.View.prototype;

    /*
     * @class
     * @depreciated
     * @module      web_unleashed
     * @name        BaseView
     * @classdesc   Depreciate: use Marionette Views instead. Basic View, with auto unbinding at destruction
     * @mixes       Backbone.View
     * 
     * @author Michel Meyer <michel[at]zazabe.fr>
     */ 
    var BaseView = Backbone.View.extend({
        
        /*
         * Prepare the view:
         * - set all object in options.ref into a ref property
         * - define a deferrer to call a start method when the view is ready (at resetElement call...)
         * 
         * 
         */
        initialize: function(options){
            if(options && options.ref){
                this.ref = options.ref;
            }
            
            this.ready = $.Deferred();
            this.ready.done($.proxy(this.start,this));
            
            this.bind();
            
            _super.initialize.apply(this, arguments);    
        },
        
        /*
         * Called when the view has a DOM element (resetElement)
         * 
         * @abstract
         */
        start: function(){
        },
        
        /*
         * Bind events
         * 
         * @abstract
         */
        bind: function(){
        },
        
        /*
         * Unbind events
         * 
         * @abstract
         */
        unbind: function(){
        },
        
        /*
         * Reset the view DOM Element
         */
        resetElement: function(){
            this.setElement.apply(this, arguments);
            this.ready.resolveWith(this);
        },
        
        /*
         * Destroy the view, unbind and detach the DOM element
         */
        destroy: function(){
            this.unbind();
            this.undelegateEvents();
            this.$el.removeData().unbind(); 
            this.remove();  
        }
    });

    base.views('BaseView', BaseView);

});