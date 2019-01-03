import xs, { Stream } from 'xstream';
import delay from 'xstream/extra/delay';
import sampleCombine from 'xstream/extra/sampleCombine';
import throttle from 'xstream/extra/throttle';
import { DOMSource, VNode } from '@cycle/dom';
import { adapt } from '@cycle/run/lib/adapt';
import {
    Component,
    DragAndDropSinks,
    makeDragAndDrop,
    DragAndDropOptions
} from './dragAndDrop';
import { addKeys, mapValues } from './helpers';
import { handleEvent } from './eventHandler';

export type HOC<So, Si> = (
    c: Component<So, Si>
) => Component<So, Si & DragAndDropSinks>;

export interface SortableOptions extends DragAndDropOptions {}
export interface UpdateOrder {
    indexMap: { [old: number]: number };
    oldIndex: number;
    newIndex: number;
}

export interface SortableSinks extends DragAndDropSinks {
    updateLive: Stream<UpdateOrder>;
    updateDone: Stream<UpdateOrder>;
}

export function toSortable<Sources extends object, Sinks extends object>(
    options: SortableOptions
): HOC<Sources, Sinks> {
    return component => makeSortable(component, options);
}

export function makeSortable<Sources extends object, Sinks extends object>(
    main: Component<Sources, Sinks>,
    options: SortableOptions
): Component<Sources, Sinks & SortableSinks> {
    return sources => {
        const dnd = makeDragAndDrop({ ...options })(sources);
        const { dragStart, dragMove, dragEnd } = dnd;
        if (!options.DOMDriverKey) {
            options.DOMDriverKey = 'DOM';
        }
        const sinks: any = main(sources);
        const eventHandler = handleEvent(options);
        const domSink = sinks[options.DOMDriverKey];
        const childDOM$: Stream<VNode> = xs
            .fromObservable<VNode>(domSink)
            .map(addKeys);

        const data$: Stream<[VNode, UpdateOrder | undefined]> = childDOM$
            .map(dom =>
                xs
                    .merge(dragStart, dragMove, dragEnd)
                    .fold(eventHandler, [dom, undefined])
            )
            .flatten();
        const vdom$: Stream<VNode> = data$.map(([dom, _]) => dom);
        const updateOrder$: Stream<UpdateOrder> = data$
            .map(([_, orderUpdate]) => orderUpdate)
            .filter(orderUpdate => orderUpdate !== undefined);
        const accumulatedUpdate$: Stream<UpdateOrder> = accumulateUpdates(
            dragStart,
            updateOrder$
        );
        const sortEnd$: Stream<UpdateOrder> = dnd.dragEnd
            .compose(sampleCombine(accumulatedUpdate$))
            .map(([_, x]) => x);

        return {
            ...sinks,
            ...mapValues(dnd, adapt),
            DOM: adapt(vdom$),
            updateLive: adapt(updateOrder$),
            updateDone: adapt(sortEnd$)
        };
    };
}

const merge = (a, c) => ({ ...a, ...c });
const mergeIndices = (acc, curr) => k => ({
    [k]: curr.indexMap[acc.indexMap[k]]
});
const initialOrderUpdate = {
    indexMap: undefined,
    oldIndex: -1,
    newIndex: -1
};
const mergeOrderUpdate = (acc, curr) => ({
    indexMap: updateIndexMap(acc, curr),
    oldIndex: acc.oldIndex === -1 ? curr.oldIndex : acc.oldIndex,
    newIndex: curr.newIndex
});
const updateIndexMap = (acc, curr) =>
    acc.indexMap
        ? Object.keys(acc.indexMap)
              .map(mergeIndices(acc, curr))
              .reduce(merge, {})
        : curr.indexMap;
function accumulateUpdates(dragStart$, updateOrder$) {
    return dragStart$
        .map(
            () =>
                updateOrder$
                    .fold(mergeOrderUpdate, initialOrderUpdate)
                    .drop(1) as Stream<UpdateOrder>
        )
        .flatten();
}
