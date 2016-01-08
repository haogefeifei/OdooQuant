openerp.unleashed.module('web_unleashed', function(base, _, Backbone){

    var BaseModel = base.models('BaseModel');
    
    var Collection = Backbone.Collection,
        _super = Collection.prototype;
     
    /*
     * @class
     * @module      web_unleashed
     * @name        BaseCollection
     * @classdesc   Base Collection, with OpenERP JSON-RPC API support
     * @mixes       Backbone.Collection
     * 
     * @author Michel Meyer <michel[at]zazabe.fr>
     */
    var BaseCollection = Collection.extend({
        
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
         * @property {Backbone.Model} model default model used to create collection items
         */
        model: BaseModel,
        
        /*
         * @property {Object} query persistent query merged at search call, use persistent: true in a query
         *                          parameter to keep it alive
         */
        query: {},
        
        /*
         * @property {GroupQuery} group_model Model use to populate the Collection with group_by query
         */
        group_model: base.models('GroupQuery'),
        
        
        /*
         * Check if the collection is grouped
         * 
         * @returns {Boolean}
         */
        grouped: function(){
            return this.every(function(model){ 
                return model instanceof this.group_model; 
            }, this);    
        },
        
        /*
         * Get a model by looking in groups, 
         * use the default Collection.get method is the collection is not grouped
         * 
         * @param {Integer|String|Backbone.Model} id an id, a cid, or by passing in a model 
         * @return {Backbone.Model} 
         */
        getInGroup: function(id){
            var collection = this, Model = this.model;
            if(this.grouped()){
                var query = this.find(function(model){
                    return model.group.get(id) instanceof Model;
                });
                collection = query ? query.group : collection;
            }
            return collection.get(id);
        },
        
        /*
         * Count collection model with a JSON-RPC call 
         * no fetching, the deferrer is resolved with the number passed in parameter
         * 
         * @param {Object} query JSON-RPC API query options
         * @returns {jQuery.Deferred.promise}
         */
        count: function(query){
            return this.sync('count', this, this.search(query));
        },
        
        
        /*
         * Fetch data, by using the JSON-RPC API
         * add support of persistent query parameters, useful to keep the search status
         * 
         * @param {Object} query JSON-RPC API query options 
         * {
         *     filter: [], 
         *     order: [] || "", 
         *     limit: 1,
         *     offset: 1,
         *     context: {},
         *     persistent: false
         * }
         * @returns {jQuery.Deferred.promise}
         * @see https://doc.openerp.com/trunk/web/rpc/#openerp.web.Query.context
         */
        fetch: function(query){
            // check if the collection can fetch via the JSON-RPC API
            if(!this.model_name){
                throw base.error('The collection can not be connected via the API without the model_name property');
            }
            // add the QueryGroup model
            if(query && query.group_by && query.group_by.length > 0){
                query.group_model = this.group_model;
                query.silent = false;
            }
            
            return _super.fetch.apply(this, [this.search(query)]);
        },
        
        /*
         *  Reset persistent query parameters
         * 
         *  @returns {BaseCollection}
         */
        resetQuery: function(){
            this.query = {};
            return this;
        },
        
        /*
         * Extend a query with custom parameters
         * Note: override this method to force default query parameters
         * 
         * @returns {Object} JSON-RPC API query options
         */
        search: function(query){
            query = query || {};
            
            if(query.persistent){
                this.query = _.clone(query);
            }
            
            return _.extend({}, this.query, query, {
                // force some query parameters here...
            });
        },
        
        
        
        /*
         * Auto set the model_name for Model instanciated
         * 
         * Warning: Backbone API could change, specially method prefixed by an underscore...
         * 
         * @param {Backbone.Model|Object} attrs  model attributes or a Backbone.Model
         * @param {Object} options               options passed at model instanciation
         * @returns {Backbone.Model|Boolean}     the model passed in parameter or created. False
         *                                       if the model is not valid.
         */     
        _prepareModel: function(attrs, options) {
            if(typeof this.model.prototype.model_name != 'string'){
                this.model.prototype.model_name = this.model_name;        
            }
            return _super._prepareModel.apply(this, arguments);
        }
    });
  
    base.collections('BaseCollection', BaseCollection);
});