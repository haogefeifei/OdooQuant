openerp.unleashed.module('web_unleashed', function(base, _, Backbone){

    var Controller = Marionette.Controller,
        _super = Controller.prototype;

    /*
     * @class
     * @module      web_unleashed
     * @name        PagerController
     * @classdesc   Abstracted Pager Controller, usable by any object able to implement the count and update methods
     * @mixes       Marionette.Controller
     *
     * @author Michel Meyer <michel[at]zazabe.fr>
     */
    var PagerController = Controller.extend({

        /*
         * Initialize the pagination
         *
         * @param {Object} options used to define the pager behavior
         * @default
         * {
         *     ranges: [10, 50, 100, 200, 'All'], // range available, used only by the default pager view
         *     page: 0, // current page (first page is 0)
         *     limit: 100, // number of item by page
         *     total: 0, // count of all pages, automatically updated at init call
         *     nb_pages: 0, // number of pages, automatically updated at init call
         * }
         *
         * be careful to call it from the parent if the object that extend this
         * controller take other parameters at initialization...
         */
        initialize: function(options){
            this.pager = _.extend({
                ranges: [10, 50, 100, 200, base._lt('All')],
                page: 0,
                limit: 100,
                total: 0,
                nb_pages: 0,
            }, options);
        },

        /*
         * This method is called when items have to be refreshed, return a deferrer
         *
         * @abstract
         * @param {Object} query a search query
         * @returns {jQuery.Deferred.promise}
         */
        update: function(query){
            throw base.error('abstract object, you should implement here the way to get paginated data');
        },

        /*
         * This method has to return a deferrer with the count of element in parameter
         *
         * @abstract
         * @param {Object} query a search query
         * @returns {jQuery.Deferred.promise}
         */
        count: function(query){
            throw base.error('abstract object, you should implement here the way to get count data');
        },

        /*
         * Check if the pager is enabled, override this method to define when the pager has to be disabled
         * This method is executed before the execution of count and update queries
         *
         * @param {Object} query a search query
         * @returns {Boolean} pager status
         */
        checkEnabled: function(query){
            return this.enabled();
        },


        /*
         * Internal update method, should never be called directly (use abstract method)
         *
         * @private
         * @param {Object} query a search query
         * @returns {jQuery.Deferred.promise}
         */
        _update: function(query){
            return this.update(query);
        },

        /*
         * Internal count method, should never be called directly (use abstract method)
         *
         * @private
         * @param {Object} query a search query
         * @returns {jQuery.Deferred.promise}
         */
        _count: function(query){
            return this.count(query);
        },

        /*
         * Initialize the pager by counting the nb of element to paginate
         * Note: after promise resolving, the pagination is still not populated with elements
         *
         * @param {Object} query search query
         * @fires ready
         * @returns {jQuery.Deferred.promise}
         */
        init: function(query){
            query = query || {};

            var def = new $.Deferred();

            if(this.checkEnabled(query)){
                this._count(query).done(_.bind(function(nb_models){
                    this.changeCount(nb_models).refresh().trigger('ready');
                    def.resolveWith(this);
                }, this));
            }
            else {
                def.resolveWith(this);
            }

            return def.promise();
        },

        /*
         * Init and load the current page
         *
         * @param {Object} query search query
         * @returns {jQuery.Deferred.promise}
         */
        load: function(query){
            var def = $.Deferred();

            if(this.checkEnabled(query)){
                this.init(_.clone(query)).done(function(){
                    this._update(_.clone(query)).done(function(){
                        def.resolve();
                    });
                });
            }
            else {
                this._update(_.clone(query)).done(function(){
                    def.resolve();
                });
            }

            return def.promise();
        },

        /*
         * Refresh pager parameters, based on the current count and limit
         *
         * @returns {PagerController}
         */
        refresh: function(){
            this.pager.nb_pages = Math.ceil(this.pager.total / this.limit());

            if(this.pager.page >= this.pager.nb_pages){
                this.pager.page = this.pager.nb_pages - 1 >= 0 ? this.pager.nb_pages - 1 : 0;
            }

            return this;
        },

        /*
         * @property {Boolean} isEnabled  enable status of the pager
         */
        isEnabled: true,

        /*
         * Disable the pagination
         */
        disable: function(){
            this.isEnabled = false;
            this.trigger('disable');
        },

        /*
         * Enable the pagination
         */
        enable: function(){
            this.isEnabled = true;
            this.trigger('enable');
        },

        /*
         * Check if the pager is enabled
         *
         * @returns {Boolean}
         */
        enabled: function(){
            return this.isEnabled;
        },

        /*
         * Reset the number of element to paginate
         *
         * @param {Number} nb_models element count to paginate
         * @returns {PagerController}
         */
        changeCount: function(nb_models){
            this.pager.total = nb_models;
            this.trigger('change change:count', this, this.pager);
            return this;
        },

        /*
         * Change the current limit and update the pager
         *
         * @param {Number} limit number of element by page
         * @param {Object} options {silent: true/false}, if silent option, no pager update automatically done
         * @fires change, change:limit
         * @returns {jQuery.Deferred.promise}
         */
        changeLimit: function(limit, options){
            options = options || {};
            var promise;

            if($.isNumeric(limit)){
                limit = parseInt(limit);
            }
            else {
                limit = this.pager.total;
            }
            this.pager.page = 0;
            this.pager.limit = limit;

            this.trigger('change change:limit', this, this.pager);

            this.refresh();

            if(options.silent){
                promise = $.when();
            }
            else {
                promise = this._update();
            }

            return promise;
        },

        /*
         * Get the number of pages
         *
         * @returns {Number} nb_pages
         */
        nbPages: function(){
            return this.pager.nb_pages;
        },

        /*
         * Get the limit, if not numeric, return the total of elements
         */
        limit: function(){
            // ensure limit is an integer, if possible
            this.pager.limit = $.isNumeric(this.pager.limit) ? parseInt(this.pager.limit) : this.pager.limit;
            return  !$.isNumeric(this.pager.limit)
                    ? this.pager.total
                    : (this.pager.limit === 0 ? 100 : this.pager.limit);
        },

        /*
         * Check if the pager has a previous page
         * @returns {Boolean}
         */
        hasPrevious: function(){
            return this.refresh().pager.page > 0;
        },

        /*
         * Check if the pager has a next page
         *
         * @returns {Boolean}
         */
        hasNext: function(){
            return this.refresh().pager.page + 1 < this.nbPages();
        },

        /*
         * Check if the pager is on the first page
         *
         * @returns {Boolean}
         */
        isFirst: function(){
            return this.pager.page == 0;
        },

        /*
         * Check if the pager is on the last page
         *
         * @returns {Boolean}
         */
        isLast: function(){
            return this.pager.page == this.pager.nb_pages - 1;
        },

        /*
         * First index of the current page
         *
         * @returns {Integer}
         */
        firstIndex: function(){
            return (this.pager.page * this.limit()) + 1;
        },

        /*
         * Last index of the current page
         *
         * @returns {Integer}
         */
        lastIndex: function(){
            var before = this.firstIndex() - 1,
                next = this.pager.total - before;
            return next < this.pager.limit ? before + next : before + this.limit();
        },


        /*
         * Load the first page
         *
         * @fires change, change:first
         * @returns {jQuery.Deferred.promise}
         */
        first: function(){
            var def = null;
            if(this.enabled() && !this.isFirst()){
                this.pager.page = 0;
                this.trigger('change change:first', this, this.pager);
                def = this._update();
            }
            return $.when(def);
        },

        /*
         * Load the last page
         *
         * @fires change, change:last
         * @returns {jQuery.Deferred.promise}
         */
        last: function(){
            var def = null;
            if(this.enabled() && !this.isLast()){
                this.pager.page = this.pager.nb_pages - 1;
                this.trigger('change change:last', this, this.pager);
                def = this._update();
            }
            return $.when(def);
        },

        /*
         * Load the next page
         *
         * @fires change, change:next
         * @returns {jQuery.Deferred.promise}
         */
        next: function(){
            var def = null;
            if(this.enabled() && this.hasNext()){
                this.pager.page += 1;
                this.trigger('change change:next', this, this.pager);
                def = this._update();
            }
            return $.when(def);
        },

        /*
         * Load the previous page
         *
         * @fires change, change:previous
         * @returns {jQuery.Deferred.promise}
         */
        prev: function(){
            var def = null;
            if(this.enabled() && this.hasPrevious()){
                this.pager.page -= 1;
                this.trigger('change change:previous', this, this.pager);
                def = this._update();
            }
            return $.when(def);
        },


        /*
         * Define the search query according to the current page
         *
         * @returns {Object}
         */
        search: function(query){
            if(this.checkEnabled(query)){
                _.extend(query || {}, {
                    reset: true,
                    limit: this.limit(),
                    offset: this.pager.page * this.limit()
                });
            }
            return query;
        }
    });

    base.controllers('Pager', PagerController);

});