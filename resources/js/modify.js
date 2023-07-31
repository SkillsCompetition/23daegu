const dd = console.log;

const App = {

  init(){
    App.hook();

    if(location.pathname.includes("sub2")) Map.init();
  },

  hook(){
    $(document)
  }

}

const Map = {
  zoom : 0,
  nowPos : [0, 0],
  maxSize : 700,
  ctx : null,

  async init(){
    await Map.loadData();

    Map.hook();
    Map.settingMap(0, 0, Map.zoom).then(v => {
      Map.marker.settingMarkerList();
      Map.marker.settingMarker();
      Map.marker.settingUser();
    });
  },

  hook(){
    $(".maps")[0].addEventListener("wheel", (e) => Map.mouse.wheel(e), { passive : false })

    $(document)
      .on("mousedown", ".mapCon .maps", (e) => Map.mouse.down(e))
      .on("mousemove", ".mapCon .maps", (e) => Map.mouse.move(e))
      .on("mouseup mouseleave", ".mapCon .maps", (e) => Map.mouse.up(e))

      .on("mousedown", ".mapCon .maps", (e) => Map.point.setPoint(e))
      .on("mousemove", ".mapCon .maps", (e) => Map.point.draw(e))
      .on("keydown keyup", (e) => Map.point.hotkey(e))
      
      .on("click", ".mapCon .maps", (e) => Map.marker.clickMarker(e))

      .on("change", ".mapCon #sort_type, .mapCon #sort_dir", () => Map.list.setContainer())

      .on("click", ".mapCon .mapZoom", Map.clickZoom)
  },

  settingMap(setX, setY, depth){
    const canvas = $(`#map${depth + 1} canvas`);
    const ctx = canvas[0].getContext("2d");

    [setX, setY] = Map.checkingMaxPos([setX, setY]);

    canvas.parent().css({
      top : -setY,
      left : -setX
    });

    const promise = new Array(4**depth).fill(0).map((v, i) => {
      return new Promise(res => {
        const split = (2**depth);
        const x = 700 * (i%split);
        const y = 700 * Math.floor(i/split);

        $("<img>", { src : `resources/img/map/${depth + 1}-${i + 1}.jpg`})[0]
          .onload = (e) => {
            ctx.drawImage(e.target, x, y, 700, 700);
            res([x, y]);
          }
      });
    })

    return Promise.all(promise);
  },

  clickZoom(e){
    const zoom = $(e.target).attr("data-zoom");
    if(!Map.mouse.isWheel || Map.zoom == zoom) return;

    const zoomDir = Map.zoom < zoom ? 2 : .5;

    Map.mouse.isWheel = false;

    const prevZoom = Map.zoom;
    Map.zoom = zoom * 1;
    Map.maxSize *= zoomDir;
    Map.nowPos = [x, y] = [Map.maxSize/2 - 400, Map.maxSize/2 - 400];

    $(".mapZoom").removeClass("chk");
    $(`.mapZoom[data-zoom=${Map.zoom}]`).addClass("chk");

    Map.settingMap(x, y, Map.zoom).then(() => { 
      $("#info").remove();

      Map.marker.settingUser();
      Map.marker.settingMarker();

      Map.point.pos = Map.point.pos.map(v => [v[0] * zoomDir, v[1] * zoomDir]);

      $(`#map${prevZoom + 1}`).css({
        "transform-origin" : `center centers`,
        "transform" : `scale(${zoomDir == 2 ? 2 : 0.75})`
      });

      setTimeout(() => {
        Map.mouse.isWheel = true;

        $(".maps > div").hide().css({ "transform" : "scale(1)" });
        $(`#map${Map.zoom + 1}`).show();
      }, 400);
    });
  },

  mouse:{
    prevPos : [null, null],
    lastPos : [null, null],
    isWheel : true,
    isMove : false,

    wheel(e){
      e.preventDefault();
      if(!this.isWheel) return;

      const zoomDir = e.deltaY == -100 ? 2 : .5;
      const [moveX, moveY] = Map.getOffset(e);
  
      if((Map.zoom == 2 && zoomDir == 2) || 
         (Map.zoom == 0 && zoomDir == .5)) return;

      this.isWheel = false;

      Map.zoom += zoomDir == 2 ? 1 : -1;
      Map.maxSize *= zoomDir;
      Map.nowPos = [x, y] = [(moveX * zoomDir) - 350 , (moveY * zoomDir) - 350];

      $(".mapZoom").removeClass("chk");
      $(`.mapZoom[data-zoom=${Map.zoom}]`).addClass("chk");
  
      Map.settingMap(x, y, Map.zoom).then(() => { 
        $("#info").remove();

        Map.marker.settingUser();
        Map.marker.settingMarker();

        Map.point.pos = Map.point.pos.map(v => [v[0] * zoomDir, v[1] * zoomDir]);

        $(`#map${Map.zoom + (zoomDir == 2 ? 0 : 2)}`).css({
          "transform-origin" : `${moveX}px ${moveY}px`,
          "transform" : `scale(${zoomDir == 2 ? 2 : 0.75})`
        });

        setTimeout(() => {
          this.isWheel = true;

          $(".maps > div").hide().css({ "transform" : "scale(1)" });
          $(`#map${Map.zoom + 1}`).show();
        }, 400);
      });
    },

    down(e){
      this.lastPos = this.prevPos = Map.getOffset(e, ".maps");
      this.isMove = true;
    },

    move(e){
      if(!this.isMove) return;

      const [prevX, prevY] = this.prevPos;
      const [x, y] = Map.getOffset(e, ".maps");

      const [changeX, changeY] = [prevX - x, prevY - y];
      let [nowX, nowY] = [...Map.nowPos];

      this.lastPos = [nowX, nowY] = Map.checkingMaxPos([nowX + changeX, nowY + changeY]);

      $(`#map${Map.zoom + 1}`).css({
        left : -nowX,
        top : -nowY
      });
    },

    up(){
      if(!this.isMove) return;
      
      Map.nowPos = this.lastPos;
      this.isMove = false;
    }
  },

  marker: {
    latMax : 36.9842 - 36.6208,
    lonMax : 127.4377 - 126.9741,
    initData : [],
    list : [],

    settingMarkerList(){
      this.initData = Map.data.map((v, i) => {
        const [perX, perY] = [
          (v.longitude - 126.9741)/this.lonMax,
          (v.latitude - 36.6208)/this.latMax
        ];

        return {
          idx : i,
          name : v.name,
          star : v.star,
          visitant : v.visitant,
          perX,
          perY,
          path : null
        }
      });
    },

    settingUser(){
      const [perX, perY] = [
        (Map.user.longitude - 126.9741)/this.lonMax,
        (Map.user.latitude - 36.6208)/this.latMax
      ];

      $(`#map${Map.zoom + 1} .user_icon`).css({
        left : Map.maxSize * perX,
        top : Map.maxSize * perY
      });
    },

    settingMarker(list = this.initData){
      const canvas = $(`#map${Map.zoom + 1} canvas`)[0];
      const ctx = canvas.getContext("2d");

      this.list = list.map(v => {
        v.path = new Path2D();
        v.path.arc(Map.maxSize * v.perX, Map.maxSize * v.perY, 10, 0, Math.PI*2);

        ctx.fillStyle = "#ffb700";
        ctx.fill(v.path);

        return v;
      });
    },

    clickMarker(e){
      const canvas = $(`#map${Map.zoom + 1} canvas`);
      const ctx = canvas[0].getContext("2d");

      const find = this.list.find(v => ctx.isPointInPath(v.path, e.offsetX, e.offsetY));

      $("#info").remove();

      if(find){
        canvas.parent().append(`
          <div 
            id="info" 
            style="top: ${find.perY * 100}%; left: ${find.perX * 100}%;"
          >
            <p>${find.name}</p>
            <div class="btn" onclick="Map.list.add(${find.idx})">추가</div>
          </div>
        `)
      }
    },

  },

  list : {
    isView : true,
    list : [],

    setContainer(){
      this.sort();

      $(".mapCon table tr:nth-child(1n + 2)").remove();

      $(".mapCon table").append(this.list.map((v, i) => {
        return `
          <tr>
            <td onclick="Map.list.moveItemPos(${i})">${v.name}</td>
            <td>${v.star}점</td>
            <td>${v.visitant}명</td>
            <td onclick="Map.list.remove(${i})"><div class="btn tomato">삭제</div></td>
          </tr>
        `
      }))
    },

    add(idx){
      if(this.list.find(v => v.idx == idx)) return alert("이미 추가된 명소입니다.");

      this.list.push(Map.marker.list[idx]);
      alert("명소가 추가되었습니다.");

      this.setContainer();
    },

    remove(idx){
      this.list.splice(idx, 1);

      Map.list.setContainer();
    },

    sort(){
      const type = $("#sort_type").val();
      const dir = $("#sort_dir").val();
      
      if(type == "name"){
        this.list = this.list.sort((a, b) => a.name.charCodeAt() - b.name.charCodeAt())
        if(dir == "down") this.list.reverse();
      }else{
        this.list = this.list.sort((a, b) => a[type] - b[type])
        if(dir == "down") this.list.reverse();
      }
    },

    viewSelectMarker(){
      Map.settingMap(...Map.nowPos, Map.zoom).then(() => {
        Map.marker.settingUser();
        Map.marker.settingMarker(!this.isView ? Map.marker.initData : this.list);
        
        $(".toggleIsView").toggle();
        this.isView = !this.isView;
      });
    },

    moveItemPos(idx){
      let data;

      if(idx == "user"){
        data = {};

        data.perX = (Map.user.longitude - 126.9741)/Map.marker.lonMax;
        data.perY = (Map.user.latitude - 36.6208)/Map.marker.latMax;
      }else{
        data = this.list[idx];
      }

      Map.nowPos = [x, y] = Map.checkingMaxPos([(data.perX * Map.maxSize) - 350, (data.perY * Map.maxSize) - 350]);

      $(`#map${Map.zoom + 1}`).animate({
        top : -y,
        left : -x
      }, 200);
    }
  },

  point:{
    pos : [],
    onMove : false,
    imageData : null,
    ctx : null,

    start(dir = false){
      const canvas = $(`#map${Map.zoom + 1} canvas`);
      const ctx = canvas[0].getContext("2d");

      this.imageData = ctx.getImageData(0, 0, Map.maxSize, Map.maxSize);
      this.draw({}, false)
    },

    end(){
      this.draw({}, false);
      this.imageData = null;
    },

    hotkey(e){
      if(!this.imageData) return;

      if(e.keyCode == 32){
        e.preventDefault();
        this.onMove = e.type == "keydown" ? true : false;
      }else if(e.type == "keydown" && e.keyCode == 8){
        e.preventDefault();
        this.removeLastPost(e)
      }else if(e.type == "keydown" && e.keyCode == 27){
        e.preventDefault();
        this.end()
      }
    },

    removeLastPost(e){
      this.pos.pop();

      this.draw(e);
    },

    setPoint(e){
      if(!this.imageData || this.onMove) return;
      const pos = Map.getOffset(e);

      this.pos.push(pos);
      this.draw({}, false)
    },

    draw(e, isMouse = true, catched = false){
      if(!this.imageData) return;

      const canvas = $(`#map${Map.zoom + 1} canvas`);
      const ctx = canvas[0].getContext("2d");
      
      const line = new Path2D();
      
      if(!catched) ctx.putImageData(this.imageData, 0, 0);

      this.pos.forEach((v, i, arr) => {
        const arc = new Path2D();
        arc.arc(...v, 10, 0, Math.PI*2);
        
        ctx.fillStyle = "royalblue";
        ctx.fill(arc);

        if(arr[i + 1]){
          if(i == 0) line.moveTo(...v);
          else line.lineTo(...v);
        }else{
          line.lineTo(...v);
          if(isMouse) line.lineTo(...Map.getOffset(e));

          ctx.strokeStyle = "royalblue";
          ctx.stroke(line);
        }
      })
    },

    calcDistance(){
      let lastDistance = 0;

      const sum = this.pos.reduce((acc, v, i, arr) => {
        if(i == 0) return acc;
        
        const [x1, y1] = v;
        const [x2, y2] = arr[i - 1];

        const [x3, y3] = [Math.abs(x1 - x2), Math.abs(y1 - y2)];

        const xDis = 89 * (Map.marker.lonMax * (x3/Map.maxSize));
        const yDis = 110 * (Map.marker.latMax * (y3/Map.maxSize));

        const trueDis = Math.sqrt(xDis**2, yDis**2);
        
        return acc += lastDistance = trueDis;
      }, 0);

    }

  },

  checkingMaxPos(pos){
    return pos.map(v => {
      return v + 700 > Map.maxSize ? Map.maxSize - 700 : (v < 0 ? 0 : v);
    })
  },
  
  getOffset(e, standard = `#map${Map.zoom + 1}`){
    const { left, top } = $(standard).offset();
    return [e.pageX - left, e.pageY - top];
  },

  loadData(){
    $.ajaxSetup({ cache : false })

    setInterval(() => {
      $.getJSON("/resources/json/attraction.json")
        .then(res => {
          Map.user = res.data.splice(-1)[0];
          Map.data = res.data;

          Map.marker.settingUser();
        });
    }, 1000);

    return $.getJSON("/resources/json/attraction.json")
      .then(res => {
        Map.user = res.data.splice(-1)[0];
        Map.data = res.data;
      });
  },

  download(){
    let canvas = $(`#map${Map.zoom + 1} canvas`)[0];
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

$(() => App.init())