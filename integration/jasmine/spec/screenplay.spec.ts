import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { SceneFinished, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { ExecutionFailedWithAssertionError, ExecutionFailedWithError, ExecutionSuccessful, FeatureTag, Name, ProblemIndication } from '@serenity-js/core/lib/model';

import { jasmine } from '../src/jasmine';

describe('@serenity-js/Jasmine', function () {

    this.timeout(60 * 1000);

    describe('reports a scenario that', () => {

        it('fails because of a failing Screenplay expectation', () =>
            jasmine('examples/screenplay/assertion-error.spec.js')
                .then(ifExitCodeIsOtherThan(1, logOutput))
                .then(res => {

                    expect(res.exitCode).to.equal(1);

                    PickEvent.from(res.events)
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario correctly reports assertion errors')))
                        .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Jasmine reporting')))
                        .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Jasmine')))
                        .next(SceneFinished,       event => {
                            const outcome: ProblemIndication = event.outcome as ProblemIndication;

                            expect(outcome).to.be.instanceOf(ExecutionFailedWithAssertionError);
                            expect(outcome.error.name).to.equal('AssertionError');
                            expect(outcome.error.message).to.equal('Expected false to equal true');
                        })
                    ;
                }));

        it('fails when discarding an ability results in Error', () =>
            jasmine('examples/screenplay/ability-discard-error.spec.js')
                .then(ifExitCodeIsOtherThan(1, logOutput))
                .then(res => {
                    expect(res.exitCode).to.equal(1);

                    PickEvent.from(res.events)
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario fails when discarding an ability fails')))
                        .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Jasmine reporting')))
                        .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Jasmine')))
                        .next(SceneFinished,       event => {
                            const outcome: ProblemIndication = event.outcome as ProblemIndication;

                            expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                            expect(outcome.error.name).to.equal('Error');

                            const message = outcome.error.message.split('\n');

                            expect(message[0]).to.equal('1 async operation has failed to complete:');
                            expect(message[1]).to.equal('[Stage] Dismissing Donald... - TypeError: Some internal error in ability');
                        })
                    ;
                }));

        it(`fails when discarding an ability doesn't complete within a timeout`, () =>
            jasmine('examples/screenplay/ability-discard-timeout.spec.js')
                .then(ifExitCodeIsOtherThan(1, logOutput))
                .then(res => {
                    expect(res.exitCode).to.equal(1);

                    PickEvent.from(res.events)
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario fails when discarding an ability fails')))
                        .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Jasmine reporting')))
                        .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Jasmine')))
                        .next(SceneFinished,       event => {
                            const outcome: ProblemIndication = event.outcome as ProblemIndication;

                            expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                            expect(outcome.error.name).to.equal('Error');

                            const message = outcome.error.message.split('\n');

                            expect(message[0]).to.equal('1 async operation has failed to complete within a 50ms cue timeout:');
                            expect(message[1]).to.match(/\d+ms - \[Stage] Dismissing Donald\.\.\./);
                        })
                    ;
                }));

        it(`executes all the scenarios in the test suite even when some of them fail because of an error when discarding an ability`, () =>
            jasmine('examples/screenplay/ability-discard-error-should-not-affect-stage-cue.spec.js')
                .then(ifExitCodeIsOtherThan(1, logOutput))
                .then(res => {
                    expect(res.exitCode).to.equal(1);

                    PickEvent.from(res.events)
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario fails when discarding an ability fails')))
                        .next(SceneFinished,       event => {
                            const outcome: ProblemIndication = event.outcome as ProblemIndication;

                            expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                            expect(outcome.error.name).to.equal('Error');

                            const message = outcome.error.message.split('\n');

                            expect(message[0]).to.equal('1 async operation has failed to complete:');
                            expect(message[1]).to.equal('[Stage] Dismissing Donald... - TypeError: Some internal error in ability');
                        })
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario succeeds when ability is discarded successfully')))
                        .next(SceneFinished,       event => {
                            expect(event.outcome).to.be.instanceOf(ExecutionSuccessful);
                        })
                        .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A screenplay scenario fails if the ability fails to discard again')))
                        .next(SceneFinished,       event => {
                            const outcome: ProblemIndication = event.outcome as ProblemIndication;

                            expect(outcome).to.be.instanceOf(ExecutionFailedWithError);
                            expect(outcome.error.name).to.equal('Error');

                            const message = outcome.error.message.split('\n');

                            expect(message[0]).to.equal('1 async operation has failed to complete:');
                            expect(message[1]).to.equal('[Stage] Dismissing Donald... - TypeError: Some internal error in ability');
                        })
                    ;
                }));
    });
});
