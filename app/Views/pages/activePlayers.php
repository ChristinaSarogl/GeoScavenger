              <li class="nav-item">
                <a class="nav-link link-dark" href="<?php echo base_url(); ?>/home">
                  <i class="fs-4 bi-speedometer2"></i> <span>Dashboard</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link link-dark" href="<?php echo base_url(); ?>/create">
                  <i class="fs-4 bi-pin-map"></i> <span>Create hunt</span>
                </a>
              </li>
            </ul>
            <hr>
            <a class="nav-link link-danger" href="#" onclick="logoutUser()">
              <i class="fs-4 bi-box-arrow-right"></i> <span>Logout</span>
            </a>
          </div>
        </nav>

        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2" id="hunt-name"><?= esc($huntId) ?></h1>
          </div>
          
          <div class="card">
            <div class="card-body text-center">
              <p id="no-players-message">There are no active players at right now.</p>

              <div class="bg-success" id="map"  style="height: 500px;"></div>
            </div>

          </div>

        </main>