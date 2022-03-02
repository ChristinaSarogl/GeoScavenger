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
        loadPicture(user);        
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