import {mockGlobal, mockInstanceOf} from "screeps-jest"
import {Kernel} from "../../../..//src/os/Kernel"
import {GrowingRoomStrategy} from "../../../..//src/tasks/room/GrowingRoomStrategy"
import {PioneerRoomStrategy} from "../../../..//src/tasks/room/PioneerRoomStrategy"
import {RoomControl} from "../../../..//src/tasks/room/RoomControl"

let task: RoomControl
let kernel: Kernel
beforeEach(() => {
    mockGlobal<Game>("Game", {
        rooms: {
            roomId: {
                name: "roomId",
                controller: mockInstanceOf<StructureController>({
                    level: 0
                })
            }
        }
    }, true)
    kernel = new Kernel()
    task = new RoomControl(
        "roomctrl",
        null,
        0,
        {"roomName": "roomId"},
        kernel
    )
})

it("Should return if room is not found", () => {
    task.data!.roomId = "qwert"
    task.run()
    expect(task.finished).toBeTruthy()
    expect(kernel.taskTable.length).toBe(0)
})

it("Should set room strategy to pioneer at rcl 1", () => {
    Game.rooms.roomId!.controller!.level = 1
    task.run()
    expect(task.finished).toBeTruthy()
    expect(kernel.taskTable.length).toBe(1)
    expect(kernel.taskTable.nextByPriority()).toBeInstanceOf(PioneerRoomStrategy)
})

it("Should do nothing at rcl 0", () => {
    Game.rooms.roomId!.controller!.level = 0
    task.run()
    expect(task.finished).toBeTruthy()
    expect(kernel.taskTable.length).toBe(0)
})

it("Should set room strategy to growing at rcl > 1", () => {
    Game.rooms.roomId!.controller!.level = 2
    task.run()
    expect(task.finished).toBeTruthy()
    expect(kernel.taskTable.length).toBe(1)
    expect(kernel.taskTable.nextByPriority()).toBeInstanceOf(GrowingRoomStrategy)
})
