const colourMaskArea = document.getElementById("colourAreaMask");
const colourMaskParent = colourMaskArea.parentElement;
const layersList = document.getElementById("layerArray");
const colourStuff = document.getElementById("colourStuff");
const colourDisplay = colourStuff.children[0];
const lineThickness = document.getElementById("lineThickness");
const paintCursor = document.getElementById("mouseCursor");
const addOrRemovePaint = document.getElementById("addOrRemovePaint").children[0];
colourMaskArea.innerHTML = `<svg id="vectorMode" class="onion"></svg>`; /*the DOM doesn't like directly interacting with SVGs so I'm tricking it into treating it like a normal DOM object*/
var vectorsSVG = colourMaskArea.children[0];
console.log(vectorsSVG);
let toolsList = document.getElementById("tools").children;
const undoButton = toolsList[0];
const redoButton = toolsList[1];
//vectorsSVG.innerHTML = '<path d="M7 0 11 8C17 20 11 24 7 24 3 24-3 20 3 8L7 0 8 4C10 14 9 15 11 17 12 14 11 12 10 9L8 4Z"/>';
var layerLimit = 10;
addSVGLayer();
document.getElementById("togglePaintVector").checked = false;
var colourAreaSVG = colourMaskArea.children[1];
switchSVG(0);
const canvas = document.getElementById("decalCanvas");
var isPaintMode = true;
//colourAreaSVG.style.setProperty("display","initial");
//console.log(colourAreaSVG);
//;
console.log(window.innerWidth);
let awaga = window.innerWidth;
console.log(awaga);
console.log(Number(lineThickness.value));
console.log(Number(this.value)/awaga*100);
paintCursor.style.setProperty("--cursorWidth",Number(lineThickness.value)+"px");
lineThickness.addEventListener("input", function() {paintCursor.style.setProperty("--cursorWidth",Number(this.value)+"px"/*(Number(this.value)/window.innerWidth*100)+"%"*/);});
customCursorVisibile(false);

document.getElementById("togglePaintVector").addEventListener("change", function() {
	let paintSwitchText = "switching to vertex mode will remove your paint history, proceed?"
	if(isPaintMode) {
		if(confirm(paintSwitchText)) {
			switchSVG();
		} else {
			console.log(vectorsSVG.children[0]);
			this.checked = !this.checked;
		}
	} else {
		switchSVG();
	}
});

//binded to allow removal and reapplication without duplicating listeners.
var bind_newPolylineCoord = newPolylineCoord.bind(this); 
var bind_colourPadInput = colourPad_input.bind(this);
var bind_changeSVG;// = newPolylineCoord.bind(this);
var bind_trackMouseforPaintCursor = cursorFollowMouse.bind(this);

//vectorsSVG.innerHTML = `<polyline style="stroke-width:${Number(lineThickness.value)/2};" points=''></polyline>`;
colourMaskArea.addEventListener("mouseover", function() {
	console.log("tracking mouse");
	customCursorVisibile(true);
	this.addEventListener("mousemove", bind_trackMouseforPaintCursor);
});
colourMaskArea.addEventListener("pointerleave", function() {
	console.log("no longer tracking mouse");
	customCursorVisibile(false);
	this.removeEventListener("mousemove", bind_trackMouseforPaintCursor);
});
colourMaskArea.addEventListener("mousedown", function() { //input on decal area
	console.log("mouse press");
	if(colourAreaSVG.tagName=="svg") {
		for(let i = colourAreaSVG.getElementsByTagName("polyline").length-1; i>=0; --i) {
			if(colourAreaSVG.getElementsByTagName("polyline")[i].style.getPropertyValue("display")=="none") {
				colourAreaSVG.getElementsByTagName("polyline")[i].remove();
			} else {
				if(!redoButton.disabled) { redoButton.disabled = true; }
				i = -1;
			}
		}
		colourAreaSVG.innerHTML += `<polyline class="${addOrRemovePaint.checked?"paint":"erase"}"style="stroke-width:${Number(lineThickness.value)};" points=''></polyline>`; //declaring points to not brick the funciton
		newPolylineCoord();
		this.addEventListener("mousemove", bind_newPolylineCoord);
	} else {
		
	}
} );
addOrRemovePaint.addEventListener("change",function() { isPaintorErase(this.checked); });

function isPaintorErase(inpBool) {
	paintCursor.style.setProperty("--borderType",inpBool?"solid":"dashed");
}


colourMaskArea.addEventListener("mouseup", function() {revokeMousedownColourArea();} );
//colourMaskArea.addEventListener("pointerleave", function() {revokeMousedownColourArea();} );

function customCursorVisibile(inp) {
	if(inp) {
		paintCursor.style.removeProperty("display");
	} else {
		paintCursor.style.setProperty("display","none");
	}
}

function cursorFollowMouse() {
	paintCursor.style.setProperty("--xPos",event.clientX+"px");
	paintCursor.style.setProperty("--yPos",event.clientY+"px");
}


function convertPaintToSVG(lay) {
	console.log("[WIP Paint to SVG]");
	polylineCleanup(lay);
	clearPaint(lay);
}

function clearPaint(polyIndex) {
	colourMaskArea.children[polyIndex+1].innerHTML = '';
}



function clamp(inp, max, min=0) {
	if(inp>max) {return max;}
	else if (inp<min) {return min;}
	else {return inp;}
}

function lineCreate(startX,startY,endX,endY,ind=null,endisDelta=false) {
	let lineObj = new Object();
	lineObj.i = ind;
	lineObj.x1 = startX;
	lineObj.y1 = startY;
	if(endisDelta) {
		lineObj.xD = endX;
		lineObj.yD = endY;
		lineObj.x2 = startX+endX;
		lineObj.y2 = startY+endY;
	} else {
		lineObj.x2 = endX;
		lineObj.y2 = endY;
		lineObj.xD = endX-startX;
		lineObj.yD = endY-startY;
	}
	if(lineObj.xD==0) {
		lineObj.slope = 'v';
	} else if (lineObj.yD==0) {
		lineObj.slope = "h";
	} else {
		lineObj.slope = lineObj.yD/lineObj.xD;
	}
	lineObj.left = lineObj.xD<0? lineObj.x2 : lineObj.x1;
	lineObj.right = lineObj.xD<0? lineObj.x1 : lineObj.x2;
	lineObj.roof = lineObj.yD<0? lineObj.y1 : lineObj.y2;
	lineObj.floor = lineObj.yD<0? lineObj.y2 : lineObj.y1;
	lineObj.width = Math.abs(lineObj.xD);
	lineObj.height = Math.abs(lineObj.yD);
	return lineObj;
}


function polylineCleanup(polyIndex) {
	let lineWidth = parseFloat(colourMaskArea.children[polyIndex+1].lastChild.style.strokeWidth);
	console.log("LW="+lineWidth);
	let rawCoords = [];
	let rawLines = [];
	let xPosList = [];
	let yPosList = [];
	//let innerLine = [];
	let index = 0;
	for(const a of colourMaskArea.children[polyIndex+1].lastChild.points) {
		rawCoords.push([index++, a.x,a.y]);
		xPosList.push(a.x);
		yPosList.push(a.y);
	}
	for(let i=1; i<rawCoords.length; i++) {
		rawLines.push(lineCreate(rawCoords[i-1][1],rawCoords[i-1][2],rawCoords[i][1],rawCoords[i][2],i-1));
	}
	let reduceI = 0;
	for(let i=1; i<rawLines.length; i++) {
		rawLines[i].i -= reduceI;
		if(rawLines[i-1].slope==rawLines[i].slope) {
			rawLines.splice(i-1, 2, lineCreate(rawLines[i-1].x1,rawLines[i-1].y1,rawLines[i].x2,rawLines[i].y2, --i));
			++reduceI;
		}
	} //console.log(Array.from(rawLines,(a)=>a.i));
	/*
	xPosList = new Set(xPosList.sort(function(a,b){return a-b}));
	yPosList = new Set(yPosList.sort(function(a,b){return a-b}));
	let coordsByXY = rawCoords.toSorted(function(a,b){return a[2]-b[2]}).toSorted(function(a,b){return a[1]-b[1]});
	//let linesByX = rawLines.toSorted(function(a,b){return a[1].-b[1]})
	console.log(coordsByXY);
	let lineOut = [];
	lineOut.push([coordsByXY[0][1],coordsByXY[0][2]]);
	let yMerge = [];
	for(const l of rawLines) {
		console.log("potential matches for ["+l.i+"] "+l.left+","+l.roof+","+l.right+","+l.floor+" with line="+lineWidth);
		let avail = rawLines.filter(function(a){
			return a.i!=l.i&&((a.left<=l.left&&l.right<=a.right)||(l.left-a.right>0&&l.left-a.right<=lineWidth)||(a.left-l.right>0&&a.left-l.right<=lineWidth))&&((a.floor<=l.floor&&l.roof<=a.roof)||(l.floor-a.roof>0&&l.floor-a.roof<=lineWidth)||(a.floor-l.roof>0&&a.floor-l.roof<=lineWidth))
		})
		avail.forEach( (element) => {
				console.log("   ["+element.i+"]  "+element.left+","+element.roof+","+element.right+","+element.floor);
		});
		break;
	} */
}


function polylineToPath(polyIndex) {
	console.log(colourMaskArea.children[polyIndex+1].lastChild.style.strokeWidth);
	if(colourMaskArea.children[polyIndex+1].lastChild.tagName=="polyline") {
		let newPolyLine = [];
		for(const a of colourMaskArea.children[polyIndex*2].lastChild.points) {
			//console.log(" point: "+a.x+", "+a.y);
			newPolyLine.push([a.x,a.y]);
		}
		console.log(newPolyLine);
		let startingCoord = newPolyLine[0];
		for(let i = 0; i<newPolyLine.length-1; i++) {
			newPolyLine[i] = [newPolyLine[i+1][0]-newPolyLine[i][0],newPolyLine[i+1][1]-newPolyLine[i][1], (newPolyLine[i+1][1]-newPolyLine[i][1])/(newPolyLine[i+1][0]-newPolyLine[i][0])];
		} newPolyLine.pop();
		for(let i = 1; i<newPolyLine.length; i++) {
			if(newPolyLine[i][2]==newPolyLine[i-1][2]) {
				newPolyLine[i] = [newPolyLine[i-1][0]+newPolyLine[i][0], newPolyLine[i-1][1]+newPolyLine[i][1], newPolyLine[i][2]];
				//colourMaskArea.children[polyIndex*2].lastChild.points.removeItem(i);
				newPolyLine.splice(--i, 1);
			}
		}
		console.log(startingCoord);
		console.log(newPolyLine);
		
		for(const a of colourMaskArea.children[polyIndex*2+1].children) {
			console.log(a.attributes.d);
		}
	}
}




//isolate values


function revokeMousedownColourArea() {
	console.log("mouse release");
	if(colourAreaSVG.tagName=="svg") {
		colourMaskArea.removeEventListener("mousemove",bind_newPolylineCoord);
		if(colourAreaSVG.getElementsByTagName("polyline")[colourAreaSVG.getElementsByTagName("polyline").length-1].points.length<2) {
			colourAreaSVG.getElementsByTagName("polyline")[colourAreaSVG.getElementsByTagName("polyline").length-1].remove();
		} else {
			if(undoButton.disabled) { undoButton.disabled = false;}
			//polylineCleanup(0);
		}
	} else {
		
	}
}

/*
function mousedownColourArea() {
	for(let i = colourAreaSVG.getElementsByTagName("polyline").length-1; i>=0; --i) {
		if(colourAreaSVG.getElementsByTagName("polyline")[i].style.getPropertyValue("display")=="none") {
			colourAreaSVG.getElementsByTagName("polyline")[i].remove();
		} else { i = -1; }
	}
	colourAreaSVG.innerHTML += "<polyline points=''></polyline>"; //declaring points to not brick the funciton
	newPolylineCoord();
	this.addEventListener("mousemove", bind_newPolylineCoord);
}*/


function newPolylineCoord() {
	let offset = colourMaskArea.getBoundingClientRect();
	//let coord = new DOMPoint(event.clientX-offset.left,event.clientY-offset.top);
	let coord = colourAreaSVG.createSVGPoint();
	coord.x = event.clientX-offset.left; 
	coord.y = event.clientY-offset.top;//-colourMaskArea.offsetTop;
	//console.log(colourAreaSVG.getElementsByTagName("polyline")[colourAreaSVG.getElementsByTagName("polyline").length-1]);
	//colourAreaPolyline.style.points += `${event.clientX-colourMaskArea.offsetLeft},${event.clientY-colourMaskArea.offsetTop}`;
	//console.log(colourAreaSVG.getElementsByTagName("polyline")[colourAreaSVG.getElementsByTagName("polyline").length-1]);
	//console.log(colourAreaSVG.getElementsByTagName("polyline")[colourAreaSVG.getElementsByTagName("polyline").length-1].points);
	colourAreaSVG.getElementsByTagName("polyline")[colourAreaSVG.getElementsByTagName("polyline").length-1].points.appendItem(coord);
	//*/
	
	//console.log(colourAreaPolyline.points);
}


function undoPolyline() {
	console.log("undo called");
	for(let i = colourAreaSVG.getElementsByTagName("polyline").length-1; i>=0; --i) {
		//console.log(i+": "+colourAreaSVG.getElementsByTagName("polyline")[i].style.getPropertyValue("display"));
		if(colourAreaSVG.getElementsByTagName("polyline")[i].style.getPropertyValue("display")!="none") {
			colourAreaSVG.getElementsByTagName("polyline")[i].style.setProperty("display","none");
			redoButton.disabled = false;
			if(i==0) { undoButton.disabled = true; }
			i = -1;
		}
	} 
}
function redoPolyline() {
	console.log("called redo");
	for(const a of colourAreaSVG.getElementsByTagName("polyline")) {
		if(a.style.getPropertyValue("display")=="none") {
			a.style.removeProperty("display");
			undoButton.disabled = false;
			if(colourAreaSVG.lastChild.style.getPropertyValue("display")!="none") { redoButton.disabled = true; }
			break;
		}
	} 
}
//isPaintMode
function switchSVG(inp=false) {
	console.log("running switchSVG with: "+inp);
	console.log(colourAreaSVG);
	console.log(vectorsSVG.children);
	//let classes = colourAreaSVG.classList;
	//colourAreaSVG.style.removeProperty("display"); //this wasn't working for some reason???
	//colourMaskArea.getElementsByClassName(classes[1])[classes[0]=="paintMode"?0:1].style.removeProperty("display");
	if(typeof(inp)=="boolean") {
		console.log("swithing mode");
		let layerStart = colourAreaSVG.classList[0];
		let matchesForLayer = colourMaskArea.getElementsByClassName(layerStart);
		colourAreaSVG = matchesForLayer[colourAreaSVG.tagName=="svg"?0:1];
		//matchesForLayer[0].style.setProperty("pointer-events",colourAreaSVG.tagName=="svg"?"none":"auto");
		isPaintMode = !isPaintMode;
		if(isPaintMode) {
			//matchesForLayer[0].style.setProperty("pointer-events","none");
			matchesForLayer[0].parentElement.classList.add("onion");
		} else {
			//matchesForLayer[0].style.removeProperty("pointer-events");
			matchesForLayer[0].parentElement.classList.remove("onion");
			if(matchesForLayer[1].childElementCount>0) {convertPaintToSVG(parseInt(layerStart.split('_')[1]));}
		}
	} else {
		console.log("swithing layer");
		if(typeof(inp)=="number") {inp = inp.toString();}
		else if(typeof(inp)!="string" || !['0','1','2','3','4','5','6','7','8','9'].includes(inp.slice(inp.length-1))) { //script error handling
			console.log("switchSVG: ERROR: invalid input: "+inp); exit(0);
		}
		if(inp.length==1) {inp = '0'+inp;}
		console.log(colourMaskArea.getElementsByClassName("layer_"+inp));
		colourAreaSVG = colourMaskArea.getElementsByClassName("layer_"+inp)[colourAreaSVG.tagName=="svg"?1:0];
		for(const a of layersList.getElementsByClassName("currentSel")) {a.classList.remove("currentSel");}
		layersList.children[parseInt(inp)+1].classList.add("currentSel");
	}
	colourAreaSVG.style.setProperty("display","initial");
	console.log("SVGcurrent is now: ");
	console.log(colourAreaSVG);
	if(colourAreaSVG.tagName=="svg") {
		if(colourAreaSVG.childElementCount==0||colourAreaSVG.firstChild.style.getPropertyValue("display")=="none") { undoButton.disabled = true; }
		if(colourAreaSVG.childElementCount==0||colourAreaSVG.lastChild.style.getPropertyValue("display")!="none") { redoButton.disabled = true; }
	}
}

function addSVGLayer() {
	console.log("called addSVG layer");
	console.log(colourMaskArea.childElementCount+"<="+layerLimit);
	if(colourMaskArea.childElementCount<=layerLimit) {
		let tempString = "layer_"+(colourMaskArea.childElementCount<11?"0":"")+(colourMaskArea.childElementCount-1);
		let tempObj = document.createElement('button');
		tempObj.innerHTML = "layer "+(colourMaskArea.childElementCount-1);
		tempObj.addEventListener("click", switchSVG.bind(this,colourMaskArea.childElementCount-1));
		colourMaskArea.innerHTML += `<svg class="${tempString}"> </svg>`;
		vectorsSVG = colourMaskArea.children[0]; //for some reason redeclaring the variable makes it lock in
		vectorsSVG.innerHTML += `<path class="${tempString}" d="M7 0 11 8C17 20 11 24 7 24 3 24-3 20 3 8L7 0 8 4C10 14 9 15 11 17 12 14 11 12 10 9L8 4Z"/>`;
		layersList.appendChild(tempObj);
		//console.log(colourMaskArea.children);
		//console.log(vectorsSVG.children);
		if(layersList.childElementCount>layerLimit) {
			document.getElementById("addSVGLayer").style.setProperty("display","none");
		}
		if(layersList.childElementCount>2) {
			switchSVG(layersList.childElementCount-2);
		}
		//M7 0 11 8C17 20 11 24 7 24 3 24-3 20 3 8L7 0 8 4C10 14 9 15 11 17 12 14 11 12 10 9L8 4Z
	}
}

function removeSVGLayer(which=false) {
	console.log("removing");
	if(colourMaskArea.childElementCount>2) {
		if(typeof(which)=="boolean") {which = parseInt(colourAreaSVG.classList[0].split('_')[1]);}
		else if(typeof(which) == "string") {which = parseInt(which);}
		let tempString = "layer_"+(which<10?"0":"")+which.toString();
		console.log(which);
		if(which<(colourMaskArea.childElementCount-1)) {
			//colourAreaSVG.tagName=="svg"
			let prevClass = colourAreaSVG.classList[0];
			console.log(which);
			if(which+1==colourMaskArea.childElementCount-1) {switchSVG(--which);}
			colourMaskArea.children[which+1].remove();
			vectorsSVG.children[which].remove();
			for(let i = vectorsSVG.childElementCount; i>which; i--) {
				console.log("i: "+i);
				let tempNum = parseInt(vectorsSVG.children[i-1].classList[0].split('_')[1])-1;
				colourMaskArea.children[i].classList.add("layer_"+(tempNum<10?"0":"")+tempNum);
				vectorsSVG.children[i-1].classList.add("layer_"+(tempNum<10?"0":"")+tempNum);
				vectorsSVG.children[i-1].classList.remove(colourMaskArea.children[i].classList[1]);
				colourMaskArea.children[i].classList.remove(colourMaskArea.children[i].classList[1]);
				console.log(colourMaskArea.children[i].classList);
			}
			layersList.lastChild.remove();
			console.log(which+" vs "+(colourMaskArea.childElementCount-1)+" vs "+layersList.childElementCount);
			switchSVG(which);
		}
		if(layersList.childElementCount==layerLimit) { document.getElementById("addSVGLayer").style.removeProperty("display"); }
	}
}


colourDisplay.addEventListener("mousedown", function() { this.addEventListener("mousemove", bind_colourPadInput); colourPad_input();});

colourDisplay.addEventListener("mouseup", function() { this.removeEventListener("mousemove", bind_colourPadInput); });
colourDisplay.addEventListener("pointerleave", function() { this.removeEventListener("mousemove", bind_colourPadInput); });


function colourPad_input() {
	let bounding = colourDisplay.getBoundingClientRect();
	if(event.clientX>=bounding.left&&event.clientX<=bounding.right) {colourStuff_update01Slider((event.clientX-bounding.left)/bounding.width, "--value-sature", "saturateSlider", "saturateSlider_Range");}
	if(event.clientY>=bounding.top&&event.clientY<=bounding.bottom) {colourStuff_update01Slider((bounding.bottom-event.clientY)/bounding.height, "--value-light", "lightSlider", "lightSlider_Range");}
}


document.getElementById("opacitySlider").value = 1;
colourStuff.style.setProperty("--color-opacity",1);

document.getElementById("colourHex").children[0].value = 255;
document.getElementById("colourHex").children[1].value = 0;
document.getElementById("colourHex").children[2].value = 0;
RGBtoHSV();

document.getElementById("colourSlider").addEventListener("input", function() {
	colourStuff.style.setProperty("--hue",Number(this.value)/255);
	updateRGBValueDisplay();
});
document.getElementById("lightSlider").addEventListener("input", function() { colourStuff_update01Slider(this.value, "--value-light", false, "lightSlider_Range"); updateRGBValueDisplay(); });
document.getElementById("saturateSlider").addEventListener("input", function() { colourStuff_update01Slider(this.value, "--value-sature", false, "saturateSlider_Range"); updateRGBValueDisplay();});
document.getElementById("opacitySlider").addEventListener("input", function() { colourStuff_update01Slider(this.value, "--color-opacity", false, "opacitySlider_Range"); });
for(const a of document.getElementById("colourHex").children) {
	a.addEventListener("input", function() {RGBtoHSV();});
}

function colourStuff_update01Slider(inp, associatedVar=false, sliderID=false, valueDisplayID=false) {
	//console.log(inp+", "+sliderID+", "+associatedVar+", "+valueDisplayID);
	if(sliderID) {document.getElementById(sliderID).value = inp;}
	if(associatedVar) {colourStuff.style.setProperty(associatedVar,inp);}
	if(valueDisplayID) { document.getElementById(valueDisplayID).value = Math.round(inp*1000)/10;}
}

function updateRGBValueDisplay() {
	let rgb_elements = document.getElementById("colourHex").children;
	let valueH =  Number(colourStuff.style.getPropertyValue("--hue"));
	let valueL = Number(colourStuff.style.getPropertyValue("--value-light"));
	let valueS = Number(colourStuff.style.getPropertyValue("--value-sature"));
	let calc_C = valueL*valueS;
	let calc_X = calc_C*(1-Math.abs(valueH%2-1));
	//let calc_m = valueL-calc_C;
	let new_rgb = [calc_X, calc_X, calc_X];
	valueH = Math.floor(valueH);
	new_rgb[Math.ceil(valueH/2)%3] = calc_C;
	new_rgb[(Math.floor(valueH/2)+2)%3] = 0;
	for(let i=0; i<3; i++) { rgb_elements[i].value = Math.round((new_rgb[i]+valueL-calc_C)*255); }
}


function recalibrateRBGValues() {
	let rgb_elements = document.getElementById("colourHex").children;
	let rgb_values = [colourStuff.style.getPropertyValue("--hue-r"),colourStuff.style.getPropertyValue("--hue-g"),colourStuff.style.getPropertyValue("--hue-b")];
	let rbg_light = colourStuff.style.getPropertyValue("--value-light");
	let rgb_sature = colourStuff.style.getPropertyValue("--value-sature");
	for(let i=0; i<3; i++) {
		rgb_elements[i].value = Math.round(clamp(rgb_values[i]*(2-rgb_sature)*rbg_light,255,0));
		if(rbg_light>0&&rgb_values[i]==0) {rgb_elements[i].value = Math.round(255-255*rgb_sature);}
	}
}

function RGBtoHSV() {
	console.log("running RGBtoHSV");
	let rgb_elements = document.getElementById("colourHex").children;
	let rgb_values = [0,0,0];
	let hueValue = 0;
	for(let i=0; i<3; i++) { rgb_values[i] = Number(rgb_elements[i].value)/255; }
	//console.log(rgb_values);
	let maxV = Math.max(...rgb_values);
	let difference = maxV-Math.min(...rgb_values);
	let sature = 0;
	//console.log("difference: "+difference);
	if(difference!=0){
		sature = difference/maxV;
		if(rgb_values.indexOf(Math.max(rgb_values))==rgb_values.lastIndexOf(Math.max(rgb_values))) { //1 dominant value
			let maxIndex = rgb_values.indexOf(maxV);
			hueValue = ((rgb_values[(maxIndex+1)%3]-rgb_values[(maxIndex+2)%3])/difference+maxIndex*2)%6;
		} else { //2 dominant values
			hueValue = (rgb_values.indexOf(Math.min(...rgb_values))*2+1)%6;
			//min: b: 2 ,', r+g = 255 = 1
			//min: r: 0 ,', g+b = 765 = 3
			//min: g: 1 ,', b+r = 1275 = 5
		}
	}
	//hue values are set seperately due to the difference in scale
	document.getElementById("colourSlider").value = hueValue*255;
	colourStuff.style.setProperty("--hue", hueValue);
	colourStuff_update01Slider(maxV, "--value-light", "lightSlider", "lightSlider_Range");
	colourStuff_update01Slider(sature, "--value-sature", "saturateSlider", "saturateSlider_Range");
}

/*
function HSVtoRGB() {
	let light = Number(colourStuff.style.getPropertyValue("--value-light"));
	let sature = Number(colourStuff.style.getPropertyValue("--value-sature"));
	let maxValue = 0;
}*/

function hueToRawRGB(hueValue=false) {
	let rgb_values_raw = [0,0,0];
	hueValue = hueValue||Number(document.getElementById("colourSlider"));
	rgb_values_raw[Math.ceil(Math.floor(hueValue/255)/2)%3] = 255;
	//rgb_values_raw[(Math.floor(Math.floor(hueValue/255)/2)+2)%3] = 0; //0 declaration not needed because it is initialized as 0
	if(Math.floor(hueValue/255)%2==0) {
		rgb_values_raw[(Math.floor(hueValue/255)/2+1)%3] = hueValue%255;
	} else {
		rgb_values_raw[Math.floor(hueValue/255)/2-0.5] = 255-hueValue%255;
	}
	colourStuff.style.setProperty("--hue-r",rgb_values_raw[0]);
	colourStuff.style.setProperty("--hue-g",rgb_values_raw[1]);
	colourStuff.style.setProperty("--hue-b",rgb_values_raw[2]);
	//console.log(hueValue+", "+rgb_values_raw[0]+", "+rgb_values_raw[1]+", "+rgb_values_raw[2]);
	/*
	an rgb at max saturation and value will always have a 0 and 255 value.
	I|value| colour |  r ,  g ,  b |
	0:    0:     red: 255,   0,   0
	1:  255:  yellow: 255, 255,   0
	2:  510:    lime:   0, 255,   0
	3:  765:    cyan:   0, 255, 255
	4: 1020:    blue:   0,   0, 255
	5: 1275: magenta: 255,   0, 255
	
	these absolute colours all occur on multiples of 255 ranging from 0 to 5 ,', the area/transition can be determined by dividing the value by 255 and rounding (up or down depending) to a flat integer.
	new 255s appear on odd indexes and old 255s disappear on even indexes ,', the non absolute value increases on even indexes and shrinks on odd 
	
	equations explained:
		floor(hueValue/255): gets the index
		
		floor(index/2):  0||1 => 0, 2||3 => 1, 4||5 => 2
				0 => 0 => 0, 1 => 0.5 => 0, 2 => 1 => 1, 3 => 1.5 => 1, 4 => 2 => 2, 5 => 2.5 => 2
				
		ceiling(index/2):  0 => 0, 1||2 => 1, 3||4 => 2, 5 => 3
				0 => 0 => 0, 1 => 0.5 => 1, 2 => 1 => 1, 3 => 1.5 => 2, 4 => 2 => 2, 5 => 2.5 => 3
				
		%3: modifies number by 3 to place back within [0..2] range
		
		%255: offset from the absolute value
	*/
}

function recalibrateRBGProps(whichColour) {
	switch(whichColour) {
		case 'r'||'R': whichColour = 0; break;
		case 'g'||'G': whichColour = 1; break;
		case 'b'||'B': whichColour = 2; break;
	}
	let rgb_elements = document.getElementById("colourHex").children;
	let rgb_values = [rgb_elements[0].value,rgb_elements[1].value,rgb_elements[2].value];
	let rgb_raw = [-1,-1,-1];
	let assumedSaturation = 255-rgb_values[rgb_values.indexOf(Math.min(rgb_values))];
	let assumedLight = Math.max(rgb_values);
	rgb_raw[rgb_values.indexOf(Math.max(rgb_values))] = 255;
	rgb_raw[rgb_values.indexOf(Math.min(rgb_values))] = 0;
	/*
	if(rgb_values[rgb_raw.indexOf(-1)]==rgb_values[whichColour]) {
		if(rgb_values[whichColour]==Math.max(rgb_values)) {
			rgb_raw[rgb_raw.indexOf(-1)] = 255;
		} else if(rgb_values[whichColour]==Math.min(rgb_values)) {
			rgb_raw[rgb_raw.indexOf(-1)] = 0;
		} else {
			rgb_raw[rgb_raw.indexOf(-1)] = rgb_values[whichColour];
		}
	}*/
	colourStuff.style.setProperty("--hue-r",rgb_raw[0]);
	colourStuff.style.setProperty("--hue-g",rgb_raw[1]);
	colourStuff.style.setProperty("--hue-b",rgb_raw[2]);
	colourStuff.style.setProperty("--value-sature",(255-assumedSaturation)/255);
	colourStuff.style.setProperty("--value-light",assumedLight/255);
}


