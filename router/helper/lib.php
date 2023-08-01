<?php

  session_start();
  date_default_timezone_set("Asia/Seoul");

  define("USER", @$_SESSION["user_101"]);
  define("ROOT", $_SERVER["DOCUMENT_ROOT"]);
  define("U", explode("?", $_SERVER["REQUEST_URI"])[0]);
  define("G", $_GET);
  define("P", $_POST);
  define("F", $_FILES);

  function move($msg = false, $url = "back"){
    $url = $url == "back" ? "history.back()" : "location.href='$url'";

    if($msg){
      echo "<script>alert('$msg')</script>";
    }

    if($url){
      echo "<script>$url</script>";
    }

    exit;
  }

  function err($err, $msg = false, $url = "back"){
    if($err){
      move($msg, $url);
    }
  }

  function dd(){
    echo "<pre>";
    var_dump(...func_get_args());
    echo "</pre>";
  }

  function emp_vali($data){
    foreach($data as $v){
      if(trim($v) == "") return true;
    }

    return false;
  }

  function view($loc, $data = []){
    extract($data);

    require ROOT."/view/header.php";
    require ROOT."/view/$loc.php";
    require ROOT."/view/footer.php";
  }
  
  function checkAge($date){
    $age = date("Y", strtotime("+1 years")) - date("Y", strtotime($date));

    if($age <= 13) return "어린이";
    else if($age <= 19) return "청소년";
    else if($age <= 64) return "성인";
    else return "경로우대";
  }
?>