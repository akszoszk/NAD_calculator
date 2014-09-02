var $textBox;

$(document).ready(function() {
    $textBox = $("#clusters");
    
    /*function saveSelection(){
        $textBox.data("lastSelection", $textBox.getSelection());
    }
    
    $textBox.focusout(saveSelection);
    
    $textBox.bind("beforedeactivate", function() {
        saveSelection();
        $textBox.unbind("focusout");
    });*/
});
/* doesn't work on FF
function insertText(text) {
    var selection = $textBox.data("lastSelection");
    $textBox.blur(function (event) {
    setTimeout(function () { $textBox.focus(); }, 20);
	});
    $textBox.setSelection(selection.start, selection.end);
    $textBox.replaceSelectedText(text);
}

//insert content of button in keyboard when pressed
$('#keyboard-placeholder').on('click', 'button', function() {
	if ($(this).html() === "VOWEL") {
		insertText("V");
	}
	else {
		insertText($(this).html());
	}
});
*/

//works on all browsers
$(document).ready(function() {
    $('#keyboard-placeholder').on('click', 'button', function() {
    	if ($(this).html() === "VOWEL") {
    		$textBox.insertAtCaret("V");
    	}
    	else {
       		$textBox.insertAtCaret($(this).text());
       	}
        return false;
    });
});
$.fn.insertAtCaret = function(myValue) {
    return this.each(function() {
        //IE support
        if (document.selection) {
            this.focus();
            sel = document.selection.createRange();
            sel.text = myValue;
            this.focus();
        }
        //MOZILLA / NETSCAPE support
        else if (this.selectionStart || this.selectionStart == '0') {
            var startPos = this.selectionStart;
            var endPos = this.selectionEnd;
            var scrollTop = this.scrollTop;
            this.value = this.value.substring(0, startPos) + myValue + this.value.substring(endPos, this.value.length);
            this.focus();
            this.selectionStart = startPos + myValue.length;
            this.selectionEnd = startPos + myValue.length;
            this.scrollTop = scrollTop;
        } else {
            this.value += myValue;
            this.focus();
        }
    });
};

//highlight columns and rows when modifying NAD values
$('body').on('focus', 'input[type=number]', function() {
	//if clicked on horizontal values
	if ($(this).attr("class") == "moa") {
		//specify the position of the column clicked
   		var thisIndex = $(this).parent().parent().children().index($(this).parent());
    	//iterate through each row
    	$(this).parent().parent().parent().children('tr').each(function () {
    		//iterate td row
    		$(this).find('td').each(function (index, element) {
    			//if a button if in the same column as the column clicked
				if ($(this).parent().children().index($(this)) === thisIndex) {
					//add highlight
					$(this).addClass('highlight');
				}
			});
		});
	}
	//else if clicked on vertical values
    else if ($(this).attr("class") == "poa") {
		//specify the position of the column clicked
  		var thisIndex = $(this).parent().parent().parent().children().index($(this).parent().parent());
    	//iterate through each row
    	$(this).parent().parent().parent().children('tr').each(function () {
    		//iterate through cell
    		$(this).find('td').each(function (index, element) {
    			//if a button if in the same column as the column clicked
				if ($(this).parent().parent().children().index($(this).parent()) === thisIndex) {
					//add highlight
					$(this).addClass('highlight')
				}
			});
		});
  	}
});

$('body').on('blur', 'input[type=number]', function() {
	$('td').removeClass('highlight');
});

$('body').tooltip({
	selector: ".moa",
	placement: "top",
	title: "input value for highlighted segments",
	trigger: "focus"
});

$('#keyboard-placeholder').tooltip({
	selector: ".poa",
	placement: "right",
	title: "input value for highlighted segments",
	trigger: "focus"
});