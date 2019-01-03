import { VNode } from '@cycle/dom';

export function addKeys(node: VNode): VNode {
    return {
        ...node,
        children: node.children.map((n: VNode, i) => ({
            ...n,
            key: n.key ? n.key : '_sortable' + i
        }))
    };
}

interface MapStringToAny {
    [k: string]: any;
}
interface MapNumberToAny {
    [k: number]: any;
}
type MapToAny = MapStringToAny | MapNumberToAny;

// clones the properties of `node`
// merges the `data` property w/ { [key]: values }
export function cloneNodeWithData(
    node: VNode,
    key: string,
    values: MapToAny
): any {
    return {
        ...node,
        data: {
            ...node.data,
            [key]: {
                ...(node.data ? node.data[key] : {}),
                ...values
            }
        }
    };
}

// https://github.com/tc39/proposal-object-from-entries/blob/master/polyfill.js
export function ObjectFromEntries(iter) {
    const obj = {};
    for (const pair of iter) {
        if (Object(pair) !== pair) {
            throw new TypeError(
                'iterable for fromEntries should yield objects'
            );
        }

        // Consistency with Map: contract is that entry has "0" and "1" keys, not
        // that it is an array or iterable.

        const { '0': key, '1': val } = pair;

        Object.defineProperty(obj, key, {
            configurable: true,
            enumerable: true,
            writable: true,
            value: val
        });
    }
    return obj;
}

export function mapValues(obj, mapFn) {
    // TODO: Should either
    // 1. ensure Object.entries exists, or provide polyfill?
    // 2. Make es2018 a minimum requirement and have consumers provide polyfill
    return ObjectFromEntries(
        (Object as any).entries(obj).map(([key, val]) => [key, mapFn(val, key)])
    );
}
