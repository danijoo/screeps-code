import { mockGlobal } from "screeps-jest";
import {onGlobalContextChangeDetected} from "../../../src/utils/onGlobalContextChange";

beforeEach(() => {
    mockGlobal<Game>("Game", {
        time: 0
    })
    mockGlobal<Memory>("Memory")
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