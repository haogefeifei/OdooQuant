(function(jQuery){
    
    /*
     * serialize a form into an Object.
     */
    $.fn.serializeObject = function(){
        var data = this.serializeArray(),
            obj = {}, i;
            
        for(i=0 ; i < data.length ; i++){
            obj[data[i]['name']] = $.isNumeric(data[i]['value']) ? parseInt(data[i]['value']) : data[i]['value'];
        }
        
        return obj;
    };
    
})($ || jQuery)