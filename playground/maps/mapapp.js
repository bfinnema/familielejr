const { Map } = await google.maps.importLibrary("maps");
const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
const dkfl = { lat: 55.725970, lng: 10.534767 }; // DK
const map = new Map(document.getElementById("map"), {
    center: dkfl,
    zoom: 8,
    mapId: "Familielejr"
});

console.log(`In mapapp`);
var places = [
    {
        "id": 0,
        "coords": {
            "latitude": 55.4051511,
            "longitude": 9.6015006
        },
        "name": "Hejls Lejrskole",
        "address": "Overbyvej 102, 6094 Hejls",
        "years": "1993, 1994, 1995",
        "website": "Er ikke lejrskole mere",
    },
    {
        "id": 1,
        "coords": {
            "latitude": 55.8469999,
            "longitude": 11.4976986
        },
        "name": "Lejrskolen Høve Strand",
        "address": "Asnæs Lyngvej 11, 4550 Asnæs",
        "years": "1996, 1999, 2001, 2003",
        "website": "http://www.lejrskolen.dk",
    },
    {
        "id": 2,
        "coords": {
            "latitude": 55.545347,
            "longitude": 9.8218295
        },
        "name": "Skovgården",
        "address": "Karlskovvej 35C, 5500 Middelfart",
        "years": "1997",
        "website": "http://www.fyn.ysmen.dk/index.php?id=5652",
    },
    {
        "id": 3,
        "coords": {
            "latitude": 55.5366694,
            "longitude": 9.9968613
        },
        "name": "Skåstrup Strand Lejren",
        "address": "Strandgyden 28, 5400 Bogense",
        "years": "1998, 2000",
        "website": "http://skaastrupstrand.dk/",
    },
    {
        "id": 4,
        "coords": {
            "latitude": 55.3405654,
            "longitude": 9.6244667
        },
        "name": "Philipsborg",
        "address": "Kystvejen 73, 6100 Haderslev",
        "years": "2002, 2004",
        "website": "http://hyttefortegnelsen.dk/hytte/philipsborg/",
    },
    {
        "id": 5,
        "coords": {
            "latitude": 55.164516,
            "longitude": 9.512978
        },
        "name": "Irokeser Hytten",
        "address": "Havvejen 70, Sdr. Vilstrup, 6100 Haderslev",
        "years": "2007",
        "website": "http://www.irokeserhytten.dk/",
    },
    {
        "id": 6,
        "coords": {
            "latitude": 56.379566,
            "longitude": 10.9050075
        },
        "name": "Lærkereden",
        "address": "Slåenvej 6, 8500 Grenå",
        "years": "2009, 2010",
        "website": "http://www.laerkereden.org/"
    },
    {
        "id": 7,
        "coords": {
            "latitude": 55.1993697,
            "longitude": 11.5146273
        },
        "name": "Bisseruplejren",
        "address": "Gammel Strandvej 135, 4243 Rude",
        "years": "2015, 2017, 2019, 2021, 2025",
        "website": "http://www.bisseruplejren.dk/"
    },
    {
        "id": 8,
        "coords": {
            "latitude": 55.8784227,
            "longitude": 11.5343726
        },
        "name": "Lyngborgen",
        "address": "Enebærvej 4, Ellinge Lyng, 4560 Vig",
        "years": "2008, 2011, 2013",
        "website": "http://lyngborgen.dk/"
    },
    {
        "id": 9,
        "coords": {
            "latitude": 55.3846357,
            "longitude": 9.6199201
        },
        "name": "Grænseborgen",
        "address": "Vargårdevej 86, 6094 Hejls",
        "years": "2005, 2016",
        "website": "http://www.graenseborgen.dk/"
    },
    {
        "id": 10,
        "coords": {
            "latitude": 55.2455902,
            "longitude": 9.8777956
        },
        "name": "Torø",
        "address": "Torø 1, 5610 Assens",
        "years": "2014, 2024",
        "website": "http://kolonierne.dk/koloni/skovhytten/"
    },
    {
        "id": 11,
        "coords": {
            "latitude": 55.554425,
            "longitude": 10.616398
        },
        "name": "Højbjerg",
        "address": "Langøvej 272, 5390 Martofte",
        "years": "2018, 2022",
        "website": "http://sommerlejrfyn.dk"
    },
    {
        "id": 12,
        "coords": {
            "latitude": 55.2749899,
            "longitude": 11.2527146
        },
        "name": "Egeruphytten",
        "address": "Egerupvej 49, 4230 Skælskør",
        "years": "2006",
        "website": "http://egeruphytten.dk/"
    },
    {
        "id": 13,
        "coords": {
            "latitude": 55.026642,
            "longitude": 10.8547743
        },
        "name": "Helletofte Lejrskole",
        "address": "Korsvej 12, 5953 Tranekær",
        "years": "2009",
        "website": "https://www.schoolandcollegelistings.com/DK"
    },
    {
        "id": 14,
        "coords": {
            "latitude": 55.423817,
            "longitude": 9.845415
        },
        "name": "Fønsborg",
        "address": "Gl. Fønsvej 3, 5580 Nørre Aaby",
        "years": "2012",
        "website": "http://hyttefortegnelsen.dk/hytte/foensborg/"
    },
    {
        "id": 15,
        "coords": {
            "latitude": 55.455648,
            "longitude": 9.6850173
        },
        "name": "Frydenborg",
        "address": "Frydenborgvej 40, 6092 Sønder Stenderup",
        "years": "2020",
        "website": "https://www.frydenborglejren.dk/"
    },
    {
        "id": 16,
        "coords": {
            "latitude": 55.191249915574474,
            "longitude": 11.5573923
        },
        "name": "Klintehytten",
        "address": "Strandbakken 145, 4700 Næstved",
        "years": "2023",
        "website": "https://klintehytten.dk/"
    }
];

for (var i=0; i<places.length; i++) {
    const marker = new AdvancedMarkerElement({
        map: map,
        position: {lat: places[i].coords.latitude, lng: places[i].coords.longitude},
        title: places[i].name+" "+places[i].years
    });
    marker.addListener("click", ()=>{ alert("You clicked the marker...")});
    console.log(`${places[i].name}, ${places[i].years}, ${places[i].address}`);
};