if (data.fromTab == 3 ) {

    var raws_data = {};

    let url  =  'https://engine.cashngo.com.au/api/Communication/GetWorkflow?workflow=GetSingleBlock&BlockID='+data.id;
     var data = jQuery.ajax({
       type: 'GET',
       url: url ,
       crossDomain: true,
       dataType: 'json'
     })
       .done( ( response ) => {
        raws_data = response[0];
         
        $("#HtmlStyleSave").val(raws_data.html)
        $("#CssStyleSave").val(raws_data.css);
         
        console.log(`raws_data.css);`, raws_data.css,  raws_data.html);
        
        $("#block-name").val(raws_data.Name);
        $("#cat-value").val(raws_data.Category);
        $("textarea[name=description]").val(raws_data.Desciption);
        $("textarea[name=preview]").val(raws_data.Preview);
        console.log(raws_data);

        
      let html = raws_data.html
      let css = raws_data.css;

      let content  = jQuery("<div/>").html(html).text();
      content = content.replace(/\\"/g, `"`);


      let customBlock = content;
      cssString = css;
      htmlString = customBlock;
      editorTextArea.innerHTML = htmlString;
     })
     .fail( ( response ) => {
       console.error('error ajax', response);
      });
