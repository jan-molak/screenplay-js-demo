import 'mocha';

import { expect } from '@integration/testing-tools';
import { actorCalled, Answerable, AssertionError } from '@serenity-js/core';
import { given } from 'mocha-testdata';
import { and, Ensure, equals, Expectation, isGreaterThan, isLessThan, or } from '../src';
import { isIdenticalTo, p, q } from './fixtures';

/** @test {Expectation} */
describe('Expectation', () => {

    describe('allows to easily define an assertion, which', () => {

        /**
         * @test {Expectation.that}
         * @test {Ensure.that}
         */
        it('allows the actor flow to continue when the assertion passes', () => {
            return expect(actorCalled('Astrid').attemptsTo(
                Ensure.that(4, isIdenticalTo(4)),
            )).to.be.fulfilled;
        });

        /**
         * @test {Expectation.that}
         * @test {Ensure.that}
         */
        it('stops the actor flow when the assertion fails', () => {
            return expect(actorCalled('Astrid').attemptsTo(
                Ensure.that(4, isIdenticalTo('4' as any)),
            )).to.be.rejectedWith(AssertionError, "Expected 4 to have value identical to '4'");
        });

        given<Answerable<number>>(
            42,
            p(42),
            q(42),
            q(p(42)),
        ).
        it('allows for the expected value to be defined as any Answerable<T>', (expected: Answerable<number>) => {
            return expect(actorCalled('Astrid').attemptsTo(
                Ensure.that(42, isIdenticalTo(expected)),
            )).to.be.fulfilled;
        });
    });

    describe('allows to alias an expectation, so that the alias', () => {

        function isWithin(lowerBound: number, upperBound: number) {
            return Expectation
                .to(`have value within ${ lowerBound } and ${ upperBound }`)
                .soThatActual(and(
                   or(isGreaterThan(lowerBound), equals(lowerBound)),
                   or(isLessThan(upperBound), equals(upperBound)),
                ));
        }

        /** @test {Expectation.to} */
        it('contributes to a human-readable description', () => {
            expect(Ensure.that(5, isWithin(3, 6)).toString())
                .to.equal(`#actor ensures that 5 does have value within 3 and 6`);
        });

        /** @test {Expectation.to} */
        it('provides a precise failure message when the expectation is not met', () => {
            return expect(actorCalled('Astrid').attemptsTo(
                Ensure.that(9, isWithin(7, 8)),
            )).to.be.rejectedWith(AssertionError, `Expected 9 to have value that's less than 8 or equal 8`);
        });
    });

    describe('allows to define an assertion as async function, which ', () => {

        // tslint:disable-next-line: no-shadowed-variable
        function isIdenticalTo<T>(expected: T) {
            return Expectation.thatActualShould<T, T>('have value identical to', expected)
            .soThat((actualValue: T, expectedValue: T) => isEqual(actualValue, expectedValue));
        }
        function isEqual<T>(actualValue: T, expectedValue: T) {
            return new Promise<boolean>(resolve => setTimeout(() => resolve(actualValue === expectedValue), 300));
        }

        /**
         * @test {Expectation.that}
         * @test {Ensure.that}
         */
        it('allows the actor flow to continue when the assertion passes', () => {
            return expect(actorCalled('Astrid').attemptsTo(
                Ensure.that(4, isIdenticalTo(4)),
            )).to.be.fulfilled;
        });

        /**
         * @test {Expectation.that}
         * @test {Ensure.that}
         */
        it('stops the actor flow when the assertion fails', () => {
            return expect(actorCalled('Astrid').attemptsTo(
                Ensure.that(4, isIdenticalTo('4' as any)),
            )).to.be.rejectedWith(AssertionError, "Expected 4 to have value identical to '4'");
        });
    });
});
