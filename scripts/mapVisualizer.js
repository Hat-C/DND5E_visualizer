const playfieldWindow = document.getElementById("playfieldView");
const playfield = document.getElementById("playfield");
const playfieldBack = document.getElementById("playfieldBack");

const xLabel = document.getElementById("xLabel");
const yLabel = document.getElementById("yLabel");

const mapHoverTileFocus = document.getElementById("map-tile-hovering-tile");
const mapHoverTileFocusObject = document.getElementById("map-tile-hovering-object");
const mapHoverTileFocusList = document.getElementById("map-tile-hovering-contents");
const mapHoverTileFocusListItems = document.getElementById("map-tile-hovering-contents-items");
const mapHoverTileFocusListTokens = document.getElementById("map-tile-hovering-contents-tokens");

playfieldWindow.style.setProperty("--tileDim", `${document.getElementById("cellSize").value}px`);
newCreateTable();

var pixelLength_tile = Number(playfieldWindow.style.getPropertyValue('--tileDim').slice(0,-2));
var pixelLength_tileGap = Number(playfieldWindow.style.getPropertyValue('--tableBor').slice(0,-2));
var hoverTileCoords = [0,0];



/* scrolling */

playfield.parentElement.addEventListener("scroll", function(){ xLabel.scrollLeft = playfield.parentElement.scrollLeft; yLabel.scrollTop = playfield.parentElement.scrollTop; } ); //scroll map view with labels

function labelScroll(isX) { //manual scrolling method
	if(isX) {
		playfield.parentElement.scrollLeft = xLabel.scrollLeft;
	} else {
		playfield.parentElement.scrollTop = yLabel.scrollTop;
	}
}

playfield.addEventListener("scroll", function() {
	console.log("cycle through map layers");
});

//map objects list
var mapObjs = new Map();

// function binders
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


/* functions: removing binded event listeners */
function removeEventListenSingle(calledBy, listenerFunction, typeEvent="mouseenter", callEvent="pointerleave") {
	calledBy.removeEventListener(callEvent, removeEvent.get(listenerFunction));
	removeEvent.delete(listenerFunction);
	calledBy.removeEventListener(typeEvent, listenerFunction);
	listenerFunction = undefined;
}
function removeEventListenMultiple(calledBy, listenersList, typeEvent="mouseenter", callEvent="pointerleave") {
	calledBy.removeEventListener(callEvent, removeEvent.get(listenersList));
	removeEvent.delete(listenersList);
	for(const [obj,binded] of listenersList) {
		obj.removeEventListener(typeEvent, binded);
		listenersList.delete(obj);
	}
}

/* creating map objects */
for(const a of playfield.children) {
	if(a.id!="playfieldBack") { mapObjectCreate(a); }
}

function mapObjectCreate(obj) {
	let returnObject = new Object();
	let x_pos = Number(obj.style.getPropertyValue('--cord-x'));
	let y_pos = Number(obj.style.getPropertyValue('--cord-y'));
	let typePri = 'unknown';
	let typeSec = 'unknown';
	returnObject.x_pos = x_pos;
	returnObject.y_pos = y_pos;
	returnObject.x_ratio = obj.scrollWidth/pixelLength_tile;
	returnObject.y_ratio = obj.scrollHeight/pixelLength_tile;
	returnObject.x_range = returnObject.x_ratio<=1? null:[getTile(x_pos,y_pos).getBoundingClientRect()];
	returnObject.y_range = returnObject.y_ratio<=1? null:[getTile(x_pos,y_pos).getBoundingClientRect()];
	for( let i = x_pos+1; i<x_pos+Math.ceil(returnObject.x_ratio); i++) {
		returnObject.x_range.push(getTile(i,y_pos).getBoundingClientRect());
	}
	for( let i = y_pos+1; i<y_pos+Math.ceil(returnObject.y_ratio); i++) {
		returnObject.y_range.push(getTile(x_pos,i).getBoundingClientRect());
	}
	let objectClassList = obj.classList;
	returnObject.typePri = objectClassList[0];
	returnObject.typeSec = objectClassList[1];
	obj.addEventListener("mouseenter", function() {currentSelected(obj);});
	mapObjs.set(obj, returnObject);
	console.log(mapObjs.get(obj));
}

/* event handle: which tile is mouse over?*/

playfieldBack.addEventListener("mouseenter", function() {
	for(const a of this.children[0].children) {
		hoverRow.set(a,rowRefrence.bind(this,a));
		a.addEventListener("mouseenter", hoverRow.get(a));
	}
	removeEvent.set(hoverRow, removeEventListenMultiple.bind(this, this, hoverRow, "mouseenter", "pointerleave"));
	this.addEventListener("pointerleave", removeEvent.get(hoverRow));
});

function rowRefrence(a) {
	//console.log("rowRefrence: entered @ "+a.rowIndex);
	for(const b of a.children) {
		hoverCell.set(b,cellRefrence.bind(this,b));
		b.addEventListener("mouseenter", hoverCell.get(b));
	}
	removeEvent.set(hoverCell, removeEventListenMultiple.bind(this, a, hoverCell, "mouseenter", "pointerleave"));
	a.addEventListener("pointerleave", removeEvent.get(hoverCell));
}

function cellRefrence(b) {
	//console.log("cellRefrence: x="+(b.cellIndex+1)+", y="+(b.parentElement.rowIndex+1));
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
	return playfieldBack.children[0].children[yPos-1].children[xPos-1];
}

/* update tile information on right of map */

function displayTile(xPos=null,yPos=null) {
	let tileObj = null;
	let caller = null;
	if(yPos != null && typeof xPos != typeof yPos) {
		console.log("displayTile: INPUT ERROR: given non-matching parameters"); return;
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
				let heldObject = mapObjs.get(a);
				if(heldObject.x_pos<=xPos&&heldObject.y_pos<=yPos&&heldObject.x_pos+Math.ceil(heldObject.x_ratio)>xPos&&heldObject.y_pos+Math.ceil(heldObject.y_ratio)>yPos) {
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
		listItem.className = obj.typeSec||obj.typePri;
		switch(obj.typePri) {
			case "token":
				mapHoverTileFocusListTokens.appendChild(listItem);
				break;
			case "item":
				mapHoverTileFocusListItems.appendChild(listItem);
				break;
			default:
				console.log("hoverTileFocusListAdd: object type unrecognized");
				break;
		}
	}
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
		displayTile(thing);
	}	
}

function determineMultiTile(obj) {
	let prevTileX = hoverTileCoords[0];
	let prevTileY = hoverTileCoords[1];
	try {
		if(prevTileX-obj.x_pos!=0&&event.clientX<obj.x_range[prevTileX-obj.x_pos-1].right) { --prevTileX; }
		else if(prevTileX-obj.x_pos!=obj.x_range.length-1&&event.clientX>obj.x_range[prevTileX-obj.x_pos+1].left) { ++prevTileX; }
		if(prevTileY-obj.y_pos!=0&&event.clientY<obj.y_range[prevTileY-obj.y_pos-1].bottom) { --prevTileY; }
		else if(prevTileY-obj.y_pos!=obj.y_range.length-1&&event.clientY>obj.y_range[prevTileY-obj.y_pos+1].top) { ++prevTileY; }
		if(prevTileX!=hoverTileCoords[0]||prevTileY!=hoverTileCoords[1]) { console.log("calling from large token"); displayTile(prevTileX,prevTileY); }
	} catch (error) { //runs if prevTiles aren't adjacent to object
		for(const a of obj.x_range) {
			if(a.left<event.clientX&&event.clientX<a.right) { prevTileX = obj.x_pos+obj.x_range.indexOf(a); }
		}
		for(const a of obj.y_range) {
			if(a.top<event.clientY&&event.clientY<a.bottom) { prevTileY = obj.y_pos+obj.y_range.indexOf(a); }
		}
		displayTile(prevTileX,prevTileY);
	}
}

/*table cell size*/
document.getElementById("cellSize").addEventListener("input", function(){
	playfieldWindow.style.setProperty("--tileDim", `${this.value}px`);
	document.getElementById("magnifyDispl").value = this.value;
});
document.getElementById("magnifyDispl").addEventListener("input", function() {
	playfieldWindow.style.setProperty("--tileDim", `${this.value}px`);
	document.getElementById("cellSize").value = this.value;
});

function setMinCellSize(setMax=true) {
	let originalDimension = playfieldWindow.style.getPropertyValue("--tileDim").slice(0,-2);
	let newDimension = originalDimension;
	while(playfield.offsetWidth>playfield.parentElement.offsetWidth||playfield.offsetHeight>playfield.parentElement.offsetHeight) { //while whole field bigger that map view window
		playfieldWindow.style.setProperty("--tileDim",`${--newDimension}px`);
	}
	while(playfield.offsetWidth<playfield.parentElement.offsetWidth||playfield.offsetHeight<playfield.parentElement.offsetHeight) { //correct overshot
		playfieldWindow.style.setProperty("--tileDim",`${++newDimension}px`);
	}
	document.getElementById("cellSize").min = newDimension;
	newDimension = newDimension>originalDimension? newDimension: originalDimension; //correct size if calculate min larger than previous
	document.getElementById("cellSize").value = newDimension;
	playfieldWindow.style.setProperty("--tileDim",`${newDimension}px`);
	if(setMax) {setMaxCellSize();}
}

function setMaxCellSize() {
	let originalDimension = playfieldWindow.style.getPropertyValue("--tileDim").slice(0,-2);
	let newDimension = originalDimension;
	while(playfield.rows[0].cells[0].offsetWidth>playfield.parentElement.offsetWidth||playfield.rows[0].cells[0].offsetHeight>playfield.parentElement.offsetHeight) {
		playfieldWindow.style.setProperty("--tileDim",`${--newDimension}px`);
	}
	while(playfield.rows[0].cells[0].offsetWidth<playfield.parentElement.offsetWidth||playfield.rows[0].cells[0].offsetHeight<playfield.parentElement.offsetHeight) {
		playfieldWindow.style.setProperty("--tileDim",`${++newDimension}px`);
	}
	document.getElementById("cellSize").max = newDimension;
	newDimension = newDimension<originalDimension? newDimension: originalDimension;
	document.getElementById("cellSize").value = newDimension;
	playfieldWindow.style.setProperty("--tileDim",`${newDimension}px`);
}

/*intialize table*/

function newCreateTable() {
	for(let i=0; i<yLabel.children.length; i++) {
		document.getElementById("playfieldBack").insertRow(0);
	} for(const a of document.getElementById("playfieldBack").children[0].children) {
		for(let i=0; i<xLabel.children.length; i++) {
			a.insertCell(0);
		}
	}
}
