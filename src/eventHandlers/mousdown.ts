import { VNode } from '@cycle/dom';
import select from 'snabbdom-selector';
import { EventHandler, MouseOffset } from '../definitions';

import { getIndex, getGhostStyle, findParent, addAttributes, replaceNode, getClientRect } from '../helpers';

/**
 * Used to create the ghost and hide the item dragged
 * @type {EventHandler}
 */
export const mousedownHandler : EventHandler = (node, event, options) => {
    const item : Element = findParent(event.target as Element, options.itemSelector);
    const itemRect : ClientRect = getClientRect(item);
    const mouseOffset : MouseOffset = {
        x: itemRect.left - event.clientX,
        y: itemRect.top - event.clientY
    };
    const parent : VNode = select(options.parentSelector, node)[0];
    const index : number = getIndex(item);
    const ghostAttrs : { [name : string]: string } = {
        'data-mouseoffset': JSON.stringify(mouseOffset),
        'style': getGhostStyle(event, mouseOffset, itemRect)
    };

    const children : VNode[] = [
        ...parent.children,
        addAttributes(parent.children[index], ghostAttrs)
    ];

    return replaceNode(node, options.parentSelector, Object.assign({}, parent, {
        children: children
    }));
};