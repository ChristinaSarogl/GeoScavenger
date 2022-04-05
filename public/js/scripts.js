var firebaseConfig = {
    apiKey: "AIzaSyDBGrMzuKHDWlIKQwJWpAsjUBkN-W1dKFI",
    authDomain: "geohunt-40208.firebaseapp.com",
    databaseURL: "https://geohunt-40208-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "geohunt-40208",
    storageBucket: "geohunt-40208.appspot.com",
    messagingSenderId: "869135269104",
    appId: "1:869135269104:web:b02648b0edc3f7759cd635",
    measurementId: "G-YC767T6298"
};

firebase.initializeApp(firebaseConfig);

//Firebase references
const auth = firebase.auth();
const db = firebase.firestore();

const questionsInfo = {};
var submittedQuestions = 0;
var checkpointMarker;
let markers = [];
var markerExists = false;
var mapView;
var usersLocs = {};
var activeInfoWindow = null;
var messagesRef;

//Listen for auth changes
auth.onAuthStateChanged(user => {
    if (user){
        loadInfo(user);        
    } else {
		var path = window.location.pathname;
        var page = path.split("/").pop();
		if(page !== "login" && page !== "register"){
			window.location.href = "/~1801448/geoscavenger/public/login";
		}			
        console.log("User logged out");
    }
})

function login(){
    const loginForm = document.querySelector('#login-form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        var email = loginForm['login-email'].value;
        var password = loginForm['login-password'].value;
    
        auth.signInWithEmailAndPassword(email,password)
        .then(cred =>{
            var user  = cred.user;
            db.collection("managers").doc(user.uid).get()
            .then((doc)=>{
                if (doc.exists){
                    window.location.href = "home"; 
                } else {
                    auth.signOut();       
                    document.getElementById('error-message').innerHTML="You need a manager account to enter this service!";             
                }
            })                       
        }).catch((error) => {
            document.getElementById('error-message').innerHTML="Incorrect email or password!";
        })
    })
}

function signup(){
    const signupForm = document.querySelector('#register-form');
    signupForm.addEventListener('submit' , (e) => {
        e.preventDefault();
        var mUsername = signupForm['register-username'].value;
		var day = signupForm['dateDay'].value;
        var month = signupForm['dateMonth'].value;
        var year = signupForm['dateYear'].value;
        var mEmail = signupForm['register-email'].value;
        var mPassword = signupForm['register-password'].value;
        var mPasswordRepeat = signupForm['register-repeat'].value;
		
		//Calculate age
		var birthday = year + "-" + month + "-" + day;
        var date = new Date(birthday);

        var age = new Date().getFullYear() - date.getFullYear();
        var month= new Date().getMonth() - date.getMonth();
        if (month < 0 || (month === 0 && new Date().getDate() < date.getDate())){
            age--;
        }

        if (mPassword !== mPasswordRepeat){
            document.getElementById('error-message').innerHTML="Passwords do not match.";
		} else if(age < 18){
			document.getElementById('error-message').innerHTML="You have to be at least 18 to use the service.";
        } else {
            auth.createUserWithEmailAndPassword(mEmail,mPassword)
            .then(cred => {
                var user = cred.user;
                //Change manager's display name
                user.updateProfile({
                    displayName: mUsername,
                }).then(() =>{
                    //Create firestore document
                    db.collection("managers").doc(user.uid).set({
                        username: mUsername,
                        photoUrl: null,
                        email: mEmail,
                        created_hunts: [],
                    }).then(() => {
                        console.log("User document created!");
                        window.location.href = "home";
                    })               

                })
            }).catch((error) => {
                var errorCode = error.code;
                if (errorCode === 'auth/weak-password'){
                    document.getElementById('error-message').innerHTML="Weak Password!<br>Your passoword has to have at least 6 characters";
                } else if(errorCode === 'auth/email-already-in-use'){
                    document.getElementById('error-message').innerHTML="An account with this email already exists!";
                } else if(errorCode === 'auth/invalid-email'){
                    document.getElementById('error-message').innerHTML="You have entered an invalid email!";
                } else {
                    document.getElementById('error-message').innerHTML="Something went wrong!<br>Please check your information!";
                }
            })
        }
        
        
    })
}

function logoutUser(){
    auth.signOut();
}

function loadInfo(user){
    var storage = firebase.storage();

    db.collection("managers").doc(user.uid).get().then((doc) => {
        if (doc.get('photoUrl') !== null){
            var imageUrl = doc.get('photoUrl');
            storage.refFromURL(imageUrl).getDownloadURL()
            .then((url)=>{
                document.getElementById('profile-image').setAttribute('src', url);
            });
        } else {
            var pathReference = storage.ref('default_images/avatar_icon.png');
            pathReference.getDownloadURL().then((url) => {
                document.getElementById('profile-image').setAttribute('src', url);
            });
        }

        //Get file name
        var path = window.location.pathname;
        var page = path.split("/").pop();

        if(page === "home"){
            loadHunts(user);
        } else if (page === "create"){
            document.getElementById('username').innerHTML = user.displayName;
			var pathReference = storage.ref('default_images/plus.png');
            pathReference.getDownloadURL().then((url) => {
                document.getElementById('add-checkpoint').setAttribute('src', url);
            });
            initMapCreate();
        } else {
			document.getElementById('username').innerHTML = user.displayName;	
			initMapView();
			findActiveUsers();
		}
        
    });
}

function loadHunts(user){
    db.collection("managers").doc(user.uid).get().then((doc)=>{
        if (doc.get('created_hunts').length !== 0){
            document.querySelector('#noHuntsMessage').style.display = "none";
            var i = 0;
            //Display all hunts that the user has created
            doc.get('created_hunts').forEach((doc) => {
                db.collection("hunts").doc(doc).get()
                .then((huntInfo) =>{
                    var row = document.createElement('tr');

                    var name = document.createElement('td');
                    name.innerHTML = huntInfo.get('name');
					name.setAttribute('onclick',"window.location='active/" + huntInfo.id + "'");

                    var date = document.createElement('td');
                    date.innerHTML = huntInfo.get('date').toDate().toLocaleString('en-US',{
                        day: 'numeric', year: 'numeric', month: 'long'});
					date.setAttribute('onclick',"window.location='active/" + huntInfo.id + "'");

                    var players = document.createElement('td');
                    players.innerHTML = huntInfo.get('players');
					players.setAttribute('onclick',"window.location='active/" + huntInfo.id + "'");

                    var del = document.createElement('td');
                    var string = document.createElement('p');
                    string.innerHTML = "Delete hunt";
                    del.append(string);
                    del.setAttribute('class','clickable');
                    del.setAttribute('onclick','deleteThisHunt(' + i + ')');

                    row.append(name);
                    row.append(date);
                    row.append(players);
                    row.append(del);

                    $('#hunts-table').append(row);
                    i++;
                }); 
				
           });

        } else {
            document.querySelector('#hunts-table').style.display = "none";
            document.querySelector('#deleteAll').style.display = "none";
            document.querySelector('#noHuntsMessage').style.display = "block";
        }

        document.getElementById('username').innerHTML = user.displayName;
        document.getElementById('loader').style.display="none";
        document.getElementById('main').style.display="block";

    });

}

function saveCoordinates(){
	var storage = firebase.storage();
    
	var coordinates = checkpointMarker.getPosition();
    var lat = coordinates.lat();
    var lng = coordinates.lng();

    //var lat = Math.random() * 90;
    //var long = Math.random() * 180;

    var lenght = document.getElementById("checkpoint-list").getElementsByTagName("li").length;

    if(lenght >= 7){
        document.getElementById('error-message').innerHTML="You can't have more than 7 checkpoints";
    } else {
        //Add checkpoint to checkpoint list
        var checkpoint = document.createElement('li');
        checkpoint.setAttribute('id','check' + lenght);
        checkpoint.setAttribute('class',
            'list-group-item d-flex align-items-center justify-content-between p-2');

        var div = document.createElement('div');        

        var title = document.createElement('p');
        title.innerHTML = "Checkpoint " + (lenght+1);
        title.setAttribute('class','small-title');

        var coordinates = document.createElement('p');
        coordinates.setAttribute('class','mb-1');
        coordinates.innerHTML = lat.toFixed(6) + ', ' + lng.toFixed(6);

        var deleteIcon = document.createElement('img');
		var pathReference = storage.ref('default_images/bin.png');
            pathReference.getDownloadURL().then((url) => {
                deleteIcon.setAttribute('src',url);
            });
        deleteIcon.setAttribute('class', 'small-image clickable');
        deleteIcon.setAttribute('id','delete' + lenght);
        deleteIcon.setAttribute('onclick','deleteCheckpoint("'+ lenght + '")');

        div.append(title);
        div.append(coordinates);
        checkpoint.append(div);
        checkpoint.append(deleteIcon);
        $('#checkpoint-list').append(checkpoint);

        //Add checkpoint to challenge list
        var challenge = document.createElement('li');
        challenge.setAttribute('class','list-group-item');
        var title = document.createElement('p');
        title.innerHTML = "Checkpoint " + (lenght+1);
        title.setAttribute('class','small-title clickable');
        title.setAttribute('onclick', "resetForm("+ lenght + ")");
        challenge.append(title);
        challenge.setAttribute('id','chal' + lenght);
        $('#challenge-list').append(challenge);

        //Add checkpoint to checkopoint selection
        var selection = document.createElement('option');
        selection.innerHTML = "Checkpoint " + (lenght+1);
        selection.setAttribute('id','sel' + lenght);
        $('#challenge-checkpoint').append(selection);

		markers.push(checkpointMarker);
        checkpointMarker.setLabel((lenght+1).toString());
        markerExists = false;
    }    
}

function deleteCheckpoint(position){
    //Remove element from checkpoint list
    var checkEl = document.getElementById('check' + position);
    checkEl.remove();

    //Remove element from challenge list
    var chalEl = document.getElementById('chal' + position);
    chalEl.remove();

    //Remove element from selection list
    var selEl = document.getElementById('sel' + position);
    selEl.remove();
	
	//Remove marker
	var removedMarker = markers.splice(position,1);
	removedMarker[0].setMap(null);
	for (var marker = 0; marker < markers.length; marker++){
		markers[marker].setLabel((marker+1).toString());
	}
	
    const checkpointItems = document.getElementById('checkpoint-list').getElementsByTagName('li');
    const challengeItems = document.getElementById('challenge-list').getElementsByTagName('li');
 
    //Loop through the lists.
    for (let item = 0; item <= checkpointItems.length - 1; item++) {
        //Change challenge list
        var challenge = challengeItems[item].getElementsByClassName('small-title');
        for(let i = 0; i <= challenge.length-1; i++){
            challenge[i].innerHTML = "Checkpoint " + (item + 1);
            challenge[i].setAttribute('onclick', "resetForm(" + item + ")");
        }
        challengeItems[item].setAttribute('id','chal' + item);
    

        //Change checkpoint list
        checkpointItems[item].setAttribute('id','check' + item);

        var title = checkpointItems[item].getElementsByClassName('small-title');
        for(let i = 0; i <= title.length-1; i++){
            title[i].innerHTML = "Checkpoint " + (item +1 );
        }

        var image = checkpointItems[item].getElementsByClassName('small-image');
        for(let i = 0; i <= image.length-1; i++){
            image[i].setAttribute('id','delete' + item);
            image[i].setAttribute('onclick','deleteCheckpoint("'+ item + '")');
        }
    }

    const selectionItems = document.getElementById('challenge-checkpoint').getElementsByTagName('option');

    //Change selection list
    for(let sel = 0; sel <= selectionItems.length-1; sel++){
        if (sel !== 0){
            selectionItems[sel].setAttribute('id','sel'+ (sel-1));
            selectionItems[sel].innerHTML = "Checkpoint " + sel;
        }
    }    

    //Check if any questions are saved and delete them
    if (questionsInfo.lenght !== 0){
        var index = parseInt(position) + 1;
        delete questionsInfo['Checkpoint '+ index]; 
        submittedQuestions--;   
    }

}

$(document).ready(function() {
    $(document).on('submit', '#question-form', function(e) {
        const questionForm = document.querySelector('#question-form');
        const answers = [];
        
        const checkpointQuestionInfo = {};
        var checkpoint = questionForm['challenge-checkpoint'].value;
        var index = questionForm['challenge-checkpoint'].selectedIndex;
        
		var clue = questionForm['checkpoint-clue'].value;
        var question = questionForm['challenge-question'].value;
		
        checkpointQuestionInfo.question = question;
		checkpointQuestionInfo.clue = clue;

        for(let answerNo = 0; answerNo < 4; answerNo++){
            var answer = questionForm['answer' + (answerNo + 1)].value;
            answers[answerNo] = answer;
        }
        checkpointQuestionInfo.answers = answers;

        var rightAnswerIndex = questionForm['answer'].value;
        checkpointQuestionInfo.rightAnswerIndex = rightAnswerIndex;
        
		if (!questionsInfo.hasOwnProperty(checkpoint)){
            questionsInfo[checkpoint] = checkpointQuestionInfo;
            submittedQuestions++;
        } else {
            questionsInfo[checkpoint] = checkpointQuestionInfo;
        }
		
        document.getElementById('chal' + (index-1)).style.backgroundColor = "#5BA6A2";
        var p = document.getElementById('chal' + (index-1)).getElementsByTagName('p');
        for (let i = 0; i <= p.length-1; i++){
            p[i].style.color = 'white';
        }
		
        questionForm.reset();

        e.preventDefault();
    });
});

function resetForm(index){
    var position = index + 1;
    const questionForm = document.querySelector('#question-form');
    
    if (questionsInfo.lenght !== 0){
        var qDetails = questionsInfo['Checkpoint ' + (position)];
        //If the question is already saved, load
        if (typeof qDetails !== 'undefined'){
            document.querySelector('#challenge-question').value = qDetails.question;
			document.querySelector('#checkpoint-clue').value = qDetails.clue;
            document.querySelector('#answer1').value = qDetails.answers[0];
            document.querySelector('#answer2').value = qDetails.answers[1];
            document.querySelector('#answer3').value = qDetails.answers[2];
            document.querySelector('#answer4').value = qDetails.answers[3];
            document.querySelector('#radio' + qDetails.rightAnswerIndex).checked = true;
        } else {
            questionForm.reset();
        }
    } else {
        questionForm.reset();
    }

    document.querySelector('#challenge-checkpoint').options.item(position).selected = "selected";
}

$(document).ready(function() {
    $(document).on('submit', '#create-form', function(e) {
        const createForm = document.querySelector('#create-form');
        const checkpointsIDs = [];

        var name = createForm['hunt-name'].value;
        var huntName = name;
        
        var checkpoints = document.getElementById('checkpoint-list').getElementsByTagName('li');
		
        if (checkpoints.length < 3){
			document.getElementById('error-message').style.display = "block";
            document.getElementById('error-message').innerHTML="You have to add at least 3 checkpoints to the hunt!";
        } else if(checkpoints.length !== submittedQuestions){
			document.getElementById('error-message').style.display = "block";
            document.getElementById('error-message').innerHTML="You have to enter a question for each checkpoint!";
        } else{
            document.getElementById('loader').style.display="block";
            document.getElementById('main').style.display="none";

            for (let checkp = 1; checkp <= checkpoints.length; checkp ++){

                //Save all the questions details
                var questionDetails  = questionsInfo['Checkpoint '+ checkp];
				var clue = questionDetails['clue'];
                var question = questionDetails['question'];
                var rightAnswer = questionDetails['rightAnswerIndex'];
                var answers = questionDetails['answers'];

                //Get checkpoint's coordinates
                var checkCoord = document.querySelector('#check' + (checkp-1)).getElementsByTagName('p')[1].textContent;
                const coordinatesArray = checkCoord.split(", ");
                var lat = parseFloat(coordinatesArray[0]);
                var lng = parseFloat(coordinatesArray[1]);

                //Save checkpoint information
                var checkpointRef = db.collection('checkpoints').doc();
                
                checkpointRef.set({
                    location: new firebase.firestore.GeoPoint(lat,lng),
					clue: clue,
                    question: question,
                    rightAnswerIndex: parseInt(rightAnswer),
                    0: answers[0],
                    1: answers[1],
                    2: answers[2],
                    3: answers[3]
                })
                
                checkpointsIDs[checkp-1] = checkpointRef.id;
            }  
			

            var huntRef = db.collection('hunts').doc();

            huntRef.set({
                name: huntName,
                players: 0,
                date: new Date(),
                checkpoints: checkpointsIDs
            });

            var huntID = huntRef.id;
            var user = auth.currentUser;

            //Add hunt to user's collection
            db.collection('managers').doc(user.uid).update({
                created_hunts: firebase.firestore.FieldValue.arrayUnion(huntID)
            }).then(() =>{
                window.location.href = "home"; 
            })
        }
		
        e.preventDefault();
    })
});

function deleteThisHunt(position){

    var user = auth.currentUser;
    db.collection("managers").doc(user.uid).get()
    .then((doc)=>{
		
		var databaseRef = firebase.database().ref();	
		databaseRef.child(doc.get('created_hunts')[position]).get().then((snapshot) => {
			if (snapshot.exists()) {
				console.log("Active users playing!");
			} else {
				console.log("Safe to delete");
				
				deleteHunt(user, doc.get('created_hunts')[position]);
		
				document.getElementById("hunts-table").deleteRow(position+1);

				var delStrings = document.getElementById('hunts-table').getElementsByClassName('clickable');
			
				if (delStrings.length === 0){
					document.querySelector('#hunts-table').style.display = "none";
					document.querySelector('#deleteAll').style.display = "none";
					document.querySelector('#noHuntsMessage').style.display = "block";
				} else {
					for (let entry = 0; entry <= delStrings.length-1; entry++){
						delStrings[entry].setAttribute('onclick', 'deleteThisHunt(' + entry + ')');
					}				
				}
			}
		}).catch((error) => {
		  console.error(error);
		});	
    });
	
	
}

function deleteAllHunts(){
    //document.getElementById('loader').style.display="block";
    //document.getElementById('main').style.display="none";

    var user = auth.currentUser;
	var position = 0;

    //Get all user's hunt ids
    db.collection("managers").doc(user.uid).get().then((doc)=>{    
        doc.get('created_hunts').forEach((id) => {
			
			var databaseRef = firebase.database().ref();	
			databaseRef.child(id).get().then((snapshot) => {
				if (snapshot.exists()) {
					console.log("Active users playing!");
				} else {
					console.log("Safe to delete");					
					deleteHunt(user, id);
					document.getElementById("hunts-table").deleteRow(position+1);
				}
				position++;
			}).catch((error) => {
			  console.error(error);
			});	
            
        });
    });  
	
	var delStrings = document.getElementById('hunts-table').getElementsByClassName('clickable');
			
	if (delStrings.length === 0){		
		document.querySelector('#hunts-table').style.display = "none";
		document.querySelector('#deleteAll').style.display = "none";
		document.querySelector('#noHuntsMessage').style.display = "block";
	}
}

function deleteHunt(user, huntID){	
	db.collection("hunts").doc(huntID).get().then((hunt)=>{
		//Get the hunt's checkpoints
		hunt.get('checkpoints').forEach((checkpoint) =>{

			//Delete hunt's checkpoints
			db.collection('checkpoints').doc(checkpoint).delete().then(() => {
				console.log("Checkpoint successfully deleted!");
			}).catch((error) => {
				console.error("Error removing document: ", error);
			});   

		});
	

		db.collection("hunts").doc(huntID).delete().then(() => {
			console.log("Hunt successfully deleted!");
		}).catch((error) => {
			console.error("Error removing document: ", error);
		}); 

		db.collection('managers').doc(user.uid).update({
			created_hunts: firebase.firestore.FieldValue.arrayRemove(huntID)
		});
		console.log("Hunt removed from list!");    
	});
}

// Initialize and add the map
function initMapCreate() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 15,
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            map.setCenter(pos);

            map.addListener("click", (mapsMouseEvent) => {
                
                if(markerExists){
                    checkpointMarker.setPosition(mapsMouseEvent.latLng);
                } else {
                    checkpointMarker = new google.maps.Marker({
                        position: mapsMouseEvent.latLng,
                        map,
                        draggable: true
                    });
                    markerExists = true;
                }

            });
        },() => {
            handleLocationError(true);
        });
    } else{
        handleLocationError(false);
    }
	
	document.getElementById('loader').style.display="none";
	document.getElementById('main').style.display="block";
}

function initMapView() {
    mapView = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 15,
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            mapView.setCenter(pos);

        },() => {
            handleLocationError(true);
        });
    } else{
        handleLocationError(false);
    }
	
	document.getElementById('loader').style.display="none";
	document.getElementById('main').style.display="block";
}

function handleLocationError(browserHasGeolocation) {
    if (browserHasGeolocation){
        console.log("Error: The Geolocation service failed.");
    } else {
        console.log("Error: Your browser doesn't support geolocation.");
    }
}


function openMap(){
	document.getElementById('map-container').style.display = "block";
	document.getElementById('messages-container').style.display = "none";

	document.getElementById('map-toggle').setAttribute('class','nav-link active');
	document.getElementById('messages-toggle').setAttribute('class','nav-link link-dark');
}

function openMessages(){
	document.getElementById('map-container').style.display = "none";
	document.getElementById('messages-container').style.display = "block";

	document.getElementById('messages-toggle').setAttribute('class','nav-link active');
	document.getElementById('map-toggle').setAttribute('class','nav-link link-dark');
}

function findActiveUsers(){
	var huntID = document.querySelector('#hunt-name').innerHTML;
	
	db.collection("hunts").doc(huntID).get().then((huntInfo) =>{
		document.getElementById('hunt-name').innerHTML= huntInfo.get('name');
	});
	document.getElementById('no-players-message').style.display = "block";
	document.getElementById('map').style.display = "none";
	document.getElementById('messages-toggle').disabled = true;
	
	var huntRef = firebase.database().ref(huntID + '/players');
	huntRef.on('value',(snapshot) => {	
		if (snapshot.val() !== null){
			document.getElementById('no-players-message').style.display = "none";
			document.getElementById('map').style.display = "block";
			document.getElementById('messages-toggle').disabled = false;
		}
	});
	
	huntRef.on('child_added', (data) => {
		console.log("huntRef() added child: " + data.key);
		console.log(data.val());
		var name = Object.values(data.val()["name"]).join('');
		console.log(data.val()["location"]);
		
		//Add user to chat
		var chatUsers = document.getElementById('chat-users');
		var newUser = document.createElement('button');
		newUser.setAttribute('type','button');
		newUser.setAttribute('class','btn btn-green mb-1 py-1 text-start w-100');	
		newUser.setAttribute('id', 'button-' + data.key);
		newUser.setAttribute('onclick', "loadMessages('" + huntID + "','" + name + "','" + data.key + "')");
		newUser.innerHTML = name;
		chatUsers.append(newUser);
		
		if (data.val()["location"] !== undefined){
			updateUserLocation(data.key, name, data.val()["location"].latitude, data.val()["location"].longitude);
			if(data.val()["HELP"] !== undefined){
				displayUserDanger(data.key, name, data.val()["location"].latitude, data.val()["location"].longitude);
			}
		}
		
	});
	
	huntRef.on('child_changed', (data) => {
		console.log("huntRef() changed: " + data.key);
		
		if(data.val()["HELP"] !== undefined){
			var coordinates = Object.values(data.val())[1];
			var name = Object.values(data.val())[2];
			displayUserDanger(data.key, name, coordinates.latitude, coordinates.longitude);
		} else {
			//Check if there is a danger alert for this user
			deleteDangerAlert(data.key);
			var coordinates = Object.values(data.val())[0];
			var name = Object.values(data.val())[1];
		}
		updateUserLocation(data.key, name, coordinates.latitude, coordinates.longitude);
		
	});
	 
	huntRef.on('child_removed',(data) => {
		console.log("huntRef() child removed: " + data.key);
		usersLocs[data.key].setMap(null);
		delete usersLocs[data.key];
	});
	
	var databaseRef = firebase.database().ref(huntID);
	databaseRef.on('child_removed', (data) => {
		console.log(data);
		if (data.key === "players"){			
			console.log("huntRef() child removed: " + data.key);
			document.getElementById('no-players-message').style.display = "block";
			document.getElementById('map').style.display = "none";
			document.getElementById('messages-toggle').disabled = true;
			document.getElementById('chat-users').innerHTML = "";
			document.getElementById('chat-container').style.display = "none";
			openMap();
		}
	});	
}

function updateUserLocation(userID, name, latitude, longitude){
	marker = usersLocs[userID];
	
	if (marker == undefined){
		console.log("add user: {lat: " + latitude + ",long: " + longitude + "}");
	
		const pos = { lat: latitude, lng: longitude }
		
		userLocation = new google.maps.Marker({
			position: pos,
			map: mapView,
			draggable: false,
			title: name
		});
	
		mapView.setCenter(pos);
		
		usersLocs[userID] = userLocation;
		addInfoWindow(userID, name);
	} else {		
		marker.setPosition({lat: latitude, lng: longitude});
	}	
}

function addInfoWindow(userID, message){
	usersLocs[userID]['infoWindow'] = new google.maps.InfoWindow({
		content: message
	});
	
	usersLocs[userID]['infoWindow'].open(mapView,usersLocs[userID]);
	
	google.maps.event.addListener(usersLocs[userID], 'click', function(){
		this['infoWindow'].open(mapView, usersLocs[userID]);
	});
}

function displayUserDanger(userID, name, latitude, longitude){
	var alertPlaceholder = document.getElementById('liveAlertPlaceholder');
	
	if(document.getElementById('location-' + userID) == null){
		var alertWrapper = document.createElement('div');
		alertWrapper.setAttribute('class','alert alert-danger alert-dismissible text-center');
		alertWrapper.setAttribute('id', userID);
		alertWrapper.setAttribute('role','alert');
		
		var alertTitle = document.createElement('div');
		alertTitle.setAttribute('class','d-flex align-items-center justify-content-center');		
		
		var iconDanger = document.createElement('i');
		iconDanger.setAttribute('class', 'bi-exclamation-triangle-fill fs-4');
		
		var userName = document.createElement('p');
		userName.setAttribute('class','m-0 ps-2');
		userName.innerHTML = name + " in danger!";
		
		var userLocation = document.createElement('p');
		userLocation.setAttribute('class','fs-6 mb-2');
		userLocation.setAttribute('id','location-' + userID);
		userLocation.innerHTML = "Location: " + latitude + ", " + longitude;	
		
		var closeBtn = document.createElement('button');
		closeBtn.setAttribute('type','button');
		closeBtn.setAttribute('class','btn-close');
		closeBtn.setAttribute('data-bs-dismiss','alert');
		closeBtn.setAttribute('aria-label','Close');
		
		alertTitle.append(iconDanger);
		alertTitle.append(userName);		
		alertWrapper.append(alertTitle);
		alertWrapper.append(userLocation);
		alertWrapper.append(closeBtn);

		alertPlaceholder.append(alertWrapper);
	} else {
		elementId = "location-" + userID;
		locationAlert = document.getElementById(elementId);
		locationAlert.innerHTML = "Location: " + latitude + ", " + longitude;
	}	
}

function deleteDangerAlert(userId){
	if(document.getElementById(userId) != null){
		document.getElementById(userId).remove();
	}
}

function loadMessages(huntID, username, userID){
	var messageList = document.getElementById('messages-list');
	messageList.innerHTML = "";
	
	messagesRef = firebase.database().ref(huntID + '/messages/' + userID);
	
	messagesRef.on('child_added', (data) => {
		var message = data.val()["text"];
		
		var messageWrapper = document.createElement('li');
		messageWrapper.setAttribute('class','mb-2 text-start');
		
		var messageText = document.createElement('p');
		messageText.setAttribute('class','message d-inline-block rounded p-2 m-0');
		messageText.innerHTML = message;
		
		var sender = document.createElement('small');
		sender.setAttribute('class','d-block text-secondary');
		sender.innerHTML = data.val()["name"];
		
		messageWrapper.append(messageText);		
		messageWrapper.append(sender);		
		messageList.append(messageWrapper);

		const scrollToBottom = (node) => {
			node.scrollTop = node.scrollHeight;
		}

		scrollToBottom(document.getElementById("messages-list"));		
		
	});
	
	document.getElementById('chat-username').innerHTML = username;
	document.getElementById('chat-container').style.display = "block";		
}

$(document).ready(function() {
    $(document).on('submit', '#message-form', function(e) {
		var messageInput = document.getElementById("chat-message-input");
		var message = messageInput.value;
		
		if(message !== ""){
			const msg = {
				name: "Admin",
				text: message
			};
			
			messagesRef.push(msg);
		}		
		
		messageInput.value = "";
		
		e.preventDefault();
	});
});

