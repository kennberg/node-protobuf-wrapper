protobuf-wrapper
======================

This is a convenience wrapper for the protobuf module.
https://github.com/chrisdew/protobuf

How to use
======================

Installation inside your server directory:

    git clone https://github.com/kennberg/node-protobuf-wrapper
    cd node-protobuf-wrapper
    npm install

In your JavaScript you can do something like this:

    var enums = [ 
      { message: 'Impression', field: 'type' },
      { message: 'Setting', field: 'type' }
    ];  
    var proto = require('node-protobuf-wrapper')(process.cwd(), 'protopackage', enums);

    // User the standard serialize and parse functions:
    var Setting = proto.getMessage('Setting');
    var output = Setting.serialize(data);
    var object = Setting.parse(data);

    // To convert string enums to ids:
    var enumId = proto.getEnum('Setting', 'SAMPLE_SETTING');


License
======================
Apache v2. See the LICENSE file.
