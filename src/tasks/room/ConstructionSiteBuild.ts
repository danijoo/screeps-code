import {CreepController} from "../../creeps/creepController"
import {Task} from "../../os/Task"
import {TASK_CREEP_ROLE_BUILDER, TASK_ROOM_CONSTRUCTIONSITE_BUILD} from "../taskNames"
import {PRIORITY_ROLE_BUILD} from "../taskPriorities"
import {RoomTask} from "./RoomTask"
import CreepRequest = CreepController.CreepRequest
import requestCreep = CreepController.requestCreep

const MAX_NUM_BUILDERS = 5
const MAX_NUM_BUILDERS_PER_SITE = 2

export class ConstructionSiteBuild extends RoomTask {
    readonly type: string = TASK_ROOM_CONSTRUCTIONSITE_BUILD

    runWithRoom(room: Room): boolean {
        // get a list of construction sites
        const constructionSites: ConstructionSite[] = room.find(FIND_MY_CONSTRUCTION_SITES)

        // already running builder tasks
        const runningBuilderTasks: Task[] = _.range(0, MAX_NUM_BUILDERS)
            .map(i => this.kernel.findTaskById(this.getBuilderTaskId(i)))
            .filter(t => t !== undefined)
            .map(t => t as Task)

        creeploop: for (let i = 0; i < MAX_NUM_BUILDERS; i++) {
            const taskId = this.getBuilderTaskId(i)

            // check if there is already a running builder task with this id
            // because the taskIds are unique, this take care MAX_NUM_BUILDERS is not exceeded
            if (runningBuilderTasks.filter(t => t.id === taskId).length > 0) {
                continue
            }

            for (const site of constructionSites) {
                let runningSiteTasksLen = runningBuilderTasks.filter(t => t.data.constructionSiteId === site.id).length
                if (runningSiteTasksLen < MAX_NUM_BUILDERS_PER_SITE) {
                    let task = this.createTaskForSite(taskId, site)
                    if (task) {
                        runningBuilderTasks.push(task)
                        continue creeploop
                    } else {
                        break creeploop
                    }
                }
            }
        }

        return true
    }

    getBuilderTaskId(counter: number): string {
        return "builder-" + counter
    }

    createTaskForSite(taskId: string, site: ConstructionSite): Task | undefined {
        // Get a creep and create a new builder task wth it
        const creepRequest = new CreepRequest([MOVE, WORK, CARRY], this.priority,
            undefined, false)
        const creep = requestCreep(creepRequest, taskId)
        if (creep) {
            return this.fork(
                TASK_CREEP_ROLE_BUILDER,
                taskId,
                PRIORITY_ROLE_BUILD,
                {constructionSiteId: site.id, creepId: creep.id})
        }
        return undefined
    }

}