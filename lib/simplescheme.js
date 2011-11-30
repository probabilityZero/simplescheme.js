/* 
 * simplescheme.js
 * Created by Mike Vollmer, 2011, licensed under GPL
 *
 * Called with the parse() function. Example:
 * require('simplescheme').parse('(define square (lambda (x) (* x x)))(square 5)')
 * => 25
 */
(function ()
{

  // Dealing with require() is kind-of a pain. 
  var Hash, Jsnum;
  if (typeof (window) === 'undefined')
  {
    Hash = require('./hash').Hash;
    Jsnum = require('./js-numbers.js');
  }
  else
  {
    Hash = require('hash').Hash;
    Jsnum = require('js-numbers');
  }
  
  var root_env; // the root environment

  // Context objects contain all local variables plus the parent context
  var Context = function Context()
    {
      this.parent_context = null;
      this.vals = new Hash();
    }

  Context.prototype.add = function (key, val)
  {
    this.vals[key] = val;
  };

  Context.prototype.find = function (key)
  {
    found_val = this.vals[key];
    if (!found_val && found_val !== 0)
    {
      if (!this.parent_context)
      {
        return null;
      }
      else // if not found locally, search upward
      {
        return this.parent_context.find(key);
      }
    }
    else
    {
      return found_val;
    }
  };
  
  function return_float(func)
  {
    return function()
    {
      return new_float(func.apply(null,arguments));
    }
  }
  
  function return_string(func)
  {
    return function()
    {
      return new_string(func.apply(null,arguments));
    }
  }

  // some primitive functions for testing
  var set_root = function set_root()
    {
      // I need to fix some of these functions to properly handle types
      // They currently don't recieve typed objects but are expected to
      // return them. That's probably a bad idea in the long run.
      root_env = new Context();
      root_env.add('+', function (x, y)
      {
        if (is_num(x) && is_num(y))
        {
          return new_num(Jsnum.add(x.data,y.data));
        }
        else if (is_typed_object(x) && is_typed_object(y))
        {
          return x.data + y.data;
        }
        else throw "Expected two numbers.";
      });
      root_env.add('-', function (x, y)
      {
        if (is_num(x) && is_num(y))
        {
          return new_num(Jsnum.subtract(x.data,y.data));
        }
        else if (is_typed_object(x) && is_typed_object(y))
        {
          return x.data - y.data;
        }
        else throw "Expected two numbers.";
      });
      root_env.add('*', function (x, y)
      {
        if (is_num(x) && is_num(y))
        {
          return new_num(Jsnum.multiply(x.data,y.data));
        }
        else if (is_typed_object(x) && is_typed_object(y))
        {
          return x.data * y.data;
        }
        else throw "Expected two numbers.";
      });
      root_env.add('/', function (x, y)
      {
        if (is_num(x) && is_num(y))
        {
          return new_num(Jsnum.divide(x.data,y.data));
        }
        else if (is_typed_object(x) && is_typed_object(y))
        {
          return x.data / y.data;
        }
        else throw "Expected two numbers.";
      });
      root_env.add('>', function (x, y)
      {
        if (is_num(x) && is_num(y))
        {
          return Jsnum.greaterThan(x.data,y.data);
        }
        else if (is_typed_object(x) && is_typed_object(y))
        {
          return x.data > y.data;
        }
        else throw "Could not compare " + x + " and " + y;
      });
      root_env.add('<', function (x, y)
      {
        if (is_num(x) && is_num(y))
        {
          return Jsnum.lessThan(x.data,y.data);
        }
        else if (is_typed_object(x) && is_typed_object(y))
        {
          return x.data < y.data;
        }
        else throw "Could not compare " + x + " and " + y;
      });
      root_env.add('>=', function (x, y)
      {
        if (is_num(x) && is_num(y))
        {
          return Jsnum.greaterThanOrEqual(x.data,y.data);
        }
        else if (is_typed_object(x) && is_typed_object(y))
        {
          return x.data >= y.data;
        }
        else throw "Could not compare " + x + " and " + y;
      });
      root_env.add('<=', function (x, y)
      {
        if (is_num(x) && is_num(y))
        {
          return Jsnum.lessThanOrEqual(x.data,y.data);
        }
        else if (is_typed_object(x) && is_typed_object(y))
        {
          return x.data <= y.data;
        }
        else throw "Could not compare " + x + " and " + y;
      });
      root_env.add('=', function (x, y)
      {
        if (is_num(x) && is_num(y))
        {
          return Jsnum.equals(x.data,y.data);
        }
        else if (is_typed_object(x) && is_typed_object(y))
        {
          return x.data == y.data;
        }
        else throw "Could not compare " + x + " and " + y;
      });
      root_env.add('%', function (x, y)
      {
        if (is_num(x) && is_num(y))
        {
          return new_num(Jsnum.modulo(x.data,y.data));
        }
        else throw "Expected two numbers";
      });
      root_env.add('modulo', function (x, y)
      {
        if (is_num(x) && is_num(y))
        {
          return new_num(Jsnum.modulo(x.data,y.data));
        }
        else throw "Expected two numbers";
      });
      root_env.add('car', function (x)
      {
        return x[0];
      });
      root_env.add('cdr', function (x)
      {
        return x.slice(1);
      });
      root_env.add('cons', function (x, y)
      {
        y.splice(0, 0, x);
        return y;
      });
      root_env.add('length', function (x)
      {
        return x.length;
      });
      root_env.add('null?', function (x)
      {
        return (!x || x.length < 1);
      });
      root_env.add('empty?', function (x)
      {
        return (!x || x.length < 1);
      });
      // a bunch of stuff from the standard library
      root_env.add('PI', function() {
        return new_num(Jsnum.pi());
      });
      root_env.add('abs', function(x) {
        return new_num(Jsnum.abs(x.data));
      });
      root_env.add('acos',  function(x) {
        return new_num(Jsnum.acos(x.data));
      });
      root_env.add('asin',  function(x) {
        return new_num(Jsnum.asin(x.data));
      });
      root_env.add('atan', function(x) {
        return new_num(Jsnum.atan(x.data));
      });
      root_env.add('ceil', function(x) {
        return new_num(Jsnum.ceiling(x.data));
      });
      root_env.add('cos', function(x) {
        return new_num(Jsnum.cos(x.data));
      });
      root_env.add('exp', function(x,y) {
        return new_num(Jsnum.expt(x.data,y.data));
      });
      root_env.add('floor', function(x) {
        return new_num(Jsnum.floor(x.data));
      });
      root_env.add('log', function(x) {
        return new_num(Jsnum.log(x.data));
      });
      root_env.add('random', new_num(Jsnum.fromFixnum(Math.random)));
      root_env.add('sin',  function(x) {
        return new_num(Jsnum.sin(x.data));
      });
      root_env.add('sqrt',  function(x) {
        return new_num(Jsnum.sqrt(x.data));
      });
      root_env.add('tan',  function(x) {
        return new_num(Jsnum.tan(x.data));
      });
      // true and false constants
      root_env.add('#f', "#f");
      root_env.add('#t', "#t");
      // the arguments object isn't really an array, even though it pretends to be,
      // so it has to be converted
      root_env.add('list', function ()
      {
        return Array.prototype.slice.call(arguments);
      });
      // some boolean operations
      root_env.add('and', function ()
      {
        for (var i = 0; i < arguments.length; i++)
        if (!arguments[i] || arguments[i] == "#f") return false;
        return true;
      });
      root_env.add('or', function ()
      {
        for (var i = 0; i < arguments.length; i++)
        if (arguments[i] || arguments[i] == "#t") return true;
        return false;
      });
      root_env.add('string>?', function (x, y)
      {
        if (!is_string(x) || !is_string(y)) throw "expected string";
        else return x > y;
      });
      root_env.add('string<?', function (x, y)
      {
        if (!is_string(x) || !is_string(y)) throw "expected string";
        else return x < y;
      });
      root_env.add('string=?', function (x, y)
      {
        if (!is_string(x) || !is_string(y)) throw "expected string";
        else return x == y;
      });
      root_env.add('newline', function()
      {
        display_outputs.push("\n");
      });

    }

    // I'm running into the limits of the build-in Javascript types,
    // so I've started implementing my oen rudimentary type system.
    // Basically, it's just wrapping the variable in an object that
    // has a "type" parameter.

  function typed_object(type, data)
  {
    this.type = type;
    this.data = data;
  }


  function new_string(str)
  {
    return new typed_object("string", str);
  }

  function new_float(n)
  {
    return new typed_object("float", n);
  }

  function new_num(n)
  {
    return new typed_object("num", n);
  }

  function is_string(o)
  {
    return (typeof (o) == "object" && o.type == "string");
  }

  function is_float(o)
  {
    return (typeof (o) == "object" && o.type == "float");
  }

  function is_num(o)
  {
    return (typeof (o) == "object" && o.type == "num");
  }

  function is_function(o)
  {
    return (typeof (o) == "function");
  }

  function is_typed_object(o)
  {
    return o && (typeof (o) == "object" && o.type);
  }

  function is_value(s)
  {
    return (typeof (s) == 'number');
  }

  // Because javascript doesn't have proper support for tail-recursion
  // I need some way of optimizing tail calls in Scheme into a loop.
  // Rather than attempt to detect tail refursive functions by
  // analyzing the code, I decided to build a special case into eval_l and
  // run_sequence that will execute tail calls as a series of eval_l calls
  // rather than nested eval_l calls.
  // To do this, I have eval_l keep track of the function that called it,
  // and if it encounters an instruction to run that function again it returns
  // a special object to run_sequence indicating that function is tail-recursive.
  var Tail_call = function Tail_call(func, ops)
    {
      this.func = func;
      this.ops = ops;
    }

  function is_tail_call_indicator(o)
  {
    return (typeof (o) == "object" && o.func);
  }

  var display_outputs = []; // display and newline calls get put here
  // eval function
  // called with an expression, an optional environment (a Context object)
  // and an optional caller (function name) for detecting tail calls
  var eval_l = function eval_l(x, env, caller)
    {
      if (!env) // if not set default to root_env
      {
        env = root_env;
      }
      // if it's a variable. only look it up once
      var lookup_value = env.find(x);

      // this is the heavy-hitter function. it goes through a bunch of possible cases
      // by comparing the value of the first item in the list. for example: if the first
      // item in the list is lambda, it creates a new function. if none of these cases is
      // true, it falls back on the base case: the first element in the list is a function
      // and the rest of the elements are arguments. if this also fails, eval_l throws an
      // error.
      if (is_typed_object(x))
      {
        return x; // just a number or string
      }
      else if ((lookup_value || lookup_value === 0) && // otherwise the number 0 can't be stored
               (typeof(lookup_value) != "function")) // don't match functions
      {
        return env.find(x); // a value in the context
      }
      else if (x[0] == 'quote')
      {
        if (!x.slice(1)) return []; // empty list
        else return x.slice(1); // quoted value or list
      }
      else if (x[0] == 'if')
      {
        // if then else
        if (x.slice(1).length < 3) throw "if takes three arguments";
        var cond = x[1];
        var doexp = x[2];
        var elseexp = x[3];
        if (eval_l(cond, env) == '#t')
        {
          return eval_l(doexp, env, caller);
        }
        else
        {
          // every if statement must have an else statement
          if (!elseexp) throw "No else condition or incomplete cond";
          return eval_l(elseexp, env, caller);
        }
      }
      else if (x[0] == 'cond')
      {
        var cond_exp = x.slice(1);
        if (cond_exp.length > 1)
        {
          generate_if = function (exp)
          {
            var current_exp;
            if (exp.length == 1)
            {
              current_exp = exp[0];
              // return null if all conditions are false
              return ['if', current_exp[0], current_exp[1], null];
            }
            else
            {
              // recursively build the if statement
              current_exp = exp.shift();
              return ['if', current_exp[0], current_exp[1], generate_if(exp)];
            }
          };
          return eval_l(generate_if(cond_exp), env, caller);
        }
        else throw 'Cond must have more than one conditions';
      }
      else if (x[0] == 'set!' || x[0] == 'define')
      {
        if (x.slice(1).length === 0) throw "Define and set! require one or more expressions";
        // edge case: defining a function
        if (x[0] == 'define' && typeof (x[1]) == 'object' && x[1].length > 1 && x.length < 4)
        {
          return eval_l(['define', x[1][0],
            ['lambda', x[1].slice(1), x[2]]
          ], env);
        }
        else if (x[0] == 'define' && typeof (x[1]) == 'object' && x[1].length > 1 && x.length >= 4)
        {
          return eval_l(['define', x[1][0],
            ['lambda', x[1].slice(1), x.slice(2)]
          ], env);
        }
        else if (x[0] == 'define' && x[2][0] == "lambda")
        {
          var new_func = build_function(x[2].slice(1), env, x[1]);
          env.add(x[1], new_func);
        }
        else
        {
          // lazy hack: set! and define have identical behavior here
          env.add(x[1], eval_l(x[2], env));
        }
        return null; // don't return anything
      }
      else if (x[0] == 'lambda')
      {
        return build_function(x.slice(1), env,caller); // anonymous function
      }
      else if (x[0] == 'let')
      {
        var pair_param = [];
        var pair_value = [];
        for (var i = 0; i < x[1].length; i++)
        {
          pair_param.push(x[1][i][0]);
          pair_value.push(x[1][i][1]);
        }
        var exp = [['lambda',pair_param,x[2]]];
        for (var i = 0; i < pair_value.length; i++)
        {
          exp.push(pair_value[i]);
        }
        return eval_l(exp,env,caller);
      }
      else if (x[0] == 'begin')
      {
        // run a list of expressions in sequence and return the value returned by the last one
        var expressions = x.slice(1);
        if (expressions.length === 0) throw "Begin takes one or more expressions";
        // currently expressions wrapped in begin cannot be tail recursive.
        // the solution here would probably be to make sure the tail call logic doesn't
        // kick in unless it's the _last_ statement in the begin.
        return run_sequence(expressions, env, null, false);
      }
      else if (x[0] == 'display')
      {
        // I don't need display or newline inside the eval. Sometime soon I'll get
        // around to moving them out and into functions of their own.
        if (x.slice(1).length > 1) throw "display takes one argument";
        if (is_typed_object(x[1]))
        {
          display_outputs.push(x[1].data);
        }
        else
        {
          var to_display = eval_l(x[1], env);
          if (is_typed_object(to_display))
          {
            display_outputs.push(to_display.data);
          }
          else 
          {
            display_outputs.push(to_display);
          }
        }
        return null; // 100% side effect function, returns nothing
      }
      else
      {
        // calling a procedure!
        // NOTE: Currently this will miss functions that take no arguments,
        // like newline. I have code for handling that below (outside of eval_l)
        var evaluated_elements = new Array(x.length);
        if (typeof (x) == "object" && x.length > 0)
        {
          // if it's a vunction stored as a variable we want to look it up
          // this fixes a bug in running functions that take no arguments
          var func = env.find(x[0]);
          if (func && typeof(func) == "function")
          {
            evaluated_elements[0] = func;
          }
          else
          {
            evaluated_elements[0] = eval_l(x[0],env);
          }
          // first check for tail call
          if (caller && x[0] == caller)
          {
            // I could probably clean this section up a bit...
            // the two branches have very similar loops
            for (var j = 1; j < x.length; j++)
            {
              evaluated_elements[j] = eval_l(x[j], env);
            }
            return new Tail_call(evaluated_elements[0], evaluated_elements.slice(1));
          }
          else
          {
            for (var j = 1; j < x.length; j++) // eval each item in list
            {
              evaluated_elements[j] = eval_l(x[j], env, null);
            }
          }
        }
        // call function with apply
        if (typeof (evaluated_elements[0]) == 'function')
        {
          // verify that it's a function, then apply it
          var operands = evaluated_elements.slice(1);
          var returned_value = evaluated_elements[0].apply(null, operands);
          if (typeof (returned_value) == 'boolean')
          {
            return (returned_value ? '#t' : '#f'); // returning actual true or false breaks stuff
          }
          else
          {
            return returned_value; // anything other than boolean can be returned directly
          }
        }
        else
        { // probably something wrong
          throw 'Not sure what to do with input \'' + x[0] + '\' \n from ' + x;
        }
      }
      return null;
    }

  function build_function(lambda_exp, env, name)
  {
    name = name || null;
    // construct a new function by creating a local scope
    // and defining the passed values in it, then passing
    // that to eval
    if (lambda_exp.length < 2) throw "lambda takes two arguments";
    var params = lambda_exp[0];
    var exp = lambda_exp[1];
    var local_context;
    var new_func = function ()
      {
        local_context = new Context();
        local_context.parent_context = env;
        // The function needs to somehow inform run_sequence
        // whether it has been called by a tail-call already or not. If
        // it hasn't, run_sequence will attempt to check for tail recursion.
        var tail = false;
        for (i = 0; i < arguments.length; i++)
        {
          if (i == arguments.length - 1 && !params[i] &&
              is_tail_call_indicator(arguments[i]))
          {
            tail = true;
          }
          else
          {
            // add passed parameters to the local environment
            local_context.add(params[i], arguments[i]);
          }
        }
        return run_sequence(exp, local_context, name, tail);
      };
    return new_func; // return higher order function
  }

  function run_sequence(exp_list, env, caller, tail)
  {
    if (exp_list && (typeof (exp_list) == "object") &&
                    (typeof (exp_list[0]) == "object"))
    {
      // a series of expressions
      var ret; // value to return
      // I'm making a copy of the expression list because I'm going to modify it
      var exp_stack = exp_list.slice(0).reverse(); // treat expression list as stack
      var current_exp;
      var new_exp;
      while (exp_stack.length > 0)
      {
        current_exp = exp_stack.pop();
        ret = eval_l(current_exp, env, caller);
        // if we're already in the middle of a tail call loop, we want to 
        // send the returned Tail_call object down the stack. We don't want
        // to start another loop here.
        while (ret && !tail && is_tail_call_indicator(ret))
        {
          // keep calling this (tail-recursive) function until we hit
          // the termination case
          var ops = ret.ops;
          // tell the function that it was called from a tail call
          ops.push(ret);
          ret = ret.func.apply(null, ops);
        }
      }
      return ret;
    }
    else if (exp_list && (typeof (exp_list) == "object") && (typeof (exp_list[0]) != "object"))
    {
      return run_sequence([exp_list], env, caller, tail); // not really a sequence
    }
  }

  function print_helper(str, exp)
  {
    console.log(str + ":");
    console.log(exp);
  }

  function print_exp(exps)
  {
    var exp = exps.slice(0);
    if (typeof (exp) == "object" && exp.length > 1)
    {
      for (var i = 0; i < exp.length; i++)
      {
        if (is_typed_object(exp[i]))
        {
          exp[i] = exp[i].data;
        }
      }
    }
    console.log(exp);
  }

  // logic for parsing a string of scheme code

  function find_matching_parenthesis(str)
  {
    var p_count = 1;
    var index = 0; // assume first char is (
    while (p_count !== 0 && index < str.length)
    {
      index++;
      if (str[index] == ')')
      {
        p_count--;
      }
      else if (str[index] == '(')
      {
        p_count++;
      }
    }
    // assume matching paren exists
    return index;
  }


  function is_number(n)
  {
    // borrowed from the interwebs, crazy javascript hack
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  function get_tokens(str)
  {
    // recursively generate arrays of tokens by looking
    // for nested parenthesis
    var index = 0;
    var tokens = [];
    // some of the input will obviously consist of more than a single
    // character, so I had to somehow construct strings/numbers in the
    // token array despite processing the string character by character.
    // I'm sure there are lots of better solutions out there but this was
    // the first that popped into my head: I create a buffer and add characters
    // to it until I hit whitespace or the end of the string.
    var token_buf = '';
    // don't build token if we're inside a quote
    var in_quote = false;
    while (index < str.length)
    {
      if (!in_quote && str[index] == '(')
      {
        // match the parens and recurse
        var end_match = find_matching_parenthesis(str.substring(index)) + index;
        tokens.push(get_tokens(str.substring(index + 1, end_match)));
        index = end_match;
      }
      else if (str[index] == ' ' && !in_quote)
      {
        // time to add the buffers to the token array
        if (token_buf)
        {
          tokens.push(build_token(token_buf));
        }
        // reset the buffer
        token_buf = '';
      }
      else
      {
        if (!in_quote && str[index] == "\"" && str[index-1] != "\\")
        {
          in_quote = true;
        }
        else if (in_quote && str[index] == "\"" && str[index-1] != "\\")
        {
          in_quote = false;
        }
        token_buf = token_buf.concat(str[index]);
      }
      index++;
    }
    // add any remaining characters from the buffer
    if (token_buf)
    {
      tokens.push(build_token(token_buf));
    }
    // return the token array
    return tokens;
  }

  function build_token(s)
  {
    var new_token = s;
    var num = Jsnum.fromString(new_token);
    if (num)
    {
      // it's a number
      new_token = new_num(num);
    }
    else if (new_token == '0')
    {
      // it's zero
      new_token = new_num(Jsnum.zero);
    }
    else if (new_token[0] == "\"" && new_token[new_token.length - 1] == "\"")
    {
      new_token = new_token.slice(1, new_token.length - 1);
      var internal_quote = new_token.indexOf("\"");
      if (internal_quote != -1 && new_token[internal_quote - 1] != "\\")
      {
        console.log(s);
        throw "Premature end of string or unescaped quotes";
      }
      new_token = new_string(new_token);
    }
    else if (new_token[new_token.length - 1] == "f")
    {
      var fnum = new_token.slice(0,new_token.length - 1);
      if (is_number(fnum))
      {
        new_token = new_float(fnum);
      }
    }
    return new_token;
  }

  function find_single_quotes(str)
  {
    var index = 0;
    while (index < str.length)
    {
      if (str[index] == "'")
      {
        if (str[index + 1] == "(" && str[index + 2] == ")")
        {
          str = str.slice(0, index) + str.slice(index + 1);
          str = str.slice(0, index + 1) + 'quote' + str.slice(index + 1);
        }
        else
        {
          str = str.slice(0, index) + str.slice(index + 1);
          str = str.slice(0, index + 1) + 'quote ' + str.slice(index + 1);
        }
      }
      index++;
    }
    return str;
  }

  var parse = function parse(str)
    {
      if (!str) throw "Input is empty!";
      set_root(); // clear environment on each parse
      // pass each statement to eval and return output
      var tokens;
      try
      {
        // preprocessing for input string
        tokens = get_tokens(find_single_quotes(str).replace(/;.*$|;.*[\n\r$]/g, '')
                                                   .replace(/^\s+|\s+$/g, '')
                                                   .replace(/(\r\n|\n|\r)/gm, ''));
      }
      catch (e)
      {
        return e;
      }
      var output = [];
      for (var i = 0; i < tokens.length; i++)
      {
        display_outputs = [];
        var returned_value;
        // rudimentary error checking -- this try/catch block is mainly for catching
        // the javascript errors rather than sending them to FireBug
        try
        {
          returned_value = eval_l(tokens[i]);
          var display_outputs_copy = display_outputs.slice(0);
          var output_string = "";
          if (display_outputs_copy.length > 0)
          {
            for (var j = 0; j < display_outputs_copy.length; j++)
            {
              output_string += display_outputs_copy[j];
            }
          }
          if (is_typed_object(returned_value))
          {
            returned_value = returned_value.data;
          }
          // ignore statements that return nothing
          if (returned_value || returned_value === 0)
          {
            output.push(output_string.concat(
              (typeof (returned_value) == "object" &&
               returned_value.length > 1 ?
                  returned_value.join(", ") : returned_value)));
          }
          else if (output_string)
          {
            output.push(output_string);
          }
        }
        catch (e)
        {
          return [e];
        }
      }
      return output; // array of output values
    }

  exports.parse = parse;
  exports.eval_l = eval_l;

}());