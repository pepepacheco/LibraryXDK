/*jslint browser:true, devel:true, white:true, vars:true */
/*global $:false, intel:false */

function getReaders() {

    $.ajax({
        url: HOST + URL_READER,
        type: 'GET',
        dataType: 'JSON',
        success: function (data) {
			printList(data);
        },

        error: function (err) {
           console.log(err);
        }
    });

}

function printList(data) {
	$('#reader').empty();

	var table = $('<table class="striped bordered"/>');

	var tr = $('<thead/>').append('<tr/>');
	tr.append('<th data-field="dni">DNI</th>');
	tr.append('<th data-field="name">NOMBRE</th>');
	tr.append('<th data-field="last-name">APELLIDOS</th>)');
	tr.append('<th data-field="birthday">FECHA DE NACIMIENTO</th>');

	table.append(tr);

	var tbody = $('<tbody/>');

	for (item of data) {
		var tRow = $("<tr class='dropdown-button' href='#' data-activates='dropdown1' onclick='changeMenuValue("+ item.id + ")'></tr>");

		tRow.append('<td>' + item.dni + '</td>');
		tRow.append('<td>' + item.name + '</td>');
		tRow.append('<td>' + item.lastName + '</td>');
		tRow.append('<td>' + dateConverter(item.birthday) + '</td>');

		tbody.append(tRow);
	}

	var ul = $('<ul id="dropdown1" class="dropdown-content dropdown-menu-center"></ul>');
	var create = $('<li><a onclick="printForm()">Crear</a></li>');
	var edit = $('<li><a id="buttonUpdate" onclick="printFormUpdateReader()">Editar</a></li>');
	var divider = $('<li class="divider"></li>');
	var del = $('<li><a id="buttonDelete" onclick="deleteReader()">Borrar</a></li>');

	ul.append(create);
	ul.append(edit);
	ul.append(divider);
	ul.append(del);

	tbody.append(ul);

	table.append(tbody);

	$('#reader').append(table);

	$('.dropdown-button').dropdown({
		inDuration: 300,
		outDuration: 225,
		constrainWidth: false, // Does not change width of dropdown to that of the activator
		hover: true, // Activate on hover
		gutter: 0, // Spacing from edge
		belowOrigin: false, // Displays dropdown below the button
		alignment: 'center', // Displays dropdown with edge aligned to the left of button
		stopPropagation: false // Stops event propagation
		}
	);
}

function changeMenuValue(id) {
    $('#buttonUpdate').val(id);
	$('#buttonDelete').val(id);
}

function printForm(reader) {
	$('#reader').empty();

    var div = $('<div class = "row"></div>');
    var form = $('<div class = "col s12"></div>');
    var divDni = $('<div class = "input-field col s12"></div>');
    var i = $('<i class="material-icons prefix">web</i>');
    var dni = $('<input id="dni" type="text" class="validate">');
    var label = $('<label for="dni">DNI</label>');

    divDni.append(i);
    divDni.append(dni);
    divDni.append(label);

    var divName = $('<div class = "input-field col s12"></div>');
    i = $('<i class="material-icons prefix">person_pin</i>');
    var name = $('<input id="name" type="text" class="validate">');
    label = $('<label for="name">NOMBRE</label>');

    divName.append(i);
    divName.append(name);
    divName.append(label);

    var divLastName = $('<div class = "input-field col s12"></div>');
    i = $('<i class="material-icons prefix">person_pin</i>');
    var lastName = $('<input id="last_name" type="text" class="validate">');
    label = $('<label for="last_name">APELLIDO</label>');

    divLastName.append(i);
    divLastName.append(lastName);
    divLastName.append(label);

    var divBirthday = $('<div class="input-field col s12"></div>');
    i = $('<i class="material-icons prefix">perm_contact_calendar</i>');
    var birthday = $('<input id="birthday" type="date" class="datepicker">');
    label = $('<label for="birthday">FECHA DE NACIMIENTO</label>');

    divBirthday.append(i);
    divBirthday.append(birthday);
    divBirthday.append(label);

    var cancel = $('<button style="margin: 2%" class="btn waves-effect waves-light col s4" onclick="getReaders()">Cancelar</button>');
    var submit = $('<button style="margin: 2%; float:right" class="btn waves-effect waves-light col s4">Enviar</button>');
    i = $('<i class="material-icons right">send</i>');

    submit.append(i);

    form.append(divDni)
    form.append(divName)
    form.append(divLastName)
    form.append(divBirthday)
    form.append(cancel);
    form.append(submit);

    div.append(form);

    $('#reader').append(div);

	var input = $('.datepicker').pickadate({
		selectMonths: true,
		selectYears: 15,
		format: 'yyyy-mm-dd'
	});

    if (reader !== undefined) {

		$('#dni').val(reader.dni);
        $('#name').val(reader.name);
        $('#last_name').val(reader.lastName);

		var date = dateConverter(reader.birthday);

        $('#birthday').val(date);

		$(document).ready(function() {
			Materialize.updateTextFields();
  		});

		$(submit).click(function() {
			putReader(reader);
		});
    }
	else {
		$(submit).click(function() {
			postReader();
		});
	}
}

function printFormUpdateReader() {

    var idReader = $('#buttonUpdate').val();

    $.ajax({
        url: HOST + URL_READER + idReader,
        type: 'GET',
        dataType: 'JSON',
        success: function(data) {
            printForm(data);
        },
        error: function(err) {
            console.log(err);
        }
    });
}

function dateConverter(date) {
	var array = date.split('T');
	var date = array[0].split('-');
	return date[0] + "-" + date[1] + "-" + date[2];
}

function postReader() {

	var reader = {
		id: null,
		dni: $('#dni').val(),
		name: $('#name').val(),
		lastName: $('#last_name').val(),
		birthday: new Date(Date.parse($('#birthday').val(), 'YYYY-MM-DD'))
	}

	$.ajax({
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
    	},
		url: HOST + URL_READER,
		type: 'post',
		data: JSON.stringify(reader),
		success: function(data) {
			getReaders();
		},
		error: function(err) {
			$('#reader').html(JSON.stringify(err));
		}
	});
}

function putReader(reader) {
	var date = $('#birthday').val().replace("/", "-").replace("/", "-");

	var putReader = {
		id: reader.id,
		dni: $('#dni').val(),
		name: $('#name').val(),
		lastName: $('#last_name').val(),
		birthday: new Date(Date.parse(date, 'YYYY-MM-DD'))
	}

	$.ajax({
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
    	},
		url: HOST + URL_READER + reader.id,
		type: "PUT",
		data: JSON.stringify(putReader),
		success: function(data) {
			getReaders();
		},
		error: function(err) {
			console.log(err);
		}
	});
}

function deleteReader() {
	var idReader = $('#buttonDelete').val();

	$.ajax({
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
    	},
		url: HOST + URL_READER + idReader,
		type: "DELETE",
		success: function(data) {
			getReaders();
		},
		error: function(err) {
			console.log(err);
		}
	});
}

