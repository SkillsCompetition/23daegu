<?php
  $bus = bus::findAll("user_idx = ? && (status = ? || status = ?)", [USER["idx"], "apply", "complete"]);

  $status = [
    "complete" => "승인 완료",
    "apply" => "승인 중"
  ];

  $reservation = [];

  foreach($bus as $v){
    $data = reservation::findAll("bus_idx = ? && status != ?", [$v["idx"], "reject"]);

    $reservation = array_merge($reservation, $data);
  }
?>

<div class="reserve">
  <div>
    <h3>관리자 승인</h3>
    <table>
      <tr>
        <th>차량번호</th>
        <th>출발위치</th>
        <th>배차날짜및시간</th>
        <th>승인상태</th>
      </tr>
      <?php foreach($bus as $v): ?>
      <tr>
        <td><?= $v["code"] ?></td>
        <td><?= $v["start_point"] ?></td>
        <td><?= $v["time"] ?></td>
        <td><?= $status[$v["status"]] ?></td>
      </tr>
      <?php endforeach  ?>
    </table>
  </div>

  <div>
    <h3>사용자 예약영역</h3>
    <table>
      <tr>
        <th>차량번호</th>
        <th>아이디</th>
        <th>이름</th>
        <th>구분</th>
        <th>전화번호</th>
        <th>총 결제금액</th>
        <th>비고</th>
      </tr>
      <?php foreach($reservation as $v): ?>
        <?php foreach(json_decode($v["user"]) as $i => $val): ?>  
          <?php 
            $count = count(json_decode($v["user"]));
            $bus = bus::find("idx = ?", $v["bus_idx"])  ;
            $user = user::find("userid = ?", $val);
          ?>
          <tr>
            <td><?= $bus["code"] ?></td>
            <td><?= $user["userid"] ?></td>
            <td><?= $user["name"] ?></td>
            <td><?= checkAge($user["date"]) ?></td>
            <td><?= $user["phone"] ?></td>
            <?php if($i == 0): ?>
              <td rowspan="<?= $count ?>"><?= $v["pay"] ?>원</td>
              <td rowspan="<?= $count ?>">
                <?php if($v["status"] == "wait"): ?>
                <div class="btn_box">
                  <a href="/accept/reservation/<?= $v["idx"] ?>" class="btn green">승인</a>
                  <a href="/reject/reservation/<?= $v["idx"] ?>" class="btn tomato">불가</a>
                </div>
                <?php else: ?>
                  승인
                <?php endif ?>
              </td>
            <?php endif ?>
          </tr>
        <?php endforeach ?>
      <?php endforeach ?>
    </table>
  </div>
</div>