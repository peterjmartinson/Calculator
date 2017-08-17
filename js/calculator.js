/**
 *  Two parts to each operation:
 *    1. Calculation result
 *    2. Followup calculation
*/
let Calculator = function() {
  'use strict';

  let key_press = '',
      previous_keypress = '',
      first_number = '',
      second_number = '',
      third_number = '',
      first_operator = '',
      second_operator = '',
      screen_flag = 0,
      state = 1;

// ========================================== STATE
/*
 *           A | B | C |opA|opB|
 *          ---|---|---|---|---|
 * State 1) 0,A|   |   |   |   |
 * State 2)  A |   |   | + |   |
 * State 3)  A | B |   |+,*|   |
 * State 4)  A | B |   | + | * |
 * State 5)  A | B | C | + | * |
**/

  function setState(new_state) {
    state = new_state;
  }

  function getState() {
    return state;
  }

  function setCalculatorState() {
      if (first_operator === '') {
        setState(1);
      } else if (first_operator !== '' && second_number === '') {
        setState(2);
      } else if (first_operator !== '' && first_number !== '' && second_operator === '') {
        setState(3);
      } else if (second_operator !== '' && third_number === '') {
        setState(4);
      } else if (second_operator !== '' && third_number !== '') {
        setState(5);
      }
  }

// ========================================== KEY ROUTING
  function sendKeyPress(key) {
    setKeyPress(key);
    routeKeyPress();
    setCalculatorState();
    updateScreen();
    document.getElementById("cowport").innerHTML = logInternals();
  }

  function setKeyPress(new_keypress) {
    key_press = new_keypress.toString();
  }

  function getKeyPress() {
    return key_press;
  }

  function routeKeyPress() {
    let number = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        operator = ['+', '-', '*', '/'];
    if ( key_press === 'clear' ) {
      clear();
    }
    else if ( isError() ) {
      return;
    }
    else if ( number.indexOf(key_press) > -1 ) {
      if (previous_keypress == '=') {
        clear();
      }
      setNumber();
    }
    else if ( operator.indexOf(key_press) > -1 ) {
      if (previous_keypress == '=') {
        first_operator = '';
      }
      setOperator();
    }
    else if ( key_press === '=' ) { 
      runEquals();
    }
    else if ( key_press === 'pm' ) {
      setSign();
    }
    else if ( key_press === '.' ) {
      if (previous_keypress == '=') {
        clear();
      }
      setDecimal();
    }
    else if ( key_press === 'root' ) {
      calculateSquareRoot();
    }
    previous_keypress = getKeyPress();
  }

// =========================================== SCREEN
  function setScreenFlag(flag) {
    screen_flag = flag;
  }

  function getScreenFlag(flag) {
    return screen_flag;
  }

  function logInternals() {
    let cow_organ = [];
    cow_organ.push( first_number == '' ? '&nbsp;' : first_number );
    cow_organ.push( second_number == '' ? '&nbsp;' : second_number );
    cow_organ.push( third_number == '' ? '&nbsp;' : third_number );
    cow_organ.push( first_operator == '' ? '&nbsp;' : first_operator );
    cow_organ.push( second_operator == '' ? '&nbsp;' : second_operator );
    // for (let i = 0; i < register.length; i++) {
    //   cow_organ.push( register[i] == '' ? '&nbsp;' : register[i] );
    // }
    let output = '';
    output += '   <ul>'
    output += '     <li>'
    output += '       <span>Register 1</span><span>' + cow_organ[0] + '</span>'
    output += '     </li>'
    output += '     <li>'
    output += '       <span>Register 2</span><span>' + cow_organ[1] + '</span>'
    output += '     </li>'
    output += '     <li>'
    output += '       <span>Register 3</span><span>' + cow_organ[2] + '</span>'
    output += '     </li>'
    output += '     <li>'
    output += '       <span>Operator 1</span><span>' + cow_organ[3] + '</span>'
    output += '     </li>'
    output += '     <li>'
    output += '       <span>Operator 2</span><span>' + cow_organ[4] + '</span>'
    output += '     </li>'
    output += '     <li>'
    output += '       <span>State</span><span>' + state + '</span>'
    output += '     </li>'
    output += '     <li>'
    output += '       <span>On Screen</span><span>' + document.getElementById("screen").innerHTML + '</span>'
    output += '     </li>'
    output += '   </ul>'
    return output;
  }

  function updateScreen() {
    let screen = document.getElementById("screen");
    if (getScreenFlag() === 0) {
       if (first_number === '') {
          screen.innerHTML = '0';
       } else {
          screen.innerHTML = first_number;
       }
    }
    if (getScreenFlag() === 1) {
       screen.innerHTML = second_number;
    }
    if (getScreenFlag() === 2) {
       screen.innerHTML = third_number;
    }
  }

// ============================================ UTILITY
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

// ========================================== OPERATIONS
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

  function reckonAll() {
    if (isError()) return;
    let temp_register = third_number;
    reckonInside();
    reckonOutside();
    second_number = temp_register;
    first_operator = second_operator;
    second_operator = '';
  }

  function reckonInside() {
    if (isError()) return;
    if (third_number == '0' && second_operator == '/') {
      divisionByZero();
      return;
    }
    // handle the "7+=" case
    if (third_number === '') {
      third_number = second_number
    }
    let result = operate(second_number, second_operator, third_number);
    second_number = result.toString();
    third_number = '';
    setScreenFlag(1);
  }

  function reckonOutside() {
    if (isError()) return;
    if (second_number == '0' && first_operator == '/') {
      divisionByZero();
      return;
    }
    if (getState() === 2) {
      second_number = first_number;
    }
    let result = operate(first_number, first_operator, second_number);
    first_number = result.toString();
    setScreenFlag(0);
  }

  function runEquals() {
    if (isError()) return;
    switch(getState()) {
      case 1:
      case 2:
      case 3:
      case 4:
        reckonOutside();
        break;
      case 5:
        reckonAll();
        break;
      default:
        console.log("Something other than Equals happened!");
        break;
    }
  }


// ============================================= ERROR HANDLING
  function divisionByZero() {
    first_number = 'DIV BY 0';
    second_number = 'DIV BY 0';
    third_number = 'DIV BY 0';
    first_operator = '';
    second_operator = '';
    setScreenFlag(0);
  }

  function setError() {
    first_number = 'ERROR';
    second_number = 'ERROR';
    third_number = 'ERROR';
    first_operator = '';
    second_operator = '';
    setScreenFlag(0);
  }

  function isError() {
    return first_number === 'ERROR' || first_number === 'DIV BY 0' || first_number === 'NaN' ? 1 : 0;
  }

  function clear() {
     first_number = '';
     second_number = '';
     third_number = '';
     first_operator = '';
     second_operator = '';
     document.getElementById('screen').innerHTML = '0';
     setScreenFlag(0);
     setCalculatorState();
  }

// =========================================== CASE STATEMENTS

  function setNumber() {
    switch(getState()) {
      case 1:
        appendFirstNumber();
        break;
      case 2:
      case 3:
        appendSecondNumber();
        break;
      case 4:
      case 5:
        appendThirdNumber();
        break;
      default:
         console.log("something other than NUMBER happened!");
         break;
    }
  }

  function setOperator() {
    switch (getState()) {
      case 1: // 0,A|   |   |   |   |
      case 2: //  A |   |   | + |   |
        changeOuterCalculation();
        break;
      case 3: //  A | B |   |+,*|   |
        beginInnerCalculation();
        break;
      case 4: //  A | B |   | + | * |
        completeInnerCalculation();
        break;
      case 5: //  A | B | C | + | * |
        continueInnerCalculation();
        break;
      default:
        console.log("something other than OPERATOR happened!");
        break;
    }
  }

  function setSign() {
    switch (getState()) {
      case 1: // 0,A|   |   |   |   |
        flipFirstSign();
        break;
      case 2: //  A |   |   | + |   |
        transferAndFlipFirstSign();
        break;
      case 3: //  A | B |   |+,*|   |
        flipSecondSign();
        break;
      case 4: //  A | B |   | + | * |
        transferAndFlipSecondSign();
        break;
      case 5: //  A | B | C | + | * |
        flipThirdSign();
        break;
      default:
        console.log("something other than PLUS-MINUS happened!");
        break;
    }
  }

  function setDecimal() {
    switch (getState()) {
      case 1: // 0,A|   |   |   |   |
         setFirstDecimal();
         break;
      case 2: //  A |   |   | + |   |
         transferFirstDecimal();
         break;
      case 3: //  A | B |   |+,*|   |
         setSecondDecimal();
         break;
      case 4: //  A | B |   | + | * |
         transferSecondDecimal();
         break;
      case 5: //  A | B | C | + | * |
         setThirdDecimal();
         break;
      default:
         console.log("something other than . happened!");
         break;
    }
  }

  function calculateSquareRoot() {
    switch (getState()) {
      case 1: // 0,A|   |   |   |   |
         calculateFirstRoot();
         break;
      case 2: //  A |   |   | + |   |
         transferFirstRoot();
         break;
      case 3: //  A | B |   |+,*|   |
         calculateSecondRoot();
         break;
      case 4: //  A | B |   | + | * |
         transferSecondRoot();
         break;
      case 5: //  A | B | C | + | * |
         calculateThirdRoot();
         break;
      default:
         console.log("something other than root happened!");
         break;
    }
  }

// ============================================ REGISTER MANIPULATION

  function appendFirstNumber() {
    if (first_number.length < 10) {
      first_number += getKeyPress();
    }
  }

  function appendSecondNumber() {
    // if (first_number.length < 10) {
    //   first_number += getKeyPress();
    // }
    if (second_number.length < 10) {
      second_number += getKeyPress();
    }
  }

  function appendThirdNumber() {
    // if (first_number.length < 10) {
    //   first_number += getKeyPress();
    // }
    if (third_number.length < 10) {
      third_number += getKeyPress();
    }
  }

  function changeOuterCalculation() {
    first_operator = getKeyPress();
  }

  function beginInnerCalculation() {
    if ((getKeyPress() === '*' || getKeyPress() === '/') && (first_operator === '+' || first_operator === '-')) {
      second_operator = getKeyPress();
      setScreenFlag(1);
    } else {
      reckonOutside();
      second_number = '';
      first_operator = getKeyPress();
      setScreenFlag(0);
    }
  }

  function completeInnerCalculation() {
    if (getKeyPress() === '+' || getKeyPress() === '-') {
      runEquals();
      first_operator = getKeyPress();
      setScreenFlag(0);
    } else {
      second_operator = getKeyPress();
      setScreenFlag(1);
    }
  }

  function continueInnerCalculation() { // case 5
    if (getKeyPress() === '+' || getKeyPress() === '-') {
      reckonAll();
      second_number = '';
      third_number = '';
      first_operator = getKeyPress();
      second_operator = '';
    } else {
      reckonInside();
      second_operator = getKeyPress();
      setScreenFlag(1);
    }
  }
    
  function flipFirstSign() {
    first_number = Number(first_number * -1).toString();
    setScreenFlag(0);
  }

  function transferAndFlipFirstSign() {
    second_number = Number(first_number * -1).toString();
    setScreenFlag(1);
  }

  function flipSecondSign() {
    second_number = Number(second_number * -1).toString();
    setScreenFlag(1);
  }

  function transferAndFlipSecondSign() {
    third_number = Number(second_number * -1).toString();
    setScreenFlag(1);
  }

  function flipThirdSign() {
    third_number = Number(third_number * -1).toString();
    setScreenFlag(2);
  }

  function setFirstDecimal() {
    if (first_number === '' || first_number === '0') {
       first_number = '0.';
    } else {
      first_number += first_number.length < 10 ? '.' : '';
    }
  }

  function transferFirstDecimal() {
    second_number = '0.';
    setScreenFlag(1);
  }

  function setSecondDecimal() {
    if (second_number.indexOf('.') === -1 && second_number.length < 10) {
      second_number = second_number + '.';
    }
  }

  function transferSecondDecimal() {
    third_number = '0.';
    setScreenFlag(2);
  }

  function setThirdDecimal() {
    if (third_number.indexOf('.') === -1 && third_number.length < 10) {
      third_number = third_number + '.';
    }
  }

  function calculateFirstRoot() {
    if (first_number > 0) {
      first_number = trim(Math.sqrt(Number(first_number)).toString());
      setScreenFlag(0);
    } else if (first_number === '' || first_number === '0') {
      first_number = '0';
      setScreenFlag(0);
    } else {
      setError();
    }
  }

  function transferFirstRoot() {
    if (first_number > 0) {
      second_number = trim(Math.sqrt(Number(first_number)).toString());
      setScreenFlag(1);
    } else {
      setError();
    }
  }

  function calculateSecondRoot() {
    if (second_number > 0) {
      second_number = trim(Math.sqrt(Number(second_number)).toString());
      setScreenFlag(1);
    } else if (second_number === '' || second_number === '0') {
      second_number = '0';
      setScreenFlag(1);
    } else {
      setError();
    }
  }

  function transferSecondRoot() {
    if (second_number > 0) {
      third_number = trim(Math.sqrt(Number(second_number)).toString());
      setScreenFlag(2);
    } else {
      setError();
    }
  }

  function calculateThirdRoot() {
    if (third_number > 0) {
      third_number = trim(Math.sqrt(Number(third_number)).toString());
      setScreenFlag(2);
    } else if (third_number === '' || third_number === '0') {
      third_number = '0';
      setScreenFlag(2);
    } else {
      setError();
    }
  }

  return {
    sendKeyPress : sendKeyPress
  };


};
