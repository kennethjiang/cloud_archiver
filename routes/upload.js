var formidable = require('formidable');
var util = require('util');
var express = require('express');
var router = express.Router();

var crypto = require('crypto');
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
        if (err) next(err);

        var md5sum = crypto.createHash('md5');

        fs.readFile(files.filedata.path, function (err, data) {
	    if (err) next(err);
	    
            var s3FileKey = md5sum.update(data).digest('hex');
	    saveToS3(s3FileKey, data, function(err, eTag) {
	        if (err) next(err);

		console.log("Saved as: " + s3FileKey);

		fields.eTag = eTag;
		recordToMongo(req.db, fields, function(err, doc) {
		    if (err) {
		        next(err);
	            }
		    else {
		        console.log("saved to Mongo: " + doc);
                        res.send( 'received upload:' + util.inspect({fields: fields, files: files}));
		    }
		});

	    });
	});
    });
});

var recordToMongo = function (db, fields, callback) {
    var filesColl = db.get('files');
    filesColl.insert(fields, callback);
};

var saveToS3 = function (s3FileKey, data, callback) {
    var s3 = new AWS.S3({params: {Bucket: 'cloud-archiver/1', Key: s3FileKey}});
    s3.putObject({Body: data}, function(err, data) {
        if (err) {
	    callback(err);
	    return;
	}

	eTag = data.ETag;
	callback(err, eTag);
    });
};

module.exports = router;
