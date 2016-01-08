openerp.unleashed.module('web_unleashed', function(base, _, Backbone){

    var _super = Backbone.Model.prototype;

    /*
     * @class
     * @module      web_unleashed
     * @name        BaseModel
     * @classdesc   Base Model, with OpenERP JSON-RPC API support
     * @mixes       Backbone.Model
     *
     * @author Michel Meyer <michel[at]zazabe.fr>
     */
    var BaseModel = Backbone.Model.extend({

        /*
         * @property {Function} sync use a JSON-RPC API sync method
         * @see http://backbonejs.org/#Sync
         */
        sync: openerp.unleashed.sync,

        /*
         * @property {String} model_name OpenERP model name, used by the sync function to connect data
         *                               with the JSON-RPC API
         */
        model_name: null,



        /*
         * Fetch data, by using the JSON-RPC API
         * Note: the model id has to be set to make it works
         *
         * @param {Object} query JSON-RPC API query options
         *                       (@see https://doc.openerp.com/trunk/web/rpc/#openerp.web.Query.context):
         * {
         *     filter: [],
         *     order: [] || "",
         *     limit: 1,
         *     offset: 1,
         *     context: {},
         *     persistent: false
         * }
         * @returns {jQuery.Deferred.promise}
         */
        fetch: function(query){
            // check if the model can fetch via the JSON-RPC API
            if(!this.model_name){
                throw base.error('The model can not be connected via the API without the model_name property');
            }
            // check if the model has an id to fetch with
            if(!this.has('id') && !query.hasOwnProperty('filter')){
                throw base.error('The model "%s" has no id, impossible to fetch data', this.model_name);
            }
            return _super.fetch.apply(this, [this.search(query)]);
        },

        /*
         * Extend a query with custom parameters
         * Note: override this method to force default query parameters
         *
         * @returns {Object} JSON-RPC API query options
         */
        search: function(query){
            query = query || {};

            var filter = query.filter || [];
            if(this.has('id')){
                filter.push(['id', '=', this.get('id')]);
            }

            return _.extend({
                filter: filter,
                type: 'first'
            }, query);
        }
    });

    base.models('BaseModel', BaseModel);
});
