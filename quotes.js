/// <reference path="jquery.d.ts" />

$(document).ready( function () {
	$("#btnQuote").on("click",getQuote);
	getQuote();
});

var CurrentQuote = "";
var CurrentAuthor = "";

function UpdateUI(quote, author) {
	if (quote !== undefined) {
		CurrentQuote = quote;
		CurrentAuthor = author;
	}
	$('#divQuote').html(CurrentQuote);
	$('#divAuthor').html(CurrentAuthor);
	$("#linkTwitter").attr("href",GetTweetQuoteLink());
}

function getQuote(e) {
    if (e) {
		e.preventDefault();
	}
    $.ajax( {
      url: 'http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1',
      success: function(data) {
        var post = data.shift(); // The data is an array of posts. Grab the first one.
	   //console.log(JSON.stringify(post));
	   UpdateUI($(post.content).text(), post.title);
      },
      cache: false
    });
  }

function GetTweetQuoteLink() {
	var q = encodeURIComponent("\"" + CurrentQuote + "\" - " + CurrentAuthor);
	return "https://twitter.com/intent/tweet?hashtags=quotes&related=freecodecamp&text=" + q; 
}
