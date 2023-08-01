<?php

  function notUser(){
    err(@USER, "비회원만 접근 가능한 페이지입니다.");
  }

  function User(){
    err(@!USER, "로그인 후 접근 가능한 페이지입니다.", "/");
  }

  function type_tour(){
     err(USER["type"] != "tour", "투어 관리자만 접근 가능합니다.") ;
  }

  function type_admin(){
     err(USER["type"] != "admin", "관리자만 접근 가능합니다.") ;
  }

?>