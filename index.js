//Class
class CssRules {

  run(editor, snd, opts = {}) {
    const component = opts.target || editor.getWrapper();
    const cssc = editor.CssComposer;
    const rules = cssc.getAll();
    let result = '';

    const { atRules, notAtRules } = this.splitRules(this.matchedRules(component, rules));
    notAtRules.forEach(rule =>  result += rule.toCSS());
    this.sortMediaObject(atRules).forEach(item => {
      let rulesStr = '';
      const atRule = item.key;
      const mRules = item.value;

      mRules.forEach(rule => {
        const ruleStr = rule.getDeclaration();

        if (rule.get('singleAtRule')) {
          result += `${atRule}{${ruleStr}}`;
        } else {
          rulesStr += ruleStr;
        }
      });

      if (rulesStr) result += `${atRule}{${rulesStr}}`;
    });

    return result;
  }

  /**
   * Get matched rules of a component
   * @param {Component} component
   * @param {Array<CSSRule>} rules
   * @returns {Array<CSSRule>}
   */
  matchedRules(component, rules) {
    const el = component.getEl();
    let result = [];

    rules.forEach(rule => {
      try {
        if (rule.selectorsToString().split(',').some(
          selector => el.matches(this.cleanSelector(selector))
        )) {
          result.push(rule);
        }
      } catch (err) {}
    });

    component.components().forEach(component => {
      result = result.concat(this.matchedRules(component, rules))
    });

    // Remove duplicates
    result = result.filter((rule, i) => result.indexOf(rule) == i);

    return result;
  }

  /**
   * Return passed selector without states
   * @param {String} selector
   * @returns {String}
   */
  cleanSelector(selector) {
    return selector.split(' ').map(item => item.split(':')[0]).join(' ');
  }

  /**
   * Split an array of rules in atRules and not
   * @param {Array<CSSRule>} rules
   * @returns {Object}
   */
  splitRules(rules) {
    const atRules = {};
    const notAtRules = [];

    rules.forEach(rule => {
      const atRule = rule.getAtRule();

      if (atRule) {
        const mRules = atRules[atRule];

        if (mRules) {
          mRules.push(rule);
        } else {
          atRules[atRule] = [rule];
        }
      } else {
        notAtRules.push(rule);
      }
    });

    return {
      atRules,
      notAtRules,
    };
  }

  /**
   * Get the numeric length of the media query string
   * @param  {String} mediaQuery Media query string
   * @return {Number}
   */
  getQueryLength(mediaQuery) {
    const length = /(-?\d*\.?\d+)\w{0,}/.exec(mediaQuery);
    if (!length) return Number.MAX_VALUE;

    return parseFloat(length[1]);
  }

  /**
   * Return a sorted array from media query object
   * @param  {Object} items
   * @return {Array}
   */
  sortMediaObject(items = {}) {
    const itemsArr = [];
   _.each(items, (value, key) => itemsArr.push({ key, value }));
    return itemsArr.sort(
      (a, b) => this.getQueryLength(b.key) - this.getQueryLength(a.key)
    );
  }

  };

  // Grapes-editor object
  const editor = grapesjs.init({
    height: '100%',
    showOffsets: 1,
    noticeOnUnload: 0,
    canvas: {
      styles: []
    },
    storageManager: {
      id: '',
      type: 'remote',
      autosave: false,
      autoload: false,
      contentTypeJson: true,
      urlStore: '/cadau/user-template-page/save',
      // urlLoad: '/lroxv54oss7dz4wtlxtdxrfcft6zynyw/storage/grapesjs',
      // For custom parameters/headers on requests
      // params: { _some_token: '....' },
      // headers: { Authorization: 'Basic ...' },
    },
    container: '#gjs',
    fromElement: true,
    plugins: ['gjs-preset-webpage'],
    pluginsOpts: {
      'gjs-preset-webpage': {}
    },
    blockManager: {
      appendTo : '#componentsContent'
    },
  });

  // My block manager
  const blockManager = {
    // Reference to editor block manager
    obj: editor.BlockManager,
    config: {
      // Prefix for current tab
      prefix: '',
      // DOM Element for current tab block manager
      queryContent: '#componentsContent',
    },
    // Render panel with blocks to DOM element by query selector
    render: function (blocks) {
      const el = document.querySelector(this.config.queryContent);
      if (!el) return;
      el.innerHTML = '';
      el.appendChild(blocks === undefined ? this.searchBlocks('') : blocks);
    },
    // Searching query in blocks names and category names
    searchBlocks: function (query, labelFlag=true, categoryFlag=true) {
      // Filtering by current tab
      const blocks = this.obj.getAll().filter(block => {
        let category = block.attributes.category;
        if (category === '' && this.config.prefix === '')
          return true;
        if (category === '')
          return false;
        if (typeof category.attributes === 'undefined')
          return false;

        category = category.attributes.id;
        if (this.config.prefix === '') {
          return category.indexOf('tab-') === -1;
        }
        return category.split('-')[0] === this.config.prefix.split('-')[0] && category.split('-')[1] === this.config.prefix.split('-')[1];
      });
      // Filtering by inner string
      return this.obj.render(blocks.filter(block => {
        const labelBlock = block.attributes.label;
        const idBlock = block.id;
        const labelCategory = block.attributes.category !== '' ? block.attributes.category.attributes.label : null;
        const idCategory = block.attributes.category !== '' ? block.attributes.category.id : null;
        const cFlag = (labelCategory ? labelCategory.toLowerCase().indexOf(query) !== -1 : false) || (idCategory ? idCategory.toLowerCase().indexOf(query) !== -1 : false);
        const bFlag = labelBlock.toLowerCase().indexOf(query) !== -1 || idBlock.toLowerCase().indexOf(query) !== -1;
        return (cFlag && categoryFlag) || (bFlag && labelFlag);
      }));
    },
    // Manage search from DOM event
    searchManage: function (event) {
      let str = event.target.value;
      if (str === null || str === undefined) {
        str = '';
      }
      const blocks = this.searchBlocks(str);
      this.render(blocks);
    },
    // Initialization of listeners for searching blocks
    initSearchers: function (query='.body__search') {
      document.querySelectorAll(query).forEach(e => e.addEventListener('input', this.searchManage.bind(this)));
    },
    // Creating new block (if no define to category it will be in 'other' category)
    creatingNewBlock: function (id, opts, tab='') {
      const defaultCategory = {
        id: tab !== '' ? `tab-${tab}-other` : 'Other',
        label: 'Other',
      };
      let options = opts ? opts : { category: defaultCategory };
      if (!options.category)
        options.category = defaultCategory;
      this.obj.add(id, options);
    },
  };

  const saveBlock = function (objToSave){

    let url  =  'https://engine.cashngo.com.au/api/Communication/PostWorkflow?workflow=SaveBlocks';  // 'https%3A%2F%2Fengine.cashngo.com.au%2Fapi%2FCommunication%2FPostWorkflow%3Fworkflow%3DSaveBlocks';

     let encodedHtml =  jQuery('<div />').text(objToSave.html).html() ;
     objToSave.html = encodedHtml;
     console.log('BEFORE: ', objToSave);

     jQuery.ajax({
       type: 'POST',
       url: url ,
       data:  JSON.stringify(objToSave),
       processData: false,
       contentType: 'application/json'
     })
       .done( ( response ) => {
        alert('Block is added an saved');
        console.log('saved response', response);
     })
     .fail( ( response ) => {
       console.error('error ajax', response);   //this appear0
      });
   }

   const addBtnEditEventHandler = () => {
      // console.log('buttons',   document.querySelectorAll('.btn-block-edit'));
      document.querySelectorAll('.btn-block-edit').forEach((btn)=> {
          console.log('button', btn);
          btn.addEventListener('click', ()=> {
            alert('edit');
              editor.Commands.run('open-html-code-editor', {fromTab : 1, edit: 1})
              return false;
          });
      });
   }

  const getBlocks =   function (url, blockTabId){
    jQuery.ajax({
      url: url ,
      crossDomain: true,
      dataType: 'json'
    })
    .done(function( data ) {
      console.log('data',  data, 'block tab id: ', blockTabId);

      data.forEach( (row, index)=> {
       // alert( JSON.stringify(row) );

        let content  = jQuery("<div/>").html(row.html).text();
        content = content.replace(/\n/g, '<br/>');
        content = content.replace(/\\n/g, "<br/>");
        content = content.replace(/\\"/g, `"`);

        blockManager.creatingNewBlock(row.Id, {
                label: `<div>
                <img src="`+row.Preview+`"/>
                <div class="my-label-block">`+row.Name+`</div>
                   <a class="edit-block-btn fa fa-edit" href="#" onClick="callEditBlock('`+row.Id+`');"></a>
                </div>`,
                content: content+'<style>'+ row.css +'</style>',
                category: {
                  id: blockTabId+'-'+row.Category,
                  label: row.Category,
                },
                attributes: {
                title:  row.Name
              }
          });
      });

    })
  }

  // Manager of tabs (now 'Components' and 'Blocks') contains a method to add new Tab
  const tabManager = {
    // DOM Container of tabs
    objectDOM: document.querySelector('.js__tab-manager'),
    // Map with tab faces
    tabNames: new Map(),
    // Map with tab bodies
    tabBodies: new Map(),
    // Key of current tab
    currentKey: null,
    // Refer to block manager
    bManager: blockManager,
    // Change current tab
    setCurrentTab: function (key) {
      if (this.currentKey !== key) {
        document.querySelectorAll('.js__active-tab').forEach(e => e.classList.remove('js__active-tab'));
        document.querySelectorAll(`[data-tab-key=${key}]`).forEach(e => e.classList.add('js__active-tab'));
        this.currentKey = key;
        console.log( this.currentKey , this.bManager.config.queryContent );;
        if (key === 'components') {
          this.bManager.config.prefix = ''
        } else {
          this.bManager.config.prefix = `tab-${key}`;
        }
        this.bManager.config.queryContent = `#${key}Content`;
        this.bManager.render();
      }
    },
    // Load tabs to HTML
    exportToDOM: function (namesContainer = '.js__tab-names', bodiesContainer = '.js__tab--bodies') {
      const nmsWrpDOM = document.querySelector(namesContainer);
      const bdsWrpDOM = document.querySelector(bodiesContainer);
      nmsWrpDOM.innerHTML = '';
      bdsWrpDOM.innerHTML = '';
      this.tabNames.forEach((value, key) => {
        if (this.crrTab === key)
          value.classList.add('js__active-tab');
        value.setAttribute('data-tab-key', key);
        nmsWrpDOM.appendChild(value);
      });
      this.tabBodies.forEach((value, key) => {
        if (this.crrTab === key)
          value.classList.add('js__active-tab');
        value.setAttribute('data-tab-key', key);
        nmsWrpDOM.appendChild(value);
      })
    },
  };



  blockManager.creatingNewBlock('h2-block', {
    label: 'Another built in block',
    content: '<h1>Title</h1>',
    category: 'tab-bootstrap',

    attributes: {
      title: 'Insert h1 block'
    }
  });

  // Testing creating new block without options
  blockManager.creatingNewBlock('h3-bootstrap', { label: 'Bootstrap block' , content: '<p class="col-md-6">Bootstrap block</p>',}, 'bootstrap');
  blockManager.creatingNewBlock('h1-bootstrap', { label: 'Сustom In Bootstrap', content: '<div class="col-md-10"><h1 class="">Title</h1></div>', }, 'bootstrap');

  // editor.Panels.addButton('devices-c', [ { id: 'toggle-panel-right3', className: 'fa fa-arrows-alt icon-blank',
  //  command: {
  //   run: function(editor) {
  //     editor.setDragMode('absolute');

  //   },
  //   stop: function(editor) {
  //     editor.setDragMode('block');
  //   }
  // }
  // } ] );

  editor.Panels.addButton('devices-c',
  [ { id: 'toggle-panel-right2', className: 'fa fa-plus  icon-blank',
   command: function(editor1, sender) {
     jQuery('.panel-blocks').toggleClass('panel-blocks--open');
     }, attributes: { title: 'Blocks' } }
  , ]);


  // Fix fullscreen-mode
  editor.Commands.extend('core:fullscreen', {
    run () {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
      else if (el.msRequestFullscreen) el.msRequestFullscreen();
    },
    stop () {
      const d = document;
      if (d.exitFullscreen) d.exitFullscreen();
      else if (d.webkitExitFullscreen) d.webkitExitFullscreen();
      else if (d.mozCancelFullScreen) d.mozCancelFullScreen();
      else if (d.msExitFullscreen) d.msExitFullscreen();
    }
  });


  const rightBar = document.getElementsByClassName('right-bar')[0];


  //hide left panel on preview
  editor.on('run:preview:before', () => {

    rightBar.style.left = '0';
    rightBar.style.setProperty("width", "100%", "important");
  });

  editor.on('stop:preview:before', () => {

    rightBar.style.left = '13.04%';
    rightBar.style.setProperty("width", "calc(100% - 13.04%) ", "important");
  });

  var drModeIsOn = false;
  editor.on('component:selected', (model) => {

      // whenever a component is selected in the editor
      let self = this;

      const freeModeCommand = () => {
        if(editor.getSelected().get("drag-mode") == 1){
          model.setDragMode('');
          editor.getSelected().set("drag-mode",0);
          $( ".gjs-toolbar-item.fa-mouse-pointer" ).removeClass( "active" );
          drModeIsOn  = false;
          console.log('drModeIsOn', drModeIsOn);
        } else {
          model.setDragMode('translate');
          editor.getSelected().set("drag-mode", 1);
          drModeIsOn = true;
        }
        console.log(document.querySelector('.fa.fa-mouse-pointer'), 'pointer');
      }

      const addBlock = () => {
        editor.Commands.run('open-html-code-editor', {fromTab : 0});
      }

      const selectedComponent = editor.getSelected();
      const defaultToolbar = selectedComponent.get('toolbar');
      const addBlockClass = 'fa fa-plus-square-o';
      const iconFreeMode = 'fa fa-mouse-pointer';

      if(model.get("type") != 'wrapper'){
        if (defaultToolbar.length < 6){
          selectedComponent.set({
            toolbar: [ ...defaultToolbar,
              {  attributes: {class: iconFreeMode  }, command:  freeModeCommand  },
              {  attributes: {class: addBlockClass }, command:  addBlock },
            ]
          });
        }
      }

    });

  function getUrlVars() {
    let vars = {};
    let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
    });
    return vars;
  }

   //this is for editing component
   const getInstanceValues = () => {
    editorTextArea.value = localStorage.getItem('editorTextArea_' + cid);
    cssTextArea.value = localStorage.getItem('cssTextArea_' + cid);
    editorTextBlockName.value  = localStorage.getItem( 'blockName_' + cid );
    editorTextCategoryName.value = localStorage.getItem( 'catValue_' + cid );
    let contentToSet = editorTextArea.value + ' ' + cssTextArea.value;
    codeViewer.setContent(contentToSet);
  }

  var codeViewer = editor.CodeManager.getViewer("CodeMirror").clone();
  var codeViewerCss = editor.CodeManager.getViewer("CodeMirror").clone();

  // Add new block
  editor.Commands.add("open-html-code-editor", {
    run: function (editor, sender, data) {
      var selectedComponent = data.fromTab == 0;

      codeViewer.set({
        codeName: 'htmlmixed',
        readOnly: 0,
        theme: 'hopscotch',
        autoBeautify: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineWrapping: true,
        styleActiveLine: true,
        smartIndent: true,
        indentWithTabs: true
      });

      codeViewerCss.set({
        codeName: "css",
        readOnly: 0,
        theme: "hopscotch",
        autoBeautify: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineWrapping: true,
        styleActiveLine: true,
        smartIndent: true,
        indentWithTabs: true,
      });

      if (data.fromTab == 3) {
        var buttonDelete = `<button class="tabs_delete" onclick="deleteItem('`+data.id+`');">Delete</button>`;
        var hiddenId = `<input type="hidden" id="IDBlock" value="`+data.id+`"/>`;
      }else{
        var buttonDelete = "";
        var hiddenId = "";
      }

      var documentContent = document.createElement('div').innerHTML = `
        <div class="tabs">
          <button class="tabs_link" onclick="openCity(event, \'tab-1\')">
            Main
          </button>
          <button class="tabs_link" onclick="openCity(event, \'tab-2\')">
            Extra
          </button>
          <button class="tabs_save" onclick="updateInstance()">
            Save
          </button>
          `+ buttonDelete +`
          `+ hiddenId +`
        </div>

        <div id="tab-1" class="tabs_content">
          <div class="tabs_row">
            <div class="tabs_column">
              <div class="form-group">
                <label for="input-name">
                  Name
                </label>
                <input type="text" name="name" id="block-name" placeholder="eg. Button">
              </div>
              <div class="form-group">
                <label for="input-html">
                  HTML
                </label>
                <textarea name="html" id="html-code"></textarea>
              </div>
            </div>
            <div class="tabs_column">
              <div class="form-group">
                <label for="input-category">
                  Category
                </label>
                <input type="text" name="category"  id="cat-value" placeholder="eg. Buttons">
              </div>
              <div class="form-group">
                <label for="input-html">
                  CSS
                </label>
                <textarea name="css" id="css-style"></textarea>
              </div>
            </div>
          </div>
          <div class="tabs_row">
            <div class="tabs_column tabs_column__full">
              <iframe id="iframe-editor" frameborder="0"></iframe>
            </div>
          </div>
        </div>
        <div id="tab-2" class="tabs_content">
          <div class="tabs_row">
            <div class="tabs_column">
              <div class="form-group">
                <label for="input-html">
                  Description
                </label>
                <textarea name="description"></textarea>
              </div>
            </div>
            <div class="tabs_column">
              <div class="form-group">
                <label for="input-html">
                  Preview
                </label>
                <textarea name="preview"></textarea>
              </div>
            </div>

          </div>
          <div class="tabs_row">
            <div class="tabs_column tabs_column__full padding-0">
              <div class="form-group input_visibility__wrapper margin-0" style="flex-direction: row;">
              <input id="input-visibility" type="checkbox" name="visibility" style="width: 12px;">
                <label for="input-visibility">
                  Make the block available only in this project
                </label>
              </div>
            </div>
          </div>
        </div>
      `;

      editor.Modal.setTitle("New Block").setContent(documentContent).open();

      var editorIframe = document.querySelector('#iframe-editor');
      var editorTextArea = document.querySelector('[name="html"]');
      var Css, cssString, htmlString = "";

      if (selectedComponent) {
        //if not from tab, get for select component.
        var selComponent = editor.getSelected();
        var attr = editor.getSelectedToStyle().attributes;
        // Css = attr.style;
        let cssSpliter = new CssRules();
        cssString = cssSpliter.run(editor, false, {target: selComponent});
        htmlString = editor.getSelected().toHTML();

        editorTextArea.innerHTML = htmlString;

      } else {
        var customBlock = `<div class="my-block-class">
                My new block example
            </div>`;
        cssString = `.my-block-class {
              color: #555;
              font-size: 3rem;
              padding: 50px;
              text-align: center;
            }
            `;
        htmlString = customBlock;
        editorTextArea.innerHTML = htmlString;
      }

      if (data.fromTab == 3) {

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
            $("#CssStyleSave").val(raws_data.css);
            $("#HtmlStyleSave").val(raws_data.html);
            $("#block-name").val(raws_data.Name);
            $("#cat-value").val(raws_data.Category);
            $("textarea[name=description]").val(raws_data.Desciption);
            $("textarea[name=preview]").val(raws_data.Preview);
            console.log(raws_data);
         })
         .fail( ( response ) => {
           console.error('error ajax', response);
          });


          var html = $("#HtmlStyleSave").val();
          var css = $("#CssStyleSave").val();

          let content  = jQuery("<div/>").html(html).text();
          content = content.replace(/\\"/g, `"`);


          var customBlock = content;
          cssString = css;
          htmlString = customBlock;
          editorTextArea.innerHTML = htmlString;

        //request on edit
      }

      var cssTextArea = document.querySelector('[name="css"]');

      cssTextArea.innerHTML = cssString;
      codeViewer.init(editorTextArea);
      codeViewerCss.init(cssTextArea);
      codeViewer.setContent(htmlString);
      codeViewerCss.setContent(cssString);


      function setIframeContent(cssString, customBlock) {
        const iframeContent = document.querySelector('.gjs-frame').contentWindow
        const defaultRules = Array.from(iframeContent && iframeContent.document.querySelectorAll('.gjs-css-rules style')).map(style => style.textContent).join('');
        const source = `
          <html>
            <head><style>${defaultRules + ' ' + cssString}</style></head>
            <body>
              ${customBlock}
            </body>
          </html>
        `
        editorIframe.srcdoc = source
      }

    const updateInstance = (input_event, id) => {

        if (data.fromTab == 0) {
          let selComponent = editor.getSelected();
          id = selComponent.cid;
        }

        var cssString = codeViewerCss.getContent();
        var contentToSet = codeViewer.getContent();

   
        const validate = (e) => { 
          
          document.querySelectorAll('.error-notice').forEach( (elem) => {
              elem.remove();
          });

          const catValue = document.getElementById('cat-value');
          const blockName = document.getElementById('block-name');
          let validate = true;
          if (catValue.value === "") {  
            jQuery(`<div class="error-notice">Please enter category</div>`).insertAfter(jQuery(catValue));
            catValue.focus();
            validate =  false;
          }
          if (blockName.value === "") { 
            jQuery(`<div class="error-notice">Please enter block name</div>`).insertAfter(jQuery(blockName ));
            blockName.focus();
            validate =  false;
          } 

          return validate; 
        }

         
        window.formIsVaild  = true;
        document.getElementById('cat-value').addEventListener('change', () => {
           
          window.formIsVaild  =   validate(input_event);
        });

        document.getElementById('block-name').addEventListener('change', () => { 
          console.log('this text');
          window.formIsVaild =  validate(input_event);
        });

        window.formIsVaild  = validate(input_event);
        
        if ( !window.formIsVaild)
          return;

        editorTextArea = document.getElementById("html-code");
        editorTextArea.class = "input-box text-area-box";
        cssTextArea = document.getElementById("css-style");
        cssTextArea.class = "input-box text-area-box";
        console.log('test css', cssString);
        var blockName = document.getElementById("block-name").value;
        var description = $("textarea[name=description]").val();
        var cssString = codeViewerCss.getContent();
        let encodedHtml =  jQuery('<div />').text(contentToSet).html();
        var preview = $("textarea[name=preview]").val();

        let objToSave = {
          Basic: {
            title: blockName,
            label: blockName,
            content: description,
            Category: document.getElementById("cat-value").value,
            html: encodedHtml,
            css: cssString,
            blockType: "2",
            project: "Test Project",
            preview: preview,
            description: $("textarea[name=description]").val()
          },
          category: {
            id: "tab-custom-other-"+document.getElementById("cat-value").value,
            label: document.getElementById("cat-value").value,
          },
          attributes: {
            title: blockName,
          }
        };

         
      
        var id = $("#IDBlock").val();
        console.log(id);
        let objToBlockComp = {
          label: `<div>
          <img src="`+preview+`"/>
          <div class="my-label-block">`+blockName+`</div>
          <a class="edit-block-btn fa fa-edit" href="#" onClick="callEditBlock('`+id+`');"></a>
          </div>`,
          content: contentToSet+' <style>'+ cssString +'</style>',
          category: {
            id: "tab-custom-other-"+document.getElementById("cat-value").value,
            label: document.getElementById("cat-value").value,
          },
          attributes: {
            title: blockName,
          }
        };

        if (typeof (id) !== 'undefined'){
          objToSave['Basic']['id'] = id;
          //console.log(objToSave); 
          editor.BlockManager.get(id).set(objToBlockComp); 

        }else{
          let objToBlockComp = {
            label: `<div>
            <img src="`+preview+`"/>
            <div class="my-label-block">`+blockName+`</div>
            <a class="edit-block-btn fa fa-edit" href="#" onClick="callEditBlock('`+id+`');"></a>
            </div>`,
            content: contentToSet+' <style>'+ cssString +'</style>',
            category: {
              id: "tab-custom-other-"+document.getElementById("cat-value").value,
              label: document.getElementById("cat-value").value,
            },
            attributes: {
              title: blockName,
            }
          };
          //Create block for panel
          blockManager.creatingNewBlock(id, objToBlockComp,'custom');
        }

        //Save to API
        saveBlock(objToSave);

        $("#IDBlock").val("");
        //Close Modal
        editor.Modal.close();

      };
      window.updateInstance = updateInstance;

      window.openCity = (evt, cityName) => {
        var i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tabs_content");
        for (i = 0; i < tabcontent.length; i++) {
          tabcontent[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tabs_link");
        for (i = 0; i < tablinks.length; i++) {
          tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        document.getElementById(cityName).style.display = "block";

        if (evt && evt.currentTarget) {
          evt.currentTarget.className += " active";
        } else {
          evt.className += " active";
        }
      }

      openCity(document.querySelector(".tabs_link"), "tab-1");
      setTimeout(() => {
        //getInstanceValues(); this if for editing component
        codeViewer.editor.refresh();
        codeViewerCss.editor.refresh();
        setIframeContent(cssString, htmlString);

      },1);


      $('div.CodeMirror').mouseenter(function () {
        updateIframeContent();
      }).mouseleave(function () {
        updateIframeContent();
      });
    },
  });



  // Init default page by editor content
  editor.on('load', function (event) {

      // Rendering blocks
      blockManager.render();
      document.querySelector('#select-tab').selectedIndex = 0
      // Initializing of search handler
      blockManager.initSearchers();

      // Deleting old blocks button
      editor.Panels.removeButton('views', 'open-blocks');
      //
      editor.Panels.getButton('views', 'open-sm').set('active', true);
      // Open a panel
      editor.Commands.run('open-sm');

      document.querySelector('#add-custom-block').addEventListener('click', () => {
          editor.Commands.run('open-html-code-editor', {fromTab : 1} );
      });

      //Get block data to panel tabs:

      setTimeout( () => {
        var firstTimeBlocks = true;
        var firstTimeCustomBlocks = true;
        document.querySelector('#select-tab')
          .addEventListener("change", () => {
            let val = document.getElementById("select-tab").value;
            if (val == 1){
              tabManager.setCurrentTab('components');
            }
            if (val == 2){
              if(firstTimeBlocks) {
                let url = 'https://engine.cashngo.com.au/api/Communication/GetWorkflow?workflow=GetBlocks&BlockType=1';
                getBlocks(url, 'tab-blocks-other'); //data-tab-key="blocks" cоответствуют
                //должны добавляться
                firstTimeBlocks = false;
              }
              tabManager.setCurrentTab('blocks');
              addBtnEditEventHandler();
            }

              if (val == 3){
                tabManager.setCurrentTab('custom');
                if( firstTimeCustomBlocks) {
                let url = 'https://engine.cashngo.com.au/api/Communication/GetWorkflow?workflow=GetBlocks&BlockType=2';
                getBlocks(url, 'tab-custom-other');
                firstTimeCustomBlocks = false;
              }
              addBtnEditEventHandler();
            }
            if (val == 4 ){
              //get blocks of blocktype two
              tabManager.setCurrentTab('bootstrap');
            }
        });

      },
      100);

    });

  function callEditBlock(id){
    editor.Commands.run('open-html-code-editor', {fromTab : 3, id: id});
  }


  function updateIframeContent() {

    var editorIframe = document.querySelector('#iframe-editor');
    var cssString = codeViewerCss.getContent();
    var customBlock = codeViewer.getContent();

    const iframeContent = document.querySelector('.gjs-frame').contentWindow
    const defaultRules = Array.from(iframeContent && iframeContent.document.querySelectorAll('.gjs-css-rules style')).map(style => style.textContent).join('');
    const source = `
        <html>
          <head><style>${defaultRules + ' ' + cssString}</style></head>
          <body>
            ${customBlock}
          </body>
        </html>
      `
    editorIframe.srcdoc = source
  }

  function deleteItem(id){

    if (confirm('Are you sure you want to delete this block?')) {

      let objToDelete = {
        id: id
      };

      let url  =  'https://engine.cashngo.com.au/api/Communication/PostWorkflow?workflow=DeleteBlock';

       jQuery.ajax({
         type: 'POST',
         url: url ,
         data:  JSON.stringify(objToDelete),
         processData: false,
         contentType: 'application/json'
       })
         .done( ( response ) => {
           editor.BlockManager.remove(id);
       })
       .fail( ( response ) => {
         console.error('error ajax', response);
        });

        editor.Modal.close();
    }

  }
