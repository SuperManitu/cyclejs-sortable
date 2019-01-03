export const textSelectionClasses = [
    '-webkit-touch-callout',
    '-webkit-user-select',
    '-khtml-user-select',
    '-moz-user-select',
    '-ms-user-select',
    'user-select'
];

export function getArea(item: Element): number {
    const rect = item.getBoundingClientRect();
    return rect.width * rect.height;
}

export function getIntersectionArea(rectA: any, rectB: any): number {
    let a =
        Math.min(rectA.right, rectB.right) - Math.max(rectA.left, rectB.left);
    a = Math.max(0, a);
    const area =
        a *
        (Math.min(rectA.bottom, rectB.bottom) - Math.max(rectA.top, rectB.top));
    return area < 0 ? 0 : area;
}

const getBox = ({ left, right, bottom, top }) => ({ left, right, bottom, top });
export function getIntersection(
    ghost: Element,
    elm: Element,
    upper: boolean
): number {
    const fuzzFactor = 0.25;
    const a = getBox((upper ? ghost : elm).getBoundingClientRect());
    const b = getBox((upper ? elm : ghost).getBoundingClientRect());

    const aRight = { ...a, left: a.right - (a.right - a.left) * fuzzFactor };
    const aBottom = { ...a, top: a.bottom - (a.bottom - a.top) * fuzzFactor };

    const bLeft = { ...b, right: b.left + (b.right - b.left) * fuzzFactor };
    const bTop = { ...b, bottom: b.top + (b.bottom - b.top) * fuzzFactor };

    const area =
        getIntersectionArea(aRight, bLeft) + getIntersectionArea(aBottom, bTop);
    return area < 0 ? 0 : area;
}
