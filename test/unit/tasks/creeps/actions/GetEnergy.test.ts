import {mockGlobal, mockInstanceOf} from "screeps-jest";
import {Kernel} from "../../../../../src/os/Kernel";
import {GetEnergy} from "../../../../../src/tasks/creeps/actions/GetEnergy"

let mockResources: Resource<RESOURCE_ENERGY>[]
let mockContainers: StructureContainer[]
let mockCreep: Creep
let task: GetEnergy
beforeEach(() => {
    mockResources = [mockInstanceOf<Resource<RESOURCE_ENERGY>>({
        id: "resourceId",
        resourceType: RESOURCE_ENERGY,
        amount: 1000,
        pos: mockInstanceOf<RoomPosition>({
            getRangeTo: () => 5
        }),
        structureType: undefined,
    })]
    mockContainers = [mockInstanceOf<StructureContainer>({
        id: "containerId",
        store: {
            getUsedCapacity: (resourceType: ResourceConstant) => (resourceType === RESOURCE_ENERGY) ? 1000 : 0
        },
        pos: mockInstanceOf<RoomPosition>({
            getRangeTo: () => 7
        }),
        structureType: STRUCTURE_CONTAINER,
    })]
    const mockRoom = mockInstanceOf<Room>({
        find: (type: number) => type === FIND_DROPPED_RESOURCES ? mockResources : mockContainers
    })
    mockCreep = mockInstanceOf<Creep>({
        pickup: jest.fn(),
        moveTo: jest.fn(),
        withdraw: jest.fn(),
        pos: new RoomPosition(5, 5, "roomName"),
        store: {
            getFreeCapacity: () => 0
        },
        room: mockRoom
    })
    mockGlobal<Game>("Game", {
        getObjectById: (id: string): any => {
            return {
                "creepId": mockCreep,
                "resourceId": mockResources[0],
                "containerId": mockContainers[0]
            }[id]
        },
        creeps: {
            creepId: mockCreep
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

it("should stop if no resources are not found",() => {
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
    mockCreep.pickup = jest.fn().mockReturnValueOnce(OK)
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
    expect(mockCreep.moveTo).toHaveBeenCalledWith(mockResources[0], expect.anything())
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
        }),
        structureType: undefined
    })
    mockResources.push(closeResource)
    // @ts-ignore
    mockCreep.store.getFreeCapacity = () => {return 50}
    mockCreep.pickup = jest.fn().mockReturnValue(OK)
    task.run()
    expect(mockCreep.pickup).toHaveBeenCalledTimes(1)
    expect(mockCreep.pickup).toHaveBeenCalledWith(closeResource)
    expect(task.finished).not.toBeTruthy()
})

it("should ignore small resource piles if there are bigger deposits", () => {
    mockContainers = []
    mockResources[0].amount = 5
    const largeResource = mockInstanceOf<Resource<RESOURCE_ENERGY>>({
        id: "resourceIdLarge",
        resourceType: RESOURCE_ENERGY,
        amount: 70,
        pos: mockInstanceOf<RoomPosition>({
            getRangeTo: () => 20
        }),
        structureType: undefined
    })
    mockResources.push(largeResource)
    mockCreep.pickup = jest.fn().mockReturnValue(OK)
    // @ts-ignore
    mockCreep.store.getFreeCapacity = () => {return 50}
    task.run()
    expect(mockCreep.pickup).toHaveBeenCalledTimes(1)
    expect(mockCreep.pickup).toHaveBeenCalledWith(largeResource)
    expect(task.finished).not.toBeTruthy()
})

it ("should withdraw from containers", () => {
    mockResources = []
    mockCreep.withdraw = jest.fn().mockReturnValue(OK)
    task.run()
    expect(mockCreep.withdraw).toHaveBeenCalledTimes(1)
    expect(task.finished).toBeTruthy()
})