var str = "apicture.something.JPG";
var res = str.split(".");
// var t = res.pop().toLowerCase();
console.log(res);
var filename = '';
for (var i=0; i<res.length; i++) {
    if (i == res.length-1) {
        filename += res[i].toLowerCase();
    } else {
        filename += res[i] + '.';
    };
};
console.log(str+" "+filename);