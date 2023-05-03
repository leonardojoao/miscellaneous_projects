import {
  describe,
  expect,
  test,
  jest,
} from '@jest/globals';

import printMessage from '../print';

describe('Testing printMessage function', () => {
  test('Print word juca', () => {
    const logSpy = jest.spyOn(global.console, 'log');
    const word = 'Juca';

    printMessage(word);

    expect(logSpy).toHaveBeenCalledWith(word);
    logSpy.mockRestore();
  });
});
