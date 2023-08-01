<div class="header_emp"></div>

<div class="content">

  <div class="join_section">
    <div class="wrap">
      <div class="title">
        <h1>회원가입</h1>
        <div class="line"></div>
        <p>회원가입 후 사이트를 이용해보세요</p>
      </div>

      <form action="/join" method="POST" class="join inputs">

        <div class="input_box">
          <label for="userid">아이디</label>
          <input type="text" name="userid" id="userid">
        </div>

        <div class="input_box">
          <label for="password">비밀번호</label>
          <input type="password" name="password" id="password">
        </div>

        <div class="input_box">
          <label for="name">성명</label>
          <input type="text" name="name" id="name">
        </div>

        <div class="input_box">
          <label for="date">생년월일</label>
          <input type="date" name="date" id="date" max="<?= date("Y-m-d") ?>">
        </div>

        <div class="input_box">
          <label for="phone">전화번호</label>
          <input type="text" name="phone" id="phone" pattern="(\d{3})-(\d{0,4})-(\d{0,4})" oninput="phoneVali(this)">
        </div>
        
        <div class="input_box">
          <label for="type">회원구분</label>
          <select name="type" id="type">
            <option value="user">일반회원</option>
            <option value="tour">투어 관리자</option>
          </select>
        </div>

        <button class="btn">회원가입</button>

      </form>
    </div>
  </div>

</div>