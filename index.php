<?php
  if (isset ($_POST['testvar'])) {
    switch ($_POST['testvar']) {
      case 'test val':
        sleep(2);
        echo json_encode(array ('message' => 'test val, ' . md5(microtime())));
        break;
      case 'new test val':
        sleep(1);
        echo json_encode(array ('message' => 'new test val, ' . md5(microtime())));
        break;
      default:
        echo json_encode(array ('message' => 'empty post, ' . md5(microtime())));
        break;
    }
    exit;
  }
?>
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>ajaxOrder test page</title>
    <script type="text/javascript" src="http://www.google.com/jsapi"></script>
    <script type="text/javascript" src="js/ajaxOrder.js"></script>
    <script>
      // Загружаем jquery
      google.load("jquery", "1.7.1");
      google.setOnLoadCallback(init_jquery);

      function init_jquery() {
        $(document).
          ready(function () {
                  var new_ajax = new ajaxOrder ();
                  new_ajax.start({
                                   name: 'test val ajax',
                                   request: {testvar: 'test val'},
                                   callback: function (data) { console.log("data1 =", data); }
                                 });
                  new_ajax.start({
                                   name: 'test val ajax',
                                   request: {testvar: 'test val'},
                                   callback: function (data) { console.log("data2 =", data); }
                                 });
                  new_ajax.start({
                                   name: 'new test val ajax',
                                   request: {testvar: 'new test val'},
                                   callback: function (data) { console.log("new data1 =", data); }
                                 });
                  new_ajax.start({
                                   name: '',
                                   request: {testvar: 'test val'},
                                   callback: function (data) { console.log("data3 =", data); }
                                 });
                  new_ajax.start({
                                   name: 'test val ajax',
                                   request: {testvar: 'test val'},
                                   callback: function (data) { console.log("data1 updated =", data); },
                                   update: true
                                 });
                  new_ajax.start({
                                   name: 'test val ajax',
                                   request: {testvar: 'test val'},
                                   callback: function (data) { console.log("data1 updated2 =", data); },
                                   update: true
                                 });
                  new_ajax.start({
                                   name: 'new test val ajax 2',
                                   request: {testvar: 'new test val'},
                                   callback: function (data) { console.log("new data2 =", data); }
                                 });
                  new_ajax.start({
                                   name: 'new test val ajax 2',
                                   request: {testvar: 'new test val'},
                                   callback: function (data) { console.log("new data3 =", data); },
                                   update: true
                                 });
                  new_ajax.start({
                                   name: 'new test val ajax 2',
                                   request: {testvar: 'new test val'},
                                   callback: function (data) { console.log("new data4 =", data); }
                                 });
                  console.log("new_ajax =", new_ajax);
                });
      }
    </script>
  </head>
  <body>
    <div class="message"></div>
  </body>
</html>
