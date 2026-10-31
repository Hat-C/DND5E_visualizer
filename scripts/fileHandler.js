var playerScripts = [];
var playerCardImages = [];

var importingFiles = {};
setFilesEmpty();

function setFilesEmpty() {
	importingFiles["image"] = [];
	importingFiles["audio"] = [];
}

$(document).ready( function() {
	function fileUploadMain(uploadDOM) {
		console.log("fileUploadMain: CALLED");
		var xhttp = new XMLHttpRequest();
		xhttp.open("POST", window.location.pathname, true);
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				console.log("fileUploadMain: READY");
				document.getElementById("uploadTemp").style.setProperty("--progressPerc", 1);
				function whichButton(obj) {
					console.log("fileUploadMain: UPLOAD");
					document.getElementById("uploadTemp").style.setProperty("--progressPerc", Number(document.getElementById("uploadTemp").style.getPropertyValue("--closeEnough")));
					for(a of [document.getElementById("fileOverride"),document.getElementById("fileCombine"),document.getElementById("fileIgnore")]) { a.disabled = true; }
					switch(obj) {
						case "fileOverride":
							console.log("fileUploadMain: OVERRIDE PREVIOUS FILES");
							break;
						case "fileCombine":
							console.log("fileUploadMain: COMBINE NEW AND PREVIOUS FILES");
							break;
						case "fileIgnore":
							console.log("fileUploadMain: CANCELLED FILE UPLOAD");
							break;
						default:
							console.log(obj);
							break;
					}
					console.log("fileUploadMain: UNFINISHED FUNCTION");
					document.getElementById("uploadTemp").style.setProperty("--progressPerc", 0);
					for(a of [document.getElementById("fileOverride"),document.getElementById("fileCombine"),document.getElementById("fileIgnore")]) { a.disabled = false; }
				} //final
				for(a of [document.getElementById("fileOverride"),document.getElementById("fileCombine"),document.getElementById("fileIgnore")]) {
					a.addEventListener("mousedown", function() {
						let currId = this.id;
						console.log("fileUploadMain: BUTTON: START PROCESS");
						this.addEventListener("mouseup", function() {
							console.log("fileUploadMain: BUTTON: END PROCESS");
							clearInterval(progressButton);
							document.getElementById("uploadTemp").style.setProperty("--progressPerc", 1);
						} );
						let prom = new Promise( (resolve) => {
							let tempHold = Number(document.getElementById("uploadTemp").style.getPropertyValue("--progressPerc"));
							progressButton = setInterval( function() {
								tempHold -= 0.05;
								if(tempHold>0) {
									document.getElementById("uploadTemp").style.setProperty("--progressPerc", tempHold);
								} else {
									resolve(currId);
									clearInterval(progressButton);
								}
							}, 100);
						} ).then( (obj) => whichButton(obj) );
					} );
				}; //close foreach
				for(a of uploadDOM.files) {
					console.log(a.type);
					if(a.type.split("/")[0]=="text") {
						console.log("fileUploadMain: discarded "+a.name);
					} else {
						importingFiles[a.type.split("/")[0]].push(a);
						console.log("fileUploadMain: saving "+a.name);
						//window.URL.createObjectURL(a)
					}
				}
				console.log(importingFiles["image"]);
				console.log(importingFiles["audio"]);
				const imageArr = document.getElementById("forImages");
				for(a of importingFiles["image"]) {
					let fig = document.createElement("figure");
					let img = document.createElement("img");
					img.src = window.URL.createObjectURL(a);
					let capt = document.createElement("figcaption");
					capt.append(a.name);
					fig.appendChild(img);
					fig.appendChild(capt);
					imageArr.appendChild(fig);
				}
				const audioArr = document.getElementById("forAudio");
				for(a of importingFiles["audio"]) {
					let aud = document.createElement("audio");
					aud.controls = true;
					let sor = document.createElement("source");
					sor.src = window.URL.createObjectURL(a);
					aud.appendChild(sor);
					audioArr.appendChild(aud);
				}
				console.log(importingFiles["image"]);
				//document.getElementById("displayFilesImg").innerHTML = importingFiles["image"].length;
				//document.getElementById("displayFilesAud").innerHTML = importingFiles["audio"].length;
			} // if ready close
		}
		xhttp.send();
	}
	function fileUploadMisc(uploadDOM) {
		var xhttp = new XMLHttpRequest();
		xhttp.open("POST", window.location.pathname, true);
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				console.log("misc file upload engaged");
			}
		}
		xhttp.send();
	}
	
	for(a of document.getElementsByClassName("uploadButton")) {
		if(a.id == "primaryUpload") {
			a.addEventListener("change", function() { fileUploadMain(this); });
		} else {
			a.addEventListener("change", function() { fileUploadMisc(this); });
		}
	}

}); //close on ready



