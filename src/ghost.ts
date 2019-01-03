import { VNode } from '@cycle/dom';

import { cloneNodeWithData } from './helpers';

export function createGhost(
    clicked: number,
    ev: any,
    item: Element,
    node: VNode
): VNode {
    const rect = item.getBoundingClientRect();
    const style = getComputedStyle(item);
    const padding = {
        top: parseFloat(style.paddingTop) + parseFloat(style.borderTop),
        left: parseFloat(style.paddingLeft) + parseFloat(style.borderLeft),
        bottom:
            parseFloat(style.paddingBottom) + parseFloat(style.borderBottom),
        right: parseFloat(style.paddingRight) + parseFloat(style.borderRight)
    };
    const parentRect = item.parentElement.getBoundingClientRect();
    const offsetX =
        ev.clientX - rect.left + parentRect.left + parseFloat(style.marginLeft);
    const offsetY =
        ev.clientY - rect.top + parentRect.top + parseFloat(style.marginTop);

    const sub = style.boxSizing !== 'border-box';

    const nodeWithDataset = cloneNodeWithData(node, 'dataset', {
        offsetX,
        offsetY,
        item,
        ghost: true
    });

    return cloneNodeWithData(nodeWithDataset, 'style', {
        position: 'absolute',
        left: ev.clientX - offsetX + 'px',
        top: ev.clientY - offsetY + 'px',
        width: rect.width - (sub ? padding.left - padding.right : 0) + 'px',
        height: rect.height - (sub ? padding.top - padding.bottom : 0) + 'px',
        'pointer-events': 'none'
    });
}

export function updateGhost(node: VNode, ev: MouseEvent): VNode {
    const { offsetX, offsetY } = node.data.dataset as any;
    return cloneNodeWithData(node, 'style', {
        left: ev.clientX - offsetX + 'px',
        top: ev.clientY - offsetY + 'px'
    });
}
