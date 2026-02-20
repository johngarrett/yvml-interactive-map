/**
 * get element by ID or class
 *
 * @throws if not found
 */
export const getElementOrThrow = <T extends HTMLElement>(
    element: { id: string } | { class: string },
): T => {
    if ("id" in element) {
        const foundElement = document.getElementById(element.id);
        if (!foundElement) {
            throw Error("Element not found by id: " + element.id);
        }
        return foundElement as T;
    } else {
        const foundElement = document.getElementById(element.class);
        if (!foundElement) {
            throw Error("Element not found by class: " + element.class);
        }
        return foundElement as T;
    }
};
