const fetch = require('node-fetch');
const https = require('https');
require('dotenv').config();

var newDate;
var currentDate;

console.log("Running!");

const main = () => {
    fetch(process.env.GLASPORTAAL_MENDIX_SERVER,
        {
            method: 'GET',
            headers: {
                "Accept": "*/*",
                "Mendix-Username": process.env.MENDIX_USERNAME,
                "Mendix-ApiKey": process.env.MENDIX_API_KEY
            },
        })
        .then(res => res.json())
        .then(items => {
            newDate = items[0].Date
            const userAccountNotification = {

                'text': 'Er is een nieuwe commit gedaan.',
                'attachments': [{
                    'color': '#0594db',
                    'fields': [
                        {
                            'title': items[0].Author,
                            'value': items[0].CommitMessage,
                            'short': false
                        },
                    ]
                }]
            };
            if (newDate != currentDate) {

                (async function () {
                    if (!process.env.WEBHOOK_URL) {
                        console.error('Please fill in your Webhook URL');
                    }

                    console.log('Sending slack message');
                    try {
                        const slackResponse = await sendSlackMessage(process.env.WEBHOOK_URL, userAccountNotification);
                        console.log('Message response', slackResponse);
                    } catch (e) {
                        console.error('There was a error with the request', e);
                    }

                })();
            }

        });




    function sendSlackMessage(webhookURL, messageBody) {
        try {
            messageBody = JSON.stringify(messageBody);
        } catch (e) {
            throw new Error('Failed to stringify messageBody', e);
        }

        return new Promise((resolve, reject) => {
            const requestOptions = {
                method: 'POST',
                header: {
                    'Content-Type': 'application/json'
                }
            };

            const req = https.request(webhookURL, requestOptions, (res) => {
                let response = '';


                res.on('data', (d) => {
                    response += d;
                });

                res.on('end', () => {
                    resolve(response);
                })
            });

            req.on('error', (e) => {
                reject(e);
            });

            req.write(messageBody);
            req.end();
        });
    }
    currentDate = newDate;
};

setInterval(main, 600000);