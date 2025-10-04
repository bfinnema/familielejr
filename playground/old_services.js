angular.module('crap')

.factory('EventPriceService',[function() {
    return({
        numDays: numDays,
        // eventFee: eventFee,
        // eventFeeOld: eventFeeOld,
        // eventPriceDefault: eventPriceDefault
    });

    function numDays(arrival, departure) {
        numDays = 1;
        if (departure == "Søndag" || departure == "Søndag efter frokost" || departure == "Jeg tager aldrig hjem!!" || departure == "Lørdag efter aftensmad") {
            // "Søndag efter frokost" is the for historic reasons
            if (arrival == "Fredag" || arrival == "Fredag eftermiddag") {
                numDays = 2;
            };
            /* if (arrival == "Lørdag formiddag" && priceModelType == "old") {
                numDays = 2;
            }; */
        } /* else if (departure == "Søndag efter morgenmad" || departure == "Lørdag efter aftensmad") {
            // "Søndag efter morgenmad" is the for historic reasons
            if (arrival == "Fredag") {
                numDays = 2;
            };
        } */;
        return numDays;
    };

    /* function eventFeeOld(numDays, agegroup, priceModel) {
        if (agegroup == "Voksen") {
            eventFee = priceModel.adult[numDays-1].price;
        } else if (agegroup == "Barn under 12") {
            eventFee = priceModel.child[numDays-1].price;
        } else {
            eventFee = priceModel.smallchild[numDays-1].price;
        };
        return eventFeeOld;
    }; */

    function eventFee(arrival, departure, agegroup, payment) {
        // console.log(`SERVICES eventFee. agegroup ${agegroup}, adultFee: ${payment.adult}, childFee: ${payment.child}`);
        var newPriceModel = eventPriceDefault();
        var priceModelType = "old";
        var adultFee = 180;
        var childFee = 100;
        var smallChildFee = 0;
        if (payment.priceModel) {
            priceModelType = payment.priceModel;
        };
        // console.log(`SERVICES. Pricemodel type: ${priceModelType}`);
        // numDays = numDays(arrival, departure, priceModelType);

        var numDays = 1;
        if (departure == "Søndag" || departure == "Søndag efter frokost" || departure == "Jeg tager aldrig hjem!!") {
            // "Søndag efter frokost" is the for historic reasons
            if (arrival == "Fredag") {
                numDays = 2;
            };
            if (arrival == "Lørdag formiddag" && priceModelType == "old") {
                numDays = 2;
            }
        } else if (departure == "Søndag efter morgenmad" || departure == "Lørdag efter aftensmad") {
            // "Søndag efter morgenmad" is the for historic reasons
            if (arrival == "Fredag") {
                numDays = 2;
            };
        };
        // console.log(`SERVICES. NumDays: ${numDays}`);

        if (priceModelType == "new") {
            if (payment.newpricemodel) {
                newPriceModel = payment.newpricemodel;
            };
            if (agegroup == "Voksen") {
                eventFee = payment.newpricemodel.adult[numDays-1].price;
            } else if (agegroup == "Barn under 12") {
                eventFee = payment.newpricemodel.child[numDays-1].price;
            } else {
                eventFee = payment.newpricemodel.smallchild[numDays-1].price;
            };
            // console.log(`SERVICES. New pricemodel. eventFee: ${eventFee}`);
        } else {
            if (payment.adult) {adultFee = payment.adult};
            if (payment.child) {childFee = payment.child};
            // console.log(`SERVICES. Old pricemodel. agegroup ${agegroup}, adultFee: ${adultFee}, childFee: ${childFee}`);
            if (agegroup == "Voksen") {
                eventFee = adultFee * numDays;
            } else if (agegroup == "Barn under 12") {
                eventFee = childFee * numDays;
            } else {
                eventFee = smallChildFee * numDays;
            };
            // console.log(`SERVICES. Old pricemodel. eventFee: ${eventFee}`);
        };
        
        return eventFee;
    };

    function eventPriceDefault() {
        var eventPriceDefault = {adult:[], child:[], smallchild:[]};
        eventPriceDefault.adult.push({"price": 270});
        eventPriceDefault.adult.push({"price": 440});
        eventPriceDefault.child.push({"price": 140});
        eventPriceDefault.child.push({"price": 250});
        eventPriceDefault.smallchild.push({"price": 0});
        eventPriceDefault.smallchild.push({"price": 0});
        // console.log(`In Services. Adult, one day: ${eventPriceDefault.adult[0].price}`);
        return eventPriceDefault;
    };
}])

