openerp.unleashed.module('web_unleashed_extra', function(base_extra, _, Backbone, base){

    var _super = Backbone.Model.prototype;

    /*
     * @class
     * @module      web_unleashed
     * @name        Period
     * @classdesc   Period of time, use momentjs
     * @mixes       Backbone.Model
     *
     * @author Michel Meyer <michel[at]zazabe.com>
     */
    var Period = Backbone.Model.extend({

        set: function(key, val, options) {
            var attrs, attr;
            if (typeof key === 'object') {
                attrs = key;
                options = val;
            } else {
                (attrs = {})[key] = val;
            }

            // make sure that all attributes are correctly set (for 'start' and 'end')
            if (_.all(attrs)){

                // force moment to date attributes
                _(attrs).each(function (val, name) {
                    if (/start|end/.test(name) && !moment.isMoment(val)) {
                        attrs[name] = moment(val);
                        if (!attrs[name].isValid()) {
                            throw new Error(name + ' is not a correct moment attribute for the period');
                        }
                    }
                });

                // when changing 'start' or 'end' from period, update 'range'
                var end_value = 'end' in attrs ? attrs['end'] : this.end(),
                    start_value = 'start' in attrs ? attrs['start'] : this.start();

                if(start_value && end_value){
                    attrs['range'] = start_value.twix(end_value);
                }
            }

            return _super.set.apply(this, [attrs, options]);
        },

        /* TODO:
         * Check if two period (DateRange) are overlapped
         * @param {period} model: period to check for overlapping
         */
        overlap: function(model){

            if(!(this.isValid() || model.isValid())){
                throw new Error('compare a no [period] object with the [period]');
            }

            // use range (from Twix) to check for overlap
            return this.get('range').overlaps(model.range());
        },

        /* TODO:
         * get range object twis (from 'Twix' libraries) for checking overlap
         * all period object will have this method to get the Twix range just
         * to check for the overlap
         */
        range: function(){
            return this.get('start').twix(this.get('end'));
        },

        /*
         * Get the duration between 'start' and 'end'
         * moment of a period)
         *
         * @param {String} type: unit used to calculate the duration
         * (miliseconds,seconds,minutes,hours,days,weeks,months,years)
         *      default: 'days'
         *
         * @returns {Number} duration (depend on the type argument)
         */
        duration: function(type){
            return this.end().diff(this.start(), type || 'days') + 1;
        },

        /*
         * Get/Format the period start moment
         *
         * @param {String} format momentjs formatter, use "s" or "m" has format to get the default
         * format 'YYYY-MM-DD' or 'YYYY-MM-DD HH:mm:ss', no parameters to get the momentjs Object
         * @return {String|moment}
         */
        start: function(format){
            var val = this.get('start');
            return format ? this.format_moment(val, format) : val;
        },

        /*
         * Get/Format the period end moment
         *
         * @param {String} format momentjs formatter, use "s" or "m" has format to get the default
         * format 'YYYY-MM-DD' or 'YYYY-MM-DD HH:mm:ss', no parameters to get the momentjs Object
         * @return {String|moment}
         */
        end: function(format){
            var val = this.get('end');
            return format ? this.format_moment(val, format) : val;
        },

        /*
         * Format the period's moments (start | end)
         *
         * @param {moment}: moment object (start|end of a period)
         * @param {string}: format string applied for the period (two moment inside)
         */
        format_moment: function(val, format){

            // this is for the old usage (only for day)
            if (format === 's'){
                format = 'YYYY-MM-DD';
            }

            // the new one, use with minute and hour
            else if(format === 'm'){
                format = 'YYYY-MM-DD HH:mm:ss';
            }

            return val.format(format)
        },

        /*
         * Check if the period is valid (has a valid start and end date)
         *
         * @returns {Boolean}
         */
        isValid: function(){
            return ( !!this.start() && this.start().isValid() ) && ( !!this.end() && this.end().isValid() );
        },

        /*
         * Destroy the period by properties reset
         */
        destroy: function(){
            this.options = null;
            this.attributes = null;
        }
    });

    base.models('Period', Period);
});