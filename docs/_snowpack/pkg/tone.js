import { a as audioContextConstructor, b as audioWorkletNodeConstructor, o as offlineAudioContextConstructor, i as isAnyAudioContext, c as isAnyOfflineAudioContext, d as isAnyAudioParam, e as isAnyAudioNode } from './common/module-a96de482.js';
export { f as supported } from './common/module-a96de482.js';
import './common/create-set-target-automation-event-d5a74c30.js';

const version = "14.7.77";

/**
 * Assert that the statement is true, otherwise invoke the error.
 * @param statement
 * @param error The message which is passed into an Error
 */
function assert(statement, error) {
    if (!statement) {
        throw new Error(error);
    }
}
/**
 * Make sure that the given value is within the range
 */
function assertRange(value, gte, lte = Infinity) {
    if (!(gte <= value && value <= lte)) {
        throw new RangeError(`Value must be within [${gte}, ${lte}], got: ${value}`);
    }
}
/**
 * Make sure that the given value is within the range
 */
function assertContextRunning(context) {
    // add a warning if the context is not started
    if (!context.isOffline && context.state !== "running") {
        warn("The AudioContext is \"suspended\". Invoke Tone.start() from a user action to start the audio.");
    }
}
/**
 * The default logger is the console
 */
let defaultLogger = console;
/**
 * Set the logging interface
 */
function setLogger(logger) {
    defaultLogger = logger;
}
/**
 * Log anything
 */
function log(...args) {
    defaultLogger.log(...args);
}
/**
 * Warn anything
 */
function warn(...args) {
    defaultLogger.warn(...args);
}

var Debug = /*#__PURE__*/Object.freeze({
    __proto__: null,
    assert: assert,
    assertRange: assertRange,
    assertContextRunning: assertContextRunning,
    setLogger: setLogger,
    log: log,
    warn: warn
});

/**
 * Test if the arg is undefined
 */
function isUndef(arg) {
    return typeof arg === "undefined";
}
/**
 * Test if the arg is not undefined
 */
function isDefined(arg) {
    return !isUndef(arg);
}
/**
 * Test if the arg is a function
 */
function isFunction(arg) {
    return typeof arg === "function";
}
/**
 * Test if the argument is a number.
 */
function isNumber(arg) {
    return (typeof arg === "number");
}
/**
 * Test if the given argument is an object literal (i.e. `{}`);
 */
function isObject(arg) {
    return (Object.prototype.toString.call(arg) === "[object Object]" && arg.constructor === Object);
}
/**
 * Test if the argument is a boolean.
 */
function isBoolean(arg) {
    return (typeof arg === "boolean");
}
/**
 * Test if the argument is an Array
 */
function isArray(arg) {
    return (Array.isArray(arg));
}
/**
 * Test if the argument is a string.
 */
function isString(arg) {
    return (typeof arg === "string");
}
/**
 * Test if the argument is in the form of a note in scientific pitch notation.
 * e.g. "C4"
 */
function isNote(arg) {
    return isString(arg) && /^([a-g]{1}(?:b|#|x|bb)?)(-?[0-9]+)/i.test(arg);
}

/**
 * Create a new AudioContext
 */
function createAudioContext(options) {
    return new audioContextConstructor(options);
}
/**
 * Create a new OfflineAudioContext
 */
function createOfflineAudioContext(channels, length, sampleRate) {
    return new offlineAudioContextConstructor(channels, length, sampleRate);
}
/**
 * A reference to the window object
 * @hidden
 */
const theWindow = typeof self === "object" ? self : null;
/**
 * If the browser has a window object which has an AudioContext
 * @hidden
 */
const hasAudioContext = theWindow &&
    (theWindow.hasOwnProperty("AudioContext") || theWindow.hasOwnProperty("webkitAudioContext"));
function createAudioWorkletNode(context, name, options) {
    assert(isDefined(audioWorkletNodeConstructor), "This node only works in a secure context (https or localhost)");
    // @ts-ignore
    return new audioWorkletNodeConstructor(context, name, options);
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

/**
 * A class which provides a reliable callback using either
 * a Web Worker, or if that isn't supported, falls back to setTimeout.
 */
class Ticker {
    constructor(callback, type, updateInterval) {
        this._callback = callback;
        this._type = type;
        this._updateInterval = updateInterval;
        // create the clock source for the first time
        this._createClock();
    }
    /**
     * Generate a web worker
     */
    _createWorker() {
        const blob = new Blob([
            /* javascript */ `
			// the initial timeout time
			let timeoutTime =  ${(this._updateInterval * 1000).toFixed(1)};
			// onmessage callback
			self.onmessage = function(msg){
				timeoutTime = parseInt(msg.data);
			};
			// the tick function which posts a message
			// and schedules a new tick
			function tick(){
				setTimeout(tick, timeoutTime);
				self.postMessage('tick');
			}
			// call tick initially
			tick();
			`
        ], { type: "text/javascript" });
        const blobUrl = URL.createObjectURL(blob);
        const worker = new Worker(blobUrl);
        worker.onmessage = this._callback.bind(this);
        this._worker = worker;
    }
    /**
     * Create a timeout loop
     */
    _createTimeout() {
        this._timeout = setTimeout(() => {
            this._createTimeout();
            this._callback();
        }, this._updateInterval * 1000);
    }
    /**
     * Create the clock source.
     */
    _createClock() {
        if (this._type === "worker") {
            try {
                this._createWorker();
            }
            catch (e) {
                // workers not supported, fallback to timeout
                this._type = "timeout";
                this._createClock();
            }
        }
        else if (this._type === "timeout") {
            this._createTimeout();
        }
    }
    /**
     * Clean up the current clock source
     */
    _disposeClock() {
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = 0;
        }
        if (this._worker) {
            this._worker.terminate();
            this._worker.onmessage = null;
        }
    }
    /**
     * The rate in seconds the ticker will update
     */
    get updateInterval() {
        return this._updateInterval;
    }
    set updateInterval(interval) {
        this._updateInterval = Math.max(interval, 128 / 44100);
        if (this._type === "worker") {
            this._worker.postMessage(Math.max(interval * 1000, 1));
        }
    }
    /**
     * The type of the ticker, either a worker or a timeout
     */
    get type() {
        return this._type;
    }
    set type(type) {
        this._disposeClock();
        this._type = type;
        this._createClock();
    }
    /**
     * Clean up
     */
    dispose() {
        this._disposeClock();
    }
}

/**
 * Test if the given value is an instanceof AudioParam
 */
function isAudioParam(arg) {
    return isAnyAudioParam(arg);
}
/**
 * Test if the given value is an instanceof AudioNode
 */
function isAudioNode(arg) {
    return isAnyAudioNode(arg);
}
/**
 * Test if the arg is instanceof an OfflineAudioContext
 */
function isOfflineAudioContext(arg) {
    return isAnyOfflineAudioContext(arg);
}
/**
 * Test if the arg is an instanceof AudioContext
 */
function isAudioContext(arg) {
    return isAnyAudioContext(arg);
}
/**
 * Test if the arg is instanceof an AudioBuffer
 */
function isAudioBuffer(arg) {
    return arg instanceof AudioBuffer;
}

/**
 * Some objects should not be merged
 */
function noCopy(key, arg) {
    return key === "value" || isAudioParam(arg) || isAudioNode(arg) || isAudioBuffer(arg);
}
function deepMerge(target, ...sources) {
    if (!sources.length) {
        return target;
    }
    const source = sources.shift();
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (noCopy(key, source[key])) {
                target[key] = source[key];
            }
            else if (isObject(source[key])) {
                if (!target[key]) {
                    Object.assign(target, { [key]: {} });
                }
                deepMerge(target[key], source[key]);
            }
            else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    // @ts-ignore
    return deepMerge(target, ...sources);
}
/**
 * Returns true if the two arrays have the same value for each of the elements
 */
function deepEquals(arrayA, arrayB) {
    return arrayA.length === arrayB.length && arrayA.every((element, index) => arrayB[index] === element);
}
/**
 * Convert an args array into an object.
 */
function optionsFromArguments(defaults, argsArray, keys = [], objKey) {
    const opts = {};
    const args = Array.from(argsArray);
    // if the first argument is an object and has an object key
    if (isObject(args[0]) && objKey && !Reflect.has(args[0], objKey)) {
        // if it's not part of the defaults
        const partOfDefaults = Object.keys(args[0]).some(key => Reflect.has(defaults, key));
        if (!partOfDefaults) {
            // merge that key
            deepMerge(opts, { [objKey]: args[0] });
            // remove the obj key from the keys
            keys.splice(keys.indexOf(objKey), 1);
            // shift the first argument off
            args.shift();
        }
    }
    if (args.length === 1 && isObject(args[0])) {
        deepMerge(opts, args[0]);
    }
    else {
        for (let i = 0; i < keys.length; i++) {
            if (isDefined(args[i])) {
                opts[keys[i]] = args[i];
            }
        }
    }
    return deepMerge(defaults, opts);
}
/**
 * Return this instances default values by calling Constructor.getDefaults()
 */
function getDefaultsFromInstance(instance) {
    return instance.constructor.getDefaults();
}
/**
 * Returns the fallback if the given object is undefined.
 * Take an array of arguments and return a formatted options object.
 */
function defaultArg(given, fallback) {
    if (isUndef(given)) {
        return fallback;
    }
    else {
        return given;
    }
}
/**
 * Remove all of the properties belonging to omit from obj.
 */
function omitFromObject(obj, omit) {
    omit.forEach(prop => {
        if (Reflect.has(obj, prop)) {
            delete obj[prop];
        }
    });
    return obj;
}

/**
 * Tone.js
 * @author Yotam Mann
 * @license http://opensource.org/licenses/MIT MIT License
 * @copyright 2014-2019 Yotam Mann
 */
/**
 * @class  Tone is the base class of all other classes.
 * @category Core
 * @constructor
 */
class Tone {
    constructor() {
        //-------------------------------------
        // 	DEBUGGING
        //-------------------------------------
        /**
         * Set this debug flag to log all events that happen in this class.
         */
        this.debug = false;
        //-------------------------------------
        // 	DISPOSING
        //-------------------------------------
        /**
         * Indicates if the instance was disposed
         */
        this._wasDisposed = false;
    }
    /**
     * Returns all of the default options belonging to the class.
     */
    static getDefaults() {
        return {};
    }
    /**
     * Prints the outputs to the console log for debugging purposes.
     * Prints the contents only if either the object has a property
     * called `debug` set to true, or a variable called TONE_DEBUG_CLASS
     * is set to the name of the class.
     * @example
     * const osc = new Tone.Oscillator();
     * // prints all logs originating from this oscillator
     * osc.debug = true;
     * // calls to start/stop will print in the console
     * osc.start();
     */
    log(...args) {
        // if the object is either set to debug = true
        // or if there is a string on the Tone.global.with the class name
        if (this.debug || (theWindow && this.toString() === theWindow.TONE_DEBUG_CLASS)) {
            log(this, ...args);
        }
    }
    /**
     * disconnect and dispose.
     */
    dispose() {
        this._wasDisposed = true;
        return this;
    }
    /**
     * Indicates if the instance was disposed. 'Disposing' an
     * instance means that all of the Web Audio nodes that were
     * created for the instance are disconnected and freed for garbage collection.
     */
    get disposed() {
        return this._wasDisposed;
    }
    /**
     * Convert the class to a string
     * @example
     * const osc = new Tone.Oscillator();
     * console.log(osc.toString());
     */
    toString() {
        return this.name;
    }
}
/**
 * The version number semver
 */
Tone.version = version;

/**
 * The threshold for correctness for operators. Less than one sample even
 * at very high sampling rates (e.g. `1e-6 < 1 / 192000`).
 */
const EPSILON = 1e-6;
/**
 * Test if A is greater than B
 */
function GT(a, b) {
    return a > b + EPSILON;
}
/**
 * Test if A is greater than or equal to B
 */
function GTE(a, b) {
    return GT(a, b) || EQ(a, b);
}
/**
 * Test if A is less than B
 */
function LT(a, b) {
    return a + EPSILON < b;
}
/**
 * Test if A is less than B
 */
function EQ(a, b) {
    return Math.abs(a - b) < EPSILON;
}
/**
 * Clamp the value within the given range
 */
function clamp(value, min, max) {
    return Math.max(Math.min(value, max), min);
}

/**
 * A Timeline class for scheduling and maintaining state
 * along a timeline. All events must have a "time" property.
 * Internally, events are stored in time order for fast
 * retrieval.
 */
class Timeline extends Tone {
    constructor() {
        super();
        this.name = "Timeline";
        /**
         * The array of scheduled timeline events
         */
        this._timeline = [];
        const options = optionsFromArguments(Timeline.getDefaults(), arguments, ["memory"]);
        this.memory = options.memory;
        this.increasing = options.increasing;
    }
    static getDefaults() {
        return {
            memory: Infinity,
            increasing: false,
        };
    }
    /**
     * The number of items in the timeline.
     */
    get length() {
        return this._timeline.length;
    }
    /**
     * Insert an event object onto the timeline. Events must have a "time" attribute.
     * @param event  The event object to insert into the timeline.
     */
    add(event) {
        // the event needs to have a time attribute
        assert(Reflect.has(event, "time"), "Timeline: events must have a time attribute");
        event.time = event.time.valueOf();
        if (this.increasing && this.length) {
            const lastValue = this._timeline[this.length - 1];
            assert(GTE(event.time, lastValue.time), "The time must be greater than or equal to the last scheduled time");
            this._timeline.push(event);
        }
        else {
            const index = this._search(event.time);
            this._timeline.splice(index + 1, 0, event);
        }
        // if the length is more than the memory, remove the previous ones
        if (this.length > this.memory) {
            const diff = this.length - this.memory;
            this._timeline.splice(0, diff);
        }
        return this;
    }
    /**
     * Remove an event from the timeline.
     * @param  {Object}  event  The event object to remove from the list.
     * @returns {Timeline} this
     */
    remove(event) {
        const index = this._timeline.indexOf(event);
        if (index !== -1) {
            this._timeline.splice(index, 1);
        }
        return this;
    }
    /**
     * Get the nearest event whose time is less than or equal to the given time.
     * @param  time  The time to query.
     */
    get(time, param = "time") {
        const index = this._search(time, param);
        if (index !== -1) {
            return this._timeline[index];
        }
        else {
            return null;
        }
    }
    /**
     * Return the first event in the timeline without removing it
     * @returns {Object} The first event object
     */
    peek() {
        return this._timeline[0];
    }
    /**
     * Return the first event in the timeline and remove it
     */
    shift() {
        return this._timeline.shift();
    }
    /**
     * Get the event which is scheduled after the given time.
     * @param  time  The time to query.
     */
    getAfter(time, param = "time") {
        const index = this._search(time, param);
        if (index + 1 < this._timeline.length) {
            return this._timeline[index + 1];
        }
        else {
            return null;
        }
    }
    /**
     * Get the event before the event at the given time.
     * @param  time  The time to query.
     */
    getBefore(time) {
        const len = this._timeline.length;
        // if it's after the last item, return the last item
        if (len > 0 && this._timeline[len - 1].time < time) {
            return this._timeline[len - 1];
        }
        const index = this._search(time);
        if (index - 1 >= 0) {
            return this._timeline[index - 1];
        }
        else {
            return null;
        }
    }
    /**
     * Cancel events at and after the given time
     * @param  after  The time to query.
     */
    cancel(after) {
        if (this._timeline.length > 1) {
            let index = this._search(after);
            if (index >= 0) {
                if (EQ(this._timeline[index].time, after)) {
                    // get the first item with that time
                    for (let i = index; i >= 0; i--) {
                        if (EQ(this._timeline[i].time, after)) {
                            index = i;
                        }
                        else {
                            break;
                        }
                    }
                    this._timeline = this._timeline.slice(0, index);
                }
                else {
                    this._timeline = this._timeline.slice(0, index + 1);
                }
            }
            else {
                this._timeline = [];
            }
        }
        else if (this._timeline.length === 1) {
            // the first item's time
            if (GTE(this._timeline[0].time, after)) {
                this._timeline = [];
            }
        }
        return this;
    }
    /**
     * Cancel events before or equal to the given time.
     * @param  time  The time to cancel before.
     */
    cancelBefore(time) {
        const index = this._search(time);
        if (index >= 0) {
            this._timeline = this._timeline.slice(index + 1);
        }
        return this;
    }
    /**
     * Returns the previous event if there is one. null otherwise
     * @param  event The event to find the previous one of
     * @return The event right before the given event
     */
    previousEvent(event) {
        const index = this._timeline.indexOf(event);
        if (index > 0) {
            return this._timeline[index - 1];
        }
        else {
            return null;
        }
    }
    /**
     * Does a binary search on the timeline array and returns the
     * nearest event index whose time is after or equal to the given time.
     * If a time is searched before the first index in the timeline, -1 is returned.
     * If the time is after the end, the index of the last item is returned.
     */
    _search(time, param = "time") {
        if (this._timeline.length === 0) {
            return -1;
        }
        let beginning = 0;
        const len = this._timeline.length;
        let end = len;
        if (len > 0 && this._timeline[len - 1][param] <= time) {
            return len - 1;
        }
        while (beginning < end) {
            // calculate the midpoint for roughly equal partition
            let midPoint = Math.floor(beginning + (end - beginning) / 2);
            const event = this._timeline[midPoint];
            const nextEvent = this._timeline[midPoint + 1];
            if (EQ(event[param], time)) {
                // choose the last one that has the same time
                for (let i = midPoint; i < this._timeline.length; i++) {
                    const testEvent = this._timeline[i];
                    if (EQ(testEvent[param], time)) {
                        midPoint = i;
                    }
                    else {
                        break;
                    }
                }
                return midPoint;
            }
            else if (LT(event[param], time) && GT(nextEvent[param], time)) {
                return midPoint;
            }
            else if (GT(event[param], time)) {
                // search lower
                end = midPoint;
            }
            else {
                // search upper
                beginning = midPoint + 1;
            }
        }
        return -1;
    }
    /**
     * Internal iterator. Applies extra safety checks for
     * removing items from the array.
     */
    _iterate(callback, lowerBound = 0, upperBound = this._timeline.length - 1) {
        this._timeline.slice(lowerBound, upperBound + 1).forEach(callback);
    }
    /**
     * Iterate over everything in the array
     * @param  callback The callback to invoke with every item
     */
    forEach(callback) {
        this._iterate(callback);
        return this;
    }
    /**
     * Iterate over everything in the array at or before the given time.
     * @param  time The time to check if items are before
     * @param  callback The callback to invoke with every item
     */
    forEachBefore(time, callback) {
        // iterate over the items in reverse so that removing an item doesn't break things
        const upperBound = this._search(time);
        if (upperBound !== -1) {
            this._iterate(callback, 0, upperBound);
        }
        return this;
    }
    /**
     * Iterate over everything in the array after the given time.
     * @param  time The time to check if items are before
     * @param  callback The callback to invoke with every item
     */
    forEachAfter(time, callback) {
        // iterate over the items in reverse so that removing an item doesn't break things
        const lowerBound = this._search(time);
        this._iterate(callback, lowerBound + 1);
        return this;
    }
    /**
     * Iterate over everything in the array between the startTime and endTime.
     * The timerange is inclusive of the startTime, but exclusive of the endTime.
     * range = [startTime, endTime).
     * @param  startTime The time to check if items are before
     * @param  endTime The end of the test interval.
     * @param  callback The callback to invoke with every item
     */
    forEachBetween(startTime, endTime, callback) {
        let lowerBound = this._search(startTime);
        let upperBound = this._search(endTime);
        if (lowerBound !== -1 && upperBound !== -1) {
            if (this._timeline[lowerBound].time !== startTime) {
                lowerBound += 1;
            }
            // exclusive of the end time
            if (this._timeline[upperBound].time === endTime) {
                upperBound -= 1;
            }
            this._iterate(callback, lowerBound, upperBound);
        }
        else if (lowerBound === -1) {
            this._iterate(callback, 0, upperBound);
        }
        return this;
    }
    /**
     * Iterate over everything in the array at or after the given time. Similar to
     * forEachAfter, but includes the item(s) at the given time.
     * @param  time The time to check if items are before
     * @param  callback The callback to invoke with every item
     */
    forEachFrom(time, callback) {
        // iterate over the items in reverse so that removing an item doesn't break things
        let lowerBound = this._search(time);
        // work backwards until the event time is less than time
        while (lowerBound >= 0 && this._timeline[lowerBound].time >= time) {
            lowerBound--;
        }
        this._iterate(callback, lowerBound + 1);
        return this;
    }
    /**
     * Iterate over everything in the array at the given time
     * @param  time The time to check if items are before
     * @param  callback The callback to invoke with every item
     */
    forEachAtTime(time, callback) {
        // iterate over the items in reverse so that removing an item doesn't break things
        const upperBound = this._search(time);
        if (upperBound !== -1 && EQ(this._timeline[upperBound].time, time)) {
            let lowerBound = upperBound;
            for (let i = upperBound; i >= 0; i--) {
                if (EQ(this._timeline[i].time, time)) {
                    lowerBound = i;
                }
                else {
                    break;
                }
            }
            this._iterate(event => {
                callback(event);
            }, lowerBound, upperBound);
        }
        return this;
    }
    /**
     * Clean up.
     */
    dispose() {
        super.dispose();
        this._timeline = [];
        return this;
    }
}

//-------------------------------------
// INITIALIZING NEW CONTEXT
//-------------------------------------
/**
 * Array of callbacks to invoke when a new context is created
 */
const notifyNewContext = [];
/**
 * Used internally to setup a new Context
 */
function onContextInit(cb) {
    notifyNewContext.push(cb);
}
/**
 * Invoke any classes which need to also be initialized when a new context is created.
 */
function initializeContext(ctx) {
    // add any additional modules
    notifyNewContext.forEach(cb => cb(ctx));
}
/**
 * Array of callbacks to invoke when a new context is created
 */
const notifyCloseContext = [];
/**
 * Used internally to tear down a Context
 */
function onContextClose(cb) {
    notifyCloseContext.push(cb);
}
function closeContext(ctx) {
    // add any additional modules
    notifyCloseContext.forEach(cb => cb(ctx));
}

/**
 * Emitter gives classes which extend it
 * the ability to listen for and emit events.
 * Inspiration and reference from Jerome Etienne's [MicroEvent](https://github.com/jeromeetienne/microevent.js).
 * MIT (c) 2011 Jerome Etienne.
 * @category Core
 */
class Emitter extends Tone {
    constructor() {
        super(...arguments);
        this.name = "Emitter";
    }
    /**
     * Bind a callback to a specific event.
     * @param  event     The name of the event to listen for.
     * @param  callback  The callback to invoke when the event is emitted
     */
    on(event, callback) {
        // split the event
        const events = event.split(/\W+/);
        events.forEach(eventName => {
            if (isUndef(this._events)) {
                this._events = {};
            }
            if (!this._events.hasOwnProperty(eventName)) {
                this._events[eventName] = [];
            }
            this._events[eventName].push(callback);
        });
        return this;
    }
    /**
     * Bind a callback which is only invoked once
     * @param  event     The name of the event to listen for.
     * @param  callback  The callback to invoke when the event is emitted
     */
    once(event, callback) {
        const boundCallback = (...args) => {
            // invoke the callback
            callback(...args);
            // remove the event
            this.off(event, boundCallback);
        };
        this.on(event, boundCallback);
        return this;
    }
    /**
     * Remove the event listener.
     * @param  event     The event to stop listening to.
     * @param  callback  The callback which was bound to the event with Emitter.on.
     *                   If no callback is given, all callbacks events are removed.
     */
    off(event, callback) {
        const events = event.split(/\W+/);
        events.forEach(eventName => {
            if (isUndef(this._events)) {
                this._events = {};
            }
            if (this._events.hasOwnProperty(event)) {
                if (isUndef(callback)) {
                    this._events[event] = [];
                }
                else {
                    const eventList = this._events[event];
                    for (let i = eventList.length - 1; i >= 0; i--) {
                        if (eventList[i] === callback) {
                            eventList.splice(i, 1);
                        }
                    }
                }
            }
        });
        return this;
    }
    /**
     * Invoke all of the callbacks bound to the event
     * with any arguments passed in.
     * @param  event  The name of the event.
     * @param args The arguments to pass to the functions listening.
     */
    emit(event, ...args) {
        if (this._events) {
            if (this._events.hasOwnProperty(event)) {
                const eventList = this._events[event].slice(0);
                for (let i = 0, len = eventList.length; i < len; i++) {
                    eventList[i].apply(this, args);
                }
            }
        }
        return this;
    }
    /**
     * Add Emitter functions (on/off/emit) to the object
     */
    static mixin(constr) {
        // instance._events = {};
        ["on", "once", "off", "emit"].forEach(name => {
            const property = Object.getOwnPropertyDescriptor(Emitter.prototype, name);
            Object.defineProperty(constr.prototype, name, property);
        });
    }
    /**
     * Clean up
     */
    dispose() {
        super.dispose();
        this._events = undefined;
        return this;
    }
}

class BaseContext extends Emitter {
    constructor() {
        super(...arguments);
        this.isOffline = false;
    }
    /*
     * This is a placeholder so that JSON.stringify does not throw an error
     * This matches what JSON.stringify(audioContext) returns on a native
     * audioContext instance.
     */
    toJSON() {
        return {};
    }
}

/**
 * Wrapper around the native AudioContext.
 * @category Core
 */
class Context extends BaseContext {
    constructor() {
        super();
        this.name = "Context";
        /**
         * An object containing all of the constants AudioBufferSourceNodes
         */
        this._constants = new Map();
        /**
         * All of the setTimeout events.
         */
        this._timeouts = new Timeline();
        /**
         * The timeout id counter
         */
        this._timeoutIds = 0;
        /**
         * Private indicator if the context has been initialized
         */
        this._initialized = false;
        /**
         * Indicates if the context is an OfflineAudioContext or an AudioContext
         */
        this.isOffline = false;
        //--------------------------------------------
        // AUDIO WORKLET
        //--------------------------------------------
        /**
         * Maps a module name to promise of the addModule method
         */
        this._workletModules = new Map();
        const options = optionsFromArguments(Context.getDefaults(), arguments, [
            "context",
        ]);
        if (options.context) {
            this._context = options.context;
        }
        else {
            this._context = createAudioContext({
                latencyHint: options.latencyHint,
            });
        }
        this._ticker = new Ticker(this.emit.bind(this, "tick"), options.clockSource, options.updateInterval);
        this.on("tick", this._timeoutLoop.bind(this));
        // fwd events from the context
        this._context.onstatechange = () => {
            this.emit("statechange", this.state);
        };
        this._setLatencyHint(options.latencyHint);
        this.lookAhead = options.lookAhead;
    }
    static getDefaults() {
        return {
            clockSource: "worker",
            latencyHint: "interactive",
            lookAhead: 0.1,
            updateInterval: 0.05,
        };
    }
    /**
     * Finish setting up the context. **You usually do not need to do this manually.**
     */
    initialize() {
        if (!this._initialized) {
            // add any additional modules
            initializeContext(this);
            this._initialized = true;
        }
        return this;
    }
    //---------------------------
    // BASE AUDIO CONTEXT METHODS
    //---------------------------
    createAnalyser() {
        return this._context.createAnalyser();
    }
    createOscillator() {
        return this._context.createOscillator();
    }
    createBufferSource() {
        return this._context.createBufferSource();
    }
    createBiquadFilter() {
        return this._context.createBiquadFilter();
    }
    createBuffer(numberOfChannels, length, sampleRate) {
        return this._context.createBuffer(numberOfChannels, length, sampleRate);
    }
    createChannelMerger(numberOfInputs) {
        return this._context.createChannelMerger(numberOfInputs);
    }
    createChannelSplitter(numberOfOutputs) {
        return this._context.createChannelSplitter(numberOfOutputs);
    }
    createConstantSource() {
        return this._context.createConstantSource();
    }
    createConvolver() {
        return this._context.createConvolver();
    }
    createDelay(maxDelayTime) {
        return this._context.createDelay(maxDelayTime);
    }
    createDynamicsCompressor() {
        return this._context.createDynamicsCompressor();
    }
    createGain() {
        return this._context.createGain();
    }
    createIIRFilter(feedForward, feedback) {
        // @ts-ignore
        return this._context.createIIRFilter(feedForward, feedback);
    }
    createPanner() {
        return this._context.createPanner();
    }
    createPeriodicWave(real, imag, constraints) {
        return this._context.createPeriodicWave(real, imag, constraints);
    }
    createStereoPanner() {
        return this._context.createStereoPanner();
    }
    createWaveShaper() {
        return this._context.createWaveShaper();
    }
    createMediaStreamSource(stream) {
        assert(isAudioContext(this._context), "Not available if OfflineAudioContext");
        const context = this._context;
        return context.createMediaStreamSource(stream);
    }
    createMediaElementSource(element) {
        assert(isAudioContext(this._context), "Not available if OfflineAudioContext");
        const context = this._context;
        return context.createMediaElementSource(element);
    }
    createMediaStreamDestination() {
        assert(isAudioContext(this._context), "Not available if OfflineAudioContext");
        const context = this._context;
        return context.createMediaStreamDestination();
    }
    decodeAudioData(audioData) {
        return this._context.decodeAudioData(audioData);
    }
    /**
     * The current time in seconds of the AudioContext.
     */
    get currentTime() {
        return this._context.currentTime;
    }
    /**
     * The current time in seconds of the AudioContext.
     */
    get state() {
        return this._context.state;
    }
    /**
     * The current time in seconds of the AudioContext.
     */
    get sampleRate() {
        return this._context.sampleRate;
    }
    /**
     * The listener
     */
    get listener() {
        this.initialize();
        return this._listener;
    }
    set listener(l) {
        assert(!this._initialized, "The listener cannot be set after initialization.");
        this._listener = l;
    }
    /**
     * There is only one Transport per Context. It is created on initialization.
     */
    get transport() {
        this.initialize();
        return this._transport;
    }
    set transport(t) {
        assert(!this._initialized, "The transport cannot be set after initialization.");
        this._transport = t;
    }
    /**
     * This is the Draw object for the context which is useful for synchronizing the draw frame with the Tone.js clock.
     */
    get draw() {
        this.initialize();
        return this._draw;
    }
    set draw(d) {
        assert(!this._initialized, "Draw cannot be set after initialization.");
        this._draw = d;
    }
    /**
     * A reference to the Context's destination node.
     */
    get destination() {
        this.initialize();
        return this._destination;
    }
    set destination(d) {
        assert(!this._initialized, "The destination cannot be set after initialization.");
        this._destination = d;
    }
    /**
     * Create an audio worklet node from a name and options. The module
     * must first be loaded using [[addAudioWorkletModule]].
     */
    createAudioWorkletNode(name, options) {
        return createAudioWorkletNode(this.rawContext, name, options);
    }
    /**
     * Add an AudioWorkletProcessor module
     * @param url The url of the module
     * @param name The name of the module
     */
    addAudioWorkletModule(url, name) {
        return __awaiter(this, void 0, void 0, function* () {
            assert(isDefined(this.rawContext.audioWorklet), "AudioWorkletNode is only available in a secure context (https or localhost)");
            if (!this._workletModules.has(name)) {
                this._workletModules.set(name, this.rawContext.audioWorklet.addModule(url));
            }
            yield this._workletModules.get(name);
        });
    }
    /**
     * Returns a promise which resolves when all of the worklets have been loaded on this context
     */
    workletsAreReady() {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            this._workletModules.forEach((promise) => promises.push(promise));
            yield Promise.all(promises);
        });
    }
    //---------------------------
    // TICKER
    //---------------------------
    /**
     * How often the interval callback is invoked.
     * This number corresponds to how responsive the scheduling
     * can be. context.updateInterval + context.lookAhead gives you the
     * total latency between scheduling an event and hearing it.
     */
    get updateInterval() {
        return this._ticker.updateInterval;
    }
    set updateInterval(interval) {
        this._ticker.updateInterval = interval;
    }
    /**
     * What the source of the clock is, either "worker" (default),
     * "timeout", or "offline" (none).
     */
    get clockSource() {
        return this._ticker.type;
    }
    set clockSource(type) {
        this._ticker.type = type;
    }
    /**
     * The type of playback, which affects tradeoffs between audio
     * output latency and responsiveness.
     * In addition to setting the value in seconds, the latencyHint also
     * accepts the strings "interactive" (prioritizes low latency),
     * "playback" (prioritizes sustained playback), "balanced" (balances
     * latency and performance).
     * @example
     * // prioritize sustained playback
     * const context = new Tone.Context({ latencyHint: "playback" });
     * // set this context as the global Context
     * Tone.setContext(context);
     * // the global context is gettable with Tone.getContext()
     * console.log(Tone.getContext().latencyHint);
     */
    get latencyHint() {
        return this._latencyHint;
    }
    /**
     * Update the lookAhead and updateInterval based on the latencyHint
     */
    _setLatencyHint(hint) {
        let lookAheadValue = 0;
        this._latencyHint = hint;
        if (isString(hint)) {
            switch (hint) {
                case "interactive":
                    lookAheadValue = 0.1;
                    break;
                case "playback":
                    lookAheadValue = 0.5;
                    break;
                case "balanced":
                    lookAheadValue = 0.25;
                    break;
            }
        }
        this.lookAhead = lookAheadValue;
        this.updateInterval = lookAheadValue / 2;
    }
    /**
     * The unwrapped AudioContext or OfflineAudioContext
     */
    get rawContext() {
        return this._context;
    }
    /**
     * The current audio context time plus a short [[lookAhead]].
     */
    now() {
        return this._context.currentTime + this.lookAhead;
    }
    /**
     * The current audio context time without the [[lookAhead]].
     * In most cases it is better to use [[now]] instead of [[immediate]] since
     * with [[now]] the [[lookAhead]] is applied equally to _all_ components including internal components,
     * to making sure that everything is scheduled in sync. Mixing [[now]] and [[immediate]]
     * can cause some timing issues. If no lookAhead is desired, you can set the [[lookAhead]] to `0`.
     */
    immediate() {
        return this._context.currentTime;
    }
    /**
     * Starts the audio context from a suspended state. This is required
     * to initially start the AudioContext. See [[Tone.start]]
     */
    resume() {
        if (isAudioContext(this._context)) {
            return this._context.resume();
        }
        else {
            return Promise.resolve();
        }
    }
    /**
     * Close the context. Once closed, the context can no longer be used and
     * any AudioNodes created from the context will be silent.
     */
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (isAudioContext(this._context)) {
                yield this._context.close();
            }
            if (this._initialized) {
                closeContext(this);
            }
        });
    }
    /**
     * **Internal** Generate a looped buffer at some constant value.
     */
    getConstant(val) {
        if (this._constants.has(val)) {
            return this._constants.get(val);
        }
        else {
            const buffer = this._context.createBuffer(1, 128, this._context.sampleRate);
            const arr = buffer.getChannelData(0);
            for (let i = 0; i < arr.length; i++) {
                arr[i] = val;
            }
            const constant = this._context.createBufferSource();
            constant.channelCount = 1;
            constant.channelCountMode = "explicit";
            constant.buffer = buffer;
            constant.loop = true;
            constant.start(0);
            this._constants.set(val, constant);
            return constant;
        }
    }
    /**
     * Clean up. Also closes the audio context.
     */
    dispose() {
        super.dispose();
        this._ticker.dispose();
        this._timeouts.dispose();
        Object.keys(this._constants).map((val) => this._constants[val].disconnect());
        return this;
    }
    //---------------------------
    // TIMEOUTS
    //---------------------------
    /**
     * The private loop which keeps track of the context scheduled timeouts
     * Is invoked from the clock source
     */
    _timeoutLoop() {
        const now = this.now();
        let firstEvent = this._timeouts.peek();
        while (this._timeouts.length && firstEvent && firstEvent.time <= now) {
            // invoke the callback
            firstEvent.callback();
            // shift the first event off
            this._timeouts.shift();
            // get the next one
            firstEvent = this._timeouts.peek();
        }
    }
    /**
     * A setTimeout which is guaranteed by the clock source.
     * Also runs in the offline context.
     * @param  fn       The callback to invoke
     * @param  timeout  The timeout in seconds
     * @returns ID to use when invoking Context.clearTimeout
     */
    setTimeout(fn, timeout) {
        this._timeoutIds++;
        const now = this.now();
        this._timeouts.add({
            callback: fn,
            id: this._timeoutIds,
            time: now + timeout,
        });
        return this._timeoutIds;
    }
    /**
     * Clears a previously scheduled timeout with Tone.context.setTimeout
     * @param  id  The ID returned from setTimeout
     */
    clearTimeout(id) {
        this._timeouts.forEach((event) => {
            if (event.id === id) {
                this._timeouts.remove(event);
            }
        });
        return this;
    }
    /**
     * Clear the function scheduled by [[setInterval]]
     */
    clearInterval(id) {
        return this.clearTimeout(id);
    }
    /**
     * Adds a repeating event to the context's callback clock
     */
    setInterval(fn, interval) {
        const id = ++this._timeoutIds;
        const intervalFn = () => {
            const now = this.now();
            this._timeouts.add({
                callback: () => {
                    // invoke the callback
                    fn();
                    // invoke the event to repeat it
                    intervalFn();
                },
                id,
                time: now + interval,
            });
        };
        // kick it off
        intervalFn();
        return id;
    }
}

class DummyContext extends BaseContext {
    constructor() {
        super(...arguments);
        this.lookAhead = 0;
        this.latencyHint = 0;
        this.isOffline = false;
    }
    //---------------------------
    // BASE AUDIO CONTEXT METHODS
    //---------------------------
    createAnalyser() {
        return {};
    }
    createOscillator() {
        return {};
    }
    createBufferSource() {
        return {};
    }
    createBiquadFilter() {
        return {};
    }
    createBuffer(_numberOfChannels, _length, _sampleRate) {
        return {};
    }
    createChannelMerger(_numberOfInputs) {
        return {};
    }
    createChannelSplitter(_numberOfOutputs) {
        return {};
    }
    createConstantSource() {
        return {};
    }
    createConvolver() {
        return {};
    }
    createDelay(_maxDelayTime) {
        return {};
    }
    createDynamicsCompressor() {
        return {};
    }
    createGain() {
        return {};
    }
    createIIRFilter(_feedForward, _feedback) {
        return {};
    }
    createPanner() {
        return {};
    }
    createPeriodicWave(_real, _imag, _constraints) {
        return {};
    }
    createStereoPanner() {
        return {};
    }
    createWaveShaper() {
        return {};
    }
    createMediaStreamSource(_stream) {
        return {};
    }
    createMediaElementSource(_element) {
        return {};
    }
    createMediaStreamDestination() {
        return {};
    }
    decodeAudioData(_audioData) {
        return Promise.resolve({});
    }
    //---------------------------
    // TONE AUDIO CONTEXT METHODS
    //---------------------------
    createAudioWorkletNode(_name, _options) {
        return {};
    }
    get rawContext() {
        return {};
    }
    addAudioWorkletModule(_url, _name) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve();
        });
    }
    resume() {
        return Promise.resolve();
    }
    setTimeout(_fn, _timeout) {
        return 0;
    }
    clearTimeout(_id) {
        return this;
    }
    setInterval(_fn, _interval) {
        return 0;
    }
    clearInterval(_id) {
        return this;
    }
    getConstant(_val) {
        return {};
    }
    get currentTime() {
        return 0;
    }
    get state() {
        return {};
    }
    get sampleRate() {
        return 0;
    }
    get listener() {
        return {};
    }
    get transport() {
        return {};
    }
    get draw() {
        return {};
    }
    set draw(_d) { }
    get destination() {
        return {};
    }
    set destination(_d) { }
    now() {
        return 0;
    }
    immediate() {
        return 0;
    }
}

/**
 * Make the property not writable using `defineProperty`. Internal use only.
 */
function readOnly(target, property) {
    if (isArray(property)) {
        property.forEach(str => readOnly(target, str));
    }
    else {
        Object.defineProperty(target, property, {
            enumerable: true,
            writable: false,
        });
    }
}
/**
 * Make an attribute writeable. Internal use only.
 */
function writable(target, property) {
    if (isArray(property)) {
        property.forEach(str => writable(target, str));
    }
    else {
        Object.defineProperty(target, property, {
            writable: true,
        });
    }
}
const noOp = () => {
    // no operation here!
};

/**
 * AudioBuffer loading and storage. ToneAudioBuffer is used internally by all
 * classes that make requests for audio files such as Tone.Player,
 * Tone.Sampler and Tone.Convolver.
 * @example
 * const buffer = new Tone.ToneAudioBuffer("https://tonejs.github.io/audio/casio/A1.mp3", () => {
 * 	console.log("loaded");
 * });
 * @category Core
 */
class ToneAudioBuffer extends Tone {
    constructor() {
        super();
        this.name = "ToneAudioBuffer";
        /**
         * Callback when the buffer is loaded.
         */
        this.onload = noOp;
        const options = optionsFromArguments(ToneAudioBuffer.getDefaults(), arguments, ["url", "onload", "onerror"]);
        this.reverse = options.reverse;
        this.onload = options.onload;
        if (options.url && isAudioBuffer(options.url) || options.url instanceof ToneAudioBuffer) {
            this.set(options.url);
        }
        else if (isString(options.url)) {
            // initiate the download
            this.load(options.url).catch(options.onerror);
        }
    }
    static getDefaults() {
        return {
            onerror: noOp,
            onload: noOp,
            reverse: false,
        };
    }
    /**
     * The sample rate of the AudioBuffer
     */
    get sampleRate() {
        if (this._buffer) {
            return this._buffer.sampleRate;
        }
        else {
            return getContext().sampleRate;
        }
    }
    /**
     * Pass in an AudioBuffer or ToneAudioBuffer to set the value of this buffer.
     */
    set(buffer) {
        if (buffer instanceof ToneAudioBuffer) {
            // if it's loaded, set it
            if (buffer.loaded) {
                this._buffer = buffer.get();
            }
            else {
                // otherwise when it's loaded, invoke it's callback
                buffer.onload = () => {
                    this.set(buffer);
                    this.onload(this);
                };
            }
        }
        else {
            this._buffer = buffer;
        }
        // reverse it initially
        if (this._reversed) {
            this._reverse();
        }
        return this;
    }
    /**
     * The audio buffer stored in the object.
     */
    get() {
        return this._buffer;
    }
    /**
     * Makes an fetch request for the selected url then decodes the file as an audio buffer.
     * Invokes the callback once the audio buffer loads.
     * @param url The url of the buffer to load. filetype support depends on the browser.
     * @returns A Promise which resolves with this ToneAudioBuffer
     */
    load(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const doneLoading = ToneAudioBuffer.load(url).then(audioBuffer => {
                this.set(audioBuffer);
                // invoke the onload method
                this.onload(this);
            });
            ToneAudioBuffer.downloads.push(doneLoading);
            try {
                yield doneLoading;
            }
            finally {
                // remove the downloaded file
                const index = ToneAudioBuffer.downloads.indexOf(doneLoading);
                ToneAudioBuffer.downloads.splice(index, 1);
            }
            return this;
        });
    }
    /**
     * clean up
     */
    dispose() {
        super.dispose();
        this._buffer = undefined;
        return this;
    }
    /**
     * Set the audio buffer from the array.
     * To create a multichannel AudioBuffer, pass in a multidimensional array.
     * @param array The array to fill the audio buffer
     */
    fromArray(array) {
        const isMultidimensional = isArray(array) && array[0].length > 0;
        const channels = isMultidimensional ? array.length : 1;
        const len = isMultidimensional ? array[0].length : array.length;
        const context = getContext();
        const buffer = context.createBuffer(channels, len, context.sampleRate);
        const multiChannelArray = !isMultidimensional && channels === 1 ?
            [array] : array;
        for (let c = 0; c < channels; c++) {
            buffer.copyToChannel(multiChannelArray[c], c);
        }
        this._buffer = buffer;
        return this;
    }
    /**
     * Sums multiple channels into 1 channel
     * @param chanNum Optionally only copy a single channel from the array.
     */
    toMono(chanNum) {
        if (isNumber(chanNum)) {
            this.fromArray(this.toArray(chanNum));
        }
        else {
            let outputArray = new Float32Array(this.length);
            const numChannels = this.numberOfChannels;
            for (let channel = 0; channel < numChannels; channel++) {
                const channelArray = this.toArray(channel);
                for (let i = 0; i < channelArray.length; i++) {
                    outputArray[i] += channelArray[i];
                }
            }
            // divide by the number of channels
            outputArray = outputArray.map(sample => sample / numChannels);
            this.fromArray(outputArray);
        }
        return this;
    }
    /**
     * Get the buffer as an array. Single channel buffers will return a 1-dimensional
     * Float32Array, and multichannel buffers will return multidimensional arrays.
     * @param channel Optionally only copy a single channel from the array.
     */
    toArray(channel) {
        if (isNumber(channel)) {
            return this.getChannelData(channel);
        }
        else if (this.numberOfChannels === 1) {
            return this.toArray(0);
        }
        else {
            const ret = [];
            for (let c = 0; c < this.numberOfChannels; c++) {
                ret[c] = this.getChannelData(c);
            }
            return ret;
        }
    }
    /**
     * Returns the Float32Array representing the PCM audio data for the specific channel.
     * @param  channel  The channel number to return
     * @return The audio as a TypedArray
     */
    getChannelData(channel) {
        if (this._buffer) {
            return this._buffer.getChannelData(channel);
        }
        else {
            return new Float32Array(0);
        }
    }
    /**
     * Cut a subsection of the array and return a buffer of the
     * subsection. Does not modify the original buffer
     * @param start The time to start the slice
     * @param end The end time to slice. If none is given will default to the end of the buffer
     */
    slice(start, end = this.duration) {
        const startSamples = Math.floor(start * this.sampleRate);
        const endSamples = Math.floor(end * this.sampleRate);
        assert(startSamples < endSamples, "The start time must be less than the end time");
        const length = endSamples - startSamples;
        const retBuffer = getContext().createBuffer(this.numberOfChannels, length, this.sampleRate);
        for (let channel = 0; channel < this.numberOfChannels; channel++) {
            retBuffer.copyToChannel(this.getChannelData(channel).subarray(startSamples, endSamples), channel);
        }
        return new ToneAudioBuffer(retBuffer);
    }
    /**
     * Reverse the buffer.
     */
    _reverse() {
        if (this.loaded) {
            for (let i = 0; i < this.numberOfChannels; i++) {
                this.getChannelData(i).reverse();
            }
        }
        return this;
    }
    /**
     * If the buffer is loaded or not
     */
    get loaded() {
        return this.length > 0;
    }
    /**
     * The duration of the buffer in seconds.
     */
    get duration() {
        if (this._buffer) {
            return this._buffer.duration;
        }
        else {
            return 0;
        }
    }
    /**
     * The length of the buffer in samples
     */
    get length() {
        if (this._buffer) {
            return this._buffer.length;
        }
        else {
            return 0;
        }
    }
    /**
     * The number of discrete audio channels. Returns 0 if no buffer is loaded.
     */
    get numberOfChannels() {
        if (this._buffer) {
            return this._buffer.numberOfChannels;
        }
        else {
            return 0;
        }
    }
    /**
     * Reverse the buffer.
     */
    get reverse() {
        return this._reversed;
    }
    set reverse(rev) {
        if (this._reversed !== rev) {
            this._reversed = rev;
            this._reverse();
        }
    }
    /**
     * Create a ToneAudioBuffer from the array. To create a multichannel AudioBuffer,
     * pass in a multidimensional array.
     * @param array The array to fill the audio buffer
     * @return A ToneAudioBuffer created from the array
     */
    static fromArray(array) {
        return (new ToneAudioBuffer()).fromArray(array);
    }
    /**
     * Creates a ToneAudioBuffer from a URL, returns a promise which resolves to a ToneAudioBuffer
     * @param  url The url to load.
     * @return A promise which resolves to a ToneAudioBuffer
     */
    static fromUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const buffer = new ToneAudioBuffer();
            return yield buffer.load(url);
        });
    }
    /**
     * Loads a url using fetch and returns the AudioBuffer.
     */
    static load(url) {
        return __awaiter(this, void 0, void 0, function* () {
            // test if the url contains multiple extensions
            const matches = url.match(/\[([^\]\[]+\|.+)\]$/);
            if (matches) {
                const extensions = matches[1].split("|");
                let extension = extensions[0];
                for (const ext of extensions) {
                    if (ToneAudioBuffer.supportsType(ext)) {
                        extension = ext;
                        break;
                    }
                }
                url = url.replace(matches[0], extension);
            }
            // make sure there is a slash between the baseUrl and the url
            const baseUrl = ToneAudioBuffer.baseUrl === "" || ToneAudioBuffer.baseUrl.endsWith("/") ? ToneAudioBuffer.baseUrl : ToneAudioBuffer.baseUrl + "/";
            const response = yield fetch(baseUrl + url);
            if (!response.ok) {
                throw new Error(`could not load url: ${url}`);
            }
            const arrayBuffer = yield response.arrayBuffer();
            const audioBuffer = yield getContext().decodeAudioData(arrayBuffer);
            return audioBuffer;
        });
    }
    /**
     * Checks a url's extension to see if the current browser can play that file type.
     * @param url The url/extension to test
     * @return If the file extension can be played
     * @static
     * @example
     * Tone.ToneAudioBuffer.supportsType("wav"); // returns true
     * Tone.ToneAudioBuffer.supportsType("path/to/file.wav"); // returns true
     */
    static supportsType(url) {
        const extensions = url.split(".");
        const extension = extensions[extensions.length - 1];
        const response = document.createElement("audio").canPlayType("audio/" + extension);
        return response !== "";
    }
    /**
     * Returns a Promise which resolves when all of the buffers have loaded
     */
    static loaded() {
        return __awaiter(this, void 0, void 0, function* () {
            // this makes sure that the function is always async
            yield Promise.resolve();
            while (ToneAudioBuffer.downloads.length) {
                yield ToneAudioBuffer.downloads[0];
            }
        });
    }
}
//-------------------------------------
// STATIC METHODS
//-------------------------------------
/**
 * A path which is prefixed before every url.
 */
ToneAudioBuffer.baseUrl = "";
/**
 * All of the downloads
 */
ToneAudioBuffer.downloads = [];

/**
 * Wrapper around the OfflineAudioContext
 * @category Core
 * @example
 * // generate a single channel, 0.5 second buffer
 * const context = new Tone.OfflineContext(1, 0.5, 44100);
 * const osc = new Tone.Oscillator({ context });
 * context.render().then(buffer => {
 * 	console.log(buffer.numberOfChannels, buffer.duration);
 * });
 */
class OfflineContext extends Context {
    constructor() {
        super({
            clockSource: "offline",
            context: isOfflineAudioContext(arguments[0]) ?
                arguments[0] : createOfflineAudioContext(arguments[0], arguments[1] * arguments[2], arguments[2]),
            lookAhead: 0,
            updateInterval: isOfflineAudioContext(arguments[0]) ?
                128 / arguments[0].sampleRate : 128 / arguments[2],
        });
        this.name = "OfflineContext";
        /**
         * An artificial clock source
         */
        this._currentTime = 0;
        this.isOffline = true;
        this._duration = isOfflineAudioContext(arguments[0]) ?
            arguments[0].length / arguments[0].sampleRate : arguments[1];
    }
    /**
     * Override the now method to point to the internal clock time
     */
    now() {
        return this._currentTime;
    }
    /**
     * Same as this.now()
     */
    get currentTime() {
        return this._currentTime;
    }
    /**
     * Render just the clock portion of the audio context.
     */
    _renderClock(asynchronous) {
        return __awaiter(this, void 0, void 0, function* () {
            let index = 0;
            while (this._duration - this._currentTime >= 0) {
                // invoke all the callbacks on that time
                this.emit("tick");
                // increment the clock in block-sized chunks
                this._currentTime += 128 / this.sampleRate;
                // yield once a second of audio
                index++;
                const yieldEvery = Math.floor(this.sampleRate / 128);
                if (asynchronous && index % yieldEvery === 0) {
                    yield new Promise(done => setTimeout(done, 1));
                }
            }
        });
    }
    /**
     * Render the output of the OfflineContext
     * @param asynchronous If the clock should be rendered asynchronously, which will not block the main thread, but be slightly slower.
     */
    render(asynchronous = true) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.workletsAreReady();
            yield this._renderClock(asynchronous);
            const buffer = yield this._context.startRendering();
            return new ToneAudioBuffer(buffer);
        });
    }
    /**
     * Close the context
     */
    close() {
        return Promise.resolve();
    }
}

/**
 * This dummy context is used to avoid throwing immediate errors when importing in Node.js
 */
const dummyContext = new DummyContext();
/**
 * The global audio context which is getable and assignable through
 * getContext and setContext
 */
let globalContext = dummyContext;
/**
 * Returns the default system-wide [[Context]]
 * @category Core
 */
function getContext() {
    if (globalContext === dummyContext && hasAudioContext) {
        setContext(new Context());
    }
    return globalContext;
}
/**
 * Set the default audio context
 * @category Core
 */
function setContext(context) {
    if (isAudioContext(context)) {
        globalContext = new Context(context);
    }
    else if (isOfflineAudioContext(context)) {
        globalContext = new OfflineContext(context);
    }
    else {
        globalContext = context;
    }
}
/**
 * Most browsers will not play _any_ audio until a user
 * clicks something (like a play button). Invoke this method
 * on a click or keypress event handler to start the audio context.
 * More about the Autoplay policy
 * [here](https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio)
 * @example
 * document.querySelector("button").addEventListener("click", async () => {
 * 	await Tone.start();
 * 	console.log("context started");
 * });
 * @category Core
 */
function start() {
    return globalContext.resume();
}
/**
 * Log Tone.js + version in the console.
 */
if (theWindow && !theWindow.TONE_SILENCE_LOGGING) {
    let prefix = "v";
    const printString = ` * Tone.js ${prefix}${version} * `;
    // eslint-disable-next-line no-console
    console.log(`%c${printString}`, "background: #000; color: #fff");
}

/**
 * Equal power gain scale. Good for cross-fading.
 * @param  percent (0-1)
 */
/**
 * Convert decibels into gain.
 */
function dbToGain(db) {
    return Math.pow(10, db / 20);
}
/**
 * Convert gain to decibels.
 */
function gainToDb(gain) {
    return 20 * (Math.log(gain) / Math.LN10);
}
/**
 * Convert an interval (in semitones) to a frequency ratio.
 * @param interval the number of semitones above the base note
 * @example
 * Tone.intervalToFrequencyRatio(0); // 1
 * Tone.intervalToFrequencyRatio(12); // 2
 * Tone.intervalToFrequencyRatio(-12); // 0.5
 */
function intervalToFrequencyRatio(interval) {
    return Math.pow(2, (interval / 12));
}
/**
 * The Global [concert tuning pitch](https://en.wikipedia.org/wiki/Concert_pitch) which is used
 * to generate all the other pitch values from notes. A4's values in Hertz.
 */
let A4 = 440;
function getA4() {
    return A4;
}
function setA4(freq) {
    A4 = freq;
}
/**
 * Convert a frequency value to a MIDI note.
 * @param frequency The value to frequency value to convert.
 * @example
 * Tone.ftom(440); // returns 69
 */
function ftom(frequency) {
    return Math.round(ftomf(frequency));
}
/**
 * Convert a frequency to a floating point midi value
 */
function ftomf(frequency) {
    return 69 + 12 * Math.log2(frequency / A4);
}
/**
 * Convert a MIDI note to frequency value.
 * @param  midi The midi number to convert.
 * @return The corresponding frequency value
 * @example
 * Tone.mtof(69); // 440
 */
function mtof(midi) {
    return A4 * Math.pow(2, (midi - 69) / 12);
}

/**
 * TimeBase is a flexible encoding of time which can be evaluated to and from a string.
 */
class TimeBaseClass extends Tone {
    /**
     * @param context The context associated with the time value. Used to compute
     * Transport and context-relative timing.
     * @param  value  The time value as a number, string or object
     * @param  units  Unit values
     */
    constructor(context, value, units) {
        super();
        /**
         * The default units
         */
        this.defaultUnits = "s";
        this._val = value;
        this._units = units;
        this.context = context;
        this._expressions = this._getExpressions();
    }
    /**
     * All of the time encoding expressions
     */
    _getExpressions() {
        return {
            hz: {
                method: (value) => {
                    return this._frequencyToUnits(parseFloat(value));
                },
                regexp: /^(\d+(?:\.\d+)?)hz$/i,
            },
            i: {
                method: (value) => {
                    return this._ticksToUnits(parseInt(value, 10));
                },
                regexp: /^(\d+)i$/i,
            },
            m: {
                method: (value) => {
                    return this._beatsToUnits(parseInt(value, 10) * this._getTimeSignature());
                },
                regexp: /^(\d+)m$/i,
            },
            n: {
                method: (value, dot) => {
                    const numericValue = parseInt(value, 10);
                    const scalar = dot === "." ? 1.5 : 1;
                    if (numericValue === 1) {
                        return this._beatsToUnits(this._getTimeSignature()) * scalar;
                    }
                    else {
                        return this._beatsToUnits(4 / numericValue) * scalar;
                    }
                },
                regexp: /^(\d+)n(\.?)$/i,
            },
            number: {
                method: (value) => {
                    return this._expressions[this.defaultUnits].method.call(this, value);
                },
                regexp: /^(\d+(?:\.\d+)?)$/,
            },
            s: {
                method: (value) => {
                    return this._secondsToUnits(parseFloat(value));
                },
                regexp: /^(\d+(?:\.\d+)?)s$/,
            },
            samples: {
                method: (value) => {
                    return parseInt(value, 10) / this.context.sampleRate;
                },
                regexp: /^(\d+)samples$/,
            },
            t: {
                method: (value) => {
                    const numericValue = parseInt(value, 10);
                    return this._beatsToUnits(8 / (Math.floor(numericValue) * 3));
                },
                regexp: /^(\d+)t$/i,
            },
            tr: {
                method: (m, q, s) => {
                    let total = 0;
                    if (m && m !== "0") {
                        total += this._beatsToUnits(this._getTimeSignature() * parseFloat(m));
                    }
                    if (q && q !== "0") {
                        total += this._beatsToUnits(parseFloat(q));
                    }
                    if (s && s !== "0") {
                        total += this._beatsToUnits(parseFloat(s) / 4);
                    }
                    return total;
                },
                regexp: /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?):?(\d+(?:\.\d+)?)?$/,
            },
        };
    }
    //-------------------------------------
    // 	VALUE OF
    //-------------------------------------
    /**
     * Evaluate the time value. Returns the time in seconds.
     */
    valueOf() {
        if (this._val instanceof TimeBaseClass) {
            this.fromType(this._val);
        }
        if (isUndef(this._val)) {
            return this._noArg();
        }
        else if (isString(this._val) && isUndef(this._units)) {
            for (const units in this._expressions) {
                if (this._expressions[units].regexp.test(this._val.trim())) {
                    this._units = units;
                    break;
                }
            }
        }
        else if (isObject(this._val)) {
            let total = 0;
            for (const typeName in this._val) {
                if (isDefined(this._val[typeName])) {
                    const quantity = this._val[typeName];
                    // @ts-ignore
                    const time = (new this.constructor(this.context, typeName)).valueOf() * quantity;
                    total += time;
                }
            }
            return total;
        }
        if (isDefined(this._units)) {
            const expr = this._expressions[this._units];
            const matching = this._val.toString().trim().match(expr.regexp);
            if (matching) {
                return expr.method.apply(this, matching.slice(1));
            }
            else {
                return expr.method.call(this, this._val);
            }
        }
        else if (isString(this._val)) {
            return parseFloat(this._val);
        }
        else {
            return this._val;
        }
    }
    //-------------------------------------
    // 	UNIT CONVERSIONS
    //-------------------------------------
    /**
     * Returns the value of a frequency in the current units
     */
    _frequencyToUnits(freq) {
        return 1 / freq;
    }
    /**
     * Return the value of the beats in the current units
     */
    _beatsToUnits(beats) {
        return (60 / this._getBpm()) * beats;
    }
    /**
     * Returns the value of a second in the current units
     */
    _secondsToUnits(seconds) {
        return seconds;
    }
    /**
     * Returns the value of a tick in the current time units
     */
    _ticksToUnits(ticks) {
        return (ticks * (this._beatsToUnits(1)) / this._getPPQ());
    }
    /**
     * With no arguments, return 'now'
     */
    _noArg() {
        return this._now();
    }
    //-------------------------------------
    // 	TEMPO CONVERSIONS
    //-------------------------------------
    /**
     * Return the bpm
     */
    _getBpm() {
        return this.context.transport.bpm.value;
    }
    /**
     * Return the timeSignature
     */
    _getTimeSignature() {
        return this.context.transport.timeSignature;
    }
    /**
     * Return the PPQ or 192 if Transport is not available
     */
    _getPPQ() {
        return this.context.transport.PPQ;
    }
    //-------------------------------------
    // 	CONVERSION INTERFACE
    //-------------------------------------
    /**
     * Coerce a time type into this units type.
     * @param type Any time type units
     */
    fromType(type) {
        this._units = undefined;
        switch (this.defaultUnits) {
            case "s":
                this._val = type.toSeconds();
                break;
            case "i":
                this._val = type.toTicks();
                break;
            case "hz":
                this._val = type.toFrequency();
                break;
            case "midi":
                this._val = type.toMidi();
                break;
        }
        return this;
    }
    /**
     * Return the value in hertz
     */
    toFrequency() {
        return 1 / this.toSeconds();
    }
    /**
     * Return the time in samples
     */
    toSamples() {
        return this.toSeconds() * this.context.sampleRate;
    }
    /**
     * Return the time in milliseconds.
     */
    toMilliseconds() {
        return this.toSeconds() * 1000;
    }
}

/**
 * TimeClass is a primitive type for encoding and decoding Time values.
 * TimeClass can be passed into the parameter of any method which takes time as an argument.
 * @param  val    The time value.
 * @param  units  The units of the value.
 * @example
 * const time = Tone.Time("4n"); // a quarter note
 * @category Unit
 */
class TimeClass extends TimeBaseClass {
    constructor() {
        super(...arguments);
        this.name = "TimeClass";
    }
    _getExpressions() {
        return Object.assign(super._getExpressions(), {
            now: {
                method: (capture) => {
                    return this._now() + new this.constructor(this.context, capture).valueOf();
                },
                regexp: /^\+(.+)/,
            },
            quantize: {
                method: (capture) => {
                    const quantTo = new TimeClass(this.context, capture).valueOf();
                    return this._secondsToUnits(this.context.transport.nextSubdivision(quantTo));
                },
                regexp: /^@(.+)/,
            },
        });
    }
    /**
     * Quantize the time by the given subdivision. Optionally add a
     * percentage which will move the time value towards the ideal
     * quantized value by that percentage.
     * @param  subdiv    The subdivision to quantize to
     * @param  percent  Move the time value towards the quantized value by a percentage.
     * @example
     * Tone.Time(21).quantize(2); // returns 22
     * Tone.Time(0.6).quantize("4n", 0.5); // returns 0.55
     */
    quantize(subdiv, percent = 1) {
        const subdivision = new this.constructor(this.context, subdiv).valueOf();
        const value = this.valueOf();
        const multiple = Math.round(value / subdivision);
        const ideal = multiple * subdivision;
        const diff = ideal - value;
        return value + diff * percent;
    }
    //-------------------------------------
    // CONVERSIONS
    //-------------------------------------
    /**
     * Convert a Time to Notation. The notation values are will be the
     * closest representation between 1m to 128th note.
     * @return {Notation}
     * @example
     * // if the Transport is at 120bpm:
     * Tone.Time(2).toNotation(); // returns "1m"
     */
    toNotation() {
        const time = this.toSeconds();
        const testNotations = ["1m"];
        for (let power = 1; power < 9; power++) {
            const subdiv = Math.pow(2, power);
            testNotations.push(subdiv + "n.");
            testNotations.push(subdiv + "n");
            testNotations.push(subdiv + "t");
        }
        testNotations.push("0");
        // find the closets notation representation
        let closest = testNotations[0];
        let closestSeconds = new TimeClass(this.context, testNotations[0]).toSeconds();
        testNotations.forEach(notation => {
            const notationSeconds = new TimeClass(this.context, notation).toSeconds();
            if (Math.abs(notationSeconds - time) < Math.abs(closestSeconds - time)) {
                closest = notation;
                closestSeconds = notationSeconds;
            }
        });
        return closest;
    }
    /**
     * Return the time encoded as Bars:Beats:Sixteenths.
     */
    toBarsBeatsSixteenths() {
        const quarterTime = this._beatsToUnits(1);
        let quarters = this.valueOf() / quarterTime;
        quarters = parseFloat(quarters.toFixed(4));
        const measures = Math.floor(quarters / this._getTimeSignature());
        let sixteenths = (quarters % 1) * 4;
        quarters = Math.floor(quarters) % this._getTimeSignature();
        const sixteenthString = sixteenths.toString();
        if (sixteenthString.length > 3) {
            // the additional parseFloat removes insignificant trailing zeroes
            sixteenths = parseFloat(parseFloat(sixteenthString).toFixed(3));
        }
        const progress = [measures, quarters, sixteenths];
        return progress.join(":");
    }
    /**
     * Return the time in ticks.
     */
    toTicks() {
        const quarterTime = this._beatsToUnits(1);
        const quarters = this.valueOf() / quarterTime;
        return Math.round(quarters * this._getPPQ());
    }
    /**
     * Return the time in seconds.
     */
    toSeconds() {
        return this.valueOf();
    }
    /**
     * Return the value as a midi note.
     */
    toMidi() {
        return ftom(this.toFrequency());
    }
    _now() {
        return this.context.now();
    }
}
/**
 * Create a TimeClass from a time string or number. The time is computed against the
 * global Tone.Context. To use a specific context, use [[TimeClass]]
 * @param value A value which represents time
 * @param units The value's units if they can't be inferred by the value.
 * @category Unit
 * @example
 * const time = Tone.Time("4n").toSeconds();
 * console.log(time);
 * @example
 * const note = Tone.Time(1).toNotation();
 * console.log(note);
 * @example
 * const freq = Tone.Time(0.5).toFrequency();
 * console.log(freq);
 */
function Time(value, units) {
    return new TimeClass(getContext(), value, units);
}

/**
 * Frequency is a primitive type for encoding Frequency values.
 * Eventually all time values are evaluated to hertz using the `valueOf` method.
 * @example
 * Tone.Frequency("C3"); // 261
 * Tone.Frequency(38, "midi");
 * Tone.Frequency("C3").transpose(4);
 * @category Unit
 */
class FrequencyClass extends TimeClass {
    constructor() {
        super(...arguments);
        this.name = "Frequency";
        this.defaultUnits = "hz";
    }
    /**
     * The [concert tuning pitch](https://en.wikipedia.org/wiki/Concert_pitch) which is used
     * to generate all the other pitch values from notes. A4's values in Hertz.
     */
    static get A4() {
        return getA4();
    }
    static set A4(freq) {
        setA4(freq);
    }
    //-------------------------------------
    // 	AUGMENT BASE EXPRESSIONS
    //-------------------------------------
    _getExpressions() {
        return Object.assign({}, super._getExpressions(), {
            midi: {
                regexp: /^(\d+(?:\.\d+)?midi)/,
                method(value) {
                    if (this.defaultUnits === "midi") {
                        return value;
                    }
                    else {
                        return FrequencyClass.mtof(value);
                    }
                },
            },
            note: {
                regexp: /^([a-g]{1}(?:b|#|x|bb)?)(-?[0-9]+)/i,
                method(pitch, octave) {
                    const index = noteToScaleIndex[pitch.toLowerCase()];
                    const noteNumber = index + (parseInt(octave, 10) + 1) * 12;
                    if (this.defaultUnits === "midi") {
                        return noteNumber;
                    }
                    else {
                        return FrequencyClass.mtof(noteNumber);
                    }
                },
            },
            tr: {
                regexp: /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?):?(\d+(?:\.\d+)?)?/,
                method(m, q, s) {
                    let total = 1;
                    if (m && m !== "0") {
                        total *= this._beatsToUnits(this._getTimeSignature() * parseFloat(m));
                    }
                    if (q && q !== "0") {
                        total *= this._beatsToUnits(parseFloat(q));
                    }
                    if (s && s !== "0") {
                        total *= this._beatsToUnits(parseFloat(s) / 4);
                    }
                    return total;
                },
            },
        });
    }
    //-------------------------------------
    // 	EXPRESSIONS
    //-------------------------------------
    /**
     * Transposes the frequency by the given number of semitones.
     * @return  A new transposed frequency
     * @example
     * Tone.Frequency("A4").transpose(3); // "C5"
     */
    transpose(interval) {
        return new FrequencyClass(this.context, this.valueOf() * intervalToFrequencyRatio(interval));
    }
    /**
     * Takes an array of semitone intervals and returns
     * an array of frequencies transposed by those intervals.
     * @return  Returns an array of Frequencies
     * @example
     * Tone.Frequency("A4").harmonize([0, 3, 7]); // ["A4", "C5", "E5"]
     */
    harmonize(intervals) {
        return intervals.map(interval => {
            return this.transpose(interval);
        });
    }
    //-------------------------------------
    // 	UNIT CONVERSIONS
    //-------------------------------------
    /**
     * Return the value of the frequency as a MIDI note
     * @example
     * Tone.Frequency("C4").toMidi(); // 60
     */
    toMidi() {
        return ftom(this.valueOf());
    }
    /**
     * Return the value of the frequency in Scientific Pitch Notation
     * @example
     * Tone.Frequency(69, "midi").toNote(); // "A4"
     */
    toNote() {
        const freq = this.toFrequency();
        const log = Math.log2(freq / FrequencyClass.A4);
        let noteNumber = Math.round(12 * log) + 57;
        const octave = Math.floor(noteNumber / 12);
        if (octave < 0) {
            noteNumber += -12 * octave;
        }
        const noteName = scaleIndexToNote[noteNumber % 12];
        return noteName + octave.toString();
    }
    /**
     * Return the duration of one cycle in seconds.
     */
    toSeconds() {
        return 1 / super.toSeconds();
    }
    /**
     * Return the duration of one cycle in ticks
     */
    toTicks() {
        const quarterTime = this._beatsToUnits(1);
        const quarters = this.valueOf() / quarterTime;
        return Math.floor(quarters * this._getPPQ());
    }
    //-------------------------------------
    // 	UNIT CONVERSIONS HELPERS
    //-------------------------------------
    /**
     * With no arguments, return 0
     */
    _noArg() {
        return 0;
    }
    /**
     * Returns the value of a frequency in the current units
     */
    _frequencyToUnits(freq) {
        return freq;
    }
    /**
     * Returns the value of a tick in the current time units
     */
    _ticksToUnits(ticks) {
        return 1 / ((ticks * 60) / (this._getBpm() * this._getPPQ()));
    }
    /**
     * Return the value of the beats in the current units
     */
    _beatsToUnits(beats) {
        return 1 / super._beatsToUnits(beats);
    }
    /**
     * Returns the value of a second in the current units
     */
    _secondsToUnits(seconds) {
        return 1 / seconds;
    }
    /**
     * Convert a MIDI note to frequency value.
     * @param  midi The midi number to convert.
     * @return The corresponding frequency value
     */
    static mtof(midi) {
        return mtof(midi);
    }
    /**
     * Convert a frequency value to a MIDI note.
     * @param frequency The value to frequency value to convert.
     */
    static ftom(frequency) {
        return ftom(frequency);
    }
}
//-------------------------------------
// 	FREQUENCY CONVERSIONS
//-------------------------------------
/**
 * Note to scale index.
 * @hidden
 */
const noteToScaleIndex = {
    cbb: -2, cb: -1, c: 0, "c#": 1, cx: 2,
    dbb: 0, db: 1, d: 2, "d#": 3, dx: 4,
    ebb: 2, eb: 3, e: 4, "e#": 5, ex: 6,
    fbb: 3, fb: 4, f: 5, "f#": 6, fx: 7,
    gbb: 5, gb: 6, g: 7, "g#": 8, gx: 9,
    abb: 7, ab: 8, a: 9, "a#": 10, ax: 11,
    bbb: 9, bb: 10, b: 11, "b#": 12, bx: 13,
};
/**
 * scale index to note (sharps)
 * @hidden
 */
const scaleIndexToNote = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
/**
 * Convert a value into a FrequencyClass object.
 * @category Unit
 * @example
 * const midi = Tone.Frequency("C3").toMidi();
 * console.log(midi);
 * @example
 * const hertz = Tone.Frequency(38, "midi").toFrequency();
 * console.log(hertz);
 */
function Frequency(value, units) {
    return new FrequencyClass(getContext(), value, units);
}

/**
 * TransportTime is a the time along the Transport's
 * timeline. It is similar to Tone.Time, but instead of evaluating
 * against the AudioContext's clock, it is evaluated against
 * the Transport's position. See [TransportTime wiki](https://github.com/Tonejs/Tone.js/wiki/TransportTime).
 * @category Unit
 */
class TransportTimeClass extends TimeClass {
    constructor() {
        super(...arguments);
        this.name = "TransportTime";
    }
    /**
     * Return the current time in whichever context is relevant
     */
    _now() {
        return this.context.transport.seconds;
    }
}
/**
 * TransportTime is a the time along the Transport's
 * timeline. It is similar to [[Time]], but instead of evaluating
 * against the AudioContext's clock, it is evaluated against
 * the Transport's position. See [TransportTime wiki](https://github.com/Tonejs/Tone.js/wiki/TransportTime).
 * @category Unit
 */
function TransportTime(value, units) {
    return new TransportTimeClass(getContext(), value, units);
}

/**
 * The Base class for all nodes that have an AudioContext.
 */
class ToneWithContext extends Tone {
    constructor() {
        super();
        const options = optionsFromArguments(ToneWithContext.getDefaults(), arguments, ["context"]);
        if (this.defaultContext) {
            this.context = this.defaultContext;
        }
        else {
            this.context = options.context;
        }
    }
    static getDefaults() {
        return {
            context: getContext(),
        };
    }
    /**
     * Return the current time of the Context clock plus the lookAhead.
     * @example
     * setInterval(() => {
     * 	console.log(Tone.now());
     * }, 100);
     */
    now() {
        return this.context.currentTime + this.context.lookAhead;
    }
    /**
     * Return the current time of the Context clock without any lookAhead.
     * @example
     * setInterval(() => {
     * 	console.log(Tone.immediate());
     * }, 100);
     */
    immediate() {
        return this.context.currentTime;
    }
    /**
     * The duration in seconds of one sample.
     * @example
     * console.log(Tone.Transport.sampleTime);
     */
    get sampleTime() {
        return 1 / this.context.sampleRate;
    }
    /**
     * The number of seconds of 1 processing block (128 samples)
     * @example
     * console.log(Tone.Destination.blockTime);
     */
    get blockTime() {
        return 128 / this.context.sampleRate;
    }
    /**
     * Convert the incoming time to seconds.
     * This is calculated against the current [[Tone.Transport]] bpm
     * @example
     * const gain = new Tone.Gain();
     * setInterval(() => console.log(gain.toSeconds("4n")), 100);
     * // ramp the tempo to 60 bpm over 30 seconds
     * Tone.getTransport().bpm.rampTo(60, 30);
     */
    toSeconds(time) {
        return new TimeClass(this.context, time).toSeconds();
    }
    /**
     * Convert the input to a frequency number
     * @example
     * const gain = new Tone.Gain();
     * console.log(gain.toFrequency("4n"));
     */
    toFrequency(freq) {
        return new FrequencyClass(this.context, freq).toFrequency();
    }
    /**
     * Convert the input time into ticks
     * @example
     * const gain = new Tone.Gain();
     * console.log(gain.toTicks("4n"));
     */
    toTicks(time) {
        return new TransportTimeClass(this.context, time).toTicks();
    }
    //-------------------------------------
    // 	GET/SET
    //-------------------------------------
    /**
     * Get a subset of the properties which are in the partial props
     */
    _getPartialProperties(props) {
        const options = this.get();
        // remove attributes from the prop that are not in the partial
        Object.keys(options).forEach(name => {
            if (isUndef(props[name])) {
                delete options[name];
            }
        });
        return options;
    }
    /**
     * Get the object's attributes.
     * @example
     * const osc = new Tone.Oscillator();
     * console.log(osc.get());
     */
    get() {
        const defaults = getDefaultsFromInstance(this);
        Object.keys(defaults).forEach(attribute => {
            if (Reflect.has(this, attribute)) {
                const member = this[attribute];
                if (isDefined(member) && isDefined(member.value) && isDefined(member.setValueAtTime)) {
                    defaults[attribute] = member.value;
                }
                else if (member instanceof ToneWithContext) {
                    defaults[attribute] = member._getPartialProperties(defaults[attribute]);
                    // otherwise make sure it's a serializable type
                }
                else if (isArray(member) || isNumber(member) || isString(member) || isBoolean(member)) {
                    defaults[attribute] = member;
                }
                else {
                    // remove all undefined and unserializable attributes
                    delete defaults[attribute];
                }
            }
        });
        return defaults;
    }
    /**
     * Set multiple properties at once with an object.
     * @example
     * const filter = new Tone.Filter().toDestination();
     * // set values using an object
     * filter.set({
     * 	frequency: "C6",
     * 	type: "highpass"
     * });
     * const player = new Tone.Player("https://tonejs.github.io/audio/berklee/Analogsynth_octaves_highmid.mp3").connect(filter);
     * player.autostart = true;
     */
    set(props) {
        Object.keys(props).forEach(attribute => {
            if (Reflect.has(this, attribute) && isDefined(this[attribute])) {
                if (this[attribute] && isDefined(this[attribute].value) && isDefined(this[attribute].setValueAtTime)) {
                    // small optimization
                    if (this[attribute].value !== props[attribute]) {
                        this[attribute].value = props[attribute];
                    }
                }
                else if (this[attribute] instanceof ToneWithContext) {
                    this[attribute].set(props[attribute]);
                }
                else {
                    this[attribute] = props[attribute];
                }
            }
        });
        return this;
    }
}

/**
 * A Timeline State. Provides the methods: `setStateAtTime("state", time)` and `getValueAtTime(time)`
 * @param initial The initial state of the StateTimeline.  Defaults to `undefined`
 */
class StateTimeline extends Timeline {
    constructor(initial = "stopped") {
        super();
        this.name = "StateTimeline";
        this._initial = initial;
        this.setStateAtTime(this._initial, 0);
    }
    /**
     * Returns the scheduled state scheduled before or at
     * the given time.
     * @param  time  The time to query.
     * @return  The name of the state input in setStateAtTime.
     */
    getValueAtTime(time) {
        const event = this.get(time);
        if (event !== null) {
            return event.state;
        }
        else {
            return this._initial;
        }
    }
    /**
     * Add a state to the timeline.
     * @param  state The name of the state to set.
     * @param  time  The time to query.
     * @param options Any additional options that are needed in the timeline.
     */
    setStateAtTime(state, time, options) {
        assertRange(time, 0);
        this.add(Object.assign({}, options, {
            state,
            time,
        }));
        return this;
    }
    /**
     * Return the event before the time with the given state
     * @param  state The state to look for
     * @param  time  When to check before
     * @return  The event with the given state before the time
     */
    getLastState(state, time) {
        // time = this.toSeconds(time);
        const index = this._search(time);
        for (let i = index; i >= 0; i--) {
            const event = this._timeline[i];
            if (event.state === state) {
                return event;
            }
        }
    }
    /**
     * Return the event after the time with the given state
     * @param  state The state to look for
     * @param  time  When to check from
     * @return  The event with the given state after the time
     */
    getNextState(state, time) {
        // time = this.toSeconds(time);
        const index = this._search(time);
        if (index !== -1) {
            for (let i = index; i < this._timeline.length; i++) {
                const event = this._timeline[i];
                if (event.state === state) {
                    return event;
                }
            }
        }
    }
}

/**
 * Param wraps the native Web Audio's AudioParam to provide
 * additional unit conversion functionality. It also
 * serves as a base-class for classes which have a single,
 * automatable parameter.
 * @category Core
 */
class Param extends ToneWithContext {
    constructor() {
        super(optionsFromArguments(Param.getDefaults(), arguments, ["param", "units", "convert"]));
        this.name = "Param";
        this.overridden = false;
        /**
         * The minimum output value
         */
        this._minOutput = 1e-7;
        const options = optionsFromArguments(Param.getDefaults(), arguments, ["param", "units", "convert"]);
        assert(isDefined(options.param) &&
            (isAudioParam(options.param) || options.param instanceof Param), "param must be an AudioParam");
        while (!isAudioParam(options.param)) {
            options.param = options.param._param;
        }
        this._swappable = isDefined(options.swappable) ? options.swappable : false;
        if (this._swappable) {
            this.input = this.context.createGain();
            // initialize
            this._param = options.param;
            this.input.connect(this._param);
        }
        else {
            this._param = this.input = options.param;
        }
        this._events = new Timeline(1000);
        this._initialValue = this._param.defaultValue;
        this.units = options.units;
        this.convert = options.convert;
        this._minValue = options.minValue;
        this._maxValue = options.maxValue;
        // if the value is defined, set it immediately
        if (isDefined(options.value) && options.value !== this._toType(this._initialValue)) {
            this.setValueAtTime(options.value, 0);
        }
    }
    static getDefaults() {
        return Object.assign(ToneWithContext.getDefaults(), {
            convert: true,
            units: "number",
        });
    }
    get value() {
        const now = this.now();
        return this.getValueAtTime(now);
    }
    set value(value) {
        this.cancelScheduledValues(this.now());
        this.setValueAtTime(value, this.now());
    }
    get minValue() {
        // if it's not the default minValue, return it
        if (isDefined(this._minValue)) {
            return this._minValue;
        }
        else if (this.units === "time" || this.units === "frequency" ||
            this.units === "normalRange" || this.units === "positive" ||
            this.units === "transportTime" || this.units === "ticks" ||
            this.units === "bpm" || this.units === "hertz" || this.units === "samples") {
            return 0;
        }
        else if (this.units === "audioRange") {
            return -1;
        }
        else if (this.units === "decibels") {
            return -Infinity;
        }
        else {
            return this._param.minValue;
        }
    }
    get maxValue() {
        if (isDefined(this._maxValue)) {
            return this._maxValue;
        }
        else if (this.units === "normalRange" ||
            this.units === "audioRange") {
            return 1;
        }
        else {
            return this._param.maxValue;
        }
    }
    /**
     * Type guard based on the unit name
     */
    _is(arg, type) {
        return this.units === type;
    }
    /**
     * Make sure the value is always in the defined range
     */
    _assertRange(value) {
        if (isDefined(this.maxValue) && isDefined(this.minValue)) {
            assertRange(value, this._fromType(this.minValue), this._fromType(this.maxValue));
        }
        return value;
    }
    /**
     * Convert the given value from the type specified by Param.units
     * into the destination value (such as Gain or Frequency).
     */
    _fromType(val) {
        if (this.convert && !this.overridden) {
            if (this._is(val, "time")) {
                return this.toSeconds(val);
            }
            else if (this._is(val, "decibels")) {
                return dbToGain(val);
            }
            else if (this._is(val, "frequency")) {
                return this.toFrequency(val);
            }
            else {
                return val;
            }
        }
        else if (this.overridden) {
            // if it's overridden, should only schedule 0s
            return 0;
        }
        else {
            return val;
        }
    }
    /**
     * Convert the parameters value into the units specified by Param.units.
     */
    _toType(val) {
        if (this.convert && this.units === "decibels") {
            return gainToDb(val);
        }
        else {
            return val;
        }
    }
    //-------------------------------------
    // ABSTRACT PARAM INTERFACE
    // all docs are generated from ParamInterface.ts
    //-------------------------------------
    setValueAtTime(value, time) {
        const computedTime = this.toSeconds(time);
        const numericValue = this._fromType(value);
        assert(isFinite(numericValue) && isFinite(computedTime), `Invalid argument(s) to setValueAtTime: ${JSON.stringify(value)}, ${JSON.stringify(time)}`);
        this._assertRange(numericValue);
        this.log(this.units, "setValueAtTime", value, computedTime);
        this._events.add({
            time: computedTime,
            type: "setValueAtTime",
            value: numericValue,
        });
        this._param.setValueAtTime(numericValue, computedTime);
        return this;
    }
    getValueAtTime(time) {
        const computedTime = Math.max(this.toSeconds(time), 0);
        const after = this._events.getAfter(computedTime);
        const before = this._events.get(computedTime);
        let value = this._initialValue;
        // if it was set by
        if (before === null) {
            value = this._initialValue;
        }
        else if (before.type === "setTargetAtTime" && (after === null || after.type === "setValueAtTime")) {
            const previous = this._events.getBefore(before.time);
            let previousVal;
            if (previous === null) {
                previousVal = this._initialValue;
            }
            else {
                previousVal = previous.value;
            }
            if (before.type === "setTargetAtTime") {
                value = this._exponentialApproach(before.time, previousVal, before.value, before.constant, computedTime);
            }
        }
        else if (after === null) {
            value = before.value;
        }
        else if (after.type === "linearRampToValueAtTime" || after.type === "exponentialRampToValueAtTime") {
            let beforeValue = before.value;
            if (before.type === "setTargetAtTime") {
                const previous = this._events.getBefore(before.time);
                if (previous === null) {
                    beforeValue = this._initialValue;
                }
                else {
                    beforeValue = previous.value;
                }
            }
            if (after.type === "linearRampToValueAtTime") {
                value = this._linearInterpolate(before.time, beforeValue, after.time, after.value, computedTime);
            }
            else {
                value = this._exponentialInterpolate(before.time, beforeValue, after.time, after.value, computedTime);
            }
        }
        else {
            value = before.value;
        }
        return this._toType(value);
    }
    setRampPoint(time) {
        time = this.toSeconds(time);
        let currentVal = this.getValueAtTime(time);
        this.cancelAndHoldAtTime(time);
        if (this._fromType(currentVal) === 0) {
            currentVal = this._toType(this._minOutput);
        }
        this.setValueAtTime(currentVal, time);
        return this;
    }
    linearRampToValueAtTime(value, endTime) {
        const numericValue = this._fromType(value);
        const computedTime = this.toSeconds(endTime);
        assert(isFinite(numericValue) && isFinite(computedTime), `Invalid argument(s) to linearRampToValueAtTime: ${JSON.stringify(value)}, ${JSON.stringify(endTime)}`);
        this._assertRange(numericValue);
        this._events.add({
            time: computedTime,
            type: "linearRampToValueAtTime",
            value: numericValue,
        });
        this.log(this.units, "linearRampToValueAtTime", value, computedTime);
        this._param.linearRampToValueAtTime(numericValue, computedTime);
        return this;
    }
    exponentialRampToValueAtTime(value, endTime) {
        let numericValue = this._fromType(value);
        // the value can't be 0
        numericValue = EQ(numericValue, 0) ? this._minOutput : numericValue;
        this._assertRange(numericValue);
        const computedTime = this.toSeconds(endTime);
        assert(isFinite(numericValue) && isFinite(computedTime), `Invalid argument(s) to exponentialRampToValueAtTime: ${JSON.stringify(value)}, ${JSON.stringify(endTime)}`);
        // store the event
        this._events.add({
            time: computedTime,
            type: "exponentialRampToValueAtTime",
            value: numericValue,
        });
        this.log(this.units, "exponentialRampToValueAtTime", value, computedTime);
        this._param.exponentialRampToValueAtTime(numericValue, computedTime);
        return this;
    }
    exponentialRampTo(value, rampTime, startTime) {
        startTime = this.toSeconds(startTime);
        this.setRampPoint(startTime);
        this.exponentialRampToValueAtTime(value, startTime + this.toSeconds(rampTime));
        return this;
    }
    linearRampTo(value, rampTime, startTime) {
        startTime = this.toSeconds(startTime);
        this.setRampPoint(startTime);
        this.linearRampToValueAtTime(value, startTime + this.toSeconds(rampTime));
        return this;
    }
    targetRampTo(value, rampTime, startTime) {
        startTime = this.toSeconds(startTime);
        this.setRampPoint(startTime);
        this.exponentialApproachValueAtTime(value, startTime, rampTime);
        return this;
    }
    exponentialApproachValueAtTime(value, time, rampTime) {
        time = this.toSeconds(time);
        rampTime = this.toSeconds(rampTime);
        const timeConstant = Math.log(rampTime + 1) / Math.log(200);
        this.setTargetAtTime(value, time, timeConstant);
        // at 90% start a linear ramp to the final value
        this.cancelAndHoldAtTime(time + rampTime * 0.9);
        this.linearRampToValueAtTime(value, time + rampTime);
        return this;
    }
    setTargetAtTime(value, startTime, timeConstant) {
        const numericValue = this._fromType(value);
        // The value will never be able to approach without timeConstant > 0.
        assert(isFinite(timeConstant) && timeConstant > 0, "timeConstant must be a number greater than 0");
        const computedTime = this.toSeconds(startTime);
        this._assertRange(numericValue);
        assert(isFinite(numericValue) && isFinite(computedTime), `Invalid argument(s) to setTargetAtTime: ${JSON.stringify(value)}, ${JSON.stringify(startTime)}`);
        this._events.add({
            constant: timeConstant,
            time: computedTime,
            type: "setTargetAtTime",
            value: numericValue,
        });
        this.log(this.units, "setTargetAtTime", value, computedTime, timeConstant);
        this._param.setTargetAtTime(numericValue, computedTime, timeConstant);
        return this;
    }
    setValueCurveAtTime(values, startTime, duration, scaling = 1) {
        duration = this.toSeconds(duration);
        startTime = this.toSeconds(startTime);
        const startingValue = this._fromType(values[0]) * scaling;
        this.setValueAtTime(this._toType(startingValue), startTime);
        const segTime = duration / (values.length - 1);
        for (let i = 1; i < values.length; i++) {
            const numericValue = this._fromType(values[i]) * scaling;
            this.linearRampToValueAtTime(this._toType(numericValue), startTime + i * segTime);
        }
        return this;
    }
    cancelScheduledValues(time) {
        const computedTime = this.toSeconds(time);
        assert(isFinite(computedTime), `Invalid argument to cancelScheduledValues: ${JSON.stringify(time)}`);
        this._events.cancel(computedTime);
        this._param.cancelScheduledValues(computedTime);
        this.log(this.units, "cancelScheduledValues", computedTime);
        return this;
    }
    cancelAndHoldAtTime(time) {
        const computedTime = this.toSeconds(time);
        const valueAtTime = this._fromType(this.getValueAtTime(computedTime));
        // remove the schedule events
        assert(isFinite(computedTime), `Invalid argument to cancelAndHoldAtTime: ${JSON.stringify(time)}`);
        this.log(this.units, "cancelAndHoldAtTime", computedTime, "value=" + valueAtTime);
        // if there is an event at the given computedTime
        // and that even is not a "set"
        const before = this._events.get(computedTime);
        const after = this._events.getAfter(computedTime);
        if (before && EQ(before.time, computedTime)) {
            // remove everything after
            if (after) {
                this._param.cancelScheduledValues(after.time);
                this._events.cancel(after.time);
            }
            else {
                this._param.cancelAndHoldAtTime(computedTime);
                this._events.cancel(computedTime + this.sampleTime);
            }
        }
        else if (after) {
            this._param.cancelScheduledValues(after.time);
            // cancel the next event(s)
            this._events.cancel(after.time);
            if (after.type === "linearRampToValueAtTime") {
                this.linearRampToValueAtTime(this._toType(valueAtTime), computedTime);
            }
            else if (after.type === "exponentialRampToValueAtTime") {
                this.exponentialRampToValueAtTime(this._toType(valueAtTime), computedTime);
            }
        }
        // set the value at the given time
        this._events.add({
            time: computedTime,
            type: "setValueAtTime",
            value: valueAtTime,
        });
        this._param.setValueAtTime(valueAtTime, computedTime);
        return this;
    }
    rampTo(value, rampTime = 0.1, startTime) {
        if (this.units === "frequency" || this.units === "bpm" || this.units === "decibels") {
            this.exponentialRampTo(value, rampTime, startTime);
        }
        else {
            this.linearRampTo(value, rampTime, startTime);
        }
        return this;
    }
    /**
     * Apply all of the previously scheduled events to the passed in Param or AudioParam.
     * The applied values will start at the context's current time and schedule
     * all of the events which are scheduled on this Param onto the passed in param.
     */
    apply(param) {
        const now = this.context.currentTime;
        // set the param's value at the current time and schedule everything else
        param.setValueAtTime(this.getValueAtTime(now), now);
        // if the previous event was a curve, then set the rest of it
        const previousEvent = this._events.get(now);
        if (previousEvent && previousEvent.type === "setTargetAtTime") {
            // approx it until the next event with linear ramps
            const nextEvent = this._events.getAfter(previousEvent.time);
            // or for 2 seconds if there is no event
            const endTime = nextEvent ? nextEvent.time : now + 2;
            const subdivisions = (endTime - now) / 10;
            for (let i = now; i < endTime; i += subdivisions) {
                param.linearRampToValueAtTime(this.getValueAtTime(i), i);
            }
        }
        this._events.forEachAfter(this.context.currentTime, event => {
            if (event.type === "cancelScheduledValues") {
                param.cancelScheduledValues(event.time);
            }
            else if (event.type === "setTargetAtTime") {
                param.setTargetAtTime(event.value, event.time, event.constant);
            }
            else {
                param[event.type](event.value, event.time);
            }
        });
        return this;
    }
    /**
     * Replace the Param's internal AudioParam. Will apply scheduled curves
     * onto the parameter and replace the connections.
     */
    setParam(param) {
        assert(this._swappable, "The Param must be assigned as 'swappable' in the constructor");
        const input = this.input;
        input.disconnect(this._param);
        this.apply(param);
        this._param = param;
        input.connect(this._param);
        return this;
    }
    dispose() {
        super.dispose();
        this._events.dispose();
        return this;
    }
    get defaultValue() {
        return this._toType(this._param.defaultValue);
    }
    //-------------------------------------
    // 	AUTOMATION CURVE CALCULATIONS
    // 	MIT License, copyright (c) 2014 Jordan Santell
    //-------------------------------------
    // Calculates the the value along the curve produced by setTargetAtTime
    _exponentialApproach(t0, v0, v1, timeConstant, t) {
        return v1 + (v0 - v1) * Math.exp(-(t - t0) / timeConstant);
    }
    // Calculates the the value along the curve produced by linearRampToValueAtTime
    _linearInterpolate(t0, v0, t1, v1, t) {
        return v0 + (v1 - v0) * ((t - t0) / (t1 - t0));
    }
    // Calculates the the value along the curve produced by exponentialRampToValueAtTime
    _exponentialInterpolate(t0, v0, t1, v1, t) {
        return v0 * Math.pow(v1 / v0, (t - t0) / (t1 - t0));
    }
}

/**
 * ToneAudioNode is the base class for classes which process audio.
 */
class ToneAudioNode extends ToneWithContext {
    constructor() {
        super(...arguments);
        /**
         * The name of the class
         */
        this.name = "ToneAudioNode";
        /**
         * List all of the node that must be set to match the ChannelProperties
         */
        this._internalChannels = [];
    }
    /**
     * The number of inputs feeding into the AudioNode.
     * For source nodes, this will be 0.
     * @example
     * const node = new Tone.Gain();
     * console.log(node.numberOfInputs);
     */
    get numberOfInputs() {
        if (isDefined(this.input)) {
            if (isAudioParam(this.input) || this.input instanceof Param) {
                return 1;
            }
            else {
                return this.input.numberOfInputs;
            }
        }
        else {
            return 0;
        }
    }
    /**
     * The number of outputs of the AudioNode.
     * @example
     * const node = new Tone.Gain();
     * console.log(node.numberOfOutputs);
     */
    get numberOfOutputs() {
        if (isDefined(this.output)) {
            return this.output.numberOfOutputs;
        }
        else {
            return 0;
        }
    }
    //-------------------------------------
    // AUDIO PROPERTIES
    //-------------------------------------
    /**
     * Used to decide which nodes to get/set properties on
     */
    _isAudioNode(node) {
        return isDefined(node) && (node instanceof ToneAudioNode || isAudioNode(node));
    }
    /**
     * Get all of the audio nodes (either internal or input/output) which together
     * make up how the class node responds to channel input/output
     */
    _getInternalNodes() {
        const nodeList = this._internalChannels.slice(0);
        if (this._isAudioNode(this.input)) {
            nodeList.push(this.input);
        }
        if (this._isAudioNode(this.output)) {
            if (this.input !== this.output) {
                nodeList.push(this.output);
            }
        }
        return nodeList;
    }
    /**
     * Set the audio options for this node such as channelInterpretation
     * channelCount, etc.
     * @param options
     */
    _setChannelProperties(options) {
        const nodeList = this._getInternalNodes();
        nodeList.forEach(node => {
            node.channelCount = options.channelCount;
            node.channelCountMode = options.channelCountMode;
            node.channelInterpretation = options.channelInterpretation;
        });
    }
    /**
     * Get the current audio options for this node such as channelInterpretation
     * channelCount, etc.
     */
    _getChannelProperties() {
        const nodeList = this._getInternalNodes();
        assert(nodeList.length > 0, "ToneAudioNode does not have any internal nodes");
        // use the first node to get properties
        // they should all be the same
        const node = nodeList[0];
        return {
            channelCount: node.channelCount,
            channelCountMode: node.channelCountMode,
            channelInterpretation: node.channelInterpretation,
        };
    }
    /**
     * channelCount is the number of channels used when up-mixing and down-mixing
     * connections to any inputs to the node. The default value is 2 except for
     * specific nodes where its value is specially determined.
     */
    get channelCount() {
        return this._getChannelProperties().channelCount;
    }
    set channelCount(channelCount) {
        const props = this._getChannelProperties();
        // merge it with the other properties
        this._setChannelProperties(Object.assign(props, { channelCount }));
    }
    /**
     * channelCountMode determines how channels will be counted when up-mixing and
     * down-mixing connections to any inputs to the node.
     * The default value is "max". This attribute has no effect for nodes with no inputs.
     * * "max" - computedNumberOfChannels is the maximum of the number of channels of all connections to an input. In this mode channelCount is ignored.
     * * "clamped-max" - computedNumberOfChannels is determined as for "max" and then clamped to a maximum value of the given channelCount.
     * * "explicit" - computedNumberOfChannels is the exact value as specified by the channelCount.
     */
    get channelCountMode() {
        return this._getChannelProperties().channelCountMode;
    }
    set channelCountMode(channelCountMode) {
        const props = this._getChannelProperties();
        // merge it with the other properties
        this._setChannelProperties(Object.assign(props, { channelCountMode }));
    }
    /**
     * channelInterpretation determines how individual channels will be treated
     * when up-mixing and down-mixing connections to any inputs to the node.
     * The default value is "speakers".
     */
    get channelInterpretation() {
        return this._getChannelProperties().channelInterpretation;
    }
    set channelInterpretation(channelInterpretation) {
        const props = this._getChannelProperties();
        // merge it with the other properties
        this._setChannelProperties(Object.assign(props, { channelInterpretation }));
    }
    //-------------------------------------
    // CONNECTIONS
    //-------------------------------------
    /**
     * connect the output of a ToneAudioNode to an AudioParam, AudioNode, or ToneAudioNode
     * @param destination The output to connect to
     * @param outputNum The output to connect from
     * @param inputNum The input to connect to
     */
    connect(destination, outputNum = 0, inputNum = 0) {
        connect(this, destination, outputNum, inputNum);
        return this;
    }
    /**
     * Connect the output to the context's destination node.
     * @example
     * const osc = new Tone.Oscillator("C2").start();
     * osc.toDestination();
     */
    toDestination() {
        this.connect(this.context.destination);
        return this;
    }
    /**
     * Connect the output to the context's destination node.
     * See [[toDestination]]
     * @deprecated
     */
    toMaster() {
        warn("toMaster() has been renamed toDestination()");
        return this.toDestination();
    }
    /**
     * disconnect the output
     */
    disconnect(destination, outputNum = 0, inputNum = 0) {
        disconnect(this, destination, outputNum, inputNum);
        return this;
    }
    /**
     * Connect the output of this node to the rest of the nodes in series.
     * @example
     * const player = new Tone.Player("https://tonejs.github.io/audio/drum-samples/handdrum-loop.mp3");
     * player.autostart = true;
     * const filter = new Tone.AutoFilter(4).start();
     * const distortion = new Tone.Distortion(0.5);
     * // connect the player to the filter, distortion and then to the master output
     * player.chain(filter, distortion, Tone.Destination);
     */
    chain(...nodes) {
        connectSeries(this, ...nodes);
        return this;
    }
    /**
     * connect the output of this node to the rest of the nodes in parallel.
     * @example
     * const player = new Tone.Player("https://tonejs.github.io/audio/drum-samples/conga-rhythm.mp3");
     * player.autostart = true;
     * const pitchShift = new Tone.PitchShift(4).toDestination();
     * const filter = new Tone.Filter("G5").toDestination();
     * // connect a node to the pitch shift and filter in parallel
     * player.fan(pitchShift, filter);
     */
    fan(...nodes) {
        nodes.forEach(node => this.connect(node));
        return this;
    }
    /**
     * Dispose and disconnect
     */
    dispose() {
        super.dispose();
        if (isDefined(this.input)) {
            if (this.input instanceof ToneAudioNode) {
                this.input.dispose();
            }
            else if (isAudioNode(this.input)) {
                this.input.disconnect();
            }
        }
        if (isDefined(this.output)) {
            if (this.output instanceof ToneAudioNode) {
                this.output.dispose();
            }
            else if (isAudioNode(this.output)) {
                this.output.disconnect();
            }
        }
        this._internalChannels = [];
        return this;
    }
}
//-------------------------------------
// CONNECTIONS
//-------------------------------------
/**
 * connect together all of the arguments in series
 * @param nodes
 */
function connectSeries(...nodes) {
    const first = nodes.shift();
    nodes.reduce((prev, current) => {
        if (prev instanceof ToneAudioNode) {
            prev.connect(current);
        }
        else if (isAudioNode(prev)) {
            connect(prev, current);
        }
        return current;
    }, first);
}
/**
 * Connect two nodes together so that signal flows from the
 * first node to the second. Optionally specify the input and output channels.
 * @param srcNode The source node
 * @param dstNode The destination node
 * @param outputNumber The output channel of the srcNode
 * @param inputNumber The input channel of the dstNode
 */
function connect(srcNode, dstNode, outputNumber = 0, inputNumber = 0) {
    assert(isDefined(srcNode), "Cannot connect from undefined node");
    assert(isDefined(dstNode), "Cannot connect to undefined node");
    if (dstNode instanceof ToneAudioNode || isAudioNode(dstNode)) {
        assert(dstNode.numberOfInputs > 0, "Cannot connect to node with no inputs");
    }
    assert(srcNode.numberOfOutputs > 0, "Cannot connect from node with no outputs");
    // resolve the input of the dstNode
    while ((dstNode instanceof ToneAudioNode || dstNode instanceof Param)) {
        if (isDefined(dstNode.input)) {
            dstNode = dstNode.input;
        }
    }
    while (srcNode instanceof ToneAudioNode) {
        if (isDefined(srcNode.output)) {
            srcNode = srcNode.output;
        }
    }
    // make the connection
    if (isAudioParam(dstNode)) {
        srcNode.connect(dstNode, outputNumber);
    }
    else {
        srcNode.connect(dstNode, outputNumber, inputNumber);
    }
}
/**
 * Disconnect a node from all nodes or optionally include a destination node and input/output channels.
 * @param srcNode The source node
 * @param dstNode The destination node
 * @param outputNumber The output channel of the srcNode
 * @param inputNumber The input channel of the dstNode
 */
function disconnect(srcNode, dstNode, outputNumber = 0, inputNumber = 0) {
    // resolve the destination node
    if (isDefined(dstNode)) {
        while (dstNode instanceof ToneAudioNode) {
            dstNode = dstNode.input;
        }
    }
    // resolve the src node
    while (!(isAudioNode(srcNode))) {
        if (isDefined(srcNode.output)) {
            srcNode = srcNode.output;
        }
    }
    if (isAudioParam(dstNode)) {
        srcNode.disconnect(dstNode, outputNumber);
    }
    else if (isAudioNode(dstNode)) {
        srcNode.disconnect(dstNode, outputNumber, inputNumber);
    }
    else {
        srcNode.disconnect();
    }
}

/**
 * A thin wrapper around the Native Web Audio GainNode.
 * The GainNode is a basic building block of the Web Audio
 * API and is useful for routing audio and adjusting gains.
 * @category Core
 * @example
 * return Tone.Offline(() => {
 * 	const gainNode = new Tone.Gain(0).toDestination();
 * 	const osc = new Tone.Oscillator(30).connect(gainNode).start();
 * 	gainNode.gain.rampTo(1, 0.1);
 * 	gainNode.gain.rampTo(0, 0.4, 0.2);
 * }, 0.7, 1);
 */
class Gain extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(Gain.getDefaults(), arguments, ["gain", "units"]));
        this.name = "Gain";
        /**
         * The wrapped GainNode.
         */
        this._gainNode = this.context.createGain();
        // input = output
        this.input = this._gainNode;
        this.output = this._gainNode;
        const options = optionsFromArguments(Gain.getDefaults(), arguments, ["gain", "units"]);
        this.gain = new Param({
            context: this.context,
            convert: options.convert,
            param: this._gainNode.gain,
            units: options.units,
            value: options.gain,
            minValue: options.minValue,
            maxValue: options.maxValue,
        });
        readOnly(this, "gain");
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            convert: true,
            gain: 1,
            units: "gain",
        });
    }
    /**
     * Clean up.
     */
    dispose() {
        super.dispose();
        this._gainNode.disconnect();
        this.gain.dispose();
        return this;
    }
}

/**
 * Base class for fire-and-forget nodes
 */
class OneShotSource extends ToneAudioNode {
    constructor(options) {
        super(options);
        /**
         * The callback to invoke after the
         * source is done playing.
         */
        this.onended = noOp;
        /**
         * The start time
         */
        this._startTime = -1;
        /**
         * The stop time
         */
        this._stopTime = -1;
        /**
         * The id of the timeout
         */
        this._timeout = -1;
        /**
         * The public output node
         */
        this.output = new Gain({
            context: this.context,
            gain: 0,
        });
        /**
         * The output gain node.
         */
        this._gainNode = this.output;
        /**
         * Get the playback state at the given time
         */
        this.getStateAtTime = function (time) {
            const computedTime = this.toSeconds(time);
            if (this._startTime !== -1 &&
                computedTime >= this._startTime &&
                (this._stopTime === -1 || computedTime <= this._stopTime)) {
                return "started";
            }
            else {
                return "stopped";
            }
        };
        this._fadeIn = options.fadeIn;
        this._fadeOut = options.fadeOut;
        this._curve = options.curve;
        this.onended = options.onended;
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            curve: "linear",
            fadeIn: 0,
            fadeOut: 0,
            onended: noOp,
        });
    }
    /**
     * Start the source at the given time
     * @param  time When to start the source
     */
    _startGain(time, gain = 1) {
        assert(this._startTime === -1, "Source cannot be started more than once");
        // apply a fade in envelope
        const fadeInTime = this.toSeconds(this._fadeIn);
        // record the start time
        this._startTime = time + fadeInTime;
        this._startTime = Math.max(this._startTime, this.context.currentTime);
        // schedule the envelope
        if (fadeInTime > 0) {
            this._gainNode.gain.setValueAtTime(0, time);
            if (this._curve === "linear") {
                this._gainNode.gain.linearRampToValueAtTime(gain, time + fadeInTime);
            }
            else {
                this._gainNode.gain.exponentialApproachValueAtTime(gain, time, fadeInTime);
            }
        }
        else {
            this._gainNode.gain.setValueAtTime(gain, time);
        }
        return this;
    }
    /**
     * Stop the source node at the given time.
     * @param time When to stop the source
     */
    stop(time) {
        this.log("stop", time);
        this._stopGain(this.toSeconds(time));
        return this;
    }
    /**
     * Stop the source at the given time
     * @param  time When to stop the source
     */
    _stopGain(time) {
        assert(this._startTime !== -1, "'start' must be called before 'stop'");
        // cancel the previous stop
        this.cancelStop();
        // the fadeOut time
        const fadeOutTime = this.toSeconds(this._fadeOut);
        // schedule the stop callback
        this._stopTime = this.toSeconds(time) + fadeOutTime;
        this._stopTime = Math.max(this._stopTime, this.context.currentTime);
        if (fadeOutTime > 0) {
            // start the fade out curve at the given time
            if (this._curve === "linear") {
                this._gainNode.gain.linearRampTo(0, fadeOutTime, time);
            }
            else {
                this._gainNode.gain.targetRampTo(0, fadeOutTime, time);
            }
        }
        else {
            // stop any ongoing ramps, and set the value to 0
            this._gainNode.gain.cancelAndHoldAtTime(time);
            this._gainNode.gain.setValueAtTime(0, time);
        }
        this.context.clearTimeout(this._timeout);
        this._timeout = this.context.setTimeout(() => {
            // allow additional time for the exponential curve to fully decay
            const additionalTail = this._curve === "exponential" ? fadeOutTime * 2 : 0;
            this._stopSource(this.now() + additionalTail);
            this._onended();
        }, this._stopTime - this.context.currentTime);
        return this;
    }
    /**
     * Invoke the onended callback
     */
    _onended() {
        if (this.onended !== noOp) {
            this.onended(this);
            // overwrite onended to make sure it only is called once
            this.onended = noOp;
            // dispose when it's ended to free up for garbage collection only in the online context
            if (!this.context.isOffline) {
                const disposeCallback = () => this.dispose();
                // @ts-ignore
                if (typeof window.requestIdleCallback !== "undefined") {
                    // @ts-ignore
                    window.requestIdleCallback(disposeCallback);
                }
                else {
                    setTimeout(disposeCallback, 1000);
                }
            }
        }
    }
    /**
     * Get the playback state at the current time
     */
    get state() {
        return this.getStateAtTime(this.now());
    }
    /**
     * Cancel a scheduled stop event
     */
    cancelStop() {
        this.log("cancelStop");
        assert(this._startTime !== -1, "Source is not started");
        // cancel the stop envelope
        this._gainNode.gain.cancelScheduledValues(this._startTime + this.sampleTime);
        this.context.clearTimeout(this._timeout);
        this._stopTime = -1;
        return this;
    }
    dispose() {
        super.dispose();
        this._gainNode.disconnect();
        return this;
    }
}

/**
 * Wrapper around the native fire-and-forget ConstantSource.
 * Adds the ability to reschedule the stop method.
 * @category Signal
 */
class ToneConstantSource extends OneShotSource {
    constructor() {
        super(optionsFromArguments(ToneConstantSource.getDefaults(), arguments, ["offset"]));
        this.name = "ToneConstantSource";
        /**
         * The signal generator
         */
        this._source = this.context.createConstantSource();
        const options = optionsFromArguments(ToneConstantSource.getDefaults(), arguments, ["offset"]);
        connect(this._source, this._gainNode);
        this.offset = new Param({
            context: this.context,
            convert: options.convert,
            param: this._source.offset,
            units: options.units,
            value: options.offset,
            minValue: options.minValue,
            maxValue: options.maxValue,
        });
    }
    static getDefaults() {
        return Object.assign(OneShotSource.getDefaults(), {
            convert: true,
            offset: 1,
            units: "number",
        });
    }
    /**
     * Start the source node at the given time
     * @param  time When to start the source
     */
    start(time) {
        const computedTime = this.toSeconds(time);
        this.log("start", computedTime);
        this._startGain(computedTime);
        this._source.start(computedTime);
        return this;
    }
    _stopSource(time) {
        this._source.stop(time);
    }
    dispose() {
        super.dispose();
        if (this.state === "started") {
            this.stop();
        }
        this._source.disconnect();
        this.offset.dispose();
        return this;
    }
}

/**
 * A signal is an audio-rate value. Tone.Signal is a core component of the library.
 * Unlike a number, Signals can be scheduled with sample-level accuracy. Tone.Signal
 * has all of the methods available to native Web Audio
 * [AudioParam](http://webaudio.github.io/web-audio-api/#the-audioparam-interface)
 * as well as additional conveniences. Read more about working with signals
 * [here](https://github.com/Tonejs/Tone.js/wiki/Signals).
 *
 * @example
 * const osc = new Tone.Oscillator().toDestination().start();
 * // a scheduleable signal which can be connected to control an AudioParam or another Signal
 * const signal = new Tone.Signal({
 * 	value: "C4",
 * 	units: "frequency"
 * }).connect(osc.frequency);
 * // the scheduled ramp controls the connected signal
 * signal.rampTo("C2", 4, "+0.5");
 * @category Signal
 */
class Signal extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(Signal.getDefaults(), arguments, ["value", "units"]));
        this.name = "Signal";
        /**
         * Indicates if the value should be overridden on connection.
         */
        this.override = true;
        const options = optionsFromArguments(Signal.getDefaults(), arguments, ["value", "units"]);
        this.output = this._constantSource = new ToneConstantSource({
            context: this.context,
            convert: options.convert,
            offset: options.value,
            units: options.units,
            minValue: options.minValue,
            maxValue: options.maxValue,
        });
        this._constantSource.start(0);
        this.input = this._param = this._constantSource.offset;
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            convert: true,
            units: "number",
            value: 0,
        });
    }
    connect(destination, outputNum = 0, inputNum = 0) {
        // start it only when connected to something
        connectSignal(this, destination, outputNum, inputNum);
        return this;
    }
    dispose() {
        super.dispose();
        this._param.dispose();
        this._constantSource.dispose();
        return this;
    }
    //-------------------------------------
    // ABSTRACT PARAM INTERFACE
    // just a proxy for the ConstantSourceNode's offset AudioParam
    // all docs are generated from AbstractParam.ts
    //-------------------------------------
    setValueAtTime(value, time) {
        this._param.setValueAtTime(value, time);
        return this;
    }
    getValueAtTime(time) {
        return this._param.getValueAtTime(time);
    }
    setRampPoint(time) {
        this._param.setRampPoint(time);
        return this;
    }
    linearRampToValueAtTime(value, time) {
        this._param.linearRampToValueAtTime(value, time);
        return this;
    }
    exponentialRampToValueAtTime(value, time) {
        this._param.exponentialRampToValueAtTime(value, time);
        return this;
    }
    exponentialRampTo(value, rampTime, startTime) {
        this._param.exponentialRampTo(value, rampTime, startTime);
        return this;
    }
    linearRampTo(value, rampTime, startTime) {
        this._param.linearRampTo(value, rampTime, startTime);
        return this;
    }
    targetRampTo(value, rampTime, startTime) {
        this._param.targetRampTo(value, rampTime, startTime);
        return this;
    }
    exponentialApproachValueAtTime(value, time, rampTime) {
        this._param.exponentialApproachValueAtTime(value, time, rampTime);
        return this;
    }
    setTargetAtTime(value, startTime, timeConstant) {
        this._param.setTargetAtTime(value, startTime, timeConstant);
        return this;
    }
    setValueCurveAtTime(values, startTime, duration, scaling) {
        this._param.setValueCurveAtTime(values, startTime, duration, scaling);
        return this;
    }
    cancelScheduledValues(time) {
        this._param.cancelScheduledValues(time);
        return this;
    }
    cancelAndHoldAtTime(time) {
        this._param.cancelAndHoldAtTime(time);
        return this;
    }
    rampTo(value, rampTime, startTime) {
        this._param.rampTo(value, rampTime, startTime);
        return this;
    }
    get value() {
        return this._param.value;
    }
    set value(value) {
        this._param.value = value;
    }
    get convert() {
        return this._param.convert;
    }
    set convert(convert) {
        this._param.convert = convert;
    }
    get units() {
        return this._param.units;
    }
    get overridden() {
        return this._param.overridden;
    }
    set overridden(overridden) {
        this._param.overridden = overridden;
    }
    get maxValue() {
        return this._param.maxValue;
    }
    get minValue() {
        return this._param.minValue;
    }
    /**
     * See [[Param.apply]].
     */
    apply(param) {
        this._param.apply(param);
        return this;
    }
}
/**
 * When connecting from a signal, it's necessary to zero out the node destination
 * node if that node is also a signal. If the destination is not 0, then the values
 * will be summed. This method insures that the output of the destination signal will
 * be the same as the source signal, making the destination signal a pass through node.
 * @param signal The output signal to connect from
 * @param destination the destination to connect to
 * @param outputNum the optional output number
 * @param inputNum the input number
 */
function connectSignal(signal, destination, outputNum, inputNum) {
    if (destination instanceof Param || isAudioParam(destination) ||
        (destination instanceof Signal && destination.override)) {
        // cancel changes
        destination.cancelScheduledValues(0);
        // reset the value
        destination.setValueAtTime(0, 0);
        // mark the value as overridden
        if (destination instanceof Signal) {
            destination.overridden = true;
        }
    }
    connect(signal, destination, outputNum, inputNum);
}

/**
 * A Param class just for computing ticks. Similar to the [[Param]] class,
 * but offers conversion to BPM values as well as ability to compute tick
 * duration and elapsed ticks
 */
class TickParam extends Param {
    constructor() {
        super(optionsFromArguments(TickParam.getDefaults(), arguments, ["value"]));
        this.name = "TickParam";
        /**
         * The timeline which tracks all of the automations.
         */
        this._events = new Timeline(Infinity);
        /**
         * The internal holder for the multiplier value
         */
        this._multiplier = 1;
        const options = optionsFromArguments(TickParam.getDefaults(), arguments, ["value"]);
        // set the multiplier
        this._multiplier = options.multiplier;
        // clear the ticks from the beginning
        this._events.cancel(0);
        // set an initial event
        this._events.add({
            ticks: 0,
            time: 0,
            type: "setValueAtTime",
            value: this._fromType(options.value),
        });
        this.setValueAtTime(options.value, 0);
    }
    static getDefaults() {
        return Object.assign(Param.getDefaults(), {
            multiplier: 1,
            units: "hertz",
            value: 1,
        });
    }
    setTargetAtTime(value, time, constant) {
        // approximate it with multiple linear ramps
        time = this.toSeconds(time);
        this.setRampPoint(time);
        const computedValue = this._fromType(value);
        // start from previously scheduled value
        const prevEvent = this._events.get(time);
        const segments = Math.round(Math.max(1 / constant, 1));
        for (let i = 0; i <= segments; i++) {
            const segTime = constant * i + time;
            const rampVal = this._exponentialApproach(prevEvent.time, prevEvent.value, computedValue, constant, segTime);
            this.linearRampToValueAtTime(this._toType(rampVal), segTime);
        }
        return this;
    }
    setValueAtTime(value, time) {
        const computedTime = this.toSeconds(time);
        super.setValueAtTime(value, time);
        const event = this._events.get(computedTime);
        const previousEvent = this._events.previousEvent(event);
        const ticksUntilTime = this._getTicksUntilEvent(previousEvent, computedTime);
        event.ticks = Math.max(ticksUntilTime, 0);
        return this;
    }
    linearRampToValueAtTime(value, time) {
        const computedTime = this.toSeconds(time);
        super.linearRampToValueAtTime(value, time);
        const event = this._events.get(computedTime);
        const previousEvent = this._events.previousEvent(event);
        const ticksUntilTime = this._getTicksUntilEvent(previousEvent, computedTime);
        event.ticks = Math.max(ticksUntilTime, 0);
        return this;
    }
    exponentialRampToValueAtTime(value, time) {
        // aproximate it with multiple linear ramps
        time = this.toSeconds(time);
        const computedVal = this._fromType(value);
        // start from previously scheduled value
        const prevEvent = this._events.get(time);
        // approx 10 segments per second
        const segments = Math.round(Math.max((time - prevEvent.time) * 10, 1));
        const segmentDur = ((time - prevEvent.time) / segments);
        for (let i = 0; i <= segments; i++) {
            const segTime = segmentDur * i + prevEvent.time;
            const rampVal = this._exponentialInterpolate(prevEvent.time, prevEvent.value, time, computedVal, segTime);
            this.linearRampToValueAtTime(this._toType(rampVal), segTime);
        }
        return this;
    }
    /**
     * Returns the tick value at the time. Takes into account
     * any automation curves scheduled on the signal.
     * @param  event The time to get the tick count at
     * @return The number of ticks which have elapsed at the time given any automations.
     */
    _getTicksUntilEvent(event, time) {
        if (event === null) {
            event = {
                ticks: 0,
                time: 0,
                type: "setValueAtTime",
                value: 0,
            };
        }
        else if (isUndef(event.ticks)) {
            const previousEvent = this._events.previousEvent(event);
            event.ticks = this._getTicksUntilEvent(previousEvent, event.time);
        }
        const val0 = this._fromType(this.getValueAtTime(event.time));
        let val1 = this._fromType(this.getValueAtTime(time));
        // if it's right on the line, take the previous value
        const onTheLineEvent = this._events.get(time);
        if (onTheLineEvent && onTheLineEvent.time === time && onTheLineEvent.type === "setValueAtTime") {
            val1 = this._fromType(this.getValueAtTime(time - this.sampleTime));
        }
        return 0.5 * (time - event.time) * (val0 + val1) + event.ticks;
    }
    /**
     * Returns the tick value at the time. Takes into account
     * any automation curves scheduled on the signal.
     * @param  time The time to get the tick count at
     * @return The number of ticks which have elapsed at the time given any automations.
     */
    getTicksAtTime(time) {
        const computedTime = this.toSeconds(time);
        const event = this._events.get(computedTime);
        return Math.max(this._getTicksUntilEvent(event, computedTime), 0);
    }
    /**
     * Return the elapsed time of the number of ticks from the given time
     * @param ticks The number of ticks to calculate
     * @param  time The time to get the next tick from
     * @return The duration of the number of ticks from the given time in seconds
     */
    getDurationOfTicks(ticks, time) {
        const computedTime = this.toSeconds(time);
        const currentTick = this.getTicksAtTime(time);
        return this.getTimeOfTick(currentTick + ticks) - computedTime;
    }
    /**
     * Given a tick, returns the time that tick occurs at.
     * @return The time that the tick occurs.
     */
    getTimeOfTick(tick) {
        const before = this._events.get(tick, "ticks");
        const after = this._events.getAfter(tick, "ticks");
        if (before && before.ticks === tick) {
            return before.time;
        }
        else if (before && after &&
            after.type === "linearRampToValueAtTime" &&
            before.value !== after.value) {
            const val0 = this._fromType(this.getValueAtTime(before.time));
            const val1 = this._fromType(this.getValueAtTime(after.time));
            const delta = (val1 - val0) / (after.time - before.time);
            const k = Math.sqrt(Math.pow(val0, 2) - 2 * delta * (before.ticks - tick));
            const sol1 = (-val0 + k) / delta;
            const sol2 = (-val0 - k) / delta;
            return (sol1 > 0 ? sol1 : sol2) + before.time;
        }
        else if (before) {
            if (before.value === 0) {
                return Infinity;
            }
            else {
                return before.time + (tick - before.ticks) / before.value;
            }
        }
        else {
            return tick / this._initialValue;
        }
    }
    /**
     * Convert some number of ticks their the duration in seconds accounting
     * for any automation curves starting at the given time.
     * @param  ticks The number of ticks to convert to seconds.
     * @param  when  When along the automation timeline to convert the ticks.
     * @return The duration in seconds of the ticks.
     */
    ticksToTime(ticks, when) {
        return this.getDurationOfTicks(ticks, when);
    }
    /**
     * The inverse of [[ticksToTime]]. Convert a duration in
     * seconds to the corresponding number of ticks accounting for any
     * automation curves starting at the given time.
     * @param  duration The time interval to convert to ticks.
     * @param  when When along the automation timeline to convert the ticks.
     * @return The duration in ticks.
     */
    timeToTicks(duration, when) {
        const computedTime = this.toSeconds(when);
        const computedDuration = this.toSeconds(duration);
        const startTicks = this.getTicksAtTime(computedTime);
        const endTicks = this.getTicksAtTime(computedTime + computedDuration);
        return endTicks - startTicks;
    }
    /**
     * Convert from the type when the unit value is BPM
     */
    _fromType(val) {
        if (this.units === "bpm" && this.multiplier) {
            return 1 / (60 / val / this.multiplier);
        }
        else {
            return super._fromType(val);
        }
    }
    /**
     * Special case of type conversion where the units === "bpm"
     */
    _toType(val) {
        if (this.units === "bpm" && this.multiplier) {
            return (val / this.multiplier) * 60;
        }
        else {
            return super._toType(val);
        }
    }
    /**
     * A multiplier on the bpm value. Useful for setting a PPQ relative to the base frequency value.
     */
    get multiplier() {
        return this._multiplier;
    }
    set multiplier(m) {
        // get and reset the current value with the new multiplier
        // might be necessary to clear all the previous values
        const currentVal = this.value;
        this._multiplier = m;
        this.cancelScheduledValues(0);
        this.setValueAtTime(currentVal, 0);
    }
}

/**
 * TickSignal extends Tone.Signal, but adds the capability
 * to calculate the number of elapsed ticks. exponential and target curves
 * are approximated with multiple linear ramps.
 *
 * Thank you Bruno Dias, H. Sofia Pinto, and David M. Matos,
 * for your [WAC paper](https://smartech.gatech.edu/bitstream/handle/1853/54588/WAC2016-49.pdf)
 * describing integrating timing functions for tempo calculations.
 */
class TickSignal extends Signal {
    constructor() {
        super(optionsFromArguments(TickSignal.getDefaults(), arguments, ["value"]));
        this.name = "TickSignal";
        const options = optionsFromArguments(TickSignal.getDefaults(), arguments, ["value"]);
        this.input = this._param = new TickParam({
            context: this.context,
            convert: options.convert,
            multiplier: options.multiplier,
            param: this._constantSource.offset,
            units: options.units,
            value: options.value,
        });
    }
    static getDefaults() {
        return Object.assign(Signal.getDefaults(), {
            multiplier: 1,
            units: "hertz",
            value: 1,
        });
    }
    ticksToTime(ticks, when) {
        return this._param.ticksToTime(ticks, when);
    }
    timeToTicks(duration, when) {
        return this._param.timeToTicks(duration, when);
    }
    getTimeOfTick(tick) {
        return this._param.getTimeOfTick(tick);
    }
    getDurationOfTicks(ticks, time) {
        return this._param.getDurationOfTicks(ticks, time);
    }
    getTicksAtTime(time) {
        return this._param.getTicksAtTime(time);
    }
    /**
     * A multiplier on the bpm value. Useful for setting a PPQ relative to the base frequency value.
     */
    get multiplier() {
        return this._param.multiplier;
    }
    set multiplier(m) {
        this._param.multiplier = m;
    }
    dispose() {
        super.dispose();
        this._param.dispose();
        return this;
    }
}

/**
 * Uses [TickSignal](TickSignal) to track elapsed ticks with complex automation curves.
 */
class TickSource extends ToneWithContext {
    constructor() {
        super(optionsFromArguments(TickSource.getDefaults(), arguments, ["frequency"]));
        this.name = "TickSource";
        /**
         * The state timeline
         */
        this._state = new StateTimeline();
        /**
         * The offset values of the ticks
         */
        this._tickOffset = new Timeline();
        const options = optionsFromArguments(TickSource.getDefaults(), arguments, ["frequency"]);
        this.frequency = new TickSignal({
            context: this.context,
            units: options.units,
            value: options.frequency,
        });
        readOnly(this, "frequency");
        // set the initial state
        this._state.setStateAtTime("stopped", 0);
        // add the first event
        this.setTicksAtTime(0, 0);
    }
    static getDefaults() {
        return Object.assign({
            frequency: 1,
            units: "hertz",
        }, ToneWithContext.getDefaults());
    }
    /**
     * Returns the playback state of the source, either "started", "stopped" or "paused".
     */
    get state() {
        return this.getStateAtTime(this.now());
    }
    /**
     * Start the clock at the given time. Optionally pass in an offset
     * of where to start the tick counter from.
     * @param  time    The time the clock should start
     * @param offset The number of ticks to start the source at
     */
    start(time, offset) {
        const computedTime = this.toSeconds(time);
        if (this._state.getValueAtTime(computedTime) !== "started") {
            this._state.setStateAtTime("started", computedTime);
            if (isDefined(offset)) {
                this.setTicksAtTime(offset, computedTime);
            }
        }
        return this;
    }
    /**
     * Stop the clock. Stopping the clock resets the tick counter to 0.
     * @param time The time when the clock should stop.
     */
    stop(time) {
        const computedTime = this.toSeconds(time);
        // cancel the previous stop
        if (this._state.getValueAtTime(computedTime) === "stopped") {
            const event = this._state.get(computedTime);
            if (event && event.time > 0) {
                this._tickOffset.cancel(event.time);
                this._state.cancel(event.time);
            }
        }
        this._state.cancel(computedTime);
        this._state.setStateAtTime("stopped", computedTime);
        this.setTicksAtTime(0, computedTime);
        return this;
    }
    /**
     * Pause the clock. Pausing does not reset the tick counter.
     * @param time The time when the clock should stop.
     */
    pause(time) {
        const computedTime = this.toSeconds(time);
        if (this._state.getValueAtTime(computedTime) === "started") {
            this._state.setStateAtTime("paused", computedTime);
        }
        return this;
    }
    /**
     * Cancel start/stop/pause and setTickAtTime events scheduled after the given time.
     * @param time When to clear the events after
     */
    cancel(time) {
        time = this.toSeconds(time);
        this._state.cancel(time);
        this._tickOffset.cancel(time);
        return this;
    }
    /**
     * Get the elapsed ticks at the given time
     * @param  time  When to get the tick value
     * @return The number of ticks
     */
    getTicksAtTime(time) {
        const computedTime = this.toSeconds(time);
        const stopEvent = this._state.getLastState("stopped", computedTime);
        // this event allows forEachBetween to iterate until the current time
        const tmpEvent = { state: "paused", time: computedTime };
        this._state.add(tmpEvent);
        // keep track of the previous offset event
        let lastState = stopEvent;
        let elapsedTicks = 0;
        // iterate through all the events since the last stop
        this._state.forEachBetween(stopEvent.time, computedTime + this.sampleTime, e => {
            let periodStartTime = lastState.time;
            // if there is an offset event in this period use that
            const offsetEvent = this._tickOffset.get(e.time);
            if (offsetEvent && offsetEvent.time >= lastState.time) {
                elapsedTicks = offsetEvent.ticks;
                periodStartTime = offsetEvent.time;
            }
            if (lastState.state === "started" && e.state !== "started") {
                elapsedTicks += this.frequency.getTicksAtTime(e.time) - this.frequency.getTicksAtTime(periodStartTime);
            }
            lastState = e;
        });
        // remove the temporary event
        this._state.remove(tmpEvent);
        // return the ticks
        return elapsedTicks;
    }
    /**
     * The number of times the callback was invoked. Starts counting at 0
     * and increments after the callback was invoked. Returns -1 when stopped.
     */
    get ticks() {
        return this.getTicksAtTime(this.now());
    }
    set ticks(t) {
        this.setTicksAtTime(t, this.now());
    }
    /**
     * The time since ticks=0 that the TickSource has been running. Accounts
     * for tempo curves
     */
    get seconds() {
        return this.getSecondsAtTime(this.now());
    }
    set seconds(s) {
        const now = this.now();
        const ticks = this.frequency.timeToTicks(s, now);
        this.setTicksAtTime(ticks, now);
    }
    /**
     * Return the elapsed seconds at the given time.
     * @param  time  When to get the elapsed seconds
     * @return  The number of elapsed seconds
     */
    getSecondsAtTime(time) {
        time = this.toSeconds(time);
        const stopEvent = this._state.getLastState("stopped", time);
        // this event allows forEachBetween to iterate until the current time
        const tmpEvent = { state: "paused", time };
        this._state.add(tmpEvent);
        // keep track of the previous offset event
        let lastState = stopEvent;
        let elapsedSeconds = 0;
        // iterate through all the events since the last stop
        this._state.forEachBetween(stopEvent.time, time + this.sampleTime, e => {
            let periodStartTime = lastState.time;
            // if there is an offset event in this period use that
            const offsetEvent = this._tickOffset.get(e.time);
            if (offsetEvent && offsetEvent.time >= lastState.time) {
                elapsedSeconds = offsetEvent.seconds;
                periodStartTime = offsetEvent.time;
            }
            if (lastState.state === "started" && e.state !== "started") {
                elapsedSeconds += e.time - periodStartTime;
            }
            lastState = e;
        });
        // remove the temporary event
        this._state.remove(tmpEvent);
        // return the ticks
        return elapsedSeconds;
    }
    /**
     * Set the clock's ticks at the given time.
     * @param  ticks The tick value to set
     * @param  time  When to set the tick value
     */
    setTicksAtTime(ticks, time) {
        time = this.toSeconds(time);
        this._tickOffset.cancel(time);
        this._tickOffset.add({
            seconds: this.frequency.getDurationOfTicks(ticks, time),
            ticks,
            time,
        });
        return this;
    }
    /**
     * Returns the scheduled state at the given time.
     * @param  time  The time to query.
     */
    getStateAtTime(time) {
        time = this.toSeconds(time);
        return this._state.getValueAtTime(time);
    }
    /**
     * Get the time of the given tick. The second argument
     * is when to test before. Since ticks can be set (with setTicksAtTime)
     * there may be multiple times for a given tick value.
     * @param  tick The tick number.
     * @param  before When to measure the tick value from.
     * @return The time of the tick
     */
    getTimeOfTick(tick, before = this.now()) {
        const offset = this._tickOffset.get(before);
        const event = this._state.get(before);
        const startTime = Math.max(offset.time, event.time);
        const absoluteTicks = this.frequency.getTicksAtTime(startTime) + tick - offset.ticks;
        return this.frequency.getTimeOfTick(absoluteTicks);
    }
    /**
     * Invoke the callback event at all scheduled ticks between the
     * start time and the end time
     * @param  startTime  The beginning of the search range
     * @param  endTime    The end of the search range
     * @param  callback   The callback to invoke with each tick
     */
    forEachTickBetween(startTime, endTime, callback) {
        // only iterate through the sections where it is "started"
        let lastStateEvent = this._state.get(startTime);
        this._state.forEachBetween(startTime, endTime, event => {
            if (lastStateEvent && lastStateEvent.state === "started" && event.state !== "started") {
                this.forEachTickBetween(Math.max(lastStateEvent.time, startTime), event.time - this.sampleTime, callback);
            }
            lastStateEvent = event;
        });
        let error = null;
        if (lastStateEvent && lastStateEvent.state === "started") {
            const maxStartTime = Math.max(lastStateEvent.time, startTime);
            // figure out the difference between the frequency ticks and the
            const startTicks = this.frequency.getTicksAtTime(maxStartTime);
            const ticksAtStart = this.frequency.getTicksAtTime(lastStateEvent.time);
            const diff = startTicks - ticksAtStart;
            let offset = Math.ceil(diff) - diff;
            // guard against floating point issues
            offset = EQ(offset, 1) ? 0 : offset;
            let nextTickTime = this.frequency.getTimeOfTick(startTicks + offset);
            while (nextTickTime < endTime) {
                try {
                    callback(nextTickTime, Math.round(this.getTicksAtTime(nextTickTime)));
                }
                catch (e) {
                    error = e;
                    break;
                }
                nextTickTime += this.frequency.getDurationOfTicks(1, nextTickTime);
            }
        }
        if (error) {
            throw error;
        }
        return this;
    }
    /**
     * Clean up
     */
    dispose() {
        super.dispose();
        this._state.dispose();
        this._tickOffset.dispose();
        this.frequency.dispose();
        return this;
    }
}

/**
 * A sample accurate clock which provides a callback at the given rate.
 * While the callback is not sample-accurate (it is still susceptible to
 * loose JS timing), the time passed in as the argument to the callback
 * is precise. For most applications, it is better to use Tone.Transport
 * instead of the Clock by itself since you can synchronize multiple callbacks.
 * @example
 * // the callback will be invoked approximately once a second
 * // and will print the time exactly once a second apart.
 * const clock = new Tone.Clock(time => {
 * 	console.log(time);
 * }, 1);
 * clock.start();
 * @category Core
 */
class Clock extends ToneWithContext {
    constructor() {
        super(optionsFromArguments(Clock.getDefaults(), arguments, ["callback", "frequency"]));
        this.name = "Clock";
        /**
         * The callback function to invoke at the scheduled tick.
         */
        this.callback = noOp;
        /**
         * The last time the loop callback was invoked
         */
        this._lastUpdate = 0;
        /**
         * Keep track of the playback state
         */
        this._state = new StateTimeline("stopped");
        /**
         * Context bound reference to the _loop method
         * This is necessary to remove the event in the end.
         */
        this._boundLoop = this._loop.bind(this);
        const options = optionsFromArguments(Clock.getDefaults(), arguments, ["callback", "frequency"]);
        this.callback = options.callback;
        this._tickSource = new TickSource({
            context: this.context,
            frequency: options.frequency,
            units: options.units,
        });
        this._lastUpdate = 0;
        this.frequency = this._tickSource.frequency;
        readOnly(this, "frequency");
        // add an initial state
        this._state.setStateAtTime("stopped", 0);
        // bind a callback to the worker thread
        this.context.on("tick", this._boundLoop);
    }
    static getDefaults() {
        return Object.assign(ToneWithContext.getDefaults(), {
            callback: noOp,
            frequency: 1,
            units: "hertz",
        });
    }
    /**
     * Returns the playback state of the source, either "started", "stopped" or "paused".
     */
    get state() {
        return this._state.getValueAtTime(this.now());
    }
    /**
     * Start the clock at the given time. Optionally pass in an offset
     * of where to start the tick counter from.
     * @param  time    The time the clock should start
     * @param offset  Where the tick counter starts counting from.
     */
    start(time, offset) {
        // make sure the context is running
        assertContextRunning(this.context);
        // start the loop
        const computedTime = this.toSeconds(time);
        this.log("start", computedTime);
        if (this._state.getValueAtTime(computedTime) !== "started") {
            this._state.setStateAtTime("started", computedTime);
            this._tickSource.start(computedTime, offset);
            if (computedTime < this._lastUpdate) {
                this.emit("start", computedTime, offset);
            }
        }
        return this;
    }
    /**
     * Stop the clock. Stopping the clock resets the tick counter to 0.
     * @param time The time when the clock should stop.
     * @example
     * const clock = new Tone.Clock(time => {
     * 	console.log(time);
     * }, 1);
     * clock.start();
     * // stop the clock after 10 seconds
     * clock.stop("+10");
     */
    stop(time) {
        const computedTime = this.toSeconds(time);
        this.log("stop", computedTime);
        this._state.cancel(computedTime);
        this._state.setStateAtTime("stopped", computedTime);
        this._tickSource.stop(computedTime);
        if (computedTime < this._lastUpdate) {
            this.emit("stop", computedTime);
        }
        return this;
    }
    /**
     * Pause the clock. Pausing does not reset the tick counter.
     * @param time The time when the clock should stop.
     */
    pause(time) {
        const computedTime = this.toSeconds(time);
        if (this._state.getValueAtTime(computedTime) === "started") {
            this._state.setStateAtTime("paused", computedTime);
            this._tickSource.pause(computedTime);
            if (computedTime < this._lastUpdate) {
                this.emit("pause", computedTime);
            }
        }
        return this;
    }
    /**
     * The number of times the callback was invoked. Starts counting at 0
     * and increments after the callback was invoked.
     */
    get ticks() {
        return Math.ceil(this.getTicksAtTime(this.now()));
    }
    set ticks(t) {
        this._tickSource.ticks = t;
    }
    /**
     * The time since ticks=0 that the Clock has been running. Accounts for tempo curves
     */
    get seconds() {
        return this._tickSource.seconds;
    }
    set seconds(s) {
        this._tickSource.seconds = s;
    }
    /**
     * Return the elapsed seconds at the given time.
     * @param  time  When to get the elapsed seconds
     * @return  The number of elapsed seconds
     */
    getSecondsAtTime(time) {
        return this._tickSource.getSecondsAtTime(time);
    }
    /**
     * Set the clock's ticks at the given time.
     * @param  ticks The tick value to set
     * @param  time  When to set the tick value
     */
    setTicksAtTime(ticks, time) {
        this._tickSource.setTicksAtTime(ticks, time);
        return this;
    }
    /**
     * Get the time of the given tick. The second argument
     * is when to test before. Since ticks can be set (with setTicksAtTime)
     * there may be multiple times for a given tick value.
     * @param  tick The tick number.
     * @param  before When to measure the tick value from.
     * @return The time of the tick
     */
    getTimeOfTick(tick, before = this.now()) {
        return this._tickSource.getTimeOfTick(tick, before);
    }
    /**
     * Get the clock's ticks at the given time.
     * @param  time  When to get the tick value
     * @return The tick value at the given time.
     */
    getTicksAtTime(time) {
        return this._tickSource.getTicksAtTime(time);
    }
    /**
     * Get the time of the next tick
     * @param  offset The tick number.
     */
    nextTickTime(offset, when) {
        const computedTime = this.toSeconds(when);
        const currentTick = this.getTicksAtTime(computedTime);
        return this._tickSource.getTimeOfTick(currentTick + offset, computedTime);
    }
    /**
     * The scheduling loop.
     */
    _loop() {
        const startTime = this._lastUpdate;
        const endTime = this.now();
        this._lastUpdate = endTime;
        this.log("loop", startTime, endTime);
        if (startTime !== endTime) {
            // the state change events
            this._state.forEachBetween(startTime, endTime, e => {
                switch (e.state) {
                    case "started":
                        const offset = this._tickSource.getTicksAtTime(e.time);
                        this.emit("start", e.time, offset);
                        break;
                    case "stopped":
                        if (e.time !== 0) {
                            this.emit("stop", e.time);
                        }
                        break;
                    case "paused":
                        this.emit("pause", e.time);
                        break;
                }
            });
            // the tick callbacks
            this._tickSource.forEachTickBetween(startTime, endTime, (time, ticks) => {
                this.callback(time, ticks);
            });
        }
    }
    /**
     * Returns the scheduled state at the given time.
     * @param  time  The time to query.
     * @return  The name of the state input in setStateAtTime.
     * @example
     * const clock = new Tone.Clock();
     * clock.start("+0.1");
     * clock.getStateAtTime("+0.1"); // returns "started"
     */
    getStateAtTime(time) {
        const computedTime = this.toSeconds(time);
        return this._state.getValueAtTime(computedTime);
    }
    /**
     * Clean up
     */
    dispose() {
        super.dispose();
        this.context.off("tick", this._boundLoop);
        this._tickSource.dispose();
        this._state.dispose();
        return this;
    }
}
Emitter.mixin(Clock);

/**
 * Wrapper around Web Audio's native [DelayNode](http://webaudio.github.io/web-audio-api/#the-delaynode-interface).
 * @category Core
 * @example
 * return Tone.Offline(() => {
 * 	const delay = new Tone.Delay(0.1).toDestination();
 * 	// connect the signal to both the delay and the destination
 * 	const pulse = new Tone.PulseOscillator().connect(delay).toDestination();
 * 	// start and stop the pulse
 * 	pulse.start(0).stop(0.01);
 * }, 0.5, 1);
 */
class Delay extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(Delay.getDefaults(), arguments, ["delayTime", "maxDelay"]));
        this.name = "Delay";
        const options = optionsFromArguments(Delay.getDefaults(), arguments, ["delayTime", "maxDelay"]);
        const maxDelayInSeconds = this.toSeconds(options.maxDelay);
        this._maxDelay = Math.max(maxDelayInSeconds, this.toSeconds(options.delayTime));
        this._delayNode = this.input = this.output = this.context.createDelay(maxDelayInSeconds);
        this.delayTime = new Param({
            context: this.context,
            param: this._delayNode.delayTime,
            units: "time",
            value: options.delayTime,
            minValue: 0,
            maxValue: this.maxDelay,
        });
        readOnly(this, "delayTime");
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            delayTime: 0,
            maxDelay: 1,
        });
    }
    /**
     * The maximum delay time. This cannot be changed after
     * the value is passed into the constructor.
     */
    get maxDelay() {
        return this._maxDelay;
    }
    /**
     * Clean up.
     */
    dispose() {
        super.dispose();
        this._delayNode.disconnect();
        this.delayTime.dispose();
        return this;
    }
}

/**
 * Generate a buffer by rendering all of the Tone.js code within the callback using the OfflineAudioContext.
 * The OfflineAudioContext is capable of rendering much faster than real time in many cases.
 * The callback function also passes in an offline instance of [[Context]] which can be used
 * to schedule events along the Transport.
 * @param  callback  All Tone.js nodes which are created and scheduled within this callback are recorded into the output Buffer.
 * @param  duration     the amount of time to record for.
 * @return  The promise which is invoked with the ToneAudioBuffer of the recorded output.
 * @example
 * // render 2 seconds of the oscillator
 * Tone.Offline(() => {
 * 	// only nodes created in this callback will be recorded
 * 	const oscillator = new Tone.Oscillator().toDestination().start(0);
 * }, 2).then((buffer) => {
 * 	// do something with the output buffer
 * 	console.log(buffer);
 * });
 * @example
 * // can also schedule events along the Transport
 * // using the passed in Offline Transport
 * Tone.Offline(({ transport }) => {
 * 	const osc = new Tone.Oscillator().toDestination();
 * 	transport.schedule(time => {
 * 		osc.start(time).stop(time + 0.1);
 * 	}, 1);
 * 	// make sure to start the transport
 * 	transport.start(0.2);
 * }, 4).then((buffer) => {
 * 	// do something with the output buffer
 * 	console.log(buffer);
 * });
 * @category Core
 */
function Offline(callback, duration, channels = 2, sampleRate = getContext().sampleRate) {
    return __awaiter(this, void 0, void 0, function* () {
        // set the OfflineAudioContext based on the current context
        const originalContext = getContext();
        const context = new OfflineContext(channels, duration, sampleRate);
        setContext(context);
        // invoke the callback/scheduling
        yield callback(context);
        // then render the audio
        const bufferPromise = context.render();
        // return the original AudioContext
        setContext(originalContext);
        // await the rendering
        const buffer = yield bufferPromise;
        // return the audio
        return new ToneAudioBuffer(buffer);
    });
}

/**
 * A data structure for holding multiple buffers in a Map-like datastructure.
 *
 * @example
 * const pianoSamples = new Tone.ToneAudioBuffers({
 * 	A1: "https://tonejs.github.io/audio/casio/A1.mp3",
 * 	A2: "https://tonejs.github.io/audio/casio/A2.mp3",
 * }, () => {
 * 	const player = new Tone.Player().toDestination();
 * 	// play one of the samples when they all load
 * 	player.buffer = pianoSamples.get("A2");
 * 	player.start();
 * });
 * @example
 * // To pass in additional parameters in the second parameter
 * const buffers = new Tone.ToneAudioBuffers({
 * 	 urls: {
 * 		 A1: "A1.mp3",
 * 		 A2: "A2.mp3",
 * 	 },
 * 	 onload: () => console.log("loaded"),
 * 	 baseUrl: "https://tonejs.github.io/audio/casio/"
 * });
 * @category Core
 */
class ToneAudioBuffers extends Tone {
    constructor() {
        super();
        this.name = "ToneAudioBuffers";
        /**
         * All of the buffers
         */
        this._buffers = new Map();
        /**
         * Keep track of the number of loaded buffers
         */
        this._loadingCount = 0;
        const options = optionsFromArguments(ToneAudioBuffers.getDefaults(), arguments, ["urls", "onload", "baseUrl"], "urls");
        this.baseUrl = options.baseUrl;
        // add each one
        Object.keys(options.urls).forEach(name => {
            this._loadingCount++;
            const url = options.urls[name];
            this.add(name, url, this._bufferLoaded.bind(this, options.onload), options.onerror);
        });
    }
    static getDefaults() {
        return {
            baseUrl: "",
            onerror: noOp,
            onload: noOp,
            urls: {},
        };
    }
    /**
     * True if the buffers object has a buffer by that name.
     * @param  name  The key or index of the buffer.
     */
    has(name) {
        return this._buffers.has(name.toString());
    }
    /**
     * Get a buffer by name. If an array was loaded,
     * then use the array index.
     * @param  name  The key or index of the buffer.
     */
    get(name) {
        assert(this.has(name), `ToneAudioBuffers has no buffer named: ${name}`);
        return this._buffers.get(name.toString());
    }
    /**
     * A buffer was loaded. decrement the counter.
     */
    _bufferLoaded(callback) {
        this._loadingCount--;
        if (this._loadingCount === 0 && callback) {
            callback();
        }
    }
    /**
     * If the buffers are loaded or not
     */
    get loaded() {
        return Array.from(this._buffers).every(([_, buffer]) => buffer.loaded);
    }
    /**
     * Add a buffer by name and url to the Buffers
     * @param  name      A unique name to give the buffer
     * @param  url  Either the url of the bufer, or a buffer which will be added with the given name.
     * @param  callback  The callback to invoke when the url is loaded.
     * @param  onerror  Invoked if the buffer can't be loaded
     */
    add(name, url, callback = noOp, onerror = noOp) {
        if (isString(url)) {
            this._buffers.set(name.toString(), new ToneAudioBuffer(this.baseUrl + url, callback, onerror));
        }
        else {
            this._buffers.set(name.toString(), new ToneAudioBuffer(url, callback, onerror));
        }
        return this;
    }
    dispose() {
        super.dispose();
        this._buffers.forEach(buffer => buffer.dispose());
        this._buffers.clear();
        return this;
    }
}

/**
 * Midi is a primitive type for encoding Time values.
 * Midi can be constructed with or without the `new` keyword. Midi can be passed
 * into the parameter of any method which takes time as an argument.
 * @category Unit
 */
class MidiClass extends FrequencyClass {
    constructor() {
        super(...arguments);
        this.name = "MidiClass";
        this.defaultUnits = "midi";
    }
    /**
     * Returns the value of a frequency in the current units
     */
    _frequencyToUnits(freq) {
        return ftom(super._frequencyToUnits(freq));
    }
    /**
     * Returns the value of a tick in the current time units
     */
    _ticksToUnits(ticks) {
        return ftom(super._ticksToUnits(ticks));
    }
    /**
     * Return the value of the beats in the current units
     */
    _beatsToUnits(beats) {
        return ftom(super._beatsToUnits(beats));
    }
    /**
     * Returns the value of a second in the current units
     */
    _secondsToUnits(seconds) {
        return ftom(super._secondsToUnits(seconds));
    }
    /**
     * Return the value of the frequency as a MIDI note
     * @example
     * Tone.Midi(60).toMidi(); // 60
     */
    toMidi() {
        return this.valueOf();
    }
    /**
     * Return the value of the frequency as a MIDI note
     * @example
     * Tone.Midi(60).toFrequency(); // 261.6255653005986
     */
    toFrequency() {
        return mtof(this.toMidi());
    }
    /**
     * Transposes the frequency by the given number of semitones.
     * @return A new transposed MidiClass
     * @example
     * Tone.Midi("A4").transpose(3); // "C5"
     */
    transpose(interval) {
        return new MidiClass(this.context, this.toMidi() + interval);
    }
}
/**
 * Convert a value into a FrequencyClass object.
 * @category Unit
 */
function Midi(value, units) {
    return new MidiClass(getContext(), value, units);
}

/**
 * Ticks is a primitive type for encoding Time values.
 * Ticks can be constructed with or without the `new` keyword. Ticks can be passed
 * into the parameter of any method which takes time as an argument.
 * @example
 * const t = Tone.Ticks("4n"); // a quarter note as ticks
 * @category Unit
 */
class TicksClass extends TransportTimeClass {
    constructor() {
        super(...arguments);
        this.name = "Ticks";
        this.defaultUnits = "i";
    }
    /**
     * Get the current time in the given units
     */
    _now() {
        return this.context.transport.ticks;
    }
    /**
     * Return the value of the beats in the current units
     */
    _beatsToUnits(beats) {
        return this._getPPQ() * beats;
    }
    /**
     * Returns the value of a second in the current units
     */
    _secondsToUnits(seconds) {
        return Math.floor(seconds / (60 / this._getBpm()) * this._getPPQ());
    }
    /**
     * Returns the value of a tick in the current time units
     */
    _ticksToUnits(ticks) {
        return ticks;
    }
    /**
     * Return the time in ticks
     */
    toTicks() {
        return this.valueOf();
    }
    /**
     * Return the time in seconds
     */
    toSeconds() {
        return (this.valueOf() / this._getPPQ()) * (60 / this._getBpm());
    }
}
/**
 * Convert a time representation to ticks
 * @category Unit
 */
function Ticks(value, units) {
    return new TicksClass(getContext(), value, units);
}

/**
 * Draw is useful for synchronizing visuals and audio events.
 * Callbacks from Tone.Transport or any of the Tone.Event classes
 * always happen _before_ the scheduled time and are not synchronized
 * to the animation frame so they are not good for triggering tightly
 * synchronized visuals and sound. Draw makes it easy to schedule
 * callbacks using the AudioContext time and uses requestAnimationFrame.
 * @example
 * Tone.Transport.schedule((time) => {
 * 	// use the time argument to schedule a callback with Draw
 * 	Tone.Draw.schedule(() => {
 * 		// do drawing or DOM manipulation here
 * 		console.log(time);
 * 	}, time);
 * }, "+0.5");
 * Tone.Transport.start();
 * @category Core
 */
class Draw extends ToneWithContext {
    constructor() {
        super(...arguments);
        this.name = "Draw";
        /**
         * The duration after which events are not invoked.
         */
        this.expiration = 0.25;
        /**
         * The amount of time before the scheduled time
         * that the callback can be invoked. Default is
         * half the time of an animation frame (0.008 seconds).
         */
        this.anticipation = 0.008;
        /**
         * All of the events.
         */
        this._events = new Timeline();
        /**
         * The draw loop
         */
        this._boundDrawLoop = this._drawLoop.bind(this);
        /**
         * The animation frame id
         */
        this._animationFrame = -1;
    }
    /**
     * Schedule a function at the given time to be invoked
     * on the nearest animation frame.
     * @param  callback  Callback is invoked at the given time.
     * @param  time      The time relative to the AudioContext time to invoke the callback.
     * @example
     * Tone.Transport.scheduleRepeat(time => {
     * 	Tone.Draw.schedule(() => console.log(time), time);
     * }, 1);
     * Tone.Transport.start();
     */
    schedule(callback, time) {
        this._events.add({
            callback,
            time: this.toSeconds(time),
        });
        // start the draw loop on the first event
        if (this._events.length === 1) {
            this._animationFrame = requestAnimationFrame(this._boundDrawLoop);
        }
        return this;
    }
    /**
     * Cancel events scheduled after the given time
     * @param  after  Time after which scheduled events will be removed from the scheduling timeline.
     */
    cancel(after) {
        this._events.cancel(this.toSeconds(after));
        return this;
    }
    /**
     * The draw loop
     */
    _drawLoop() {
        const now = this.context.currentTime;
        while (this._events.length && this._events.peek().time - this.anticipation <= now) {
            const event = this._events.shift();
            if (event && now - event.time <= this.expiration) {
                event.callback();
            }
        }
        if (this._events.length > 0) {
            this._animationFrame = requestAnimationFrame(this._boundDrawLoop);
        }
    }
    dispose() {
        super.dispose();
        this._events.dispose();
        cancelAnimationFrame(this._animationFrame);
        return this;
    }
}
//-------------------------------------
// 	INITIALIZATION
//-------------------------------------
onContextInit(context => {
    context.draw = new Draw({ context });
});
onContextClose(context => {
    context.draw.dispose();
});

/**
 * Similar to Tone.Timeline, but all events represent
 * intervals with both "time" and "duration" times. The
 * events are placed in a tree structure optimized
 * for querying an intersection point with the timeline
 * events. Internally uses an [Interval Tree](https://en.wikipedia.org/wiki/Interval_tree)
 * to represent the data.
 */
class IntervalTimeline extends Tone {
    constructor() {
        super(...arguments);
        this.name = "IntervalTimeline";
        /**
         * The root node of the inteval tree
         */
        this._root = null;
        /**
         * Keep track of the length of the timeline.
         */
        this._length = 0;
    }
    /**
     * The event to add to the timeline. All events must
     * have a time and duration value
     * @param  event  The event to add to the timeline
     */
    add(event) {
        assert(isDefined(event.time), "Events must have a time property");
        assert(isDefined(event.duration), "Events must have a duration parameter");
        event.time = event.time.valueOf();
        let node = new IntervalNode(event.time, event.time + event.duration, event);
        if (this._root === null) {
            this._root = node;
        }
        else {
            this._root.insert(node);
        }
        this._length++;
        // Restructure tree to be balanced
        while (node !== null) {
            node.updateHeight();
            node.updateMax();
            this._rebalance(node);
            node = node.parent;
        }
        return this;
    }
    /**
     * Remove an event from the timeline.
     * @param  event  The event to remove from the timeline
     */
    remove(event) {
        if (this._root !== null) {
            const results = [];
            this._root.search(event.time, results);
            for (const node of results) {
                if (node.event === event) {
                    this._removeNode(node);
                    this._length--;
                    break;
                }
            }
        }
        return this;
    }
    /**
     * The number of items in the timeline.
     * @readOnly
     */
    get length() {
        return this._length;
    }
    /**
     * Remove events whose time time is after the given time
     * @param  after  The time to query.
     */
    cancel(after) {
        this.forEachFrom(after, event => this.remove(event));
        return this;
    }
    /**
     * Set the root node as the given node
     */
    _setRoot(node) {
        this._root = node;
        if (this._root !== null) {
            this._root.parent = null;
        }
    }
    /**
     * Replace the references to the node in the node's parent
     * with the replacement node.
     */
    _replaceNodeInParent(node, replacement) {
        if (node.parent !== null) {
            if (node.isLeftChild()) {
                node.parent.left = replacement;
            }
            else {
                node.parent.right = replacement;
            }
            this._rebalance(node.parent);
        }
        else {
            this._setRoot(replacement);
        }
    }
    /**
     * Remove the node from the tree and replace it with
     * a successor which follows the schema.
     */
    _removeNode(node) {
        if (node.left === null && node.right === null) {
            this._replaceNodeInParent(node, null);
        }
        else if (node.right === null) {
            this._replaceNodeInParent(node, node.left);
        }
        else if (node.left === null) {
            this._replaceNodeInParent(node, node.right);
        }
        else {
            const balance = node.getBalance();
            let replacement;
            let temp = null;
            if (balance > 0) {
                if (node.left.right === null) {
                    replacement = node.left;
                    replacement.right = node.right;
                    temp = replacement;
                }
                else {
                    replacement = node.left.right;
                    while (replacement.right !== null) {
                        replacement = replacement.right;
                    }
                    if (replacement.parent) {
                        replacement.parent.right = replacement.left;
                        temp = replacement.parent;
                        replacement.left = node.left;
                        replacement.right = node.right;
                    }
                }
            }
            else if (node.right.left === null) {
                replacement = node.right;
                replacement.left = node.left;
                temp = replacement;
            }
            else {
                replacement = node.right.left;
                while (replacement.left !== null) {
                    replacement = replacement.left;
                }
                if (replacement.parent) {
                    replacement.parent.left = replacement.right;
                    temp = replacement.parent;
                    replacement.left = node.left;
                    replacement.right = node.right;
                }
            }
            if (node.parent !== null) {
                if (node.isLeftChild()) {
                    node.parent.left = replacement;
                }
                else {
                    node.parent.right = replacement;
                }
            }
            else {
                this._setRoot(replacement);
            }
            if (temp) {
                this._rebalance(temp);
            }
        }
        node.dispose();
    }
    /**
     * Rotate the tree to the left
     */
    _rotateLeft(node) {
        const parent = node.parent;
        const isLeftChild = node.isLeftChild();
        // Make node.right the new root of this sub tree (instead of node)
        const pivotNode = node.right;
        if (pivotNode) {
            node.right = pivotNode.left;
            pivotNode.left = node;
        }
        if (parent !== null) {
            if (isLeftChild) {
                parent.left = pivotNode;
            }
            else {
                parent.right = pivotNode;
            }
        }
        else {
            this._setRoot(pivotNode);
        }
    }
    /**
     * Rotate the tree to the right
     */
    _rotateRight(node) {
        const parent = node.parent;
        const isLeftChild = node.isLeftChild();
        // Make node.left the new root of this sub tree (instead of node)
        const pivotNode = node.left;
        if (pivotNode) {
            node.left = pivotNode.right;
            pivotNode.right = node;
        }
        if (parent !== null) {
            if (isLeftChild) {
                parent.left = pivotNode;
            }
            else {
                parent.right = pivotNode;
            }
        }
        else {
            this._setRoot(pivotNode);
        }
    }
    /**
     * Balance the BST
     */
    _rebalance(node) {
        const balance = node.getBalance();
        if (balance > 1 && node.left) {
            if (node.left.getBalance() < 0) {
                this._rotateLeft(node.left);
            }
            else {
                this._rotateRight(node);
            }
        }
        else if (balance < -1 && node.right) {
            if (node.right.getBalance() > 0) {
                this._rotateRight(node.right);
            }
            else {
                this._rotateLeft(node);
            }
        }
    }
    /**
     * Get an event whose time and duration span the give time. Will
     * return the match whose "time" value is closest to the given time.
     * @return  The event which spans the desired time
     */
    get(time) {
        if (this._root !== null) {
            const results = [];
            this._root.search(time, results);
            if (results.length > 0) {
                let max = results[0];
                for (let i = 1; i < results.length; i++) {
                    if (results[i].low > max.low) {
                        max = results[i];
                    }
                }
                return max.event;
            }
        }
        return null;
    }
    /**
     * Iterate over everything in the timeline.
     * @param  callback The callback to invoke with every item
     */
    forEach(callback) {
        if (this._root !== null) {
            const allNodes = [];
            this._root.traverse(node => allNodes.push(node));
            allNodes.forEach(node => {
                if (node.event) {
                    callback(node.event);
                }
            });
        }
        return this;
    }
    /**
     * Iterate over everything in the array in which the given time
     * overlaps with the time and duration time of the event.
     * @param  time The time to check if items are overlapping
     * @param  callback The callback to invoke with every item
     */
    forEachAtTime(time, callback) {
        if (this._root !== null) {
            const results = [];
            this._root.search(time, results);
            results.forEach(node => {
                if (node.event) {
                    callback(node.event);
                }
            });
        }
        return this;
    }
    /**
     * Iterate over everything in the array in which the time is greater
     * than or equal to the given time.
     * @param  time The time to check if items are before
     * @param  callback The callback to invoke with every item
     */
    forEachFrom(time, callback) {
        if (this._root !== null) {
            const results = [];
            this._root.searchAfter(time, results);
            results.forEach(node => {
                if (node.event) {
                    callback(node.event);
                }
            });
        }
        return this;
    }
    /**
     * Clean up
     */
    dispose() {
        super.dispose();
        if (this._root !== null) {
            this._root.traverse(node => node.dispose());
        }
        this._root = null;
        return this;
    }
}
//-------------------------------------
// 	INTERVAL NODE HELPER
//-------------------------------------
/**
 * Represents a node in the binary search tree, with the addition
 * of a "high" value which keeps track of the highest value of
 * its children.
 * References:
 * https://brooknovak.wordpress.com/2013/12/07/augmented-interval-tree-in-c/
 * http://www.mif.vu.lt/~valdas/ALGORITMAI/LITERATURA/Cormen/Cormen.pdf
 * @param low
 * @param high
 */
class IntervalNode {
    constructor(low, high, event) {
        // the nodes to the left
        this._left = null;
        // the nodes to the right
        this._right = null;
        // the parent node
        this.parent = null;
        // the number of child nodes
        this.height = 0;
        this.event = event;
        // the low value
        this.low = low;
        // the high value
        this.high = high;
        // the high value for this and all child nodes
        this.max = this.high;
    }
    /**
     * Insert a node into the correct spot in the tree
     */
    insert(node) {
        if (node.low <= this.low) {
            if (this.left === null) {
                this.left = node;
            }
            else {
                this.left.insert(node);
            }
        }
        else if (this.right === null) {
            this.right = node;
        }
        else {
            this.right.insert(node);
        }
    }
    /**
     * Search the tree for nodes which overlap
     * with the given point
     * @param  point  The point to query
     * @param  results  The array to put the results
     */
    search(point, results) {
        // If p is to the right of the rightmost point of any interval
        // in this node and all children, there won't be any matches.
        if (point > this.max) {
            return;
        }
        // Search left children
        if (this.left !== null) {
            this.left.search(point, results);
        }
        // Check this node
        if (this.low <= point && this.high > point) {
            results.push(this);
        }
        // If p is to the left of the time of this interval,
        // then it can't be in any child to the right.
        if (this.low > point) {
            return;
        }
        // Search right children
        if (this.right !== null) {
            this.right.search(point, results);
        }
    }
    /**
     * Search the tree for nodes which are less
     * than the given point
     * @param  point  The point to query
     * @param  results  The array to put the results
     */
    searchAfter(point, results) {
        // Check this node
        if (this.low >= point) {
            results.push(this);
            if (this.left !== null) {
                this.left.searchAfter(point, results);
            }
        }
        // search the right side
        if (this.right !== null) {
            this.right.searchAfter(point, results);
        }
    }
    /**
     * Invoke the callback on this element and both it's branches
     * @param  {Function}  callback
     */
    traverse(callback) {
        callback(this);
        if (this.left !== null) {
            this.left.traverse(callback);
        }
        if (this.right !== null) {
            this.right.traverse(callback);
        }
    }
    /**
     * Update the height of the node
     */
    updateHeight() {
        if (this.left !== null && this.right !== null) {
            this.height = Math.max(this.left.height, this.right.height) + 1;
        }
        else if (this.right !== null) {
            this.height = this.right.height + 1;
        }
        else if (this.left !== null) {
            this.height = this.left.height + 1;
        }
        else {
            this.height = 0;
        }
    }
    /**
     * Update the height of the node
     */
    updateMax() {
        this.max = this.high;
        if (this.left !== null) {
            this.max = Math.max(this.max, this.left.max);
        }
        if (this.right !== null) {
            this.max = Math.max(this.max, this.right.max);
        }
    }
    /**
     * The balance is how the leafs are distributed on the node
     * @return  Negative numbers are balanced to the right
     */
    getBalance() {
        let balance = 0;
        if (this.left !== null && this.right !== null) {
            balance = this.left.height - this.right.height;
        }
        else if (this.left !== null) {
            balance = this.left.height + 1;
        }
        else if (this.right !== null) {
            balance = -(this.right.height + 1);
        }
        return balance;
    }
    /**
     * @returns true if this node is the left child of its parent
     */
    isLeftChild() {
        return this.parent !== null && this.parent.left === this;
    }
    /**
     * get/set the left node
     */
    get left() {
        return this._left;
    }
    set left(node) {
        this._left = node;
        if (node !== null) {
            node.parent = this;
        }
        this.updateHeight();
        this.updateMax();
    }
    /**
     * get/set the right node
     */
    get right() {
        return this._right;
    }
    set right(node) {
        this._right = node;
        if (node !== null) {
            node.parent = this;
        }
        this.updateHeight();
        this.updateMax();
    }
    /**
     * null out references.
     */
    dispose() {
        this.parent = null;
        this._left = null;
        this._right = null;
        this.event = null;
    }
}

var Units = /*#__PURE__*/Object.freeze({
    __proto__: null
});

/**
 * Volume is a simple volume node, useful for creating a volume fader.
 *
 * @example
 * const vol = new Tone.Volume(-12).toDestination();
 * const osc = new Tone.Oscillator().connect(vol).start();
 * @category Component
 */
class Volume extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(Volume.getDefaults(), arguments, ["volume"]));
        this.name = "Volume";
        const options = optionsFromArguments(Volume.getDefaults(), arguments, ["volume"]);
        this.input = this.output = new Gain({
            context: this.context,
            gain: options.volume,
            units: "decibels",
        });
        this.volume = this.output.gain;
        readOnly(this, "volume");
        this._unmutedVolume = options.volume;
        // set the mute initially
        this.mute = options.mute;
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            mute: false,
            volume: 0,
        });
    }
    /**
     * Mute the output.
     * @example
     * const vol = new Tone.Volume(-12).toDestination();
     * const osc = new Tone.Oscillator().connect(vol).start();
     * // mute the output
     * vol.mute = true;
     */
    get mute() {
        return this.volume.value === -Infinity;
    }
    set mute(mute) {
        if (!this.mute && mute) {
            this._unmutedVolume = this.volume.value;
            // maybe it should ramp here?
            this.volume.value = -Infinity;
        }
        else if (this.mute && !mute) {
            this.volume.value = this._unmutedVolume;
        }
    }
    /**
     * clean up
     */
    dispose() {
        super.dispose();
        this.input.dispose();
        this.volume.dispose();
        return this;
    }
}

/**
 * A single master output which is connected to the
 * AudioDestinationNode (aka your speakers).
 * It provides useful conveniences such as the ability
 * to set the volume and mute the entire application.
 * It also gives you the ability to apply master effects to your application.
 *
 * @example
 * const oscillator = new Tone.Oscillator().start();
 * // the audio will go from the oscillator to the speakers
 * oscillator.connect(Tone.getDestination());
 * // a convenience for connecting to the master output is also provided:
 * oscillator.toDestination();
 * @category Core
 */
class Destination extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(Destination.getDefaults(), arguments));
        this.name = "Destination";
        this.input = new Volume({ context: this.context });
        this.output = new Gain({ context: this.context });
        /**
         * The volume of the master output in decibels. -Infinity is silent, and 0 is no change.
         * @example
         * const osc = new Tone.Oscillator().toDestination();
         * osc.start();
         * // ramp the volume down to silent over 10 seconds
         * Tone.getDestination().volume.rampTo(-Infinity, 10);
         */
        this.volume = this.input.volume;
        const options = optionsFromArguments(Destination.getDefaults(), arguments);
        connectSeries(this.input, this.output, this.context.rawContext.destination);
        this.mute = options.mute;
        this._internalChannels = [this.input, this.context.rawContext.destination, this.output];
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            mute: false,
            volume: 0,
        });
    }
    /**
     * Mute the output.
     * @example
     * const oscillator = new Tone.Oscillator().start().toDestination();
     * setTimeout(() => {
     * 	// mute the output
     * 	Tone.Destination.mute = true;
     * }, 1000);
     */
    get mute() {
        return this.input.mute;
    }
    set mute(mute) {
        this.input.mute = mute;
    }
    /**
     * Add a master effects chain. NOTE: this will disconnect any nodes which were previously
     * chained in the master effects chain.
     * @param args All arguments will be connected in a row and the Master will be routed through it.
     * @example
     * // route all audio through a filter and compressor
     * const lowpass = new Tone.Filter(800, "lowpass");
     * const compressor = new Tone.Compressor(-18);
     * Tone.Destination.chain(lowpass, compressor);
     */
    chain(...args) {
        this.input.disconnect();
        args.unshift(this.input);
        args.push(this.output);
        connectSeries(...args);
        return this;
    }
    /**
     * The maximum number of channels the system can output
     * @example
     * console.log(Tone.Destination.maxChannelCount);
     */
    get maxChannelCount() {
        return this.context.rawContext.destination.maxChannelCount;
    }
    /**
     * Clean up
     */
    dispose() {
        super.dispose();
        this.volume.dispose();
        return this;
    }
}
//-------------------------------------
// 	INITIALIZATION
//-------------------------------------
onContextInit(context => {
    context.destination = new Destination({ context });
});
onContextClose(context => {
    context.destination.dispose();
});

/**
 * Represents a single value which is gettable and settable in a timed way
 */
class TimelineValue extends Tone {
    /**
     * @param initialValue The value to return if there is no scheduled values
     */
    constructor(initialValue) {
        super();
        this.name = "TimelineValue";
        /**
         * The timeline which stores the values
         */
        this._timeline = new Timeline({ memory: 10 });
        this._initialValue = initialValue;
    }
    /**
     * Set the value at the given time
     */
    set(value, time) {
        this._timeline.add({
            value, time
        });
        return this;
    }
    /**
     * Get the value at the given time
     */
    get(time) {
        const event = this._timeline.get(time);
        if (event) {
            return event.value;
        }
        else {
            return this._initialValue;
        }
    }
}

/**
 * TransportEvent is an internal class used by [[Transport]]
 * to schedule events. Do no invoke this class directly, it is
 * handled from within Tone.Transport.
 */
class TransportEvent {
    /**
     * @param transport The transport object which the event belongs to
     */
    constructor(transport, opts) {
        /**
         * The unique id of the event
         */
        this.id = TransportEvent._eventId++;
        const options = Object.assign(TransportEvent.getDefaults(), opts);
        this.transport = transport;
        this.callback = options.callback;
        this._once = options.once;
        this.time = options.time;
    }
    static getDefaults() {
        return {
            callback: noOp,
            once: false,
            time: 0,
        };
    }
    /**
     * Invoke the event callback.
     * @param  time  The AudioContext time in seconds of the event
     */
    invoke(time) {
        if (this.callback) {
            this.callback(time);
            if (this._once) {
                this.transport.clear(this.id);
            }
        }
    }
    /**
     * Clean up
     */
    dispose() {
        this.callback = undefined;
        return this;
    }
}
/**
 * Current ID counter
 */
TransportEvent._eventId = 0;

/**
 * TransportRepeatEvent is an internal class used by Tone.Transport
 * to schedule repeat events. This class should not be instantiated directly.
 */
class TransportRepeatEvent extends TransportEvent {
    /**
     * @param transport The transport object which the event belongs to
     */
    constructor(transport, opts) {
        super(transport, opts);
        /**
         * The ID of the current timeline event
         */
        this._currentId = -1;
        /**
         * The ID of the next timeline event
         */
        this._nextId = -1;
        /**
         * The time of the next event
         */
        this._nextTick = this.time;
        /**
         * a reference to the bound start method
         */
        this._boundRestart = this._restart.bind(this);
        const options = Object.assign(TransportRepeatEvent.getDefaults(), opts);
        this.duration = new TicksClass(transport.context, options.duration).valueOf();
        this._interval = new TicksClass(transport.context, options.interval).valueOf();
        this._nextTick = options.time;
        this.transport.on("start", this._boundRestart);
        this.transport.on("loopStart", this._boundRestart);
        this.context = this.transport.context;
        this._restart();
    }
    static getDefaults() {
        return Object.assign({}, TransportEvent.getDefaults(), {
            duration: Infinity,
            interval: 1,
            once: false,
        });
    }
    /**
     * Invoke the callback. Returns the tick time which
     * the next event should be scheduled at.
     * @param  time  The AudioContext time in seconds of the event
     */
    invoke(time) {
        // create more events if necessary
        this._createEvents(time);
        // call the super class
        super.invoke(time);
    }
    /**
     * Push more events onto the timeline to keep up with the position of the timeline
     */
    _createEvents(time) {
        // schedule the next event
        const ticks = this.transport.getTicksAtTime(time);
        if (ticks >= this.time && ticks >= this._nextTick && this._nextTick + this._interval < this.time + this.duration) {
            this._nextTick += this._interval;
            this._currentId = this._nextId;
            this._nextId = this.transport.scheduleOnce(this.invoke.bind(this), new TicksClass(this.context, this._nextTick).toSeconds());
        }
    }
    /**
     * Push more events onto the timeline to keep up with the position of the timeline
     */
    _restart(time) {
        this.transport.clear(this._currentId);
        this.transport.clear(this._nextId);
        this._nextTick = this.time;
        const ticks = this.transport.getTicksAtTime(time);
        if (ticks > this.time) {
            this._nextTick = this.time + Math.ceil((ticks - this.time) / this._interval) * this._interval;
        }
        this._currentId = this.transport.scheduleOnce(this.invoke.bind(this), new TicksClass(this.context, this._nextTick).toSeconds());
        this._nextTick += this._interval;
        this._nextId = this.transport.scheduleOnce(this.invoke.bind(this), new TicksClass(this.context, this._nextTick).toSeconds());
    }
    /**
     * Clean up
     */
    dispose() {
        super.dispose();
        this.transport.clear(this._currentId);
        this.transport.clear(this._nextId);
        this.transport.off("start", this._boundRestart);
        this.transport.off("loopStart", this._boundRestart);
        return this;
    }
}

/**
 * Transport for timing musical events.
 * Supports tempo curves and time changes. Unlike browser-based timing (setInterval, requestAnimationFrame)
 * Transport timing events pass in the exact time of the scheduled event
 * in the argument of the callback function. Pass that time value to the object
 * you're scheduling. <br><br>
 * A single transport is created for you when the library is initialized.
 * <br><br>
 * The transport emits the events: "start", "stop", "pause", and "loop" which are
 * called with the time of that event as the argument.
 *
 * @example
 * const osc = new Tone.Oscillator().toDestination();
 * // repeated event every 8th note
 * Tone.Transport.scheduleRepeat((time) => {
 * 	// use the callback time to schedule events
 * 	osc.start(time).stop(time + 0.1);
 * }, "8n");
 * // transport must be started before it starts invoking events
 * Tone.Transport.start();
 * @category Core
 */
class Transport extends ToneWithContext {
    constructor() {
        super(optionsFromArguments(Transport.getDefaults(), arguments));
        this.name = "Transport";
        //-------------------------------------
        // 	LOOPING
        //-------------------------------------
        /**
         * If the transport loops or not.
         */
        this._loop = new TimelineValue(false);
        /**
         * The loop start position in ticks
         */
        this._loopStart = 0;
        /**
         * The loop end position in ticks
         */
        this._loopEnd = 0;
        //-------------------------------------
        // 	TIMELINE EVENTS
        //-------------------------------------
        /**
         * All the events in an object to keep track by ID
         */
        this._scheduledEvents = {};
        /**
         * The scheduled events.
         */
        this._timeline = new Timeline();
        /**
         * Repeated events
         */
        this._repeatedEvents = new IntervalTimeline();
        /**
         * All of the synced Signals
         */
        this._syncedSignals = [];
        /**
         * The swing amount
         */
        this._swingAmount = 0;
        const options = optionsFromArguments(Transport.getDefaults(), arguments);
        // CLOCK/TEMPO
        this._ppq = options.ppq;
        this._clock = new Clock({
            callback: this._processTick.bind(this),
            context: this.context,
            frequency: 0,
            units: "bpm",
        });
        this._bindClockEvents();
        this.bpm = this._clock.frequency;
        this._clock.frequency.multiplier = options.ppq;
        this.bpm.setValueAtTime(options.bpm, 0);
        readOnly(this, "bpm");
        this._timeSignature = options.timeSignature;
        // SWING
        this._swingTicks = options.ppq / 2; // 8n
    }
    static getDefaults() {
        return Object.assign(ToneWithContext.getDefaults(), {
            bpm: 120,
            loopEnd: "4m",
            loopStart: 0,
            ppq: 192,
            swing: 0,
            swingSubdivision: "8n",
            timeSignature: 4,
        });
    }
    //-------------------------------------
    // 	TICKS
    //-------------------------------------
    /**
     * called on every tick
     * @param  tickTime clock relative tick time
     */
    _processTick(tickTime, ticks) {
        // do the loop test
        if (this._loop.get(tickTime)) {
            if (ticks >= this._loopEnd) {
                this.emit("loopEnd", tickTime);
                this._clock.setTicksAtTime(this._loopStart, tickTime);
                ticks = this._loopStart;
                this.emit("loopStart", tickTime, this._clock.getSecondsAtTime(tickTime));
                this.emit("loop", tickTime);
            }
        }
        // handle swing
        if (this._swingAmount > 0 &&
            ticks % this._ppq !== 0 && // not on a downbeat
            ticks % (this._swingTicks * 2) !== 0) {
            // add some swing
            const progress = (ticks % (this._swingTicks * 2)) / (this._swingTicks * 2);
            const amount = Math.sin((progress) * Math.PI) * this._swingAmount;
            tickTime += new TicksClass(this.context, this._swingTicks * 2 / 3).toSeconds() * amount;
        }
        // invoke the timeline events scheduled on this tick
        this._timeline.forEachAtTime(ticks, event => event.invoke(tickTime));
    }
    //-------------------------------------
    // 	SCHEDULABLE EVENTS
    //-------------------------------------
    /**
     * Schedule an event along the timeline.
     * @param callback The callback to be invoked at the time.
     * @param time The time to invoke the callback at.
     * @return The id of the event which can be used for canceling the event.
     * @example
     * // schedule an event on the 16th measure
     * Tone.Transport.schedule((time) => {
     * 	// invoked on measure 16
     * 	console.log("measure 16!");
     * }, "16:0:0");
     */
    schedule(callback, time) {
        const event = new TransportEvent(this, {
            callback,
            time: new TransportTimeClass(this.context, time).toTicks(),
        });
        return this._addEvent(event, this._timeline);
    }
    /**
     * Schedule a repeated event along the timeline. The event will fire
     * at the `interval` starting at the `startTime` and for the specified
     * `duration`.
     * @param  callback   The callback to invoke.
     * @param  interval   The duration between successive callbacks. Must be a positive number.
     * @param  startTime  When along the timeline the events should start being invoked.
     * @param  duration How long the event should repeat.
     * @return  The ID of the scheduled event. Use this to cancel the event.
     * @example
     * const osc = new Tone.Oscillator().toDestination().start();
     * // a callback invoked every eighth note after the first measure
     * Tone.Transport.scheduleRepeat((time) => {
     * 	osc.start(time).stop(time + 0.1);
     * }, "8n", "1m");
     */
    scheduleRepeat(callback, interval, startTime, duration = Infinity) {
        const event = new TransportRepeatEvent(this, {
            callback,
            duration: new TimeClass(this.context, duration).toTicks(),
            interval: new TimeClass(this.context, interval).toTicks(),
            time: new TransportTimeClass(this.context, startTime).toTicks(),
        });
        // kick it off if the Transport is started
        // @ts-ignore
        return this._addEvent(event, this._repeatedEvents);
    }
    /**
     * Schedule an event that will be removed after it is invoked.
     * @param callback The callback to invoke once.
     * @param time The time the callback should be invoked.
     * @returns The ID of the scheduled event.
     */
    scheduleOnce(callback, time) {
        const event = new TransportEvent(this, {
            callback,
            once: true,
            time: new TransportTimeClass(this.context, time).toTicks(),
        });
        return this._addEvent(event, this._timeline);
    }
    /**
     * Clear the passed in event id from the timeline
     * @param eventId The id of the event.
     */
    clear(eventId) {
        if (this._scheduledEvents.hasOwnProperty(eventId)) {
            const item = this._scheduledEvents[eventId.toString()];
            item.timeline.remove(item.event);
            item.event.dispose();
            delete this._scheduledEvents[eventId.toString()];
        }
        return this;
    }
    /**
     * Add an event to the correct timeline. Keep track of the
     * timeline it was added to.
     * @returns the event id which was just added
     */
    _addEvent(event, timeline) {
        this._scheduledEvents[event.id.toString()] = {
            event,
            timeline,
        };
        timeline.add(event);
        return event.id;
    }
    /**
     * Remove scheduled events from the timeline after
     * the given time. Repeated events will be removed
     * if their startTime is after the given time
     * @param after Clear all events after this time.
     */
    cancel(after = 0) {
        const computedAfter = this.toTicks(after);
        this._timeline.forEachFrom(computedAfter, event => this.clear(event.id));
        this._repeatedEvents.forEachFrom(computedAfter, event => this.clear(event.id));
        return this;
    }
    //-------------------------------------
    // 	START/STOP/PAUSE
    //-------------------------------------
    /**
     * Bind start/stop/pause events from the clock and emit them.
     */
    _bindClockEvents() {
        this._clock.on("start", (time, offset) => {
            offset = new TicksClass(this.context, offset).toSeconds();
            this.emit("start", time, offset);
        });
        this._clock.on("stop", (time) => {
            this.emit("stop", time);
        });
        this._clock.on("pause", (time) => {
            this.emit("pause", time);
        });
    }
    /**
     * Returns the playback state of the source, either "started", "stopped", or "paused"
     */
    get state() {
        return this._clock.getStateAtTime(this.now());
    }
    /**
     * Start the transport and all sources synced to the transport.
     * @param  time The time when the transport should start.
     * @param  offset The timeline offset to start the transport.
     * @example
     * // start the transport in one second starting at beginning of the 5th measure.
     * Tone.Transport.start("+1", "4:0:0");
     */
    start(time, offset) {
        let offsetTicks;
        if (isDefined(offset)) {
            offsetTicks = this.toTicks(offset);
        }
        // start the clock
        this._clock.start(time, offsetTicks);
        return this;
    }
    /**
     * Stop the transport and all sources synced to the transport.
     * @param time The time when the transport should stop.
     * @example
     * Tone.Transport.stop();
     */
    stop(time) {
        this._clock.stop(time);
        return this;
    }
    /**
     * Pause the transport and all sources synced to the transport.
     */
    pause(time) {
        this._clock.pause(time);
        return this;
    }
    /**
     * Toggle the current state of the transport. If it is
     * started, it will stop it, otherwise it will start the Transport.
     * @param  time The time of the event
     */
    toggle(time) {
        time = this.toSeconds(time);
        if (this._clock.getStateAtTime(time) !== "started") {
            this.start(time);
        }
        else {
            this.stop(time);
        }
        return this;
    }
    //-------------------------------------
    // 	SETTERS/GETTERS
    //-------------------------------------
    /**
     * The time signature as just the numerator over 4.
     * For example 4/4 would be just 4 and 6/8 would be 3.
     * @example
     * // common time
     * Tone.Transport.timeSignature = 4;
     * // 7/8
     * Tone.Transport.timeSignature = [7, 8];
     * // this will be reduced to a single number
     * Tone.Transport.timeSignature; // returns 3.5
     */
    get timeSignature() {
        return this._timeSignature;
    }
    set timeSignature(timeSig) {
        if (isArray(timeSig)) {
            timeSig = (timeSig[0] / timeSig[1]) * 4;
        }
        this._timeSignature = timeSig;
    }
    /**
     * When the Transport.loop = true, this is the starting position of the loop.
     */
    get loopStart() {
        return new TimeClass(this.context, this._loopStart, "i").toSeconds();
    }
    set loopStart(startPosition) {
        this._loopStart = this.toTicks(startPosition);
    }
    /**
     * When the Transport.loop = true, this is the ending position of the loop.
     */
    get loopEnd() {
        return new TimeClass(this.context, this._loopEnd, "i").toSeconds();
    }
    set loopEnd(endPosition) {
        this._loopEnd = this.toTicks(endPosition);
    }
    /**
     * If the transport loops or not.
     */
    get loop() {
        return this._loop.get(this.now());
    }
    set loop(loop) {
        this._loop.set(loop, this.now());
    }
    /**
     * Set the loop start and stop at the same time.
     * @example
     * // loop over the first measure
     * Tone.Transport.setLoopPoints(0, "1m");
     * Tone.Transport.loop = true;
     */
    setLoopPoints(startPosition, endPosition) {
        this.loopStart = startPosition;
        this.loopEnd = endPosition;
        return this;
    }
    /**
     * The swing value. Between 0-1 where 1 equal to the note + half the subdivision.
     */
    get swing() {
        return this._swingAmount;
    }
    set swing(amount) {
        // scale the values to a normal range
        this._swingAmount = amount;
    }
    /**
     * Set the subdivision which the swing will be applied to.
     * The default value is an 8th note. Value must be less
     * than a quarter note.
     */
    get swingSubdivision() {
        return new TicksClass(this.context, this._swingTicks).toNotation();
    }
    set swingSubdivision(subdivision) {
        this._swingTicks = this.toTicks(subdivision);
    }
    /**
     * The Transport's position in Bars:Beats:Sixteenths.
     * Setting the value will jump to that position right away.
     */
    get position() {
        const now = this.now();
        const ticks = this._clock.getTicksAtTime(now);
        return new TicksClass(this.context, ticks).toBarsBeatsSixteenths();
    }
    set position(progress) {
        const ticks = this.toTicks(progress);
        this.ticks = ticks;
    }
    /**
     * The Transport's position in seconds
     * Setting the value will jump to that position right away.
     */
    get seconds() {
        return this._clock.seconds;
    }
    set seconds(s) {
        const now = this.now();
        const ticks = this._clock.frequency.timeToTicks(s, now);
        this.ticks = ticks;
    }
    /**
     * The Transport's loop position as a normalized value. Always
     * returns 0 if the transport if loop is not true.
     */
    get progress() {
        if (this.loop) {
            const now = this.now();
            const ticks = this._clock.getTicksAtTime(now);
            return (ticks - this._loopStart) / (this._loopEnd - this._loopStart);
        }
        else {
            return 0;
        }
    }
    /**
     * The transports current tick position.
     */
    get ticks() {
        return this._clock.ticks;
    }
    set ticks(t) {
        if (this._clock.ticks !== t) {
            const now = this.now();
            // stop everything synced to the transport
            if (this.state === "started") {
                const ticks = this._clock.getTicksAtTime(now);
                // schedule to start on the next tick, #573
                const remainingTick = this._clock.frequency.getDurationOfTicks(Math.ceil(ticks) - ticks, now);
                const time = now + remainingTick;
                this.emit("stop", time);
                this._clock.setTicksAtTime(t, time);
                // restart it with the new time
                this.emit("start", time, this._clock.getSecondsAtTime(time));
            }
            else {
                this._clock.setTicksAtTime(t, now);
            }
        }
    }
    /**
     * Get the clock's ticks at the given time.
     * @param  time  When to get the tick value
     * @return The tick value at the given time.
     */
    getTicksAtTime(time) {
        return Math.round(this._clock.getTicksAtTime(time));
    }
    /**
     * Return the elapsed seconds at the given time.
     * @param  time  When to get the elapsed seconds
     * @return  The number of elapsed seconds
     */
    getSecondsAtTime(time) {
        return this._clock.getSecondsAtTime(time);
    }
    /**
     * Pulses Per Quarter note. This is the smallest resolution
     * the Transport timing supports. This should be set once
     * on initialization and not set again. Changing this value
     * after other objects have been created can cause problems.
     */
    get PPQ() {
        return this._clock.frequency.multiplier;
    }
    set PPQ(ppq) {
        this._clock.frequency.multiplier = ppq;
    }
    //-------------------------------------
    // 	SYNCING
    //-------------------------------------
    /**
     * Returns the time aligned to the next subdivision
     * of the Transport. If the Transport is not started,
     * it will return 0.
     * Note: this will not work precisely during tempo ramps.
     * @param  subdivision  The subdivision to quantize to
     * @return  The context time of the next subdivision.
     * @example
     * // the transport must be started, otherwise returns 0
     * Tone.Transport.start();
     * Tone.Transport.nextSubdivision("4n");
     */
    nextSubdivision(subdivision) {
        subdivision = this.toTicks(subdivision);
        if (this.state !== "started") {
            // if the transport's not started, return 0
            return 0;
        }
        else {
            const now = this.now();
            // the remainder of the current ticks and the subdivision
            const transportPos = this.getTicksAtTime(now);
            const remainingTicks = subdivision - transportPos % subdivision;
            return this._clock.nextTickTime(remainingTicks, now);
        }
    }
    /**
     * Attaches the signal to the tempo control signal so that
     * any changes in the tempo will change the signal in the same
     * ratio.
     *
     * @param signal
     * @param ratio Optionally pass in the ratio between the two signals.
     * 			Otherwise it will be computed based on their current values.
     */
    syncSignal(signal, ratio) {
        if (!ratio) {
            // get the sync ratio
            const now = this.now();
            if (signal.getValueAtTime(now) !== 0) {
                const bpm = this.bpm.getValueAtTime(now);
                const computedFreq = 1 / (60 / bpm / this.PPQ);
                ratio = signal.getValueAtTime(now) / computedFreq;
            }
            else {
                ratio = 0;
            }
        }
        const ratioSignal = new Gain(ratio);
        // @ts-ignore
        this.bpm.connect(ratioSignal);
        // @ts-ignore
        ratioSignal.connect(signal._param);
        this._syncedSignals.push({
            initial: signal.value,
            ratio: ratioSignal,
            signal,
        });
        signal.value = 0;
        return this;
    }
    /**
     * Unsyncs a previously synced signal from the transport's control.
     * See Transport.syncSignal.
     */
    unsyncSignal(signal) {
        for (let i = this._syncedSignals.length - 1; i >= 0; i--) {
            const syncedSignal = this._syncedSignals[i];
            if (syncedSignal.signal === signal) {
                syncedSignal.ratio.dispose();
                syncedSignal.signal.value = syncedSignal.initial;
                this._syncedSignals.splice(i, 1);
            }
        }
        return this;
    }
    /**
     * Clean up.
     */
    dispose() {
        super.dispose();
        this._clock.dispose();
        writable(this, "bpm");
        this._timeline.dispose();
        this._repeatedEvents.dispose();
        return this;
    }
}
Emitter.mixin(Transport);
//-------------------------------------
// 	INITIALIZATION
//-------------------------------------
onContextInit(context => {
    context.transport = new Transport({ context });
});
onContextClose(context => {
    context.transport.dispose();
});

/**
 * Base class for sources.
 * start/stop of this.context.transport.
 *
 * ```
 * // Multiple state change events can be chained together,
 * // but must be set in the correct order and with ascending times
 * // OK
 * state.start().stop("+0.2");
 * // OK
 * state.start().stop("+0.2").start("+0.4").stop("+0.7")
 * // BAD
 * state.stop("+0.2").start();
 * // BAD
 * state.start("+0.3").stop("+0.2");
 * ```
 */
class Source extends ToneAudioNode {
    constructor(options) {
        super(options);
        /**
         * Sources have no inputs
         */
        this.input = undefined;
        /**
         * Keep track of the scheduled state.
         */
        this._state = new StateTimeline("stopped");
        /**
         * The synced `start` callback function from the transport
         */
        this._synced = false;
        /**
         * Keep track of all of the scheduled event ids
         */
        this._scheduled = [];
        /**
         * Placeholder functions for syncing/unsyncing to transport
         */
        this._syncedStart = noOp;
        this._syncedStop = noOp;
        this._state.memory = 100;
        this._state.increasing = true;
        this._volume = this.output = new Volume({
            context: this.context,
            mute: options.mute,
            volume: options.volume,
        });
        this.volume = this._volume.volume;
        readOnly(this, "volume");
        this.onstop = options.onstop;
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            mute: false,
            onstop: noOp,
            volume: 0,
        });
    }
    /**
     * Returns the playback state of the source, either "started" or "stopped".
     * @example
     * const player = new Tone.Player("https://tonejs.github.io/audio/berklee/ahntone_c3.mp3", () => {
     * 	player.start();
     * 	console.log(player.state);
     * }).toDestination();
     */
    get state() {
        if (this._synced) {
            if (this.context.transport.state === "started") {
                return this._state.getValueAtTime(this.context.transport.seconds);
            }
            else {
                return "stopped";
            }
        }
        else {
            return this._state.getValueAtTime(this.now());
        }
    }
    /**
     * Mute the output.
     * @example
     * const osc = new Tone.Oscillator().toDestination().start();
     * // mute the output
     * osc.mute = true;
     */
    get mute() {
        return this._volume.mute;
    }
    set mute(mute) {
        this._volume.mute = mute;
    }
    /**
     * Ensure that the scheduled time is not before the current time.
     * Should only be used when scheduled unsynced.
     */
    _clampToCurrentTime(time) {
        if (this._synced) {
            return time;
        }
        else {
            return Math.max(time, this.context.currentTime);
        }
    }
    /**
     * Start the source at the specified time. If no time is given,
     * start the source now.
     * @param  time When the source should be started.
     * @example
     * const source = new Tone.Oscillator().toDestination();
     * source.start("+0.5"); // starts the source 0.5 seconds from now
     */
    start(time, offset, duration) {
        let computedTime = isUndef(time) && this._synced ? this.context.transport.seconds : this.toSeconds(time);
        computedTime = this._clampToCurrentTime(computedTime);
        // if it's started, stop it and restart it
        if (!this._synced && this._state.getValueAtTime(computedTime) === "started") {
            // time should be strictly greater than the previous start time
            assert(GT(computedTime, this._state.get(computedTime).time), "Start time must be strictly greater than previous start time");
            this._state.cancel(computedTime);
            this._state.setStateAtTime("started", computedTime);
            this.log("restart", computedTime);
            this.restart(computedTime, offset, duration);
        }
        else {
            this.log("start", computedTime);
            this._state.setStateAtTime("started", computedTime);
            if (this._synced) {
                // add the offset time to the event
                const event = this._state.get(computedTime);
                if (event) {
                    event.offset = this.toSeconds(defaultArg(offset, 0));
                    event.duration = duration ? this.toSeconds(duration) : undefined;
                }
                const sched = this.context.transport.schedule(t => {
                    this._start(t, offset, duration);
                }, computedTime);
                this._scheduled.push(sched);
                // if the transport is already started
                // and the time is greater than where the transport is
                if (this.context.transport.state === "started" &&
                    this.context.transport.getSecondsAtTime(this.immediate()) > computedTime) {
                    this._syncedStart(this.now(), this.context.transport.seconds);
                }
            }
            else {
                assertContextRunning(this.context);
                this._start(computedTime, offset, duration);
            }
        }
        return this;
    }
    /**
     * Stop the source at the specified time. If no time is given,
     * stop the source now.
     * @param  time When the source should be stopped.
     * @example
     * const source = new Tone.Oscillator().toDestination();
     * source.start();
     * source.stop("+0.5"); // stops the source 0.5 seconds from now
     */
    stop(time) {
        let computedTime = isUndef(time) && this._synced ? this.context.transport.seconds : this.toSeconds(time);
        computedTime = this._clampToCurrentTime(computedTime);
        if (this._state.getValueAtTime(computedTime) === "started" || isDefined(this._state.getNextState("started", computedTime))) {
            this.log("stop", computedTime);
            if (!this._synced) {
                this._stop(computedTime);
            }
            else {
                const sched = this.context.transport.schedule(this._stop.bind(this), computedTime);
                this._scheduled.push(sched);
            }
            this._state.cancel(computedTime);
            this._state.setStateAtTime("stopped", computedTime);
        }
        return this;
    }
    /**
     * Restart the source.
     */
    restart(time, offset, duration) {
        time = this.toSeconds(time);
        if (this._state.getValueAtTime(time) === "started") {
            this._state.cancel(time);
            this._restart(time, offset, duration);
        }
        return this;
    }
    /**
     * Sync the source to the Transport so that all subsequent
     * calls to `start` and `stop` are synced to the TransportTime
     * instead of the AudioContext time.
     *
     * @example
     * const osc = new Tone.Oscillator().toDestination();
     * // sync the source so that it plays between 0 and 0.3 on the Transport's timeline
     * osc.sync().start(0).stop(0.3);
     * // start the transport.
     * Tone.Transport.start();
     * // set it to loop once a second
     * Tone.Transport.loop = true;
     * Tone.Transport.loopEnd = 1;
     */
    sync() {
        if (!this._synced) {
            this._synced = true;
            this._syncedStart = (time, offset) => {
                if (offset > 0) {
                    // get the playback state at that time
                    const stateEvent = this._state.get(offset);
                    // listen for start events which may occur in the middle of the sync'ed time
                    if (stateEvent && stateEvent.state === "started" && stateEvent.time !== offset) {
                        // get the offset
                        const startOffset = offset - this.toSeconds(stateEvent.time);
                        let duration;
                        if (stateEvent.duration) {
                            duration = this.toSeconds(stateEvent.duration) - startOffset;
                        }
                        this._start(time, this.toSeconds(stateEvent.offset) + startOffset, duration);
                    }
                }
            };
            this._syncedStop = time => {
                const seconds = this.context.transport.getSecondsAtTime(Math.max(time - this.sampleTime, 0));
                if (this._state.getValueAtTime(seconds) === "started") {
                    this._stop(time);
                }
            };
            this.context.transport.on("start", this._syncedStart);
            this.context.transport.on("loopStart", this._syncedStart);
            this.context.transport.on("stop", this._syncedStop);
            this.context.transport.on("pause", this._syncedStop);
            this.context.transport.on("loopEnd", this._syncedStop);
        }
        return this;
    }
    /**
     * Unsync the source to the Transport. See Source.sync
     */
    unsync() {
        if (this._synced) {
            this.context.transport.off("stop", this._syncedStop);
            this.context.transport.off("pause", this._syncedStop);
            this.context.transport.off("loopEnd", this._syncedStop);
            this.context.transport.off("start", this._syncedStart);
            this.context.transport.off("loopStart", this._syncedStart);
        }
        this._synced = false;
        // clear all of the scheduled ids
        this._scheduled.forEach(id => this.context.transport.clear(id));
        this._scheduled = [];
        this._state.cancel(0);
        // stop it also
        this._stop(0);
        return this;
    }
    /**
     * Clean up.
     */
    dispose() {
        super.dispose();
        this.onstop = noOp;
        this.unsync();
        this._volume.dispose();
        this._state.dispose();
        return this;
    }
}

/**
 * Wrapper around the native BufferSourceNode.
 * @category Source
 */
class ToneBufferSource extends OneShotSource {
    constructor() {
        super(optionsFromArguments(ToneBufferSource.getDefaults(), arguments, ["url", "onload"]));
        this.name = "ToneBufferSource";
        /**
         * The oscillator
         */
        this._source = this.context.createBufferSource();
        this._internalChannels = [this._source];
        /**
         * indicators if the source has started/stopped
         */
        this._sourceStarted = false;
        this._sourceStopped = false;
        const options = optionsFromArguments(ToneBufferSource.getDefaults(), arguments, ["url", "onload"]);
        connect(this._source, this._gainNode);
        this._source.onended = () => this._stopSource();
        /**
         * The playbackRate of the buffer
         */
        this.playbackRate = new Param({
            context: this.context,
            param: this._source.playbackRate,
            units: "positive",
            value: options.playbackRate,
        });
        // set some values initially
        this.loop = options.loop;
        this.loopStart = options.loopStart;
        this.loopEnd = options.loopEnd;
        this._buffer = new ToneAudioBuffer(options.url, options.onload, options.onerror);
        this._internalChannels.push(this._source);
    }
    static getDefaults() {
        return Object.assign(OneShotSource.getDefaults(), {
            url: new ToneAudioBuffer(),
            loop: false,
            loopEnd: 0,
            loopStart: 0,
            onload: noOp,
            onerror: noOp,
            playbackRate: 1,
        });
    }
    /**
     * The fadeIn time of the amplitude envelope.
     */
    get fadeIn() {
        return this._fadeIn;
    }
    set fadeIn(t) {
        this._fadeIn = t;
    }
    /**
     * The fadeOut time of the amplitude envelope.
     */
    get fadeOut() {
        return this._fadeOut;
    }
    set fadeOut(t) {
        this._fadeOut = t;
    }
    /**
     * The curve applied to the fades, either "linear" or "exponential"
     */
    get curve() {
        return this._curve;
    }
    set curve(t) {
        this._curve = t;
    }
    /**
     * Start the buffer
     * @param  time When the player should start.
     * @param  offset The offset from the beginning of the sample to start at.
     * @param  duration How long the sample should play. If no duration is given, it will default to the full length of the sample (minus any offset)
     * @param  gain  The gain to play the buffer back at.
     */
    start(time, offset, duration, gain = 1) {
        assert(this.buffer.loaded, "buffer is either not set or not loaded");
        const computedTime = this.toSeconds(time);
        // apply the gain envelope
        this._startGain(computedTime, gain);
        // if it's a loop the default offset is the loopstart point
        if (this.loop) {
            offset = defaultArg(offset, this.loopStart);
        }
        else {
            // otherwise the default offset is 0
            offset = defaultArg(offset, 0);
        }
        // make sure the offset is not less than 0
        let computedOffset = Math.max(this.toSeconds(offset), 0);
        // start the buffer source
        if (this.loop) {
            // modify the offset if it's greater than the loop time
            const loopEnd = this.toSeconds(this.loopEnd) || this.buffer.duration;
            const loopStart = this.toSeconds(this.loopStart);
            const loopDuration = loopEnd - loopStart;
            // move the offset back
            if (GTE(computedOffset, loopEnd)) {
                computedOffset = ((computedOffset - loopStart) % loopDuration) + loopStart;
            }
            // when the offset is very close to the duration, set it to 0
            if (EQ(computedOffset, this.buffer.duration)) {
                computedOffset = 0;
            }
        }
        // this.buffer.loaded would have return false if the AudioBuffer was undefined
        this._source.buffer = this.buffer.get();
        this._source.loopEnd = this.toSeconds(this.loopEnd) || this.buffer.duration;
        if (LT(computedOffset, this.buffer.duration)) {
            this._sourceStarted = true;
            this._source.start(computedTime, computedOffset);
        }
        // if a duration is given, schedule a stop
        if (isDefined(duration)) {
            let computedDur = this.toSeconds(duration);
            // make sure it's never negative
            computedDur = Math.max(computedDur, 0);
            this.stop(computedTime + computedDur);
        }
        return this;
    }
    _stopSource(time) {
        if (!this._sourceStopped && this._sourceStarted) {
            this._sourceStopped = true;
            this._source.stop(this.toSeconds(time));
            this._onended();
        }
    }
    /**
     * If loop is true, the loop will start at this position.
     */
    get loopStart() {
        return this._source.loopStart;
    }
    set loopStart(loopStart) {
        this._source.loopStart = this.toSeconds(loopStart);
    }
    /**
     * If loop is true, the loop will end at this position.
     */
    get loopEnd() {
        return this._source.loopEnd;
    }
    set loopEnd(loopEnd) {
        this._source.loopEnd = this.toSeconds(loopEnd);
    }
    /**
     * The audio buffer belonging to the player.
     */
    get buffer() {
        return this._buffer;
    }
    set buffer(buffer) {
        this._buffer.set(buffer);
    }
    /**
     * If the buffer should loop once it's over.
     */
    get loop() {
        return this._source.loop;
    }
    set loop(loop) {
        this._source.loop = loop;
        if (this._sourceStarted) {
            this.cancelStop();
        }
    }
    /**
     * Clean up.
     */
    dispose() {
        super.dispose();
        this._source.onended = null;
        this._source.disconnect();
        this._buffer.dispose();
        this.playbackRate.dispose();
        return this;
    }
}

/**
 * Noise is a noise generator. It uses looped noise buffers to save on performance.
 * Noise supports the noise types: "pink", "white", and "brown". Read more about
 * colors of noise on [Wikipedia](https://en.wikipedia.org/wiki/Colors_of_noise).
 *
 * @example
 * // initialize the noise and start
 * const noise = new Tone.Noise("pink").start();
 * // make an autofilter to shape the noise
 * const autoFilter = new Tone.AutoFilter({
 * 	frequency: "8n",
 * 	baseFrequency: 200,
 * 	octaves: 8
 * }).toDestination().start();
 * // connect the noise
 * noise.connect(autoFilter);
 * // start the autofilter LFO
 * autoFilter.start();
 * @category Source
 */
class Noise extends Source {
    constructor() {
        super(optionsFromArguments(Noise.getDefaults(), arguments, ["type"]));
        this.name = "Noise";
        /**
         * Private reference to the source
         */
        this._source = null;
        const options = optionsFromArguments(Noise.getDefaults(), arguments, ["type"]);
        this._playbackRate = options.playbackRate;
        this.type = options.type;
        this._fadeIn = options.fadeIn;
        this._fadeOut = options.fadeOut;
    }
    static getDefaults() {
        return Object.assign(Source.getDefaults(), {
            fadeIn: 0,
            fadeOut: 0,
            playbackRate: 1,
            type: "white",
        });
    }
    /**
     * The type of the noise. Can be "white", "brown", or "pink".
     * @example
     * const noise = new Tone.Noise().toDestination().start();
     * noise.type = "brown";
     */
    get type() {
        return this._type;
    }
    set type(type) {
        assert(type in _noiseBuffers, "Noise: invalid type: " + type);
        if (this._type !== type) {
            this._type = type;
            // if it's playing, stop and restart it
            if (this.state === "started") {
                const now = this.now();
                this._stop(now);
                this._start(now);
            }
        }
    }
    /**
     * The playback rate of the noise. Affects
     * the "frequency" of the noise.
     */
    get playbackRate() {
        return this._playbackRate;
    }
    set playbackRate(rate) {
        this._playbackRate = rate;
        if (this._source) {
            this._source.playbackRate.value = rate;
        }
    }
    /**
     * internal start method
     */
    _start(time) {
        const buffer = _noiseBuffers[this._type];
        this._source = new ToneBufferSource({
            url: buffer,
            context: this.context,
            fadeIn: this._fadeIn,
            fadeOut: this._fadeOut,
            loop: true,
            onended: () => this.onstop(this),
            playbackRate: this._playbackRate,
        }).connect(this.output);
        this._source.start(this.toSeconds(time), Math.random() * (buffer.duration - 0.001));
    }
    /**
     * internal stop method
     */
    _stop(time) {
        if (this._source) {
            this._source.stop(this.toSeconds(time));
            this._source = null;
        }
    }
    /**
     * The fadeIn time of the amplitude envelope.
     */
    get fadeIn() {
        return this._fadeIn;
    }
    set fadeIn(time) {
        this._fadeIn = time;
        if (this._source) {
            this._source.fadeIn = this._fadeIn;
        }
    }
    /**
     * The fadeOut time of the amplitude envelope.
     */
    get fadeOut() {
        return this._fadeOut;
    }
    set fadeOut(time) {
        this._fadeOut = time;
        if (this._source) {
            this._source.fadeOut = this._fadeOut;
        }
    }
    _restart(time) {
        // TODO could be optimized by cancelling the buffer source 'stop'
        this._stop(time);
        this._start(time);
    }
    /**
     * Clean up.
     */
    dispose() {
        super.dispose();
        if (this._source) {
            this._source.disconnect();
        }
        return this;
    }
}
//--------------------
// THE NOISE BUFFERS
//--------------------
// Noise buffer stats
const BUFFER_LENGTH = 44100 * 5;
const NUM_CHANNELS = 2;
/**
 * Cache the noise buffers
 */
const _noiseCache = {
    brown: null,
    pink: null,
    white: null,
};
/**
 * The noise arrays. Generated on initialization.
 * borrowed heavily from https://github.com/zacharydenton/noise.js
 * (c) 2013 Zach Denton (MIT)
 */
const _noiseBuffers = {
    get brown() {
        if (!_noiseCache.brown) {
            const buffer = [];
            for (let channelNum = 0; channelNum < NUM_CHANNELS; channelNum++) {
                const channel = new Float32Array(BUFFER_LENGTH);
                buffer[channelNum] = channel;
                let lastOut = 0.0;
                for (let i = 0; i < BUFFER_LENGTH; i++) {
                    const white = Math.random() * 2 - 1;
                    channel[i] = (lastOut + (0.02 * white)) / 1.02;
                    lastOut = channel[i];
                    channel[i] *= 3.5; // (roughly) compensate for gain
                }
            }
            _noiseCache.brown = new ToneAudioBuffer().fromArray(buffer);
        }
        return _noiseCache.brown;
    },
    get pink() {
        if (!_noiseCache.pink) {
            const buffer = [];
            for (let channelNum = 0; channelNum < NUM_CHANNELS; channelNum++) {
                const channel = new Float32Array(BUFFER_LENGTH);
                buffer[channelNum] = channel;
                let b0, b1, b2, b3, b4, b5, b6;
                b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
                for (let i = 0; i < BUFFER_LENGTH; i++) {
                    const white = Math.random() * 2 - 1;
                    b0 = 0.99886 * b0 + white * 0.0555179;
                    b1 = 0.99332 * b1 + white * 0.0750759;
                    b2 = 0.96900 * b2 + white * 0.1538520;
                    b3 = 0.86650 * b3 + white * 0.3104856;
                    b4 = 0.55000 * b4 + white * 0.5329522;
                    b5 = -0.7616 * b5 - white * 0.0168980;
                    channel[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                    channel[i] *= 0.11; // (roughly) compensate for gain
                    b6 = white * 0.115926;
                }
            }
            _noiseCache.pink = new ToneAudioBuffer().fromArray(buffer);
        }
        return _noiseCache.pink;
    },
    get white() {
        if (!_noiseCache.white) {
            const buffer = [];
            for (let channelNum = 0; channelNum < NUM_CHANNELS; channelNum++) {
                const channel = new Float32Array(BUFFER_LENGTH);
                buffer[channelNum] = channel;
                for (let i = 0; i < BUFFER_LENGTH; i++) {
                    channel[i] = Math.random() * 2 - 1;
                }
            }
            _noiseCache.white = new ToneAudioBuffer().fromArray(buffer);
        }
        return _noiseCache.white;
    },
};

/**
 * UserMedia uses MediaDevices.getUserMedia to open up and external microphone or audio input.
 * Check [MediaDevices API Support](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
 * to see which browsers are supported. Access to an external input
 * is limited to secure (HTTPS) connections.
 * @example
 * const meter = new Tone.Meter();
 * const mic = new Tone.UserMedia().connect(meter);
 * mic.open().then(() => {
 * 	// promise resolves when input is available
 * 	console.log("mic open");
 * 	// print the incoming mic levels in decibels
 * 	setInterval(() => console.log(meter.getValue()), 100);
 * }).catch(e => {
 * 	// promise is rejected when the user doesn't have or allow mic access
 * 	console.log("mic not open");
 * });
 * @category Source
 */
class UserMedia extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(UserMedia.getDefaults(), arguments, ["volume"]));
        this.name = "UserMedia";
        const options = optionsFromArguments(UserMedia.getDefaults(), arguments, ["volume"]);
        this._volume = this.output = new Volume({
            context: this.context,
            volume: options.volume,
        });
        this.volume = this._volume.volume;
        readOnly(this, "volume");
        this.mute = options.mute;
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            mute: false,
            volume: 0
        });
    }
    /**
     * Open the media stream. If a string is passed in, it is assumed
     * to be the label or id of the stream, if a number is passed in,
     * it is the input number of the stream.
     * @param  labelOrId The label or id of the audio input media device.
     *                   With no argument, the default stream is opened.
     * @return The promise is resolved when the stream is open.
     */
    open(labelOrId) {
        return __awaiter(this, void 0, void 0, function* () {
            assert(UserMedia.supported, "UserMedia is not supported");
            // close the previous stream
            if (this.state === "started") {
                this.close();
            }
            const devices = yield UserMedia.enumerateDevices();
            if (isNumber(labelOrId)) {
                this._device = devices[labelOrId];
            }
            else {
                this._device = devices.find((device) => {
                    return device.label === labelOrId || device.deviceId === labelOrId;
                });
                // didn't find a matching device
                if (!this._device && devices.length > 0) {
                    this._device = devices[0];
                }
                assert(isDefined(this._device), `No matching device ${labelOrId}`);
            }
            // do getUserMedia
            const constraints = {
                audio: {
                    echoCancellation: false,
                    sampleRate: this.context.sampleRate,
                    noiseSuppression: false,
                    mozNoiseSuppression: false,
                }
            };
            if (this._device) {
                // @ts-ignore
                constraints.audio.deviceId = this._device.deviceId;
            }
            const stream = yield navigator.mediaDevices.getUserMedia(constraints);
            // start a new source only if the previous one is closed
            if (!this._stream) {
                this._stream = stream;
                // Wrap a MediaStreamSourceNode around the live input stream.
                const mediaStreamNode = this.context.createMediaStreamSource(stream);
                // Connect the MediaStreamSourceNode to a gate gain node
                connect(mediaStreamNode, this.output);
                this._mediaStream = mediaStreamNode;
            }
            return this;
        });
    }
    /**
     * Close the media stream
     */
    close() {
        if (this._stream && this._mediaStream) {
            this._stream.getAudioTracks().forEach((track) => {
                track.stop();
            });
            this._stream = undefined;
            // remove the old media stream
            this._mediaStream.disconnect();
            this._mediaStream = undefined;
        }
        this._device = undefined;
        return this;
    }
    /**
     * Returns a promise which resolves with the list of audio input devices available.
     * @return The promise that is resolved with the devices
     * @example
     * Tone.UserMedia.enumerateDevices().then((devices) => {
     * 	// print the device labels
     * 	console.log(devices.map(device => device.label));
     * });
     */
    static enumerateDevices() {
        return __awaiter(this, void 0, void 0, function* () {
            const allDevices = yield navigator.mediaDevices.enumerateDevices();
            return allDevices.filter(device => {
                return device.kind === "audioinput";
            });
        });
    }
    /**
     * Returns the playback state of the source, "started" when the microphone is open
     * and "stopped" when the mic is closed.
     */
    get state() {
        return this._stream && this._stream.active ? "started" : "stopped";
    }
    /**
     * Returns an identifier for the represented device that is
     * persisted across sessions. It is un-guessable by other applications and
     * unique to the origin of the calling application. It is reset when the
     * user clears cookies (for Private Browsing, a different identifier is
     * used that is not persisted across sessions). Returns undefined when the
     * device is not open.
     */
    get deviceId() {
        if (this._device) {
            return this._device.deviceId;
        }
        else {
            return undefined;
        }
    }
    /**
     * Returns a group identifier. Two devices have the
     * same group identifier if they belong to the same physical device.
     * Returns null  when the device is not open.
     */
    get groupId() {
        if (this._device) {
            return this._device.groupId;
        }
        else {
            return undefined;
        }
    }
    /**
     * Returns a label describing this device (for example "Built-in Microphone").
     * Returns undefined when the device is not open or label is not available
     * because of permissions.
     */
    get label() {
        if (this._device) {
            return this._device.label;
        }
        else {
            return undefined;
        }
    }
    /**
     * Mute the output.
     * @example
     * const mic = new Tone.UserMedia();
     * mic.open().then(() => {
     * 	// promise resolves when input is available
     * });
     * // mute the output
     * mic.mute = true;
     */
    get mute() {
        return this._volume.mute;
    }
    set mute(mute) {
        this._volume.mute = mute;
    }
    dispose() {
        super.dispose();
        this.close();
        this._volume.dispose();
        this.volume.dispose();
        return this;
    }
    /**
     * If getUserMedia is supported by the browser.
     */
    static get supported() {
        return isDefined(navigator.mediaDevices) &&
            isDefined(navigator.mediaDevices.getUserMedia);
    }
}

/**
 * Render a segment of the oscillator to an offline context and return the results as an array
 */
function generateWaveform(instance, length) {
    return __awaiter(this, void 0, void 0, function* () {
        const duration = length / instance.context.sampleRate;
        const context = new OfflineContext(1, duration, instance.context.sampleRate);
        const clone = new instance.constructor(Object.assign(instance.get(), {
            // should do 2 iterations
            frequency: 2 / duration,
            // zero out the detune
            detune: 0,
            context
        })).toDestination();
        clone.start(0);
        const buffer = yield context.render();
        return buffer.getChannelData(0);
    });
}

/**
 * Wrapper around the native fire-and-forget OscillatorNode.
 * Adds the ability to reschedule the stop method.
 * ***[[Oscillator]] is better for most use-cases***
 * @category Source
 */
class ToneOscillatorNode extends OneShotSource {
    constructor() {
        super(optionsFromArguments(ToneOscillatorNode.getDefaults(), arguments, ["frequency", "type"]));
        this.name = "ToneOscillatorNode";
        /**
         * The oscillator
         */
        this._oscillator = this.context.createOscillator();
        this._internalChannels = [this._oscillator];
        const options = optionsFromArguments(ToneOscillatorNode.getDefaults(), arguments, ["frequency", "type"]);
        connect(this._oscillator, this._gainNode);
        this.type = options.type;
        this.frequency = new Param({
            context: this.context,
            param: this._oscillator.frequency,
            units: "frequency",
            value: options.frequency,
        });
        this.detune = new Param({
            context: this.context,
            param: this._oscillator.detune,
            units: "cents",
            value: options.detune,
        });
        readOnly(this, ["frequency", "detune"]);
    }
    static getDefaults() {
        return Object.assign(OneShotSource.getDefaults(), {
            detune: 0,
            frequency: 440,
            type: "sine",
        });
    }
    /**
     * Start the oscillator node at the given time
     * @param  time When to start the oscillator
     */
    start(time) {
        const computedTime = this.toSeconds(time);
        this.log("start", computedTime);
        this._startGain(computedTime);
        this._oscillator.start(computedTime);
        return this;
    }
    _stopSource(time) {
        this._oscillator.stop(time);
    }
    /**
     * Sets an arbitrary custom periodic waveform given a PeriodicWave.
     * @param  periodicWave PeriodicWave should be created with context.createPeriodicWave
     */
    setPeriodicWave(periodicWave) {
        this._oscillator.setPeriodicWave(periodicWave);
        return this;
    }
    /**
     * The oscillator type. Either 'sine', 'sawtooth', 'square', or 'triangle'
     */
    get type() {
        return this._oscillator.type;
    }
    set type(type) {
        this._oscillator.type = type;
    }
    /**
     * Clean up.
     */
    dispose() {
        super.dispose();
        if (this.state === "started") {
            this.stop();
        }
        this._oscillator.disconnect();
        this.frequency.dispose();
        this.detune.dispose();
        return this;
    }
}

/**
 * Oscillator supports a number of features including
 * phase rotation, multiple oscillator types (see Oscillator.type),
 * and Transport syncing (see Oscillator.syncFrequency).
 *
 * @example
 * // make and start a 440hz sine tone
 * const osc = new Tone.Oscillator(440, "sine").toDestination().start();
 * @category Source
 */
class Oscillator extends Source {
    constructor() {
        super(optionsFromArguments(Oscillator.getDefaults(), arguments, ["frequency", "type"]));
        this.name = "Oscillator";
        /**
         * the main oscillator
         */
        this._oscillator = null;
        const options = optionsFromArguments(Oscillator.getDefaults(), arguments, ["frequency", "type"]);
        this.frequency = new Signal({
            context: this.context,
            units: "frequency",
            value: options.frequency,
        });
        readOnly(this, "frequency");
        this.detune = new Signal({
            context: this.context,
            units: "cents",
            value: options.detune,
        });
        readOnly(this, "detune");
        this._partials = options.partials;
        this._partialCount = options.partialCount;
        this._type = options.type;
        if (options.partialCount && options.type !== "custom") {
            this._type = this.baseType + options.partialCount.toString();
        }
        this.phase = options.phase;
    }
    static getDefaults() {
        return Object.assign(Source.getDefaults(), {
            detune: 0,
            frequency: 440,
            partialCount: 0,
            partials: [],
            phase: 0,
            type: "sine",
        });
    }
    /**
     * start the oscillator
     */
    _start(time) {
        const computedTime = this.toSeconds(time);
        // new oscillator with previous values
        const oscillator = new ToneOscillatorNode({
            context: this.context,
            onended: () => this.onstop(this),
        });
        this._oscillator = oscillator;
        if (this._wave) {
            this._oscillator.setPeriodicWave(this._wave);
        }
        else {
            this._oscillator.type = this._type;
        }
        // connect the control signal to the oscillator frequency & detune
        this._oscillator.connect(this.output);
        this.frequency.connect(this._oscillator.frequency);
        this.detune.connect(this._oscillator.detune);
        // start the oscillator
        this._oscillator.start(computedTime);
    }
    /**
     * stop the oscillator
     */
    _stop(time) {
        const computedTime = this.toSeconds(time);
        if (this._oscillator) {
            this._oscillator.stop(computedTime);
        }
    }
    /**
     * Restart the oscillator. Does not stop the oscillator, but instead
     * just cancels any scheduled 'stop' from being invoked.
     */
    _restart(time) {
        const computedTime = this.toSeconds(time);
        this.log("restart", computedTime);
        if (this._oscillator) {
            this._oscillator.cancelStop();
        }
        this._state.cancel(computedTime);
        return this;
    }
    /**
     * Sync the signal to the Transport's bpm. Any changes to the transports bpm,
     * will also affect the oscillators frequency.
     * @example
     * const osc = new Tone.Oscillator().toDestination().start();
     * osc.frequency.value = 440;
     * // the ratio between the bpm and the frequency will be maintained
     * osc.syncFrequency();
     * // double the tempo
     * Tone.Transport.bpm.value *= 2;
     * // the frequency of the oscillator is doubled to 880
     */
    syncFrequency() {
        this.context.transport.syncSignal(this.frequency);
        return this;
    }
    /**
     * Unsync the oscillator's frequency from the Transport.
     * See Oscillator.syncFrequency
     */
    unsyncFrequency() {
        this.context.transport.unsyncSignal(this.frequency);
        return this;
    }
    /**
     * Get a cached periodic wave. Avoids having to recompute
     * the oscillator values when they have already been computed
     * with the same values.
     */
    _getCachedPeriodicWave() {
        if (this._type === "custom") {
            const oscProps = Oscillator._periodicWaveCache.find(description => {
                return description.phase === this._phase &&
                    deepEquals(description.partials, this._partials);
            });
            return oscProps;
        }
        else {
            const oscProps = Oscillator._periodicWaveCache.find(description => {
                return description.type === this._type &&
                    description.phase === this._phase;
            });
            this._partialCount = oscProps ? oscProps.partialCount : this._partialCount;
            return oscProps;
        }
    }
    get type() {
        return this._type;
    }
    set type(type) {
        this._type = type;
        const isBasicType = ["sine", "square", "sawtooth", "triangle"].indexOf(type) !== -1;
        if (this._phase === 0 && isBasicType) {
            this._wave = undefined;
            this._partialCount = 0;
            // just go with the basic approach
            if (this._oscillator !== null) {
                // already tested that it's a basic type
                this._oscillator.type = type;
            }
        }
        else {
            // first check if the value is cached
            const cache = this._getCachedPeriodicWave();
            if (isDefined(cache)) {
                const { partials, wave } = cache;
                this._wave = wave;
                this._partials = partials;
                if (this._oscillator !== null) {
                    this._oscillator.setPeriodicWave(this._wave);
                }
            }
            else {
                const [real, imag] = this._getRealImaginary(type, this._phase);
                const periodicWave = this.context.createPeriodicWave(real, imag);
                this._wave = periodicWave;
                if (this._oscillator !== null) {
                    this._oscillator.setPeriodicWave(this._wave);
                }
                // set the cache
                Oscillator._periodicWaveCache.push({
                    imag,
                    partialCount: this._partialCount,
                    partials: this._partials,
                    phase: this._phase,
                    real,
                    type: this._type,
                    wave: this._wave,
                });
                if (Oscillator._periodicWaveCache.length > 100) {
                    Oscillator._periodicWaveCache.shift();
                }
            }
        }
    }
    get baseType() {
        return this._type.replace(this.partialCount.toString(), "");
    }
    set baseType(baseType) {
        if (this.partialCount && this._type !== "custom" && baseType !== "custom") {
            this.type = baseType + this.partialCount;
        }
        else {
            this.type = baseType;
        }
    }
    get partialCount() {
        return this._partialCount;
    }
    set partialCount(p) {
        assertRange(p, 0);
        let type = this._type;
        const partial = /^(sine|triangle|square|sawtooth)(\d+)$/.exec(this._type);
        if (partial) {
            type = partial[1];
        }
        if (this._type !== "custom") {
            if (p === 0) {
                this.type = type;
            }
            else {
                this.type = type + p.toString();
            }
        }
        else {
            // extend or shorten the partials array
            const fullPartials = new Float32Array(p);
            // copy over the partials array
            this._partials.forEach((v, i) => fullPartials[i] = v);
            this._partials = Array.from(fullPartials);
            this.type = this._type;
        }
    }
    /**
     * Returns the real and imaginary components based
     * on the oscillator type.
     * @returns [real: Float32Array, imaginary: Float32Array]
     */
    _getRealImaginary(type, phase) {
        const fftSize = 4096;
        let periodicWaveSize = fftSize / 2;
        const real = new Float32Array(periodicWaveSize);
        const imag = new Float32Array(periodicWaveSize);
        let partialCount = 1;
        if (type === "custom") {
            partialCount = this._partials.length + 1;
            this._partialCount = this._partials.length;
            periodicWaveSize = partialCount;
            // if the partial count is 0, don't bother doing any computation
            if (this._partials.length === 0) {
                return [real, imag];
            }
        }
        else {
            const partial = /^(sine|triangle|square|sawtooth)(\d+)$/.exec(type);
            if (partial) {
                partialCount = parseInt(partial[2], 10) + 1;
                this._partialCount = parseInt(partial[2], 10);
                type = partial[1];
                partialCount = Math.max(partialCount, 2);
                periodicWaveSize = partialCount;
            }
            else {
                this._partialCount = 0;
            }
            this._partials = [];
        }
        for (let n = 1; n < periodicWaveSize; ++n) {
            const piFactor = 2 / (n * Math.PI);
            let b;
            switch (type) {
                case "sine":
                    b = (n <= partialCount) ? 1 : 0;
                    this._partials[n - 1] = b;
                    break;
                case "square":
                    b = (n & 1) ? 2 * piFactor : 0;
                    this._partials[n - 1] = b;
                    break;
                case "sawtooth":
                    b = piFactor * ((n & 1) ? 1 : -1);
                    this._partials[n - 1] = b;
                    break;
                case "triangle":
                    if (n & 1) {
                        b = 2 * (piFactor * piFactor) * ((((n - 1) >> 1) & 1) ? -1 : 1);
                    }
                    else {
                        b = 0;
                    }
                    this._partials[n - 1] = b;
                    break;
                case "custom":
                    b = this._partials[n - 1];
                    break;
                default:
                    throw new TypeError("Oscillator: invalid type: " + type);
            }
            if (b !== 0) {
                real[n] = -b * Math.sin(phase * n);
                imag[n] = b * Math.cos(phase * n);
            }
            else {
                real[n] = 0;
                imag[n] = 0;
            }
        }
        return [real, imag];
    }
    /**
     * Compute the inverse FFT for a given phase.
     */
    _inverseFFT(real, imag, phase) {
        let sum = 0;
        const len = real.length;
        for (let i = 0; i < len; i++) {
            sum += real[i] * Math.cos(i * phase) + imag[i] * Math.sin(i * phase);
        }
        return sum;
    }
    /**
     * Returns the initial value of the oscillator when stopped.
     * E.g. a "sine" oscillator with phase = 90 would return an initial value of -1.
     */
    getInitialValue() {
        const [real, imag] = this._getRealImaginary(this._type, 0);
        let maxValue = 0;
        const twoPi = Math.PI * 2;
        const testPositions = 32;
        // check for peaks in 16 places
        for (let i = 0; i < testPositions; i++) {
            maxValue = Math.max(this._inverseFFT(real, imag, (i / testPositions) * twoPi), maxValue);
        }
        return clamp(-this._inverseFFT(real, imag, this._phase) / maxValue, -1, 1);
    }
    get partials() {
        return this._partials.slice(0, this.partialCount);
    }
    set partials(partials) {
        this._partials = partials;
        this._partialCount = this._partials.length;
        if (partials.length) {
            this.type = "custom";
        }
    }
    get phase() {
        return this._phase * (180 / Math.PI);
    }
    set phase(phase) {
        this._phase = phase * Math.PI / 180;
        // reset the type
        this.type = this._type;
    }
    asArray(length = 1024) {
        return __awaiter(this, void 0, void 0, function* () {
            return generateWaveform(this, length);
        });
    }
    dispose() {
        super.dispose();
        if (this._oscillator !== null) {
            this._oscillator.dispose();
        }
        this._wave = undefined;
        this.frequency.dispose();
        this.detune.dispose();
        return this;
    }
}
/**
 * Cache the periodic waves to avoid having to redo computations
 */
Oscillator._periodicWaveCache = [];

/**
 * A signal operator has an input and output and modifies the signal.
 */
class SignalOperator extends ToneAudioNode {
    constructor() {
        super(Object.assign(optionsFromArguments(SignalOperator.getDefaults(), arguments, ["context"])));
    }
    connect(destination, outputNum = 0, inputNum = 0) {
        connectSignal(this, destination, outputNum, inputNum);
        return this;
    }
}

/**
 * Wraps the native Web Audio API
 * [WaveShaperNode](http://webaudio.github.io/web-audio-api/#the-waveshapernode-interface).
 *
 * @example
 * const osc = new Tone.Oscillator().toDestination().start();
 * // multiply the output of the signal by 2 using the waveshaper's function
 * const timesTwo = new Tone.WaveShaper((val) => val * 2, 2048).connect(osc.frequency);
 * const signal = new Tone.Signal(440).connect(timesTwo);
 * @category Signal
 */
class WaveShaper extends SignalOperator {
    constructor() {
        super(Object.assign(optionsFromArguments(WaveShaper.getDefaults(), arguments, ["mapping", "length"])));
        this.name = "WaveShaper";
        /**
         * the waveshaper node
         */
        this._shaper = this.context.createWaveShaper();
        /**
         * The input to the waveshaper node.
         */
        this.input = this._shaper;
        /**
         * The output from the waveshaper node
         */
        this.output = this._shaper;
        const options = optionsFromArguments(WaveShaper.getDefaults(), arguments, ["mapping", "length"]);
        if (isArray(options.mapping) || options.mapping instanceof Float32Array) {
            this.curve = Float32Array.from(options.mapping);
        }
        else if (isFunction(options.mapping)) {
            this.setMap(options.mapping, options.length);
        }
    }
    static getDefaults() {
        return Object.assign(Signal.getDefaults(), {
            length: 1024,
        });
    }
    /**
     * Uses a mapping function to set the value of the curve.
     * @param mapping The function used to define the values.
     *                The mapping function take two arguments:
     *                the first is the value at the current position
     *                which goes from -1 to 1 over the number of elements
     *                in the curve array. The second argument is the array position.
     * @example
     * const shaper = new Tone.WaveShaper();
     * // map the input signal from [-1, 1] to [0, 10]
     * shaper.setMap((val, index) => (val + 1) * 5);
     */
    setMap(mapping, length = 1024) {
        const array = new Float32Array(length);
        for (let i = 0, len = length; i < len; i++) {
            const normalized = (i / (len - 1)) * 2 - 1;
            array[i] = mapping(normalized, i);
        }
        this.curve = array;
        return this;
    }
    /**
     * The array to set as the waveshaper curve. For linear curves
     * array length does not make much difference, but for complex curves
     * longer arrays will provide smoother interpolation.
     */
    get curve() {
        return this._shaper.curve;
    }
    set curve(mapping) {
        this._shaper.curve = mapping;
    }
    /**
     * Specifies what type of oversampling (if any) should be used when
     * applying the shaping curve. Can either be "none", "2x" or "4x".
     */
    get oversample() {
        return this._shaper.oversample;
    }
    set oversample(oversampling) {
        const isOverSampleType = ["none", "2x", "4x"].some(str => str.includes(oversampling));
        assert(isOverSampleType, "oversampling must be either 'none', '2x', or '4x'");
        this._shaper.oversample = oversampling;
    }
    /**
     * Clean up.
     */
    dispose() {
        super.dispose();
        this._shaper.disconnect();
        return this;
    }
}

/**
 * AudioToGain converts an input in AudioRange [-1,1] to NormalRange [0,1].
 * See [[GainToAudio]].
 * @category Signal
 */
class AudioToGain extends SignalOperator {
    constructor() {
        super(...arguments);
        this.name = "AudioToGain";
        /**
         * The node which converts the audio ranges
         */
        this._norm = new WaveShaper({
            context: this.context,
            mapping: x => (x + 1) / 2,
        });
        /**
         * The AudioRange input [-1, 1]
         */
        this.input = this._norm;
        /**
         * The GainRange output [0, 1]
         */
        this.output = this._norm;
    }
    /**
     * clean up
     */
    dispose() {
        super.dispose();
        this._norm.dispose();
        return this;
    }
}

/**
 * Multiply two incoming signals. Or, if a number is given in the constructor,
 * multiplies the incoming signal by that value.
 *
 * @example
 * // multiply two signals
 * const mult = new Tone.Multiply();
 * const sigA = new Tone.Signal(3);
 * const sigB = new Tone.Signal(4);
 * sigA.connect(mult);
 * sigB.connect(mult.factor);
 * // output of mult is 12.
 * @example
 * // multiply a signal and a number
 * const mult = new Tone.Multiply(10);
 * const sig = new Tone.Signal(2).connect(mult);
 * // the output of mult is 20.
 * @category Signal
 */
class Multiply extends Signal {
    constructor() {
        super(Object.assign(optionsFromArguments(Multiply.getDefaults(), arguments, ["value"])));
        this.name = "Multiply";
        /**
         * Indicates if the value should be overridden on connection
         */
        this.override = false;
        const options = optionsFromArguments(Multiply.getDefaults(), arguments, ["value"]);
        this._mult = this.input = this.output = new Gain({
            context: this.context,
            minValue: options.minValue,
            maxValue: options.maxValue,
        });
        this.factor = this._param = this._mult.gain;
        this.factor.setValueAtTime(options.value, 0);
    }
    static getDefaults() {
        return Object.assign(Signal.getDefaults(), {
            value: 0,
        });
    }
    dispose() {
        super.dispose();
        this._mult.dispose();
        return this;
    }
}

/**
 * An amplitude modulated oscillator node. It is implemented with
 * two oscillators, one which modulators the other's amplitude
 * through a gain node.
 * ```
 *    +-------------+       +----------+
 *    | Carrier Osc +>------> GainNode |
 *    +-------------+       |          +--->Output
 *                      +---> gain     |
 * +---------------+    |   +----------+
 * | Modulator Osc +>---+
 * +---------------+
 * ```
 * @example
 * return Tone.Offline(() => {
 * 	const amOsc = new Tone.AMOscillator(30, "sine", "square").toDestination().start();
 * }, 0.2, 1);
 * @category Source
 */
class AMOscillator extends Source {
    constructor() {
        super(optionsFromArguments(AMOscillator.getDefaults(), arguments, ["frequency", "type", "modulationType"]));
        this.name = "AMOscillator";
        /**
         * convert the -1,1 output to 0,1
         */
        this._modulationScale = new AudioToGain({ context: this.context });
        /**
         * the node where the modulation happens
         */
        this._modulationNode = new Gain({
            context: this.context,
        });
        const options = optionsFromArguments(AMOscillator.getDefaults(), arguments, ["frequency", "type", "modulationType"]);
        this._carrier = new Oscillator({
            context: this.context,
            detune: options.detune,
            frequency: options.frequency,
            onstop: () => this.onstop(this),
            phase: options.phase,
            type: options.type,
        });
        this.frequency = this._carrier.frequency,
            this.detune = this._carrier.detune;
        this._modulator = new Oscillator({
            context: this.context,
            phase: options.phase,
            type: options.modulationType,
        });
        this.harmonicity = new Multiply({
            context: this.context,
            units: "positive",
            value: options.harmonicity,
        });
        // connections
        this.frequency.chain(this.harmonicity, this._modulator.frequency);
        this._modulator.chain(this._modulationScale, this._modulationNode.gain);
        this._carrier.chain(this._modulationNode, this.output);
        readOnly(this, ["frequency", "detune", "harmonicity"]);
    }
    static getDefaults() {
        return Object.assign(Oscillator.getDefaults(), {
            harmonicity: 1,
            modulationType: "square",
        });
    }
    /**
     * start the oscillator
     */
    _start(time) {
        this._modulator.start(time);
        this._carrier.start(time);
    }
    /**
     * stop the oscillator
     */
    _stop(time) {
        this._modulator.stop(time);
        this._carrier.stop(time);
    }
    _restart(time) {
        this._modulator.restart(time);
        this._carrier.restart(time);
    }
    /**
     * The type of the carrier oscillator
     */
    get type() {
        return this._carrier.type;
    }
    set type(type) {
        this._carrier.type = type;
    }
    get baseType() {
        return this._carrier.baseType;
    }
    set baseType(baseType) {
        this._carrier.baseType = baseType;
    }
    get partialCount() {
        return this._carrier.partialCount;
    }
    set partialCount(partialCount) {
        this._carrier.partialCount = partialCount;
    }
    /**
     * The type of the modulator oscillator
     */
    get modulationType() {
        return this._modulator.type;
    }
    set modulationType(type) {
        this._modulator.type = type;
    }
    get phase() {
        return this._carrier.phase;
    }
    set phase(phase) {
        this._carrier.phase = phase;
        this._modulator.phase = phase;
    }
    get partials() {
        return this._carrier.partials;
    }
    set partials(partials) {
        this._carrier.partials = partials;
    }
    asArray(length = 1024) {
        return __awaiter(this, void 0, void 0, function* () {
            return generateWaveform(this, length);
        });
    }
    /**
     * Clean up.
     */
    dispose() {
        super.dispose();
        this.frequency.dispose();
        this.detune.dispose();
        this.harmonicity.dispose();
        this._carrier.dispose();
        this._modulator.dispose();
        this._modulationNode.dispose();
        this._modulationScale.dispose();
        return this;
    }
}

/**
 * FMOscillator implements a frequency modulation synthesis
 * ```
 *                                              +-------------+
 * +---------------+        +-------------+     | Carrier Osc |
 * | Modulator Osc +>-------> GainNode    |     |             +--->Output
 * +---------------+        |             +>----> frequency   |
 *                       +--> gain        |     +-------------+
 *                       |  +-------------+
 * +-----------------+   |
 * | modulationIndex +>--+
 * +-----------------+
 * ```
 *
 * @example
 * return Tone.Offline(() => {
 * 	const fmOsc = new Tone.FMOscillator({
 * 		frequency: 200,
 * 		type: "square",
 * 		modulationType: "triangle",
 * 		harmonicity: 0.2,
 * 		modulationIndex: 3
 * 	}).toDestination().start();
 * }, 0.1, 1);
 * @category Source
 */
class FMOscillator extends Source {
    constructor() {
        super(optionsFromArguments(FMOscillator.getDefaults(), arguments, ["frequency", "type", "modulationType"]));
        this.name = "FMOscillator";
        /**
         * the node where the modulation happens
         */
        this._modulationNode = new Gain({
            context: this.context,
            gain: 0,
        });
        const options = optionsFromArguments(FMOscillator.getDefaults(), arguments, ["frequency", "type", "modulationType"]);
        this._carrier = new Oscillator({
            context: this.context,
            detune: options.detune,
            frequency: 0,
            onstop: () => this.onstop(this),
            phase: options.phase,
            type: options.type,
        });
        this.detune = this._carrier.detune;
        this.frequency = new Signal({
            context: this.context,
            units: "frequency",
            value: options.frequency,
        });
        this._modulator = new Oscillator({
            context: this.context,
            phase: options.phase,
            type: options.modulationType,
        });
        this.harmonicity = new Multiply({
            context: this.context,
            units: "positive",
            value: options.harmonicity,
        });
        this.modulationIndex = new Multiply({
            context: this.context,
            units: "positive",
            value: options.modulationIndex,
        });
        // connections
        this.frequency.connect(this._carrier.frequency);
        this.frequency.chain(this.harmonicity, this._modulator.frequency);
        this.frequency.chain(this.modulationIndex, this._modulationNode);
        this._modulator.connect(this._modulationNode.gain);
        this._modulationNode.connect(this._carrier.frequency);
        this._carrier.connect(this.output);
        this.detune.connect(this._modulator.detune);
        readOnly(this, ["modulationIndex", "frequency", "detune", "harmonicity"]);
    }
    static getDefaults() {
        return Object.assign(Oscillator.getDefaults(), {
            harmonicity: 1,
            modulationIndex: 2,
            modulationType: "square",
        });
    }
    /**
     * start the oscillator
     */
    _start(time) {
        this._modulator.start(time);
        this._carrier.start(time);
    }
    /**
     * stop the oscillator
     */
    _stop(time) {
        this._modulator.stop(time);
        this._carrier.stop(time);
    }
    _restart(time) {
        this._modulator.restart(time);
        this._carrier.restart(time);
        return this;
    }
    get type() {
        return this._carrier.type;
    }
    set type(type) {
        this._carrier.type = type;
    }
    get baseType() {
        return this._carrier.baseType;
    }
    set baseType(baseType) {
        this._carrier.baseType = baseType;
    }
    get partialCount() {
        return this._carrier.partialCount;
    }
    set partialCount(partialCount) {
        this._carrier.partialCount = partialCount;
    }
    /**
     * The type of the modulator oscillator
     */
    get modulationType() {
        return this._modulator.type;
    }
    set modulationType(type) {
        this._modulator.type = type;
    }
    get phase() {
        return this._carrier.phase;
    }
    set phase(phase) {
        this._carrier.phase = phase;
        this._modulator.phase = phase;
    }
    get partials() {
        return this._carrier.partials;
    }
    set partials(partials) {
        this._carrier.partials = partials;
    }
    asArray(length = 1024) {
        return __awaiter(this, void 0, void 0, function* () {
            return generateWaveform(this, length);
        });
    }
    /**
     * Clean up.
     */
    dispose() {
        super.dispose();
        this.frequency.dispose();
        this.harmonicity.dispose();
        this._carrier.dispose();
        this._modulator.dispose();
        this._modulationNode.dispose();
        this.modulationIndex.dispose();
        return this;
    }
}

/**
 * PulseOscillator is an oscillator with control over pulse width,
 * also known as the duty cycle. At 50% duty cycle (width = 0) the wave is
 * a square wave.
 * [Read more](https://wigglewave.wordpress.com/2014/08/16/pulse-waveforms-and-harmonics/).
 * ```
 *    width = -0.25        width = 0.0          width = 0.25
 *
 *   +-----+            +-------+       +    +-------+     +-+
 *   |     |            |       |       |            |     |
 *   |     |            |       |       |            |     |
 * +-+     +-------+    +       +-------+            +-----+
 *
 *
 *    width = -0.5                              width = 0.5
 *
 *     +---+                                 +-------+   +---+
 *     |   |                                         |   |
 *     |   |                                         |   |
 * +---+   +-------+                                 +---+
 *
 *
 *    width = -0.75                             width = 0.75
 *
 *       +-+                                 +-------+ +-----+
 *       | |                                         | |
 *       | |                                         | |
 * +-----+ +-------+                                 +-+
 * ```
 * @example
 * return Tone.Offline(() => {
 * 	const pulse = new Tone.PulseOscillator(50, 0.4).toDestination().start();
 * }, 0.1, 1);
 * @category Source
 */
class PulseOscillator extends Source {
    constructor() {
        super(optionsFromArguments(PulseOscillator.getDefaults(), arguments, ["frequency", "width"]));
        this.name = "PulseOscillator";
        /**
         * gate the width amount
         */
        this._widthGate = new Gain({
            context: this.context,
            gain: 0,
        });
        /**
         * Threshold the signal to turn it into a square
         */
        this._thresh = new WaveShaper({
            context: this.context,
            mapping: val => val <= 0 ? -1 : 1,
        });
        const options = optionsFromArguments(PulseOscillator.getDefaults(), arguments, ["frequency", "width"]);
        this.width = new Signal({
            context: this.context,
            units: "audioRange",
            value: options.width,
        });
        this._triangle = new Oscillator({
            context: this.context,
            detune: options.detune,
            frequency: options.frequency,
            onstop: () => this.onstop(this),
            phase: options.phase,
            type: "triangle",
        });
        this.frequency = this._triangle.frequency;
        this.detune = this._triangle.detune;
        // connections
        this._triangle.chain(this._thresh, this.output);
        this.width.chain(this._widthGate, this._thresh);
        readOnly(this, ["width", "frequency", "detune"]);
    }
    static getDefaults() {
        return Object.assign(Source.getDefaults(), {
            detune: 0,
            frequency: 440,
            phase: 0,
            type: "pulse",
            width: 0.2,
        });
    }
    /**
     * start the oscillator
     */
    _start(time) {
        time = this.toSeconds(time);
        this._triangle.start(time);
        this._widthGate.gain.setValueAtTime(1, time);
    }
    /**
     * stop the oscillator
     */
    _stop(time) {
        time = this.toSeconds(time);
        this._triangle.stop(time);
        // the width is still connected to the output.
        // that needs to be stopped also
        this._widthGate.gain.cancelScheduledValues(time);
        this._widthGate.gain.setValueAtTime(0, time);
    }
    _restart(time) {
        this._triangle.restart(time);
        this._widthGate.gain.cancelScheduledValues(time);
        this._widthGate.gain.setValueAtTime(1, time);
    }
    /**
     * The phase of the oscillator in degrees.
     */
    get phase() {
        return this._triangle.phase;
    }
    set phase(phase) {
        this._triangle.phase = phase;
    }
    /**
     * The type of the oscillator. Always returns "pulse".
     */
    get type() {
        return "pulse";
    }
    /**
     * The baseType of the oscillator. Always returns "pulse".
     */
    get baseType() {
        return "pulse";
    }
    /**
     * The partials of the waveform. Cannot set partials for this waveform type
     */
    get partials() {
        return [];
    }
    /**
     * No partials for this waveform type.
     */
    get partialCount() {
        return 0;
    }
    /**
     * *Internal use* The carrier oscillator type is fed through the
     * waveshaper node to create the pulse. Using different carrier oscillators
     * changes oscillator's behavior.
     */
    set carrierType(type) {
        this._triangle.type = type;
    }
    asArray(length = 1024) {
        return __awaiter(this, void 0, void 0, function* () {
            return generateWaveform(this, length);
        });
    }
    /**
     * Clean up method.
     */
    dispose() {
        super.dispose();
        this._triangle.dispose();
        this.width.dispose();
        this._widthGate.dispose();
        this._thresh.dispose();
        return this;
    }
}

/**
 * FatOscillator is an array of oscillators with detune spread between the oscillators
 * @example
 * const fatOsc = new Tone.FatOscillator("Ab3", "sawtooth", 40).toDestination().start();
 * @category Source
 */
class FatOscillator extends Source {
    constructor() {
        super(optionsFromArguments(FatOscillator.getDefaults(), arguments, ["frequency", "type", "spread"]));
        this.name = "FatOscillator";
        /**
         * The array of oscillators
         */
        this._oscillators = [];
        const options = optionsFromArguments(FatOscillator.getDefaults(), arguments, ["frequency", "type", "spread"]);
        this.frequency = new Signal({
            context: this.context,
            units: "frequency",
            value: options.frequency,
        });
        this.detune = new Signal({
            context: this.context,
            units: "cents",
            value: options.detune,
        });
        this._spread = options.spread;
        this._type = options.type;
        this._phase = options.phase;
        this._partials = options.partials;
        this._partialCount = options.partialCount;
        // set the count initially
        this.count = options.count;
        readOnly(this, ["frequency", "detune"]);
    }
    static getDefaults() {
        return Object.assign(Oscillator.getDefaults(), {
            count: 3,
            spread: 20,
            type: "sawtooth",
        });
    }
    /**
     * start the oscillator
     */
    _start(time) {
        time = this.toSeconds(time);
        this._forEach(osc => osc.start(time));
    }
    /**
     * stop the oscillator
     */
    _stop(time) {
        time = this.toSeconds(time);
        this._forEach(osc => osc.stop(time));
    }
    _restart(time) {
        this._forEach(osc => osc.restart(time));
    }
    /**
     * Iterate over all of the oscillators
     */
    _forEach(iterator) {
        for (let i = 0; i < this._oscillators.length; i++) {
            iterator(this._oscillators[i], i);
        }
    }
    /**
     * The type of the oscillator
     */
    get type() {
        return this._type;
    }
    set type(type) {
        this._type = type;
        this._forEach(osc => osc.type = type);
    }
    /**
     * The detune spread between the oscillators. If "count" is
     * set to 3 oscillators and the "spread" is set to 40,
     * the three oscillators would be detuned like this: [-20, 0, 20]
     * for a total detune spread of 40 cents.
     * @example
     * const fatOsc = new Tone.FatOscillator().toDestination().start();
     * fatOsc.spread = 70;
     */
    get spread() {
        return this._spread;
    }
    set spread(spread) {
        this._spread = spread;
        if (this._oscillators.length > 1) {
            const start = -spread / 2;
            const step = spread / (this._oscillators.length - 1);
            this._forEach((osc, i) => osc.detune.value = start + step * i);
        }
    }
    /**
     * The number of detuned oscillators. Must be an integer greater than 1.
     * @example
     * const fatOsc = new Tone.FatOscillator("C#3", "sawtooth").toDestination().start();
     * // use 4 sawtooth oscillators
     * fatOsc.count = 4;
     */
    get count() {
        return this._oscillators.length;
    }
    set count(count) {
        assertRange(count, 1);
        if (this._oscillators.length !== count) {
            // dispose the previous oscillators
            this._forEach(osc => osc.dispose());
            this._oscillators = [];
            for (let i = 0; i < count; i++) {
                const osc = new Oscillator({
                    context: this.context,
                    volume: -6 - count * 1.1,
                    type: this._type,
                    phase: this._phase + (i / count) * 360,
                    partialCount: this._partialCount,
                    onstop: i === 0 ? () => this.onstop(this) : noOp,
                });
                if (this.type === "custom") {
                    osc.partials = this._partials;
                }
                this.frequency.connect(osc.frequency);
                this.detune.connect(osc.detune);
                osc.detune.overridden = false;
                osc.connect(this.output);
                this._oscillators[i] = osc;
            }
            // set the spread
            this.spread = this._spread;
            if (this.state === "started") {
                this._forEach(osc => osc.start());
            }
        }
    }
    get phase() {
        return this._phase;
    }
    set phase(phase) {
        this._phase = phase;
        this._forEach((osc, i) => osc.phase = this._phase + (i / this.count) * 360);
    }
    get baseType() {
        return this._oscillators[0].baseType;
    }
    set baseType(baseType) {
        this._forEach(osc => osc.baseType = baseType);
        this._type = this._oscillators[0].type;
    }
    get partials() {
        return this._oscillators[0].partials;
    }
    set partials(partials) {
        this._partials = partials;
        this._partialCount = this._partials.length;
        if (partials.length) {
            this._type = "custom";
            this._forEach(osc => osc.partials = partials);
        }
    }
    get partialCount() {
        return this._oscillators[0].partialCount;
    }
    set partialCount(partialCount) {
        this._partialCount = partialCount;
        this._forEach(osc => osc.partialCount = partialCount);
        this._type = this._oscillators[0].type;
    }
    asArray(length = 1024) {
        return __awaiter(this, void 0, void 0, function* () {
            return generateWaveform(this, length);
        });
    }
    /**
     * Clean up.
     */
    dispose() {
        super.dispose();
        this.frequency.dispose();
        this.detune.dispose();
        this._forEach(osc => osc.dispose());
        return this;
    }
}

/**
 * PWMOscillator modulates the width of a Tone.PulseOscillator
 * at the modulationFrequency. This has the effect of continuously
 * changing the timbre of the oscillator by altering the harmonics
 * generated.
 * @example
 * return Tone.Offline(() => {
 * 	const pwm = new Tone.PWMOscillator(60, 0.3).toDestination().start();
 * }, 0.1, 1);
 * @category Source
 */
class PWMOscillator extends Source {
    constructor() {
        super(optionsFromArguments(PWMOscillator.getDefaults(), arguments, ["frequency", "modulationFrequency"]));
        this.name = "PWMOscillator";
        this.sourceType = "pwm";
        /**
         * Scale the oscillator so it doesn't go silent
         * at the extreme values.
         */
        this._scale = new Multiply({
            context: this.context,
            value: 2,
        });
        const options = optionsFromArguments(PWMOscillator.getDefaults(), arguments, ["frequency", "modulationFrequency"]);
        this._pulse = new PulseOscillator({
            context: this.context,
            frequency: options.modulationFrequency,
        });
        // change the pulse oscillator type
        this._pulse.carrierType = "sine";
        this.modulationFrequency = this._pulse.frequency;
        this._modulator = new Oscillator({
            context: this.context,
            detune: options.detune,
            frequency: options.frequency,
            onstop: () => this.onstop(this),
            phase: options.phase,
        });
        this.frequency = this._modulator.frequency;
        this.detune = this._modulator.detune;
        // connections
        this._modulator.chain(this._scale, this._pulse.width);
        this._pulse.connect(this.output);
        readOnly(this, ["modulationFrequency", "frequency", "detune"]);
    }
    static getDefaults() {
        return Object.assign(Source.getDefaults(), {
            detune: 0,
            frequency: 440,
            modulationFrequency: 0.4,
            phase: 0,
            type: "pwm",
        });
    }
    /**
     * start the oscillator
     */
    _start(time) {
        time = this.toSeconds(time);
        this._modulator.start(time);
        this._pulse.start(time);
    }
    /**
     * stop the oscillator
     */
    _stop(time) {
        time = this.toSeconds(time);
        this._modulator.stop(time);
        this._pulse.stop(time);
    }
    /**
     * restart the oscillator
     */
    _restart(time) {
        this._modulator.restart(time);
        this._pulse.restart(time);
    }
    /**
     * The type of the oscillator. Always returns "pwm".
     */
    get type() {
        return "pwm";
    }
    /**
     * The baseType of the oscillator. Always returns "pwm".
     */
    get baseType() {
        return "pwm";
    }
    /**
     * The partials of the waveform. Cannot set partials for this waveform type
     */
    get partials() {
        return [];
    }
    /**
     * No partials for this waveform type.
     */
    get partialCount() {
        return 0;
    }
    /**
     * The phase of the oscillator in degrees.
     */
    get phase() {
        return this._modulator.phase;
    }
    set phase(phase) {
        this._modulator.phase = phase;
    }
    asArray(length = 1024) {
        return __awaiter(this, void 0, void 0, function* () {
            return generateWaveform(this, length);
        });
    }
    /**
     * Clean up.
     */
    dispose() {
        super.dispose();
        this._pulse.dispose();
        this._scale.dispose();
        this._modulator.dispose();
        return this;
    }
}

const OmniOscillatorSourceMap = {
    am: AMOscillator,
    fat: FatOscillator,
    fm: FMOscillator,
    oscillator: Oscillator,
    pulse: PulseOscillator,
    pwm: PWMOscillator,
};
/**
 * OmniOscillator aggregates all of the oscillator types into one.
 * @example
 * return Tone.Offline(() => {
 * 	const omniOsc = new Tone.OmniOscillator("C#4", "pwm").toDestination().start();
 * }, 0.1, 1);
 * @category Source
 */
class OmniOscillator extends Source {
    constructor() {
        super(optionsFromArguments(OmniOscillator.getDefaults(), arguments, ["frequency", "type"]));
        this.name = "OmniOscillator";
        const options = optionsFromArguments(OmniOscillator.getDefaults(), arguments, ["frequency", "type"]);
        this.frequency = new Signal({
            context: this.context,
            units: "frequency",
            value: options.frequency,
        });
        this.detune = new Signal({
            context: this.context,
            units: "cents",
            value: options.detune,
        });
        readOnly(this, ["frequency", "detune"]);
        // set the options
        this.set(options);
    }
    static getDefaults() {
        return Object.assign(Oscillator.getDefaults(), FMOscillator.getDefaults(), AMOscillator.getDefaults(), FatOscillator.getDefaults(), PulseOscillator.getDefaults(), PWMOscillator.getDefaults());
    }
    /**
     * start the oscillator
     */
    _start(time) {
        this._oscillator.start(time);
    }
    /**
     * start the oscillator
     */
    _stop(time) {
        this._oscillator.stop(time);
    }
    _restart(time) {
        this._oscillator.restart(time);
        return this;
    }
    /**
     * The type of the oscillator. Can be any of the basic types: sine, square, triangle, sawtooth. Or
     * prefix the basic types with "fm", "am", or "fat" to use the FMOscillator, AMOscillator or FatOscillator
     * types. The oscillator could also be set to "pwm" or "pulse". All of the parameters of the
     * oscillator's class are accessible when the oscillator is set to that type, but throws an error
     * when it's not.
     * @example
     * const omniOsc = new Tone.OmniOscillator().toDestination().start();
     * omniOsc.type = "pwm";
     * // modulationFrequency is parameter which is available
     * // only when the type is "pwm".
     * omniOsc.modulationFrequency.value = 0.5;
     */
    get type() {
        let prefix = "";
        if (["am", "fm", "fat"].some(p => this._sourceType === p)) {
            prefix = this._sourceType;
        }
        return prefix + this._oscillator.type;
    }
    set type(type) {
        if (type.substr(0, 2) === "fm") {
            this._createNewOscillator("fm");
            this._oscillator = this._oscillator;
            this._oscillator.type = type.substr(2);
        }
        else if (type.substr(0, 2) === "am") {
            this._createNewOscillator("am");
            this._oscillator = this._oscillator;
            this._oscillator.type = type.substr(2);
        }
        else if (type.substr(0, 3) === "fat") {
            this._createNewOscillator("fat");
            this._oscillator = this._oscillator;
            this._oscillator.type = type.substr(3);
        }
        else if (type === "pwm") {
            this._createNewOscillator("pwm");
            this._oscillator = this._oscillator;
        }
        else if (type === "pulse") {
            this._createNewOscillator("pulse");
        }
        else {
            this._createNewOscillator("oscillator");
            this._oscillator = this._oscillator;
            this._oscillator.type = type;
        }
    }
    /**
     * The value is an empty array when the type is not "custom".
     * This is not available on "pwm" and "pulse" oscillator types.
     * See [[Oscillator.partials]]
     */
    get partials() {
        return this._oscillator.partials;
    }
    set partials(partials) {
        if (!this._getOscType(this._oscillator, "pulse") && !this._getOscType(this._oscillator, "pwm")) {
            this._oscillator.partials = partials;
        }
    }
    get partialCount() {
        return this._oscillator.partialCount;
    }
    set partialCount(partialCount) {
        if (!this._getOscType(this._oscillator, "pulse") && !this._getOscType(this._oscillator, "pwm")) {
            this._oscillator.partialCount = partialCount;
        }
    }
    set(props) {
        // make sure the type is set first
        if (Reflect.has(props, "type") && props.type) {
            this.type = props.type;
        }
        // then set the rest
        super.set(props);
        return this;
    }
    /**
     * connect the oscillator to the frequency and detune signals
     */
    _createNewOscillator(oscType) {
        if (oscType !== this._sourceType) {
            this._sourceType = oscType;
            const OscConstructor = OmniOscillatorSourceMap[oscType];
            // short delay to avoid clicks on the change
            const now = this.now();
            if (this._oscillator) {
                const oldOsc = this._oscillator;
                oldOsc.stop(now);
                // dispose the old one
                this.context.setTimeout(() => oldOsc.dispose(), this.blockTime);
            }
            this._oscillator = new OscConstructor({
                context: this.context,
            });
            this.frequency.connect(this._oscillator.frequency);
            this.detune.connect(this._oscillator.detune);
            this._oscillator.connect(this.output);
            this._oscillator.onstop = () => this.onstop(this);
            if (this.state === "started") {
                this._oscillator.start(now);
            }
        }
    }
    get phase() {
        return this._oscillator.phase;
    }
    set phase(phase) {
        this._oscillator.phase = phase;
    }
    /**
     * The source type of the oscillator.
     * @example
     * const omniOsc = new Tone.OmniOscillator(440, "fmsquare");
     * console.log(omniOsc.sourceType); // 'fm'
     */
    get sourceType() {
        return this._sourceType;
    }
    set sourceType(sType) {
        // the basetype defaults to sine
        let baseType = "sine";
        if (this._oscillator.type !== "pwm" && this._oscillator.type !== "pulse") {
            baseType = this._oscillator.type;
        }
        // set the type
        if (sType === "fm") {
            this.type = "fm" + baseType;
        }
        else if (sType === "am") {
            this.type = "am" + baseType;
        }
        else if (sType === "fat") {
            this.type = "fat" + baseType;
        }
        else if (sType === "oscillator") {
            this.type = baseType;
        }
        else if (sType === "pulse") {
            this.type = "pulse";
        }
        else if (sType === "pwm") {
            this.type = "pwm";
        }
    }
    _getOscType(osc, sourceType) {
        return osc instanceof OmniOscillatorSourceMap[sourceType];
    }
    /**
     * The base type of the oscillator. See [[Oscillator.baseType]]
     * @example
     * const omniOsc = new Tone.OmniOscillator(440, "fmsquare4");
     * console.log(omniOsc.sourceType, omniOsc.baseType, omniOsc.partialCount);
     */
    get baseType() {
        return this._oscillator.baseType;
    }
    set baseType(baseType) {
        if (!this._getOscType(this._oscillator, "pulse") &&
            !this._getOscType(this._oscillator, "pwm") &&
            baseType !== "pulse" && baseType !== "pwm") {
            this._oscillator.baseType = baseType;
        }
    }
    /**
     * The width of the oscillator when sourceType === "pulse".
     * See [[PWMOscillator.width]]
     */
    get width() {
        if (this._getOscType(this._oscillator, "pulse")) {
            return this._oscillator.width;
        }
        else {
            return undefined;
        }
    }
    /**
     * The number of detuned oscillators when sourceType === "fat".
     * See [[FatOscillator.count]]
     */
    get count() {
        if (this._getOscType(this._oscillator, "fat")) {
            return this._oscillator.count;
        }
        else {
            return undefined;
        }
    }
    set count(count) {
        if (this._getOscType(this._oscillator, "fat") && isNumber(count)) {
            this._oscillator.count = count;
        }
    }
    /**
     * The detune spread between the oscillators when sourceType === "fat".
     * See [[FatOscillator.count]]
     */
    get spread() {
        if (this._getOscType(this._oscillator, "fat")) {
            return this._oscillator.spread;
        }
        else {
            return undefined;
        }
    }
    set spread(spread) {
        if (this._getOscType(this._oscillator, "fat") && isNumber(spread)) {
            this._oscillator.spread = spread;
        }
    }
    /**
     * The type of the modulator oscillator. Only if the oscillator is set to "am" or "fm" types.
     * See [[AMOscillator]] or [[FMOscillator]]
     */
    get modulationType() {
        if (this._getOscType(this._oscillator, "fm") || this._getOscType(this._oscillator, "am")) {
            return this._oscillator.modulationType;
        }
        else {
            return undefined;
        }
    }
    set modulationType(mType) {
        if ((this._getOscType(this._oscillator, "fm") || this._getOscType(this._oscillator, "am")) && isString(mType)) {
            this._oscillator.modulationType = mType;
        }
    }
    /**
     * The modulation index when the sourceType === "fm"
     * See [[FMOscillator]].
     */
    get modulationIndex() {
        if (this._getOscType(this._oscillator, "fm")) {
            return this._oscillator.modulationIndex;
        }
        else {
            return undefined;
        }
    }
    /**
     * Harmonicity is the frequency ratio between the carrier and the modulator oscillators.
     * See [[AMOscillator]] or [[FMOscillator]]
     */
    get harmonicity() {
        if (this._getOscType(this._oscillator, "fm") || this._getOscType(this._oscillator, "am")) {
            return this._oscillator.harmonicity;
        }
        else {
            return undefined;
        }
    }
    /**
     * The modulationFrequency Signal of the oscillator when sourceType === "pwm"
     * see [[PWMOscillator]]
     * @min 0.1
     * @max 5
     */
    get modulationFrequency() {
        if (this._getOscType(this._oscillator, "pwm")) {
            return this._oscillator.modulationFrequency;
        }
        else {
            return undefined;
        }
    }
    asArray(length = 1024) {
        return __awaiter(this, void 0, void 0, function* () {
            return generateWaveform(this, length);
        });
    }
    dispose() {
        super.dispose();
        this.detune.dispose();
        this.frequency.dispose();
        this._oscillator.dispose();
        return this;
    }
}

/**
 * Add a signal and a number or two signals. When no value is
 * passed into the constructor, Tone.Add will sum input and `addend`
 * If a value is passed into the constructor, the it will be added to the input.
 *
 * @example
 * return Tone.Offline(() => {
 * 	const add = new Tone.Add(2).toDestination();
 * 	add.addend.setValueAtTime(1, 0.2);
 * 	const signal = new Tone.Signal(2);
 * 	// add a signal and a scalar
 * 	signal.connect(add);
 * 	signal.setValueAtTime(1, 0.1);
 * }, 0.5, 1);
 * @category Signal
 */
class Add extends Signal {
    constructor() {
        super(Object.assign(optionsFromArguments(Add.getDefaults(), arguments, ["value"])));
        this.override = false;
        this.name = "Add";
        /**
         * the summing node
         */
        this._sum = new Gain({ context: this.context });
        this.input = this._sum;
        this.output = this._sum;
        /**
         * The value which is added to the input signal
         */
        this.addend = this._param;
        connectSeries(this._constantSource, this._sum);
    }
    static getDefaults() {
        return Object.assign(Signal.getDefaults(), {
            value: 0,
        });
    }
    dispose() {
        super.dispose();
        this._sum.dispose();
        return this;
    }
}

/**
 * Performs a linear scaling on an input signal.
 * Scales a NormalRange input to between
 * outputMin and outputMax.
 *
 * @example
 * const scale = new Tone.Scale(50, 100);
 * const signal = new Tone.Signal(0.5).connect(scale);
 * // the output of scale equals 75
 * @category Signal
 */
class Scale extends SignalOperator {
    constructor() {
        super(Object.assign(optionsFromArguments(Scale.getDefaults(), arguments, ["min", "max"])));
        this.name = "Scale";
        const options = optionsFromArguments(Scale.getDefaults(), arguments, ["min", "max"]);
        this._mult = this.input = new Multiply({
            context: this.context,
            value: options.max - options.min,
        });
        this._add = this.output = new Add({
            context: this.context,
            value: options.min,
        });
        this._min = options.min;
        this._max = options.max;
        this.input.connect(this.output);
    }
    static getDefaults() {
        return Object.assign(SignalOperator.getDefaults(), {
            max: 1,
            min: 0,
        });
    }
    /**
     * The minimum output value. This number is output when the value input value is 0.
     */
    get min() {
        return this._min;
    }
    set min(min) {
        this._min = min;
        this._setRange();
    }
    /**
     * The maximum output value. This number is output when the value input value is 1.
     */
    get max() {
        return this._max;
    }
    set max(max) {
        this._max = max;
        this._setRange();
    }
    /**
     * set the values
     */
    _setRange() {
        this._add.value = this._min;
        this._mult.value = this._max - this._min;
    }
    dispose() {
        super.dispose();
        this._add.dispose();
        this._mult.dispose();
        return this;
    }
}

/**
 * Tone.Zero outputs 0's at audio-rate. The reason this has to be
 * it's own class is that many browsers optimize out Tone.Signal
 * with a value of 0 and will not process nodes further down the graph.
 * @category Signal
 */
class Zero extends SignalOperator {
    constructor() {
        super(Object.assign(optionsFromArguments(Zero.getDefaults(), arguments)));
        this.name = "Zero";
        /**
         * The gain node which connects the constant source to the output
         */
        this._gain = new Gain({ context: this.context });
        /**
         * Only outputs 0
         */
        this.output = this._gain;
        /**
         * no input node
         */
        this.input = undefined;
        connect(this.context.getConstant(0), this._gain);
    }
    /**
     * clean up
     */
    dispose() {
        super.dispose();
        disconnect(this.context.getConstant(0), this._gain);
        return this;
    }
}

/**
 * LFO stands for low frequency oscillator. LFO produces an output signal
 * which can be attached to an AudioParam or Tone.Signal
 * in order to modulate that parameter with an oscillator. The LFO can
 * also be synced to the transport to start/stop and change when the tempo changes.
 * @example
 * return Tone.Offline(() => {
 * 	const lfo = new Tone.LFO("4n", 400, 4000).start().toDestination();
 * }, 0.5, 1);
 * @category Source
 */
class LFO extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(LFO.getDefaults(), arguments, ["frequency", "min", "max"]));
        this.name = "LFO";
        /**
         * The value that the LFO outputs when it's stopped
         */
        this._stoppedValue = 0;
        /**
         * A private placeholder for the units
         */
        this._units = "number";
        /**
         * If the input value is converted using the [[units]]
         */
        this.convert = true;
        /**
         * Private methods borrowed from Param
         */
        // @ts-ignore
        this._fromType = Param.prototype._fromType;
        // @ts-ignore
        this._toType = Param.prototype._toType;
        // @ts-ignore
        this._is = Param.prototype._is;
        // @ts-ignore
        this._clampValue = Param.prototype._clampValue;
        const options = optionsFromArguments(LFO.getDefaults(), arguments, ["frequency", "min", "max"]);
        this._oscillator = new Oscillator(options);
        this.frequency = this._oscillator.frequency;
        this._amplitudeGain = new Gain({
            context: this.context,
            gain: options.amplitude,
            units: "normalRange",
        });
        this.amplitude = this._amplitudeGain.gain;
        this._stoppedSignal = new Signal({
            context: this.context,
            units: "audioRange",
            value: 0,
        });
        this._zeros = new Zero({ context: this.context });
        this._a2g = new AudioToGain({ context: this.context });
        this._scaler = this.output = new Scale({
            context: this.context,
            max: options.max,
            min: options.min,
        });
        this.units = options.units;
        this.min = options.min;
        this.max = options.max;
        // connect it up
        this._oscillator.chain(this._amplitudeGain, this._a2g, this._scaler);
        this._zeros.connect(this._a2g);
        this._stoppedSignal.connect(this._a2g);
        readOnly(this, ["amplitude", "frequency"]);
        this.phase = options.phase;
    }
    static getDefaults() {
        return Object.assign(Oscillator.getDefaults(), {
            amplitude: 1,
            frequency: "4n",
            max: 1,
            min: 0,
            type: "sine",
            units: "number",
        });
    }
    /**
     * Start the LFO.
     * @param time The time the LFO will start
     */
    start(time) {
        time = this.toSeconds(time);
        this._stoppedSignal.setValueAtTime(0, time);
        this._oscillator.start(time);
        return this;
    }
    /**
     * Stop the LFO.
     * @param  time The time the LFO will stop
     */
    stop(time) {
        time = this.toSeconds(time);
        this._stoppedSignal.setValueAtTime(this._stoppedValue, time);
        this._oscillator.stop(time);
        return this;
    }
    /**
     * Sync the start/stop/pause to the transport
     * and the frequency to the bpm of the transport
     * @example
     * const lfo = new Tone.LFO("8n");
     * lfo.sync().start(0);
     * // the rate of the LFO will always be an eighth note, even as the tempo changes
     */
    sync() {
        this._oscillator.sync();
        this._oscillator.syncFrequency();
        return this;
    }
    /**
     * unsync the LFO from transport control
     */
    unsync() {
        this._oscillator.unsync();
        this._oscillator.unsyncFrequency();
        return this;
    }
    /**
     * After the oscillator waveform is updated, reset the `_stoppedSignal` value to match the updated waveform
     */
    _setStoppedValue() {
        this._stoppedValue = this._oscillator.getInitialValue();
        this._stoppedSignal.value = this._stoppedValue;
    }
    /**
     * The minimum output of the LFO.
     */
    get min() {
        return this._toType(this._scaler.min);
    }
    set min(min) {
        min = this._fromType(min);
        this._scaler.min = min;
    }
    /**
     * The maximum output of the LFO.
     */
    get max() {
        return this._toType(this._scaler.max);
    }
    set max(max) {
        max = this._fromType(max);
        this._scaler.max = max;
    }
    /**
     * The type of the oscillator: See [[Oscillator.type]]
     */
    get type() {
        return this._oscillator.type;
    }
    set type(type) {
        this._oscillator.type = type;
        this._setStoppedValue();
    }
    /**
     * The oscillator's partials array: See [[Oscillator.partials]]
     */
    get partials() {
        return this._oscillator.partials;
    }
    set partials(partials) {
        this._oscillator.partials = partials;
        this._setStoppedValue();
    }
    /**
     * The phase of the LFO.
     */
    get phase() {
        return this._oscillator.phase;
    }
    set phase(phase) {
        this._oscillator.phase = phase;
        this._setStoppedValue();
    }
    /**
     * The output units of the LFO.
     */
    get units() {
        return this._units;
    }
    set units(val) {
        const currentMin = this.min;
        const currentMax = this.max;
        // convert the min and the max
        this._units = val;
        this.min = currentMin;
        this.max = currentMax;
    }
    /**
     * Returns the playback state of the source, either "started" or "stopped".
     */
    get state() {
        return this._oscillator.state;
    }
    /**
     * @param node the destination to connect to
     * @param outputNum the optional output number
     * @param inputNum the input number
     */
    connect(node, outputNum, inputNum) {
        if (node instanceof Param || node instanceof Signal) {
            this.convert = node.convert;
            this.units = node.units;
        }
        connectSignal(this, node, outputNum, inputNum);
        return this;
    }
    dispose() {
        super.dispose();
        this._oscillator.dispose();
        this._stoppedSignal.dispose();
        this._zeros.dispose();
        this._scaler.dispose();
        this._a2g.dispose();
        this._amplitudeGain.dispose();
        this.amplitude.dispose();
        return this;
    }
}

/**
 * Assert that the number is in the given range.
 */
function range(min, max = Infinity) {
    const valueMap = new WeakMap();
    return function (target, propertyKey) {
        Reflect.defineProperty(target, propertyKey, {
            configurable: true,
            enumerable: true,
            get: function () {
                return valueMap.get(this);
            },
            set: function (newValue) {
                assertRange(newValue, min, max);
                valueMap.set(this, newValue);
            }
        });
    };
}
/**
 * Convert the time to seconds and assert that the time is in between the two
 * values when being set.
 */
function timeRange(min, max = Infinity) {
    const valueMap = new WeakMap();
    return function (target, propertyKey) {
        Reflect.defineProperty(target, propertyKey, {
            configurable: true,
            enumerable: true,
            get: function () {
                return valueMap.get(this);
            },
            set: function (newValue) {
                assertRange(this.toSeconds(newValue), min, max);
                valueMap.set(this, newValue);
            }
        });
    };
}

/**
 * Player is an audio file player with start, loop, and stop functions.
 * @example
 * const player = new Tone.Player("https://tonejs.github.io/audio/berklee/gong_1.mp3").toDestination();
 * // play as soon as the buffer is loaded
 * player.autostart = true;
 * @category Source
 */
class Player extends Source {
    constructor() {
        super(optionsFromArguments(Player.getDefaults(), arguments, ["url", "onload"]));
        this.name = "Player";
        /**
         * All of the active buffer source nodes
         */
        this._activeSources = new Set();
        const options = optionsFromArguments(Player.getDefaults(), arguments, ["url", "onload"]);
        this._buffer = new ToneAudioBuffer({
            onload: this._onload.bind(this, options.onload),
            onerror: options.onerror,
            reverse: options.reverse,
            url: options.url,
        });
        this.autostart = options.autostart;
        this._loop = options.loop;
        this._loopStart = options.loopStart;
        this._loopEnd = options.loopEnd;
        this._playbackRate = options.playbackRate;
        this.fadeIn = options.fadeIn;
        this.fadeOut = options.fadeOut;
    }
    static getDefaults() {
        return Object.assign(Source.getDefaults(), {
            autostart: false,
            fadeIn: 0,
            fadeOut: 0,
            loop: false,
            loopEnd: 0,
            loopStart: 0,
            onload: noOp,
            onerror: noOp,
            playbackRate: 1,
            reverse: false,
        });
    }
    /**
     * Load the audio file as an audio buffer.
     * Decodes the audio asynchronously and invokes
     * the callback once the audio buffer loads.
     * Note: this does not need to be called if a url
     * was passed in to the constructor. Only use this
     * if you want to manually load a new url.
     * @param url The url of the buffer to load. Filetype support depends on the browser.
     */
    load(url) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._buffer.load(url);
            this._onload();
            return this;
        });
    }
    /**
     * Internal callback when the buffer is loaded.
     */
    _onload(callback = noOp) {
        callback();
        if (this.autostart) {
            this.start();
        }
    }
    /**
     * Internal callback when the buffer is done playing.
     */
    _onSourceEnd(source) {
        // invoke the onstop function
        this.onstop(this);
        // delete the source from the active sources
        this._activeSources.delete(source);
        if (this._activeSources.size === 0 && !this._synced &&
            this._state.getValueAtTime(this.now()) === "started") {
            // remove the 'implicitEnd' event and replace with an explicit end
            this._state.cancel(this.now());
            this._state.setStateAtTime("stopped", this.now());
        }
    }
    /**
     * Play the buffer at the given startTime. Optionally add an offset
     * and/or duration which will play the buffer from a position
     * within the buffer for the given duration.
     *
     * @param  time When the player should start.
     * @param  offset The offset from the beginning of the sample to start at.
     * @param  duration How long the sample should play. If no duration is given, it will default to the full length of the sample (minus any offset)
     */
    start(time, offset, duration) {
        super.start(time, offset, duration);
        return this;
    }
    /**
     * Internal start method
     */
    _start(startTime, offset, duration) {
        // if it's a loop the default offset is the loopStart point
        if (this._loop) {
            offset = defaultArg(offset, this._loopStart);
        }
        else {
            // otherwise the default offset is 0
            offset = defaultArg(offset, 0);
        }
        // compute the values in seconds
        const computedOffset = this.toSeconds(offset);
        // compute the duration which is either the passed in duration of the buffer.duration - offset
        const origDuration = duration;
        duration = defaultArg(duration, Math.max(this._buffer.duration - computedOffset, 0));
        let computedDuration = this.toSeconds(duration);
        // scale it by the playback rate
        computedDuration = computedDuration / this._playbackRate;
        // get the start time
        startTime = this.toSeconds(startTime);
        // make the source
        const source = new ToneBufferSource({
            url: this._buffer,
            context: this.context,
            fadeIn: this.fadeIn,
            fadeOut: this.fadeOut,
            loop: this._loop,
            loopEnd: this._loopEnd,
            loopStart: this._loopStart,
            onended: this._onSourceEnd.bind(this),
            playbackRate: this._playbackRate,
        }).connect(this.output);
        // set the looping properties
        if (!this._loop && !this._synced) {
            // cancel the previous stop
            this._state.cancel(startTime + computedDuration);
            // if it's not looping, set the state change at the end of the sample
            this._state.setStateAtTime("stopped", startTime + computedDuration, {
                implicitEnd: true,
            });
        }
        // add it to the array of active sources
        this._activeSources.add(source);
        // start it
        if (this._loop && isUndef(origDuration)) {
            source.start(startTime, computedOffset);
        }
        else {
            // subtract the fade out time
            source.start(startTime, computedOffset, computedDuration - this.toSeconds(this.fadeOut));
        }
    }
    /**
     * Stop playback.
     */
    _stop(time) {
        const computedTime = this.toSeconds(time);
        this._activeSources.forEach(source => source.stop(computedTime));
    }
    /**
     * Stop and then restart the player from the beginning (or offset)
     * @param  time When the player should start.
     * @param  offset The offset from the beginning of the sample to start at.
     * @param  duration How long the sample should play. If no duration is given,
     * 					it will default to the full length of the sample (minus any offset)
     */
    restart(time, offset, duration) {
        super.restart(time, offset, duration);
        return this;
    }
    _restart(time, offset, duration) {
        this._stop(time);
        this._start(time, offset, duration);
    }
    /**
     * Seek to a specific time in the player's buffer. If the
     * source is no longer playing at that time, it will stop.
     * @param offset The time to seek to.
     * @param when The time for the seek event to occur.
     * @example
     * const player = new Tone.Player("https://tonejs.github.io/audio/berklee/gurgling_theremin_1.mp3", () => {
     * 	player.start();
     * 	// seek to the offset in 1 second from now
     * 	player.seek(0.4, "+1");
     * }).toDestination();
     */
    seek(offset, when) {
        const computedTime = this.toSeconds(when);
        if (this._state.getValueAtTime(computedTime) === "started") {
            const computedOffset = this.toSeconds(offset);
            // if it's currently playing, stop it
            this._stop(computedTime);
            // restart it at the given time
            this._start(computedTime, computedOffset);
        }
        return this;
    }
    /**
     * Set the loop start and end. Will only loop if loop is set to true.
     * @param loopStart The loop start time
     * @param loopEnd The loop end time
     * @example
     * const player = new Tone.Player("https://tonejs.github.io/audio/berklee/malevoices_aa2_F3.mp3").toDestination();
     * // loop between the given points
     * player.setLoopPoints(0.2, 0.3);
     * player.loop = true;
     * player.autostart = true;
     */
    setLoopPoints(loopStart, loopEnd) {
        this.loopStart = loopStart;
        this.loopEnd = loopEnd;
        return this;
    }
    /**
     * If loop is true, the loop will start at this position.
     */
    get loopStart() {
        return this._loopStart;
    }
    set loopStart(loopStart) {
        this._loopStart = loopStart;
        if (this.buffer.loaded) {
            assertRange(this.toSeconds(loopStart), 0, this.buffer.duration);
        }
        // get the current source
        this._activeSources.forEach(source => {
            source.loopStart = loopStart;
        });
    }
    /**
     * If loop is true, the loop will end at this position.
     */
    get loopEnd() {
        return this._loopEnd;
    }
    set loopEnd(loopEnd) {
        this._loopEnd = loopEnd;
        if (this.buffer.loaded) {
            assertRange(this.toSeconds(loopEnd), 0, this.buffer.duration);
        }
        // get the current source
        this._activeSources.forEach(source => {
            source.loopEnd = loopEnd;
        });
    }
    /**
     * The audio buffer belonging to the player.
     */
    get buffer() {
        return this._buffer;
    }
    set buffer(buffer) {
        this._buffer.set(buffer);
    }
    /**
     * If the buffer should loop once it's over.
     * @example
     * const player = new Tone.Player("https://tonejs.github.io/audio/drum-samples/breakbeat.mp3").toDestination();
     * player.loop = true;
     * player.autostart = true;
     */
    get loop() {
        return this._loop;
    }
    set loop(loop) {
        // if no change, do nothing
        if (this._loop === loop) {
            return;
        }
        this._loop = loop;
        // set the loop of all of the sources
        this._activeSources.forEach(source => {
            source.loop = loop;
        });
        if (loop) {
            // remove the next stopEvent
            const stopEvent = this._state.getNextState("stopped", this.now());
            if (stopEvent) {
                this._state.cancel(stopEvent.time);
            }
        }
    }
    /**
     * Normal speed is 1. The pitch will change with the playback rate.
     * @example
     * const player = new Tone.Player("https://tonejs.github.io/audio/berklee/femalevoices_aa2_A5.mp3").toDestination();
     * // play at 1/4 speed
     * player.playbackRate = 0.25;
     * // play as soon as the buffer is loaded
     * player.autostart = true;
     */
    get playbackRate() {
        return this._playbackRate;
    }
    set playbackRate(rate) {
        this._playbackRate = rate;
        const now = this.now();
        // cancel the stop event since it's at a different time now
        const stopEvent = this._state.getNextState("stopped", now);
        if (stopEvent && stopEvent.implicitEnd) {
            this._state.cancel(stopEvent.time);
            this._activeSources.forEach(source => source.cancelStop());
        }
        // set all the sources
        this._activeSources.forEach(source => {
            source.playbackRate.setValueAtTime(rate, now);
        });
    }
    /**
     * If the buffer should be reversed
     * @example
     * const player = new Tone.Player("https://tonejs.github.io/audio/berklee/chime_1.mp3").toDestination();
     * player.autostart = true;
     * player.reverse = true;
     */
    get reverse() {
        return this._buffer.reverse;
    }
    set reverse(rev) {
        this._buffer.reverse = rev;
    }
    /**
     * If the buffer is loaded
     */
    get loaded() {
        return this._buffer.loaded;
    }
    dispose() {
        super.dispose();
        // disconnect all of the players
        this._activeSources.forEach(source => source.dispose());
        this._activeSources.clear();
        this._buffer.dispose();
        return this;
    }
}
__decorate([
    timeRange(0)
], Player.prototype, "fadeIn", void 0);
__decorate([
    timeRange(0)
], Player.prototype, "fadeOut", void 0);

/**
 * Players combines multiple [[Player]] objects.
 * @category Source
 */
class Players extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(Players.getDefaults(), arguments, ["urls", "onload"], "urls"));
        this.name = "Players";
        /**
         * Players has no input.
         */
        this.input = undefined;
        /**
         * The container of all of the players
         */
        this._players = new Map();
        const options = optionsFromArguments(Players.getDefaults(), arguments, ["urls", "onload"], "urls");
        /**
         * The output volume node
         */
        this._volume = this.output = new Volume({
            context: this.context,
            volume: options.volume,
        });
        this.volume = this._volume.volume;
        readOnly(this, "volume");
        this._buffers = new ToneAudioBuffers({
            urls: options.urls,
            onload: options.onload,
            baseUrl: options.baseUrl,
            onerror: options.onerror
        });
        // mute initially
        this.mute = options.mute;
        this._fadeIn = options.fadeIn;
        this._fadeOut = options.fadeOut;
    }
    static getDefaults() {
        return Object.assign(Source.getDefaults(), {
            baseUrl: "",
            fadeIn: 0,
            fadeOut: 0,
            mute: false,
            onload: noOp,
            onerror: noOp,
            urls: {},
            volume: 0,
        });
    }
    /**
     * Mute the output.
     */
    get mute() {
        return this._volume.mute;
    }
    set mute(mute) {
        this._volume.mute = mute;
    }
    /**
     * The fadeIn time of the envelope applied to the source.
     */
    get fadeIn() {
        return this._fadeIn;
    }
    set fadeIn(fadeIn) {
        this._fadeIn = fadeIn;
        this._players.forEach(player => {
            player.fadeIn = fadeIn;
        });
    }
    /**
     * The fadeOut time of the each of the sources.
     */
    get fadeOut() {
        return this._fadeOut;
    }
    set fadeOut(fadeOut) {
        this._fadeOut = fadeOut;
        this._players.forEach(player => {
            player.fadeOut = fadeOut;
        });
    }
    /**
     * The state of the players object. Returns "started" if any of the players are playing.
     */
    get state() {
        const playing = Array.from(this._players).some(([_, player]) => player.state === "started");
        return playing ? "started" : "stopped";
    }
    /**
     * True if the buffers object has a buffer by that name.
     * @param name  The key or index of the buffer.
     */
    has(name) {
        return this._buffers.has(name);
    }
    /**
     * Get a player by name.
     * @param  name  The players name as defined in the constructor object or `add` method.
     */
    player(name) {
        assert(this.has(name), `No Player with the name ${name} exists on this object`);
        if (!this._players.has(name)) {
            const player = new Player({
                context: this.context,
                fadeIn: this._fadeIn,
                fadeOut: this._fadeOut,
                url: this._buffers.get(name),
            }).connect(this.output);
            this._players.set(name, player);
        }
        return this._players.get(name);
    }
    /**
     * If all the buffers are loaded or not
     */
    get loaded() {
        return this._buffers.loaded;
    }
    /**
     * Add a player by name and url to the Players
     * @param  name A unique name to give the player
     * @param  url  Either the url of the bufer or a buffer which will be added with the given name.
     * @param callback  The callback to invoke when the url is loaded.
     */
    add(name, url, callback) {
        assert(!this._buffers.has(name), "A buffer with that name already exists on this object");
        this._buffers.add(name, url, callback);
        return this;
    }
    /**
     * Stop all of the players at the given time
     * @param time The time to stop all of the players.
     */
    stopAll(time) {
        this._players.forEach(player => player.stop(time));
        return this;
    }
    dispose() {
        super.dispose();
        this._volume.dispose();
        this.volume.dispose();
        this._players.forEach(player => player.dispose());
        this._buffers.dispose();
        return this;
    }
}

/**
 * GrainPlayer implements [granular synthesis](https://en.wikipedia.org/wiki/Granular_synthesis).
 * Granular Synthesis enables you to adjust pitch and playback rate independently. The grainSize is the
 * amount of time each small chunk of audio is played for and the overlap is the
 * amount of crossfading transition time between successive grains.
 * @category Source
 */
class GrainPlayer extends Source {
    constructor() {
        super(optionsFromArguments(GrainPlayer.getDefaults(), arguments, ["url", "onload"]));
        this.name = "GrainPlayer";
        /**
         * Internal loopStart value
         */
        this._loopStart = 0;
        /**
         * Internal loopStart value
         */
        this._loopEnd = 0;
        /**
         * All of the currently playing BufferSources
         */
        this._activeSources = [];
        const options = optionsFromArguments(GrainPlayer.getDefaults(), arguments, ["url", "onload"]);
        this.buffer = new ToneAudioBuffer({
            onload: options.onload,
            onerror: options.onerror,
            reverse: options.reverse,
            url: options.url,
        });
        this._clock = new Clock({
            context: this.context,
            callback: this._tick.bind(this),
            frequency: 1 / options.grainSize
        });
        this._playbackRate = options.playbackRate;
        this._grainSize = options.grainSize;
        this._overlap = options.overlap;
        this.detune = options.detune;
        // setup
        this.overlap = options.overlap;
        this.loop = options.loop;
        this.playbackRate = options.playbackRate;
        this.grainSize = options.grainSize;
        this.loopStart = options.loopStart;
        this.loopEnd = options.loopEnd;
        this.reverse = options.reverse;
        this._clock.on("stop", this._onstop.bind(this));
    }
    static getDefaults() {
        return Object.assign(Source.getDefaults(), {
            onload: noOp,
            onerror: noOp,
            overlap: 0.1,
            grainSize: 0.2,
            playbackRate: 1,
            detune: 0,
            loop: false,
            loopStart: 0,
            loopEnd: 0,
            reverse: false
        });
    }
    /**
     * Internal start method
     */
    _start(time, offset, duration) {
        offset = defaultArg(offset, 0);
        offset = this.toSeconds(offset);
        time = this.toSeconds(time);
        const grainSize = 1 / this._clock.frequency.getValueAtTime(time);
        this._clock.start(time, offset / grainSize);
        if (duration) {
            this.stop(time + this.toSeconds(duration));
        }
    }
    /**
     * Stop and then restart the player from the beginning (or offset)
     * @param  time When the player should start.
     * @param  offset The offset from the beginning of the sample to start at.
     * @param  duration How long the sample should play. If no duration is given,
     * 					it will default to the full length of the sample (minus any offset)
     */
    restart(time, offset, duration) {
        super.restart(time, offset, duration);
        return this;
    }
    _restart(time, offset, duration) {
        this._stop(time);
        this._start(time, offset, duration);
    }
    /**
     * Internal stop method
     */
    _stop(time) {
        this._clock.stop(time);
    }
    /**
     * Invoked when the clock is stopped
     */
    _onstop(time) {
        // stop the players
        this._activeSources.forEach((source) => {
            source.fadeOut = 0;
            source.stop(time);
        });
        this.onstop(this);
    }
    /**
     * Invoked on each clock tick. scheduled a new grain at this time.
     */
    _tick(time) {
        // check if it should stop looping
        const ticks = this._clock.getTicksAtTime(time);
        const offset = ticks * this._grainSize;
        this.log("offset", offset);
        if (!this.loop && offset > this.buffer.duration) {
            this.stop(time);
            return;
        }
        // at the beginning of the file, the fade in should be 0
        const fadeIn = offset < this._overlap ? 0 : this._overlap;
        // create a buffer source
        const source = new ToneBufferSource({
            context: this.context,
            url: this.buffer,
            fadeIn: fadeIn,
            fadeOut: this._overlap,
            loop: this.loop,
            loopStart: this._loopStart,
            loopEnd: this._loopEnd,
            // compute the playbackRate based on the detune
            playbackRate: intervalToFrequencyRatio(this.detune / 100)
        }).connect(this.output);
        source.start(time, this._grainSize * ticks);
        source.stop(time + this._grainSize / this.playbackRate);
        // add it to the active sources
        this._activeSources.push(source);
        // remove it when it's done
        source.onended = () => {
            const index = this._activeSources.indexOf(source);
            if (index !== -1) {
                this._activeSources.splice(index, 1);
            }
        };
    }
    /**
     * The playback rate of the sample
     */
    get playbackRate() {
        return this._playbackRate;
    }
    set playbackRate(rate) {
        assertRange(rate, 0.001);
        this._playbackRate = rate;
        this.grainSize = this._grainSize;
    }
    /**
     * The loop start time.
     */
    get loopStart() {
        return this._loopStart;
    }
    set loopStart(time) {
        if (this.buffer.loaded) {
            assertRange(this.toSeconds(time), 0, this.buffer.duration);
        }
        this._loopStart = this.toSeconds(time);
    }
    /**
     * The loop end time.
     */
    get loopEnd() {
        return this._loopEnd;
    }
    set loopEnd(time) {
        if (this.buffer.loaded) {
            assertRange(this.toSeconds(time), 0, this.buffer.duration);
        }
        this._loopEnd = this.toSeconds(time);
    }
    /**
     * The direction the buffer should play in
     */
    get reverse() {
        return this.buffer.reverse;
    }
    set reverse(rev) {
        this.buffer.reverse = rev;
    }
    /**
     * The size of each chunk of audio that the
     * buffer is chopped into and played back at.
     */
    get grainSize() {
        return this._grainSize;
    }
    set grainSize(size) {
        this._grainSize = this.toSeconds(size);
        this._clock.frequency.setValueAtTime(this._playbackRate / this._grainSize, this.now());
    }
    /**
     * The duration of the cross-fade between successive grains.
     */
    get overlap() {
        return this._overlap;
    }
    set overlap(time) {
        const computedTime = this.toSeconds(time);
        assertRange(computedTime, 0);
        this._overlap = computedTime;
    }
    /**
     * If all the buffer is loaded
     */
    get loaded() {
        return this.buffer.loaded;
    }
    dispose() {
        super.dispose();
        this.buffer.dispose();
        this._clock.dispose();
        this._activeSources.forEach((source) => source.dispose());
        return this;
    }
}

/**
 * Return the absolute value of an incoming signal.
 *
 * @example
 * return Tone.Offline(() => {
 * 	const abs = new Tone.Abs().toDestination();
 * 	const signal = new Tone.Signal(1);
 * 	signal.rampTo(-1, 0.5);
 * 	signal.connect(abs);
 * }, 0.5, 1);
 * @category Signal
 */
class Abs extends SignalOperator {
    constructor() {
        super(...arguments);
        this.name = "Abs";
        /**
         * The node which converts the audio ranges
         */
        this._abs = new WaveShaper({
            context: this.context,
            mapping: val => {
                if (Math.abs(val) < 0.001) {
                    return 0;
                }
                else {
                    return Math.abs(val);
                }
            },
        });
        /**
         * The AudioRange input [-1, 1]
         */
        this.input = this._abs;
        /**
         * The output range [0, 1]
         */
        this.output = this._abs;
    }
    /**
     * clean up
     */
    dispose() {
        super.dispose();
        this._abs.dispose();
        return this;
    }
}

/**
 * GainToAudio converts an input in NormalRange [0,1] to AudioRange [-1,1].
 * See [[AudioToGain]].
 * @category Signal
 */
class GainToAudio extends SignalOperator {
    constructor() {
        super(...arguments);
        this.name = "GainToAudio";
        /**
         * The node which converts the audio ranges
         */
        this._norm = new WaveShaper({
            context: this.context,
            mapping: x => Math.abs(x) * 2 - 1,
        });
        /**
         * The NormalRange input [0, 1]
         */
        this.input = this._norm;
        /**
         * The AudioRange output [-1, 1]
         */
        this.output = this._norm;
    }
    /**
     * clean up
     */
    dispose() {
        super.dispose();
        this._norm.dispose();
        return this;
    }
}

/**
 * Negate the incoming signal. i.e. an input signal of 10 will output -10
 *
 * @example
 * const neg = new Tone.Negate();
 * const sig = new Tone.Signal(-2).connect(neg);
 * // output of neg is positive 2.
 * @category Signal
 */
class Negate extends SignalOperator {
    constructor() {
        super(...arguments);
        this.name = "Negate";
        /**
         * negation is done by multiplying by -1
         */
        this._multiply = new Multiply({
            context: this.context,
            value: -1,
        });
        /**
         * The input and output are equal to the multiply node
         */
        this.input = this._multiply;
        this.output = this._multiply;
    }
    /**
     * clean up
     * @returns {Negate} this
     */
    dispose() {
        super.dispose();
        this._multiply.dispose();
        return this;
    }
}

/**
 * Subtract the signal connected to the input is subtracted from the signal connected
 * The subtrahend.
 *
 * @example
 * // subtract a scalar from a signal
 * const sub = new Tone.Subtract(1);
 * const sig = new Tone.Signal(4).connect(sub);
 * // the output of sub is 3.
 * @example
 * // subtract two signals
 * const sub = new Tone.Subtract();
 * const sigA = new Tone.Signal(10);
 * const sigB = new Tone.Signal(2.5);
 * sigA.connect(sub);
 * sigB.connect(sub.subtrahend);
 * // output of sub is 7.5
 * @category Signal
 */
class Subtract extends Signal {
    constructor() {
        super(Object.assign(optionsFromArguments(Subtract.getDefaults(), arguments, ["value"])));
        this.override = false;
        this.name = "Subtract";
        /**
         * the summing node
         */
        this._sum = new Gain({ context: this.context });
        this.input = this._sum;
        this.output = this._sum;
        /**
         * Negate the input of the second input before connecting it to the summing node.
         */
        this._neg = new Negate({ context: this.context });
        /**
         * The value which is subtracted from the main signal
         */
        this.subtrahend = this._param;
        connectSeries(this._constantSource, this._neg, this._sum);
    }
    static getDefaults() {
        return Object.assign(Signal.getDefaults(), {
            value: 0,
        });
    }
    dispose() {
        super.dispose();
        this._neg.dispose();
        this._sum.dispose();
        return this;
    }
}

/**
 * GreaterThanZero outputs 1 when the input is strictly greater than zero
 * @example
 * return Tone.Offline(() => {
 * 	const gt0 = new Tone.GreaterThanZero().toDestination();
 * 	const sig = new Tone.Signal(0.5).connect(gt0);
 * 	sig.setValueAtTime(-1, 0.05);
 * }, 0.1, 1);
 * @category Signal
 */
class GreaterThanZero extends SignalOperator {
    constructor() {
        super(Object.assign(optionsFromArguments(GreaterThanZero.getDefaults(), arguments)));
        this.name = "GreaterThanZero";
        this._thresh = this.output = new WaveShaper({
            context: this.context,
            length: 127,
            mapping: (val) => {
                if (val <= 0) {
                    return 0;
                }
                else {
                    return 1;
                }
            },
        });
        this._scale = this.input = new Multiply({
            context: this.context,
            value: 10000
        });
        // connections
        this._scale.connect(this._thresh);
    }
    dispose() {
        super.dispose();
        this._scale.dispose();
        this._thresh.dispose();
        return this;
    }
}

/**
 * Output 1 if the signal is greater than the value, otherwise outputs 0.
 * can compare two signals or a signal and a number.
 *
 * @example
 * return Tone.Offline(() => {
 * 	const gt = new Tone.GreaterThan(2).toDestination();
 * 	const sig = new Tone.Signal(4).connect(gt);
 * }, 0.1, 1);
 * @category Signal
 */
class GreaterThan extends Signal {
    constructor() {
        super(Object.assign(optionsFromArguments(GreaterThan.getDefaults(), arguments, ["value"])));
        this.name = "GreaterThan";
        this.override = false;
        const options = optionsFromArguments(GreaterThan.getDefaults(), arguments, ["value"]);
        this._subtract = this.input = new Subtract({
            context: this.context,
            value: options.value
        });
        this._gtz = this.output = new GreaterThanZero({ context: this.context });
        this.comparator = this._param = this._subtract.subtrahend;
        readOnly(this, "comparator");
        // connect
        this._subtract.connect(this._gtz);
    }
    static getDefaults() {
        return Object.assign(Signal.getDefaults(), {
            value: 0,
        });
    }
    dispose() {
        super.dispose();
        this._gtz.dispose();
        this._subtract.dispose();
        this.comparator.dispose();
        return this;
    }
}

/**
 * Pow applies an exponent to the incoming signal. The incoming signal must be AudioRange [-1, 1]
 *
 * @example
 * const pow = new Tone.Pow(2);
 * const sig = new Tone.Signal(0.5).connect(pow);
 * // output of pow is 0.25.
 * @category Signal
 */
class Pow extends SignalOperator {
    constructor() {
        super(Object.assign(optionsFromArguments(Pow.getDefaults(), arguments, ["value"])));
        this.name = "Pow";
        const options = optionsFromArguments(Pow.getDefaults(), arguments, ["value"]);
        this._exponentScaler = this.input = this.output = new WaveShaper({
            context: this.context,
            mapping: this._expFunc(options.value),
            length: 8192,
        });
        this._exponent = options.value;
    }
    static getDefaults() {
        return Object.assign(SignalOperator.getDefaults(), {
            value: 1,
        });
    }
    /**
     * the function which maps the waveshaper
     * @param exponent exponent value
     */
    _expFunc(exponent) {
        return (val) => {
            return Math.pow(Math.abs(val), exponent);
        };
    }
    /**
     * The value of the exponent.
     */
    get value() {
        return this._exponent;
    }
    set value(exponent) {
        this._exponent = exponent;
        this._exponentScaler.setMap(this._expFunc(this._exponent));
    }
    /**
     * Clean up.
     */
    dispose() {
        super.dispose();
        this._exponentScaler.dispose();
        return this;
    }
}

/**
 * Performs an exponential scaling on an input signal.
 * Scales a NormalRange value [0,1] exponentially
 * to the output range of outputMin to outputMax.
 * @example
 * const scaleExp = new Tone.ScaleExp(0, 100, 2);
 * const signal = new Tone.Signal(0.5).connect(scaleExp);
 * @category Signal
 */
class ScaleExp extends Scale {
    constructor() {
        super(Object.assign(optionsFromArguments(ScaleExp.getDefaults(), arguments, ["min", "max", "exponent"])));
        this.name = "ScaleExp";
        const options = optionsFromArguments(ScaleExp.getDefaults(), arguments, ["min", "max", "exponent"]);
        this.input = this._exp = new Pow({
            context: this.context,
            value: options.exponent,
        });
        this._exp.connect(this._mult);
    }
    static getDefaults() {
        return Object.assign(Scale.getDefaults(), {
            exponent: 1,
        });
    }
    /**
     * Instead of interpolating linearly between the [[min]] and
     * [[max]] values, setting the exponent will interpolate between
     * the two values with an exponential curve.
     */
    get exponent() {
        return this._exp.value;
    }
    set exponent(exp) {
        this._exp.value = exp;
    }
    dispose() {
        super.dispose();
        this._exp.dispose();
        return this;
    }
}

/**
 * Adds the ability to synchronize the signal to the [[Transport]]
 */
class SyncedSignal extends Signal {
    constructor() {
        super(optionsFromArguments(Signal.getDefaults(), arguments, ["value", "units"]));
        this.name = "SyncedSignal";
        /**
         * Don't override when something is connected to the input
         */
        this.override = false;
        const options = optionsFromArguments(Signal.getDefaults(), arguments, ["value", "units"]);
        this._lastVal = options.value;
        this._synced = this.context.transport.scheduleRepeat(this._onTick.bind(this), "1i");
        this._syncedCallback = this._anchorValue.bind(this);
        this.context.transport.on("start", this._syncedCallback);
        this.context.transport.on("pause", this._syncedCallback);
        this.context.transport.on("stop", this._syncedCallback);
        // disconnect the constant source from the output and replace it with another one
        this._constantSource.disconnect();
        this._constantSource.stop(0);
        // create a new one
        this._constantSource = this.output = new ToneConstantSource({
            context: this.context,
            offset: options.value,
            units: options.units,
        }).start(0);
        this.setValueAtTime(options.value, 0);
    }
    /**
     * Callback which is invoked every tick.
     */
    _onTick(time) {
        const val = super.getValueAtTime(this.context.transport.seconds);
        // approximate ramp curves with linear ramps
        if (this._lastVal !== val) {
            this._lastVal = val;
            this._constantSource.offset.setValueAtTime(val, time);
        }
    }
    /**
     * Anchor the value at the start and stop of the Transport
     */
    _anchorValue(time) {
        const val = super.getValueAtTime(this.context.transport.seconds);
        this._lastVal = val;
        this._constantSource.offset.cancelAndHoldAtTime(time);
        this._constantSource.offset.setValueAtTime(val, time);
    }
    getValueAtTime(time) {
        const computedTime = new TransportTimeClass(this.context, time).toSeconds();
        return super.getValueAtTime(computedTime);
    }
    setValueAtTime(value, time) {
        const computedTime = new TransportTimeClass(this.context, time).toSeconds();
        super.setValueAtTime(value, computedTime);
        return this;
    }
    linearRampToValueAtTime(value, time) {
        const computedTime = new TransportTimeClass(this.context, time).toSeconds();
        super.linearRampToValueAtTime(value, computedTime);
        return this;
    }
    exponentialRampToValueAtTime(value, time) {
        const computedTime = new TransportTimeClass(this.context, time).toSeconds();
        super.exponentialRampToValueAtTime(value, computedTime);
        return this;
    }
    setTargetAtTime(value, startTime, timeConstant) {
        const computedTime = new TransportTimeClass(this.context, startTime).toSeconds();
        super.setTargetAtTime(value, computedTime, timeConstant);
        return this;
    }
    cancelScheduledValues(startTime) {
        const computedTime = new TransportTimeClass(this.context, startTime).toSeconds();
        super.cancelScheduledValues(computedTime);
        return this;
    }
    setValueCurveAtTime(values, startTime, duration, scaling) {
        const computedTime = new TransportTimeClass(this.context, startTime).toSeconds();
        duration = this.toSeconds(duration);
        super.setValueCurveAtTime(values, computedTime, duration, scaling);
        return this;
    }
    cancelAndHoldAtTime(time) {
        const computedTime = new TransportTimeClass(this.context, time).toSeconds();
        super.cancelAndHoldAtTime(computedTime);
        return this;
    }
    setRampPoint(time) {
        const computedTime = new TransportTimeClass(this.context, time).toSeconds();
        super.setRampPoint(computedTime);
        return this;
    }
    exponentialRampTo(value, rampTime, startTime) {
        const computedTime = new TransportTimeClass(this.context, startTime).toSeconds();
        super.exponentialRampTo(value, rampTime, computedTime);
        return this;
    }
    linearRampTo(value, rampTime, startTime) {
        const computedTime = new TransportTimeClass(this.context, startTime).toSeconds();
        super.linearRampTo(value, rampTime, computedTime);
        return this;
    }
    targetRampTo(value, rampTime, startTime) {
        const computedTime = new TransportTimeClass(this.context, startTime).toSeconds();
        super.targetRampTo(value, rampTime, computedTime);
        return this;
    }
    dispose() {
        super.dispose();
        this.context.transport.clear(this._synced);
        this.context.transport.off("start", this._syncedCallback);
        this.context.transport.off("pause", this._syncedCallback);
        this.context.transport.off("stop", this._syncedCallback);
        this._constantSource.dispose();
        return this;
    }
}

/**
 * Envelope is an [ADSR](https://en.wikipedia.org/wiki/Synthesizer#ADSR_envelope)
 * envelope generator. Envelope outputs a signal which
 * can be connected to an AudioParam or Tone.Signal.
 * ```
 *           /\
 *          /  \
 *         /    \
 *        /      \
 *       /        \___________
 *      /                     \
 *     /                       \
 *    /                         \
 *   /                           \
 * ```
 * @example
 * return Tone.Offline(() => {
 * 	const env = new Tone.Envelope({
 * 		attack: 0.1,
 * 		decay: 0.2,
 * 		sustain: 0.5,
 * 		release: 0.8,
 * 	}).toDestination();
 * 	env.triggerAttackRelease(0.5);
 * }, 1.5, 1);
 * @category Component
 */
class Envelope extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(Envelope.getDefaults(), arguments, ["attack", "decay", "sustain", "release"]));
        this.name = "Envelope";
        /**
         * the signal which is output.
         */
        this._sig = new Signal({
            context: this.context,
            value: 0,
        });
        /**
         * The output signal of the envelope
         */
        this.output = this._sig;
        /**
         * Envelope has no input
         */
        this.input = undefined;
        const options = optionsFromArguments(Envelope.getDefaults(), arguments, ["attack", "decay", "sustain", "release"]);
        this.attack = options.attack;
        this.decay = options.decay;
        this.sustain = options.sustain;
        this.release = options.release;
        this.attackCurve = options.attackCurve;
        this.releaseCurve = options.releaseCurve;
        this.decayCurve = options.decayCurve;
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            attack: 0.01,
            attackCurve: "linear",
            decay: 0.1,
            decayCurve: "exponential",
            release: 1,
            releaseCurve: "exponential",
            sustain: 0.5,
        });
    }
    /**
     * Read the current value of the envelope. Useful for
     * synchronizing visual output to the envelope.
     */
    get value() {
        return this.getValueAtTime(this.now());
    }
    /**
     * Get the curve
     * @param  curve
     * @param  direction  In/Out
     * @return The curve name
     */
    _getCurve(curve, direction) {
        if (isString(curve)) {
            return curve;
        }
        else {
            // look up the name in the curves array
            let curveName;
            for (curveName in EnvelopeCurves) {
                if (EnvelopeCurves[curveName][direction] === curve) {
                    return curveName;
                }
            }
            // return the custom curve
            return curve;
        }
    }
    /**
     * Assign a the curve to the given name using the direction
     * @param  name
     * @param  direction In/Out
     * @param  curve
     */
    _setCurve(name, direction, curve) {
        // check if it's a valid type
        if (isString(curve) && Reflect.has(EnvelopeCurves, curve)) {
            const curveDef = EnvelopeCurves[curve];
            if (isObject(curveDef)) {
                if (name !== "_decayCurve") {
                    this[name] = curveDef[direction];
                }
            }
            else {
                this[name] = curveDef;
            }
        }
        else if (isArray(curve) && name !== "_decayCurve") {
            this[name] = curve;
        }
        else {
            throw new Error("Envelope: invalid curve: " + curve);
        }
    }
    /**
     * The shape of the attack.
     * Can be any of these strings:
     * * "linear"
     * * "exponential"
     * * "sine"
     * * "cosine"
     * * "bounce"
     * * "ripple"
     * * "step"
     *
     * Can also be an array which describes the curve. Values
     * in the array are evenly subdivided and linearly
     * interpolated over the duration of the attack.
     * @example
     * return Tone.Offline(() => {
     * 	const env = new Tone.Envelope(0.4).toDestination();
     * 	env.attackCurve = "linear";
     * 	env.triggerAttack();
     * }, 1, 1);
     */
    get attackCurve() {
        return this._getCurve(this._attackCurve, "In");
    }
    set attackCurve(curve) {
        this._setCurve("_attackCurve", "In", curve);
    }
    /**
     * The shape of the release. See the attack curve types.
     * @example
     * return Tone.Offline(() => {
     * 	const env = new Tone.Envelope({
     * 		release: 0.8
     * 	}).toDestination();
     * 	env.triggerAttack();
     * 	// release curve could also be defined by an array
     * 	env.releaseCurve = [1, 0.3, 0.4, 0.2, 0.7, 0];
     * 	env.triggerRelease(0.2);
     * }, 1, 1);
     */
    get releaseCurve() {
        return this._getCurve(this._releaseCurve, "Out");
    }
    set releaseCurve(curve) {
        this._setCurve("_releaseCurve", "Out", curve);
    }
    /**
     * The shape of the decay either "linear" or "exponential"
     * @example
     * return Tone.Offline(() => {
     * 	const env = new Tone.Envelope({
     * 		sustain: 0.1,
     * 		decay: 0.5
     * 	}).toDestination();
     * 	env.decayCurve = "linear";
     * 	env.triggerAttack();
     * }, 1, 1);
     */
    get decayCurve() {
        return this._decayCurve;
    }
    set decayCurve(curve) {
        assert(["linear", "exponential"].some(c => c === curve), `Invalid envelope curve: ${curve}`);
        this._decayCurve = curve;
    }
    /**
     * Trigger the attack/decay portion of the ADSR envelope.
     * @param  time When the attack should start.
     * @param velocity The velocity of the envelope scales the vales.
     *                             number between 0-1
     * @example
     * const env = new Tone.AmplitudeEnvelope().toDestination();
     * const osc = new Tone.Oscillator().connect(env).start();
     * // trigger the attack 0.5 seconds from now with a velocity of 0.2
     * env.triggerAttack("+0.5", 0.2);
     */
    triggerAttack(time, velocity = 1) {
        this.log("triggerAttack", time, velocity);
        time = this.toSeconds(time);
        const originalAttack = this.toSeconds(this.attack);
        let attack = originalAttack;
        const decay = this.toSeconds(this.decay);
        // check if it's not a complete attack
        const currentValue = this.getValueAtTime(time);
        if (currentValue > 0) {
            // subtract the current value from the attack time
            const attackRate = 1 / attack;
            const remainingDistance = 1 - currentValue;
            // the attack is now the remaining time
            attack = remainingDistance / attackRate;
        }
        // attack
        if (attack < this.sampleTime) {
            this._sig.cancelScheduledValues(time);
            // case where the attack time is 0 should set instantly
            this._sig.setValueAtTime(velocity, time);
        }
        else if (this._attackCurve === "linear") {
            this._sig.linearRampTo(velocity, attack, time);
        }
        else if (this._attackCurve === "exponential") {
            this._sig.targetRampTo(velocity, attack, time);
        }
        else {
            this._sig.cancelAndHoldAtTime(time);
            let curve = this._attackCurve;
            // find the starting position in the curve
            for (let i = 1; i < curve.length; i++) {
                // the starting index is between the two values
                if (curve[i - 1] <= currentValue && currentValue <= curve[i]) {
                    curve = this._attackCurve.slice(i);
                    // the first index is the current value
                    curve[0] = currentValue;
                    break;
                }
            }
            this._sig.setValueCurveAtTime(curve, time, attack, velocity);
        }
        // decay
        if (decay && this.sustain < 1) {
            const decayValue = velocity * this.sustain;
            const decayStart = time + attack;
            this.log("decay", decayStart);
            if (this._decayCurve === "linear") {
                this._sig.linearRampToValueAtTime(decayValue, decay + decayStart);
            }
            else {
                this._sig.exponentialApproachValueAtTime(decayValue, decayStart, decay);
            }
        }
        return this;
    }
    /**
     * Triggers the release of the envelope.
     * @param  time When the release portion of the envelope should start.
     * @example
     * const env = new Tone.AmplitudeEnvelope().toDestination();
     * const osc = new Tone.Oscillator({
     * 	type: "sawtooth"
     * }).connect(env).start();
     * env.triggerAttack();
     * // trigger the release half a second after the attack
     * env.triggerRelease("+0.5");
     */
    triggerRelease(time) {
        this.log("triggerRelease", time);
        time = this.toSeconds(time);
        const currentValue = this.getValueAtTime(time);
        if (currentValue > 0) {
            const release = this.toSeconds(this.release);
            if (release < this.sampleTime) {
                this._sig.setValueAtTime(0, time);
            }
            else if (this._releaseCurve === "linear") {
                this._sig.linearRampTo(0, release, time);
            }
            else if (this._releaseCurve === "exponential") {
                this._sig.targetRampTo(0, release, time);
            }
            else {
                assert(isArray(this._releaseCurve), "releaseCurve must be either 'linear', 'exponential' or an array");
                this._sig.cancelAndHoldAtTime(time);
                this._sig.setValueCurveAtTime(this._releaseCurve, time, release, currentValue);
            }
        }
        return this;
    }
    /**
     * Get the scheduled value at the given time. This will
     * return the unconverted (raw) value.
     * @example
     * const env = new Tone.Envelope(0.5, 1, 0.4, 2);
     * env.triggerAttackRelease(2);
     * setInterval(() => console.log(env.getValueAtTime(Tone.now())), 100);
     */
    getValueAtTime(time) {
        return this._sig.getValueAtTime(time);
    }
    /**
     * triggerAttackRelease is shorthand for triggerAttack, then waiting
     * some duration, then triggerRelease.
     * @param duration The duration of the sustain.
     * @param time When the attack should be triggered.
     * @param velocity The velocity of the envelope.
     * @example
     * const env = new Tone.AmplitudeEnvelope().toDestination();
     * const osc = new Tone.Oscillator().connect(env).start();
     * // trigger the release 0.5 seconds after the attack
     * env.triggerAttackRelease(0.5);
     */
    triggerAttackRelease(duration, time, velocity = 1) {
        time = this.toSeconds(time);
        this.triggerAttack(time, velocity);
        this.triggerRelease(time + this.toSeconds(duration));
        return this;
    }
    /**
     * Cancels all scheduled envelope changes after the given time.
     */
    cancel(after) {
        this._sig.cancelScheduledValues(this.toSeconds(after));
        return this;
    }
    /**
     * Connect the envelope to a destination node.
     */
    connect(destination, outputNumber = 0, inputNumber = 0) {
        connectSignal(this, destination, outputNumber, inputNumber);
        return this;
    }
    /**
     * Render the envelope curve to an array of the given length.
     * Good for visualizing the envelope curve. Rescales the duration of the
     * envelope to fit the length.
     */
    asArray(length = 1024) {
        return __awaiter(this, void 0, void 0, function* () {
            const duration = length / this.context.sampleRate;
            const context = new OfflineContext(1, duration, this.context.sampleRate);
            // normalize the ADSR for the given duration with 20% sustain time
            const attackPortion = this.toSeconds(this.attack) + this.toSeconds(this.decay);
            const envelopeDuration = attackPortion + this.toSeconds(this.release);
            const sustainTime = envelopeDuration * 0.1;
            const totalDuration = envelopeDuration + sustainTime;
            // @ts-ignore
            const clone = new this.constructor(Object.assign(this.get(), {
                attack: duration * this.toSeconds(this.attack) / totalDuration,
                decay: duration * this.toSeconds(this.decay) / totalDuration,
                release: duration * this.toSeconds(this.release) / totalDuration,
                context
            }));
            clone._sig.toDestination();
            clone.triggerAttackRelease(duration * (attackPortion + sustainTime) / totalDuration, 0);
            const buffer = yield context.render();
            return buffer.getChannelData(0);
        });
    }
    dispose() {
        super.dispose();
        this._sig.dispose();
        return this;
    }
}
__decorate([
    timeRange(0)
], Envelope.prototype, "attack", void 0);
__decorate([
    timeRange(0)
], Envelope.prototype, "decay", void 0);
__decorate([
    range(0, 1)
], Envelope.prototype, "sustain", void 0);
__decorate([
    timeRange(0)
], Envelope.prototype, "release", void 0);
/**
 * Generate some complex envelope curves.
 */
const EnvelopeCurves = (() => {
    const curveLen = 128;
    let i;
    let k;
    // cosine curve
    const cosineCurve = [];
    for (i = 0; i < curveLen; i++) {
        cosineCurve[i] = Math.sin((i / (curveLen - 1)) * (Math.PI / 2));
    }
    // ripple curve
    const rippleCurve = [];
    const rippleCurveFreq = 6.4;
    for (i = 0; i < curveLen - 1; i++) {
        k = (i / (curveLen - 1));
        const sineWave = Math.sin(k * (Math.PI * 2) * rippleCurveFreq - Math.PI / 2) + 1;
        rippleCurve[i] = sineWave / 10 + k * 0.83;
    }
    rippleCurve[curveLen - 1] = 1;
    // stairs curve
    const stairsCurve = [];
    const steps = 5;
    for (i = 0; i < curveLen; i++) {
        stairsCurve[i] = Math.ceil((i / (curveLen - 1)) * steps) / steps;
    }
    // in-out easing curve
    const sineCurve = [];
    for (i = 0; i < curveLen; i++) {
        k = i / (curveLen - 1);
        sineCurve[i] = 0.5 * (1 - Math.cos(Math.PI * k));
    }
    // a bounce curve
    const bounceCurve = [];
    for (i = 0; i < curveLen; i++) {
        k = i / (curveLen - 1);
        const freq = Math.pow(k, 3) * 4 + 0.2;
        const val = Math.cos(freq * Math.PI * 2 * k);
        bounceCurve[i] = Math.abs(val * (1 - k));
    }
    /**
     * Invert a value curve to make it work for the release
     */
    function invertCurve(curve) {
        const out = new Array(curve.length);
        for (let j = 0; j < curve.length; j++) {
            out[j] = 1 - curve[j];
        }
        return out;
    }
    /**
     * reverse the curve
     */
    function reverseCurve(curve) {
        return curve.slice(0).reverse();
    }
    /**
     * attack and release curve arrays
     */
    return {
        bounce: {
            In: invertCurve(bounceCurve),
            Out: bounceCurve,
        },
        cosine: {
            In: cosineCurve,
            Out: reverseCurve(cosineCurve),
        },
        exponential: "exponential",
        linear: "linear",
        ripple: {
            In: rippleCurve,
            Out: invertCurve(rippleCurve),
        },
        sine: {
            In: sineCurve,
            Out: invertCurve(sineCurve),
        },
        step: {
            In: stairsCurve,
            Out: invertCurve(stairsCurve),
        },
    };
})();

/**
 * Base-class for all instruments
 */
class Instrument extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(Instrument.getDefaults(), arguments));
        /**
         * Keep track of all events scheduled to the transport
         * when the instrument is 'synced'
         */
        this._scheduledEvents = [];
        /**
         * If the instrument is currently synced
         */
        this._synced = false;
        this._original_triggerAttack = this.triggerAttack;
        this._original_triggerRelease = this.triggerRelease;
        const options = optionsFromArguments(Instrument.getDefaults(), arguments);
        this._volume = this.output = new Volume({
            context: this.context,
            volume: options.volume,
        });
        this.volume = this._volume.volume;
        readOnly(this, "volume");
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            volume: 0,
        });
    }
    /**
     * Sync the instrument to the Transport. All subsequent calls of
     * [[triggerAttack]] and [[triggerRelease]] will be scheduled along the transport.
     * @example
     * const fmSynth = new Tone.FMSynth().toDestination();
     * fmSynth.volume.value = -6;
     * fmSynth.sync();
     * // schedule 3 notes when the transport first starts
     * fmSynth.triggerAttackRelease("C4", "8n", 0);
     * fmSynth.triggerAttackRelease("E4", "8n", "8n");
     * fmSynth.triggerAttackRelease("G4", "8n", "4n");
     * // start the transport to hear the notes
     * Tone.Transport.start();
     */
    sync() {
        if (this._syncState()) {
            this._syncMethod("triggerAttack", 1);
            this._syncMethod("triggerRelease", 0);
        }
        return this;
    }
    /**
     * set _sync
     */
    _syncState() {
        let changed = false;
        if (!this._synced) {
            this._synced = true;
            changed = true;
        }
        return changed;
    }
    /**
     * Wrap the given method so that it can be synchronized
     * @param method Which method to wrap and sync
     * @param  timePosition What position the time argument appears in
     */
    _syncMethod(method, timePosition) {
        const originalMethod = this["_original_" + method] = this[method];
        this[method] = (...args) => {
            const time = args[timePosition];
            const id = this.context.transport.schedule((t) => {
                args[timePosition] = t;
                originalMethod.apply(this, args);
            }, time);
            this._scheduledEvents.push(id);
        };
    }
    /**
     * Unsync the instrument from the Transport
     */
    unsync() {
        this._scheduledEvents.forEach(id => this.context.transport.clear(id));
        this._scheduledEvents = [];
        if (this._synced) {
            this._synced = false;
            this.triggerAttack = this._original_triggerAttack;
            this.triggerRelease = this._original_triggerRelease;
        }
        return this;
    }
    /**
     * Trigger the attack and then the release after the duration.
     * @param  note     The note to trigger.
     * @param  duration How long the note should be held for before
     *                         triggering the release. This value must be greater than 0.
     * @param time  When the note should be triggered.
     * @param  velocity The velocity the note should be triggered at.
     * @example
     * const synth = new Tone.Synth().toDestination();
     * // trigger "C4" for the duration of an 8th note
     * synth.triggerAttackRelease("C4", "8n");
     */
    triggerAttackRelease(note, duration, time, velocity) {
        const computedTime = this.toSeconds(time);
        const computedDuration = this.toSeconds(duration);
        this.triggerAttack(note, computedTime, velocity);
        this.triggerRelease(computedTime + computedDuration);
        return this;
    }
    /**
     * clean up
     * @returns {Instrument} this
     */
    dispose() {
        super.dispose();
        this._volume.dispose();
        this.unsync();
        this._scheduledEvents = [];
        return this;
    }
}

/**
 * Abstract base class for other monophonic instruments to extend.
 */
class Monophonic extends Instrument {
    constructor() {
        super(optionsFromArguments(Monophonic.getDefaults(), arguments));
        const options = optionsFromArguments(Monophonic.getDefaults(), arguments);
        this.portamento = options.portamento;
        this.onsilence = options.onsilence;
    }
    static getDefaults() {
        return Object.assign(Instrument.getDefaults(), {
            detune: 0,
            onsilence: noOp,
            portamento: 0,
        });
    }
    /**
     * Trigger the attack of the note optionally with a given velocity.
     * @param  note The note to trigger.
     * @param  time When the note should start.
     * @param  velocity The velocity scaler determines how "loud" the note will be triggered.
     * @example
     * const synth = new Tone.Synth().toDestination();
     * // trigger the note a half second from now at half velocity
     * synth.triggerAttack("C4", "+0.5", 0.5);
     */
    triggerAttack(note, time, velocity = 1) {
        this.log("triggerAttack", note, time, velocity);
        const seconds = this.toSeconds(time);
        this._triggerEnvelopeAttack(seconds, velocity);
        this.setNote(note, seconds);
        return this;
    }
    /**
     * Trigger the release portion of the envelope
     * @param  time If no time is given, the release happens immediatly
     * @example
     * const synth = new Tone.Synth().toDestination();
     * synth.triggerAttack("C4");
     * // trigger the release a second from now
     * synth.triggerRelease("+1");
     */
    triggerRelease(time) {
        this.log("triggerRelease", time);
        const seconds = this.toSeconds(time);
        this._triggerEnvelopeRelease(seconds);
        return this;
    }
    /**
     * Set the note at the given time. If no time is given, the note
     * will set immediately.
     * @param note The note to change to.
     * @param  time The time when the note should be set.
     * @example
     * const synth = new Tone.Synth().toDestination();
     * synth.triggerAttack("C4");
     * // change to F#6 in one quarter note from now.
     * synth.setNote("F#6", "+4n");
     */
    setNote(note, time) {
        const computedTime = this.toSeconds(time);
        const computedFrequency = note instanceof FrequencyClass ? note.toFrequency() : note;
        if (this.portamento > 0 && this.getLevelAtTime(computedTime) > 0.05) {
            const portTime = this.toSeconds(this.portamento);
            this.frequency.exponentialRampTo(computedFrequency, portTime, computedTime);
        }
        else {
            this.frequency.setValueAtTime(computedFrequency, computedTime);
        }
        return this;
    }
}
__decorate([
    timeRange(0)
], Monophonic.prototype, "portamento", void 0);

/**
 * AmplitudeEnvelope is a Tone.Envelope connected to a gain node.
 * Unlike Tone.Envelope, which outputs the envelope's value, AmplitudeEnvelope accepts
 * an audio signal as the input and will apply the envelope to the amplitude
 * of the signal.
 * Read more about ADSR Envelopes on [Wikipedia](https://en.wikipedia.org/wiki/Synthesizer#ADSR_envelope).
 *
 * @example
 * return Tone.Offline(() => {
 * 	const ampEnv = new Tone.AmplitudeEnvelope({
 * 		attack: 0.1,
 * 		decay: 0.2,
 * 		sustain: 1.0,
 * 		release: 0.8
 * 	}).toDestination();
 * 	// create an oscillator and connect it
 * 	const osc = new Tone.Oscillator().connect(ampEnv).start();
 * 	// trigger the envelopes attack and release "8t" apart
 * 	ampEnv.triggerAttackRelease("8t");
 * }, 1.5, 1);
 * @category Component
 */
class AmplitudeEnvelope extends Envelope {
    constructor() {
        super(optionsFromArguments(AmplitudeEnvelope.getDefaults(), arguments, ["attack", "decay", "sustain", "release"]));
        this.name = "AmplitudeEnvelope";
        this._gainNode = new Gain({
            context: this.context,
            gain: 0,
        });
        this.output = this._gainNode;
        this.input = this._gainNode;
        this._sig.connect(this._gainNode.gain);
        this.output = this._gainNode;
        this.input = this._gainNode;
    }
    /**
     * Clean up
     */
    dispose() {
        super.dispose();
        this._gainNode.dispose();
        return this;
    }
}

/**
 * Synth is composed simply of a [[OmniOscillator]] routed through an [[AmplitudeEnvelope]].
 * ```
 * +----------------+   +-------------------+
 * | OmniOscillator +>--> AmplitudeEnvelope +>--> Output
 * +----------------+   +-------------------+
 * ```
 * @example
 * const synth = new Tone.Synth().toDestination();
 * synth.triggerAttackRelease("C4", "8n");
 * @category Instrument
 */
class Synth extends Monophonic {
    constructor() {
        super(optionsFromArguments(Synth.getDefaults(), arguments));
        this.name = "Synth";
        const options = optionsFromArguments(Synth.getDefaults(), arguments);
        this.oscillator = new OmniOscillator(Object.assign({
            context: this.context,
            detune: options.detune,
            onstop: () => this.onsilence(this),
        }, options.oscillator));
        this.frequency = this.oscillator.frequency;
        this.detune = this.oscillator.detune;
        this.envelope = new AmplitudeEnvelope(Object.assign({
            context: this.context,
        }, options.envelope));
        // connect the oscillators to the output
        this.oscillator.chain(this.envelope, this.output);
        readOnly(this, ["oscillator", "frequency", "detune", "envelope"]);
    }
    static getDefaults() {
        return Object.assign(Monophonic.getDefaults(), {
            envelope: Object.assign(omitFromObject(Envelope.getDefaults(), Object.keys(ToneAudioNode.getDefaults())), {
                attack: 0.005,
                decay: 0.1,
                release: 1,
                sustain: 0.3,
            }),
            oscillator: Object.assign(omitFromObject(OmniOscillator.getDefaults(), [...Object.keys(Source.getDefaults()), "frequency", "detune"]), {
                type: "triangle",
            }),
        });
    }
    /**
     * start the attack portion of the envelope
     * @param time the time the attack should start
     * @param velocity the velocity of the note (0-1)
     */
    _triggerEnvelopeAttack(time, velocity) {
        // the envelopes
        this.envelope.triggerAttack(time, velocity);
        this.oscillator.start(time);
        // if there is no release portion, stop the oscillator
        if (this.envelope.sustain === 0) {
            const computedAttack = this.toSeconds(this.envelope.attack);
            const computedDecay = this.toSeconds(this.envelope.decay);
            this.oscillator.stop(time + computedAttack + computedDecay);
        }
    }
    /**
     * start the release portion of the envelope
     * @param time the time the release should start
     */
    _triggerEnvelopeRelease(time) {
        this.envelope.triggerRelease(time);
        this.oscillator.stop(time + this.toSeconds(this.envelope.release));
    }
    getLevelAtTime(time) {
        time = this.toSeconds(time);
        return this.envelope.getValueAtTime(time);
    }
    /**
     * clean up
     */
    dispose() {
        super.dispose();
        this.oscillator.dispose();
        this.envelope.dispose();
        return this;
    }
}

/**
 * Base class for both AM and FM synths
 */
class ModulationSynth extends Monophonic {
    constructor() {
        super(optionsFromArguments(ModulationSynth.getDefaults(), arguments));
        this.name = "ModulationSynth";
        const options = optionsFromArguments(ModulationSynth.getDefaults(), arguments);
        this._carrier = new Synth({
            context: this.context,
            oscillator: options.oscillator,
            envelope: options.envelope,
            onsilence: () => this.onsilence(this),
            volume: -10,
        });
        this._modulator = new Synth({
            context: this.context,
            oscillator: options.modulation,
            envelope: options.modulationEnvelope,
            volume: -10,
        });
        this.oscillator = this._carrier.oscillator;
        this.envelope = this._carrier.envelope;
        this.modulation = this._modulator.oscillator;
        this.modulationEnvelope = this._modulator.envelope;
        this.frequency = new Signal({
            context: this.context,
            units: "frequency",
        });
        this.detune = new Signal({
            context: this.context,
            value: options.detune,
            units: "cents"
        });
        this.harmonicity = new Multiply({
            context: this.context,
            value: options.harmonicity,
            minValue: 0,
        });
        this._modulationNode = new Gain({
            context: this.context,
            gain: 0,
        });
        readOnly(this, ["frequency", "harmonicity", "oscillator", "envelope", "modulation", "modulationEnvelope", "detune"]);
    }
    static getDefaults() {
        return Object.assign(Monophonic.getDefaults(), {
            harmonicity: 3,
            oscillator: Object.assign(omitFromObject(OmniOscillator.getDefaults(), [
                ...Object.keys(Source.getDefaults()),
                "frequency",
                "detune"
            ]), {
                type: "sine"
            }),
            envelope: Object.assign(omitFromObject(Envelope.getDefaults(), Object.keys(ToneAudioNode.getDefaults())), {
                attack: 0.01,
                decay: 0.01,
                sustain: 1,
                release: 0.5
            }),
            modulation: Object.assign(omitFromObject(OmniOscillator.getDefaults(), [
                ...Object.keys(Source.getDefaults()),
                "frequency",
                "detune"
            ]), {
                type: "square"
            }),
            modulationEnvelope: Object.assign(omitFromObject(Envelope.getDefaults(), Object.keys(ToneAudioNode.getDefaults())), {
                attack: 0.5,
                decay: 0.0,
                sustain: 1,
                release: 0.5
            })
        });
    }
    /**
     * Trigger the attack portion of the note
     */
    _triggerEnvelopeAttack(time, velocity) {
        // @ts-ignore
        this._carrier._triggerEnvelopeAttack(time, velocity);
        // @ts-ignore
        this._modulator._triggerEnvelopeAttack(time, velocity);
    }
    /**
     * Trigger the release portion of the note
     */
    _triggerEnvelopeRelease(time) {
        // @ts-ignore
        this._carrier._triggerEnvelopeRelease(time);
        // @ts-ignore
        this._modulator._triggerEnvelopeRelease(time);
        return this;
    }
    getLevelAtTime(time) {
        time = this.toSeconds(time);
        return this.envelope.getValueAtTime(time);
    }
    dispose() {
        super.dispose();
        this._carrier.dispose();
        this._modulator.dispose();
        this.frequency.dispose();
        this.detune.dispose();
        this.harmonicity.dispose();
        this._modulationNode.dispose();
        return this;
    }
}

/**
 * AMSynth uses the output of one Tone.Synth to modulate the
 * amplitude of another Tone.Synth. The harmonicity (the ratio between
 * the two signals) affects the timbre of the output signal greatly.
 * Read more about Amplitude Modulation Synthesis on
 * [SoundOnSound](https://web.archive.org/web/20160404103653/http://www.soundonsound.com:80/sos/mar00/articles/synthsecrets.htm).
 *
 * @example
 * const synth = new Tone.AMSynth().toDestination();
 * synth.triggerAttackRelease("C4", "4n");
 *
 * @category Instrument
 */
class AMSynth extends ModulationSynth {
    constructor() {
        super(optionsFromArguments(AMSynth.getDefaults(), arguments));
        this.name = "AMSynth";
        this._modulationScale = new AudioToGain({
            context: this.context,
        });
        // control the two voices frequency
        this.frequency.connect(this._carrier.frequency);
        this.frequency.chain(this.harmonicity, this._modulator.frequency);
        this.detune.fan(this._carrier.detune, this._modulator.detune);
        this._modulator.chain(this._modulationScale, this._modulationNode.gain);
        this._carrier.chain(this._modulationNode, this.output);
    }
    dispose() {
        super.dispose();
        this._modulationScale.dispose();
        return this;
    }
}

/**
 * Thin wrapper around the native Web Audio [BiquadFilterNode](https://webaudio.github.io/web-audio-api/#biquadfilternode).
 * BiquadFilter is similar to [[Filter]] but doesn't have the option to set the "rolloff" value.
 * @category Component
 */
class BiquadFilter extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(BiquadFilter.getDefaults(), arguments, ["frequency", "type"]));
        this.name = "BiquadFilter";
        const options = optionsFromArguments(BiquadFilter.getDefaults(), arguments, ["frequency", "type"]);
        this._filter = this.context.createBiquadFilter();
        this.input = this.output = this._filter;
        this.Q = new Param({
            context: this.context,
            units: "number",
            value: options.Q,
            param: this._filter.Q,
        });
        this.frequency = new Param({
            context: this.context,
            units: "frequency",
            value: options.frequency,
            param: this._filter.frequency,
        });
        this.detune = new Param({
            context: this.context,
            units: "cents",
            value: options.detune,
            param: this._filter.detune,
        });
        this.gain = new Param({
            context: this.context,
            units: "decibels",
            convert: false,
            value: options.gain,
            param: this._filter.gain,
        });
        this.type = options.type;
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            Q: 1,
            type: "lowpass",
            frequency: 350,
            detune: 0,
            gain: 0,
        });
    }
    /**
     * The type of this BiquadFilterNode. For a complete list of types and their attributes, see the
     * [Web Audio API](https://webaudio.github.io/web-audio-api/#dom-biquadfiltertype-lowpass)
     */
    get type() {
        return this._filter.type;
    }
    set type(type) {
        const types = ["lowpass", "highpass", "bandpass",
            "lowshelf", "highshelf", "notch", "allpass", "peaking"];
        assert(types.indexOf(type) !== -1, `Invalid filter type: ${type}`);
        this._filter.type = type;
    }
    /**
     * Get the frequency response curve. This curve represents how the filter
     * responses to frequencies between 20hz-20khz.
     * @param  len The number of values to return
     * @return The frequency response curve between 20-20kHz
     */
    getFrequencyResponse(len = 128) {
        // start with all 1s
        const freqValues = new Float32Array(len);
        for (let i = 0; i < len; i++) {
            const norm = Math.pow(i / len, 2);
            const freq = norm * (20000 - 20) + 20;
            freqValues[i] = freq;
        }
        const magValues = new Float32Array(len);
        const phaseValues = new Float32Array(len);
        // clone the filter to remove any connections which may be changing the value
        const filterClone = this.context.createBiquadFilter();
        filterClone.type = this.type;
        filterClone.Q.value = this.Q.value;
        filterClone.frequency.value = this.frequency.value;
        filterClone.gain.value = this.gain.value;
        filterClone.getFrequencyResponse(freqValues, magValues, phaseValues);
        return magValues;
    }
    dispose() {
        super.dispose();
        this._filter.disconnect();
        this.Q.dispose();
        this.frequency.dispose();
        this.gain.dispose();
        this.detune.dispose();
        return this;
    }
}

/**
 * Tone.Filter is a filter which allows for all of the same native methods
 * as the [BiquadFilterNode](http://webaudio.github.io/web-audio-api/#the-biquadfilternode-interface).
 * Tone.Filter has the added ability to set the filter rolloff at -12
 * (default), -24 and -48.
 * @example
 * const filter = new Tone.Filter(1500, "highpass").toDestination();
 * filter.frequency.rampTo(20000, 10);
 * const noise = new Tone.Noise().connect(filter).start();
 * @category Component
 */
class Filter extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(Filter.getDefaults(), arguments, ["frequency", "type", "rolloff"]));
        this.name = "Filter";
        this.input = new Gain({ context: this.context });
        this.output = new Gain({ context: this.context });
        this._filters = [];
        const options = optionsFromArguments(Filter.getDefaults(), arguments, ["frequency", "type", "rolloff"]);
        this._filters = [];
        this.Q = new Signal({
            context: this.context,
            units: "positive",
            value: options.Q,
        });
        this.frequency = new Signal({
            context: this.context,
            units: "frequency",
            value: options.frequency,
        });
        this.detune = new Signal({
            context: this.context,
            units: "cents",
            value: options.detune,
        });
        this.gain = new Signal({
            context: this.context,
            units: "decibels",
            convert: false,
            value: options.gain,
        });
        this._type = options.type;
        this.rolloff = options.rolloff;
        readOnly(this, ["detune", "frequency", "gain", "Q"]);
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            Q: 1,
            detune: 0,
            frequency: 350,
            gain: 0,
            rolloff: -12,
            type: "lowpass",
        });
    }
    /**
     * The type of the filter. Types: "lowpass", "highpass",
     * "bandpass", "lowshelf", "highshelf", "notch", "allpass", or "peaking".
     */
    get type() {
        return this._type;
    }
    set type(type) {
        const types = ["lowpass", "highpass", "bandpass",
            "lowshelf", "highshelf", "notch", "allpass", "peaking"];
        assert(types.indexOf(type) !== -1, `Invalid filter type: ${type}`);
        this._type = type;
        this._filters.forEach(filter => filter.type = type);
    }
    /**
     * The rolloff of the filter which is the drop in db
     * per octave. Implemented internally by cascading filters.
     * Only accepts the values -12, -24, -48 and -96.
     */
    get rolloff() {
        return this._rolloff;
    }
    set rolloff(rolloff) {
        const rolloffNum = isNumber(rolloff) ? rolloff : parseInt(rolloff, 10);
        const possibilities = [-12, -24, -48, -96];
        let cascadingCount = possibilities.indexOf(rolloffNum);
        // check the rolloff is valid
        assert(cascadingCount !== -1, `rolloff can only be ${possibilities.join(", ")}`);
        cascadingCount += 1;
        this._rolloff = rolloffNum;
        this.input.disconnect();
        this._filters.forEach(filter => filter.disconnect());
        this._filters = new Array(cascadingCount);
        for (let count = 0; count < cascadingCount; count++) {
            const filter = new BiquadFilter({
                context: this.context,
            });
            filter.type = this._type;
            this.frequency.connect(filter.frequency);
            this.detune.connect(filter.detune);
            this.Q.connect(filter.Q);
            this.gain.connect(filter.gain);
            this._filters[count] = filter;
        }
        this._internalChannels = this._filters;
        connectSeries(this.input, ...this._internalChannels, this.output);
    }
    /**
     * Get the frequency response curve. This curve represents how the filter
     * responses to frequencies between 20hz-20khz.
     * @param  len The number of values to return
     * @return The frequency response curve between 20-20kHz
     */
    getFrequencyResponse(len = 128) {
        const filterClone = new BiquadFilter({
            frequency: this.frequency.value,
            gain: this.gain.value,
            Q: this.Q.value,
            type: this._type,
            detune: this.detune.value,
        });
        // start with all 1s
        const totalResponse = new Float32Array(len).map(() => 1);
        this._filters.forEach(() => {
            const response = filterClone.getFrequencyResponse(len);
            response.forEach((val, i) => totalResponse[i] *= val);
        });
        filterClone.dispose();
        return totalResponse;
    }
    /**
     * Clean up.
     */
    dispose() {
        super.dispose();
        this._filters.forEach(filter => {
            filter.dispose();
        });
        writable(this, ["detune", "frequency", "gain", "Q"]);
        this.frequency.dispose();
        this.Q.dispose();
        this.detune.dispose();
        this.gain.dispose();
        return this;
    }
}

/**
 * FrequencyEnvelope is an [[Envelope]] which ramps between [[baseFrequency]]
 * and [[octaves]]. It can also have an optional [[exponent]] to adjust the curve
 * which it ramps.
 * @example
 * const oscillator = new Tone.Oscillator().toDestination().start();
 * const freqEnv = new Tone.FrequencyEnvelope({
 * 	attack: 0.2,
 * 	baseFrequency: "C2",
 * 	octaves: 4
 * });
 * freqEnv.connect(oscillator.frequency);
 * freqEnv.triggerAttack();
 * @category Component
 */
class FrequencyEnvelope extends Envelope {
    constructor() {
        super(optionsFromArguments(FrequencyEnvelope.getDefaults(), arguments, ["attack", "decay", "sustain", "release"]));
        this.name = "FrequencyEnvelope";
        const options = optionsFromArguments(FrequencyEnvelope.getDefaults(), arguments, ["attack", "decay", "sustain", "release"]);
        this._octaves = options.octaves;
        this._baseFrequency = this.toFrequency(options.baseFrequency);
        this._exponent = this.input = new Pow({
            context: this.context,
            value: options.exponent
        });
        this._scale = this.output = new Scale({
            context: this.context,
            min: this._baseFrequency,
            max: this._baseFrequency * Math.pow(2, this._octaves),
        });
        this._sig.chain(this._exponent, this._scale);
    }
    static getDefaults() {
        return Object.assign(Envelope.getDefaults(), {
            baseFrequency: 200,
            exponent: 1,
            octaves: 4,
        });
    }
    /**
     * The envelope's minimum output value. This is the value which it
     * starts at.
     */
    get baseFrequency() {
        return this._baseFrequency;
    }
    set baseFrequency(min) {
        const freq = this.toFrequency(min);
        assertRange(freq, 0);
        this._baseFrequency = freq;
        this._scale.min = this._baseFrequency;
        // update the max value when the min changes
        this.octaves = this._octaves;
    }
    /**
     * The number of octaves above the baseFrequency that the
     * envelope will scale to.
     */
    get octaves() {
        return this._octaves;
    }
    set octaves(octaves) {
        this._octaves = octaves;
        this._scale.max = this._baseFrequency * Math.pow(2, octaves);
    }
    /**
     * The envelope's exponent value.
     */
    get exponent() {
        return this._exponent.value;
    }
    set exponent(exponent) {
        this._exponent.value = exponent;
    }
    /**
     * Clean up
     */
    dispose() {
        super.dispose();
        this._exponent.dispose();
        this._scale.dispose();
        return this;
    }
}

/**
 * MonoSynth is composed of one `oscillator`, one `filter`, and two `envelopes`.
 * The amplitude of the Oscillator and the cutoff frequency of the
 * Filter are controlled by Envelopes.
 * <img src="https://docs.google.com/drawings/d/1gaY1DF9_Hzkodqf8JI1Cg2VZfwSElpFQfI94IQwad38/pub?w=924&h=240">
 * @example
 * const synth = new Tone.MonoSynth({
 * 	oscillator: {
 * 		type: "square"
 * 	},
 * 	envelope: {
 * 		attack: 0.1
 * 	}
 * }).toDestination();
 * synth.triggerAttackRelease("C4", "8n");
 * @category Instrument
 */
class MonoSynth extends Monophonic {
    constructor() {
        super(optionsFromArguments(MonoSynth.getDefaults(), arguments));
        this.name = "MonoSynth";
        const options = optionsFromArguments(MonoSynth.getDefaults(), arguments);
        this.oscillator = new OmniOscillator(Object.assign(options.oscillator, {
            context: this.context,
            detune: options.detune,
            onstop: () => this.onsilence(this),
        }));
        this.frequency = this.oscillator.frequency;
        this.detune = this.oscillator.detune;
        this.filter = new Filter(Object.assign(options.filter, { context: this.context }));
        this.filterEnvelope = new FrequencyEnvelope(Object.assign(options.filterEnvelope, { context: this.context }));
        this.envelope = new AmplitudeEnvelope(Object.assign(options.envelope, { context: this.context }));
        // connect the oscillators to the output
        this.oscillator.chain(this.filter, this.envelope, this.output);
        // connect the filter envelope
        this.filterEnvelope.connect(this.filter.frequency);
        readOnly(this, ["oscillator", "frequency", "detune", "filter", "filterEnvelope", "envelope"]);
    }
    static getDefaults() {
        return Object.assign(Monophonic.getDefaults(), {
            envelope: Object.assign(omitFromObject(Envelope.getDefaults(), Object.keys(ToneAudioNode.getDefaults())), {
                attack: 0.005,
                decay: 0.1,
                release: 1,
                sustain: 0.9,
            }),
            filter: Object.assign(omitFromObject(Filter.getDefaults(), Object.keys(ToneAudioNode.getDefaults())), {
                Q: 1,
                rolloff: -12,
                type: "lowpass",
            }),
            filterEnvelope: Object.assign(omitFromObject(FrequencyEnvelope.getDefaults(), Object.keys(ToneAudioNode.getDefaults())), {
                attack: 0.6,
                baseFrequency: 200,
                decay: 0.2,
                exponent: 2,
                octaves: 3,
                release: 2,
                sustain: 0.5,
            }),
            oscillator: Object.assign(omitFromObject(OmniOscillator.getDefaults(), Object.keys(Source.getDefaults())), {
                type: "sawtooth",
            }),
        });
    }
    /**
     * start the attack portion of the envelope
     * @param time the time the attack should start
     * @param velocity the velocity of the note (0-1)
     */
    _triggerEnvelopeAttack(time, velocity = 1) {
        this.envelope.triggerAttack(time, velocity);
        this.filterEnvelope.triggerAttack(time);
        this.oscillator.start(time);
        if (this.envelope.sustain === 0) {
            const computedAttack = this.toSeconds(this.envelope.attack);
            const computedDecay = this.toSeconds(this.envelope.decay);
            this.oscillator.stop(time + computedAttack + computedDecay);
        }
    }
    /**
     * start the release portion of the envelope
     * @param time the time the release should start
     */
    _triggerEnvelopeRelease(time) {
        this.envelope.triggerRelease(time);
        this.filterEnvelope.triggerRelease(time);
        this.oscillator.stop(time + this.toSeconds(this.envelope.release));
    }
    getLevelAtTime(time) {
        time = this.toSeconds(time);
        return this.envelope.getValueAtTime(time);
    }
    dispose() {
        super.dispose();
        this.oscillator.dispose();
        this.envelope.dispose();
        this.filterEnvelope.dispose();
        this.filter.dispose();
        return this;
    }
}

/**
 * DuoSynth is a monophonic synth composed of two [[MonoSynths]] run in parallel with control over the
 * frequency ratio between the two voices and vibrato effect.
 * @example
 * const duoSynth = new Tone.DuoSynth().toDestination();
 * duoSynth.triggerAttackRelease("C4", "2n");
 * @category Instrument
 */
class DuoSynth extends Monophonic {
    constructor() {
        super(optionsFromArguments(DuoSynth.getDefaults(), arguments));
        this.name = "DuoSynth";
        const options = optionsFromArguments(DuoSynth.getDefaults(), arguments);
        this.voice0 = new MonoSynth(Object.assign(options.voice0, {
            context: this.context,
            onsilence: () => this.onsilence(this)
        }));
        this.voice1 = new MonoSynth(Object.assign(options.voice1, {
            context: this.context,
        }));
        this.harmonicity = new Multiply({
            context: this.context,
            units: "positive",
            value: options.harmonicity,
        });
        this._vibrato = new LFO({
            frequency: options.vibratoRate,
            context: this.context,
            min: -50,
            max: 50
        });
        // start the vibrato immediately
        this._vibrato.start();
        this.vibratoRate = this._vibrato.frequency;
        this._vibratoGain = new Gain({
            context: this.context,
            units: "normalRange",
            gain: options.vibratoAmount
        });
        this.vibratoAmount = this._vibratoGain.gain;
        this.frequency = new Signal({
            context: this.context,
            units: "frequency",
            value: 440
        });
        this.detune = new Signal({
            context: this.context,
            units: "cents",
            value: options.detune
        });
        // control the two voices frequency
        this.frequency.connect(this.voice0.frequency);
        this.frequency.chain(this.harmonicity, this.voice1.frequency);
        this._vibrato.connect(this._vibratoGain);
        this._vibratoGain.fan(this.voice0.detune, this.voice1.detune);
        this.detune.fan(this.voice0.detune, this.voice1.detune);
        this.voice0.connect(this.output);
        this.voice1.connect(this.output);
        readOnly(this, ["voice0", "voice1", "frequency", "vibratoAmount", "vibratoRate"]);
    }
    getLevelAtTime(time) {
        time = this.toSeconds(time);
        return this.voice0.envelope.getValueAtTime(time) + this.voice1.envelope.getValueAtTime(time);
    }
    static getDefaults() {
        return deepMerge(Monophonic.getDefaults(), {
            vibratoAmount: 0.5,
            vibratoRate: 5,
            harmonicity: 1.5,
            voice0: deepMerge(omitFromObject(MonoSynth.getDefaults(), Object.keys(Monophonic.getDefaults())), {
                filterEnvelope: {
                    attack: 0.01,
                    decay: 0.0,
                    sustain: 1,
                    release: 0.5
                },
                envelope: {
                    attack: 0.01,
                    decay: 0.0,
                    sustain: 1,
                    release: 0.5
                }
            }),
            voice1: deepMerge(omitFromObject(MonoSynth.getDefaults(), Object.keys(Monophonic.getDefaults())), {
                filterEnvelope: {
                    attack: 0.01,
                    decay: 0.0,
                    sustain: 1,
                    release: 0.5
                },
                envelope: {
                    attack: 0.01,
                    decay: 0.0,
                    sustain: 1,
                    release: 0.5
                }
            }),
        });
    }
    /**
     * Trigger the attack portion of the note
     */
    _triggerEnvelopeAttack(time, velocity) {
        // @ts-ignore
        this.voice0._triggerEnvelopeAttack(time, velocity);
        // @ts-ignore
        this.voice1._triggerEnvelopeAttack(time, velocity);
    }
    /**
     * Trigger the release portion of the note
     */
    _triggerEnvelopeRelease(time) {
        // @ts-ignore
        this.voice0._triggerEnvelopeRelease(time);
        // @ts-ignore
        this.voice1._triggerEnvelopeRelease(time);
        return this;
    }
    dispose() {
        super.dispose();
        this.voice0.dispose();
        this.voice1.dispose();
        this.frequency.dispose();
        this.detune.dispose();
        this._vibrato.dispose();
        this.vibratoRate.dispose();
        this._vibratoGain.dispose();
        this.harmonicity.dispose();
        return this;
    }
}

/**
 * FMSynth is composed of two Tone.Synths where one Tone.Synth modulates
 * the frequency of a second Tone.Synth. A lot of spectral content
 * can be explored using the modulationIndex parameter. Read more about
 * frequency modulation synthesis on Sound On Sound: [Part 1](https://web.archive.org/web/20160403123704/http://www.soundonsound.com/sos/apr00/articles/synthsecrets.htm), [Part 2](https://web.archive.org/web/20160403115835/http://www.soundonsound.com/sos/may00/articles/synth.htm).
 *
 * @example
 * const fmSynth = new Tone.FMSynth().toDestination();
 * fmSynth.triggerAttackRelease("C5", "4n");
 *
 * @category Instrument
 */
class FMSynth extends ModulationSynth {
    constructor() {
        super(optionsFromArguments(FMSynth.getDefaults(), arguments));
        this.name = "FMSynth";
        const options = optionsFromArguments(FMSynth.getDefaults(), arguments);
        this.modulationIndex = new Multiply({
            context: this.context,
            value: options.modulationIndex,
        });
        // control the two voices frequency
        this.frequency.connect(this._carrier.frequency);
        this.frequency.chain(this.harmonicity, this._modulator.frequency);
        this.frequency.chain(this.modulationIndex, this._modulationNode);
        this.detune.fan(this._carrier.detune, this._modulator.detune);
        this._modulator.connect(this._modulationNode.gain);
        this._modulationNode.connect(this._carrier.frequency);
        this._carrier.connect(this.output);
    }
    static getDefaults() {
        return Object.assign(ModulationSynth.getDefaults(), {
            modulationIndex: 10,
        });
    }
    dispose() {
        super.dispose();
        this.modulationIndex.dispose();
        return this;
    }
}

/**
 * Inharmonic ratio of frequencies based on the Roland TR-808
 * Taken from https://ccrma.stanford.edu/papers/tr-808-cymbal-physically-informed-circuit-bendable-digital-model
 */
const inharmRatios = [1.0, 1.483, 1.932, 2.546, 2.630, 3.897];
/**
 * A highly inharmonic and spectrally complex source with a highpass filter
 * and amplitude envelope which is good for making metallophone sounds.
 * Based on CymbalSynth by [@polyrhythmatic](https://github.com/polyrhythmatic).
 * Inspiration from [Sound on Sound](https://shorturl.at/rSZ12).
 * @category Instrument
 */
class MetalSynth extends Monophonic {
    constructor() {
        super(optionsFromArguments(MetalSynth.getDefaults(), arguments));
        this.name = "MetalSynth";
        /**
         * The array of FMOscillators
         */
        this._oscillators = [];
        /**
         * The frequency multipliers
         */
        this._freqMultipliers = [];
        const options = optionsFromArguments(MetalSynth.getDefaults(), arguments);
        this.detune = new Signal({
            context: this.context,
            units: "cents",
            value: options.detune,
        });
        this.frequency = new Signal({
            context: this.context,
            units: "frequency",
        });
        this._amplitude = new Gain({
            context: this.context,
            gain: 0,
        }).connect(this.output);
        this._highpass = new Filter({
            // Q: -3.0102999566398125,
            Q: 0,
            context: this.context,
            type: "highpass",
        }).connect(this._amplitude);
        for (let i = 0; i < inharmRatios.length; i++) {
            const osc = new FMOscillator({
                context: this.context,
                harmonicity: options.harmonicity,
                modulationIndex: options.modulationIndex,
                modulationType: "square",
                onstop: i === 0 ? () => this.onsilence(this) : noOp,
                type: "square",
            });
            osc.connect(this._highpass);
            this._oscillators[i] = osc;
            const mult = new Multiply({
                context: this.context,
                value: inharmRatios[i],
            });
            this._freqMultipliers[i] = mult;
            this.frequency.chain(mult, osc.frequency);
            this.detune.connect(osc.detune);
        }
        this._filterFreqScaler = new Scale({
            context: this.context,
            max: 7000,
            min: this.toFrequency(options.resonance),
        });
        this.envelope = new Envelope({
            attack: options.envelope.attack,
            attackCurve: "linear",
            context: this.context,
            decay: options.envelope.decay,
            release: options.envelope.release,
            sustain: 0,
        });
        this.envelope.chain(this._filterFreqScaler, this._highpass.frequency);
        this.envelope.connect(this._amplitude.gain);
        // set the octaves
        this._octaves = options.octaves;
        this.octaves = options.octaves;
    }
    static getDefaults() {
        return deepMerge(Monophonic.getDefaults(), {
            envelope: Object.assign(omitFromObject(Envelope.getDefaults(), Object.keys(ToneAudioNode.getDefaults())), {
                attack: 0.001,
                decay: 1.4,
                release: 0.2,
            }),
            harmonicity: 5.1,
            modulationIndex: 32,
            octaves: 1.5,
            resonance: 4000,
        });
    }
    /**
     * Trigger the attack.
     * @param time When the attack should be triggered.
     * @param velocity The velocity that the envelope should be triggered at.
     */
    _triggerEnvelopeAttack(time, velocity = 1) {
        this.envelope.triggerAttack(time, velocity);
        this._oscillators.forEach(osc => osc.start(time));
        if (this.envelope.sustain === 0) {
            this._oscillators.forEach(osc => {
                osc.stop(time + this.toSeconds(this.envelope.attack) + this.toSeconds(this.envelope.decay));
            });
        }
        return this;
    }
    /**
     * Trigger the release of the envelope.
     * @param time When the release should be triggered.
     */
    _triggerEnvelopeRelease(time) {
        this.envelope.triggerRelease(time);
        this._oscillators.forEach(osc => osc.stop(time + this.toSeconds(this.envelope.release)));
        return this;
    }
    getLevelAtTime(time) {
        time = this.toSeconds(time);
        return this.envelope.getValueAtTime(time);
    }
    /**
     * The modulationIndex of the oscillators which make up the source.
     * see [[FMOscillator.modulationIndex]]
     * @min 1
     * @max 100
     */
    get modulationIndex() {
        return this._oscillators[0].modulationIndex.value;
    }
    set modulationIndex(val) {
        this._oscillators.forEach(osc => (osc.modulationIndex.value = val));
    }
    /**
     * The harmonicity of the oscillators which make up the source.
     * see Tone.FMOscillator.harmonicity
     * @min 0.1
     * @max 10
     */
    get harmonicity() {
        return this._oscillators[0].harmonicity.value;
    }
    set harmonicity(val) {
        this._oscillators.forEach(osc => (osc.harmonicity.value = val));
    }
    /**
     * The lower level of the highpass filter which is attached to the envelope.
     * This value should be between [0, 7000]
     * @min 0
     * @max 7000
     */
    get resonance() {
        return this._filterFreqScaler.min;
    }
    set resonance(val) {
        this._filterFreqScaler.min = this.toFrequency(val);
        this.octaves = this._octaves;
    }
    /**
     * The number of octaves above the "resonance" frequency
     * that the filter ramps during the attack/decay envelope
     * @min 0
     * @max 8
     */
    get octaves() {
        return this._octaves;
    }
    set octaves(val) {
        this._octaves = val;
        this._filterFreqScaler.max = this._filterFreqScaler.min * Math.pow(2, val);
    }
    dispose() {
        super.dispose();
        this._oscillators.forEach(osc => osc.dispose());
        this._freqMultipliers.forEach(freqMult => freqMult.dispose());
        this.frequency.dispose();
        this.detune.dispose();
        this._filterFreqScaler.dispose();
        this._amplitude.dispose();
        this.envelope.dispose();
        this._highpass.dispose();
        return this;
    }
}

/**
 * MembraneSynth makes kick and tom sounds using a single oscillator
 * with an amplitude envelope and frequency ramp. A Tone.OmniOscillator
 * is routed through a Tone.AmplitudeEnvelope to the output. The drum
 * quality of the sound comes from the frequency envelope applied
 * during MembraneSynth.triggerAttack(note). The frequency envelope
 * starts at <code>note * .octaves</code> and ramps to <code>note</code>
 * over the duration of <code>.pitchDecay</code>.
 * @example
 * const synth = new Tone.MembraneSynth().toDestination();
 * synth.triggerAttackRelease("C2", "8n");
 * @category Instrument
 */
class MembraneSynth extends Synth {
    constructor() {
        super(optionsFromArguments(MembraneSynth.getDefaults(), arguments));
        this.name = "MembraneSynth";
        /**
         * Portamento is ignored in this synth. use pitch decay instead.
         */
        this.portamento = 0;
        const options = optionsFromArguments(MembraneSynth.getDefaults(), arguments);
        this.pitchDecay = options.pitchDecay;
        this.octaves = options.octaves;
        readOnly(this, ["oscillator", "envelope"]);
    }
    static getDefaults() {
        return deepMerge(Monophonic.getDefaults(), Synth.getDefaults(), {
            envelope: {
                attack: 0.001,
                attackCurve: "exponential",
                decay: 0.4,
                release: 1.4,
                sustain: 0.01,
            },
            octaves: 10,
            oscillator: {
                type: "sine",
            },
            pitchDecay: 0.05,
        });
    }
    setNote(note, time) {
        const seconds = this.toSeconds(time);
        const hertz = this.toFrequency(note instanceof FrequencyClass ? note.toFrequency() : note);
        const maxNote = hertz * this.octaves;
        this.oscillator.frequency.setValueAtTime(maxNote, seconds);
        this.oscillator.frequency.exponentialRampToValueAtTime(hertz, seconds + this.toSeconds(this.pitchDecay));
        return this;
    }
    dispose() {
        super.dispose();
        return this;
    }
}
__decorate([
    range(0)
], MembraneSynth.prototype, "octaves", void 0);
__decorate([
    timeRange(0)
], MembraneSynth.prototype, "pitchDecay", void 0);

/**
 * Tone.NoiseSynth is composed of [[Noise]] through an [[AmplitudeEnvelope]].
 * ```
 * +-------+   +-------------------+
 * | Noise +>--> AmplitudeEnvelope +>--> Output
 * +-------+   +-------------------+
 * ```
 * @example
 * const noiseSynth = new Tone.NoiseSynth().toDestination();
 * noiseSynth.triggerAttackRelease("8n", 0.05);
 * @category Instrument
 */
class NoiseSynth extends Instrument {
    constructor() {
        super(optionsFromArguments(NoiseSynth.getDefaults(), arguments));
        this.name = "NoiseSynth";
        const options = optionsFromArguments(NoiseSynth.getDefaults(), arguments);
        this.noise = new Noise(Object.assign({
            context: this.context,
        }, options.noise));
        this.envelope = new AmplitudeEnvelope(Object.assign({
            context: this.context,
        }, options.envelope));
        // connect the noise to the output
        this.noise.chain(this.envelope, this.output);
    }
    static getDefaults() {
        return Object.assign(Instrument.getDefaults(), {
            envelope: Object.assign(omitFromObject(Envelope.getDefaults(), Object.keys(ToneAudioNode.getDefaults())), {
                decay: 0.1,
                sustain: 0.0,
            }),
            noise: Object.assign(omitFromObject(Noise.getDefaults(), Object.keys(Source.getDefaults())), {
                type: "white",
            }),
        });
    }
    /**
     * Start the attack portion of the envelopes. Unlike other
     * instruments, Tone.NoiseSynth doesn't have a note.
     * @example
     * const noiseSynth = new Tone.NoiseSynth().toDestination();
     * noiseSynth.triggerAttack();
     */
    triggerAttack(time, velocity = 1) {
        time = this.toSeconds(time);
        // the envelopes
        this.envelope.triggerAttack(time, velocity);
        // start the noise
        this.noise.start(time);
        if (this.envelope.sustain === 0) {
            this.noise.stop(time + this.toSeconds(this.envelope.attack) + this.toSeconds(this.envelope.decay));
        }
        return this;
    }
    /**
     * Start the release portion of the envelopes.
     */
    triggerRelease(time) {
        time = this.toSeconds(time);
        this.envelope.triggerRelease(time);
        this.noise.stop(time + this.toSeconds(this.envelope.release));
        return this;
    }
    sync() {
        if (this._syncState()) {
            this._syncMethod("triggerAttack", 0);
            this._syncMethod("triggerRelease", 0);
        }
        return this;
    }
    triggerAttackRelease(duration, time, velocity = 1) {
        time = this.toSeconds(time);
        duration = this.toSeconds(duration);
        this.triggerAttack(time, velocity);
        this.triggerRelease(time + duration);
        return this;
    }
    dispose() {
        super.dispose();
        this.noise.dispose();
        this.envelope.dispose();
        return this;
    }
}

/**
 * All of the classes or functions which are loaded into the AudioWorkletGlobalScope
 */
const workletContext = new Set();
/**
 * Add a class to the AudioWorkletGlobalScope
 */
function addToWorklet(classOrFunction) {
    workletContext.add(classOrFunction);
}
/**
 * Register a processor in the AudioWorkletGlobalScope with the given name
 */
function registerProcessor(name, classDesc) {
    const processor = /* javascript */ `registerProcessor("${name}", ${classDesc})`;
    workletContext.add(processor);
}
/**
 * Get all of the modules which have been registered to the AudioWorkletGlobalScope
 */
function getWorkletGlobalScope() {
    return Array.from(workletContext).join("\n");
}

class ToneAudioWorklet extends ToneAudioNode {
    constructor(options) {
        super(options);
        this.name = "ToneAudioWorklet";
        /**
         * The constructor options for the node
         */
        this.workletOptions = {};
        /**
         * Callback which is invoked when there is an error in the processing
         */
        this.onprocessorerror = noOp;
        const blobUrl = URL.createObjectURL(new Blob([getWorkletGlobalScope()], { type: "text/javascript" }));
        const name = this._audioWorkletName();
        this._dummyGain = this.context.createGain();
        this._dummyParam = this._dummyGain.gain;
        // Register the processor
        this.context.addAudioWorkletModule(blobUrl, name).then(() => {
            // create the worklet when it's read
            if (!this.disposed) {
                this._worklet = this.context.createAudioWorkletNode(name, this.workletOptions);
                this._worklet.onprocessorerror = this.onprocessorerror.bind(this);
                this.onReady(this._worklet);
            }
        });
    }
    dispose() {
        super.dispose();
        this._dummyGain.disconnect();
        if (this._worklet) {
            this._worklet.port.postMessage("dispose");
            this._worklet.disconnect();
        }
        return this;
    }
}

const toneAudioWorkletProcessor = /* javascript */ `
	/**
	 * The base AudioWorkletProcessor for use in Tone.js. Works with the [[ToneAudioWorklet]]. 
	 */
	class ToneAudioWorkletProcessor extends AudioWorkletProcessor {

		constructor(options) {
			
			super(options);
			/**
			 * If the processor was disposed or not. Keep alive until it's disposed.
			 */
			this.disposed = false;
		   	/** 
			 * The number of samples in the processing block
			 */
			this.blockSize = 128;
			/**
			 * the sample rate
			 */
			this.sampleRate = sampleRate;

			this.port.onmessage = (event) => {
				// when it receives a dispose 
				if (event.data === "dispose") {
					this.disposed = true;
				}
			};
		}
	}
`;
addToWorklet(toneAudioWorkletProcessor);

const singleIOProcess = /* javascript */ `
	/**
	 * Abstract class for a single input/output processor. 
	 * has a 'generate' function which processes one sample at a time
	 */
	class SingleIOProcessor extends ToneAudioWorkletProcessor {

		constructor(options) {
			super(Object.assign(options, {
				numberOfInputs: 1,
				numberOfOutputs: 1
			}));
			/**
			 * Holds the name of the parameter and a single value of that
			 * parameter at the current sample
			 * @type { [name: string]: number }
			 */
			this.params = {}
		}

		/**
		 * Generate an output sample from the input sample and parameters
		 * @abstract
		 * @param input number
		 * @param channel number
		 * @param parameters { [name: string]: number }
		 * @returns number
		 */
		generate(){}

		/**
		 * Update the private params object with the 
		 * values of the parameters at the given index
		 * @param parameters { [name: string]: Float32Array },
		 * @param index number
		 */
		updateParams(parameters, index) {
			for (const paramName in parameters) {
				const param = parameters[paramName];
				if (param.length > 1) {
					this.params[paramName] = parameters[paramName][index];
				} else {
					this.params[paramName] = parameters[paramName][0];
				}
			}
		}

		/**
		 * Process a single frame of the audio
		 * @param inputs Float32Array[][]
		 * @param outputs Float32Array[][]
		 */
		process(inputs, outputs, parameters) {
			const input = inputs[0];
			const output = outputs[0];
			// get the parameter values
			const channelCount = Math.max(input && input.length || 0, output.length);
			for (let sample = 0; sample < this.blockSize; sample++) {
				this.updateParams(parameters, sample);
				for (let channel = 0; channel < channelCount; channel++) {
					const inputSample = input && input.length ? input[channel][sample] : 0;
					output[channel][sample] = this.generate(inputSample, channel, this.params);
				}
			}
			return !this.disposed;
		}
	};
`;
addToWorklet(singleIOProcess);

const delayLine = /* javascript */ `
	/**
	 * A multichannel buffer for use within an AudioWorkletProcessor as a delay line
	 */
	class DelayLine {
		
		constructor(size, channels) {
			this.buffer = [];
			this.writeHead = []
			this.size = size;

			// create the empty channels
			for (let i = 0; i < channels; i++) {
				this.buffer[i] = new Float32Array(this.size);
				this.writeHead[i] = 0;
			}
		}

		/**
		 * Push a value onto the end
		 * @param channel number
		 * @param value number
		 */
		push(channel, value) {
			this.writeHead[channel] += 1;
			if (this.writeHead[channel] > this.size) {
				this.writeHead[channel] = 0;
			}
			this.buffer[channel][this.writeHead[channel]] = value;
		}

		/**
		 * Get the recorded value of the channel given the delay
		 * @param channel number
		 * @param delay number delay samples
		 */
		get(channel, delay) {
			let readHead = this.writeHead[channel] - Math.floor(delay);
			if (readHead < 0) {
				readHead += this.size;
			}
			return this.buffer[channel][readHead];
		}
	}
`;
addToWorklet(delayLine);

const workletName = "feedback-comb-filter";
const feedbackCombFilter = /* javascript */ `
	class FeedbackCombFilterWorklet extends SingleIOProcessor {

		constructor(options) {
			super(options);
			this.delayLine = new DelayLine(this.sampleRate, options.channelCount || 2);
		}

		static get parameterDescriptors() {
			return [{
				name: "delayTime",
				defaultValue: 0.1,
				minValue: 0,
				maxValue: 1,
				automationRate: "k-rate"
			}, {
				name: "feedback",
				defaultValue: 0.5,
				minValue: 0,
				maxValue: 0.9999,
				automationRate: "k-rate"
			}];
		}

		generate(input, channel, parameters) {
			const delayedSample = this.delayLine.get(channel, parameters.delayTime * this.sampleRate);
			this.delayLine.push(channel, input + delayedSample * parameters.feedback);
			return delayedSample;
		}
	}
`;
registerProcessor(workletName, feedbackCombFilter);

/**
 * Comb filters are basic building blocks for physical modeling. Read more
 * about comb filters on [CCRMA's website](https://ccrma.stanford.edu/~jos/pasp/Feedback_Comb_Filters.html).
 *
 * This comb filter is implemented with the AudioWorkletNode which allows it to have feedback delays less than the
 * Web Audio processing block of 128 samples. There is a polyfill for browsers that don't yet support the
 * AudioWorkletNode, but it will add some latency and have slower performance than the AudioWorkletNode.
 * @category Component
 */
class FeedbackCombFilter extends ToneAudioWorklet {
    constructor() {
        super(optionsFromArguments(FeedbackCombFilter.getDefaults(), arguments, ["delayTime", "resonance"]));
        this.name = "FeedbackCombFilter";
        const options = optionsFromArguments(FeedbackCombFilter.getDefaults(), arguments, ["delayTime", "resonance"]);
        this.input = new Gain({ context: this.context });
        this.output = new Gain({ context: this.context });
        this.delayTime = new Param({
            context: this.context,
            value: options.delayTime,
            units: "time",
            minValue: 0,
            maxValue: 1,
            param: this._dummyParam,
            swappable: true,
        });
        this.resonance = new Param({
            context: this.context,
            value: options.resonance,
            units: "normalRange",
            param: this._dummyParam,
            swappable: true,
        });
        readOnly(this, ["resonance", "delayTime"]);
    }
    _audioWorkletName() {
        return workletName;
    }
    /**
     * The default parameters
     */
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            delayTime: 0.1,
            resonance: 0.5,
        });
    }
    onReady(node) {
        connectSeries(this.input, node, this.output);
        const delayTime = node.parameters.get("delayTime");
        this.delayTime.setParam(delayTime);
        const feedback = node.parameters.get("feedback");
        this.resonance.setParam(feedback);
    }
    dispose() {
        super.dispose();
        this.input.dispose();
        this.output.dispose();
        this.delayTime.dispose();
        this.resonance.dispose();
        return this;
    }
}

/**
 * A one pole filter with 6db-per-octave rolloff. Either "highpass" or "lowpass".
 * Note that changing the type or frequency may result in a discontinuity which
 * can sound like a click or pop.
 * References:
 * * http://www.earlevel.com/main/2012/12/15/a-one-pole-filter/
 * * http://www.dspguide.com/ch19/2.htm
 * * https://github.com/vitaliy-bobrov/js-rocks/blob/master/src/app/audio/effects/one-pole-filters.ts
 * @category Component
 */
class OnePoleFilter extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(OnePoleFilter.getDefaults(), arguments, ["frequency", "type"]));
        this.name = "OnePoleFilter";
        const options = optionsFromArguments(OnePoleFilter.getDefaults(), arguments, ["frequency", "type"]);
        this._frequency = options.frequency;
        this._type = options.type;
        this.input = new Gain({ context: this.context });
        this.output = new Gain({ context: this.context });
        this._createFilter();
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            frequency: 880,
            type: "lowpass"
        });
    }
    /**
     * Create a filter and dispose the old one
     */
    _createFilter() {
        const oldFilter = this._filter;
        const freq = this.toFrequency(this._frequency);
        const t = 1 / (2 * Math.PI * freq);
        if (this._type === "lowpass") {
            const a0 = 1 / (t * this.context.sampleRate);
            const b1 = a0 - 1;
            this._filter = this.context.createIIRFilter([a0, 0], [1, b1]);
        }
        else {
            const b1 = 1 / (t * this.context.sampleRate) - 1;
            this._filter = this.context.createIIRFilter([1, -1], [1, b1]);
        }
        this.input.chain(this._filter, this.output);
        if (oldFilter) {
            // dispose it on the next block
            this.context.setTimeout(() => {
                if (!this.disposed) {
                    this.input.disconnect(oldFilter);
                    oldFilter.disconnect();
                }
            }, this.blockTime);
        }
    }
    /**
     * The frequency value.
     */
    get frequency() {
        return this._frequency;
    }
    set frequency(fq) {
        this._frequency = fq;
        this._createFilter();
    }
    /**
     * The OnePole Filter type, either "highpass" or "lowpass"
     */
    get type() {
        return this._type;
    }
    set type(t) {
        this._type = t;
        this._createFilter();
    }
    /**
     * Get the frequency response curve. This curve represents how the filter
     * responses to frequencies between 20hz-20khz.
     * @param  len The number of values to return
     * @return The frequency response curve between 20-20kHz
     */
    getFrequencyResponse(len = 128) {
        const freqValues = new Float32Array(len);
        for (let i = 0; i < len; i++) {
            const norm = Math.pow(i / len, 2);
            const freq = norm * (20000 - 20) + 20;
            freqValues[i] = freq;
        }
        const magValues = new Float32Array(len);
        const phaseValues = new Float32Array(len);
        this._filter.getFrequencyResponse(freqValues, magValues, phaseValues);
        return magValues;
    }
    dispose() {
        super.dispose();
        this.input.dispose();
        this.output.dispose();
        this._filter.disconnect();
        return this;
    }
}

/**
 * A lowpass feedback comb filter. It is similar to
 * [[FeedbackCombFilter]], but includes a lowpass filter.
 * @category Component
 */
class LowpassCombFilter extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(LowpassCombFilter.getDefaults(), arguments, ["delayTime", "resonance", "dampening"]));
        this.name = "LowpassCombFilter";
        const options = optionsFromArguments(LowpassCombFilter.getDefaults(), arguments, ["delayTime", "resonance", "dampening"]);
        this._combFilter = this.output = new FeedbackCombFilter({
            context: this.context,
            delayTime: options.delayTime,
            resonance: options.resonance,
        });
        this.delayTime = this._combFilter.delayTime;
        this.resonance = this._combFilter.resonance;
        this._lowpass = this.input = new OnePoleFilter({
            context: this.context,
            frequency: options.dampening,
            type: "lowpass",
        });
        // connections
        this._lowpass.connect(this._combFilter);
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            dampening: 3000,
            delayTime: 0.1,
            resonance: 0.5,
        });
    }
    /**
     * The dampening control of the feedback
     */
    get dampening() {
        return this._lowpass.frequency;
    }
    set dampening(fq) {
        this._lowpass.frequency = fq;
    }
    dispose() {
        super.dispose();
        this._combFilter.dispose();
        this._lowpass.dispose();
        return this;
    }
}

/**
 * Karplus-String string synthesis.
 * @example
 * const plucky = new Tone.PluckSynth().toDestination();
 * plucky.triggerAttack("C4", "+0.5");
 * plucky.triggerAttack("C3", "+1");
 * plucky.triggerAttack("C2", "+1.5");
 * plucky.triggerAttack("C1", "+2");
 * @category Instrument
 */
class PluckSynth extends Instrument {
    constructor() {
        super(optionsFromArguments(PluckSynth.getDefaults(), arguments));
        this.name = "PluckSynth";
        const options = optionsFromArguments(PluckSynth.getDefaults(), arguments);
        this._noise = new Noise({
            context: this.context,
            type: "pink"
        });
        this.attackNoise = options.attackNoise;
        this._lfcf = new LowpassCombFilter({
            context: this.context,
            dampening: options.dampening,
            resonance: options.resonance,
        });
        this.resonance = options.resonance;
        this.release = options.release;
        this._noise.connect(this._lfcf);
        this._lfcf.connect(this.output);
    }
    static getDefaults() {
        return deepMerge(Instrument.getDefaults(), {
            attackNoise: 1,
            dampening: 4000,
            resonance: 0.7,
            release: 1,
        });
    }
    /**
     * The dampening control. i.e. the lowpass filter frequency of the comb filter
     * @min 0
     * @max 7000
     */
    get dampening() {
        return this._lfcf.dampening;
    }
    set dampening(fq) {
        this._lfcf.dampening = fq;
    }
    triggerAttack(note, time) {
        const freq = this.toFrequency(note);
        time = this.toSeconds(time);
        const delayAmount = 1 / freq;
        this._lfcf.delayTime.setValueAtTime(delayAmount, time);
        this._noise.start(time);
        this._noise.stop(time + delayAmount * this.attackNoise);
        this._lfcf.resonance.cancelScheduledValues(time);
        this._lfcf.resonance.setValueAtTime(this.resonance, time);
        return this;
    }
    /**
     * Ramp down the [[resonance]] to 0 over the duration of the release time.
     */
    triggerRelease(time) {
        this._lfcf.resonance.linearRampTo(0, this.release, time);
        return this;
    }
    dispose() {
        super.dispose();
        this._noise.dispose();
        this._lfcf.dispose();
        return this;
    }
}

/**
 * PolySynth handles voice creation and allocation for any
 * instruments passed in as the second paramter. PolySynth is
 * not a synthesizer by itself, it merely manages voices of
 * one of the other types of synths, allowing any of the
 * monophonic synthesizers to be polyphonic.
 *
 * @example
 * const synth = new Tone.PolySynth().toDestination();
 * // set the attributes across all the voices using 'set'
 * synth.set({ detune: -1200 });
 * // play a chord
 * synth.triggerAttackRelease(["C4", "E4", "A4"], 1);
 * @category Instrument
 */
class PolySynth extends Instrument {
    constructor() {
        super(optionsFromArguments(PolySynth.getDefaults(), arguments, ["voice", "options"]));
        this.name = "PolySynth";
        /**
         * The voices which are not currently in use
         */
        this._availableVoices = [];
        /**
         * The currently active voices
         */
        this._activeVoices = [];
        /**
         * All of the allocated voices for this synth.
         */
        this._voices = [];
        /**
         * The GC timeout. Held so that it could be cancelled when the node is disposed.
         */
        this._gcTimeout = -1;
        /**
         * A moving average of the number of active voices
         */
        this._averageActiveVoices = 0;
        const options = optionsFromArguments(PolySynth.getDefaults(), arguments, ["voice", "options"]);
        // check against the old API (pre 14.3.0)
        assert(!isNumber(options.voice), "DEPRECATED: The polyphony count is no longer the first argument.");
        const defaults = options.voice.getDefaults();
        this.options = Object.assign(defaults, options.options);
        this.voice = options.voice;
        this.maxPolyphony = options.maxPolyphony;
        // create the first voice
        this._dummyVoice = this._getNextAvailableVoice();
        // remove it from the voices list
        const index = this._voices.indexOf(this._dummyVoice);
        this._voices.splice(index, 1);
        // kick off the GC interval
        this._gcTimeout = this.context.setInterval(this._collectGarbage.bind(this), 1);
    }
    static getDefaults() {
        return Object.assign(Instrument.getDefaults(), {
            maxPolyphony: 32,
            options: {},
            voice: Synth,
        });
    }
    /**
     * The number of active voices.
     */
    get activeVoices() {
        return this._activeVoices.length;
    }
    /**
     * Invoked when the source is done making sound, so that it can be
     * readded to the pool of available voices
     */
    _makeVoiceAvailable(voice) {
        this._availableVoices.push(voice);
        // remove the midi note from 'active voices'
        const activeVoiceIndex = this._activeVoices.findIndex((e) => e.voice === voice);
        this._activeVoices.splice(activeVoiceIndex, 1);
    }
    /**
     * Get an available voice from the pool of available voices.
     * If one is not available and the maxPolyphony limit is reached,
     * steal a voice, otherwise return null.
     */
    _getNextAvailableVoice() {
        // if there are available voices, return the first one
        if (this._availableVoices.length) {
            return this._availableVoices.shift();
        }
        else if (this._voices.length < this.maxPolyphony) {
            // otherwise if there is still more maxPolyphony, make a new voice
            const voice = new this.voice(Object.assign(this.options, {
                context: this.context,
                onsilence: this._makeVoiceAvailable.bind(this),
            }));
            voice.connect(this.output);
            this._voices.push(voice);
            return voice;
        }
        else {
            warn("Max polyphony exceeded. Note dropped.");
        }
    }
    /**
     * Occasionally check if there are any allocated voices which can be cleaned up.
     */
    _collectGarbage() {
        this._averageActiveVoices = Math.max(this._averageActiveVoices * 0.95, this.activeVoices);
        if (this._availableVoices.length && this._voices.length > Math.ceil(this._averageActiveVoices + 1)) {
            // take off an available note
            const firstAvail = this._availableVoices.shift();
            const index = this._voices.indexOf(firstAvail);
            this._voices.splice(index, 1);
            if (!this.context.isOffline) {
                firstAvail.dispose();
            }
        }
    }
    /**
     * Internal method which triggers the attack
     */
    _triggerAttack(notes, time, velocity) {
        notes.forEach(note => {
            const midiNote = new MidiClass(this.context, note).toMidi();
            const voice = this._getNextAvailableVoice();
            if (voice) {
                voice.triggerAttack(note, time, velocity);
                this._activeVoices.push({
                    midi: midiNote, voice, released: false,
                });
                this.log("triggerAttack", note, time);
            }
        });
    }
    /**
     * Internal method which triggers the release
     */
    _triggerRelease(notes, time) {
        notes.forEach(note => {
            const midiNote = new MidiClass(this.context, note).toMidi();
            const event = this._activeVoices.find(({ midi, released }) => midi === midiNote && !released);
            if (event) {
                // trigger release on that note
                event.voice.triggerRelease(time);
                // mark it as released
                event.released = true;
                this.log("triggerRelease", note, time);
            }
        });
    }
    /**
     * Schedule the attack/release events. If the time is in the future, then it should set a timeout
     * to wait for just-in-time scheduling
     */
    _scheduleEvent(type, notes, time, velocity) {
        assert(!this.disposed, "Synth was already disposed");
        // if the notes are greater than this amount of time in the future, they should be scheduled with setTimeout
        if (time <= this.now()) {
            // do it immediately
            if (type === "attack") {
                this._triggerAttack(notes, time, velocity);
            }
            else {
                this._triggerRelease(notes, time);
            }
        }
        else {
            // schedule it to start in the future
            this.context.setTimeout(() => {
                this._scheduleEvent(type, notes, time, velocity);
            }, time - this.now());
        }
    }
    /**
     * Trigger the attack portion of the note
     * @param  notes The notes to play. Accepts a single Frequency or an array of frequencies.
     * @param  time  The start time of the note.
     * @param velocity The velocity of the note.
     * @example
     * const synth = new Tone.PolySynth(Tone.FMSynth).toDestination();
     * // trigger a chord immediately with a velocity of 0.2
     * synth.triggerAttack(["Ab3", "C4", "F5"], Tone.now(), 0.2);
     */
    triggerAttack(notes, time, velocity) {
        if (!Array.isArray(notes)) {
            notes = [notes];
        }
        const computedTime = this.toSeconds(time);
        this._scheduleEvent("attack", notes, computedTime, velocity);
        return this;
    }
    /**
     * Trigger the release of the note. Unlike monophonic instruments,
     * a note (or array of notes) needs to be passed in as the first argument.
     * @param  notes The notes to play. Accepts a single Frequency or an array of frequencies.
     * @param  time  When the release will be triggered.
     * @example
     * @example
     * const poly = new Tone.PolySynth(Tone.AMSynth).toDestination();
     * poly.triggerAttack(["Ab3", "C4", "F5"]);
     * // trigger the release of the given notes.
     * poly.triggerRelease(["Ab3", "C4"], "+1");
     * poly.triggerRelease("F5", "+3");
     */
    triggerRelease(notes, time) {
        if (!Array.isArray(notes)) {
            notes = [notes];
        }
        const computedTime = this.toSeconds(time);
        this._scheduleEvent("release", notes, computedTime);
        return this;
    }
    /**
     * Trigger the attack and release after the specified duration
     * @param  notes The notes to play. Accepts a single  Frequency or an array of frequencies.
     * @param  duration the duration of the note
     * @param  time  if no time is given, defaults to now
     * @param  velocity the velocity of the attack (0-1)
     * @example
     * const poly = new Tone.PolySynth(Tone.AMSynth).toDestination();
     * // can pass in an array of durations as well
     * poly.triggerAttackRelease(["Eb3", "G4", "Bb4", "D5"], [4, 3, 2, 1]);
     */
    triggerAttackRelease(notes, duration, time, velocity) {
        const computedTime = this.toSeconds(time);
        this.triggerAttack(notes, computedTime, velocity);
        if (isArray(duration)) {
            assert(isArray(notes), "If the duration is an array, the notes must also be an array");
            notes = notes;
            for (let i = 0; i < notes.length; i++) {
                const d = duration[Math.min(i, duration.length - 1)];
                const durationSeconds = this.toSeconds(d);
                assert(durationSeconds > 0, "The duration must be greater than 0");
                this.triggerRelease(notes[i], computedTime + durationSeconds);
            }
        }
        else {
            const durationSeconds = this.toSeconds(duration);
            assert(durationSeconds > 0, "The duration must be greater than 0");
            this.triggerRelease(notes, computedTime + durationSeconds);
        }
        return this;
    }
    sync() {
        if (this._syncState()) {
            this._syncMethod("triggerAttack", 1);
            this._syncMethod("triggerRelease", 1);
        }
        return this;
    }
    /**
     * Set a member/attribute of the voices
     * @example
     * const poly = new Tone.PolySynth().toDestination();
     * // set all of the voices using an options object for the synth type
     * poly.set({
     * 	envelope: {
     * 		attack: 0.25
     * 	}
     * });
     * poly.triggerAttackRelease("Bb3", 0.2);
     */
    set(options) {
        // remove options which are controlled by the PolySynth
        const sanitizedOptions = omitFromObject(options, ["onsilence", "context"]);
        // store all of the options
        this.options = deepMerge(this.options, sanitizedOptions);
        this._voices.forEach(voice => voice.set(sanitizedOptions));
        this._dummyVoice.set(sanitizedOptions);
        return this;
    }
    get() {
        return this._dummyVoice.get();
    }
    /**
     * Trigger the release portion of all the currently active voices immediately.
     * Useful for silencing the synth.
     */
    releaseAll(time) {
        const computedTime = this.toSeconds(time);
        this._activeVoices.forEach(({ voice }) => {
            voice.triggerRelease(computedTime);
        });
        return this;
    }
    dispose() {
        super.dispose();
        this._dummyVoice.dispose();
        this._voices.forEach(v => v.dispose());
        this._activeVoices = [];
        this._availableVoices = [];
        this.context.clearInterval(this._gcTimeout);
        return this;
    }
}

/**
 * Pass in an object which maps the note's pitch or midi value to the url,
 * then you can trigger the attack and release of that note like other instruments.
 * By automatically repitching the samples, it is possible to play pitches which
 * were not explicitly included which can save loading time.
 *
 * For sample or buffer playback where repitching is not necessary,
 * use [[Player]].
 * @example
 * const sampler = new Tone.Sampler({
 * 	urls: {
 * 		A1: "A1.mp3",
 * 		A2: "A2.mp3",
 * 	},
 * 	baseUrl: "https://tonejs.github.io/audio/casio/",
 * 	onload: () => {
 * 		sampler.triggerAttackRelease(["C1", "E1", "G1", "B1"], 0.5);
 * 	}
 * }).toDestination();
 * @category Instrument
 */
class Sampler extends Instrument {
    constructor() {
        super(optionsFromArguments(Sampler.getDefaults(), arguments, ["urls", "onload", "baseUrl"], "urls"));
        this.name = "Sampler";
        /**
         * The object of all currently playing BufferSources
         */
        this._activeSources = new Map();
        const options = optionsFromArguments(Sampler.getDefaults(), arguments, ["urls", "onload", "baseUrl"], "urls");
        const urlMap = {};
        Object.keys(options.urls).forEach((note) => {
            const noteNumber = parseInt(note, 10);
            assert(isNote(note)
                || (isNumber(noteNumber) && isFinite(noteNumber)), `url key is neither a note or midi pitch: ${note}`);
            if (isNote(note)) {
                // convert the note name to MIDI
                const mid = new FrequencyClass(this.context, note).toMidi();
                urlMap[mid] = options.urls[note];
            }
            else if (isNumber(noteNumber) && isFinite(noteNumber)) {
                // otherwise if it's numbers assume it's midi
                urlMap[noteNumber] = options.urls[noteNumber];
            }
        });
        this._buffers = new ToneAudioBuffers({
            urls: urlMap,
            onload: options.onload,
            baseUrl: options.baseUrl,
            onerror: options.onerror,
        });
        this.attack = options.attack;
        this.release = options.release;
        this.curve = options.curve;
        // invoke the callback if it's already loaded
        if (this._buffers.loaded) {
            // invoke onload deferred
            Promise.resolve().then(options.onload);
        }
    }
    static getDefaults() {
        return Object.assign(Instrument.getDefaults(), {
            attack: 0,
            baseUrl: "",
            curve: "exponential",
            onload: noOp,
            onerror: noOp,
            release: 0.1,
            urls: {},
        });
    }
    /**
     * Returns the difference in steps between the given midi note at the closets sample.
     */
    _findClosest(midi) {
        // searches within 8 octaves of the given midi note
        const MAX_INTERVAL = 96;
        let interval = 0;
        while (interval < MAX_INTERVAL) {
            // check above and below
            if (this._buffers.has(midi + interval)) {
                return -interval;
            }
            else if (this._buffers.has(midi - interval)) {
                return interval;
            }
            interval++;
        }
        throw new Error(`No available buffers for note: ${midi}`);
    }
    /**
     * @param  notes	The note to play, or an array of notes.
     * @param  time     When to play the note
     * @param  velocity The velocity to play the sample back.
     */
    triggerAttack(notes, time, velocity = 1) {
        this.log("triggerAttack", notes, time, velocity);
        if (!Array.isArray(notes)) {
            notes = [notes];
        }
        notes.forEach(note => {
            const midiFloat = ftomf(new FrequencyClass(this.context, note).toFrequency());
            const midi = Math.round(midiFloat);
            const remainder = midiFloat - midi;
            // find the closest note pitch
            const difference = this._findClosest(midi);
            const closestNote = midi - difference;
            const buffer = this._buffers.get(closestNote);
            const playbackRate = intervalToFrequencyRatio(difference + remainder);
            // play that note
            const source = new ToneBufferSource({
                url: buffer,
                context: this.context,
                curve: this.curve,
                fadeIn: this.attack,
                fadeOut: this.release,
                playbackRate,
            }).connect(this.output);
            source.start(time, 0, buffer.duration / playbackRate, velocity);
            // add it to the active sources
            if (!isArray(this._activeSources.get(midi))) {
                this._activeSources.set(midi, []);
            }
            this._activeSources.get(midi).push(source);
            // remove it when it's done
            source.onended = () => {
                if (this._activeSources && this._activeSources.has(midi)) {
                    const sources = this._activeSources.get(midi);
                    const index = sources.indexOf(source);
                    if (index !== -1) {
                        sources.splice(index, 1);
                    }
                }
            };
        });
        return this;
    }
    /**
     * @param  notes	The note to release, or an array of notes.
     * @param  time     	When to release the note.
     */
    triggerRelease(notes, time) {
        this.log("triggerRelease", notes, time);
        if (!Array.isArray(notes)) {
            notes = [notes];
        }
        notes.forEach(note => {
            const midi = new FrequencyClass(this.context, note).toMidi();
            // find the note
            if (this._activeSources.has(midi) && this._activeSources.get(midi).length) {
                const sources = this._activeSources.get(midi);
                time = this.toSeconds(time);
                sources.forEach(source => {
                    source.stop(time);
                });
                this._activeSources.set(midi, []);
            }
        });
        return this;
    }
    /**
     * Release all currently active notes.
     * @param  time     	When to release the notes.
     */
    releaseAll(time) {
        const computedTime = this.toSeconds(time);
        this._activeSources.forEach(sources => {
            while (sources.length) {
                const source = sources.shift();
                source.stop(computedTime);
            }
        });
        return this;
    }
    sync() {
        if (this._syncState()) {
            this._syncMethod("triggerAttack", 1);
            this._syncMethod("triggerRelease", 1);
        }
        return this;
    }
    /**
     * Invoke the attack phase, then after the duration, invoke the release.
     * @param  notes	The note to play and release, or an array of notes.
     * @param  duration The time the note should be held
     * @param  time     When to start the attack
     * @param  velocity The velocity of the attack
     */
    triggerAttackRelease(notes, duration, time, velocity = 1) {
        const computedTime = this.toSeconds(time);
        this.triggerAttack(notes, computedTime, velocity);
        if (isArray(duration)) {
            assert(isArray(notes), "notes must be an array when duration is array");
            notes.forEach((note, index) => {
                const d = duration[Math.min(index, duration.length - 1)];
                this.triggerRelease(note, computedTime + this.toSeconds(d));
            });
        }
        else {
            this.triggerRelease(notes, computedTime + this.toSeconds(duration));
        }
        return this;
    }
    /**
     * Add a note to the sampler.
     * @param  note      The buffer's pitch.
     * @param  url  Either the url of the buffer, or a buffer which will be added with the given name.
     * @param  callback  The callback to invoke when the url is loaded.
     */
    add(note, url, callback) {
        assert(isNote(note) || isFinite(note), `note must be a pitch or midi: ${note}`);
        if (isNote(note)) {
            // convert the note name to MIDI
            const mid = new FrequencyClass(this.context, note).toMidi();
            this._buffers.add(mid, url, callback);
        }
        else {
            // otherwise if it's numbers assume it's midi
            this._buffers.add(note, url, callback);
        }
        return this;
    }
    /**
     * If the buffers are loaded or not
     */
    get loaded() {
        return this._buffers.loaded;
    }
    /**
     * Clean up
     */
    dispose() {
        super.dispose();
        this._buffers.dispose();
        this._activeSources.forEach(sources => {
            sources.forEach(source => source.dispose());
        });
        this._activeSources.clear();
        return this;
    }
}
__decorate([
    timeRange(0)
], Sampler.prototype, "attack", void 0);
__decorate([
    timeRange(0)
], Sampler.prototype, "release", void 0);

/**
 * ToneEvent abstracts away this.context.transport.schedule and provides a schedulable
 * callback for a single or repeatable events along the timeline.
 *
 * @example
 * const synth = new Tone.PolySynth().toDestination();
 * const chordEvent = new Tone.ToneEvent(((time, chord) => {
 * 	// the chord as well as the exact time of the event
 * 	// are passed in as arguments to the callback function
 * 	synth.triggerAttackRelease(chord, 0.5, time);
 * }), ["D4", "E4", "F4"]);
 * // start the chord at the beginning of the transport timeline
 * chordEvent.start();
 * // loop it every measure for 8 measures
 * chordEvent.loop = 8;
 * chordEvent.loopEnd = "1m";
 * @category Event
 */
class ToneEvent extends ToneWithContext {
    constructor() {
        super(optionsFromArguments(ToneEvent.getDefaults(), arguments, ["callback", "value"]));
        this.name = "ToneEvent";
        /**
         * Tracks the scheduled events
         */
        this._state = new StateTimeline("stopped");
        /**
         * A delay time from when the event is scheduled to start
         */
        this._startOffset = 0;
        const options = optionsFromArguments(ToneEvent.getDefaults(), arguments, ["callback", "value"]);
        this._loop = options.loop;
        this.callback = options.callback;
        this.value = options.value;
        this._loopStart = this.toTicks(options.loopStart);
        this._loopEnd = this.toTicks(options.loopEnd);
        this._playbackRate = options.playbackRate;
        this._probability = options.probability;
        this._humanize = options.humanize;
        this.mute = options.mute;
        this._playbackRate = options.playbackRate;
        this._state.increasing = true;
        // schedule the events for the first time
        this._rescheduleEvents();
    }
    static getDefaults() {
        return Object.assign(ToneWithContext.getDefaults(), {
            callback: noOp,
            humanize: false,
            loop: false,
            loopEnd: "1m",
            loopStart: 0,
            mute: false,
            playbackRate: 1,
            probability: 1,
            value: null,
        });
    }
    /**
     * Reschedule all of the events along the timeline
     * with the updated values.
     * @param after Only reschedules events after the given time.
     */
    _rescheduleEvents(after = -1) {
        // if no argument is given, schedules all of the events
        this._state.forEachFrom(after, event => {
            let duration;
            if (event.state === "started") {
                if (event.id !== -1) {
                    this.context.transport.clear(event.id);
                }
                const startTick = event.time + Math.round(this.startOffset / this._playbackRate);
                if (this._loop === true || isNumber(this._loop) && this._loop > 1) {
                    duration = Infinity;
                    if (isNumber(this._loop)) {
                        duration = (this._loop) * this._getLoopDuration();
                    }
                    const nextEvent = this._state.getAfter(startTick);
                    if (nextEvent !== null) {
                        duration = Math.min(duration, nextEvent.time - startTick);
                    }
                    if (duration !== Infinity) {
                        // schedule a stop since it's finite duration
                        this._state.setStateAtTime("stopped", startTick + duration + 1, { id: -1 });
                        duration = new TicksClass(this.context, duration);
                    }
                    const interval = new TicksClass(this.context, this._getLoopDuration());
                    event.id = this.context.transport.scheduleRepeat(this._tick.bind(this), interval, new TicksClass(this.context, startTick), duration);
                }
                else {
                    event.id = this.context.transport.schedule(this._tick.bind(this), new TicksClass(this.context, startTick));
                }
            }
        });
    }
    /**
     * Returns the playback state of the note, either "started" or "stopped".
     */
    get state() {
        return this._state.getValueAtTime(this.context.transport.ticks);
    }
    /**
     * The start from the scheduled start time.
     */
    get startOffset() {
        return this._startOffset;
    }
    set startOffset(offset) {
        this._startOffset = offset;
    }
    /**
     * The probability of the notes being triggered.
     */
    get probability() {
        return this._probability;
    }
    set probability(prob) {
        this._probability = prob;
    }
    /**
     * If set to true, will apply small random variation
     * to the callback time. If the value is given as a time, it will randomize
     * by that amount.
     * @example
     * const event = new Tone.ToneEvent();
     * event.humanize = true;
     */
    get humanize() {
        return this._humanize;
    }
    set humanize(variation) {
        this._humanize = variation;
    }
    /**
     * Start the note at the given time.
     * @param  time  When the event should start.
     */
    start(time) {
        const ticks = this.toTicks(time);
        if (this._state.getValueAtTime(ticks) === "stopped") {
            this._state.add({
                id: -1,
                state: "started",
                time: ticks,
            });
            this._rescheduleEvents(ticks);
        }
        return this;
    }
    /**
     * Stop the Event at the given time.
     * @param  time  When the event should stop.
     */
    stop(time) {
        this.cancel(time);
        const ticks = this.toTicks(time);
        if (this._state.getValueAtTime(ticks) === "started") {
            this._state.setStateAtTime("stopped", ticks, { id: -1 });
            const previousEvent = this._state.getBefore(ticks);
            let reschedulTime = ticks;
            if (previousEvent !== null) {
                reschedulTime = previousEvent.time;
            }
            this._rescheduleEvents(reschedulTime);
        }
        return this;
    }
    /**
     * Cancel all scheduled events greater than or equal to the given time
     * @param  time  The time after which events will be cancel.
     */
    cancel(time) {
        time = defaultArg(time, -Infinity);
        const ticks = this.toTicks(time);
        this._state.forEachFrom(ticks, event => {
            this.context.transport.clear(event.id);
        });
        this._state.cancel(ticks);
        return this;
    }
    /**
     * The callback function invoker. Also
     * checks if the Event is done playing
     * @param  time  The time of the event in seconds
     */
    _tick(time) {
        const ticks = this.context.transport.getTicksAtTime(time);
        if (!this.mute && this._state.getValueAtTime(ticks) === "started") {
            if (this.probability < 1 && Math.random() > this.probability) {
                return;
            }
            if (this.humanize) {
                let variation = 0.02;
                if (!isBoolean(this.humanize)) {
                    variation = this.toSeconds(this.humanize);
                }
                time += (Math.random() * 2 - 1) * variation;
            }
            this.callback(time, this.value);
        }
    }
    /**
     * Get the duration of the loop.
     */
    _getLoopDuration() {
        return Math.round((this._loopEnd - this._loopStart) / this._playbackRate);
    }
    /**
     * If the note should loop or not
     * between ToneEvent.loopStart and
     * ToneEvent.loopEnd. If set to true,
     * the event will loop indefinitely,
     * if set to a number greater than 1
     * it will play a specific number of
     * times, if set to false, 0 or 1, the
     * part will only play once.
     */
    get loop() {
        return this._loop;
    }
    set loop(loop) {
        this._loop = loop;
        this._rescheduleEvents();
    }
    /**
     * The playback rate of the note. Defaults to 1.
     * @example
     * const note = new Tone.ToneEvent();
     * note.loop = true;
     * // repeat the note twice as fast
     * note.playbackRate = 2;
     */
    get playbackRate() {
        return this._playbackRate;
    }
    set playbackRate(rate) {
        this._playbackRate = rate;
        this._rescheduleEvents();
    }
    /**
     * The loopEnd point is the time the event will loop
     * if ToneEvent.loop is true.
     */
    get loopEnd() {
        return new TicksClass(this.context, this._loopEnd).toSeconds();
    }
    set loopEnd(loopEnd) {
        this._loopEnd = this.toTicks(loopEnd);
        if (this._loop) {
            this._rescheduleEvents();
        }
    }
    /**
     * The time when the loop should start.
     */
    get loopStart() {
        return new TicksClass(this.context, this._loopStart).toSeconds();
    }
    set loopStart(loopStart) {
        this._loopStart = this.toTicks(loopStart);
        if (this._loop) {
            this._rescheduleEvents();
        }
    }
    /**
     * The current progress of the loop interval.
     * Returns 0 if the event is not started yet or
     * it is not set to loop.
     */
    get progress() {
        if (this._loop) {
            const ticks = this.context.transport.ticks;
            const lastEvent = this._state.get(ticks);
            if (lastEvent !== null && lastEvent.state === "started") {
                const loopDuration = this._getLoopDuration();
                const progress = (ticks - lastEvent.time) % loopDuration;
                return progress / loopDuration;
            }
            else {
                return 0;
            }
        }
        else {
            return 0;
        }
    }
    dispose() {
        super.dispose();
        this.cancel();
        this._state.dispose();
        return this;
    }
}

/**
 * Loop creates a looped callback at the
 * specified interval. The callback can be
 * started, stopped and scheduled along
 * the Transport's timeline.
 * @example
 * const loop = new Tone.Loop((time) => {
 * 	// triggered every eighth note.
 * 	console.log(time);
 * }, "8n").start(0);
 * Tone.Transport.start();
 * @category Event
 */
class Loop extends ToneWithContext {
    constructor() {
        super(optionsFromArguments(Loop.getDefaults(), arguments, ["callback", "interval"]));
        this.name = "Loop";
        const options = optionsFromArguments(Loop.getDefaults(), arguments, ["callback", "interval"]);
        this._event = new ToneEvent({
            context: this.context,
            callback: this._tick.bind(this),
            loop: true,
            loopEnd: options.interval,
            playbackRate: options.playbackRate,
            probability: options.probability
        });
        this.callback = options.callback;
        // set the iterations
        this.iterations = options.iterations;
    }
    static getDefaults() {
        return Object.assign(ToneWithContext.getDefaults(), {
            interval: "4n",
            callback: noOp,
            playbackRate: 1,
            iterations: Infinity,
            probability: 1,
            mute: false,
            humanize: false
        });
    }
    /**
     * Start the loop at the specified time along the Transport's timeline.
     * @param  time  When to start the Loop.
     */
    start(time) {
        this._event.start(time);
        return this;
    }
    /**
     * Stop the loop at the given time.
     * @param  time  When to stop the Loop.
     */
    stop(time) {
        this._event.stop(time);
        return this;
    }
    /**
     * Cancel all scheduled events greater than or equal to the given time
     * @param  time  The time after which events will be cancel.
     */
    cancel(time) {
        this._event.cancel(time);
        return this;
    }
    /**
     * Internal function called when the notes should be called
     * @param time  The time the event occurs
     */
    _tick(time) {
        this.callback(time);
    }
    /**
     * The state of the Loop, either started or stopped.
     */
    get state() {
        return this._event.state;
    }
    /**
     * The progress of the loop as a value between 0-1. 0, when the loop is stopped or done iterating.
     */
    get progress() {
        return this._event.progress;
    }
    /**
     * The time between successive callbacks.
     * @example
     * const loop = new Tone.Loop();
     * loop.interval = "8n"; // loop every 8n
     */
    get interval() {
        return this._event.loopEnd;
    }
    set interval(interval) {
        this._event.loopEnd = interval;
    }
    /**
     * The playback rate of the loop. The normal playback rate is 1 (no change).
     * A `playbackRate` of 2 would be twice as fast.
     */
    get playbackRate() {
        return this._event.playbackRate;
    }
    set playbackRate(rate) {
        this._event.playbackRate = rate;
    }
    /**
     * Random variation +/-0.01s to the scheduled time.
     * Or give it a time value which it will randomize by.
     */
    get humanize() {
        return this._event.humanize;
    }
    set humanize(variation) {
        this._event.humanize = variation;
    }
    /**
     * The probably of the callback being invoked.
     */
    get probability() {
        return this._event.probability;
    }
    set probability(prob) {
        this._event.probability = prob;
    }
    /**
     * Muting the Loop means that no callbacks are invoked.
     */
    get mute() {
        return this._event.mute;
    }
    set mute(mute) {
        this._event.mute = mute;
    }
    /**
     * The number of iterations of the loop. The default value is `Infinity` (loop forever).
     */
    get iterations() {
        if (this._event.loop === true) {
            return Infinity;
        }
        else {
            return this._event.loop;
        }
    }
    set iterations(iters) {
        if (iters === Infinity) {
            this._event.loop = true;
        }
        else {
            this._event.loop = iters;
        }
    }
    dispose() {
        super.dispose();
        this._event.dispose();
        return this;
    }
}

/**
 * Part is a collection ToneEvents which can be started/stopped and looped as a single unit.
 *
 * @example
 * const synth = new Tone.Synth().toDestination();
 * const part = new Tone.Part(((time, note) => {
 * 	// the notes given as the second element in the array
 * 	// will be passed in as the second argument
 * 	synth.triggerAttackRelease(note, "8n", time);
 * }), [[0, "C2"], ["0:2", "C3"], ["0:3:2", "G2"]]);
 * Tone.Transport.start();
 * @example
 * const synth = new Tone.Synth().toDestination();
 * // use an array of objects as long as the object has a "time" attribute
 * const part = new Tone.Part(((time, value) => {
 * 	// the value is an object which contains both the note and the velocity
 * 	synth.triggerAttackRelease(value.note, "8n", time, value.velocity);
 * }), [{ time: 0, note: "C3", velocity: 0.9 },
 * 	{ time: "0:2", note: "C4", velocity: 0.5 }
 * ]).start(0);
 * Tone.Transport.start();
 * @category Event
 */
class Part extends ToneEvent {
    constructor() {
        super(optionsFromArguments(Part.getDefaults(), arguments, ["callback", "events"]));
        this.name = "Part";
        /**
         * Tracks the scheduled events
         */
        this._state = new StateTimeline("stopped");
        /**
         * The events that belong to this part
         */
        this._events = new Set();
        const options = optionsFromArguments(Part.getDefaults(), arguments, ["callback", "events"]);
        // make sure things are assigned in the right order
        this._state.increasing = true;
        // add the events
        options.events.forEach(event => {
            if (isArray(event)) {
                this.add(event[0], event[1]);
            }
            else {
                this.add(event);
            }
        });
    }
    static getDefaults() {
        return Object.assign(ToneEvent.getDefaults(), {
            events: [],
        });
    }
    /**
     * Start the part at the given time.
     * @param  time    When to start the part.
     * @param  offset  The offset from the start of the part to begin playing at.
     */
    start(time, offset) {
        const ticks = this.toTicks(time);
        if (this._state.getValueAtTime(ticks) !== "started") {
            offset = defaultArg(offset, this._loop ? this._loopStart : 0);
            if (this._loop) {
                offset = defaultArg(offset, this._loopStart);
            }
            else {
                offset = defaultArg(offset, 0);
            }
            const computedOffset = this.toTicks(offset);
            this._state.add({
                id: -1,
                offset: computedOffset,
                state: "started",
                time: ticks,
            });
            this._forEach(event => {
                this._startNote(event, ticks, computedOffset);
            });
        }
        return this;
    }
    /**
     * Start the event in the given event at the correct time given
     * the ticks and offset and looping.
     * @param  event
     * @param  ticks
     * @param  offset
     */
    _startNote(event, ticks, offset) {
        ticks -= offset;
        if (this._loop) {
            if (event.startOffset >= this._loopStart && event.startOffset < this._loopEnd) {
                if (event.startOffset < offset) {
                    // start it on the next loop
                    ticks += this._getLoopDuration();
                }
                event.start(new TicksClass(this.context, ticks));
            }
            else if (event.startOffset < this._loopStart && event.startOffset >= offset) {
                event.loop = false;
                event.start(new TicksClass(this.context, ticks));
            }
        }
        else if (event.startOffset >= offset) {
            event.start(new TicksClass(this.context, ticks));
        }
    }
    get startOffset() {
        return this._startOffset;
    }
    set startOffset(offset) {
        this._startOffset = offset;
        this._forEach(event => {
            event.startOffset += this._startOffset;
        });
    }
    /**
     * Stop the part at the given time.
     * @param  time  When to stop the part.
     */
    stop(time) {
        const ticks = this.toTicks(time);
        this._state.cancel(ticks);
        this._state.setStateAtTime("stopped", ticks);
        this._forEach(event => {
            event.stop(time);
        });
        return this;
    }
    /**
     * Get/Set an Event's value at the given time.
     * If a value is passed in and no event exists at
     * the given time, one will be created with that value.
     * If two events are at the same time, the first one will
     * be returned.
     * @example
     * const part = new Tone.Part();
     * part.at("1m"); // returns the part at the first measure
     * part.at("2m", "C2"); // set the value at "2m" to C2.
     * // if an event didn't exist at that time, it will be created.
     * @param time The time of the event to get or set.
     * @param value If a value is passed in, the value of the event at the given time will be set to it.
     */
    at(time, value) {
        const timeInTicks = new TransportTimeClass(this.context, time).toTicks();
        const tickTime = new TicksClass(this.context, 1).toSeconds();
        const iterator = this._events.values();
        let result = iterator.next();
        while (!result.done) {
            const event = result.value;
            if (Math.abs(timeInTicks - event.startOffset) < tickTime) {
                if (isDefined(value)) {
                    event.value = value;
                }
                return event;
            }
            result = iterator.next();
        }
        // if there was no event at that time, create one
        if (isDefined(value)) {
            this.add(time, value);
            // return the new event
            return this.at(time);
        }
        else {
            return null;
        }
    }
    add(time, value) {
        // extract the parameters
        if (time instanceof Object && Reflect.has(time, "time")) {
            value = time;
            time = value.time;
        }
        const ticks = this.toTicks(time);
        let event;
        if (value instanceof ToneEvent) {
            event = value;
            event.callback = this._tick.bind(this);
        }
        else {
            event = new ToneEvent({
                callback: this._tick.bind(this),
                context: this.context,
                value,
            });
        }
        // the start offset
        event.startOffset = ticks;
        // initialize the values
        event.set({
            humanize: this.humanize,
            loop: this.loop,
            loopEnd: this.loopEnd,
            loopStart: this.loopStart,
            playbackRate: this.playbackRate,
            probability: this.probability,
        });
        this._events.add(event);
        // start the note if it should be played right now
        this._restartEvent(event);
        return this;
    }
    /**
     * Restart the given event
     */
    _restartEvent(event) {
        this._state.forEach((stateEvent) => {
            if (stateEvent.state === "started") {
                this._startNote(event, stateEvent.time, stateEvent.offset);
            }
            else {
                // stop the note
                event.stop(new TicksClass(this.context, stateEvent.time));
            }
        });
    }
    remove(time, value) {
        // extract the parameters
        if (isObject(time) && time.hasOwnProperty("time")) {
            value = time;
            time = value.time;
        }
        time = this.toTicks(time);
        this._events.forEach(event => {
            if (event.startOffset === time) {
                if (isUndef(value) || (isDefined(value) && event.value === value)) {
                    this._events.delete(event);
                    event.dispose();
                }
            }
        });
        return this;
    }
    /**
     * Remove all of the notes from the group.
     */
    clear() {
        this._forEach(event => event.dispose());
        this._events.clear();
        return this;
    }
    /**
     * Cancel scheduled state change events: i.e. "start" and "stop".
     * @param after The time after which to cancel the scheduled events.
     */
    cancel(after) {
        this._forEach(event => event.cancel(after));
        this._state.cancel(this.toTicks(after));
        return this;
    }
    /**
     * Iterate over all of the events
     */
    _forEach(callback) {
        if (this._events) {
            this._events.forEach(event => {
                if (event instanceof Part) {
                    event._forEach(callback);
                }
                else {
                    callback(event);
                }
            });
        }
        return this;
    }
    /**
     * Set the attribute of all of the events
     * @param  attr  the attribute to set
     * @param  value      The value to set it to
     */
    _setAll(attr, value) {
        this._forEach(event => {
            event[attr] = value;
        });
    }
    /**
     * Internal tick method
     * @param  time  The time of the event in seconds
     */
    _tick(time, value) {
        if (!this.mute) {
            this.callback(time, value);
        }
    }
    /**
     * Determine if the event should be currently looping
     * given the loop boundries of this Part.
     * @param  event  The event to test
     */
    _testLoopBoundries(event) {
        if (this._loop && (event.startOffset < this._loopStart || event.startOffset >= this._loopEnd)) {
            event.cancel(0);
        }
        else if (event.state === "stopped") {
            // reschedule it if it's stopped
            this._restartEvent(event);
        }
    }
    get probability() {
        return this._probability;
    }
    set probability(prob) {
        this._probability = prob;
        this._setAll("probability", prob);
    }
    get humanize() {
        return this._humanize;
    }
    set humanize(variation) {
        this._humanize = variation;
        this._setAll("humanize", variation);
    }
    /**
     * If the part should loop or not
     * between Part.loopStart and
     * Part.loopEnd. If set to true,
     * the part will loop indefinitely,
     * if set to a number greater than 1
     * it will play a specific number of
     * times, if set to false, 0 or 1, the
     * part will only play once.
     * @example
     * const part = new Tone.Part();
     * // loop the part 8 times
     * part.loop = 8;
     */
    get loop() {
        return this._loop;
    }
    set loop(loop) {
        this._loop = loop;
        this._forEach(event => {
            event.loopStart = this.loopStart;
            event.loopEnd = this.loopEnd;
            event.loop = loop;
            this._testLoopBoundries(event);
        });
    }
    /**
     * The loopEnd point determines when it will
     * loop if Part.loop is true.
     */
    get loopEnd() {
        return new TicksClass(this.context, this._loopEnd).toSeconds();
    }
    set loopEnd(loopEnd) {
        this._loopEnd = this.toTicks(loopEnd);
        if (this._loop) {
            this._forEach(event => {
                event.loopEnd = loopEnd;
                this._testLoopBoundries(event);
            });
        }
    }
    /**
     * The loopStart point determines when it will
     * loop if Part.loop is true.
     */
    get loopStart() {
        return new TicksClass(this.context, this._loopStart).toSeconds();
    }
    set loopStart(loopStart) {
        this._loopStart = this.toTicks(loopStart);
        if (this._loop) {
            this._forEach(event => {
                event.loopStart = this.loopStart;
                this._testLoopBoundries(event);
            });
        }
    }
    /**
     * The playback rate of the part
     */
    get playbackRate() {
        return this._playbackRate;
    }
    set playbackRate(rate) {
        this._playbackRate = rate;
        this._setAll("playbackRate", rate);
    }
    /**
     * The number of scheduled notes in the part.
     */
    get length() {
        return this._events.size;
    }
    dispose() {
        super.dispose();
        this.clear();
        return this;
    }
}

/**
 * Start at the first value and go up to the last
 */
function* upPatternGen(values) {
    let index = 0;
    while (index < values.length) {
        index = clampToArraySize(index, values);
        yield values[index];
        index++;
    }
}
/**
 * Start at the last value and go down to 0
 */
function* downPatternGen(values) {
    let index = values.length - 1;
    while (index >= 0) {
        index = clampToArraySize(index, values);
        yield values[index];
        index--;
    }
}
/**
 * Infinitely yield the generator
 */
function* infiniteGen(values, gen) {
    while (true) {
        yield* gen(values);
    }
}
/**
 * Make sure that the index is in the given range
 */
function clampToArraySize(index, values) {
    return clamp(index, 0, values.length - 1);
}
/**
 * Alternate between two generators
 */
function* alternatingGenerator(values, directionUp) {
    let index = directionUp ? 0 : values.length - 1;
    while (true) {
        index = clampToArraySize(index, values);
        yield values[index];
        if (directionUp) {
            index++;
            if (index >= values.length - 1) {
                directionUp = false;
            }
        }
        else {
            index--;
            if (index <= 0) {
                directionUp = true;
            }
        }
    }
}
/**
 * Starting from the bottom move up 2, down 1
 */
function* jumpUp(values) {
    let index = 0;
    let stepIndex = 0;
    while (index < values.length) {
        index = clampToArraySize(index, values);
        yield values[index];
        stepIndex++;
        index += (stepIndex % 2 ? 2 : -1);
    }
}
/**
 * Starting from the top move down 2, up 1
 */
function* jumpDown(values) {
    let index = values.length - 1;
    let stepIndex = 0;
    while (index >= 0) {
        index = clampToArraySize(index, values);
        yield values[index];
        stepIndex++;
        index += (stepIndex % 2 ? -2 : 1);
    }
}
/**
 * Choose a random index each time
 */
function* randomGen(values) {
    while (true) {
        const randomIndex = Math.floor(Math.random() * values.length);
        yield values[randomIndex];
    }
}
/**
 * Randomly go through all of the values once before choosing a new random order
 */
function* randomOnce(values) {
    // create an array of indices
    const copy = [];
    for (let i = 0; i < values.length; i++) {
        copy.push(i);
    }
    while (copy.length > 0) {
        // random choose an index, and then remove it so it's not chosen again
        const randVal = copy.splice(Math.floor(copy.length * Math.random()), 1);
        const index = clampToArraySize(randVal[0], values);
        yield values[index];
    }
}
/**
 * Randomly choose to walk up or down 1 index in the values array
 */
function* randomWalk(values) {
    // randomly choose a starting index in the values array
    let index = Math.floor(Math.random() * values.length);
    while (true) {
        if (index === 0) {
            index++; // at bottom of array, so force upward step
        }
        else if (index === values.length - 1) {
            index--; // at top of array, so force downward step
        }
        else if (Math.random() < 0.5) { // else choose random downward or upward step
            index--;
        }
        else {
            index++;
        }
        yield values[index];
    }
}
/**
 * PatternGenerator returns a generator which will iterate over the given array
 * of values and yield the items according to the passed in pattern
 * @param values An array of values to iterate over
 * @param pattern The name of the pattern use when iterating over
 * @param index Where to start in the offset of the values array
 */
function* PatternGenerator(values, pattern = "up", index = 0) {
    // safeguards
    assert(values.length > 0, "The array must have more than one value in it");
    switch (pattern) {
        case "up":
            yield* infiniteGen(values, upPatternGen);
        case "down":
            yield* infiniteGen(values, downPatternGen);
        case "upDown":
            yield* alternatingGenerator(values, true);
        case "downUp":
            yield* alternatingGenerator(values, false);
        case "alternateUp":
            yield* infiniteGen(values, jumpUp);
        case "alternateDown":
            yield* infiniteGen(values, jumpDown);
        case "random":
            yield* randomGen(values);
        case "randomOnce":
            yield* infiniteGen(values, randomOnce);
        case "randomWalk":
            yield* randomWalk(values);
    }
}

/**
 * Pattern arpeggiates between the given notes
 * in a number of patterns.
 * @example
 * const pattern = new Tone.Pattern((time, note) => {
 * 	// the order of the notes passed in depends on the pattern
 * }, ["C2", "D4", "E5", "A6"], "upDown");
 * @category Event
 */
class Pattern extends Loop {
    constructor() {
        super(optionsFromArguments(Pattern.getDefaults(), arguments, ["callback", "values", "pattern"]));
        this.name = "Pattern";
        const options = optionsFromArguments(Pattern.getDefaults(), arguments, ["callback", "values", "pattern"]);
        this.callback = options.callback;
        this._values = options.values;
        this._pattern = PatternGenerator(options.values, options.pattern);
        this._type = options.pattern;
    }
    static getDefaults() {
        return Object.assign(Loop.getDefaults(), {
            pattern: "up",
            values: [],
            callback: noOp,
        });
    }
    /**
     * Internal function called when the notes should be called
     */
    _tick(time) {
        const value = this._pattern.next();
        this._value = value.value;
        this.callback(time, this._value);
    }
    /**
     * The array of events.
     */
    get values() {
        return this._values;
    }
    set values(val) {
        this._values = val;
        // reset the pattern
        this.pattern = this._type;
    }
    /**
     * The current value of the pattern.
     */
    get value() {
        return this._value;
    }
    /**
     * The pattern type. See Tone.CtrlPattern for the full list of patterns.
     */
    get pattern() {
        return this._type;
    }
    set pattern(pattern) {
        this._type = pattern;
        this._pattern = PatternGenerator(this._values, this._type);
    }
}

/**
 * A sequence is an alternate notation of a part. Instead
 * of passing in an array of [time, event] pairs, pass
 * in an array of events which will be spaced at the
 * given subdivision. Sub-arrays will subdivide that beat
 * by the number of items are in the array.
 * Sequence notation inspiration from [Tidal](http://yaxu.org/tidal/)
 * @example
 * const synth = new Tone.Synth().toDestination();
 * const seq = new Tone.Sequence((time, note) => {
 * 	synth.triggerAttackRelease(note, 0.1, time);
 * 	// subdivisions are given as subarrays
 * }, ["C4", ["E4", "D4", "E4"], "G4", ["A4", "G4"]]).start(0);
 * Tone.Transport.start();
 * @category Event
 */
class Sequence extends ToneEvent {
    constructor() {
        super(optionsFromArguments(Sequence.getDefaults(), arguments, ["callback", "events", "subdivision"]));
        this.name = "Sequence";
        /**
         * The object responsible for scheduling all of the events
         */
        this._part = new Part({
            callback: this._seqCallback.bind(this),
            context: this.context,
        });
        /**
         * private reference to all of the sequence proxies
         */
        this._events = [];
        /**
         * The proxied array
         */
        this._eventsArray = [];
        const options = optionsFromArguments(Sequence.getDefaults(), arguments, ["callback", "events", "subdivision"]);
        this._subdivision = this.toTicks(options.subdivision);
        this.events = options.events;
        // set all of the values
        this.loop = options.loop;
        this.loopStart = options.loopStart;
        this.loopEnd = options.loopEnd;
        this.playbackRate = options.playbackRate;
        this.probability = options.probability;
        this.humanize = options.humanize;
        this.mute = options.mute;
        this.playbackRate = options.playbackRate;
    }
    static getDefaults() {
        return Object.assign(omitFromObject(ToneEvent.getDefaults(), ["value"]), {
            events: [],
            loop: true,
            loopEnd: 0,
            loopStart: 0,
            subdivision: "8n",
        });
    }
    /**
     * The internal callback for when an event is invoked
     */
    _seqCallback(time, value) {
        if (value !== null) {
            this.callback(time, value);
        }
    }
    /**
     * The sequence
     */
    get events() {
        return this._events;
    }
    set events(s) {
        this.clear();
        this._eventsArray = s;
        this._events = this._createSequence(this._eventsArray);
        this._eventsUpdated();
    }
    /**
     * Start the part at the given time.
     * @param  time    When to start the part.
     * @param  offset  The offset index to start at
     */
    start(time, offset) {
        this._part.start(time, offset ? this._indexTime(offset) : offset);
        return this;
    }
    /**
     * Stop the part at the given time.
     * @param  time  When to stop the part.
     */
    stop(time) {
        this._part.stop(time);
        return this;
    }
    /**
     * The subdivision of the sequence. This can only be
     * set in the constructor. The subdivision is the
     * interval between successive steps.
     */
    get subdivision() {
        return new TicksClass(this.context, this._subdivision).toSeconds();
    }
    /**
     * Create a sequence proxy which can be monitored to create subsequences
     */
    _createSequence(array) {
        return new Proxy(array, {
            get: (target, property) => {
                // property is index in this case
                return target[property];
            },
            set: (target, property, value) => {
                if (isString(property) && isFinite(parseInt(property, 10))) {
                    if (isArray(value)) {
                        target[property] = this._createSequence(value);
                    }
                    else {
                        target[property] = value;
                    }
                }
                else {
                    target[property] = value;
                }
                this._eventsUpdated();
                // return true to accept the changes
                return true;
            },
        });
    }
    /**
     * When the sequence has changed, all of the events need to be recreated
     */
    _eventsUpdated() {
        this._part.clear();
        this._rescheduleSequence(this._eventsArray, this._subdivision, this.startOffset);
        // update the loopEnd
        this.loopEnd = this.loopEnd;
    }
    /**
     * reschedule all of the events that need to be rescheduled
     */
    _rescheduleSequence(sequence, subdivision, startOffset) {
        sequence.forEach((value, index) => {
            const eventOffset = index * (subdivision) + startOffset;
            if (isArray(value)) {
                this._rescheduleSequence(value, subdivision / value.length, eventOffset);
            }
            else {
                const startTime = new TicksClass(this.context, eventOffset, "i").toSeconds();
                this._part.add(startTime, value);
            }
        });
    }
    /**
     * Get the time of the index given the Sequence's subdivision
     * @param  index
     * @return The time of that index
     */
    _indexTime(index) {
        return new TicksClass(this.context, index * (this._subdivision) + this.startOffset).toSeconds();
    }
    /**
     * Clear all of the events
     */
    clear() {
        this._part.clear();
        return this;
    }
    dispose() {
        super.dispose();
        this._part.dispose();
        return this;
    }
    //-------------------------------------
    // PROXY CALLS
    //-------------------------------------
    get loop() {
        return this._part.loop;
    }
    set loop(l) {
        this._part.loop = l;
    }
    /**
     * The index at which the sequence should start looping
     */
    get loopStart() {
        return this._loopStart;
    }
    set loopStart(index) {
        this._loopStart = index;
        this._part.loopStart = this._indexTime(index);
    }
    /**
     * The index at which the sequence should end looping
     */
    get loopEnd() {
        return this._loopEnd;
    }
    set loopEnd(index) {
        this._loopEnd = index;
        if (index === 0) {
            this._part.loopEnd = this._indexTime(this._eventsArray.length);
        }
        else {
            this._part.loopEnd = this._indexTime(index);
        }
    }
    get startOffset() {
        return this._part.startOffset;
    }
    set startOffset(start) {
        this._part.startOffset = start;
    }
    get playbackRate() {
        return this._part.playbackRate;
    }
    set playbackRate(rate) {
        this._part.playbackRate = rate;
    }
    get probability() {
        return this._part.probability;
    }
    set probability(prob) {
        this._part.probability = prob;
    }
    get progress() {
        return this._part.progress;
    }
    get humanize() {
        return this._part.humanize;
    }
    set humanize(variation) {
        this._part.humanize = variation;
    }
    /**
     * The number of scheduled events
     */
    get length() {
        return this._part.length;
    }
}

/**
 * Tone.Crossfade provides equal power fading between two inputs.
 * More on crossfading technique [here](https://en.wikipedia.org/wiki/Fade_(audio_engineering)#Crossfading).
 * ```
 *                                             +---------+
 *                                            +> input a +>--+
 * +-----------+   +---------------------+     |         |   |
 * | 1s signal +>--> stereoPannerNode  L +>----> gain    |   |
 * +-----------+   |                     |     +---------+   |
 *               +-> pan               R +>-+                |   +--------+
 *               | +---------------------+  |                +---> output +>
 *  +------+     |                          |  +---------+   |   +--------+
 *  | fade +>----+                          | +> input b +>--+
 *  +------+                                |  |         |
 *                                          +--> gain    |
 *                                             +---------+
 * ```
 * @example
 * const crossFade = new Tone.CrossFade().toDestination();
 * // connect two inputs Tone.to a/b
 * const inputA = new Tone.Oscillator(440, "square").connect(crossFade.a).start();
 * const inputB = new Tone.Oscillator(440, "sine").connect(crossFade.b).start();
 * // use the fade to control the mix between the two
 * crossFade.fade.value = 0.5;
 * @category Component
 */
class CrossFade extends ToneAudioNode {
    constructor() {
        super(Object.assign(optionsFromArguments(CrossFade.getDefaults(), arguments, ["fade"])));
        this.name = "CrossFade";
        /**
         * The crossfading is done by a StereoPannerNode
         */
        this._panner = this.context.createStereoPanner();
        /**
         * Split the output of the panner node into two values used to control the gains.
         */
        this._split = this.context.createChannelSplitter(2);
        /**
         * Convert the fade value into an audio range value so it can be connected
         * to the panner.pan AudioParam
         */
        this._g2a = new GainToAudio({ context: this.context });
        /**
         * The input which is at full level when fade = 0
         */
        this.a = new Gain({
            context: this.context,
            gain: 0,
        });
        /**
         * The input which is at full level when fade = 1
         */
        this.b = new Gain({
            context: this.context,
            gain: 0,
        });
        /**
         * The output is a mix between `a` and `b` at the ratio of `fade`
         */
        this.output = new Gain({ context: this.context });
        this._internalChannels = [this.a, this.b];
        const options = optionsFromArguments(CrossFade.getDefaults(), arguments, ["fade"]);
        this.fade = new Signal({
            context: this.context,
            units: "normalRange",
            value: options.fade,
        });
        readOnly(this, "fade");
        this.context.getConstant(1).connect(this._panner);
        this._panner.connect(this._split);
        // this is necessary for standardized-audio-context
        // doesn't make any difference for the native AudioContext
        // https://github.com/chrisguttandin/standardized-audio-context/issues/647
        this._panner.channelCount = 1;
        this._panner.channelCountMode = "explicit";
        connect(this._split, this.a.gain, 0);
        connect(this._split, this.b.gain, 1);
        this.fade.chain(this._g2a, this._panner.pan);
        this.a.connect(this.output);
        this.b.connect(this.output);
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            fade: 0.5,
        });
    }
    dispose() {
        super.dispose();
        this.a.dispose();
        this.b.dispose();
        this.output.dispose();
        this.fade.dispose();
        this._g2a.dispose();
        this._panner.disconnect();
        this._split.disconnect();
        return this;
    }
}

/**
 * Effect is the base class for effects. Connect the effect between
 * the effectSend and effectReturn GainNodes, then control the amount of
 * effect which goes to the output using the wet control.
 */
class Effect extends ToneAudioNode {
    constructor(options) {
        super(options);
        this.name = "Effect";
        /**
         * the drywet knob to control the amount of effect
         */
        this._dryWet = new CrossFade({ context: this.context });
        /**
         * The wet control is how much of the effected
         * will pass through to the output. 1 = 100% effected
         * signal, 0 = 100% dry signal.
         */
        this.wet = this._dryWet.fade;
        /**
         * connect the effectSend to the input of hte effect
         */
        this.effectSend = new Gain({ context: this.context });
        /**
         * connect the output of the effect to the effectReturn
         */
        this.effectReturn = new Gain({ context: this.context });
        /**
         * The effect input node
         */
        this.input = new Gain({ context: this.context });
        /**
         * The effect output
         */
        this.output = this._dryWet;
        // connections
        this.input.fan(this._dryWet.a, this.effectSend);
        this.effectReturn.connect(this._dryWet.b);
        this.wet.setValueAtTime(options.wet, 0);
        this._internalChannels = [this.effectReturn, this.effectSend];
        readOnly(this, "wet");
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            wet: 1,
        });
    }
    /**
     * chains the effect in between the effectSend and effectReturn
     */
    connectEffect(effect) {
        // add it to the internal channels
        this._internalChannels.push(effect);
        this.effectSend.chain(effect, this.effectReturn);
        return this;
    }
    dispose() {
        super.dispose();
        this._dryWet.dispose();
        this.effectSend.dispose();
        this.effectReturn.dispose();
        this.wet.dispose();
        return this;
    }
}

/**
 * Base class for LFO-based effects.
 */
class LFOEffect extends Effect {
    constructor(options) {
        super(options);
        this.name = "LFOEffect";
        this._lfo = new LFO({
            context: this.context,
            frequency: options.frequency,
            amplitude: options.depth,
        });
        this.depth = this._lfo.amplitude;
        this.frequency = this._lfo.frequency;
        this.type = options.type;
        readOnly(this, ["frequency", "depth"]);
    }
    static getDefaults() {
        return Object.assign(Effect.getDefaults(), {
            frequency: 1,
            type: "sine",
            depth: 1,
        });
    }
    /**
     * Start the effect.
     */
    start(time) {
        this._lfo.start(time);
        return this;
    }
    /**
     * Stop the lfo
     */
    stop(time) {
        this._lfo.stop(time);
        return this;
    }
    /**
     * Sync the filter to the transport. See [[LFO.sync]]
     */
    sync() {
        this._lfo.sync();
        return this;
    }
    /**
     * Unsync the filter from the transport.
     */
    unsync() {
        this._lfo.unsync();
        return this;
    }
    /**
     * The type of the LFO's oscillator: See [[Oscillator.type]]
     * @example
     * const autoFilter = new Tone.AutoFilter().start().toDestination();
     * const noise = new Tone.Noise().start().connect(autoFilter);
     * autoFilter.type = "square";
     */
    get type() {
        return this._lfo.type;
    }
    set type(type) {
        this._lfo.type = type;
    }
    dispose() {
        super.dispose();
        this._lfo.dispose();
        this.frequency.dispose();
        this.depth.dispose();
        return this;
    }
}

/**
 * AutoFilter is a Tone.Filter with a Tone.LFO connected to the filter cutoff frequency.
 * Setting the LFO rate and depth allows for control over the filter modulation rate
 * and depth.
 *
 * @example
 * // create an autofilter and start it's LFO
 * const autoFilter = new Tone.AutoFilter("4n").toDestination().start();
 * // route an oscillator through the filter and start it
 * const oscillator = new Tone.Oscillator().connect(autoFilter).start();
 * @category Effect
 */
class AutoFilter extends LFOEffect {
    constructor() {
        super(optionsFromArguments(AutoFilter.getDefaults(), arguments, ["frequency", "baseFrequency", "octaves"]));
        this.name = "AutoFilter";
        const options = optionsFromArguments(AutoFilter.getDefaults(), arguments, ["frequency", "baseFrequency", "octaves"]);
        this.filter = new Filter(Object.assign(options.filter, {
            context: this.context,
        }));
        // connections
        this.connectEffect(this.filter);
        this._lfo.connect(this.filter.frequency);
        this.octaves = options.octaves;
        this.baseFrequency = options.baseFrequency;
    }
    static getDefaults() {
        return Object.assign(LFOEffect.getDefaults(), {
            baseFrequency: 200,
            octaves: 2.6,
            filter: {
                type: "lowpass",
                rolloff: -12,
                Q: 1,
            }
        });
    }
    /**
     * The minimum value of the filter's cutoff frequency.
     */
    get baseFrequency() {
        return this._lfo.min;
    }
    set baseFrequency(freq) {
        this._lfo.min = this.toFrequency(freq);
        // and set the max
        this.octaves = this._octaves;
    }
    /**
     * The maximum value of the filter's cutoff frequency.
     */
    get octaves() {
        return this._octaves;
    }
    set octaves(oct) {
        this._octaves = oct;
        this._lfo.max = this._lfo.min * Math.pow(2, oct);
    }
    dispose() {
        super.dispose();
        this.filter.dispose();
        return this;
    }
}

/**
 * Panner is an equal power Left/Right Panner. It is a wrapper around the StereoPannerNode.
 * @example
 * return Tone.Offline(() => {
 * // move the input signal from right to left
 * 	const panner = new Tone.Panner(1).toDestination();
 * 	panner.pan.rampTo(-1, 0.5);
 * 	const osc = new Tone.Oscillator(100).connect(panner).start();
 * }, 0.5, 2);
 * @category Component
 */
class Panner extends ToneAudioNode {
    constructor() {
        super(Object.assign(optionsFromArguments(Panner.getDefaults(), arguments, ["pan"])));
        this.name = "Panner";
        /**
         * the panner node
         */
        this._panner = this.context.createStereoPanner();
        this.input = this._panner;
        this.output = this._panner;
        const options = optionsFromArguments(Panner.getDefaults(), arguments, ["pan"]);
        this.pan = new Param({
            context: this.context,
            param: this._panner.pan,
            value: options.pan,
            minValue: -1,
            maxValue: 1,
        });
        // this is necessary for standardized-audio-context
        // doesn't make any difference for the native AudioContext
        // https://github.com/chrisguttandin/standardized-audio-context/issues/647
        this._panner.channelCount = options.channelCount;
        this._panner.channelCountMode = "explicit";
        // initial value
        readOnly(this, "pan");
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            pan: 0,
            channelCount: 1,
        });
    }
    dispose() {
        super.dispose();
        this._panner.disconnect();
        this.pan.dispose();
        return this;
    }
}

/**
 * AutoPanner is a [[Panner]] with an [[LFO]] connected to the pan amount.
 * [Related Reading](https://www.ableton.com/en/blog/autopan-chopper-effect-and-more-liveschool/).
 *
 * @example
 * // create an autopanner and start it
 * const autoPanner = new Tone.AutoPanner("4n").toDestination().start();
 * // route an oscillator through the panner and start it
 * const oscillator = new Tone.Oscillator().connect(autoPanner).start();
 * @category Effect
 */
class AutoPanner extends LFOEffect {
    constructor() {
        super(optionsFromArguments(AutoPanner.getDefaults(), arguments, ["frequency"]));
        this.name = "AutoPanner";
        const options = optionsFromArguments(AutoPanner.getDefaults(), arguments, ["frequency"]);
        this._panner = new Panner({
            context: this.context,
            channelCount: options.channelCount
        });
        // connections
        this.connectEffect(this._panner);
        this._lfo.connect(this._panner.pan);
        this._lfo.min = -1;
        this._lfo.max = 1;
    }
    static getDefaults() {
        return Object.assign(LFOEffect.getDefaults(), {
            channelCount: 1
        });
    }
    dispose() {
        super.dispose();
        this._panner.dispose();
        return this;
    }
}

/**
 * Follower is a simple envelope follower.
 * It's implemented by applying a lowpass filter to the absolute value of the incoming signal.
 * ```
 *          +-----+    +---------------+
 * Input +--> Abs +----> OnePoleFilter +--> Output
 *          +-----+    +---------------+
 * ```
 * @category Component
 */
class Follower extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(Follower.getDefaults(), arguments, ["smoothing"]));
        this.name = "Follower";
        const options = optionsFromArguments(Follower.getDefaults(), arguments, ["smoothing"]);
        this._abs = this.input = new Abs({ context: this.context });
        this._lowpass = this.output = new OnePoleFilter({
            context: this.context,
            frequency: 1 / this.toSeconds(options.smoothing),
            type: "lowpass"
        });
        this._abs.connect(this._lowpass);
        this._smoothing = options.smoothing;
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            smoothing: 0.05
        });
    }
    /**
     * The amount of time it takes a value change to arrive at the updated value.
     */
    get smoothing() {
        return this._smoothing;
    }
    set smoothing(smoothing) {
        this._smoothing = smoothing;
        this._lowpass.frequency = 1 / this.toSeconds(this.smoothing);
    }
    dispose() {
        super.dispose();
        this._abs.dispose();
        this._lowpass.dispose();
        return this;
    }
}

/**
 * AutoWah connects a [[Follower]] to a [[Filter]].
 * The frequency of the filter, follows the input amplitude curve.
 * Inspiration from [Tuna.js](https://github.com/Dinahmoe/tuna).
 *
 * @example
 * const autoWah = new Tone.AutoWah(50, 6, -30).toDestination();
 * // initialize the synth and connect to autowah
 * const synth = new Tone.Synth().connect(autoWah);
 * // Q value influences the effect of the wah - default is 2
 * autoWah.Q.value = 6;
 * // more audible on higher notes
 * synth.triggerAttackRelease("C4", "8n");
 * @category Effect
 */
class AutoWah extends Effect {
    constructor() {
        super(optionsFromArguments(AutoWah.getDefaults(), arguments, ["baseFrequency", "octaves", "sensitivity"]));
        this.name = "AutoWah";
        const options = optionsFromArguments(AutoWah.getDefaults(), arguments, ["baseFrequency", "octaves", "sensitivity"]);
        this._follower = new Follower({
            context: this.context,
            smoothing: options.follower,
        });
        this._sweepRange = new ScaleExp({
            context: this.context,
            min: 0,
            max: 1,
            exponent: 0.5,
        });
        this._baseFrequency = this.toFrequency(options.baseFrequency);
        this._octaves = options.octaves;
        this._inputBoost = new Gain({ context: this.context });
        this._bandpass = new Filter({
            context: this.context,
            rolloff: -48,
            frequency: 0,
            Q: options.Q,
        });
        this._peaking = new Filter({
            context: this.context,
            type: "peaking"
        });
        this._peaking.gain.value = options.gain;
        this.gain = this._peaking.gain;
        this.Q = this._bandpass.Q;
        // the control signal path
        this.effectSend.chain(this._inputBoost, this._follower, this._sweepRange);
        this._sweepRange.connect(this._bandpass.frequency);
        this._sweepRange.connect(this._peaking.frequency);
        // the filtered path
        this.effectSend.chain(this._bandpass, this._peaking, this.effectReturn);
        // set the initial value
        this._setSweepRange();
        this.sensitivity = options.sensitivity;
        readOnly(this, ["gain", "Q"]);
    }
    static getDefaults() {
        return Object.assign(Effect.getDefaults(), {
            baseFrequency: 100,
            octaves: 6,
            sensitivity: 0,
            Q: 2,
            gain: 2,
            follower: 0.2,
        });
    }
    /**
     * The number of octaves that the filter will sweep above the baseFrequency.
     */
    get octaves() {
        return this._octaves;
    }
    set octaves(octaves) {
        this._octaves = octaves;
        this._setSweepRange();
    }
    /**
     * The follower's smoothing time
     */
    get follower() {
        return this._follower.smoothing;
    }
    set follower(follower) {
        this._follower.smoothing = follower;
    }
    /**
     * The base frequency from which the sweep will start from.
     */
    get baseFrequency() {
        return this._baseFrequency;
    }
    set baseFrequency(baseFreq) {
        this._baseFrequency = this.toFrequency(baseFreq);
        this._setSweepRange();
    }
    /**
     * The sensitivity to control how responsive to the input signal the filter is.
     */
    get sensitivity() {
        return gainToDb(1 / this._inputBoost.gain.value);
    }
    set sensitivity(sensitivity) {
        this._inputBoost.gain.value = 1 / dbToGain(sensitivity);
    }
    /**
     * sets the sweep range of the scaler
     */
    _setSweepRange() {
        this._sweepRange.min = this._baseFrequency;
        this._sweepRange.max = Math.min(this._baseFrequency * Math.pow(2, this._octaves), this.context.sampleRate / 2);
    }
    dispose() {
        super.dispose();
        this._follower.dispose();
        this._sweepRange.dispose();
        this._bandpass.dispose();
        this._peaking.dispose();
        this._inputBoost.dispose();
        return this;
    }
}

const workletName$1 = "bit-crusher";
const bitCrusherWorklet = /* javascript */ `
	class BitCrusherWorklet extends SingleIOProcessor {

		static get parameterDescriptors() {
			return [{
				name: "bits",
				defaultValue: 12,
				minValue: 1,
				maxValue: 16,
				automationRate: 'k-rate'
			}];
		}

		generate(input, _channel, parameters) {
			const step = Math.pow(0.5, parameters.bits - 1);
			const val = step * Math.floor(input / step + 0.5);
			return val;
		}
	}
`;
registerProcessor(workletName$1, bitCrusherWorklet);

/**
 * BitCrusher down-samples the incoming signal to a different bit depth.
 * Lowering the bit depth of the signal creates distortion. Read more about BitCrushing
 * on [Wikipedia](https://en.wikipedia.org/wiki/Bitcrusher).
 * @example
 * // initialize crusher and route a synth through it
 * const crusher = new Tone.BitCrusher(4).toDestination();
 * const synth = new Tone.Synth().connect(crusher);
 * synth.triggerAttackRelease("C2", 2);
 *
 * @category Effect
 */
class BitCrusher extends Effect {
    constructor() {
        super(optionsFromArguments(BitCrusher.getDefaults(), arguments, ["bits"]));
        this.name = "BitCrusher";
        const options = optionsFromArguments(BitCrusher.getDefaults(), arguments, ["bits"]);
        this._bitCrusherWorklet = new BitCrusherWorklet({
            context: this.context,
            bits: options.bits,
        });
        // connect it up
        this.connectEffect(this._bitCrusherWorklet);
        this.bits = this._bitCrusherWorklet.bits;
    }
    static getDefaults() {
        return Object.assign(Effect.getDefaults(), {
            bits: 4,
        });
    }
    dispose() {
        super.dispose();
        this._bitCrusherWorklet.dispose();
        return this;
    }
}
/**
 * Internal class which creates an AudioWorklet to do the bit crushing
 */
class BitCrusherWorklet extends ToneAudioWorklet {
    constructor() {
        super(optionsFromArguments(BitCrusherWorklet.getDefaults(), arguments));
        this.name = "BitCrusherWorklet";
        const options = optionsFromArguments(BitCrusherWorklet.getDefaults(), arguments);
        this.input = new Gain({ context: this.context });
        this.output = new Gain({ context: this.context });
        this.bits = new Param({
            context: this.context,
            value: options.bits,
            units: "positive",
            minValue: 1,
            maxValue: 16,
            param: this._dummyParam,
            swappable: true,
        });
    }
    static getDefaults() {
        return Object.assign(ToneAudioWorklet.getDefaults(), {
            bits: 12,
        });
    }
    _audioWorkletName() {
        return workletName$1;
    }
    onReady(node) {
        connectSeries(this.input, node, this.output);
        const bits = node.parameters.get("bits");
        this.bits.setParam(bits);
    }
    dispose() {
        super.dispose();
        this.input.dispose();
        this.output.dispose();
        this.bits.dispose();
        return this;
    }
}

/**
 * Chebyshev is a waveshaper which is good
 * for making different types of distortion sounds.
 * Note that odd orders sound very different from even ones,
 * and order = 1 is no change.
 * Read more at [music.columbia.edu](http://music.columbia.edu/cmc/musicandcomputers/chapter4/04_06.php).
 * @example
 * // create a new cheby
 * const cheby = new Tone.Chebyshev(50).toDestination();
 * // create a monosynth connected to our cheby
 * const synth = new Tone.MonoSynth().connect(cheby);
 * synth.triggerAttackRelease("C2", 0.4);
 * @category Effect
 */
class Chebyshev extends Effect {
    constructor() {
        super(optionsFromArguments(Chebyshev.getDefaults(), arguments, ["order"]));
        this.name = "Chebyshev";
        const options = optionsFromArguments(Chebyshev.getDefaults(), arguments, ["order"]);
        this._shaper = new WaveShaper({
            context: this.context,
            length: 4096
        });
        this._order = options.order;
        this.connectEffect(this._shaper);
        this.order = options.order;
        this.oversample = options.oversample;
    }
    static getDefaults() {
        return Object.assign(Effect.getDefaults(), {
            order: 1,
            oversample: "none"
        });
    }
    /**
     * get the coefficient for that degree
     * @param  x the x value
     * @param  degree
     * @param  memo memoize the computed value. this speeds up computation greatly.
     */
    _getCoefficient(x, degree, memo) {
        if (memo.has(degree)) {
            return memo.get(degree);
        }
        else if (degree === 0) {
            memo.set(degree, 0);
        }
        else if (degree === 1) {
            memo.set(degree, x);
        }
        else {
            memo.set(degree, 2 * x * this._getCoefficient(x, degree - 1, memo) - this._getCoefficient(x, degree - 2, memo));
        }
        return memo.get(degree);
    }
    /**
     * The order of the Chebyshev polynomial which creates the equation which is applied to the incoming
     * signal through a Tone.WaveShaper. The equations are in the form:
     * ```
     * order 2: 2x^2 + 1
     * order 3: 4x^3 + 3x
     * ```
     * @min 1
     * @max 100
     */
    get order() {
        return this._order;
    }
    set order(order) {
        this._order = order;
        this._shaper.setMap((x => {
            return this._getCoefficient(x, order, new Map());
        }));
    }
    /**
     * The oversampling of the effect. Can either be "none", "2x" or "4x".
     */
    get oversample() {
        return this._shaper.oversample;
    }
    set oversample(oversampling) {
        this._shaper.oversample = oversampling;
    }
    dispose() {
        super.dispose();
        this._shaper.dispose();
        return this;
    }
}

/**
 * Split splits an incoming signal into the number of given channels.
 *
 * @example
 * const split = new Tone.Split();
 * // stereoSignal.connect(split);
 * @category Component
 */
class Split extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(Split.getDefaults(), arguments, ["channels"]));
        this.name = "Split";
        const options = optionsFromArguments(Split.getDefaults(), arguments, ["channels"]);
        this._splitter = this.input = this.output = this.context.createChannelSplitter(options.channels);
        this._internalChannels = [this._splitter];
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            channels: 2,
        });
    }
    dispose() {
        super.dispose();
        this._splitter.disconnect();
        return this;
    }
}

/**
 * Merge brings multiple mono input channels into a single multichannel output channel.
 *
 * @example
 * const merge = new Tone.Merge().toDestination();
 * // routing a sine tone in the left channel
 * const osc = new Tone.Oscillator().connect(merge, 0, 0).start();
 * // and noise in the right channel
 * const noise = new Tone.Noise().connect(merge, 0, 1).start();;
 * @category Component
 */
class Merge extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(Merge.getDefaults(), arguments, ["channels"]));
        this.name = "Merge";
        const options = optionsFromArguments(Merge.getDefaults(), arguments, ["channels"]);
        this._merger = this.output = this.input = this.context.createChannelMerger(options.channels);
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            channels: 2,
        });
    }
    dispose() {
        super.dispose();
        this._merger.disconnect();
        return this;
    }
}

/**
 * Base class for Stereo effects.
 */
class StereoEffect extends ToneAudioNode {
    constructor(options) {
        super(options);
        this.name = "StereoEffect";
        this.input = new Gain({ context: this.context });
        // force mono sources to be stereo
        this.input.channelCount = 2;
        this.input.channelCountMode = "explicit";
        this._dryWet = this.output = new CrossFade({
            context: this.context,
            fade: options.wet
        });
        this.wet = this._dryWet.fade;
        this._split = new Split({ context: this.context, channels: 2 });
        this._merge = new Merge({ context: this.context, channels: 2 });
        // connections
        this.input.connect(this._split);
        // dry wet connections
        this.input.connect(this._dryWet.a);
        this._merge.connect(this._dryWet.b);
        readOnly(this, ["wet"]);
    }
    /**
     * Connect the left part of the effect
     */
    connectEffectLeft(...nodes) {
        this._split.connect(nodes[0], 0, 0);
        connectSeries(...nodes);
        connect(nodes[nodes.length - 1], this._merge, 0, 0);
    }
    /**
     * Connect the right part of the effect
     */
    connectEffectRight(...nodes) {
        this._split.connect(nodes[0], 1, 0);
        connectSeries(...nodes);
        connect(nodes[nodes.length - 1], this._merge, 0, 1);
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            wet: 1,
        });
    }
    dispose() {
        super.dispose();
        this._dryWet.dispose();
        this._split.dispose();
        this._merge.dispose();
        return this;
    }
}

/**
 * Base class for stereo feedback effects where the effectReturn is fed back into the same channel.
 */
class StereoFeedbackEffect extends StereoEffect {
    constructor(options) {
        super(options);
        this.feedback = new Signal({
            context: this.context,
            value: options.feedback,
            units: "normalRange"
        });
        this._feedbackL = new Gain({ context: this.context });
        this._feedbackR = new Gain({ context: this.context });
        this._feedbackSplit = new Split({ context: this.context, channels: 2 });
        this._feedbackMerge = new Merge({ context: this.context, channels: 2 });
        this._merge.connect(this._feedbackSplit);
        this._feedbackMerge.connect(this._split);
        // the left output connected to the left input
        this._feedbackSplit.connect(this._feedbackL, 0, 0);
        this._feedbackL.connect(this._feedbackMerge, 0, 0);
        // the right output connected to the right input
        this._feedbackSplit.connect(this._feedbackR, 1, 0);
        this._feedbackR.connect(this._feedbackMerge, 0, 1);
        // the feedback control
        this.feedback.fan(this._feedbackL.gain, this._feedbackR.gain);
        readOnly(this, ["feedback"]);
    }
    static getDefaults() {
        return Object.assign(StereoEffect.getDefaults(), {
            feedback: 0.5,
        });
    }
    dispose() {
        super.dispose();
        this.feedback.dispose();
        this._feedbackL.dispose();
        this._feedbackR.dispose();
        this._feedbackSplit.dispose();
        this._feedbackMerge.dispose();
        return this;
    }
}

/**
 * Chorus is a stereo chorus effect composed of a left and right delay with an [[LFO]] applied to the delayTime of each channel.
 * When [[feedback]] is set to a value larger than 0, you also get Flanger-type effects.
 * Inspiration from [Tuna.js](https://github.com/Dinahmoe/tuna/blob/master/tuna.js).
 * Read more on the chorus effect on [SoundOnSound](http://www.soundonsound.com/sos/jun04/articles/synthsecrets.htm).
 *
 * @example
 * const chorus = new Tone.Chorus(4, 2.5, 0.5).toDestination().start();
 * const synth = new Tone.PolySynth().connect(chorus);
 * synth.triggerAttackRelease(["C3", "E3", "G3"], "8n");
 *
 * @category Effect
 */
class Chorus extends StereoFeedbackEffect {
    constructor() {
        super(optionsFromArguments(Chorus.getDefaults(), arguments, ["frequency", "delayTime", "depth"]));
        this.name = "Chorus";
        const options = optionsFromArguments(Chorus.getDefaults(), arguments, ["frequency", "delayTime", "depth"]);
        this._depth = options.depth;
        this._delayTime = options.delayTime / 1000;
        this._lfoL = new LFO({
            context: this.context,
            frequency: options.frequency,
            min: 0,
            max: 1,
        });
        this._lfoR = new LFO({
            context: this.context,
            frequency: options.frequency,
            min: 0,
            max: 1,
            phase: 180
        });
        this._delayNodeL = new Delay({ context: this.context });
        this._delayNodeR = new Delay({ context: this.context });
        this.frequency = this._lfoL.frequency;
        readOnly(this, ["frequency"]);
        // have one LFO frequency control the other
        this._lfoL.frequency.connect(this._lfoR.frequency);
        // connections
        this.connectEffectLeft(this._delayNodeL);
        this.connectEffectRight(this._delayNodeR);
        // lfo setup
        this._lfoL.connect(this._delayNodeL.delayTime);
        this._lfoR.connect(this._delayNodeR.delayTime);
        // set the initial values
        this.depth = this._depth;
        this.type = options.type;
        this.spread = options.spread;
    }
    static getDefaults() {
        return Object.assign(StereoFeedbackEffect.getDefaults(), {
            frequency: 1.5,
            delayTime: 3.5,
            depth: 0.7,
            type: "sine",
            spread: 180,
            feedback: 0,
            wet: 0.5,
        });
    }
    /**
     * The depth of the effect. A depth of 1 makes the delayTime
     * modulate between 0 and 2*delayTime (centered around the delayTime).
     */
    get depth() {
        return this._depth;
    }
    set depth(depth) {
        this._depth = depth;
        const deviation = this._delayTime * depth;
        this._lfoL.min = Math.max(this._delayTime - deviation, 0);
        this._lfoL.max = this._delayTime + deviation;
        this._lfoR.min = Math.max(this._delayTime - deviation, 0);
        this._lfoR.max = this._delayTime + deviation;
    }
    /**
     * The delayTime in milliseconds of the chorus. A larger delayTime
     * will give a more pronounced effect. Nominal range a delayTime
     * is between 2 and 20ms.
     */
    get delayTime() {
        return this._delayTime * 1000;
    }
    set delayTime(delayTime) {
        this._delayTime = delayTime / 1000;
        this.depth = this._depth;
    }
    /**
     * The oscillator type of the LFO.
     */
    get type() {
        return this._lfoL.type;
    }
    set type(type) {
        this._lfoL.type = type;
        this._lfoR.type = type;
    }
    /**
     * Amount of stereo spread. When set to 0, both LFO's will be panned centrally.
     * When set to 180, LFO's will be panned hard left and right respectively.
     */
    get spread() {
        return this._lfoR.phase - this._lfoL.phase;
    }
    set spread(spread) {
        this._lfoL.phase = 90 - (spread / 2);
        this._lfoR.phase = (spread / 2) + 90;
    }
    /**
     * Start the effect.
     */
    start(time) {
        this._lfoL.start(time);
        this._lfoR.start(time);
        return this;
    }
    /**
     * Stop the lfo
     */
    stop(time) {
        this._lfoL.stop(time);
        this._lfoR.stop(time);
        return this;
    }
    /**
     * Sync the filter to the transport. See [[LFO.sync]]
     */
    sync() {
        this._lfoL.sync();
        this._lfoR.sync();
        return this;
    }
    /**
     * Unsync the filter from the transport.
     */
    unsync() {
        this._lfoL.unsync();
        this._lfoR.unsync();
        return this;
    }
    dispose() {
        super.dispose();
        this._lfoL.dispose();
        this._lfoR.dispose();
        this._delayNodeL.dispose();
        this._delayNodeR.dispose();
        this.frequency.dispose();
        return this;
    }
}

/**
 * A simple distortion effect using Tone.WaveShaper.
 * Algorithm from [this stackoverflow answer](http://stackoverflow.com/a/22313408).
 *
 * @example
 * const dist = new Tone.Distortion(0.8).toDestination();
 * const fm = new Tone.FMSynth().connect(dist);
 * fm.triggerAttackRelease("A1", "8n");
 * @category Effect
 */
class Distortion extends Effect {
    constructor() {
        super(optionsFromArguments(Distortion.getDefaults(), arguments, ["distortion"]));
        this.name = "Distortion";
        const options = optionsFromArguments(Distortion.getDefaults(), arguments, ["distortion"]);
        this._shaper = new WaveShaper({
            context: this.context,
            length: 4096,
        });
        this._distortion = options.distortion;
        this.connectEffect(this._shaper);
        this.distortion = options.distortion;
        this.oversample = options.oversample;
    }
    static getDefaults() {
        return Object.assign(Effect.getDefaults(), {
            distortion: 0.4,
            oversample: "none",
        });
    }
    /**
     * The amount of distortion. Nominal range is between 0 and 1.
     */
    get distortion() {
        return this._distortion;
    }
    set distortion(amount) {
        this._distortion = amount;
        const k = amount * 100;
        const deg = Math.PI / 180;
        this._shaper.setMap((x) => {
            if (Math.abs(x) < 0.001) {
                // should output 0 when input is 0
                return 0;
            }
            else {
                return (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
            }
        });
    }
    /**
     * The oversampling of the effect. Can either be "none", "2x" or "4x".
     */
    get oversample() {
        return this._shaper.oversample;
    }
    set oversample(oversampling) {
        this._shaper.oversample = oversampling;
    }
    dispose() {
        super.dispose();
        this._shaper.dispose();
        return this;
    }
}

/**
 * FeedbackEffect provides a loop between an audio source and its own output.
 * This is a base-class for feedback effects.
 */
class FeedbackEffect extends Effect {
    constructor(options) {
        super(options);
        this.name = "FeedbackEffect";
        this._feedbackGain = new Gain({
            context: this.context,
            gain: options.feedback,
            units: "normalRange",
        });
        this.feedback = this._feedbackGain.gain;
        readOnly(this, "feedback");
        // the feedback loop
        this.effectReturn.chain(this._feedbackGain, this.effectSend);
    }
    static getDefaults() {
        return Object.assign(Effect.getDefaults(), {
            feedback: 0.125,
        });
    }
    dispose() {
        super.dispose();
        this._feedbackGain.dispose();
        this.feedback.dispose();
        return this;
    }
}

/**
 * FeedbackDelay is a DelayNode in which part of output signal is fed back into the delay.
 *
 * @param delayTime The delay applied to the incoming signal.
 * @param feedback The amount of the effected signal which is fed back through the delay.
 * @example
 * const feedbackDelay = new Tone.FeedbackDelay("8n", 0.5).toDestination();
 * const tom = new Tone.MembraneSynth({
 * 	octaves: 4,
 * 	pitchDecay: 0.1
 * }).connect(feedbackDelay);
 * tom.triggerAttackRelease("A2", "32n");
 * @category Effect
 */
class FeedbackDelay extends FeedbackEffect {
    constructor() {
        super(optionsFromArguments(FeedbackDelay.getDefaults(), arguments, ["delayTime", "feedback"]));
        this.name = "FeedbackDelay";
        const options = optionsFromArguments(FeedbackDelay.getDefaults(), arguments, ["delayTime", "feedback"]);
        this._delayNode = new Delay({
            context: this.context,
            delayTime: options.delayTime,
            maxDelay: options.maxDelay,
        });
        this.delayTime = this._delayNode.delayTime;
        // connect it up
        this.connectEffect(this._delayNode);
        readOnly(this, "delayTime");
    }
    static getDefaults() {
        return Object.assign(FeedbackEffect.getDefaults(), {
            delayTime: 0.25,
            maxDelay: 1,
        });
    }
    dispose() {
        super.dispose();
        this._delayNode.dispose();
        this.delayTime.dispose();
        return this;
    }
}

/**
 * PhaseShiftAllpass is an very efficient implementation of a Hilbert Transform
 * using two Allpass filter banks whose outputs have a phase difference of 90°.
 * Here the `offset90` phase is offset by +90° in relation to `output`.
 * Coefficients and structure was developed by Olli Niemitalo.
 * For more details see: http://yehar.com/blog/?p=368
 * @category Component
 */
class PhaseShiftAllpass extends ToneAudioNode {
    constructor(options) {
        super(options);
        this.name = "PhaseShiftAllpass";
        this.input = new Gain({ context: this.context });
        /**
         * The phase shifted output
         */
        this.output = new Gain({ context: this.context });
        /**
         * The PhaseShifted allpass output
         */
        this.offset90 = new Gain({ context: this.context });
        const allpassBank1Values = [0.6923878, 0.9360654322959, 0.9882295226860, 0.9987488452737];
        const allpassBank2Values = [0.4021921162426, 0.8561710882420, 0.9722909545651, 0.9952884791278];
        this._bank0 = this._createAllPassFilterBank(allpassBank1Values);
        this._bank1 = this._createAllPassFilterBank(allpassBank2Values);
        this._oneSampleDelay = this.context.createIIRFilter([0.0, 1.0], [1.0, 0.0]);
        // connect Allpass filter banks
        connectSeries(this.input, ...this._bank0, this._oneSampleDelay, this.output);
        connectSeries(this.input, ...this._bank1, this.offset90);
    }
    /**
     * Create all of the IIR filters from an array of values using the coefficient calculation.
     */
    _createAllPassFilterBank(bankValues) {
        const nodes = bankValues.map(value => {
            const coefficients = [[value * value, 0, -1], [1, 0, -(value * value)]];
            return this.context.createIIRFilter(coefficients[0], coefficients[1]);
        });
        return nodes;
    }
    dispose() {
        super.dispose();
        this.input.dispose();
        this.output.dispose();
        this.offset90.dispose();
        this._bank0.forEach(f => f.disconnect());
        this._bank1.forEach(f => f.disconnect());
        this._oneSampleDelay.disconnect();
        return this;
    }
}

/**
 * FrequencyShifter can be used to shift all frequencies of a signal by a fixed amount.
 * The amount can be changed at audio rate and the effect is applied in real time.
 * The frequency shifting is implemented with a technique called single side band modulation using a ring modulator.
 * Note: Contrary to pitch shifting, all frequencies are shifted by the same amount,
 * destroying the harmonic relationship between them. This leads to the classic ring modulator timbre distortion.
 * The algorithm will produces some aliasing towards the high end, especially if your source material
 * contains a lot of high frequencies. Unfortunatelly the webaudio API does not support resampling
 * buffers in real time, so it is not possible to fix it properly. Depending on the use case it might
 * be an option to low pass filter your input before frequency shifting it to get ride of the aliasing.
 * You can find a very detailed description of the algorithm here: https://larzeitlin.github.io/RMFS/
 *
 * @example
 * const input = new Tone.Oscillator(230, "sawtooth").start();
 * const shift = new Tone.FrequencyShifter(42).toDestination();
 * input.connect(shift);
 * @category Effect
 */
class FrequencyShifter extends Effect {
    constructor() {
        super(optionsFromArguments(FrequencyShifter.getDefaults(), arguments, ["frequency"]));
        this.name = "FrequencyShifter";
        const options = optionsFromArguments(FrequencyShifter.getDefaults(), arguments, ["frequency"]);
        this.frequency = new Signal({
            context: this.context,
            units: "frequency",
            value: options.frequency,
            minValue: -this.context.sampleRate / 2,
            maxValue: this.context.sampleRate / 2,
        });
        this._sine = new ToneOscillatorNode({
            context: this.context,
            type: "sine",
        });
        this._cosine = new Oscillator({
            context: this.context,
            phase: -90,
            type: "sine",
        });
        this._sineMultiply = new Multiply({ context: this.context });
        this._cosineMultiply = new Multiply({ context: this.context });
        this._negate = new Negate({ context: this.context });
        this._add = new Add({ context: this.context });
        this._phaseShifter = new PhaseShiftAllpass({ context: this.context });
        this.effectSend.connect(this._phaseShifter);
        // connect the carrier frequency signal to the two oscillators
        this.frequency.fan(this._sine.frequency, this._cosine.frequency);
        this._phaseShifter.offset90.connect(this._cosineMultiply);
        this._cosine.connect(this._cosineMultiply.factor);
        this._phaseShifter.connect(this._sineMultiply);
        this._sine.connect(this._sineMultiply.factor);
        this._sineMultiply.connect(this._negate);
        this._cosineMultiply.connect(this._add);
        this._negate.connect(this._add.addend);
        this._add.connect(this.effectReturn);
        // start the oscillators at the same time
        const now = this.immediate();
        this._sine.start(now);
        this._cosine.start(now);
    }
    static getDefaults() {
        return Object.assign(Effect.getDefaults(), {
            frequency: 0,
        });
    }
    dispose() {
        super.dispose();
        this.frequency.dispose();
        this._add.dispose();
        this._cosine.dispose();
        this._cosineMultiply.dispose();
        this._negate.dispose();
        this._phaseShifter.dispose();
        this._sine.dispose();
        this._sineMultiply.dispose();
        return this;
    }
}

/**
 * An array of comb filter delay values from Freeverb implementation
 */
const combFilterTunings = [1557 / 44100, 1617 / 44100, 1491 / 44100, 1422 / 44100, 1277 / 44100, 1356 / 44100, 1188 / 44100, 1116 / 44100];
/**
 * An array of allpass filter frequency values from Freeverb implementation
 */
const allpassFilterFrequencies = [225, 556, 441, 341];
/**
 * Freeverb is a reverb based on [Freeverb](https://ccrma.stanford.edu/~jos/pasp/Freeverb.html).
 * Read more on reverb on [Sound On Sound](https://web.archive.org/web/20160404083902/http://www.soundonsound.com:80/sos/feb01/articles/synthsecrets.asp).
 * Freeverb is now implemented with an AudioWorkletNode which may result on performance degradation on some platforms. Consider using [[Reverb]].
 * @example
 * const freeverb = new Tone.Freeverb().toDestination();
 * freeverb.dampening = 1000;
 * // routing synth through the reverb
 * const synth = new Tone.NoiseSynth().connect(freeverb);
 * synth.triggerAttackRelease(0.05);
 * @category Effect
 */
class Freeverb extends StereoEffect {
    constructor() {
        super(optionsFromArguments(Freeverb.getDefaults(), arguments, ["roomSize", "dampening"]));
        this.name = "Freeverb";
        /**
         * the comb filters
         */
        this._combFilters = [];
        /**
         * the allpass filters on the left
         */
        this._allpassFiltersL = [];
        /**
         * the allpass filters on the right
         */
        this._allpassFiltersR = [];
        const options = optionsFromArguments(Freeverb.getDefaults(), arguments, ["roomSize", "dampening"]);
        this.roomSize = new Signal({
            context: this.context,
            value: options.roomSize,
            units: "normalRange",
        });
        // make the allpass filters on the right
        this._allpassFiltersL = allpassFilterFrequencies.map(freq => {
            const allpassL = this.context.createBiquadFilter();
            allpassL.type = "allpass";
            allpassL.frequency.value = freq;
            return allpassL;
        });
        // make the allpass filters on the left
        this._allpassFiltersR = allpassFilterFrequencies.map(freq => {
            const allpassR = this.context.createBiquadFilter();
            allpassR.type = "allpass";
            allpassR.frequency.value = freq;
            return allpassR;
        });
        // make the comb filters
        this._combFilters = combFilterTunings.map((delayTime, index) => {
            const lfpf = new LowpassCombFilter({
                context: this.context,
                dampening: options.dampening,
                delayTime,
            });
            if (index < combFilterTunings.length / 2) {
                this.connectEffectLeft(lfpf, ...this._allpassFiltersL);
            }
            else {
                this.connectEffectRight(lfpf, ...this._allpassFiltersR);
            }
            this.roomSize.connect(lfpf.resonance);
            return lfpf;
        });
        readOnly(this, ["roomSize"]);
    }
    static getDefaults() {
        return Object.assign(StereoEffect.getDefaults(), {
            roomSize: 0.7,
            dampening: 3000
        });
    }
    /**
     * The amount of dampening of the reverberant signal.
     */
    get dampening() {
        return this._combFilters[0].dampening;
    }
    set dampening(d) {
        this._combFilters.forEach(c => c.dampening = d);
    }
    dispose() {
        super.dispose();
        this._allpassFiltersL.forEach(al => al.disconnect());
        this._allpassFiltersR.forEach(ar => ar.disconnect());
        this._combFilters.forEach(cf => cf.dispose());
        this.roomSize.dispose();
        return this;
    }
}

/**
 * an array of the comb filter delay time values
 */
const combFilterDelayTimes = [1687 / 25000, 1601 / 25000, 2053 / 25000, 2251 / 25000];
/**
 * the resonances of each of the comb filters
 */
const combFilterResonances = [0.773, 0.802, 0.753, 0.733];
/**
 * the allpass filter frequencies
 */
const allpassFilterFreqs = [347, 113, 37];
/**
 * JCReverb is a simple [Schroeder Reverberator](https://ccrma.stanford.edu/~jos/pasp/Schroeder_Reverberators.html)
 * tuned by John Chowning in 1970.
 * It is made up of three allpass filters and four [[FeedbackCombFilter]].
 * JCReverb is now implemented with an AudioWorkletNode which may result on performance degradation on some platforms. Consider using [[Reverb]].
 * @example
 * const reverb = new Tone.JCReverb(0.4).toDestination();
 * const delay = new Tone.FeedbackDelay(0.5);
 * // connecting the synth to reverb through delay
 * const synth = new Tone.DuoSynth().chain(delay, reverb);
 * synth.triggerAttackRelease("A4", "8n");
 *
 * @category Effect
 */
class JCReverb extends StereoEffect {
    constructor() {
        super(optionsFromArguments(JCReverb.getDefaults(), arguments, ["roomSize"]));
        this.name = "JCReverb";
        /**
         * a series of allpass filters
         */
        this._allpassFilters = [];
        /**
         * parallel feedback comb filters
         */
        this._feedbackCombFilters = [];
        const options = optionsFromArguments(JCReverb.getDefaults(), arguments, ["roomSize"]);
        this.roomSize = new Signal({
            context: this.context,
            value: options.roomSize,
            units: "normalRange",
        });
        this._scaleRoomSize = new Scale({
            context: this.context,
            min: -0.733,
            max: 0.197,
        });
        // make the allpass filters
        this._allpassFilters = allpassFilterFreqs.map(freq => {
            const allpass = this.context.createBiquadFilter();
            allpass.type = "allpass";
            allpass.frequency.value = freq;
            return allpass;
        });
        // and the comb filters
        this._feedbackCombFilters = combFilterDelayTimes.map((delayTime, index) => {
            const fbcf = new FeedbackCombFilter({
                context: this.context,
                delayTime,
            });
            this._scaleRoomSize.connect(fbcf.resonance);
            fbcf.resonance.value = combFilterResonances[index];
            if (index < combFilterDelayTimes.length / 2) {
                this.connectEffectLeft(...this._allpassFilters, fbcf);
            }
            else {
                this.connectEffectRight(...this._allpassFilters, fbcf);
            }
            return fbcf;
        });
        // chain the allpass filters together
        this.roomSize.connect(this._scaleRoomSize);
        readOnly(this, ["roomSize"]);
    }
    static getDefaults() {
        return Object.assign(StereoEffect.getDefaults(), {
            roomSize: 0.5,
        });
    }
    dispose() {
        super.dispose();
        this._allpassFilters.forEach(apf => apf.disconnect());
        this._feedbackCombFilters.forEach(fbcf => fbcf.dispose());
        this.roomSize.dispose();
        this._scaleRoomSize.dispose();
        return this;
    }
}

/**
 * Just like a [[StereoFeedbackEffect]], but the feedback is routed from left to right
 * and right to left instead of on the same channel.
 * ```
 * +--------------------------------+ feedbackL <-----------------------------------+
 * |                                                                                |
 * +-->                          +----->        +---->                          +-----+
 *      feedbackMerge +--> split        (EFFECT)       merge +--> feedbackSplit     | |
 * +-->                          +----->        +---->                          +---+ |
 * |                                                                                  |
 * +--------------------------------+ feedbackR <-------------------------------------+
 * ```
 */
class StereoXFeedbackEffect extends StereoFeedbackEffect {
    constructor(options) {
        super(options);
        // the left output connected to the right input
        this._feedbackL.disconnect();
        this._feedbackL.connect(this._feedbackMerge, 0, 1);
        // the left output connected to the right input
        this._feedbackR.disconnect();
        this._feedbackR.connect(this._feedbackMerge, 0, 0);
        readOnly(this, ["feedback"]);
    }
}

/**
 * PingPongDelay is a feedback delay effect where the echo is heard
 * first in one channel and next in the opposite channel. In a stereo
 * system these are the right and left channels.
 * PingPongDelay in more simplified terms is two Tone.FeedbackDelays
 * with independent delay values. Each delay is routed to one channel
 * (left or right), and the channel triggered second will always
 * trigger at the same interval after the first.
 * @example
 * const pingPong = new Tone.PingPongDelay("4n", 0.2).toDestination();
 * const drum = new Tone.MembraneSynth().connect(pingPong);
 * drum.triggerAttackRelease("C4", "32n");
 * @category Effect
 */
class PingPongDelay extends StereoXFeedbackEffect {
    constructor() {
        super(optionsFromArguments(PingPongDelay.getDefaults(), arguments, ["delayTime", "feedback"]));
        this.name = "PingPongDelay";
        const options = optionsFromArguments(PingPongDelay.getDefaults(), arguments, ["delayTime", "feedback"]);
        this._leftDelay = new Delay({
            context: this.context,
            maxDelay: options.maxDelay,
        });
        this._rightDelay = new Delay({
            context: this.context,
            maxDelay: options.maxDelay
        });
        this._rightPreDelay = new Delay({
            context: this.context,
            maxDelay: options.maxDelay
        });
        this.delayTime = new Signal({
            context: this.context,
            units: "time",
            value: options.delayTime,
        });
        // connect it up
        this.connectEffectLeft(this._leftDelay);
        this.connectEffectRight(this._rightPreDelay, this._rightDelay);
        this.delayTime.fan(this._leftDelay.delayTime, this._rightDelay.delayTime, this._rightPreDelay.delayTime);
        // rearranged the feedback to be after the rightPreDelay
        this._feedbackL.disconnect();
        this._feedbackL.connect(this._rightDelay);
        readOnly(this, ["delayTime"]);
    }
    static getDefaults() {
        return Object.assign(StereoXFeedbackEffect.getDefaults(), {
            delayTime: 0.25,
            maxDelay: 1
        });
    }
    dispose() {
        super.dispose();
        this._leftDelay.dispose();
        this._rightDelay.dispose();
        this._rightPreDelay.dispose();
        this.delayTime.dispose();
        return this;
    }
}

/**
 * PitchShift does near-realtime pitch shifting to the incoming signal.
 * The effect is achieved by speeding up or slowing down the delayTime
 * of a DelayNode using a sawtooth wave.
 * Algorithm found in [this pdf](http://dsp-book.narod.ru/soundproc.pdf).
 * Additional reference by [Miller Pucket](http://msp.ucsd.edu/techniques/v0.11/book-html/node115.html).
 * @category Effect
 */
class PitchShift extends FeedbackEffect {
    constructor() {
        super(optionsFromArguments(PitchShift.getDefaults(), arguments, ["pitch"]));
        this.name = "PitchShift";
        const options = optionsFromArguments(PitchShift.getDefaults(), arguments, ["pitch"]);
        this._frequency = new Signal({ context: this.context });
        this._delayA = new Delay({
            maxDelay: 1,
            context: this.context
        });
        this._lfoA = new LFO({
            context: this.context,
            min: 0,
            max: 0.1,
            type: "sawtooth"
        }).connect(this._delayA.delayTime);
        this._delayB = new Delay({
            maxDelay: 1,
            context: this.context
        });
        this._lfoB = new LFO({
            context: this.context,
            min: 0,
            max: 0.1,
            type: "sawtooth",
            phase: 180
        }).connect(this._delayB.delayTime);
        this._crossFade = new CrossFade({ context: this.context });
        this._crossFadeLFO = new LFO({
            context: this.context,
            min: 0,
            max: 1,
            type: "triangle",
            phase: 90
        }).connect(this._crossFade.fade);
        this._feedbackDelay = new Delay({
            delayTime: options.delayTime,
            context: this.context,
        });
        this.delayTime = this._feedbackDelay.delayTime;
        readOnly(this, "delayTime");
        this._pitch = options.pitch;
        this._windowSize = options.windowSize;
        // connect the two delay lines up
        this._delayA.connect(this._crossFade.a);
        this._delayB.connect(this._crossFade.b);
        // connect the frequency
        this._frequency.fan(this._lfoA.frequency, this._lfoB.frequency, this._crossFadeLFO.frequency);
        // route the input
        this.effectSend.fan(this._delayA, this._delayB);
        this._crossFade.chain(this._feedbackDelay, this.effectReturn);
        // start the LFOs at the same time
        const now = this.now();
        this._lfoA.start(now);
        this._lfoB.start(now);
        this._crossFadeLFO.start(now);
        // set the initial value
        this.windowSize = this._windowSize;
    }
    static getDefaults() {
        return Object.assign(FeedbackEffect.getDefaults(), {
            pitch: 0,
            windowSize: 0.1,
            delayTime: 0,
            feedback: 0
        });
    }
    /**
     * Repitch the incoming signal by some interval (measured in semi-tones).
     * @example
     * const pitchShift = new Tone.PitchShift().toDestination();
     * const osc = new Tone.Oscillator().connect(pitchShift).start().toDestination();
     * pitchShift.pitch = -12; // down one octave
     * pitchShift.pitch = 7; // up a fifth
     */
    get pitch() {
        return this._pitch;
    }
    set pitch(interval) {
        this._pitch = interval;
        let factor = 0;
        if (interval < 0) {
            this._lfoA.min = 0;
            this._lfoA.max = this._windowSize;
            this._lfoB.min = 0;
            this._lfoB.max = this._windowSize;
            factor = intervalToFrequencyRatio(interval - 1) + 1;
        }
        else {
            this._lfoA.min = this._windowSize;
            this._lfoA.max = 0;
            this._lfoB.min = this._windowSize;
            this._lfoB.max = 0;
            factor = intervalToFrequencyRatio(interval) - 1;
        }
        this._frequency.value = factor * (1.2 / this._windowSize);
    }
    /**
     * The window size corresponds roughly to the sample length in a looping sampler.
     * Smaller values are desirable for a less noticeable delay time of the pitch shifted
     * signal, but larger values will result in smoother pitch shifting for larger intervals.
     * A nominal range of 0.03 to 0.1 is recommended.
     */
    get windowSize() {
        return this._windowSize;
    }
    set windowSize(size) {
        this._windowSize = this.toSeconds(size);
        this.pitch = this._pitch;
    }
    dispose() {
        super.dispose();
        this._frequency.dispose();
        this._delayA.dispose();
        this._delayB.dispose();
        this._lfoA.dispose();
        this._lfoB.dispose();
        this._crossFade.dispose();
        this._crossFadeLFO.dispose();
        this._feedbackDelay.dispose();
        return this;
    }
}

/**
 * Phaser is a phaser effect. Phasers work by changing the phase
 * of different frequency components of an incoming signal. Read more on
 * [Wikipedia](https://en.wikipedia.org/wiki/Phaser_(effect)).
 * Inspiration for this phaser comes from [Tuna.js](https://github.com/Dinahmoe/tuna/).
 * @example
 * const phaser = new Tone.Phaser({
 * 	frequency: 15,
 * 	octaves: 5,
 * 	baseFrequency: 1000
 * }).toDestination();
 * const synth = new Tone.FMSynth().connect(phaser);
 * synth.triggerAttackRelease("E3", "2n");
 * @category Effect
 */
class Phaser extends StereoEffect {
    constructor() {
        super(optionsFromArguments(Phaser.getDefaults(), arguments, ["frequency", "octaves", "baseFrequency"]));
        this.name = "Phaser";
        const options = optionsFromArguments(Phaser.getDefaults(), arguments, ["frequency", "octaves", "baseFrequency"]);
        this._lfoL = new LFO({
            context: this.context,
            frequency: options.frequency,
            min: 0,
            max: 1
        });
        this._lfoR = new LFO({
            context: this.context,
            frequency: options.frequency,
            min: 0,
            max: 1,
            phase: 180,
        });
        this._baseFrequency = this.toFrequency(options.baseFrequency);
        this._octaves = options.octaves;
        this.Q = new Signal({
            context: this.context,
            value: options.Q,
            units: "positive",
        });
        this._filtersL = this._makeFilters(options.stages, this._lfoL);
        this._filtersR = this._makeFilters(options.stages, this._lfoR);
        this.frequency = this._lfoL.frequency;
        this.frequency.value = options.frequency;
        // connect them up
        this.connectEffectLeft(...this._filtersL);
        this.connectEffectRight(...this._filtersR);
        // control the frequency with one LFO
        this._lfoL.frequency.connect(this._lfoR.frequency);
        // set the options
        this.baseFrequency = options.baseFrequency;
        this.octaves = options.octaves;
        // start the lfo
        this._lfoL.start();
        this._lfoR.start();
        readOnly(this, ["frequency", "Q"]);
    }
    static getDefaults() {
        return Object.assign(StereoEffect.getDefaults(), {
            frequency: 0.5,
            octaves: 3,
            stages: 10,
            Q: 10,
            baseFrequency: 350,
        });
    }
    _makeFilters(stages, connectToFreq) {
        const filters = [];
        // make all the filters
        for (let i = 0; i < stages; i++) {
            const filter = this.context.createBiquadFilter();
            filter.type = "allpass";
            this.Q.connect(filter.Q);
            connectToFreq.connect(filter.frequency);
            filters.push(filter);
        }
        return filters;
    }
    /**
     * The number of octaves the phase goes above the baseFrequency
     */
    get octaves() {
        return this._octaves;
    }
    set octaves(octaves) {
        this._octaves = octaves;
        const max = this._baseFrequency * Math.pow(2, octaves);
        this._lfoL.max = max;
        this._lfoR.max = max;
    }
    /**
     * The the base frequency of the filters.
     */
    get baseFrequency() {
        return this._baseFrequency;
    }
    set baseFrequency(freq) {
        this._baseFrequency = this.toFrequency(freq);
        this._lfoL.min = this._baseFrequency;
        this._lfoR.min = this._baseFrequency;
        this.octaves = this._octaves;
    }
    dispose() {
        super.dispose();
        this.Q.dispose();
        this._lfoL.dispose();
        this._lfoR.dispose();
        this._filtersL.forEach(f => f.disconnect());
        this._filtersR.forEach(f => f.disconnect());
        this.frequency.dispose();
        return this;
    }
}

/**
 * Simple convolution created with decaying noise.
 * Generates an Impulse Response Buffer
 * with Tone.Offline then feeds the IR into ConvolverNode.
 * The impulse response generation is async, so you have
 * to wait until [[ready]] resolves before it will make a sound.
 *
 * Inspiration from [ReverbGen](https://github.com/adelespinasse/reverbGen).
 * Copyright (c) 2014 Alan deLespinasse Apache 2.0 License.
 *
 * @category Effect
 */
class Reverb extends Effect {
    constructor() {
        super(optionsFromArguments(Reverb.getDefaults(), arguments, ["decay"]));
        this.name = "Reverb";
        /**
         * Convolver node
         */
        this._convolver = this.context.createConvolver();
        /**
         * Resolves when the reverb buffer is generated. Whenever either [[decay]]
         * or [[preDelay]] are set, you have to wait until [[ready]] resolves
         * before the IR is generated with the latest values.
         */
        this.ready = Promise.resolve();
        const options = optionsFromArguments(Reverb.getDefaults(), arguments, ["decay"]);
        this._decay = options.decay;
        this._preDelay = options.preDelay;
        this.generate();
        this.connectEffect(this._convolver);
    }
    static getDefaults() {
        return Object.assign(Effect.getDefaults(), {
            decay: 1.5,
            preDelay: 0.01,
        });
    }
    /**
     * The duration of the reverb.
     */
    get decay() {
        return this._decay;
    }
    set decay(time) {
        time = this.toSeconds(time);
        assertRange(time, 0.001);
        this._decay = time;
        this.generate();
    }
    /**
     * The amount of time before the reverb is fully ramped in.
     */
    get preDelay() {
        return this._preDelay;
    }
    set preDelay(time) {
        time = this.toSeconds(time);
        assertRange(time, 0);
        this._preDelay = time;
        this.generate();
    }
    /**
     * Generate the Impulse Response. Returns a promise while the IR is being generated.
     * @return Promise which returns this object.
     */
    generate() {
        return __awaiter(this, void 0, void 0, function* () {
            const previousReady = this.ready;
            // create a noise burst which decays over the duration in each channel
            const context = new OfflineContext(2, this._decay + this._preDelay, this.context.sampleRate);
            const noiseL = new Noise({ context });
            const noiseR = new Noise({ context });
            const merge = new Merge({ context });
            noiseL.connect(merge, 0, 0);
            noiseR.connect(merge, 0, 1);
            const gainNode = new Gain({ context }).toDestination();
            merge.connect(gainNode);
            noiseL.start(0);
            noiseR.start(0);
            // predelay
            gainNode.gain.setValueAtTime(0, 0);
            gainNode.gain.setValueAtTime(1, this._preDelay);
            // decay
            gainNode.gain.exponentialApproachValueAtTime(0, this._preDelay, this.decay);
            // render the buffer
            const renderPromise = context.render();
            this.ready = renderPromise.then(noOp);
            // wait for the previous `ready` to resolve
            yield previousReady;
            // set the buffer
            this._convolver.buffer = (yield renderPromise).get();
            return this;
        });
    }
    dispose() {
        super.dispose();
        this._convolver.disconnect();
        return this;
    }
}

/**
 * Mid/Side processing separates the the 'mid' signal (which comes out of both the left and the right channel)
 * and the 'side' (which only comes out of the the side channels).
 * ```
 * Mid = (Left+Right)/sqrt(2);   // obtain mid-signal from left and right
 * Side = (Left-Right)/sqrt(2);   // obtain side-signal from left and right
 * ```
 * @category Component
 */
class MidSideSplit extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(MidSideSplit.getDefaults(), arguments));
        this.name = "MidSideSplit";
        this._split = this.input = new Split({
            channels: 2,
            context: this.context
        });
        this._midAdd = new Add({ context: this.context });
        this.mid = new Multiply({
            context: this.context,
            value: Math.SQRT1_2,
        });
        this._sideSubtract = new Subtract({ context: this.context });
        this.side = new Multiply({
            context: this.context,
            value: Math.SQRT1_2,
        });
        this._split.connect(this._midAdd, 0);
        this._split.connect(this._midAdd.addend, 1);
        this._split.connect(this._sideSubtract, 0);
        this._split.connect(this._sideSubtract.subtrahend, 1);
        this._midAdd.connect(this.mid);
        this._sideSubtract.connect(this.side);
    }
    dispose() {
        super.dispose();
        this.mid.dispose();
        this.side.dispose();
        this._midAdd.dispose();
        this._sideSubtract.dispose();
        this._split.dispose();
        return this;
    }
}

/**
 * MidSideMerge merges the mid and side signal after they've been separated by [[MidSideSplit]]
 * ```
 * Mid = (Left+Right)/sqrt(2);   // obtain mid-signal from left and right
 * Side = (Left-Right)/sqrt(2);   // obtain side-signal from left and right
 * ```
 * @category Component
 */
class MidSideMerge extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(MidSideMerge.getDefaults(), arguments));
        this.name = "MidSideMerge";
        this.mid = new Gain({ context: this.context });
        this.side = new Gain({ context: this.context });
        this._left = new Add({ context: this.context });
        this._leftMult = new Multiply({
            context: this.context,
            value: Math.SQRT1_2
        });
        this._right = new Subtract({ context: this.context });
        this._rightMult = new Multiply({
            context: this.context,
            value: Math.SQRT1_2
        });
        this._merge = this.output = new Merge({ context: this.context });
        this.mid.fan(this._left);
        this.side.connect(this._left.addend);
        this.mid.connect(this._right);
        this.side.connect(this._right.subtrahend);
        this._left.connect(this._leftMult);
        this._right.connect(this._rightMult);
        this._leftMult.connect(this._merge, 0, 0);
        this._rightMult.connect(this._merge, 0, 1);
    }
    dispose() {
        super.dispose();
        this.mid.dispose();
        this.side.dispose();
        this._leftMult.dispose();
        this._rightMult.dispose();
        this._left.dispose();
        this._right.dispose();
        return this;
    }
}

/**
 * Mid/Side processing separates the the 'mid' signal
 * (which comes out of both the left and the right channel)
 * and the 'side' (which only comes out of the the side channels)
 * and effects them separately before being recombined.
 * Applies a Mid/Side seperation and recombination.
 * Algorithm found in [kvraudio forums](http://www.kvraudio.com/forum/viewtopic.php?t=212587).
 * This is a base-class for Mid/Side Effects.
 * @category Effect
 */
class MidSideEffect extends Effect {
    constructor(options) {
        super(options);
        this.name = "MidSideEffect";
        this._midSideMerge = new MidSideMerge({ context: this.context });
        this._midSideSplit = new MidSideSplit({ context: this.context });
        this._midSend = this._midSideSplit.mid;
        this._sideSend = this._midSideSplit.side;
        this._midReturn = this._midSideMerge.mid;
        this._sideReturn = this._midSideMerge.side;
        // the connections
        this.effectSend.connect(this._midSideSplit);
        this._midSideMerge.connect(this.effectReturn);
    }
    /**
     * Connect the mid chain of the effect
     */
    connectEffectMid(...nodes) {
        this._midSend.chain(...nodes, this._midReturn);
    }
    /**
     * Connect the side chain of the effect
     */
    connectEffectSide(...nodes) {
        this._sideSend.chain(...nodes, this._sideReturn);
    }
    dispose() {
        super.dispose();
        this._midSideSplit.dispose();
        this._midSideMerge.dispose();
        this._midSend.dispose();
        this._sideSend.dispose();
        this._midReturn.dispose();
        this._sideReturn.dispose();
        return this;
    }
}

/**
 * Applies a width factor to the mid/side seperation.
 * 0 is all mid and 1 is all side.
 * Algorithm found in [kvraudio forums](http://www.kvraudio.com/forum/viewtopic.php?t=212587).
 * ```
 * Mid *= 2*(1-width)<br>
 * Side *= 2*width
 * ```
 * @category Effect
 */
class StereoWidener extends MidSideEffect {
    constructor() {
        super(optionsFromArguments(StereoWidener.getDefaults(), arguments, ["width"]));
        this.name = "StereoWidener";
        const options = optionsFromArguments(StereoWidener.getDefaults(), arguments, ["width"]);
        this.width = new Signal({
            context: this.context,
            value: options.width,
            units: "normalRange",
        });
        readOnly(this, ["width"]);
        this._twoTimesWidthMid = new Multiply({
            context: this.context,
            value: 2,
        });
        this._twoTimesWidthSide = new Multiply({
            context: this.context,
            value: 2,
        });
        this._midMult = new Multiply({ context: this.context });
        this._twoTimesWidthMid.connect(this._midMult.factor);
        this.connectEffectMid(this._midMult);
        this._oneMinusWidth = new Subtract({ context: this.context });
        this._oneMinusWidth.connect(this._twoTimesWidthMid);
        connect(this.context.getConstant(1), this._oneMinusWidth);
        this.width.connect(this._oneMinusWidth.subtrahend);
        this._sideMult = new Multiply({ context: this.context });
        this.width.connect(this._twoTimesWidthSide);
        this._twoTimesWidthSide.connect(this._sideMult.factor);
        this.connectEffectSide(this._sideMult);
    }
    static getDefaults() {
        return Object.assign(MidSideEffect.getDefaults(), {
            width: 0.5,
        });
    }
    dispose() {
        super.dispose();
        this.width.dispose();
        this._midMult.dispose();
        this._sideMult.dispose();
        this._twoTimesWidthMid.dispose();
        this._twoTimesWidthSide.dispose();
        this._oneMinusWidth.dispose();
        return this;
    }
}

/**
 * Tremolo modulates the amplitude of an incoming signal using an [[LFO]].
 * The effect is a stereo effect where the modulation phase is inverted in each channel.
 *
 * @example
 * // create a tremolo and start it's LFO
 * const tremolo = new Tone.Tremolo(9, 0.75).toDestination().start();
 * // route an oscillator through the tremolo and start it
 * const oscillator = new Tone.Oscillator().connect(tremolo).start();
 *
 * @category Effect
 */
class Tremolo extends StereoEffect {
    constructor() {
        super(optionsFromArguments(Tremolo.getDefaults(), arguments, ["frequency", "depth"]));
        this.name = "Tremolo";
        const options = optionsFromArguments(Tremolo.getDefaults(), arguments, ["frequency", "depth"]);
        this._lfoL = new LFO({
            context: this.context,
            type: options.type,
            min: 1,
            max: 0,
        });
        this._lfoR = new LFO({
            context: this.context,
            type: options.type,
            min: 1,
            max: 0,
        });
        this._amplitudeL = new Gain({ context: this.context });
        this._amplitudeR = new Gain({ context: this.context });
        this.frequency = new Signal({
            context: this.context,
            value: options.frequency,
            units: "frequency",
        });
        this.depth = new Signal({
            context: this.context,
            value: options.depth,
            units: "normalRange",
        });
        readOnly(this, ["frequency", "depth"]);
        this.connectEffectLeft(this._amplitudeL);
        this.connectEffectRight(this._amplitudeR);
        this._lfoL.connect(this._amplitudeL.gain);
        this._lfoR.connect(this._amplitudeR.gain);
        this.frequency.fan(this._lfoL.frequency, this._lfoR.frequency);
        this.depth.fan(this._lfoR.amplitude, this._lfoL.amplitude);
        this.spread = options.spread;
    }
    static getDefaults() {
        return Object.assign(StereoEffect.getDefaults(), {
            frequency: 10,
            type: "sine",
            depth: 0.5,
            spread: 180,
        });
    }
    /**
     * Start the tremolo.
     */
    start(time) {
        this._lfoL.start(time);
        this._lfoR.start(time);
        return this;
    }
    /**
     * Stop the tremolo.
     */
    stop(time) {
        this._lfoL.stop(time);
        this._lfoR.stop(time);
        return this;
    }
    /**
     * Sync the effect to the transport.
     */
    sync() {
        this._lfoL.sync();
        this._lfoR.sync();
        this.context.transport.syncSignal(this.frequency);
        return this;
    }
    /**
     * Unsync the filter from the transport
     */
    unsync() {
        this._lfoL.unsync();
        this._lfoR.unsync();
        this.context.transport.unsyncSignal(this.frequency);
        return this;
    }
    /**
     * The oscillator type.
     */
    get type() {
        return this._lfoL.type;
    }
    set type(type) {
        this._lfoL.type = type;
        this._lfoR.type = type;
    }
    /**
     * Amount of stereo spread. When set to 0, both LFO's will be panned centrally.
     * When set to 180, LFO's will be panned hard left and right respectively.
     */
    get spread() {
        return this._lfoR.phase - this._lfoL.phase; // 180
    }
    set spread(spread) {
        this._lfoL.phase = 90 - (spread / 2);
        this._lfoR.phase = (spread / 2) + 90;
    }
    dispose() {
        super.dispose();
        this._lfoL.dispose();
        this._lfoR.dispose();
        this._amplitudeL.dispose();
        this._amplitudeR.dispose();
        this.frequency.dispose();
        this.depth.dispose();
        return this;
    }
}

/**
 * A Vibrato effect composed of a Tone.Delay and a Tone.LFO. The LFO
 * modulates the delayTime of the delay, causing the pitch to rise and fall.
 * @category Effect
 */
class Vibrato extends Effect {
    constructor() {
        super(optionsFromArguments(Vibrato.getDefaults(), arguments, ["frequency", "depth"]));
        this.name = "Vibrato";
        const options = optionsFromArguments(Vibrato.getDefaults(), arguments, ["frequency", "depth"]);
        this._delayNode = new Delay({
            context: this.context,
            delayTime: 0,
            maxDelay: options.maxDelay,
        });
        this._lfo = new LFO({
            context: this.context,
            type: options.type,
            min: 0,
            max: options.maxDelay,
            frequency: options.frequency,
            phase: -90 // offse the phase so the resting position is in the center
        }).start().connect(this._delayNode.delayTime);
        this.frequency = this._lfo.frequency;
        this.depth = this._lfo.amplitude;
        this.depth.value = options.depth;
        readOnly(this, ["frequency", "depth"]);
        this.effectSend.chain(this._delayNode, this.effectReturn);
    }
    static getDefaults() {
        return Object.assign(Effect.getDefaults(), {
            maxDelay: 0.005,
            frequency: 5,
            depth: 0.1,
            type: "sine"
        });
    }
    /**
     * Type of oscillator attached to the Vibrato.
     */
    get type() {
        return this._lfo.type;
    }
    set type(type) {
        this._lfo.type = type;
    }
    dispose() {
        super.dispose();
        this._delayNode.dispose();
        this._lfo.dispose();
        this.frequency.dispose();
        this.depth.dispose();
        return this;
    }
}

/**
 * Wrapper around the native Web Audio's [AnalyserNode](http://webaudio.github.io/web-audio-api/#idl-def-AnalyserNode).
 * Extracts FFT or Waveform data from the incoming signal.
 * @category Component
 */
class Analyser extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(Analyser.getDefaults(), arguments, ["type", "size"]));
        this.name = "Analyser";
        /**
         * The analyser node.
         */
        this._analysers = [];
        /**
         * The buffer that the FFT data is written to
         */
        this._buffers = [];
        const options = optionsFromArguments(Analyser.getDefaults(), arguments, ["type", "size"]);
        this.input = this.output = this._gain = new Gain({ context: this.context });
        this._split = new Split({
            context: this.context,
            channels: options.channels,
        });
        this.input.connect(this._split);
        assertRange(options.channels, 1);
        // create the analysers
        for (let channel = 0; channel < options.channels; channel++) {
            this._analysers[channel] = this.context.createAnalyser();
            this._split.connect(this._analysers[channel], channel, 0);
        }
        // set the values initially
        this.size = options.size;
        this.type = options.type;
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            size: 1024,
            smoothing: 0.8,
            type: "fft",
            channels: 1,
        });
    }
    /**
     * Run the analysis given the current settings. If [[channels]] = 1,
     * it will return a Float32Array. If [[channels]] > 1, it will
     * return an array of Float32Arrays where each index in the array
     * represents the analysis done on a channel.
     */
    getValue() {
        this._analysers.forEach((analyser, index) => {
            const buffer = this._buffers[index];
            if (this._type === "fft") {
                analyser.getFloatFrequencyData(buffer);
            }
            else if (this._type === "waveform") {
                analyser.getFloatTimeDomainData(buffer);
            }
        });
        if (this.channels === 1) {
            return this._buffers[0];
        }
        else {
            return this._buffers;
        }
    }
    /**
     * The size of analysis. This must be a power of two in the range 16 to 16384.
     */
    get size() {
        return this._analysers[0].frequencyBinCount;
    }
    set size(size) {
        this._analysers.forEach((analyser, index) => {
            analyser.fftSize = size * 2;
            this._buffers[index] = new Float32Array(size);
        });
    }
    /**
     * The number of channels the analyser does the analysis on. Channel
     * separation is done using [[Split]]
     */
    get channels() {
        return this._analysers.length;
    }
    /**
     * The analysis function returned by analyser.getValue(), either "fft" or "waveform".
     */
    get type() {
        return this._type;
    }
    set type(type) {
        assert(type === "waveform" || type === "fft", `Analyser: invalid type: ${type}`);
        this._type = type;
    }
    /**
     * 0 represents no time averaging with the last analysis frame.
     */
    get smoothing() {
        return this._analysers[0].smoothingTimeConstant;
    }
    set smoothing(val) {
        this._analysers.forEach(a => a.smoothingTimeConstant = val);
    }
    /**
     * Clean up.
     */
    dispose() {
        super.dispose();
        this._analysers.forEach(a => a.disconnect());
        this._split.dispose();
        this._gain.dispose();
        return this;
    }
}

/**
 * The base class for Metering classes.
 */
class MeterBase extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(MeterBase.getDefaults(), arguments));
        this.name = "MeterBase";
        this.input = this.output = this._analyser = new Analyser({
            context: this.context,
            size: 256,
            type: "waveform",
        });
    }
    dispose() {
        super.dispose();
        this._analyser.dispose();
        return this;
    }
}

/**
 * Meter gets the [RMS](https://en.wikipedia.org/wiki/Root_mean_square)
 * of an input signal. It can also get the raw value of the input signal.
 *
 * @example
 * const meter = new Tone.Meter();
 * const mic = new Tone.UserMedia();
 * mic.open();
 * // connect mic to the meter
 * mic.connect(meter);
 * // the current level of the mic
 * setInterval(() => console.log(meter.getValue()), 100);
 * @category Component
 */
class Meter extends MeterBase {
    constructor() {
        super(optionsFromArguments(Meter.getDefaults(), arguments, ["smoothing"]));
        this.name = "Meter";
        /**
         * The previous frame's value
         */
        this._rms = 0;
        const options = optionsFromArguments(Meter.getDefaults(), arguments, ["smoothing"]);
        this.input = this.output = this._analyser = new Analyser({
            context: this.context,
            size: 256,
            type: "waveform",
            channels: options.channels,
        });
        this.smoothing = options.smoothing,
            this.normalRange = options.normalRange;
    }
    static getDefaults() {
        return Object.assign(MeterBase.getDefaults(), {
            smoothing: 0.8,
            normalRange: false,
            channels: 1,
        });
    }
    /**
     * Use [[getValue]] instead. For the previous getValue behavior, use DCMeter.
     * @deprecated
     */
    getLevel() {
        warn("'getLevel' has been changed to 'getValue'");
        return this.getValue();
    }
    /**
     * Get the current value of the incoming signal.
     * Output is in decibels when [[normalRange]] is `false`.
     * If [[channels]] = 1, then the output is a single number
     * representing the value of the input signal. When [[channels]] > 1,
     * then each channel is returned as a value in a number array.
     */
    getValue() {
        const aValues = this._analyser.getValue();
        const channelValues = this.channels === 1 ? [aValues] : aValues;
        const vals = channelValues.map(values => {
            const totalSquared = values.reduce((total, current) => total + current * current, 0);
            const rms = Math.sqrt(totalSquared / values.length);
            // the rms can only fall at the rate of the smoothing
            // but can jump up instantly
            this._rms = Math.max(rms, this._rms * this.smoothing);
            return this.normalRange ? this._rms : gainToDb(this._rms);
        });
        if (this.channels === 1) {
            return vals[0];
        }
        else {
            return vals;
        }
    }
    /**
     * The number of channels of analysis.
     */
    get channels() {
        return this._analyser.channels;
    }
    dispose() {
        super.dispose();
        this._analyser.dispose();
        return this;
    }
}

/**
 * Get the current frequency data of the connected audio source using a fast Fourier transform.
 * @category Component
 */
class FFT extends MeterBase {
    constructor() {
        super(optionsFromArguments(FFT.getDefaults(), arguments, ["size"]));
        this.name = "FFT";
        const options = optionsFromArguments(FFT.getDefaults(), arguments, ["size"]);
        this.normalRange = options.normalRange;
        this._analyser.type = "fft";
        this.size = options.size;
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            normalRange: false,
            size: 1024,
            smoothing: 0.8,
        });
    }
    /**
     * Gets the current frequency data from the connected audio source.
     * Returns the frequency data of length [[size]] as a Float32Array of decibel values.
     */
    getValue() {
        const values = this._analyser.getValue();
        return values.map(v => this.normalRange ? dbToGain(v) : v);
    }
    /**
     * The size of analysis. This must be a power of two in the range 16 to 16384.
     * Determines the size of the array returned by [[getValue]] (i.e. the number of
     * frequency bins). Large FFT sizes may be costly to compute.
     */
    get size() {
        return this._analyser.size;
    }
    set size(size) {
        this._analyser.size = size;
    }
    /**
     * 0 represents no time averaging with the last analysis frame.
     */
    get smoothing() {
        return this._analyser.smoothing;
    }
    set smoothing(val) {
        this._analyser.smoothing = val;
    }
    /**
     * Returns the frequency value in hertz of each of the indices of the FFT's [[getValue]] response.
     * @example
     * const fft = new Tone.FFT(32);
     * console.log([0, 1, 2, 3, 4].map(index => fft.getFrequencyOfIndex(index)));
     */
    getFrequencyOfIndex(index) {
        assert(0 <= index && index < this.size, `index must be greater than or equal to 0 and less than ${this.size}`);
        return index * this.context.sampleRate / (this.size * 2);
    }
}

/**
 * DCMeter gets the raw value of the input signal at the current time.
 *
 * @example
 * const meter = new Tone.DCMeter();
 * const mic = new Tone.UserMedia();
 * mic.open();
 * // connect mic to the meter
 * mic.connect(meter);
 * // the current level of the mic
 * const level = meter.getValue();
 * @category Component
 */
class DCMeter extends MeterBase {
    constructor() {
        super(optionsFromArguments(DCMeter.getDefaults(), arguments));
        this.name = "DCMeter";
        this._analyser.type = "waveform";
        this._analyser.size = 256;
    }
    /**
     * Get the signal value of the incoming signal
     */
    getValue() {
        const value = this._analyser.getValue();
        return value[0];
    }
}

/**
 * Get the current waveform data of the connected audio source.
 * @category Component
 */
class Waveform extends MeterBase {
    constructor() {
        super(optionsFromArguments(Waveform.getDefaults(), arguments, ["size"]));
        this.name = "Waveform";
        const options = optionsFromArguments(Waveform.getDefaults(), arguments, ["size"]);
        this._analyser.type = "waveform";
        this.size = options.size;
    }
    static getDefaults() {
        return Object.assign(MeterBase.getDefaults(), {
            size: 1024,
        });
    }
    /**
     * Return the waveform for the current time as a Float32Array where each value in the array
     * represents a sample in the waveform.
     */
    getValue() {
        return this._analyser.getValue();
    }
    /**
     * The size of analysis. This must be a power of two in the range 16 to 16384.
     * Determines the size of the array returned by [[getValue]].
     */
    get size() {
        return this._analyser.size;
    }
    set size(size) {
        this._analyser.size = size;
    }
}

/**
 * Solo lets you isolate a specific audio stream. When an instance is set to `solo=true`,
 * it will mute all other instances of Solo.
 * @example
 * const soloA = new Tone.Solo().toDestination();
 * const oscA = new Tone.Oscillator("C4", "sawtooth").connect(soloA);
 * const soloB = new Tone.Solo().toDestination();
 * const oscB = new Tone.Oscillator("E4", "square").connect(soloB);
 * soloA.solo = true;
 * // no audio will pass through soloB
 * @category Component
 */
class Solo extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(Solo.getDefaults(), arguments, ["solo"]));
        this.name = "Solo";
        const options = optionsFromArguments(Solo.getDefaults(), arguments, ["solo"]);
        this.input = this.output = new Gain({
            context: this.context,
        });
        if (!Solo._allSolos.has(this.context)) {
            Solo._allSolos.set(this.context, new Set());
        }
        Solo._allSolos.get(this.context).add(this);
        // set initially
        this.solo = options.solo;
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            solo: false,
        });
    }
    /**
     * Isolates this instance and mutes all other instances of Solo.
     * Only one instance can be soloed at a time. A soloed
     * instance will report `solo=false` when another instance is soloed.
     */
    get solo() {
        return this._isSoloed();
    }
    set solo(solo) {
        if (solo) {
            this._addSolo();
        }
        else {
            this._removeSolo();
        }
        Solo._allSolos.get(this.context).forEach(instance => instance._updateSolo());
    }
    /**
     * If the current instance is muted, i.e. another instance is soloed
     */
    get muted() {
        return this.input.gain.value === 0;
    }
    /**
     * Add this to the soloed array
     */
    _addSolo() {
        if (!Solo._soloed.has(this.context)) {
            Solo._soloed.set(this.context, new Set());
        }
        Solo._soloed.get(this.context).add(this);
    }
    /**
     * Remove this from the soloed array
     */
    _removeSolo() {
        if (Solo._soloed.has(this.context)) {
            Solo._soloed.get(this.context).delete(this);
        }
    }
    /**
     * Is this on the soloed array
     */
    _isSoloed() {
        return Solo._soloed.has(this.context) && Solo._soloed.get(this.context).has(this);
    }
    /**
     * Returns true if no one is soloed
     */
    _noSolos() {
        // either does not have any soloed added
        return !Solo._soloed.has(this.context) ||
            // or has a solo set but doesn't include any items
            (Solo._soloed.has(this.context) && Solo._soloed.get(this.context).size === 0);
    }
    /**
     * Solo the current instance and unsolo all other instances.
     */
    _updateSolo() {
        if (this._isSoloed()) {
            this.input.gain.value = 1;
        }
        else if (this._noSolos()) {
            // no one is soloed
            this.input.gain.value = 1;
        }
        else {
            this.input.gain.value = 0;
        }
    }
    dispose() {
        super.dispose();
        Solo._allSolos.get(this.context).delete(this);
        this._removeSolo();
        return this;
    }
}
/**
 * Hold all of the solo'ed tracks belonging to a specific context
 */
Solo._allSolos = new Map();
/**
 * Hold the currently solo'ed instance(s)
 */
Solo._soloed = new Map();

/**
 * PanVol is a Tone.Panner and Tone.Volume in one.
 * @example
 * // pan the incoming signal left and drop the volume
 * const panVol = new Tone.PanVol(-0.25, -12).toDestination();
 * const osc = new Tone.Oscillator().connect(panVol).start();
 * @category Component
 */
class PanVol extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(PanVol.getDefaults(), arguments, ["pan", "volume"]));
        this.name = "PanVol";
        const options = optionsFromArguments(PanVol.getDefaults(), arguments, ["pan", "volume"]);
        this._panner = this.input = new Panner({
            context: this.context,
            pan: options.pan,
            channelCount: options.channelCount,
        });
        this.pan = this._panner.pan;
        this._volume = this.output = new Volume({
            context: this.context,
            volume: options.volume,
        });
        this.volume = this._volume.volume;
        // connections
        this._panner.connect(this._volume);
        this.mute = options.mute;
        readOnly(this, ["pan", "volume"]);
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            mute: false,
            pan: 0,
            volume: 0,
            channelCount: 1,
        });
    }
    /**
     * Mute/unmute the volume
     */
    get mute() {
        return this._volume.mute;
    }
    set mute(mute) {
        this._volume.mute = mute;
    }
    dispose() {
        super.dispose();
        this._panner.dispose();
        this.pan.dispose();
        this._volume.dispose();
        this.volume.dispose();
        return this;
    }
}

/**
 * Channel provides a channel strip interface with volume, pan, solo and mute controls.
 * See [[PanVol]] and [[Solo]]
 * @example
 * // pan the incoming signal left and drop the volume 12db
 * const channel = new Tone.Channel(-0.25, -12);
 * @category Component
 */
class Channel extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(Channel.getDefaults(), arguments, ["volume", "pan"]));
        this.name = "Channel";
        const options = optionsFromArguments(Channel.getDefaults(), arguments, ["volume", "pan"]);
        this._solo = this.input = new Solo({
            solo: options.solo,
            context: this.context,
        });
        this._panVol = this.output = new PanVol({
            context: this.context,
            pan: options.pan,
            volume: options.volume,
            mute: options.mute,
            channelCount: options.channelCount
        });
        this.pan = this._panVol.pan;
        this.volume = this._panVol.volume;
        this._solo.connect(this._panVol);
        readOnly(this, ["pan", "volume"]);
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            pan: 0,
            volume: 0,
            mute: false,
            solo: false,
            channelCount: 1,
        });
    }
    /**
     * Solo/unsolo the channel. Soloing is only relative to other [[Channels]] and [[Solo]] instances
     */
    get solo() {
        return this._solo.solo;
    }
    set solo(solo) {
        this._solo.solo = solo;
    }
    /**
     * If the current instance is muted, i.e. another instance is soloed,
     * or the channel is muted
     */
    get muted() {
        return this._solo.muted || this.mute;
    }
    /**
     * Mute/unmute the volume
     */
    get mute() {
        return this._panVol.mute;
    }
    set mute(mute) {
        this._panVol.mute = mute;
    }
    /**
     * Get the gain node belonging to the bus name. Create it if
     * it doesn't exist
     * @param name The bus name
     */
    _getBus(name) {
        if (!Channel.buses.has(name)) {
            Channel.buses.set(name, new Gain({ context: this.context }));
        }
        return Channel.buses.get(name);
    }
    /**
     * Send audio to another channel using a string. `send` is a lot like
     * [[connect]], except it uses a string instead of an object. This can
     * be useful in large applications to decouple sections since [[send]]
     * and [[receive]] can be invoked separately in order to connect an object
     * @param name The channel name to send the audio
     * @param volume The amount of the signal to send.
     * 	Defaults to 0db, i.e. send the entire signal
     * @returns Returns the gain node of this connection.
     */
    send(name, volume = 0) {
        const bus = this._getBus(name);
        const sendKnob = new Gain({
            context: this.context,
            units: "decibels",
            gain: volume,
        });
        this.connect(sendKnob);
        sendKnob.connect(bus);
        return sendKnob;
    }
    /**
     * Receive audio from a channel which was connected with [[send]].
     * @param name The channel name to receive audio from.
     */
    receive(name) {
        const bus = this._getBus(name);
        bus.connect(this);
        return this;
    }
    dispose() {
        super.dispose();
        this._panVol.dispose();
        this.pan.dispose();
        this.volume.dispose();
        this._solo.dispose();
        return this;
    }
}
/**
 * Store the send/receive channels by name.
 */
Channel.buses = new Map();

/**
 * Mono coerces the incoming mono or stereo signal into a mono signal
 * where both left and right channels have the same value. This can be useful
 * for [stereo imaging](https://en.wikipedia.org/wiki/Stereo_imaging).
 * @category Component
 */
class Mono extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(Mono.getDefaults(), arguments));
        this.name = "Mono";
        this.input = new Gain({ context: this.context });
        this._merge = this.output = new Merge({
            channels: 2,
            context: this.context,
        });
        this.input.connect(this._merge, 0, 0);
        this.input.connect(this._merge, 0, 1);
    }
    dispose() {
        super.dispose();
        this._merge.dispose();
        this.input.dispose();
        return this;
    }
}

/**
 * Split the incoming signal into three bands (low, mid, high)
 * with two crossover frequency controls.
 * ```
 *            +----------------------+
 *          +-> input < lowFrequency +------------------> low
 *          | +----------------------+
 *          |
 *          | +--------------------------------------+
 * input ---+-> lowFrequency < input < highFrequency +--> mid
 *          | +--------------------------------------+
 *          |
 *          | +-----------------------+
 *          +-> highFrequency < input +-----------------> high
 *            +-----------------------+
 * ```
 * @category Component
 */
class MultibandSplit extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(MultibandSplit.getDefaults(), arguments, ["lowFrequency", "highFrequency"]));
        this.name = "MultibandSplit";
        /**
         * the input
         */
        this.input = new Gain({ context: this.context });
        /**
         * no output node, use either low, mid or high outputs
         */
        this.output = undefined;
        /**
         * The low band.
         */
        this.low = new Filter({
            context: this.context,
            frequency: 0,
            type: "lowpass",
        });
        /**
         * the lower filter of the mid band
         */
        this._lowMidFilter = new Filter({
            context: this.context,
            frequency: 0,
            type: "highpass",
        });
        /**
         * The mid band output.
         */
        this.mid = new Filter({
            context: this.context,
            frequency: 0,
            type: "lowpass",
        });
        /**
         * The high band output.
         */
        this.high = new Filter({
            context: this.context,
            frequency: 0,
            type: "highpass",
        });
        this._internalChannels = [this.low, this.mid, this.high];
        const options = optionsFromArguments(MultibandSplit.getDefaults(), arguments, ["lowFrequency", "highFrequency"]);
        this.lowFrequency = new Signal({
            context: this.context,
            units: "frequency",
            value: options.lowFrequency,
        });
        this.highFrequency = new Signal({
            context: this.context,
            units: "frequency",
            value: options.highFrequency,
        });
        this.Q = new Signal({
            context: this.context,
            units: "positive",
            value: options.Q,
        });
        this.input.fan(this.low, this.high);
        this.input.chain(this._lowMidFilter, this.mid);
        // the frequency control signal
        this.lowFrequency.fan(this.low.frequency, this._lowMidFilter.frequency);
        this.highFrequency.fan(this.mid.frequency, this.high.frequency);
        // the Q value
        this.Q.connect(this.low.Q);
        this.Q.connect(this._lowMidFilter.Q);
        this.Q.connect(this.mid.Q);
        this.Q.connect(this.high.Q);
        readOnly(this, ["high", "mid", "low", "highFrequency", "lowFrequency"]);
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            Q: 1,
            highFrequency: 2500,
            lowFrequency: 400,
        });
    }
    /**
     * Clean up.
     */
    dispose() {
        super.dispose();
        writable(this, ["high", "mid", "low", "highFrequency", "lowFrequency"]);
        this.low.dispose();
        this._lowMidFilter.dispose();
        this.mid.dispose();
        this.high.dispose();
        this.lowFrequency.dispose();
        this.highFrequency.dispose();
        this.Q.dispose();
        return this;
    }
}

/**
 * Tone.Listener is a thin wrapper around the AudioListener. Listener combined
 * with [[Panner3D]] makes up the Web Audio API's 3D panning system. Panner3D allows you
 * to place sounds in 3D and Listener allows you to navigate the 3D sound environment from
 * a first-person perspective. There is only one listener per audio context.
 */
class Listener extends ToneAudioNode {
    constructor() {
        super(...arguments);
        this.name = "Listener";
        this.positionX = new Param({
            context: this.context,
            param: this.context.rawContext.listener.positionX,
        });
        this.positionY = new Param({
            context: this.context,
            param: this.context.rawContext.listener.positionY,
        });
        this.positionZ = new Param({
            context: this.context,
            param: this.context.rawContext.listener.positionZ,
        });
        this.forwardX = new Param({
            context: this.context,
            param: this.context.rawContext.listener.forwardX,
        });
        this.forwardY = new Param({
            context: this.context,
            param: this.context.rawContext.listener.forwardY,
        });
        this.forwardZ = new Param({
            context: this.context,
            param: this.context.rawContext.listener.forwardZ,
        });
        this.upX = new Param({
            context: this.context,
            param: this.context.rawContext.listener.upX,
        });
        this.upY = new Param({
            context: this.context,
            param: this.context.rawContext.listener.upY,
        });
        this.upZ = new Param({
            context: this.context,
            param: this.context.rawContext.listener.upZ,
        });
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            positionX: 0,
            positionY: 0,
            positionZ: 0,
            forwardX: 0,
            forwardY: 0,
            forwardZ: -1,
            upX: 0,
            upY: 1,
            upZ: 0,
        });
    }
    dispose() {
        super.dispose();
        this.positionX.dispose();
        this.positionY.dispose();
        this.positionZ.dispose();
        this.forwardX.dispose();
        this.forwardY.dispose();
        this.forwardZ.dispose();
        this.upX.dispose();
        this.upY.dispose();
        this.upZ.dispose();
        return this;
    }
}
//-------------------------------------
// 	INITIALIZATION
//-------------------------------------
onContextInit(context => {
    context.listener = new Listener({ context });
});
onContextClose(context => {
    context.listener.dispose();
});

/**
 * A spatialized panner node which supports equalpower or HRTF panning.
 * @category Component
 */
class Panner3D extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(Panner3D.getDefaults(), arguments, ["positionX", "positionY", "positionZ"]));
        this.name = "Panner3D";
        const options = optionsFromArguments(Panner3D.getDefaults(), arguments, ["positionX", "positionY", "positionZ"]);
        this._panner = this.input = this.output = this.context.createPanner();
        // set some values
        this.panningModel = options.panningModel;
        this.maxDistance = options.maxDistance;
        this.distanceModel = options.distanceModel;
        this.coneOuterGain = options.coneOuterGain;
        this.coneOuterAngle = options.coneOuterAngle;
        this.coneInnerAngle = options.coneInnerAngle;
        this.refDistance = options.refDistance;
        this.rolloffFactor = options.rolloffFactor;
        this.positionX = new Param({
            context: this.context,
            param: this._panner.positionX,
            value: options.positionX,
        });
        this.positionY = new Param({
            context: this.context,
            param: this._panner.positionY,
            value: options.positionY,
        });
        this.positionZ = new Param({
            context: this.context,
            param: this._panner.positionZ,
            value: options.positionZ,
        });
        this.orientationX = new Param({
            context: this.context,
            param: this._panner.orientationX,
            value: options.orientationX,
        });
        this.orientationY = new Param({
            context: this.context,
            param: this._panner.orientationY,
            value: options.orientationY,
        });
        this.orientationZ = new Param({
            context: this.context,
            param: this._panner.orientationZ,
            value: options.orientationZ,
        });
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            coneInnerAngle: 360,
            coneOuterAngle: 360,
            coneOuterGain: 0,
            distanceModel: "inverse",
            maxDistance: 10000,
            orientationX: 0,
            orientationY: 0,
            orientationZ: 0,
            panningModel: "equalpower",
            positionX: 0,
            positionY: 0,
            positionZ: 0,
            refDistance: 1,
            rolloffFactor: 1,
        });
    }
    /**
     * Sets the position of the source in 3d space.
     */
    setPosition(x, y, z) {
        this.positionX.value = x;
        this.positionY.value = y;
        this.positionZ.value = z;
        return this;
    }
    /**
     * Sets the orientation of the source in 3d space.
     */
    setOrientation(x, y, z) {
        this.orientationX.value = x;
        this.orientationY.value = y;
        this.orientationZ.value = z;
        return this;
    }
    /**
     * The panning model. Either "equalpower" or "HRTF".
     */
    get panningModel() {
        return this._panner.panningModel;
    }
    set panningModel(val) {
        this._panner.panningModel = val;
    }
    /**
     * A reference distance for reducing volume as source move further from the listener
     */
    get refDistance() {
        return this._panner.refDistance;
    }
    set refDistance(val) {
        this._panner.refDistance = val;
    }
    /**
     * Describes how quickly the volume is reduced as source moves away from listener.
     */
    get rolloffFactor() {
        return this._panner.rolloffFactor;
    }
    set rolloffFactor(val) {
        this._panner.rolloffFactor = val;
    }
    /**
     * The distance model used by,  "linear", "inverse", or "exponential".
     */
    get distanceModel() {
        return this._panner.distanceModel;
    }
    set distanceModel(val) {
        this._panner.distanceModel = val;
    }
    /**
     * The angle, in degrees, inside of which there will be no volume reduction
     */
    get coneInnerAngle() {
        return this._panner.coneInnerAngle;
    }
    set coneInnerAngle(val) {
        this._panner.coneInnerAngle = val;
    }
    /**
     * The angle, in degrees, outside of which the volume will be reduced
     * to a constant value of coneOuterGain
     */
    get coneOuterAngle() {
        return this._panner.coneOuterAngle;
    }
    set coneOuterAngle(val) {
        this._panner.coneOuterAngle = val;
    }
    /**
     * The gain outside of the coneOuterAngle
     */
    get coneOuterGain() {
        return this._panner.coneOuterGain;
    }
    set coneOuterGain(val) {
        this._panner.coneOuterGain = val;
    }
    /**
     * The maximum distance between source and listener,
     * after which the volume will not be reduced any further.
     */
    get maxDistance() {
        return this._panner.maxDistance;
    }
    set maxDistance(val) {
        this._panner.maxDistance = val;
    }
    dispose() {
        super.dispose();
        this._panner.disconnect();
        this.orientationX.dispose();
        this.orientationY.dispose();
        this.orientationZ.dispose();
        this.positionX.dispose();
        this.positionY.dispose();
        this.positionZ.dispose();
        return this;
    }
}

/**
 * A wrapper around the MediaRecorder API. Unlike the rest of Tone.js, this module does not offer
 * any sample-accurate scheduling because it is not a feature of the MediaRecorder API.
 * This is only natively supported in Chrome and Firefox.
 * For a cross-browser shim, install (audio-recorder-polyfill)[https://www.npmjs.com/package/audio-recorder-polyfill].
 * @example
 * const recorder = new Tone.Recorder();
 * const synth = new Tone.Synth().connect(recorder);
 * // start recording
 * recorder.start();
 * // generate a few notes
 * synth.triggerAttackRelease("C3", 0.5);
 * synth.triggerAttackRelease("C4", 0.5, "+1");
 * synth.triggerAttackRelease("C5", 0.5, "+2");
 * // wait for the notes to end and stop the recording
 * setTimeout(async () => {
 * 	// the recorded audio is returned as a blob
 * 	const recording = await recorder.stop();
 * 	// download the recording by creating an anchor element and blob url
 * 	const url = URL.createObjectURL(recording);
 * 	const anchor = document.createElement("a");
 * 	anchor.download = "recording.webm";
 * 	anchor.href = url;
 * 	anchor.click();
 * }, 4000);
 * @category Component
 */
class Recorder extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(Recorder.getDefaults(), arguments));
        this.name = "Recorder";
        const options = optionsFromArguments(Recorder.getDefaults(), arguments);
        this.input = new Gain({
            context: this.context
        });
        assert(Recorder.supported, "Media Recorder API is not available");
        this._stream = this.context.createMediaStreamDestination();
        this.input.connect(this._stream);
        this._recorder = new MediaRecorder(this._stream.stream, {
            mimeType: options.mimeType
        });
    }
    static getDefaults() {
        return ToneAudioNode.getDefaults();
    }
    /**
     * The mime type is the format that the audio is encoded in. For Chrome
     * that is typically webm encoded as "vorbis".
     */
    get mimeType() {
        return this._recorder.mimeType;
    }
    /**
     * Test if your platform supports the Media Recorder API. If it's not available,
     * try installing this (polyfill)[https://www.npmjs.com/package/audio-recorder-polyfill].
     */
    static get supported() {
        return theWindow !== null && Reflect.has(theWindow, "MediaRecorder");
    }
    /**
     * Get the playback state of the Recorder, either "started", "stopped" or "paused"
     */
    get state() {
        if (this._recorder.state === "inactive") {
            return "stopped";
        }
        else if (this._recorder.state === "paused") {
            return "paused";
        }
        else {
            return "started";
        }
    }
    /**
     * Start the Recorder. Returns a promise which resolves
     * when the recorder has started.
     */
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            assert(this.state !== "started", "Recorder is already started");
            const startPromise = new Promise(done => {
                const handleStart = () => {
                    this._recorder.removeEventListener("start", handleStart, false);
                    done();
                };
                this._recorder.addEventListener("start", handleStart, false);
            });
            this._recorder.start();
            return yield startPromise;
        });
    }
    /**
     * Stop the recorder. Returns a promise with the recorded content until this point
     * encoded as [[mimeType]]
     */
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            assert(this.state !== "stopped", "Recorder is not started");
            const dataPromise = new Promise(done => {
                const handleData = (e) => {
                    this._recorder.removeEventListener("dataavailable", handleData, false);
                    done(e.data);
                };
                this._recorder.addEventListener("dataavailable", handleData, false);
            });
            this._recorder.stop();
            return yield dataPromise;
        });
    }
    /**
     * Pause the recorder
     */
    pause() {
        assert(this.state === "started", "Recorder must be started");
        this._recorder.pause();
        return this;
    }
    dispose() {
        super.dispose();
        this.input.dispose();
        this._stream.disconnect();
        return this;
    }
}

/**
 * Compressor is a thin wrapper around the Web Audio
 * [DynamicsCompressorNode](http://webaudio.github.io/web-audio-api/#the-dynamicscompressornode-interface).
 * Compression reduces the volume of loud sounds or amplifies quiet sounds
 * by narrowing or "compressing" an audio signal's dynamic range.
 * Read more on [Wikipedia](https://en.wikipedia.org/wiki/Dynamic_range_compression).
 * @example
 * const comp = new Tone.Compressor(-30, 3);
 * @category Component
 */
class Compressor extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(Compressor.getDefaults(), arguments, ["threshold", "ratio"]));
        this.name = "Compressor";
        /**
         * the compressor node
         */
        this._compressor = this.context.createDynamicsCompressor();
        this.input = this._compressor;
        this.output = this._compressor;
        const options = optionsFromArguments(Compressor.getDefaults(), arguments, ["threshold", "ratio"]);
        this.threshold = new Param({
            minValue: this._compressor.threshold.minValue,
            maxValue: this._compressor.threshold.maxValue,
            context: this.context,
            convert: false,
            param: this._compressor.threshold,
            units: "decibels",
            value: options.threshold,
        });
        this.attack = new Param({
            minValue: this._compressor.attack.minValue,
            maxValue: this._compressor.attack.maxValue,
            context: this.context,
            param: this._compressor.attack,
            units: "time",
            value: options.attack,
        });
        this.release = new Param({
            minValue: this._compressor.release.minValue,
            maxValue: this._compressor.release.maxValue,
            context: this.context,
            param: this._compressor.release,
            units: "time",
            value: options.release,
        });
        this.knee = new Param({
            minValue: this._compressor.knee.minValue,
            maxValue: this._compressor.knee.maxValue,
            context: this.context,
            convert: false,
            param: this._compressor.knee,
            units: "decibels",
            value: options.knee,
        });
        this.ratio = new Param({
            minValue: this._compressor.ratio.minValue,
            maxValue: this._compressor.ratio.maxValue,
            context: this.context,
            convert: false,
            param: this._compressor.ratio,
            units: "positive",
            value: options.ratio,
        });
        // set the defaults
        readOnly(this, ["knee", "release", "attack", "ratio", "threshold"]);
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            attack: 0.003,
            knee: 30,
            ratio: 12,
            release: 0.25,
            threshold: -24,
        });
    }
    /**
     * A read-only decibel value for metering purposes, representing the current amount of gain
     * reduction that the compressor is applying to the signal. If fed no signal the value will be 0 (no gain reduction).
     */
    get reduction() {
        return this._compressor.reduction;
    }
    dispose() {
        super.dispose();
        this._compressor.disconnect();
        this.attack.dispose();
        this.release.dispose();
        this.threshold.dispose();
        this.ratio.dispose();
        this.knee.dispose();
        return this;
    }
}

/**
 * Gate only passes a signal through when the incoming
 * signal exceeds a specified threshold. It uses [[Follower]] to follow the ampltiude
 * of the incoming signal and compares it to the [[threshold]] value using [[GreaterThan]].
 *
 * @example
 * const gate = new Tone.Gate(-30, 0.2).toDestination();
 * const mic = new Tone.UserMedia().connect(gate);
 * // the gate will only pass through the incoming
 * // signal when it's louder than -30db
 * @category Component
 */
class Gate extends ToneAudioNode {
    constructor() {
        super(Object.assign(optionsFromArguments(Gate.getDefaults(), arguments, ["threshold", "smoothing"])));
        this.name = "Gate";
        const options = optionsFromArguments(Gate.getDefaults(), arguments, ["threshold", "smoothing"]);
        this._follower = new Follower({
            context: this.context,
            smoothing: options.smoothing,
        });
        this._gt = new GreaterThan({
            context: this.context,
            value: dbToGain(options.threshold),
        });
        this.input = new Gain({ context: this.context });
        this._gate = this.output = new Gain({ context: this.context });
        // connections
        this.input.connect(this._gate);
        // the control signal
        this.input.chain(this._follower, this._gt, this._gate.gain);
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            smoothing: 0.1,
            threshold: -40
        });
    }
    /**
     * The threshold of the gate in decibels
     */
    get threshold() {
        return gainToDb(this._gt.value);
    }
    set threshold(thresh) {
        this._gt.value = dbToGain(thresh);
    }
    /**
     * The attack/decay speed of the gate. See [[Follower.smoothing]]
     */
    get smoothing() {
        return this._follower.smoothing;
    }
    set smoothing(smoothingTime) {
        this._follower.smoothing = smoothingTime;
    }
    dispose() {
        super.dispose();
        this.input.dispose();
        this._follower.dispose();
        this._gt.dispose();
        this._gate.dispose();
        return this;
    }
}

/**
 * Limiter will limit the loudness of an incoming signal.
 * Under the hood it's composed of a [[Compressor]] with a fast attack
 * and release and max compression ratio.
 *
 * @example
 * const limiter = new Tone.Limiter(-20).toDestination();
 * const oscillator = new Tone.Oscillator().connect(limiter);
 * oscillator.start();
 * @category Component
 */
class Limiter extends ToneAudioNode {
    constructor() {
        super(Object.assign(optionsFromArguments(Limiter.getDefaults(), arguments, ["threshold"])));
        this.name = "Limiter";
        const options = optionsFromArguments(Limiter.getDefaults(), arguments, ["threshold"]);
        this._compressor = this.input = this.output = new Compressor({
            context: this.context,
            ratio: 20,
            attack: 0.003,
            release: 0.01,
            threshold: options.threshold
        });
        this.threshold = this._compressor.threshold;
        readOnly(this, "threshold");
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            threshold: -12
        });
    }
    /**
     * A read-only decibel value for metering purposes, representing the current amount of gain
     * reduction that the compressor is applying to the signal.
     */
    get reduction() {
        return this._compressor.reduction;
    }
    dispose() {
        super.dispose();
        this._compressor.dispose();
        this.threshold.dispose();
        return this;
    }
}

/**
 * MidSideCompressor applies two different compressors to the [[mid]]
 * and [[side]] signal components of the input. See [[MidSideSplit]] and [[MidSideMerge]].
 * @category Component
 */
class MidSideCompressor extends ToneAudioNode {
    constructor() {
        super(Object.assign(optionsFromArguments(MidSideCompressor.getDefaults(), arguments)));
        this.name = "MidSideCompressor";
        const options = optionsFromArguments(MidSideCompressor.getDefaults(), arguments);
        this._midSideSplit = this.input = new MidSideSplit({ context: this.context });
        this._midSideMerge = this.output = new MidSideMerge({ context: this.context });
        this.mid = new Compressor(Object.assign(options.mid, { context: this.context }));
        this.side = new Compressor(Object.assign(options.side, { context: this.context }));
        this._midSideSplit.mid.chain(this.mid, this._midSideMerge.mid);
        this._midSideSplit.side.chain(this.side, this._midSideMerge.side);
        readOnly(this, ["mid", "side"]);
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            mid: {
                ratio: 3,
                threshold: -24,
                release: 0.03,
                attack: 0.02,
                knee: 16
            },
            side: {
                ratio: 6,
                threshold: -30,
                release: 0.25,
                attack: 0.03,
                knee: 10
            }
        });
    }
    dispose() {
        super.dispose();
        this.mid.dispose();
        this.side.dispose();
        this._midSideSplit.dispose();
        this._midSideMerge.dispose();
        return this;
    }
}

/**
 * A compressor with separate controls over low/mid/high dynamics. See [[Compressor]] and [[MultibandSplit]]
 *
 * @example
 * const multiband = new Tone.MultibandCompressor({
 * 	lowFrequency: 200,
 * 	highFrequency: 1300,
 * 	low: {
 * 		threshold: -12
 * 	}
 * });
 * @category Component
 */
class MultibandCompressor extends ToneAudioNode {
    constructor() {
        super(Object.assign(optionsFromArguments(MultibandCompressor.getDefaults(), arguments)));
        this.name = "MultibandCompressor";
        const options = optionsFromArguments(MultibandCompressor.getDefaults(), arguments);
        this._splitter = this.input = new MultibandSplit({
            context: this.context,
            lowFrequency: options.lowFrequency,
            highFrequency: options.highFrequency
        });
        this.lowFrequency = this._splitter.lowFrequency;
        this.highFrequency = this._splitter.highFrequency;
        this.output = new Gain({ context: this.context });
        this.low = new Compressor(Object.assign(options.low, { context: this.context }));
        this.mid = new Compressor(Object.assign(options.mid, { context: this.context }));
        this.high = new Compressor(Object.assign(options.high, { context: this.context }));
        // connect the compressor
        this._splitter.low.chain(this.low, this.output);
        this._splitter.mid.chain(this.mid, this.output);
        this._splitter.high.chain(this.high, this.output);
        readOnly(this, ["high", "mid", "low", "highFrequency", "lowFrequency"]);
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            lowFrequency: 250,
            highFrequency: 2000,
            low: {
                ratio: 6,
                threshold: -30,
                release: 0.25,
                attack: 0.03,
                knee: 10
            },
            mid: {
                ratio: 3,
                threshold: -24,
                release: 0.03,
                attack: 0.02,
                knee: 16
            },
            high: {
                ratio: 3,
                threshold: -24,
                release: 0.03,
                attack: 0.02,
                knee: 16
            },
        });
    }
    dispose() {
        super.dispose();
        this._splitter.dispose();
        this.low.dispose();
        this.mid.dispose();
        this.high.dispose();
        this.output.dispose();
        return this;
    }
}

/**
 * EQ3 provides 3 equalizer bins: Low/Mid/High.
 * @category Component
 */
class EQ3 extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(EQ3.getDefaults(), arguments, ["low", "mid", "high"]));
        this.name = "EQ3";
        /**
         * the output
         */
        this.output = new Gain({ context: this.context });
        this._internalChannels = [];
        const options = optionsFromArguments(EQ3.getDefaults(), arguments, ["low", "mid", "high"]);
        this.input = this._multibandSplit = new MultibandSplit({
            context: this.context,
            highFrequency: options.highFrequency,
            lowFrequency: options.lowFrequency,
        });
        this._lowGain = new Gain({
            context: this.context,
            gain: options.low,
            units: "decibels",
        });
        this._midGain = new Gain({
            context: this.context,
            gain: options.mid,
            units: "decibels",
        });
        this._highGain = new Gain({
            context: this.context,
            gain: options.high,
            units: "decibels",
        });
        this.low = this._lowGain.gain;
        this.mid = this._midGain.gain;
        this.high = this._highGain.gain;
        this.Q = this._multibandSplit.Q;
        this.lowFrequency = this._multibandSplit.lowFrequency;
        this.highFrequency = this._multibandSplit.highFrequency;
        // the frequency bands
        this._multibandSplit.low.chain(this._lowGain, this.output);
        this._multibandSplit.mid.chain(this._midGain, this.output);
        this._multibandSplit.high.chain(this._highGain, this.output);
        readOnly(this, ["low", "mid", "high", "lowFrequency", "highFrequency"]);
        this._internalChannels = [this._multibandSplit];
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            high: 0,
            highFrequency: 2500,
            low: 0,
            lowFrequency: 400,
            mid: 0,
        });
    }
    /**
     * Clean up.
     */
    dispose() {
        super.dispose();
        writable(this, ["low", "mid", "high", "lowFrequency", "highFrequency"]);
        this._multibandSplit.dispose();
        this.lowFrequency.dispose();
        this.highFrequency.dispose();
        this._lowGain.dispose();
        this._midGain.dispose();
        this._highGain.dispose();
        this.low.dispose();
        this.mid.dispose();
        this.high.dispose();
        this.Q.dispose();
        return this;
    }
}

/**
 * Convolver is a wrapper around the Native Web Audio
 * [ConvolverNode](http://webaudio.github.io/web-audio-api/#the-convolvernode-interface).
 * Convolution is useful for reverb and filter emulation. Read more about convolution reverb on
 * [Wikipedia](https://en.wikipedia.org/wiki/Convolution_reverb).
 *
 * @example
 * // initializing the convolver with an impulse response
 * const convolver = new Tone.Convolver("./path/to/ir.wav").toDestination();
 * @category Component
 */
class Convolver extends ToneAudioNode {
    constructor() {
        super(optionsFromArguments(Convolver.getDefaults(), arguments, ["url", "onload"]));
        this.name = "Convolver";
        /**
         * The native ConvolverNode
         */
        this._convolver = this.context.createConvolver();
        const options = optionsFromArguments(Convolver.getDefaults(), arguments, ["url", "onload"]);
        this._buffer = new ToneAudioBuffer(options.url, buffer => {
            this.buffer = buffer;
            options.onload();
        });
        this.input = new Gain({ context: this.context });
        this.output = new Gain({ context: this.context });
        // set if it's already loaded, set it immediately
        if (this._buffer.loaded) {
            this.buffer = this._buffer;
        }
        // initially set normalization
        this.normalize = options.normalize;
        // connect it up
        this.input.chain(this._convolver, this.output);
    }
    static getDefaults() {
        return Object.assign(ToneAudioNode.getDefaults(), {
            normalize: true,
            onload: noOp,
        });
    }
    /**
     * Load an impulse response url as an audio buffer.
     * Decodes the audio asynchronously and invokes
     * the callback once the audio buffer loads.
     * @param url The url of the buffer to load. filetype support depends on the browser.
     */
    load(url) {
        return __awaiter(this, void 0, void 0, function* () {
            this.buffer = yield this._buffer.load(url);
        });
    }
    /**
     * The convolver's buffer
     */
    get buffer() {
        if (this._buffer.length) {
            return this._buffer;
        }
        else {
            return null;
        }
    }
    set buffer(buffer) {
        if (buffer) {
            this._buffer.set(buffer);
        }
        // if it's already got a buffer, create a new one
        if (this._convolver.buffer) {
            // disconnect the old one
            this.input.disconnect();
            this._convolver.disconnect();
            // create and connect a new one
            this._convolver = this.context.createConvolver();
            this.input.chain(this._convolver, this.output);
        }
        const buff = this._buffer.get();
        this._convolver.buffer = buff ? buff : null;
    }
    /**
     * The normalize property of the ConvolverNode interface is a boolean that
     * controls whether the impulse response from the buffer will be scaled by
     * an equal-power normalization when the buffer attribute is set, or not.
     */
    get normalize() {
        return this._convolver.normalize;
    }
    set normalize(norm) {
        this._convolver.normalize = norm;
    }
    dispose() {
        super.dispose();
        this._buffer.dispose();
        this._convolver.disconnect();
        return this;
    }
}

/**
 * The current audio context time of the global [[Context]].
 * See [[Context.now]]
 * @category Core
 */
function now() {
    return getContext().now();
}
/**
 * The current audio context time of the global [[Context]] without the [[Context.lookAhead]]
 * See [[Context.immediate]]
 * @category Core
 */
function immediate() {
    return getContext().immediate();
}
/**
 * The Transport object belonging to the global Tone.js Context.
 * See [[Transport]]
 * @category Core
 */
const Transport$1 = getContext().transport;
/**
 * The Transport object belonging to the global Tone.js Context.
 * See [[Transport]]
 * @category Core
 */
function getTransport() {
    return getContext().transport;
}
/**
 * The Destination (output) belonging to the global Tone.js Context.
 * See [[Destination]]
 * @category Core
 */
const Destination$1 = getContext().destination;
/**
 * @deprecated Use [[Destination]]
 */
const Master = getContext().destination;
/**
 * The Destination (output) belonging to the global Tone.js Context.
 * See [[Destination]]
 * @category Core
 */
function getDestination() {
    return getContext().destination;
}
/**
 * The [[Listener]] belonging to the global Tone.js Context.
 * @category Core
 */
const Listener$1 = getContext().listener;
/**
 * The [[Listener]] belonging to the global Tone.js Context.
 * @category Core
 */
function getListener() {
    return getContext().listener;
}
/**
 * Draw is used to synchronize the draw frame with the Transport's callbacks.
 * See [[Draw]]
 * @category Core
 */
const Draw$1 = getContext().draw;
/**
 * Get the singleton attached to the global context.
 * Draw is used to synchronize the draw frame with the Transport's callbacks.
 * See [[Draw]]
 * @category Core
 */
function getDraw() {
    return getContext().draw;
}
/**
 * A reference to the global context
 * See [[Context]]
 */
const context = getContext();
/**
 * Promise which resolves when all of the loading promises are resolved.
 * Alias for static [[ToneAudioBuffer.loaded]] method.
 * @category Core
 */
function loaded() {
    return ToneAudioBuffer.loaded();
}
const Buffer = ToneAudioBuffer;
const Buffers = ToneAudioBuffers;
const BufferSource = ToneBufferSource;

export { AMOscillator, AMSynth, Abs, Add, AmplitudeEnvelope, Analyser, AudioToGain, AutoFilter, AutoPanner, AutoWah, BaseContext, BiquadFilter, BitCrusher, Buffer, BufferSource, Buffers, Channel, Chebyshev, Chorus, Clock, Compressor, Context, Convolver, CrossFade, DCMeter, Delay, Destination$1 as Destination, Distortion, Draw$1 as Draw, DuoSynth, EQ3, Emitter, Envelope, FFT, FMOscillator, FMSynth, FatOscillator, FeedbackCombFilter, FeedbackDelay, Filter, Follower, Freeverb, Frequency, FrequencyClass, FrequencyEnvelope, FrequencyShifter, Gain, GainToAudio, Gate, GrainPlayer, GreaterThan, GreaterThanZero, IntervalTimeline, JCReverb, LFO, Limiter, Listener$1 as Listener, Loop, LowpassCombFilter, Master, MembraneSynth, Merge, MetalSynth, Meter, MidSideCompressor, MidSideMerge, MidSideSplit, Midi, MidiClass, Mono, MonoSynth, MultibandCompressor, MultibandSplit, Multiply, Negate, Noise, NoiseSynth, Offline, OfflineContext, OmniOscillator, OnePoleFilter, Oscillator, PWMOscillator, PanVol, Panner, Panner3D, Param, Part, Pattern, Phaser, PingPongDelay, PitchShift, Player, Players, PluckSynth, PolySynth, Pow, PulseOscillator, Recorder, Reverb, Sampler, Scale, ScaleExp, Sequence, Signal, Solo, Split, StateTimeline, StereoWidener, Subtract, SyncedSignal, Synth, Ticks, TicksClass, Time, TimeClass, Timeline, ToneAudioBuffer, ToneAudioBuffers, ToneAudioNode, ToneBufferSource, ToneEvent, ToneOscillatorNode, Transport$1 as Transport, TransportTime, TransportTimeClass, Tremolo, Units as Unit, UserMedia, Vibrato, Volume, WaveShaper, Waveform, Zero, connect, connectSeries, connectSignal, context, dbToGain, Debug as debug, defaultArg, disconnect, ftom, gainToDb, getContext, getDestination, getDraw, getListener, getTransport, immediate, intervalToFrequencyRatio, isArray, isBoolean, isDefined, isFunction, isNote, isNumber, isObject, isString, isUndef, loaded, mtof, now, optionsFromArguments, setContext, start, version };
