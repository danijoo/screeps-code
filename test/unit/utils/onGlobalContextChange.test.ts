import {onGlobalContextChangeDetected} from "../../..//src/utils/onGlobalContextChange";
import {Game, Memory} from "../mock";

beforeEach(() => {
    // @ts-ignore
    global.Game = _.clone(Game)
    // @ts-ignore
    global.Memory = _.clone(Memory)
})


it("Should detect a global reset", () => {
    let changeDetected = false

    // Should detect change on first run
    Game.time = 10
    onGlobalContextChangeDetected(() => changeDetected = true)
    expect(changeDetected).toBeTruthy()
    changeDetected = false

    // Should not detect a change if the Game time increases
    Game.time = 11
    onGlobalContextChangeDetected(() => changeDetected = true)
    expect(!changeDetected).toBeTruthy()

    // Should detect a change if global context time changes
    Game.time = 12
    global._global_context_version = 4
    onGlobalContextChangeDetected(() => changeDetected = true)
    expect(changeDetected).toBeTruthy()
})
