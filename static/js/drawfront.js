//sleep関数を定義
const sleep = ms => new Promise(res => setTimeout(res, ms))
//天気図を描画
var imgcnvs=document.getElementById("imageCanvas");
var imgctx= imgcnvs.getContext("2d");
//image
const wmap = new Image();
wmap.src="./static/images/map850hPa/202302110000_850hPa_theta_wind.jpg";
wmap.onload = () => {
  imgctx.drawImage(wmap,0,0); //先に画像を読み込まないとダメ
};


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
    linecolor="purple";
    current_fronttype="occulus";
  }
)

document.getElementById("stable").addEventListener(
  "click",function(){
    linecolor="purple";
    current_fronttype="stable";
  }
)
var clearEl = document.getElementById('clear-canvas');//idで取得
clearEl.onclick=function(){
  console.log("clear canvas");
  canvas.clear();}

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
  var pathLength = pathInfo[pathInfo.length - 1].length;

  var x0=patharr[0][1];
  var y0=patharr[0][2];
  var frontpath =`M ${x0} ${y0} L ${x0} ${y0} `;
  var delta_L= 15;
  var cum_l =0;
  var dl=0;
  var x1=x0;
  var y1=y0;
  var xs=x0;
  var ys=y0;
  var xe=0;
  var ye=0;
  var interval=`L `;
  var is_bezier_mode=true;
  for (i=1;i<= patharr.length-1; i++){
    console.log(i)
    x1=patharr[i][1];
    y1=patharr[i][2];
    x2=patharr[i][3];
    y2=patharr[i][4];
    //隣接2点間の線分の長さを計算
    dl=Math.sqrt((x2-x1)**2 + (y2-y1)**2);
    
    //線分を加算
    cum_l += dl;

    //線分モードのときに線分を追加
    if (is_bezier_mode){
      dl = Math.sqrt((x2-xs)**2 + (y2-ys)**2);
    }
    else {
      interval += `${x2} ${y2} `
      dl = Math.sqrt((x2-xe)**2 + (y2-ye)**2);
    }

    //線分の長さがdelta_Lを超えた場合warmfontに追加
    if (dl >=delta_L){
      

      if (is_bezier_mode){
        //制御点3を更新
        var xe=x2;
        var ye=y2;
        if (current_fronttype=="cold"){
          frontpath = frontpath + calcColdControllPoint(xs,xe,ys,ye);
        }
        else if (current_fronttype=="warm"){
          frontpath=frontpath + calcWarmControllPoint(xs,xe, ys,ye);
        }
        
        is_bezier_mode=false;
        cum_l=0;
      }
      else {
        //制御点1を更新
        xs=x2; ys=y2;
        frontpath = frontpath + interval;
        interval=`L `;
        is_bezier_mode=true;
        cum_l=0;
      }    
    }

  }
  //最後にpathを逆走して起点に戻す
  var base_line=`L `;
  for (i=patharr.length-2, i>=1; i--;){
    bx=patharr[i][3];
    by=patharr[i][4];
    base_line += `${bx} ${by} `;
  }
  frontpath += base_line + `z`;
  canvas.add( new fabric.Path(frontpath, {stroke:linecolor,fill:linecolor}));
});

function calcWarmControllPoint(xs,xe, ys,ye){
  dx=xe-xs
  dy=ye-ys
  //(xs,ys),(ys,ye)で表されるベクトルとx軸のなす各を求める
  if (dx>=0 && dy >=0){
    var factx=1;
    var facty=-1;
  }
  if (dx>=0 && dy<0){
    var factx=-1;
    var facty=-1;
  }
  if (dx <0 && dy>=0){
    var factx=1;
    var facty=1;
  }
  if (dx<0 && dy<0){
    var factx=-1;
    var facty=1;
  }

  var xm=(xs + xe + factx*Math.abs(dy)*1.5)/2;
  var ym=(ys + ye + facty*Math.abs(dx)*1.5)/2;
  var symbol=`L ${xs} ${ys} Q ${xm} ${ym} ${xe} ${ye} L ${xe} ${ye} `;
  return symbol

}

function calcColdControllPoint(xs,xe, ys, ye){
  dx=xe-xs;
  dy=ye-ys;
  //(xs,ys),(ys,ye)で表されるベクトルとx軸のなす各を求める
  if (dx>=0 && dy >=0){
    var factx=1;
    var facty=-1;
  }
  if (dx>=0 && dy<0){
    var factx=-1;
    var facty=-1;
  }
  if (dx <0 && dy>=0){
    var factx=1;
    var facty=1;
  }
  if (dx<0 && dy<0){
    var factx=-1;
    var facty=1;
  }
  var x_ctl1=(xe + factx*Math.abs(dy));
  var y_ctl1=(ye + facty*Math.abs(dx));

  var x_ctl2=(xs + factx*Math.abs(dy));
  var y_ctl2=(ys + facty*Math.abs(dx));

 
  var symbol=`L ${xs} ${ys} C ${x_ctl1} ${y_ctl1} ${x_ctl2} ${y_ctl2} ${xe} ${ye} L ${xe} ${ye} `;
  return symbol

}


function toRadians(deg) {
    return deg * Math.PI / 180
}

canvas.on('path:created', function(opt) {
  canvas.remove(opt.path);
})

