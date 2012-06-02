#!/usr/bin/env node

var _ = require('underscore'),
    http = require('http'),
    static = require('node-static'),
    fileServer = new static.Server(__dirname),
    port = 8080,
    ip = '127.0.0.1',
    db = [];

var storePerson = function (person) {
  var found = person.id && _.find(db, function (p, i) {
    if (p.id === person.id) {
      db[i] = person;
      return true;
    }
  });

  if (!found) {
    person.id = _.uniqueId('p');
    db.push(person);
  }
};

var sendResponse = function (response, data) {
  response.writeHead(200, {'Content-Type': 'application/json'});
  response.end(JSON.stringify(data));
};

http.createServer(function (request, response) {
  var match, data;

  if ((match = request.url.match(/^\/person(?:\/(p\d+))?$/))) {
    console.log(request.method + ': ' + request.url);

    if (request.method === 'POST' || request.method === 'PUT') {
      data = '';
      request.on('data', function (chunk) { data += chunk; });
      request.on('end', function () {
        var person = JSON.parse(data);
        storePerson(person);
        sendResponse(response, person);
      });
    } else if (request.method === 'DELETE' && match[1]) {
      db = _.reject(db, function (p) { return p.id === match[1]; });
      sendResponse(response);
    } else if (request.method === 'GET') {
      sendResponse(response, db);
    }
  } else {
    request.on('end', function () {
      fileServer.serve(request, response);
    });
  }
}).listen(port, ip);

console.log('Server running at http://' + ip + ':' + port);
