//load default keyboard and nad settings 
var data = {}
$(document).ready(function() {
    $("#keyboard-placeholder").load("db/eng-new.html");
  	segments = (function () {
    segments = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': 'db/eng-new.json',
        'dataType': "json",
        'success': function (data) {
            segments = data;
        }
    });
    return segments;
})(); 
});

//load  keyboard and nad settings when language changed
$('#db').change(function() {
	var lang = $('#db').val();
	$("#keyboard-placeholder").load("db/"+lang+".html");
  	segments = (function () {
    segments = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': 'db/'+lang+'.json',
        'dataType': "json",
        'success': function (data) {
            segments = data;
        }
    });
    console.log(segments);
    return segments;
})(); 
});

//replace non-ligatures with temporary symbols
function tempSymbols(cluster) {
	var mapObj = {
  	t͡ʂ:"T",
 	d͡ʐ:"D",
   	j̃:"J",
   	w̃:"W",
   	t̪:"T",
   	d̪:"D",
   	ʦ̪: "C", 
   	ʣ̪: "Q",
   	pf : "P",
	};
	cluster = cluster.replace(/t͡ʂ|d͡ʐ|j̃|w̃|t̪|d̪|ʦ̪|ʣ̪|pf/gi, function(matched){
  	return mapObj[matched];
	});
	return cluster;
}

//identify cluster type and return error if cluster is invalid
function identifyCluster(cluster) {
	var noOfConsonants = 0;
	var initialVowel = 0;
	var finalVowel = 0;
	cluster = tempSymbols(cluster);
	//checks whether character is a vowel
	function isVowel(segment) {
		if (segments.segments[segment].isVowel) {
			return true;
		}
		else {
			return false;
		}
	}
	for (var i = 0, len = cluster.length; i < len; i++) {	
		if (!segments.segments[cluster[i]]) {
			return "contains illegal characters";
		}
  		else if (isVowel(cluster[i])) {
  			if (i === 0) {
  				initialVowel = initialVowel + 1;
  			}
  			else if (i = cluster.length) {
  				finalVowel = finalVowel + 1;
  			}
  			else {
  				return "not a cluster";
  			}
  		}
  		else {
  			noOfConsonants = noOfConsonants + 1;
  		}
	}
	if (cluster.length === 0) {
			return "no cluster specified";
		}
	if (initialVowel === 1 && finalVowel === 1) {
		if (noOfConsonants < 2) {
			return "not a cluster";
		}
		if (noOfConsonants === 2) {
			return "VCCV";
		}
		if (noOfConsonants === 3) {
			return "VCCCV";
		}
		else {
			return "cluster too big";		
		}
	}
	else if (initialVowel === 1 && finalVowel === 0) {
		if (noOfConsonants < 2) {
			return "not a cluster";
		}
		if (noOfConsonants === 2) {
			return "VCC";
		}
		if (noOfConsonants === 3) {
			return "VCCC";
		}
		else {
			return "cluster too big";		
		}
	}
	else if (initialVowel === 0 && finalVowel === 1) {
		if (noOfConsonants < 2) {
			return "not a cluster";
		}
		if (noOfConsonants === 2) {
			return "CCV";
		}
		if (noOfConsonants === 3) {
			return "CCCV";
		}
		else {
			return "cluster too big";		
		}
	}
	else {
		return "position of vowel(s) not specified";
	}
}

//calculate NAD value based on cluster type
function calculateNAD(cluster) {
	cluster = tempSymbols(cluster);
	var clusterType = identifyCluster(cluster);
	var includeSonority = $('#include-sonority').is(':checked');

	//formula for calculating NAD between two consonants
	function calcnadCC(C1,C2) {
		return calcnad(C1,C2);
	}
	//formula for calculating NAD between a consonant and vowel
	function calcnadCV(C,V) {
		return calcnad(C,V);
	}
	//generic formula to calculate nad
	function calcnad(a,b) {
		var nad;
		if (a.poa == 0 || b.poa == 0) {
			nad = Math.abs(a.moa - b.moa);
		}
		else {
			nad = Math.abs(a.moa - b.moa) + Math.abs(a.poa - b.poa);
		}
		if (includeSonority && a.son !== b.son) {
			nad += 1;
		}
		return nad;
	}

	function roundedValue(input) {
		return Math.round((input + 0.00001) * 100) / 100;
	}
	var result = "";
	var nadC1C2 = 0;
	var nadC2C3 = 0;
	var nadCV = 0;
	var nadVC = 0;
	var preference = "-";
	var nadProduct = "-";
	switch(clusterType) 
	{
	case "CCV":
		nadC1C2 = calcnadCC(segments.segments[cluster[0]],segments.segments[cluster[1]]);
		nadCV = calcnadCV(segments.segments[cluster[1]],segments.segments[cluster[2]]);
		nadProduct = nadC1C2 - nadCV;
		if (nadC1C2 >= nadCV) {
			preference = "Yes";
		}
		else {
			preference = "No";
		}
		result = "<td>-</td><td>"+roundedValue(nadC1C2)+"</td><td>-</td><td>"+roundedValue(nadCV)+"</td><td>"+roundedValue(nadProduct)+"</td><td class='nad'>"+preference+"</td>"
		return result;
	case "VCC":
		nadC1C2 = calcnadCC(segments.segments[cluster[1]],segments.segments[cluster[2]]);
		nadVC = calcnadCV(segments.segments[cluster[0]],segments.segments[cluster[1]]);
		nadProduct = nadC1C2 - nadVC;
		if (nadC1C2 >= nadVC) {
			preference = "Yes";
		}
		else {
			preference = "No";
		}
		return "<td>"+roundedValue(nadVC)+"</td><td>"+roundedValue(nadC1C2)+"</td><td>-</td><td>-</td><td>"+roundedValue(nadProduct)+"</td><td class='nad'>"+preference+"</td>";
	case "VCCV":
		nadVC = calcnadCV(segments.segments[cluster[0]],segments.segments[cluster[1]]);
		nadCV = calcnadCV(segments.segments[cluster[2]],segments.segments[cluster[3]]);
		nadC1C2 = calcnadCC(segments.segments[cluster[1]],segments.segments[cluster[2]]);
		nadProduct = ((nadVC - nadC1C2) + (nadCV - nadC1C2)) / 2;
		if (nadVC >= nadC1C2 && nadC1C2 < nadCV && nadC1C2 > 0) {
			preference = "Yes";
		}
		else {
			preference = "No";
		}
		return "<td>"+roundedValue(nadVC)+"</td><td>"+roundedValue(nadC1C2)+"</td><td>-</td><td>"+roundedValue(nadCV)+"</td><td>"+roundedValue(nadProduct)+"</td><td class='nad'>"+preference+"</td>";
	case "CCCV":
		nadC1C2 = calcnadCC(segments.segments[cluster[0]],segments.segments[cluster[1]]);
		nadC2C3 = calcnadCC(segments.segments[cluster[1]],segments.segments[cluster[2]]);
		nadCV = calcnadCV(segments.segments[cluster[2]],segments.segments[cluster[3]]);
		nadProduct = ((nadC2C3 - nadC1C2) + (nadC2C3 - nadCV)) / 2;
		if (nadC1C2 < nadC2C3 && nadC2C3 >= nadCV) {
			preference = "Yes";
		}
		else {
			preference = "No";
		}
		result = "<td>-</td><td>"+roundedValue(nadC1C2)+"</td><td>"+roundedValue(nadC2C3)+"</td><td>"+roundedValue(nadCV)+"</td><td>"+roundedValue(nadProduct)+"</td><td class='nad'>"+preference+"</td>"
		return result;
	case "VCCC":
		nadC1C2 = calcnadCC(segments.segments[cluster[1]],segments.segments[cluster[2]]);
		nadC2C3 = calcnadCC(segments.segments[cluster[2]],segments.segments[cluster[3]]);
		nadVC = calcnadCV(segments.segments[cluster[0]],segments.segments[cluster[1]]);;
		nadProduct = ((nadC1C2 - nadVC) + (nadC1C2 - nadC2C3)) / 2;
		if (nadVC <= nadC1C2 && nadC1C2 > nadC2C3) {
			preference = "Yes";
		}
		else {
			preference = "No";
		}
		result = "<td>"+roundedValue(nadVC)+"</td><td>"+roundedValue(nadC1C2)+"</td><td>"+roundedValue(nadC2C3)+"</td><td>-</td><td>"+roundedValue(nadProduct)+"</td><td class='nad'>"+preference+"</td>"
		return result;
	case "VCCCV":
		nadC1C2 = calcnadCC(segments.segments[cluster[1]],segments.segments[cluster[2]]);
		nadC2C3 = calcnadCC(segments.segments[cluster[2]],segments.segments[cluster[3]]);
		nadVC = calcnadCV(segments.segments[cluster[0]],segments.segments[cluster[1]]);
		nadCV = calcnadCV(segments.segments[cluster[3]],segments.segments[cluster[4]]);
		if (nadVC >= nadC1C2 && nadC2C3 < nadCV) {
			preference = "Yes";
		}
		else {
			preference = "No";
		}
		var product = nadProduct // no rounding because value is not available
		result = "<td>"+roundedValue(nadVC)+"</td><td>"+roundedValue(nadC1C2)+"</td><td>"+roundedValue(nadC2C3)+"</td><td>"+roundedValue(nadCV)+"</td><td>"+product+"</td><td class='nad'>"+preference+"</td>"
		return result;
	default:
		return "-";
 	}
}

//iterate through each line in text area when Calculate clicked
$('#target').click(function() {	
	//clear table
	$('#result table tbody').html('');
	var cluster = $('#clusters').val().split('\n');
	$.each(cluster, function(){
		$('#result table tbody').append('<tr><td>'+this+'</td><td>'+identifyCluster(this)+'</td>'+calculateNAD(this)+'<tr>');
	});
	//colour table rows based on nad value
	$("#result table .nad").each( function() {
		var thisCell = $(this);
		var cellValue = thisCell.text();
		if (cellValue === "Yes") {
			thisCell.parent().addClass("success");
		}
		else if (cellValue === "No") {
			thisCell.parent().addClass("error");
		}
		else {
			return false;
		}
  	});
});

//clear textarea when Clear is pressed
$('#remove').click(function() {
	$('#clusters').val('');
});

//clear table when Clear table is pressed
$('#clear-table').click(function() {
	$('#result table tbody').html('');
});

//prevent user from inputing non-digit characters in NAD values
$('body').on('keypress','input[type=number]',function(event) {
    //Only allow period and numbers
    if ((event.which != 46 || $(this).val().indexOf('.') != -1) && (event.which < 48 || event.which > 57)) {
        event.preventDefault();
    }
    //Prevent a period being entered first
    else if (event.which == 46 && $(this).val().length == 0) {
        event.preventDefault();
    }
    //Only one number after a decimal
    else if (($(this).val().indexOf('.') != -1) && ($(this).val().substring($(this).val().indexOf('.'), $(this).val().indexOf('.').length).length > 1)) {
        event.preventDefault();
    }
});

//modify NAD values
function modifyNAD() {
	//get id of current element
	var idNAD = $(this).attr('id');
	//get NAD value of clicked element
	var newNAD = $(this).val();
	//if clicked on horizontal values
	if ($(this).attr("class") == "moa") {
		//specify the position of the column clicked
   		var thisIndex = $(this).parent().parent().children().index($(this).parent());
    	//iterate through each row
    	$(this).parent().parent().parent().children('tr').each(function () {
    		//iterate through each button in row
    		$(this).find('button:not(.empty)').each(function (index, element) {
    			//if a button if in the same column as the column clicked, print value of button
				if ($(this).parent().parent().children().index($(this).parent()) === thisIndex) {
					//update moa NAD value of matched token
					var token = $(this).html();
					var token = tempSymbols(token);
					segments.segments[token].moa = newNAD;				}
			});
		});
	}
	//else if clicked on vertical values
    else if ($(this).attr("class") == "poa") {
		//specify the position of the column clicked
  		var thisIndex = $(this).parent().parent().parent().children().index($(this).parent().parent());
    	//iterate through each row
    	$(this).parent().parent().parent().children('tr').each(function () {
    		//iterate through each button in row
    		$(this).find('button:not(.empty,.labiovelar)').each(function (index, element) {
    			//if a button is in the same column as the column clicked, print value of button
				if ($(this).parent().parent().parent().children().index($(this).parent().parent()) === thisIndex) {
					//update poa NAD value of matched token
					var token = $(this).html();
					var token = tempSymbols(token);
					if (idNAD === "bilabialNAD" || idNAD === "velarNAD") {
						segments.segments[token].poa = newNAD;
						var newLabialVelarNAD = parseFloat($('#bilabialNAD').val(), 10) + parseFloat($('#velarNAD').val(), 10);
						segments.segments["w"].poa = newLabialVelarNAD/2;
						if ($('#db').val() === "pl") {
							segments.segments["W"].poa = newLabialVelarNAD/2;
						}
						else if ($('#db').val() === "custom") {
							segments.segments["ʍ"].poa = newLabialVelarNAD/2;
						}					
					}
					else {
					segments.segments[token].poa = newNAD;
					}
				}
			});
		});
  	}
}
$('body').on('change', 'input[type=number]', function() {
	$.proxy(modifyNAD, $(this))();
});


//update custom db segments with remembered input values 
var customNADloaded = 0;
$('#clusters').change(function(){
    if ($('#db').val() === "custom" && customNADloaded === 0) {
    	$('input[type=number]').each(function(){
			$.proxy(modifyNAD, $(this))();
    	});
    	customNADloaded = 1;
    }
});
