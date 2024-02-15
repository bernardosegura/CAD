const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = process.argv.length < 3?3000:process.argv[2];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/app/:file?', (req, res) => {
	const file = (req.params.file)?req.params.file:'index.html';
 	let CSSs = "";
	try {
		if(file == "exit"){
			process.exit(0);
		}else{
			const data = fs.readFileSync(file, 'utf8');
	  		CSSs = loadCSS("css");
	  		res.send(data.replace('<style type="text/css"></style>','<style type="text/css">'+CSSs+'</style>'));	
		}  
	} catch (err) {
	  res.status(500).send('{"estado":"-1","mensaje":"'+err.message+'"}');
	  //console.error(`Error al leer el archivo ${file}: ${err.message}`);
	}
  
});


app.get('/app/js/:file', (req, res) => {
	const file = (req.params.file)?req.params.file:'';

	try {
		const data = fs.readFileSync("js/"+file, 'utf8');
		res.send(data);	
	} catch (err) {
		res.status(500).send('{"estado":"-2","mensaje":"'+err.message+'"}');
		//console.error(`Error al leer el archivo ${file}: ${err.message}`);
	}
}); 

app.get('/app/api/images', (req, res) => {
	const { exec } = require('child_process');
	exec('docker images --format "{{json .}}"', (error, stdout, stderr) => {
	  /*if (error) {
		console.error(`Error al ejecutar el comando: ${error.message}`);
		res.send('{"estado":"-3","mensaje":"'+error.message+'"}');
		return;
	  }*/
	  if (stderr) {
		res.send('{"estado":"-3","mensaje":"'+stderr.replace(/"/g,'\\"').replace(/\n/g, " ").trim()+'"}');
		return;
	  }
	   res.send('{"estado":"0","mensaje":"OK","images":'+JSON.stringify(stdout.split('\n'))+'}');
	});
});

app.get('/app/api/container', (req, res) => {
	const { exec } = require('child_process');
	exec('docker ps -a --format "{{json .}}"', (error, stdout, stderr) => {

	  if (stderr) {
		res.send('{"estado":"-4","mensaje":"'+stderr.replace(/"/g,'\\"').replace(/\n/g, " ").trim()+'"}');
		return;
	  }
	   res.send('{"estado":"0","mensaje":"OK","containers":'+JSON.stringify(stdout.split('\n'))+'}');
	});
});

app.get('/app/api/container/:id', (req, res) => {
	const { exec } = require('child_process');
	exec('docker ps -a --format "{{json .}}" --filter id=' + req.params.id, (error, stdout, stderr) => {
	  if (stderr) {
		res.send('{"estado":"-5","mensaje":"'+stderr.replace(/"/g,'\\"').replace(/\n/g, " ").trim()+'"}');
		return;
	  }
	   res.send('{"estado":"0","mensaje":"OK","containers":'+JSON.stringify(stdout.split('\n'))+'}');
	});
});

app.delete('/app/api/container/:id', (req, res) => {
	const { exec } = require('child_process');
	exec("docker rm " + req.params.id, (error, stdout, stderr) => {
	  if (stderr) {
		res.send('{"estado":"-6","mensaje":"'+stderr.replace(/"/g,'\\"').replace(/\n/g, " ").trim()+'"}');
		return;
	  }
	   res.send('{"estado":"0","mensaje":"OK","containers":'+JSON.stringify(stdout.split('\n'))+'}');
	});
});


app.put('/app/api/container/start/:id', (req, res) => {
	const { exec } = require('child_process');
	exec("docker start " + req.params.id, (error, stdout, stderr) => {
	  if (stderr) {
		res.send('{"estado":"-7","mensaje":"'+stderr.replace(/"/g,'\\"').replace(/\n/g, " ").trim()+'"}');
		return;
	  }
	   res.send('{"estado":"0","mensaje":"OK","containers":'+JSON.stringify(stdout.split('\n'))+'}');
	});
});

app.put('/app/api/container/stop/:id', (req, res) => {
	const { exec } = require('child_process');
	exec("docker stop " + req.params.id, (error, stdout, stderr) => {
	  if (stderr) {
		res.send('{"estado":"-8","mensaje":"'+stderr.replace(/"/g,'\\"').replace(/\n/g, " ").trim()+'"}');
		return;
	  }
	   res.send('{"estado":"0","mensaje":"OK","containers":'+JSON.stringify(stdout.split('\n'))+'}');
	});
});

app.get('/app/api/repositories', (req, res) => {
	const path = require('path');
	const fileDocker = path.join( (process.env.HOME || process.env.USERPROFILE), ".docker", "config.json");
	try {
		const objDk = JSON.parse(fs.readFileSync(fileDocker, 'utf8'));
		//const objDk = JSON.parse('{ "auths":{ "harbor-dev.coppel.io": { "auth": "VVNUR0xPQkFMOkNvcHBlbDEyMw==" },"harbor.coppel.io": { "auth": "cGVyc29uYWw6MTI5OWUzMDk3RQ==" } } }');

		let repos = [];
		let index = 0;
		for (let propiedad in objDk.auths) {
			repos[index] = propiedad
		    index++;
		}
		res.send('{"estado":"0","mensaje":"OK","repositories":'+JSON.stringify(repos)+'}');  
	} catch (err) {
	  res.status(500).send('{"estado":"-9","mensaje":"'+err.message+'"}');
	}

});

app.post('/app/api/repository', (req, res) => {
	const { exec } = require('child_process');
	const login = exec("docker login " + req.body.repo + " -u " + req.body.us + " --password-stdin", (error, stdout, stderr) => {
	  if (stderr) {
		res.send('{"estado":"-9","mensaje":"'+stderr.replace(/"/g,'\\"').replace(/\n/g, " ").trim()+'"}');
		return;
	  }
	   res.send('{"estado":"0","mensaje":"OK","repo":'+JSON.stringify(stdout.split('\n'))+'}');
	});
	login.stdin.write(req.body.pass);
	login.stdin.end();
});

app.post('/app/api/image', (req, res) => {
	const { exec } = require('child_process');
	exec("docker build -t " + req.body.repo + req.body.name + ':' +req.body.tag +' "' + req.body.path.trim() + '"', (error, stdout, stderr) => {
	  if (stderr) {
	  	let nameimg = req.body.name + ":" + req.body.tag;
	  	let regex = new RegExp(`${nameimg}.*done`, 'g');
	  	if(stderr.match(regex) !== null){
	  		res.send('{"estado":"0","mensaje":"OK"}');
	  	}else
			res.send('{"estado":"-10","mensaje":"'+stderr.replace(/"/g,'\\"').replace(/\n/g, " ").trim()+'"}');
		return;
	  }
	   res.send('{"estado":"0","mensaje":"OK"}');
	});
});

app.delete('/app/api/image/:id', (req, res) => {
	const { exec } = require('child_process');
	exec("docker image rm -f " + req.body.name + ":" + req.body.tag, (error, stdout, stderr) => {
	  if (stderr) {
		res.send('{"estado":"-10","mensaje":"'+stderr.replace(/"/g,'\\"').replace(/\n/g, " ").trim()+'"}');
		return;
	  }
	   res.send('{"estado":"0","mensaje":"OK","id":"'+req.params.id+'"}');
	});
});

app.post('/app/api/container', (req, res) => {
	const { exec } = require('child_process');
	const name = (req.body.name != "")? " --name " + req.body.name: "";
	const dirs = (req.body.dirs != "")? ' -v "' + req.body.dirs + '"': "";
	const wdir = (req.body.wdir != "")? ' -w "' + req.body.wdir + '"': "";
	exec("docker run -d" + name + " -p " + req.body.ports + dirs + wdir + " " + req.body.image, (error, stdout, stderr) => {
	  if (stderr) {
		res.send('{"estado":"-11","mensaje":"'+stderr.replace(/"/g,'\\"').replace(/\n/g, " ").trim()+'"}');
		return;
	  }
	   res.send('{"estado":"0","mensaje":"OK"}');
	   //res.send('{"estado":"0","mensaje":"OK","container":'+JSON.stringify(stdout.split('\n'))+'}');
	});
});

app.put('/app/api/image/:id', (req, res) => {
	const { exec } = require('child_process');
	exec('docker push "' + req.body.name + ':' +req.body.tag + '"', (error, stdout, stderr) => {
	  if (stderr) {
	  	res.send('{"estado":"-12","mensaje":"'+stderr.replace(/"/g,'\\"').replace(/\n/g, " ").trim()+'"}');
		return;
	  }
	  res.send('{"estado":"0","mensaje":"OK","id":"'+req.params.id+'"}');
	});
});

app.listen(port,() => {
  console.log(`Servidor en puerto ${port}`);
});

function loadCSS(carpeta){
 	const path = require('path');
 	let contenidoCSS = "";
	fs.readdirSync(carpeta).forEach(nombreArchivo => {
	    let file = path.join(carpeta, nombreArchivo);
	    if (fs.statSync(file).isFile()) {
	        contenidoCSS += fs.readFileSync(file, 'utf-8');
	    }
	});
	return contenidoCSS;
} 