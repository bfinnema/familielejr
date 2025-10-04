function prepareList(numItems, subjectStructure) {
    console.log(`numItems: ${numItems}, subjectStructure: ${subjectStructure}, length: ${subjectStructure.length}`);
    var numItemsUsed = 0;
    var itemsL0 = [];
    var itemL0BtnShow = [];
    var itemL0Show = [];
    var subjects = []
    for (var j=0; j<subjectStructure.length; j++) {
        // console.log(`subject: ${subjectStructure[j]}`);
        var sl = [];
        for (var i=0; i<numItems[0]; i++) {
            sl.push(subjectStructure[j]);
        };
        subjects.push(sl);
        // console.log(`subjects in loop: ${subjects}`);
    };
    // console.log(`${subjects}`);
    for (var i=0; i<numItems[0]; i++) {
        itemsL0.push(i);
        if (i == 0) {
            itemL0BtnShow.push(false);
            itemL0Show.push(true);
        } else if (i == 1) {
            itemL0BtnShow.push(true);
            itemL0Show.push(false);
        } else {
            itemL0BtnShow.push(false);
            itemL0Show.push(false);
        };
    };
    // console.log(`itemsL0: ${itemsL0}`);
    // console.log(`itemL0BtnShow: ${itemL0BtnShow}`);
    // console.log(`itemL0Show: ${itemL0Show}`);
    console.log(`Subjects: ${subjects}`);
    return [itemsL0, itemL0BtnShow, itemL0Show, subjects, numItemsUsed];
};

partCatsStructure = prepareList([10,0], ["",0,0,0,0,false]);
console.log(`partCatStructure: ${partCatsStructure}`);
console.log(`**************************************`);
for (var h=0; h<partCatsStructure.length; h++) {
    console.log(`${h}: ${partCatsStructure[h]}`);
};
console.log(`**************************************`);
console.log(`**************************************`);
var participantCategories = [];
participantCategories.push({"name": "Formand", "minAge": 25, "maxAge": 72, "PriceFull": 0, "priceDay": 0, "active": true});
participantCategories.push({"name": "Bestyrelsesmedlem", "minAge": 18, "maxAge": 90, "PriceFull": 0, "priceDay": 0, "active": true});
participantCategories.push({"name": "Kasserer", "minAge": 18, "maxAge": 67, "PriceFull": 0, "priceDay": 0, "active": true});
console.log(`participant categories: ${JSON.stringify(participantCategories)}`);

for (var i=0; i<participantCategories.length; i++) {
    partCatsStructure[3][0][i] = participantCategories[i].name;
    partCatsStructure[3][1][i] = participantCategories[i].minAge;
    partCatsStructure[3][2][i] = participantCategories[i].maxAge;
    partCatsStructure[3][3][i] = participantCategories[i].PriceFull;
    partCatsStructure[3][4][i] = participantCategories[i].priceDay;
    partCatsStructure[3][5][i] = participantCategories[i].active;
};
console.log(`partCatStructure: ${partCatsStructure}`);
console.log(`**************************************`);
for (var h=0; h<partCatsStructure.length; h++) {
    console.log(`${h}: ${partCatsStructure[h]}`);
};
console.log(`**************************************`);


/* var myStructure1 = prepareList([5,0], ["a", "b", false, 0, 0]);
console.log(`myStructure: ${myStructure1}`);
console.log(`****`);
for (var h=0; h<myStructure1.length; h++) {
    console.log(`${h}: ${myStructure1[h]}`);
};
for (var k=0; k<myStructure1[3].length; k++) {
    console.log(`subjectStructure ${k}: ${myStructure1[3][k]}`);
    for (var g=0; g<myStructure1[3][k].length; g++) {
        console.log(`subject element ${g}: ${myStructure1[3][k][g]}`);
    };
};
console.log(`***************`);
var myStructure2 = prepareList([5,0], ["o"]);
console.log(`myStructure: ${myStructure2}`);
console.log(`****`);
for (var h=0; h<myStructure2.length; h++) {
    console.log(`${h}: ${myStructure2[h]}`);
};
for (var k=0; k<myStructure2[3].length; k++) {
    console.log(`subjectStructure ${k}: ${myStructure2[3][k]}`);
    for (var g=0; g<myStructure2[3][k].length; g++) {
        console.log(`subject element ${g}: ${myStructure2[3][k][g]}`);
    };
}; */

    /* $scope.partCats = [0,1,2,3,4,5,6,7,8,9];
    $scope.partCatName = ["","","","","","","","","",""];
    $scope.partCatMinAge = [0,0,0,0,0,0,0,0,0,0];
    $scope.partCatMaxAge = [0,0,0,0,0,0,0,0,0,0];
    $scope.partCatPriceFull = [0,0,0,0,0,0,0,0,0,0];
    $scope.partCatPriceDay = [0,0,0,0,0,0,0,0,0,0];
    $scope.partCatActive = [true,true,true,true,true,true,true,true,true,true,]
    $scope.partCatsBtnShow = [false,true,false,false,false,false,false,false,false,false];
    $scope.partCatShow = [true,false,false,false,false,false,false,false,false,false];
    $scope.numPartCats = 0;
    var numPartCats */
    /* $scope.eventtypeToEdit = {
        "eventtypeName": "Your New Category - change this!!",
        "description": "",
        "startYear": (new Date()).getFullYear(),
        "schedule": "Yearly",
        "charge": true
    };
    var participantCategories = [];
    for (i in $scope.partCats) {
        participantCategories.push({name: $scope.partCatName[i], minAge: $scope.partCatMinAge[i], maxAge: $scope.partCatMaxAge[i], priceFull: $scope.partCatPriceFull[i], priceDay: $scope.partCatPriceDay[i], active: $scope.partCatActive[i]});
    };
    $scope.eventtypeToEdit.participantCategories = participantCategories; */


    /* $scope.agendaItems = [0,1,2,3,4,5,6,7,8,9];
    $scope.agendaItemHeadline = ["","","","","","","","","",""];
    $scope.agendaItemDescription = ["","","","","","","","","",""];
    $scope.agendaItemsBtnShow = [false,false,false,false,false,false,false,false,false,false];
    $scope.agendaItemShow = [false,false,false,false,false,false,false,false,false,false];
    $scope.agendaItemsBtnShowSave = $scope.agendaItemsBtnShow;
    $scope.agendaItemShowSave = $scope.agendaItemShow;
    $scope.numAgendaItems = 0;
    var numAgendaItems */
    /* var agenda = [];
    for (i in $scope.agendaStructure[0]) {
        agenda.push({item: $scope.agendaStructure[3][0][i], description: $scope.agendaStructure[3][1][i]});
    };
    $scope.eventtypeToEdit.agenda = agenda; */



        // console.log(`-------------------------------------------------`);
        // console.log("Entering showPartCat. numPartCats: "+$scope.numPartCats);
        /* numPartCats = $scope.numPartCats;
        if ($scope.eventtypeToEdit.participantCategories[numPartCats].name) {
            // console.log("numPartCats: "+numPartCats+", Participant Category Name: "+$scope.eventtypeToEdit.participantCategories[numPartCats].name);
            numPartCats = numPartCats + 1;
            $scope.numPartCats = numPartCats;
            $scope.partCatShow[numPartCats] = true;
            $scope.partCatsBtnShow[numPartCats] = false;
            $scope.partCatsBtnShow[numPartCats+1] = true;
            $scope.eventtypeToEdit.participantCategories.push({name: "", minAge: 0, maxAge: 0, priceFull: 0, priceDay: 0, active: true});
        }
        else {
            $window.alert("Du skal udfylde det tomme kategori navn.");
        }; */



        // console.log(`-------------------------------------------------`);
        // console.log("Entering removePartCat. numPartCats: "+$scope.numPartCats);
        /* numPartCats = $scope.numPartCats;
        for (var i=partCatNum; i<numPartCats; i++) {
            console.log(`Before removeal: ${i}. Name: ${$scope.eventtypeToEdit.participantCategories[i].name}, minAge: ${$scope.eventtypeToEdit.participantCategories[i].minAge}, id: ${$scope.eventtypeToEdit._id}`);
            $scope.eventtypeToEdit.participantCategories[i].name = $scope.eventtypeToEdit.participantCategories[i+1].name;
            $scope.eventtypeToEdit.participantCategories[i].minAge = $scope.eventtypeToEdit.participantCategories[i+1].minAge;
            $scope.eventtypeToEdit.participantCategories[i].maxAge = $scope.eventtypeToEdit.participantCategories[i+1].maxAge;
            $scope.eventtypeToEdit.participantCategories[i].priceFull = $scope.eventtypeToEdit.participantCategories[i+1].priceFull;
            $scope.eventtypeToEdit.participantCategories[i].priceDay = $scope.eventtypeToEdit.participantCategories[i+1].priceDay;
            $scope.eventtypeToEdit.participantCategories[i].active = $scope.eventtypeToEdit.participantCategories[i+1].active;
            console.log(`AFTER removeal: ${i}. Name: ${$scope.eventtypeToEdit.participantCategories[i].name}, minAge: ${$scope.eventtypeToEdit.participantCategories[i].minAge}, id: ${$scope.eventtypeToEdit._id}`);
        };
        $scope.eventtypeToEdit.participantCategories[numPartCats].name = "";
        $scope.eventtypeToEdit.participantCategories[numPartCats].minAge = 0;
        $scope.eventtypeToEdit.participantCategories[numPartCats].maxAge = 0;
        $scope.eventtypeToEdit.participantCategories[numPartCats].priceFull = 0;
        $scope.eventtypeToEdit.participantCategories[numPartCats].priceDay = 0;
        $scope.eventtypeToEdit.participantCategories[numPartCats].active = true;
        $scope.partCatShow[numPartCats] = false;
        $scope.partCatsBtnShow[numPartCats] = true;
        $scope.partCatsBtnShow[numPartCats+1] = false;
        numPartCats -= 1;
        $scope.numPartCats = numPartCats;
        // console.log("numPartCats: "+numPartCats);
        $scope.eventtypeToEdit.participantCategories.pop(); */



            /* $scope.partCatsBtnShow = [false,false,false,false,false,false,false,false,false,false];
            $scope.partCatShow = [true,false,false,false,false,false,false,false,false,false];
            var numPartCats = eventtypeToEdit.participantCategories.length;
            $scope.partCatsBtnShow[numPartCats] = true;
            $scope.numPartCats = numPartCats;
            for (x=0; x<numPartCats; x++) {
                $scope.partCatShow[x] = true;
                console.log(`numPartCats: ${numPartCats}`);
                console.log(`${x}. partCatsBtnShow: ${$scope.partCatsBtnShow[x]}, partCatShow: ${$scope.partCatShow[x]}`);
                console.log(`${x}. Name: ${eventtypeToEdit.participantCategories[x].name}, minAge: ${eventtypeToEdit.participantCategories[x].minAge}`);
            };
            $scope.numPartCats = numPartCats-1; */




            /* var items = [];
            var descriptions = [];
            var texts = [];
            for (var i=0; i<$scope.agendaStructure[3][0].length; i++) {
                if (i<$scope.eventtypeToEdit.agenda.length) {
                    items.push($scope.eventtypeToEdit.agenda[i].item);
                    descriptions.push($scope.eventtypeToEdit.agenda[i].description);
                } else {
                    items.push("");
                    descriptions.push("");
                };
                // console.log(`i: ${i}, items: ${items}, descriptions: ${descriptions}`);
            };
            texts.push(items);
            texts.push(descriptions);
            $scope.agendaStructure[3] = texts;
            $scope.agendaStructure = listOfItemsSL.prepareEdit($scope.eventtypeToEdit.agenda.length-1, $scope.agendaStructure); */
            // console.log(`prepareAgendaForEdit done. numAgendaItems: "${$scope.agendaStructure[4]}, ... ${$scope.eventtypeToEdit.agenda.length}`);
            // console.log(`agenda in agendaStructure: ${$scope.agendaStructure[3]}`);

            /* $scope.agendaBtnShow = $scope.agendaStructure[1];
            $scope.agendaItemShow = $scope.agendaStructure[2]; */
