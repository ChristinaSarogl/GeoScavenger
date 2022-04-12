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
const firebaseAuth = firebase.auth();
const fireaseFirestore = firebase.firestore();

//Create hunt variables
var createMarkerExists = false;
var checkpointMarker;
let createMarkers = [];
let questionsInfo = {};


//Listen for auth changes
firebaseAuth.onAuthStateChanged(user => {
    if (user){
        loadInfo(user);     
    } else {
		var path = window.location.pathname;
        var page = path.split("/").pop();
		if(page !== "login" && page !== "register" && page !== "reset-password"){
			window.location.href = "/~1801448/geoscavenger/public/login";
		}			
        console.log("User logged out");
    }
})

function logoutUser(){
    firebaseAuth.signOut();
}

//Load administrators info
function loadInfo(user){
    var storage = firebase.storage();

    fireaseFirestore.collection("managers").doc(user.uid).get().then((doc) => {
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

        //Get screen path name
        var path = window.location.pathname;
        var page = path.split("/").pop();

		document.getElementById('username').innerHTML = user.displayName;
		
        if(page === "home"){
            loadHunts(user);
        } else if (page === "create"){
			var pathReference = storage.ref('default_images/plus.png');
            pathReference.getDownloadURL().then((url) => {
                document.getElementById('add-checkpoint').setAttribute('src', url);
            });
        } else {
			initMapView();
			findActiveUsers();
		}
        
    });
}

//Load administrators hunts
function loadHunts(user){
    fireaseFirestore.collection("managers").doc(user.uid).get().then((doc)=>{
        if (doc.get('created_hunts').length !== 0){
            document.querySelector('#noHuntsMessage').style.display = "none";
            var i = 0;
			
            //Display all hunts that the user has created
            doc.get('created_hunts').forEach((doc) => {
                fireaseFirestore.collection("hunts").doc(doc).get().then((huntInfo) =>{
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

        document.getElementById('loader').style.display="none";
        document.getElementById('main').style.display="block";

    });

}


//------ CREATE HUNT ------

// Initialize and add the map for create hunt page
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
                
                if(createMarkerExists){
                    checkpointMarker.setPosition(mapsMouseEvent.latLng);
                } else {
                    checkpointMarker = new google.maps.Marker({
                        position: mapsMouseEvent.latLng,
                        map,
                        draggable: true
                    });
                    createMarkerExists = true;
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

function handleLocationError(browserHasGeolocation) {
    if (browserHasGeolocation){
        console.log("Error: The Geolocation service failed.");
    } else {
        console.log("Error: Your browser doesn't support geolocation.");
    }
}

function saveCoordinates(){
	var storage = firebase.storage();
    
	var coordinates = checkpointMarker.getPosition();
    var lat = coordinates.lat();
    var lng = coordinates.lng();
	
	var savedCheckpoints = document.getElementById("checkpoint-list").getElementsByTagName("li").length;
	
	if(savedCheckpoints >= 7){
        document.getElementById('error-message').innerHTML="You can't have more than 7 checkpoints";
    } else {
		var checkpointNumber = savedCheckpoints + 1;
		//Add checkpoint to checkpoint list
        var checkpoint = document.createElement('li');
        checkpoint.setAttribute('id','check' + checkpointNumber);
        checkpoint.setAttribute('class',
            'list-group-item d-flex align-items-center justify-content-between p-2');

        var div = document.createElement('div');        

        var title = document.createElement('p');
        title.innerHTML = "Checkpoint " + checkpointNumber;
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
        deleteIcon.setAttribute('id','delete' + checkpointNumber);
        deleteIcon.setAttribute('onclick','deleteCheckpoint("'+ checkpointNumber + '")');

        div.append(title);
        div.append(coordinates);
        checkpoint.append(div);
        checkpoint.append(deleteIcon);
        $('#checkpoint-list').append(checkpoint);
		
		//Add checkpoint to challenge list
        var challenge = document.createElement('li');
        challenge.setAttribute('class','list-group-item');
        var title = document.createElement('p');
        title.innerHTML = "Checkpoint " + checkpointNumber;
        title.setAttribute('class','small-title clickable');
        title.setAttribute('onclick', "resetForm("+ checkpointNumber + ")");
        challenge.append(title);
        challenge.setAttribute('id','chal' + checkpointNumber);
        $('#challenge-list').append(challenge);
		
		//Add checkpoint to checkopoint selection
        var selection = document.createElement('option');
        selection.innerHTML = "Checkpoint " + checkpointNumber;
        selection.setAttribute('id','sel' + checkpointNumber);
        $('#challenge-checkpoint').append(selection);
		
		createMarkers.push(checkpointMarker);
        checkpointMarker.setLabel(checkpointNumber.toString());
        createMarkerExists = false;
	}
}

function deleteCheckpoint(checkpointNumber){
	var listIndex = checkpointNumber - 1;
	
	//Remove element from checkpoint list
    var checkEl = document.getElementById('check' + checkpointNumber);
    checkEl.remove();

    //Remove element from challenge list
    var chalEl = document.getElementById('chal' + checkpointNumber);
    chalEl.remove();

    //Remove element from selection list
    var selEl = document.getElementById('sel' + checkpointNumber);
    selEl.remove();
	
	//Remove marker
	var removedMarker = createMarkers.splice(listIndex,1);
	removedMarker[0].setMap(null);
	for (var marker = 0; marker < createMarkers.length; marker++){
		createMarkers[marker].setLabel((marker+1).toString());
	}
	
	const checkpointItems = document.getElementById('checkpoint-list').getElementsByTagName('li');
    const challengeItems = document.getElementById('challenge-list').getElementsByTagName('li');
	
	for (let item = 0; item <= checkpointItems.length - 1; item++) {
		var newNumber = item + 1;
        //Change challenge list
        var challenge = challengeItems[item].getElementsByClassName('small-title');
        for(let i = 0; i <= challenge.length-1; i++){
            challenge[i].innerHTML = "Checkpoint " + newNumber;
            challenge[i].setAttribute('onclick', "resetForm(" + newNumber + ")");
        }
        challengeItems[item].setAttribute('id','chal' + newNumber);
		
		//Change checkpoint list
        checkpointItems[item].setAttribute('id','check' + newNumber);

        var title = checkpointItems[item].getElementsByClassName('small-title');
        for(let i = 0; i <= title.length-1; i++){
            title[i].innerHTML = "Checkpoint " + newNumber;
        }

        var image = checkpointItems[item].getElementsByClassName('small-image');
        for(let i = 0; i <= image.length-1; i++){
            image[i].setAttribute('id','delete' + newNumber);
            image[i].setAttribute('onclick','deleteCheckpoint("'+ newNumber + '")');
        }
	}
	
	const selectionItems = document.getElementById('challenge-checkpoint').getElementsByTagName('option');

    //Change selection list
    for(let sel = 0; sel <= selectionItems.length-1; sel++){
        if (sel !== 0){
            selectionItems[sel].setAttribute('id','sel'+ sel);
            selectionItems[sel].innerHTML = "Checkpoint " + sel;
        }
    } 
	
	//Check if any questions are saved and delete them	
	if (Object.keys(questionsInfo).length !== 0){
		var index = parseInt(checkpointNumber);
		delete questionsInfo['Checkpoint '+ index];    
		let newOrder = {};
		for (const checkpoint in questionsInfo) {
			var checkpointKey = checkpoint.split(" ");
			var newNumber = parseInt(checkpointKey[1]);
			if(newNumber > checkpointNumber){
				newNumber--;
				newOrder['Checkpoint ' + newNumber] = questionsInfo[checkpoint];
			} else {
				newOrder[checkpoint] = questionsInfo[checkpoint];
			}
		}
		questionsInfo = newOrder;
	}
	console.log(questionsInfo);
}

//Save checkpoint's question
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
        } else {
            questionsInfo[checkpoint] = checkpointQuestionInfo;
        }
		
        document.getElementById('chal' + index).style.backgroundColor = "#5BA6A2";
        var p = document.getElementById('chal' + index).getElementsByTagName('p');
        for (let i = 0; i <= p.length-1; i++){
            p[i].style.color = 'white';
        }
		
        questionForm.reset();

        e.preventDefault();
    });
});

//Clear form of load saved information
function resetForm(checkpointNumber){
    const questionForm = document.querySelector('#question-form');
    
    if (Object.keys(questionsInfo).length !== 0){
        var qDetails = questionsInfo['Checkpoint ' + checkpointNumber];
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

    document.querySelector('#challenge-checkpoint').options.item(checkpointNumber).selected = "selected";
}

//Save hunt
$(document).ready(function() {
    $(document).on('submit', '#create-form', function(e) {
        const createForm = document.querySelector('#create-form');
        const checkpointsIDs = [];

        var name = createForm['hunt-name'].value;
        var huntName = name;
        
        var checkpoints = document.getElementById('checkpoint-list').getElementsByTagName('li');
		
        if (checkpoints.length < 3){
			document.getElementById('create-error-message').style.display = "block";
            document.getElementById('create-error-message').innerHTML="You have to add at least 3 checkpoints to the hunt!";
			window.scrollTo(0, 0);
        } else if(checkpoints.length !== Object.keys(questionsInfo).length){
			document.getElementById('create-error-message').style.display = "block";
            document.getElementById('create-error-message').innerHTML="You have to enter a question for each checkpoint!";
			window.scrollTo(0, 0);
			console.log(questionsInfo);
			console.log(checkpoints.length);
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
                var checkCoord = document.querySelector('#check' + checkp).getElementsByTagName('p')[1].textContent;
                const coordinatesArray = checkCoord.split(", ");
                var lat = parseFloat(coordinatesArray[0]);
                var lng = parseFloat(coordinatesArray[1]);
				
				//Save checkpoint information
                var checkpointRef = fireaseFirestore.collection('checkpoints').doc();
                
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
			
			var huntRef = fireaseFirestore.collection('hunts').doc();

            huntRef.set({
                name: huntName,
                players: 0,
                date: new Date(),
                checkpoints: checkpointsIDs
            });

            var huntID = huntRef.id;
            var user = firebaseAuth.currentUser;

            //Add hunt to user's collection
            fireaseFirestore.collection('managers').doc(user.uid).update({
                created_hunts: firebase.firestore.FieldValue.arrayUnion(huntID)
            }).then(() =>{
                window.location.href = "home"; 
            });
        }
		
        e.preventDefault();
    })
});

//------ HUNT INFO ------