import {Kernel} from "./Kernel";
import {SerializedTask} from "./SerializedTask";

export interface TaskData {
    [key:string]: any | null
}

export abstract class Task {
    abstract readonly type: string

    kernel: Kernel
    id: string  // unique task identifier
    parent?: Task  // unique identifier of parent task
    wakeParent: boolean  // marks if suspended parent should be wakened after this task finished
    executed: boolean  // whether this task was executed this tick
    finished: boolean  // whether this task is finished
    priority: number

    // if boolean, marks the task as suspened. If number, suspend the task for this many ticks
    suspended: boolean | number

    data?: TaskData | null

    constructor(id: string,
                parent: Task | null,
                priority: number,
                data: TaskData | null,
                kernel: Kernel,
                wakeParent?: boolean,
                suspended?: boolean | number) {
        this.id = id
        this.parent = parent ?? undefined
        this.priority = priority
        this.data = data ?? undefined
        this.kernel = kernel
        this.wakeParent = wakeParent ?? false
        this.suspended = suspended ?? false
        this.executed = false
        this.finished = false
    }

    run(): void {
        if(this.finished)  // cannot run a finished task
            return
        this.finished = this._run()
        if (this.finished) {
            this.onFinish(false)
        }
    }

    abstract _run(): boolean

    serialize(): SerializedTask {
        return {
            id: this.id,
            parentId: this.parent? this.parent.id : null,
            wakeParent: this.wakeParent,
            type: this.type,
            suspended: this.suspended,
            data: this.data,
            priority: this.priority
        }
    }

    equals(other: Task): boolean {
        return this.id === other.id
    }

    getName(): string {
        return this.type + " : " + this.id
    }

    /**
     * Called when a task is finished, i.e. after a run or when the task was killed
     */
    onFinish(killed: boolean = false): void {
        // can be used to perform some cleanup when a task finishes
    }

    fork(
        type: string,
        id: string,
        priority: number,
        data: any = null,
        wakeParent?: boolean,
        suspended?: boolean,
        overwrite?: boolean
    ): Task | undefined {
        if (overwrite) {
            return this.kernel.createTask(type, id, this, priority, data, wakeParent, suspended)
        } else {
            return this.kernel.createTaskIfNotExists(type, id, this, priority, data, wakeParent, suspended)
        }
    }

    forkAndSuspend(
        type: string,
        id: string,
        priority: number,
        data: any = null,
        wakeParent?: boolean,
        suspended?: boolean,
        overwrite?: boolean,
    ): Task | undefined {
        const task = this.fork(type, id, priority, data, wakeParent, suspended, overwrite)
        if (task)
            this.suspended = true
        return task
    }
}