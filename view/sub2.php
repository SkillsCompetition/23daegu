  <div class="header_emp"></div>

  <!-- 콘텐츠 박스 -->

  <div class="content">

    <div class="mapCon_section">
      <div class="wrap">
        <div class="title">
          <h1>지도</h1>
          <div class="line"></div>
          <p>명소의 위치를 상세히 알아보세요</p>
        </div>

        <div class="mapCon flex">
          <div class="maps">
            <div>
              <canvas width="2800" height="2800" id="main_map"></canvas>
            </div>
            <canvas width="2800" height="2800" id="load_map" hidden></canvas>
          </div>

          <div class="list col-flex">
            <div class="btn_box full">
              <div data-zoom="0" class="mapZoom btn chk">5km</div>
              <div data-zoom="1" class="mapZoom btn">3km</div>
              <div data-zoom="2" class="mapZoom btn">500m</div>
            </div>

            <hr>

            <div class="util full">
              <div class="btn toggleIsView" onclick="Map.list.viewAdded(true)">추가된 명소만 보기</div>
              <div class="btn toggleIsView" style="display: none;" onclick="Map.list.viewAdded(false)">모든 명소 보기</div>
              <div class="btn" onclick="Map.list.moveUserPos()">현 위치</div>
              <div class="btn" onclick="Map.point.start()">거리재기</div>
              <div class="btn" onclick="Map.download()">다운로드</div>
            </div>

            <div class="btn" onclick="Favorite.open()">즐겨찾기</div>

            <table>
              <thead>
                <tr>
                  <th>이름</th>
                  <th>별점</th>
                  <th>방문자</th>
                  <th>비고</th>
                </tr>
              </thead>
              <tbody>

              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

  </div>

  <canvas id="download" width="700" height="700" hidden></canvas>

  <template>

    <div class="favorite_modal">
      <div class="flex jcsb aic">
        <h3>즐겨찾기</h3>
        <div class="btn tomato" onclick="Modal.close()">닫기</div>
      </div>

      <hr>

      <div class="inputs favorite">

        <div class="label_box flex">

        </div>

        <div class="flex jcc aic">
          <canvas id="favorite" height="700" width="800"></canvas>
        </div>

        <div class="vertex flex">
          
        </div>

      </div>
    </div>

  </template>