import _ from 'lodash';

const formatValue = (value) => {
  if (_.isPlainObject(value)) return '[complex value]';

  return _.isString(value) ? `'${value}'` : value;
};

const formatListToPlain = (list, oldPath) => list
  .map(({
    type, key, oldValue, newValue, children,
  }) => {
    const newPath = oldPath ? `${oldPath}.${key}` : `${key}`;


    switch (type) {
      case 'removed':
        return `Property '${newPath}' was removed`;
      case 'added':
        return `Property '${newPath}' was added with value: ${formatValue(newValue)}`;
      case 'updated':
        return `Property '${newPath}' was updated. From ${formatValue(oldValue)} to ${formatValue(newValue)}`;
      case 'unchanged':
        return null;
      case 'parent':
        return formatListToPlain(children, newPath);
      default:
        throw new Error(`Unknown type '${type}'`);
    }
  })
  .filter((line) => line)
  .join('\n');

const getPlain = (diff) => formatListToPlain(diff, '');

export default getPlain;
