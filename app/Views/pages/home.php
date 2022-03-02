        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="h2">Dashboard</h1>
          </div>
          
          <div class="card">
            <div class="card-body text-center">
              <p class="fs-4 mb-2 title">All Hunts</p>
              <hr>
              <p id="noHuntsMessage">You haven't created any hunts yet.</p>

              <div class="table-responsive">
                <table id="hunts-table" class="table table-striped table-sm">
                  <thead>
                    <tr>
                      <th>Hunt Name</th>
                      <th>Date</th>
                      <th>Players Entered</th>
                      <th></th>  
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1,001</td>
                      <td>random</td>
                      <td>data</td>
                      <td>placeholder</td>
                    </tr>
                    <tr>
                      <td>1,002</td>
                      <td>placeholder</td>
                      <td>irrelevant</td>
                      <td>visual</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <button id="deleteAll" class="btn btn-red">Delete all hunts</button>
              
            </div>

          </div>

        </main>