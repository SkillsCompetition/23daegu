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

<div class="chair">
  <div class="bottom">
    <h3>예약 불가 좌석 (클릭)</h3>
    <div class="box">
      <?php foreach($vehicle[$bus["vehicle"]] as $v): ?>
        <div <?= in_array($v, $chairs) ? "" : "class='chk'" ?> onclick="changeChk(this)"><?= $v ?></div>
      <?php endforeach ?>
    </div>
  </div>
</div>

<script>

  function changeChk(target){
    const hasClass = $(target).hasClass("chk")

    if(hasClass) $(target).removeClass("chk");
    else $(target).addClass("chk");

    const arr = $(".chair .box div:not(.chk)").toArray().map(v => $(v).text());

    $.post(`/chair/<?= $bus["idx"] ?>`, { chair : JSON.stringify(arr) });
  }

</script>