const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const jwt = require('jsonwebtoken');

// If modifying these scopes, delete token.json.
const SCOPES = process.env.APP_SCOPES;
const TOKEN_PATH = 'token.json';

const oauth2Client = new google.auth.OAuth2(
    '848080470926-9mo07uj48npfh46ovhgrk68j3mmi2pp6.apps.googleusercontent.com',
    'kfbigP6hlq1lzfQ9DQb5JDXC',
    'http://localhost:3000/authorize'
  );

  // generate a url that asks permissions for Google+ and Google Calendar scopes
  const scopes = [
    'https://www.googleapis.com/auth/plus.me',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/plus.login'
  ];

function getAuthUrl() {  

  const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',

    // If you only need one scope you can pass it as a string
    scope: scopes
  });

  return url;
}

exports.getAuthUrl = getAuthUrl;


async function getTokenFromCode(auth_code, res) {
  
    
  // This will provide an object with the access_token and refresh_token.
  // Save these somewhere safe so they can be used at a later time.
  const {tokens} = await oauth2Client.getToken(auth_code)
  oauth2Client.setCredentials(tokens);
  oauth2Client.setCredentials({access_token: tokens.access_token});

  saveValuesToCookie(tokens, res);

  return tokens.access_token;

}

exports.getTokenFromCode = getTokenFromCode;


function getAccessToken(cookies, res) {

  // Do we have an access token cached?
  let acc_token = cookies.graph_access_token;

  if (acc_token) {
    // We have a token, but is it expired?
    // Expire 5 minutes early to account for clock differences
    const FIVE_MINUTES = 300000;
    const expiration = new Date(parseFloat(cookies.graph_token_expires - FIVE_MINUTES));
    if (expiration > new Date()) {
      // Token is still good, just return it
      return acc_token;
    }
  }

  // Either no token or it's expired, do we have a
  // refresh token?
  const refresh_token = cookies.graph_refresh_token;

  
  if (refresh_token) {
    oauth2client.on('tokens', (tokens) => {
      // store the refresh_token in my database!
      oauth2Client.setCredentials(tokens);
      oauth2Client.setCredentials({access_token: tokens.access_token});

      saveValuesToCookie(tokens, res);

      // TO FIND USER INFO
      //var oauth2 = google.oauth2({
      //  auth: oauth2Client,
      //  version: 'v2'
      //});

      //oauth2.userinfo.get(
      //function(err, response) {
      //    if (err) {
      //        console.log('Auth error:');
      //        console.log(err);
      //   } else {
      //        var userProfile = response.data;
      //        saveValuesToCookie(tokens, response.data, res);
      //    }
      //});

      
    });
    return oauth2client.credentials.access_token;
  }

  // Nothing in the cookies that helps, return empty
  return null;
}

exports.getAccessToken = getAccessToken;


function saveValuesToCookie(token, res) {
  // Parse the identity token
  const user = jwt.decode(token.id_token);

  // Save the access token in a cookie
  res.cookie('graph_access_token', token.access_token, {maxAge: 3600000, httpOnly: true});
  // Save the user's name in a cookie
  res.cookie('graph_user_name', user.name, {maxAge: 3600000, httpOnly: true});
  // Save the refresh token in a cookie
  res.cookie('graph_refresh_token', token.refresh_token, {maxAge: 7200000, httpOnly: true});
  // Save the token expiration time in a cookie
  res.cookie('graph_token_expires', token.expiry_date, {maxAge: 3600000, httpOnly: true});
}

