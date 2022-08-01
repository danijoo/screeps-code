import {buryTheDead} from "../../..//src/creeps/buryTheDead";
import {Game, Memory} from "../mock";

beforeEach(() => {
    // @ts-ignore
    global.Game = _.clone(Game)
    Game.creeps.qwerty = {name: "qwerty"}
    Game.creeps.qwerty2 = {name: "qwerty2"}
    // @ts-ignore
    global.Memory = _.clone(Memory)
    Memory.creeps.qwerty = {
        owner: "test",
        working: false
    }
})

it("should remove dead creeps memory", () => {
    buryTheDead()
    expect(Memory.creeps.qwerty2).toEqual(undefined)
    expect(Memory.creeps.qwerty).not.toEqual(undefined)
})
