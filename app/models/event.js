var uuid = require('node-uuid');

module.exports = Event;

function Event (body) {
    this.Id = uuid.v1();
    this.Name = body.Name;
    this.Title = body.Title;
    this.StartDate = body.StartDate;
    this.EndDate = body.EndDate;
    this.LocalDescription = body.LocalDescription;
}