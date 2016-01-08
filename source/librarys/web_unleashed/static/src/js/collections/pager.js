openerp.unleashed.module('web_unleashed', function(base, _, Backbone){

    var BaseCollection = base.collections('BaseCollection'),
        _superCollection = BaseCollection.prototype;

    var PagerController = base.controllers('Pager'),
        _superPager = PagerController.prototype;


    /*
     * @class
     * @module      web_unleashed
     * @name        PagerCollection
     * @classdesc   Paginated collection, use JSON-RPC API to navigate between pages
     * @mixes       BaseCollection, PagerController
     *
     * @author Michel Meyer <michel[at]zazabe.fr>
     */

    /*
     * inherit from BaseCollection and extends PagerController and BaseCollection prototypes
     */
    var MixedPagerCollection = function(){
        BaseCollection.apply(this, arguments);
    };

    MixedPagerCollection.prototype = _.extend(
        Object.create(_superPager),
        Object.create(_superCollection)
    );

    MixedPagerCollection.prototype.constructor = MixedPagerCollection;
    MixedPagerCollection.extend = BaseCollection.extend;

    var PagerCollection = MixedPagerCollection.extend({

        /*
         * - initialize all extended objects
         * - bind events
         */
        initialize: function(data, options){
            _superCollection.initialize.apply(this, arguments);
            _superPager.initialize.apply(this, [options]);
        },


        /*
         * Override the Pager.checkEnabled
         * Disable the pager for group_by queries
         *
         * @param {Object} query a search query
         * @returns {Boolean} pager status
         */
        checkEnabled: function(query){
            if(query && query.group_by && query.group_by.length > 0){
                this.disable();
                // force query reset
                query.reset = true;
            }
            else {
                this.enable();
            }
            return this.enabled();
        },

        /*
         * Proxy between pager controller update method and base collection fetch
         */
        update: function(){
            return _superCollection.fetch.apply(this, arguments);
        },

        /*
         * Override the Collection.first method by the Pager Controller one
         */
        first: function(){
            return _superPager.first.apply(this, arguments);
        },

        /*
         * Override the Collection.last method by the Pager Controller one
         */
        last: function(){
            return _superPager.last.apply(this, arguments);
        },

        /*
         * Get the search query, depending of the current page
         *
         * @see PagerController.search
         */
        search: function(query){
            query = _superCollection.search.apply(this, [query]);
            return _superPager.search.apply(this, [query]);
        }
    });

    base.collections('Pager', PagerCollection);

});