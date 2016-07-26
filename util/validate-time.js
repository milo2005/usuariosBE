var validate = {
    range:30000,
    validate: function(timestamp){
        var current = Date.now();
        var min = current - this.range;
        var max = current + this.range;
        if(timestamp > min && timestamp <= max ){
            return true;
        }else{
            return false;
        }
    }
};

module.exports = validate;