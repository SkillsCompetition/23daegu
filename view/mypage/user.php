<div class="user">
  <table>
    <tr>
      <th>차량종류</th>
      <th>차량번호</th>
      <th>차량대표사진</th>
      <th>출발위치</th>
      <th>출발시간</th>
      <th>투어코스</th>
      <th>예약좌석</th>
      <th>예약상태</th>
    </tr>
    <?php foreach(reservation::findAll("reservation_userid = ?", USER["userid"]) as $v): ?>
    <?php
      $status = [
        "wait" => "승인대기",
        "accept" => "승인",
        "reject" => "불가"
      ];

      $bus = bus::find("idx = ?", $v["bus_idx"]);
      $chair = bus_chair::findAll("reservation_idx = ?", $v["idx"]);
    ?>
    <tr>
      <td><?= $bus["idx"] ?></td>
      <td><?= $bus["code"] ?></td>
      <td><img src="<?= $bus["image"] ?>" alt=""></td>
      <td><?= $v["bus_start"] ?></td>
      <td><?= $v["time"] ?></td>
      <td><?= $bus["start_point"]." -> ".$bus["way_point"]." -> ".$bus["end_point"] ?></td>
      <td><?= implode(",", array_column($chair, "chair_code")) ?></td>
      <td><?= $status[$v["status"]] ?></td>
    </tr>
    <?php endforeach ?>
  </table>
</div>