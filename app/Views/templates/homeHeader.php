<!doctype html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css"> 
    
    <link rel="stylesheet" href="<?php echo base_url('css/main.css'); ?>">
	
	<!-- Firebase JS -->
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"></script>

    <title>GeoHunt</title>
  </head>

  <body>
    <header class="navbar navbar-dark sticky-top flex-md-nowrap p-0">
        <span class="navbar-brand title col-md-3 col-lg-2 me-0 px-3 disabled">GeoHunt</span>
        <button class="navbar-toggler d-md-none collapsed me-3" type="button" data-bs-toggle="collapse" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
    </header>
      
    <div class="container-fluid">
      <div class="row">
        <nav id="sidebarMenu" class="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
          <div class="position-sticky pt-3">
            <ul class="nav flex-column">
              <li>
                <a class="d-flex align-items-center disabled ps-2 mt-3 mb-5">
                  <img class="rounded-circle" id="profile-image" src="avatar_icon.png"
                      width="50" height="50" alt="Profile picture">
                  <span class="fs-5 ms-2 text-dark" id="username">Username</span>
              </a>
              </li>
              <li class="nav-item">
                <a class="nav-link active" href="">
                  <i class="fs-4 bi-speedometer2"></i> <span>Dashboard</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link link-dark" href="">
                  <i class="fs-4 bi-pin-map"></i> <span>Create hunt</span>
                </a>
              </li>
            </ul>
            <hr>
            <a class="nav-link link-danger" href="">
              <i class="fs-4 bi-box-arrow-right"></i> <span>Logout</span>
            </a>
          </div>
        </nav>