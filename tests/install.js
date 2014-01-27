var should = require('should');
var install = require('../lib/install');
var http = require('http');
var fs = require('fs');
var file = require('../lib/sdk/file');
var log = require('../lib/utils/log');
var server;
var port = 17175;
var dest = 'tests/sea-modules';
var cache = 'tests/cache';


describe('spm install', function() {

  beforeEach(function() {
    server && server.close();
    server = null;
  });

  it('config', function() {
    install.config.dest.should.eql('sea-modules');
    install.config.cache.should.containEql('.spm/cache');
    install.config.parallel.should.eql(1);
  });

  it('from cache', function(done) {
    file.rmdir(dest);
    server = http.createServer(function(req, res) {
      req.url.should.be.eql('/repository/example/1.0.0/');
      req.method.should.be.eql('GET');
      res.writeHead(200);
      var data = {
        name: "example",
        version: "1.0.0",
        filename: "example-1.0.0.tar.gz",
        md5: "999193906e30e8d85208b4eff843570a"
      };
      res.end(JSON.stringify(data));
    }).listen(port, function() {
      var dest = 'tests/sea-modules';
      install({
        destination: dest,
        cache: cache,
        query: ['example@1.0.0'],
        server: 'http://127.0.0.1:' + port
      }, function() {
        file.exists(dest + '/example/1.0.0').should.eql(true);
        done();
      });
    });
  });

  it('found', function(done) {
    var log_info = log.info;
    log.info = function(type) {
      log.info = log_info;
      type.should.eql('found');
    };
    server = http.createServer(function(req, res) {
      req.url.should.be.eql('/repository/example/1.0.0/');
      req.method.should.be.eql('GET');
      res.writeHead(200);
      var data = {
        name: "example",
        version: "1.0.0",
        filename: "example-1.0.0.tar.gz",
        md5: "999193906e30e8d85208b4eff843570a"
      };
      res.end(JSON.stringify(data));
    }).listen(port, function() {
      var dest = 'tests/sea-modules';
      install({
        destination: dest,
        cache: cache,
        query: ['example@1.0.0'],
        server: 'http://127.0.0.1:' + port
      }, function() {
        done();
      });
    });
  });

  it('force', function(done) {
    var log_info = log.info;
    log.info = function(type) {
      log.info = log_info;
      type.should.eql('install');
    };
    server = http.createServer(function(req, res) {
      req.url.should.be.eql('/repository/example/1.0.0/');
      req.method.should.be.eql('GET');
      res.writeHead(200);
      var data = {
        name: "example",
        version: "1.0.0",
        filename: "example-1.0.0.tar.gz",
        md5: "999193906e30e8d85208b4eff843570a"
      };
      res.end(JSON.stringify(data));
    }).listen(port, function() {
      var dest = 'tests/sea-modules';
      install({
        destination: dest,
        cache: cache,
        query: ['example@1.0.0'],
        force: true,
        server: 'http://127.0.0.1:' + port
      }, function() {
        file.rmdir(dest);
        done();
      });
    });
  });

  it('from server', function(done) {
    server = http.createServer(function(req, res) {
      req.method.should.be.eql('GET');
      if (req.url.indexOf('tar.gz') < 0) {
        req.url.should.be.eql('/repository/example-no-cache/1.0.0/');
        res.writeHead(200);
        var data = {
          name: "example-no-cache",
          version: "1.0.0",
          filename: "example-no-cache-1.0.0.tar.gz",
          md5: "999193906e30e8d85208b4eff843570a"
        };
        res.end(JSON.stringify(data));
      } else {
        req.url.should.be.eql('/repository/example-no-cache/1.0.0/example-no-cache-1.0.0.tar.gz');
        fs.readFile('tests/repos/example-no-cache-1.0.0.tar.gz', function(err, data) {
          res.writeHead(200);
          res.end(data);
        });
      }
    }).listen(port, function() {
      install({
        destination: dest,
        cache: cache,
        query: ['example-no-cache@1.0.0'],
        server: 'http://127.0.0.1:' + port
      }, function() {
        file.exists(dest + '/example-no-cache/1.0.0').should.eql(true);
        file.exists(cache + '/example-no-cache-1.0.0.tar.gz').should.eql(true);
        file.rmdir(dest);
        file.rmdir(cache + '/example-no-cache-1.0.0.tar.gz');
        done();
      });
    });
  });

  it('dependencies', function() {
  });

  it('--save', function() {});

});