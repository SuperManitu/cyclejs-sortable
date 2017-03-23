import { VNode } from '@cycle/dom';
import { select } from 'snabbdom-selector';
import { EventHandler, MouseOffset, ItemDimensions, Intersection } from '../definitions';

import { getGhostStyle, findParent, getIntersection, getArea, addAttributes, replaceNode } from '../helpers';

/**
 * Used to adjust the position of the ghost and swap the items if needed
 * @type {EventHandler}
 */
export const mousemoveHandler : EventHandler = (node, event, options) => {
    const parent : VNode = select(options.parentSelector, node)[0];
    const ghost : VNode = parent.children[parent.children.length - 1] as VNode;

    const mouseOffset : MouseOffset = JSON.parse(ghost.data.attrs['data-mouseoffset']);
    const itemIndex : number = parseInt(ghost.data.attrs['data-itemindex']);
    const item : VNode = parent.children[itemIndex] as VNode;
    const itemIntersection : number = getArea(getIntersection(item.elm as Element, ghost.elm as Element));
    const itemArea : number = getArea(getIntersection(item.elm as Element, item.elm as Element));

    const intersectionAreas : [number, number][] = parent.children
        .slice(0, -1)
        .map<Element>(c => (c as VNode).elm as Element)
        .map<Intersection>(e => getIntersection(e, ghost.elm as Element))
        .map<[number, number]>((e, i) => [getArea(e), i]);

    const maxIntersection : [number, number] = intersectionAreas
        .reduce((acc, curr) => curr[0] > acc[0] ? curr : acc);

    const maxElement : Element = (parent.children[maxIntersection[1]] as VNode).elm as Element;
    const maxArea : number = getArea(getIntersection(maxElement, maxElement));

    const newIndex : number = maxIntersection[1] === itemIndex ? itemIndex :
        (-itemIntersection > maxArea - itemArea ? maxIntersection[1] : itemIndex);

    const ghostAttrs : { [attr : string]: string } = {
        'style': getGhostStyle(event, mouseOffset, ghost.elm as Element),
        'data-itemindex': newIndex.toString()
    };

    const filteredChildren : VNode[] = (parent.children as VNode[])
        .filter((e, i) => i !== itemIndex)
        .slice(0, -1);

    const newChildren : VNode[] = [
        ...filteredChildren.slice(0, newIndex),
        parent.children[itemIndex] as VNode,
        ...filteredChildren.slice(newIndex, filteredChildren.length)
    ];

    return replaceNode(node, options.parentSelector, Object.assign({}, parent, {
        children: [...newChildren, addAttributes(ghost, ghostAttrs)]
    }));
};
