// const { google } = require('googleapis')
import { google } from 'googleapis'
const { GoogleSpreadsheet } = require('google-spreadsheet');
import { config as dotenvConfig } from 'dotenv'

dotenvConfig()

console.log(process.env.CONTACT_EMAIL)
// const { GOOGLE_SERVICE_ACCOUNT, SPREADSHEET_ID } = process.env

// const SPREADSHEET_ID = '1wAIe4copuPdplcwV6QoehnLsPzxyPcWXaxTn7ecTYuo'

// var creds = require('./client-secret-2.json');
var doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID);

// const getClient = ({ scopes }) => {
//     return google.auth.getClient({
//         credentials: JSON.parse(Buffer.from(GOOGLE_SERVICE_ACCOUNT, 'base64').toString('ascii')),
//         scopes: scopes,
//     })
// }

// const authorizeSheets = async () => {
//     const client = await getClient({
//         scopes: ['https://www.googleapis.com/auth/spreadsheets'],
//     })
//     return google.sheets({
//         version: 'v4',
//         auth: client,
//     })
// }

// const addToCol = async (range, emailAddress) => {
//     const sheets = await authorizeSheets()
//     return new Promise((resolve, reject) => {
//         sheets.spreadsheets.values.append({
//             spreadsheetId: SPREADSHEET_ID,
//             range,
//             valueInputOption: 'USER_ENTERED',
//             resource: {
//                 values: [[emailAddress]],
//             },
//         },
//             (err, response) => {
//                 if (err) {
//                     return reject(err)
//                 }
//                 return resolve(response)
//             })
//     })
// }

// function asyncAddRow(sheetIndex, row) {
//     const sheet = doc.sheetsByIndex[parseInt(sheetIndex)];
//     return new Promise((res, rej) => {
//         sheet.addRow(row, (err) => {
//             if (err) rej(err);
//             else res(true);
//         });
//     })
// }

exports.handler = async (event, context, callback) => {
    // console.log(event)
    console.log(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL)
    let sheetsResponse
    try {
        const parsedBody = JSON.parse(event.body)
        const { sheetId, name, email, address, telephone } = parsedBody
        console.log(sheetId, name, email, address, telephone)

        if (!sheetId) {
            return {
                statusCode: 500,
                body: "No sheet ID provided"
            }
        }
        // const email = "shannonjamalclarke@gmail.com"
        // sheetsResponse = await addToCol('Sheet1!F2', email)
        // await doc.useServiceAccountAuth(creds)
        await doc.useServiceAccountAuth({
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n'),
        });
        await doc.loadInfo();


        const sheet = doc.sheetsByIndex[parseInt(sheetId)];
        sheetsResponse = await sheet.addRow(parsedBody)


    } catch (err) {
        console.log(err)
        return {
            statusCode: 500,
            body: err.toString()
        }
    }

    // return {
    //     statusCode: sheetsResponse.status,
    //     body: JSON.stringify(sheetsResponse)
    // }

    return {
        statusCode: 200,
        body: "Successfully added new row"
    }
}