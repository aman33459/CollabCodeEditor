var editor;
var language;
var output;
var input;
var times;
(function () {
  times=0;
  editor = CodeMirror.fromTextArea(document.getElementById('editor') , {
  lineNumbers: true,
  mode:  "javascript",
  theme: "dracula",
  matchBrackets: true,
  styleActiveLine: true,
  });
  language = 'javascript';
  editor.setSize(1500, 600);
  output = CodeMirror.fromTextArea(document.getElementById('output') , {
  mode:  "text/plain",
  theme: "dracula",
  });
  input = CodeMirror.fromTextArea(document.getElementById('input'), {
  lineNumbers: true,
  mode:  "javascript",
  theme: "dracula"
  });
  var id = getUrlParameter('id');
  if (!id) {
    location.search = location.search
      ? '&id=' + getUniqueId() : 'id=' + getUniqueId();
    return;
  }
  input.getWrapperElement().style.display="none";

  return new Promise(function (resolve, reject) {
    var pusher = new Pusher('99114c8a4e08776d1f8a',{
  cluster: 'ap2'
});
    var channel = pusher.subscribe(id); // changes made to this id
    channel.bind('client-text-edit', function(html) {
      console.log(html.editor);
      console.log(html.lang);
      var lang = html.lang;
      var pos = editor.getCursor();
      editor.setValue(html.editor);
      if(lang == 'c') editor.setOption("mode","text/x-csrc");
      else if(lang == 'c++') editor.setOption("mode","text/x-c++src");
      else if(lang == 'java') editor.setOption("mode","text/x-java");
      else if(lang == 'javascript') editor.setOption("mode","javascript");
      else editor.setOption("mode","text/x-python");
      editor.setSelection(pos);
      var sel = document.getElementById("langu");
      sel.value = lang;
      console.log(sel.options[sel.selectedIndex].value);
    });
    channel.bind('pusher:subscription_succeeded', function() {
      resolve(channel);
    });
  }).then(function (channel) {
    function triggerChange (e) {
      var data = {};
      data['editor'] = e.getValue();
      data['lang'] = language;
      channel.trigger('client-text-edit', data);
    }
    editor.on('inputRead' , triggerChange);
  })

  function getUniqueId () {
    return 'private-' + Math.random().toString(36).substr(2, 9);
  }
  function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }
})();

function langChanged(){
  var e = document.getElementById("langu");
  var lang = e.options[e.selectedIndex].value;
  console.log(lang);
  language=lang;
  if(lang == 'c') editor.setOption("mode","text/x-csrc");
  else if(lang == 'c++') editor.setOption("mode","text/x-c++src");
  else if(lang == 'java') editor.setOption("mode","text/x-java");
  else if(lang == 'javascript') editor.setOption("mode","javascript");
  else editor.setOption("mode","text/x-python");
}
function getOutput(text){
  var data = null;
  console.log(text);
  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
      console.log(this.responseText);
      var str = JSON.parse(this.responseText);
      console.log(str.status.description);
      if(str.status.description == "Processing"){
        getOutput(text);
      }
      else if(str.status.description == "Accepted"){
        output.setValue(str.stdout + "\n\n" + "Time in secs\n\n" + str.time);
      }
      else if( str.status.description == "Compilation Error"){
          output.setValue(str.compile_output);
      }
    }
  });

  xhr.open("GET", "https://judge0-extra.p.rapidapi.com/submissions/"+text);
  xhr.setRequestHeader("x-rapidapi-host", "judge0-extra.p.rapidapi.com");
  xhr.setRequestHeader("x-rapidapi-key", "1c1573a73bmshcaa25526a644b60p1a3f21jsnbd7e7f3058bf");

  xhr.send(data);
}
function exec(){
  var language_id = -1;
  var text = editor.getValue();
  if(language == 'c'){
    language_id = 1;
  }
  else if(language == 'c++'){
    language_id=2
  }
  else if(language == 'java'){
    language_id=4
  }
  else if(language == 'python'){
    language_id=8;
  }
  else alert("Cant't compile javascript");
  if(language_id == -1) return;
  /*console.log(text);
  console.log(language_id);*/
  val = input.getValue();
  var data = JSON.stringify({
    "language_id": language_id,
    "source_code": text,
    "stdin" : val
  });

  var xhr = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
      console.log(this.responseText);
      ok= this.responseText;
      console.log(JSON.parse(ok).token);
      getOutput(JSON.parse(ok).token);
    }
  });

  xhr.open("POST", "https://judge0-extra.p.rapidapi.com/submissions");
  xhr.setRequestHeader("x-rapidapi-host", "judge0-extra.p.rapidapi.com");
  xhr.setRequestHeader("x-rapidapi-key", "1c1573a73bmshcaa25526a644b60p1a3f21jsnbd7e7f3058bf");
  xhr.setRequestHeader("content-type", "application/json");
  xhr.setRequestHeader("accept", "application/json");

  xhr.send(data);
}
function toggleTextArea(){
  times++;
  if(times%2 == 1)
      input.getWrapperElement().style.display="block";
  else input.getWrapperElement().style.display="none";
}
