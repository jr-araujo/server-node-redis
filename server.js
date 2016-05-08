var restify = require('restify')
            , fs = require('fs')

var controllers = {}
    , controllers_path = process.cwd() + '/app/controllers';
    
fs.readdirSync(controllers_path).forEach(function (file) {
    if (file.indexOf('.js') != -1) {
        controllers[file.split('.')[0]] = require(controllers_path + '/' + file)
    }
});

var server = restify.createServer();

server
    .use(restify.fullResponse())
    .use(restify.bodyParser());

server.get("/", function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<html><head><title> GAB - 2016</title></head><body><h1>Hello Global Azure Brasilia - 2016...</h1></body></html>');
})

// Event Start Route Configuration
server.post("/event", controllers.eventCtrl.createEvent)
server.get("/event", controllers.eventCtrl.listAllEvents)
server.get("/list-events", controllers.eventCtrl.listAllEvents)
// Event Start Route Configuration

// Event Start Route Configuration
server.post("/presentation", controllers.presentationCtrl.createPresentation)
server.get({path: "/presentation/:eventName"}, controllers.presentationCtrl.listAllPresentations)
// Event Start Route Configuration

var port = process.env.PORT || 8080;
server.listen(port, function (err) {
    if (err){        
        console.error(err)
    }
        
    else {
        console.log('App is ready at : ' + port)
    }
})
 
if (process.env.environment == 'production')
    process.on('uncaughtException', function (err) {
        console.error(JSON.parse(JSON.stringify(err, ['stack', 'message', 'inner'], 2)))
    })
