import promptSync from 'prompt-sync';

import {
  sum,
  sub,
  div,
  mult,
} from './operators.js';
import printMessage from './print.js';

const prompt = promptSync();

const executeOperation = (operation) => {
  printMessage('\nEnter the first value:');
  const firstValue = Number(prompt(''));

  printMessage('Enter the second value:');
  const secondValue = Number(prompt(''));

  return operation(firstValue, secondValue);
};

const readOperation = () => {
  const operation = Number(prompt(''));
  let result;

  switch (operation) {
    case 1:
      result = executeOperation(sum);
      break;
    case 2:
      result = executeOperation(sub);
      break;
    case 3:
      result = executeOperation(div);
      break;
    case 4:
      result = executeOperation(mult);
      break;
    case 9:
      printMessage('EXIT');
      break;
    default:
      printMessage('Unknown operation');
  }

  printMessage(`\nResult operation is ${result}`);
  return operation;
};

export default readOperation;
