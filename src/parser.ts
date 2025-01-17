/**
 * Regex for matching and capturing a component.
 * The first capture group is the amount of times to repeat the component.
 * The second capture group is the name of the component.
 */
export const COMPONENT_TAG = /<@(?:(\d+):)?([a-zA-Z][\w_-]*(?:\/[a-zA-Z][\w_-]*)*)@>/;

export function parse() {}
