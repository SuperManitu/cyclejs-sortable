# cyclejs-sortable
Makes all children of a selected component sortable

Github Repo: https://github.com/cyclejs-community/cyclejs-sortable

Full documentation: https://cyclejs-community.github.io/cyclejs-sortable/

NPM: https://www.npmjs.com/package/cyclejs-sortable

## Examples

You can check out live versions of the [examples](./examples/) here:
- [simple](./examples/simple/src/index.ts): https://cyclejs-community.github.io/cyclejs-sortable/simple/
- [horizontal](./examples/horizontal/src/index.ts): https://cyclejs-community.github.io/cyclejs-sortable/horizontal/
- [parentSelector](./examples/parentSelector/src/index.ts): https://cyclejs-community.github.io/cyclejs-sortable/parentSelector/
- [updateEvent](./examples/updateEvent/src/index.ts): https://cyclejs-community.github.io/cyclejs-sortable/updateEvent/

## Required Polyfills
The code uses a few ES6 features, so you might need an es6 polyfill like `babel-polyfill`

The use the `updateOrder Event` in IE you have to add a CustomEvent constructor polyfill like https://www.npmjs.com/package/custom-event

## Installation

`npm install --save cyclejs-sortable`

## Basic Usage
For more information see the [examples](https://github.com/SuperManitu/cyclejs-sortable/tree/master/examples)

```
function main(sources)
{
    return {
        DOM: xs.of(div([
            div(['one']),
            div(['two']),
            div(['three']),
            div(['four'])
        ]))
        .compose(makeSortable(sources.DOM))
    }
}
```
