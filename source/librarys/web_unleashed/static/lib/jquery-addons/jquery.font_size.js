(function(jQuery){
    
    /*
     * get the font size value
     */
    jQuery.fn.fontSize = function() {
        return parseInt(this.css('fontSize').replace('px', ''));
    };
    
    
})($ || jQuery)
