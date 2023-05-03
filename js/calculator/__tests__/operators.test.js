/* eslint-disable no-unused-expressions */
import { describe, expect, test } from '@jest/globals';

import {
  sum, sub, div, mult,
} from '../operators.js';

const tests = [
  {
    name: 'Test sum function',
    unitTests: [
      {
        name: 'Adds 2 + 1 to equal 3',
        function: sum,
        comparStatus: true,
        value: {
          first: 2,
          second: 1,
        },
        result: 3,
      },
      {
        name: 'Adds 3 + 2 to different 4',
        function: sum,
        comparStatus: false,
        value: {
          first: 3,
          second: 2,
        },
        result: 4,
      },
    ],
  },
  {
    name: 'Test sub function',
    unitTests: [
      {
        name: 'Adds 2 - 1 to equal 1',
        function: sub,
        comparStatus: true,
        value: {
          first: 2,
          second: 1,
        },
        result: 1,
      },
      {
        name: 'Adds 3 - 2 to different 4',
        function: sub,
        comparStatus: false,
        value: {
          first: 3,
          second: 2,
        },
        result: 4,
      },
    ],
  },
  {
    name: 'Test div function',
    unitTests: [
      {
        name: 'Adds 2 / 1 to equal 2',
        function: div,
        comparStatus: true,
        value: {
          first: 2,
          second: 1,
        },
        result: 2,
      },
      {
        name: 'Adds 3 / 2 to different 4',
        function: div,
        comparStatus: false,
        value: {
          first: 3,
          second: 2,
        },
        result: 4,
      },
    ],
  },
  {
    name: 'Test mult function',
    unitTests: [
      {
        name: 'Adds 2 * 1 to equal 2',
        function: mult,
        comparStatus: true,
        value: {
          first: 2,
          second: 1,
        },
        result: 2,
      },
      {
        name: 'Adds 3 * 2 to different 4',
        function: mult,
        comparStatus: false,
        value: {
          first: 3,
          second: 2,
        },
        result: 4,
      },
    ],
  },
];

tests.forEach((element) => {
  describe(element.name, () => {
    element.unitTests.forEach((unitTest) => {
      test(unitTest.name, () => {
        unitTest.comparStatus
          ? expect(unitTest.function(unitTest.value.first, unitTest.value.second))
            .toBe(unitTest.result)
          : expect(unitTest.function(unitTest.value.first, unitTest.value.second))
            .not.toBe(unitTest.result);
      });
    });
  });
});
