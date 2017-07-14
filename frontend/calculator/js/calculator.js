var Calculator = function() {
  'use strict';

  var buffer = {
    register_a  : 'empty',
    register_b  : 'empty',
    register_c  : 'empty',
    operator_a  : 'empty',
    operator_b  : 'empty',
    screen      : '0',
    screen_flag : 1, // 1 -> show register_a, 2 -> show register_b, 3 -> show register_c
    state       : 1
  };

  

  /**
   * Trim all values to 10 characters or less
   *
   * @params {string, number} A decimal number
   * @returns {string} A <10 character string
  */
  function trim(num) {
     var numLen, truncLen, tempVal;
     numLen = num.toString().length;
     truncLen = (Math.trunc(Number(num))).toString().length;
     if (numLen === truncLen && numLen > 10) {
        num = 'ERROR';
     } else if (numLen > truncLen) {
        tempVal = (Math.round(Number(num) * Math.pow(10, (9 - truncLen)))) / Math.pow(10, (9 - truncLen));
        num = tempVal.toString();
     }
     return num.toString();
  }

  /**
   * perform a single operation
   *   pattern: A + B -> l o r
   *
   * @params {string} left of operator
   * @params {string} operator
   * @params {string} right of operator
   * @returns {string}
   */
  function operate(l, o, r) {
     l = Number(l);
     r = Number(r);
     if (o === '+') {
        return trim((l + r).toString());
     }
     if (o === '-') {
        return trim((l - r).toString());
     }
     if (o === '*') {
        return trim((l * r).toString());
     }
     if (o === '/') {
        if (r === 0) {
           return 'DIV BY 0';
        }
        return trim((l / r).toString());
     }
  }

  /*
   * DETERMINE CALCULATOR STATE
   *
   *          A | B | C |opA|opB|
   *         ---|---|---|---|---|
   * Case 1) 0,A|   |   |   |   |
   * Case 2)  A |   |   | + |   |
   * Case 3)  A | B |   |+,*|   |
   * Case 4)  A | B |   | + | * |
   * Case 5)  A | B | C | + | * |
   */
  function setState() {
      if (buffer.register_a === 'DIV BY 0' || buffer.register_b === 'DIV BY 0') {
        buffer.state = 6;
      } else if (buffer.register_a === 'ERROR' || buffer.register_b === 'ERROR') {
        buffer.state = 6;
      } else if (buffer.operator_a === 'empty') {
        buffer.state = 1;
      } else if (buffer.operator_a !== 'empty' && buffer.register_b === 'empty') {
        buffer.state = 2;
      } else if (buffer.operator_a !== 'empty' && buffer.register_a !== 'empty' && buffer.operator_b === 'empty') {
        buffer.state = 3;
      } else if (buffer.operator_b !== 'empty' && buffer.register_c === 'empty') {
        buffer.state = 4;
      } else if (buffer.operator_b !== 'empty' && buffer.register_c !== 'empty') {
        buffer.state = 5;
      }
  }

  /**
   * updates the screen element
   *
   * @params {object} the screen element
  */
  function updateScreen(buffer) {
    var screen_html = document.getElementById('screen');
    if (buffer.screen_flag === 1) {
       if (buffer.register_a === 'empty') {
          // this.screen = '0';
          screen_html.innerHTML = '0';
       } else {
          // this.screen = this.regA;
          screen_html.innerHTML = buffer.register_a.toString();
       }
    }
    if (buffer.screen_flag === 2) {
       // this.screen = this.regB;
       screen_html.innerHTML = buffer.register_b.toString();
    }
    if (buffer.screen_flag === 3) {
       // this.screen = this.regC;
       screen_html.innerHTML = buffer.register_c.toString();
    }
  }

  /**
   * clear the buffer
   *
   * @params {object} The whole buffer object
   */
  function clear() {
     buffer.screen_flag = 1;
     buffer.register_a = 'empty';
     buffer.register_b = 'empty';
     buffer.register_c = 'empty';
     buffer.operator_a = 'empty';
     buffer.operator_b = 'empty';
     setState();
  }

  function setNumber(number) {
    switch(buffer.state) {
      case 1:
        buffer.screen_flag = 1;
        if (buffer.register_a === 'empty' || buffer.register_a === '0') {
          buffer.register_a = number.toString();
        } else if (buffer.register_a.toString().length < 10) {
          buffer.register_a = buffer.register_a.toString() + number;
        }
        break;
      case 2:
         buffer.register_b = number.toString();
         buffer.screen_flag = 2;
         break;
      case 3:
         if (buffer.register_b.toString().length < 10) {
            buffer.register_b = buffer.register_b.toString() + number;
            buffer.screen_flag = 2;
         }
         break;
      case 4:
         buffer.register_c = number.toString();
         buffer.screen_flag = 3;
         break;
      case 5:
         if (buffer.register_c.toString().length < 10) {
            buffer.register_c = buffer.register_c.toString() + number;
            buffer.screen_flag = 3;
         }
         break;
      case 6:
         break;
      default:
         console.log("something other than NUMBER happened!");
         break;
    }
  
  }

  function setOperator(operator) {
    switch (buffer.state) {
      case 1:
         buffer.operator_a = operator;
         buffer.screen_flag = 1;
         break;
      case 2:
         buffer.operator_a = operator;
         buffer.screen_flag = 1;
         break;
      case 3:
         if ((buffer.operator_a === '+' || buffer.operator_a === '-') && (operator === '*' || operator === '/')) {
            buffer.operator_b = operator;
            buffer.screen_flag = 2;
         } else {
            buffer.register_a = operate(buffer.register_a, buffer.operator_a, buffer.register_b);
            buffer.operator_a = operator;
            buffer.screen_flag = 1;
         }
         break;
      case 4:
         if (operator === '+' || operator === '-') {
            buffer.register_b = operate(buffer.register_a, buffer.operator_a,
               operate(buffer.register_b, buffer.operator_b, buffer.register_b));
            buffer.register_a = 'empty';
            buffer.register_c = 'empty';
            buffer.operator_b = 'empty';
            buffer.operator_a = operator;
            buffer.screen_flag = 1;
         } else {
            buffer.operator_b = operator;
            buffer.screen_flag = 2;
         }
         break;
      case 5:
         if (operator === '+' || operator === '-') {
            buffer.register_b = operate(buffer.register_a, buffer.operator_a,
               operate(buffer.register_b, buffer.operator_b, buffer.register_c));
            buffer.register_a = 'empty';
            buffer.register_c = 'empty';
            buffer.operator_b = 'empty';
            buffer.operator_a = operator;
            buffer.screen_flag = 1;
         } else {
            buffer.register_b = operate(buffer.register_b, buffer.operator_b, buffer.register_c);
            buffer.register_c = 'empty';
            buffer.operator_b = operator;
            buffer.screen_flag = 2;
         }
         break;
      case 6:
         break;
      default:
         console.log("something other than OPERATOR happened!");
         break;
    }
    setState();
  }

  /*
   * ENTER +/-
   *
   *          A | B | C |opA|opB|
   *         ---|---|---|---|---|
   * Case 1) 0,A|   |   |   |   | 
   * Case 2)  A |   |   | + |   | 
   * Case 3)  A | B |   |+,*|   | 
   * Case 4)  A | B |   | + | * | 
   * Case 5)  A | B | C | + | * | 
   */
  if (b === 'pm') {
     switch (calState(this.regA, this.regB, this.regC, this.opA, this.opB)) {
        case 1:
           if (this.regA !== 'empty' && this.regA !== '0') {
              this.regA = Number(this.regA * -1).toString();
              this.screenFlag = 1;
           }
           break;
        case 2:
           this.regB = Number(this.regA * -1).toString();
           this.screenFlag = 2;
           break;
        case 3:
           this.regB = Number(this.regB * -1).toString();
           this.screenFlag = 2;
           break;
        case 4:
           this.regC = Number(this.regB * -1).toString();
           this.screenFlag = 3;
           break;
        case 5:
           this.regC = Number(this.regC * -1).toString();
           this.screenFlag = 3;
           break;
        case 6:
           break;
        default:
           console.log("something other than PLUS-MINUS happened!");
           break;
     }
  }

  return {
    trim        : trim,
    operate     : operate,
    setState    : setState,
    clear       : clear,
    updateScreen : updateScreen,
    setNumber : setNumber,
    setOperator : setOperator,
    buffer       : buffer
  };


};
