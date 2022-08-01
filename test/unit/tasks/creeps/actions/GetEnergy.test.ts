import {mockGlobal, mockInstanceOf} from "screeps-jest";
import {Kernel} from "../../../../../src/os/Kernel";
import {GetEnergy} from "../../../../../src/tasks/creeps/actions/GetEnergy"

let mockResource: Resource<RESOURCE_ENERGY>
let mockCreep: Creep
let task: GetEnergy
beforeEach(() => {
    mockResource = mockInstanceOf<Resource<RESOURCE_ENERGY>>({
        id: "resourceid",
        resourceType: RESOURCE_ENERGY,
        amount: 1000,
        pos: mockInstanceOf<RoomPosition>({
            getRangeTo: () => 5
        })
    })
    mockCreep = mockInstanceOf<Creep>({
        moveTo: () => OK,
        pickup: () => OK,
        pos: new RoomPosition(5, 5, "roomName"),
        store: {
            getFreeCapacity: () => 0
        },
        room: {
            find: () => [mockResource]
        }
    })
    mockGlobal<Game>("Game", {
        getObjectById: (id: string): any => {
            if (id === "creepId") {
                return mockCreep
            }
            return undefined
        },
        creeps: {
            "creepId": mockCreep
        }
    })
    task = new GetEnergy(
        "myid",
        null,
        0,
        {creepId: "creepId", "sourceId": "sourceId"},
        mockInstanceOf<Kernel>(),
    )
})

it("should stop if no resource pile is not found",() => {
    // @ts-ignore
    mockCreep.room.find = () => []
    task.run()
    expect(mockCreep.pickup).toHaveBeenCalledTimes(0)
    expect(task.finished).toBeTruthy()
})

it("should stop if creep is not found",() => {
    Game.getObjectById = () => null
    task.run()
    expect(mockCreep.pickup).toHaveBeenCalledTimes(0)
    expect(task.finished).toBeTruthy()
})

it("should stop if pickup was OK/store is full",() => {
    task.run()
    // @ts-ignore
    expect(mockCreep.pickup).toHaveBeenCalledTimes(1)
    expect(task.finished).toBeTruthy()
})

it("should stop if pickup was OK/store is full (2)",() => {
    mockCreep.pickup = jest.fn().mockReturnValue(ERR_FULL)
    task.run()
    // @ts-ignore
    expect(mockCreep.pickup).toHaveBeenCalledTimes(1)
    expect(task.finished).toBeTruthy()
})

it("should move to resource if more than one step away and not stop",() => {
    mockCreep.pickup = jest.fn(() => ERR_NOT_IN_RANGE)
    task.run()
    expect(mockCreep.pickup).toHaveBeenCalledTimes(1)
    expect(mockCreep.moveTo).toHaveBeenCalledTimes(1)
    expect(mockCreep.moveTo).toHaveBeenCalledWith(mockResource, expect.anything())
    expect(task.finished).not.toBeTruthy()
})

it("should stop on error",() => {
    mockCreep.pickup = jest.fn(() => ERR_NOT_OWNER)
    task.run()
    expect(mockCreep.pickup).toHaveBeenCalledTimes(1)
    expect(task.finished).toBeTruthy()
})

it("should continue if pickup was OK and storage space is left",() => {
    mockCreep.pickup = jest.fn(() => OK)
    // @ts-ignore
    mockCreep.store.getFreeCapacity = () => 10
    task.run()
    expect(mockCreep.pickup).toHaveBeenCalledTimes(1)
    expect(task.finished).not.toBeTruthy()
})

it("should pickup from closest resource pile", () => {
    const closeResource = mockInstanceOf<Resource<RESOURCE_ENERGY>>({
        id: "resourceIdCloser",
        resourceType: RESOURCE_ENERGY,
        amount: 1000,
        pos: mockInstanceOf<RoomPosition>({
            getRangeTo: () => 3
        })
    })
    mockCreep.room.find = () => {return [mockResource, closeResource]}
    // @ts-ignore
    mockCreep.store.getFreeCapacity = () => {return 50}
    task.run()
    expect(mockCreep.pickup).toHaveBeenCalledTimes(1)
    expect(mockCreep.pickup).toHaveBeenCalledWith(closeResource)
    expect(task.finished).not.toBeTruthy()
})

it("should ignore small resource piles if there are bigger deposits", () => {
    mockResource.amount = 5
    const largeResource = mockInstanceOf<Resource<RESOURCE_ENERGY>>({
        id: "resourceIdLarge",
        resourceType: RESOURCE_ENERGY,
        amount: 70,
        pos: mockInstanceOf<RoomPosition>({
            getRangeTo: () => 20
        })
    })
    mockCreep.room.find = () => {return [mockResource, largeResource]}
    // @ts-ignore
    mockCreep.store.getFreeCapacity = () => {return 50}
    task.run()
    expect(mockCreep.pickup).toHaveBeenCalledTimes(1)
    expect(mockCreep.pickup).toHaveBeenCalledWith(largeResource)
    expect(task.finished).not.toBeTruthy()
})