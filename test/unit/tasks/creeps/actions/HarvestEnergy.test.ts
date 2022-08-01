import {mockGlobal, mockInstanceOf} from "screeps-jest";
import {Kernel} from "../../../../..//src/os/Kernel";
import {HarvestEnergy} from "../../../../..//src/tasks/creeps/actions/HarvestEnergy";

let mockSource: Source
let mockCreep: Creep
let task: HarvestEnergy
beforeEach(() => {
    mockSource = mockInstanceOf<Source>()
    mockCreep = mockInstanceOf<Creep>({
        moveTo: () => OK,
        harvest: () => OK,
        store: {
            getFreeCapacity: () => 0
        }
    })
    mockGlobal<Game>("Game", {
        getObjectById: (id: string): any => {
            if (id === "creepId") {
                return mockCreep
            } else if (id === "sourceId") {
                return mockSource
            }
        },
        creeps: {
            "creepId": mockCreep
        }
    })
    task = new HarvestEnergy(
        "myid",
        null,
        0,
        {creepId: "creepId", "sourceId": "sourceId"},
        mockInstanceOf<Kernel>(),
    )
})

it("should stop if source is not found",() => {
    // @ts-ignore
    Game._getObjectById = Game.getObjectById
    Game.getObjectById = (id: string) => {
        if (id === "sourceId") {
            return undefined
        } else {
            // @ts-ignore
            return Game._getObjectById(id)
        }
    }
    task.run()
    expect(mockCreep.harvest).toHaveBeenCalledTimes(0)
    expect(task.finished).toBeTruthy()
})

it("should stop if creep is not found",() => {
    // @ts-ignore
    Game._getObjectById = Game.getObjectById
    Game.getObjectById = (id: string) => {
        if (id === "creepId") {
            return undefined
        } else {
            // @ts-ignore
            return Game._getObjectById(id)
        }
    }
    task.run()
    expect(mockCreep.harvest).toHaveBeenCalledTimes(0)
    expect(task.finished).toBeTruthy()
})

it("should stop if harvest was OK but store is full",() => {
    task.run()
    // @ts-ignore
    expect(mockCreep.harvest).toHaveBeenCalledTimes(1)
    expect(task.finished).toBeTruthy()
})

it("should move to source if more than one step away and not stop",() => {
    mockCreep.harvest = jest.fn(() => ERR_NOT_IN_RANGE)
    task.run()
    expect(mockCreep.harvest).toHaveBeenCalledTimes(1)
    expect(mockCreep.moveTo).toHaveBeenCalledTimes(1)
    expect(mockCreep.moveTo).toHaveBeenCalledWith(mockSource, expect.anything())
    expect(task.finished).not.toBeTruthy()
})

it("should stop on error",() => {
    mockCreep.harvest = jest.fn(() => ERR_NOT_OWNER)
    task.run()
    expect(mockCreep.harvest).toHaveBeenCalledTimes(1)
    expect(task.finished).toBeTruthy()
})

it("should continue if harvest was OK and storage space is left",() => {
    mockCreep.harvest = jest.fn(() => OK)
    // @ts-ignore
    mockCreep.store.getFreeCapacity = () => 10
    task.run()
    expect(mockCreep.harvest).toHaveBeenCalledTimes(1)
    expect(task.finished).not.toBeTruthy()
})
