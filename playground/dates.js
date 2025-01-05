var currentyear = new Date().getFullYear();
console.log(currentyear);
// var demarc = new Date(currentyear,8,1).toLocaleString({ timeZone: 'Europe/Copenhagen' });

let today = new Date();
console.log("Today's date = " + today);

Date.prototype.subtractDays = function (d) {
	this.setDate(this.getDate() - d);
	return this;
}

let a = new Date();
a.subtractDays(60);

console.log(a);

var theTime = new Date();
console.log(`theTime: ${theTime}`);
var theNewTime = theTime.setMonth(2);
console.log(`theNewTime: ${theNewTime}`);

/* var starttime = new Date(2025, 7, 28, 15, 45);
var endtime = new Date(2025, 7, 30, 11, 5)

function getArrivalOptions(starttime, endtime) {
    var startYear = starttime.getFullYear();
    var startMonth = starttime.getMonth();
    var startDate = starttime.getDate();
    console.log(`Startdate: ${starttime.toLocaleString('da-DK', {timeZone: 'Europe/Copenhagen'})}`);
    console.log(`Enddate: ${endtime.toLocaleString('da-DK', {timeZone: 'Europe/Copenhagen'})}`);
    var diffInDays = Math.round((endtime.getTime() - starttime.getTime())/(1000*3600*24));
    console.log(`Diff in days: ${diffInDays}`);
    var days = ["mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag", "søndag"];
    console.log(`Startday of the week ${starttime.getDay()}: ${days[starttime.getDay()]}`);
    console.log(`Endday of the week ${endtime.getDay()}: ${days[endtime.getDay()]}`);

    var arrivalOptions = [];

    if (starttime.getDate() != endtime.getDate()) {
        if (starttime.getHours() < 12) {
            arrivalOptions.push({"arrivalOption": days[starttime.getDay()] + " formiddag"});
        };
        if (starttime.getHours() < 20) {
            arrivalOptions.push({"arrivalOption": days[starttime.getDay()] + " eftermiddag"});
        };
        if (starttime.getHours() < 24) {
            arrivalOptions.push({"arrivalOption": days[starttime.getDay()] + " efter aftensmad"});
        };
        var i=0;
        while (i<diffInDays) {
            theDate = new Date(startYear, startMonth, startDate + 1 + i);
            if (endtime.getDate() == theDate.getDate()) {
                if (endtime.getHours > 12) {
                    arrivalOptions.push({"arrivalOption": days[theDate.getDay()] + " formiddag"});
                };
            } else {
                arrivalOptions.push({"arrivalOption": days[theDate.getDay()] + " formiddag"});
                arrivalOptions.push({"arrivalOption": days[theDate.getDay()] + " eftermiddag"});
                arrivalOptions.push({"arrivalOption": days[theDate.getDay()] + " efter aftensmad"});
            };
            i++;
        };
    };

    return arrivalOptions;
};

function getDepartureOptions(starttime, endtime) {
    var startYear = starttime.getFullYear();
    var startMonth = starttime.getMonth();
    var startDate = starttime.getDate();
    console.log(`Startdate: ${starttime.toLocaleString('da-DK', {timeZone: 'Europe/Copenhagen'})}`);
    console.log(`Enddate: ${endtime.toLocaleString('da-DK', {timeZone: 'Europe/Copenhagen'})}`);
    var diffInDays = Math.round((endtime.getTime() - starttime.getTime())/(1000*3600*24));
    console.log(`Diff: ${endtime.getTime() - starttime.getTime()}. Diff in days: ${diffInDays}`);
    var days = ["mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag", "søndag"];

    var departureOptions = [];

    if (starttime.getDate() != endtime.getDate()) {
        var i=0;
        while (i<diffInDays) {
            theDate = new Date(startYear, startMonth, startDate + 1 + i);
            if (endtime.getDate() == theDate.getDate()) {
                if (endtime.getHours > 12) {
                    departureOptions.push({"departureOption": days[theDate.getDay()] + " formiddag"});
                    departureOptions.push({"departureOption": days[theDate.getDay()] + " eftermiddag"});
                } else {
                    departureOptions.push({"departureOption": days[theDate.getDay()]});
                }
                if (endtime.getHours > 18) {
                    departureOptions.push({"departureOption": days[theDate.getDay()] + " efter aftensmad"});
                };
            } else {
                departureOptions.push({"departureOption": days[theDate.getDay()] + " formiddag"});
                departureOptions.push({"departureOption": days[theDate.getDay()] + " eftermiddag"});
                departureOptions.push({"departureOption": days[theDate.getDay()] + " efter aftensmad"});
            };
            i++;
        };
    };

    return departureOptions;
};

var arrivalOptions = getArrivalOptions(starttime, endtime);
var departureOptions = getDepartureOptions(starttime, endtime);

for (arrOpt in arrivalOptions) {
    console.log(`Arrival option: ${arrivalOptions[arrOpt].arrivalOption}`);
};
for (depOpt in departureOptions) {
    console.log(`Departure option: ${departureOptions[depOpt].departureOption}`);
}; */

/* var offset = new Date(2*3600*1000);
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
var days = ["mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag", "søndag"]; */
/*
var startdate = new Date($scope.startdate);
console.log(startdate);
var startday = startdate.getDay();
var startmonth = startdate.getMonth();
console.log(`Startdate: ${startdate}, Month: ${startmonth}, Day: ${startday}`);
console.log(`Startmåned: ${months[startdate.getMonth()]}, Startdag: ${days[startdate.getDay()]}`);
*/