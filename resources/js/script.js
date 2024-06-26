const dd = console.log;

function phoneVali(target){
  const value = target.value
                  .replace(/\D/g, "").substring(0, 11)
                  .replace(/(\d{3})(\d{0,4})(\d{0,4})/, "$1-$2-$3")
                  .replace(/-{1,2}$/, "")

  $(target).val(value);
}

const App = {

  init(){
    App.hook();

    if(location.pathname.includes("sub2")){
      Map.init();
      Favorite.init();
    }
  },

  hook(){
    $(document)
      .on("click", ".modal .vertex div", Favorite.changeVertex)
      .on("click", ".modal .favorite .label_box div", Favorite.changeAttraction)
  }

}

const Map = {
  zoom : 0,
  imageData : [],
  nowPos : [0, 0],
  canvas : null,
  ctx : null,

  async init(){
    Map.hook();

    Map.canvas = $("#main_map")[0];
    Map.ctx = Map.canvas.getContext('2d', { willReadFrequently : true });
    
    await Map.loadData();
    Map.marker.settingInitData();
    Map.marker.list = [...Map.marker.initData]

    Map.settingMapData().then(res => {
      Map.reDrawAll();
    });
  },

  hook(){
    $(".mapCon .maps")[0].addEventListener("wheel", Map.mouse.wheel, { passive : false });

    $(document)
      .on("mousedown", ".mapCon .maps", (e) => Map.mouse.down(e))
      .on("mousemove", ".mapCon .maps", (e) => Map.mouse.move(e))
      .on("mouseleave mouseup", ".mapCon .maps", (e) => Map.mouse.other(e))

      .on("click", ".mapCon .maps", (e) => Map.marker.openInfo(e))

      .on("click", ".mapCon .maps", (e) => Map.point.setPoint(e))
      .on("mousemove", ".mapCon .maps", (e) => Map.point.move(e))
      .on("keydown keyup", (e) => Map.point.hotkey(e))
      
  },

  async settingMapData(){
    const canvas = $("canvas#load_map")[0];
    const ctx = canvas.getContext('2d', { willReadFrequently : true });

    const all = [];

    for(let i = 0;i < 3;i++){
      const promise = new Array(4**i).fill(0).map((v, idx) => {
        return new Promise(res => {
          const split = 2**i
          const x = 700 * (idx%split);
          const y = 700 * Math.floor(idx/split);

          $("<img>", { src : `/resources/img/map/${i + 1}-${idx + 1}.jpg` })[0]
            .onload = (e) => {
              ctx.drawImage(e.target, x, y);

              res();
            }
        });
      });

      const proAll = await Promise.all(promise);
      all.push(proAll);

      const image = await ctx.getImageData(0, 0, 700 * (2**i), 700 * (2**i));
      Map.imageData.push(image);
    }
    
    return Promise.all(all);
  },

  viewMap(x = 0, y = 0, zoom = Map.zoom){
    const imageData = Map.imageData[zoom];

    Map.size = imageData.width;
    Map.nowPos = [x, y] = Map.chkOverViewMap([x, y]);

    $(Map.canvas).css({
      top : -y,
      left : -x
    });

    Map.ctx.clearRect(0, 0, 2800, 2800);
    return Map.ctx.putImageData(imageData, 0, 0);
  },

  mouse : {
    onWheel : false,
    onMouse : false,
    prevPos : [null, null],
    lastPos : [null, null],
    
    wheel(e){
      if(this.onWheel) return;
      e.preventDefault();

      $("#info").remove();

      const dir = e.deltaY < 0 ? 1 : -1;
      if(Map.zoom + dir > 2 || Map.zoom + dir < 0) return;
      Map.zoom += dir;

      const [x, y] = Map.getOffset(e);
      const changePos = (dir == 1 ? 2 : 0.5);

      this.onWheel = true;
      Map.zoomEffect(x, y, dir).then(() => {
        this.onWheel = false;

        Map.reDrawAll([(x * changePos) - 350, (y * changePos) - 350]);
      });
    },

    down(e){
      if(Map.point.onStart && !Map.point.onMovePos) return;

      this.onMouse = true;
      this.prevPos = Map.getOffset(e, ".maps");
    },

    move(e){
      if(!this.onMouse || (Map.point.onStart && !Map.point.onMovePos)) return;

      $("#info").remove();

      const [prevX, prevY] = this.prevPos;
      const [nowX, nowY] = Map.getOffset(e, ".maps");
      const [posX, posY] = [...Map.nowPos];

      this.lastPos = [x, y] = Map.chkOverViewMap([posX + (prevX - nowX), posY + (prevY - nowY)]);

      $(Map.canvas).css({
        top : -y,
        left : -x
      })
    },

    other(){
      if(!this.onMouse) return;

      this.onMouse = false;
      Map.nowPos = [...this.lastPos]
    },

  },

  marker : {
    maxLat : 36.9842 - 36.6208,
    maxLon : 127.4377 - 126.9741,
    user : {},
    initData : [],
    list : [],

    settingInitData(){
      this.initData = Map.list.data.map((v, i) => {
        const pos = [
          (v.longitude - 126.9741)/this.maxLon,
          (v.latitude -  36.6208)/this.maxLat
        ];

        return {
          idx : i,
          name : v.name,
          pos,
        }
      });
    },

    setMarker(list = this.list){
      this.list = list.map(v => {
        v.path = new Path2D();
        const [x, y] = [Map.size * v.pos[0], Map.size * v.pos[1]];

        v.path.arc(x, y, 10, 0, Math.PI*2);

        Map.ctx.fillStyle = "#ffb700";
        Map.ctx.fill(v.path);

        return v;
      });
    },

    setUser(){
      const [x, y] = [
        this.user.pos[0] * Map.size,
        this.user.pos[1] * Map.size
      ];

      Map.ctx.fillStyle = "tomato"
      Map.ctx.beginPath();
        Map.ctx.arc(x, y, 6, 0, Math.PI*2);
      Map.ctx.closePath();
      Map.ctx.fill()
    },

    openInfo(e){
      const [eventX, eventY] = Map.getOffset(e);
      const find = this.list.find(v => Map.ctx.isPointInPath(v.path, eventX, eventY));
      
      $("#info").remove();
      if(find) {
        $(".maps").append(`
          <div id="info">
            <p>${find.name}</p>
            <div class="btn" onclick="Map.list.add(${find.idx})">추가</div>
          </div>
        `);

        $("#info").css({
          left : (find.pos[0] * Map.size) - Map.nowPos[0],
          top : (find.pos[1] * Map.size) - Map.nowPos[1],
        });
      }
    }
  },

  list : {
    added : [],
    data : [],

    setContainer(){
      $(".mapCon tbody").html(this.added.map((v, i) => {
        return `
          <tr>
            <td onclick="Map.list.movePos(${v.idx})">${v.name}</td>
            <td>${v.star}</td>
            <td>${v.visitant}</td>
            <td>
              <div class="btn tomato" onclick="Map.list.remove(${i})">삭제</div>
            </td>
          </tr>`
      }))
    },

    add(idx){
      const chk = this.added.find(v => v.idx == idx);
      if(chk) return alert("이미 추가된 명소입니다.");
      this.added.push({idx, ...this.data[idx]});

      this.setContainer();
    },

    remove(idx){
      this.added.splice(idx, 1);

      this.setContainer();
    },

    movePos(idx){
      const data = Map.marker.initData[idx];
      Map.nowPos = [x, y] = Map.chkOverViewMap([(Map.size * data.pos[0]) - 350, (Map.size * data.pos[1]) - 350]);

      $("#info").remove();

      $(Map.canvas).animate({
        left : -x,
        top : -y
      }, 200);
    },

    viewAdded(type){
      $(".toggleIsView").toggle();

      const filter = this.added.map(v => Map.marker.initData[v.idx]);
      Map.reDrawAll(Map.nowPos, type ? filter : Map.marker.initData);
    },

    moveUserPos(){
      const data = Map.marker.user;
      Map.nowPos = [x, y] = Map.chkOverViewMap([data.pos[0] * Map.size - 350, data.pos[1] * Map.size - 350]);

      $(Map.canvas).animate({
        left : -x,
        top : -y
      }, 200);
    }

  },

  point : {
    onStart : false,
    onMovePos : false,
    pos : [],
    lastPos : [],
    imageData : null,

    start(){
      this.onStart = true;
      this.imageData = Map.ctx.getImageData(0, 0, Map.size, Map.size);
    },

    setPoint(e){
      if(!this.onStart || this.onMovePos) return;
      const [x, y] = Map.getOffset(e);

      this.pos.push([x/Map.size, y/Map.size]);
      this.move(e);
    },

    hotkey(e){
      if(e.keyCode == 32){
        e.preventDefault();
        Map.point.onMovePos = e.type == "keydown" ? true : false;
      }else if(e.keyCode == 27){
        e.preventDefault();
        this.end();
      }
    },

    move(e){
      if(!this.onStart) return;

      Map.ctx.putImageData(this.imageData, 0, 0);
      this.lastPos = Map.getOffset(e);

      this.draw();
    },

    draw(){
      const line = new Path2D();

      this.pos.forEach((v, i) => {
        const arc = new Path2D();
        const [x, y] = [v[0] * Map.size, v[1] * Map.size];

        Map.ctx.fillStyle = "royalblue";
        arc.arc(x, y, 10, 0, Math.PI*2);
        Map.ctx.fill(arc);

        if(i == 0){
          line.moveTo(x, y);
        }else if(i == this.pos.length - 1){
          line.lineTo(x, y);
          if(this.onStart) line.lineTo(...this.lastPos);

          Map.ctx.strokeStyle = "royalblue";
          Map.ctx.stroke(line)
        }else{
          line.lineTo(x, y);
        }
      });
    },

    end(){
      if(!this.onStart) return;

      this.onStart = false;
      Map.reDrawAll();
    }

  },

  zoomEffect(tranX, tranY, dir){
    return new Promise(res => {
      $("#main_map").css({
        "transition" : "transform .4s, transform-origin 0s",
        "transform-origin" : `${tranX}px ${tranY}px`,
        "transform" : `scale(${1 + (dir == 1 ? 1 : -0.5)})`
      });

      setTimeout(() => {
        $("#main_map").css({
          "transition" : "transform 0s, transform-origin 0s",
          "transform" : `scale(1)`
        });

        res();
      }, 400);
    })
  },

  async reDrawAll(pos = this.nowPos, list = Map.marker.list){
    await Map.viewMap(...pos);

    Map.marker.setUser();
    Map.marker.setMarker(list);

    if(Map.point.onStart) Map.point.start();
    Map.point.draw();
  },

  getOffset(e, target = "#main_map"){
    const { top, left } = $(target).offset();
    return [e.pageX - left, e.pageY - top];
  },

  chkOverViewMap(pos){
    return pos.map(v => {
      return v > Map.size - 700 ? Map.size - 700 : (v < 0 ? 0 : v)
    });
  },

  loadData(){
    setInterval(() => {
      $.getJSON("/resources/json/attraction.json")
        .then(res => {
          Map.marker.user = res.data.splice(-1)[0];
          Map.marker.user.pos = [
            (Map.marker.user.longitude - 126.9741)/Map.marker.maxLon,
            (Map.marker.user.latitude - 36.6208)/Map.marker.maxLat
          ];

          Map.list.data = res.data;
          Map.marker.settingInitData();

          Favorite.ko = res.labels_kr;
          Favorite.en = res.labels_en;
        });
    }, 1000)

    return $.getJSON("/resources/json/attraction.json").then(res => {
      Map.marker.user = res.data.splice(-1)[0];
      Map.marker.user.pos = [
        (Map.marker.user.longitude - 126.9741)/Map.marker.maxLon,
        (Map.marker.user.latitude - 36.6208)/Map.marker.maxLat
      ];
      
      Map.list.data = res.data;

      Favorite.ko = res.labels_kr;
      Favorite.en = res.labels_en;

      return res.data;
    });
  },

  download(){
    let canvas = $(`#main_map`)[0];
    let ctx = canvas.getContext('2d');

    const image = ctx.getImageData(...Map.nowPos, 700, 700);

    canvas = $("#download")[0];
    ctx = canvas.getContext('2d');

    ctx.putImageData(image, 0, 0);

    const a = document.createElement('a');
    const data = canvas.toDataURL();

    a.href = data;
    a.download = "map.png";

    a.click();
    a.remove();
  }

}

const Favorite = {
  vertex : 6,
  data : [],
  nowSelect : 0,
  ctx : null,

  init(){
    setInterval(() => {
      Favorite.loadData();
      if($(".favorite")[0]) Favorite.reDraw();
    }, 500)
  },

  loadData(){
    Favorite.data = Map.list.added.map(v => {
      return Map.list.data[v.idx];
    })
  },

  open(){
    Modal.open("favorite");

    Favorite.vertex = 6;

    Favorite.setAttractionList();
    Favorite.setVertexList();

    Favorite.reDraw();
  },

  setAttractionList(){
    $(".favorite_modal .label_box").html(Favorite.data.map((v, i) => {
      return `
        <div ${i == 0 ? "class='chk'" : ""}>
          ${v.name}
        </div>
      `
    }));
  },

  setVertexList(){
    $(".favorite_modal .vertex").html(Favorite.ko.map(v => {
      return `
        <div class="chk">
          ${v}
        </div>
      `
    }));
  },

  drawLine(){
    const canvas = $("#favorite")[0];
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 700, 700)

    const deg = 360/Favorite.vertex;
    const radiusSplit = 300/5;
    
    for(let j = 0; j <= 5; j++){
      const line = new Path2D()
      for(let i = 0; i <= Favorite.vertex; i++){
        const [x, y] = [
          Math.cos(radian(deg * i)) * (j * radiusSplit) + 400,
          Math.sin(radian(deg * i)) * (j * radiusSplit) + 350
        ]

        if(i == 0){
          line.moveTo(x, y);
        }else line.lineTo(x, y)
      }

      ctx.strokeStyle = "#d1d1d1";
      ctx.stroke(line);
    }
  },

  drawText(){
    const canvas = $("#favorite")[0];
    const ctx = canvas.getContext('2d');

    const checked = $(".vertex .chk");
    const deg = 360/Favorite.vertex;

    checked.each(function(i){
      const [x, y] = [
        Math.cos(radian(deg * i)) * 340 + 400,
        Math.sin(radian(deg * i)) * 330 + 350
      ]

      ctx.fillStyle = "#000"
      ctx.font = "15px sans"
      ctx.textAlign = "center";
      ctx.fillText($(this).text(), x, y);
    })
  },

  drawData(){
    const canvas = $("#favorite")[0];
    const ctx = canvas.getContext('2d');

    const checked = $(".vertex .chk");
    const deg = 360/Favorite.vertex;
    const data = Favorite.data[Favorite.nowSelect];
    
    ctx.beginPath();
      checked.each(function(i){
        const idx = $(this).index();
        const radius = 300 * data[Favorite.en[idx]]/100;
        const [x, y] = [
          Math.cos(radian(deg * i)) * radius + 400,
          Math.sin(radian(deg * i)) * radius + 350
        ]
        
        if(i == 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      })
    ctx.closePath();

    ctx.fillStyle = "#ffb7005f"
    ctx.lineWidth = "2"
    ctx.stroke();
    ctx.fill();
  },

  changeAttraction(e){
    Favorite.nowSelect = $(e.target).index();

    $(".favorite .label_box .chk").removeClass("chk");
    $(e.target).addClass("chk");

    Favorite.reDraw()
  },

  changeVertex(e){
    if($(e.target).hasClass("chk")){
      $(e.target).removeClass("chk")
    }else{
      $(e.target).addClass("chk")
    }

    Favorite.vertex = $(".vertex .chk").length

    if(Favorite.vertex < 3){
      Favorite.vertex = 3;
      $(e.target).addClass("chk")
      alert("항목은 3개 이상 선택해주세요.");
    }

    Favorite.reDraw()
  },

  reDraw(){
    const canvas = $("#favorite")[0];
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 800, 700)

    Favorite.drawLine();
    Favorite.drawText();
    Favorite.drawData();
  }

}

function radian(deg){
  return deg * (Math.PI/180);
}

const Modal = {
  template : (target) => $($("template")[0].content).find(`.${target}_modal`).clone(),

  open(target){
    $("body").css("overflow", "hidden");

    $(".modal")
      .addClass("open")
      .html(Modal.template(target));
  },

  close(){
    $("body").css("overflow", "");

    $(".modal")
      .removeClass("open")
      .html("");
  }
}

$(() => App.init());

