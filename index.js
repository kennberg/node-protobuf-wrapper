/**
 * Protobuf Wrapper for Node.js
 *
 * Copyright 2012 Alex Kennberg (https://github.com/kennberg/node-protobuf-wrapper)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var fs = require('fs');
var path = require('path');
var util = require('util');


/**
 * path is the root path and descriptor file is located in {$path}/backend/{$name}.desc
 * Package name should be defined as "package {$name}.proto;"
 */
module.exports = function(rootPath, name, enums) {
  var descPath = path.join(rootPath, '/backend/', name + '.desc');
  util.log('Loading proto schema from ' + descPath);

  var content = fs.readFileSync(descPath);
  if (!content) {
    util.error('Failed to find content of ' + descPath);
    return null;
  }

  var Schema = require('protobuf').Schema;
  var schema = new Schema(content);
  if (!schema) {
    util.error('Failed to load schema from ' + descPath);
    return null;
  }

  return new ProtoCompiler(name, schema, enums);
};


ProtoCompiler = function(name, schema, enums) {
  this.name = name;
  this.schema = schema;
  this.enumMap = {};

  if (enums && enums.length)
    this.initEnums_(enums);
};


// Absolute largest enum to try.
ProtoCompiler.MAX_ENUM = 1000;


// Serializes a JS object to a protocol message in a node buffer
// according to the protocol message schema.
// var Feed = pb.getMessage('Feed');
// var serialized = Feed.serialize({ title: 'Title', ignored: 42 });
//
// Parses a protocol message in a node buffer into a JS object
// according to the protocol message schema.
// var aFeed = Feed.parse(serialized);  
ProtoCompiler.prototype.getMessage = function(messageName) {
  return this.schema[this.name + '.proto.' + messageName];
};


ProtoCompiler.prototype.getEnum = function(messageName, enumName) {
  return this.enumMap[messageName][enumName];
};


ProtoCompiler.prototype.initEnums_ = function(enums) {
  var enumCount = 0;
  for (var e = 0; e < enums.length; e++) {
    var message = this.getMessage(enums[e].message);
    var field = enums[e].field;
    var map = this.enumMap[enums[e].message] || {};
    for (var i = 0; i < ProtoCompiler.MAX_ENUM; i++) {
      try {
        var obj = {};
        obj[field] = i;
        obj = message.parse(message.serialize(obj));

        map[obj[field]] = i;
        enumCount++;
      } catch (e) {
        break;
      }
    }
    this.enumMap[enums[e].message] = map;
  }
  util.log('Found ' + enumCount + ' enums in the proto.');
};

