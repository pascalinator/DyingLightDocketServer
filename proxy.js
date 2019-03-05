var http = require('http');
var https = require('https');
var fs = require('fs');

var usingFiddlerProxy = false;

var rewards =
[
    {"docket_A": 999}, // normal docket
    {"docket_B": 999}, // community docket
    {"docket_C": 999}, // premium docket
    {"docket_D": 999}, // special docket

    {"docket_E01": 999}, // buggy paint job (little rising sun)
    {"docket_E02": 999}, // buggy paint job (golden)
    {"docket_E03": 999}, // buggy paint job (lemon)
    {"docket_E04": 999}, // buggy paint job (G.R.E)
    {"docket_E05": 999}, // buggy paint job (ambulance)
    {"docket_E06": 999}, // buggy paint job (police)
    {"docket_E07": 999}, // buggy paint job (rocket league)
    /*{"docket_E08": 988}, // buggy paint job 08
    {"docket_E09": 987}, // buggy paint job 09
    {"docket_E10": 986}, // buggy paint job 10*/

    {"docket_F01": 999}, // outfit (joker)
    /*{"docket_F02": 984}, // outfit 02
    {"docket_F03": 983}, // outfit 03
    {"docket_F04": 982}, // outfit 04
    {"docket_F05": 981}, // outfit 05
    {"docket_F06": 980}, // outfit 06
    {"docket_F07": 979}, // outfit 07
    {"docket_F08": 978}, // outfit 08*/
    {"docket_F09": 999}, // silas drop???
    {"docket_F10": 999} // valentines pack???

    /*{"docket_G01": 975}, // dying light bonus 01
    {"docket_G02": 974}, // dying light bonus 02
    {"docket_G03": 973}, // dying light bonus 03
    {"docket_G04": 972}, // dying light bonus 04
    {"docket_G05": 971}, // dying light bonus 05
    {"docket_G06": 970}, // dying light bonus 06
    {"docket_G07": 969}, // dying light bonus 07
    {"docket_G08": 968}, // dying light bonus 08
    {"docket_G09": 967}, // dying light bonus 09
    {"docket_G10": 966}, // dying light bonus 10

    {"docket_H01": 965}, // community event 01
    {"docket_H02": 964}, // community event 02
    {"docket_H03": 963}, // community event 03
    {"docket_H04": 962}, // community event 04
    {"docket_H05": 961}, // community event 05
    {"docket_H06": 960}, // community event 06
    {"docket_H07": 959}, // community event 07
    {"docket_H08": 958}, // community event 08
    {"docket_H09": 957}, // community event 09
    {"docket_H10": 956}  // community event 10*/
];

// mms = main menu screen
// mmf = main menu popup
// ls = loading screen
// ds = death screen

var scrollMsg = "You're connected to the %COLOR(FF8000)Dying Light Docket Server%COLOR(RESET)! This server will provide you with an almost limitless amount of %COLOR(FF8000)dockets%COLOR(RESET). All other server functions are forwarded to the %COLOR(FF8000)official game server%COLOR(RESET).";
var loadingMsg = "The %COLOR(FF8000)Dying Light Docket Server%COLOR(RESET) will provide you with 999 of each type of %COLOR(FF8000)docket%COLOR(RESET), redeemable at the %COLOR(FF8000)quartermaster%COLOR(RESET).";
var deathMsg = "Wow you %COLOR(FF8000)died%COLOR(RESET), get gud %COLOR(FF8000)scrub%COLOR(RESET)!";

var motd =
[
    {
        "format": {},
        "text": scrollMsg,
        "number": 1,
        "from_date": "2016-03-13T00:00:00",
        "to_date": "2036-09-26T00:00:00",
        "type": "mms"
    },
    {
        "format": {},
        "text": scrollMsg,
        "number": 1,
        "from_date": "2016-03-13T00:00:00",
        "to_date": "2036-09-26T00:00:00",
        "type": "mmf"
    },
    {
        "format": {},
        "text": loadingMsg,
        "number": 2,
        "from_date": "2016-03-13T00:00:00",
        "to_date": "2036-09-26T00:00:00",
        "type": "ls"
    },
    {
        "format": {},
        "text": deathMsg,
        "number": 3,
        "from_date": "2016-03-13T00:00:00",
        "to_date": "2036-09-26T00:00:00",
        "type": "ds"
    }
];

function forwardRequest(response, url, headers, body)
{
    var isPost = typeof body !== 'undefined'; // if body arg is supplied we'll assume this is a POST request

    headers['Host'] = "pls.dyinglightgame.com";

    if(usingFiddlerProxy)
        headers['Host'] = "52.71.70.189"; // change the host header so fiddler can stop complaining

    if(isPost)
    {
        headers['Content-Type'] = "application/x-www-form-urlencoded";
        headers['Content-Length'] = Buffer.byteLength(body);
    }

    var options =
    {
        host: "52.71.70.189",
        port: 443,
        path: url,
        headers: headers,
        method: isPost ? "POST" : "GET",
        checkServerIdentity: function (host, cert) { return undefined; } // fix for certificate error
    };

    if(usingFiddlerProxy)
    {
        options.host = "127.0.0.1";
        options.port = 8888;
        options.path = "https://52.71.70.189" + url;
    }

    callback = function(serverResponse)
    {
        var str = '';
        serverResponse.on('data', function (chunk) { str += chunk.toString(); });

        serverResponse.on('end', function () 
        {
            response.writeHead(serverResponse.statusCode, {'Content-Type': 'application/json'});
            response.end(str);
        });
    }

    var prot = usingFiddlerProxy ? http : https; // don't use https if we're using a proxy
    var req = prot.request(options, callback);

    req.on('error', function(err)
    {
        response.writeHead(404, {'Content-Type': 'application/json'});
        response.end(err.toString());
    });

    if(isPost)
        req.write(body);

    req.end();
}

function handleRequest(request, response)
{
    console.log("[", request.method, "]:", request.url);

    var plsHeaders = {};

    for(var key in request.headers)
    {
        if(key.indexOf("pls") <= -1)
            continue;

        // ugh.. fix for fucking stupid "JS convenience" crap
        var realKeyName = key;
        for(var idx in request.rawHeaders)
        {
            if(request.rawHeaders[idx].toLowerCase() == key)
            {
                realKeyName = request.rawHeaders[idx];
                break;
            }
        }

        plsHeaders[realKeyName] = request.headers[key];
    }

    if(Object.keys(plsHeaders).length > 0)
    {
        console.log("PLS headers:", plsHeaders);
        console.log();
    }

    if(request.method == "GET")
    {
        if(request.url.startsWith("/rewards/currentuser/"))
        {
            if(fs.existsSync("rewards.json"))
            {
                var rewardsStr = fs.readFileSync("rewards.json");
                rewards = JSON.parse(rewardsStr);
            }
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(rewards));
        }
        else if(request.url.startsWith("/messages/motd/current/"))
        {
            if(fs.existsSync("motd.json"))
            {
                var motdStr = fs.readFileSync("motd.json");
                motd = JSON.parse(motdStr);
            }
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(motd));
        }
        else
            forwardRequest(response, request.url, plsHeaders);
    }

    else if(request.method == "POST")
    {
        var str = '';
        request.on('data', function (chunk) { str += chunk.toString(); });
        
        request.on('end', function()
        {
            console.log("POST data:", str);
            forwardRequest(response, request.url, plsHeaders, str);
        });
    }

    else
    {
        console.log("[", request.method, "]:", request.url, ": unknown request method!");
        response.writeHead(403, {'Content-Type': 'application/json'});
        response.end('"Not Found"');
        return;
    }
}

// self-signed certificate for pls.dyinglightgame.com
var sslCert = `-----BEGIN CERTIFICATE-----
MIIDFTCCAf2gAwIBAgIJAO37GSrXAl3xMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMMFnBscy5keWluZ2xpZ2h0Z2FtZS5jb20wHhcNMTYwMzEzMDAwNjE4WhcNMjYw
MzExMDAwNjE4WjAhMR8wHQYDVQQDDBZwbHMuZHlpbmdsaWdodGdhbWUuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA/BUATLGMB30zRSzWGO+GU5dr
AkInA8B5lZKAE0Iz593AkVmH7s/T8qt2mAp2scPWCMlIdxO4IM1RaNOlsMBOusN5
MDfNMUed6b9s5bAjtHmOf4tyIo/W8AyHpa/S0Lzxho3pEwm4SeJv/sOFm4b74icP
luzTjPgkpnkb2B6fYpqQlzOxPj0MHZ+lPF0X2TecgIsgCSBL3mjLvAMfzZIAr8hB
DHJp8NBiK7jUAvZvKXHc58egJemT9VXTTymHtVtvXnOqZVDoAuWtYRfQBfzNvprV
wDArZ2MI/a352EtoRbFLhcpxV2X/NlxhTJZ65Xtd7fd/WirsyGnqMDBmQ6wTgwID
AQABo1AwTjAdBgNVHQ4EFgQUZd3RY/OFORq3KsZya7tixz/r4qQwHwYDVR0jBBgw
FoAUZd3RY/OFORq3KsZya7tixz/r4qQwDAYDVR0TBAUwAwEB/zANBgkqhkiG9w0B
AQsFAAOCAQEAHkQXGgdNOkfceE84cBZqrby+LmMiMPH4rNfxfDXFR6kl/dXltJnM
gqiUsG0PnPgMluwt+gILKV1UAaj8PxiuNnMScnmfn8dBFxenfaHaU6zEjxAzXqdW
hdg6sxUbg7i+j1TX6lJHAsOS9JkrhHZvmWkwuVxrb61a+aRBXH5Sq2wGqXwIU8YJ
B4b7sRmSE059PdpnI1eFODyMfqnifzbpKqZHkNm+yTZkIcoXzQM6SNt+FlgGItdB
pF2V/AE32/OHpmpoFp9bFUFodnOjuuTgvmGLW1vNTAGSTSZSD/ezIl19r5mt1StL
tcDIWgh77yWy4LhiVhu/Nsrk5Vuj1XFCcw==
-----END CERTIFICATE-----`;

var sslKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA/BUATLGMB30zRSzWGO+GU5drAkInA8B5lZKAE0Iz593AkVmH
7s/T8qt2mAp2scPWCMlIdxO4IM1RaNOlsMBOusN5MDfNMUed6b9s5bAjtHmOf4ty
Io/W8AyHpa/S0Lzxho3pEwm4SeJv/sOFm4b74icPluzTjPgkpnkb2B6fYpqQlzOx
Pj0MHZ+lPF0X2TecgIsgCSBL3mjLvAMfzZIAr8hBDHJp8NBiK7jUAvZvKXHc58eg
JemT9VXTTymHtVtvXnOqZVDoAuWtYRfQBfzNvprVwDArZ2MI/a352EtoRbFLhcpx
V2X/NlxhTJZ65Xtd7fd/WirsyGnqMDBmQ6wTgwIDAQABAoIBABx7jv4bbZQHDHz7
dPF6VvYo/LlTmi7tV4+T7w6+Azlmr/R8ZkSQjQU1ZIAHZqPtWcjCXYK+4qYqLNGo
YGdZQ0wM/Ct7kp7H1crsizRks5QXzAcTTYEkOYgEEmuhMzPMtYmbjUNObNlEUZ06
oGUTWnCSM0u9VKXv/8wjkQbZZu7wCI/dzNDb7leKQ64gNs0x5i7xUD5zMkFZxi1x
P/MUqdMBZxxe0jpLp8J52bbjoVbevmwQ1t2WtzGspdEA5eHciSuJ6jHCQtMGV6vR
RgKmNrpjV5LhyCGKAcpZx1abLzhzrff1HYhsmC458BWYHLVbkRSJbNHL7+L12+CQ
aGZKNdECgYEA/4/Clf0kHFRALm0UvMXZBI52ekZn3weL2Qvvr11Z5fwHvZPiKBX7
BSNVrktylLyU32XdQe/ppXpgNd6nUf9K4fKVGFtW/a6CMp02esLMGHZDhBDeBo2H
JbQi+zJ53s5SaISNvTw/Dyl4A9ooSgoTs1Bfl6kYR75q16HJAa2emIsCgYEA/IO2
gH2bFyWfYPJ61RA73vXdxsjKK55588leB8eg7XW5LjEJuEq1w22gFv+eZWJioe9T
DVWCNBfiPPaV9DT+64WNi3J4JjtRlQik8WxkNMuJWFCVWZh63puYa0q0iabXJUGA
jMeofWI+jPbMAbhf8SMovwc7loXOBYIfCVz0V+kCgYAG6u9LfBS0J5utJgq/qWNc
eja+zJUXNm8UqvwL9Szvysiy2wPuLdojo3c4RpaNbCVjfrBkjof2kL919db1o0F1
qElc5WwPZd/kWtkUrZ00tE7TjllUOBSGcr/XqOAfpdoZNi1YB/90+5xiDk+04Vzz
J6POySb9GixuNdTpFLgMTQKBgE+Nk2ahq8W8FZ0uZ2JOrf4NSaSBx6e8UsFqNFSR
IPMOvpt92YkVCHScSe5U8+sO9vH7exfdU5rj12PLb+yy8Yjz12cSViX9VDN2uLhS
pLM5WHjZUmQatMMDFB7hN0WSqX9URpKTqFJwLDKu4hC8rIVExWaBedVvLDvyBaMm
hNhZAoGBAL0TsPrn2GTtbu68bGrLisvVG3HVeqASXV0VKk6cZjYq29xfSr+vIaeF
n2Eghay77TPMdn4bNX7gvpWZXjEV4d/mibky5yY6iKX0AjFhk7cLzbgxJUlnNg+Y
As2ouFiHupWq0bpgsion3AZqUIrQONPQifTRg2Er9pc9WpVNPQ1A
-----END RSA PRIVATE KEY-----`;

console.log("DyingLightDocketServer - by emoose");
console.log("Edit your hosts file and point pls.dyinglightgame.exe to 127.0.0.1 before use!");
console.log();

if(fs.existsSync("serverCert.pem"))
{
    console.log("Loading serverCert.pem...");
    sslCert = fs.readFileSync("serverCert.pem");
}

if(fs.existsSync("serverKey.pem"))
{
    console.log("Loading serverKey.pem...");
    sslKey = fs.readFileSync("serverKey.pem");
}

if(fs.existsSync("motd.json"))
{
    console.log("Loading motd.json...");
    var motdStr = fs.readFileSync("motd.json");
    motd = JSON.parse(motdStr);
}

if(fs.existsSync("rewards.json"))
{
    console.log("Loading rewards.json...");
    var rewardsStr = fs.readFileSync("rewards.json");
    rewards = JSON.parse(rewardsStr);
}

var options =
{
    cert: sslCert,
    key: sslKey
};

var server = https.createServer(options, handleRequest);
server.listen(443, function()
{
    console.log("Server listening on https://127.0.0.1");
});