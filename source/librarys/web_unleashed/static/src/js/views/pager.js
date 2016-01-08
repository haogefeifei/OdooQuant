openerp.unleashed.module('web_unleashed', function(base, _, Backbone){


    var PagerController = base.controllers('Pager');
    
    var ItemView = Backbone.Marionette.ItemView,
        _super = ItemView.prototype;


    /*
     * @class
     * @module      web_unleashed
     * @name        PagerView
     * @classdesc   Display a Pager, similar than the OpenERP default pager on list
     * @mixes       BaseView
     * 
     * @author Michel Meyer <michel[at]zazabe.fr>
     */    
    var PagerView = ItemView.extend({
        
        template: 'Base.Pager',
        
        /*
         * @property {String} className the class used to create the main pager DOM Element
         */
        className:  'unleashed-pager',
        
        
        /*
         * @property {Object} events DOM listeners
         */
        events: {
            'click .prev-page': 'previous',
            'click .next-page': 'next',
            'click .range-page': 'range',
            'change .range-selector': 'rangeChanged'
        },
        
        /*
         * Set the model to work on
         * 
         * @param {Object} options pass the model to work on
         */
        initialize: function(options){
            // TODO: check because extending views are using options.model instead of options.collection (see dashboard/widgets/pager), 
            // should not be done because of a specific pager view... 
            
            this.data = options.collection ? options.collection : ( options.model ? options.model : null);
            if(!this.data){
                throw base.error('The Pager view has to be initialized with a model or a collection.');
            }
        },
        
        /*
         * Listen to data event to render the pager
         */
        onShow: function(){
            this.listenTo(this.data, 'sync reset change', this.render);
        },
        
        
        /*
         * Serialize pager data
         * 
         * @returns {Object} 
         */
        serializeData: function(){
            var disabled = this.data.pager.nb_pages <= 1 ? true : false;
            disabled = _.isFunction(this.data.grouped) ? this.data.grouped() : disabled;
            
            return {
                ranges: this.data.pager.ranges,
                current_range: this.data.pager.limit,
                
                firstIndex: this.data.firstIndex(),
                lastIndex: this.data.lastIndex(),
                total: this.data.pager.total,
                
                disabled: disabled,
                previous: this.data.hasPrevious(),
                next: this.data.hasNext(),
            };
        },
        
        
        // UI event

        /*
         * Go to previous page on the model
         */
        previous: function(){
            this.data.prev();
        },
        
        /*
         * Go to next page on the model
         */
        next: function(){
            this.data.next();
        },
        
        /*
         * Render the pager limit selector
         */
        range: function(e){
            var $range = $(e.currentTarget);
            
            $range.html(base.render('Base.Pager.range', {
                ranges: this.data.pager.ranges,
                current_range: this.data.pager.limit
            }));
        },
        
        /*
         * Change the pager limit
         */
        rangeChanged: function(e){
            var $selector = $(e.currentTarget);
            this.data.changeLimit($selector.val());
        }
    });

    base.views('Pager', PagerView);
});
