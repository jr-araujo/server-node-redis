/// <reference path="../models/event.js"/>

var redis = require("redis"),
    // clientRedis = redis.createClient();
    clientRedis = redis.createClient(6379,'[HOST DO REDIS NO AZURE]]', {auth_pass: '[SENHA DE ACESSO, CASO NECESSÁRIO]'});

var Q = require('q');
require('q-foreach')(Q);

var Event = require('../models/event');

exports.createEvent = function (req, res, next) {
    var eventModel = new Event(req.body);
    
    clientRedis.hexists("events", eventModel.Name, function (err, reply) {
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
                    data: "This event already exists. Please choose a different name for this Event"
                });
            } else {
                clientRedis.hmset("events", eventModel.Name, JSON.stringify(eventModel), function (err, reply) {
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
                            data: eventModel 
                        });
                    }
                });
            }
        }
    });
}

function listEvents(keys, callback){
    if(keys.length > 0){
        Q.forEach(keys, function (value) {
            var defer = Q.defer();
            
            clientRedis.hget("events", value, function (err, reply) {
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

function getEventKeys(callback) {
    var eventKeys = [];
    
    clientRedis.hkeys("events", function (err, keys) {        
            keys.forEach(function (key, i) {
                eventKeys.push(key);
                console.log(key);
            });
            
            callback(eventKeys);            
    });
}

exports.listAllEvents = function (req, res, next) {
    getEventKeys(function(keys) {
        listEvents(keys, function(events) {
            res.json(events);
        });
    });
}
