import xs, { Stream } from 'xstream';
import delay from 'xstream/extra/delay';
import sampleCombine from 'xstream/extra/sampleCombine';
import throttle from 'xstream/extra/throttle';
import { DOMSource, VNode } from '@cycle/dom';
import { adapt } from '@cycle/run/lib/adapt';

import { addKeys } from './helpers';
import { handleEvent } from './eventHandler';

export type Component<So, Si> = (s: So) => Si;
export interface DragAndDropOptions {
    itemSelector: string;
    handle?: string;
    DOMDriverKey?: string;
    selectionDelay?: number;
}
export interface DragAndDropSinks {
    dragging: Stream<boolean>;
    dragMove: Stream<MouseEvent>;
    dragStart: Stream<MouseEvent>;
    dragEnd: Stream<MouseEvent>;
}

const defaultOptions = {
    type: undefined,
    // props: current component's props
    // monitor: dragState
    // component: instance of current component
    spec: undefined, // dragStart(props, monitor, component), dragEnd, canDrag, isDragging(props, monitor)
    collect: undefined,
    options: undefined
};

export function makeDragAndDrop<Sources extends object, Sinks extends object>(
    options: DragAndDropOptions
): Component<Sources, DragAndDropSinks> {
    return function(sources: Sources): DragAndDropSinks {
        if (!options.DOMDriverKey) {
            options.DOMDriverKey = 'DOM';
        }
        const down$: Stream<MouseEvent> = getMouseStream(
            sources[options.DOMDriverKey],
            ['mousedown', 'touchstart'],
            options.handle || options.itemSelector
        );
        const up$: Stream<MouseEvent> = getMouseStream(
            sources[options.DOMDriverKey],
            ['mouseleave', 'mouseup', 'touchend'],
            'body'
        );
        const move$: Stream<MouseEvent> = getMouseStream(
            sources[options.DOMDriverKey],
            ['mousemove', 'touchmove'],
            'body'
        );

        const dragStart$: Stream<MouseEvent> = down$
            .map(ev =>
                xs
                    .of(ev)
                    .compose<Stream<MouseEvent>>(delay(options.selectionDelay))
                    .endWhen(xs.merge(up$, move$))
            )
            .flatten();
        const dragEnd$: Stream<MouseEvent> = dragStart$
            .map(_ => up$.take(1))
            .flatten();
        const dragMove$: Stream<MouseEvent> = dragStart$
            .map(start => move$.endWhen(dragEnd$))
            .flatten();
        const dragInProgress$ = xs
            .merge(dragStart$, dragEnd$)
            .fold(acc => !acc, false);

        return {
            dragMove: dragMove$,
            dragging: dragInProgress$,
            dragEnd: dragEnd$,
            dragStart: dragStart$
        };
    };
}

function getMouseStream(
    DOM: DOMSource,
    eventTypes: string[],
    handle: string
): Stream<MouseEvent> {
    return xs.merge(
        ...eventTypes
            .slice(0, -1)
            .map(ev => xs.fromObservable(DOM.select(handle).events(ev))),
        xs
            .fromObservable(
                DOM.select(handle).events(eventTypes[eventTypes.length - 1])
            )
            .map(augmentEvent)
    ) as Stream<MouseEvent>;
}

function augmentEvent(ev: any): MouseEvent {
    const touch: any = ev.touches[0];
    ev.clientX = touch.clientX;
    ev.clientY = touch.clientY;
    return ev;
}
