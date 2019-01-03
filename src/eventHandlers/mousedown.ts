import { VNode } from '@cycle/dom';

import { SortableOptions } from '../makeSortable';
import { cloneNodeWithData } from '../helpers';
import { textSelectionClasses } from './utils';
import { createGhost } from '../ghost';

function findParent(el: Element, sel: string): Element {
    let result = el;
    while (!result.matches(sel)) {
        if (result.matches('html')) {
            throw new Error('no parent element found');
        }
        result = result.parentElement;
    }
    return result;
}

export function mousedownHandler(
    node: VNode,
    ev: MouseEvent,
    opts: SortableOptions
): [VNode, undefined] {
    const item: Element = findParent(ev.target as Element, opts.itemSelector);
    const indexClicked = Array.prototype.slice
        .call(item.parentElement.children)
        .indexOf(item);

    const children = node.children
        .map(saveOriginalIndexes)
        .map(hideSelected(indexClicked))
        .concat(
            createGhost(indexClicked, ev, item, node.children[
                indexClicked
            ] as VNode)
        );

    const disabledTextSelectionStyles = textSelectionClasses
        .map(n => ({ [n]: 'none' }))
        .reduce((a, c) => ({ ...a, ...c }), {});

    return [
        {
            ...cloneNodeWithData(node, 'style', {
                ...disabledTextSelectionStyles,
                position: 'relative'
            }),
            children
        },
        undefined
    ];
}

function saveOriginalIndexes(node: VNode, index: number): VNode {
    return cloneNodeWithData(node, 'dataset', {
        originalIndex: index
    });
}

function hideSelected(index: number): (node: VNode, i: number) => VNode {
    return function(node, i) {
        return i !== index
            ? node
            : cloneNodeWithData(node, 'style', { opacity: 0 });
    };
}
