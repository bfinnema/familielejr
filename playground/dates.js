var currentyear = new Date().getFullYear();
console.log(currentyear);
// var demarc = new Date(currentyear,8,1).toLocaleString({ timeZone: 'Europe/Copenhagen' });

var offset = new Date(2*3600*1000);
console.log(offset);
var demarc = new Date(currentyear,8,1)
console.log('demarc: '+demarc);
var demarcms = new Date(demarc.getTime()+offset.getTime);
console.log('Demarc getTime + offset: '+demarcms);
var year3 = demarcms.getFullYear();
var month3 = demarcms.getMonth();
var day3 = demarcms.getDay();
console.log('Year: '+year3+', Month: '+month3+', Day: '+day3);

console.log('-------');
console.log('-------');
var now = new Date();
console.log(now);

var nextyear = currentyear + 1;
console.log(nextyear);

var invyear = currentyear;
if (now > demarc) {
    invyear += 1
};
console.log(invyear);
console.log('-------');

var future = new Date(2017, 10, 13);
invyear = currentyear;
if (future > demarc) {
    invyear += 1
};
console.log(invyear);

var months = ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"];
var days = ["mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag", "søndag"];
/*
var startdate = new Date($scope.startdate);
console.log(startdate);
var startday = startdate.getDay();
var startmonth = startdate.getMonth();
console.log(`Startdate: ${startdate}, Month: ${startmonth}, Day: ${startday}`);
console.log(`Startmåned: ${months[startdate.getMonth()]}, Startdag: ${days[startdate.getDay()]}`);
*/