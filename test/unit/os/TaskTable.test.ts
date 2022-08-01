import {Kernel} from "../../..//src/os/Kernel";
import {Task} from "../../..//src/os/Task";
import {TaskTable} from "../../..//src/os/TaskTable";

function testTask(id: string, priority: number, suspend: boolean = false): Task {
    return new class TestTask extends Task {
        type = "TestTask"
        _run(): boolean { return false }
    }(
        id,
        null,
        priority,
        null,
        new Kernel()
    )
}

const filterForFirst = (task: Task) => {
    return !task.id.endsWith("d")
}

let table: TaskTable
beforeEach(() => {
    table = new TaskTable()
    table.add(testTask("First", 0))
    table.add(testTask("Second", 5))
    table.add(testTask("Third", 2))
})

it("should add tasks", () => {
    expect(table.length).toBe(3)
    table.add(testTask("Fourth", 3))
    expect(table.length).toBe(4)
})

it("should have tasks", () => {
    expect(table.has("First")).toBeTruthy()
})

it("should get tasks", () => {
    expect(table.get("First")!.id).toBe("First")
    expect(table.get("qweqweqkehqwke")).toBeUndefined()
})

it("should remove tasks", () => {
    expect(table.remove("First")!.id).toBe("First")
    expect(table.remove("qwqeqeqwe")).toBeUndefined()
})

it("should handle priority on removeByPriority", () => {
    expect(table.removeByPriority()!.id).toEqual("Second")
    expect(table.removeByPriority()!.id).toEqual("Third")
    expect(table.removeByPriority()!.id).toEqual("First")
    expect(table.removeByPriority()).toEqual(undefined)
})

it("should handle filter on removeByPriority", () => {
    expect(table.removeByPriority(filterForFirst)!.id).toEqual("First")
    expect(table.removeByPriority(filterForFirst)).toBeUndefined()
    expect(table.length).toBe(2)
})

it("should handle priority and filter on nextByPriority", () => {
    expect(table.nextByPriority()!.id).toEqual("Second")
    expect(table.nextByPriority(filterForFirst)!.id).toEqual("First")
})

it("should use filter on hasItems", () => {
    expect(table.hasItems()).toEqual(true)
    expect(table.hasItems((item) => {return item.id.endsWith("x")})).toEqual(false)
    expect(table.hasItems(filterForFirst)).toEqual(true)
})
