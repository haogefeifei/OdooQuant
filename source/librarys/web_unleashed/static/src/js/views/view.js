openerp.unleashed.module('web_unleashed',function(base, _, Backbone, base){

    /*
     * FIXBUG: https://github.com/marionettejs/backbone.marionette/pull/533
     * CompositeView attempts to appendHtml of itemViews before itemViewContainer exists (before template is rendered)
     */
    _.extend(Backbone.Marionette.CompositeView.prototype, {
        _initialEvents: function() {
            this.once('render', function() {
                if (this.collection) {
                    this.listenTo(this.collection, "add", this.addChildView, this);
                    this.listenTo(this.collection, "remove", this.removeItemView, this);
                    this.listenTo(this.collection, "reset", this._renderChildren, this);
                }
            }, this);
        }
    });

});        