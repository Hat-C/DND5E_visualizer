/* this js is for managing players and entitty data */

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

/* indexing functions */
let findBeing = function(isPlayer, beingNumber) {
	return isPlayer? players[beingNumber] : enemies[beingNumber];
}


/*entity object creation*/
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
	this.card.style.setProperty('--changeHealth',0);
	
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
	this.setTokenStyle = function(tokenRoundness=false, tokenColour=false, tokenDecal=false) {
		this.tokenRound = tokenRoundness || this.tokenRound;
		this.tokenColor = tokenColour || this.tokenColor;
		this.tokenImage = tokenDecal || this.tokenImage;
	}
	this.setCurrHealthChange = function(changeInteger) {
		console.log("setCurrHealthChange: CALLED: changeInteger={"+changeInteger+"}");
		if(typeof(changeInteger)!="number") {console.log("ERROR"); return; }
		this.card.style.setProperty('--changeHealth', changeInteger);
		return;
	}
	this.applyCurrHealthChange = function(transition) {
		console.log("applyCurrHealthChange: CALLED");
		console.log(this.card.style.getPropertyValue("--changeHealth"));
		this.healthCurr += this.card.style.getPropertyValue("--changeHealth");
		if(transition) {
			let changeHealth = Number(this.card.style.getPropertyValue("--changeHealth"));
			let healthTrans = function() {
				if(Math.abs(changeHealth)>0.2) { changeHealth /= 2; }
				this.healthCurr += changeHealth;
				this.card.style.setProperty("--changeHealth",changeHealth);
				this.card.style.setProperty("--currentHealth",this.healthCurr);
			}
			healthTrans;
			while(changeHealth!=0) {
				setTimeout(healthTrans, 300);
			}
		} else {
			this.card.style.setProperty("--currentHealth",this.healthCurr);
			this.card.style.setProperty("--changeHealth",0);
			this.healthCurr = Number(this.card.style.getPropertyValue("--currentHealth"));
		} return;
	};
}

var qwerty = new Being(true, "Newlyn", 80, 20, 20, 20, 20, 20, 20, 60, false, document.getElementsByClassName("battleCard")[0], false);

qwerty.setCurrHealthChange(5);

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