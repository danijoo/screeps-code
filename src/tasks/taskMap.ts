import {GetEnergy} from "./creeps/actions/GetEnergy"
import {BuilderRole} from "./creeps/BuilderRole"
import {StoreFillerRole} from "./creeps/StoreFillerRole";
import {HarvestEnergy} from "./creeps/actions/HarvestEnergy";
import {PioneerRole} from "./creeps/PioneerRole";
import {TransferEnergy} from "./creeps/actions/TransferEnergy";
import {UpgradeController} from "./creeps/actions/UpgradeController";
import {UpgraderRole} from "./creeps/UpgraderRole"
import {TowerControl} from "./room/TowerControl"
import {ControllerUpgrade} from "./room/ControllerUpgrade"
import {SourceHarvest} from "./room/SourceHarvest"
import {FreeCreeps} from "./global/FreeCreeps";
import {Init} from "./Init";
import {RoomControl} from "./room/RoomControl";
import {PioneerRoomStrategy} from "./room/strategies/PioneerRoomStrategy";
import {Storage} from "./room/Storage";
import {
    TASK_CREEP_ACTION_BUILD_STRUCTURE, TASK_CREEP_ACTION_GET_ENERGY,
    TASK_CREEP_ACTION_HARVEST_ENERGY,
    TASK_CREEP_ACTION_TRANSFER_ENERGY,
    TASK_CREEP_ACTION_UPGRADE_CONTROLLER,
    TASK_CREEP_ROLE_BUILDER,
    TASK_CREEP_ROLE_FILLER, TASK_CREEP_ROLE_HARVESTER,
    TASK_CREEP_ROLE_PIONEER, TASK_CREEP_ROLE_UPGRADER,
    TASK_INIT,
    TASK_ROOM_CONTROL, TASK_ROOM_CONTROLLER_UPGRADE, TASK_ROOM_SOURCE_HARVEST,
    TASK_ROOM_STORAGE, TASK_ROOM_STRATEGY_GROWING,
    TASK_ROOM_STRATEGY_PIONEER,
    TASK_SYSTEM_FREE_CREEPS, TASK_ROOM_TOWER_CONTROL
} from "./taskNames"
import { BuildStructure } from "./creeps/actions/BuildStructure";
import { GrowingRoomStrategy } from "./room/strategies/GrowingRoomStrategy";
import { HarvesterRole } from "./creeps/HarvesterRole";


export const taskMap: {[type: string]: any} = {
    [TASK_INIT]: Init,
    [TASK_SYSTEM_FREE_CREEPS]: FreeCreeps,
    [TASK_ROOM_CONTROL]: RoomControl,
    [TASK_ROOM_STRATEGY_PIONEER]: PioneerRoomStrategy,
    [TASK_ROOM_STRATEGY_GROWING]: GrowingRoomStrategy,
    [TASK_ROOM_STORAGE]: Storage,
    [TASK_ROOM_SOURCE_HARVEST]: SourceHarvest,
    [TASK_ROOM_CONTROLLER_UPGRADE]: ControllerUpgrade,
    [TASK_ROOM_TOWER_CONTROL]: TowerControl,
    [TASK_CREEP_ROLE_PIONEER]: PioneerRole,
    [TASK_CREEP_ROLE_FILLER]: StoreFillerRole,
    [TASK_CREEP_ROLE_BUILDER]: BuilderRole,
    [TASK_CREEP_ROLE_HARVESTER]: HarvesterRole,
    [TASK_CREEP_ROLE_UPGRADER]: UpgraderRole,
    [TASK_CREEP_ACTION_HARVEST_ENERGY]: HarvestEnergy,
    [TASK_CREEP_ACTION_UPGRADE_CONTROLLER]: UpgradeController,
    [TASK_CREEP_ACTION_TRANSFER_ENERGY]: TransferEnergy,
    [TASK_CREEP_ACTION_BUILD_STRUCTURE]: BuildStructure,
    [TASK_CREEP_ACTION_GET_ENERGY]: GetEnergy,
}
