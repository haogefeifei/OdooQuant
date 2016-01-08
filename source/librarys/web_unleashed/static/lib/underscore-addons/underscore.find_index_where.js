(function(Underscore) {
    var _ = Underscore;
    var findIndexWhere = function(obj, find) {

        var name, index, item;

        for(index in obj){
            item = obj[index];

            for(name in find){
                if(
                    (find[name] instanceof RegExp && find[name].test(item[name]))
                    ||
                    (item[name] === find[name])
                ){
                    return index;
                }
            }
        }

        return null;
    };

    Underscore.mixin({
        findIndexWhere : findIndexWhere
    });

})(_ || Underscore)