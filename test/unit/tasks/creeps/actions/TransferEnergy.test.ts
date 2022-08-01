import {mockGlobal, mockInstanceOf} from "screeps-jest";
import {Kernel} from "../../../../..//src/os/Kernel";
import {TransferEnergy} from "../../../../..//src/tasks/creeps/actions/TransferEnergy";

let mockStructure: StructureSpawn
let mockCreep: Creep
let task: TransferEnergy

beforeEach(() => {
    mockStructure = mockInstanceOf<StructureSpawn>({
        store: {
            [RESOURCE_ENERGY]: 0,
            getCapacity: () => 300
        }
    })
    mockCreep = mockInstanceOf<Creep>({
        moveTo: () => OK,
        transfer: () => OK,
        store: {
            getUsedCapacity: () => 0
        }
    })
    mockGlobal<Game>("Game", {
        getObjectById: (id: string): any => {
            if (id === "creepId") {
                return mockCreep
            } else if (id === "structureId") {
                return mockStructure
            }
        },
        creeps: {
            "creepId": mockCreep
        }
    })
    task = new TransferEnergy(
        "myid",
        null,
        0,
        {creepId: "creepId", "structureId": "structureId"},
        mockInstanceOf<Kernel>(),
    )
})

it("should stop if structure is not found",() => {
    // @ts-ignore
    Game._getObjectById = Game.getObjectById
    Game.getObjectById = (id: string) => {
        if (id === "structureId") {
            return undefined
        } else {
            // @ts-ignore
            return Game._getObjectById(id)
        }
    }
    task.run()
    expect(mockCreep.transfer).toHaveBeenCalledTimes(0)
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
    expect(mockCreep.transfer).toHaveBeenCalledTimes(0)
    expect(task.finished).toBeTruthy()
})

it("should stop if upgrade was OK but no energy is left",() => {
    task.run()
    // @ts-ignore
    expect(mockCreep.transfer).toHaveBeenCalledTimes(1)
    expect(task.finished).toBeTruthy()
})

it("should stop if upgrade was OK and structure is full",() => {
    // @ts-ignore
    mockCreep.store.getUsedCapacity = () => {return 300}
    mockStructure.store[RESOURCE_ENERGY] = 300
    task.run()
    // @ts-ignore
    expect(mockCreep.transfer).toHaveBeenCalledTimes(1)
    expect(task.finished).toBeTruthy()
})

it("should stop if creep has no energy",() => {
    mockCreep.transfer = jest.fn(() => ERR_NOT_ENOUGH_RESOURCES)
    task.run()
    expect(mockCreep.transfer).toHaveBeenCalledTimes(1)
    expect(task.finished).toBeTruthy()
})

it("should move to structure if more than one step away and not stop",() => {
    mockCreep.transfer = jest.fn(() => ERR_NOT_IN_RANGE)
    task.run()
    expect(mockCreep.transfer).toHaveBeenCalledTimes(1)
    expect(mockCreep.moveTo).toHaveBeenCalledTimes(1)
    expect(mockCreep.moveTo).toHaveBeenCalledWith(mockStructure, expect.anything())
    expect(task.finished).not.toBeTruthy()
})

it("should stop on error",() => {
    mockCreep.transfer = jest.fn(() => ERR_NOT_OWNER)
    task.run()
    expect(mockCreep.transfer).toHaveBeenCalledTimes(1)
    expect(task.finished).toBeTruthy()
})

it("should finish if fill was OK and energy is left",() => {
    mockCreep.transfer = jest.fn(() => OK)
    // @ts-ignore
    mockCreep.store.getUsedCapacity = () => 10
    mockStructure.store[RESOURCE_ENERGY] = 300
    task.run()
    expect(mockCreep.transfer).toHaveBeenCalledTimes(1)
    expect(task.finished).toBeTruthy()
})
