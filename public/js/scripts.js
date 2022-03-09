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

//Listen for auth changes
auth.onAuthStateChanged(user => {
    if (user){
        loadInfo(user);        
    } else {
		var path = window.location.pathname;
        var page = path.split("/").pop();
		if(page !== "login"){
			window.location.href = "login";
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
    window.location.href = "login";
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
            // document.getElementById('loader').style.display="none";
            // document.getElementById('main').style.display="block";
            initMapCreate();
        } else {
			document.getElementById('username').innerHTML = user.displayName;	
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
					row.setAttribute('onclick',"window.location='active/" + huntInfo.id + "'");

                    var name = document.createElement('td');
                    name.innerHTML = huntInfo.get('name');

                    var date = document.createElement('td');
                    date.innerHTML = huntInfo.get('date').toDate().toLocaleString('en-US',{
                        day: 'numeric', year: 'numeric', month: 'long'});

                    var players = document.createElement('td');
                    players.innerHTML = huntInfo.get('players');

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
        // document.getElementById('loader').style.display="none";
        // document.getElementById('main').style.display="block";

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
        
        var question = questionForm['challenge-question'].value;
        checkpointQuestionInfo.question = question;

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
        document.getElementById('chal' + (index-1)).style.color = "white";
        var string = document.getElementById('chal' + (index-1)).value;
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
            document.getElementById('error-message').innerHTML="You have to add at least 3 checkpoints to the hunt!";
        } else if(checkpoints.length !== submittedQuestions){
            document.getElementById('error-message').innerHTML="You have to enter a question for each checkpoint!";
        } else{
            // document.getElementById('loader').style.display="block";
            // document.getElementById('main').style.display="none";

            for (let checkp = 1; checkp <= checkpoints.length; checkp ++){

                //Save all the questions details
                var questionDetails  = questionsInfo['Checkpoint '+ checkp];
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
        deleteHunt(user, doc.get('created_hunts')[position]);
    });
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

function deleteAllHunts(){
    //document.getElementById('loader').style.display="block";
    //document.getElementById('main').style.display="none";

    var user = auth.currentUser;

    //Get all user's hunt ids
    db.collection("managers").doc(user.uid).get().then((doc)=>{    
        doc.get('created_hunts').forEach((id) => {
            deleteHunt(user, id);
        });
        
        //document.getElementById('loader').style.display="none";
        //document.getElementById('main').style.display="block";
    });  
    
    document.querySelector('#hunts-table').style.display = "none";
    document.querySelector('#deleteAll').style.display = "none";
    document.querySelector('#noHuntsMessage').style.display = "block";
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
}

function handleLocationError(browserHasGeolocation) {
    if (browserHasGeolocation){
        console.log("Error: The Geolocation service failed.");
    } else {
        console.log("Error: Your browser doesn't support geolocation.");
    }
}

function findActiveUsers(){
	var huntID = document.querySelector('#hunt-name').innerHTML;
	
	db.collection("hunts").doc(huntID).get().then((huntInfo) =>{
		document.getElementById('hunt-name').innerHTML= huntInfo.get('name');
	});
	document.getElementById('no-players-message').style.display = "block";
	document.getElementById('map').style.display = "none";
	initMapView();
	
	var huntRef = firebase.database().ref(huntID);
	huntRef.on('value',(snapshot) => {
		console.log("huntRef() snapshot: " + snapshot.val());
		console.log(snapshot.val());
		
		if (snapshot.val() !== null){
			document.getElementById('no-players-message').style.display = "none";
			document.getElementById('map').style.display = "block";
		}
	});
	
	huntRef.on('child_added', (data) => {
		console.log("huntRef() added child: " + data.key);
		var coordinates = Object.values(data.val())[0];
		console.log(coordinates);
		addActiveUser(coordinates.latitude, coordinates.longitude);
	});
	
	huntRef.on('child_changed', (data) => {
		console.log("huntRef() child changed: " + data.key);
		console.log(data.val());
	});
	
	var databaseRef = firebase.database().ref();
	databaseRef.on('child_removed', (data) => {
		if (data.key === huntID){			
			console.log("huntRef() child removed: " + data.key);
			document.getElementById('no-players-message').style.display = "block";
			document.getElementById('map').style.display = "none";
		}
	});	
}

function addActiveUser(latitude, longitude){
	console.log("add user: {lat: " + latitude + ",long: " + longitude);
	
	const pos = { lat: latitude, lng: longitude }
	
	checkpointMarker = new google.maps.Marker({
		position: pos,
		mapView,
		draggable: false
	});
	
	//mapView.setCenter(pos);
	
}


	