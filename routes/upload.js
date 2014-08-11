var formidable = require('formidable');
var util = require('util');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('upload_select');
});

router.post('/', function(req, res) {
    // parse a file upload
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
      res.send( 'received upload:' + util.inspect({fields: fields, files: files}));
    });
});

module.exports = router;
