/*
 * Server side by node.js
 */

var express = require('express')
  , Sequelize = require('sequelize')
  , redis = require('redis')
  , EC2Metadata = require('ec2metadata')
  , http = require('http')
  , fs = require('fs')
  , app = express()
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

var redisEndpoint = {
  host: // your redis endpoint,
  port: 6379
};
var rdsEndpoint = {
  host: // your RDS(RDB) endpoint,
  port: 3306
};

// Redis Pub/Sub
var publisher = redis.createClient(redisEndpoint.port, redisEndpoint.host);
var subscriber = redis.createClient(redisEndpoint.port, redisEndpoint.host);

// ORM for node.js
var sequelize = new Sequelize(//your database, //your user, //your password, {
  host: rdsEndpoint.host,
  port: rdsEndpoint.port,
  maxConcurrentQuries: 1024,
  logging: false
});

// Seat table definition
var Seat = sequelize.define('Seat', {
  seatId: { type: Sequelize.STRING, allowNull: false, unique: true },
  actionType: { type: Sequelize.STRING, allowNull: false },
  userId: Sequelize.STRING
});

// create table
sequelize.sync();

var ipAddress;

app.get(['/', '/index.html'], function (req, res) {
  fs.readFile('./index.html', function (err, data) {
    res.contentType('text/html');
    res.send(data);
  });
});

// send status data of all seats from RDS
app.get('/seats', function (req, res) {
  Seat.findAll({
    where: { actionType: { ne: 'cancel' } }
  }).success(function (seats) {
    var data = [];
    seats.map(function (seat) { return seat.values; }).forEach(function (e) {
      seat = e.seatId.split('-');
      data.push({
        row: seat[0],
        col: seat[1],
        actionType: e.actionType,
        userId: e.userId
      });
    });
    res.header('Cache-Control', 'max-age=0, s-maxage=0, public');
    res.send(data);
  });
});

// send ip address of EC2 instance
app.get('/ip', function (req, res) {
  res.header('Cache-Control', 'max-age=0, s-maxage=0, public');
  if (!ipAddress) {
    EC2Metadata.get(['public-ipv4'], function (err, data) {
      ipAddress = data.publicIpv4;
      res.send(ipAddress);
    });
  }
  else {
    res.send(ipAddress);
  }
});

// Reservation & Checkout
io.sockets.on('connection', function (socket) {
  // listen an 'action' socket message from client
  socket.on('action', function (data) {
    Seat.find({
      where: { seatId: data.row + '-' + data.col }
    }).success(function (seat) {
      if (seat == null ||
          seat.userId == data.userId ||
          seat.actionType == 'cancel') {

        if (seat == null)
          seat = Seat.build();

        seat.seatId = data.row + '-' + data.col;
        seat.userId = data.userId;
        seat.actionType = data.actionType;
        seat.save().success(function () {

          // publish a seat message (EC2 instance -> Redis)
          publisher.publish('seat', JSON.stringify(data));
        });
      }
    });
  });
});

// subscribe a seat message (Redis -> EC2 instances)
subscriber.subscribe('seat');
subscriber.on('message', function (channel, message) {
  // emit a 'result' socket message to client
  io.sockets.emit('result', JSON.parse(message));
});

server.listen(80);