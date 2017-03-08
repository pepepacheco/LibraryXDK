/*jslint browser:true, devel:true, white:true, vars:true */
/*global $:false, intel:false */

function getTakenBooks(){
    $('#loan').empty();

	$('#loan').append('<button style="margin: 4%" onclick="scan(&quot;loan&quot;)" class="btn waves-effect waves-light col s5">Prestamo</button>');
	$('#loan').append('<button style="margin: 4%" onclick="scan(&quot;return&quot;)" class="btn waves-effect waves-light col s5">Devolución</button>');
	$('#loan').append('<div id="taken" class="col s12"/>');

    $.ajax({
        url: HOST + URL_BOOK + "date/",
        type: 'GET',
        dataType: 'json',
        success: function (data) {


            var table = $('<table class="striped bordered"/>');

            var tr = $('<thead/>').append('<tr/>');
            tr.append('<th data-field="title">TÍTULO</th>');
            tr.append('<th data-field="reader">LECTOR</th>)');
            tr.append('<th data-field="date">FECHA</th>')

            table.append(tr);

            var tbody = $('<tbody/>');

            for (item of data) {
                var tRow = $("<tr/>");
                var name = item.idReaderFk.name + " " + item.idReaderFk.lastName;

                tRow.append('<td>' + item.title + '</td>');
                tRow.append('<td>' + name + '</td>');
                tRow.append('<td>' + dateConverter(item.loanDate) + '</td>');

                tbody.append(tRow);
            }

            table.append(tbody);

            $('#taken').append(table);

        },

        error: function () {
            $('#taken').html('Error en el servidor');
        }
    });
}

function scan(method){

     cordova.plugins.barcodeScanner.scan(function(result){
            if(method==="loan")
                isBook(result.text);
            else if(method==="return"){
                isLoan(result.text);
            }
            else
                console.log("Nunca debería de entrar aquí");
        }, function(){
            Materialize.toast("Error al leer el código", 4000);
    });
}

function isLoan(result){
    $.ajax({
        url : HOST + URL_BOOK + "isbn/" + result,
        type: 'GET',
        dataType: 'json',
        success: function(data){
            if(data.loanDate != undefined){
                setBookForLoan(data);
            } else {
                Materialize.toast("El libro no se encuentra prestado", 4000);
            }

        },
        error: function(){
            Materialize.toast("El libro no está registrado en la BD", 4000);
        }
    });
}

function setBookForLoan(book){

    book.loanDate = undefined;
    book.idReaderFk = undefined;

    $.ajax({
        headers:{
            "Accept" : "text",
            "Content-Type" : "application/json"
        },
        url : HOST + URL_BOOK + JSON.stringify(book.id),
        type : "PUT",
        data : JSON.stringify(book),
        success : function(data){
            getTakenBooks();
        },
        error : function(err){
            Materialize.toast(JSON.stringify(err), 4000);
        }
    });

}

function isBook(result){
    $.ajax({
        url : HOST + URL_BOOK + "isbn/" + result,
        type: 'GET',
        dataType: 'JSON',
        success: function(data){
			readerSelector(data);
        },
        error: function(){
			Materialize.toast('El libro no está registrado en la BD', 4000)
        }
    });
}

function readerSelector(book) {
	var loan = $('#loan');
	loan.empty();

	var div = $('<div class = "row">');
    var form = $('<div class = "col s12">');
	var divLoanDate = $('<div class="input-field col s12">');
	var i = $('<i class="material-icons prefix">perm_contact_calendar</i>');
	var loanDate = $('<input id="loanDate" type="date" class="datepicker">');
    var label = $('<label for="birthday">Fecha de préstamo</label>');

	divLoanDate.append(i);
    divLoanDate.append(loanDate);
    divLoanDate.append(label);

	form.append(divLoanDate)
	div.append(form);

	loan.append(form);


	$('.datepicker').pickadate({
		selectMonths: true,
		selectYears: 15,
		format: 'yyyy-mm-dd'
	});

	$(document).ready(function() {
		Materialize.updateTextFields();
	});

	var div = $('<div class="collection">')

	$.ajax({
        url: HOST + URL_READER,
        type: 'GET',
        dataType: 'JSON',
        success: function (data) {
			var aHeader = $('<a class="collection-item active">Selecciona un lector</a>');
			div.append(aHeader);

			for (item of data) {
				var a = $('<a class="collection-item">' + item.name + '</a>');
				$(a).click({param1: item, param2: book}, putTakenBook);
				div.append(a);
			}
			loan.append(div);
			loan.append('<button class="waves-effect waves-light btn" onclick="getTakenBooks()">Volver</button>')
        },

        error: function (err) {
           console.log(err);
        }
    });
}

function putTakenBook(event) {

	var reader = event.data.param1;
	var book = event.data.param2;

	book.idReaderFk = reader;
	book.loanDate = new Date(Date.parse($('#loanDate').val(), 'YYYY-MM-DD'));

    $.ajax({
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
    	},
		url: HOST + URL_BOOK + book.id,
		type: "PUT",
        data : JSON.stringify(book),
		success: function(data) {
            getTakenBooks();
		},
		error: function(err) {
		  	Materialize.toast('Error inesperado', 4000);
		}
	});
}

function dateConverter(date) {
	var array = date.split('T');
	var date = array[0].split('-');
	return date[0] + "-" + date[1] + "-" + date[2];
}

