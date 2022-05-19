module.exports = {
    //Used to compare strings to determine activity host, and to determine if user should see comment and activity delete button
    ifEquals: function(arg1, arg2, options){
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    }
  }