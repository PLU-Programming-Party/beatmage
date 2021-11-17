const createExtendedExponentialRampToValueAutomationEvent = (value, endTime, insertTime) => {
    return { endTime, insertTime, type: 'exponentialRampToValue', value };
};

const createExtendedLinearRampToValueAutomationEvent = (value, endTime, insertTime) => {
    return { endTime, insertTime, type: 'linearRampToValue', value };
};

const createSetValueAutomationEvent = (value, startTime) => {
    return { startTime, type: 'setValue', value };
};

const createSetValueCurveAutomationEvent = (values, startTime, duration) => {
    return { duration, startTime, type: 'setValueCurve', values };
};

const getTargetValueAtTime = (time, valueAtStartTime, { startTime, target, timeConstant }) => {
    return target + (valueAtStartTime - target) * Math.exp((startTime - time) / timeConstant);
};

const isExponentialRampToValueAutomationEvent = (automationEvent) => {
    return automationEvent.type === 'exponentialRampToValue';
};

const isLinearRampToValueAutomationEvent = (automationEvent) => {
    return automationEvent.type === 'linearRampToValue';
};

const isAnyRampToValueAutomationEvent = (automationEvent) => {
    return isExponentialRampToValueAutomationEvent(automationEvent) || isLinearRampToValueAutomationEvent(automationEvent);
};

const isSetValueAutomationEvent = (automationEvent) => {
    return automationEvent.type === 'setValue';
};

const isSetValueCurveAutomationEvent = (automationEvent) => {
    return automationEvent.type === 'setValueCurve';
};

const getValueOfAutomationEventAtIndexAtTime = (automationEvents, index, time, defaultValue) => {
    const automationEvent = automationEvents[index];
    return automationEvent === undefined
        ? defaultValue
        : isAnyRampToValueAutomationEvent(automationEvent) || isSetValueAutomationEvent(automationEvent)
            ? automationEvent.value
            : isSetValueCurveAutomationEvent(automationEvent)
                ? automationEvent.values[automationEvent.values.length - 1]
                : getTargetValueAtTime(time, getValueOfAutomationEventAtIndexAtTime(automationEvents, index - 1, automationEvent.startTime, defaultValue), automationEvent);
};

const getEndTimeAndValueOfPreviousAutomationEvent = (automationEvents, index, currentAutomationEvent, nextAutomationEvent, defaultValue) => {
    return currentAutomationEvent === undefined
        ? [nextAutomationEvent.insertTime, defaultValue]
        : isAnyRampToValueAutomationEvent(currentAutomationEvent)
            ? [currentAutomationEvent.endTime, currentAutomationEvent.value]
            : isSetValueAutomationEvent(currentAutomationEvent)
                ? [currentAutomationEvent.startTime, currentAutomationEvent.value]
                : isSetValueCurveAutomationEvent(currentAutomationEvent)
                    ? [
                        currentAutomationEvent.startTime + currentAutomationEvent.duration,
                        currentAutomationEvent.values[currentAutomationEvent.values.length - 1]
                    ]
                    : [
                        currentAutomationEvent.startTime,
                        getValueOfAutomationEventAtIndexAtTime(automationEvents, index - 1, currentAutomationEvent.startTime, defaultValue)
                    ];
};

const isCancelAndHoldAutomationEvent = (automationEvent) => {
    return automationEvent.type === 'cancelAndHold';
};

const isCancelScheduledValuesAutomationEvent = (automationEvent) => {
    return automationEvent.type === 'cancelScheduledValues';
};

const getEventTime = (automationEvent) => {
    if (isCancelAndHoldAutomationEvent(automationEvent) || isCancelScheduledValuesAutomationEvent(automationEvent)) {
        return automationEvent.cancelTime;
    }
    if (isExponentialRampToValueAutomationEvent(automationEvent) || isLinearRampToValueAutomationEvent(automationEvent)) {
        return automationEvent.endTime;
    }
    return automationEvent.startTime;
};

const getExponentialRampValueAtTime = (time, startTime, valueAtStartTime, { endTime, value }) => {
    if (valueAtStartTime === value) {
        return value;
    }
    if ((0 < valueAtStartTime && 0 < value) || (valueAtStartTime < 0 && value < 0)) {
        return valueAtStartTime * (value / valueAtStartTime) ** ((time - startTime) / (endTime - startTime));
    }
    return 0;
};

const getLinearRampValueAtTime = (time, startTime, valueAtStartTime, { endTime, value }) => {
    return valueAtStartTime + ((time - startTime) / (endTime - startTime)) * (value - valueAtStartTime);
};

const interpolateValue = (values, theoreticIndex) => {
    const lowerIndex = Math.floor(theoreticIndex);
    const upperIndex = Math.ceil(theoreticIndex);
    if (lowerIndex === upperIndex) {
        return values[lowerIndex];
    }
    return (1 - (theoreticIndex - lowerIndex)) * values[lowerIndex] + (1 - (upperIndex - theoreticIndex)) * values[upperIndex];
};

const getValueCurveValueAtTime = (time, { duration, startTime, values }) => {
    const theoreticIndex = ((time - startTime) / duration) * (values.length - 1);
    return interpolateValue(values, theoreticIndex);
};

const isSetTargetAutomationEvent = (automationEvent) => {
    return automationEvent.type === 'setTarget';
};

class AutomationEventList {
    constructor(defaultValue) {
        this._automationEvents = [];
        this._currenTime = 0;
        this._defaultValue = defaultValue;
    }
    [Symbol.iterator]() {
        return this._automationEvents[Symbol.iterator]();
    }
    add(automationEvent) {
        const eventTime = getEventTime(automationEvent);
        if (isCancelAndHoldAutomationEvent(automationEvent) || isCancelScheduledValuesAutomationEvent(automationEvent)) {
            const index = this._automationEvents.findIndex((currentAutomationEvent) => {
                if (isCancelScheduledValuesAutomationEvent(automationEvent) && isSetValueCurveAutomationEvent(currentAutomationEvent)) {
                    return currentAutomationEvent.startTime + currentAutomationEvent.duration >= eventTime;
                }
                return getEventTime(currentAutomationEvent) >= eventTime;
            });
            const removedAutomationEvent = this._automationEvents[index];
            if (index !== -1) {
                this._automationEvents = this._automationEvents.slice(0, index);
            }
            if (isCancelAndHoldAutomationEvent(automationEvent)) {
                const lastAutomationEvent = this._automationEvents[this._automationEvents.length - 1];
                if (removedAutomationEvent !== undefined && isAnyRampToValueAutomationEvent(removedAutomationEvent)) {
                    if (isSetTargetAutomationEvent(lastAutomationEvent)) {
                        throw new Error('The internal list is malformed.');
                    }
                    const startTime = isSetValueCurveAutomationEvent(lastAutomationEvent)
                        ? lastAutomationEvent.startTime + lastAutomationEvent.duration
                        : getEventTime(lastAutomationEvent);
                    const startValue = isSetValueCurveAutomationEvent(lastAutomationEvent)
                        ? lastAutomationEvent.values[lastAutomationEvent.values.length - 1]
                        : lastAutomationEvent.value;
                    const value = isExponentialRampToValueAutomationEvent(removedAutomationEvent)
                        ? getExponentialRampValueAtTime(eventTime, startTime, startValue, removedAutomationEvent)
                        : getLinearRampValueAtTime(eventTime, startTime, startValue, removedAutomationEvent);
                    const truncatedAutomationEvent = isExponentialRampToValueAutomationEvent(removedAutomationEvent)
                        ? createExtendedExponentialRampToValueAutomationEvent(value, eventTime, this._currenTime)
                        : createExtendedLinearRampToValueAutomationEvent(value, eventTime, this._currenTime);
                    this._automationEvents.push(truncatedAutomationEvent);
                }
                if (lastAutomationEvent !== undefined && isSetTargetAutomationEvent(lastAutomationEvent)) {
                    this._automationEvents.push(createSetValueAutomationEvent(this.getValue(eventTime), eventTime));
                }
                if (lastAutomationEvent !== undefined &&
                    isSetValueCurveAutomationEvent(lastAutomationEvent) &&
                    lastAutomationEvent.startTime + lastAutomationEvent.duration > eventTime) {
                    this._automationEvents[this._automationEvents.length - 1] = createSetValueCurveAutomationEvent(new Float32Array([6, 7]), lastAutomationEvent.startTime, eventTime - lastAutomationEvent.startTime);
                }
            }
        }
        else {
            const index = this._automationEvents.findIndex((currentAutomationEvent) => getEventTime(currentAutomationEvent) > eventTime);
            const previousAutomationEvent = index === -1 ? this._automationEvents[this._automationEvents.length - 1] : this._automationEvents[index - 1];
            if (previousAutomationEvent !== undefined &&
                isSetValueCurveAutomationEvent(previousAutomationEvent) &&
                getEventTime(previousAutomationEvent) + previousAutomationEvent.duration > eventTime) {
                return false;
            }
            const persistentAutomationEvent = isExponentialRampToValueAutomationEvent(automationEvent)
                ? createExtendedExponentialRampToValueAutomationEvent(automationEvent.value, automationEvent.endTime, this._currenTime)
                : isLinearRampToValueAutomationEvent(automationEvent)
                    ? createExtendedLinearRampToValueAutomationEvent(automationEvent.value, eventTime, this._currenTime)
                    : automationEvent;
            if (index === -1) {
                this._automationEvents.push(persistentAutomationEvent);
            }
            else {
                if (isSetValueCurveAutomationEvent(automationEvent) &&
                    eventTime + automationEvent.duration > getEventTime(this._automationEvents[index])) {
                    return false;
                }
                this._automationEvents.splice(index, 0, persistentAutomationEvent);
            }
        }
        return true;
    }
    flush(time) {
        const index = this._automationEvents.findIndex((currentAutomationEvent) => getEventTime(currentAutomationEvent) > time);
        if (index > 1) {
            const remainingAutomationEvents = this._automationEvents.slice(index - 1);
            const firstRemainingAutomationEvent = remainingAutomationEvents[0];
            if (isSetTargetAutomationEvent(firstRemainingAutomationEvent)) {
                remainingAutomationEvents.unshift(createSetValueAutomationEvent(getValueOfAutomationEventAtIndexAtTime(this._automationEvents, index - 2, firstRemainingAutomationEvent.startTime, this._defaultValue), firstRemainingAutomationEvent.startTime));
            }
            this._automationEvents = remainingAutomationEvents;
        }
    }
    getValue(time) {
        if (this._automationEvents.length === 0) {
            return this._defaultValue;
        }
        const indexOfNextEvent = this._automationEvents.findIndex((automationEvent) => getEventTime(automationEvent) > time);
        const nextAutomationEvent = this._automationEvents[indexOfNextEvent];
        const indexOfCurrentEvent = (indexOfNextEvent === -1 ? this._automationEvents.length : indexOfNextEvent) - 1;
        const currentAutomationEvent = this._automationEvents[indexOfCurrentEvent];
        if (currentAutomationEvent !== undefined &&
            isSetTargetAutomationEvent(currentAutomationEvent) &&
            (nextAutomationEvent === undefined ||
                !isAnyRampToValueAutomationEvent(nextAutomationEvent) ||
                nextAutomationEvent.insertTime > time)) {
            return getTargetValueAtTime(time, getValueOfAutomationEventAtIndexAtTime(this._automationEvents, indexOfCurrentEvent - 1, currentAutomationEvent.startTime, this._defaultValue), currentAutomationEvent);
        }
        if (currentAutomationEvent !== undefined &&
            isSetValueAutomationEvent(currentAutomationEvent) &&
            (nextAutomationEvent === undefined || !isAnyRampToValueAutomationEvent(nextAutomationEvent))) {
            return currentAutomationEvent.value;
        }
        if (currentAutomationEvent !== undefined &&
            isSetValueCurveAutomationEvent(currentAutomationEvent) &&
            (nextAutomationEvent === undefined ||
                !isAnyRampToValueAutomationEvent(nextAutomationEvent) ||
                currentAutomationEvent.startTime + currentAutomationEvent.duration > time)) {
            if (time < currentAutomationEvent.startTime + currentAutomationEvent.duration) {
                return getValueCurveValueAtTime(time, currentAutomationEvent);
            }
            return currentAutomationEvent.values[currentAutomationEvent.values.length - 1];
        }
        if (currentAutomationEvent !== undefined &&
            isAnyRampToValueAutomationEvent(currentAutomationEvent) &&
            (nextAutomationEvent === undefined || !isAnyRampToValueAutomationEvent(nextAutomationEvent))) {
            return currentAutomationEvent.value;
        }
        if (nextAutomationEvent !== undefined && isExponentialRampToValueAutomationEvent(nextAutomationEvent)) {
            const [startTime, value] = getEndTimeAndValueOfPreviousAutomationEvent(this._automationEvents, indexOfCurrentEvent, currentAutomationEvent, nextAutomationEvent, this._defaultValue);
            return getExponentialRampValueAtTime(time, startTime, value, nextAutomationEvent);
        }
        if (nextAutomationEvent !== undefined && isLinearRampToValueAutomationEvent(nextAutomationEvent)) {
            const [startTime, value] = getEndTimeAndValueOfPreviousAutomationEvent(this._automationEvents, indexOfCurrentEvent, currentAutomationEvent, nextAutomationEvent, this._defaultValue);
            return getLinearRampValueAtTime(time, startTime, value, nextAutomationEvent);
        }
        return this._defaultValue;
    }
}

const createCancelAndHoldAutomationEvent = (cancelTime) => {
    return { cancelTime, type: 'cancelAndHold' };
};

const createCancelScheduledValuesAutomationEvent = (cancelTime) => {
    return { cancelTime, type: 'cancelScheduledValues' };
};

const createExponentialRampToValueAutomationEvent = (value, endTime) => {
    return { endTime, type: 'exponentialRampToValue', value };
};

const createLinearRampToValueAutomationEvent = (value, endTime) => {
    return { endTime, type: 'linearRampToValue', value };
};

const createSetTargetAutomationEvent = (target, startTime, timeConstant) => {
    return { startTime, target, timeConstant, type: 'setTarget' };
};

export { AutomationEventList as A, createSetValueAutomationEvent as a, createSetTargetAutomationEvent as b, createSetValueCurveAutomationEvent as c, createLinearRampToValueAutomationEvent as d, createExponentialRampToValueAutomationEvent as e, createCancelScheduledValuesAutomationEvent as f, createCancelAndHoldAutomationEvent as g };
