var uuid = require('node-uuid');

module.exports = Presentation;

function Presentation (body) {
    this.Id = uuid.v1();
    this.Title = body.Title;
    this.Description = body.Description;
    this.SpeakerName = body.SpeakerName;
    this.Room = body.Room;
    
    this.EventName = body.Event.Name;
}