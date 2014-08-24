var formidable = require('formidable');
var util = require('util');
var express = require('express');
var router = express.Router();

var fs = require('fs');
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config/aws.json');

router.get('/', function(req, res) {
    res.render('upload_select');
});

router.post('/', function(req, res) {
    // parse a file upload
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
        if (err) throw err;

        fs.readFile(files.filedata.path, function (err, data) {
	    if (err) throw err;
        
            var s3 = new AWS.S3({params: {Bucket: 'cloud-archiver/1', Key: files.filedata.name}});
	    s3.putObject({Body: data}, function(err, data) {
	        if (err) throw err;
                res.send( 'received upload:' + util.inspect({fields: fields, files: files}));
	    });
	});
    });
});

module.exports = router;
