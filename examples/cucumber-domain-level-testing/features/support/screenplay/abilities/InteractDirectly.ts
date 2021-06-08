import { Ability, Actor } from '@serenity-js/core';
import {
    CalculationId,
    Calculator,
    CalculatorCommand,
    CalculatorQuery,
    GetCalculationResult,
} from '@serenity-js-examples/calculator-app';

export class InteractDirectly implements Ability {
    /**
     * Abilities such as this one can hold state.
     * The most common things to store on an ability include session tokens, a reference to a connections or a spawned
     * process.
     *
     * In this example we store a calculationId, which could be considered equivalent to a session id.
     */
    private calculationId: CalculationId;

    static with(calculator: Calculator): InteractDirectly {
        return new InteractDirectly(calculator);
    }

    static as(actor: Actor): any {
        return actor.abilityTo(InteractDirectly);
    }

    constructor(private readonly calculator: Calculator) {
    }

    requestANewCalculationId(): void {
        this.calculationId = CalculationId.create();
    }

    currentCalculationId(): CalculationId {
        if (! this.calculationId) {
            this.calculationId = CalculationId.create();
        }

        return this.calculationId;
    }

    execute(command: CalculatorCommand<any>): void {
        this.calculator.execute(command);
    }

    submit(query: GetCalculationResult): number;
    submit(query: CalculatorQuery): any {
        return this.calculator.submit(query);
    }
}
