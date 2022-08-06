import {mockGlobal, mockInstanceOf} from "screeps-jest"
import {CreepController} from "../../../../src/creeps/creepController"
import {Kernel} from "../../../../src/os/Kernel"
import {HarvesterRole} from "../../../../src/tasks/creeps/HarvesterRole"
import {SourceHarvest} from "../../../../src/tasks/room/SourceHarvest"

let task: SourceHarvest
let kernel: Kernel
let mockCreep: Creep
const mockSource = mockInstanceOf<Source>({
    id: "sourceId"
})
let mockHarvestPosition: RoomPosition
beforeEach(() => {
    mockHarvestPosition = mockInstanceOf<RoomPosition>({
        x: 0,
        y: 0,
        roomName: "roomId",
        lookFor: () => []
    })
    const roomMemory = mockInstanceOf<RoomMemory>({
        sources: {
            sourceId: {
                ignored: false,
                position: [1, 1],
                harvesterPosition: [1, 2],
            }
        }
    })
    const mockRoom = mockInstanceOf<Room>({
        name: "roomId",
        memory: roomMemory,
        find: () => [mockSource],
        getPositionAt: () => mockHarvestPosition
    })
    mockCreep = mockInstanceOf<Creep>({
        id: "creepId",
        spawning: false,
        memory: {
            owner: "CreepController"
        },
        getActiveBodyparts: () => 2,
        room: {
            energyCapacityAvailable: 300
        }
    })
    mockGlobal<Game>("Game", {
        rooms: {
            roomId: mockRoom,
        },
        spawns: {
            spawnId: mockInstanceOf<StructureSpawn>({
                spawning: () => true,
                room: {
                    energyAvailable: 300
                }
            }
        )},
        creeps: {
            creepId: mockCreep
        }
    })
    kernel = new Kernel()
    task = new SourceHarvest(
        "myid",
        null,
        0,
        {roomName: "roomId"},
        kernel
    )
    CreepController.init()
})

it("Should return if room is not found", () => {
    Game.rooms = {}
    task.run()
    expect(task.finished).toBeTruthy()
    expect(kernel.taskTable.length).toBe(0)
})

it("Should spawn at least one harvester task", () => {
    task.run()
    expect(task.finished).toBeTruthy()
    expect(kernel.taskTable.length).toBe(1)
    const childTask = kernel.findTaskById("harvester-sourceId")
    expect(childTask).toBeInstanceOf(HarvesterRole)
})

it("Should not spawn a task if no creep is available", () => {
    mockCreep.spawning = true
    task.run()
    expect(task.finished).toBeTruthy()
})

it("Should not spawn harvester tasks for ignored sources", () => {
    Game.rooms.roomId.memory.sources.sourceId.ignored = true
    task.run()
    expect(task.finished).toBeTruthy()
    expect(kernel.taskTable.length).toBe(0)
})

it("Should not spawn harvester tasks for resources with a huge energy pile", () => {
    // @ts-ignore
    mockHarvestPosition.lookFor = (type: string) => {
        if (type === LOOK_RESOURCES)
            return [mockInstanceOf<Resource>({
                resourceType: RESOURCE_ENERGY,
                amount: 9999999999
            })]
        else
            return []
    }
    task.run()
    expect(task.finished).toBeTruthy()
    expect(kernel.taskTable.length).toBe(0)
})

it("Should kill harvester tasks for resources with a huge energy pile", () => {
    // @ts-ignore
    mockHarvestPosition.lookFor = (type: string) => {
        if (type === LOOK_RESOURCES)
            return [mockInstanceOf<Resource>({
                resourceType: RESOURCE_ENERGY,
                amount: 9999999999
            })]
        else
            return []
    }
    kernel.kill = jest.fn()
    kernel.findTaskById = jest.fn().mockReturnValue(mockInstanceOf<SourceHarvest>())
    task.run()
    expect(task.finished).toBeTruthy()
    expect(kernel.kill).toHaveBeenCalled()
})

it("Should spawn harvester tasks for resources with a small energy pile", () => {
    // @ts-ignore
    mockHarvestPosition.lookFor = (type: string) => {
        if (type === LOOK_RESOURCES)
            return [mockInstanceOf<Resource>({
                resourceType: RESOURCE_ENERGY,
                amount: 1000
            })]
        else
            return []
    }
    task.run()
    expect(task.finished).toBeTruthy()
    expect(kernel.taskTable.length).toBe(1)
})