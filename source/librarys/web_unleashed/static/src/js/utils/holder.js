openerp.unleashed.module('web_unleashed', function(base, _){

    var AttributeHolder = function(data){
        this.data = data;
    };

    AttributeHolder.prototype = {
        /*
         * get a value according to a path defined, return the default value or null if not accessible
         */
        get: function(path, def){
            var name, part, data = this.data,
                array_pattern = /([^\[]*)\[([0-9]+)\]/,
                parts = path.split('.');

            for(name in parts) {
                part = parts[name];
                var matches = part.match(array_pattern);

                if(matches && matches.length > 2){
                    data = data[matches[1]][matches[2]];
                }
                else if(data && part in data){
                    data = data[part];
                }
                else {
                    data = null;
                }
            }

            return data || def || null;
        }
    };

    base.utils('AttributeHolder', AttributeHolder);
});