import {mockGlobal, mockInstanceOf} from "screeps-jest"
import {buryTheDead} from "../../../src/creeps/buryTheDead";

beforeEach(() => {
    const creep = mockInstanceOf<Creep>({
        name: "qwerty"
    })
    mockGlobal<Game>("Game", {
        creeps: {
            qwerty: creep,
        }
    })
    mockGlobal<Memory>("Memory", {
        creeps: {
            qwerty2: {},
            qwerty: {}
        }
    }, true)
})

it("should remove dead creeps memory", () => {
    buryTheDead()
    expect(Memory.creeps.qwerty2).toEqual(undefined)
    expect(Memory.creeps.qwerty).not.toEqual(undefined)
})