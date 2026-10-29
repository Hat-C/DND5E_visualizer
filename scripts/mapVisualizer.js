const playfieldView = document.getElementById("playfieldView");
const playfield = document.getElementById("playfield");
const playfieldBack = document.getElementById("playfieldBack");
const xLabel = document.getElementById("xLabel");
const yLabel = document.getElementById("yLabel");
const mapHoverTileFocus = document.getElementById("map-tile-hovering-tile");
const mapHoverTileFocusObject = document.getElementById("map-tile-hovering-object");
const mapHoverTileFocusList = document.getElementById("map-tile-hovering-contents");
const mapHoverTileFocusListItems = document.getElementById("map-tile-hovering-contents-items");
const mapHoverTileFocusListTokens = document.getElementById("map-tile-hovering-contents-tokens");
playfieldView.style.setProperty("--tileDim", `${document.getElementById("cellSize").value}px`);
var pixelLength_tile = Number(playfieldView.style.getPropertyValue('--tileDim').slice(0,-2));
var pixelLength_tileGap = Number(playfieldView.style.getPropertyValue('--tableBor').slice(0,-2));
var hoverTileCoords = [0,0];
//var pixelLength_tile = Number(playfieldView.style.getPropertyValue('--tileDim').slice(0,-2));
//playfield.innerHTML = `<tr><td>A</td><td>B</td></tr><tr rowspan='2'><td colspan='2'>C</td></tr>`;


playfield.parentElement.addEventListener("scroll", function(){ xLabel.scrollLeft = playfield.parentElement.scrollLeft; yLabel.scrollTop = playfield.parentElement.scrollTop; } );

playfield.addEventListener("scroll", function() {
	console.log("cycle through map layers");
});

var validID = 0;
newCreateTable();


var mapObjs = new Map();

// v binders
var hoverRow = new Map();
var hoverCell = new Map();
var hoverTile = null;

var hoverMultiTileObj = null;

var mapHoverTileContentsList = {};

var removeEvent = new Map();
// ^ binders

document.getElementById("tkNaN").style.setProperty('--cord-x',3);
document.getElementById("tkNaN").style.setProperty('--cord-y',1);
document.getElementById("TEMP-rope").style.setProperty('--cord-x',1);
document.getElementById("TEMP-rope").style.setProperty('--cord-y',1);


function removeEventListenSingle(calledBy, listenerFunction, typeEvent="mouseenter", callEvent="pointerleave") {
	//console.log("run removeEventListenSingle");
	calledBy.removeEventListener(callEvent, removeEvent.get(listenerFunction));
	removeEvent.delete(listenerFunction);
	calledBy.removeEventListener(typeEvent, listenerFunction);
	listenerFunction = undefined;
}
function removeEventListenMultiple(calledBy, listenersList, typeEvent="mouseenter", callEvent="pointerleave") {
	//console.log("run removeEventListenMultiple");
	//console.log(calledBy);
	calledBy.removeEventListener(callEvent, removeEvent.get(listenersList));
	removeEvent.delete(listenersList);
	for(const [obj,binded] of listenersList) {
		obj.removeEventListener(typeEvent, binded);
		listenersList.delete(obj);
	}
	//console.log(listenersList);
}

for(const a of playfield.children) {
	let objName;
	let loopC = 0;
	if(a.id!="playfieldBack") { mapObjectCreate(a); }
}

function mapObjectCreate(obj) {
	let tempObj = new Object();
	let x_pos = Number(obj.style.getPropertyValue('--cord-x'));
	let y_pos = Number(obj.style.getPropertyValue('--cord-y'));
	let typePri = 'unknown';
	let typeSec = 'unknown';
	tempObj.x_pos = x_pos;
	tempObj.y_pos = y_pos;
	tempObj.x_ratio = obj.scrollWidth/pixelLength_tile;
	tempObj.y_ratio = obj.scrollHeight/pixelLength_tile;
	tempObj.x_range = tempObj.x_ratio<=1? null:[getTile(x_pos,y_pos).getBoundingClientRect()];
	tempObj.y_range = tempObj.y_ratio<=1? null:[getTile(x_pos,y_pos).getBoundingClientRect()];
	for( let i = x_pos+1; i<x_pos+Math.ceil(tempObj.x_ratio); i++) {
		tempObj.x_range.push(getTile(i,y_pos).getBoundingClientRect());
	}
	for( let i = y_pos+1; i<y_pos+Math.ceil(tempObj.y_ratio); i++) {
		tempObj.y_range.push(getTile(x_pos,i).getBoundingClientRect());
	}
	let tempClassList = obj.classList;
	if(tempClassList.contains("token")) {
		tempObj.typePri = "token";
		if(tempClassList.contains("player")) {
			//console.log("playerObj");
			tempObj.typeSec = "player";
		}
	} else if(tempClassList.contains("item")) {
		//console.log("itemObj");
		tempObj.typePri = "item";
		if(tempClassList.contains("key")) {
			tempObj.typeSec = "key";
		} else if (tempClassList.contains("rope")) {
			tempObj.typeSec = "rope";
		}
	}
	obj.addEventListener("mouseenter", function() {currentSelected(obj);});
	mapObjs.set(obj, tempObj);
	console.log(mapObjs.get(obj));
}



playfieldBack.addEventListener("mouseenter", function() {
	window.onscroll = function() {
		console.log("scrolling in field, disable scrolling while in");
		//console.log(window.pageXOffset+", "window.pageYOffset);
	}
	//console.log("mouse over table");
	for(const a of this.children[0].children) {
		hoverRow.set(a,rowRefrence.bind(this,a));
		a.addEventListener("mouseenter", hoverRow.get(a));
	}
	//console.log(hoverRow);
	removeEvent.set(hoverRow, removeEventListenMultiple.bind(this, this, hoverRow, "mouseenter", "pointerleave"));
	this.addEventListener("pointerleave", removeEvent.get(hoverRow));
});

function rowRefrence(a) {
	//console.log("entered @ "+a.rowIndex);
	for(const b of a.children) {
		hoverCell.set(b,cellRefrence.bind(this,b));
		b.addEventListener("mouseenter", hoverCell.get(b));
	}
	removeEvent.set(hoverCell, removeEventListenMultiple.bind(this, a, hoverCell, "mouseenter", "pointerleave"));
	a.addEventListener("pointerleave", removeEvent.get(hoverCell));
}

function cellRefrence(b) {
	//console.log("x: "+(b.cellIndex+1)+", y: "+(b.parentElement.rowIndex+1));
	currentSelected(b);
	hoverTile = cellClick.bind(this,b);
	removeEvent.set(hoverTile, removeEventListenSingle.bind(this, b, hoverTile, "click", "pointerleave"));
	b.addEventListener("click", hoverTile);
	b.addEventListener("pointerleave", removeEvent.get(hoverTile));
}

function cellClick(c) {
	console.log("click @ "+c.cellIndex+", "+c.parentElement.rowIndex);
}

function getTile(xPos,yPos) {
	//console.log("getTile(): finding "+xPos+", "+yPos);
	return playfieldBack.children[0].children[yPos-1].children[xPos-1];
}
function displayTile(xPos=null,yPos=null) {
	let tileObj = null;
	let caller = null;
	if(yPos != null && typeof xPos != typeof yPos) {
		console.log("ERROR: displayTile() given non-matching parameters"); return;
	} else if (xPos==null) {
		xPos = hoverTileCoords[0];
		yPos = hoverTileCoords[1];
	} else if (typeof xPos != 'number') {
		tileObj = xPos;
		caller = yPos;
		yPos = xPos.parentElement.rowIndex+1;
		xPos = xPos.cellIndex+1;
	}
	console.log("DisplayTile: "+xPos+", "+yPos);
	if(xPos!=hoverTileCoords[0]||yPos!=hoverTileCoords[1]) {
		hoverTileCoords = [xPos, yPos];
		mapHoverTileFocus.innerHTML = `${xPos},${yPos}`;
		for(const a of mapHoverTileFocusList.children) {
			a.innerHTML='';
		}
		for(const a of playfield.children) {
			if(a.id!="playfieldBack") {
				let tempObj = mapObjs.get(a);
				if(tempObj.x_pos<=xPos&&tempObj.y_pos<=yPos&&tempObj.x_pos+Math.ceil(tempObj.x_ratio)>xPos&&tempObj.y_pos+Math.ceil(tempObj.y_ratio)>yPos) {
					console.log(a.id+": passed second test for "+xPos+", "+yPos);
					hoverTileFocusListAdd(a);
				}
			}
		}
	} else { console.log("hover already correct"); }
}

function hoverTileFocusListAdd(listItem) {
	if(listItem.id=="map-tile-hovering-contents-tile") {
		console.log("selecting tile from focus list");
	} else {
		let obj = mapObjs.get(listItem);
		listItem = document.createElement('li');
		//listI.className = obj.typePri+" "+obj.typeSec;
		listItem.className = obj.typeSec||obj.typePri;
		if (obj.typePri=="token") {
			mapHoverTileFocusListTokens.appendChild(listItem);
		} else if (obj.typePri=="item") {
			mapHoverTileFocusListItems.appendChild(listItem);
		}
	}
}


function hoverTileFocusDisplay() {
	
}


function currentSelected(thing) {
	if(thing.tagName!='TD') {
		console.log(thing);
		let obj = mapObjs.get(thing);
		if(obj.x_range==null&&obj.y_range==null) {
			displayTile(obj.x_pos,obj.y_pos);
		} else {
			hoverMultiTileObj = determineMultiTile.bind(this,obj);
			removeEvent.set(hoverMultiTileObj, removeEventListenSingle.bind(this, thing, hoverMultiTileObj, "mousemove", "pointerleave"));
			thing.addEventListener("mousemove", hoverMultiTileObj);
			thing.addEventListener("pointerleave", removeEvent.get(hoverMultiTileObj));
		}
	} else if(thing.cellIndex+1!=hoverTileCoords[0]||thing.parentElement.rowIndex+1!=hoverTileCoords[1]) {
		//console.log(`tile: ${thing.cellIndex+1},${thing.parentElement.rowIndex+1}`);
		displayTile(thing);
	}	
}

function determineMultiTile(obj) {
	let prevTileX = hoverTileCoords[0];
	let prevTileY = hoverTileCoords[1];
	if(prevTileX-obj.x_pos!=0&&event.clientX<obj.x_range[prevTileX-obj.x_pos-1].right) { --prevTileX; }
	else if(prevTileX-obj.x_pos!=obj.x_range.length-1&&event.clientX>obj.x_range[prevTileX-obj.x_pos+1].left) { ++prevTileX; }
	if(prevTileY-obj.y_pos!=0&&event.clientY<obj.y_range[prevTileY-obj.y_pos-1].bottom) { --prevTileY; }
	else if(prevTileY-obj.y_pos!=obj.y_range.length-1&&event.clientY>obj.y_range[prevTileY-obj.y_pos+1].top) { ++prevTileY; }
	if(prevTileX!=hoverTileCoords[0]||prevTileY!=hoverTileCoords[1]) { console.log("calling from large token"); displayTile(prevTileX,prevTileY); }
}



/*
function attFunc(thing,x_pos,y_pos,x_range,y_range,prevTileX,prevTileY) {
				let prevMouseX, prevMouseY;
				let mouseDirX = event.clientX-(prevMouseX||0);
				mouseDirX = mouseDirX!=0? mouseDirX/Math.abs(mouseDirX):0;
				prevMouseX = event.clientX;
				let mouseDirY = event.clientY-(prevMouseY||0);
				mouseDirY = mouseDirY!=0? mouseDirY/Math.abs(mouseDirY):0;
				prevMouseY = event.clientY;
				console.log(`mouseDir: ${mouseDirX}, ${mouseDirY}`);
				if(mouseDirX>0 && prevTileX-x_pos!=x_range.length-1 && event.clientX>=x_range[prevTileX+1-x_pos].left) { //right
					console.log(`mouseX:${event.clientX}>=${x_range[prevTileX+1-x_pos].left}`);
					++prevTileX;
				} else if (mouseDirX<0 && prevTileX-x_pos!=0 && event.clientX<=x_range[prevTileX-1-x_pos].right) { //left
					console.log(`mouseX:${event.clientX}<=${x_range[prevTileX-1-x_pos].right}`);
					--prevTileX;
				} if (mouseDirY<0 && prevTileY-y_pos!=0 && event.clientY<=y_range[prevTileY-y_pos-1].bottom) { //up
					console.log(`mouseY:${event.clientY}<=${y_range[prevTileY-y_pos-1].bottom}`);
					--prevTileY;
				} else if(mouseDirY>0 && prevTileY-y_pos!=y_range.length-1 && event.clientY>=y_range[prevTileY-y_pos+1].top) { //down
					console.log(`mouseY:${event.clientY}>=${y_range[prevTileY-y_pos+1].top}`);
					++prevTileY;
				}
				if(prevTileX!=hoverTileCoords[0]||prevTileY!=hoverTileCoords[1]) { console.log("calling from large token"); displayTile(prevTileX,prevTileY); }
}


function attFunc2(obj,pmx,pmy) {
	let prevMouseX, prevMouseY;
	let prevTileX = hoverTileCoords[0];
	let prevTileY = hoverTileCoords[1];
	//console.log("PMX: "+prevMouseX+", PMY: "+prevMouseY+"\nPTX: "+prevTileX+", PTY: "+prevTileY);
	//console.log("0. prevMouse["+(prevMouseX||pmx)+", "+(prevMouseY||pmy)+"]");
	let mouseDirX = event.clientX-(prevMouseX||pmx);
	let mouseDirY = event.clientY-(prevMouseY||pmy);
	
	//console.log("1. prevMouseX="+event.clientX+"-"+(prevMouseX||pmx)+"="+(event.clientX-(prevMouseX||pmx)));
	//console.log("1. prevMouseY="+event.clientY+"-"+(prevMouseY||pmy)+"="+(event.clientY-(prevMouseY||pmy)));
	//console.log("1. mouseDir["+mouseDirX+", "+mouseDirY+"]");
	mouseDirX = mouseDirX!=0? mouseDirX/Math.abs(mouseDirX):0;
	mouseDirY = mouseDirY!=0? mouseDirY/Math.abs(mouseDirY):0;
	//console.log("2. mouseDir["+mouseDirX+", "+mouseDirY+"]");
	prevMouseX = event.clientX;
	prevMouseY = event.clientY;
	//console.log("3. prevMouse["+prevMouseX+", "+prevMouseY+"]");
	console.log(`mouseDir: ${mouseDirX}, ${mouseDirY}`);
	if(mouseDirX>0) {
		//console.log("going right: "+prevTileX+"-"+obj.x_pos+"="+(prevTileX-obj.x_pos)+", < "+(obj.x_range.length-1)+"? "+(prevTileX-obj.x_pos!=obj.x_range.length-1));
		if(prevTileX-obj.x_pos!=obj.x_range.length-1) {
			//console.log(`mouseX:${prevMouseX}>=${obj.x_range[prevTileX+1-obj.x_pos].left}`);
			if(prevMouseX>=obj.x_range[prevTileX+1-obj.x_pos].left) {
				
				++prevTileX;
			}
		}
	} else if(mouseDirX<0) {;
		//console.log("going left: "+prevTileX+"-"+obj.x_pos+"="+(prevTileX-obj.x_pos)+"!= 0? "+(prevTileX-obj.x_pos!=0));
		if(prevTileX-obj.x_pos!=0) {
			//console.log(`mouseX:${prevMouseX}<=${obj.x_range[prevTileX-1-obj.x_pos].right}`);
			if(prevMouseX<=obj.x_range[prevTileX-1-obj.x_pos].right) {
				
				--prevTileX;
			}
		}
	}
	/*
	if(mouseDirX>0 && prevTileX-obj.x_pos<obj.x_range.length && event.clientX>=obj.x_range[prevTileX+1-obj.x_pos].left) { //right
		console.log(`mouseX:${event.clientX}>=${obj.x_range[prevTileX+1-obj.x_pos].left}`);
		++prevTileX;
	} else if (mouseDirX<0 && prevTileX-obj.x_pos!=0 && event.clientX<=obj.x_range[prevTileX-1-obj.x_pos].right) { //left
		console.log(`mouseX:${event.clientX}<=${obj.x_range[prevTileX-1-obj.x_pos].right}`);
		--prevTileX;
	} if (mouseDirY<0 && prevTileY-obj.y_pos!=0 && event.clientY<=obj.y_range[prevTileY-obj.y_pos-1].bottom) { //up
		console.log(`mouseY:${event.clientY}<=${obj.y_range[prevTileY-obj.y_pos-1].bottom}`);
		--prevTileY;
	} else if(mouseDirY>0 && prevTileY-obj.y_pos<obj.y_range.length && event.clientY>=obj.y_range[prevTileY-obj.y_pos+1].top) { //down
		console.log(`mouseY:${event.clientY}>=${obj.y_range[prevTileY-obj.y_pos+1].top}`);
		++prevTileY;
	}
	if(prevTileX!=hoverTileCoords[0]||prevTileY!=hoverTileCoords[1]) { console.log("calling from large token"); displayTile(prevTileX,prevTileY); }
}
	*/

/*
if(a.id!="playfieldBack") {
		objName = a;
		mapObjs[objName] = new Object();
		mapObjs[objName].obj = a;
		let x_pos = Number(a.style.getPropertyValue('--cord-x'));
		let y_pos = Number(a.style.getPropertyValue('--cord-y'));
		mapObjs[objName].x_pos = x_pos;
		mapObjs[objName].y_pos = y_pos;
		mapObjs[objName].x_ratio = a.scrollWidth/pixelLength_tile;
		mapObjs[objName].y_ratio = a.scrollHeight/pixelLength_tile;
		if (mapObjs[objName].x_ratio<=1) { mapObjs[objName].x_range = null; }
		else {
			mapObjs[objName].x_range = [getTile(x_pos,y_pos).getBoundingClientRect()];
			for( let i = x_pos+1; i<x_pos+Math.ceil(mapObjs[objName].x_ratio); i++) {
				mapObjs[objName].x_range.push(getTile(i,y_pos).getBoundingClientRect());
			}
		}
		if (mapObjs[objName].y_ratio<=1) { mapObjs[objName].y_range = null; }
		else {
			mapObjs[objName].y_range = [getTile(x_pos,y_pos).getBoundingClientRect()];
			for( let i = y_pos+1; i<y_pos+Math.ceil(mapObjs[objName].y_ratio); i++) {
				mapObjs[objName].y_range.push(getTile(i,y_pos).getBoundingClientRect());
			}
		}
		console.log(mapObjs[objName]);
		a.addEventListener("mouseenter", function() {currentSelected(a);});
	}
*/



document.getElementById("cellSize").addEventListener("input", function(){
	//if(this.value<this.min) {this.value=this.min;}
	playfieldView.style.setProperty("--tileDim", `${this.value}px`);
	//document.getElementById("magnifyDispl").value = (this.value/this.min*100).toFixed(0);
	document.getElementById("magnifyDispl").value = this.value;
	//console.log("tileDim update");
	});
	/*if(this.value<this.min&&(playfield.offsetWidth==playfield.parentElement.offsetWidth||playfield.offsetHeight==playfield.parentElement.offsetHeight)) {this.value=this.min;}
	else {playfieldView.style.setProperty("--tileDim", `${this.value}px`); if(this.value<this.min) {this.min = this.value;}}
	console.log("tileDim update");*/
//document.getElementById("borderWidth").addEventListener("change", function(){playfieldView.style.setProperty("--tableBor", `${this.value}px`); setMinCelSize();});
//document.getElementById("borderWidth").addEventListener("change", function(){playfieldView.style.setProperty("--tableBor", `${this.value}px`); setMinCelSize();});


//playfieldView.style.setProperty("--tableBor", `${document.getElementById("borderWidth").value}px`);

/*
tableCreate();

addToken(1,1,"player","pl1");
moveToken(0,0,1,1);
*/

function correcTabSize() {
	/*
	if(xLabel.scrollWidth<xLabel.parentElement.offsetWidth) {
		playfield.style.width = xLabel.offsetWidth+"px";
	} else {
		playfield.style.width = xLabel.scrollWidth+"px";
	}
	if(yLabel.scrollHeight<yLabel.parentElement.offsetHeight) {
		playfield.style.height = yLabel.offsetHeight+"px";
	} else {
		playfield.style.height = yLabel.scrollHeight+"px";
	}
	*/
	/*
	
	let cellCount = xLabel.children.length;
	playfield.parentElement.style.overflow = "visible";
	playfield.clientWidth = playfieldView.getPropertyValue("--tileDim")*cellCount + (cellCount-1)*playfieldView.getPropertyValue("--tableBor");
	*/
	console.log("qwert");
}


function newCreateTable() {
	/*
	let tempStr = "";
	for(let i=0; i<Number(playfieldView.style.getPropertyValue("--tableRows")); i++) {
		tempStr += "<tr>"
		for(let j=0; j<Number(playfieldView.style.getPropertyValue("--tableCols")); j++) {
			tempStr += "<td></td>"
		}
		tempStr += "</tr>"
	}
	console.log(tempStr);
	document.getElementById("playfieldBack").innerHTML = tempStr;
	*/
	for(let i=0; i<yLabel.children.length; i++) {
		document.getElementById("playfieldBack").insertRow(0);
	} for(const a of document.getElementById("playfieldBack").children[0].children ) {
		for(let i=0; i<xLabel.children.length; i++) {
			a.insertCell(0);
		}
	}
}




function toggleMap(setX=800,setY=600) {
	console.log("awage");
	if(playfieldView.offsetWidth+playfieldView.offsetHeight<=0) {
		playfieldView.width = String(setX);
		playfieldView.height = String(setY);
	} else {
		playfieldView.width = "0";
		playfieldView.height = "0";
	}
}


function addToken(xCoor, yCoor, tType="uniden", furthId=null) {
	//var newTok = 
	//playfield.rows[yCoor].cells[xCoor].appendChild();
	console.log("awa");
	playfield.rows[yCoor].cells[xCoor].innerHTML = `<span class="token ${tType} ${furthId}" id="tk${++validID}"><h1>Nwln</h1></span>`;
}

function moveToken(newX, newY, xOid, yCoor=null ) {
	var token = yCoor==null? document.getElementById(xOid): playfield.rows[yCoor].cells[xOid].firstChild;
	token.parentElement.removeChild(token);
	playfield.rows[newY].cells[newX].appendChild(token);
}



function setMinCelSize(setMax=true) {
	//let failS = 200;
	let ogDim = playfieldView.style.getPropertyValue("--tileDim").slice(0,-2);
	let newDim = ogDim;
	//let newDim = Number(document.getElementById("cellSize").min);
	//console.log(++ind);
	while(playfield.offsetWidth>playfield.parentElement.offsetWidth||playfield.offsetHeight>playfield.parentElement.offsetHeight) {
		playfieldView.style.setProperty("--tileDim",`${--newDim}px`);
	}
	while(playfield.offsetWidth<playfield.parentElement.offsetWidth||playfield.offsetHeight<playfield.parentElement.offsetHeight) {
		playfieldView.style.setProperty("--tileDim",`${++newDim}px`);
	}
	document.getElementById("cellSize").min = newDim;
	newDim = newDim>ogDim? newDim: ogDim;
	document.getElementById("cellSize").value = newDim;
	playfieldView.style.setProperty("--tileDim",`${newDim}px`);
	if(setMax) {setMaxCellSize();}
	/*
	while(playfield.offsetWidth<playfield.parentElement.offsetWidth&&failS-->0) {
		console.log(playfield.offsetWidth+", "+playfield.parentElement.offsetWidth);
		playfieldView.style.setProperty("--tileDim",document.getElementById("cellSize").min);
		document.getElementById("cellSize").min = `${Number(document.getElementById("cellSize").min)+1}`;
	} */
}

function setMaxCellSize() {
	let ogDim = playfieldView.style.getPropertyValue("--tileDim").slice(0,-2);
	let newDim = ogDim;
	while(playfield.rows[0].cells[0].offsetWidth>playfield.parentElement.offsetWidth||playfield.rows[0].cells[0].offsetHeight>playfield.parentElement.offsetHeight) {
		playfieldView.style.setProperty("--tileDim",`${--newDim}px`);
	}
	while(playfield.rows[0].cells[0].offsetWidth<playfield.parentElement.offsetWidth||playfield.rows[0].cells[0].offsetHeight<playfield.parentElement.offsetHeight) {
		playfieldView.style.setProperty("--tileDim",`${++newDim}px`);
	}
	document.getElementById("cellSize").max = newDim;
	newDim = newDim<ogDim? newDim: ogDim;
	document.getElementById("cellSize").value = newDim;
	playfieldView.style.setProperty("--tileDim",`${newDim}px`);
}


//--tileDim

//r.style.setProperty('--primary-bg-color', 'green');

//document.getElementById("playfieldView").style.setProperty("--tileDim", number);

function labelScroll(isX) {
	if(isX) {
		playfield.parentElement.scrollLeft = xLabel.scrollLeft;
	} else {
		playfield.parentElement.scrollTop = yLabel.scrollTop;
	}
}

function setPlayView(varName, newVal) {
	playfieldView.style.setProperty(varName, newVal);
}
function setPlayViewInp(varName, idName) {
	let tempInp = document.getElementById(idName);
	playfieldView.style.setProperty(varName, `${tempInp.value}px`);
}


function tableExt(up, right, down, left) {
	if(up!=0) {
		while(up-->0) { playfield.insertRow(0); }
		while(up++<0) { playfield.removeRow(0); }
	}
	
/*
	let rowLen = document.getElementById("playfield").rows.length;
	switch(inp) {
		case "u":
			document.getElementById("playfield").innerHTML = "<tr>"+("<td></td>"*rowLen)+"</tr>"+document.getElementById("playfield").innerHTML;
			break;
		case "d":
			document.getElementById("playfield").innerHTML += "<tr>"+("<td></td>"*rowLen)+"</tr>";
			break;
		default:
			for(let i=0; i<document.getElementById("playfield").columns.length; i++) {
				
			}
			break;
	} //close switch
	*/
}

function tableLabelCorr() {
	
}

function tableCreate(still=false) {
	playfield.innerHTML = "";
	if(still) {
		playfield.insertRow(0);
		var firstRow = playfield.rows[0]
		while(playfield.offsetWidth<xLabel.parentElement.offsetWidth&&firstRow.children.length<xLabel.children.length) {
			firstRow.insertCell(0);
		}
		firstRow.cells[firstRow.children.length-1].style.width = "0";
		//while(firstRow.cells[0].offsetWidth)
		firstRow.cells[firstRow.children.length-1].style.width = (xLabel.parentElement.offsetWidth-playfield.offsetWidth)+"px";
		//console.log("width: "+playfield.offsetWidth+" vs "+document.getElementById("xLabel").parentElement.offsetWidth+" dif: "+(document.getElementById("xLabel").parentElement.offsetWidth-playfield.offsetWidth));
		//console.log(firstRow.cells[0].style.borderRightWidth);
		//console.log(playfield.children[0].innerHTML);
		//playfield.children[0].innerHTML;
		/*
		for(let i=1; i<5; i++) {
			playfield.insertRow(i);
			playfield.rows[i].innerHTML = playfield.rows[0].innerHTML;
		} */
		while(playfield.offsetHeight<yLabel.parentElement.offsetHeight&&playfield.children.length<yLabel.children.length) {
			playfield.insertRow(0);
			playfield.rows[0].innerHTML = playfield.rows[playfield.rows.length-1].innerHTML;
		}
		var lastRow = playfield.rows[playfield.rows.length-1];
		lastRow.style.height = "0";
		lastRow.style.height = (yLabel.parentElement.offsetHeight-playfield.offsetHeight)+"px";
	} else {
		while(playfield.rows.length<yLabel.children.length) {
			playfield.insertRow(0);
		}
		for(const a of playfield.rows) {
			while(a.cells.length<xLabel.children.length) {
				a.insertCell(0);
			}
		}
		//console.log(xLabel);
		//xLabel.style.overflowX = "visible";
		//playfield.setAttribute("width", `${xLabel.clienttWidth}px`);
		//playfield.style.width = `${xLabel.clienttWidth}px`;
		//xLabel.style.overflowX = "auto";
		//xLabel.setAttribute("overflow-x", "auto");
		//playfield.style.width = (playfield.style.offsetHeight/yLabel.children.length*xLabel.children.length)+"px";
		//playfield.style.width = 0; //I don't know anymore girl I set it to 20 just to figure out which format to use since none were working and that made it suddenly work somehow, the number doesn't even matter
		setMinCelSize();
	}
}

function dummyData() {
	let i=0;
	for(const a of playfield.rows[0].children) {
		a.id = `${++i}`;
	}
}

function tableMove(isX=true, pxMove=0) {
	//pxMove += "px";
	//console.log(pxMove);
	//tileDim = playfield.parentElement.getAttributeNode("--tileDim");
	tileDim = xLabel.children[0].offsetWidth;
	//tableBor = playfield.rows[0].cells[0].style.borderRightWidth;
	//console.log(playfield.rows[0].cells[0]);
	//console.log("tileDim: "+tileDim);
	if(isX) {
		let a = playfield.rows[0];
		//for(const a of playfield.rows) {
			console.log(a.cells[0].clientWidth-pxMove);
			if((a.cells[0].clientWidth-pxMove)<=0) {
				console.log(a.cells[0].clientWidth+"-"+pxMove+"<=0");
				a.cells[1].style.width = `${a.cells[1].offsetWidth+(a.cells[0].offsetWidth-pxMove)}px`;
				a.deleteCell(0);
				console.log("deleted 0");
			} else {
				a.cells[0].style.width = `${a.cells[0].offsetWidth-pxMove}px`;
				console.log("increasing 0");
				/*
				if (tileDim<a.cells[0].clientWidth) {
					console.log(a.cells[0].clientWidth+" : "+tileDim+" = "+(a.cells[0].offsetWidth-tileDim));
					a.cells[0].style.width = `${a.cells[0].offsetWidth-tileDim}px`;
					a.insertCell(0);
					a.cells[0].style.width = a.cells[1].style.width;
					//a.cells[1].style.width = tileDim;
					a.cells[1].removeAttribute("style");
				} */
			}
			let lastInd = a.cells.length-1;
			if((a.cells[lastInd].clientWidth-pxMove)<=0) {
				console.log(a.cells[lastInd].clientWidth+"-"+pxMove+"<=0");
				a.cells[lastInd-1].style.width = `${a.cells[lastInd-1].offsetWidth+(a.cells[lastInd].offsetWidth-pxMove)}px`;
				a.deleteCell(lastInd);
				console.log("deleted last");
			} else {
				a.cells[lastInd].style.width = `${a.cells[lastInd].offsetWidth-pxMove}px`;
				console.log("increasing last");
				if (tileDim<a.cells[lastInd].clientWidth) {
					console.log(a.cells[lastInd].clientWidth+" : "+tileDim+" = "+(a.cells[lastInd].offsetWidth-tileDim));
					a.cells[lastInd].style.width = `${a.cells[lastInd].offsetWidth-tileDim}px`;
					a.insertCell(lastInd);
					a.cells[lastInd].style.width = a.cells[lastInd-1].style.width;
					//a.cells[1].style.width = tileDim;
					a.cells[lastInd-1].removeAttribute("style");
				}
			}
			
			
			/*
			else if (tileDim<(a.cells[0].clientWidth-pxMove)) {
				console.log(a.cells[0].clientWidth+"-"+pxMove+">"+tileDim);
				a.insertCell(0);
				console.log(a.cells[1].offsetWidth-pxMove);
				console.log(a.cells[1].offsetWidth-pxMove-tileDim);
				a.cells[0].style.width = `${a.cells[1].offsetWidth-pxMove-tileDim}px`;
				a.cells[1].offsetWidth = tileDim+"px";
				console.log("adding at "+0);
			} else {
				
			}
			console.log(a.cells[lastInd].clientWidth+pxMove);
			if(0<(a.cells[lastInd].clientWidth+pxMove)&&(a.cells[lastInd].clientWidth+pxMove)<tileDim) {
				a.cells[lastInd].style.width = `${a.cells[lastInd].offsetWidth+pxMove}px`;
				console.log("	accepted");
			} else {
				console.log("	unaccepted");
			}
			///*
			//if(a.cells[pxMove<0?0:a.cells.length-1]<=(pxMove<0))
				/*
			let relInd = pxMove<0?0:lastInd;
			let sister = relInd==0?1:relInd-1;
			if(a.cells[relInd].clientWidth<=0) {
				console.log("deleteing "+relInd);
				a.cells[sister].style.width = `${a.cells[sister].offsetWidth+a.cells[relInd].offsetWidth}px`;
				a.deleteCell(relInd);
				console.log("deleted");
			}
			relInd = -1*(a.cells.length-lastInd-1);
			sister = relInd==0?1:relInd-1;
			if(a.cells[relInd].clientWidth>=tileDim) {
				console.log("adding "+relInd);
				a.insertCell(relInd);
			}
			/*
			if(pxMove>0&&a.cells[lastInd].clientWidth>=tileDim) {
				a.insertCell(lastInd);
				a.cells[lastInd].style.width = a.cells[lastInd-1].offsetWidth-tileDim;
				a.cells[lastInd-1].style.width = tileDim+"px";
				console.log("uwu");
			} else if(pxMove<0&&(a.cells[0].clientWidth>=tileDim||a.cells[lastInd].clientWidth<=0)) {
				a.deleteCell(lastInd);
				a.insertCell(0);
				a.cells[0].style.width = a.cells[1].offsetWidth-tileDim;
				a.cells[1].style.width = tileDim+"px";
				//a.cells[1].removeAttribute("style")
				console.log("owo");
			}
			*/
		//}
	} else {
		
	}

	
	//document.getElementById("playfieldView").getAttribute("tileDim")
	
}
//playfield
function setTableSize(hora,vert) {
	playfield.insertCell
}