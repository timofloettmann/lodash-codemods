# lodash-codemods

Codemods for lodash

## Setup & Run

```
npm install -g jscodeshift

git clone https://github.com/timofloettmann/lodash-codemods.git

jscodeshift -t lodash-codemods/<codemod>.js <your-project-dir>
```

## Included codemods

### `modular-lodash.js`

Converts your lodash imports into modular imports.

For example:

```
import _ from 'lodash'

_.isUndefined(...);
```

Would become:

```
import isUndefined from 'lodash/isUndefined'
```

### `lodash-to-native.js`

converts lodash functions that have native equivalents into their respective native function and removes the import.

For example:

```
import isUndefined from 'lodash/isUndefined';

if (isUndefined(myVar)) {
  ...
}
```

would become

```
if (myVar === undefined) {
  ...
}
```

and 

```
import map from 'lodash/map'

const mapped = map(arr, () => {...});
```

would become

```
const mapped = arr.map(() => {...});
```