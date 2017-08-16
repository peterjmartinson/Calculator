/**
 *  Two parts to each operation:
 *    1. Calculation result
 *    2. Followup calculation
*/
let Calculator = function() {
  'use strict';

  let key_press = '',
      previous_keypress = '',
      register = ['','','','',''],
      screen_flag = 1,
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
      if (register[3] === '') {
        setState(1);
      } else if (register[3] !== '' && register[1] === '') {
        setState(2);
      } else if (register[3] !== '' && register[0] !== '' && register[4] === '') {
        setState(3);
      } else if (register[4] !== '' && register[2] === '') {
        setState(4);
      } else if (register[4] !== '' && register[2] !== '') {
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
        register[3] = '';
      }
      setOperator();
    }
    else if ( key_press === '=' ) { 
      runEquals();
    }
    else if ( key_press === 'pm' ) {
      flipSign();
    }
    else if ( key_press === '.' ) {
      if (previous_keypress == '=') {
        clear();
      }
      appendDecimal();
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
    for (let i = 0; i < register.length; i++) {
      cow_organ.push( register[i] == '' ? '&nbsp;' : register[i] );
    }
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
    if (getScreenFlag() === 1) {
       if (register[0] === '') {
          screen.innerHTML = '0';
       } else {
          screen.innerHTML = register[0];
       }
    }
    if (getScreenFlag() === 2) {
       screen.innerHTML = register[1];
    }
    if (getScreenFlag() === 3) {
       screen.innerHTML = register[2];
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
    reckonInside();
    reckonOutside();
  }

  // 1+2*3= -> 1+6=
  function reckonInside() {
    if (isError()) return;
    if (register[2] == '0' && register[4] == '/') {
      divisionByZero();
      return;
    }
    // handle the "7+=" case
    if (register[2] === '') {
      register[2] = register[1]
    }
    let result = operate(register[1], register[4], register[2]);
    register[1] = result.toString();
    register[2] = '';
    setScreenFlag(2);
  }

  // 1+6= -> 7
  function reckonOutside() {
    if (isError()) return;
    if (register[1] == '0' && register[3] == '/') {
      divisionByZero();
      return;
    }
    if (getState() === 2) {
      register[1] = register[0];
    }
    let result = operate(register[0], register[3], register[1]);
    register[0] = result.toString();
    setScreenFlag(1);
  }

  function runEquals() {
    if (isError()) return;
    switch(getState()) {
      case 1:
        reckonOutside();
        break;
      case 2:
        reckonOutside();
        break;
      case 3:
        reckonOutside();
        break;
      case 4:
        reckonOutside();
        break;
      case 5:
        let temp_register = register[2];
        reckonAll();
        register[1] = temp_register;
        register[3] = register[4];
        register[4] = '';
        break;
      default:
        console.log("Something other than Equals happened!");
        break;
    }
  }


// ============================================= ERROR HANDLING
  function divisionByZero() {
    register[0] = 'DIV BY 0';
    register[1] = 'DIV BY 0';
    register[2] = 'DIV BY 0';
    register[3] = '';
    register[4] = '';
    setScreenFlag(1);
  }

  function setError() {
    register[0] = 'ERROR';
    register[1] = 'ERROR';
    register[2] = 'ERROR';
    register[3] = '';
    register[4] = '';
    setScreenFlag(1);
  }

  function isError() {
    return register[0] === 'ERROR' || register[0] === 'DIV BY 0' || register[0] === 'NaN' ? 1 : 0;
  }

// =========================================== ULTIMATE ACTIONS
  function clear() {
     register[0] = '';
     register[1] = '';
     register[2] = '';
     register[3] = '';
     register[4] = '';
     document.getElementById('screen').innerHTML = '0';
     setScreenFlag(1);
     setCalculatorState();
  }

  function setNumber() {
    switch(getState()) {
      case 1:
        updateRegister(0);
        setScreenFlag(1);
        break;
      case 2:
      case 3:
        updateRegister(1);
        setScreenFlag(2);
        break;
      case 4:
      case 5:
        updateRegister(2);
        setScreenFlag(3);
        break;
      default:
         console.log("something other than NUMBER happened!");
         break;
    }
  }

  function updateRegister(index) {
    if (targetRegisterIsEmpty(index) || isOperator(index)) {
      clearRegister(index);
    }
    appendToRegister(index);
  }

  function targetRegisterIsEmpty(index) {
    return !register[index];
  }

  function isOperator(index) {
    let operators = ['+','-','*','/']
    return operators.indexOf(register[index]) !== -1;
  }

  function clearRegister(index) {
    register[index] = '';
  }

  function appendToRegister(index) {
    if ( targetRegisterIsAppendable(index) ) {
      register[index] += getKeyPress();
    }
  }

  function targetRegisterIsAppendable(index) {
    return register[index].length < 10;
  }

  function setOperator() {
    switch (getState()) {
      case 1:
      case 2:
        changeOuterCalculation();
        break;
      case 3:
        beginInnerCalculation();
        break;
      case 4:
        completeInnerCalculation();
        break;
      case 5:
        continueInnerCalculation();
        break;
      default:
        console.log("something other than OPERATOR happened!");
        break;
    }
  }

  function changeOuterCalculation() {
    updateRegister(3);
    setScreenFlag(1);
  }

  function beginInnerCalculation() {
    if ((getKeyPress() === '*' || getKeyPress() === '/') && (register[3] === '+' || register[3] === '-')) {
      updateRegister(4);
      setScreenFlag(2);
    } else {
      reckonOutside();
      register[1] = '';
      updateRegister(3);
      setScreenFlag(1);
    }
  }

  function completeInnerCalculation() {
    if (getKeyPress() === '+' || getKeyPress() === '-') {
      runEquals();
      updateRegister(3);
      setScreenFlag(1);
    } else {
      updateRegister(4);
      setScreenFlag(2);
    }
  }

  function continueInnerCalculation() {
    if (getKeyPress() === '+' || getKeyPress() === '-') {
      runEquals();
      register[2] = '';
      register[3] = getKeyPress();
      register[4] = '';
      register[1] = '';
      setScreenFlag(1);
    } else {
      reckonInside();
      updateRegister(4);
      setScreenFlag(2);
    }
  }
    
  function flipSign() {
    switch (getState()) {
      case 1:
        if (register[0] !== 'empty' && register[0] !== '0') {
          register[0] = Number(register[0] * -1).toString();
          setScreenFlag(1);
        }
        break;
      case 2:
        register[1] = Number(register[0] * -1).toString();
        setScreenFlag(2);
        break;
      case 3:
        register[1] = Number(register[1] * -1).toString();
        setScreenFlag(2);
        break;
      case 4:
        register[2] = Number(register[1] * -1).toString();
        setScreenFlag(3);
        break;
      case 5:
        register[2] = Number(register[2] * -1).toString();
        setScreenFlag(3);
        break;
      default:
        console.log("something other than PLUS-MINUS happened!");
        break;
    }
  }

  function appendDecimal() {
    switch (getState()) {
      case 1:
         if (register[0].indexOf('.') === -1 && register[0].length < 10) {
            if (register[0] === '' || register[0] === '0') {
               register[0] = '0.';
            } else {
               register[0] = register[0] + '.';
            }
         }
         break;
      case 2:
         register[1] = '0.';
         setScreenFlag(2);
         break;
      case 3:
         if (register[1].indexOf('.') === -1 && register[1].length < 10) {
            register[1] = register[1] + '.';
         }
         break;
      case 4:
         register[2] = '0.';
         setScreenFlag(3);
         break;
      case 5:
         if (register[2].indexOf('.') === -1 && register[2].length < 10) {
            register[2] = register[2] + '.';
         }
         break;
      default:
         console.log("something other than . happened!");
         break;
    }
  }

  function calculateSquareRoot() {
    switch (getState()) {
      case 1:
         if (register[0] > 0) {
            register[0] = trim(Math.sqrt(Number(register[0])).toString());
            setScreenFlag(1);
         } else if (register[0] === '' || register[0] === '0') {
            register[0] = '0';
            setScreenFlag(1);
         } else {
            setError();
         }
         break;
      case 2:
         if (register[0] > 0) {
            register[1] = trim(Math.sqrt(Number(register[0])).toString());
            setScreenFlag(2);
         } else {
            setError();
         }
         break;
      case 3:
         if (register[1] > 0) {
            register[1] = trim(Math.sqrt(Number(register[1])).toString());
            setScreenFlag(2);
         } else {
            setError();
         }
         break;
      case 4:
         if (register[1] > 0) {
            register[2] = trim(Math.sqrt(Number(register[1])).toString());
            setScreenFlag(3);
         } else {
            setError();
         }
         break;
      case 5:
         if (register[2] > 0) {
            register[2] = trim(Math.sqrt(Number(register[2])).toString());
            setScreenFlag(3);
         } else {
            setError();
         }
         break;
      default:
         console.log("something other than root happened!");
         break;
    }
  }

  return {
    sendKeyPress        : sendKeyPress,
    register            : register
  };


};
