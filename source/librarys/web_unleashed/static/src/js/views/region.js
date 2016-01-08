openerp.unleashed.module('web_unleashed',function(base, _, Backbone, base){
    
    var Region = Backbone.Marionette.Region,
        _superRegion = Region.prototype;
    
    /*
     * @class
     * @module      web_unleashed
     * @name        OpenRegion
     * @classdesc   Marionette Region build with existing jQuery element
     * @mixes       Marionette.Region
     * 
     * @author Michel Meyer <michel[at]zazabe.fr>
     */
    var OpenRegion = Region.extend({
        
        /*
         * Set the region element based on $el parameter
         * 
         * @param {Object} options Region option, options.$el is required 
         */
        initialize: function(options){
            if(this.el instanceof jQuery && this.el.length == 1){
                this.$el = this.el;
            }
        },
        
        /*
         * Set the current region has the view element (avoid unnecessary DOM level)
         * 
         * @param {Backbone.View} view the view to show in the region 
         */
        directShow: function(view){
            this.ensureEl();
            view.setElement(this.$el);
            this.attachView(view);
            
            return _superRegion.show.apply(this, arguments);
        },
        
        /*
         * Open a view in a Region only if the view has a different el than the region
         */
        open: function(view){
            if(view.$el.get(0) != this.$el.get(0)){
                _superRegion.open.apply(this, arguments);
            }
        }
        
    });

    base.views('Region', OpenRegion);
});