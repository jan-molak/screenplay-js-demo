import { ChildProcessReporter } from '@integration/testing-tools';
import { serenity, StreamReporter } from '@serenity-js/core';

import { Actors } from './Actors';

export = function (): void {

    serenity.configure({
        actors: new Actors(),
        crew: [
            new ChildProcessReporter(),
            new StreamReporter(),
        ],
    });

    this.setDefaultTimeout(5000);
};
