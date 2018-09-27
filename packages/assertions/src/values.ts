import { AnswersQuestions, Question, UsesAbilities } from '@serenity-js/core';
import { inspect } from 'util';

/**
 * @public
 */
export type ValueOf<T> = Question<PromiseLike<T>> | Question<T> | PromiseLike<T> | T;

/**
 * @desc
 * Extracts the value wrapped in a Promise, Question or Question<Promise>.
 * If the value is not wrapped, it returns the value itself.
 *
 * @package
 * @param {ValueOf<T>} value
 * @param {AnswersQuestions} actor
 */
export function extracted<T>(value: ValueOf<T>, actor: AnswersQuestions & UsesAbilities): Promise<T> {
    if (isAPromise(value)) {
        return value;
    }

    if (isAQuestion(value)) {
        return this.extracted(value.answeredBy(actor), actor);
    }

    return Promise.resolve(value as T);
}

/**
 * @desc
 * Provides a human-readable and sync description of the {@link ValueOf<T>}
 *
 * @package
 * @param value
 */
export function descriptionOf(value: ValueOf<any>): string {
    if (! isDefined(value)) {
        return inspect(value);
    }

    if (isAPromise(value)) {
        return `the promised value`;
    }

    if (isAQuestion(value)) {
        return value.toString();
    }

    if (isADate(value)) {
        return value.toISOString();
    }

    if (isInspectable(value)) {
        return value.inspect();
    }

    if (hasItsOwnToString(value)) {
        return value.toString();
    }

    return inspect(value);
}

/**
 * @desc
 * Checks if the value is defined
 *
 * @private
 * @param {ValueOf<any>} v
 */
function isDefined(v: ValueOf<any>) {
    return !! v;
}

/**
 * @desc
 * Checks if the value defines its own `toString` method
 *
 * @private
 * @param {ValueOf<any>} v
 */
function hasItsOwnToString(v: ValueOf<any>): v is { toString: () => string } {
    return typeof v === 'object'
        && !! (v as any).toString
        && typeof (v as any).toString === 'function'
        && ! isNative((v as any).toString);
}

/**
 * @desc
 * Checks if the value defines its own `inspect` method
 *
 * @private
 * @param {ValueOf<any>} v
 */
function isInspectable(v: ValueOf<any>): v is { inspect: () => string } {
    return !! (v as any).inspect && typeof (v as any).inspect === 'function';
}

/**
 * @desc
 * Checks if the value is a {@link Question}
 *
 * @private
 * @param {ValueOf<any>} v
 */
function isAQuestion<T>(v: ValueOf<T>): v is Question<T> {
    return !! (v as any).answeredBy;
}

/**
 * @desc
 * Checks if the value is a {@link Date}
 *
 * @private
 * @param {ValueOf<any>} v
 */
function isADate(v: ValueOf<any>): v is Date {
    return v instanceof Date;
}

/**
 * @desc
 * Checks if the value is a {@link Promise}
 *
 * @private
 * @param {ValueOf<any>} v
 */
function isAPromise<T>(v: ValueOf<T>): v is Promise<T> {
    return !! (v as any).then;
}

/**
 * https://davidwalsh.name/detect-native-function
 * @param {any} v
 */
function isNative(v: any): v is Function {      // tslint:disable-line:ban-types

    const
        toString        = Object.prototype.toString,       // Used to resolve the internal `[[Class]]` of values
        fnToString      = Function.prototype.toString,   // Used to resolve the decompiled source of functions
        hostConstructor = /^\[object .+?Constructor\]$/; // Used to detect host constructors (Safari > 4; really typed array specific)

    // Compile a regexp using a common native method as a template.
    // We chose `Object#toString` because there's a good chance it is not being mucked with.
    const nativeFnTemplate = RegExp(
        '^' +
        // Coerce `Object#toString` to a string
        String(toString)
            // Escape any special regexp characters
            .replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&')
            // Replace mentions of `toString` with `.*?` to keep the template generic.
            // Replace thing like `for ...` to support environments like Rhino which add extra info
            // such as method arity.
            .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') +
        '$',
    );

    const type = typeof v;
    return type === 'function'
        // Use `Function#toString` to bypass the value's own `toString` method
        // and avoid being faked out.
        ? nativeFnTemplate.test(fnToString.call(v))
        // Fallback to a host object check because some environments will represent
        // things like typed arrays as DOM methods which may not conform to the
        // normal native pattern.
        : (v && type === 'object' && hostConstructor.test(toString.call(v))) || false;
}