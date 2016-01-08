openerp.unleashed.module('web_unleashed', function(base, _, Backbone){

    var Model = Backbone.Model,
        _super = Model.prototype;

    /*
     * @class
     * @module      web_unleashed
     * @name        QueryGroup
     * @classdesc   OpenERP Group Query Model, used to populate group_by collection
     * @mixes       Backbone.Model
     *
     * @author Michel Meyer <michel[at]zazabe.fr>
     */
    var GroupQuery = Model.extend({

        /*
         * get OpenERP GroupQuery instance and
         * set aggregates attributes on this model
         */
        initialize: function(model, options){
            this.options = options.options;
            this.groupQuery = options.groupQuery;

            // in case the group value is a ref to a model like [id, name]
            if(_.isArray(this.get('value')) && this.get('value').length >= 2){
                this.set('value', this.get('value')[1]);
            }

            if(this.has('aggregates')){
                this.set(model.aggregates);
                this.unset('aggregates');
            }

            // listen to the add the collection (ensure this.collection is set)
            this.once('add', this.createCollection, this);
        },


        /*
         * Create a group collection based on the parent collection constructor.
         * This collection will be populated with GroupQuery fetch results.
         */
        createCollection: function(){
            var Constructor = this.collection.constructor;
            this.group = new Constructor();
        },


        /*
         * Fetch group results into the same type of collection
         * than the parent of the GroupQuery
         *
         * @returns {jQuery.Deferred.promise}
         */
        fetch: function(){
            return this.groupQuery.query(this.options.fields || undefined)
                                  .all()
                                  .done(_.bind(this.fetched, this));
        },

        /*
         * process the fetch result
         *
         * @param {Array} results raw fetching results
         */
        fetched: function(results){
            // add results to the group collection
            this.group.reset(results);

            // fire a special group:sync event directly on the parent
            this.collection.trigger('group:sync', this, this.group);

            // trick: set an id, so Backbone.Model.isNew method with return true ;)
            this.id = _.uniqueId();
        }
    });

    base.models('GroupQuery', GroupQuery);
});