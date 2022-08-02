import { mockGlobal, mockInstanceOf } from "screeps-jest"
import {Kernel} from "../../../../src/os/Kernel"
import {Construction, ConstructionRequest} from "../../../../src/tasks/room/Construction"

let task: Construction
let mockRoom: Room
beforeEach(() => {
    mockRoom = mockInstanceOf<Room>({
        memory: {
            constructionQueue: [new ConstructionRequest(
                [5, 5],
                STRUCTURE_EXTENSION,
                5,
            )]
        },
        find: () => [],
        createConstructionSite: jest.fn()
    })
    mockGlobal<Game>("Game", {
        rooms: {
            roomName: mockRoom
        }
    })
    task = new Construction(
        "myid",
        null,
        0,
        {roomName: "roomName"},
        new Kernel()
    )
    task.room = mockRoom
})

it("should use memory for the queue", () => {
    expect(task.queueLength()).toBe(1)
    expect(task.queueLength()).toBe(Game.rooms.roomName.memory.constructionQueue.length)
})

it("Should queue requests by priority", () => {
    task.addToQueue(new ConstructionRequest([10, 10], STRUCTURE_EXTENSION, 9))
    expect(task.queueLength()).toBe(2)
    expect(task.getNextFromQueue()?.priority).toBe(9)
    expect(task.queueLength()).toBe(1)
    expect(task.getNextFromQueue()?.priority).toBe(5)
    expect(task.queueLength()).toBe(0)
})

it("Should peek the queue", () => {
    task.addToQueue(new ConstructionRequest([10, 10], STRUCTURE_EXTENSION, 9))
    expect(task.queueLength()).toBe(2)
    expect(task.peekQueue()?.priority).toBe(9)
    expect(task.queueLength()).toBe(2)
})

it("Should add to queue via IPC messages", () => {
    task.ipcReceive("someSenderId", new ConstructionRequest([10, 10], STRUCTURE_EXTENSION, 9))
    expect(task.queueLength()).toBe(2)
})

it("Should create a construction sites from queue", () => {
    task.run()
    expect(mockRoom.createConstructionSite).toHaveBeenCalledTimes(1)
})

it("Should not create more than MAX_NUM_CONSTRUCTION_SITES", () => {
    for (let i = 0; i < 10; i++) {
        task.addToQueue(new ConstructionRequest([8, i], STRUCTURE_EXTENSION, 9))
    }
    mockRoom.find = () => [{}, {}]  // 2 sites
    task.run()
    expect(mockRoom.createConstructionSite).toHaveBeenCalledTimes(3)
})