(function () {
  var editor = CodeMirror.fromTextArea(document.getElementById('editor') , {
  lineNumbers: true,
  mode:  "javascript",
  theme: "dracula"
  });
  editor.setSize(1500, 600);
  var id = getUrlParameter('id');
  if (!id) {
    location.search = location.search
      ? '&id=' + getUniqueId() : 'id=' + getUniqueId();
    return;
  }

  return new Promise(function (resolve, reject) {
    var pusher = new Pusher('99114c8a4e08776d1f8a',{
  cluster: 'ap2'
});
    var channel = pusher.subscribe(id); // changes made to this id
    channel.bind('client-text-edit', function(html) {
      console.log(html);
      var pos = editor.getCursor();
      editor.setValue(html);
        editor.setSelection(pos);
    });
    channel.bind('pusher:subscription_succeeded', function() {
      resolve(channel);
    });
  }).then(function (channel) {
    function triggerChange (e) {
      channel.trigger('client-text-edit', e.getValue());
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
