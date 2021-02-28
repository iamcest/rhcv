/**
 * A doubly linked list-based Least Recently Used (LRU) cache. Will keep most
 * recently used items while discarding least recently used items when its limit
 * is reached.
 *
 * Licensed under MIT. Copyright (c) 2010 Rasmus Andersson <http://hunch.se/>
 * See README.md for details.
 *
 * Illustration of the design:
 *
 *       entry             entry             entry             entry
 *       ______            ______            ______            ______
 *      | head |.newer => |      |.newer => |      |.newer => | tail |
 *      |  A   |          |  B   |          |  C   |          |  D   |
 *      |______| <= older.|______| <= older.|______| <= older.|______|
 *
 *  removed  <--  <--  <--  <--  <--  <--  <--  <--  <--  <--  <--  added
 */
export declare class Entry {
    key: any;
    value: any;
    NEWER: any;
    OLDER: any;
    constructor(key: any, value: any);
}
export declare class LRUMap {
    private limit;
    size: number;
    newest: any;
    oldest: any;
    _keymap: Map<any, any>;
    constructor(limit: any, entries?: any);
    _markEntryAsUsed(entry: any): void;
    assign(entries: any): void;
    get(key: any): any;
    set(key: any, value: any): this;
    shift(): any[];
}
