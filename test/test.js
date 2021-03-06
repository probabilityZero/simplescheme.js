var scheme = require('../lib/simplescheme.js');

exports.test_basic = function(test) {
  test.equal(scheme.parse('(+ 1 2)',true),'3\n',"Add one and two");
  test.equal(scheme.parse('(+ 1 (* 4 5))',true),'21\n',"Nested function");
  test.done();
};

exports.test_define = function(test) {
  test.equal(scheme.parse('(define a 2) (- a 1)',true),'1\n',"Define value");
  test.equal(scheme.parse('(define (fact n) (if (<= n 1) 1 (* n (fact (- n 1)))))(fact 10)',true),'3628800\n',"Define and run function");
  test.equal(scheme.parse('(define (facthelp i prod) (if (= i 1) prod (facthelp (- i 1) (* i prod)))) (facthelp 10 1)',true),'3628800\n',"Tail function");
  test.equal(scheme.parse('(define (tail_factorial i) (define (facthelp i prod)(if (= i 1) prod (facthelp (- i 1) (* i prod)))) (facthelp i 1)) (tail_factorial 10)',true),'3628800\n',"Tail function");
  test.done();
};

exports.test_display = function(test) {
  test.equal(scheme.parse('(display "test")',true),'test',"Display a string");
  test.equal(scheme.parse('(newline)',true),'\n',"Newline");
  test.done();
};

exports.test_map = function(test) {
  var tlist = scheme.parse("(define (map-func proc lis) (cond ((null? lis) '()) (#t (cons (proc (car lis)) (map-func proc (cdr lis)))))) (define (square x) (* x x)) (map-func square '(2 3 4))",true);
  test.equal(tlist,'(4 9 16)\n');
  test.done();
};

exports.test_closure = function(test) {
  var defs = "(define (inc-f x)(lambda (y) (set! x (+ x y)) x))";
  var use = "(define inc (inc-f 5))(inc 1)(inc 1)";
  test.equal(scheme.parse(defs + use,true),'6\n7\n');
  test.done();
};

exports.test_hanoi = function(test) {
  var s1 = "(define (disp F T)(display \"move ring from \") (display F) (display \" to \")  (display T)  (newline))";
  var s2 = "(define (hanoi rings F T U) (if (>= 0 rings) rings (begin (hanoi (- rings 1) F U T) (disp F T)(hanoi (- rings 1) U T F))))";
  var s3 = "(hanoi 3 \"a\" \"b\" \"c\")";
  test.ok(scheme.parse(s1+s2+s3,true),"Testing Hanoi");
  test.done();
}
