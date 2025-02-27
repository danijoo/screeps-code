import {CreepController} from "../creeps/CreepController"
import {GetEnergy} from "./creeps/actions/GetEnergy"
import {BuilderRole} from "./creeps/BuilderRole"
import {SpawnFillerRole} from "./creeps/SpawnFillerRole";
import {HarvestEnergy} from "./creeps/actions/HarvestEnergy";
import {PioneerRole} from "./creeps/PioneerRole";
import {TransferEnergy} from "./creeps/actions/TransferEnergy";
import {UpgradeController} from "./creeps/actions/UpgradeController";
import {UpgraderRole} from "./creeps/UpgraderRole"
import {ConstructionSiteBuild} from "./room/ConstructionSiteBuild"
import {TowerControl} from "./room/TowerControl"
import {ControllerUpgrade} from "./room/ControllerUpgrade"
import {SourceHarvest} from "./room/SourceHarvest"
import {FreeCreeps} from "./global/FreeCreeps";
import {Init} from "./Init";
import {RoomControl} from "./room/RoomControl";
import {PioneerRoomStrategy} from "./room/strategies/PioneerRoomStrategy";
import {SpawnFill} from "./room/SpawnFill";
import {
    TASK_CREEP_ACTION_BUILD_STRUCTURE,
    TASK_CREEP_ACTION_GET_ENERGY,
    TASK_CREEP_ACTION_HARVEST_ENERGY,
    TASK_CREEP_ACTION_TRANSFER_ENERGY,
    TASK_CREEP_ACTION_UPGRADE_CONTROLLER,
    TASK_CREEP_ROLE_BUILDER,
    TASK_CREEP_ROLE_FILLER,
    TASK_CREEP_ROLE_HARVESTER,
    TASK_CREEP_ROLE_PIONEER,
    TASK_CREEP_ROLE_UPGRADER,
    TASK_INIT,
    TASK_ROOM_CONTROL,
    TASK_ROOM_CONTROLLER_UPGRADE,
    TASK_ROOM_SOURCE_HARVEST,
    TASK_ROOM_STORAGE,
    TASK_ROOM_STRATEGY_GROWING,
    TASK_ROOM_STRATEGY_PIONEER,
    TASK_SYSTEM_FREE_CREEPS,
    TASK_ROOM_TOWER_CONTROL,
    TASK_ROOM_CONSTRUCTION,
    TASK_ROOM_CONSTRUCTIONSITE_BUILD,
    TASK_CREEP_CONTROL
} from "./taskNames"
import { BuildStructure } from "./creeps/actions/BuildStructure";
import { GrowingRoomStrategy } from "./room/strategies/GrowingRoomStrategy";
import { HarvesterRole } from "./creeps/HarvesterRole";
import { Construction } from "./room/Construction";


export const taskMap: {[type: string]: any} = {
    [TASK_INIT]: Init,
    [TASK_SYSTEM_FREE_CREEPS]: FreeCreeps,
    [TASK_CREEP_CONTROL]: CreepController,
    [TASK_ROOM_CONTROL]: RoomControl,
    [TASK_ROOM_STRATEGY_PIONEER]: PioneerRoomStrategy,
    [TASK_ROOM_STRATEGY_GROWING]: GrowingRoomStrategy,
    [TASK_ROOM_STORAGE]: SpawnFill,
    [TASK_ROOM_SOURCE_HARVEST]: SourceHarvest,
    [TASK_ROOM_CONTROLLER_UPGRADE]: ControllerUpgrade,
    [TASK_ROOM_TOWER_CONTROL]: TowerControl,
    [TASK_ROOM_CONSTRUCTION]: Construction,
    [TASK_ROOM_CONSTRUCTIONSITE_BUILD]: ConstructionSiteBuild,
    [TASK_CREEP_ROLE_PIONEER]: PioneerRole,
    [TASK_CREEP_ROLE_FILLER]: SpawnFillerRole,
    [TASK_CREEP_ROLE_BUILDER]: BuilderRole,
    [TASK_CREEP_ROLE_HARVESTER]: HarvesterRole,
    [TASK_CREEP_ROLE_UPGRADER]: UpgraderRole,
    [TASK_CREEP_ACTION_HARVEST_ENERGY]: HarvestEnergy,
    [TASK_CREEP_ACTION_UPGRADE_CONTROLLER]: UpgradeController,
    [TASK_CREEP_ACTION_TRANSFER_ENERGY]: TransferEnergy,
    [TASK_CREEP_ACTION_BUILD_STRUCTURE]: BuildStructure,
    [TASK_CREEP_ACTION_GET_ENERGY]: GetEnergy,
}