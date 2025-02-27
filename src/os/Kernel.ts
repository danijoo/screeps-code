import {taskMap} from "../tasks/taskMap";
import {deserialize, SerializedTask} from "./SerializedTask";
import {Task} from "./Task";
import { TaskTable } from "./TaskTable";

declare global {
    interface Memory {
        // priority and task
        tasks: SerializedTask[]
    }
}

export class Kernel {

    taskTable = new TaskTable()
    executedTasks: Task[] = []

    tickTasksTotal: number = 0
    tickTasksExecuted: number = 0
    tickTasksSuspended: number = 0
    tickTasksAdded: number = 0
    tickTasksFinished: number = 0

    init(): void {
        // repopulate process table
        const taskList = Memory.tasks? Memory.tasks : []
        taskList.forEach((st) => {
            try {
                const task = deserialize(st, this)
                this.taskTable.add(task)
            } catch (e) {
                console.log(`Failed to deserialize task ${st.type}:${st.id}: ${e}`)
            }
        })
    }

    runTasks(): void {
        this.tickTasksSuspended = Array.from(this.taskTable.items.values()).filter(task => task.suspended).length
        const filter = (t: Task): boolean => {
            const permanentlySuspended = _.isBoolean(t.suspended) && t.suspended
            return !t.executed && !permanentlySuspended
        }
        let task = this.taskTable.nextByPriority(filter)
        while (task) {
            if (_.isNumber(task.suspended) && task.suspended > 0) {
                task.suspended -= 1
            } else {
                try {
                    task.run()
                    if (task.finished) {
                        this.tickTasksFinished += 1
                        this.taskTable.remove(task.id)
                        if (task.parent && task.wakeParent) {
                            this.wake(task.parent)
                        }
                    }
                } catch (e) {
                    console.log(`Failed to execute task ${task.type}:${task.id}: ${e}`)
                }
                this.tickTasksExecuted += 1
            }
            task.executed = true
            this.executedTasks.push(task)
            task = this.taskTable.nextByPriority(filter)
        }
        this.tickTasksTotal = this.taskTable.length + this.tickTasksFinished
    }

    suspend(): void {
        const serializedTasks: SerializedTask[] = []
        for (const task of this.taskTable.items.values()) {
            if (!task.finished) {
                try {
                    serializedTasks.push(task.serialize())
                } catch (e) {
                    console.log(`Failed to serialize task ${task.type}:${task.id}: ${e}`)
                }

            }
        }
        Memory.tasks = serializedTasks
    }

    wake(task: Task): void {
        task.suspended = false
    }

    kill(task: Task): void {
        task.executed = true
        task.finished = true
        this.taskTable.remove(task.id)
        if (task.parent && task.wakeParent) {
            this.wake(task.parent)
        }
        task.onFinish(true)
    }

    createTask(type: string,
                          id: string,
                          parent: Task | null,
                          priority: number,
                          data: any = null,
                          wakeParent?: boolean,
                          suspended?: boolean): Task | undefined {
        const taskClass = taskMap[type]
        const task: Task = new taskClass(
            id,
            parent,
            priority,
            data,
            this,
            wakeParent,
            suspended
        )
        this.addTask(task)
        return task
    }

    /**
     * create a task and adds it to the task list if a similar task does not exist yet.
     * Returns the task if a new task was created
     */
    createTaskIfNotExists(type: string,
                          id: string,
                          parent: Task | null,
                          priority: number,
                          data: any = null,
                          wakeParent?: boolean,
                          suspended?: boolean): Task | undefined {
        const taskClass = taskMap[type]
        const task: Task = new taskClass(
            id,
            parent,
            priority,
            data,
            this,
            wakeParent,
            suspended
        )
        if (this.addTaskIfNotExists(task)) {
            return task
        }

        return undefined
    }

    /**
     * Adds the task to the tasklist if it does not exist. Returns
     * true if the task was added
     * @param task
     */
    addTaskIfNotExists(task: Task): boolean {
        const result = this.taskTable.addIfNotExists(task)
        if (result)
            this.tickTasksAdded += 1
        return result
    }

    addTask(task: Task): void {
        this.tickTasksAdded += 1
        this.taskTable.add(task)
    }

    doesTaskExist(taskId: string): boolean {
        return this.taskTable.has(taskId)
    }

    findTaskById(id: string): Task | undefined {
        return this.taskTable.get(id)
    }

    findTasksByPrefix(prefix: string): Task[] {
        return Array.from(this.taskTable.items.values()).filter(t => t.id.startsWith(prefix))
    }

    report(): void {
        const header = `| Task${" ".repeat(92)} | Parent${" ".repeat(90)} | Prio. | Exec. | Suspended | Finished |`
        console.log("-".repeat(header.length))
        console.log(header)
        console.log("-".repeat(header.length))
        this.executedTasks.sort((a,b) => b.priority - a.priority).forEach(t => {
            const parentName = t.parent?.getName() ?? ""
            console.log(`| ${t.getName().padEnd(96, " ")} | ${parentName.padEnd(96, " ")} | `
                + `${t.priority.toString().padEnd(5, " ")} | ${t.executed.toString().padEnd(5, " ")} | `
                + `${t.suspended.toString().padEnd(9, " ")} | ${t.finished.toString().padEnd(8, " ")} |`)
        })
        console.log("-".repeat(header.length))
    }
}