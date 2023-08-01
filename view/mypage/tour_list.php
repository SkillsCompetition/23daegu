<?php
  $vehicle = [
    "승용차" => ["A01","A02","A03"],
    "SUV" => ["B01","B02","B03","B04","B05"],
    "승합차" => ["C01","C02","C03","C04","C05","C06","C07","C08","C09"],
    "버스" => ["D01","D02","D03","D04","D05","D06","D07","D08","D09","D10","D11","D12"]
  ];

  $bus = bus::find("user_idx = ? && status = ?", [USER["idx"], "wait"]);
  $chairs = json_decode($bus["chair"]);
  
  err(!$bus, "먼저 셔틀버스를 등록해주세요.", "/mypage");
?>

<div class="list">
  <div class="top flex">
    <img src="<?= $bus["image"]  ?>" alt="">
    <div class="bus">
      <table>
        <tr>
          <td>차량종류</td>
          <td><?= $bus["vehicle"] ?></td>
        </tr>
        <tr>
          <td>차량번호</td>
          <td><?= $bus["code"] ?></td>
        </tr>
        <tr>
          <td>출발위치</td>
          <td><?= $bus["start_point"] ?></td>
        </tr>
        <tr>
          <td>투어코스</td>
          <td><?= $bus["start_point"]." -> ".$bus["way_point"]." -> ".$bus["end_point"] ?></td>
        </tr>
      </table>
    </div>
  </div>

  <div class="bottom">
    <h3>예약 가능/불가 좌석</h3>
    <div class="box">
      <?php foreach($vehicle[$bus["vehicle"]] as $v): ?>
        <div <?= in_array($v, $chairs) ? "class='green'" : "class='chk'" ?>><?= $v ?></div>
      <?php endforeach ?>
    </div>
  </div>

  <a href="/list/<?= $bus["idx"] ?>" class="btn">배차승인요청</a>
</div>