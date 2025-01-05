var jsObjects = [
    {a: 1, b: 2}, 
    {a: 3, b: 4}, 
    {a: 5, b: 6}, 
    {a: 7, b: 8}
];

console.log(`${JSON.stringify(jsObjects)}`);
console.log(jsObjects);

var result = jsObjects.filter(obj => {
    return obj.b === 12
});

if (result.length > 0) {
    console.log(`${JSON.stringify(result)}`);
    console.log(`Result: ${result[0].a}, ${result[0].b}`);
} else {
    console.log(`No findings`);
};

var result2 = jsObjects.find(obj => {
    return obj.b === 12
});

if (result2) {
    console.log(`${JSON.stringify(result2)}`);
    console.log(`Result: ${result2.a}, ${result2.b}`);
} else {
    console.log(`No findings 2`);
};
