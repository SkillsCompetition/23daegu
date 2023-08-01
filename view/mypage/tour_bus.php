<div class="bus">

  <form action="/bus" method="POST" class="inputs" enctype="multipart/form-data">

    <div class="btn_box">
      <div class="input_box">
        <label for="location">출발 위치</label>
        <select name="location" id="location" disabled>
          <option value="">자동변경</option>
          <option value="천안역">천안역</option>
          <option value="유관순사적지">유관순사적지</option>
          <option value="독립기념관">독립기념관</option>
        </select>
      </div>

      <div class="input_box">
        <label for="start_point">출발지</label>
        <select name="start_point" id="start_point" class="point" onchange="changePoint(this)" required>
          <option value=""></option>
          <option value="천안역">천안역</option>
          <option value="유관순사적지">유관순사적지</option>
          <option value="독립기념관">독립기념관</option>
        </select>
      </div>

      <div class="input_box">
        <label for="way_point">경유지</label>
        <select name="way_point" id="way_point" class="point" onchange="changePoint(this)" required>
          <option value=""></option>
          <option value="천안역">천안역</option>
          <option value="유관순사적지">유관순사적지</option>
          <option value="독립기념관">독립기념관</option>
        </select>
      </div>

      <div class="input_box">
        <label for="end_point">도착지</label>
        <select name="end_point" id="end_point" class="point" onchange="changePoint(this)" required>
          <option value=""></option>
          <option value="천안역">천안역</option>
          <option value="유관순사적지">유관순사적지</option>
          <option value="독립기념관">독립기념관</option>
        </select>
      </div>
    </div>

    <div class="btn_box">
      <div class="input_box">
        <label for="vehicle">차량</label>
        <select name="vehicle" id="vehicle" required>
          <option value="승용차">승용차</option>
          <option value="SUV">SUV</option>
          <option value="승합차">승합차</option>
          <option value="버스">버스</option>
        </select>
      </div>

      <div class="input_box">
        <label for="image">차량 대표사진</label>
        <input type="file" name="image" id="image" accept="image/*" required>
      </div>

      <div class="input_box">
        <label for="code">차량번호</label>
        <input type="text" name="code" id="code" oninput="carCode(this)" required>
      </div>
    </div>

    <button class="btn">등록</button>

  </form>

</div>

<script>

  function changePoint(target){
    $(".point").each(function(){
      if(this == target) return;

      if(this.value == target.value && target.value != ""){
        $(target).val("")
        alert("중복된 값을 선택할 수 없습니다.")
      };
    })

    $("#location").val($("#start_point").val())
  }

  function carCode(target){
    const value = target.value.replace(/\D/g, "").substring(0, 4);

    $(target).val(value)
  }

</script>