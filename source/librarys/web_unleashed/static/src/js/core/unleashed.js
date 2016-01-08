(function(openerp){

    /*
     * Local helpers to access to objects defined in a module
     * 
     * @module      web_unleashed
     * @name        AttributeAccess
     * @author Michel Meyer <michel[at]zazabe.fr>
     */
    var AttributeAccess = {
        
        /*
         * Add an object to the Class namespace
         * 
         * @param {String} namespace sub-namespace of Class, used to store the object
         * @param {String} name      name to refer to the object
         * @param {Object} obj       the object to store
         * @returns {Object} the stored object
         */
        add: function(namespace, name, obj){
            
            this.Class = this.Class || {}; 
            this.Class[namespace] = this.Class[namespace] || {}; 
            
            if(obj){
                this.Class[namespace][name] = obj;
            }
            
            return AttributeAccess.get.apply(this, [namespace, name]);
        },
        
        /*
         * Get an object in the Class namespace
         * 
         * @param {String} namespace subnamespace of Class, used to store the object
         * @param {String} name      name to refer to the object
         * @returns {Object} the stored object
         */
        get: function(namespace, name){
            var obj = this.Class && this.Class[namespace] && this.Class[namespace][name]
                    ?  this.Class[namespace][name]
                    : null;

            if(!obj){
                throw this.error('"%s.%s" can not be found in module "%s"', namespace, name, this.moduleName);
            }
            return obj;
        }
    };
    
    
    /*
     * Local helpers to access to OpenERP instance.web method
     * 
     * @module      web_unleashed
     * @name        InstanceWebAccess
     * @author Michel Meyer <michel[at]zazabe.fr>
     */
    var InstanceWebAccess = {
        execute: function(module, name, args){
            var web = module.web();

            if(!web){
                throw this.error('the OpenERP instance.web wrapper is not ready yet.');
            }   
            
            var path = /\./.test(name) ? name.split('.') : [name],
                object = web, level;
            
            while(path.length){
                level = path.shift();
                if(typeof object[level] == 'object'){
                    object = object[level];
                }
            }
            
            if(typeof object[level] != 'function'){
                throw module.error('%s is not a method from OpenERP instance.web.%s', level, name);
            }
            return object[level].apply(object, args);
        },
        
        openerp_web: null
    };
       
       
    /*
     * Add useful method to the Marionette.Module.prototype object:
     * - accessor for object stored in the module namespace
     * - helpers initialization 
     * 
     * @module web_unleashed
     * @name   Marionette.Module
     * @author Michel Meyer <michel[at]zazabe.fr>
     */
    _.extend(Marionette.Module.prototype, {


        /*
         * Wrap a module initializer and pass useful object to the callback
         * 
         * @param {readyCallback} callback called when the module is initialized
         *
         * @callback readyCallback
         * @param {Object} instance   OpenERP instance, available when a module is ready
         *                            @see https://doc.openerp.com/trunk/web/module/#getting-things-done
         * @param {Object} Underscore Latest version of underscore library, @see http://underscorejs.org/
         * @param {Object} Backbone   Latest version of backbone library, @see http://backbonejs.org/
         * @param {Object} base       the web_unleashed module, useful to inherit from useful basic object
         *                            (ie. BaseCollection, ...)
         */
        ready: function(callback){
            this.addInitializer(function(options){
                var instance = options.instance;
                callback.apply(this, [
                    instance,
                    this,
                    _,
                    Backbone,
                    this.app.module('web_unleashed')
                ]);
            });
        },
        
        
        /*
         * Get an object stored in the module namespace
         * 
         * @param {String} namespace subnamespace of Class, used to store the object
         * @param {String} name      name to refer to the object
         * @returns {Object}         the stored object
         */
        get: function(namespace, name){
            // handle no namespace definition
            if(!name){
                name = namespace;
                namespace = 'Misc';
            }
            return AttributeAccess.get.apply(this, [namespace, name]);
        },
        
        /*
         * Set an object stored in the module namespace
         * 
         * @param {String} namespace sub-namespace of Class, used to store the object, if omitted,
         *                           use "Misc" namespace by default
         * @param {String} name      name to refer to the object
         * @param {Object} obj       the object to store
         * @returns {Object}         the stored object
         */
        set: function(namespace, name, obj){
            // handle no namespace definition
            if(!obj){
                obj = name; 
                name = namespace;
                namespace = 'Misc';
            }
            return AttributeAccess.add.apply(this, [namespace, name, obj]);
        },
        
        /*
         * Helper: Get/Set an object in module's Models namespace
         * if obj is passed in parameter, the method will set the object, if not, it will get it
         * 
         * @param {String} name      name to refer to the object
         * @param {Object} obj       the object to store
         * @returns {Object}         the stored object
         */
        models: function(name, obj){
            return AttributeAccess.add.apply(this, ['Models', name, obj]);
        },
        
        /*
         * Helper: Get/Set an object in module's Collections namespace
         * 
         * @param {String} name      name to refer to the object
         * @param {Object} obj       the object to store
         * @returns {Object}         the stored object
         */
        collections: function(name, obj){
            return AttributeAccess.add.apply(this, ['Collections', name, obj]);
        },
        
        /*
         * Helper: Get/Set an object in module's Views namespace
         * if obj is passed in parameter, the method will set the object, if not, it will get it
         * 
         * @param {String} name      name to refer to the object
         * @param {Object} obj       the object to store
         * @returns {Object}         the stored object
         */
        views: function(name, obj){
            return AttributeAccess.add.apply(this, ['Views', name, obj]);
        },
        
        /*
         * Helper: Get/Set an object in module's Controllers namespace
         * if obj is passed in parameter, the method will set the object, if not, it will get it
         * 
         * @param {String} name      name to refer to the object
         * @param {Object} obj       the object to store
         * @returns {Object}         the stored object
         */
        controllers: function(name, obj){
            return AttributeAccess.add.apply(this, ['Controllers', name, obj]);
        },
        
        /*
         * Helper: Get/Set an object in module's Utils namespace
         * if obj is passed in parameter, the method will set the object, if not, it will get it
         * 
         * @param {String} name      name to refer to the object
         * @param {Object} obj       the object to store
         * @returns {Object}         the stored object
         */
        utils: function(name, obj){
            return AttributeAccess.add.apply(this, ['Utils', name, obj]);
        },

        /*
         * Helper: get a translated throwable Error object.
         *
         * @param {Error} ErrorObject  Error Object, use native Error object by default (if ErrorObject == message)
         * @param {String} message     error message, use the sprintf syntax
         * @param {Mixed*} arguments   parameters used for replacement in sprintf method
         */
        error: function(ErrorObject, message){
            var args = _.toArray(arguments),
                msg = message,
                Err = ErrorObject;


            if(_.isString(ErrorObject)){
                msg = ErrorObject;
                Err = Error;
                args.splice(0, 1);
            }
            else {
                args.splice(0, 2);
            }

            return new Err(_.str.sprintf.apply(_.str, [this._t(msg)].concat(args)));
        },

        /*
         * Wrap methods from OpenERP instance.web
         */
        _t: function(){ return InstanceWebAccess.execute(this, '_t', arguments); },
        _lt: function(){ return InstanceWebAccess.execute(this, '_lt', arguments); },
        render: function(){ return InstanceWebAccess.execute(this, 'qweb.render', arguments); },
        add_template: function(){ return InstanceWebAccess.execute(this, 'qweb.add_template', arguments); },

        /*
         * access to openerp.web object, useful in unit test to mock it
         */
        web: function(openerp_web){
            if(openerp_web){
                InstanceWebAccess.openerp_web = openerp_web;
            }
            return InstanceWebAccess.openerp_web;
        }
        
    });   
    

    // keep a reference to the original Module.create function
    var moduleCreate = Marionette.Module.create;
    
    
    /*
     * Add useful method to the Marionette.Module object:
     * - Class namespace to store module's objects
     * - override create function
     * 
     * @module web_unleashed
     * @name   Marionette.Module
     * @author Michel Meyer <michel[at]zazabe.fr>
     */
    _.extend(Marionette.Module, {

        // @property {Object} Class namespace to store module's objects, useful to split the architecture in different
        //                    files and keep all organized in on object
        Class: {},

        /*
         * Override the create module to auto start it when OpenERP module is ready,
         * @see https://doc.openerp.com/trunk/web/module/#getting-things-done
         * 
         * @param {Object} app              Marionette Application object (openerp.unleashed)
         * @param {String} moduleNames      module name, used for module creation, the name has to be the same
         *                                  has the OpenERP module name
         * @param {String} moduleDefinition module parameters
         * @returns {Marionette.Module}     the module 
         */
        create: function(app, moduleNames, moduleDefinition){
            var module = moduleCreate.apply(this, arguments);
            
            openerp[moduleNames] = function(instance){
                module.start({
                    instance: instance
                });
            };
            
            return module; 
        }
    });  
       
    // null until web_unleashed module is initialized...
    var sync = null;
    
    // create the Unleashed Marionette.Application, used to organize modules
    var Unleashed = openerp.unleashed = new Marionette.Application();
    
    // called at Unleashed start
    Unleashed.addInitializer(function(options){
        
        var module = this.module,
            app = this;
        
        /*
         * Override the module creation function to have all modules in startWithParent false mode
         * 
         * @param {String}                   name module name, has to be the same as the OpenERP module name
         * @param {moduleCallback} callback  use to declare new object in the module namespace (executed before
         *                                   module start)
         * @returns {Marionette.Module}      the module instance (singleton)
         * 
         * @callback moduleCallback
         * @param {Object} module     the module instance (singleton)
         * @param {Object} Underscore Latest version of underscore library, @see http://underscorejs.org/
         * @param {Object} Backbone   Latest version of backbone library, @see http://backbonejs.org/
         * @param {Object} base       the web_unleashed module, useful to inherit from useful basic object
         *                            (ie. BaseCollection, ...)
         */
        this.module = function(name, callback){
            var call = function(){
                this.startWithParent = false;
                if(callback){
                    callback.apply(this, [this, _, Backbone, this.app.module('web_unleashed')]);
                }
            };
            return module.apply(app, [name, call]);
        };
        
        
        /*
         * Sync method used by Backbone Model to be connected with data by the JSON-RPC API.
         * Note: this method is available only when the "web_unleashed" model is initialized
         * 
         * @param {String} method   the Backbone CRUD method ("create", "read", "update", or "delete") 
         * @param {String} model    a compatible Backbone.Model|Collection, with at least the "model_name" property set
         * @param {Object} options  JSON-RPC API query
         * @returns {jQuery.Deferred.promise}
         */
        this.sync = function(method, model, options){
            if(!sync){
                throw module.error(
                    'Model %s can not be sync (%s) yet, waiting for OpenERP module initialization...',
                    model, method
                );
            }
            else {
                return sync.apply(this,[ method, model, options ]);
            }
        };    
    });
    
    // start the Unleashed Application
    Unleashed.start();
    
    /*
     * Setup core features required for all modules, but only available from the OpenERP instance object
     */

    Unleashed.module('web_unleashed').ready(function(instance, base, _, Backbone){
        
        /*
         * Setup access to OpenERP instance.web methods
         */
        base.web(instance.web);


        /*
         * Setup the connection with JSON-RPC API for Backbone and define the specific sync method 
         * @see http://doc.openerp.com/trunk/developers/web/rpc/
         * @see http://backbonejs.org/#Sync
         */

        var Model = instance.web.Model,
            Connector = base.utils('Connector');

        sync = function(method, model, options){
            if(!model.model_name){
                throw base.error('The "model_name" is not defined on Backbone Model.');
            }

            options = options || {};

            // instantiate a JSON-RPC model object to communicate with OpenERP by JSON-RPC
            var connection = new Model(
                model.model_name,
                options.context || {}
            );

            return Connector[method].apply(Connector, [model, options, connection]);
        };

        /*
         * Setup the QWeb rendering method for Backbone.Marionette
         */
        var QWeb = instance.web.qweb;
        Marionette.Renderer.render = function( templateName, data ) {
            return QWeb.render(templateName, data);
        };
    
        /*
         * Display console.debug message only when OpenERP debug mode is on
         */
        console = console || {};
        
        var console_debug = console.debug || function(){},
            console_time = console.time || function(){},
            console_timeEnd = console.timeEnd || function(){};
            
        if(!instance.session.debug){
            console.debug = console.time = console.timeEnd = function(){};
        }
        else {
            console.debug = function(){
                console_debug.apply(console, arguments);    
            };
            console.time = function(){
                console_time.apply(console, arguments);    
            };
            console.timeEnd = function(){
                console_timeEnd.apply(console, arguments);    
            };
        }
        
    });

})(openerp);