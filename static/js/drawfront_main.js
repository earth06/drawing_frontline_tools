//sleep関数を定義
const sleep = ms => new Promise(res => setTimeout(res, ms))
//天気図を描画
var imgcnvs=document.getElementById("imageCanvas");
var imgctx= imgcnvs.getContext("2d");
//image
const wmap = new Image();
wmap.src="./static/images/2021/01/850hPa_wind_equ_potential_temperature_20210102000000_FD0000.jpg";
wmap.onload = () => {
  imgctx.drawImage(wmap,0,0); //先に画像を読み込まないとダメ
};
//redo/undo用のcanvasの要素を格納する配列
const undo_history=[];
const redo_history=[];
//undo/redoで描画処理を実行させない
let lockHistory=false;

var maptag2name={
  surface:"surface",
  theta_850hPa:"850hPa_wind_equ_potential_temperature",
  T_850hPa_W_700hPa:"850hPa_T_wind_700hPa_omega",
  vo_500hPa:"500hPa_vo",
  T_500hPa_dew_700hPa:"500hPa_T_700hPa_dew_point_depression",
  map_300hPa:"300hPa",
  map_500hPa:"500hPa"
}

fabric.Object.prototype.objectCaching = true;
var canvas = new fabric.Canvas('frontlinecanvas', {
isDrawingMode: true,
freeDrawingBrush: new fabric.PencilBrush({ decimate: 8 })
});
var current_fronttype="cold";
var linecolor="blue";
undo_history.push(JSON.stringify(canvas))

function undo() {
  if (undo_history.length > 0) {
    lockHistory = true;
    if (undo_history.length > 1) redo_history.push(undo_history.pop()); //最初の白紙はredoに入れない
    const content = undo_history[undo_history.length - 1];
    canvas.loadFromJSON(content, function () {
      canvas.renderAll();
      lockHistory = false;
    });
  }
}

function redo() {
  if (redo_history.length > 0) {
    lockHistory = true;
    const content = redo_history.pop();
    undo_history.push(content);
    canvas.loadFromJSON(content, function () {
      canvas.renderAll();
      lockHistory = false;
    });
  }
}


//前線の色を変更する
document.getElementById("cold").addEventListener(
  "click",function(){
    linecolor="blue";
    current_fronttype="cold";
    console.log(current_fronttype)
}
)

document.getElementById("warm").addEventListener(
  "click",function(){
    linecolor="red";
    current_fronttype="warm";
    console.log(current_fronttype)
  }
)

document.getElementById("occulus").addEventListener(
  "click",function(){
    is_warm_mode=true;
    linecolor="purple";
    current_fronttype="occulus";
  }
)

document.getElementById("stable").addEventListener(
  "click",function(){
    linecolor="blue";
    current_fronttype="stable";
  }
)

document.getElementById("undo-button").addEventListener("click",undo);
document.getElementById("redo-button").addEventListener("click",redo)
var clearEl = document.getElementById('clear-canvas');//idで取得
clearEl.onclick=function(){
  console.log("clear canvas");
  canvas.clear();}

var switchmapEl=document.getElementById("switch-map");
switchmapEl.onclick=function(){
  var yyyy=document.getElementById("year").value;
  var mm=document.getElementById("month").value;
  var dd=document.getElementById("day").value;
  var fdddhh=document.getElementById("timestep").value;
  var maptag=document.getElementById("maptype").value;
  var timestamp=yyyy+mm+dd+"000000_" + fdddhh;
  var mapname=maptag2name[maptag];
  var filename=mapname+"_"+timestamp+".jpg"
  wmap.src="./static/images/"+yyyy+"/"+mm+"/"+filename;
  wmap.onload = () => {
    imgctx.drawImage(wmap,0,0); //先に画像を読み込まないとダメ
  }; 
}

//ダウンロード
var downloadEl =document.getElementById("download_btn");
downloadEl.onclick=async function() {
  var basemap=document.getElementById("imageCanvas");
  var drawedfronline=document.getElementById("frontlinecanvas");
  
  var tmp_canvas=document.createElement("canvas");
  tmp_canvas.width=basemap.width;
  tmp_canvas.height=basemap.height;
  //canvasを合成
  var tmp_context=tmp_canvas.getContext("2d");
  tmp_context.drawImage(basemap,0,0);
  tmp_context.drawImage(drawedfronline,0,0);
  await sleep(1000)
  
  // //ダウンロード準備
  var newimage=new Image();
  newimage.src=tmp_canvas.toDataURL("image/png");
  var dlink=document.createElement("a");
  dlink.download="download.png";
  dlink.href=newimage.src;
  document.body.appendChild(dlink);
  dlink.click();
  document.body.removeChild(dlink);
}

//前線描画パート
canvas.on('before:path:created', function(opt) {
  var path = opt.path;
  var patharr= path.path;
  var pathInfo = fabric.util.getPathSegmentsInfo(path.path);
  path.segmentsInfo = pathInfo;
  //path interpolate
  patharr=makehighresolution(patharr)

  if (current_fronttype=="cold"){
    drawColdFront(patharr,canvas);
  } else if (current_fronttype=="warm"){
    drawWarmFront(patharr,canvas);
  } else if (current_fronttype=="stable"){
    drawStationaryFront(patharr,canvas);
  } else if (current_fronttype=="occulus"){
    drawOccludedFront(patharr,canvas);
  }
});

canvas.on('path:created', function(opt) {
  canvas.remove(opt.path);
  if (lockHistory) return;
  undo_history.push(JSON.stringify(canvas))
});




