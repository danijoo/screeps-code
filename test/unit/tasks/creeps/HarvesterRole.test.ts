import {mockGlobal, mockInstanceOf} from "screeps-jest"
import {CreepController} from "../../../..//src/creeps/creepController"
import {Kernel} from "../../../..//src/os/Kernel"
import {HarvesterRole} from "../../../..//src/tasks/creeps/HarvesterRole"
import anything = jasmine.anything

let mockCreep: Creep
let task: HarvesterRole
const mockSource: Source = mockInstanceOf<Source>({
    id: "sourceId",
    room: mockInstanceOf<Room>({
        name: "roomName",
        getPositionAt: (x: number, y: number) => {return new RoomPosition(x, y, "roomName")}
    })
})

beforeEach(() => {
    mockCreep = mockInstanceOf<Creep>({
        id: "creepId",
        memory: {owner: "myid"},
        spawning: false,
    }, true)
    mockGlobal<Game>("Game", {
        time: 10,
        creeps: {
            "creepId": mockCreep
        },
        spawns: {
            "spawnId": mockInstanceOf<StructureSpawn>()
        },
        getObjectById: (id: string) => {
            if (id === "creepId") {
                return mockCreep
            } else if (id === "sourceId") {
                return mockSource
            }
            return undefined
        }
    })
    task = new HarvesterRole(
        "myid",
        null,
        0,
        {
            "creepId": "creepId",
            "sourceId": "sourceId",
            "harvesterPosition": [1, 1]
        },
        new Kernel()
    )
    CreepController.init()
})

it("Should return if source is not found", () => {
    // @ts-ignore
    Game._getObjectById = Game.getObjectById
    Game.getObjectById = (id: string) => {
        if (id === "sourceId")
            return undefined
        else
            { // @ts-ignore
                return Game._getObjectById(id)
            }
    }
    task.run()
    expect(task.finished).toBeTruthy()
})

it("Should return if harvest position is not found", () => {
    delete task.data!.harvesterPosition
    task.run()
    expect(task.finished).toBeTruthy()
})

it("Creep should move if not at harvester position", () => {
    const mockCreepPos = new RoomPosition(10, 10, "roomName")
    mockCreepPos.isEqualTo = () => false
    mockCreep.pos = mockCreepPos
    const moveFn = jest.fn().mockReturnValue(OK)
    mockCreep.moveTo = moveFn
    task.run()
    expect(task.finished).not.toBeTruthy()
    expect(moveFn).toBeCalledTimes(1)
})

it("Creep should harvest if it is at harvester positio", () => {
    const mockCreepPos = new RoomPosition(5, 5, "roomName")
    mockCreepPos.isEqualTo = () => true
    mockCreep.pos = mockCreepPos
    const harvestFn = jest.fn().mockReturnValue(OK)
    const moveFn = jest.fn()
    mockCreep.harvest = harvestFn
    mockCreep.moveTo = moveFn
    task.run()
    expect(task.finished).not.toBeTruthy()
    expect(harvestFn).toBeCalledTimes(1)
    expect(moveFn).not.toBeCalled()
})

it("Should return if harvesting was not successful", () => {
    const mockCreepPos = new RoomPosition(5, 5, "roomName")
    mockCreepPos.isEqualTo = () => true
    mockCreep.pos = mockCreepPos
    const harvestFn = jest.fn().mockReturnValue(-7)  // ERR_INVALID_TARGET
    const moveFn = jest.fn()
    mockCreep.harvest = harvestFn
    mockCreep.moveTo = moveFn
    task.run()
    expect(task.finished).toBeTruthy()
    expect(harvestFn).toBeCalledTimes(1)
    expect(moveFn).not.toBeCalled()
})
