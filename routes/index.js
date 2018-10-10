var express = require('express');
var router = express.Router();


const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
var authHelper = require('../helpers/auth');

/* GET home page. */
router.get('/', function(req, res, next) {
	let parms = { title: 'Home', active: { home: true } };

	const accessToken = authHelper.getAccessToken(req.cookies, res);
	const userName = req.cookies.graph_user_name;

	if (accessToken && userName) {
		parms.user = userName;
		parms.debug = `User: ${userName}\nAccess Token: ${accessToken}`;
	}else{
		parms.signInUrl = authHelper.getAuthUrl();
		parms.debug = parms.signInUrl;
	}

	res.render('index', parms);
});

module.exports = router;


