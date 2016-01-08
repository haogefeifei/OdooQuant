(function(Underscore) {
    var _ = Underscore;

    var plainObject = function(obj){
        var own = Object.hasOwnProperty, key;
        for(key in obj){}
        return obj && toString.call(obj) === '[object Object]' && 'isPrototypeOf' in obj && own.call(obj, key);
    };

    var parse = function(obj, func, context) {
        var yes = /^true|yes$/i, no = /^false|no$/i,
            number = /^[0-9]+$/, float = /^[0-9]+(?:\.)?[0-9]+$/;

        var parse = function(value){
            try {
                value = JSON.parse(value);
            }
            catch(e){
                try {
                    // try to handle json defined as a JS object with simple quote.
                    // could be managed with an eval, but seems more dirty...
                    value = JSON.parse(
                        value.replace(/"/g, '\\"')
                             .replace(/([^\\])'/g, '$1"')
                             .replace(/[\\]'/g, "'")
                    );    
                }
                catch(e){
                    value = yes.test(value) ? true : value;
                    value = no.test(value) ? false : value;
                    value = number.test(value) ? parseInt(value) : value;
                    value = float.test(value) ? parseFloat(value) : value;
                }
            }

            if(_.isFunction(func)){
                value = func.apply(context || this, [value]);
            }

            return value;
        };

        var ret;
        if(_.isArray(obj) || plainObject(obj)){
            ret = _.isArray(obj) ? [] : {};
            _(obj).each(function(value, name){
                ret[name] = parse(value);
            });
        }
        else {
            ret = parse(obj);
        }
        return ret;
    };

    Underscore.mixin({
        parse : parse
    });

})(_ || Underscore)
