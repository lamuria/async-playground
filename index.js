"use strict"

module.exports= {

  parallel: function parallel(){

    var results = [];
    var counter = 0;
    var shouldReturn = false;
    var args = Array.prototype.slice.call(arguments);
    var fns = args.slice(0, args.length-1);
    var final = args[args.length-1];

    fns.map(function(fn, index) {
      fn(function(error, result) {
        if(shouldReturn)
          return;
        if (error){
          shouldReturn = true;
          return final(error);
        }

        results[index] = result;
        counter++;
        if (counter === fns.length)
          return final(undefined, results);
      });
    });
  },

  series: function series(fns, final, result){

    if(fns.length){
      var fn = fns.shift();
      return fn(result, function(err, res){
        if(err)
          return final(err, result);

        series(fns, final, res);
      });
    }else{
      return final(null, result);
    }
  }
}
