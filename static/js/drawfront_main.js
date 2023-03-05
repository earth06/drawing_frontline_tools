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
})

