/* this js is for the components of "decalMaker" */

let toolsList = document.getElementById("tools").children;
//let windowWidth = window.innerWidth;

//constants
const colourMaskArea = document.getElementById("colourAreaMask");
const colourMaskParent = colourMaskArea.parentElement;
const layersList = document.getElementById("layerArray");
const decalColourContainer = document.getElementById("decalMakerColourSetting");
const colourDisplay = decalColourContainer.children[0];
const lineThicknessSlider = document.getElementById("lineThickness");
const paintCursor = document.getElementById("mouseCursor");
const addOrRemovePaintCheckbox = document.getElementById("addOrRemovePaint").children[0];
const undoButton = toolsList[0];
const redoButton = toolsList[1];
const canvas = document.getElementById("decalCanvas"); //for potentially converting the polyline into a png and then back to an svg, might just use math

//
colourMaskArea.innerHTML = `<svg id="vectorMode" class="onion"></svg>`; /*the DOM doesn't like directly interacting with SVGs so I'm tricking it into treating it like a normal DOM object*/

//variables
var layerLimit = 10;
var vectorsSVG = colourMaskArea.children[0];
var colourAreaSelected;
var isPaintMode;

//
addSVGLayer();
isPaintorErase(isPaintMode);
paintCursor.style.setProperty("--cursorWidth",Number(lineThicknessSlider.value)+"px");
customCursorVisibile(false);

//binded to allow removal and reapplication without duplicating listeners.
var bind_newPolylineCoord = newPolylineCoord.bind(this); 
var bind_colourPadInput = colourPad_input.bind(this);
var bind_changeSVG;// = newPolylineCoord.bind(this);
var bind_trackMouseforPaintCursor = cursorFollowMouse.bind(this);


//event listeners: input change

lineThicknessSlider.addEventListener("input", function() {paintCursor.style.setProperty("--cursorWidth",Number(this.value)+"px");});

addOrRemovePaintCheckbox.addEventListener("change",function() { isPaintorErase(this.checked); });




document.getElementById("togglePaintVector").addEventListener("change", function() {
	let paintSwitchText = "switching to vertex mode will remove your paint history, proceed?"
	if(isPaintMode) {
		if(colourAreaSelected.childElementCount==0||confirm(paintSwitchText)) {
			switchSVG();
		} else {
			console.log(vectorsSVG.children[0]);
			this.checked = !this.checked;
		}
	} else {
		switchSVG();
	}
});


//event listeners: is mouse over paint area

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

//event listener: mouse drawing on paint area

colourMaskArea.addEventListener("mousedown", function() { //input on decal area
	console.log("mouse press");
	if(colourAreaSelected.tagName=="svg") {
		for(let i = colourAreaSelected.getElementsByTagName("polyline").length-1; i>=0; --i) {
			if(colourAreaSelected.getElementsByTagName("polyline")[i].style.getPropertyValue("display")=="none") {
				colourAreaSelected.getElementsByTagName("polyline")[i].remove();
			} else {
				if(!redoButton.disabled) { redoButton.disabled = true; }
				i = -1;
			}
		}
		colourAreaSelected.innerHTML += `<polyline class="${addOrRemovePaintCheckbox.checked?"paint":"erase"}"style="stroke-width:${Number(lineThicknessSlider.value)};" points=''></polyline>`; //declaring points to not brick the funciton
		newPolylineCoord();
		this.addEventListener("mousemove", bind_newPolylineCoord);
	} else {
		
	}
} );

colourMaskArea.addEventListener("mouseup", function() {revokeMousedownColourArea();} );
//colourMaskArea.addEventListener("pointerleave", function() {revokeMousedownColourArea();} ); //may bring back


//functions: polyline creation

function newPolylineCoord() { //called when mouse moves durring a painting input
	let offset = colourMaskArea.getBoundingClientRect();
	let coord = colourAreaSelected.createSVGPoint();
	coord.x = event.clientX-offset.left; 
	coord.y = event.clientY-offset.top;
	colourAreaSelected.getElementsByTagName("polyline")[colourAreaSelected.getElementsByTagName("polyline").length-1].points.appendItem(coord);
}

function revokeMousedownColourArea() { //called when a painting mouse input ends
	console.log("mouse release");
	if(colourAreaSelected.tagName=="svg") {
		colourMaskArea.removeEventListener("mousemove",bind_newPolylineCoord);
		if(colourAreaSelected.getElementsByTagName("polyline")[colourAreaSelected.getElementsByTagName("polyline").length-1].points.length<2) {
			colourAreaSelected.getElementsByTagName("polyline")[colourAreaSelected.getElementsByTagName("polyline").length-1].remove();
		} else {
			if(undoButton.disabled) { undoButton.disabled = false;}
			//polylineCleanup(colourMaskArea.childElementCount-1);
		}
	} else {
		
	}
}


//functions: cursor

function customCursorVisibile(makeVisable) {
	if(makeVisable) {
		paintCursor.style.removeProperty("display");
	} else {
		paintCursor.style.setProperty("display","none");
	}
}

function cursorFollowMouse() {
	paintCursor.style.setProperty("--xPos",event.clientX+"px");
	paintCursor.style.setProperty("--yPos",event.clientY+"px");
}

function isPaintorErase(setPainting) {
	paintCursor.style.setProperty("--borderType",setPainting?"solid":"dashed");
}


//funcitons: finalizing polyline

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

function polylineCleanup(polyIndex=-1) {
	console.log("polylineCleanup: CALLED: polyIndex={"+polyIndex+"}");
	//because the vector SVG throws off the count by 1 polyIndex must be 1 above it's actual index
	if(typeof(polyIndex)!="number"||polyIndex%1!=0) {
		console.log("polylineCleanup: INPUT ERROR: "+polyIndex+": needs to be integer");
		return;
	}
	if(polyIndex==0) {
		++polyIndex;
		console.log("polylineCleanup: ADJUSTMENT: polyIndex={"+polyIndex+"}");
	} else if(polyIndex<0||polyIndex>vectorsSVG.childElementCount) {
		polyIndex = vectorsSVG.childElementCount;
		console.log("polylineCleanup: ADJUSTMENT: polyIndex={"+polyIndex+"}");
	}
	let lineWidth = parseFloat(colourMaskArea.children[polyIndex].lastChild.style.strokeWidth);
	//console.log("LW="+lineWidth);
	let rawCoords = [];
	let rawLines = [];
	let xPosList = [];
	let yPosList = [];
	let index = 0;
	for(const a of colourMaskArea.children[polyIndex].lastChild.points) { //array for easier reading
		rawCoords.push([index++, a.x,a.y]);
		xPosList.push(a.x);
		yPosList.push(a.y);
	}
	for(let i=1; i<rawCoords.length; i++) { //convert array points into lines with start and end points
		rawLines.push(lineCreate(rawCoords[i-1][1],rawCoords[i-1][2],rawCoords[i][1],rawCoords[i][2],i-1));
	}
	let reduceI = 0; //account for index gaps when combining lines
	for(let i=1; i<rawLines.length; i++) { //combine lines with same slope
		rawLines[i].i -= reduceI;
		if(rawLines[i-1].slope==rawLines[i].slope) {
			rawLines.splice(i-1, 2, lineCreate(rawLines[i-1].x1,rawLines[i-1].y1,rawLines[i].x2,rawLines[i].y2, --i));
			++reduceI;
		}
	}
	/*STILL NEEDS: to either update the polyline, or return the points for another function*/
}

function clearPaint(polyIndex=-1) {
	console.log("clearPaint: CALLED: polyIndex={"+polyIndex+"}"); 
	if(typeof(polyIndex)!="number"||polyIndex%1!=0) {
		console.log("clearPaint: INPUT ERROR: "+polyIndex+": needs to be integer"); return;
	} else if (polyIndex<0||polyIndex>=vectorsSVG.childElementCount){
		polyIndex = parseInt(colourAreaSelected.classList[0].split("_")[1]);
	}
	colourMaskArea.children[polyIndex+1].innerHTML = '';
	undoButton.disabled = true;
	redoButton.disabled = true;
}


//funcitons: polyline to vector
function convertPaintToSVG(lay) {
	console.log("[WIP Paint to SVG]");
	polylineCleanup(lay);
	clearPaint(lay);
}


//function: undo and redo
function undoPolyline() {
	console.log("called undoPolyline");
	for(let i = colourAreaSelected.getElementsByTagName("polyline").length-1; i>=0; --i) {
		if(colourAreaSelected.getElementsByTagName("polyline")[i].style.getPropertyValue("display")!="none") {
			colourAreaSelected.getElementsByTagName("polyline")[i].style.setProperty("display","none");
			redoButton.disabled = false;
			if(i==0) { undoButton.disabled = true; }
			return;
		}
	} console.log("undoPolyline: CALL OVERSIGHT: no undos available"); undoButton.disabled = true;
}
function redoPolyline() {
	console.log("called redoPolyline");
	for(const a of colourAreaSelected.getElementsByTagName("polyline")) {
		if(a.style.getPropertyValue("display")=="none") {
			a.style.removeProperty("display");
			undoButton.disabled = false;
			if(colourAreaSelected.lastChild.style.getPropertyValue("display")!="none") { redoButton.disabled = true; }
			return;
		}
	} console.log("redoPolyline: CALL OVERSIGHT: no redos available"); redoButton.disabled = true;
}


//functions: layer management
function addSVGLayer() {
	console.log("addSVGLayer: CALLED");
	if(colourMaskArea.childElementCount<=layerLimit) {
		let layerString = "layer_"+(colourMaskArea.childElementCount<11?"0":"")+(colourMaskArea.childElementCount-1);
		let layerSelectButton = document.createElement('button');
		layerSelectButton.innerHTML = "layer "+(colourMaskArea.childElementCount-1);
		layerSelectButton.addEventListener("click", switchSVG.bind(this,colourMaskArea.childElementCount-1)); //since new layer hasn't been added yet, only subtract 1
		colourMaskArea.innerHTML += `<svg class="${layerString}"> </svg>`;
		vectorsSVG = colourMaskArea.children[0]; //JS doesn't like directly interacting with SVG objects so the variable is being reassigned to trick it into accepting it, this is also why innerHTML is used.
		vectorsSVG.innerHTML += `<path class="${layerString}" d="M7 0 11 8C17 20 11 24 7 24 3 24-3 20 3 8L7 0 8 4C10 14 9 15 11 17 12 14 11 12 10 9L8 4Z"/>`; //TEMPORARY DEFAULT: to test onion class: ONCE TESTING COMPLETE: have d value be empty on creation.
		layersList.appendChild(layerSelectButton);
		if(layersList.childElementCount>layerLimit) {
			document.getElementById("addSVGLayer").style.setProperty("display","none");
		}
		if(layersList.childElementCount>2) { 
			switchSVG(layersList.childElementCount-2);
		} else { //first layer
			console.log("initializing")
			colourAreaSelected = colourMaskArea.children[1];
			colourAreaSelected.style.setProperty("display","initial");
			console.log(colourAreaSelected);
			isPaintMode = true;
			document.getElementById("togglePaintVector").checked = false;
			layersList.lastChild.classList.add("currentSel");
			undoButton.disabled = true;
			redoButton.disabled = true;
			decalColourContainer.style.setProperty("display","none");
		}
		//M7 0 11 8C17 20 11 24 7 24 3 24-3 20 3 8L7 0 8 4C10 14 9 15 11 17 12 14 11 12 10 9L8 4Z
		//^ test default string
	} else {
		console.log("addSVGLayer: CALL OVERSIGHT: cannot exceed the layer limit of {"+layerLimit+"}");
	}
}

function removeSVGLayer(layerNumber=false) {
	console.log("removeSVGLayer: CALLED: input={"+layerNumber+"}");
	if(colourMaskArea.childElementCount>2) { //cannot run if only 1 layer exists
		if(typeof(layerNumber)=="boolean") {layerNumber = parseInt(colourAreaSelected.classList[0].split('_')[1]);}
		else if(typeof(layerNumber)!="number"||layerNumber%1!=0) {
			console.log("removeSVGLayer: INPUT ERROR: "+layerNumber+": needs to be integer or nothing");
			return;
		} else if (layerNumber<0||layerNumber>colourMaskArea.childElementCount-2) {
			console.log("removeSVGLayer: INPUT ERROR: {"+layerNumber+"} not within 0.."+(colourMaskArea.childElementCount-2));
			return;
		}
		//(colourAreaSelected==colourMaskArea.lastChild||colourAreaSelected==vectorsSVG.lastChild)
		if(layerNumber==vectorsSVG.childElementCount-1) {switchSVG(layerNumber-1);}
		colourMaskArea.children[layerNumber+1].remove();
		vectorsSVG.children[layerNumber].remove();
		for(let i = vectorsSVG.childElementCount; i>layerNumber; i--) {
			let layerString = "layer_"+(i<11?"0":"")+(i-1);
			vectorsSVG.children[i-1].classList.remove(colourMaskArea.children[i].classList[0]);
			colourMaskArea.children[i].classList.remove(colourMaskArea.children[i].classList[0]);
			colourMaskArea.children[i].classList.add(layerString);
			vectorsSVG.children[i-1].classList.add(layerString);
		}
		layersList.lastChild.remove();
		switchSVG(layerNumber-(layerNumber==vectorsSVG.childElementCount?1:0));
		if(layersList.childElementCount==layerLimit) { document.getElementById("addSVGLayer").style.removeProperty("display"); }
	} else {
		console.log("removeSVGLayer: CALL OVERSIGHT: needs at least 2 layers to execute");
	}
}

function switchSVG(layerNumber=false) {
	console.log("switchSVG: CALLED: input={"+layerNumber+"}");
	if(typeof(layerNumber)=="boolean"&&!layerNumber) {
		console.log("switchSVG: switching mode");
		let originalLayer = colourAreaSelected.classList[0];
		let matchesForLayer = colourMaskArea.getElementsByClassName(originalLayer); //so far this has always returned the vector layer first and paint layer second
		colourAreaSelected = matchesForLayer[colourAreaSelected.tagName=="svg"?0:1]; //switch active element
		isPaintMode = !isPaintMode;
		if(isPaintMode) {
			matchesForLayer[0].parentElement.classList.add("onion");
			decalColourContainer.style.setProperty("display","none");
			document.getElementById("tools").style.removeProperty("display");
		} else {
			matchesForLayer[0].parentElement.classList.remove("onion");
			if(matchesForLayer[1].childElementCount>0) {convertPaintToSVG(parseInt(originalLayer.split('_')[1]));}
			decalColourContainer.style.removeProperty("display");
			document.getElementById("tools").style.setProperty("display","none");
		}
	} else if(typeof(layerNumber)=="number") {
		if(layerNumber%1!=0) {
			console.log("switchSVG: INPUT ERROR: "+layerNumber+": needs to be integer");
			return;
		} else if(layerNumber<0||layerNumber>colourMaskArea.childElementCount-2) {
			console.log("switchSVG: INPUT ERROR: {"+layerNumber+"} not within 0.."+(colourMaskArea.childElementCount-2));
			return;
		} else {
			console.log("switchSVG: switching layer");
			let matchesForLayer = colourMaskArea.getElementsByClassName("layer_"+(layerNumber<10?"0":"")+layerNumber); 
			colourMaskArea.getElementsByClassName(colourAreaSelected.classList[0])[colourAreaSelected.tagName=="svg"?1:0].style.removeProperty("display");
			//colourAreaSelected.style.removeProperty("display");
			colourAreaSelected = matchesForLayer[colourAreaSelected.tagName=="svg"?1:0];
			layersList.getElementsByClassName("currentSel")[0].classList.remove("currentSel");
			layersList.children[layerNumber+1].classList.add("currentSel");
			if(colourAreaSelected.tagName!="svg"&&matchesForLayer[1].childElementCount>0) {
				let switchBackToPaintText = "there is unformatted paint data for this layer\npress ok to format it all as a vector\ncancel to open as paint";
				if(confirm(switchBackToPaintText)) {
					convertPaintToSVG(layerNumber);
				} else {
					document.getElementById("togglePaintVector").checked = false;
					switchSVG();
				}
			}
		}
	} else {
		console.log("switchSVG: INPUT ERROR: "+layerNumber+": needs to be false boolean or integer"); return;
	}
	colourAreaSelected.style.setProperty("display","initial");
	if(colourAreaSelected.tagName=="svg") {
		//1. cannot be enabled if there's no lines, 2. a hidden line will have a DOM style for display, a visable line will not.
		//currently undo and redo only applies to painting. firstChild was throwing an error so it's been replaced with children[0]
		undoButton.disabled = (colourAreaSelected.childElementCount==0||colourAreaSelected.children[0].getAttribute("style").indexOf("display:")!=-1||colourAreaSelected.children[0].style.getPropertyValue("display")=="none");
		redoButton.disabled = (colourAreaSelected.childElementCount==0||colourAreaSelected.lastChild.getAttribute("style").indexOf("display:")==-1||colourAreaSelected.lastChild.style.getPropertyValue("display")!="none");
	}
}


//colour pad settings

//initializing colour value
document.getElementById("opacitySlider").value = 1;
decalColourContainer.style.setProperty("--color-opacity",1);

document.getElementById("colourHex").children[0].value = 255;
document.getElementById("colourHex").children[1].value = 0;
document.getElementById("colourHex").children[2].value = 0;
RGBtoHSV();



//event handle: mouse input on colour pad

colourDisplay.addEventListener("mousedown", function() { this.addEventListener("mousemove", bind_colourPadInput); colourPad_input();});

colourDisplay.addEventListener("mouseup", function() { this.removeEventListener("mousemove", bind_colourPadInput); });
colourDisplay.addEventListener("pointerleave", function() { this.removeEventListener("mousemove", bind_colourPadInput); });

function colourPad_input() {
	let bounding = colourDisplay.getBoundingClientRect();
	if(event.clientX>=bounding.left&&event.clientX<=bounding.right) {decalColourContainer_updateSlider((event.clientX-bounding.left)/bounding.width, "--value-sature", "saturateSlider", "saturateSlider_Range");}
	if(event.clientY>=bounding.top&&event.clientY<=bounding.bottom) {decalColourContainer_updateSlider((bounding.bottom-event.clientY)/bounding.height, "--value-light", "lightSlider", "lightSlider_Range");}
}


//event handle: colour slider input changes

document.getElementById("colourSlider").addEventListener("input", function() { decalColourContainer.style.setProperty("--hue",Number(this.value)/255); updateRGBValueDisplay(); });

document.getElementById("lightSlider").addEventListener("input", function() { decalColourContainer_updateSlider(this.value, "--value-light", false, "lightSlider_Range"); updateRGBValueDisplay(); });
document.getElementById("saturateSlider").addEventListener("input", function() { decalColourContainer_updateSlider(this.value, "--value-sature", false, "saturateSlider_Range"); updateRGBValueDisplay();});
document.getElementById("opacitySlider").addEventListener("input", function() { decalColourContainer_updateSlider(this.value, "--color-opacity", false, "opacitySlider_Range"); });

document.getElementById("lightSlider_Range").addEventListener("input", function() { decalColourContainer_updateSlider(this.value/100, "--value-light", "lightSlider"); updateRGBValueDisplay(); });
document.getElementById("saturateSlider_Range").addEventListener("input", function() { decalColourContainer_updateSlider(this.value/100, "--value-light", "saturateSlider"); updateRGBValueDisplay(); });
document.getElementById("opacitySlider_Range").addEventListener("input", function() { decalColourContainer_updateSlider(this.value/100, "--value-light", "opacitySlider"); });

function decalColourContainer_updateSlider(inputValue, associatedVar=false, sliderID=false, valueDisplayID=false) { //adjusts associated sliders and output objects to new input
	console.log("decalColourContainer_updateSlider: CALLED: inputValue={"+inputValue+"} sliderID={"+sliderID+"} associatedVar={"+associatedVar+"} valueDisplayID={"+valueDisplayID+"}");
	if(sliderID) {document.getElementById(sliderID).value = inputValue;}
	if(associatedVar) {decalColourContainer.style.setProperty(associatedVar,inputValue);}
	if(valueDisplayID) { document.getElementById(valueDisplayID).value = Math.round(inputValue*1000)/10;}
}


//event handle: rgb values changed
for(const a of document.getElementById("colourHex").children) {
	a.addEventListener("input", function() {RGBtoHSV();});
}



//functions: rgb<=>hsv

function updateRGBValueDisplay() {
	console.log("updateRGBValueDisplay: CALLED");
	let rgb_elements = document.getElementById("colourHex").children;
	let valueH =  Number(decalColourContainer.style.getPropertyValue("--hue"));
	let valueL = Number(decalColourContainer.style.getPropertyValue("--value-light"));
	let valueS = Number(decalColourContainer.style.getPropertyValue("--value-sature"));
	let calc_C = valueL*valueS;
	let calc_X = calc_C*(1-Math.abs(valueH%2-1));
	//let calc_m = valueL-calc_C;
	let new_rgb = [calc_X, calc_X, calc_X];
	valueH = Math.floor(valueH);
	new_rgb[Math.ceil(valueH/2)%3] = calc_C;
	new_rgb[(Math.floor(valueH/2)+2)%3] = 0;
	for(let i=0; i<3; i++) { rgb_elements[i].value = Math.round((new_rgb[i]+valueL-calc_C)*255); }
}

function RGBtoHSV() {
	console.log("RGBtoHSV: CALLED");
	let rgb_elements = document.getElementById("colourHex").children;
	let rgb_values = [0,0,0];
	let hueValue = 0;
	for(let i=0; i<3; i++) { rgb_values[i] = Number(rgb_elements[i].value)/255; } //normalize rgb values
	let maxV = Math.max(...rgb_values); //the ... avoids it throwing an error
	let difference = maxV-Math.min(...rgb_values);
	let sature = 0;
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
	//due to the difference in scale, hue is not set with decalColourContainer_updateSlider()
	document.getElementById("colourSlider").value = hueValue*255;
	decalColourContainer.style.setProperty("--hue", hueValue);
	decalColourContainer_updateSlider(maxV, "--value-light", "lightSlider", "lightSlider_Range");
	decalColourContainer_updateSlider(sature, "--value-sature", "saturateSlider", "saturateSlider_Range");
}

