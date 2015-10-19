function ajaxOrder() {

  // Класс ajaxRequests, каждый объект содержит запросы с данным request_id
  this.ajaxRequests = function (ajax_data) {

    // Уникальный среди подобных объектов request_id
    this.request_id = ajax_data.request_id;
    // Список запросов, которые нужно обработать
    this.requests = new Array ();
    // Список обработанных запросов
    this.recent_requests = new Array ();

    // Добавляем запрос, который нужно обработать
    this.addAjax = function (ajax_data) {
      this.requests[this.requests.length] = ajax_data;
    }

    // Выполняем обработчик переданного запроса и помечаем как выполненный
    this.runCallback = function (ajax_data) {
      ajax_data.callback_done = true;
      window.setTimeout(ajax_data.callback, 1, ajax_data.result);
    }

    // Обрабатывает запросы
    // Если в очереди запрос, который нужно отправить, возвращает его
    // Если нет запросов в очереди, возвращает false
    // Если в очереди запрос, который уже удовлетворен, возвращает true
    this.hasRequests = function () {
      var requests_key;
      var old_request;
      var old_request_key;
      if (!this.requests.length) {
        return false;
      }
      // Обходим
      for (requests_key = 0; requests_key < this.requests.length; requests_key++) {
        // Если данный запрос и обработчик уже выполнены
        if (this.requests[requests_key].callback_done) {
          this.recent_requests[this.recent_requests.length] = this.requests[requests_key];
          this.requests.splice(requests_key, 1);
          requests_key--;
          continue;
        }

        // Если данный запрос уже выполнялся ранее
        if (this.requests[requests_key].type == "exist") {
          // Если name пуст, надо выполнить обработчик данного запроса с ответом последнего старого запроса и сдалать return true
          if (!this.requests[requests_key].name) {
            this.requests[requests_key].result = this.recent_requests[this.recent_requests.length - 1].result;
            this.runCallback(this.requests[requests_key]);
            return true;
          }

          // Тут надо проверить, был ли запрос с данным name
          old_request = false;
          for (old_request_key = (this.recent_requests.length - 1); old_request_key >= 0; old_request_key--) {
            if (this.requests[requests_key].name == this.recent_requests[old_request_key].name) {
              old_request = this.recent_requests[old_request_key];
              break;
            }
          }

          // Если был с данным name, надо выполнить обработчик данного запроса с ответом старого запроса с данным name и сдалать return true
          if (old_request) {
            this.requests[requests_key].result = old_request.result;
            this.runCallback(this.requests[requests_key]);
            return true;
          }

          // Если не было с данным name, надо пометить данный запрос, как новый и сдалать return этот запрос
          this.requests[requests_key].type = "new";
          return this.requests[requests_key];
        }
        // Если данный запрос новый или нужно получить его по новой
        if ((this.requests[requests_key].type == "new" ||
             this.requests[requests_key].type == "update") &&
             !this.requests[requests_key].done &&
             !this.requests[requests_key].in_progress) {
          return this.requests[requests_key];
        }
        // Если данный запрос уже в процессе
        if (this.requests[requests_key].in_progress) {
          return false;
        }
        // Если данный запрос уже выполнен и обработчик ожидает запуска
        if (this.requests[requests_key].done &&
            !this.requests[requests_key].callback_done) {
          this.runCallback(this.requests[requests_key]);
          return true;
        }
      }
      return false;
    }

    this.addAjax(ajax_data);
  }

  // Класс ajaxData содержит всё в отношении данного запроса
  this.ajaxData = function () {
    this.name = "";
    this.url = "";
    this.request = new Object ();
    this.request_id = "";
    this.result = new Object ();
    this.callback = new Array ();
    this.update = false;
    this.in_progress = false;
    this.callback_done = false;
    this.done = false;
    this.type = "new";
  }

  // Массив для элементов ajaxRequests
  this.order = new Array ();

  // Создаем новый запрос
  this.start = function (set_data) {

    // Следим за запросами
    this.startWatch();
    var ajax_data = new this.ajaxData();

    // Устанавливаем переданные параметры и параметры по-умолчанию
    ajax_data.url = typeof set_data.url == "undefined" ? "./" : set_data.url;
    ajax_data.name = typeof set_data.name == "undefined" ? "" : set_data.name;
    ajax_data.request = typeof set_data.request == "undefined" ? new Object () : set_data.request;
    ajax_data.callback = typeof set_data.callback == "undefined" ? false : set_data.callback;
    var update = typeof set_data.update != "undefined" && set_data.update;
    ajax_data.request_id = ajax_data.url + ";" + JSON.stringify(ajax_data.request);

    // Проверяем, были ли подобные запросы
    var have_exists = false;
    for (var ajax_order_key = 0; ajax_order_key < this.order.length; ajax_order_key++) {
      if (this.order[ajax_order_key].request_id == ajax_data.request_id) {
        have_exists = ajax_order_key;
        break;
      }
    }

    if (have_exists === false) {
      // Новый request_id
      this.order[this.order.length] = new this.ajaxRequests(ajax_data);
      return true;
    }

    if (!update) {
      // Старый request_id, используем старый ajaxRequests с данным name или запустим заново если нет такого name
      ajax_data.type = "exist";
      this.order[have_exists].addAjax(ajax_data);
      return true;
    }

    ajax_data.type = "update";
    ajax_data.update = true;
    this.order[have_exists].addAjax(ajax_data);
    return true;
  }

  // Отправляем данный запрос
  this.makePost = function (ajax_data) {
    ajax_data.done = false;
    ajax_data.result = new Object ();
    ajax_data.in_progress = true;
    ajax_data.callback_done = false;
    $.ajax({
      type: 'POST',
      context: ajax_data,
      url: ajax_data.url,
      data: ajax_data.request,
      success: this.end,
      error: this.end,
      dataType: 'json'
    });
  }

  // Ответ на запрос получен
  this.end = function (result) {
    this.done = true;
    this.in_progress = false;
    this.callback_done = false;
    this.result = result;
  }

  this.watch = false;

  this.startWatch = function () {
    if (this.watch) {
      return false;
    }

    this.watch = true;
    window.setInterval(this.intervalWatch, 100, this);
    return true;
  }

  // Периодически проверяем состояние запросов
  this.intervalWatch = function (el) {
    var ajax_data;
    // Обходим очереди запросов
    for (var ajax_order_key = 0; ajax_order_key < el.order.length; ajax_order_key++) {
      // Если данная очередь содержит запросы
      // Запрашиваем очередь на вопрос наличия запросов для выполнения
      while ((ajax_data = el.order[ajax_order_key].hasRequests())) {
        // Если данный запрос выполнен ранее, пропускаем его
        if (ajax_data === true) {
          continue;
        }
        // Если нужно выполнить данный запрос, выполняем
        el.makePost(ajax_data);
        // Переходим к следующей очереди
        break;
      }
    }

    return false;
  }

}
