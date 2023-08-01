<?php
  $pay = [
    "어린이" => 5000,
    "청소년" => 7000,
    "성인" => 8000,
    "경로우대" => 4000
  ];

  $bus = bus::find("idx = ?", P["bus_idx"]);

  err(P["bus_time"] <= date("Y-m-d H:i", strtotime("+10 minutes")), "출발 10분 전부터 예약이 불가능합니다.");
?>

<div class="content">

  <div class="buy_section">
    <div class="wrap">
      <div class="title">
        <h1>결제페이지</h1>
        <div class="line"></div>
        <p>결제를 진행하여 예약을 완료해보세요</p>
      </div>

      <div class="buy col-flex">
        <table>
          <tr>
            <th>차량종류</th>
            <th>차량번호</th>
            <th>차량대표사진</th>
            <th>출발위치</th>
            <th>투어코스</th>
            <th>좌석</th>
            <th>구분</th>
            <th>결제금액</th>
          </tr>
          <?php foreach(json_decode(P["buy_list"]) as $i => $v): ?>
          <tr>
            <td><?= $bus["vehicle"] ?></td>
            <td><?= $bus["code"] ?></td>
            <td><img src="<?= $bus["image"] ?>" alt=""></td>
            <td><?= P["bus_start"] ?></td>
            <td><?= $bus["start_point"]." -> ".$bus["way_point"]." -> ".$bus["end_point"] ?></td>
            <td><?= $v ?></td>
            <?php if($i == 0): ?>
              <td><?= USER["userid"] ?>(<?= checkAge(USER["date"]) ?>)</td>
              <td><?= number_format($pay[checkAge(USER["date"])]) ?>원</td>
            <?php else: ?>
              <td>
                <div class="btn_box jcc">
                  <div class="input_box">
                    <input type="text" placeholder="유저 아이디 입력">
                  </div>

                  <div class="btn" onclick="chkUser(this)">확인</div>
                </div>
              </td>
              <td>0원</td>
            <?php endif ?>
          </tr>
          <?php endforeach ?>
        </table>

        <div class="btn_box jcsb">
          <h3 id="pay_all">총액 : 7000원</h3>
          <div class="btn" onclick="submitBuy(<?= $bus['idx'] ?>);">결제</div>
        </div>
      </div>
    </div>
  </div>

</div>

<script>

  const user = [ '<?= USER["userid"] ?>' ]

  let pay_all = <?= $pay[checkAge(USER["date"])] ?>;

  const age = {
    "어린이" : 5000,
    "청소년" : 7000,
    "성인" : 8000,
    "경로우대" : 4000
  }

  function chkUser(target){
    const userid = $(target).parent().find("input").val();

    $.getJSON(`/chk/userid/${userid}`)
      .then(res => {
        const find = user.includes(res.userid);
        if(res && !find){
          $(target).closest("tr").find("td").eq(7).html(age[res.age].toLocaleString() + "원");
          $(target).closest("td").html(`${res.userid}(${res.age})`);

          user.push(res.userid);
          pay_all += age[res.age];

          $("#pay_all").html("총액 : " + pay_all.toLocaleString() + "원")
        }else{
          dd(res);
          alert("이미 등록되었거나 없는 아이디 입니다.");
        }
      })
  }

  function submitBuy(idx){
    if($(".buy input").length > 0) return alert("모든 유저를 입력해주세요.");

    $.ajax({
      url : "/reservation",
      method : "POST",
      data : {
        chair : <?= P["buy_list"] ?>,
        data : {
          bus_idx : idx,
          bus_start :'<?= P["bus_start"] ?>',
          time : '<?= P["bus_time"] ?>',
          user : JSON.stringify(user),
          pay : pay_all
        }
      }
    }).then(res => {
      alert("예약되었습니다.");
      location.href="/mypage";
    })
  }

</script>