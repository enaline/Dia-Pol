(function () {
  var el = function (id) { return document.getElementById(id); };
  var response = el('response');
  var renderCount = 0;

  function syncFields() {
    var type = el('resulttype').value;
    var period = el('period').value;
    el('ngramdiv').hidden = type !== 'n';
    el('themecountdiv').hidden = type !== 't';
    el('yeardiv').hidden = period === 'A';
    el('monthdiv').hidden = period !== 'M';
  }

  function resultFile() {
    var type = el('resulttype').value;
    var period = el('period').value;
    var value = type === 't' ? el('themecount').value : el('ngram').value;
    var name = 'd' + el('dataset').value + '_' + type + value + '_' + period;
    if (period !== 'A') name += '_' + el('year').value;
    if (period === 'M') name += '_' + ('0' + el('month').value).slice(-2);
    return 'data/' + name + '.json';
  }

  function showTable(rec) {
    var title = document.createElement('h2');
    title.textContent = rec.title;
    var table = document.createElement('table');
    var headRow = table.createTHead().insertRow();
    rec.head.forEach(function (text) {
      var th = document.createElement('th');
      th.textContent = text;
      headRow.appendChild(th);
    });
    var body = table.createTBody();
    rec.rows.forEach(function (row) {
      var tr = body.insertRow();
      row.forEach(function (text) { tr.insertCell().textContent = text; });
    });
    response.append(title, table);
  }

  function showMessage(text) {
    var p = document.createElement('p');
    p.textContent = text;
    response.appendChild(p);
  }

  function showResult(rec) {
    response.textContent = '';
    if (rec.kind === 'table') {
      showTable(rec);
    } else if (rec.kind === 'lda') {
      var holder = document.createElement('div');
      holder.id = 'ldavis_' + (++renderCount);
      response.appendChild(holder);
      new LDAvis('#' + holder.id, rec.data);
    } else {
      showMessage(rec.text);
    }
  }

  el('resulttype').addEventListener('change', syncFields);
  el('period').addEventListener('change', syncFields);
  el('output-form').addEventListener('submit', function (e) {
    e.preventDefault();
    fetch(resultFile())
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(showResult)
      .catch(function () {
        response.textContent = '';
        showMessage('This result could not be loaded.');
      });
  });
  syncFields();
})();
