/// <reference path="../models/presentation.js"/>

var redis = require("redis"),
    // clientRedis = redis.createClient();
    clientRedis = redis.createClient(6379,'myredislabs.redis.cache.windows.net', {auth_pass: 'w+qK/z8l7HjgPsKziC1KLYHzoo8kMUWNjHdo9x45vNU='});
    
var Q = require('q');
require('q-foreach')(Q);
    
var Presentation = require('../models/presentation');

exports.createPresentation = function (req, res, next) {
    var presentationModel = new Presentation(req.body);
    
    clientRedis.hexists("events:" + presentationModel.Eventname +"presentation", presentationModel.Id, function (err, reply) {
        if(err){
            res.status(500);
            res.json({
               status: 500,
               data: "Error occured: " + err 
            });
        } else {
            if(reply === 1){
                res.status(409);                
                res.json({
                    status: 409,
                    data: "This presentation already exists."
                });
            } else {
                clientRedis.hmset("events:" + presentationModel.EventName +":presentation", presentationModel.Id, JSON.stringify(presentationModel), function (err, reply) {
                    if(err){
                        res.status(500);
                        res.json({
                            status: 500,
                            data: "Error occred: " + err 
                        });
                    } else {
                        res.status(201);
                        res.json({
                            status: 201,
                            data: presentationModel 
                        });
                    }
                });
            }
        }
    });
}

function listPresentations(eventKey, keys, callback){
    if(keys.length > 0){
        Q.forEach(keys, function (value) {
            var defer = Q.defer();
            
            clientRedis.hget("events:" + eventKey + ":presentation", value, function (err, reply) {
                defer.resolve(JSON.parse(reply));
            });
            
            return defer.promise;
        }).then(function (resolutions) {
            console.log(resolutions);
            callback(resolutions);
        });
    }
    else {
        callback([]);
    }
}

function getPresentationKeys(eventKey, callback) {
    var eventKeys = [];
    
    clientRedis.hkeys("events:" + eventKey + ":presentation", function (err, keys) {        
            keys.forEach(function (key, i) {
                eventKeys.push(key);
                console.log(key);
            });
            
            callback(eventKeys);            
    });
}

exports.listAllPresentations = function (req, res, next) {
    getPresentationKeys(req.params.eventName, function(keys) {
        listPresentations(req.params.eventName, keys, function(presentations) {
            res.json(presentations);
        });
    });
}