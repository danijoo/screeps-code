import {mockGlobal, mockInstanceOf} from "screeps-jest"
import {CreepController} from "../../../../src/creeps/creepController"
import {Kernel} from "../../../../src/os/Kernel"
import {CreepTask} from "../../../../src/tasks/creeps/CreepTask"
import {createCreepRequest, CREEP_ROLE_PIONEER, CreepRequest} from "../../../../src/creeps/creepConstants"

describe("With available creep", () => {

    beforeEach(() => {
        mockGlobal<Game>("Game", {
            getObjectById(id: string): object | undefined {
                if (id === "aaa") {
                    return Game.creeps.aaa
                }
                return undefined
            },
            creeps: {
                aaa: mockInstanceOf<Creep>({
                    id: "aaa",
                    memory: {owner: null},
                    getActiveBodyparts(): number {
                        return 1
                    },
                    spawning: false
                })
            },
            spawns: {
                Spawn1: mockInstanceOf<StructureSpawn>({
                    // @ts-ignore
                    spawning: false,
                    room: {
                        energyAvailable: 300
                    }
                })
            }
        })
        CreepController.init()
    })

    describe("With non-returning task", () => {

        class TestCreepClass extends CreepTask {
            type = "TestCreepClass"
            hasBeenRun: boolean = false

            _runWithCreep(creep: Creep): boolean {
                this.hasBeenRun = true
                return false;
            }

            creepRequest(): CreepRequest | null {
                return createCreepRequest(CREEP_ROLE_PIONEER, 5)
            }
        }

        it("Should run with available creep", () => {
            const task = new TestCreepClass(
                "myid",
                null,
                1,
                {creepId: "aaa"},
                new Kernel(),
            )
            task.run()
            expect(task.hasBeenRun).toBeTruthy()
            expect(task.finished).not.toBeTruthy()
        })
    })


    describe("With returning task", () => {

        // tslint:disable-next-line:max-classes-per-file
        class TestCreepClass extends CreepTask {
            type = "TestCreepClass"
            hasBeenRun: boolean = false

            _runWithCreep(creep: Creep): boolean {
                this.hasBeenRun = true
                return true;
            }

            creepRequest(): CreepRequest | null {
                return createCreepRequest(CREEP_ROLE_PIONEER, 5)
            }
        }

        it("Should return the creep after the run", () => {
            const task = new TestCreepClass(
                "myid",
                null,
                1,
                {creepId: "aaa"},
                new Kernel(),
            )
            task.run()
            expect(task.hasBeenRun).toBeTruthy()
            expect(task.finished).toBeTruthy()
            expect(Game.creeps.aaa.memory.owner).toBe("CreepController")
        })

        it("Should return the creep onFinish", () => {
            const task = new TestCreepClass(
                "myid",
                null,
                1,
                {creepId: "aaa"},
                new Kernel(),
            )
            task.onFinish()
            expect(Game.creeps.aaa.memory.owner).toBe("CreepController")
        })
    })
})

describe("Without creeps ingame", () => {

    beforeEach(() => {
        mockGlobal<Game>("Game", {
            time: 100,
            getObjectById(): object | undefined {
                return undefined
            },
            creeps: {},
            spawns: {
                Spawn1: mockInstanceOf<StructureSpawn>({
                    // @ts-ignore
                    spawning: false,
                    room: {
                        energyAvailable: 300
                    },
                    spawnCreep: () => {return 0}
                })
            }
        })
        CreepController.init()
    })

    // tslint:disable-next-line:max-classes-per-file
    class TestCreepClass extends CreepTask {
        type = "TestCreepClass"
        hasBeenRun: boolean = false

        _runWithCreep(creep: Creep): boolean {
            this.hasBeenRun = true
            return false;
        }

        creepRequest(): CreepRequest | null {
            return null
        }
    }

    it("Should return if no creep is available", () => {
        const task = new TestCreepClass(
            "myid",
            null,
            1,
            {creepId: "aaa"},
            new Kernel(),
        )
        task.run()
        expect(task.hasBeenRun).not.toBeTruthy()
        expect(task.finished).toBeTruthy()
    })

})