import {Task} from "../../os/Task"

export abstract class RoomTask extends Task {

    room?: Room

    _run(): boolean {
        this.room = Game.rooms[this.data.roomName]
        if (!this.room) {
            console.log(`${this.getName()} finished (no room).`)
            return true
        }
        return this.runWithRoom(this.room)
    }

    abstract runWithRoom(room: Room): boolean


}