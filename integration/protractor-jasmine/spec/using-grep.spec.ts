import 'mocha';

import { expect, ifExitCodeIsOtherThan, logOutput, PickEvent } from '@integration/testing-tools';
import { SceneFinished, SceneStarts, SceneTagged, TestRunnerDetected } from '@serenity-js/core/lib/events';
import { ExecutionSkipped, FeatureTag, Name } from '@serenity-js/core/lib/model';

import { protractor } from '../src/protractor';

describe('@serenity-js/jasmine', function () {

    this.timeout(30000);

    it('allows for selective execution of scenarios via grep', () =>
        protractor(
            './examples/protractor.conf.js',
            '--specs=examples/failing.spec.js',
            '--jasmineNodeOpts.grep=".*passes.*"',
        )
            .then(ifExitCodeIsOtherThan(0, logOutput))
            .then(result => {

                expect(result.exitCode).to.equal(0);

                PickEvent.from(result.events)
                    .next(SceneStarts,         event => expect(event.details.name).to.equal(new Name('A scenario fails')))
                    .next(SceneTagged,         event => expect(event.tag).to.equal(new FeatureTag('Jasmine')))
                    .next(TestRunnerDetected,  event => expect(event.name).to.equal(new Name('Jasmine')))
                    .next(SceneFinished,       event => expect(event.outcome).to.equal(new ExecutionSkipped()))
                ;
            }));
});
