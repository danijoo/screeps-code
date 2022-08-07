import {mockGlobal, mockInstanceOf} from "screeps-jest"
import {Kernel} from "../../../src/os/Kernel";
import {Task} from "../../../src/os/Task";
import {taskMap} from "../../../src/tasks/taskMap";
import {uuid} from "../../../src/utils/uuid";

class TestTaskFinishes extends Task {
    type = "TestTaskFinishes"
    _run(): boolean {
        return true
    }
}

// tslint:disable-next-line:max-classes-per-file
class TestTaskPersists extends Task {
    type = "TestTaskPersists"
    _run(): boolean {
        return false
    }
}

let kernel: Kernel
let persistingTask: Task
let finishingTask: Task

function testTask(persist: boolean): Task {
    const clazz = persist ? TestTaskPersists : TestTaskFinishes
    const id = persist ? "persists" : "finishes"
    return new clazz(
        id,
        null,
        0,
        null,
        kernel,
    )
}

beforeEach(() => {
    mockGlobal<Memory>("Memory", {
        tasks: []
    })

    // add test task to taskMap is required to make the kernel know how to deserialize it
    taskMap.TestTaskFinishes = TestTaskFinishes
    taskMap.TestTaskPersists = TestTaskPersists

    kernel = new Kernel()
    persistingTask = testTask(false)
    finishingTask = testTask(true)
})

describe("Kernel with serialized Tasks", () => {
    beforeEach(() => {
        Memory.tasks.push(persistingTask.serialize())
        Memory.tasks.push(finishingTask.serialize())
    })

    it("Should init and suspend the task list", () => {
        expect(kernel.taskTable.hasItems()).not.toBeTruthy()
        kernel.init()
        expect(kernel.taskTable.hasItems()).toBeTruthy()
        expect(kernel.taskTable.length).toBe(2)

        Memory.tasks = []
        kernel.suspend()
        expect(Memory.tasks.length).toBe(2)
    })
})

describe("Kernel with added tasks", () => {
    beforeEach(() => {
        kernel.addTask(persistingTask)
        kernel.addTask(finishingTask)
    })

    it("Should have tasks in task list", () => {
        expect(kernel.taskTable.length).toEqual(2)
    })

    it("Should not suspend finished tasks", () => {
        kernel.taskTable.items.forEach(t => t.finished = true)
        Memory.tasks = []
        kernel.suspend()
        expect(Memory.tasks.length).toBe(0)
    })

    it("Should not add a task that already exists", () => {
        expect(kernel.taskTable.length).toEqual(2)
        const result = kernel.addTaskIfNotExists(kernel.taskTable.nextByPriority()!)
        expect(result).not.toBeTruthy()
        expect(kernel.taskTable.length).toEqual(2)
    })

    it("Should create a task and add it", () => {
        expect(kernel.taskTable.length).toEqual(2)
        kernel.createTaskIfNotExists("TestTaskPersists", uuid(), null, 1, null)
        expect(kernel.taskTable.length).toEqual(3)
    })

    it("Should run all tasks in list", () => {
        kernel.taskTable.items.forEach(t => expect(t.executed).not.toBeTruthy())
        kernel.runTasks()
        expect(persistingTask.executed).toBeTruthy()
        expect(finishingTask.executed).toBeTruthy()
        expect(kernel.executedTasks.length).toBe(2)
    })

    it("Should remove finished tasks from task list", () => {
        kernel.taskTable.items.forEach(t => expect(t.executed).not.toBeTruthy())
        expect(kernel.taskTable.length).toBe(2)
        kernel.runTasks()
        expect(kernel.taskTable.length).toBe(1)
        expect(kernel.taskTable.nextByPriority()).toBeInstanceOf(TestTaskPersists)
    })

    it("Should not run suspended tasks", () => {
        kernel.taskTable.items.forEach(t => {
            t.executed = false
            t.finished = false
            t.suspended = true
        })
        kernel.runTasks()
        // assert no task was actually run
        expect(kernel.taskTable.length).toBe(2)
        kernel.taskTable.items.forEach(t => expect(!t.finished).toBeTruthy())
    })

    it("Should run suspended tasks when they become ready", () => {
        kernel.taskTable.items.forEach(t => {
            t.executed = false
            t.finished = false
            t.suspended = 2
        })

        // assert no task was actually run in the first round
        kernel.runTasks()
        kernel.taskTable.items.forEach(t => expect(!t.finished).toBeTruthy())

        // assert no task was actually run in the second round
        kernel.taskTable.items.forEach(t => { t.executed = false })
        kernel.runTasks()

        // Tasks should run in the third round
        kernel.taskTable.items.forEach(t => { t.executed = false })
        kernel.runTasks()

        // should be finished now
        expect(kernel.taskTable.length).toBe(1)
    })

    it("Should find tasks by id", () => {
        const found = kernel.findTaskById("persists")
        expect(found).not.toBeNull()
        expect(found!.id).toBe("persists")
    })

    it("Should return true if task exists", () => {
        const found = kernel.doesTaskExist(kernel.taskTable.nextByPriority()!.id)
        expect(found).toBeTruthy()
        const notFound = kernel.doesTaskExist("qweklqheqwke")
        expect(notFound).not.toBeTruthy()
    })

    it("Should wake tasks", () => {
        const task = kernel.findTaskById("persists")!
        task.suspended = true
        kernel.wake(task)
        expect(task.suspended).not.toBeTruthy()
    })

    it("Should kill tasks and not wake parent", () => {
        const childTask = testTask(true)
        const parent = kernel.taskTable.nextByPriority()!
        parent.suspended = true
        childTask.id = "child"
        childTask.parent = parent
        childTask.wakeParent = false
        kernel.kill(childTask)
        expect(childTask.executed).toBeTruthy()
        expect(childTask.finished).toBeTruthy()
        expect(parent.suspended).toBeTruthy()
    })

    it("Should wake parent when killing task", () => {
        const childTask = testTask(true)
        const parent = kernel.taskTable.nextByPriority()!
        parent.suspended = true
        childTask.id = "child"
        childTask.parent = parent
        childTask.wakeParent = true
        kernel.kill(childTask)
        expect(childTask.executed).toBeTruthy()
        expect(childTask.finished).toBeTruthy()
        expect(parent.suspended).not.toBeTruthy()
    })

    it("Should call onFinish when killing task", () => {
        const task = kernel.taskTable.nextByPriority()!
        task.onFinish = jest.fn()
        kernel.kill(task)
        expect(task.onFinish).toBeCalledWith(true)
    })

    it("Should wake parents after execution finished", () => {
        const parentTask = persistingTask
        const childTask = testTask(false)
        childTask.id = "child"
        childTask.parent = persistingTask
        childTask.wakeParent = true
        parentTask.suspended = true
        kernel.addTaskIfNotExists(childTask)
        kernel.runTasks()

        expect(childTask.executed).toBeTruthy()
        expect(parentTask.executed).toBeTruthy()
        expect(parentTask.suspended).not.toBeTruthy()
    })

    it ("Should return tasks by prefix", () => {
        for (let i = 0; i < 10; i++) {
            kernel.addTaskIfNotExists(mockInstanceOf<Task>({id: "test-" + i}))
        }
        for (let i = 0; i < 20; i++) {
            kernel.addTaskIfNotExists(mockInstanceOf<Task>({id: "foo-" + i}))
        }
        let prefixedTasksLen = kernel.findTasksByPrefix("test-").length
        expect(prefixedTasksLen).toBe(10)
    })
})