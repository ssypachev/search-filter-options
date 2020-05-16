# search-filter-options
Incremental tokenizer

## Purpose
UX of project requires filter with large amount of fields (20-30), e.g.
`email`, `provider`, `status` etc. with any combinations of theese fields.

Solution - make search string filter which transform string like
`:provider stripe :status pending` into object like
```
{
    provider: 'stripe',
    status: 'pending'
}
```

## Description

Create instance of parser and parse

#### Browser
```
var sfo = new SearchFilterOptions();
...
sfo.parse(' :provider stripe  :status  pending ');
```

##### constructor
`SearchFilterOptions({ sigil = ':', keys = [], trim = true } = {})`

where

- **sigil** - char that starts key word, default is `:`
- **keys** - array of expected keyword objects `{ name: 'name of key', flag: 'optional, true if this variable is a flag'}`
- **trim** - to trim keys and values, default `true`

##### return object

```
{
    data: {     //all found keys
        key: {
            value: 'string'
        }
    },
    expected: { //all expected keywords that matches `keys` argument in constructor
        key: {
            value: string,
            exists: boolean,
            flag: boolean
        }
    },
    extra: string //everything before first keyword
}
```

##### parsing
`parse(string)` - return result object. Parser saves previous state, and if next string differs by one letter,
then restore previous state and increment data

## Examples
see test file on [github.com](https://github.com/ssypachev/search-filter-options/tree/master/tests/server)


























