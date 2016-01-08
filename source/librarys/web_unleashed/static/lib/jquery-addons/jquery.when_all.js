(function(jQuery){
    
    /*
     * add a helper for $.Deferred, to keep waiting until all deferrer are executed before firing the global deferrer, keep info of each deferrer.
     */
    jQuery.whenAll = function( firstParam ) {
        var args = $.makeArray(arguments),
            i = 0,
            length = args.length,
            pValues = new Array( length ),
            count = length,
            pCount = length,
            deferred = length <= 1 && firstParam && jQuery.isFunction( firstParam.promise ) ?
                firstParam :
                jQuery.Deferred(),
            promise = deferred.promise(),
            state = 'resolved'; 
        
        function alwaysFunc( i ) {
            return function( value ) {
                args[ i ] = arguments.length > 1 ? $.makeArray(arguments) : value;
                state = this.state() === "rejected" ? "rejected" : state;
                if ( !( --count ) ) {
                    var method = (state === "rejected"? "reject": "resolve") + "With";
                    deferred[method]( deferred, args );
                }
            };
        }
        
        function progressFunc( i ) {
            return function( value ) {
                pValues[ i ] = arguments.length > 1 ? $.makeArray(arguments) : value;
                deferred.notifyWith( promise, pValues );
            };
        }
        
        if ( length > 1 ) {
            for ( ; i < length; i++ ) {
                if ( args[ i ] && args[ i ].promise && jQuery.isFunction( args[ i ].promise ) ) {
                    args[ i ].promise().always( alwaysFunc(i))
                                       .progress(progressFunc(i));
                } else {
                    --count;
                }
            }
            if ( !count ) {
                deferred.resolveWith( deferred, args );
            }
        } else if ( deferred !== firstParam ) {
            deferred.resolveWith( deferred, length ? [ firstParam ] : [] );
        }
        return promise;
    };
    
    
})($ || jQuery)
