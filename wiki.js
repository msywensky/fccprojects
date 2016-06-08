/// <reference path="jquery.d.ts" />

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

$(document).ready(function() {
  $('#txtSearch').keyup(function(e){
      if(e.keyCode == 13)
      {
          $(this).trigger("enterKey");
      }
  });
  $("#txtSearch").bind("enterKey", function(e) {
    search(false);
  });

  $("#btnSearch").on("click",function(e) {
    search(false);
  });
  
  $("#btnLucky").on("click", function(e) {
    search(true);
  });

});

function search(lucky) {
    var term = $("#txtSearch").val();
    resetResult();
    if (term.trim() === "") {
      return;
    }

  $.ajax({
    url: '//en.wikipedia.org/w/api.php',
    data: { 
      action: 'query', 
      list: 'search', 
      srsearch: term, 
      format: 'json' 
    },
    dataType: 'jsonp',
    success: function (x) {
      if (lucky) {
        window.location.href = "https://en.wikipedia.org/wiki/" 
        + x.query.search[0].title.replaceAll(" ","_");
        return;
      }
      x.query.search.forEach(function(item) {
        console.log(item.title + ": " + item.snippet);
        console.log(JSON.stringify(item));
        appendResult(item);
      });
      //console.log('title', x.query.search[0].title);
    }
  });
}

function resetResult() {
  $("#divResults").empty();
  
}

function appendResult(item) {
  var divResults = $("#divResults");
  var link = "https://en.wikipedia.org/wiki/" + item.title.replaceAll(" ","_");
  var sNewDiv = "<div class='result'>" 
  + "<a class='aResult' href='" + link + "'><div class='title'>" + item.title + "</div>"
    + "<div class='snippet'>" + item.snippet + "</div></a></div>";
  divResults.append($(sNewDiv));
  
}

//'https://en.wikipedia.org/w/api.php?format=json&action=query&generator=search&gsrnamespace=0&gsrlimit=10&prop=pageimages|extracts&pilimit=max&exintro&explaintext&exsentences=1&exlimit=max&gsrsearch=';