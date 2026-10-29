var cards = document.getElementsByClassName("charaCard");
const players = [];
const enemies = [];
const objects = [];
const NPCS = [];


document.getElementById("Slide-tokenRoundness").addEventListener("input", function() {
	document.getElementById("Num-tokenRoundness").value = Number(this.value)*2;
	document.getElementById("settings").style.setProperty("--tokenRoundness",this.value+"%");
});
document.getElementById("Num-tokenRoundness").addEventListener("input", function() {
	if(Number(this.value)<0) {this.value=0;}
	else if(Number(this.value)>100) {this.value=100;}
	document.getElementById("Slide-tokenRoundness").value = Number(this.value)/2;
	document.getElementById("settings").style.setProperty("--tokenRoundness", Number(this.value)/2+"%");
});

const colourTempName = document.getElementById("color_tempName");

colourTempName.addEventListener("mousedown", function() {
	console.log("QWERTYUIO"); 
});

document.getElementById("Slide-tokenSat").addEventListener("input", function() {
	this.parentElement.parentElement.style.setProperty("--colorPad-x", this.value);
});
document.getElementById("Slide-tokenDar").addEventListener("input", function() {
	this.parentElement.parentElement.style.setProperty("--colorPad-y", this.value);
});
document.getElementById("Slide-tokenOpa").addEventListener("input", function() {
	this.parentElement.parentElement.style.setProperty("--colorPad-opa", this.value);
});
document.getElementById("Slide-tokenHue").addEventListener("input", function() {
	let hueVal = Number(this.value)%255;
	/*there's probably a less long way to do this but I don't wanna rn*/
	switch(Math.floor(Number(this.value)/255)) {
		case 0:
			this.parentElement.parentElement.style.setProperty("--colorPad-hue-r", 255);
			this.parentElement.parentElement.style.setProperty("--colorPad-hue-g", hueVal);
			this.parentElement.parentElement.style.setProperty("--colorPad-hue-b", 0);
			break;
		case 1:
			this.parentElement.parentElement.style.setProperty("--colorPad-hue-r", 255-hueVal);
			this.parentElement.parentElement.style.setProperty("--colorPad-hue-g", 255);
			this.parentElement.parentElement.style.setProperty("--colorPad-hue-b", 0);
			break;
		case 2:
			this.parentElement.parentElement.style.setProperty("--colorPad-hue-r", 0);
			this.parentElement.parentElement.style.setProperty("--colorPad-hue-g", 255);
			this.parentElement.parentElement.style.setProperty("--colorPad-hue-b", hueVal);
			break;
		case 3:
			this.parentElement.parentElement.style.setProperty("--colorPad-hue-r", 0);
			this.parentElement.parentElement.style.setProperty("--colorPad-hue-g", 255-hueVal);
			this.parentElement.parentElement.style.setProperty("--colorPad-hue-b", 255);
			break;
		case 4:
			this.parentElement.parentElement.style.setProperty("--colorPad-hue-r", hueVal);
			this.parentElement.parentElement.style.setProperty("--colorPad-hue-g", 0);
			this.parentElement.parentElement.style.setProperty("--colorPad-hue-b", 255);
			break;
		case 5:
			this.parentElement.parentElement.style.setProperty("--colorPad-hue-r", 255);
			this.parentElement.parentElement.style.setProperty("--colorPad-hue-g", 0);
			this.parentElement.parentElement.style.setProperty("--colorPad-hue-b", 255-hueVal);
			break;
	}
});

function applyHealthChange() {
	
}

///Slide-tokenRoundness


let findBeing = function(isPlayer, beingNumber) {
	return isPlayer? players[beingNumber] : enemies[beingNumber];
}

function findItemOfCard(card) {
	for(const a of card) {
		
	}
}

function Being(isPlayer, Ename, maxHealth, cha, con, dex, inte, str, wis, currHealth=false, beingToken=false, beingCard=false, beingHex=false) {
	this.token = beingToken || createToken();
	this.card = beingCard || createCard();
	this.hex =  beingHex || createHex();
	this.Ename = Ename;
	this.healthCurr = currHealth || maxHealth;
	this.healthMax = maxHealth;
	this.cha = cha;
	this.con = con;
	this.dex = dex;
	this.inte = inte;
	this.str = str;
	this.wis = wis;
	this.conditions = {};
	this.tokenRound = 50;
	this.tokenColor = "grey";
	this.defaultBGColor = "black";
	this.defaultFrontColor = "white";
	this.tokenBorderColor = null;
	this.tokenBorderWidth = 0;
	if(isPlayer) {
		players.push(this);
	} else {
		enemies.push(this);
	}
	this.card.style.setProperty('--maxHealth',this.healthMax);
	this.card.style.setProperty('--currentHealth',this.healthCurr);
	console.log("awa");
	
	
	
	
	/*--healthVertical: 1;
	--currentHealth: 50;
	--maxHealth: 80;
	--changeHealth: 30;
	--outlineColor: white;
	--textColor: pink;
	--textSecondColor: plum;
	--healthColor: rgba(192, 16, 0, 1);
	--healthChangeColor: rgba(224, 224, 0, 0.75);
	--healthEmptyColor: navy;
	--tokenOutlineColor: lime;
	--tokenOutlineThickness: 2%; */
	function changeStat(whichStat, newValue) {
		switch(whichStat) {
			case "cha":
				this.cha = newValue;
			case "con":
				this.con = newValue;
			case "dex":
				this.dex = newValue;
			case "int":
				this.inte = newValue;
			case "str":
				this.str = newValue;
			case "wis":
				this.wis = newValue;
		}
	}
	function setTokenStyle(tokenRoundness=false, tokenColour=false, tokenDecal=false) {
		this.tokenRound = tokenRoundness || this.tokenRound;
		this.tokenColor = tokenColour || this.tokenColor;
		this.tokenImage = tokenDecal || this.tokenImage;
	}
	function applyCurrHealthChange(transi=true) {
		this.healthCurr += this.card.style.getPropertyValue("--changeHealth");
		if(transi) {
			let chHeal = Number(this.card.style.getPropertyValue("--changeHealth"));
			let healthTrans = function() {
				if(Math.abs(chHeal)>0.2) { chHeal /= 2; }
				this.healthCurr += chHeal;
				this.card.style.setProperty("--changeHealth",chHeal);
				this.card.style.setProperty("--currentHealth",this.healthCurr);
			}
			healthTrans;
			while(chHeal!=0) {
				setTimeout(healthTrans, 300);
			}
		} else {
			this.card.style.setProperty("--currentHealth",this.healthCurr);
			this.card.style.setProperty("--changeHealth",0);
			this.healthCurr = Number(this.card.style.getPropertyValue("--currentHealth"));
		}
	};
	/*
	function changeHealth(manual=false) {
		if(manual) {
			
		} else {
			this.healthCurr += this.card.style.getPropertyValue("--changeHealth");
			this.card.style.setProperty("--currentHealth",this.healthCurr);
			this.card.style.setProperty("--changeHealth",0);
		}
	}
	*/
}

let qwerty = new Being(true, "Newlyn", 80, 20, 20, 20, 20, 20, 20, 60, false, document.getElementsByClassName("battleCard")[0], false);



function createCard() {
	
}
function createToken() {
	
}
function createHex() {
	
}




function updateBeingStyles(isPlayer, beingNumber, defaultBGColor=null, defaultFrontColor=null, tokenRoundness=null, tokenColour=null) {
	let refBe = isPlayer? players[beingNumber] : enemies[beingNumber];
	if(defaultBGColor!=null) {refBe.defaultBGColor = defaultBGColor;}
}





function changeHealth(isPlayer, beingNumber, curHealth, maxHealth=0, isChange=true, isPercent=false) {
	if(!isNaN(beingNumber)) {
		let refBe = isPlayer? players[beingNumber] : enemies[beingNumber];
		if(isPercent) {
			refBe.healthMax *= isChange? 1+maxHealth: maxHealth;
			refBe.healthCurr *= isChange? 1+curHealth: curHealth;
		} else {
			refBe.healthMax = isChange? refBe.healthMax+maxHealth: maxHealth;
			refBe.healthCurr = isChange? refBe.healthCurr+curHealth: curHealth;
		}
		if(curHealth>0&&refBe.healthCurr>refBe.healthMax) {
			refBe.healthCurr = refBe.healthMax;
		}
		refBe.style.setProperty("--maxHealth", refBe.healthCurr);
		refBe.style.setProperty("--currentHealth", refBe.healthCurr);
	}
}



function makeCard() {
	
}



/*
var cusClassStyle = document.getElementById("playerCustom").sheet;

let getSheet = function() {
	for(const a of document.styleSheets) {
		console.log(a.title);
		if(a.title=='cusClassStyle.css') { return a; }
	}
}

const cusClassSheet = getSheet;

function getRule(queryText=null) {
	console.log("getting rules");
	for(const a of cusClassStyle.cssRules) {
		console.log(a.selectorText);
		console.log(a);
	}
}

getRule();

*/

/*document.getElementById("testClass").style.setProperty("--currentHealth",`20`);
console.log("QWERYUIOP"); */

/*
function healthAlter(currHealth, maxHealth, percent=false, change=true) {
	
	.style.setProperty("--tileDim",`${--newDim}px`)
	if(change) {
		.style.setProperty("--tileDim",`${--newDim}px`)
		//+=
	} else {
		//=
	}
	//.style.getPropertyValue("--tileDim")
}
*/