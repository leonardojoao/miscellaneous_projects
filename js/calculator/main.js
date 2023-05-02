import printMessage from './print.js';
import readOperation from './executeOperations.js';

let selectOperation = 0;

do {
  printMessage('\n--------------------------------\n');
  printMessage('Select the operation:\n');

  printMessage('1 - Sum');
  printMessage('2 - Sub');
  printMessage('3 - Div');
  printMessage('4 - Mult');

  printMessage('9 - Exit');

  selectOperation = readOperation();
  printMessage('\n--------------------------------');
} while (selectOperation !== 9);
