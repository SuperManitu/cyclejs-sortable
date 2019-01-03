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
