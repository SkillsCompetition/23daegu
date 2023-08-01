<?php 
  $tab = @G["tab"] ? G["tab"] : "bus"
?>

<div class="mypage">
  <div class="label_box flex">
    <a <?= $tab == "bus" ? "class='chk'" : "" ?> href="/mypage?tab=bus">셔틀버스등록</a>
    <a <?= $tab == "chair" ? "class='chk'" : "" ?> href="/mypage?tab=chair">좌석등록</a>
    <a <?= $tab == "list" ? "class='chk'" : "" ?> href="/mypage?tab=list">좌석목록</a>
    <a <?= $tab == "reserve" ? "class='chk'" : "" ?> href="/mypage?tab=reserve">예약목록</a>
  </div>

  <?php require ROOT."/view/mypage/tour_$tab.php"; ?>
  
</div>