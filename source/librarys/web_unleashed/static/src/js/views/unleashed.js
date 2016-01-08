openerp.unleashed.module('web_unleashed').ready(function(instance, base, _, Backbone){

    var View = instance.web.View,
        _super = instance.web.View.prototype;

    /*
     * @class
     * @module      web_unleashed
     * @name        UnleashedView
     * @classdesc   Common operations simplifying the use of OpenERP Views
     * @mixes       instance.web.View
     *
     * @author Michel Meyer <michel[at]zazabe.fr>
     */
    var UnleashedView = View.extend({

        /*
         * @property {Marionette.Module} mainly used as a event proxy, required to reset it
         */
        module: base,

        /*
         * @property {Marionette.Panel} default panel initialized
         */
        Panel: base.views('Panel'),

        /*
         * @property {Backbone.Model} default state manager model, change it to support custom state in your app
         */
        State: base.models('State'),

        /*
         * Initialize the View, called by OpenERP ViewManager
         */
        init: function(parent, dataset, view_id, options) {
            this._super(parent, dataset, view_id, options);
            this.on('view_loaded', this, this.ready);
        },

        /*
         * Pre configure the view before state processing
         * "arch" parameters passed in argument
         */
        configure: function(data){},

        /*
         * Implement this method to do some actions when the view is ready
         */
        ready: function(data){},

        /*
         * Configure the view state
         */
        stateConfig: function(){},

        /*
         * Executed when the Unleashed View has been injected in the DOM
         */
        view_loading: function(data){

            this.extractArch(data.arch);

            this.configure(data);

            this.panel = new this.Panel({
                el: $('.oe_application'),

                regions: {
                    pager: this.options.$pager,
                    buttons: this.options.$buttons,
                    sidebar: this.options.$sidebar,
                    body: this.$el
                },

                data: data
            });

            var def = $.Deferred();
            $.when(this._super(data)).done(_.bind(function(){
                // setup the view state
                this.stateInit().done(_.bind(function(){
                    this.stateChanged();
                    this.bindView();
                    def.resolve();
                }, this));

            }, this));

            return def.promise();
        },

        /*
         * Extract configuration parameters from "arch" xml structure
         *
         *   <field name="arch" type="xml">
         *       <foo attr1="bar" attr2="foobar">
         *           <bar attr="foo1" />
         *           <bar attr="foo2" />
         *           <foobar>
         *               <bar attr3="foo3" />
         *           </foobar>
         *       </foo>
         *   </field>
         *
         *   this.arch.foo.attr1 = "bar"
         *   this.arch.foo[1].attr = "foo1"
         *   this.arch.foo.foobar.bar.attr3 = "foo3"
         *
         */
        extractArch: function(arch){
            var AttributeHolder = base.utils('AttributeHolder');

            var convert = function(obj){
                obj = obj || {};
                var name, val;
                for(name in obj){
                    val = obj[name];
                    if(/true/i.test(val)){
                        obj[name] = true;
                    }
                    else if(/false/i.test(val)){
                        obj[name] = false;
                    }
                    else if(/^[0-9]+$/.test(val)){
                        obj[name] = parseInt(val);
                    }
                }
                return obj;
            };

            var process = function(data, ret){
                ret = ret || {};

                if(data && data.tag){
                    var i=0;
                    if(data.tag in ret && !_.isArray(ret[data.tag])){
                        ret[data.tag] = [ret[data.tag]]
                    }

                    if(ret && data.tag in ret){
                        ret[data.tag].push(convert(data.attrs));
                    }
                    else {
                        ret[data.tag] = convert(data.attrs);
                    }

                    for(; i < data.children.length ; i++) {
                        if(_.isString(data.children[i])){
                            ret[data.tag] = data.children[i];
                        }
                        else {
                            process(data.children[i], ret[data.tag]);
                        }
                    }
                }

                return ret;
            };

            var data = process(arch);
            this.module.arch = this.arch = new AttributeHolder(data);

        },

        /*
         * Initialize the view state with current URL parameters and process it
         */
        stateInit: function(){
            this.state = new this.State(_.parse($.bbq.getState()));
            this.stateConfig();
            return this.state.process();
        },

        /*
         * Bind some default events, managing state changes and redirection
         */
        bindView: function(){
            this.module.on('do:action', this.do_action, this);
            this.module.on('open:record', this.openRecord, this);
            this.module.on('open:list', this.openList, this);
            this.module.on('state:change', this.stateChanged, this);
            this.state.on('change', this.stateChanged, this);
        },

        /*
         * Remove view listeners
         */
        unbindView: function(){
            if(this.module) this.module.off(null, null, this);
            if(this.state)  this.state.off(null, null, this);
        },

        /*
         * Push state changes into the URL
         */
        stateChanged: function(){
            this.do_push_state(this.state.attributes);
        },


        /*
         * Redirect to a form view on a specific record
         *
         * @param {String} model_name   record model name
         * @param {Integer} id          record id
         */
        openRecord: function(model_name, id, views){
            views = views || ['form'];
            views = _(views).map(function(item){ return [false, item]});
            this.do_action({
                type: 'ir.actions.act_window',
                res_model: model_name,
                res_id: id,
                views: views,
                target: 'current',
                context: this.context,
            });
        },

        /*
         * Redirect to a list view on a specific model
         *
         * @param {String} model_name   record model name
         */
        openList: function(model_name, views){
            views = views || ['form'];
            views = _(views).map(function(item){ return [false, item]});
            this.do_action({
                type: 'ir.actions.act_window',
                res_model: model_name,
                views: views,
                target: 'current',
                context: this.context,
            });
        },

        /*
         * Properly destroy the view by stopping regions in the panel layout
         */
        destroy: function() {
            this.state.clear();
            this.unbindView();

            if(this.panel && this.panel.regionManager){
                this.panel.regionManager.closeRegions();
            }
            return this._super();
        }
    });

    base.views('Unleashed', UnleashedView);
});
