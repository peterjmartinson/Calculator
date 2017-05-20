/**
 * wiki.js
 *
 * 1. Search Wikipedia entries in a search box and see the resulting
 *    Wikipedia entries.
 * 2. Click a button to see a random Wikipedia entry.
 * 3. Clicking on an article opens a new window with Wikipedia
*/

(function() {
console.log("in wiki.js");

  var dom = {};
  dom.instructions = document.getElementById("instructions");
  dom.results      = document.getElementById("results");
  dom.search       = document.getElementById("search-button");
  dom.random       = document.getElementById("random-button");

  // ===  DEFINE FUNCTIONS  =======================================

  /**
   * Insert items into the DOM
  */
  function populateDOM() {
    dom.instructions.innerHTML  = 'instructions';
    dom.results.innerHTML       = 'results';
  }

  /**
   * Open a new page with a random Wikipedia article
  */
  function getRandomArticle() {
    var random_url = 'https://en.wikipedia.org/wiki/Special:Random';
    window.open(random_url,'_blank');
  }

  /**
   * create an unordered list of search results
   * @param {object} res - the AJAX response object
  */
  function listResults(res) {
    var list = '<ul>';
    res.query.search.forEach(function(e) {
      var list_element = '';
      list_element += '<li>';
      list_element += '  <strong>' + e.title + '</strong><br>';
      list_element += '  <em>' + e.snippet + '</em>';
      list_element += '</li>';
      list += list_element;
    });
    list += '</ul>';
    return list;
  }

  function returnOne() {
    return 1;
  }

  // ===  RUN THE PROGRAM ========================================
  populateDOM();


  $("#random").on("click", getRandomArticle);
  // dom.random.onclick = getRandomArticle();


  dom.search.onclick = function() {
    var val = dom.search.form.searchy.value.replace(/\s+/g,'%20');
    var wiki_url = 'https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=' + val;
    // var wiki_url = 'https://en.wikipedia.org/w/api.php?action=query&format=json&list=alllinks&srsearch=' + val;
    dom.results.innerHTML = 'Searching...';

    $.get(wiki_url, function(response) {
      dom.results.innerHTML = listResults(response);

      for (var key in response.query.search[0]) {
        var property = response.query.search[0][key];
        console.log(key + ' : ' + property);
      }

      // console.log(response.query.search[0].title);
      // console.log(response.query.search[0].snippet);
    });

    // var mock_results = {query:{search:[
    //   {
    //     title : 'First result',
    //     snippet : 'Lorem facilis nobis earum alias unde fugit! Modi enim'
    //   },
    //   {
    //     title : 'Second result',
    //     snippet : 'et inventore ab amet eius. Odit culpa eum excepturi quasi '
    //   },
    //   {
    //     title : 'Third result',
    //     snippet : 'rem suscipit omnis minima in cumque pariatur suscipit? Eum eaque '
    //   },
    //   {
    //     title : 'Fourth result',
    //     snippet : 'culpa sequi dicta voluptates odit est? Explicabo enim natus quo dolorum'
    //   }
    // ]}};

    // dom.results.innerHTML = listResults(mock_results);
  }

}());
