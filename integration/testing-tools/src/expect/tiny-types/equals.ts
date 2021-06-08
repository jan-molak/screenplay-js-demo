import { TinyType } from 'tiny-types';

function tinyTypeEquals(_super) {
    return function assertTinyTypes(another: TinyType) {

        const object = this._obj;
        return object && object instanceof TinyType ? this.assert(
            object.equals(another),
            `expected #{this} to equal #{exp} but got #{act}`,
            `expected #{this} to not equal #{exp} but got #{act}`,
            another.toString(),
            object.toString(),
            /* eslint-disable-next-line prefer-rest-params */
        ) : Reflect.apply(_super, this, arguments);
    };
}

/* eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types */
export function equals(chai: any, utils: any): void {
    const Assertion = chai.Assertion;

    Assertion.overwriteMethod('equal',  tinyTypeEquals);
    Assertion.overwriteMethod('equals', tinyTypeEquals);
    Assertion.overwriteMethod('eq',     tinyTypeEquals);
}
