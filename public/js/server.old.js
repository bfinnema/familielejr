
app.post('/photos/uploadx', authenticate, multipartyMiddleware, (req, res) => {
    // console.log(req.body.text);
    var file = req.files.file;
    // get the temporary location of the file
    var tmp_path = req.files.file.path;
    // console.log(tmp_path);
    var fn = req.files.file.name;
    var splitfn = fn.split(".");
    var resfilename = '';
    for (var i=0; i<splitfn.length; i++) {
        if (i == splitfn.length-1) {
            resfilename += splitfn[i].toLowerCase();
        } else {
            resfilename += splitfn[i] + '.';
        };
    };
    // console.log(fn+" "+resfilename);
    // set where the file should actually exists - in this case it is in the "images" directory
    // var target_path = __dirname + '/../public/images/' + req.body.year + '/' + req.files.file.name;
    var target_path = __dirname + '/../public/images/' + req.body.year + '/' + resfilename;
    var path = __dirname + '/../public/images/' + req.body.year;
    // console.log(target_path);
    // console.log(path);
    // move the file from the temporary location to the intended location
    if (fs.existsSync(path)) {
  
      Photo.findOne({
        filename: resfilename
      }).then((photo) => {
        if (!photo) {
          var uploader = req.user.name.firstname;
          if (req.user.name.middlename) {uploader = uploader + ' ' + req.user.name.middlename};
          uploader = uploader + ' ' + req.user.name.surname;
          var photo = new Photo({
            _creator: req.body.user,
            year: req.body.year,
            filename: resfilename,
            path: 'images/' + req.body.year + '/',
            uploader: uploader,
            imagetext: [
              {
                textobj: {
                  date: new Date(),
                  contributor: uploader,
                  text: req.body.text
                }
              }
            ]
          });
  
          photo.save().then((doc) => {
            res.send(doc);
          }, (e) => {
            res.status(400).send(e);
          });
  
          // Read the file
          fs.readFile(tmp_path, function (err, data) {
            if (err) throw err;
            // console.log('File read!');
  
            // Write the file
            fs.writeFile(target_path, data, function (err) {
              if (err) throw err;
              // res.write('File uploaded and moved!');
              // res.end();
              // console.log('File written!');
            });
  
            // Delete the file
            fs.unlink(tmp_path, function (err) {
              if (err) throw err;
              // console.log('File deleted!');
            });
          });
  /*
          fs.rename(tmp_path, target_path, function(err) {
            if (err) throw err;
          }, () => {
            res.status(400).send();
          });
  */        
        } else {
          // console.log('Photo already in db');
          res.status(409).send({photo});
          fs.unlink(tmp_path, function(err) {
            if (err) throw err;
          });
        };
      }).catch((e) => {
        res.status(400).send();
      });
      
      // res.send('File uploaded to: ' + target_path + ' - ' + req.files.file.size + ' bytes');
    } else {
      res.status(400).send();
    };
  });
  
  