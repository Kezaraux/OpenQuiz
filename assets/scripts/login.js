(function() {
	var username = document.getElementById('login');
	var password = document.getElementById('password_input');
	var loginButton = document.getElementById('login_button');

	loginButton.addEventListener('click', function() {
		handleLogin();
	});

	window.addEventListener('keydown', function(e) {
		if (e.keyCode === 13) {
			handleLogin();
		}
	});

	function handleLogin() {
		if (username.value !== '' && password.value !== '') {
			var xmlhttp = new XMLHttpRequest();
			var serverUrl = "http://batcave.opentext.net:8000";
		    var authRequest = new FormData();
		    authRequest.append('type', 'authUser');
		    authRequest.append('username', username.value);
		    authRequest.append('password', password.value);

		    xmlhttp.open('POST', serverUrl, false);
		    xmlhttp.onreadystatechange = function() {
		        if (xmlhttp.readyState === 4 && xmlhttp.status === 200){
		            var response = xmlhttp.responseText;
		            alert(response);
		            window.location.href = serverUrl + '/landing.html';
		        } else {
		        	alert(xmlhttp.responseText);
		        }
		    }
		    xmlhttp.send(authRequest);
		} else {
			alert('Enter both username/email and password')
		}
	}
})();
