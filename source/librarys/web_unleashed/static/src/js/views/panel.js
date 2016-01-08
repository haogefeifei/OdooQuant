openerp.unleashed.module('web_unleashed',function(base, _, Backbone){

    var Region = base.views('Region');

    var Layout = Backbone.Marionette.Layout,
        _superLayout = Layout.prototype;

    /*
     * @class
     * @module      web_unleashed
     * @name        PanelLayout
     * @classdesc   give Marionette.Layout access to all OpenERP view elements
     * @mixes       Marionette.Layout
     * 
     * @author Michel Meyer <michel[at]zazabe.fr>
     */
    var PanelLayout = Layout.extend({
        
        regionType: Region,
        
        /*
         * Setup regions based on options parameters
         * 
         * @param {Object} options Layout option, pass all elements used by to build regions 
         */
        initialize: function(options){
            _superLayout.initialize.apply(this, arguments);
            
            if(options.regions){
                _(options.regions).each(function($element, name){
                    if($element instanceof jQuery && $element.length == 1){
                        this.addRegion(name, new Region({
                            el: $element
                        }));
                    }
                }, this);
            }
        }
    });

    base.views('Panel', PanelLayout);
});