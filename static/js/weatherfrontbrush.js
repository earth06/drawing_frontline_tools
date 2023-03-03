
function drawColdFront(patharr, canvas){
  var x0=patharr[0][00];
  var y0=patharr[0][1];
  var frontpath =`M ${x0} ${y0} L ${x0} ${y0} `;
  var delta_L= 15;
  var dl=0;
  var xs=x0;
  var ys=y0;
  var xe=0;
  var ye=0;
  var interval=`L `;
  var is_bezier_mode=true;
  for (i=1;i<= patharr.length-1; i++){
    x2=patharr[i][0];
    y2=patharr[i][1];
    
    dl = Math.sqrt((x2-xs)**2 + (y2-ys)**2);
    //線分モードのときに線分を追加
    if (!is_bezier_mode){
      interval += `${x2} ${y2} `
    }

    if (dl >= delta_L){
      if (is_bezier_mode){
        var xe=x2;
        var ye=y2;
        frontpath = frontpath + calcColdControllPoint(xs,xe,ys,ye)
        xs=x2,ys=y2
        is_bezier_mode=false;
      } else{
        xs=x2,ys=y2;
        frontpath = frontpath + interval;
        interval =`L `;
        is_bezier_mode=true;
      }
    }
  }
  frontpath = add_baseline(patharr, frontpath);
  canvas.add(new fabric.Path(frontpath, {stroke:"blue", fill:"blue"}));
  return 0
}

function drawWarmFront(patharr, canvas){
  var x0=patharr[0][0];
  var y0=patharr[0][1];
  var frontpath =`M ${x0} ${y0} L ${x0} ${y0} `;
  var delta_L= 20;
  var dl=0;
  var xs=x0;
  var ys=y0;
  var xe=0;
  var ye=0;
  var interval=`L `;
  var is_bezier_mode=true;
  for (i=1;i<= patharr.length-1; i++){
    x2=patharr[i][0];
    y2=patharr[i][1];
    
    //線分モードのときに線分を追加
    dl = Math.sqrt((x2-xs)**2 + (y2-ys)**2);
    if (!is_bezier_mode){
      interval += `${x2} ${y2} `
    }
    if (dl >= delta_L){
      if (is_bezier_mode){
        var xe=x2;
        var ye=y2;
        frontpath = frontpath + calcWarmControllPoint(xs,xe,ys,ye)
        xs=x2,ys=y2
        is_bezier_mode=false;
      } else{
        xs=x2,ys=y2;
        frontpath = frontpath + interval;
        interval =`L `;
        is_bezier_mode=true;
      }
    }
  }
  frontpath = add_baseline(patharr, frontpath);
  canvas.add(new fabric.Path(frontpath, {stroke:"red", fill:"red"}));
  return
}

function drawStationaryFront(patharr, canvas){
  var x0=patharr[0][0];
  var y0=patharr[0][1];
  var frontpath =`M ${x0} ${y0} L ${x0} ${y0} `;
  var delta_L= 15;
  var xs=x0;
  var ys=y0;
  var xe=0;
  var ye=0;
  var cursor=`L `;
  var cursor_for_warm=`L `
  var r_base_line=``;
  var is_bezier_mode=false;
  var is_cold_side=true;
  var d1=0;

  for (i=1;i<= patharr.length-1; i++){
    x2=patharr[i][0];
    y2=patharr[i][1];
    r_base_line = `${x2} ${y2} ` + r_base_line    
    d1=Math.sqrt((x2-xs)**2 + (y2-ys)**2)
    cursor += `${x2} ${y2} `    
    if (is_cold_side){
      //寒冷前線モード

      if (d1 >= delta_L){
        //2dLに辿り着いたらベジェ曲線を書く
        if (is_bezier_mode){
          xe=x2;
          ye=y2;
          frontpath = frontpath + calcColdControllPoint(xs,xe,ys, ye);
          
          //起点に戻る
          frontpath += `L` + r_base_line

          //canvasに載せる
          canvas.add(new fabric.Path(frontpath, {stroke:"blue", fill:"blue"}));
          //pathをリセット
          xs=x2,ys=y2;
          cursor=`L `
          frontpath=`M ${xs} ${ys} L${xs} ${ys} `
          r_base_line=``

          //暖気モードに変更
          is_cold_side=false;
        }else{
          //線分を引く
          frontpath+=cursor
          is_bezier_mode=true;
          xs=x2,ys=y2;
        }
        
      }      

    }else{
      //温暖前線モード
      cursor_for_warm += `${x2} ${y2} ` 
      if (d1 >= delta_L){
        if (is_bezier_mode){
          xe=x2;
          ye=y2;
          frontpath+=calcReverseWarmControlPoint(xs,xe,ys,ye)
          cursor_for_warm=`L `
          is_bezier_mode=false;
          xs=xe,ys=ye;
        }else{
          frontpath +=cursor_for_warm
          //起点に戻す
          frontpath +=`L` + r_base_line;
          canvas.add(new fabric.Path(frontpath, {stroke:"red",fill:"red"}))
          //pathをリセット
          xs=x2,ys=y2;
          cursor=`L `
          r_base_line=``
          frontpath=`M ${xs} ${ys} L ${xs} ${ys} `
          //寒気モードに変更
          is_cold_side=true;
        }

        
      }

    }

  }
  //canvas.add(new fabric.Path(cursor, {stroke:"red"}))
  return 
}
function drawOccludedFront(patharr, canvas){
  var x0=patharr[0][0];
  var y0=patharr[0][1];
  var frontpath =`M ${x0} ${y0} L ${x0} ${y0} `;
  var delta_L= 15;
  var dl=0;
  var xs=x0;
  var ys=y0;
  var xe=0;
  var ye=0;
  var interval=`L `;
  var is_bezier_mode=true;
  var is_warm_mode=true;
  for (i=1;i<= patharr.length-1; i++){
    x2=patharr[i][0];
    y2=patharr[i][1];
    //線分を求める
    dl = Math.sqrt((x2-xs)**2 + (y2-ys)**2);
    //線分モードのときに線分を追加
    if (!is_bezier_mode){
      interval += `${x2} ${y2} `
    }
    if (dl >= delta_L){
      if (is_bezier_mode){
        var xe=x2;
        var ye=y2;
        if (is_warm_mode){
          frontpath = frontpath + calcWarmControllPoint(xs,xe,ys,ye)
          xs=x2;
          ys=y2;
          is_warm_mode=false;
        }else{
          frontpath = frontpath + calcColdControllPoint(xs,xe, ys,ye)
          xs=x2;
          ys=y2;
          is_warm_mode=true;
          is_bezier_mode=false;
        }
      } else{
        xs=x2,ys=y2;
        frontpath = frontpath + interval;
        interval =`L `;
        is_bezier_mode=true;
      }
    }
    
  }
  frontpath = add_baseline(patharr, frontpath);
  canvas.add(new fabric.Path(frontpath, {stroke:"magenta", fill:"magenta"}));
  return 0
}

function add_baseline(patharr, frontpath){
  var bx;
  var by;
  var base_line=`L `;
  for (i=patharr.length-2, i>=1; i--;){
    bx=patharr[i][0];
    by=patharr[i][1];
    base_line += `${bx} ${by} `;
  }
  frontpath += base_line + `z`;
  return frontpath
}

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

  var xm=(xs + xe + factx*Math.abs(dy)*2)/2;
  var ym=(ys + ye + facty*Math.abs(dx)*2)/2;
  var symbol=`L ${xs} ${ys} Q ${xm} ${ym} ${xe} ${ye} L ${xe} ${ye} `;
  return symbol
}

function calcReverseWarmControlPoint(xs,xe,ys,ye){
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

  var xm=(xs + xe - factx*Math.abs(dy)*2)/2;
  var ym=(ys + ye - facty*Math.abs(dx)*2)/2;
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

function makehighresolution(patharr){
  var dl=0;
  var x=0;
  var y=0;
  var x_prev=0;
  var y_prev=0;
  var interp_x=0;
  var interp_y=0;
  var interparr=[[patharr[0][1],patharr[0][2]]];
  var DLMIN=15;
  var resol=DLMIN/5

  for (i=1;i<patharr.length-1;i++){
      x=patharr[i][3];
      y=patharr[i][4];
      x_prev=patharr[i-1][3]
      y_prev=patharr[i-1][4]
      dl=Math.sqrt((x-x_prev)**2 +(y-y_prev)**2)
      //DLMAX/10よりも小さいときはそのまま追加
      if (dl <= resol){
          interparr.push([x,y])
      }else{
          NDIM=Math.trunc( dl /resol)
          delta_k=1.0/NDIM
          //ここで得た個数分線形補完してpushする
          for (j=0;j<=NDIM;j++){
              interp_x=(x_prev + (j+1)*(delta_k)*( x-x_prev))
              interp_y=(y_prev + (j+1)*(delta_k)*( y-y_prev))
              interparr.push([interp_x, interp_y])
          }
          interparr.push([x,y])
      }
  }
  return interparr
}
