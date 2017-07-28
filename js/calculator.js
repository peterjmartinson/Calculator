/**
 * 
 * 
*/
let Calculator = function() {
  'use strict';


  let previous_keypress = '';
  let buffer = {
    register_a  : '',
    register_b  : '',
    register_c  : '',
    operator_a  : '',
    operator_b  : '',
    screen      : '0',
    screen_flag : 1, // 1 -> show register_a, 2 -> show register_b, 3 -> show register_c
    state       : 1
  };

  let key_press = '';

  function sendKeyPress(key) {
    setKeyPress(key);
    routeKeyPress();
    setState();
    updateScreen();
    document.getElementById("cowport").innerHTML = logBuffer();
  }

  function getKeyPress() {
    return key_press;
  }

  function setKeyPress(new_keypress) {
    key_press = new_keypress.toString();
  }


  function logBuffer() {
    let output = '';
    for (let property in buffer) {
      if ( buffer.hasOwnProperty(property) ) {
        output += buffer[property] + ', ';
      }
    }
    return output;
  }

  function routeKeyPress() {
    let number = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        operator = ['+', '-', '*', '/'];
    if ( number.indexOf(key_press) > -1 ) {
      setNumber();
    }
    else if ( operator.indexOf(key_press) > -1 ) {
      if (previous_keypress == '=') {
        buffer.operator_a = '';
      }
      setOperator();
    }
    else if ( key_press === '=' ) { 
      reckonAll();
    }
    else if ( key_press === 'pm' ) {
      flipSign();
    }
    else if ( key_press === '.' ) {
      appendDecimal();
    }
    else if ( key_press === 'root' ) {
      calculateSquareRoot();
    }
    else if ( key_press === 'clear' ) {
      clear();
    }
    previous_keypress = getKeyPress();
  }

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

  function operate(l, o, r) {
     l = Number(l);
     r = Number(r);
     if ( !r || !o ) {
       return trim(l);
     }
     if (o === '+') {
        return trim((l + r));
     }
     if (o === '-') {
        return trim((l - r));
     }
     if (o === '*') {
        return trim((l * r));
     }
     if (o === '/') {
        if (r === 0) {
           return 'DIV BY 0';
        }
        return trim((l / r));
     }
  }

  function reckonInside() {
    if (buffer.register_a == 'ERROR' || buffer.register_a == 'NaN') {
      return;
    }
    if (buffer.register_c == '0' && buffer.operator_b == '/') {
      divisionByZero();
      return;
    }
    if (buffer.register_c === '') {
      buffer.register_c = buffer.register_b
    }
    let result = operate(buffer.register_b, buffer.operator_b, buffer.register_c);
    buffer.register_b = result.toString();
    buffer.screen_flag = 2;
  }

  function reckonOutside() {
    if (buffer.register_a == 'ERROR' || buffer.register_a == 'NaN') return;
    if (buffer.register_b == '0' && buffer.operator_a == '/') {
      divisionByZero();
      return;
    }
    if (buffer.register_b === '') {
      buffer.register_b = buffer.register_a
    }
    let result = operate(buffer.register_a, buffer.operator_a, buffer.register_b);
    buffer.register_a = result.toString();
    buffer.screen_flag = 1;
  }

  function reckonAll() {
    if (buffer.register_a == 'ERROR' || buffer.register_a == 'NaN') return;
    if (buffer.register_b != '' && buffer.register_c != '' && buffer.operator_b != '') {
      reckonInside();
      reckonOutside();
    } else {
      reckonOutside();
    }
  }

  function divisionByZero() {
    buffer.register_a = 'DIV BY 0';
    buffer.register_b = 'DIV BY 0';
    buffer.register_c = 'DIV BY 0';
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
      } else if (buffer.operator_a === '') {
        buffer.state = 1;
      } else if (buffer.operator_a !== '' && buffer.register_b === '') {
        buffer.state = 2;
      } else if (buffer.operator_a !== '' && buffer.register_a !== '' && buffer.operator_b === '') {
        buffer.state = 3;
      } else if (buffer.operator_b !== '' && buffer.register_c === '') {
        buffer.state = 4;
      } else if (buffer.operator_b !== '' && buffer.register_c !== '') {
        buffer.state = 5;
      }
  }

  function updateScreen() {
    let screen = document.getElementById("screen");
    if (buffer.screen_flag === 1) {
       if (buffer.register_a === '') {
          screen.innerHTML = '0';
       } else {
          screen.innerHTML = buffer.register_a;
       }
    }
    if (buffer.screen_flag === 2) {
       screen.innerHTML = buffer.register_b;
    }
    if (buffer.screen_flag === 3) {
       screen.innerHTML = buffer.register_c;
    }
  }

  function clear() {
     buffer.register_a = '';
     buffer.register_b = '';
     buffer.register_c = '';
     buffer.operator_a = '';
     buffer.operator_b = '';
     buffer.screen     = '0';
     buffer.screen_flag = 1;
     setState();
  }

  function setNumber() {
    switch(buffer.state) {
      case 1:
        buffer.screen_flag = 1;
        if (buffer.register_a === '' || buffer.register_a === '0') {
          buffer.register_a = getKeyPress();
        } else if (buffer.register_a.length < 10) {
          buffer.register_a = buffer.register_a + getKeyPress();
        }
        break;
      case 2:
        buffer.screen_flag = 2;
        if (buffer.register_b === '' || buffer.register_b === '0') {
          buffer.register_b = getKeyPress();
        } else if (buffer.register_b.length < 10) {
          buffer.register_b = buffer.register_b + getKeyPress();
        }
        break;
      case 3:
        if (buffer.register_b === '' || buffer.register_b === '0') {
          buffer.register_b = getKeyPress();
        } else if (buffer.register_b.length < 10) {
          buffer.register_b = buffer.register_b + getKeyPress();
        }
        buffer.screen_flag = 2;
        break;
      case 4:
         buffer.register_c = getKeyPress();
         buffer.screen_flag = 3;
         break;
      case 5:
         if (buffer.register_c.length < 10) {
            buffer.register_c = buffer.register_c + getKeyPress();
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

  function setOperator() {
    let key_press = getKeyPress();
    switch (buffer.state) {
      case 1:
         buffer.operator_a = key_press;
         buffer.screen_flag = 1;
         break;
      case 2:
         buffer.operator_a = key_press;
         buffer.screen_flag = 1;
         break;
      case 3:
         if ((buffer.operator_a === '+' || buffer.operator_a === '-') && (key_press === '*' || key_press === '/')) {
            buffer.operator_b = key_press;
            buffer.screen_flag = 2;
         } else {
            reckonOutside();
            buffer.register_b = '';
            buffer.operator_a = key_press;
            buffer.screen_flag = 1;
         }
         break;
      case 4:
         if (key_press === '+' || key_press === '-') {
            reckonAll();
            buffer.register_b = '';
            buffer.register_c = '';
            buffer.operator_a = key_press;
            buffer.operator_b = '';
            buffer.screen_flag = 1;
         } else {
            buffer.operator_b = key_press;
            buffer.screen_flag = 2;
         }
         break;
      case 5:
         if (key_press === '+' || key_press === '-') {
            reckonAll();
            buffer.register_b = '';
            buffer.register_c = '';
            buffer.operator_a = key_press;
            buffer.operator_b = '';
            buffer.screen_flag = 1;
         } else {
            buffer.register_b = operate(buffer.register_b, buffer.operator_b, buffer.register_c);
            buffer.register_c = '';
            buffer.operator_b = key_press;
            buffer.screen_flag = 2;
         }
         break;
      case 6:
         break;
      default:
         console.log("something other than OPERATOR happened!");
         break;
    }
  }

  function flipSign() {
    switch (buffer.state) {
      case 1:
        if (buffer.register_a !== 'empty' && buffer.register_a !== '0') {
          buffer.register_a = Number(buffer.register_a * -1).toString();
          buffer.screen_flag = 1;
        }
        break;
      case 2:
        buffer.register_b = Number(buffer.register_a * -1).toString();
        buffer.screen_flag = 2;
        break;
      case 3:
        buffer.register_b = Number(buffer.register_b * -1).toString();
        buffer.screen_flag = 2;
        break;
      case 4:
        buffer.register_c = Number(buffer.register_b * -1).toString();
        buffer.screen_flag = 3;
        break;
      case 5:
        buffer.register_c = Number(buffer.register_c * -1).toString();
        buffer.screen_flag = 3;
        break;
      case 6:
        break;
      default:
        console.log("something other than PLUS-MINUS happened!");
        break;
    }
  }

  function appendDecimal() {
    switch (buffer.state) {
      case 1:
         if (buffer.register_a.indexOf('.') === -1 && buffer.register_a.length < 10) {
            if (buffer.register_a === '' || buffer.register_a === '0') {
               buffer.register_a = '0.';
            } else {
               buffer.register_a = buffer.register_a + '.';
            }
         }
         break;
      case 2:
         buffer.register_b = '0.';
         buffer.screen_flag = 2;
         break;
      case 3:
         if (buffer.register_b.indexOf('.') === -1 && buffer.register_b.length < 10) {
            buffer.register_b = buffer.register_b + '.';
         }
         break;
      case 4:
         buffer.register_c = '0.';
         buffer.screen_flag = 3;
         break;
      case 5:
         if (buffer.register_c.indexOf('.') === -1 && buffer.register_c.length < 10) {
            buffer.register_c = buffer.register_c + '.';
         }
         break;
      case 6:
         break;
      default:
         console.log("something other than . happened!");
         break;
    }
  }

  function calculateSquareRoot() {
    switch (buffer.state) {
      case 1:
         if (buffer.register_a > 0) {
            buffer.register_a = trim(Math.sqrt(Number(buffer.register_a)).toString());
            buffer.screen_flag = 1;
         } else if (buffer.register_a === '' || buffer.register_a === '0') {
            buffer.register_a = '0';
            buffer.screen_flag = 1;
         } else {
            buffer.register_a = 'ERROR';
            buffer.register_b = '';
            buffer.register_c = '';
            buffer.opA = '';
            buffer.opB = '';
            buffer.screen_flag = 1;
         }
         break;
      case 2:
         if (buffer.register_a > 0) {
            buffer.register_b = trim(Math.sqrt(Number(buffer.register_a)).toString());
            buffer.screen_flag = 2;
         } else {
            buffer.register_a = 'ERROR';
            buffer.register_b = '';
            buffer.register_c = '';
            buffer.opA = '';
            buffer.opB = '';
            buffer.screen_flag = 1;
         }
         break;
      case 3:
         if (buffer.register_b > 0) {
            buffer.register_b = trim(Math.sqrt(Number(buffer.register_b)).toString());
            buffer.screen_flag = 2;
         } else {
            buffer.register_a = 'ERROR';
            buffer.register_b = '';
            buffer.register_c = '';
            buffer.opA = '';
            buffer.opB = '';
            buffer.screen_flag = 1;
         }
         break;
      case 4:
         if (buffer.register_b > 0) {
            buffer.register_c = trim(Math.sqrt(Number(buffer.register_b)).toString());
            buffer.screen_flag = 3;
         } else {
            buffer.register_a = 'ERROR';
            buffer.register_b = '';
            buffer.register_c = '';
            buffer.opA = '';
            buffer.opB = '';
            buffer.screen_flag = 1;
         }
         break;
      case 5:
         if (buffer.register_c > 0) {
            buffer.register_c = trim(Math.sqrt(Number(buffer.register_c)).toString());
            buffer.screen_flag = 3;
         } else {
            buffer.register_a = 'ERROR';
            buffer.register_b = '';
            buffer.register_c = '';
            buffer.opA = '';
            buffer.opB = '';
            buffer.screen_flag = 1;
         }
         break;
      case 6:
         break;
      default:
         console.log("something other than root happened!");
         break;
    }
  }

  return {
    trim          : trim,
    operate       : operate,
    setState      : setState,
    clear         : clear,
    updateScreen  : updateScreen,
    setNumber     : setNumber,
    setOperator   : setOperator,
    buffer        : buffer,
    reckonInside  : reckonInside,
    reckonOutside : reckonOutside,
    reckonAll     : reckonAll,
    getKeyPress   : getKeyPress,
    setKeyPress   : setKeyPress,
    routeKeyPress : routeKeyPress,
    flipSign      : flipSign,
    appendDecimal : appendDecimal,
    calculateSquareRoot : calculateSquareRoot,
    sendKeyPress  : sendKeyPress
  };


};
