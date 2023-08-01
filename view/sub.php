<?php
  $time = [
    "천안역-유관순사적지" => 20,
    "천안역-독립기념관" => 40,
    "유관순사적지-독립기념관" => 30,
    "유관순사적지-천안역" => 20,
    "독립기념관-천안역" => 40,
    "독립기념관-유관순사적지" => 30
  ];
  $location = [["start_point", "way_point"],["way_point", "end_point"],["end_point", "start_point"]];
  $list = [
    "천안역" => [],
    "유관순사적지" => [],
    "독립기념관" => []
  ];
  $bus = bus::findAll("status = ? ORDER BY time", "complete");

  foreach($bus as &$v){
    $min = 0;
    foreach($location as $point){

      $start = $v[$point[0]];
      $end = $v[$point[1]];

      $date = date("Y-m-d H:i", strtotime($v["time"]." +$min minutes"));
      if($date > date("Y-m-d H:i")){
        $list[$start][] = array_merge($v, [
          "bus_start" => $start,
          "bus_end" => $end,
          "bus_time" => $date
        ]);
      }
      
      $min += $time["$start-$end"];
    }
  }

  foreach($list as &$v){
    usort($v, function($a, $b){
      if($a["bus_time"] > $b["bus_time"]) return 1; 
      if($b["bus_time"] > $a["bus_time"]) return -1;
      return 0;
    });
  }

 $list = array_merge(...array_values($list));
?>
  <!-- 콘텐츠 박스 -->
  <div class="content">

    <div class="bus_section">
      <div class="wrap">
        <div class="title">
          <h1>셔틀버스투어</h1>
          <div class="line"></div>
          <p>셔틀버스투어를 소개합니다</p>
        </div>

        <div class="bus">

          <div class="top">
            <img src="resources/img/attraction/독립기념관석상.jpg" alt="#" title="#">
            <div class="text_box">
              <p>천안 시티투어는 천안의 다양한 관광지와 유적지, 문화재 등을 보다 편안하고 알차게 둘러 볼수 있도록 한 순환관광을 말하며, 천안시에서 직접 운영하고 있습니다.
                독립기념관, 유관순열사사적지 등 정규 코스와 빵카달달코스(빵&카페투어), 품격있는 공연 관람코스(한시)로 운영하여 참여자의 선택의 폭을 넒혀 오감이 즐거운 천안여행을 하실 수 있습니다.</p>
            </div>
          </div>

          <div class="bottom">
            <table>
              <tr>
                <td>운행기간</td>
                <td>2023년 3월 ~ 11월(9개월)</td>
              </tr>
              <tr>
                <td>운 행 일</td>
                <td>주 4회(화, 목, 토, 일)</td>
              </tr>
              <tr>
                <td>운행시간</td>
                <td>10:00 ~ 17:00</td>
              </tr>
              <tr>
                <td>이용요금</td>
                <td>어린이 및 경로우대: 2,000원 <br>
                  청소년: 3,000원 <br>
                  어른: 4,000원</td>
              </tr>
            </table>

            <div class="text_box">
              <h3>이용문의</h3>
              <p>천안시 관광안내소 041-521-2038 <br>
                천안종합터미널 관광안내소 041-569-0041<br>
                천안아산공동 관광홍보관 041-521-2050<br>
                천안시청 관광과 041-521-5169</p>
            </div>
          </div>

        </div>
      </div>
    </div>

    <div class="reservation_section">
      <div class="wrap">
        <div class="title">
          <h1>셔틀버스투어예약</h1>
          <div class="line"></div>
          <p>서틑 버스 투어를 예약해보세요</p>
        </div>

        <div class="reservation">
          <table>
            <tr>
              <th>차량종류</th>
              <th>차량번호</th>
              <th>차량대표사진</th>
              <th>날짜및시간</th>
              <th>투어코스</th>
              <th>좌석</th>
            </tr>

            <?php foreach($list as $v): ?>
              <tr>
                <td><?= $v["vehicle"] ?></td>
                <td><?= $v["code"] ?></td>
                <td><img src="<?= $v["image"] ?>" alt=""></td>
                <td><?= $v["bus_time"] ?></td>
                <td>출발 위치 : <?= $v["bus_start"] ?> <br> 
                  투어 코스 ( <?= $v["start_point"]." -> ".$v["way_point"]." -> ".$v["end_point"] ?> )
                </td>
                <td>
                  <div class="btn_box jcc">
                    <div class="btn" onclick="openChairList('<?= $v['idx'] ?>', '<?= $v['bus_time'] ?>', '<?= $v['bus_start'] ?>')">좌석</div>
                  </div>
                </td>
              </tr>
            <?php endforeach?>
          </table>
        </div>
      </div>
    </div>
  </div>

  <template>

    <div class="chair_modal">
      <form action="/buy" method="POST">
        <input type="text" name="bus_idx" id="bus_idx" hidden>
        <input type="text" name="bus_time" id="time" hidden>
        <input type="text" name="buy_list" id="buy_list" hidden>
        <input type="text" name="bus_start" id="bus_start" hidden>

        <div class="main">
          <h3>예약 좌석 선택</h3>
          <hr>
          <div class="container">
            <div class="item flex aic jcsb">
              <h4>A01</h4>
  
              <div class="btn" onclick="chkChair('A01')">좌석선택 확인</div>
            </div>
          </div>
        </div>
        <div class="btn_box">
          <button class="btn">예약</button>
          <div class="btn" onclick="Modal.close()">닫기</div>
        </div>
      </form>
    </div>

  </template>

  <script>

    const chairs = {
      "승용차" : ["A01","A02","A03"],
      "SUV" : ["B01","B02","B03","B04","B05"],
      "승합차" : ["C01","C02","C03","C04","C05","C06","C07","C08","C09"],
      "버스" : ["D01","D02","D03","D04","D05","D06","D07","D08","D09","D10","D11","D12"]
    }
    const bus = <?= json_encode($bus); ?>;

    let reserve_chair = [];

    function openChairList(idx, time, start){
      Modal.open("chair");

      $(".modal #time").val(time);
      $(".modal #bus_idx").val(idx)
      $(".modal #bus_start").val(start)

      reserve_chair = [];

      const data = bus.find(v => v.idx == idx);
      const chair = chairs[data.vehicle];
      $(".chair_modal .container").html(chair.map(v => {
        return `
          <div class="item flex aic jcsb">
            <h4>${v}</h4>

            ${
              data.chair.includes(v)
              ? `<div class="btn" onclick="chkChair(${idx}, '${v}', this)">좌석선택 확인</div>`
              : "<p style='color: tomato;'>예약불가</p>"
            }
          </div>
        `
      }))
    }

    function chkChair(idx, chair_code, target){
      $.get(`/chk/chair/${idx}/${chair_code}`)
        .done(res => {
          const parent = $(target).parent();
          $(target).remove();

          if(!res) {
            parent.append(`<p style='color: green;'>예약가능</p>`);

            reserve_chair.push(chair_code);
          }else{
            parent.append(`<p style='color: tomato;'>예약불가</p>`);
          };
        })
    }

    $(document)
      .on("submit", ".chair_modal form", function(e){
        e.preventDefault();

        if(reserve_chair.length == 0) return alert("좌석을 선택해주세요.");

        $("#buy_list").val(JSON.stringify(reserve_chair));
        e.target.submit();
      })

  </script>