import { VNode } from '@cycle/dom';

import { SortableOptions, UpdateOrder } from '../makeSortable';
import { cloneNodeWithData } from '../helpers';
import { updateGhost } from '../ghost';
import { getIntersection, getArea } from './utils';

const nodeIsGhost = el => (el as any).dataset.ghost;
export function mousemoveHandler(
    node: VNode,
    ev: MouseEvent,
    opts: SortableOptions
): [VNode, undefined | UpdateOrder] {
    const item: Element = (node.children as any[])
        .map(n => n.data.dataset.item)
        .filter(n => !!n)[0];

    const siblings: Element[] = Array.prototype.slice.call(
        item.parentElement.children
    );
    const index = siblings.indexOf(item);
    const ghost = siblings.filter(nodeIsGhost)[0];
    const itemArea = getArea(ghost);
    const swapIndex = getSwapIndex(index, ghost, siblings);
    const children = node.children.slice(0) as VNode[];
    const orderUpdate = getOrderUpdate(index, swapIndex, children);
    children[children.length - 1] = updateGhost(
        children[children.length - 1],
        ev
    );
    return [{ ...node, children }, orderUpdate];
}

const isAbove = (index, ghost, siblings) =>
    index > 0 && getIntersection(ghost, siblings[index - 1], true) > 0;
const isBelow = (index, ghost, siblings) =>
    index < siblings.length - 2 &&
    getIntersection(ghost, siblings[index + 1], false) > 0;
function getSwapIndex(index, ghost, siblings) {
    if (isAbove(index, ghost, siblings)) {
        return index - 1;
    } else if (isBelow(index, ghost, siblings)) {
        return index + 1;
    } else {
        return index;
    }
}

function swapChildren(indexA, indexB, children) {
    const A = children[indexA];
    children[indexA] = children[indexB];
    children[indexB] = A;
}
function getOrderUpdate(index, swapIndex, children) {
    if (swapIndex !== index) {
        swapChildren(index, swapIndex, children);
        return {
            indexMap: [],
            oldIndex: index,
            newIndex: swapIndex
        };
    }
    return undefined;
}
