function initiateSignOn() {
	// Additional parameters
	var params = {
		'clientid' : '843269830336-fdogjfrllkuqk03u47oost3v9aq9v0iv.apps.googleusercontent.com',
		'cookiepolicy' : 'single_host_origin',
		'callback' : 'onSignInCallback',
		'scope' : 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email',
		'requestvisibleactions' : 'http://schema.org/AddAction'
	};
	gapi.auth.signIn(params);
}

function onSignInCallback(authResult) {
	gapi.client.load('plus','v1');
	if (authResult.status.signed_in) {
		gapi.client.load('oauth2', 'v2', function() {
			gapi.client.oauth2.userinfo.get().execute(function(resp) {
				var req = JSON.stringify({type: 'login', userInfo: resp});
				var xmlhttp = new XMLHttpRequest();
				xmlhttp.open('POST', 'http://localhost:8000', false);
				xmlhttp.send(req);
				window.location.href='http://localhost:8000/landing';
			});
		});
	}
}