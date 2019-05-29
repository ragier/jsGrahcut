var mousePressed = false;
var lastX, lastY;
var ctx;
window.onload = InitThis;

var canvas;
var canvasDiv;
var canvasImg;
var color = "red";
var lineWidth = 7;
var radius = 15;
var eraser = false;

var graphcut;

var factor = 1;

function getImageData(img) {
    var tmpCanvas = document.createElement("canvas");

    tmpCanvas.width = img.naturalWidth;
    tmpCanvas.height = img.naturalHeight;

    var tmpCtx = tmpCanvas.getContext("2d");
    tmpCtx.drawImage(img, 0, 0);

    var imgData = tmpCtx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
    console.log(imgData);
    return imgData ;

    
}

function InitThis() {
    canvasImg = document.getElementById("canvasimg");
    canvasDiv = document.getElementById("canvasdiv");
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext("2d");


    canvas.width = canvasImg.naturalWidth;
    canvas.height = canvasImg.naturalHeight;

    canvas.style.width = canvasImg.naturalWidth*factor + "px";
    canvas.style.height = canvasImg.naturalHeight*factor + "px";

    //canvasImg.onload = function () {
        var imgData = getImageData(canvasImg);
        graphcut = new Graphcut(ctx, imgData);
        console.log(canvasImg, imgData.data[0]);

        graphcut.calcWeights();
    //}


    ///graphcut.drawWeights();

    canvasImg.style.width  = canvasImg.naturalWidth*factor + "px";
    canvasImg.style.height = canvasImg.naturalHeight*factor + "px";

    canvasDiv.style.width  = canvasImg.naturalWidth*factor + 10 + "px";
    canvasDiv.style.height = canvasImg.naturalHeight*factor + 10 + "px";

    //Body pour cette page = Fenêtre modale pour les plugins
    document.body.style.width  = canvasImg.naturalWidth*factor * 1.5 + 10 + "px";
    document.body.style.height = canvasImg.naturalHeight*factor * 1.5 + 10 + "px";

    $('#canvas').mousedown(function (e) {
        mousePressed = true;
        lastX =  e.pageX - $(this).offset().left;
        lastY = e.pageY - $(this).offset().top;
        if(!eraser) {
            Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, false);
        } else {
            ctx.beginPath();
            ctx.lineWidth = lineWidth;
            ctx.arc(e.pageX - $(this).offset().left/factor,e.pageY - $(this).offset().top/factor,radius,0,Math.PI*2);
            ctx.fill();
            ctx.stroke();
        }
    });
    
    $('#canvas').mousemove(function (e) {
        if (mousePressed) {
            Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true);
        }
        if(!eraser){
            $('#cursor').css("left",e.pageX - $(this).offset().left - lineWidth/2);
            $('#cursor').css("top",e.pageY - $(this).offset().top - lineWidth/2);
        } else {
            $('#cursor').css("left",e.pageX - $(this).offset().left - radius*1.4);
            $('#cursor').css("top",e.pageY - $(this).offset().top - radius*1.4);
        }
    });

    $('#canvas').mouseup(function (e) {
        mousePressed = false;
        lastX = null;
        lastY = null;
    });
    
    $('#canvas').mouseleave(function (e) {
        mousePressed = false;
        $('#cursor').hide();
    });

    $('#canvas').mouseenter(function (e) {
        $('#cursor').show();
    });

    $(".color-button").click(function(){
        ctx.globalCompositeOperation = "source-over";
        eraser = false;
        switch($(this).attr("id")){
            case "background" : 
                color = "red";
                break;
            case "foreground" : 
                color = "green";
                break;
            case "eraser" :
                color = "white";
                break;
        }

        $('#cursor').css("border-color",color);
        $('#cursor').css("width",lineWidth);
        $('#cursor').css("height",lineWidth);
        $('#cursor').css("border-radius",lineWidth);
    });

    $("#size-select label").click(function(){
        switch($(this).attr("id")){
            case "size1" : 
                lineWidth = 3;
                radius = 10;
                break;
            case "size2" : 
                lineWidth = 7;
                radius = 15;
                break;
            case "size3" :
                lineWidth = 11;
                radius = 20;
                break;
        }
        if(!eraser) {
            $('#cursor').css("width",lineWidth);
            $('#cursor').css("height",lineWidth);
            $('#cursor').css("border-radius",lineWidth);
        } else{
            $('#cursor').css("width",radius*2.8);
            $('#cursor').css("height",radius*2.8);
            $('#cursor').css("border-radius",radius*2.8);
        }
    });

    $("#eraser").click(function(){
        eraser=true;
        ctx.globalCompositeOperation = "destination-out";
        
        $('#cursor').css("width",radius*2.8);
        $('#cursor').css("height",radius*2.8);
        $('#cursor').css("border-radius",radius*2.8);
    })

    $("#submit").click(function(){
        graphcut.segment();
        /*
        canvas.toBlob(function(blob){
            
            var newImg = document.createElement('img');
            var url = URL.createObjectURL(blob);
            newImg.src = url;
            
            document.body.appendChild(newImg);
            
           
            console.log(blob);
        });
        */
    })

}

function Draw(x, y, isDown) {
    if (isDown && !eraser) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineJoin = "round";
        ctx.moveTo(lastX/factor, lastY/factor);
        ctx.lineTo(x/factor, y/factor);
        ctx.closePath();
        ctx.stroke();
    } else if (eraser) {
        console.log(Math.abs(x-lastX) + Math.abs(y-lastY));

        if(Math.abs(x-lastX) + Math.abs(y-lastY) > 30){
            var interX = lastX;
            var interY = lastY;
            var vectorX = x - lastX;
            var vectorY = y - lastY;
            var percent = (radius/2)/(Math.abs(x-lastX) + Math.abs(y-lastY));
            console.log("sup >, vectX : ",vectorX,"vectY : ",vectorY);
            console.log(percent);
            while(Math.abs(x-interX) + Math.abs(y-interY) > radius)
            {
                interX += vectorX * percent ;
                interY += vectorY * percent ;
                ctx.beginPath();
                ctx.lineWidth = lineWidth;
                ctx.arc(interX/factor,interY/factor,radius,0,Math.PI*2);
                ctx.fill();
                ctx.stroke();
            }
        }
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.arc(x/factor,y/factor,radius,0,Math.PI*2);
        ctx.fill();
        ctx.stroke();
    }
    
    lastX = x; lastY = y;
}
	
function clearArea() {
    // Use the identity matrix while clearing the canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}
/*
$.ajax({
    url: "http://137.74.115.158/api/presets",
    type: "GET",
    crossDomain: true,
    data: {},
    beforeSend: function (xhr) {
        xhr.setRequestHeader ("Authorization", "Api-Key " + "06314cf8-1993-42d7-8a88-88df63be6eae");
    },
    success: function (response) {
      console.log("Réponse API : ", response);
    },
    complete: function(e)
    {
        console.log(e);
    }
  });

  */
