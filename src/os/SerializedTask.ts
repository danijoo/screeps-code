import {taskMap} from "../tasks/taskMap";
import {Kernel} from "./Kernel";
import {Task} from "./Task";

export interface SerializedTask {
    id: string
    parentId: string | null
    wakeParent: boolean
    type: string
    suspended: boolean | number
    priority: number
    data: any
}

export function deserialize(serializedTask: SerializedTask, kernel: Kernel): Task {
    const taskClass = taskMap[serializedTask.type]
    return new taskClass(
        serializedTask.id,
        serializedTask.parentId? kernel.findTaskById(serializedTask.parentId) : null,
        serializedTask.priority,
        serializedTask.data,
        kernel,
        serializedTask.wakeParent,
        serializedTask.suspended,
    )
}