import {Kernel} from "../../../src/os/Kernel";
import {Task} from "../../../src/os/Task";
import {taskMap} from "../../../src/tasks/taskMap"

class TestTask extends Task {
    type = "TestTask"

    _run(): boolean {
        return true
    }
}

function testTask(): Task {
    const kernel = new Kernel()
    return new TestTask(
        "asdf",
        null,
        1,
        null,
        kernel)
}

beforeEach(() => {
    taskMap.TestTask = TestTask
})

it("should instantiate with default values", () => {
    const myTask = testTask()
    expect(!myTask.finished).toBeTruthy()
    expect(!myTask.executed).toBeTruthy()
})

it("should compare tasks", () => {
    const myTask = testTask()
    const copiedTask = _.clone(myTask)
    expect(myTask.equals(copiedTask)).toBeTruthy()

    const copiedTask2 = _.clone(myTask)
    copiedTask2.priority = 1
    expect(myTask.equals(copiedTask2)).toBeTruthy()

    const changedTask = _.clone(myTask)
    changedTask.id = "changed"
    expect(!myTask.equals(changedTask)).toBeTruthy()
})

it("should set finished flag when done and call onFinish", () => {
    const myTask = testTask()
    myTask.onFinish = jest.fn()
    myTask.run()
    expect(myTask.finished).toBeTruthy()
    expect(myTask.onFinish).toBeCalledTimes(1)
})

it("should _not_ set finished flag when done", () => {
    const myTask = testTask()
    myTask.onFinish = jest.fn()
    myTask.run = () => {return false}
    myTask.run()
    expect(myTask.finished).not.toBeTruthy()
    expect(myTask.onFinish).not.toBeCalled()
})

it("should fork task", () => {
    const myTask = testTask()
    const result = myTask.fork(
        "TestTask",
        "child",
        0,
        null
    )
    expect(result).toBeInstanceOf(TestTask)
    expect(result!.id).toBe("child")
    expect(myTask.suspended).not.toBeTruthy()
})

it("should suspend after forking", () => {
    const myTask = testTask()
    const result = myTask.forkAndSuspend(
        "TestTask",
        "child",
        0,
        null
    )
    expect(result).toBeInstanceOf(TestTask)
    expect(result!.id).toBe("child")
    expect(myTask.suspended).toBeTruthy()
})

it("should not suspend after unsuccessful forking", () => {
    const myTask = testTask()
    myTask.kernel.createTaskIfNotExists = jest.fn().mockReturnValue(undefined)
    const result = myTask.forkAndSuspend(
        "TestTask",
        "child",
        0,
        null
    )
    expect(result).toBeUndefined()
    expect(myTask.suspended).not.toBeTruthy()
})

it("should send and receive ipc messages", () => {
    const myTask = testTask()
    myTask.kernel.addTask(myTask)
    let messageReceived = jest.fn()
    let senderIdReceived = jest.fn()
    // @ts-ignore
    myTask.ipcReceive = (senderId: string, message: any): boolean => {
        senderIdReceived(senderId)
        messageReceived(message)
    }
    myTask.ipcSend(myTask.id, {messageBody: "qwert"})
    expect(messageReceived).toBeCalledWith({messageBody: "qwert"})
    expect(senderIdReceived).toBeCalledWith(myTask.id)
})