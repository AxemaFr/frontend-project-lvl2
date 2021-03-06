import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import selectParser from './parser.js';
import selectFormatter from './formatters/index.js';

const getParsedContent = (filepath) => {
  const extension = _.trimStart(path.extname(filepath), '.');
  const parse = selectParser(extension);

  const content = fs.readFileSync(filepath, 'utf8');

  return parse(content);
};

const genInternalDiff = (parsedContent1, parsedContent2) => {
  const keys = _.union(Object.keys(parsedContent1), Object.keys(parsedContent2));
  const sortedKeys = _.sortBy(keys);

  return sortedKeys.map((key) => {
    if (!_.has(parsedContent2, key)) {
      return {
        type: 'removed', key, oldValue: parsedContent1[key], newValue: null,
      };
    }

    if (!_.has(parsedContent1, key)) {
      return {
        type: 'added', key, oldValue: null, newValue: parsedContent2[key],
      };
    }

    const oldValue = parsedContent1[key];
    const newValue = parsedContent2[key];

    if (_.isPlainObject(oldValue) && _.isPlainObject(newValue)) {
      return { key, type: 'parent', children: genInternalDiff(oldValue, newValue) };
    }

    if (_.isEqual(oldValue, newValue)) {
      return {
        key, type: 'unchanged', oldValue, newValue,
      };
    }

    return {
      key, type: 'updated', oldValue, newValue,
    };
  });
};

const genDiff = (filepath1, filepath2, outputFormat = 'stylish') => {
  const parsedContent1 = getParsedContent(filepath1);
  const parsedContent2 = getParsedContent(filepath2);

  const internalDiff = genInternalDiff(parsedContent1, parsedContent2);

  const getFormattedDiff = selectFormatter(outputFormat);
  const formattedDiff = getFormattedDiff(internalDiff);

  return formattedDiff;
};

export default genDiff;
