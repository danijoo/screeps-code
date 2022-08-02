import {mockGlobal, mockInstanceOf} from "screeps-jest"
import {Kernel} from "../../../../../src/os/Kernel"
import {Construction} from "../../../../../src/tasks/room/Construction"
import {ControllerUpgrade} from "../../../../../src/tasks/room/ControllerUpgrade"
import {SourceHarvest} from "../../../../../src/tasks/room/SourceHarvest"
import {Storage} from "../../../../../src/tasks/room/Storage"
import {GrowingRoomStrategy} from "../../../../../src/tasks/room/strategies/GrowingRoomStrategy"
import {TowerControl} from "../../../../../src/tasks/room/TowerControl"

let task: GrowingRoomStrategy
let kernel: Kernel
beforeEach(() => {
    mockGlobal<Game>("Game", {
        time: 1000,
        rooms: {
            "roomName": mockInstanceOf<Room>({
                name: "roomName",
                controller: {
                    level: 3
                }
            })
        }
    })
    kernel = new Kernel()
    task = new GrowingRoomStrategy(
        "taskId",
        null,
        0,
        {roomName: "roomName"},
        kernel
    )
})

it("Should finish if room is not found", () => {
    Game.rooms = {}
    task.run()
    expect(task.finished).toBeTruthy()
    expect(kernel.taskTable.length).toBe(0)
})

it("Should start a source harvesting task", () => {
    task.run()
    expect(task.finished).toBeTruthy()
    const childTask = kernel.findTaskById("srcHarvest")
    expect(childTask).toBeInstanceOf(SourceHarvest)
})

it("Should start an upgrade controller task", () => {
    task.run()
    expect(task.finished).toBeTruthy()
    const childTask = kernel.findTaskById("ctrlUpgrade")
    expect(childTask).toBeInstanceOf(ControllerUpgrade)
})

it("Should start a storage filler task", () => {
    task.run()
    expect(task.finished).toBeTruthy()
    const childTask = kernel.findTaskById("strgeFiller")
    expect(childTask).toBeInstanceOf(Storage)
})

it("Should start a tower control task at rcl >= 3", () => {
    task.run()
    expect(task.finished).toBeTruthy()
    const childTask = kernel.findTaskById("towerCtrl")
    expect(childTask).toBeInstanceOf(TowerControl)
})

it("Should not start a tower control task at rcl < 3", () => {
    // @ts-ignore
    Game.rooms.roomName.controller.level = 2
    task.run()
    expect(task.finished).toBeTruthy()
    const childTask = kernel.findTaskById("towerCtrl")
    expect(childTask).toBeUndefined()
})

it("Should start a construction task", () => {
    task.run()
    expect(task.finished).toBeTruthy()
    const childTask = kernel.findTaskById("construct")
    expect(childTask).toBeInstanceOf(Construction)
})