import { Stream } from 'xstream';

/**
 * CSS class name that is added to every item
 * @type {string}
 */
export const itemClassName : string = 'x-sortable-item';

export type Transform<T, U> = (s : Stream<T>) => Stream<U>

export interface SortableOptions {
    /**
     * Optional, has to be a valid CSS selector.
     * Used to select a child of the root VNode as parent of the sortable
     * Currently works only with a simple CSS class selector
     * @default the root VNode of the given DOMSource
     * @type {string}
     */
    parentSelector? : string;

    /**
     * Optional, has to be a valid CSS selector.
     * Used to define a drag handle on the sortable items
     * @default the whole item (the first CSS class of the first item is used as selector)
     * @type {string}
     */
    handle? : string;

    /**
     * Optional, only used in conjunction with @see {handle}, has to be a valid CSS selector.
     * Used to define the item
     * @default the parent of the handle
     * @type {string}
     */
    itemSelector? : string;

    /**
     * Optional, has to be a CSS class name
     * Can be used to style the ghost item
     * @default the first CSS class of the first item
     * @type {string}
     */
    ghostClass? : string;
}
