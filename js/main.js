var nombreServidor = "LocalHost";
var version = "Versión 0.1-Beta";

var Ajax = function(metodo,url, params,callback,asyn=false)
{
	http: "",
	this.obtenResultado = function()
	{
		if(window.XMLHttpRequest)
			http = new XMLHttpRequest();
		else
			http = new ActiveXObject("Microsoft.XMLHTTP");
        http.open(metodo, url, asyn);
        http.setRequestHeader("Content-type", "application/json");
        http.onreadystatechange = function()
        {
	        if(http.readyState == 4)
	        { 
	            if(http.status == 200)
	            {
	                respuesta = http.responseText;
	                callback(respuesta);
	            }
			}        	
        }
        try{
        	http.send(params);
        }catch(error){
        	location.reload();
        }
	}
}

document.addEventListener("DOMContentLoaded", function() {
  
  document.getElementById('logo').title = "Consola de Administración para Docker " + version;
  document.getElementById('servername').innerHTML = '<b> ' + nombreServidor + "</b>";
  
  intro(); 
});

function appExit(){
	new Ajax("GET","/app/exit","",resp =>{}).obtenResultado();
	closeSMenu();
}

// Función para abrir el diálogo
function openDialog(id) {
  document.getElementById(id).style.display = 'block';
  document.getElementById('overlay').style.display = 'block';
}

// Función para cerrar el diálogo
function closeDialog(id) {
  document.getElementById(id).style.display = 'none';
  if(document.querySelectorAll(".dialog-container[style='display: block;']").length == 0)
  		document.getElementById('overlay').style.display = 'none';
}

function intro(){
	cargarContenido("GET","/app/intro.html","",{"version":version}); 	
}

function acercade(){
	cargarContenido("GET","/app/acercade.html",""); 
}

function listImg(){
	cargarContenido("GET","/app/listImg.html","",{servername:nombreServidor,callback:getImgs});
	closeSMenu();
}

function listPs(){
	cargarContenido("GET","/app/listPs.html","",{servername:nombreServidor, callback:getPs});
	closeSMenu();
}

function listRepos(){
	cargarContenido("GET","/app/listRepos.html","",{servername:nombreServidor, callback:getRepos});
	closeSMenu();
}

function getImgs(){
	new Ajax("GET","/app/api/images","",resp =>{
		let data = JSON.parse(resp);
		if(data.estado != 0){
			document.getElementById("dialog-alert-mensaje").innerHTML = data.mensaje;
			openDialog('dialog-alert');
		}else{
			let html = "";
			for (let i = 0; i < (data.images.length - 1); i++) {
				let image = JSON.parse(data.images[i]);
				let tr = "<tr id=\"fila_"+i+"\"><td style=\"text-align: center;\"><label class=\"checkbox-container\"><input onClick=\"fndFila(this)\" id=\"chk_"+i+"\" value=\""+ i +"\" type=\"checkbox\" class=\"checkbox-input chkbox checkimg\"><span class=\"checkbox-indicator\"><span class=\"checkbox-checkmark\"></span></span></label><input id=\"img_"+i+"\" value=\""+ image.Repository +":"+ image.Tag +"\" type=\"checkbox\" class=\"checkbox-input chkbox checkimg\"></td>";
				//tr += "<td>"+image.Containers+"</td>";
				tr += "<td>"+image.Repository+"</td>";
				tr += "<td>"+image.Tag+"</td>";
				tr += "<td>"+image.ID+"</td>";
				tr += "<td>"+image.CreatedSince+"</td>";
				tr += "<td>"+image.Size+"</td>";
				html += tr;
			}
			document.getElementById("tbodyImgs").innerHTML = html;
		}
	}).obtenResultado();

	new Ajax("GET","/app/api/repositories","",resp =>{
		let data = JSON.parse(resp);
		if(data.estado != 0){
			document.getElementById("dialog-alert-mensaje").innerHTML = data.mensaje;
			openDialog('dialog-alert');
		}else{
			let html = "<option value='null'>N/A</option>";
			for (let i = 0; i < data.repositories.length; i++) {
				html += "<option value='"+data.repositories[i]+"'>"+data.repositories[i]+"</option>";
			}
			document.getElementById("cbx_repos").innerHTML = html;
		}
	}).obtenResultado();
}

function getPs(){
	new Ajax("GET","/app/api/container","",resp =>{
		let data = JSON.parse(resp);
		if(data.estado != 0){
			document.getElementById("dialog-alert-mensaje").innerHTML = data.mensaje;
			openDialog('dialog-alert');
		}else{
			let html = "";
			for (let i = 0; i < (data.containers.length - 1); i++) {
				let container = JSON.parse(data.containers[i]);
				let btnAccion = ""; 
				let clasesAccion = "btn";
				let btntitle = "";
				let btnEliminarC = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#FFF" style="position: relative; top: 2px;" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M16 6l-1.5-1.5h-7L8 6M4 7v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7"></path></svg>';
				let colorTxtState = 'color: ';
				let accionbtn = "";
				if(container.State == "exited" || container.State == "created"){
					 btnAccion = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#FFF" style="position: relative; top: 2px;"><path d="M8 5v14l11-7z"/></svg>';
					 btntitle = "Click para Iniciar";
					  colorTxtState = 'color:  #678cac;';
					  accionbtn = "start";
					  
				}else{
					btnAccion = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#FFF" style="position: relative; top: 2px;"><path d="M6 6h12v12H6z"/></svg>';
					clasesAccion += " btn-stop";	
					btntitle = "Click para Detener";
					colorTxtState = 'color:  #007bff;';
					accionbtn = "stop";
				}
				
					
				let tr = "<tr id=\"fila_"+i+"\"><td style=\"text-align: center;\"><a href=\"#\" id=\"del_"+i+"\" onClick=\"deleteContainer('"+i+"','"+container.ID+"','"+container.Names+"')\" class=\"btn btn-danger\" style='padding: 6px 8px; position: relative; top: -3px;' title = 'Click para Eliminar'>"+btnEliminarC+"</a> <a href=\"#\" onClick=\"putContainer('"+i+"','"+container.ID+"','"+accionbtn+"')\" class=\""+clasesAccion+"\" style='padding: 3px 5px;' title = '"+btntitle+"' id=\"acc_"+i+"\">"+btnAccion+"</a></td>";
				//tr += "<td>"+image.Containers+"</td>";
				tr += "<td>"+container.Names+"</td>";
				//tr += "<td>"+container.ID+"</td>";
				tr += "<td>"+container.Image+"</td>";
				tr += "<td>"+container.Command+"</td>";
				tr += "<td>"+container.RunningFor+"</td>";
				tr += "<td style='"+colorTxtState+" cursor: pointer' title='"+container.Status+"'><b>"+container.State+"</b></td>";
				tr += "<td>"+container.Ports+"</td>"
				html += tr;
			}
			document.getElementById("tbodyPs").innerHTML = html;
		}
	}).obtenResultado();

	new Ajax("GET","/app/api/images","",resp =>{
		let data = JSON.parse(resp);
		if(data.estado != 0){
			document.getElementById("dialog-alert-mensaje").innerHTML = data.mensaje;
			openDialog('dialog-alert');
		}else{
			let html = "<option value='null'>Seleccione</option>";
			for (let i = 0; i < (data.images.length - 1); i++) {
				let image = JSON.parse(data.images[i]);
				html += "<option value='"+image.Repository+":"+image.Tag+"'>"+image.Repository+":"+image.Tag+"</option>";
			}
			document.getElementById("cbx_imgs").innerHTML = html;
		}
	}).obtenResultado();
}

function getRepos(){
	new Ajax("GET","/app/api/repositories","",resp =>{
		let data = JSON.parse(resp);
		if(data.estado != 0){
			document.getElementById("dialog-alert-mensaje").innerHTML = data.mensaje;
			openDialog('dialog-alert');
		}else{
			let html = "";
			for (let i = 0; i < data.repositories.length; i++) {
				html += "<tr><td>"+(i+1)+".- <b>"+data.repositories[i]+"</b></td></tr>";
			}
			document.getElementById("tbodyRepos").innerHTML = html;
		}
	}).obtenResultado();
}

function putContainer(fl,id,accion){
	if(!document.getElementById("load_acc_" + fl)){
		let imgBuff = document.getElementById("acc_" + fl).innerHTML;
		document.getElementById("acc_" + fl).innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="load_acc_'+fl+'" style="position: relative; top: 2px;" width="24" height="24" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><path d="M10 50A40 40 0 0 0 90 50A40 46 0 0 1 10 50" fill="#FFF" stroke="none"><animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 51;360 50 51"></animateTransform></path></svg>';
		new Ajax("PUT","/app/api/container/"+accion+"/"+id,"",resp =>{
			let data = JSON.parse(resp);
			if(data.estado != 0){
				document.getElementById("dialog-alert-mensaje").innerHTML = data.mensaje;
				openDialog('dialog-alert');
				document.getElementById("acc_" + fl).innerHTML = imgBuff;
			}else{
				new Ajax("GET","/app/api/container/"+id,"",resp =>{
					let data = JSON.parse(resp);
					if(data.estado != 0){
						document.getElementById("dialog-alert-mensaje").innerHTML = data.mensaje;
						openDialog('dialog-alert');
						document.getElementById("acc_" + fl).innerHTML = imgBuff;
					}else{
						if(data.containers[0] != "")
							changeContainer(fl,JSON.parse(data.containers[0]));
						else
							document.getElementById("fila_"+fl).remove();	
					}
				}).obtenResultado();
			}
		},true).obtenResultado();
	}	
}

function deleteContainer(fl,id,nombre){
	if(!document.getElementById("load_del_" + fl)){
		document.getElementById("dialog-confirm-mensaje").innerHTML = "Seguro de eliminar contenedor: <b>" + nombre + "</b>";
		document.getElementById("dialog-confirm-btnOk").onclick = function (){ 
			document.getElementById("del_" + fl).innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="load_del_'+fl+'" style="position: relative; top: 2px;" width="18" height="18" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><path d="M10 50A40 40 0 0 0 90 50A40 46 0 0 1 10 50" fill="#FFF" stroke="none"><animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 51;360 50 51"></animateTransform></path></svg>';
			closeDialog('dialog-confirm');
			new Ajax("DELETE","/app/api/container/"+id,"",resp =>{
				let data = JSON.parse(resp);
				if(data.estado != 0){
					document.getElementById("dialog-alert-mensaje").innerHTML = data.mensaje;
					openDialog('dialog-alert');
					document.getElementById("del_" + fl).innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#FFF" style="position: relative; top: 2px;" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M16 6l-1.5-1.5h-7L8 6M4 7v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7"></path></svg>';
				}else{
					document.getElementById("fila_"+fl).remove();
				}
			},true).obtenResultado();
		};
		openDialog('dialog-confirm');
	}	
}

function changeContainer(fl,container){
	let btnAccion = ""; 
	let clasesAccion = "btn";
	let btntitle = "";
	let btnEliminarC = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#FFF" style="position: relative; top: 2px;" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M16 6l-1.5-1.5h-7L8 6M4 7v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7"></path></svg>';
	let colorTxtState = 'color: ';
	let accionbtn = "";
	if(container.State == "exited" || container.State == "created"){
		 btnAccion = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#FFF" style="position: relative; top: 2px;"><path d="M8 5v14l11-7z"/></svg>';
		 btntitle = "Click para Iniciar";
		  colorTxtState = 'color:  #678cac;';
		  accionbtn = "start";
		  
	}else{
		btnAccion = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#FFF" style="position: relative; top: 2px;"><path d="M6 6h12v12H6z"/></svg>';
		clasesAccion += " btn-stop";	
		btntitle = "Click para Detener";
		colorTxtState = 'color:  #007bff;';
		accionbtn = "stop";
	}
	
	document.querySelectorAll("#fila_"+fl+" td")[0].innerHTML = "<a href=\"#\" id=\"del_"+fl+"\" onClick=\"deleteContainer('"+fl+"','"+container.ID+"','"+container.Names+"')\" class=\"btn btn-danger\" style='padding: 6px 8px; position: relative; top: -3px;' title = 'Click para Eliminar'>"+btnEliminarC+"</a> <a href=\"#\" onClick=\"putContainer('"+fl+"','"+container.ID+"','"+accionbtn+"')\" class=\""+clasesAccion+"\" style='padding: 3px 5px;' title = '"+btntitle+"' id=\"acc_"+fl+"\">"+btnAccion+"</a>";
	document.querySelectorAll("#fila_"+fl+" td")[5].title = container.Status;	
	document.querySelectorAll("#fila_"+fl+" td")[5].style = colorTxtState + " cursor: pointer"; 
	document.querySelectorAll("#fila_"+fl+" td")[5].innerHTML = "<b>"+container.State+"</b>";
	document.querySelectorAll("#fila_"+fl+" td")[6].innerHTML = container.Ports;
}

function checkall(){
	for (var i = 0; i < document.querySelectorAll(".checkimg").length; i++) {
		document.querySelectorAll(".checkimg")[i].checked = document.getElementById("chk_all").checked;
		fndFila(document.querySelectorAll(".checkimg")[i]);
	}
}

function closeSMenu(){
	for (var i = 0; i < document.querySelectorAll(".sub-menu").length; i++) {
		document.querySelectorAll(".sub-menu")[i].style.display = "none";
	}
}

function cleanSMenu(){
	for (var i = 0; i < document.querySelectorAll(".sub-menu").length; i++) {
		document.querySelectorAll(".sub-menu")[i].style = "";
	}
}

function fndFila(chk){
	if(chk.checked)
		document.getElementById(chk.id.replace("chk","fila")).style.backgroundColor = "#dfdfE0";
	else
		document.getElementById(chk.id.replace("chk","fila")).style.backgroundColor = "#fff";
}

function eliminarImgs(origen){
	if(document.querySelectorAll(".checkimg:checked").length > 0){
		document.getElementById("dialog-alert-mensaje").innerHTML = "Eliminando <b>" + document.querySelectorAll("#fila_"+document.querySelectorAll(".checkimg:checked")[0].value+" td")[1].innerHTML+':'+document.querySelectorAll("#fila_"+document.querySelectorAll(".checkimg:checked")[0].value+" td")[2].innerHTML + "</b>";
		document.getElementById("btn-ok").innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="position: relative; top: 2px;" width="24" height="24" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><path d="M10 50A40 40 0 0 0 90 50A40 46 0 0 1 10 50" fill="#000" stroke="none"><animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 51;360 50 51"></animateTransform></path></svg>';
		openDialog('dialog-alert');
		new Ajax("DELETE","/app/api/image/"+document.querySelectorAll(".checkimg:checked")[0].value,'{"name":"'+document.querySelectorAll("#fila_"+document.querySelectorAll(".checkimg:checked")[0].value+" td")[1].innerHTML+'","tag":"'+document.querySelectorAll("#fila_"+document.querySelectorAll(".checkimg:checked")[0].value+" td")[2].innerHTML+'"}',resp =>{
				let data = JSON.parse(resp);
				if(data.estado != 0){
					document.getElementById("dialog-alert-mensaje").innerHTML = data.mensaje;
					document.getElementById("btn-ok").innerHTML = '<button id="dialog-alert-btnOk" class="primary" onclick="closeDialog(\'dialog-alert\')">Aceptar</button>';
					openDialog('dialog-alert');					
				}else{
					document.getElementById("fila_"+data.id).remove();
					eliminarImgs(1);
				}
			},true).obtenResultado();		
	}else{
		if(!origen){
			document.getElementById("dialog-alert-mensaje").innerHTML = "Seleccione un elemento para eliminar";
			document.getElementById("btn-ok").innerHTML = '<button id="dialog-alert-btnOk" class="primary" onclick="closeDialog(\'dialog-alert\')">Aceptar</button>';
			openDialog('dialog-alert');
		}else{
			closeDialog('dialog-alert');
		}
	}
}

function enviarImgs(origen){
	if(document.querySelectorAll(".checkimg:checked").length > 0){
		document.getElementById("dialog-alert-mensaje").innerHTML = "Enviando <b>" + document.querySelectorAll("#fila_"+document.querySelectorAll(".checkimg:checked")[0].value+" td")[1].innerHTML+':'+document.querySelectorAll("#fila_"+document.querySelectorAll(".checkimg:checked")[0].value+" td")[2].innerHTML + "</b>";
		document.getElementById("btn-ok").innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="position: relative; top: 2px;" width="24" height="24" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><path d="M10 50A40 40 0 0 0 90 50A40 46 0 0 1 10 50" fill="#000" stroke="none"><animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 51;360 50 51"></animateTransform></path></svg>';
		openDialog('dialog-alert');
		new Ajax("PUT","/app/api/image/"+document.querySelectorAll(".checkimg:checked")[0].value,'{"name":"'+document.querySelectorAll("#fila_"+document.querySelectorAll(".checkimg:checked")[0].value+" td")[1].innerHTML+'","tag":"'+document.querySelectorAll("#fila_"+document.querySelectorAll(".checkimg:checked")[0].value+" td")[2].innerHTML+'"}',resp =>{
				let data = JSON.parse(resp);
				if(data.estado != 0){
					document.getElementById("dialog-alert-mensaje").innerHTML = data.mensaje;
					document.getElementById("btn-ok").innerHTML = '<button id="dialog-alert-btnOk" class="primary" onclick="closeDialog(\'dialog-alert\')">Aceptar</button>';
					openDialog('dialog-alert');					
				}else{
					document.getElementById("chk_"+data.id).checked = false;
					fndFila(document.getElementById("chk_"+data.id));
					enviarImgs(1);
				}
			},true).obtenResultado();		
	}else{
		if(!origen){
			document.getElementById("dialog-alert-mensaje").innerHTML = "Seleccione un elemento para enviar";
			document.getElementById("btn-ok").innerHTML = '<button id="dialog-alert-btnOk" class="primary" onclick="closeDialog(\'dialog-alert\')">Aceptar</button>';
			openDialog('dialog-alert');
		}else{
			closeDialog('dialog-alert');
		}
	}
}

function cargarContenido(peticion,url,params,obj){
	new Ajax(peticion,url,params,resp =>{
		if(!obj)
			document.getElementById("container").innerHTML = resp;
		else{
			for (var key in obj) {
				if(key != "callback")
					resp = resp.replace(new RegExp("{" + key + "}", "g"), obj[key]);
			}
			document.getElementById("container").innerHTML = resp;
			if(obj.callback)
				obj.callback();
		}
  }).obtenResultado();
}

function addRepo(){
	if(document.getElementById("txt_repo_name").value == ""){
		document.getElementById("dialog-alert-mensaje").innerHTML = "Url del repositorio es requirido.";
		openDialog('dialog-alert');
	}else{
		if(document.getElementById("txt_repo_usu").value == ""){
			document.getElementById("dialog-alert-mensaje").innerHTML = "Usuario del repositorio es requirido.";
			openDialog('dialog-alert');
		}else{
			if(document.getElementById("txt_repo_pass").value == ""){
				document.getElementById("dialog-alert-mensaje").innerHTML = "Contraseña del uruario es requirido.";
				openDialog('dialog-alert');
			}else{
					var panel_btns = document.getElementById("dialog-panel-botones").innerHTML;
					document.getElementById("dialog-panel-botones").innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="position: relative; top: 2px;" width="24" height="24" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><path d="M10 50A40 40 0 0 0 90 50A40 46 0 0 1 10 50" fill="#000" stroke="none"><animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 51;360 50 51"></animateTransform></path></svg>';
					new Ajax("POST","/app/api/repository",'{"repo":"'+document.getElementById("txt_repo_name").value+'","us":"'+document.getElementById("txt_repo_usu").value+'", "pass":"'+document.getElementById("txt_repo_pass").value+'"}',resp =>{
					let data = JSON.parse(resp);
					if(data.estado != 0){
						document.getElementById("dialog-alert-mensaje").innerHTML = data.mensaje;
						openDialog('dialog-alert');
						document.getElementById("dialog-panel-botones").innerHTML = panel_btns;
					}else{
						closeDialog("dialog-add");
						document.getElementById("dialog-panel-botones").innerHTML = panel_btns;
						listRepos();
					}
				},true).obtenResultado();
			}
		}
	}
}

function openAddRepo(){
	document.getElementById("txt_repo_name").value = "";
	document.getElementById("txt_repo_usu").value = "";
	document.getElementById("txt_repo_pass").value = "";
	openDialog('dialog-add');
}

function openAddImg(){
	document.getElementById("txt_img_proy").value = "";
	document.getElementById("txt_img_name").value = "";
	document.getElementById("txt_img_tag").value = "";
	document.getElementById("txt_img_path").value = "";
	document.getElementById("cbx_repos").value = "null";
	openDialog('dialog-add-img');
}

function addImg(){
	if(document.getElementById("txt_img_name").value == ""){
		document.getElementById("dialog-alert-mensaje").innerHTML = "Nombre de la imagen es requerido.";
		openDialog('dialog-alert');
	}else{
		if(document.getElementById("txt_img_tag").value == ""){
			document.getElementById("dialog-alert-mensaje").innerHTML = "Versión de la imagen es requerida.";
			openDialog('dialog-alert');
		}else{
			if(document.getElementById("txt_img_path").value == ""){
				document.getElementById("dialog-alert-mensaje").innerHTML = "La ruta del archivo dockerfile es requerido.";
				openDialog('dialog-alert');
			}else{
					var panel_btns = document.getElementById("dialog-panel-botones").innerHTML;
					document.getElementById("dialog-panel-botones").innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="position: relative; top: 2px;" width="24" height="24" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><path d="M10 50A40 40 0 0 0 90 50A40 46 0 0 1 10 50" fill="#000" stroke="none"><animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 51;360 50 51"></animateTransform></path></svg>';
					let repo = (document.getElementById("cbx_repos").value != "null")? document.getElementById("cbx_repos").value + "/":"";
					let proyecto =  (document.getElementById("txt_img_proy").value != "")? document.getElementById("txt_img_proy").value + "/":"";
					new Ajax("POST","/app/api/image",'{"repo":"'+repo +'","name":"'+proyecto+ document.getElementById("txt_img_name").value+'","tag":"'+document.getElementById("txt_img_tag").value+'","path":"'+document.getElementById("txt_img_path").value.replace(/\\/g, "\\\\")+'"}',resp =>{
					let data = JSON.parse(resp);
					if(data.estado != 0){
						document.getElementById("dialog-alert-mensaje").innerHTML = data.mensaje;
						openDialog('dialog-alert');
						document.getElementById("dialog-panel-botones").innerHTML = panel_btns;
					}else{
						closeDialog("dialog-add-img");
						document.getElementById("dialog-panel-botones").innerHTML = panel_btns;
						listImg();
					}
				},true).obtenResultado();
			}
		}
	}
}

function openAddPs(){
	document.getElementById("cbx_imgs").value = "null";
	document.getElementById("txt_ps_name").value = "";
	document.getElementById("txt_ps_ports").value = "";
	document.getElementById("txt_ps_dirs").value = "";
	document.getElementById("txt_ps_wdir").value = "";
	openDialog('dialog-add-ps');
}

function addPs(){
	if(document.getElementById("cbx_imgs").value == "null"){
		document.getElementById("dialog-alert-mensaje").innerHTML = "La imagen es requerida.";
		openDialog('dialog-alert');
	}else{
		if(!(/^\d+:\d+$/).test(document.getElementById("txt_ps_ports").value)){
			document.getElementById("dialog-alert-mensaje").innerHTML = "Los puertos son requeridos o el formato es incorrecto.";
			openDialog('dialog-alert');
		}else{
			/*if(document.getElementById("txt_ps_dirs").value != "" && document.getElementById("txt_ps_dirs").value.split(":").length >= 2){
				document.getElementById("dialog-alert-mensaje").innerHTML = "El fromato de los directorios compartidos es incorrecto.";
				openDialog('dialog-alert');
			}else{*/
					var panel_btns = document.getElementById("dialog-panel-botones").innerHTML;
					document.getElementById("dialog-panel-botones").innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="position: relative; top: 2px;" width="24" height="24" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"><path d="M10 50A40 40 0 0 0 90 50A40 46 0 0 1 10 50" fill="#000" stroke="none"><animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" keyTimes="0;1" values="0 50 51;360 50 51"></animateTransform></path></svg>';
					new Ajax("POST","/app/api/container",'{"image":"'+document.getElementById("cbx_imgs").value.replace(/\\/g, "\\\\") +'","name":"'+ document.getElementById("txt_ps_name").value+'","ports":"'+document.getElementById("txt_ps_ports").value+'","dirs":"'+document.getElementById("txt_ps_dirs").value.replace(/\\/g, "\\\\")+'","wdir":"'+document.getElementById("txt_ps_wdir").value.replace(/\\/g, "\\\\")+'"}',resp =>{
					let data = JSON.parse(resp);
					if(data.estado != 0){
						document.getElementById("dialog-alert-mensaje").innerHTML = data.mensaje;
						openDialog('dialog-alert');
						document.getElementById("dialog-panel-botones").innerHTML = panel_btns;
					}else{
						closeDialog("dialog-add-ps");
						document.getElementById("dialog-panel-botones").innerHTML = panel_btns;
						listPs();
					}
				},true).obtenResultado();
			//}
		}
	}
}
