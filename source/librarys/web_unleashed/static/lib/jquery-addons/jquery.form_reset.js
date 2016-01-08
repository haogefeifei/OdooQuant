(function(jQuery){
    
    /*
     * reset from values.
     */
    jQuery.fn.reset = function() {
        this.find('input,textarea,select').each(function(index, el){
            $(el).val('');
        });
    };
    
    
})($ || jQuery)
