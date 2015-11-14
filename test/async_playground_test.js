var test = require('tap').test;
var parallel = require('../index.js').parallel;
var series = require('../index.js').series;

test("test parallel calls callback only once", function(t){

  var order = [];
  var finalCalls = 0;
  parallel(function(callback){
             setTimeout(function(){
               order.push("f1");
               callback(new Error('first error'), 1);
             }, 1000);
           },
           function(callback){
             setTimeout(function(){
               order.push("f2");
               callback(null, 2);
             }, 400);
           },
           function(callback){
             setTimeout(function(){
               order.push("f3");
               callback(null, 3);
             }, 700);
           },
           function(err, result){
             finalCalls++;
             t.type(err, Error)
             t.similar("first error", err.message)
           });

  setTimeout(function(){
    t.similar(1, finalCalls);
    t.end();
  }, 1500);
});

test("test parallel execution order", function(t){

  var order = [];
  parallel(function(callback){
             setTimeout(function(){
               order.push("f1");
               setImmediate(callback, null, 1);
             }, 1000);
           },
           function(callback){
             setTimeout(function(){
               order.push("f2");
               setImmediate(callback, null, 2);
             }, 500);
           },
           function(callback){
             setTimeout(function(){
               order.push("f3");
               setImmediate(callback, null, 3);
             }, 100);
           },
           function(err, result){
             t.similar(["f3", "f2", "f1"], order);
             t.similar([1, 2, 3], result);
             t.end();
           });
});

test("test series execution order", function(t){

  var order = [];
  series([function(result, cb){
            setTimeout(function(){
              order.push("f1");
              setImmediate(cb, null, "a");
            }, 1000);
          },
          function(result, cb){
            setTimeout(function(){
              order.push("f2");
              setImmediate(cb, null, result.concat("b"));
            }, 500);
          },
          function(result, cb){
            setTimeout(function(){
              order.push("f3");
              setImmediate(cb, null, result.concat("c"));
             }, 100);
          }],
          function(err, result){
            t.similar(["f1", "f2", "f3"], order);
            t.similar("abc", result);
            t.end();
          });
});

test("test series calls callback only once", function(t){

  var order = [];
  var finalCalls = 0;
  series([function(result, cb){
            setTimeout(function(){
              order.push("f1");
              setImmediate(cb, null, "a");
            }, 1000);
          },
          function(result, cb){
            setTimeout(function(){
              order.push("f2");
              setImmediate(cb, null, result.concat("b"));
            }, 200);
          },
          function(result, cb){
            setTimeout(function(){
              order.push("f3");
              setImmediate(cb, null, result.concat("c"));
             }, 50);
          }],
          function(err, result){
            finalCalls++;
            t.similar(["f1", "f2", "f3"], order);
            t.similar("abc", result);
          });

  setTimeout(function(){
    t.similar(1, finalCalls);
    t.end();
  }, 1500);
});

test("test series execution with input", function(t){

  series([function(result, cb){
            return cb(null, result.concat("a"));
          },
          function(result, cb){
            return cb(null, result.concat("b"));
          },
          function(result, cb){
            return cb(null, result.concat("c"));
          }],
          function(err, result){
            t.similar("_abc", result);
            t.end();
          }, "_");
});

test("test series execution with error", function(t){

  series([function(result, cb){
            return cb(null, "a");
          },
          function(result, cb){
            return cb(new Error('first error'), result.concat("b"))
          },
          function(result, cb){
            return cb(new Error('second error'), result.concat("c"))
          }],
          function(err, result){
            t.type(err, Error)
            t.similar("first error", err.message)
            t.similar("a", result);
            t.end();
          });
});
