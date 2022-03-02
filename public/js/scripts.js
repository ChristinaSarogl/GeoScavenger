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

//Listen for auth changes
auth.onAuthStateChanged(user => {
    if (user){
        loadInfo(user);        
    } else {
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
        } else {
            document.getElementById('username').innerHTML = user.displayName;
			var pathReference = storage.ref('default_images/plus.png');
            pathReference.getDownloadURL().then((url) => {
                document.getElementById('add-checkpoint').setAttribute('src', url);
            });
            // document.getElementById('loader').style.display="none";
            // document.getElementById('main').style.display="block";
            initMap();
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

                    var date = document.createElement('td');
                    date.innerHTML = huntInfo.get('date').toDate().toLocaleString('en-US',{
                        day: 'numeric', year: 'numeric', month: 'long'});

                    var players = document.createElement('td');
                    players.innerHTML = huntInfo.get('players');

                    var del = document.createElement('td');
                    var string = document.createElement('p');
                    string.innerHTML = "Delete hunt";
                    del.append(string);
                    del.setAttribute('class','clickable-p');
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
    // var coordinates = checkpointMarker.getPosition();
    // var lat = coordinates.lat();
    // var long = coordinates.lng();

    var lat = Math.random() * 90;
    var long = Math.random() * 180;

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
        coordinates.innerHTML = lat.toFixed(6) + ', ' + long.toFixed(6);

        var deleteIcon = document.createElement('img');
		var pathReference = storage.ref('default_images/bin.png');
            pathReference.getDownloadURL().then((url) => {
                deleteIcon.setAttribute('src',url);
            });
        deleteIcon.setAttribute('class', 'small-image');
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
        title.setAttribute('class','small-title clickable-p');
        title.setAttribute('onclick', "resetForm("+ lenght + ")");
        challenge.append(title);
        challenge.setAttribute('id','chal' + lenght);
        $('#challenge-list').append(challenge);

        //Add checkpoint to checkopoint selection
        var selection = document.createElement('option');
        selection.innerHTML = "Checkpoint " + (lenght+1);
        selection.setAttribute('id','sel' + lenght);
        $('#challenge-checkpoint').append(selection);

        // checkpointMarker.setLabel((lenght+1).toString());
        // markerExists = false;
    }    
}