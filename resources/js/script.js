const dd = console.log;

const App = {

  init(){
    Map.init();
  },

  hook(){

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

      dd(123);

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

      this.list = [...this.initData];
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

        });
    }, 1000)

    return $.getJSON("/resources/json/attraction.json").then(res => {
      Map.marker.user = res.data.splice(-1)[0];
      Map.marker.user.pos = [
        (Map.marker.user.longitude - 126.9741)/Map.marker.maxLon,
        (Map.marker.user.latitude - 36.6208)/Map.marker.maxLat
      ];
      
      Map.list.data = res.data;

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

$(() => App.init());

