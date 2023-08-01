<!DOCTYPE html>
<html lang="zxx">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="/resources/js/jquery.js"></script>
  <script src="/resources/js/script.js"></script>
  <link rel="stylesheet" href="/resources/css/style.css">
  <title>Document</title>
</head>
<body>

  <!-- 헤더 -->
  <header id="header">
    <div class="wrap flex jcsb aic">
      <div class="logo_box">
        <a href="/"><img src="/resources/img/logo.png" alt="#" title="#" class="logo"></a>

      </div>

      <div class="menu_nav flex">
        <a href="/mypage">mypage</a>
        <a href="/sub2">명소알아보기</a>
        <a href="/sub">셔틀버스투어</a>
      </div>

      <div class="utility flex jcfe">
        <div class="btn_box">
          <?php if(@USER): ?>
            <a href="/logout" class="btn">로그아웃</a>
          <?php else: ?>
            <a href="/login" class="btn">로그인</a>
            <a href="/join" class="btn">회원가입</a>
          <?php endif ?>
        </div>
      </div>
    </div>
  </header>