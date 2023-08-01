<?php

  get("/", function(){
    view("index");
  });

  get("/sub", function(){
    view("sub");
  });

  get("/sub2", function(){
    view("sub2");
  });

  middleware("notUser", function(){

    get("/login", function(){
      view("login");
    });

    post("/login", function(){
      $find = user::find("userid = ? && password = ?", [P["userid"], P["password"]]);
      err(!$find, "아이디 또는 비밀번호를 확인해주세요.");

      $_SESSION["user_101"] = $find;
      move("로그인이 완료되었습니다.", "/");
    });

    get("/join", function(){
      view("join");
    });

    post("/join", function(){
      err(emp_vali(P), "모든 값을 입력해주세요.");

      $find = user::find("userid = ?", P["userid"]);

      if(!preg_match_all("/^[A-z]{4,8}$/", P["userid"])) move("아이디는 영문 4 ~ 8자로 입력해주세요.");
      if(!preg_match_all("/^(?=.*[A-z])(?=.*[0-9])[A-z0-9]{4,8}$/", P["password"])) move("패스워드는 영문 및 숫자 조합 4 ~ 8자로 입력해주세요.");
      if(!preg_match_all("/^[ㄱ-힣]{3}$/u", P["name"])) move("이름은 한글 3자리로 입력해야합니다.");

      user::insert(P);
      move("회원가입이 완료되었습니다.", "/");
    });

  });

  middleware("user", function(){

    get("/logout", function(){
      session_destroy();
      move("로그아웃이 완료되었습니다.", "/");
    });

    get("/mypage", function(){
      view("mypage");
    });

  });

  middleware("type_tour", function(){

    post("/bus", function(){
      err(emp_vali(P) || !F["image"]["name"], "모든 값을 입력해주세요.");

      $vehicle = [
        "승용차" => ["A01","A02","A03"],
        "SUV" => ["B01","B02","B03","B04","B05"],
        "승합차" => ["C01","C02","C03","C04","C05","C06","C07","C08","C09"],
        "버스" => ["D01","D02","D03","D04","D05","D06","D07","D08","D09","D10","D11","D12"]
      ];

      $find = bus::find("user_idx = ? && status = ?", [USER["idx"], "wait"]);
      err($find, "좌석 등록 후 승인되기 전까지 등록이 불가능합니다.");

      $find = bus::find("code = ?", P["code"]);
      err($find, "중복된 차량번호가 존재합니다.");

      
      $file = F["image"];

      $name = explode(".", $file["name"]);
      $rand = uniqid(rand(), true);
      $ext = end($name);
      $url = "/upload/$rand.$ext";

      move_uploaded_file($file["tmp_name"], ROOT.$url);

      $arr = P;
      $arr["image"] = $url;
      $arr["user_idx"] = USER["idx"];
      $arr["chair"] = json_encode($vehicle[$arr["vehicle"]]);

      bus::insert($arr);

      move("셔틀버스 등록이 완료되었습니다.", "/mypage");
    });

    post("/chair/$", function($idx){
      bus::update("idx = ?", $idx, P);
    });

    get("/list/$", function($idx){
      bus::update("idx = ?", $idx, [ "status" => "apply" ]);
      move("배차승인요청이 완료되었습니다.", "/mypage?tab=reserve");
    });

    get("/$/reservation/$", function($status, $idx){
      reservation::update("idx = ?", $idx, [
        "status" => $status
      ]);

      move("상태가 변경되었습니다.");
    });

  });

  middleware("type_admin", function(){

    post("/admin/$", function($idx){
      err(emp_vali(P), "배차날짜및시간을 선택해주세요.");
      bus::update("idx = ?", $idx, P);

      move("승인이 완료되었습니다.");
    });

  });

  get("/chk/chair/$/$", function($bus_idx, $chair){
    echo boolval(bus_chair::find("bus_idx = ? && chair_code = ?", [$bus_idx, $chair]));
  });

  post("/buy", function(){
    view("buy");
  });

  get("/chk/userid/$", function($userid){
    if(USER["userid"] == $userid) {
      echo json_encode(false);
      return;
    }

    $user = user::find("userid = ?", $userid);

    if($user) $user["age"] = checkAge($user["date"]);
    echo json_encode($user);
  });

  post("/reservation", function(){
    $arr = P["data"];
    $arr["reservation_userid"] = USER["userid"];

    $idx = reservation::insert($arr);

    foreach(P["chair"] as $v){
      bus_chair::insert([
        "reservation_idx" => $idx,
        "bus_idx" => P["data"]["bus_idx"],
        "chair_code" => $v
      ]);
    }
  });

?>