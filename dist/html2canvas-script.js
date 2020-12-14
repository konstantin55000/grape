( function( window ) {

'use strict';



html2canvas(document.querySelector("#capture")),{
  allowTaint: true,
     onrendered: function (canvas){
         var data = canvas.toDataURL();
         var img  = document.createElement('img');
         img.setAttribute('download','myImage.png');
         img.src  = 'data:image/png;base64,' + data;
         alert(src);
     },
     width:300,
     height:300
 });


});
