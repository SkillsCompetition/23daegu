<?php
  $bus = bus::findAll("time IS NULL && status = ?", "apply");
?>

<div class="admin">
  <h3>승인 요청 목록</h3>
  <table>
    <tr>
      <th>차량종류</th>
      <th>투어코스</th>
      <th>차량대표사진</th>
      <th>출발위치</th>
      <th>차량번호</th>
      <th>배차날짜및시간</th>
    </tr>
    <?php foreach($bus as $v): ?>
      <tr>
        <td><?= $v["vehicle"] ?></td>
        <td><?= $v["start_point"]." -> ".$v["way_point"]." -> ".$v["end_point"] ?></td>
        <td><img src="<?= $v["image"] ?>" alt=""></td>
        <td><?= $v["start_point"] ?></td>
        <td><?= $v["code"] ?></td>
        <td>
          <form action="/admin/<?= $v["idx"] ?>" method="POST" class="btn_box jcc">
            <div class="input_box">
              <input type="datetime-local" name="time" min="<?= date("Y-m-d 00:00:00") ?>" id="time" onchange="dateChk()">
              <input type="text" name="status" value="complete" hidden>
            </div>
            <button class="btn">승인</button>
          </form>
        </td>
      </tr>
    <?php endforeach ?>
  </table>
</div>

<script>

  function dateChk(){
    const [date, time] = $("#time").val().split("T");
    const getDate = new Date(date);

    if("10:00" > time || "17:00" < time){
      alert("시간은 10:00 ~ 17:00 만 선택 가능합니다.");
      $("#time").val("")
    }

    if([1,3,5].includes(getDate.getDay()) || (2 > getDate.getMonth() || 10 < getDate.getMonth())){
      alert("날짜는 3월 ~ 11월 중 화, 목, 토, 일만 선택 가능합니다.");
      $("#time").val("")
    }
  }

</script>