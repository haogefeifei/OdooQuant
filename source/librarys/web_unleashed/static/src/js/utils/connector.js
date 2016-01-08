openerp.unleashed.module('web_unleashed', function(base, _, Backbone){


    var query = 0;

    var fill = function(number, size) {
        number = number.toString();
        while (number.length < size) number = "0" + number;
        return number;
    };

    var id = function(){
        return fill(++query, 3);
    };

    var log = function(prefix){
        return function(){
            var args = _.toArray(arguments);
            args.unshift('%c' + prefix + ':', 'color: #aaa');
            console.debug.apply(console, args);
        };
    };

    /*
     * Connector object, interface to manage the sync of data between a Backbone.Model and the OpenERP JSON-RPC API.
     * Support all CRUD method.
     *
     * @module      web_unleashed
     * @name        Connector
     *
     * @author Michel Meyer <michel[at]zazabe.fr>
     */
    var Connector = {



        /*
         * Direct call to the Python method accessible by an API call
         *
         * @param {Backbone.Model} model  the model who implement the custom method
         * @param {Object} options         parameters to pass to the Python method accessible by an API call
         * @param {Object} connection     OpenERP JSON-RPC API Client
         * @returns {jQuery.Deferred.promise}
         */
        call: function(model, options, connection){
            options = options || {};

            var prefix = '[Connector] [ call ] [' + id() + ']' +  options.method,
                logger = log(prefix);

            console.time(prefix);

            var qdef = connection.call(options.method, options.args);
            qdef.done(function(result){
                if(_.isArray(result)){
                    logger(result.length, 'result(s)', 'on', model.model_name);
                }
                else if(_.isNumber(result)){
                    logger(result, 'number', 'on', model.model_name);
                }
                else if(_.isObject(result)){
                    logger(result, 'object', 'on', model.model_name);
                }
                else {
                    logger('unknown response...', 'on', model.model_name);
                }
            });

            return qdef.always(function(){ console.timeEnd(prefix); });
        },

        /*
         * Read model data by using the API
         *
         * @param {Backbone.Model} model  the model to read
         * @param {Object} options        query parameters
         * @param {Object} connection     OpenERP JSON-RPC API Client
         * @returns {jQuery.Deferred.promise}
         */
        read: function(model, options, connection){
            if(options && !options.type){
                options.type = 'all';
            }
            return this.search(model, options, connection);
        },

        /*
         * Count model data by using the API
         *
         * @param {Backbone.Model} model  the model to count
         * @param {Object} options        query parameters
         * @param {Object} connection     OpenERP JSON-RPC API Client
         * @returns {jQuery.Deferred.promise}
         */
        count: function(model, options, connection){
            options = _.extend(options || {}, {
                type: 'count'
            });
            return this.search(model, options, connection);
        },

        /*
         * Read API wrapper, process the options parameters to create a API client Query
         *
         * @param {Backbone.Model} model  the model to count
         * @param {Object} options        query parameters
         * @param {Object} connection     OpenERP JSON-RPC API Client
         * @returns {jQuery.Deferred.promise}
         */
        search: function(model, options, connection){
            options = options || {};

            if(options.type && options.type == 'count'){
                delete options.limit;
                delete options.offset;
                delete options.group_by;
                delete options.order;
                delete options.fields;
            }

            var q = connection.query(options.fields || undefined);

            var log_args = ['model:', model.model_name];

            if(options.type){
                log_args.push('type:', options.type);
            }
            if(options.fields){
                log_args.push('fields:', options.fields);
            }

            // handle options has with OpenERP JSON-RPC web methods
            if(options.filter){
                q = q.filter(options.filter);
                log_args.push('filter:', options.filter);
            }
            if(options.order){
                q = $.isArray(options.order) ? q.order_by.apply(q, options.order) : q.order_by(options.order);
                log_args.push('order:', options.order);
            }
            if(options.hasOwnProperty('limit')){
                q = q.limit(options.limit);
                log_args.push('limit:', options.limit);
            }
            if(options.hasOwnProperty('offset')){
                q = q.offset(options.offset);
                log_args.push('offset:', options.offset);
            }
            if(options.context){
                q = q.context(options.context);
                log_args.push('context:', options.context);
            }


            var def = $.Deferred();


            //TODO: change the way group_by is implemented and avoid auto queries on each QueryGroup...
            if(options.group_by && options.group_by.length > 0 && options.type != 'count'){

                var qdef = q.group_by(options.group_by);

                var prefix = '[Connector][ group ][' + id() + ']',
                    logger = log(prefix);

                console.time(prefix);

                log_args.push('group by:', options.group_by);
                log_args.unshift('group on');

                logger.apply(console, log_args);

                qdef.done(function(groups){
                    // populate the collection with query groups
                    var queries = [], Query = options.group_model || base.models('GroupQuery');
                    _.each(groups, function(group){
                        queries.push(new Query(group.attributes, {
                            options: options,
                            groupQuery: group
                        }));
                    });

                    logger(queries.length, 'group(s)', 'on', model.model_name);

                    def.resolve(queries);
                });
                qdef.fail(function(){
                    def.reject.apply(def, _.toArray(arguments));
                });
                qdef.always(function(){ console.timeEnd(prefix); });
            }
            else {
                var qdef = q[options.type]();

                var prefix = '[Connector][ read ][' + id() + ']',
                    logger = log(prefix);

                console.time(prefix);
                log_args.unshift('execute on');
                logger.apply(console, log_args);

                qdef.done(function(result){
                    if(_.isArray(result)){
                        logger(result.length, 'result(s)', 'on', model.model_name);
                    }
                    else if(_.isNumber(result)){
                        logger('count', result, 'model(s) on', model.model_name);
                    }
                    else if(_.isObject(result)){
                        logger(result, 'object', 'on', model.model_name);
                    }
                    else {
                        logger('unknown response...', 'on', model.model_name);
                    }
                    def.resolve.apply(def, _.toArray(arguments));
                });
                qdef.fail(function(){
                    def.reject.apply(def, _.toArray(arguments));
                });

                qdef.always(function(){ console.timeEnd(prefix); });
            }

            return def.promise().then(options.success, options.error);
        },

        /*
         * Create a model by using the API
         *
         * @param {Backbone.Model} model  the model to create
         * @param {Object} options        query parameters
         * @param {Object} connection     OpenERP JSON-RPC API Client
         * @returns {jQuery.Deferred.promise}
         */
        create: function(model, options, connection){
            var prefix = '[Connector][create][' + id() + ']',
                logger = log(prefix),
                attrs = options.attrs || model.toJSON();

            options = options || {};

            var error = options.error || function(){};
            options.error = function(response){
                console.group(prefix + '[failed]');
                console.error('message:   ', response.message);
                console.error('fault:     ', response.data.fault_code);
                console.error('model:     ', model);
                console.error('attributes:', attrs);
                console.error('options:   ', options);
                console.groupEnd();
                error.apply(this, arguments);
            };

            console.time(prefix);
            logger('execute on', 'model:',  model.model_name, 'data:', model.attributes);
            return connection.call('create', [
                attrs
            ])
            .done(function(id){
                if(typeof id == 'number'){
                    model.set({id: id});
                }
                else {
                    throw base.error('failed to save model ' + model.model_name);
                }
                logger('done on', 'model:', model.model_name, 'id:', id, 'attributes:', attrs);
            })
            .then(options.success, options.error)
            .always(function(){ console.timeEnd(prefix); });
        },

        patch: function(){
            return this.update.apply(this, arguments);
        },

        /*
         * Update a model by using the API
         *
         * @param {Backbone.Model} model  the model to update
         * @param {Object} options        query parameters
         * @param {Object} connection     OpenERP JSON-RPC API Client
         * @returns {jQuery.Deferred.promise}
         */
        update: function(model, options, connection){
            var prefix = '[Connector][update][' + id() + ']',
                logger = log(prefix),
                attrs = options.attrs || model.toJSON();

            options = options || {};

            var error = options.error || function(){};
            options.error = function(response){
                console.group(prefix + '[failed]');
                console.error('message:   ', response.message);
                console.error('fault:     ', response.data.fault_code);
                console.error('model:     ', model);
                console.error('attributes:', attrs);
                console.error('options:   ', options);
                console.groupEnd();
                error.apply(this, arguments);
            };

            console.time(prefix);
            logger('execute on', 'model:', model.model_name, 'id:', model.get('id'));

            return connection.call('write', [
                [ model.get('id') ],
                attrs
            ])
            .done(function(id, status){
                if(status != "success"){
                    throw base.error('failed to save model ' + model.model_name);
                }
                logger('done on', 'model:', model.model_name, 'id:', id, 'attributes:', attrs);
            })
            .then(options.success, options.error)
            .always(function(){ console.timeEnd(prefix); });
        },

        /*
         * Delete a model by using the API
         *
         * @param {Backbone.Model} model  the model to delete
         * @param {Object} options        query parameters
         * @param {Object} connection     OpenERP JSON-RPC API Client
         * @returns {jQuery.Deferred.promise}
         */
        "delete": function(model, options, connection){
            var prefix = '[Connector][delete][' + id() + ']',
                logger = log(prefix);

            var model_id = model.get('id');

            console.time(prefix);
            logger('execute on', 'model:', model.model_name, 'id:', model_id);

            return connection.call('unlink', [
                model.get('id')
            ])
            .done(function(status){
                if(!status){
                    throw base.error('failed to delete model %s with id %s', model.model_name, model_id);
                }
                logger('done on', 'model:', model.model_name, 'id:', model_id);
            })
            .then(options.success, options.error)
            .always(function(){ console.timeEnd(prefix); });
        }
    };

    base.utils('Connector', Connector);
});
