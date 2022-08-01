import {Task} from "./Task";

export class TaskTable {
    items: Map<string, Task> = new Map()
    length: number = 0

    add(task: Task): void {
        this.items.set(task.id, task)
        this.length += 1
    }

    has(taskId: string): boolean {
        return this.items.has(taskId)
    }

    get(taskId: string): Task | undefined {
        return this.items.get(taskId)
    }

    addIfNotExists(task: Task): boolean {
        if (!this.has(task.id)) {
            this.add(task)
            return true
        }
        return false
    }

    remove(taskId: string): Task | undefined {
        if (!this.has(taskId)) {
            return undefined
        } else {
            const task = this.items.get(taskId)
            this.items.delete(taskId)
            this.length -= 1
            return task
        }
    }

    removeByPriority(filter: ((item: Task) => {}) | null = null): Task | undefined {
        const task = this.nextByPriority(filter)
        if (task) {
            this.remove(task.id)
        }
        return task
    }

    /**
     * Get task with highest priority matching the given filter
     * @param filter
     */
    nextByPriority(filter: ((item: Task) => {}) | null = null): Task | undefined {
        let highestPrioTask: Task | undefined
        for (const item of this.items.values()) {
            if (filter && !filter(item)) {
                continue
            }
            if (!highestPrioTask || item.priority > highestPrioTask.priority) {
                highestPrioTask = item
            }
        }
        return highestPrioTask
    }

    hasItems(filter: ((item: Task) => {}) | null = null): boolean {
        for (const item of this.items.values()) {
            if (!filter || filter(item)) {
                return true
            }
        }
        return false
    }
}